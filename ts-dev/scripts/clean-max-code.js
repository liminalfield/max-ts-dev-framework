import fs from "fs";
import path from "path";

const codeDir = path.resolve("../max-project/code");

if (!fs.existsSync(codeDir)) {
    console.log(`Warning: code folder not found at ${codeDir}`);
    process.exit(0);
}

for (const entry of fs.readdirSync(codeDir)) {
    const fullPath = path.join(codeDir, entry);
    try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(fullPath);
        }
        console.log(`Deleted: ${entry}`);
    } catch (err) {
        console.error(`Failed to delete ${entry}: ${err.message}`);
    }
}