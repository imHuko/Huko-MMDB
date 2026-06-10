# MM Gear Capture — Plugin Update System

## Architecture
- `mmgearcap.xml` (plugin) calls `async.request(url, "HTTPS")` in `async.lua` to fetch remote XML
- `async.lua` spawns an `llthreads2` thread that loads `ssl.https` and makes the HTTPS request
- The thread returns a Lua table `{ok, body, status, headers, full_status}` via `llthreads2:join()`

## Critical Discoveries

### llthreads2:join() return layout
`thread:join()` returns `(success_bool, return_value, nil, nil, ...)`.
- **`r1`** (2nd return) = the thread function's first return value
- Not `r3` (4th return) as initially assumed

### TLS 1.2 required
LuaSec 0.5 (`C:\Mushclients\Huko\lua\ssl\https.lua`) defaults to `protocol = "tlsv1"` (TLS 1.0). Modern servers (GitHub, hukodb.com) reject this with `"tlsv1 alert protocol version"`.

**Fix**: Pass `protocol = "tlsv1_2"` in the URL table when calling `ssl.https.request()`:
```lua
local params = {
    url = "https://...",
    sink = ltn12.sink.table(result_table),
    protocol = "tlsv1_2",  -- overrides cfg default
}
ssl.https.request(params)
```

### String vs Table URL for ssl.https.request
- **String URL**: calls `urlstring_totable()` which creates a minimal URL table with only `url`, `method`, `sink` — **no way to pass extra params**
- **Table URL**: the table is passed directly to `tcp()` as `params`, so any extra fields (`protocol`, `options`, `verify`) override the `cfg` defaults

### ssl.https.request blocks `url.create` and `url.redirect`
In `ssl.https.lua:126-129`:
```lua
elseif url.redirect then
    return nil, "redirect not supported"
elseif url.create then
    return nil, "create function not permitted"
end
```
These checks happen **before** `url.create = tcp(url)` is set. The URL table must NOT have `create` or `redirect` fields.

`ssl.https` adds its own `create` function after the checks pass, then passes the table to `socket.http.request()`.

### Redirect following
- `socket.http` has redirect-following at line 253 of `http.lua` but needs the SSL `create` function
- `ssl.https` blocks `url.redirect` so redirect following can't work through `ssl.https`
- To follow redirects, you'd need to parse `Location` header from `headers` table (3rd return) and make new requests

### URL fallback order in fetchUrl
1. `GITHUB_URL` — `https://raw.githubusercontent.com/...` → redirects (301)
2. `UPDATE_URL` — `https://hukodb.com/...` → also redirects (301)
3. `GITHUB_API_URL` — `https://api.github.com/repos/.../contents/...?ref=master` → works (200, JSON with base64 content)

### GitHub API JSON decoding
The `/contents/` endpoint returns `{content: "<base64>", encoding: "base64", ...}`. Decode with `mime.unb64()` or pure Lua `base64_decode()`.

## async.lua reverted to stock
The plugin is now **self-contained** — does not need a modified `async.lua`. It creates its own `llthreads2` thread with `protocol = "tlsv1_2"` directly. `async.lua` on the user's machine has been reverted to the original (stock) version so other plugins (`plugins_updater_v2`) continue to work.

## Testing
- `mcg debug` — toggles verbose debug logging
- `mcg update` — checks for plugin update
- After modifying `async.lua`, must run `lua package.loaded.async = nil` or restart MUSHclient
