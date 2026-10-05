#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ALLOW_FILE = path.join(ROOT, "scripts", "advisories.allow.json");
const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".next", ".nuxt", ".output", ".angular", ".verify-logs", ".git", "coverage"]);
const RANK = { low: 0, moderate: 1, medium: 1, high: 2, critical: 3 };
const MAX_ADVISORY_PAGES = 25;

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const threshold = RANK[args.includes("--severity") ? args[args.indexOf("--severity") + 1] : "moderate"] ?? 1;
const explicit = args.filter((a) => !a.startsWith("--") && /lock/.test(a));

function parseVersion(v) {
    const [core, pre = ""] = String(v).replace(/^[v=]/, "").split("-");
    const nums = core.split(".").map((n) => Number.parseInt(n, 10) || 0);
    return { nums: [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0], pre: pre ? pre.split(".") : [] };
}

function compare(a, b) {
    const x = parseVersion(a), y = parseVersion(b);
    for (let i = 0; i < 3; i++) {
        if (x.nums[i] !== y.nums[i]) {
            return x.nums[i] < y.nums[i] ? -1 : 1;
        }
    }
    if (!x.pre.length && !y.pre.length) {
        return 0;
    }
    if (!x.pre.length) {
        return 1;
    }
    if (!y.pre.length) {
        return -1;
    }
    for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
        const p = x.pre[i], q = y.pre[i];
        if (p === undefined) {
            return -1;
        }
        if (q === undefined) {
            return 1;
        }
        const pn = /^\d+$/.test(p), qn = /^\d+$/.test(q);
        if (pn && qn) {
            if (Number(p) !== Number(q)) {
                return Number(p) < Number(q) ? -1 : 1;
            }
            continue;
        }
        if (pn !== qn) {
            return pn ? -1 : 1;
        }
        if (p !== q) {
            return p < q ? -1 : 1;
        }
    }
    return 0;
}

function satisfies(version, range) {
    return String(range).split(",").every((partRaw) => {
        const part = partRaw.trim();
        if (!part) {
            return true;
        }
        const m = part.match(/^(>=|<=|>|<|=)?\s*(.+)$/);
        if (!m) {
            return false;
        }
        const c = compare(version, m[2].trim());
        switch (m[1]) {
            case ">=": return c >= 0;
            case "<=": return c <= 0;
            case ">": return c > 0;
            case "<": return c < 0;
            default: return c === 0;
        }
    });
}

function fromNpmLock(file) {
    const found = [];
    const lock = JSON.parse(readFileSync(file, "utf8"));
    for (const [key, meta] of Object.entries(lock.packages ?? {})) {
        const at = key.lastIndexOf("node_modules/");
        if (at === -1 || !meta?.version) {
            continue;
        }
        found.push([key.slice(at + "node_modules/".length), meta.version]);
    }
    return found;
}

function fromPnpmLock(file) {
    const found = [];
    let inBlock = false;
    for (const line of readFileSync(file, "utf8").split("\n")) {
        if (/^(packages|snapshots):\s*$/.test(line)) { inBlock = true; continue; }
        if (/^\S/.test(line)) { inBlock = false; continue; }
        if (!inBlock) {
            continue;
        }
        const m = line.match(/^ {2}'?((?:@[^/]+\/)?[^@'\s]+)@([^'():\s]+)'?(?:\([^)]*\))*'?:\s*$/);
        if (m) {
            found.push([m[1], m[2]]);
        }
    }
    return found;
}

function discover(dir, out) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) {
                discover(path.join(dir, entry.name), out);
            }
        } else if (entry.name === "package-lock.json" || entry.name === "pnpm-lock.yaml") {
            out.push(path.join(dir, entry.name));
        }
    }
    return out;
}

const lockfiles = explicit.length ? explicit.map((p) => path.resolve(p)) : discover(ROOT, []);
const lockfilesByVersionByName = new Map();
for (const file of lockfiles) {
    const rows = file.endsWith("pnpm-lock.yaml") ? fromPnpmLock(file) : fromNpmLock(file);
    for (const [name, version] of rows) {
        if (!lockfilesByVersionByName.has(name)) {
            lockfilesByVersionByName.set(name, new Map());
        }
        const byVersion = lockfilesByVersionByName.get(name);
        if (!byVersion.has(version)) {
            byVersion.set(version, new Set());
        }
        byVersion.get(version).add(path.relative(ROOT, file));
    }
}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const headers = { accept: "application/vnd.github+json", "user-agent": "bitbybit-check-advisories", ...(token ? { authorization: `Bearer ${token}` } : {}) };

