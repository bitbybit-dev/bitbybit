/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/**
 * Script to generate llms.txt from llms.template.txt
 * Replaces {{VERSION}} placeholders with the version from package.json
 * 
 * Run this script as part of the build process:
 * node scripts/generate-llms.js
 */

const fs = require("fs");
const path = require("path");

const packageJson = require("../package.json");
const version = packageJson.version;

const templatePath = path.join(__dirname, "../static/llms.template.txt");
const outputPath = path.join(__dirname, "../static/llms.txt");

console.log(`Generating llms.txt with version: ${version}`);

try {
    const template = fs.readFileSync(templatePath, "utf8");
    const output = template.replace(/\{\{VERSION\}\}/g, version);
    fs.writeFileSync(outputPath, output, "utf8");
    console.log("Successfully generated llms.txt");
} catch (error) {
    console.error("Error generating llms.txt:", error);
    process.exit(1);
}
