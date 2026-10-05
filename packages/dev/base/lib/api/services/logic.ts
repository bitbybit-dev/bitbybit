import * as Inputs from "../inputs";
import { resolveDto } from "../kernel-calls";
import type * as Resolved from "../resolved-inputs";

/**
 * Booleans and decisions: comparing values, flipping booleans, turning lists of numbers into lists
 * of booleans by thresholds, drawing random booleans, and gating a value so it passes only when a
 * condition holds. The threshold methods are the usual way to decide which items of a pattern get a
 * feature and which do not.
 */
export class Logic {

    /**
     * Passes a boolean through unchanged, so a value can be given a name and reused.
     *
     * Example: true -> true
     * @param inputs - The boolean
     * @returns The same boolean
     * @group create
     * @shortname boolean
     * @drawable false
     */
    boolean(inputs: Inputs.Logic.BooleanDto): boolean {
        const resolved = resolveDto(Inputs.Logic.BooleanDto, inputs) as Resolved.Logic.BooleanDto;
        return resolved.boolean;
    }

    /**
     * Draws a list of random booleans, each true with a given probability.
     *
     * Example: length 5 with trueThreshold 0.7 -> perhaps [true, true, false, true, true]
     * @param inputs - How many booleans to draw and the probability of true
     * @returns The random booleans
     * @group create
     * @shortname random booleans
     * @drawable false
     * @example
     * ```typescript
     * const flags = bitbybit.logic.randomBooleans({ length: 5, trueThreshold: 0.7 });
     * ```
     */
    randomBooleans(inputs: Inputs.Logic.RandomBooleansDto): boolean[] {
        const resolved = resolveDto(Inputs.Logic.RandomBooleansDto, inputs) as Resolved.Logic.RandomBooleansDto;
        const booleans: boolean[] = [];
        for (let i = 0; i < resolved.length; i++) {
            booleans.push(Math.random() < resolved.trueThreshold);
        }
        return booleans;
    }

    /**
     * Turns numbers into booleans with a random blend between two thresholds.
     *
     * Below the first threshold a number is always true, above the second always false; in between,
     * the chance of true falls in steps from one to the other, so a pattern fades out instead of
     * switching sharply.
     * Example: [0.1, 0.9] with thresholds 0.3 and 0.7 -> [true, false]
     * @param inputs - The numbers, the two thresholds and how many steps the fade has
     * @returns One boolean per number
     * @group create
     * @shortname 2 threshold random gradient
     * @drawable false
     * @example
     * ```typescript
     * const fade = bitbybit.logic.twoThresholdRandomGradient({
     *     numbers: [0.1, 0.4, 0.6, 0.9],
     *     thresholdTotalTrue: 0.3,
     *     thresholdTotalFalse: 0.7,
     *     nrLevels: 10,
     * });
     * ```
     */
    twoThresholdRandomGradient(inputs: Inputs.Logic.TwoThresholdRandomGradientDto): boolean[] {
        const resolved = resolveDto(Inputs.Logic.TwoThresholdRandomGradientDto, inputs) as Resolved.Logic.TwoThresholdRandomGradientDto;
        const booleans: boolean[] = [];
        resolved.numbers.forEach(n => {
            if (n < resolved.thresholdTotalTrue) {
                booleans.push(true);
            } else if (n > resolved.thresholdTotalFalse) {
                booleans.push(false);
            } else {
                const leveledNr = n - resolved.thresholdTotalTrue;
                const step = (resolved.thresholdTotalFalse - resolved.thresholdTotalTrue) / resolved.nrLevels;
                const whichCat = Math.ceil(leveledNr / step);
                const bound = whichCat / resolved.nrLevels;
                const random = Math.random();
                if (random > bound) {
                    booleans.push(true);
                } else {
                    booleans.push(false);
                }
            }
        });
        return booleans;
    }

    /**
     * Turns numbers into booleans: true below the threshold, false at or above it.
     *
     * `inverse` flips every result.
     * Example: [0.3, 0.7, 0.5] with threshold 0.6 -> [true, false, true]
     * @param inputs - The numbers, the threshold and whether to flip the result
     * @returns One boolean per number
     * @group create
     * @shortname threshold boolean list
     * @drawable false
     * @example
     * ```typescript
     * const below = bitbybit.logic.thresholdBooleanList({ numbers: [0.3, 0.7, 0.5], threshold: 0.6, inverse: false });
     * ```
     */
    thresholdBooleanList(inputs: Inputs.Logic.ThresholdBooleanListDto): boolean[] {
        const resolved = resolveDto(Inputs.Logic.ThresholdBooleanListDto, inputs) as Resolved.Logic.ThresholdBooleanListDto;
        const booleans: boolean[] = [];
        resolved.numbers.forEach(n => {
            if (n < resolved.threshold) {
                booleans.push(true);
            } else {
                booleans.push(false);
            }
        });
        if (resolved.inverse) {
            return booleans.map(b => !b);
        }
        return booleans;
    }

