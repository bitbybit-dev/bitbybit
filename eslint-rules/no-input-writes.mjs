// A service method receives its caller's parameter object and must not write into it. The
// packages' one rule that holds everywhere - "nothing consumes what it was given" - exists because a
// configurator calls the same method again and again on the same object: a default written back
// onto `inputs` makes the second call differ from the first, and a caller who reuses the object gets
// a value it never set. The default belongs in a local (`const corners = inputs.corners ?? round`)
// or in a spread copy (`{ ...inputs, tolerance: inputs.tolerance ?? 1e-4 }`).
//
// Only a direct property of the parameter is reported (`inputs.x = ...`, `inputs.x ??= ...`). A
// write deeper down (`inputs.mesh.position = ...`) is the method doing its job on an engine object
// the caller handed over to be changed, and is left alone.

const PARAMETER_NAME = "inputs";

/** @type {import("eslint").Rule.RuleModule} */
export default {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow writing a property onto the `inputs` parameter object a method was handed",
        },
        schema: [],
        messages: {
            inputWrite:
                "`inputs.{{ property }}` is written; the caller's object must stay as it was handed over. Read the value into a local with its default, or spread a copy.",
        },
    },
    create(context) {
        const isInputsProperty = (node) =>
            node?.type === "MemberExpression" &&
            node.object.type === "Identifier" &&
            node.object.name === PARAMETER_NAME;

        const propertyName = (node) => (node.computed ? context.sourceCode.getText(node.property) : node.property.name);

        const report = (target) => {
            if (!isInputsProperty(target)) {
                return;
            }
            context.report({ node: target, messageId: "inputWrite", data: { property: propertyName(target) } });
        };

        return {
            AssignmentExpression(node) {
                report(node.left);
            },
            UpdateExpression(node) {
                report(node.argument);
            },
            UnaryExpression(node) {
                if (node.operator === "delete") {
                    report(node.argument);
                }
            },
        };
    },
};
