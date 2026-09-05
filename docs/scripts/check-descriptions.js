#!/usr/bin/env node
/**
 * Fails the build when a page ships a meta description that Docusaurus derived from
 * source instead of front matter. Docusaurus falls back to the first line of the MDX
 * body when `description:` is missing, which has produced live descriptions reading
 * "return (", "<img" and "Learn". Run against build/ after `docusaurus build`.
 */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "..", "build");
const MIN_LENGTH = 50;
const JUNK = /^(<|return\b|import\b|const\b|export\b|\{|\/\/)/;

function htmlFiles(dir, found = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            htmlFiles(full, found);
        } else if (entry.name.endsWith(".html")) {
            found.push(full);
        }
    }
    return found;
}

function description(html) {
    const match = /<meta[^>]*\bname="description"[^>]*\bcontent="([^"]*)"/.exec(html);
    return match ? match[1] : null;
}

function main() {
    if (!fs.existsSync(BUILD_DIR)) {
        console.error(`No build directory at ${BUILD_DIR} - run docusaurus build first.`);
        process.exit(1);
    }
    const failures = [];
    for (const file of htmlFiles(BUILD_DIR)) {
        const route = "/" + path.relative(BUILD_DIR, file).replace(/index\.html$/, "").replace(/\.html$/, "");
        const html = fs.readFileSync(file, "utf8");
        if (/name="robots"[^>]*content="noindex/.test(html)) continue;
        if (route === "/404" || route === "/404.html") continue;
        const desc = description(html);
        if (desc === null) {
            failures.push([route, "no meta description"]);
        } else if (JUNK.test(desc)) {
            failures.push([route, `derived from source: ${JSON.stringify(desc.slice(0, 60))}`]);
        } else if (desc.length < MIN_LENGTH) {
            failures.push([route, `${desc.length} chars: ${JSON.stringify(desc)}`]);
        }
    }
    if (failures.length > 0) {
        console.error(`\n${failures.length} page(s) ship a bad meta description. Add "description:" front matter:\n`);
        for (const [route, why] of failures) {
            console.error(`  ${route}\n      ${why}`);
        }
        process.exit(1);
    }
    console.log("All indexable pages carry an authored meta description.");
}

main();
