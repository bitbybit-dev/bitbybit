const WIDENING = new Map([
    ["TSUnknownKeyword", "unknown"],
    ["TSAnyKeyword", "any"],
]);

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
