#!/usr/bin/env node
/**
 * Publish the packages to npm, in dependency order, resumably.
 *
 * The packages pin each other with exact versions and the registry checks nothing about a
 * dependency's existence when a package is published, so a dependent published before its
 * dependency installs into ETARGET for every user until the missing package lands - and after 72
 * hours a published version cannot be taken back. This script makes the wrong order impossible:
 *
 *   - the set of packages and their order come from the manifests alone (every non-private
 *     packages/dev/* package; a tier is the packages whose siblings are all published), the same
 *     graph the build follows;
 *   - a package whose version the registry already has is skipped, so a run that stopped half way
 *     is simply run again;
 *   - after each tier the registry is polled until every package of the tier resolves, because a
 *     fresh publish can lag resolution, and only then does the next tier start;
 *   - the eleven dist-model packages publish their dist/ (the manifest copied there by
 *     scripts/dist-manifest.mjs, which refuses a workspace: specifier or a wrong repository field);
 *     cad-cloud-sdk and create-app publish their package root through their files allowlist and
 *     their prepublishOnly build.
 *
 * Authentication comes from where it runs: publish.yml publishes through npm trusted publishing,
 * a local run through the logged-in npm, and --dry-run publishes nothing.
 *
 *   node scripts/publish-packages.mjs [--tag latest|rc|beta|alpha|next] [--dry-run]
 *
 * A prerelease publishes under its own identifier - a `-rc.0` version to `rc`, a `-beta.1` one to `beta` -
 * so a channel is installable by name and not only by exact version. It is never for rehearsing a
 * release version: --dry-run is the rehearsal, and a release version goes straight to `latest`,
 * because a published version cannot be republished and moving a dist-tag afterwards needs a
 * granular token or an interactive login, which a workflow authenticating through OIDC does not
 * have. The pairing is checked both ways here: a prerelease can never take latest, and a release
 * version can never take a prerelease channel it could not be promoted out of.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const tagIndex = args.indexOf("--tag");
const tag = tagIndex >= 0 ? args[tagIndex + 1] : "latest";
const CHANNELS = ["alpha", "beta", "rc", "next"];
if (![...CHANNELS, "latest"].includes(tag)) { console.error(`--tag must be latest or one of ${CHANNELS.join(", ")}`); process.exit(2); }
const SCOPE = "@bitbybit-dev/";
const POLL_SECONDS = 15, POLL_LIMIT = 40;

// ---------------------------------------------------------------- the package graph

const packages = new Map();
for (const dir of readdirSync(path.join(ROOT, "packages/dev"))) {
    const file = path.join(ROOT, "packages/dev", dir, "package.json");
    if (!existsSync(file)) continue;
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    if (manifest.private) continue;
    const distManifest = path.join(ROOT, "packages/dev", dir, "dist/package.json");
    const publishDir = existsSync(distManifest) ? path.dirname(distManifest) : path.join(ROOT, "packages/dev", dir);
    const deps = new Set();
    for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) for (const name of Object.keys(manifest[field] ?? {})) if (name.startsWith(SCOPE)) deps.add(name);
    packages.set(manifest.name, { name: manifest.name, version: manifest.version, dir, publishDir, deps, fromDist: publishDir.endsWith("dist") });
}
const versions = new Set([...packages.values()].map((p) => p.version));
if (versions.size !== 1) { console.error(`the packages do not share one version: ${[...versions].join(", ")}`); process.exit(1); }
const [version] = versions;
// The dist-tag and the version must agree, and neither mistake is recoverable: a prerelease under
// latest becomes everyone's default install, and a release version under a prerelease channel is
// spent, because OIDC signs a publish and never a dist-tag move.
const channel = version.includes("-") ? version.slice(version.indexOf("-") + 1).split(".")[0] : null;
if (channel && !CHANNELS.includes(channel)) { console.error(`${version} names the prerelease channel "${channel}", which is not one of ${CHANNELS.join(", ")}`); process.exit(2); }
if (channel && tag !== channel) { console.error(`${version} is a ${channel} prerelease but --tag says ${tag}; a prerelease publishes under its own channel and can never be promoted out of another`); process.exit(2); }
if (!channel && tag !== "latest") { console.error(`${version} is a release version; ${tag} could never be promoted to latest afterwards`); process.exit(2); }
for (const p of packages.values()) for (const d of p.deps) if (!packages.has(d)) { console.error(`${p.name} depends on ${d}, which is not a package here`); process.exit(1); }
for (const p of packages.values()) {
    if (!p.fromDist) continue;
    const published = JSON.parse(readFileSync(path.join(p.publishDir, "package.json"), "utf8"));
    if (published.version !== version) { console.error(`${p.name}: dist/package.json is at ${published.version}, the source at ${version} - run npm run build-packages`); process.exit(1); }
}

const tiers = [];
const placed = new Set();
while (placed.size < packages.size) {
    const tier = [...packages.values()].filter((p) => !placed.has(p.name) && [...p.deps].every((d) => placed.has(d))).map((p) => p.name).sort();
    if (!tier.length) { console.error(`dependency cycle among ${[...packages.keys()].filter((n) => !placed.has(n)).join(", ")}`); process.exit(1); }
    tiers.push(tier);
    for (const n of tier) placed.add(n);
}

// ---------------------------------------------------------------- the registry

function published(name) {
    const r = spawnSync("npm", ["view", `${name}@${version}`, "version", "--json"], { encoding: "utf8" });
    if (r.status !== 0) return false;
    try { const out = JSON.parse(r.stdout || "null"); return out === version || (Array.isArray(out) && out.includes(version)); } catch { return false; }
}
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

async function waitForTier(tier) {
    for (let attempt = 0; attempt < POLL_LIMIT; attempt++) {
        const missing = tier.filter((n) => !published(n));
        if (!missing.length) return;
        console.log(`  waiting for the registry to resolve ${missing.map((n) => n.replace(SCOPE, "")).join(", ")} (${attempt + 1}/${POLL_LIMIT})`);
        await sleep(POLL_SECONDS);
    }
    console.error(`the registry did not resolve every package of the tier within ${(POLL_LIMIT * POLL_SECONDS) / 60} minutes; run again to resume`);
    process.exit(1);
}

// ---------------------------------------------------------------- publish

console.log(`${packages.size} packages at ${version}, tag ${tag}${dryRun ? ", dry run" : ""}; tiers:`);
tiers.forEach((t, i) => console.log(`  ${i + 1}. ${t.map((n) => n.replace(SCOPE, "")).join(", ")}`));

let publishedNow = 0, skipped = 0;
for (const [i, tier] of tiers.entries()) {
    console.log(`\ntier ${i + 1}`);
    for (const name of tier) {
        const p = packages.get(name);
        if (published(name)) { console.log(`  ${name}@${version} is on the registry - skipped`); skipped++; continue; }
        const cmd = ["publish", "--access", "public", "--provenance", "--tag", tag];
        if (dryRun) { console.log(`  would publish ${name}@${version} from ${path.relative(ROOT, p.publishDir)}`); continue; }
        console.log(`  publishing ${name}@${version} from ${path.relative(ROOT, p.publishDir)}`);
        execFileSync("npm", cmd, { cwd: p.publishDir, stdio: "inherit" });
        publishedNow++;
    }
    // Every tier, the last one included. The wait exists because a fresh publish can lag the
    // registry's read path, and skipping it on the final tier assumed nothing else reads from it -
    // but the install smoke that follows does, seconds later, and raced whichever package of that
    // tier resolved slowest. A publish that worked then reported failure at the step after it.
    if (!dryRun) await waitForTier(tier);
}
console.log(`\n${dryRun ? "dry run complete" : `published ${publishedNow}, skipped ${skipped} already on the registry`}`);
if (!dryRun && tag === "next" && publishedNow) console.log(`published under next; promoting needs a token or an npm login, OIDC cannot:\n  ${[...packages.keys()].map((n) => `npm dist-tag add ${n}@${version} latest`).join(" && ")}`);
