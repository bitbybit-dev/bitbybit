/**
 * Tiny dependency-free XML parser, scoped to what SVG needs.
 *
 * Runs anywhere (web worker, Node, browser) without relying on DOMParser, which
 * is unavailable in workers. It is deliberately lenient: it skips comments,
 * CDATA, processing instructions and DOCTYPE, decodes the basic entities, and
 * produces a simple element tree. It does not validate.
 */

export interface XmlNode {
    /** Local tag name, lowercased (namespace prefix stripped). */
    tag: string;
    /** Attribute map; names kept verbatim (e.g. "xlink:href"). */
    attrs: { [k: string]: string };
    children: XmlNode[];
}

function decodeEntities(s: string): string {
    if (s.indexOf("&") === -1) { return s; }
    return s
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&apos;/g, "'")
        .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
        .replace(/&amp;/g, "&");
}

function localName(name: string): string {
    const colon = name.indexOf(":");
    return (colon >= 0 ? name.slice(colon + 1) : name).toLowerCase();
}

function parseAttrs(raw: string): { [k: string]: string } {
    const attrs: { [k: string]: string } = {};
    const re = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) !== null) {
        const value = m[3] !== undefined ? m[3] : (m[4] !== undefined ? m[4] : "");
        attrs[m[1]] = decodeEntities(value);
    }
    return attrs;
}

/** Parse an XML/SVG string into a root element tree (or undefined if none). */
export function parseXml(input: string): XmlNode | undefined {
    let i = 0;
    const n = input.length;
    const root: XmlNode = { tag: "#root", attrs: {}, children: [] };
    const stack: XmlNode[] = [root];

    while (i < n) {
        const lt = input.indexOf("<", i);
        if (lt === -1) { break; }
        i = lt;

        if (input.startsWith("<!--", i)) {
            const end = input.indexOf("-->", i + 4);
            i = end === -1 ? n : end + 3;
            continue;
        }
        if (input.startsWith("<![CDATA[", i)) {
            const end = input.indexOf("]]>", i + 9);
            i = end === -1 ? n : end + 3;
            continue;
        }
        if (input.startsWith("<?", i)) {
            const end = input.indexOf("?>", i + 2);
            i = end === -1 ? n : end + 2;
            continue;
        }
        if (input.startsWith("<!", i)) {
            // DOCTYPE or similar; skip to matching '>'.
            const end = input.indexOf(">", i + 2);
            i = end === -1 ? n : end + 1;
            continue;
        }

        const gt = input.indexOf(">", i);
        if (gt === -1) { break; }
        const inner = input.slice(i + 1, gt).trim();
        i = gt + 1;

        if (inner.startsWith("/")) {
            // Closing tag.
            if (stack.length > 1) { stack.pop(); }
            continue;
        }

        const selfClosing = inner.endsWith("/");
        const body = selfClosing ? inner.slice(0, -1).trim() : inner;
        const spaceIdx = body.search(/\s/);
        const rawName = spaceIdx === -1 ? body : body.slice(0, spaceIdx);
        const attrStr = spaceIdx === -1 ? "" : body.slice(spaceIdx + 1);

        const node: XmlNode = {
            tag: localName(rawName),
            attrs: parseAttrs(attrStr),
            children: [],
        };
        stack[stack.length - 1].children.push(node);
        if (!selfClosing) { stack.push(node); }
    }

    return root.children[0];
}
