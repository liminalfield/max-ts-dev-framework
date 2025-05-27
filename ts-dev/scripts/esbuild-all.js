import esbuild from "esbuild";
import fs from "fs";
import path from "path";

const sourceDir = path.resolve("src");
const outDir = path.resolve("dist");

function cleanDist() {
    if (fs.existsSync(outDir)) {
        fs.rmSync(outDir, { recursive: true, force: true });
        console.log("Cleaned dist/ directory.");
    }
    fs.mkdirSync(outDir);
    console.log("Created dist/ directory.");
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

        const shouldBundle = buildMode === "bundle";

        fs.mkdirSync(path.dirname(outFile), { recursive: true });

        console.log(`Building ${relativePath} → ${outFile} [mode: ${buildMode}]`);

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

    }

    console.log("All source files bundled successfully.");
}

cleanDist();
buildAll().catch(err => {
    console.error("Bundling failed:", err);
    process.exit(1);
});
