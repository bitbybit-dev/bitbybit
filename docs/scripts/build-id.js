/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/**
 * Writes static/build-id.json: the identity of the site build, shown in the footer and served
 * at /build-id.json so a deployment can be told apart from the previous one.
 *
 *   { "buildId": "<short commit>.<yyyymmdd>", "version": "<package.json version>" }
 *
 * BUILD_ID in the environment wins, so a deploy pipeline can hand the same identity to every
 * artifact of one run; otherwise it is derived from this repository's HEAD. No dirty marker:
 * the build regenerates tracked API pages before this runs, so the tree is never clean here.
 *
 * Run this script as part of the build process:
 * node scripts/build-id.js
 */

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
