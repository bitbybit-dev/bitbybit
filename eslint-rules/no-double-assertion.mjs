// A double assertion - `x as unknown as T`, or the angle-bracket form - is not a narrowing. The
// first cast widens the value until the compiler has nothing left to check, and the second declares
// what it is. Whatever the type system knew is discarded, so the assertion is unfalsifiable: the
// declared type can be wrong in every way and the build stays green.
//
// The honest alternatives, in the order worth trying:
//   - a type predicate (`function isFoo(x: unknown): x is Foo`), so the check and the type agree;
//   - a generic constrained to the union, so an argument narrows within it rather than escaping it;
//   - fixing the type the cast is arguing with, which is usually the real finding.
//
// A single `as` is untouched here. It can only move within an assignable pair, so the compiler is
// still holding one end of it.

const WIDENING = new Map([
    ["TSUnknownKeyword", "unknown"],
    ["TSAnyKeyword", "any"],
]);

/** @type {import("eslint").Rule.RuleModule} */
export default {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow double type assertions, which replace a type rather than narrow it",
        },
        schema: [],
        messages: {
            doubleAssertion:
                "Double assertion through `{{ via }}` discards the type instead of narrowing it, so `{{ target }}` is asserted, never checked. Use a type predicate, constrain a generic to the union, or fix the type this is fighting.",
        },
    },
    create(context) {
        const source = context.sourceCode;

        const report = (node) => {
            const inner = node.expression;
            if (inner?.type !== "TSAsExpression" && inner?.type !== "TSTypeAssertion") {
                return;
            }
            const via = WIDENING.get(inner.typeAnnotation?.type);
            if (via === undefined) {
                return;
            }
            context.report({
                node,
                messageId: "doubleAssertion",
                data: { via, target: source.getText(node.typeAnnotation) },
            });
        };

        return { TSAsExpression: report, TSTypeAssertion: report };
    },
};
