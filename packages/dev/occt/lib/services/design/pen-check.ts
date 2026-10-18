import { isRecord } from "@bitbybit-dev/base";
import { DesignProblem, pointer } from "./problems";
import { checkKeys, checkObject } from "./structure";
import type { Known } from "./document-check-types";
import { NAME_ID, checkNumbersIn, inputsOf } from "./value-checks";
import { GEAR_NUMBERS, RACK_NUMBERS } from "./constants";

const CIRCLE_KEYS = ["id", "centre", "radius"];
const GEAR_KEYS = ["id", "internal", "centre", ...GEAR_NUMBERS];
const GEAR_NEEDS = ["centre", "module", "teeth"];
const GEAR_PARTS = ["tip", "flank", "root"];
const RACK_KEYS = ["id", "start", "angle", ...RACK_NUMBERS];
const RACK_NEEDS = ["start", "module", "teeth"];
const RACK_PARTS = ["tip", "flank", "root", "back", "side"];
const LOOP_KEYS: Readonly<Record<string, readonly string[]>> = { circle: CIRCLE_KEYS, gear: GEAR_KEYS, rack: RACK_KEYS };
const LOOP_NEEDS: Readonly<Record<string, readonly string[]>> = { gear: GEAR_NEEDS, rack: RACK_NEEDS };
const LOOP_PARTS: Readonly<Record<string, readonly string[]>> = { gear: GEAR_PARTS, rack: RACK_PARTS };

const NOT_NUMBERS = new Set(["type", "id", "internal"]);

function checkRingGear(command: Record<string, unknown>, path: string): void {
    const internal = command["internal"];
    if (internal !== undefined && typeof internal !== "boolean") {
        throw new DesignProblem(pointer(path, "internal"), "internal is true for the teeth of a ring gear, or false");
    }
    if (internal === true && command["profileShift"] !== undefined) {
        throw new DesignProblem(pointer(path, "profileShift"), "a ring gear's teeth take no profileShift");
    }
}

export function commandNames(command: Record<string, unknown>, id: string): string[] {
    const parts = typeof command["type"] === "string" ? LOOP_PARTS[command["type"]] : undefined;
    return parts === undefined ? [id] : parts.map(part => `${id}.${part}`);
}

export function checkPen(value: unknown, path: string, known: Known, ids = new Set<string>()): Set<string> {
    if (!Array.isArray(value) || value.length === 0) {
        throw new DesignProblem(path, "pen is a list of sketch commands");
    }
    value.forEach((command, index) => {
        const commandPath = pointer(path, index);
        if (!isRecord(command) || typeof command["type"] !== "string") {
            throw new DesignProblem(commandPath, "a pen command is an object with a type");
        }
        const loopKeys = LOOP_KEYS[command["type"]];
        if (loopKeys !== undefined && value.length > 1) {
            throw new DesignProblem(commandPath, `a ${command["type"]} is a loop by itself: give it a pen or a loop of its own`);
        }
        const needs = LOOP_NEEDS[command["type"]];
        const missing = needs?.find(key => command[key] === undefined);
        if (needs !== undefined && missing !== undefined) {
            throw new DesignProblem(pointer(commandPath, missing), `a ${command["type"]} needs ${needs.join(", ")}`);
        }
        if (command["type"] === "gear") {
            checkRingGear(command, commandPath);
        }
        const inputs = loopKeys ?? inputsOf(known, `sketch.commands.${command["type"]}`);
        if (inputs === undefined) {
            throw new DesignProblem(pointer(commandPath, "type"), `${JSON.stringify(command["type"])} is not a sketch command`);
        }
        checkKeys(command, ["type", ...inputs], commandPath, false);
        const id = command["id"];
        if (id !== undefined && id !== "") {
            if (typeof id !== "string" || !NAME_ID.test(id) || ids.has(id) || commandNames(command, id).some(name => ids.has(name)) || [...ids].some(name => name.startsWith(`${id}.`))) {
                throw new DesignProblem(pointer(commandPath, "id"), "command ids are distinct, start with a letter or _ and hold letters, digits, _ and -");
            }
            commandNames(command, id).forEach(name => ids.add(name));
        }
        for (const [key, inner] of Object.entries(command)) {
            if (!NOT_NUMBERS.has(key)) {
                checkNumbersIn(inner, pointer(commandPath, key), known);
            }
        }
    });
    return ids;
}

export function checkLoops(feature: Record<string, unknown>, path: string, known: Known): Set<string> {
    for (const key of ["pen", "start"]) {
        if (feature[key] !== undefined) {
            throw new DesignProblem(pointer(path, key), `a sketch draws with pen or with loops: give ${key} inside each loop`);
        }
    }
    if (feature["face"] === false) {
        throw new DesignProblem(pointer(path, "face"), "loops are the outline and the holes of one face, so a sketch with loops is a face");
    }
    const loops = feature["loops"];
    if (!Array.isArray(loops) || loops.length === 0) {
        throw new DesignProblem(pointer(path, "loops"), "loops is a list of { start?, pen }, the outline first and then its holes");
    }
    const ids = new Set<string>();
    loops.forEach((value: unknown, index) => {
        const loopPath = pointer(path, "loops", index);
        const loop = checkObject(value, ["start", "pen"], loopPath, false, "a loop { start?, pen }");
        if (loop["start"] !== undefined) {
            checkNumbersIn(loop["start"], pointer(loopPath, "start"), known);
        }
        checkPen(loop["pen"], pointer(loopPath, "pen"), known, ids);
    });
    return ids;
}
