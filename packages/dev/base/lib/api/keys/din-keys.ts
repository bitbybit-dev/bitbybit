import { InputError } from "../kernel-calls/errors";
import { lengthsConverted, snappedLength, tableLength } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { ParallelKeySizes } from "./key-types";
import { KEY_LENGTHS, PARALLEL_KEYS, SMALLEST_KEYED_SHAFT } from "./din-keys.constants";

export function dinParallelKeySizes(shaftDiameter: number, unit: `${Base.unitOfLengthEnum}`): ParallelKeySizes {
    const diameter = tableLength(shaftDiameter, unit, "mm");
    const row = diameter > SMALLEST_KEYED_SHAFT ? PARALLEL_KEYS.find(each => diameter <= each.upTo) : undefined;
    if (row === undefined) {
        const largest = PARALLEL_KEYS[PARALLEL_KEYS.length - 1]!.upTo;
        throw new InputError(`\`shaftDiameter\` is not more than ${String(snappedLength(SMALLEST_KEYED_SHAFT, "mm", unit))} and at most ${String(snappedLength(largest, "mm", unit))}.`, "shaftDiameter");
    }
    return lengthsConverted({ width: row.width, height: row.height, shaftDepth: row.shaftDepth, hubDepth: row.hubDepth }, KEY_LENGTHS, "mm", unit);
}
