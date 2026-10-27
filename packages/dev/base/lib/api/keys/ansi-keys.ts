import { InputError } from "../kernel-calls/errors";
import { lengthsConverted, snappedLength, tableLength } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { ParallelKeySizes } from "./key-types";
import { ANSI_PARALLEL_KEYS, ANSI_SMALLEST_KEYED_SHAFT } from "./ansi-keys.constants";
import { KEY_LENGTHS } from "./keys.constants";

export function ansiParallelKeySizes(shaftDiameter: number, unit: `${Base.unitOfLengthEnum}`): ParallelKeySizes {
    const diameter = tableLength(shaftDiameter, unit, "in");
    const row = diameter > ANSI_SMALLEST_KEYED_SHAFT ? ANSI_PARALLEL_KEYS.find(each => diameter <= each.upTo) : undefined;
    if (row === undefined) {
        const largest = ANSI_PARALLEL_KEYS[ANSI_PARALLEL_KEYS.length - 1]!.upTo;
        throw new InputError(`\`shaftDiameter\` is not more than ${String(snappedLength(ANSI_SMALLEST_KEYED_SHAFT, "in", unit))} and at most ${String(snappedLength(largest, "in", unit))}.`, "shaftDiameter");
    }
    const chordHeight = (diameter - Math.sqrt(diameter * diameter - row.width * row.width)) / 2;
    return lengthsConverted({ width: row.width, height: row.height, shaftDepth: row.shaftDepth + chordHeight, hubDepth: row.hubDepth - chordHeight }, KEY_LENGTHS, "in", unit);
}
