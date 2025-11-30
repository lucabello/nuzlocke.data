#!/bin/bash

DIR1="../nuzlocke.app/static/api/league"
DIR2="../nuzlocke.data/final"
OUTDIR="validation-results"

mkdir -p "$OUTDIR"

for f in "$DIR1"/*; do
    fname=$(basename "$f")
    if [ -f "$DIR2/$fname" ]; then
        echo "Validating: $fname"
        node validate.js "$f" "$DIR2/$fname" > "$OUTDIR/${fname%.json}.txt" 2>&1
    else
        echo "No match for $f in $DIR2"
    fi
done
