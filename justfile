[private]
@default:
	just --list
	echo ""
	echo "For help with a specific recipe, run: just --usage <recipe>"

[group("generate")]
generate:
	@echo "Generating patches.json and enriched league data"
	node src/processors/parsePatch.js && node src/processors/parseLeague.js

[group("generate")]
generate-patches:
	@echo "Generating patches.json"
	node src/processors/parsePatch.js

[group("generate")]
generate-leagues:
	@echo "Generating league JSON"
	node src/processors/parseLeague.js

[group("generate")]
generate-routes:
	@echo "Generating routes.json"
	node src/processors/parseRoutes.js

[group("dev")]
validate:
	@echo "Running validator"
	@DIR1="../nuzlocke.app/static/api/league"; DIR2="../nuzlocke.data/build/final"; OUTDIR="build/validation"; mkdir -p "$OUTDIR"; for f in "$DIR1"/*; do fname=$(basename "$f"); if [ -f "$DIR2/$fname" ]; then echo "Validating: $fname"; node tests/validators/validate.js "$f" "$DIR2/$fname" > "$OUTDIR/${fname%.json}.txt" 2>&1; else echo "No match for $f in $DIR2"; fi; done; node tests/validators/validateRoute.js "../nuzlocke.app/src/lib/data/routes.json" "build/intermediate/routes.json" > "$OUTDIR/validateRoute.txt" 2>&1

[group("dev")]
clean:
	@echo "Cleaning generated artifacts (build/intermediate, build/final, build/validation/)"
	@rm -f build/intermediate/patches.json build/intermediate/league.json
	@rm -rf build/final build/validation
