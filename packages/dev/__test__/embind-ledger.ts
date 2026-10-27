import type { Callable, ClassCounts, EmbindLedgerOptions, FrameOutcome, KernelHandle, LedgerReport, LedgerRun, LedgerWindow, OutcomeTally, PathTallies, ProxyTrap, ServiceSurface } from "./embind-ledger-types";

const UNRECORDED_METHODS = new Set(["constructor", "isAliasOf", "delete", "isDeleted", "deleteLater"]);

const watchedModules = new WeakSet<object>();
const wrappedPrototypes = new WeakSet<object>();
const watchedConstructors = new WeakSet<object>();
const framedMethods = new WeakMap<object, Map<string, string>>();
const recorders = new Set<Map<KernelHandle, string>>();
const ownerInstances = new Set<object>();
const libraryMade = new WeakSet<KernelHandle>();
const handedOver = new WeakSet<KernelHandle>();
const stack: string[] = [];
const tallies = new Map<string, PathTallies>();
const nested = new Map<string, number>();
const ledgerErrors: string[] = [];
let kernelName = "";
let bookkeeping = 0;
let currentContext: (() => string | undefined) | undefined;
let isLibraryScript: ((fileName: string) => boolean) | undefined;

export function isHandle(value: unknown): value is KernelHandle {
    return typeof value === "object" && value !== null && typeof (value as { isDeleted?: unknown }).isDeleted === "function";
}

export function handlesIn(value: unknown, found: Set<KernelHandle> = new Set(), seen: Set<object> = new Set()): Set<KernelHandle> {
    if (typeof value !== "object" || value === null || seen.has(value) || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
        return found;
    }
    seen.add(value);
    if (isHandle(value)) {
        found.add(value);
        return found;
    }
    if (value instanceof Map) {
        value.forEach((item: unknown, key: unknown) => {
            handlesIn(key, found, seen);
            handlesIn(item, found, seen);
        });
        return found;
    }
    if (value instanceof Set) {
        value.forEach((item: unknown) => handlesIn(item, found, seen));
        return found;
    }
    Object.values(value).forEach(item => handlesIn(item, found, seen));
    return found;
}

export function namesOf(handles: readonly KernelHandle[]): string[] {
    return handles.map(classNameOf).sort();
}

export function watchModule<M extends object>(module: M, options: EmbindLedgerOptions): M {
    if (watchedModules.has(module)) {
        return module;
    }
    watchedModules.add(module);
    kernelName = kernelName === "" ? options.kernel : kernelName;
    isLibraryScript = options.libraryScript ?? isLibraryScript;
    Object.keys(module).forEach(name => {
        const value: unknown = Reflect.get(module, name);
        if (typeof value !== "function" || options.runtime.has(name) || Object.prototype.hasOwnProperty.call(value, "values")) {
            return;
        }
        const callable = value as Callable;
        if (isEmbindClass(callable)) {
            wrapPrototypeChain(callable.prototype, options);
            Reflect.set(module, name, classProxy(callable));
            return;
        }
        Reflect.set(module, name, recordingProxy(callable));
    });
    return module;
}

export function watchConstructorOf(prototype: object): void {
    const original: unknown = Reflect.get(prototype, "constructor");
    if (watchedConstructors.has(prototype) || typeof original !== "function") {
        return;
    }
    watchedConstructors.add(prototype);
    if (Object.getOwnPropertyDescriptor(prototype, "constructor")?.configurable === false) {
        ledgerErrors.push(`the constructor of ${(original as { name?: string }).name ?? "a class"} cannot be watched: its prototype holds it fixed`);
        return;
    }
    Object.defineProperty(prototype, "constructor", { value: classProxy(original as Callable & { prototype: object }), writable: true, configurable: true, enumerable: false });
}

export function keepOwner(owner: object): void {
    ownerInstances.add(owner);
}

