#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BUILT = path.resolve(__dirname, "..", "build", "pagefind");
const KEPT = path.resolve(__dirname, "..", ".search-index", "pagefind");

if (!fs.existsSync(BUILT)) {
    console.error(`No search index at ${BUILT} - run pagefind after docusaurus build.`);
    process.exit(1);
}
fs.rmSync(KEPT, { recursive: true, force: true });
fs.cpSync(BUILT, KEPT, { recursive: true });
console.log(`Kept the search index for npm start in ${path.relative(path.resolve(__dirname, ".."), KEPT)}.`);
