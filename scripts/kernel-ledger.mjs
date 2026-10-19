import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, classesUnder } from "./lib/surface.mjs";
import { kernelSurface } from "./lib/kernel-surface.mjs";

export const ALLOW_FILE = "scripts/kernel-ledger.allow.json";
export const KERNELS = [
    { name: "occt", dir: "packages/dev/occt", root: "OCCTService" },
    { name: "manifold", dir: "packages/dev/manifold", root: "ManifoldService" },
];
const REPORTS = "test-results/kernel-ledger";
const JUDGED = ["ok", "threw"];
const UNMARKED = "it carries no mark that the file's whole run wrote it";
const ENTRY_SHAPE = "must be { reason, mostPerCall }: a reason, and for each class the most one call may leave alive, a whole number above zero";

const emptyTally = () => ({ calls: 0, made: 0, retained: 0, leakedCalls: 0, leaked: {}, leakedMost: {}, leakedIn: {}, foreignCalls: 0, foreign: {}, foreignMost: {} });

export function mergeReports(reports) {
    const merged = { files: new Set(), paths: new Map(), ledgerErrors: [], deferred: [], partial: [] };
    for (const report of reports) {
        merged.files.add(report.file);
        if (report.complete !== true) {
            merged.partial.push({ file: report.file, why: report.partial ?? UNMARKED });
        }
        report.ledgerErrors.forEach((problem) => merged.ledgerErrors.push(`${report.file}: ${problem}`));
        for (const [name, outcomes] of Object.entries(report.paths)) {
            const into = merged.paths.get(name) ?? {};
            merged.paths.set(name, into);
            for (const [outcome, tally] of Object.entries(outcomes)) {
                if (outcome === "deferred") {
                    merged.deferred.push(`${report.file}: ${name}`);
                }
                const known = into[outcome] ?? emptyTally();
                known.calls += tally.calls;
                known.made += tally.made;
                known.retained += tally.retained;
                known.leakedCalls += tally.leakedCalls;
                known.foreignCalls += tally.foreignCalls ?? 0;
                addCounts(known.leaked, tally.leaked);
                addCounts(known.foreign, tally.foreign ?? {});
                raiseCounts(known.leakedMost, tally.leakedMost ?? {});
                raiseCounts(known.foreignMost, tally.foreignMost ?? {});
                for (const [inner, counts] of Object.entries(tally.leakedIn)) {
                    known.leakedIn[inner] = addCounts(known.leakedIn[inner] ?? {}, counts);
                }
                known.firstLeak = known.firstLeak ?? (tally.firstLeak === undefined ? undefined : `${report.file} > ${tally.firstLeak}`);
                into[outcome] = known;
            }
        }
    }
    return merged;
}

function addCounts(into, counts) {
    for (const [name, count] of Object.entries(counts)) {
        into[name] = (into[name] ?? 0) + count;
    }
    return into;
}

function raiseCounts(into, counts) {
    for (const [name, count] of Object.entries(counts)) {
        into[name] = Math.max(into[name] ?? 0, count);
    }
    return into;
}

const countsText = (counts) => Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => `${count} ${name}`).join(", ");

const reasonOf = (entry) => (typeof entry === "string" ? entry : entry?.reason);

export function isBound(entry) {
    if (typeof entry !== "object" || entry === null || typeof entry.reason !== "string" || entry.reason.trim() === "") {
        return false;
    }
    const most = entry.mostPerCall;
    if (typeof most !== "object" || most === null || Array.isArray(most) || Object.keys(most).length === 0) {
        return false;
    }
    return Object.values(most).every((count) => Number.isInteger(count) && count > 0);
}

function boundFindings(key, most, entry, { what, where }) {
    const findings = [];
    for (const [name, count] of Object.entries(most).sort(([a], [b]) => a.localeCompare(b))) {
        const allowed = entry.mostPerCall[name];
        if (allowed === undefined) {
            findings.push({ key, problem: `${what} up to ${count} ${name} alive in one call, which ${where} in ${ALLOW_FILE} does not name` });
        } else if (count > allowed) {
            findings.push({ key, problem: `${what} up to ${count} ${name} alive in one call, more than the ${allowed} ${where} in ${ALLOW_FILE} allows` });
        }
    }
    for (const name of Object.keys(entry.mostPerCall).sort((a, b) => a.localeCompare(b))) {
        if ((most[name] ?? 0) === 0) {
            findings.push({ key, problem: `no call leaves ${name} alive any more, so it must come out of ${where} in ${ALLOW_FILE}` });
        }
    }
    return findings;
}

