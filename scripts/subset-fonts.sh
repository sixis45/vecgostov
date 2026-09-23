#!/usr/bin/env bash
# Rebuilds the self-hosted font files in src/assets/fonts/.
# Only needed if you want different weights or characters.
# Requires: pip install fonttools brotli
set -euo pipefail
cd "$(dirname "$0")/.."
TMP="$(mktemp -d)"
BASE=https://raw.githubusercontent.com/google/fonts/main/ofl
curl -sSfL -o "$TMP/fr.ttf"  "$BASE/fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf"
curl -sSfL -o "$TMP/fri.ttf" "$BASE/fraunces/Fraunces-Italic%5BSOFT,WONK,opsz,wght%5D.ttf"
curl -sSfL -o "$TMP/fig.ttf" "$BASE/figtree/Figtree%5Bwght%5D.ttf"

# Latin + Latin-1 + Latin Extended-A: covers Slovenian (č š ž), German and Italian.
U="U+0020-007E,U+00A0-00FF,U+0100-017F,U+0218-021B,U+02C6,U+02DA,U+02DC,U+2010-2027,U+2030-203A,U+2044,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD"

# Fraunces: soft corners on, "wonky" letters off, optical size fixed for headings.
fonttools varLib.instancer "$TMP/fr.ttf"  SOFT=100 WONK=0 opsz=60 wght=300:600 -o "$TMP/fr-i.ttf" -q
fonttools varLib.instancer "$TMP/fri.ttf" SOFT=100 WONK=0 opsz=60 wght=400     -o "$TMP/fri-i.ttf" -q

FEAT='kern,liga,calt,ccmp,locl,mark,mkmk,lnum,pnum,tnum'
pyftsubset "$TMP/fr-i.ttf"  --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 --output-file=src/assets/fonts/fraunces-soft.woff2
pyftsubset "$TMP/fri-i.ttf" --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 --output-file=src/assets/fonts/fraunces-soft-italic.woff2
pyftsubset "$TMP/fig.ttf"   --unicodes="$U" --layout-features="$FEAT" --flavor=woff2 --output-file=src/assets/fonts/figtree.woff2
rm -rf "$TMP"
ls -la src/assets/fonts/*.woff2
