
        var SUPABASE_URL = 'https://fpvwpxtsrmrmdvnswrzx.supabase.co';
        var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwdndweHRzcm1ybWR2bnN3cnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzkyNTksImV4cCI6MjA5Mzg1NTI1OX0.gxsUTibmHHUhPydl9DTjpjfjGIghjW8WwGyIlAbFgMY';
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
        var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                var affectList = [
            "accuracy","damage","damage-prcnt","age","sp-regen","stamina-regen","hp-regen","align",
            "mount-speed","resilience","auction-momentum","running-speed","healing-others-prcnt",
            "healed-by-others-prcnt","conduit-prcnt","combat-inconspicuousness","fistfighting",
            "ar-mitigation","transport-speed","spells-learned","proficiencies-learned",
            "damage-kick","damage-bash","damage-feed","hp-regen-prcnt","sp-regen-prcnt",
            "stamina-regen-prcnt","search","strength","wisdom","intelligence","dexterity",
            "constitution","charisma","personality","luck","hp","sp","stamina","ar",
            "saving-spell","saving-rod","saving-breath",
            "summon-res","charm-res","bash-res","pierce-res","slash-res","fire-res",
            "cold-res","lightning-res","acid-res","sound-res","poison-res",
            "negative-res","energy-res","mental-res","disease-res","drowning-res",
            "water-res","earth-res","air-res","necromantic-res","iron-res","wood-res",
            "silver-res","metal-res","holy-res","lightbeam-res","moonlight-res","sunlight-res",
            "bash-damage","pierce-damage","slash-damage","fire-damage","cold-damage",
            "lightning-damage","acid-damage","sound-damage","poison-damage",
            "negative-damage","energy-damage","mental-damage","disease-damage",
            "drowning-damage","water-damage","earth-damage","air-damage","necromantic-damage",
            "iron-damage","wood-damage","silver-damage","holy-damage","lightbeam-damage",
            "charm-damage","moonlight-damage","sunlight-damage","damage-throw","damage-backstab",
            "damage-fire-breath","damage-gas-breath","damage-ice-breath","damage-acid-breath",
            "damage-lightning-breath","dig","damage-sweep","damage-charge","damage-grapple",
            "damage-splash-prcnt","heal-splash-prcnt","reflected-spell-prcnt","damage-splash",
            "musical-ability","PCC","SCC","spellcasting-priority","height",
            "damage-to-evil-prcnt","damage-to-good-prcnt","damage-boss-cat1","damage-boss-cat2",
            "damage-boss-cat3","damage-boss-cat4","damage-boss-cat5","damage-boss-cat6",
            "damage-boss-cat7","hp-regen-max","sp-regen-max","st-regen-max",
            "weight-modifier-prcnt","spellbook-capacity","melee-vamp-prcnt","skill-vamp-prcnt",
            "melee-vamp-res","skill-vamp-res","spellbook-complexity","crit-damage",
            "weight-modifier","attack-speed","defense-speed","extra-defense-speed",
            "summon-damage","orienteering","spell-accuracy",
            "flaming-weapon-activation-damage","frost-weapon-activation-damage",
            "vampiric-weapon-activation-damage","sharp-weapon-activation-damage",
            "vorpal-weapon-activation-damage","poisoned-weapon-activation-damage",
            "shocking-weapon-activation-damage","dispelling-weapon-activation-damage",
            "parry-magic-weapon-activation-damage","battle-rage-activation-damage",
            "acid-weapon-activation-damage","battering-weapon-activation-damage",
            "echoing-strike-weapon-activation-damage","grappling-weapon-activation-damage",
            "aqueous-weapon-activation-damage","leech-conduit-activation-damage",
            "ether-scar-activation-damage","serrated-weapon-activation-damage",
            "overloading-weapon-activation-damage","temporal-flux-weapon-activation-damage",
            "range","distance","crit-chance","corruption-res","corruption-damage",
            "time-paradox-res","time-paradox-damage","emotional-res","emotional-damage",
            "pain-res","pain-dam","surprise-res","surprise-damage","fear-res","fear-damage",
            "inventory-capacity","harm-res","harm-damage","spell-damage","spell-damage-prcnt",
            "spell-ward","vitality","courage","sanity","knowledge"
        ];

        var datalist = document.getElementById('affect-list');
        affectList.forEach(function(a) {
            var opt = document.createElement('option');
            opt.value = a;
            datalist.appendChild(opt);
        });
        function updateSearchModeNote() {
            document.getElementById('search-mode-note').textContent = document.getElementById('search-mode').value === 'deep'
                ? 'Deep Search checks item names, parsed properties, and the full captured text. Try hp>=30, strength+3, or quoted phrases. Results show raw mechanics when parser data is incomplete; Classic Search restores the previous behavior.'
                : 'Classic Search keeps the previous name-first search behavior and 200-result limit.';
        }
        document.getElementById('search-btn').addEventListener('click', searchEquipment);
        document.getElementById('search-mode').addEventListener('change', function() {
            updateSearchModeNote();
            if (document.getElementById('search-input').value.trim()) searchEquipment();
        });
		document.getElementById('mob-search-btn').addEventListener('click', searchMobs);
        document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
