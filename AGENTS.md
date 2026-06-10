# MM Gear Capture — Plugin Update System

## Architecture
- `mmgearcap.xml` (plugin) tries 5 methods to fetch remote XML, in order:
  1. **Custom llthreads2 thread** with `protocol = "tlsv1_2"` (self-contained, no async.lua dependency)
  2. `async.request()` from `async.lua` (stock, works for HTTP)
  3. `ssl.https.request()` direct (with TLS 1.2 via table URL)
  4. MSXML (Windows COM XMLHTTP)
  5. `socket.http` (plain TCP, no SSL)
- The custom thread spawns an `llthreads2` thread, loads `ssl.https`, uses `protocol = "tlsv1_2"` to bypass LuaSec's TLS 1.0 default

## Critical Discoveries

### llthreads2:join() return layout
`thread:join()` returns `(success_bool, return_value, nil, nil, ...)`.
- **`r1`** (2nd return) = the thread function's first return value
- When thread returns a table, access it as `r1`

### TLS 1.2 required
LuaSec 0.5 (`ssl/https.lua`) defaults to `protocol = "tlsv1"` (TLS 1.0). Modern servers (GitHub, etc.) reject this.

**Fix**: Pass `protocol = "tlsv1_2"` in the URL table:
```lua
https.request({
    url = "https://...",
    sink = ltn12.sink.table(result_table),
    protocol = "tlsv1_2",
})
```

### String vs Table URL for ssl.https.request
- **String URL**: calls `urlstring_totable()` → minimal table with only `url`, `method`, `sink` — no way to pass extra params
- **Table URL**: passed directly to `tcp()` as `params`, so extra fields (`protocol`, `options`, `verify`) override defaults

### ssl.https blocks `url.create` and `url.redirect`
In `ssl.https.lua:126-129`:
```lua
elseif url.redirect then return nil, "redirect not supported"
elseif url.create then return nil, "create function not permitted"
```
These checks run **before** `url.create = tcp(url)`. The URL table must NOT have `create` or `redirect` fields.

### URL fallback order in fetchUrl
1. `GITHUB_URL` — `https://raw.githubusercontent.com/...` → 200 (works with TLS 1.2)
2. `UPDATE_URL` — `https://hukodb.com/...`
3. `GITHUB_API_URL` — `https://api.github.com/repos/.../contents/...?ref=master`

### GitHub API JSON decoding
`/contents/` endpoint returns `{content: "<base64>", encoding: "base64", ...}`. Decode with `mime.unb64()` or pure Lua `base64_decode()`.

## async.lua reverted to stock
Plugin is **self-contained** — doesn't need modified async.lua. The local async.lua was reverted so other plugins (`plugins_updater_v2`) still work.

## Testing
- `mcg debug` — toggle verbose logging
- `mcg update` — check for plugin update
