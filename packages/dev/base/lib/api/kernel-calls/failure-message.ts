import type { KernelFailureDetail, KernelFailureDetails } from "./errors";

/**
 * Writes a list the way English does: `3`, `3 and 7`, `3, 7 and 9`.
 * @param items - The items, already written out
 * @returns The list
 */
export function englishList(items: readonly string[]): string {
    if (items.length <= 1) {
        return items.join("");
    }
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]!}`;
}

function detailText(value: KernelFailureDetail, formatList: (items: readonly string[]) => string): string {
    if (Array.isArray(value)) {
        return formatList(value.map((item: string | number) => String(item)));
    }
    return String(value);
}

/**
 * Fills a failure's message template with its details: each `{name}` becomes the detail of that name,
 * a list written by `formatList`. A placeholder with no detail stays as it is, so no text is lost. A
 * host that translates a failure by its code fills its own template with the failure's details, and
 * passes a list formatter for its language, such as `new Intl.ListFormat("de").format`.
 * @param template - The template, such as the translation of a failure's English message
 * @param details - The failure's details, or undefined when it has none
 * @param formatList - Writes a list in the template's language; English by default
 * @returns The message
 */
export function fillFailureMessage(template: string, details: KernelFailureDetails | undefined, formatList: (items: readonly string[]) => string = englishList): string {
    if (details === undefined) {
        return template;
    }
    return template.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (placeholder: string, name: string) => {
        const value = Object.prototype.hasOwnProperty.call(details, name) ? details[name] : undefined;
        return value === undefined ? placeholder : detailText(value, formatList);
    });
}
