#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "..", "build");
const ENTRY = path.join(BUILD_DIR, "pagefind", "pagefind-entry.json");
const BODY = /\bdata-pagefind-body\b/;
const SECTION_FILTER = /\bdata-pagefind-filter="section:[^"]+"/;
const DOC_CONTENT = /\btheme-doc-markdown\b/;
const BLOG_POST_PAGE = /\bblog-post-page\b/;

function htmlFiles(dir, found = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== "pagefind") {
                htmlFiles(full, found);
            }
        } else if (entry.name.endsWith(".html")) {
            found.push(full);
        }
    }
    return found;
}

function main() {
    if (!fs.existsSync(ENTRY)) {
        console.error(`No search index at ${ENTRY} - run npm run index-search after docusaurus build.`);
        process.exit(1);
    }
    const indexed = Object.values(JSON.parse(fs.readFileSync(ENTRY, "utf8")).languages).reduce((sum, language) => sum + language.page_count, 0);
    const marked = [];
    const unmarked = [];
    const unfiltered = [];
    for (const file of htmlFiles(BUILD_DIR)) {
        const html = fs.readFileSync(file, "utf8");
        const route = "/" + path.relative(BUILD_DIR, file).replace(/index\.html$/, "").replace(/\.html$/, "");
        if (BODY.test(html)) {
            marked.push(route);
            if (!SECTION_FILTER.test(html)) {
                unfiltered.push(route);
            }
        } else if (DOC_CONTENT.test(html) || BLOG_POST_PAGE.test(html)) {
            unmarked.push(route);
        }
    }
    const failures = [];
    if (unmarked.length > 0) {
        failures.push(`${unmarked.length} page(s) with docs or blog content are not marked for the search index:\n${unmarked.map((route) => `  ${route}`).join("\n")}`);
    }
    if (unfiltered.length > 0) {
        failures.push(`${unfiltered.length} page(s) in the search index have no section:\n${unfiltered.map((route) => `  ${route}`).join("\n")}`);
    }
    if (indexed !== marked.length) {
        failures.push(`the search index holds ${indexed} page(s), but ${marked.length} are marked for it`);
    }
    if (failures.length > 0) {
        console.error(failures.join("\n\n"));
        process.exit(1);
    }
    console.log(`Search index: ${indexed} pages, each with its section.`);
}

main();
