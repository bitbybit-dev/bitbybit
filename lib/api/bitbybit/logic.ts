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
