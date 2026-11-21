// needs: cd .tmp-check/pg && npm i @electric-sql/pglite
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../../schema-casino.sql', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

function extract(name) {
  const start = sql.indexOf('create or replace function ' + name + '(');
  if (start < 0) throw new Error('not found: ' + name);
  const end = sql.indexOf('\n$$;', start);
  if (end < 0) throw new Error('no terminator for ' + name);
  return sql.slice(start, end + 4);
}

const db = new PGlite();

await db.exec(`
  create table casino_config (key text primary key, value text);
  create table casino_accounts (
    character text primary key, gold bigint default 0, bonus bigint default 0,
    bonus_burned bigint default 0, spins bigint default 0, wagered bigint default 0,
    won bigint default 0, biggest bigint default 0, jackpots bigint default 0,
    is_admin boolean default false, pass_hash text, created_at timestamptz default now(),
    last_login timestamptz, bonus_granted_at timestamptz);
  create table casino_ledger (
    id bigserial primary key, character text, actor text, reason text,
    delta bigint default 0, balance_after bigint default 0, ref text,
    meta jsonb default '{}', hash text, created_at timestamptz default now());
  create table casino_pending (
    handle text primary key, character text, amount bigint default 0,
    method text, updated_at timestamptz default now());
  create table casino_transfers (ref text primary key, result jsonb);
  create table casino_state (id int primary key, jackpot numeric default 250000, spins bigint default 0);
  create table casino_freespins (
    character text primary key, machine text, spins_left int default 0, bet int default 0,
    multiplier numeric default 1, total_won bigint default 0, awarded_at timestamptz);
  create table casino_sessions (token text, character text, expires_at timestamptz);
  create or replace function casino_bot_ok(p text) returns boolean language sql as $$ select true $$;
  create or replace function casino_log(p_character text, p_actor text, p_action text,
    p_delta bigint, p_balance bigint, p_ref text, p_meta jsonb)
    returns text language plpgsql as $$
  begin
    insert into casino_ledger (character, actor, reason, delta, balance_after, ref, meta)
    values (p_character, p_actor, p_action, p_delta, p_balance, p_ref, p_meta);
    return 'hash';
  end $$;
`);

// --- compile the three functions I changed ---------------------------------
const results = [];
for (const fn of ['casino_deposit', 'casino_spin', 'casino_spin5']) {
  try {
    await db.exec(extract(fn));
    results.push(fn + ': compiles');
  } catch (e) {
    results.push(fn + ': FAILED -> ' + e.message);
  }
}

// --- exercise the cap ------------------------------------------------------
await db.exec(`
  insert into casino_config (key, value) values ('deposit_daily_cap', '100000');
  insert into casino_accounts (character, gold) values ('tester', 0);
  insert into casino_accounts (character, gold) values ('tester3', 0);
`);
const dep = async (who, amount, ref) => {
  const r = await db.query(
    'select casino_deposit($1,$2,$3,$4,$5,$6) as r',
    ['secret', who, String(amount), 'bank', ref, null]);
  return r.rows[0].r;
};
const gold = async (who) => (await db.query('select gold from casino_accounts where character=$1', [who])).rows[0].gold;

const log = [];
log.push(['60k deposit', await dep('tester', 60000, 'r1')]);
log.push(['gold after 60k', await gold('tester')]);
log.push(['another 60k', await dep('tester', 60000, 'r2')]);
log.push(['exactly to cap 40k', await dep('tester', 40000, 'r3')]);
log.push(['gold at cap', await gold('tester')]);
log.push(['1 more gold', await dep('tester', 1, 'r4')]);
log.push(['retry of r3 (same ref)', await dep('tester', 40000, 'r3')]);
log.push(['gold after retry', await gold('tester')]);

// no-account path: gold piles up in the holding pot, capped the same way
log.push(['newbie 50k', await dep('newbie', 50000, 'n1')]);
log.push(['newbie 60k', await dep('newbie', 60000, 'n2')]);
log.push(['newbie 50k more', await dep('newbie', 50000, 'n3')]);

// day window: yesterday's deposits must not count against today
await db.exec(`
  insert into casino_ledger (character, reason, delta, created_at)
  values ('tester3', 'deposit', 100000, now() - interval '1 day');
`);
log.push(['tester3 100k today (yesterday ignored)', await dep('tester3', 100000, 'd1')]);

// a retried refusal must not write the record twice
log.push(['newbie 60k retry (same ref)', await dep('newbie', 60000, 'n2')]);

// cap is read from config, so it can be changed without this file
await db.exec(`update casino_config set value = '50000' where key = 'deposit_daily_cap'`);
log.push(['tester 1 gold under new 50k cap', await dep('tester', 1, 'r5')]);

// --- the refusal record ---------------------------------------------------
const refused = await db.query(`
  select character, count(*) over () as n, delta, balance_after, meta
    from casino_ledger where reason = 'deposit_refused' order by id`);
console.log('\ndeposit_refused rows:');
for (const r of refused.rows) console.log('  ', r.character, 'delta', r.delta, 'balance', r.balance_after, JSON.stringify(r.meta));

const today = await db.query(`
  select coalesce(sum(delta),0) as s from casino_ledger
   where lower(character)='tester' and reason='deposit'
     and created_at >= date_trunc('day', now())`);
console.log('refused rows do not count toward the cap: today =', today.rows[0].s);
const dupes = await db.query(`
  select ref, count(*) as c from casino_ledger
   where reason='deposit_refused' and ref in ('n2','r4') group by ref`);
console.log('rows per retried ref:', JSON.stringify(dupes.rows));

console.log(results.join('\n'));
for (const [label, v] of log) console.log(label.padEnd(38), JSON.stringify(v));