export function watchSurface(surface: ServiceSurface): void {
    currentContext = surface.context ?? currentContext;
    surface.paths.forEach(path => {
        const keys = path.split(".");
        const method = keys.pop() ?? "";
        const owner = keys.reduce<unknown>((node, key) => typeof node === "object" && node !== null ? Reflect.get(node, key) : undefined, surface.root);
        if (typeof owner !== "object" || owner === null) {
            ledgerErrors.push(`no service holds ${path}`);
            return;
        }
        const prototype: unknown = Object.getPrototypeOf(owner);
        const descriptor = typeof prototype === "object" && prototype !== null ? Object.getOwnPropertyDescriptor(prototype, method) : undefined;
        if (typeof prototype !== "object" || prototype === null || descriptor === undefined || typeof descriptor.value !== "function") {
            ledgerErrors.push(`${path} is not a method of its own service class`);
            return;
        }
        const framed = framedMethods.get(prototype) ?? new Map<string, string>();
        framedMethods.set(prototype, framed);
        const known = framed.get(method);
        if (known !== undefined) {
            if (known !== path) {
                ledgerErrors.push(`${path} and ${known} share one method`);
            }
            return;
        }
        framed.set(method, path);
        Reflect.set(prototype, method, framingProxy(descriptor.value as Callable, path));
    });
}

export function openWindow(): LedgerWindow {
    const made = new Map<KernelHandle, string>();
    recorders.add(made);
    return {
        made: (): KernelHandle[] => [...made.keys()],
        close: (): void => {
            recorders.delete(made);
        },
    };
}

export function ledgerRun<T>(act: () => T): LedgerRun<T> {
    const opened = openWindow();
    let result: T | undefined;
    let thrown: unknown;
    try {
        result = act();
    } catch (error) {
        thrown = error;
    } finally {
        opened.close();
    }
    const kept = handlesIn(result);
    const made = opened.made();
    return { result, thrown, made: made.length, leaked: made.filter(handle => !handle.isDeleted() && !kept.has(handle) && !libraryMade.has(handle)) };
}

export function talliesDuring(act: () => void): Map<string, PathTallies> {
    const savedTallies = [...tallies];
    const savedNested = [...nested];
    const savedErrors = ledgerErrors.length;
    tallies.clear();
    try {
        act();
        return new Map(tallies);
    } finally {
        tallies.clear();
        savedTallies.forEach(([path, tally]) => tallies.set(path, tally));
        nested.clear();
        savedNested.forEach(([path, count]) => nested.set(path, count));
        ledgerErrors.splice(savedErrors);
    }
}

export function ledgerReport(file: string): LedgerReport {
    return {
        kernel: kernelName,
        file,
        bookkeepingMs: Math.round(bookkeeping),
        ledgerErrors: [...ledgerErrors],
        nested: Object.fromEntries(nested),
        paths: Object.fromEntries(tallies),
    };
}

function isEmbindClass(value: Callable): value is Callable & { prototype: object } {
    return typeof (value.prototype as { isDeleted?: unknown } | undefined)?.isDeleted === "function";
}

function classNameOf(handle: KernelHandle): string {
    const prototype = Object.getPrototypeOf(handle) as { constructor?: { name?: string } } | null;
    return prototype?.constructor?.name ?? "unknown";
}

function callerScriptOf(trap: ProxyTrap): string {
    const prepare = Object.getOwnPropertyDescriptor(Error, "prepareStackTrace");
    const limit = Error.stackTraceLimit;
    const holder: { stack?: unknown } = {};
    try {
        Error.prepareStackTrace = (_error, frames): unknown => frames;
        Error.stackTraceLimit = 1;
        Error.captureStackTrace(holder, trap);
        const frames = holder.stack;
        const caller: unknown = Array.isArray(frames) ? frames[0] : undefined;
        return typeof caller === "object" && caller !== null ? String((caller as NodeJS.CallSite).getFileName() ?? "") : "";
    } finally {
        if (prepare === undefined) {
            Reflect.deleteProperty(Error, "prepareStackTrace");
        } else {
            Object.defineProperty(Error, "prepareStackTrace", prepare);
        }
        Error.stackTraceLimit = limit;
    }
}

function noteMaker(handles: Set<KernelHandle>, trap: ProxyTrap): void {
    if (isLibraryScript === undefined) {
        return;
    }
    if (!isLibraryScript(callerScriptOf(trap))) {
        handles.forEach(handle => {
            handedOver.add(handle);
            libraryMade.delete(handle);
        });
        return;
    }
    handles.forEach(handle => {
        if (!handedOver.has(handle)) {
            libraryMade.add(handle);
        }
    });
}

