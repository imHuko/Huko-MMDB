#!/usr/bin/env bash
# Trim the dead air off each voice memo, normalise its peak, and encode a mono
# MP3 under the slot name the page asks for. Scratch tool: nothing here ships.
# Needs a local ffmpeg, which this machine does not have:
#   cd .tmp-check/ffmpeg && npm i ffmpeg-static
# then point FF at node_modules/ffmpeg-static/ffmpeg.exe below.
set -uo pipefail

FF=".tmp-check/ffmpeg/node_modules/ffmpeg-static/ffmpeg.exe"
SRC="/c/Users/Administrator/Documents/Sound Recordings"
OUT="audio"
mkdir -p "$OUT"

slot_of() {
  case "$(printf '%s' "$1" | tr 'A-Z' 'a-z')" in
    "spin pressed")             echo "spin" ;;
    "each classic reel lands")  echo "stop" ;;
    "each of 5 dragon reels")   echo "stop-dragon" ;;
    "anticipation")             echo "tease" ;;
    "two bags in view")         echo "gasp" ;;
    "small win")                echo "win-small" ;;
    "big triple win")           echo "win-big" ;;
    "jackpot")                  echo "jackpot" ;;
    "free spins awarded")       echo "free" ;;
    "near miss")                echo "near-miss" ;;
    "no win")                   echo "lose" ;;
    "bet change auto toggle")   echo "click" ;;
    *)                          echo "" ;;
  esac
}

dur() {
  "$FF" -hide_banner -i "$1" 2>&1 | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | head -1
}

# Head trim, then reverse/trim/reverse for the tail: a plain stop_periods=1
# stops at the first breath mid-recording and eats the rest of the take.
TRIM="silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse,silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse"

printf '%-26s %-12s %-10s %-10s %s\n' FILE SLOT IN OUT SIZE
for f in "$SRC"/*.m4a; do
  base="$(basename "$f" .m4a)"
  slot="$(slot_of "$base")"
  if [ -z "$slot" ]; then printf '%-26s %s\n' "$base" "SKIP - no slot"; continue; fi

  peak="$("$FF" -hide_banner -nostats -i "$f" -af "$TRIM,volumedetect" -f null - 2>&1 \
          | sed -n 's/.*max_volume: \(.*\) dB/\1/p' | tail -1)"
  if [ -z "$peak" ]; then printf '%-26s %s\n' "$base" "SKIP - could not measure"; continue; fi
  gain="$(awk -v p="$peak" 'BEGIN { if (p == "-inf") print "0.0"; else printf "%.1f", -1.5 - p }')"
  din="$(dur "$f")"

  if ! "$FF" -y -hide_banner -loglevel error -i "$f" \
        -af "$TRIM,volume=${gain}dB" -ac 1 -ar 44100 -codec:a libmp3lame -b:a 112k \
        -map_metadata -1 "$OUT/$slot.mp3"; then
    printf '%-26s %s\n' "$base" "FAILED"
    continue
  fi
  dout="$(dur "$OUT/$slot.mp3")"
  size="$(du -h "$OUT/$slot.mp3" | cut -f1)"
  printf '%-26s %-12s %-10s %-10s %s\n' "$base" "$slot" "$din" "$dout" "$size"
done
