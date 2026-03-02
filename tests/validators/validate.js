const fs = require('fs');
const path = require('path');

// Deep comparison function that ignores key order
const isEqual = (key, a, b) => {
    if (key == 'sprite') return true;

    if (a === b) return true;
    if (typeof a !== typeof b) {
        try {
            return parseInt(a) == parseInt(b);
        }
        catch (e) {
            return false;
        }
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((val, i) => isEqual(val, b[i]));
    }

    if (typeof a === 'object' && typeof b === 'object') {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;
        return aKeys.every(k => b.hasOwnProperty(k) && isEqual(a[k], b[k]));
    }

    return false;
};

const diffObjects = (a, b, path = '') => {
    const differences = [];
    const excludeDiffs = ["effect", "evs", "author", "link"];

    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;

        if (excludeDiffs.some(x => newPath.endsWith(x))) {
            continue;
        }

        if (!(key in a)) {
            differences.push(`Missing key in first file:\t${newPath}; Expected Value: ${JSON.stringify(b[key])}`);
        } else if (!(key in b)) {
            differences.push(`Missing key in second file:\t${newPath}; Expected Value: ${JSON.stringify(a[key])}`);
        } else if (!isEqual(key, a[key], b[key])) {
            if (
                typeof a[key] === 'object' &&
                typeof b[key] === 'object' &&
                a[key] !== null &&
                b[key] !== null
            ) {
                differences.push(...diffObjects(a[key], b[key], newPath));
            } else {
                differences.push(`Difference at ${newPath}:\n  First: ${JSON.stringify(a[key])}\n  Second: ${JSON.stringify(b[key])}`);
            }
        }
    }

    return differences;
};

const fileA = process.argv[2];
const fileB = process.argv[3];

if (!fileA || !fileB) {
    console.error('Usage: node compareJson.js [file1.json] [file2.json]');
    process.exit(1);
}

console.log(`First File: ${fileA}`);
console.log(`Second File: ${fileB}`);

const jsonA = JSON.parse(fs.readFileSync(path.resolve(fileA), 'utf-8'));
const jsonB = JSON.parse(fs.readFileSync(path.resolve(fileB), 'utf-8'));

const diffs = diffObjects(jsonA, jsonB);

if (diffs.length > 0) {
    console.warn(`Differences found (${diffs.length}):\n`);
    for (const diff of diffs) {
        console.warn(diff);
    }
}