export function checkLedger({ kernel, merged, allow, foreign = {}, unreached, surface, testFiles }) {
    const findings = [];
    const prefix = `${kernel}:`;
    const reached = [...merged.paths.keys()].filter((name) => surface.has(name)).length;
    const own = (entries) => Object.entries(entries).filter(([key]) => key.startsWith(prefix));
    const malformed = new Set();
    own(allow).filter(([, entry]) => !isBound(entry)).forEach(([key]) => {
        malformed.add(`allow ${key}`);
        findings.push({ key, problem: `its entry in ${ALLOW_FILE} ${ENTRY_SHAPE}` });
    });
    own(foreign).filter(([, entry]) => !isBound(entry)).forEach(([key]) => {
        malformed.add(`foreign ${key}`);
        findings.push({ key, problem: `its foreign entry in ${ALLOW_FILE} ${ENTRY_SHAPE}` });
    });
    for (const [name, outcomes] of merged.paths) {
        if (!surface.has(name)) {
            findings.push({ key: `${prefix}${name}`, problem: "was reported but is not a path of the kernel" });
        }
        for (const outcome of JUDGED) {
            const tally = outcomes[outcome];
            const key = `${prefix}${name}#${outcome}`;
            if (tally === undefined) {
                continue;
            }
            if (tally.leakedCalls > 0 && allow[key] === undefined) {
                const madeBy = Object.entries(tally.leakedIn).map(([inner, counts]) => `${inner} (${countsText(counts)})`).join("; ");
                findings.push({ key, problem: `left ${countsText(tally.leaked)} alive in ${tally.leakedCalls} of ${tally.calls} calls, made by ${madeBy}; first in ${tally.firstLeak ?? "an unnamed test"}` });
            } else if (tally.leakedCalls > 0 && !malformed.has(`allow ${key}`)) {
                findings.push(...boundFindings(key, tally.leakedMost, allow[key], { what: "left", where: "its entry" }));
            }
            if (tally.foreignCalls > 0 && foreign[key] === undefined) {
                findings.push({ key, problem: `the kernel library's own code left ${countsText(tally.foreign)} alive in ${tally.foreignCalls} of ${tally.calls} calls, at most ${countsText(tally.foreignMost)} in one call: bound it under foreign in ${ALLOW_FILE}, naming the library function that leaks them` });
            } else if (tally.foreignCalls > 0 && !malformed.has(`foreign ${key}`)) {
                findings.push(...boundFindings(key, tally.foreignMost, foreign[key], { what: "the kernel library's own code left", where: "its foreign entry" }));
            }
        }
    }
    for (const [key, entry] of own(allow).filter(([key]) => !malformed.has(`allow ${key}`))) {
        const [name, outcome] = key.slice(prefix.length).split("#");
        const tally = merged.paths.get(name)?.[outcome];
        if (!surface.has(name) || !JUDGED.includes(outcome)) {
            findings.push({ key, problem: `${ALLOW_FILE} names no path and outcome of the kernel (${reasonOf(entry)})` });
        } else if (tally === undefined) {
            findings.push({ key, problem: `${ALLOW_FILE} allows it, but no test reaches it any more` });
        } else if (tally.leakedCalls === 0) {
            findings.push({ key, problem: `no longer leaks, so it must come out of ${ALLOW_FILE}` });
        }
    }
    for (const [key, entry] of own(foreign).filter(([key]) => !malformed.has(`foreign ${key}`))) {
        const [name, outcome] = key.slice(prefix.length).split("#");
        const tally = merged.paths.get(name)?.[outcome];
        if (!surface.has(name) || !JUDGED.includes(outcome)) {
            findings.push({ key, problem: `${ALLOW_FILE} names no path and outcome of the kernel under foreign (${reasonOf(entry)})` });
        } else if (tally === undefined) {
            findings.push({ key, problem: `${ALLOW_FILE} bounds it under foreign, but no test reaches it any more` });
        } else if (tally.foreignCalls === 0) {
            findings.push({ key, problem: `the kernel library's own code no longer leaves anything alive on it, so it must come out of foreign in ${ALLOW_FILE}` });
        }
    }
    for (const name of surface) {
        const outcomes = merged.paths.get(name);
        if (outcomes === undefined && unreached[`${prefix}${name}`] === undefined) {
            findings.push({ key: `${prefix}${name}`, problem: "no test calls it from outside the kernel's own services, so the ledger never judges it: add a lifetime case, or list it under unreached with the reason" });
        } else if (outcomes !== undefined && outcomes.trapped !== undefined && !JUDGED.some((outcome) => outcomes[outcome] !== undefined)) {
            findings.push({ key: `${prefix}${name}`, problem: "every call that reached it trapped, so the ledger never judged it: add a case that reaches it without a trap" });
        }
    }
    for (const [key, reason] of own(unreached)) {
        const name = key.slice(prefix.length);
        if (!surface.has(name)) {
            findings.push({ key, problem: `unreached in ${ALLOW_FILE} names no path of the kernel (${reason})` });
        } else if (merged.paths.has(name)) {
            findings.push({ key, problem: `a test calls it now, so it must come out of unreached in ${ALLOW_FILE}` });
        }
    }
    for (const file of testFiles) {
        if (!merged.files.has(file)) {
            findings.push({ key: `${prefix}${file}`, problem: "left no ledger report: did the suite run with the ledger?" });
        }
    }
    for (const file of merged.files) {
        if (!testFiles.includes(file)) {
            findings.push({ key: `${prefix}${file}`, problem: "has a ledger report but is no test file of the package: clear the report folder" });
        }
    }
    merged.partial.forEach(({ file, why }) => findings.push({ key: `${prefix}${file}`, problem: `has a partial ledger report, so the gate cannot judge it: ${why}; run the package's whole suite again` }));
    merged.deferred.forEach((where) => findings.push({ key: `${prefix}deferred`, problem: `${where} returned a promise or an iterator, which the ledger cannot judge` }));
    merged.ledgerErrors.forEach((problem) => findings.push({ key: `${prefix}ledger`, problem }));
    const foreignLeft = {};
    merged.paths.forEach((outcomes) => Object.values(outcomes).forEach((tally) => addCounts(foreignLeft, tally.foreign)));
    return { findings, reached, of: surface.size, foreign: foreignLeft };
}

