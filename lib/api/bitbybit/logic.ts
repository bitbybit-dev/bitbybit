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
