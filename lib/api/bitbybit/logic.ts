import * as Inputs from "../inputs/inputs";

/**
 * Contains various logic methods.
 */
export class Logic {

    /**
     * Creates a boolean value - true or false
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
     * Creates a random boolean list of predefined length
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
     * Creates a random boolean list of true and false values based on a list of numbers. 
     * All values between true threshold will be true, all values above false threshold will be false, 
     * and the rest will be distributed between true and false based on the number of levels in a gradient pattern.
     * That means that the closer the number gets to the false threshold the bigger the chance will be to get random false value.
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
     * Creates a boolean list based on a list of numbers and a threshold.
     * @param inputs a length and a threshold for randomization of true values
     * @returns booleans
     * @group create
     * @shortname threshold boolean list
     * @drawable false
     */
    thresholdBooleanListDto(inputs: Inputs.Logic.ThresholdBooleanListDto): boolean[] {
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
     * Creates a boolean list based on a list of numbers and a gap thresholds. Gap thresholds are pairs of numbers that define a range of numbers that will be true.
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
     * Apply not operator on the boolean
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
     * Apply not operator on a list of booleans
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
     * Does comparison between first and second values
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
     * Transmits a value if boolean provided is true and undefined if boolean provided is false
     * @param inputs a value and a boolean value
     * @returns value or undefined
     * @group operations
     * @shortname value gate
     * @drawable false
     */
    valueGate<T>(inputs: Inputs.Logic.ValueGateDto<T>): T | undefined {
        return inputs.boolean ? inputs.value : undefined;
    }

}
