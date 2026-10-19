const normalizeSearchText=v=>String(v||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/s+/g,' ');
const deepRawText=i=>i.description||i._parsed?._raw||i._parsed?.flavor_text||'';
const getItemAffects=i=>{let x=(i._parsed?.affects||[]).slice();const r=deepRawText(i).matchAll(/^Affectss+([a-z][a-z0-9-]*)s+bys+(-?d+(?:.d+)?)/gim);for(const m of r){const line=deepRawText(i).slice(deepRawText(i).lastIndexOf(String.fromCharCode(10),m.index)+1,deepRawText(i).indexOf(String.fromCharCode(10),m.index));if(line.includes('(Requires '))continue;if(!x.some(e=>e.stat===m[1]))x.push({stat:m[1],value:Number(m[2]),_source:'raw'});}return x;};
const escapeHtml=s=>String(s||'');
        function deepResultHighlights(item) {
            var parsed = item._parsed || item;
            var raw = deepRawText(item);
            var rawLines = raw.split(/\r?\n/);
            var lines = [];
            var seen = new Set();
            function add(label, text, source) {
                text = String(text || '').trim();
                var key = normalizeSearchText(text);
                if (key && !seen.has(key)) {
                    lines.push({ label: label, text: text, source: source || 'raw' });
                    seen.add(key);
                }
            }
            var inSet = Boolean(parsed.set_name && Array.isArray(parsed.set_items) && parsed.set_items.length);
            var mechanicPattern = /^(?:Affects |When\b|\+\+\+|Provides resistance|Adds resistance|Decreases |Grants |Casts |Improves |Alters |Increases |Your .+ will deal|Your weapon special|Special weapon attributes:|This item attracts|This item will (?:lose|vanish|expire|be |have)|This relic is:|This item, when|This can be artificed|Requires level range|\*Your |\*This item is bound|This item has (?:a default lifespan|the attributes|no special attributes|a limit)|Contains the level |There are \d+ charges|This manual contains|This food will |This .* has the traits:|Favored by:|Disliked by:|Armor resistance is|This is part of|This item (?:can|may) be used|This light source will|This relic occupies|This .+ can be opened|This .+ contains)/i;
            for (var i = 0; i < rawLines.length; i++) {
                var text = rawLines[i].trim();
                if (!text || !mechanicPattern.test(text) || /^This item weighs /i.test(text)) continue;
                var isSetBonus = inSet && text.indexOf('(Requires ') >= 0 && /^(?:Affects |When )/i.test(text);
                var label = isSetBonus ? 'Set bonus'
                    : /^\*Your |^\*This item is bound|^Requires level range/i.test(text) ? 'Requirement'
                    : /^(?:When\b|\+\+\+)/i.test(text) ? 'Special effect'
                    : /^(?:Favored by:|Disliked by:|This .* has the traits:)/i.test(text) ? 'Food detail'
                    : /^(?:Affects |Provides resistance|Adds resistance|Decreases |Grants |Casts |Improves |Alters |Increases |Your .+ will deal|Your weapon special|Special weapon attributes:|There are \d+ charges|Contains the level |This manual contains)/i.test(text) ? 'Mechanic'
                    : 'Item detail';
                var continuedEffect = /^(?:When\b|\+\+\+)/i.test(text);
                while (continuedEffect && !/[.!?]$/.test(text) && i + 1 < rawLines.length) {
                    var next = rawLines[i + 1].trim();
                    if (!next) { i++; continue; }
                    if (mechanicPattern.test(next)) break;
                    text += ' ' + next;
                    i++;
                }
                if (/^Your .+ will deal /i.test(text) && parsed.damage_tier) continue;
                if (/^Your weapon special attribute /i.test(text) && parsed.weapon_special_attr) continue;
                if (/^Special weapon attributes:/i.test(text) && parsed.special_weapon_attrs && parsed.special_weapon_attrs.length) continue;
                add(label, text, 'raw');
            }
            getItemAffects(item).forEach(function(effect) {
                var stat = effect.stat || effect.name || 'unknown stat';
                var amount = effect.value !== undefined ? effect.value : effect.amount;
                var normalizedStat = normalizeSearchText(stat);
                var alreadyInRaw = rawLines.some(function(line) {
                    var normalizedLine = normalizeSearchText(line);
                    return normalizedLine.indexOf('affects ' + normalizedStat + ' by') === 0
                        || stat === 'silver-vuln' && normalizedLine.indexOf('vulnerability to silver based attacks') >= 0;
                });
                if (alreadyInRaw) return;
                var text = stat === 'silver-vuln' && (amount === null || amount === undefined)
                    ? 'Increases vulnerability to silver-based attacks'
                    : 'Affects ' + stat + (amount !== null && amount !== undefined ? ' by ' + amount : '');
                add('Effect', text + (effect.frequency ? ' {' + effect.frequency + '}' : ''), effect._source || 'parsed');
            });
            if (parsed.damage_tier) {
                add('Weapon profile', (parsed.weapon_type || 'Weapon') + ': ' + parsed.damage_tier + ' ' + (parsed.damage_type || 'damage') + ' damage; ' + (parsed.accuracy_tier || 'unknown') + ' accuracy; ' + (parsed.range_tier || 'unknown') + ' range; ' + (parsed.crit_tier || 'unknown') + ' critical chance' + (parsed.crit_multiplier ? ' (' + parsed.crit_multiplier + 'x on a critical hit)' : ''), 'parsed');
            }
            if (parsed.weapon_special_attr || parsed.weapon_special_pct !== null && parsed.weapon_special_pct !== undefined) {
                add('Weapon special', (parsed.weapon_special_attr || 'Special attribute') + (parsed.weapon_special_pct !== null && parsed.weapon_special_pct !== undefined ? ': +' + parsed.weapon_special_pct + '% base damage on activation' : '') + (parsed.weapon_special_per_attack ? ' (' + parsed.weapon_special_per_attack + ' per attack)' : ''), 'parsed');
            }
            if (Array.isArray(parsed.when_procs) && !/\bWhen\b/i.test(raw)) parsed.when_procs.forEach(function(proc) {
                if (typeof proc === 'string') add('Conditional effect', proc, 'parsed');
                else if (proc && typeof proc === 'object') add('Conditional effect', 'When ' + (proc.condition || '') + ', ' + (proc.effect || '') + (proc.frequency ? ' {' + proc.frequency + '}' : ''), 'parsed');
            });
            if (Array.isArray(parsed.procs) && !raw.includes('+++')) parsed.procs.forEach(function(proc) {
                if (typeof proc === 'string') add('Special effect', proc, 'parsed');
            });
            if (Array.isArray(parsed.requirements)) parsed.requirements.forEach(function(requirement) {
                if (typeof requirement === 'string') add('Requirement', requirement, 'parsed');
            });
            if (inSet) {
                add('Set membership', parsed.set_name + ' (' + parsed.set_items.length + ' pieces): ' + parsed.set_items.join('; '), 'parsed');
                if (Array.isArray(parsed.set_bonuses)) parsed.set_bonuses.forEach(function(bonus) {
                    add('Set bonus', typeof bonus === 'string' ? bonus : JSON.stringify(bonus), 'parsed');
                });
            }
            return lines;
        }

        function mechanicsGlossary(item) {
            var parsed = item._parsed || item;
            var raw = deepRawText(item);
            var lines = raw.split(/\r?\n/);
            var explanation = [];
            if (lines.some(function(line) { return /\bar\b/i.test(line); })) explanation.push(['AR', 'Armor rating. Pay attention to who the line says is affected: an opponent’s AR reduction targets them; an Affects ar line on the item is a separate item/user effect. The exact combat formula is game-specific.']);
            if (/silver(?:-based)? resistance|silver-vuln/i.test(raw + ' ' + JSON.stringify(parsed.affects || []))) explanation.push(['Silver vulnerability', 'The axe proc explicitly reduces its opponent’s resistance to silver. That is a debuff on the opponent, not added silver resistance for the wielder.']);
            if (raw.indexOf('Freq') >= 0 || raw.indexOf('{Always}') >= 0) explanation.push(['Frequency', 'These are game frequency labels. Always differs from chance/frequency-based effects; a frequency label is not an exact percentage unless the text gives one.']);
            if (/\bwhen wielding|\bwhen casting|\bwhen evoking/i.test(raw)) explanation.push(['Conditional effect', 'A “When …” line only applies under that condition. The axe’s damage increase requires wielding a two-handed axe; the earth-evocation bonus is a separate set bonus.']);
            if (parsed.damage_tier || parsed.crit_tier) explanation.push(['Weapon profile', 'Damage tier, damage type, accuracy, range, and critical chance are separate weapon ratings. A 2x multiplier means damage on a critical hit; it does not mean every hit is critical.']);
            if (/Requires \d+ items?/i.test(raw) || parsed.set_name) explanation.push(['Set bonus', 'The number in “Requires N items” is the set-piece threshold for that bonus, not a bonus from the axe alone. The captured text does not specify whether pieces must be worn or merely owned.']);
            if (/only one .+ in the world|if there is only one/i.test(raw)) explanation.push(['World-unique condition', 'The effect has a different value if only one copy exists in the world. The stronger number is conditional, not the normal always-on value.']);
            if (/per combat round|per attack|chance to|chance of|% per combat round/i.test(raw)) explanation.push(['Combat proc', 'A chance-based or ramping effect is not an immediate flat stat bonus. Read its trigger, rate, duration, and cap together.']);
            if (/accuracy/i.test(raw)) explanation.push(['Accuracy', 'Accuracy is a weapon rating/modifier, separate from damage type and critical multiplier. The database does not provide the exact hit formula here.']);
            if (/Affects hp|Affects spell-points|Affects stamina/i.test(raw)) explanation.push(['Resource affect', 'This is a character-pool/resource effect. Check the line’s set threshold; it may not be an always-on stat of the individual item.']);
            if (/lifespan|vanish at the end|renewed for/i.test(raw)) explanation.push(['Expiry', 'The item has a lifespan and renewal cost; without renewal it will vanish. Repair count and renewal are different limits.']);
            if (/\*Your .+ must|\*This item is bound/i.test(raw)) explanation.push(['Restrictions', 'Starred lines describe conditions/limits on using the item, not benefits it grants.']);
            if (parsed.weapon_special_attr || parsed.weapon_special_pct !== null && parsed.weapon_special_pct !== undefined) explanation.push(['Weapon special attribute', 'The listed percentage is the base-damage increase when this special attribute activates; “per attack” is a separate reported amount.']);
            if (!explanation.length) return '';
            return '<dl class="mechanic-glossary">' + explanation.map(function(entry) { return '<dt>' + escapeHtml(entry[0]) + '</dt><dd>' + escapeHtml(entry[1]) + '</dd>'; }).join('') + '</dl>';
        }

        function mechanicsGlossary(item) {
            var parsed = item._parsed || item;
            var raw = deepRawText(item);
            var lines = raw.split(/\r?\n/);
            var explanation = [];
            if (lines.some(function(line) { return /\bar\b/i.test(line); })) explanation.push(['AR', 'Armor rating. Pay attention to who the line says is affected: an opponent’s AR reduction targets them; an Affects ar line on the item is a separate item/user effect. The exact combat formula is game-specific.']);
            if (/silver(?:-based)? resistance|silver-vuln/i.test(raw + ' ' + JSON.stringify(parsed.affects || []))) explanation.push(['Silver vulnerability', 'The axe proc explicitly reduces its opponent’s resistance to silver. That is a debuff on the opponent, not added silver resistance for the wielder.']);
            if (raw.indexOf('Freq') >= 0 || raw.indexOf('{Always}') >= 0) explanation.push(['Frequency', 'These are game frequency labels. Always differs from chance/frequency-based effects; a frequency label is not an exact percentage unless the text gives one.']);
            if (/\bwhen wielding|\bwhen casting|\bwhen evoking/i.test(raw)) explanation.push(['Conditional effect', 'A “When …” line only applies under that condition. The axe’s damage increase requires wielding a two-handed axe; the earth-evocation bonus is a separate set bonus.']);
            if (parsed.damage_tier || parsed.crit_tier) explanation.push(['Weapon profile', 'Damage tier, damage type, accuracy, range, and critical chance are separate weapon ratings. A 2x multiplier means damage on a critical hit; it does not mean every hit is critical.']);
            if (/Requires \d+ items?/i.test(raw) || parsed.set_name) explanation.push(['Set bonus', 'The number in “Requires N items” is the set-piece threshold for that bonus, not a bonus from the axe alone. The captured text does not specify whether pieces must be worn or merely owned.']);
            if (/only one .+ in the world|if there is only one/i.test(raw)) explanation.push(['World-unique condition', 'The effect has a different value if only one copy exists in the world. The stronger number is conditional, not the normal always-on value.']);
            if (/per combat round|per attack|chance to|chance of|% per combat round/i.test(raw)) explanation.push(['Combat proc', 'A chance-based or ramping effect is not an immediate flat stat bonus. Read its trigger, rate, duration, and cap together.']);
            if (/accuracy/i.test(raw)) explanation.push(['Accuracy', 'Accuracy is a weapon rating/modifier, separate from damage type and critical multiplier. The database does not provide the exact hit formula here.']);
            if (/Affects hp|Affects spell-points|Affects stamina/i.test(raw)) explanation.push(['Resource affect', 'This is a character-pool/resource effect. Check the line’s set threshold; it may not be an always-on stat of the individual item.']);
            if (/lifespan|vanish at the end|renewed for/i.test(raw)) explanation.push(['Expiry', 'The item has a lifespan and renewal cost; without renewal it will vanish. Repair count and renewal are different limits.']);
            if (/\*Your .+ must|\*This item is bound/i.test(raw)) explanation.push(['Restrictions', 'Starred lines describe conditions/limits on using the item, not benefits it grants.']);
            if (parsed.weapon_special_attr || parsed.weapon_special_pct !== null && parsed.weapon_special_pct !== undefined) explanation.push(['Weapon special attribute', 'The listed percentage is the base-damage increase when this special attribute activates; “per attack” is a separate reported amount.']);
            if (!explanation.length) return '';
            return '<dl class="mechanic-glossary">' + explanation.map(function(entry) { return '<dt>' + escapeHtml(entry[0]) + '</dt><dd>' + escapeHtml(entry[1]) + '</dd>'; }).join('') + '</dl>';
        }

