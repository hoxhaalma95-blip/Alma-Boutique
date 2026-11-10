#!/bin/bash
# ------------------------------------------------------------------
# Converts every .avif picture in "imagess" to .jpg (using macOS "sips"),
# fixes the names in your .html / .js / .css files, and keeps the
# original AVIF files in a folder called "avif-backup".
#
# How to use: put this file inside alma-site-2, open Terminal there and run:
#     bash convert-avif.sh
# ------------------------------------------------------------------
cd "$(dirname "$0")" || exit 1

if [ ! -d imagess ]; then
  echo "I can't find the folder 'imagess' here. Put this file inside alma-site-2."
  exit 1
fi

mkdir -p avif-backup
shopt -s nullglob nocaseglob
done_count=0
fail_count=0

for f in imagess/*.avif; do
  base=$(basename "$f")                      # e.g. newblazer2.jpg.avif
  stem="${base%.*}"                          # remove ".avif"  -> newblazer2.jpg
  case "$stem" in
    *.jpg|*.jpeg|*.png|*.webp) stem="${stem%.*}" ;;   # remove the old extension too
  esac
  new="$stem.jpg"                            # newblazer2.jpg

  if [ -e "imagess/$new" ]; then
    echo "SKIPPED (a file named $new already exists): $base"
    continue
  fi

  if sips -s format jpeg -s formatOptions 90 "$f" --out "imagess/$new" >/dev/null 2>&1 && [ -s "imagess/$new" ]; then
    mv "$f" avif-backup/
    # Replace the old name with the new one in the website files
    perl -pi -e 'BEGIN { $o = shift @ARGV; $n = shift @ARGV } s{(?<=/)\Q$o\E}{$n}g' "$base" "$new" *.html *.js *.css 2>/dev/null
    echo "OK       $base  ->  $new"
    done_count=$((done_count + 1))
  else
    rm -f "imagess/$new"
    echo "FAILED   $base (left unchanged)"
    fail_count=$((fail_count + 1))
  fi
done

echo
echo "Converted: $done_count   Failed: $fail_count"
echo "Originals are in the folder: avif-backup"
