import { it } from "vitest";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../lib/occ-helper";
import { OCCTService } from "../lib/occ-service";
import { OCCT_LEDGER } from "../lib/__test__/kernel-ledger";
import { lifetimeCases } from "../lib/__test__/lifetime-cases";
import type { Act, Arranged } from "../lib/__test__/lifetime-cases-types";
import { handlesIn, openWindow, watchModule } from "../../__test__/embind-ledger";
import { readKernelException } from "../lib/kernel-exception";
import { releaseDesignCaches } from "../lib/release-design-caches";
import type { ChosenCase, HeapAllowList, HeapCounter, HeapReport, HeapRow, KernelGlue, LoadedKernel } from "./heap-types";
import { DRILLED_BRACKET, PAST_CAPACITY_EDITS, SESSION_EDITS } from "./sessions";
import { growsTheHeap, growthFailure, meanOfWindows } from "./heap-verdict";

const WARM_UP_CALLS = 5;
const WINDOWS = 3;
const DEFAULT_CALLS = 200;
const DEFAULT_THRESHOLD = 8;

const wholeNumberOf = (name: string, fallback: number): number => {
    const value = Number(process.env[name] ?? fallback);
    if (!Number.isSafeInteger(value) || value < 1) {
        throw new Error(`${name} must be a whole number of at least 1, not ${process.env[name]}`);
    }
    return value;
};

const CALLS = wholeNumberOf("HEAP_CALLS", DEFAULT_CALLS);
const THRESHOLD = wholeNumberOf("HEAP_THRESHOLD", DEFAULT_THRESHOLD);
const CALLS_PER_WINDOW = Math.max(1, Math.floor(CALLS / WINDOWS));
const ALLOWED: HeapAllowList = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "heap.allow.json"), "utf8"));

const loadKernel = async (): Promise<LoadedKernel> => {
    const directory = process.env["HEAP_KERNEL"];
    if (!directory) {
        return { label: "package", occ: await createBitbybitOcct() };
    }
    const folder = resolve(directory);
    const wasm = readdirSync(folder).find(file => file.endsWith(".wasm"));
    if (!wasm) {
        throw new Error(`HEAP_KERNEL names ${folder}, which holds no .wasm`);
    }
    const glue: unknown = await import(pathToFileURL(join(folder, `${wasm.split(".")[0]!}.js`)).href);
    const occ = await (glue as KernelGlue).default({ locateFile: (file: string): string => (file.endsWith(".wasm") ? join(folder, wasm) : join(folder, file)) });
    return { label: folder, occ };
};

const counterOf = (occ: BitbybitOcctModule): HeapCounter => {
    const counted = Reflect.get(occ, "HeapBytesInUse");
    const sized = Reflect.get(occ, "HeapBytes");
    if (typeof counted === "function" && Number(counted.call(occ)) >= 0) {
        return { name: "bytes in use", read: (): number => Number(counted.call(occ)) };
    }
    if (typeof sized === "function") {
        return { name: "heap size", read: (): number => Number(sized.call(occ)) };
    }
    throw new Error("this kernel counts no heap bytes: build one with HeapBytesInUse");
};

const calledOnce = (occ: BitbybitOcctModule, occt: OCCTService, act: Act): boolean => {
    const opened = openWindow();
    let threw = false;
    try {
        act();
    } catch (error) {
        threw = true;
        readKernelException(occ, error);
    } finally {
        opened.close();
    }
    releaseDesignCaches(occt);
    opened.made().filter(handle => !handle.isDeleted()).forEach(handle => handle.delete());
    return threw;
};

const freed = (answer: unknown): void => {
    handlesIn(answer).forEach(handle => {
        if (!handle.isDeleted()) {
            handle.delete();
        }
    });
};

const measured = (occ: BitbybitOcctModule, occt: OCCTService, chosen: ChosenCase, counter: HeapCounter): HeapRow => {
    const act = chosen.arrange();
    let unexpected = 0;
    const once = (): void => {
        if (calledOnce(occ, occt, act) !== chosen.refused) {
            unexpected += 1;
        }
    };
    for (let call = 0; call < WARM_UP_CALLS; call++) {
        once();
    }
    const marks = [counter.read()];
    for (let window = 0; window < WINDOWS; window++) {
        for (let call = 0; call < CALLS_PER_WINDOW; call++) {
            once();
        }
        marks.push(counter.read());
    }
    const bytesPerCall = marks.slice(1).map((mark, at) => Math.round((mark - marks[at]!) / CALLS_PER_WINDOW));
    return { case: chosen.name, bytesPerCall, meanBytesPerCall: meanOfWindows(bytesPerCall), leaks: growsTheHeap(bytesPerCall, THRESHOLD), unexpected };
};

