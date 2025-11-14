import fs from 'fs';

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value
      .map(v => canonicalize(v))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }

  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) {
      out[k] = canonicalize(value[k]);
    }
    return out;
  }

  return value;
}

function diffAll(a, b, path, diffs) {
  if (a === b) return;

  const typeA = Array.isArray(a) ? "array" : typeof a;
  const typeB = Array.isArray(b) ? "array" : typeof b;

  if (typeA !== typeB) {
    diffs.push(`${path}: Type mismatch (${typeA} vs ${typeB})`);
    return;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const aCanon = [...a].map(canonicalize).sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
    const bCanon = [...b].map(canonicalize).sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));

    if (aCanon.length !== bCanon.length) {
      diffs.push(`${path}: Array length mismatch (${aCanon.length} vs ${bCanon.length})`);
    }

    const max = Math.max(aCanon.length, bCanon.length);

    for (let i = 0; i < max; i++) {
      diffAll(aCanon[i], bCanon[i], `${path}[unordered ${i}]`, diffs);
    }

    return;
  }

  if (typeA === "object" && typeB === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    const allKeys = new Set([...keysA, ...keysB]);

    for (const key of allKeys) {
      if (!(key in a)) {
        diffs.push(`${path}: Missing key '${key}'`);
        continue;
      }
      if (!(key in b)) {
        diffs.push(`${path}: Extra key '${key}'`);
        continue;
      }

      diffAll(a[key], b[key], `${path}.${key}`, diffs);
    }
    return;
  }

  if (a !== b) {
    diffs.push(
      `${path}: Value mismatch (${JSON.stringify(a)} vs ${JSON.stringify(b)})`
    );
  }
}

const file1 = process.argv[2];
const file2 = process.argv[3];

if (!file1 || !file2) {
  console.error("Usage: node compareJsonAllDiffsUnorderedArrays.js file1.json file2.json");
  process.exit(1);
}

const json1 = canonicalize(JSON.parse(fs.readFileSync(file1, 'utf8')));
const json2 = canonicalize(JSON.parse(fs.readFileSync(file2, 'utf8')));

const diffs = [];
diffAll(json1, json2, "root", diffs);

if (diffs.length === 0) {
  console.log("FILES MATCH (no differences found)");
} else {
  console.log("DIFFERENCES FOUND:");
  diffs.forEach(d => console.log(" - " + d));
}
