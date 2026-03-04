#!/usr/bin/env bash
# Generate favicon sizes from public/placeholder-logo.png using ImageMagick
# Usage: chmod +x scripts/generate-favicons.sh && ./scripts/generate-favicons.sh

set -euo pipefail
SRC="public/placeholder-logo.png"
OUT_DIR="public/favicons"

if [ ! -f "$SRC" ]; then
  echo "Source image $SRC not found. Place your image at $SRC and re-run this script." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# Sizes to generate
sizes=(16 32 48 64 96 128 192 256 512 180)
for s in "${sizes[@]}"; do
  out="$OUT_DIR/favicon-${s}x${s}.png"
  echo "Generating $out"
  convert "$SRC" -resize ${s}x${s} -background none -gravity center -extent ${s}x${s} "$out"
done

# Create favicon.ico (multiple sizes)
echo "Generating $OUT_DIR/favicon.ico"
convert "$OUT_DIR/favicon-16x16.png" "$OUT_DIR/favicon-32x32.png" "$OUT_DIR/favicon-48x48.png" "$OUT_DIR/favicon-64x64.png" "$OUT_DIR/favicon.ico"

echo "Favicons generated in $OUT_DIR"
