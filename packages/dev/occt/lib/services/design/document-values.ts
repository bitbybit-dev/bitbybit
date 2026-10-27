import { InputError } from "@bitbybit-dev/base";
import type * as Models from "../../api/models";
import { DesignProblem, pointer } from "./problems";
import { numberOf, parameterValues } from "./values";

function sentenceOf(problem: DesignProblem): string {
    return problem.path === "" ? `${problem.message.charAt(0).toUpperCase()}${problem.message.slice(1)}.` : `${problem.path}: ${problem.message}.`;
}

function asInputError<T>(read: () => T, propertyOf: (path: string) => string): T {
    try {
        return read();
    } catch (error) {
        if (error instanceof DesignProblem) {
            throw new InputError(sentenceOf(error), propertyOf(error.path));
        }
        throw error;
    }
}

function valuePropertyOf(path: string, overrides: Readonly<Record<string, unknown>> | undefined): string {
    if (path.startsWith("/configurations")) {
        return "configuration";
    }
    const overridden = Object.keys(overrides ?? {}).some(name => {
        const at = pointer("/parameters", name);
        return path === at || path.startsWith(`${at}/`);
    });
    return overridden ? "overrides" : "document";
}

/**
 * Works out the value of every parameter of a design document as `design.build` does: the
 * document's own values, replaced by those of `configuration` when given and then by `overrides`,
 * each expression evaluated after the parameters it reads. It needs no kernel, so a page can pose an
 * assembly between builds. A value that is not valid throws an input error that starts with the
 * JSON pointer of where it sits in the document and names `configuration`, `overrides` or
 * `document` as its property.
 * @param document - The part or assembly document
 * @param configuration - The id of one of its configurations
 * @param overrides - Values to use instead of the document's, by parameter name
 * @returns Every parameter's value by name, and `configuration`, the id given or ""
 * @beta
 */
export function designParameterValues(document: Models.OCCT.DesignDocument, configuration?: string, overrides?: Readonly<Record<string, number | string | boolean>>): Record<string, number | string> {
    return asInputError(() => Object.fromEntries(parameterValues(document.parameters, document.configurations, { configuration, overrides })), path => valuePropertyOf(path, overrides));
}

/**
 * Works out a number in a design document: a number as it is, or an expression over parameter values
 * such as `designParameterValues` gives, as `design.build` reads it. An expression that does not
 * give a number throws an input error naming `value` as its property.
 * @param value - The number or the expression
 * @param parameters - The parameter values the expression may read
 * @returns The number
 * @beta
 */
export function designNumber(value: Models.OCCT.DesignNumber, parameters: Readonly<Record<string, number | string>>): number {
    return asInputError(() => numberOf(value, new Map(Object.entries(parameters)), ""), () => "value");
}
