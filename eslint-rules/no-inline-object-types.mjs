const COMBINATIONS = new Set(["TSUnionType", "TSIntersectionType"]);

function isNamedShape(literal) {
    let parent = literal.parent;
    while (parent !== undefined && COMBINATIONS.has(parent.type)) {
        parent = parent.parent;
    }
    return parent?.type === "TSTypeAliasDeclaration";
}

export default {
    meta: {
        type: "suggestion",
        docs: {
            description: "Disallow object types written inline in a signature, a generic argument or a member; name them",
        },
        schema: [],
        messages: {
            inline: "Name this object type: declare an interface, or a type alias whose union or intersection it is a member of, and use the name here.",
        },
    },
    create(context) {
        return {
            TSTypeLiteral(node) {
                if (!isNamedShape(node)) {
                    context.report({ node, messageId: "inline" });
                }
            },
        };
    },
};
