import * as Inputs from "../inputs";

/**
 * Contains various logic methods.
 */
export class Logic {

    /**
     * Creates and returns a boolean value (pass-through for boolean input).
     * Example: true → true, false → false
     * @param inputs a true or false boolean
     * @returns boolean
     * @group create
     * @shortname boolean
     * @drawable false
     */
    boolean(inputs: Inputs.Logic.BooleanDto): boolean {
        return inputs.boolean;
    }

    /**
     * Generates a random boolean list where each value has a threshold chance of being true.
     * Example: length=5, threshold=0.7 → might produce [true, true, false, true, true]
     * @param inputs a length and a threshold for randomization of true values
     * @returns booleans
     * @group create
     * @shortname random booleans
     * @drawable false
     */
    randomBooleans(inputs: Inputs.Logic.RandomBooleansDto): boolean[] {
        const booleans = [];
        for (let i = 0; i < inputs.length; i++) {
            booleans.push(Math.random() < inputs.trueThreshold);
        }
        return booleans;
    }

    /**
     * Converts numbers to booleans using two thresholds with gradient randomization between them.
     * Values below trueThreshold → always true, above falseThreshold → always false.
     * Between thresholds → probability gradient (closer to false threshold = higher chance of false).
     * Example: [0.1, 0.4, 0.6, 0.9] with thresholds [0.3, 0.7] → [true, gradient, gradient, false]
     * @param inputs a length and a threshold for randomization of true values
     * @returns booleans
     * @group create
     * @shortname 2 threshold random gradient
     * @drawable false
     */
    twoThresholdRandomGradient(inputs: Inputs.Logic.TwoThresholdRandomGradientDto): boolean[] {
        const booleans = [];
        inputs.numbers.forEach(n => {
            if (n < inputs.thresholdTotalTrue) {
                booleans.push(true);
            } else if (n > inputs.thresholdTotalFalse) {
                booleans.push(false);
            } else {
                const leveledNr = n - inputs.thresholdTotalTrue;
                const step = (inputs.thresholdTotalFalse - inputs.thresholdTotalTrue) / inputs.nrLevels;
                const whichCat = Math.ceil(leveledNr / step);
                const bound = whichCat / inputs.nrLevels;
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
     * Converts numbers to booleans based on a threshold (below threshold → true, above → false).
     * Can be inverted to flip the logic.
     * Example: [0.3, 0.7, 0.5] with threshold=0.6 → [true, false, true]
     * @param inputs a length and a threshold for randomization of true values
     * @returns booleans
     * @group create
     * @shortname threshold boolean list
     * @drawable false
     */
    thresholdBooleanList(inputs: Inputs.Logic.ThresholdBooleanListDto): boolean[] {
        const booleans = [];
        inputs.numbers.forEach(n => {
            if (n < inputs.threshold) {
                booleans.push(true);
            } else {
                booleans.push(false);
            }
        });
        if (inputs.inverse) {
            return booleans.map(b => !b);
        }
        return booleans;
    }

    /**
     * Converts numbers to booleans using multiple range thresholds (gaps define true ranges).
     * Values within any gap range → true, outside all gaps → false. Can be inverted.
     * Example: [0.2, 0.5, 0.8] with gaps [[0.3, 0.6], [0.7, 0.9]] → [false, true, true]
     * @param inputs a length and a threshold for randomization of true values
     * @returns booleans
     * @group create
     * @shortname threshold gaps boolean list
     * @drawable false
     */
    thresholdGapsBooleanList(inputs: Inputs.Logic.ThresholdGapsBooleanListDto): boolean[] {
        const booleans = [];

        inputs.numbers.forEach(n => {
            let foundInThresholds = false;
            inputs.gapThresholds.forEach(t => {
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
        if (inputs.inverse) {
            return booleans.map(b => !b);
        }
        return booleans;
    }

    /**
     * Applies NOT operator to flip a boolean value.
     * Example: true → false, false → true
     * @param inputs a true or false boolean
     * @returns boolean
     * @group edit
     * @shortname not
     * @drawable false
     */
    not(inputs: Inputs.Logic.BooleanDto): boolean {
        return !inputs.boolean;
    }

    /**
     * Applies NOT operator to flip all boolean values in a list.
     * Example: [true, false, true] → [false, true, false]
     * @param inputs a list of true or false booleans
     * @returns booleans
     * @group edit
     * @shortname not list
     * @drawable false
     */
    notList(inputs: Inputs.Logic.BooleanListDto): boolean[] {
        return inputs.booleans.map(b => !b);
    }

    /**
     * Compares two values using various operators (==, !=, ===, !==, <, <=, >, >=).
     * Example: 5 > 3 → true, "hello" === "world" → false
     * @param inputs two values to be compared
     * @returns Result of the comparison
     * @group operations
     * @shortname compare
     * @drawable false
     */
    compare<T>(inputs: Inputs.Logic.ComparisonDto<T>): boolean {
        switch (inputs.operator) {
            case "==":
                return inputs.first == inputs.second;
            case "!=":
                return inputs.first != inputs.second;
            case "===":
                return inputs.first === inputs.second;
            case "!==":
                return inputs.first !== inputs.second;
            case "<":
                return inputs.first < inputs.second;
            case "<=":
                return inputs.first <= inputs.second;
            case ">":
                return inputs.first > inputs.second;
            case ">=":
                return inputs.first >= inputs.second;
            default:
                return false;
        }
    }

    /**
     * Conditionally passes a value through if boolean is true, otherwise returns undefined.
     * Example: value=42, boolean=true → 42, value=42, boolean=false → undefined
     * @param inputs a value and a boolean value
     * @returns value or undefined
     * @group operations
     * @shortname value gate
     * @drawable false
     */
    valueGate<T>(inputs: Inputs.Logic.ValueGateDto<T>): T | undefined {
        return inputs.boolean ? inputs.value : undefined;
    }

    /**
     * Returns the first defined (non-undefined) value from two options (fallback pattern).
     * Example: value1=42, value2=10 → 42, value1=undefined, value2=10 → 10
     * @param inputs two values
     * @returns value or undefined
     * @group operations
     * @shortname first defined value gate
     * @drawable false
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