function record(value: unknown, trap: ProxyTrap): void {
    if (recorders.size === 0 || typeof value !== "object" || value === null) {
        return;
    }
    const started = performance.now();
    const handles = handlesIn(value);
    if (handles.size > 0) {
        noteMaker(handles, trap);
        const inner = stack[stack.length - 1] ?? "";
        handles.forEach(handle => recorders.forEach(made => {
            if (!made.has(handle)) {
                made.set(handle, inner);
            }
        }));
    }
    bookkeeping += performance.now() - started;
}

function recordingApply(target: Callable, thisArg: unknown, args: unknown[]): unknown {
    const value: unknown = Reflect.apply(target, thisArg, args);
    record(value, recordingApply);
    return value;
}

function recordingConstruct(target: Callable, args: unknown[], newTarget: Callable): object {
    const value: object = Reflect.construct(target, args, newTarget);
    record(value, recordingConstruct);
    return value;
}

function classApply(target: Callable, thisArg: unknown, args: unknown[]): unknown {
    const value: unknown = Reflect.apply(target, thisArg, args);
    if (isHandle(value)) {
        record(value, classApply);
    }
    return value;
}

const RECORDING: ProxyHandler<Callable> = { apply: recordingApply, construct: recordingConstruct };

function recordingProxy(original: Callable): Callable {
    return new Proxy(original, RECORDING);
}

function classProxy(original: Callable & { prototype: object }): Callable {
    const statics = new Map<string, { original: Callable; wrapped: Callable }>();
    return new Proxy(original, {
        apply: classApply,
        construct: recordingConstruct,
        get(target, property): unknown {
            const value: unknown = Reflect.get(target, property);
            if (typeof value !== "function" || typeof property !== "string" || property === "prototype" || !Object.prototype.hasOwnProperty.call(target, property)) {
                return value;
            }
            const descriptor = Object.getOwnPropertyDescriptor(target, property);
            if (descriptor !== undefined && descriptor.configurable === false && descriptor.writable === false) {
                return value;
            }
            const known = statics.get(property);
            if (known !== undefined && known.original === value) {
                return known.wrapped;
            }
            const wrapped = recordingProxy(value as Callable);
            statics.set(property, { original: value as Callable, wrapped });
            return wrapped;
        },
    });
}

function wrapPrototypeChain(prototype: object, options: EmbindLedgerOptions): void {
    let current: object | null = prototype;
    while (current !== null && current !== Object.prototype) {
        const owner: object = current;
        if (!wrappedPrototypes.has(owner)) {
            wrappedPrototypes.add(owner);
            const className = (owner as { constructor?: { name?: string } }).constructor?.name ?? "";
            Object.getOwnPropertyNames(owner).filter(member => !UNRECORDED_METHODS.has(member) && options.borrowing?.(className, member) !== true).forEach(member => {
                const descriptor = Object.getOwnPropertyDescriptor(owner, member);
                if (descriptor !== undefined && typeof descriptor.value === "function" && descriptor.writable === true) {
                    Reflect.set(owner, member, recordingProxy(descriptor.value as Callable));
                } else if (descriptor !== undefined && typeof descriptor.get === "function" && descriptor.configurable === true) {
                    Object.defineProperty(owner, member, { ...descriptor, get: recordingProxy(Reflect.get(descriptor, "get") as Callable) });
                }
            });
        }
        if (Object.prototype.hasOwnProperty.call(owner, "isDeleted")) {
            return;
        }
        current = Object.getPrototypeOf(owner) as object | null;
    }
}

function framingProxy(original: Callable, path: string): Callable {
    return new Proxy(original, {
        apply(target, thisArg, args): unknown {
            stack.push(path);
            const made = stack.length === 1 ? new Map<KernelHandle, string>() : undefined;
            if (made !== undefined) {
                recorders.add(made);
            }
            let threw = false;
            let result: unknown;
            let error: unknown;
            try {
                result = Reflect.apply(target, thisArg, args);
                return result;
            } catch (thrown) {
                threw = true;
                error = thrown;
                throw thrown;
            } finally {
                stack.pop();
                if (made === undefined) {
                    nested.set(path, (nested.get(path) ?? 0) + 1);
                } else {
                    recorders.delete(made);
                    closeFrame(path, made, threw ? "threw" : "ok", result, error);
                }
            }
        },
    });
}

