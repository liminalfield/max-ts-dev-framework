import { execSync } from "child_process";

try {
    console.log("Compiling with tsconfig.json...");
    execSync("tsc -p tsconfig.json", { stdio: "inherit" });
    console.log("TypeScript build complete.");
} catch (err) {
    console.error("Build failed.");
    process.exit(1);
}
