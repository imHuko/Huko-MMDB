MM Gear Capture — casino sound slots
====================================

The two machines on casino.html play a synthesised sound for every event, so
they are never silent. Record a file with one of the names below, drop it in
this folder, and it replaces the synth on the next page load. You can record
them one at a time: anything still missing just keeps the placeholder.

STATUS: everything except bad-streak.mp3 is here, converted from the memos in
Documents\Sound Recordings (dead air trimmed off both ends, mono, 112 kbps).
That one is still the synthesised placeholder until it is recorded.

Format: mono MP3, 96-128 kbps, 44.1 kHz, each file ideally under ~100 KB.
Trim the silence off both ends or the effects feel late.

FILES
  spin.mp3        lever pull / whoosh            (every spin, both machines)
  stop.mp3        one reel landing                (fires 3x classic, 5x dragon,
                                                   pitched slightly per reel,
                                                   so a short dry "thunk" works)
  tease.mp3       anticipation blip               (looped every ~0.2s while a
                                                   reel is held; keep it short)
  gasp.mp3        two gold bags in view           (dragon scatter tease)
  win-small.mp3   any small win
  win-big.mp3     triple in the classic, or a 25x+ win on the dragon
  jackpot.mp3     progressive jackpot             (classic, max bet only)
  free.mp3        free spins awarded              (dragon)
  near-miss.mp3   "so close"                      (grid held three of a kind,
                                                   but not from the far-left
                                                   reel, so it paid nothing)
  lose.mp3        no win                          (only about 1 empty spin in 4,
                                                   and skipped during auto runs)
  bad-streak.mp3  five losses in a row            (fires again at 10, 15, ...;
                                                   anything wins resets the count)
  click.mp3       buttons, bet changes, machine tabs

NOTES
  - Volume: the page has a mute toggle and a volume slider, and remembers both.
  - Auto runs thin the effects out, so a 100-spin run is not a drum solo.
  - Missing files show as a 404 in the browser console once per page load
    until you add them; nothing breaks.
  - Do not sample a real slot machine. Your own voice is the point.
