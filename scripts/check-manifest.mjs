import { existsSync, readFileSync } from 'node:fs';

// Package manifest
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
// Required fields
const required = ['name', 'version', 'description', 'license', 'exports', 'files', 'engines', 'dsh'];
// Missing fields
const missing = required.filter((key) => !(key in pkg));

if (missing.length > 0) {
  console.error(`Missing package.json fields: ${missing.join(', ')}`);
  process.exit(1);
}

// Bundle patch path
const patch = pkg.dsh?.bundle?.patch;
if (!patch || !existsSync(patch)) {
  console.error('dsh.bundle.patch is missing or does not point to a file');
  process.exit(1);
}

// Client platform
if (pkg.dsh?.client?.platform !== 'web') {
  console.error('dsh.client.platform must be web');
  process.exit(1);
}

console.log('Manifest OK');
