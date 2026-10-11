const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const packageJson = require("../package.json");

function deriveBuildId() {
    if (process.env.BUILD_ID) {
        return process.env.BUILD_ID;
    }
    try {
        const sha = execFileSync("git", ["rev-parse", "--short=10", "HEAD"], { cwd: __dirname, encoding: "utf8" }).trim();
        const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        return `${sha}.${day}`;
    } catch {
        return "dev";
    }
}

const outputPath = path.join(__dirname, "../static/build-id.json");
const buildId = deriveBuildId();

fs.writeFileSync(outputPath, JSON.stringify({ buildId, version: packageJson.version }) + "\n", "utf8");
console.log(`Wrote build-id.json: ${buildId} (v${packageJson.version})`);
