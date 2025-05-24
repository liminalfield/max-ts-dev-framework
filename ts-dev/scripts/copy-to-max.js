import { mkdirSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fg from 'fast-glob';

// Simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define your base paths
const srcBase = resolve(__dirname, '../dist');
const destBase = resolve(__dirname, '../../max-project/code');

// Explicitly named top-level files
const manualFiles = ['helloWorld.js'];

// Globbed files from commands/
const globbedFiles = fg.sync('commands/*.js', { cwd: srcBase });

// Combine both
const filesToCopy = [...manualFiles, ...globbedFiles];

// Copy each file
for (const relativePath of filesToCopy) {
    const src = resolve(srcBase, relativePath);
    const dest = resolve(destBase, relativePath);

    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);

    console.log(`Copied ${relativePath} → ${dest}`);
}