function countInto(counts: ClassCounts, className: string): void {
    counts[className] = (counts[className] ?? 0) + 1;
}

function raiseMost(most: ClassCounts, inOneCall: ClassCounts): void {
    Object.entries(inOneCall).forEach(([className, count]) => {
        most[className] = Math.max(most[className] ?? 0, count);
    });
}

function closeFrame(path: string, made: Map<KernelHandle, string>, settled: "ok" | "threw", result: unknown, error: unknown): void {
    const started = performance.now();
    try {
        const outcome: FrameOutcome = isTrap(error) ? "trapped" : isDeferred(result) ? "deferred" : settled;
        const tally = tallyOf(path, outcome);
        tally.calls += 1;
        tally.made += made.size;
        if (outcome === "trapped" || outcome === "deferred") {
            return;
        }
        const alive = [...made.keys()].filter(handle => !handle.isDeleted());
        if (alive.length === 0) {
            return;
        }
        const answered = handlesIn(result);
        const unanswered = alive.filter(handle => !answered.has(handle));
        if (unanswered.length === 0) {
            return;
        }
        const held = new Set<KernelHandle>();
        ownerInstances.forEach(instance => handlesIn(instance, held));
        const kept = unanswered.filter(handle => !held.has(handle));
        tally.retained += unanswered.length - kept.length;
        const foreignInCall: ClassCounts = {};
        const leaked = kept.filter(handle => {
            if (!libraryMade.has(handle)) {
                return true;
            }
            const className = classNameOf(handle);
            countInto(tally.foreign, className);
            countInto(foreignInCall, className);
            return false;
        });
        if (leaked.length < kept.length) {
            tally.foreignCalls += 1;
            raiseMost(tally.foreignMost, foreignInCall);
        }
        if (leaked.length === 0) {
            return;
        }
        tally.leakedCalls += 1;
        const leakedInCall: ClassCounts = {};
        leaked.forEach(handle => {
            const className = classNameOf(handle);
            const inner = made.get(handle) || path;
            countInto(tally.leaked, className);
            countInto(leakedInCall, className);
            const byClass = tally.leakedIn[inner] ?? {};
            countInto(byClass, className);
            tally.leakedIn[inner] = byClass;
        });
        raiseMost(tally.leakedMost, leakedInCall);
        const firstLeak = tally.firstLeak ?? currentContext?.();
        if (firstLeak !== undefined) {
            tally.firstLeak = firstLeak;
        }
    } catch (problem) {
        ledgerErrors.push(`${path}: ${problem instanceof Error ? problem.message : String(problem)}`);
    } finally {
        bookkeeping += performance.now() - started;
    }
}

function tallyOf(path: string, outcome: FrameOutcome): OutcomeTally {
    const byOutcome = tallies.get(path) ?? {};
    tallies.set(path, byOutcome);
    const known = byOutcome[outcome];
    if (known !== undefined) {
        return known;
    }
    const fresh: OutcomeTally = { calls: 0, made: 0, retained: 0, leakedCalls: 0, leaked: {}, leakedMost: {}, leakedIn: {}, foreignCalls: 0, foreign: {}, foreignMost: {} };
    byOutcome[outcome] = fresh;
    return fresh;
}

function isTrap(error: unknown): boolean {
    let current = error;
    const seen = new Set<unknown>();
    while (typeof current === "object" && current !== null && !seen.has(current)) {
        if (typeof WebAssembly !== "undefined" && current instanceof WebAssembly.RuntimeError) {
            return true;
        }
        seen.add(current);
        current = (current as { cause?: unknown }).cause;
    }
    return false;
}

function isDeferred(result: unknown): boolean {
    if (typeof result !== "object" || result === null) {
        return false;
    }
    const candidate = result as { then?: unknown; next?: unknown };
    return typeof candidate.then === "function" || (typeof candidate.next === "function" && Symbol.iterator in result);
}
