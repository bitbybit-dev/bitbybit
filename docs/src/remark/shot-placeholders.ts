interface MdxNode {
    type: string;
    value?: string;
    name?: string;
    attributes?: MdxAttribute[];
    children?: MdxNode[];
}

interface MdxAttribute {
    type: string;
    name: string;
    value: string | { type: string; value: string; data?: unknown };
}

interface LocalEntry {
    id: string;
    kind: string;
}

const PLACEHOLDER = /^\/\* shot: ([a-z0-9.-]+\/[a-z0-9-]+(?: [a-z0-9.-]+\/[a-z0-9-]+)*) \*\/$/;
const GRID_COLUMNS = 3;

function expression(value: string, literal: unknown): MdxAttribute["value"] {
    return {
        type: "mdxJsxAttributeValueExpression",
        value,
        data: { estree: { type: "Program", sourceType: "module", body: [{ type: "ExpressionStatement", expression: literal }] } },
    };
}

function literalOf(value: string | number): unknown {
    return { type: "Literal", value, raw: JSON.stringify(value) };
}

function elementFor(ids: string[], kinds: ReadonlyMap<string, string>): MdxNode {
    if (ids.length === 1) {
        const name = kinds.get(ids[0] ?? "") === "file" ? "Download" : "Shot";
        return { type: "mdxJsxFlowElement", name, attributes: [{ type: "mdxJsxAttribute", name: "id", value: ids[0] ?? "" }], children: [] };
    }
    return {
        type: "mdxJsxFlowElement",
        name: "Shot",
        attributes: [
            { type: "mdxJsxAttribute", name: "ids", value: expression(JSON.stringify(ids), { type: "ArrayExpression", elements: ids.map(literalOf) }) },
            { type: "mdxJsxAttribute", name: "columns", value: expression(String(Math.min(ids.length, GRID_COLUMNS)), literalOf(Math.min(ids.length, GRID_COLUMNS))) },
        ],
        children: [],
    };
}

/**
 * Shows a page's shot placeholders while their images and files are only local candidates: a
 * {/* shot: <id> [<id> ...] *\/} comment whose ids are all in `entries` becomes <Shot id>, a <Shot ids> grid,
 * or <Download id> for a file. Loaded only by a local start with the candidates in place (LEARN_MEDIA_LOCAL=1),
 * never by a build.
 */
export default function shotPlaceholders(options: { entries: readonly LocalEntry[] }): (tree: MdxNode) => void {
    const kinds = new Map(options.entries.map((entry) => [entry.id, entry.kind]));
    const visit = (node: MdxNode): void => {
        node.children?.forEach((child, index) => {
            const list = child.type === "mdxFlowExpression" ? PLACEHOLDER.exec((child.value ?? "").trim())?.[1] : undefined;
            const ids = list?.split(" ") ?? [];
            if (ids.length > 0 && ids.every((id) => kinds.has(id)) && node.children !== undefined) {
                node.children[index] = elementFor(ids, kinds);
                return;
            }
            visit(child);
        });
    };
    return visit;
}
