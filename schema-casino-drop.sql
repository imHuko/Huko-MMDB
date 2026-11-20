-- ============================================================
-- schema-casino-drop.sql
--
-- Removes every casino object from a Supabase project and leaves
-- everything else alone.
--
-- Run it in the SQL editor of the project you want the casino gone from.
-- That is the retired project fpvwpxtsrmrmdvnswrzx, which is shared with
-- the equipment side (items_db, itemsloc_db, schema-v2 .. schema-v6).
-- Only objects whose name begins with "casino_" are touched, so those
-- tables and functions are unaffected.
--
-- Objects match by NAME, not by signature. The old project runs an older
-- build of this schema, so its function arguments no longer match
-- schema-casino.sql and a hand-written list of DROP FUNCTION statements
-- would skip most of them without saying so.
--
-- Everything runs in one transaction: if any single step fails, nothing
-- is dropped and the project is left exactly as it was. Safe to re-run.
--
-- What it expects to find (from schema-casino.sql + -hardening.sql):
--   tables     casino_accounts, casino_chain, casino_config,
--              casino_freespins, casino_ledger, casino_payouts,
--              casino_pending, casino_sessions, casino_state,
--              casino_transfers
--   functions  39 of them, casino_account_info .. casino_verify_chain
--              (the old project has an older set, e.g. it has no
--              casino_vault_status but it does have casino_log)
-- ============================================================


begin;


-- ------------------------------------------------------------
-- 1. What is here before we start
-- ------------------------------------------------------------
do $$
declare
  v_functions integer;
  v_relations integer;
begin
  select count(*) into v_functions
    from pg_proc p
    join pg_namespace s on s.oid = p.pronamespace
   where s.nspname = 'public'
     and p.proname like 'casino\_%';

  select count(*) into v_relations
    from pg_class c
    join pg_namespace s on s.oid = c.relnamespace
   where s.nspname = 'public'
     and c.relname like 'casino\_%'
     and c.relkind in ('r', 'p', 'v', 'm', 'S');

  raise notice 'casino functions present: %', v_functions;
  raise notice 'casino relations present: %', v_relations;
end $$;


-- ------------------------------------------------------------
-- 2. Functions, procedures and aggregates
--
-- These go first because some of them read or write the tables below,
-- and a CASCADE drop is cleaner while the tables still exist than after.
-- ------------------------------------------------------------
do $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select p.proname,
           p.prokind,
           pg_get_function_identity_arguments(p.oid) as args
      from pg_proc p
      join pg_namespace s on s.oid = p.pronamespace
     where s.nspname = 'public'
       and p.proname like 'casino\_%'
  loop
    if r.prokind = 'p' then
      execute format('drop procedure if exists public.%I(%s) cascade', r.proname, r.args);
      raise notice 'dropped procedure public.%(%)', r.proname, r.args;
    else
      execute format('drop function if exists public.%I(%s) cascade', r.proname, r.args);
      raise notice 'dropped function public.%(%)', r.proname, r.args;
    end if;

    v_count := v_count + 1;
  end loop;

  raise notice 'functions and procedures dropped: %', v_count;
end $$;


-- ------------------------------------------------------------
-- 3. Tables, views and sequences
--
-- Order: tables and views first, then sequences. A sequence owned by a
-- dropped table's column disappears with the table; this catches any
-- that stood on their own.
-- ------------------------------------------------------------
do $$
declare
  r record;
  v_kind text;
  v_count integer := 0;
begin
  for r in
    select c.relname, c.relkind
      from pg_class c
      join pg_namespace s on s.oid = c.relnamespace
     where s.nspname = 'public'
       and c.relname like 'casino\_%'
       and c.relkind in ('r', 'p', 'v', 'm', 'S')
     order by case c.relkind when 'S' then 2 else 1 end,
              c.relname
  loop
    v_kind := case r.relkind
                when 'r' then 'table'
                when 'p' then 'table'
                when 'v' then 'view'
                when 'm' then 'materialized view'
                when 'S' then 'sequence'
              end;

    execute format('drop %s if exists public.%I cascade', v_kind, r.relname);
    raise notice 'dropped % public.%', v_kind, r.relname;

    v_count := v_count + 1;
  end loop;

  raise notice 'relations dropped: %', v_count;
end $$;


-- ------------------------------------------------------------
-- 4. Enums, domains and standalone composite types
--
-- Composite types that belong to a table are already gone with their
-- table, so those are skipped rather than dropped twice.
-- ------------------------------------------------------------
do $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select t.typname
      from pg_type t
      join pg_namespace s on s.oid = t.typnamespace
     where s.nspname = 'public'
       and t.typname like 'casino\_%'
       and t.typtype in ('e', 'd', 'c')
       and not exists (
             select 1 from pg_class c where c.reltype = t.oid
           )
  loop
    execute format('drop type if exists public.%I cascade', r.typname);
    raise notice 'dropped type public.%', r.typname;
    v_count := v_count + 1;
  end loop;

  raise notice 'types dropped: %', v_count;
end $$;


commit;


-- ------------------------------------------------------------
-- 5. Check
--
-- Both blocks must come back empty. If either still lists a row, that
-- object is owned by another role or lives in another schema; tell me
-- what it says rather than dropping it by hand.
-- ------------------------------------------------------------
select 'function' as kind,
       p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as name
  from pg_proc p
  join pg_namespace s on s.oid = p.pronamespace
 where s.nspname = 'public'
   and p.proname like 'casino\_%'
union all
select 'relation',
       c.relname || ' (' ||
       case c.relkind
         when 'r' then 'table' when 'p' then 'table' when 'v' then 'view'
         when 'm' then 'materialized view' when 'S' then 'sequence'
         else c.relkind::text
       end || ')'
  from pg_class c
  join pg_namespace s on s.oid = c.relnamespace
 where s.nspname = 'public'
   and c.relname like 'casino\_%'
   and c.relkind in ('r', 'p', 'v', 'm', 'S')
order by 1, 2;


-- ------------------------------------------------------------
-- 6. The one thing this script does not undo
--
-- schema-casino-hardening.sql ends with an ALTER DEFAULT PRIVILEGES line
-- that stops anon and authenticated receiving EXECUTE on new functions.
-- If that file was ever run against THIS project, the setting is still
-- on and any function added to the equipment side later would be
-- unreachable by the plugins. Nothing existing is affected, only future
-- functions, so it is left alone by default.
--
-- Uncomment these two lines to put the project back on Supabase's
-- default (anon and authenticated do get EXECUTE on new functions):
--
-- alter default privileges for role postgres in schema public
--   grant execute on functions to anon, authenticated;
-- ------------------------------------------------------------
