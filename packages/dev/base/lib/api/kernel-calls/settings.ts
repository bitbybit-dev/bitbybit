import { Base } from "../inputs/base-inputs";
import { InputError } from "./errors";

/**
 * The settings one bitbybit instance works by: choices made once for a whole app, not per call.
 * The renderer holds them for its scene, each worker is told them once and keeps them, and a
 * program that runs a kernel itself sets them on that kernel. A setting left out keeps the
 * behaviour the libraries had before it existed.
 */
export interface BitbybitSettings {
    /**
     * The coordinate system the model's numbers are in: left-handed for a default Babylon.js scene,
     * right-handed for three.js, PlayCanvas and a program without a scene. Files, drawings and text
     * map by it. Left out, they map as they did before the choice existed.
     */
    coordinateSystem?: Base.coordinateSystemEnum | undefined;
}

const COORDINATE_SYSTEMS: readonly unknown[] = Object.values(Base.coordinateSystemEnum);

const REFUSALS = new Map<keyof BitbybitSettings, (value: unknown) => string | undefined>([
    ["coordinateSystem", value => (COORDINATE_SYSTEMS.includes(value) ? undefined : `it is ${COORDINATE_SYSTEMS.join(", ")} or left out`)],
]);

/**
 * Checks settings that arrived from outside - a worker message, a file, a caller's object - and
 * returns them as a new plain object holding only what was set, its keys in a fixed order.
 *
 * A name that is no setting and a value its setting does not take are refused as an `InputError`
 * naming the property, so a misspelt setting is never silently ignored. Nothing, or an empty
 * object, gives no settings.
 * @param given - The settings as they arrived
 * @returns The settings that were set
 */
export function checkedSettings(given: unknown): BitbybitSettings {
    if (given === undefined || given === null) {
        return {};
    }
    if (typeof given !== "object" || Array.isArray(given)) {
        throw new InputError("The settings are an object of setting names and values.", "settings");
    }
    const entries = given as Record<string, unknown>;
    const unknown = Object.keys(entries).find(name => !REFUSALS.has(name as keyof BitbybitSettings));
    if (unknown !== undefined) {
        throw new InputError(`\`${unknown}\` is not a setting; the settings are ${[...REFUSALS.keys()].join(", ")}.`, unknown);
    }
    const settings: Record<string, unknown> = {};
    REFUSALS.forEach((refusalOf, name) => {
        const value = entries[name];
        if (value === undefined || value === null) {
            return;
        }
        const refusal = refusalOf(value);
        if (refusal !== undefined) {
            throw new InputError(`\`${name}\` is ${JSON.stringify(value)}; ${refusal}.`, name);
        }
        settings[name] = value;
    });
    return settings;
}

/**
 * The settings as a worker keeps its results apart by them: nothing when none are set, so a result
 * made with no settings is found under the key it had before settings existed.
 * @param settings - The settings the worker works by
 * @returns The settings, or nothing when none are set
 */
export function settingsCacheKey(settings: BitbybitSettings): BitbybitSettings | undefined {
    return Object.keys(settings).length === 0 ? undefined : settings;
}

/**
 * Keeps the settings a kernel worker manager is given and tells its worker them: what the OCCT,
 * JSCAD and Manifold managers share. Settings are checked where they arrive, so a refused one
 * rejects and changes nothing, whether a worker is set or not. Accepted ones are sent at once, as a
 * call of their own, to the worker set now and to every worker set after it. Nothing waits for the
 * worker's answer: a worker answers calls in the order they came, holding those that arrive before
 * its kernel is ready, so every call made after the settings works by them. A worker that refuses
 * them all the same, one built before a setting existed, is reported through `refused`.
 */
export class SettingsRelay {
    private kept: BitbybitSettings | undefined;

    /**
     * @param send - Sends settings to the worker as a call of their own, settled by its answer
     * @param refused - Told what a worker answered when it refused the settings it was sent
     */
    constructor(private readonly send: (settings: BitbybitSettings) => Promise<unknown>, private readonly refused: (reason: unknown) => void) { }

    /**
     * Checks the settings, keeps them, and sends them to the worker when one is set.
     * @param settings - The settings as they arrived
     * @param toWorker - True when a worker is set to send them to now
     * @returns The settings kept; a refusal rejects and keeps the earlier ones
     */
    set(settings: unknown, toWorker: boolean): Promise<BitbybitSettings> {
        return new Promise((resolve) => {
            const checked = checkedSettings(settings);
            this.kept = checked;
            if (toWorker) {
                this.tell(checked);
            }
            resolve({ ...checked });
        });
    }

    /**
     * Sends the settings kept to a worker just set, when any were ever given.
     */
    workerSet(): void {
        if (this.kept !== undefined) {
            this.tell(this.kept);
        }
    }

    private tell(settings: BitbybitSettings): void {
        this.send({ ...settings }).catch(this.refused);
    }
}

/**
 * The newest conventions level these libraries know: 1, where a model's numbers are in the
 * engine's own coordinate system. Content made today is saved with it.
 */
export const CURRENT_CONVENTIONS = 1;

/**
 * One change a conventions level makes, told in words: the level that makes it, the operations
 * whose results it changes and what changes in them. An entry is a dotted path as a script writes
 * it after `bitbybit.`, and one that ends in a dot stands for everything under it.
 */
export interface ConventionChange {
    /**
     * The conventions level that makes the change, from 1
     */
    readonly level: number;
    /**
     * The operations whose results it changes
     */
    readonly entries: readonly string[];
    /**
     * What changes, in one sentence that starts with what it is about
     */
    readonly change: string;
}

/**
 * The settings that content saved with a conventions level runs by. Content carries one whole
 * number instead of the settings themselves, since the right settings depend on the engine that runs it:
 * 0, or no level at all, is the behaviour from before settings existed, and 1 and above are the
 * engine's own settings. Levels only add, so one newer than this version knows runs by the newest
 * it has.
 *
 * Anything but a whole number from 0 is refused as an `InputError`.
 * @param level - The level the content was saved with, or nothing for content saved without one
 * @param engineSettings - The settings that fit the engine, as a renderer's `engineSettings` gives them
 * @returns The settings to run the content by
 */
export function settingsOfConventions(level: unknown, engineSettings: BitbybitSettings): BitbybitSettings {
    if (level === undefined || level === null) {
        return {};
    }
    if (typeof level !== "number" || !Number.isSafeInteger(level) || level < 0) {
        throw new InputError(`A conventions level is a whole number from 0, got ${JSON.stringify(level)}.`, "conventions");
    }
    return level === 0 ? {} : checkedSettings(engineSettings);
}