function nextLink(header) {
    const part = (header ?? "").split(",").map((s) => s.trim()).find((s) => /rel="next"/.test(s));
    return part ? part.slice(part.indexOf("<") + 1, part.indexOf(">")) : null;
}

async function advisoriesFor(names) {
    const out = [];
    let url = `https://api.github.com/advisories?ecosystem=npm&per_page=100&affects=${names.map(encodeURIComponent).join(",")}`;
    for (let page = 0; url; page += 1) {
        if (page >= MAX_ADVISORY_PAGES) {
            throw new Error("advisory pagination did not terminate - refusing to keep spending requests");
        }
        const res = await fetch(url, { headers });
        if (res.status === 403 || res.status === 429) {
            throw new Error(`GitHub rate limit reached${token ? "" : " - set GITHUB_TOKEN to raise it from 60 requests an hour"}`);
        }
        if (!res.ok) {
            throw new Error(`GitHub advisories request failed: ${res.status} ${res.statusText}`);
        }
        out.push(...(await res.json()));
        url = nextLink(res.headers.get("link"));
    }
    return out;
}

const names = [...lockfilesByVersionByName.keys()].sort();
const PACKAGES_PER_REQUEST = 150;
const advisories = [];
for (let i = 0; i < names.length; i += PACKAGES_PER_REQUEST) {
    advisories.push(...(await advisoriesFor(names.slice(i, i + PACKAGES_PER_REQUEST))));
}

if (!lockfiles.length) {
    throw new Error("no lockfiles found - the discovery walk is broken");
}
if (names.length < 100) {
    throw new Error(`only ${names.length} packages parsed from ${lockfiles.length} lockfiles - the lockfile parsers are not reading what they should`);
}
if (!advisories.length) {
    throw new Error("the advisory database returned nothing for any package - treat this as a failed run, not a clean one");
}

const allow = existsSync(ALLOW_FILE) ? JSON.parse(readFileSync(ALLOW_FILE, "utf8")) : { allow: [] };
const allowUsed = new Set();

const findings = [];
for (const advisory of advisories) {
    if (advisory.withdrawn_at) {
        continue;
    }
    for (const vuln of advisory.vulnerabilities ?? []) {
        const byVersion = lockfilesByVersionByName.get(vuln.package?.name);
        if (!byVersion || !vuln.vulnerable_version_range) {
            continue;
        }
        const hits = [...byVersion.keys()].filter((v) => satisfies(v, vuln.vulnerable_version_range));
        if (!hits.length) {
            continue;
        }
        const severity = String(advisory.severity ?? "").toLowerCase();
        if ((RANK[severity] ?? 0) < threshold) {
            continue;
        }
        const waiver = allow.allow?.find((a) => a.ghsa === advisory.ghsa_id && a.package === vuln.package.name);
        if (waiver) { allowUsed.add(`${waiver.ghsa}|${waiver.package}`); continue; }
        const lockfiles = [...new Set(hits.flatMap((v) => [...byVersion.get(v)]))].sort();
        findings.push({
            package: vuln.package.name, severity, ghsa: advisory.ghsa_id,
            installed: hits.sort(compare), vulnerableRange: vuln.vulnerable_version_range,
            firstPatched: vuln.first_patched_version ?? null,
            summary: advisory.summary, lockfiles,
        });
    }
}

const stale = (allow.allow ?? []).filter((a) => !allowUsed.has(`${a.ghsa}|${a.package}`));
findings.sort((a, b) => (RANK[b.severity] - RANK[a.severity]) || a.package.localeCompare(b.package));

if (asJson) {
    console.log(JSON.stringify({ findings, stale, scanned: lockfiles.length, packages: names.length }, null, 2));
} else {
    console.log(`check:advisories: ${names.length} distinct packages across ${lockfiles.length} lockfiles, against the GitHub Advisory Database`);
    for (const f of findings) {
        console.log(`\n  ${f.severity.toUpperCase()}  ${f.package} ${f.installed.join(", ")}  (${f.ghsa})`);
        console.log(`    ${f.summary}`);
        console.log(`    vulnerable: ${f.vulnerableRange}  ->  ${f.firstPatched ? `fixed in ${f.firstPatched}` : "NO FIX PUBLISHED"}`);
        for (const l of f.lockfiles) {
            console.log(`    ${l}`);
        }
    }
    for (const a of stale) {
        console.log(`\n  STALE ALLOW  ${a.package} ${a.ghsa} no longer matches anything - remove it from advisories.allow.json`);
    }
    if (!findings.length && !stale.length) {
        console.log(`  no advisories at or above ${Object.keys(RANK).find((k) => RANK[k] === threshold)}${allowUsed.size ? ` (${allowUsed.size} allowed)` : ""}`);
    }
}

process.exit(findings.length || stale.length ? 1 : 0);
