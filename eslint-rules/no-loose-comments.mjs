/**
 * A comment beside the logic is a second description of it that nothing checks, so it drifts: the
 * code is changed, the note is not, and the next reader believes the note. This rule allows the
 * kinds that are not that.
 *
 * JSDoc is allowed everywhere, because on these packages it is not commentary at all - it is read by
 * tooling to build the published API surface, and the dotted paths and tag values it carries are
 * persisted in users' saved work. Deleting it silently changes what a saved script resolves to,
 * which is why this rule has NO fixer: nothing here may rewrite a source file, and no `--fix` run
 * can ever take that corpus away.
 *
 * Directives are allowed because they are instructions to a tool rather than prose - an
 * `eslint-disable`, a `@ts-expect-error`, a coverage ignore - and removing one changes behaviour.
 *
 * A hashbang is allowed: it is what makes a CLI executable, and the parser only reports it here
 * because it happens to look like a comment.
 *
 * A licence or attribution notice is allowed: third-party material is carried here under terms that
 * require its notice to travel with it, so deleting one is a licence violation and not a tidy-up.
 *
 * A comment that is the whole content of an empty block is allowed, because the reason this rule
 * exists does not apply to it. Prose drifts from code by sitting next to code that changes; a
 * `catch { }` whose only content is why the error is ignored has no code beside it to drift from,
 * and the alternative is a bare empty block that says nothing at all.
 *
 * With `allowArrangeActAssert`, the three step markers of a test are allowed and nothing else is.
 * They are structure rather than description: they say which part of the test a line belongs to, and
 * a marker cannot drift from the code because it makes no claim about it. The marker must be the
 * whole comment - a trailing clause is prose again, and prose is what this rule is for.
 *
 * Everything else is reported and left alone. The fix is to make the code say it: name the value, or
 * extract the step into a function whose name is the sentence the comment wanted to write. Where a
 * genuine explanation has to survive, it belongs in the JSDoc of the thing it explains, or - in a
 * test - in the name of the `it` that runs it.
 */
const DIRECTIVE = /^\s*(eslint\b|eslint-|globals?\b|exported\b|@ts-|ts-|istanbul\b|c8\b|v8\b|node:coverage|prettier-ignore|@license|@preserve|#__PURE__|webpack|@vite-|@rollup)/;
const NOTICE = /\b(copyright|licen[cs]e|SPDX-)\b|©/i;
const STEP_MARKER = /^ ?(Arrange|Act|Assert|Act & Assert|Arrange & Act) ?$/;

export default {
    meta: {
        type: "suggestion",
        docs: { description: "Allow JSDoc and tool directives; report free-form comments." },
        schema: [{
            type: "object",
            properties: { allowArrangeActAssert: { type: "boolean" } },
            additionalProperties: false,
        }],
        messages: {
            loose: "Say it in the code, or in the JSDoc of the thing it describes. A note beside the logic is a second description that nothing checks, and it drifts.",
            looseInTest: "A test may carry the three step markers - `// Arrange`, `// Act`, `// Assert` - and nothing else. Say the rest in the name of the `it` that runs it, or in a named value or helper the reader can check.",
        },
    },
    create(context) {
        const allowSteps = context.options[0]?.allowArrangeActAssert === true;
        return {
            Program() {
                for (const comment of context.sourceCode.getAllComments()) {
                    if (comment.type === "Hashbang" || comment.type === "Shebang") continue;
                    if (comment.type === "Block" && comment.value.startsWith("*")) continue;
                    if (DIRECTIVE.test(comment.value)) continue;
                    if (NOTICE.test(comment.value)) continue;
                    if (allowSteps && comment.type === "Line" && STEP_MARKER.test(comment.value)) continue;
                    const holder = context.sourceCode.getNodeByRangeIndex(comment.range[0]);
                    if (holder?.type === "BlockStatement" && holder.body.length === 0) continue;
                    context.report({ loc: comment.loc, messageId: allowSteps ? "looseInTest" : "loose" });
                }
            },
        };
    },
};
