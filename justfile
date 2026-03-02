# justfile for nuzlocke.data
# Requires: just (optional). If you don't have just, run commands directly as shown in the README.

# Default target
[private]
@default:
	just --list
	echo ""
	echo "For help with a specific recipe, run: just --usage <recipe>"

[group("generate")]
generate:
	@echo "Generating patches.json and enriched league data"
	node parsePatch.js && node parseLeague.js

[group("generate")]
generate-patches:
	@echo "Generating patches.json"
	node parsePatch.js

[group("generate")]
generate-leagues:
	@echo "Generating league JSON"
	node parseLeague.js

# parseRoutes.js uses ESM imports; the dynamic-import wrapper below will attempt to load it cross-platform
[group("generate")]
generate-routes:
	@echo "Generating routes.json (using dynamic import to support ESM)"
	node -e "import('./parseRoutes.js').catch(e => { console.error(e); process.exit(1) })"

[group("dev")]
validate:
	@echo "Running validator.sh"
	bash validator.sh

[group("dev")]
clean:
	@echo "Cleaning generated artifacts (patches.json, league.json, final/, validation-results/)"
	rm -f patches.json league.json
	rm -rf final validation-results