const item={"name":"the one true axe of Raymatus","type":"weapon","description":"Item axe is type weapon.\nhas axe stats\nAffects ar by 2. {Med. Freq}\nAffects accuracy by 10. {Always}\nIncreases vulnerability to silver-based attacks. {Med. Freq}\nWhen wielding a two-handed axe, increases damage by 4%.. {High Freq}\n*Your proficiency in two-handed axe must be 90.\nThis is part of The Galzmati Inheritance.\nAffects lightning-damage by 10 (Requires 4 items).\nAffects ar by 4 (Requires 5 items).\nAffects hp by 250 (Requires 6 items).\nAffects damage-boss-cat7 by 50 (Requires 6 items).\nWhen evoking earth evocation, grants 6.00% chance to apply -wood-res. (Requires 3 items).\n+++ axe will reduce its opponent's AR by 1 per combat round for 7 minutes, maximum 4.\ncontinued proc line here\n+++ axe reduces its opponent's resistance to silver by 30 if only one axe in the world, at a rate of 7% per combat round.","_parsed":{"type":"weapon","set_name":"The Galzmati Inheritance","set_items":["axe","torque","boots","gauntlets","robes","ward","ring","lantern","crown"],"damage_tier":"Max","damage_type":"lightning","accuracy_tier":"High","range_tier":"Min","crit_tier":"Low","crit_multiplier":2,"weapon_type":"two-handed axe","weapon_special_attr":"shocking","weapon_special_pct":16,"weapon_special_per_attack":32,"affects":[{"stat":"ar","value":2,"frequency":"Med. Freq"},{"stat":"accuracy","value":10,"frequency":"Always"},{"stat":"silver-vuln","value":null,"frequency":"Med. Freq"}]}};const out=deepResultHighlights(item);const text=out.map(x=>x.text).join(' ');console.log(out.filter(x=>x.label==='Special effect'));
const checks={setBonuses:out.filter(x=>x.label==='Set bonus').length===5,fullProc:text.includes("reduce its opponent's AR by 1 per combat round for 7 minutes, maximum 4. continued proc line here"),secondProc:text.includes("at a rate of 7% per combat round"),requirements:out.some(x=>x.label==='Requirement'),baseEffectsDoNotAbsorbSet:!out.some(x=>x.label==='Effect'&&/lightning-damage|damage-boss-cat7|hp by 250/.test(x.text)),worldUniqueGlossary:mechanicsGlossary(item).includes('World-unique condition'),correctSilverGlossary:mechanicsGlossary(item).includes('debuff on the opponent')};console.log(checks);if(Object.values(checks).some(x=>!x))process.exit(1);