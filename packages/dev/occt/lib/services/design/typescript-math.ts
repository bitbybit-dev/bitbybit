export const DEGREES = "Math.PI / 180";

/** A function a document's expressions compute differently from JavaScript's `Math`. */
export type MathHelper = "sin" | "cos" | "tan" | "asin" | "acos" | "round";

const MATH_ORDER: readonly MathHelper[] = ["sin", "cos", "tan", "asin", "acos", "round"];

const EXACT_TABLE = "[[0, 0], [30, 0.5], [45, Math.SQRT1_2], [60, Math.sqrt(3) / 2], [90, 1]]";

const INVERSE_TABLE = "[[0, 0], [0.5, 30], [Math.SQRT1_2, 45], [Math.sqrt(3) / 2, 60], [1, 90]]";

interface MathHelperCode {
    name: string;
    uses?: MathHelper;
    code: (names: ReadonlyMap<MathHelper, string>) => string;
}

export const MATH_HELPERS: Record<MathHelper, MathHelperCode> = {
    sin: {
        name: "sinDegrees",
        code: () => [
            "(degrees: number): number => {",
            "    const angle = ((degrees % 360) + 360) % 360 + 0;",
            "    const quarter = angle <= 90 ? angle : angle <= 180 ? 180 - angle : angle <= 270 ? angle - 180 : 360 - angle;",
            `    const exact = ${EXACT_TABLE}.find(([at]) => at === quarter);`,
            `    return exact === undefined ? Math.sin(angle * (${DEGREES})) : (angle > 180 ? -exact[1]! : exact[1]!) + 0;`,
            "}",
        ].join("\n"),
    },
    cos: { name: "cosDegrees", uses: "sin", code: names => `(degrees: number): number => ${names.get("sin")!}(degrees + 90)` },
    tan: { name: "tanDegrees", uses: "cos", code: names => `(degrees: number): number => ${names.get("sin")!}(degrees) / ${names.get("cos")!}(degrees)` },
    asin: {
        name: "asinDegrees",
        code: () => [
            "(value: number): number => {",
            `    const exact = ${INVERSE_TABLE}.find(([at]) => at === Math.abs(value));`,
            `    return exact === undefined ? Math.asin(value) / (${DEGREES}) : (value < 0 ? -exact[1]! : exact[1]!) + 0;`,
            "}",
        ].join("\n"),
    },
    acos: {
        name: "acosDegrees",
        code: () => [
            "(value: number): number => {",
            `    const exact = ${INVERSE_TABLE}.find(([at]) => at === Math.abs(value));`,
            `    return exact === undefined ? Math.acos(value) / (${DEGREES}) : value < 0 ? 90 + exact[1]! : 90 - exact[1]!;`,
            "}",
        ].join("\n"),
    },
    round: { name: "roundHalfAway", code: () => "(value: number): number => Math.sign(value) * Math.round(Math.abs(value)) + 0" },
};

/** The declarations of the maths helpers `names` gives names, in an order where each follows those it calls. */
export function mathHelperDeclarations(names: ReadonlyMap<MathHelper, string>): string[] {
    return [...names].sort(([a], [b]) => MATH_ORDER.indexOf(a) - MATH_ORDER.indexOf(b)).map(([kind, name]) => `const ${name} = ${MATH_HELPERS[kind].code(names)};`);
}

/** Whether a helper calls another, which must then be declared too. */
export function mathHelperUses(kind: MathHelper): MathHelper | undefined {
    return MATH_HELPERS[kind].uses;
}