    /**
     * Turns numbers into booleans: true when the number falls inside any of the given ranges, false
     * otherwise.
     *
     * Each range is `[min, max]` with both ends included; `inverse` flips every result.
     * Example: [0.2, 0.5, 0.8] with ranges [[0.3, 0.6], [0.7, 0.9]] -> [false, true, true]
     * @param inputs - The numbers, the ranges and whether to flip the result
     * @returns One boolean per number
     * @group create
     * @shortname threshold gaps boolean list
     * @drawable false
     * @example
     * ```typescript
     * const inside = bitbybit.logic.thresholdGapsBooleanList({
     *     numbers: [0.2, 0.5, 0.8],
     *     gapThresholds: [[0.3, 0.6], [0.7, 0.9]],
     *     inverse: false,
     * });
     * ```
     */
    thresholdGapsBooleanList(inputs: Inputs.Logic.ThresholdGapsBooleanListDto): boolean[] {
        const resolved = resolveDto(Inputs.Logic.ThresholdGapsBooleanListDto, inputs) as Resolved.Logic.ThresholdGapsBooleanListDto;
        const booleans: boolean[] = [];

        resolved.numbers.forEach(n => {
            let foundInThresholds = false;
            resolved.gapThresholds.forEach(t => {
                const min = t[0];
                const max = t[1];
                if (n >= min && n <= max) {
                    booleans.push(true);
                    foundInThresholds = true;
                }
            });
            if (!foundInThresholds) {
                booleans.push(false);
            }
        });
        if (resolved.inverse) {
            return booleans.map(b => !b);
        }
        return booleans;
    }

    /**
     * Flips a boolean: true becomes false and false becomes true.
     *
     * Example: true -> false
     * @param inputs - The boolean
     * @returns The opposite boolean
     * @group edit
     * @shortname not
     * @drawable false
     */
    not(inputs: Inputs.Logic.BooleanDto): boolean {
        const resolved = resolveDto(Inputs.Logic.BooleanDto, inputs) as Resolved.Logic.BooleanDto;
        return !resolved.boolean;
    }

    /**
     * Flips every boolean in a list.
     *
     * Example: [true, false, true] -> [false, true, false]
     * @param inputs - The booleans
     * @returns The flipped booleans, in the same order
     * @group edit
     * @shortname not list
     * @drawable false
     */
    notList(inputs: Inputs.Logic.BooleanListDto): boolean[] {
        return inputs.booleans.map(b => !b);
    }

    /**
     * Compares two values with an operator: less, less or equal, greater, greater or equal, equal
     * or not equal, in the loose (`==`) or strict (`===`) form.
     *
     * Example: 5 greater than 3 -> true; 'hello' strictly equal to 'world' -> false
     * @param inputs - The two values and the operator
     * @returns The result of the comparison
     * @group operations
     * @shortname compare
     * @drawable false
     * @example
     * ```typescript
     * const bigger = bitbybit.logic.compare({ first: 5, second: 3, operator: Bit.Inputs.Logic.BooleanOperatorsEnum.greater });
     * ```
     */
    compare<T>(inputs: Inputs.Logic.ComparisonDto<T>): boolean {
        const resolved = resolveDto(Inputs.Logic.ComparisonDto, inputs) as Resolved.Logic.ComparisonDto<T>;
        switch (resolved.operator) {
            case Inputs.Logic.BooleanOperatorsEnum.equal:
                return resolved.first == resolved.second;
            case Inputs.Logic.BooleanOperatorsEnum.notEqual:
                return resolved.first != resolved.second;
            case Inputs.Logic.BooleanOperatorsEnum.tripleEqual:
                return resolved.first === resolved.second;
            case Inputs.Logic.BooleanOperatorsEnum.tripleNotEqual:
                return resolved.first !== resolved.second;
            case Inputs.Logic.BooleanOperatorsEnum.less:
                return resolved.first < resolved.second;
            case Inputs.Logic.BooleanOperatorsEnum.lessOrEqual:
                return resolved.first <= resolved.second;
            case Inputs.Logic.BooleanOperatorsEnum.greater:
                return resolved.first > resolved.second;
            case Inputs.Logic.BooleanOperatorsEnum.greaterOrEqual:
                return resolved.first >= resolved.second;
            default:
                return false;
        }
    }

    /**
     * Lets a value through when the boolean is true and gives undefined when it is false.
     *
     * Example: 42 with true -> 42; 42 with false -> undefined
     * @param inputs - The value and the boolean that opens the gate
     * @returns The value, or undefined when the gate is closed
     * @group operations
     * @shortname value gate
     * @drawable false
     * @example
     * ```typescript
     * const maybe = bitbybit.logic.valueGate({ value: 42, boolean: true });
     * ```
     */
    valueGate<T>(inputs: Inputs.Logic.ValueGateDto<T>): T | undefined {
        const resolved = resolveDto(Inputs.Logic.ValueGateDto, inputs) as Resolved.Logic.ValueGateDto<T>;
        return resolved.boolean ? resolved.value : undefined;
    }

    /**
     * Picks the first of two values that is defined, so the second acts as a fallback.
     *
     * Example: 42 and 10 -> 42; undefined and 10 -> 10
     * @param inputs - The preferred value and the fallback
     * @returns The first defined value, or undefined when both are missing
     * @group operations
     * @shortname first defined value gate
     * @drawable false
     * @example
     * ```typescript
     * const chosen = bitbybit.logic.firstDefinedValueGate({ value1: undefined, value2: 10 });
     * ```
     */
    firstDefinedValueGate<T, U>(inputs: Inputs.Logic.TwoValueGateDto<T, U>): T | U | undefined {
        let res;
        if (inputs.value1 !== undefined) {
            res = inputs.value1;
        } else if (inputs.value2 !== undefined) {
            res = inputs.value2;
        } else {
            res = undefined;
        }
        return res;
    }

}
