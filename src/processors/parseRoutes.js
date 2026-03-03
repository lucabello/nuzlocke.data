const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const inputDir = path.join(repoRoot, 'data', 'routes');
const appOutputFile = path.join(repoRoot, '..', 'nuzlocke.app', 'src', 'lib', 'data', 'routes.json');
const intermediateOutputFile = path.join(repoRoot, 'build', 'intermediate', 'routes.json');

// Master output object
const allData = {};

// Parse a single file
function parseFile(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  allData[fileName] = [];

  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);

  for (const line of lines) {
    if (line.startsWith('#')) {
        continue;
    } else if (line.startsWith('--')) {
      const cleaned = line.replace(/^--/, '');
      const [name, value, group, boss] = cleaned.split('|');

      allData[fileName].push({
        type: "gym",
        name,
        value,
        group,
        boss
      });
    } else {
      const [name, rawEncounters] = line.split('|');
      const encounters = (rawEncounters && rawEncounters != "undefined") ? rawEncounters
        ?.split(',')
        ?.map(e => e.trim())
        ?.filter(e => e.length > 0) : [];

      allData[fileName].push({
        type: "route",
        name,
        ...(encounters && encounters.length > 0 ? {encounters: encounters} : {})
      });
    }
  }
}

// 1. Scan directory for all files
const files = fs.readdirSync(inputDir);

// Parse each file
for (const file of files) {
  const filePath = path.join(inputDir, file);

  parseFile(filePath);
}
fs.mkdirSync(path.dirname(intermediateOutputFile), { recursive: true });
fs.writeFileSync(intermediateOutputFile, JSON.stringify(allData, null, 2), 'utf8');

fs.mkdirSync(path.dirname(appOutputFile), { recursive: true });
fs.writeFileSync(appOutputFile, JSON.stringify(allData, null, 2), 'utf8');

console.log(`Done! Output written to ${intermediateOutputFile} and ${appOutputFile}`);
