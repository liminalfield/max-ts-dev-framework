import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const sourceDir = path.resolve("src");
const outDir = path.resolve("dist");
const HASH_FILE = '.build-hashes.json';

function ensureDistExists() {
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
        console.log("Created dist/ directory.");
    }
}

function getAllTsFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(getAllTsFiles(fullPath));
        } else if (file.endsWith(".ts")) {
            results.push(fullPath);
        }
    }

    return results;
}

function getBuildMode(filePath) {
    const contents = fs.readFileSync(filePath, "utf-8");

    if (/\/\/\s*@build\s+ignore/i.test(contents)) return "ignore";
    if (/\/\/\s*@build\s+bundle/i.test(contents)) return "bundle";
    if (/\/\/\s*@build\s+simple/i.test(contents)) return "simple";

    return "simple"; // default if no directive found
}

function getFileHash(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('md5').update(content).digest('hex');
}

function loadStoredHashes() {
    if (!fs.existsSync(HASH_FILE)) return {};
    return JSON.parse(fs.readFileSync(HASH_FILE, 'utf8'));
}

function saveStoredHashes(hashes) {
    fs.writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2));
}

function getDependencies(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const dependencies = [];
    const dir = path.dirname(filePath);
    
    // Simple regex to find import statements
    const importRegex = /import.*?from\s+['"](.+?)['"];?/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Resolve relative imports
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            let resolvedPath = path.resolve(dir, importPath);
            
            // Try adding .ts extension if file doesn't exist
            if (!fs.existsSync(resolvedPath) && !resolvedPath.endsWith('.ts')) {
                resolvedPath = resolvedPath + '.ts';
            }
            
            if (fs.existsSync(resolvedPath)) {
                dependencies.push(resolvedPath);
                // Recursively get dependencies of dependencies
                dependencies.push(...getDependencies(resolvedPath));
            }
        }
    }
    
    return [...new Set(dependencies)]; // Remove duplicates
}

function shouldRebuild(sourceFile, buildMode) {
    const storedHashes = loadStoredHashes();
    const currentHash = getFileHash(sourceFile);
    const storedHash = storedHashes[sourceFile];
    
    let hasChanged = false;
    
    // Check if the source file itself has changed
    if (currentHash !== storedHash) {
        hasChanged = true;
    }
    
    // For bundled files, also check dependencies
    if (buildMode === "bundle") {
        const dependencies = getDependencies(sourceFile);
        
        for (const depPath of dependencies) {
            const depCurrentHash = getFileHash(depPath);
            const depStoredHash = storedHashes[depPath];
            
            if (depCurrentHash !== depStoredHash) {
                hasChanged = true;
                break; // No need to check further
            }
        }
    }
    
    return hasChanged;
}

function updateHashes(sourceFile, buildMode) {
    const storedHashes = loadStoredHashes();
    const currentHash = getFileHash(sourceFile);
    
    // Update source file hash
    storedHashes[sourceFile] = currentHash;
    
    // For bundled files, also update dependency hashes
    if (buildMode === "bundle") {
        const dependencies = getDependencies(sourceFile);
        
        for (const depPath of dependencies) {
            const depCurrentHash = getFileHash(depPath);
            storedHashes[depPath] = depCurrentHash;
        }
    }
    
    saveStoredHashes(storedHashes);
}

async function buildAll() {
    const files = getAllTsFiles(sourceDir);

    for (const entry of files) {
        const relativePath = path.relative(sourceDir, entry);
        const outFile = path.join(outDir, relativePath.replace(/\.ts$/, ".js"));
        const buildMode = getBuildMode(entry);

        if (buildMode === "ignore") {
            console.log(`Skipping ${relativePath} due to "@build ignore"`);
            continue;
        }

        // Check if file needs rebuilding
        if (!shouldRebuild(entry, buildMode)) {
            console.log(`${relativePath} unchanged - skipping build`);
            continue;
        }

        console.log(`${relativePath} changed - rebuilding`);

        const shouldBundle = buildMode === "bundle";
        fs.mkdirSync(path.dirname(outFile), { recursive: true });

        const format = shouldBundle ? "iife" : "cjs";

        await esbuild.build({
            entryPoints: [entry],
            bundle: shouldBundle,
            format,
            platform: "browser",
            target: ["es6"],
            outfile: outFile,
            banner: {},
            logLevel: "error"
        });

        // Add timestamp to rebuilt file
        prependBuildTimestamp(outFile);
        
        // Update hashes after successful build
        updateHashes(entry, buildMode);
    }

    console.log("Build completed.");
}

function prependBuildTimestamp(filePath) {
    const now = new Date();
    const timestamp = `// Built: ${now.toLocaleString()}\n`;
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, timestamp + content, 'utf8');
}

ensureDistExists();
buildAll().catch(err => {
    console.error("Bundling failed:", err);
    process.exit(1);
});