export function unknownKernelKeys(config, kernels) {
    return [...Object.entries(config.allow), ...Object.entries(config.unreached), ...Object.entries(config.foreign ?? {})]
        .filter(([key]) => !kernels.includes(key.split(":")[0]) || !key.includes(":"))
        .map(([key, entry]) => ({ key, problem: `names no kernel the gate checks (${reasonOf(entry)})` }));
}

function readReports(dir) {
    const folder = path.join(ROOT, dir, REPORTS);
    if (!existsSync(folder)) {
        return [];
    }
    return readdirSync(folder).filter((name) => name.endsWith(".json")).sort().map((name) => JSON.parse(readFileSync(path.join(folder, name), "utf8")));
}

export function testFilesOf(packageDir) {
    return readdirSync(path.join(packageDir, "lib"), { recursive: true })
        .filter((name) => name.endsWith(".test.ts") && !name.split(path.sep).includes("node_modules"))
        .map((name) => path.join("lib", name))
        .sort();
}

function surfaceOf(kernel) {
    const surface = kernelSurface(classesUnder(path.join(ROOT, kernel.dir, "lib")), kernel.root);
    return new Set([...surface.values()].flatMap((cls) => cls.methods.map((method) => method.path)));
}

function main() {
    const config = JSON.parse(readFileSync(path.join(ROOT, ALLOW_FILE), "utf8"));
    const foreign = config.foreign ?? {};
    const unknown = unknownKernelKeys(config, KERNELS.map((kernel) => kernel.name));
    unknown.forEach(({ key, problem }) => console.log(`${ALLOW_FILE}: ${key}: ${problem}`));
    let failed = unknown.length > 0;
    for (const kernel of KERNELS) {
        const merged = mergeReports(readReports(kernel.dir));
        const { findings, reached, of, foreign: left } = checkLedger({ kernel: kernel.name, merged, allow: config.allow, foreign, unreached: config.unreached, surface: surfaceOf(kernel), testFiles: testFilesOf(path.join(ROOT, kernel.dir)) });
        const countOf = (entries) => Object.keys(entries).filter((key) => key.startsWith(`${kernel.name}:`)).length;
        console.log(`${kernel.name}: ${reached} of ${of} paths reached, ${countOf(config.unreached)} listed as unreached, ${countOf(config.allow)} allowed to leak, ${countOf(foreign)} bounded library leaks`);
        if (Object.keys(left).length > 0) {
            console.log(`  left alive by the kernel library's own code, each path within its foreign bound: ${countsText(left)}`);
        }
        findings.forEach(({ key, problem }) => console.log(`  ${key}: ${problem}`));
        failed = failed || findings.length > 0;
    }
    return failed ? 1 : 0;
}

if (process.argv[1] !== undefined && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    process.exitCode = main();
}
