import { describe, it, expect } from "vitest";
import { ExpressionError, evaluateExpression, namesIn, parseExpression } from "./expressions";

const valueOf = (text: string, values: Record<string, number | string> = {}): number | string => evaluateExpression(parseExpression(text), new Map(Object.entries(values)));

const failureOf = (run: () => unknown): ExpressionError => {
    try {
        run();
    } catch (error) {
        if (error instanceof ExpressionError) {
            return error;
        }
        throw error;
    }
    throw new Error("nothing was thrown");
};

describe("design expressions", () => {
    describe("reading", () => {
        it("should bind powers tighter than signs, signs tighter than products and products tighter than sums", () => {
            // Act
            const values = ["2 + 3 * 4", "(2 + 3) * 4", "2 ^ 3 ^ 2", "-2 ^ 2", "2 ^ -1", "10 - 4 - 3", "12 / 3 / 2", "+5 - -5", "--3"].map(text => valueOf(text));

            // Assert
            expect(values).toEqual([14, 20, 512, -4, 0.5, 3, 2, 10, 3]);
        });

        it("should read every form of number", () => {
            // Act
            const values = ["7", "2.5", ".5", "3.", "1e3", "2.5E-1", "4e+1"].map(text => valueOf(text));

            // Assert
            expect(values).toEqual([7, 2.5, 0.5, 3, 1000, 0.25, 40]);
        });

        it("should take angles in degrees and give inverse functions in degrees", () => {
            // Act
            const values = ["sin(30)", "cos(60)", "tan(45)", "asin(0.5)", "acos(0.5)", "atan(1)", "atan2(1, -1)"].map(text => valueOf(text));

            // Assert
            expect(values.map(value => Number(Number(value).toFixed(12)))).toEqual([0.5, 0.5, 1, 30, 60, 45, 135]);
        });

        it("should apply the other functions and know pi", () => {
            // Act
            const values = ["min(3, 2)", "max(3, 2)", "abs(-4)", "sqrt(16)", "round(2.5)", "floor(-1.5)", "ceil(1.2)", "pi"].map(text => valueOf(text));

            // Assert
            expect(values).toEqual([2, 3, 4, 4, 3, -2, 2, Math.PI]);
        });

        it("should read parameters by name and list each name once, without constants", () => {
            // Arrange
            const tree = parseExpression("width * 2 + max(width, depth_2) - pi + -height");

            // Act
            const names = namesIn(tree);
            const value = evaluateExpression(tree, new Map([["width", 3], ["depth_2", 5], ["height", 1]]));

            // Assert
            expect(names).toEqual(["width", "depth_2", "height"]);
            expect(value).toBeCloseTo(6 + 5 - Math.PI - 1, 12);
        });
    });

    describe("conditions and text", () => {
        it("should compare and combine into 1 and 0, below sums and above nothing", () => {
            // Act
            const values = ["1 + 2 > 2", "2 >= 2", "2 < 2", "2 <= 2", "3 == 3", "3 != 3", "1 < 2 && 2 < 1", "1 < 2 || 2 < 1", "!0", "!5", "1 || 0 && 0", "2 * 3 == 6 != 0", "1 < 2 == 1"].map(text => valueOf(text));

            // Assert
            expect(values).toEqual([1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1]);
        });

        it("should compare text with text and choose between values with if", () => {
            // Arrange
            const values = { finish: "anodized", count: 3 };

            // Act
            const results = ["finish == 'anodized'", "finish != 'raw'", "if(count > 2, 'many', 'few')", "if(finish == 'raw', 1, 2)", "'a' == 1", "''"].map(text => valueOf(text, values));

            // Assert
            expect(results).toEqual([1, 1, "many", 2, 0, ""]);
        });

        it("should evaluate only the branch if takes and only as much of a condition as decides it", () => {
            // Act
            const values = ["if(1, 2, 1 / 0)", "if(0, nope, 3)", "0 && nope", "1 || nope"].map(text => valueOf(text));

            // Assert
            expect(values).toEqual([2, 3, 0, 1]);
        });

        it("should list names read inside conditions and calls", () => {
            // Act
            const names = namesIn(parseExpression("!a && if(b == 'x', c, -d)"));

            // Assert
            expect(names).toEqual(["a", "b", "c", "d"]);
        });
    });

    describe("refusing", () => {
        it("should say where an expression stops making sense", () => {
            // Act
            const failures = ["2 +", "(1 + 2", "1 2", "3 $ 4", "foo(1)", "min()", "sin(1, 2)", ")", "max(1,)", "if(1, 2)"].map(text => failureOf(() => parseExpression(text)));

            // Assert
            expect(failures.map(failure => [failure.message, failure.position])).toEqual([
                ["the expression ends too soon", 3],
                ["\")\" is missing", 6],
                ["\"2\" is left over after the expression", 2],
                ["\"$\" is not part of an expression", 2],
                ["\"foo\" is not a function expressions know", 0],
                ["\"min\" takes at least 1 value, not 0", 0],
                ["\"sin\" takes 1 value, not 2", 0],
                ["\")\" cannot start a value", 0],
                ["\")\" cannot start a value", 6],
                ["\"if\" takes 3 values, not 2", 0],
            ]);
        });

        it("should refuse text where a number is needed and quoted text that does not end", () => {
            // Act
            const arithmetic = failureOf(() => valueOf("finish + 1", { finish: "raw" }));
            const negated = failureOf(() => valueOf("-finish", { finish: "raw" }));
            const condition = failureOf(() => valueOf("finish && 1", { finish: "raw" }));
            const notted = failureOf(() => valueOf("!finish", { finish: "raw" }));
            const ordered = failureOf(() => valueOf("finish < 'z'", { finish: "raw" }));
            const called = failureOf(() => valueOf("abs(finish)", { finish: "raw" }));
            const chosen = failureOf(() => valueOf("if(finish, 1, 2)", { finish: "raw" }));
            const unclosed = failureOf(() => parseExpression("finish == 'raw"));
            const single = failureOf(() => parseExpression("a = 1"));

            // Assert
            expect([arithmetic, negated, called].map(failure => failure.message)).toEqual(Array(3).fill("text cannot be used in arithmetic"));
            expect([condition, notted, chosen].map(failure => failure.message)).toEqual(Array(3).fill("text cannot be used in a condition"));
            expect(ordered.message).toBe("text cannot be used in arithmetic");
            expect([unclosed.message, unclosed.position]).toEqual(["the quoted text has no closing '", 10]);
            expect([single.message, single.position]).toEqual(["\"=\" is not part of an expression", 2]);
        });

        it("should refuse a name without a value and a result that is not finite", () => {
            // Act
            const unknown = failureOf(() => valueOf("width + 1"));
            const division = failureOf(() => valueOf("1 / 0"));
            const root = failureOf(() => valueOf("sqrt(-1)"));

            // Assert
            expect(unknown.message).toBe("\"width\" is not a parameter");
            expect(division.message).toBe("\"/\" gives Infinity, not a finite number");
            expect(root.message).toBe("sqrt() gives NaN, not a finite number");
        });

        it("should read a function's empty argument list before refusing its arity", () => {
            // Act
            const failure = failureOf(() => parseExpression("pi()"));

            // Assert
            expect(failure.message).toBe("\"pi\" is not a function expressions know");
        });
    });

    describe("limits and names", () => {
        it("should refuse an expression longer than the limit or nested deeper, and read one at the limit", () => {
            // Arrange
            const longest = `1${"+1".repeat(999)}`;
            const deepest = `${"(".repeat(64)}1${")".repeat(64)}`;

            // Act
            const tooLong = failureOf(() => parseExpression(`${longest}+1`));
            const tooDeep = failureOf(() => parseExpression(`(${deepest})`));
            const tooManySigns = failureOf(() => parseExpression(`${"-".repeat(65)}1`));
            const tooManyCalls = failureOf(() => parseExpression(`${"abs(".repeat(65)}1${")".repeat(65)}`));

            // Assert
            expect(longest).toHaveLength(1999);
            expect(valueOf(longest)).toBe(1000);
            expect(valueOf(deepest)).toBe(1);
            expect(tooLong.message).toBe("an expression is at most 2000 characters long: put parts of it in parameters");
            expect(tooDeep.message).toBe("parentheses, calls and signs nest at most 64 deep");
            expect(tooManySigns.message).toBe("parentheses, calls and signs nest at most 64 deep");
            expect(tooManyCalls.message).toBe("parentheses, calls and signs nest at most 64 deep");
        });

        it("should treat names objects inherit, such as constructor, as parameters like any other", () => {
            // Act
            const names = namesIn(parseExpression("constructor + toString * __proto__ + pi"));
            const unknown = failureOf(() => valueOf("constructor + 1"));
            const known = valueOf("constructor + toString", { constructor: 2, toString: 3 });

            // Assert
            expect(names).toEqual(["constructor", "toString", "__proto__"]);
            expect(unknown.message).toBe("\"constructor\" is not a parameter");
            expect(known).toBe(5);
        });

        it("should list the names of an expression in the order they are first read", () => {
            // Arrange
            const text = Array.from({ length: 400 }, (_, index) => `p${index}`).join("+");

            // Act
            const names = namesIn(parseExpression(text));

            // Assert
            expect(names).toHaveLength(400);
            expect(names[0]).toBe("p0");
            expect(names[399]).toBe("p399");
        });
    });

    describe("exact angles, finite steps, rounding and reserved names", () => {
        it("should give degree trigonometry exactly at multiples of 30 and 45 degrees, whatever the turn", () => {
            // Act
            const values = ["sin(30)", "cos(60)", "cos(90)", "tan(45)", "sin(-30)", "sin(390)", "sin(135)", "cos(180)", "tan(-135)", "floor(tan(45))", "sin(30) == 0.5"].map(text => valueOf(text));

            // Assert
            expect(values).toEqual([0.5, 0.5, 0, 1, -0.5, 0.5, Math.SQRT1_2, -1, 1, 1, 1]);
            expect(Object.is(valueOf("sin(180)"), 0)).toBe(true);
        });

        it("should give other angles as the library does, folded into one turn first", () => {
            // Act
            const tenth = valueOf("sin(10)");
            const far = valueOf("cos(3610)");

            // Assert
            expect(tenth).toBeCloseTo(Math.sin(Math.PI / 18), 15);
            expect(far).toBeCloseTo(Math.cos(Math.PI / 18), 15);
        });

        it("should invert the exact values to whole angles", () => {
            // Act
            const angles = ["asin(0.5)", "asin(-1)", "acos(0)", "acos(-0.5)", "acos(1)", "asin(sin(45))"].map(text => valueOf(text));

            // Assert
            expect(angles).toEqual([30, -90, 90, 120, 0, 45]);
        });

        it("should refuse a step that is not finite, even inside a condition", () => {
            // Act
            const hidden = failureOf(() => valueOf("if(0 / 0 > 0, 1, 2)"));
            const steep = failureOf(() => valueOf("tan(90)"));
            const huge = failureOf(() => valueOf("10 ^ 400 - 10 ^ 400"));

            // Assert
            expect(hidden.message).toBe("\"/\" gives NaN, not a finite number");
            expect(steep.message).toBe("tan() gives Infinity, not a finite number");
            expect(huge.message).toBe("\"^\" gives Infinity, not a finite number");
        });

        it("should round halves away from zero", () => {
            // Act
            const values = ["round(2.5)", "round(-2.5)", "round(0.5)", "round(-1.4)"].map(text => valueOf(text));

            // Assert
            expect(values).toEqual([3, -3, 1, -1]);
            expect(Object.is(valueOf("round(-0.4)"), 0)).toBe(true);
        });

        it("should read true, false, e and tau as constants, and keep inf and nan reserved", () => {
            // Act
            const constants = ["true", "false", "e", "tau", "true && !false"].map(text => valueOf(text));
            const reserved = failureOf(() => valueOf("inf"));

            // Assert
            expect(constants).toEqual([1, 0, Math.E, 2 * Math.PI, 1]);
            expect(reserved.message).toBe("\"inf\" is reserved and has no value");
            expect(namesIn(parseExpression("e * width + inf + nan"))).toEqual(["width"]);
        });

        it("should take any number of values in min and max", () => {
            // Act
            const values = ["min(3, 1, 2)", "max(4)", "max(1, 9, 3, 7)"].map(text => valueOf(text));

            // Assert
            expect(values).toEqual([1, 4, 9]);
        });
    });
});
