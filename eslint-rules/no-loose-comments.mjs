const DIRECTIVE = /^\s*(eslint\b|eslint-|globals?\b|exported\b|@ts-|ts-|istanbul\b|c8\b|v8\b|node:coverage|prettier-ignore|@license|@preserve|#__PURE__|webpack|@vite-|@rollup)/;
const NOTICE = /\b(copyright|licen[cs]e|SPDX-)\b|©/i;
const STEP_MARKER = /^ ?(Arrange|Act|Assert|Act & Assert|Arrange & Act) ?$/;
const JSDOC_MODE = { PUBLIC_API: "public-api", NONE: "none" };
const PRIVATE_ACCESS = new Set(["private"]);
const DECLARATIONS = new Set([
    "ClassDeclaration",
    "FunctionDeclaration",
    "TSDeclareFunction",
    "TSInterfaceDeclaration",
    "TSTypeAliasDeclaration",
    "TSEnumDeclaration",
    "TSModuleDeclaration",
    "VariableDeclaration",
]);
const CLASS_ELEMENTS = new Set([
    "MethodDefinition",
    "PropertyDefinition",
    "AccessorProperty",
    "TSAbstractMethodDefinition",
    "TSAbstractPropertyDefinition",
    "TSAbstractAccessorProperty",
    "TSIndexSignature",
]);
const TYPE_MEMBERS = new Set([
    "TSPropertySignature",
    "TSMethodSignature",
    "TSIndexSignature",
    "TSCallSignatureDeclaration",
    "TSConstructSignatureDeclaration",
]);
const TYPE_OWNERS = new Set(["TSInterfaceDeclaration", "TSTypeAliasDeclaration"]);

function isJsDoc(comment) {
    return comment.type === "Block" && comment.value.startsWith("*");
}

function declaredNames(declaration) {
    if (declaration.type === "VariableDeclaration") {
        return declaration.declarations.filter((one) => one.id.type === "Identifier").map((one) => one.id.name);
    }
    return declaration.id?.type === "Identifier" ? [declaration.id.name] : [];
}

function exportedNamesOf(program) {
    const names = new Set();
    for (const statement of program.body) {
        if (statement.type === "ExportNamedDeclaration" && statement.declaration === null && statement.source === null) {
            statement.specifiers.forEach((specifier) => names.add(specifier.local.name));
        }
        if (statement.type === "ExportDefaultDeclaration" && statement.declaration.type === "Identifier") {
            names.add(statement.declaration.name);
        }
    }
    return names;
}

export default {
    meta: {
        type: "suggestion",
        docs: { description: "Allow JSDoc on the public API, tool directives and notices; report every other comment." },
        schema: [{
            type: "object",
            properties: {
                allowArrangeActAssert: { type: "boolean" },
                jsDoc: { enum: [JSDOC_MODE.PUBLIC_API, JSDOC_MODE.NONE] },
                allowLines: { type: "array", items: { type: "string" } },
                documentsAssembledDeclaration: { type: "boolean" },
            },
            additionalProperties: false,
        }],
        messages: {
            loose: "Say it in the code - a name, a constant, a function - or in the documentation. A note beside the logic is a second description that nothing checks, and it drifts.",
            looseInTest: "A test may carry the three step markers - `// Arrange`, `// Act`, `// Assert` - and nothing else. Say the rest in the name of the `it` that runs it, or in a named value or helper the reader can check.",
            notPublic: "JSDoc belongs to the public API: an exported declaration or a public member of one. What this block says belongs in the code or in the package's documentation.",
            stacked: "Only the last JSDoc block before a declaration documents it; this one is read by nothing.",
        },
    },
    create(context) {
        const options = context.options[0] ?? {};
        const allowSteps = options.allowArrangeActAssert === true;
        const jsDocMode = options.jsDoc ?? JSDOC_MODE.PUBLIC_API;
        const allowedLines = (options.allowLines ?? []).map((pattern) => new RegExp(pattern));
        const documentsAssembled = options.documentsAssembledDeclaration === true;
        let declaresNothing = false;
        const sourceCode = context.sourceCode;
        const documenting = new Set();
        const stacked = new Set();
        let exportedNames = new Set();

        function isPublicDeclaration(declaration) {
            const parent = declaration.parent;
            if (parent?.type === "ExportNamedDeclaration" || parent?.type === "ExportDefaultDeclaration") {
                const block = parent.parent;
                return block?.type !== "TSModuleBlock" || isPublicDeclaration(block.parent);
            }
            if (parent?.type === "Program") {
                return declaredNames(declaration).some((name) => exportedNames.has(name));
            }
            return false;
        }

        function ownerDeclaration(node) {
            let current = node.parent;
            while (current) {
                if (DECLARATIONS.has(current.type)) {
                    return current;
                }
                if (CLASS_ELEMENTS.has(current.type)) {
                    return current;
                }
                current = current.parent;
            }
            return undefined;
        }

        function isPublicClassElement(element) {
            if (PRIVATE_ACCESS.has(element.accessibility) || element.key?.type === "PrivateIdentifier") {
                return false;
            }
            const owner = ownerDeclaration(element);
            return owner?.type === "ClassDeclaration" && isPublicDeclaration(owner);
        }

        function isPublicTypeMember(member) {
            const owner = ownerDeclaration(member);
            if (owner === undefined) {
                return false;
            }
            if (TYPE_OWNERS.has(owner.type) || DECLARATIONS.has(owner.type)) {
                return isPublicDeclaration(owner);
            }
            return isPublicClassElement(owner);
        }

        function isPublicProperty(property) {
            let current = property.parent;
            while (current?.type === "ObjectExpression" || current?.type === "Property" || current?.type === "TSAsExpression" || current?.type === "TSSatisfiesExpression") {
                current = current.parent;
            }
            return current?.type === "VariableDeclarator" && isPublicDeclaration(current.parent);
        }

        function isPublicParameterProperty(parameter) {
            if (PRIVATE_ACCESS.has(parameter.accessibility)) {
                return false;
            }
            const constructor = parameter.parent?.parent;
            return constructor?.type === "MethodDefinition" && isPublicClassElement(constructor);
        }

        function documents(node) {
            const blocks = sourceCode.getCommentsBefore(node).filter(isJsDoc);
            blocks.slice(0, -1).forEach((block) => stacked.add(block));
            if (blocks.length > 0) {
                documenting.add(blocks[blocks.length - 1]);
            }
        }

        const visitWhen = (isPublic) => (node) => {
            if (isPublic(node)) {
                documents(node);
            }
        };

        const visitors = {};
        if (jsDocMode === JSDOC_MODE.PUBLIC_API) {
            const visitDeclaration = visitWhen((node) => node.parent?.type === "Program" && isPublicDeclaration(node));
            DECLARATIONS.forEach((type) => {
                visitors[type] = visitDeclaration;
            });
            visitors.ExportNamedDeclaration = visitWhen((node) => node.parent?.type !== "TSModuleBlock" || isPublicDeclaration(node.parent.parent));
            visitors.ExportDefaultDeclaration = documents;
            CLASS_ELEMENTS.forEach((type) => {
                visitors[type] = visitWhen((node) => (node.parent?.type === "ClassBody" ? isPublicClassElement(node) : isPublicTypeMember(node)));
            });
            TYPE_MEMBERS.forEach((type) => {
                if (!CLASS_ELEMENTS.has(type)) {
                    visitors[type] = visitWhen(isPublicTypeMember);
                }
            });
            visitors.TSEnumMember = visitWhen((node) => isPublicDeclaration(node.parent.type === "TSEnumBody" ? node.parent.parent : node.parent));
            visitors.Property = visitWhen(isPublicProperty);
            visitors.TSParameterProperty = visitWhen(isPublicParameterProperty);
        }

        return {
            Program(program) {
                exportedNames = exportedNamesOf(program);
                declaresNothing = program.body.every((statement) => statement.type === "ImportDeclaration");
            },
            ...visitors,
            "Program:exit"() {
                for (const comment of sourceCode.getAllComments()) {
                    if (comment.type === "Hashbang" || comment.type === "Shebang") {
                        continue;
                    }
                    if (DIRECTIVE.test(comment.value)) {
                        continue;
                    }
                    if (NOTICE.test(comment.value)) {
                        continue;
                    }
                    if (allowSteps && comment.type === "Line" && STEP_MARKER.test(comment.value)) {
                        continue;
                    }
                    if (comment.type === "Line" && allowedLines.some((pattern) => pattern.test(comment.value))) {
                        continue;
                    }
                    if (isJsDoc(comment)) {
                        if (documenting.has(comment)) {
                            continue;
                        }
                        if (documentsAssembled && declaresNothing) {
                            continue;
                        }
                        context.report({ loc: comment.loc, messageId: stacked.has(comment) ? "stacked" : "notPublic" });
                        continue;
                    }
                    context.report({ loc: comment.loc, messageId: allowSteps ? "looseInTest" : "loose" });
                }
            },
        };
    },
};