it("measures the heap across repeated calls of every lifetime case", async () => {
    const { label, occ } = await loadKernel();
    watchModule(occ, OCCT_LEDGER);
    occ.SetMeshRetention(0);
    occ.ReleaseKeptMeshes();
    const counter = counterOf(occ);
    const och = new OccHelper(occ);
    const occt = new OCCTService(occ, och);
    const cases = lifetimeCases(() => occt, () => och);
    const only = process.env["HEAP_CASES"];
    const tagged = (arranged: Arranged[], refused: boolean): ChosenCase[] => arranged.map(([name, arrange]) => ({ name, arrange, refused }));
    const all = [...tagged(cases.succeeding, false), ...tagged(cases.succeedingAsToday, false), ...tagged(cases.refused, true), ...tagged(cases.refusedAsToday, true)];
    const chosen = all.filter(entry => only === undefined || entry.name.includes(only));
    const rows = chosen.map(entry => measured(occ, occt, entry, counter));
    const leaking = rows.filter(row => row.leaks).map(row => row.case);
    const known = leaking.filter(name => ALLOWED.allow[name] !== undefined);
    const overgrown = rows.filter(row => known.includes(row.case) && Math.max(...row.bytesPerCall) > ALLOWED.allow[row.case]!.mostBytesPerCall)
        .map(row => `${row.case} (${Math.max(...row.bytesPerCall)} bytes a call, at most ${ALLOWED.allow[row.case]!.mostBytesPerCall})`);
    const unexplained = leaking.filter(name => ALLOWED.allow[name] === undefined);
    const misbehaving = rows.filter(row => row.unexpected > 0).map(row => `${row.case} (${row.unexpected} of ${WARM_UP_CALLS + CALLS_PER_WINDOW * WINDOWS} calls)`);
    const names = new Set(all.map(entry => entry.name));
    const unknown = Object.keys(ALLOWED.allow).filter(name => !names.has(name));
    const stale = counter.name === "bytes in use" ? [...rows.filter(row => !row.leaks && ALLOWED.allow[row.case] !== undefined).map(row => row.case), ...unknown] : unknown;
    const report: HeapReport = { kernel: label, counter: counter.name, calls: CALLS_PER_WINDOW * WINDOWS, thresholdBytesPerCall: THRESHOLD, leaking: unexplained, known, stale, misbehaving, overgrown, rows };
    console.log(JSON.stringify(report, null, 2));
    const out = process.env["HEAP_OUT"];
    if (out) {
        writeFileSync(out, JSON.stringify(report, null, 2));
    }
    if (process.env["HEAP_REPORT_ONLY"] === "1") {
        return;
    }
    if (misbehaving.length > 0) {
        throw new Error(`${misbehaving.length} case(s) did not succeed or refuse as their list says, so the heap was measured on another path: ${misbehaving.join("; ")}`);
    }
    if (overgrown.length > 0) {
        throw new Error(`${overgrown.length} listed case(s) grow the heap past what heap.allow.json allows them, so something new leaks on that path: ${overgrown.join("; ")}`);
    }
    if (unexplained.length > 0) {
        throw new Error(growthFailure(rows.filter(row => unexplained.includes(row.case)), THRESHOLD));
    }
    if (only === undefined && stale.length > 0) {
        throw new Error(`heap.allow.json lists case(s) that no longer grow the heap, so they must come out of it: ${stale.join("; ")}`);
    }
}, 3_600_000);

const session = async (name: string, edits: number, parameters: (edit: number) => Record<string, number>): Promise<void> => {
    const { occ } = await loadKernel();
    watchModule(occ, OCCT_LEDGER);
    occ.SetMeshRetention(0);
    occ.ReleaseKeptMeshes();
    const counter = counterOf(occ);
    const occt = new OCCTService(occ, new OccHelper(occ));
    const failedBuilds: string[] = [];
    const built = (edit: number): void => {
        const result = occt.design.build({ document: DRILLED_BRACKET, parameters: parameters(edit) });
        result.report.filter(feature => feature.status !== "ok").forEach(feature => failedBuilds.push(`edit ${edit}, ${feature.id}: ${feature.messages.join("; ")}`));
        freed(result);
    };
    built(0);
    releaseDesignCaches(occt);
    const before = counter.read();
    for (let edit = 1; edit <= edits; edit++) {
        built(edit);
    }
    releaseDesignCaches(occt);
    const grownPerEdit = Math.round((counter.read() - before) / edits);
    console.log(JSON.stringify({ session: name, edits, counter: counter.name, grownPerEdit }, null, 2));
    if (failedBuilds.length > 0) {
        throw new Error(`${failedBuilds.length} feature(s) of the session's builds did not build: ${failedBuilds.slice(0, 3).join(" | ")}`);
    }
    if (grownPerEdit > THRESHOLD && process.env["HEAP_REPORT_ONLY"] !== "1") {
        throw new Error(`a design session (${name}) of ${edits} edits keeps ${grownPerEdit} bytes an edit after its caches are released`);
    }
};

it("comes back to the heap a design session started from once its caches are released", async () => {
    await session("drilled bracket", SESSION_EDITS, edit => ({ width: 40 + edit % 7, radius: 1 + (edit % 5) / 2, hole: 3 + (edit % 3) / 2 }));
}, 3_600_000);

it("comes back to the heap a design session started from when it makes more outcomes than its cache holds", async () => {
    await session("drilled bracket, every edit new", PAST_CAPACITY_EDITS, edit => ({ width: 40 + edit / 100 }));
}, 3_600_000);