document.getElementById('mob-search-input').addEventListener('keyup', function(e) { if (e.key === 'Enter') searchMobs(); });
        document.getElementById('search-input').addEventListener('keyup', function(e) { if (e.key === 'Enter') searchEquipment(); });
        
        function clearFilters() {
            document.getElementById('filter-type').value = '';
            document.getElementById('filter-weapon-type').value = '';
            document.getElementById('filter-wear-slot').value = '';
            document.getElementById('filter-material').value = '';
            document.getElementById('filter-min-level').value = '';
            document.getElementById('filter-max-level').value = '';
            document.getElementById('filter-source').value = '';
            document.getElementById('filter-search-desc').checked = false;
            document.getElementById('filter-when-proc').checked = false;
            activeAffects = [];
            renderAffectTags();
            searchEquipment();
        }
        
        function saveSearchState() {
            sessionStorage.setItem('eqdb_search', JSON.stringify({
                search: document.getElementById('search-input').value,
                searchMode: document.getElementById('search-mode').value,
                mobSearch: document.getElementById('mob-search-input').value,
                filterType: document.getElementById('filter-type').value,
                filterWeaponType: document.getElementById('filter-weapon-type').value,
                filterWearSlot: document.getElementById('filter-wear-slot').value,
                filterMaterial: document.getElementById('filter-material').value,
                filterMinLevel: document.getElementById('filter-min-level').value,
                filterMaxLevel: document.getElementById('filter-max-level').value,
                filterSource: document.getElementById('filter-source').value,
                filterSearchDesc: document.getElementById('filter-search-desc').checked,
                filterWhenProc: document.getElementById('filter-when-proc').checked,
                filterAffects: activeAffects.slice(),
                filtersVisible: document.getElementById('advanced-filters').style.display !== 'none',
                lastSearch: document.getElementById('results').querySelector('.item-card') ? 'equipment' : 'mobs'
            }));
        }
        
        function restoreSearchState() {
            var saved = sessionStorage.getItem('eqdb_search');
            if (!saved) return false;
            try {
                var state = JSON.parse(saved);
                document.getElementById('search-input').value = state.search || '';
                document.getElementById('search-mode').value = state.searchMode === 'classic' ? 'classic' : 'deep';
                updateSearchModeNote();
                document.getElementById('mob-search-input').value = state.mobSearch || '';
                document.getElementById('filter-type').value = state.filterType || '';
                document.getElementById('filter-weapon-type').value = state.filterWeaponType || '';
                document.getElementById('filter-wear-slot').value = state.filterWearSlot || '';
                document.getElementById('filter-material').value = state.filterMaterial || '';
                document.getElementById('filter-min-level').value = state.filterMinLevel || '';
                document.getElementById('filter-max-level').value = state.filterMaxLevel || '';
                document.getElementById('filter-source').value = state.filterSource || '';
                if (state.filterSearchDesc) document.getElementById('filter-search-desc').checked = true;
                if (state.filterWhenProc) document.getElementById('filter-when-proc').checked = true;
                if (state.filterAffects && state.filterAffects.length) {
                    state.filterAffects.forEach(function(a) { addAffectTag(a); });
                }
                var filters = document.getElementById('advanced-filters');
                if (state.filtersVisible) {
                    filters.style.display = 'block';
                    document.getElementById('toggle-filters-btn').textContent = '- Filters';
                }
                if (state.filterType === 'weapon') {
                    document.getElementById('filter-weapon-type').style.display = 'inline';
                }
                return state.search || state.mobSearch || state.filterType || state.filterWearSlot || state.filterMaterial || state.filterMinLevel || state.filterMaxLevel || (state.filterAffects && state.filterAffects.length);
            } catch(e) { return false; }
        }
        
        document.getElementById('reset-btn').addEventListener('click', function() {
            document.getElementById('search-input').value = '';
            document.getElementById('filter-type').value = '';
            document.getElementById('filter-weapon-type').value = '';
            document.getElementById('filter-wear-slot').value = '';
            document.getElementById('filter-material').value = '';
            document.getElementById('filter-min-level').value = '';
            document.getElementById('filter-max-level').value = '';
            document.getElementById('filter-source').value = '';
            document.getElementById('filter-search-desc').checked = false;
            document.getElementById('filter-when-proc').checked = false;
            activeAffects = [];
            renderAffectTags();
            sessionStorage.removeItem('eqdb_search');
            searchEquipment();
        });
        
        document.getElementById('toggle-filters-btn').addEventListener('click', function() {
            var filters = document.getElementById('advanced-filters');
            if (filters.style.display === 'none') {
                filters.style.display = 'block';
                this.textContent = '- Filters';
            } else {
                filters.style.display = 'none';
                this.textContent = '+ Filters';
            }
        });
        
        document.getElementById('filter-type').addEventListener('change', function() {
            var weaponSelect = document.getElementById('filter-weapon-type');
            weaponSelect.style.display = (this.value === 'weapon') ? 'inline' : 'none';
        });
        
        async function searchEquipment() {
            if (document.getElementById('search-mode').value === 'classic') {
                deepSearchRequest++;
                return searchEquipmentClassic();
            }
            return searchEquipmentDeep();
        }

        async function searchEquipmentClassic() {
            var requestId = ++deepSearchRequest;
            var searchTerm = document.getElementById('search-input').value.toLowerCase();
            var resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<p>Searching...</p>';
            
            let query = supabase.from('equipment').select('*', { count: 'exact' }).order('name', { ascending: true }).limit(200);
            
            var skpChecked = document.getElementById('filter-when-proc').checked;
            if (searchTerm) {
                var descChecked = document.getElementById('filter-search-desc').checked;
                if (skpChecked) {
                    var escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    query = query.filter('description', 'imatch', 'When [^\\n]*' + escaped);
                } else if (descChecked) {
                    query = query.or('name.ilike.%' + searchTerm + '%,description.ilike.%' + searchTerm + '%');
                } else {
                    query = query.ilike('name', '%' + searchTerm + '%');
                }
            }

            var itemType = document.getElementById('filter-type').value;
            var weaponType = document.getElementById('filter-weapon-type').value;
            var wearSlot = document.getElementById('filter-wear-slot').value;
            var material = document.getElementById('filter-material').value;
            var minLevel = document.getElementById('filter-min-level').value;
            var maxLevel = document.getElementById('filter-max-level').value;
            var source = document.getElementById('filter-source').value;
            
            // Description filters - PostgREST ANDs multiple ilike on same column
            if (itemType) query = query.ilike('description', '%is type ' + itemType + '%');
            if (weaponType) query = query.ilike('description', '%Your ' + weaponType + '%');
            if (wearSlot) query = query.ilike('description', '%on the ' + wearSlot + '%');
            if (material) query = query.ilike('description', '%made of ' + material + '%');
            if (activeAffects.length > 0) {
                for (var af = 0; af < activeAffects.length; af++) {
                    query = query.ilike('description', '%Affects ' + activeAffects[af] + '%');
                }
            }
            if (skpChecked && !searchTerm) query = query.ilike('description', '%When %');
            if (minLevel) query = query.gte('level_req', minLevel);
            if (maxLevel) query = query.lte('level_req', maxLevel);
            if (source === 'eqdb') query = query.eq('verified', true);
            if (source === 'personal') query = query.eq('verified', false);
            console.log('QUERY FILTERS:', { itemType, weaponType, wearSlot, material, skpChecked });
            var result = await query;
            if (requestId !== deepSearchRequest) return;
            var data = result.data;
            var error = result.error;
            var count = result.count;
            
            if (error) { resultsDiv.innerHTML = '<p>Error: ' + error.message + '</p>'; return; }
            
            if (!data || data.length === 0) {
                if (searchTerm) {
                    var dbFallback = await supabase.from('items_db').select('name, itemid').ilike('name', '%' + searchTerm + '%').limit(200);
                    if (dbFallback.data && dbFallback.data.length > 0) {
                        var fallbackHtml = '';
                        for (var f = 0; f < dbFallback.data.length; f++) {
                            var fb = dbFallback.data[f];
                            fallbackHtml += '<div class="item-card" data-name="' + escapeHtml(fb.name) + '">';
                            fallbackHtml += '<h3><a href="item.html?name=' + encodeURIComponent(fb.name) + '">' + escapeHtml(fb.name) + '</a></h3>';
                            fallbackHtml += '<div class="item-meta"><span style="color:#ffaa00;">Locations available — stats pending</span></div>';
                            fallbackHtml += '</div>';
                        }
                        resultsDiv.innerHTML = fallbackHtml;
                        return;
                    }
                }
                resultsDiv.innerHTML = '<p>No items found. Try different filters.</p>';
                return;
            }
            
            // Deduplicate by item name (keep verified over personal, first seen otherwise)
            var seen = {};
            var deduped = [];
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var nameKey = item.name.toLowerCase().trim();
                if (seen[nameKey]) {
                    // Prefer verified over personal for the same name
                    var existing = seen[nameKey];
                    if (item.verified && !existing.verified) {
                        existing.verified = true;
                    }
                    continue;
                }
                seen[nameKey] = item;
                deduped.push(item);
            }
            data = deduped;

            var html = '';
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                html += '<div class="item-card" data-name="' + escapeHtml(item.name) + '">';
                html += '<h3><a href="item.html?name=' + encodeURIComponent(item.name) + '">' + escapeHtml(item.name) + '</a></h3>';
                html += '<div class="item-meta">';
                html += '[' + escapeHtml(item.type) + '] ';
                if (item.slot) html += 'Slot: ' + escapeHtml(item.slot) + ' ';
                if (item.level_req > 0) html += 'Level: ' + item.level_req + ' ';
                if (activeAffects.length > 0 && item.description) {
                    for (var af = 0; af < activeAffects.length; af++) {
                        var re = new RegExp('Affects\\s+' + activeAffects[af] + '\\s+by\\s+(-?[\\d.]+)', 'i');
                        var m = item.description.match(re);
                        if (m) html += escapeHtml(activeAffects[af]) + ' ' + m[1] + ' ';
                    }
                }
                html += item.verified ? '<span style="color:#44aa44;">EQDB</span>' : '<span style="color:#ffaa00;">Personal</span>';
                html += '</div>';
                html += '</div>';
            }
            
            html += '<p style="color:#888;margin-top:20px;">Found ' + count + ' items' + (count > 200 ? ' (showing first 200)' : '') + '</p>';
            resultsDiv.innerHTML = html;
            saveSearchState();
        }
        var DEEP_PAGE_SIZE = 25;
        var deepSearchResults = [];
        var deepSearchPage = 0;
        var deepSearchRequest = 0;

        var PARSED_SEARCH_COLUMNS = [
            'id','name','type','level_req','slot','verified','alignment','material','condition','equipped',
            'keywords','attributes','weapon_type','damage_tier','damage_type','accuracy_tier','range_tier',
            'crit_tier','crit_multiplier','crit_penalty','special_weapon_attrs','armor_resistance',
            'container_capacity','container_max_st','container_max_pb','container_flags','container_open',
            'sustenance_minutes','drink_current','drink_max','drink_liquid','light_minutes','spell_level',
            'spell_name','charges_current','charges_max','spellbook_count','spellbook_max','spellbook_base',
            'spellbook_complexity','herb_group','herb_power','instrument_type','instrument_subtype',
            'instrument_complexity','explosive_damage','seed_minutes','telescope_magnification','fountain_spell',
            'warp_destination','warp_area','warp_charges','tool_type','tool_uses_current','tool_uses_max',
            'tool_stamina','key_uses','key_unlimited','gold_attraction_pct','ink_ounces','gold_coins',
            'resource_count','resource_name','ship_name','manual_skill','manual_points','quiver_ammo_type',
            'quiver_sp','ammo_count','ammo_type','ammo_damage_modifier','ammo_sp','ammo_special_attrs',
            'surge_charges','lifespan_days','expires_on','renewable','relic_slots','relic_properties','affects',
            'casts_spell_level','casts_spell_name','requirements','weapon_special_attr','weapon_special_pct','weapon_special_per_attack','repair_count','repair_renewal',
            'limit_per_char','vanish_date','nodecay_date','set_name','set_items','set_bonuses','set_min_level',
            'set_level_range','artifice_result','artifice_ingredients','procs','when_procs','mount_weight',
            'level_adjusted_pct','grants_knowledge','roadsign_directions','clock_time','clock_day',
            'clock_month','clock_date','clock_year','npc_tell','flavor_text','_raw','has_random_relics'
        ].join(',');
        var DEEP_SEARCH_COLUMNS = [
            'name','type','material','equipped','weapon_type','damage_type','spell_name','resource_name','ship_name',
            'manual_skill','quiver_ammo_type','ammo_type','fountain_spell','warp_destination','warp_area',
            'tool_type','set_name','artifice_result','flavor_text','_raw'
        ];
        var ORDINARY_ITEM_TYPES = ['weapon','armor','ring','jewelry','scroll','potion','wand','food','drink','herb','pill','clothing','treasure','key','book'];
        var SEARCH_STOP_WORDS = new Set(['a','an','the','and','or','of','to','for','with','from','in','on','by','is','it','this','that','as']);

        function normalizeSearchText(value) {
            return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
                .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
        }

        function getDeepQuery(raw) {
            var numeric = [];
            var remainder = raw.replace(/([a-z][a-z0-9-]*)\s*(>=|<=|>|<|=|\+)\s*(-?\d+(?:\.\d+)?)/gi, function(full, stat, op, value) {
                numeric.push({ stat: stat.toLowerCase(), op: op === '+' ? '=' : op, value: Number(value) });
                return ' ' + stat + ' ';
            });
            var phrases = [];
            remainder = remainder.replace(/"([^"]+)"/g, function(full, phrase) {
                var normalized = normalizeSearchText(phrase);
                if (normalized) phrases.push(normalized);
                return ' ' + phrase + ' ';
            });
            var tokens = normalizeSearchText(remainder).split(' ').filter(function(word) {
                return word && !SEARCH_STOP_WORDS.has(word);
            });
            var numericStatParts = new Set();
            numeric.forEach(function(test) {
                normalizeSearchText(test.stat).split(' ').forEach(function(part) { numericStatParts.add(part); });
            });
            tokens = tokens.filter(function(token) { return !numericStatParts.has(token); });
            numeric.forEach(function(test) { tokens.push(test.stat); });
            return { tokens: Array.from(new Set(tokens)), numeric: numeric, phrase: normalizeSearchText(remainder), phrases: phrases };
        }

        function escapePostgrestToken(value) {
            return value.replace(/[%_\\]/g, '\\$&').replace(/[(),]/g, ' ');
        }

        function buildDeepTextQuery(table, token) {
            var query = table === 'equipment_parsed'
                ? supabase.from(table).select(PARSED_SEARCH_COLUMNS, { count: 'exact' })
                : supabase.from(table).select('id,name,type,slot,level_req,weight,value,description,properties,verified');
            var safe = escapePostgrestToken(token);
            var columns = table === 'equipment_parsed' ? DEEP_SEARCH_COLUMNS : ['name','description'];
            var filters = columns.map(function(column) { return column + '.ilike.%' + safe + '%'; });
            return query.or(filters.join(','));
        }

        function buildParsedFacetQuery(filters) {
            var query = supabase.from('equipment_parsed').select(PARSED_SEARCH_COLUMNS, { count: 'exact' });
            if (filters.type && filters.type !== 'other') {
                var types = filters.type === 'jewelry' ? ['ring','jewelry'] : filters.type === 'wand' ? ['wand','magical wand'] : [filters.type];
                query = query.in('type', types);
            } else if (filters.type === 'other') {
                query = query.not('type', 'in', '({"' + ORDINARY_ITEM_TYPES.join('","') + '"})');
            }
            if (filters.weaponType) query = query.ilike('weapon_type', '%' + escapePostgrestToken(filters.weaponType) + '%');
            if (filters.material) query = query.ilike('material', filters.material);
            if (filters.minLevel) query = query.gte('level_req', Number(filters.minLevel));
            if (filters.maxLevel) query = query.lte('level_req', Number(filters.maxLevel));
            if (filters.source === 'eqdb') query = query.eq('verified', true);
            if (filters.source === 'personal') query = query.eq('verified', false);
            if (filters.affects.length) {
                filters.affects.forEach(function(stat) {
                    query = query.filter('affects', 'cs', JSON.stringify([{ stat: stat }]));
                });
            }
            return query;
        }

        function buildEquipmentFacetQuery(filters) {
            var query = supabase.from('equipment').select('id,name,type,slot,level_req,weight,value,description,properties,verified');
            if (filters.type && filters.type !== 'other') {
                var typeText = filters.type === 'jewelry' ? 'jewelry' : filters.type;
                query = query.ilike('type', '%' + typeText + '%');
            }
            if (filters.type === 'other') {
                query = query.not('type', 'in', '({"' + ORDINARY_ITEM_TYPES.join('","') + '"})');
            }
            if (filters.weaponType) query = query.ilike('description', '%Your ' + escapePostgrestToken(filters.weaponType) + '%');
            if (filters.wearSlot) query = query.ilike('description', '%' + filters.wearSlot + '%');
            if (filters.material) query = query.ilike('description', '%made of ' + filters.material + '%');
            filters.affects.forEach(function(stat) { query = query.ilike('description', '%Affects ' + stat + '%'); });
            if (filters.whenProc) query = query.or('description.ilike.%When %,description.ilike.%+++%');
            if (filters.minLevel) query = query.gte('level_req', Number(filters.minLevel));
            if (filters.maxLevel) query = query.lte('level_req', Number(filters.maxLevel));
            if (filters.source === 'eqdb') query = query.eq('verified', true);
            if (filters.source === 'personal') query = query.eq('verified', false);
            return query;
        }

        async function fetchPagedQuery(query, requestId, pageSize) {
            var rows = [];
            pageSize = pageSize || 500;
            for (var from = 0; ; from += pageSize) {
                if (requestId !== deepSearchRequest) return [];
                var result = await query.range(from, from + pageSize - 1);
                if (result.error) throw new Error(result.error.message);
                var page = result.data || [];
                rows = rows.concat(page);
                if (page.length < pageSize || (Number.isFinite(result.count) && rows.length >= result.count)) break;
            }
            return rows;
        }


        async function fetchExactDescriptionRows(names) {
            var rows = [];
            for (var from = 0; from < names.length; from += 50) {
                var nameBatch = names.slice(from, from + 50);
                var result = await supabase.from('equipment')
                    .select('id,name,type,slot,level_req,weight,value,description,properties,verified')
                    .in('name', nameBatch);
                if (result.error) throw new Error('equipment descriptions: ' + result.error.message);
                rows = rows.concat(result.data || []);
            }
            return rows;
        }

        async function fetchRawDescriptionSearch(tokens, requestId) {
            if (!tokens.length) return [];
            var tokenRows = await Promise.all(tokens.map(async function(token) {
                var query = supabase.from('equipment').select('id,name,type,slot,level_req,weight,value,description,properties,verified')
                    .ilike('description', '%' + escapePostgrestToken(token) + '%');
                return fetchPagedQuery(query, requestId, 250);
            }));
            var rowsById = new Map();
            tokenRows.forEach(function(rows) { rows.forEach(function(row) { rowsById.set(String(row.id), row); }); });
            return Array.from(rowsById.values());
        }

        function mergeDeepRows(parsedRows, equipmentRows) {
            var merged = new Map();
            parsedRows.forEach(function(row) {
                var key = normalizeSearchText(row.name);
                if (!key) return;
                var existing = merged.get(key) || {};
                merged.set(key, Object.assign(existing, { _parsed: row }, row, { description: row._raw || row.flavor_text || existing.description || '' }));
            });
            equipmentRows.forEach(function(row) {
                var key = normalizeSearchText(row.name);
                if (!key) return;
                var existing = merged.get(key) || {};
                var parsed = existing._parsed || null;
                merged.set(key, Object.assign(existing, row, {
                    _parsed: parsed,
                    description: row.description || existing.description || '',
                    type: row.type || existing.type,
                    level_req: row.level_req || (parsed && parsed.level_req) || existing.level_req,
                    verified: row.verified !== null && row.verified !== undefined ? row.verified : existing.verified
                }));
            });
            return Array.from(merged.values());
        }

        function applyDeepSearch(rows, filters, parsedQuery) {
            var deduplicated = new Map();
            rows.forEach(function(item) {
                var key = normalizeSearchText(item.name);
                if (!key) return;
                var existing = deduplicated.get(key);
                if (!existing || item.verified && !existing.verified) deduplicated.set(key, item);
            });
            return Array.from(deduplicated.values()).filter(function(item) {
                if (!matchesDeepFilters(item, filters, parsedQuery)) return false;
                var source = deepRawText(item) + ' ' + JSON.stringify(item._parsed || {});
                var normalizedSource = normalizeSearchText(source);
                var normalizedName = normalizeSearchText(item.name);
                var normalizedSearchSource = normalizedSource + ' ' + normalizeSearchText(JSON.stringify(item._parsed || {}));
                var queryTokens = parsedQuery.tokens.filter(function(token) {
                    return !parsedQuery.numeric.some(function(test) { return normalizeSearchText(test.stat) === normalizeSearchText(token); });
                });
                var hasTextQuery = queryTokens.length > 0 || (parsedQuery.phrases || []).length > 0;
                return !hasTextQuery || (queryTokens.every(function(token) { return normalizedSearchSource.includes(token) || normalizedName.includes(token); })
                    && (parsedQuery.phrases || []).every(function(phrase) { return normalizedSearchSource.includes(phrase) || normalizedName.includes(phrase); }));
            }).map(function(item) {
                item._searchScore = scoreDeepResult(item, parsedQuery);
                return item;
            }).sort(function(a, b) {
                return b._searchScore - a._searchScore || String(a.name).localeCompare(String(b.name));
            });
        }

        function deepRawText(item) {
            var parsed = item._parsed || item;
            return item.description || parsed._raw || parsed.flavor_text || '';
        }

        function getItemLevel(item) {
            var parsed = item._parsed || item;
            var level = Number(parsed.level_req || item.level_req || 0);
            if (level > 0) return level;
            var match = deepRawText(item).match(/\b(?:This level|Level)\s+(\d+)\s+item\b/i);
            return match ? Number(match[1]) : null;
        }

        function getItemValue(item) {
            var parsed = item._parsed || item;
            if (parsed.value !== null && parsed.value !== undefined && Number(parsed.value) > 0) return Number(parsed.value);
            var match = deepRawText(item).match(/\bvalued at\s+([\d,]+)\s+gold\b/i);
            return match ? Number(match[1].replace(/,/g, '')) : (parsed.value !== null && parsed.value !== undefined ? Number(parsed.value) : null);
        }

        function getItemWeight(item) {
            var parsed = item._parsed || item;
            if (parsed.weight_stones !== null && parsed.weight_stones !== undefined) {
                return { stones: Number(parsed.weight_stones), pebbles: Number(parsed.weight_pebbles || 0) };
            }
            var match = deepRawText(item).match(/\bweighs\s+([\d,]+)\s+stones?\s+and\s+([\d,]+)\s+pebbles\b/i);
            return match ? { stones: Number(match[1].replace(/,/g, '')), pebbles: Number(match[2].replace(/,/g, '')) } : null;
        }

        function getRawAffects(item) {
            var matches = [];
            var raw = deepRawText(item);
            var re = /^Affects\s+([a-z][a-z0-9-]*)\s+by\s+(-?\d+(?:\.\d+)?)(?:\.\s*|\s*)(?:\{([^}]+)\})?/gim;
            var match;
            while ((match = re.exec(raw)) !== null) {
                if (/\\(Requires \\d+ items?\\)/i.test(match[0])) continue;
                matches.push({ stat: match[1].toLowerCase(), value: Number(match[2]), frequency: match[3] || '' });
            }
            return matches;
        }

        function getItemAffects(item) {
            var parsed = item._parsed || item;
            var affects = Array.isArray(parsed.affects) ? parsed.affects.filter(function(effect) { return effect && typeof effect === 'object'; }) : [];
            var raw = getRawAffects(item);
            var keys = new Set(affects.map(function(effect) { return normalizeSearchText(effect.stat || effect.name || ''); }));
            raw.forEach(function(effect) {
                var key = normalizeSearchText(effect.stat);
                if (!keys.has(key)) { effect._source = 'raw'; affects.push(effect); keys.add(key); }
            });
            return affects;
        }

        function matchesNumericAffects(item, numericTests) {
            var affects = getItemAffects(item);
            return numericTests.every(function(test) {
                return affects.some(function(effect) {
                    if (normalizeSearchText(effect.stat || effect.name || '') !== normalizeSearchText(test.stat)) return false;
                    var value = Number(effect.value !== undefined ? effect.value : effect.amount);
                    if (!Number.isFinite(value)) return false;
                    if (test.op === '>=') return value >= test.value;
                    if (test.op === '<=') return value <= test.value;
                    if (test.op === '>') return value > test.value;
                    if (test.op === '<') return value < test.value;
                    return value === test.value;
                });
            });
        }

        function matchesDeepFilters(item, filters, parsedQuery) {
            var parsed = item._parsed || item;
            var raw = deepRawText(item);
            var type = String(item.type || parsed.type || '').toLowerCase();
            var typeAliases = { jewelry: ['jewelry','ring'], wand: ['wand','magical wand'] };
            if (filters.type === 'other') {
                if (ORDINARY_ITEM_TYPES.indexOf(type) >= 0) return false;
            } else if (filters.type) {
                if (!(typeAliases[filters.type] || [filters.type]).includes(type)) return false;
            }
            if (filters.weaponType) {
                var weaponType = String(parsed.weapon_type || '').toLowerCase();
                if (!weaponType) {
                    var weaponMatch = raw.match(/Your\s+(.+?)\s+will deal/i);
                    weaponType = weaponMatch ? weaponMatch[1].toLowerCase() : '';
                }
                if (!weaponType) {
                    var headerWeaponMatch = raw.match(/Item\s+'[^']+'\s+is type\s+weapon\b[^\n]*,\s*made of\s+[^\n]*\n[^\n]*?equipped\s+([^,.]+),?\s+with\s+([a-z-]+)\s+proficiency/i);
                    if (headerWeaponMatch) weaponType = headerWeaponMatch[2].toLowerCase();
                }
                if (!weaponType.includes(filters.weaponType.toLowerCase())) return false;
            }
            if (filters.wearSlot) {
                var slotText = String(parsed.equipped || parsed.slot || item.slot || '').toLowerCase();
                var header = raw.split('\n').slice(0, 3).join(' ').toLowerCase();
                if (!slotText) {
                    var rawSlot = header.match(/equipped\s+(on|around|about|over|as|wielded)\s+([^,.]+)/i);
                    if (rawSlot) slotText = (rawSlot[1] + ' ' + rawSlot[2]).toLowerCase();
                }
                var slotAliases = { shoulders: ['shoulder','shoulders'], wrist: ['wrist','wrists'], finger: ['finger','fingers'], legs: ['leg','legs'], feet: ['foot','feet'] };
                var terms = slotAliases[filters.wearSlot] || [filters.wearSlot];
                var equippedMatch = slotText.match(/equipped\s+(?:on|around|about|over|as|wielded)\s+(.+)/);
                var derivedSlot = equippedMatch ? equippedMatch[1].replace(/^(?:the|a|an)\s+/, '') : '';
                var slotMatches = terms.some(function(term) { return slotText.includes(term) || header.includes(term) || derivedSlot.includes(term); });
                if (!slotMatches) return false;
            }
            if (filters.material) {
                var material = String(parsed.material || '').toLowerCase();
                if (material !== filters.material.toLowerCase() && !raw.toLowerCase().includes('made of ' + filters.material.toLowerCase())) return false;
            }
            if (filters.minLevel || filters.maxLevel) {
                var level = getItemLevel(item);
                if (level === null) return false;
                if (filters.minLevel && level < Number(filters.minLevel)) return false;
                if (filters.maxLevel && level > Number(filters.maxLevel)) return false;
            }
            if (filters.source === 'eqdb' && !item.verified && !parsed.verified) return false;
            if (filters.source === 'personal' && (item.verified || parsed.verified)) return false;
            if (filters.affects.length) {
                var availableAffects = getItemAffects(item).map(function(effect) { return normalizeSearchText(effect.stat || effect.name || ''); });
                var rawTerms = raw.toLowerCase();
                if (!filters.affects.every(function(stat) {
                    var normalized = normalizeSearchText(stat);
                    return availableAffects.some(function(name) { return name.indexOf(normalized) >= 0; })
                        || rawTerms.indexOf('affects ' + stat.toLowerCase()) >= 0
                        || rawTerms.indexOf('resistance to ' + stat.toLowerCase()) >= 0;
                })) return false;
            }
            if (filters.whenProc && !((Array.isArray(parsed.when_procs) && parsed.when_procs.length) || /\bWhen\s+|^\+\+\+/im.test(raw))) return false;
            if (parsedQuery.numeric.length && !matchesNumericAffects(item, parsedQuery.numeric)) return false;
            return true;
        }

        function scoreDeepResult(item, parsedQuery) {
            var parsed = item._parsed || item;
            var name = normalizeSearchText(item.name);
            var phrase = parsedQuery.phrase;
            var raw = deepRawText(item);
            var structured = normalizeSearchText([
                parsed.type, parsed.material, parsed.equipped, parsed.slot, parsed.weapon_type,
                parsed.damage_type, parsed.spell_name, parsed.resource_name, parsed.ship_name,
                parsed.manual_skill, parsed.quiver_ammo_type, parsed.ammo_type, parsed.fountain_spell,
                parsed.warp_destination, parsed.warp_area, parsed.tool_type, parsed.set_name,
                parsed.artifice_result, parsed.npc_tell, parsed.flavor_text,
                JSON.stringify(parsed.affects || []), JSON.stringify(parsed.when_procs || []),
                JSON.stringify(parsed.procs || []), JSON.stringify(parsed.requirements || [])
            ].filter(Boolean).join(' '));
            var normalizedRaw = normalizeSearchText(raw);
            var searchableParsed = item._parsed || {};
            var normalizedParsed = normalizeSearchText([
                JSON.stringify(searchableParsed.affects || []), JSON.stringify(searchableParsed.when_procs || []),
                JSON.stringify(searchableParsed.procs || []), JSON.stringify(searchableParsed.requirements || []),
                JSON.stringify(searchableParsed.relic_properties || []), JSON.stringify(searchableParsed.set_bonuses || []),
                JSON.stringify(searchableParsed.grants_knowledge || []), JSON.stringify(searchableParsed.artifice_ingredients || []),
                JSON.stringify(searchableParsed.special_weapon_attrs || []), searchableParsed._raw
            ].filter(Boolean).join(' '));
            var score = 0;
            if (phrase && name === phrase) score += 10000;
            else if (phrase && name.indexOf(phrase) === 0) score += 4000;
            else if (phrase && name.indexOf(phrase) >= 0) score += 2500;
            parsedQuery.tokens.forEach(function(token) {
                if (name.indexOf(token) >= 0) score += 100;
                else if (structured.indexOf(token) >= 0) score += 55;
                else if (normalizedParsed.indexOf(token) >= 0) score += 40;
                else if (normalizedRaw.indexOf(token) >= 0) score += 20;
            });
            (parsedQuery.phrases || []).forEach(function(phrase) {
                if (name.indexOf(phrase) >= 0) score += 800;
                else if (structured.indexOf(phrase) >= 0) score += 250;
                else if (normalizedParsed.indexOf(phrase) >= 0) score += 180;
                else if (normalizedRaw.indexOf(phrase) >= 0) score += 100;
            });
            score += getItemAffects(item).length ? 2 : 0;
            return score;
        }

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
            var explanations = [];
            if (/\bAR\b/i.test(raw) || /\bar\b/i.test(JSON.stringify(parsed.affects || []))) explanations.push(['AR', 'Armor rating. The axe text says its combat effect lowers the opponent’s AR; the exact combat formula is game-specific.']);
            if (/silver(?:-based)? resistance|silver-vuln/i.test(raw + ' ' + JSON.stringify(parsed.affects || []))) explanations.push(['Silver vulnerability', 'Makes the affected target more vulnerable to silver damage; this is not a bonus to the wielder’s own resistance.']);
            if (/\b(?:Always|High Freq|Med\\. Freq|Low Freq)\b/i.test(raw)) explanations.push(['Frequency', 'Describes how often an affect or conditional effect applies/triggers; it is not a guaranteed permanent bonus unless marked Always.']);
            if (/\bwhen wielding|when casting|when evoking/i.test(raw)) explanations.push(['When / conditional', 'Only applies under the stated condition (such as wielding the named weapon type or evoking a named spell school).']);
            if (parsed.damage_tier || parsed.crit_tier) explanations.push(['Weapon profile', 'Damage, accuracy, range, and critical chance are separate game ratings. A critical multiplier describes critical-hit damage, not a guarantee that every hit is critical.']);
            if (/Requires \d+ items?/i.test(raw) || parsed.set_name) explanations.push(['Set bonus', 'The parenthesized count is the set-piece threshold for that bonus; it is separate from this item’s own base effects. The database does not specify here whether every piece must be worn or merely owned.']);
            if (/only one .+ in the world|if there is only one/i.test(raw)) explanations.push(['World-unique condition', 'The effect explicitly changes if only one copy exists in the world; read both values as conditional rather than treating the stronger value as always active.']);
            if (/per combat round|per attack|chance to|chance of/i.test(raw)) explanations.push(['Combat proc', 'A chance-based effect or one that builds over combat rounds is not an immediate flat stat bonus; its duration and cap matter.']);
            if (/Affects accuracy|accuracy by/i.test(raw)) explanations.push(['Accuracy', 'The item text reports an accuracy modifier/rating. It is distinct from weapon damage and critical damage.']);
            if (/Affects hp|Affects spell-points|Affects stamina/i.test(raw)) explanations.push(['Resource affects', 'These affect character pools or resource-related stats, not weapon hit damage. Check the stat name and whether its line is a set bonus.']);
            if (/lifespan|vanish at the end|renewed for/i.test(raw)) explanations.push(['Lifespan', 'This item can expire or vanish; renewal timing/cost in the raw text may be important.']);
            if (/spell-points must be greater than|class must be|proficiency in .+ must be|\*Your level must/i.test(raw)) explanations.push(['Use requirements', 'Starred lines are restrictions for using the item, not bonuses granted by it.']);
            if (/This item may be repaired|renewed for|default lifespan|will vanish/i.test(raw)) explanations.push(['Durability / expiry', 'Repair count, renewal count/cost, and lifespan are separate limits. An item with vanish-on-expiry should not be treated as permanent.']);
            if (!explanations.length) return '';
            return '<dl class="mechanic-glossary">' + explanations.map(function(entry) { return '<dt>' + escapeHtml(entry[0]) + '</dt><dd>' + escapeHtml(entry[1]) + '</dd>'; }).join('') + '</dl>';
        }

        function renderDeepResults(page) {
            deepSearchPage = Math.max(0, Math.min(page, Math.ceil(deepSearchResults.length / DEEP_PAGE_SIZE) - 1));
            var resultsDiv = document.getElementById('results');
            if (!deepSearchResults.length) {
                resultsDiv.innerHTML = '<p class="search-empty">No matching items found. Try different words, clear a filter, or switch to Classic Search.</p>';
                return;
            }
            var start = deepSearchPage * DEEP_PAGE_SIZE;
            var visible = deepSearchResults.slice(start, start + DEEP_PAGE_SIZE);
            var html = '<h2 class="smart-results-title">Gear matches <span style="color:#888;font-size:13px;font-weight:normal;">(' + deepSearchResults.length + ')</span></h2>';
            html += '<p class="search-explanation">Ranked by name match, then parsed item details, then the complete captured text. Structured fields may omit unusual MUD mechanics: key effect lines below come from the raw item description when parsing is incomplete. Search results are grouped by item name; multiple submitted/player versions of the same name are represented by one result.</p>';
            visible.forEach(function(item) {
                var parsed = item._parsed || item;
                var level = getItemLevel(item);
                html += '<div class="item-card" data-name="' + escapeHtml(item.name) + '">';
                html += '<h3><a href="item.html?name=' + encodeURIComponent(item.name) + '">' + escapeHtml(item.name) + '</a></h3>';
                html += '<div class="item-meta">';
                html += '[' + escapeHtml(item.type || parsed.type || 'unknown') + '] ';
                if (parsed.material) html += 'Material: ' + escapeHtml(parsed.material) + ' · ';
                if (parsed.equipped || parsed.slot || item.slot) html += 'Worn: ' + escapeHtml(parsed.equipped || parsed.slot || item.slot) + ' · ';
                if (level !== null) html += 'Level: ' + level + ' · ';
                if (parsed.condition) html += 'Condition: ' + escapeHtml(parsed.condition) + ' · ';
                if (parsed.alignment !== null && parsed.alignment !== undefined) html += 'Alignment: ' + escapeHtml(String(parsed.alignment)) + ' · ';
                if (parsed.category !== null && parsed.category !== undefined) html += 'Cat. ' + escapeHtml(String(parsed.category)) + ' · ';
                var itemWeight = getItemWeight(item);
                if (itemWeight) html += 'Weight: ' + escapeHtml(String(itemWeight.stones)) + ' st ' + escapeHtml(String(itemWeight.pebbles)) + ' pb · ';
                var itemValue = getItemValue(item);
                if (itemValue !== null) html += 'Value: ' + escapeHtml(String(itemValue)) + ' · ';
                if (parsed.damage_tier) html += 'Damage: ' + escapeHtml(String(parsed.damage_tier)) + ' ' + escapeHtml(String(parsed.damage_type || '')) + ' · ';
                if (parsed.accuracy_tier) html += 'Accuracy: ' + escapeHtml(String(parsed.accuracy_tier)) + ' · ';
                if (parsed.range_tier) html += 'Range: ' + escapeHtml(String(parsed.range_tier)) + ' · ';
                if (parsed.crit_tier) html += 'Critical chance: ' + escapeHtml(String(parsed.crit_tier)) + (parsed.crit_multiplier ? ' (' + escapeHtml(String(parsed.crit_multiplier)) + 'x damage on a critical hit)' : '') + ' · ';
                if (parsed.armor_resistance !== null && parsed.armor_resistance !== undefined) html += 'Armor resistance: ' + escapeHtml(String(parsed.armor_resistance)) + ' · ';
                if (parsed.spell_name) html += 'Spell: ' + escapeHtml(String(parsed.spell_name)) + (parsed.spell_level ? ' (level ' + escapeHtml(String(parsed.spell_level)) + ')' : '') + ' · ';
                if (parsed.charges_max !== null && parsed.charges_max !== undefined) html += 'Charges: ' + escapeHtml(String(parsed.charges_current || 0)) + '/' + escapeHtml(String(parsed.charges_max)) + ' · ';
                if (parsed.spellbook_max !== null && parsed.spellbook_max !== undefined) html += 'Spellbook: ' + escapeHtml(String(parsed.spellbook_count || 0)) + '/' + escapeHtml(String(parsed.spellbook_max)) + ' · ';
                if (parsed.container_capacity !== null && parsed.container_capacity !== undefined) html += 'Capacity: ' + escapeHtml(String(parsed.container_capacity)) + ' · ';
                if (parsed.drink_liquid) html += 'Liquid: ' + escapeHtml(String(parsed.drink_liquid)) + ' · ';
                if (parsed.light_minutes) html += 'Light duration: ' + escapeHtml(String(parsed.light_minutes)) + ' min · ';
                if (parsed.set_name) html += 'Set: ' + escapeHtml(String(parsed.set_name)) + (Array.isArray(parsed.set_items) && parsed.set_items.length ? ' (' + parsed.set_items.length + ' pieces)' : '') + ' · ';
                if (parsed.relic_slots) html += 'Relic slots: ' + escapeHtml(String(parsed.relic_slots)) + ' · ';
                var summaryAffects = getItemAffects(item).slice(0, 5);
                if (summaryAffects.length) html += 'Affects: ' + summaryAffects.map(function(effect) { return escapeHtml(effect.stat || effect.name || '') + ' ' + escapeHtml(String(effect.value !== undefined ? effect.value : effect.amount)); }).join(', ') + ' · ';
                if (parsed.warp_destination) html += 'Use destination: ' + escapeHtml(String(parsed.warp_destination)) + ' · ';
                if (parsed.manual_skill) html += 'Skill: ' + escapeHtml(String(parsed.manual_skill)) + (parsed.manual_points ? ' +' + escapeHtml(String(parsed.manual_points)) : '') + ' · ';
                if (parsed.resource_name) html += 'Resource: ' + escapeHtml(String(parsed.resource_name)) + ' · ';
                if (parsed.fountain_spell) html += 'Fountain: ' + escapeHtml(String(parsed.fountain_spell)) + ' · ';
                html += item.verified ? '<span style="color:#44aa44;">EQDB</span>' : '<span style="color:#ffaa00;">Personal</span>';
                html += '</div>';
                var highlights = deepResultHighlights(item);
                if (highlights.length) {
                    var autoExpandMechanics = highlights.length >= 6 || Boolean(parsed.set_name) || (Array.isArray(parsed.procs) && parsed.procs.length > 0);
                    html += '<details class="mechanics-panel"' + (autoExpandMechanics ? ' open' : '') + '><summary>Understand this item · ' + highlights.length + ' mechanics and restrictions</summary><div class="mechanics-body">';
                    html += '<p>Short explanations are clues, not rulebook definitions. Original item text is preserved below; parsed summaries are derived from EQDB data.</p>';
                    html += '<div class="search-highlight"><span class="highlight-label">Item mechanics</span>';
                    html += highlights.map(function(entry) {
                        return '<span class="highlight-line"><span class="highlight-label">' + escapeHtml(entry.label) + ' · ' + (entry.source === 'raw' ? 'Original MUD text' : 'Parsed summary') + ':</span> ' + escapeHtml(entry.text) + '</span>';
                    }).join('') + '</div>';
                    html += mechanicsGlossary(item);
                    var fullDescription = deepRawText(item);
                    if (fullDescription) html += '<details class="full-description"><summary>Show complete original MUD item text</summary><pre>' + escapeHtml(fullDescription) + '</pre></details>';
                    html += '</div></details>';
                } else {
                    var fallbackDescription = deepRawText(item);
                    if (fallbackDescription) html += '<details class="full-description"><summary>Show complete original MUD item text</summary><pre>' + escapeHtml(fallbackDescription) + '</pre></details>';
                }

                html += '</div>';
            });
            var totalPages = Math.ceil(deepSearchResults.length / DEEP_PAGE_SIZE);
            html += '<div class="search-pages"><button type="button" data-deep-page="' + (deepSearchPage - 1) + '"' + (deepSearchPage <= 0 ? ' disabled' : '') + '>← Previous</button>';
            html += '<strong>Page ' + (deepSearchPage + 1) + ' of ' + totalPages + ' · showing ' + (start + 1) + '–' + Math.min(start + visible.length, deepSearchResults.length) + '</strong>';
            html += '<button type="button" data-deep-page="' + (deepSearchPage + 1) + '"' + (deepSearchPage >= totalPages - 1 ? ' disabled' : '') + '>Next →</button></div>';
            resultsDiv.innerHTML = html;
            resultsDiv.querySelectorAll('[data-deep-page]').forEach(function(button) {
                button.addEventListener('click', function() { renderDeepResults(Number(this.getAttribute('data-deep-page'))); });
            });
        }

        async function searchEquipmentDeep() {
            var resultsDiv = document.getElementById('results');
            var rawQuery = document.getElementById('search-input').value.trim();
            var parsedQuery = getDeepQuery(rawQuery);
            var filters = {
                type: document.getElementById('filter-type').value,
                weaponType: document.getElementById('filter-weapon-type').value,
                wearSlot: document.getElementById('filter-wear-slot').value.toLowerCase(),
                material: document.getElementById('filter-material').value,
                minLevel: document.getElementById('filter-min-level').value,
                maxLevel: document.getElementById('filter-max-level').value,
                source: document.getElementById('filter-source').value,
                affects: activeAffects.slice(),
                whenProc: document.getElementById('filter-when-proc').checked
            };
            var hasFilters = Boolean(filters.type || filters.weaponType || filters.wearSlot || filters.material || filters.minLevel || filters.maxLevel || filters.source || filters.affects.length || filters.whenProc);
            parsedQuery.numeric.forEach(function(test) {
                if (!filters.affects.some(function(stat) { return normalizeSearchText(stat) === normalizeSearchText(test.stat); })) filters.affects.push(test.stat);
            });
            var searchableQueryTokens = parsedQuery.tokens.filter(function(token) {
                return !parsedQuery.numeric.some(function(test) { return normalizeSearchText(test.stat) === normalizeSearchText(token); });
            });
            var hasSearchTokens = searchableQueryTokens.length > 0 || parsedQuery.phrases.length > 0;
            if (!hasSearchTokens && !parsedQuery.numeric.length && !hasFilters) {
                resultsDiv.innerHTML = '<p class="search-empty">Enter an item name, stat, ability, material, or other detail—or choose a filter.</p>';
                return;
            }
            var requestId = ++deepSearchRequest;
            resultsDiv.innerHTML = '<p>Deep Search is checking parsed details and the full captured text...</p>';
            try {
                if (!hasSearchTokens) {
                    var matchingParsed = await fetchPagedQuery(buildParsedFacetQuery(filters).order('id', { ascending: true }), requestId, 500);
                    var matchingRaw = await fetchPagedQuery(buildEquipmentFacetQuery(filters).order('name', { ascending: true }), requestId, 500);
                    if (requestId !== deepSearchRequest) return;
                    var matchingNames = new Set(matchingParsed.map(function(row) { return normalizeSearchText(row.name); }));
                    var fallbackCandidates = matchingRaw.filter(function(row) { return !matchingNames.has(normalizeSearchText(row.name)); });
                    var fallbackParsed = [];
                    for (var batchStart = 0; batchStart < fallbackCandidates.length; batchStart += 50) {
                        var batchNames = fallbackCandidates.slice(batchStart, batchStart + 50).map(function(row) { return row.name; });
                        var parsedLookup = await supabase.from('equipment_parsed').select(PARSED_SEARCH_COLUMNS).in('name', batchNames);
                        if (parsedLookup.error) throw new Error('equipment_parsed fallback: ' + parsedLookup.error.message);
                        fallbackParsed = fallbackParsed.concat(parsedLookup.data || []);
                    }
                    deepSearchResults = applyDeepSearch(mergeDeepRows(matchingParsed.concat(fallbackParsed), matchingRaw), filters, parsedQuery);
                    renderDeepResults(0);
                    saveSearchState();
                    return;
                }
                var parsedResult;
                if (hasSearchTokens) {
                    var searchableTokens = searchableQueryTokens;
                    var tokenQueries = await Promise.all(searchableTokens.map(async function(token) {
                        return fetchPagedQuery(buildDeepTextQuery('equipment_parsed', token), requestId, 500);
                    }));
                    var parsedUnique = new Map();
                    tokenQueries.forEach(function(rows) { rows.forEach(function(row) { parsedUnique.set(String(row.id), row); }); });
                    parsedResult = Array.from(parsedUnique.values());
                    if (requestId !== deepSearchRequest) return;
                    var rawOnlyRows = await fetchRawDescriptionSearch(searchableTokens, requestId);
                    var phraseRows = [];
                    var phraseParsedRows = [];
                    for (var phraseIndex = 0; phraseIndex < parsedQuery.phrases.length; phraseIndex++) {
                        var phrase = parsedQuery.phrases[phraseIndex];
                        phraseParsedRows = phraseParsedRows.concat(await fetchPagedQuery(buildDeepTextQuery('equipment_parsed', phrase), requestId, 500));
                        var phraseQuery = supabase.from('equipment').select('id,name,type,slot,level_req,weight,value,description,properties,verified').or('name.ilike.%' + escapePostgrestToken(phrase) + '%,description.ilike.%' + escapePostgrestToken(phrase) + '%');
                        phraseRows = phraseRows.concat(await fetchPagedQuery(phraseQuery, requestId, 250));
                    }
                    if (requestId !== deepSearchRequest) return;
                    var merged = mergeDeepRows(parsedResult.concat(phraseParsedRows), rawOnlyRows.concat(phraseRows));
                    deepSearchResults = applyDeepSearch(merged, filters, parsedQuery);
                } else {
                    var parsedQueryBuilder = buildParsedFacetQuery(filters).order('id', { ascending: true });
                    var filteredParsed = await fetchPagedQuery(parsedQueryBuilder, requestId, 500);
                    if (requestId !== deepSearchRequest) return;
                    var fallbackBuilder = buildEquipmentFacetQuery(filters).order('name', { ascending: true });
                    var fallbackRows = await fetchPagedQuery(fallbackBuilder, requestId, 500);
                    if (requestId !== deepSearchRequest) return;
                    deepSearchResults = applyDeepSearch(mergeDeepRows(filteredParsed, fallbackRows), filters, parsedQuery);
                }
                if (requestId !== deepSearchRequest) return;
                renderDeepResults(0);
                saveSearchState();
            } catch(error) {
                if (requestId !== deepSearchRequest) return;
                resultsDiv.innerHTML = '<p style="color:#ff6666;">Deep Search failed: ' + escapeHtml(error.message) + '. Classic Search is still available; switch modes or report this error.</p>';
                console.error('Deep Search error:', error);
            }
        }

        async function searchMobs() {
            var searchTerm = document.getElementById('mob-search-input').value.toLowerCase();
            if (!searchTerm) return;
            
            var result = await supabase.from('mobs_db').select('mobid, name').ilike('name', '%' + searchTerm + '%').limit(50);
            var data = result.data;
            var resultsDiv = document.getElementById('results');
            
            if (!data || data.length === 0) {
                resultsDiv.innerHTML = '<p>No mobs found.</p>';
                return;
            }
            
            var html = '<h2 style="color:#C0C0C0;">Mobs Found (' + data.length + ')</h2>';
            for (var i = 0; i < data.length; i++) {
                var mob = data[i];
                html += '<div class="item-card">';
                html += '<h3><a href="mob.html?mobid=' + escapeHtml(String(mob.mobid)) + '">' + escapeHtml(mob.name) + '</a></h3>';
                html += '</div>';
            }
            
            resultsDiv.innerHTML = html;
            saveSearchState();
        }
        function sanitizeHtml(html) {
            if (!html) return '';
            const d = document.createElement('div');
            d.innerHTML = html;
            const kill = d.querySelectorAll('script, iframe, object, embed, form, input, a, link, meta, style');
            for (let i = 0; i < kill.length; i++) kill[i].remove();
            const all = d.querySelectorAll('*');
            for (let i = 0; i < all.length; i++) {
                const attrs = all[i].attributes;
                for (let j = attrs.length - 1; j >= 0; j--) {
                    const name = attrs[j].name;
                    if (name.startsWith('on') || name === 'href' || name === 'src') {
                        all[i].removeAttribute(name);
                    }
                }
            }
            return d.innerHTML;
        }

        function escapeHtml(text) {
            if (!text) return '';
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // ============================================
        // ITEM TOOLTIP
        // ============================================
        var tooltipCache = {};
        var tooltipTimer = null;

        function getTooltip() {
            return document.getElementById('item-tooltip');
        }

        function moveTooltip(e) {
            var tt = getTooltip();
            if (tt.style.display === 'none') return;
            var x = e.clientX + 15;
            var y = e.clientY + 15;
            if (x + 400 > window.innerWidth)  x = e.clientX - 400;
            if (y + 300 > window.innerHeight) y = e.clientY - 310;
            tt.style.left = x + 'px';
            tt.style.top  = y + 'px';
        }

        function hideTooltip() {
            clearTimeout(tooltipTimer);
            getTooltip().style.display = 'none';
        }

        async function handleItemHover(e) {
            var card = e.target.closest('.item-card');
            if (!card) return;
            var name = card.getAttribute('data-name');
            if (!name) return;

            clearTimeout(tooltipTimer);
            var currentEvent = e;

            tooltipTimer = setTimeout(async function() {
                var tt = getTooltip();
                tt.innerHTML = '<span class="tt-loading">Loading...</span>';
                tt.style.display = 'block';
                tt.style.left = (currentEvent.clientX + 15) + 'px';
                tt.style.top  = (currentEvent.clientY + 15) + 'px';

                if (!tooltipCache[name]) {
                    var r = await supabase.from('equipment').select('description, type, slot, level_req, value, verified').eq('name', name).limit(1);
                    tooltipCache[name] = (r.data && r.data.length > 0) ? r.data[0] : null;
                }

                var item = tooltipCache[name];
                if (!item || !item.description) {
                    tt.innerHTML = '<span style="color:#555;">No stat data available.</span>';
                    return;
                }

                tt.innerHTML = colorize(item.description);
            }, 300);
        }

        function colorize(html) {
            if (!html) return '';
            if (html.indexOf('<font') >= 0 || html.indexOf('<span') >= 0) {
                return '<div style="white-space:pre-wrap;">' + sanitizeHtml(html) + '</div>';
            }
            return '<div style="white-space:pre-wrap;">' + colorizeMM(html) + '</div>';
        }

        const C = {
            blue: '#8787FF', white: '#C0C0C0', cyan: '#00FFFF', yellow: '#FFFF00',
            green: '#00FF00', pink: '#D78787', magenta: '#FF00FF', gray: '#808080',
            olive: '#808000', red: '#FF0000', darkgreen: '#008000'
        };
        function tag(color, text) { return '<font color="' + color + '">' + text + '</font>'; }
        function numbersWhite(str, baseColor) {
            return str.replace(/(\d[\d,]*\.?\d*%?)/g,
                '</font><font color="' + C.white + '">$1</font><font color="' + baseColor + '">');
        }
        function colorizeItemLine(line) {
            let h = tag(C.blue, "Item '");
            const nm = line.match(/^Item\s+'(.+?)'\s+is type/);        if (nm) h += tag(C.white, escapeHtml(nm[1])) + tag(C.blue, "' is type ");
            const tm = line.match(/is type\s+(\S+)/);                  if (tm) h += tag(C.white, escapeHtml(tm[1].replace(',', ''))) + tag(C.blue, ',');
            const am = line.match(/alignment\s+(-?\d+)/);              if (am) h += tag(C.blue, ' alignment ') + tag(C.white, am[1]) + tag(C.blue, ',');
            const mm = line.match(/made of\s+(\S+)/);                  if (mm) h += tag(C.blue, ' made of ') + tag(C.white, escapeHtml(mm[1]));
            const cm = line.match(/\(in\s+\((.+?)\)\s+condition\)/);   if (cm) h += tag(C.blue, ' (in ') + tag(C.white, '(' + escapeHtml(cm[1]) + ')') + tag(C.blue, ' condition)');
            if (/\[EQDB\]/.test(line))  h += tag(C.white, '[EQDB]');
            if (/\[Study\]/.test(line)) h += tag(C.white, '[Study]');
            if (/\[LTB\]/.test(line))   h += tag(C.white, '[LTB]');
            return h;
        }
        function colorizeKeywordLine(line) {
            let h = tag(C.blue, "has keywords '");
            const km = line.match(/has keywords\s+'([^']+)'/); if (km) h += tag(C.white, escapeHtml(km[1])) + tag(C.blue, "'");
            const em = line.match(/, equipped\s+(.+?)\.?$/);   if (em) h += tag(C.blue, ', equipped ') + tag(C.white, escapeHtml(em[1])) + tag(C.blue, '.');
            return h;
        }
        function colorizeAffectLine(line) {
            const isSetBonus  = /\(Requires\s+\d+\s+items?\)/.test(line);
            const labelColor  = isSetBonus ? C.magenta : C.cyan;
            const match = line.match(/^Affects\s+(.+?)\s+by\s+(-?[\d.]+)\s*(\.?)\s*(\(Requires\s+\d+\s+items?\))?\.?\s*(\{[^}]+\})?/);
            if (match) {
                const [, stat, num, dot, req, freq] = match;
                let h = tag(labelColor, 'Affects') + ' ' + tag(C.white, stat) + ' ' + tag(labelColor, 'by') + ' ' + tag(C.white, num);
                if (dot) h += tag(labelColor, dot);
                if (req) {
                    const rm = req.match(/\(Requires\s+(\d+)\s+items?\)/);
                    h += rm
                        ? ' ' + tag(C.magenta, '(Requires ') + tag(C.white, rm[1]) + tag(C.magenta, ' items)')
                        : ' ' + tag(C.magenta, req);
                }
                if (freq) h += ' ' + tag(C.pink, freq);
                return h;
            }
            return tag(labelColor, escapeHtml(line));
        }
        function colorizeReqLine(content) {
            let h = escapeHtml(content);
            h = h.replace(/Your /,             'Your </font><font color="' + C.white + '">');
            h = h.replace(/ must be /,         '</font><font color="' + C.cyan + '"> must be </font><font color="' + C.white + '">');
            h = h.replace(/ must not be /,     '</font><font color="' + C.cyan + '"> must not be </font><font color="' + C.white + '">');
            h = h.replace(/ to use this item/, '</font><font color="' + C.cyan + '"> to use this item');
            return h;
        }
        function colorizeMM(text) {
            if (!text) return '';
            text = text.replace(/\n?.*\d+hp\s+\d+sp\s+\d+st[^\n]*\n?/g, '\n');
            const lines  = text.split('\n');
            const result = [];
            let inRelic  = false;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const t    = line.trim();
                if (t === '') { result.push(''); continue; }
                if (/^\+\+\+/.test(t)) {
                    result.push(tag(C.green, escapeHtml(line)));
                    i++;
                    while (i < lines.length) {
                        const nl = lines[i], nt = nl.trim();
                        if (nt === '' || /^\+\+\+/.test(nt) || /^Item\s+'/.test(nt) || /^\*/.test(nt)) { i--; break; }
                        result.push(tag(C.green, escapeHtml(nl)));
                        i++;
                    }
                    continue;
                }
                if (/^Relics:/.test(t))                           { inRelic = true;  result.push(tag(C.green, escapeHtml(line))); continue; }
                if (inRelic && /^(Small|Medium|Large)\s*\(/.test(t))               { result.push(tag(C.green, escapeHtml(line))); continue; }
                if (inRelic && /^\s*\(\d+\/\d+/.test(t))          { inRelic = false; result.push(tag(C.green, escapeHtml(line))); continue; }
                if (/^\*/.test(t)) {
                    if (/^\*\s*Item\s+'/.test(t)) {
                        const si = t.match(/\*\s*(Item\s+')(.+)(')$/);
                        result.push(si
                            ? tag(C.yellow, '* ') + tag(C.magenta, si[1]) + escapeHtml(si[2]) + tag(C.magenta, si[3])
                            : tag(C.yellow, escapeHtml(line)));
                        continue;
                    }
                    if (/^\*This/.test(t)) {
                        result.push(tag(C.yellow, '*') + tag(C.blue, ' ' + numbersWhite(escapeHtml(t.substring(1).trim()), C.blue) + '</font>'));
                        continue;
                    }
                    result.push(tag(C.yellow, '*') + tag(C.cyan, colorizeReqLine(t.substring(1).trim())));
                    continue;
                }
                if (/^-\s*Item\s+'/.test(t)) {
                    const di = t.match(/^(-\s*)(Item\s+')(.+)(')$/);
                    if (di) result.push(tag(C.gray, di[1]) + tag(C.magenta, di[2]) + escapeHtml(di[3]) + tag(C.magenta, di[4]));
                    continue;
                }
                if (/^Affects/.test(t)) { result.push(colorizeAffectLine(t)); continue; }
                if (/^Special weapon attributes:/.test(t)) {
                    const sw = line.match(/^(Special weapon attributes:)\s+(.+)$/);
                    result.push(sw
                        ? tag(C.blue, escapeHtml(sw[1])) + ' ' + tag(C.white, escapeHtml(sw[2]))
                        : tag(C.blue, escapeHtml(line)));
                    continue;
                }
                if (/^Your .+ will deal .+ damage with .+ accuracy, at .+ range, with a .+ chance to crit for .+ damage\.$/i.test(t)) {
                    const ws = line.match(/^(Your )(.+?)( will deal )(.+?)( damage with )(.+?)( accuracy, at )(.+?)( range, with a )(.+?)( chance to crit for )(.+?)( damage\.)$/i);
                    if (ws) {
                        result.push(
                            tag(C.cyan,  escapeHtml(ws[1]))  + tag(C.white, escapeHtml(ws[2]))  +
                            tag(C.cyan,  escapeHtml(ws[3]))  + tag(C.white, escapeHtml(ws[4]))  +
                            tag(C.cyan,  escapeHtml(ws[5]))  + tag(C.white, escapeHtml(ws[6]))  +
                            tag(C.cyan,  escapeHtml(ws[7]))  + tag(C.white, escapeHtml(ws[8]))  +
                            tag(C.cyan,  escapeHtml(ws[9]))  + tag(C.white, escapeHtml(ws[10])) +
                            tag(C.cyan,  escapeHtml(ws[11])) + tag(C.white, escapeHtml(ws[12])) +
                            tag(C.cyan,  escapeHtml(ws[13]))
                        );
                    } else {
                        result.push(tag(C.cyan, escapeHtml(line)));
                    }
                    continue;
                }
                if (/^When/.test(t)) {
                    const wm = line.match(/^(When\s+(casting|wielding|evoking|affected\s+by)\s+)(.+?)(,.+)$/i);
                    if (wm) {
                        const restColored = numbersWhite(escapeHtml(wm[4]), C.green);
                        let h = tag(C.green, escapeHtml(wm[1])) + tag(C.white, escapeHtml(wm[3])) + '<font color="' + C.green + '">' + restColored + '</font>';
                        h = h.replace(/<font color="#00FF00"><\/font>/g, '');
                        result.push(h);
                    } else {
                        result.push('<font color="' + C.green + '">' + numbersWhite(escapeHtml(line), C.green) + '</font>');
                    }
                    continue;
                }
                if (/^(Adds resistance|Decreases|Grants|Casts|Improves|Your weapon special|Alters)/.test(t)) {
                    const cls = (/^Adds resistance/.test(t) && /\(Requires/.test(t)) ? C.magenta : C.cyan;
                    result.push(tag(cls, numbersWhite(escapeHtml(line), cls) + '</font>'));
                    continue;
                }
                if (/^Increases/.test(t)) {
                    const inc = line.match(/^(Increases )(.+?)( to )(.+?)(-based attacks\.)/i);
                    if (inc) {
                        result.push(
                            tag(C.cyan, escapeHtml(inc[1])) + tag(C.white, escapeHtml(inc[2])) +
                            tag(C.cyan, escapeHtml(inc[3])) + tag(C.white, escapeHtml(inc[4])) +
                            tag(C.cyan, escapeHtml(inc[5]))
                        );
                    } else {
                        result.push(tag(C.cyan, escapeHtml(line)));
                    }
                    continue;
                }
                if (/^Item\s+'/.test(t)) { result.push(colorizeItemLine(t)); continue; }
                if (/^Level\s+\d+\s+item\s+'/.test(t)) {
                    const lm = t.match(/^(Level\s+\d+\s+item\s+')(.+?)('\s+is type)/);
                    result.push(lm
                        ? tag(C.blue, lm[1]) + tag(C.white, escapeHtml(lm[2])) + tag(C.blue, lm[3])
                        : tag(C.blue, escapeHtml(line)));
                    continue;
                }
                if (/^has keywords/.test(t)) { result.push(colorizeKeywordLine(t)); continue; }
                if (/^This item has a default lifespan/.test(t) || /^This item will lose its status/.test(t) || /^This item will vanish/.test(t)) {
                    result.push(tag(C.blue, numbersWhite(escapeHtml(line), C.blue) + '</font>'));
                    continue;
                }
                if (/^This level .+ item has the attributes:/.test(t)) {
                    const am = line.match(/^(This level \d+ item has the attributes:)(.+)$/);
                    result.push(am
                        ? tag(C.blue, numbersWhite(escapeHtml(am[1]), C.blue) + '</font>') + tag(C.white, escapeHtml(am[2]))
                        : tag(C.blue, escapeHtml(line)));
                    continue;
                }
                if (/^(This item weighs|This level|This item has|This armor has|This item protects|This ward has|This relic|This item, when|This amulet|Your magical wand|This light source|Armor resistance|This item will have|This item is enchanted)/.test(t)) {
                    const catMatch = line.match(/\{Cat\.\s*\d+\}/);
                    const catText  = catMatch ? catMatch[0] : '';
                    let working    = escapeHtml(line.replace(/\{Cat\.\s*\d+\}/g, '##CAT##'));
                    let colored    = tag(C.blue, numbersWhite(working, C.blue) + '</font>');
                    if (catText) colored = colored.replace(/##CAT##/g, '</font><font color="' + C.red + '">' + escapeHtml(catText) + '</font><font color="' + C.blue + '">');
                    colored = colored.replace(/<font color="#8787FF"><\/font>/g, '');
                    result.push(colored);
                    continue;
                }
                if (/^(This is part of|You are currently)/.test(t)) {
                    result.push(tag(C.magenta, numbersWhite(escapeHtml(line), C.magenta) + '</font>'));
                    continue;
                }
                if (/This item is beyond your power/.test(t)) { result.push(tag(C.magenta, escapeHtml(line))); continue; }
                if (/^(Capacity:|Upon|Small )/.test(t)) {
                    result.push(tag(C.cyan, numbersWhite(escapeHtml(line), C.cyan) + '</font>'));
                    continue;
                }
                result.push(tag(C.white, escapeHtml(line)));
            }
            return result.join('\n');
        }

        // ============================================
        // SIDEBAR
        // ============================================
        async function loadSidebar() {
            var now = new Date().toISOString();
            var [lfgResult, marketResult, recentResult] = await Promise.all([
                supabase.from('lfg_posts')
                    .select('target, character_name, post_type, created_at')
                    .eq('is_deleted', false)
                    .or('expires_at.is.null,expires_at.gt.' + now)
                    .order('created_at', { ascending: false })
                    .limit(3),
                supabase.from('market_listings')
                    .select('item_name, character_name, listing_type, price, created_at')
                    .eq('is_sold', false)
                    .eq('is_deleted', false)
                    .or('expires_at.is.null,expires_at.gt.' + now)
                    .order('created_at', { ascending: false })
                    .limit(3),
                supabase.from('equipment')
                    .select('name, verified, created_at')
                    .order('created_at', { ascending: false })
                    .limit(8)
            ]);

            // LFG
            var lfgEl = document.getElementById('sidebar-lfg-body');
            var lfg = lfgResult.data || [];
            if (lfg.length === 0) {
                lfgEl.innerHTML = '<div class="sidebar-empty">No active posts</div>';
            } else {
                lfgEl.innerHTML = '';
                var badges = { need: 'NEED', offer: 'OFFER', run: 'RUN', interest: 'WANT' };
                lfg.forEach(function(p) {
                    var d = document.createElement('div');
                    d.className = 'sidebar-entry';
                    d.innerHTML = '<span class="badge-' + p.post_type + '">' + (badges[p.post_type] || p.post_type.toUpperCase()) + '</span> '
                        + '<a href="lfg.html" title="' + escapeHtml(p.target) + '">' + escapeHtml(p.target) + '</a>'
                        + '<div class="meta">' + escapeHtml(p.character_name) + '</div>';
                    lfgEl.appendChild(d);
                });
            }

            // Market
            var mktEl = document.getElementById('sidebar-market-body');
            var mkt = marketResult.data || [];
            if (mkt.length === 0) {
                mktEl.innerHTML = '<div class="sidebar-empty">No active listings</div>';
            } else {
                mktEl.innerHTML = '';
                var mktBadges = { sell: 'SELL', buy: 'BUY', trade: 'TRADE' };
                mkt.forEach(function(m) {
                    var d = document.createElement('div');
                    d.className = 'sidebar-entry';
                    d.innerHTML = '<span class="badge-' + m.listing_type + '">' + (mktBadges[m.listing_type] || m.listing_type.toUpperCase()) + '</span> '
                        + '<a href="item.html?name=' + encodeURIComponent(m.item_name) + '" title="' + escapeHtml(m.item_name) + '">' + escapeHtml(m.item_name) + '</a>'
                        + '<div class="meta">' + escapeHtml(m.character_name) + (m.price ? ' · ' + escapeHtml(m.price) : '') + '</div>';
                    mktEl.appendChild(d);
                });
            }

            // Recently added (sidebar)
            var recentEl = document.getElementById('sidebar-recent-body');
            var recent = recentResult.data || [];
            if (recent.length === 0) {
                recentEl.innerHTML = '<div class="sidebar-empty">Nothing yet</div>';
            } else {
                recentEl.innerHTML = '';
                recent.forEach(function(e) {
                    var d = document.createElement('div');
                    d.className = 'sidebar-entry';
                    var src = e.verified
                        ? '<span style="color:#44aa44;font-size:10px;">EQDB</span> '
                        : '<span style="color:#ffaa00;font-size:10px;">NEW</span> ';
                    d.innerHTML = src + '<a href="item.html?name=' + encodeURIComponent(e.name) + '" title="' + escapeHtml(e.name) + '">' + escapeHtml(e.name) + '</a>';
                    recentEl.appendChild(d);
                });
            }

        }

        async function loadMiniLeaderboard() {
            var el = document.getElementById('mini-lb-body');
            if (!el) return;
            try {
                var allData = [];
                var page = 0, pageSize = 1000;
                while (true) {
                    var r = await supabase.from('submission_history').select('submitter,is_eqdb,created_at').range(page * pageSize, (page + 1) * pageSize - 1);
                    if (r.error) { console.error('MiniLB err:', r.error); el.textContent = 'Query error.'; return; }
                    if (!r.data || r.data.length === 0) break;
                    allData = allData.concat(r.data);
                    if (r.data.length < pageSize) break;
                    page++;
                }
                if (allData.length === 0) { el.textContent = 'No submissions yet.'; return; }
                var contributors = {};
                for (var i = 0; i < allData.length; i++) {
                    var s = allData[i];
                    var n = s.submitter || 'anonymous';
                    if (n.toLowerCase() === 'huko') continue;
                    if (!contributors[n]) contributors[n] = { name: n, total: 0, eqdb: 0, personal: 0, locs: 0 };
                    contributors[n].total++;
                    if (s.is_eqdb) contributors[n].eqdb++; else contributors[n].personal++;
                }
                // Fetch approved location counts per submitter
                var { data: locData } = await supabase.from('location_queue').select('submitted_by').eq('status', 'approved');
                if (locData) {
                    for (var li = 0; li < locData.length; li++) {
                        var ln = locData[li].submitted_by || 'anonymous';
                        if (ln.toLowerCase() === 'huko') continue;
                        if (!contributors[ln]) contributors[ln] = { name: ln, total: 0, eqdb: 0, personal: 0, locs: 0 };
                        contributors[ln].locs = (contributors[ln].locs || 0) + 1;
                    }
                }
                var sorted = Object.values(contributors).sort(function(a, b) {
                    var aCombined = a.total + (a.locs || 0);
                    var bCombined = b.total + (b.locs || 0);
                    return bCombined - aCombined;
                });
                if (sorted.length === 0) { el.textContent = 'No other contributors yet.'; return; }
                var html = '';
                var medals = ['🥇', '🥈', '🥉'];
                for (var j = 0; j < sorted.length; j++) {
                    var c = sorted[j];
                    var rank = j < 3 ? medals[j] : (j + 1);
                    html += '<div style="margin:2px 0;">'
                        + '<span style="min-width:24px;display:inline-block;">' + rank + '</span> '
                        + '<strong style="color:#aaa;">' + escapeHtml(c.name) + '</strong> — '
                        + (c.total + (c.locs || 0)) + ' total'
                        + ' <span style="color:#44aa44;">' + c.eqdb + ' EQDB</span>'
                        + ' <span style="color:#ffaa00;">' + c.personal + ' personal</span>'
                        + (c.locs ? ' <span style="color:#8787FF;">' + c.locs + ' item locs</span>' : '')
                        + '</div>';
                }
                el.innerHTML = html;
            } catch(e) {
                console.error('MiniLB error:', e);
                el.innerHTML = 'Error: ' + e.message;
            }
        }

        loadSidebar();
        loadMiniLeaderboard();

        // ============================================
        // AFFECT TAG MANAGEMENT
        // ============================================
        var activeAffects = [];
        window.removeAffectTag = function(val) { activeAffects = activeAffects.filter(function(a) { return a !== val; }); renderAffectTags(); };

        function addAffectTag(val) {
            val = val.trim().toLowerCase();
            if (!val || activeAffects.indexOf(val) >= 0) return;
            activeAffects.push(val);
            renderAffectTags();
        }

        function removeAffectTag(val) {
            activeAffects = activeAffects.filter(function(a) { return a !== val; });
            renderAffectTags();
        }

        function renderAffectTags() {
            var container = document.getElementById('affect-tags');
            var html = '';
            for (var i = 0; i < activeAffects.length; i++) {
                var a = activeAffects[i];
                html += '<span style="background:#4a4a7a;color:#ccc;padding:2px 6px;border-radius:3px;font-size:12px;display:inline-flex;align-items:center;gap:4px;">'
                    + escapeHtml(a)
                    + '<span data-affect="' + escapeHtml(a) + '" class="rm-tag" style="cursor:pointer;color:#aaa;font-weight:bold;padding-left:3px;">&times;</span>'
                    + '</span>';
            }
            container.innerHTML = html;
            // wire up remove buttons
            container.querySelectorAll('.rm-tag').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    removeAffectTag(this.getAttribute('data-affect'));
                });
            });
        }

        document.getElementById('filter-affect').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addAffectTag(this.value);
                this.value = '';
            } else if (e.key === 'Backspace' && this.value === '' && activeAffects.length > 0) {
                removeAffectTag(activeAffects[activeAffects.length - 1]);
            }
        });

        // Also add tag when user picks from datalist
        document.getElementById('filter-affect').addEventListener('change', function() {
            if (affectList.indexOf(this.value) >= 0) {
                addAffectTag(this.value);
                this.value = '';
            }
        });

        // ============================================
        // TOOLTIP EVENT DELEGATION
        // ============================================
        var resultsEl = document.getElementById('results');
        resultsEl.addEventListener('mouseenter', handleItemHover, true);
        resultsEl.addEventListener('mouseleave', function(e) {
            if (e.target.closest('.item-card')) hideTooltip();
        }, true);
        resultsEl.addEventListener('mousemove', moveTooltip, true);

        if (restoreSearchState()) {
            var lastSearch = JSON.parse(sessionStorage.getItem('eqdb_search')).lastSearch;
            if (lastSearch === 'mobs') {
                searchMobs();
            } else {
                searchEquipment();
            }
        }
    