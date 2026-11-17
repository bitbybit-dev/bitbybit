import { describe, it, expect } from "vitest";
import { InputError } from "../../../../kernel-calls";
import { parseXml } from "./svg-xml";

describe("svg xml parser", () => {
    it("should not end a tag at a > inside a quoted attribute", () => {
        // Act
        const root = parseXml("<svg><g label=\"a > b\" id=\"g\"><rect width=\"5\"/></g></svg>");

        // Assert
        const group = root!.children[0]!;
        expect(group.attrs).toEqual({ label: "a > b", id: "g" });
        expect(group.children.map((c) => c.tag)).toEqual(["rect"]);
    });

    it("should read unquoted attribute values, a self-closing slash included", () => {
        // Act
        const root = parseXml("<svg><rect width=5 height=7/><circle r=2></circle></svg>");

        // Assert
        expect(root!.children.map((c) => c.tag)).toEqual(["rect", "circle"]);
        expect(root!.children[0]!.attrs).toEqual({ width: "5", height: "7" });
    });

    it("should keep the text of a <style>, a CDATA section included and its markup left as written", () => {
        // Act
        const root = parseXml("<svg><style>.a{fill:red}<![CDATA[ .b > .c{fill:blue} ]]>&amp;</style><rect/></svg>");

        // Assert
        expect(root!.children[0]!.text).toBe(".a{fill:red} .b > .c{fill:blue} &");
        expect(root!.children.map((c) => c.tag)).toEqual(["style", "rect"]);
    });

    it("should not read markup inside a <script>", () => {
        // Act
        const root = parseXml("<svg><script>if (a<b) { x = '<rect/>'; }</script><circle r=\"1\"/></svg>");

        // Assert
        expect(root!.children.map((c) => c.tag)).toEqual(["script", "circle"]);
    });

    it("should expand the entities a DOCTYPE declares", () => {
        // Act
        const root = parseXml("<!DOCTYPE svg [<!ENTITY st0 \"fill:none;stroke:#000\">]><svg><rect style=\"&st0;\"/></svg>");

        // Assert
        expect(root!.children[0]!.attrs["style"]).toBe("fill:none;stroke:#000");
    });

    it("should step over the quoted identifiers of a public DOCTYPE, a > inside one included", () => {
        // Act
        const root = parseXml("<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" 'http://example.com/a>b.dtd'><svg><rect/></svg>");

        // Assert
        expect(root!.tag).toBe("svg");
        expect(root!.children.map((c) => c.tag)).toEqual(["rect"]);
    });

    it("should read an entity declared in single quotes, keep the first of two declarations and never redeclare a built-in one", () => {
        // Act
        const root = parseXml("<!DOCTYPE svg [<!ENTITY st 'fill:red'><!ENTITY st \"fill:blue\"><!ENTITY lt \"x\">]><svg><rect style=\"&st;\" id=\"&lt;\"/></svg>");

        // Assert
        expect(root!.children[0]!.attrs).toEqual({ style: "fill:red", id: "<" });
    });

    it("should keep an attribute written without a value as empty, and step over a stray = or / between attributes", () => {
        // Act
        const root = parseXml("<svg><rect = hidden / width=\"2\"/></svg>");

        // Assert
        expect(root!.children[0]!.attrs).toEqual({ hidden: "", "/": "", width: "2" });
    });

    it.each([
        ["a quoted value", "<svg><rect/><circle r=\"1\" "],
        ["an attribute name", "<svg><rect/><circle r"],
        ["an unquoted value", "<svg><rect/><circle r=1"],
    ])("should leave out an element whose start tag the document ends inside, within %s", (_where, xml) => {
        // Act
        const root = parseXml(xml);

        // Assert
        expect(root!.children.map((c) => c.tag)).toEqual(["rect"]);
    });

    it("should stop reading at an end tag the document ends inside", () => {
        // Act
        const root = parseXml("<svg><g><rect/></g");

        // Assert
        expect(root!.children.map((c) => c.tag)).toEqual(["g"]);
        expect(root!.children[0]!.children.map((c) => c.tag)).toEqual(["rect"]);
    });

    it("should read on past an end tag that only starts with the <style> name", () => {
        // Act
        const root = parseXml("<svg><style>.a{fill:red}</stylesheet>.b{fill:blue}</style><rect/></svg>");

        // Assert
        expect(root!.children[0]!.text).toBe(".a{fill:red}</stylesheet>.b{fill:blue}");
        expect(root!.children.map((c) => c.tag)).toEqual(["style", "rect"]);
    });

    it("should read a <style> the document never closes to its end", () => {
        // Act
        const root = parseXml("<svg><style>.a{fill:red}");

        // Assert
        expect(root!.children.map((c) => [c.tag, c.text])).toEqual([["style", ".a{fill:red}"]]);
    });

    it("should resolve the namespace of each element from the declarations in scope", () => {
        // Act
        const root = parseXml("<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:inkscape=\"urn:ink\"><inkscape:grid/><rect/></svg>");

        // Assert
        expect(root!.namespace).toBe("http://www.w3.org/2000/svg");
        expect(root!.children[0]!.prefix).toBe("inkscape");
        expect(root!.children[0]!.namespace).toBe("urn:ink");
        expect(root!.children[1]!.namespace).toBe("http://www.w3.org/2000/svg");
    });

    it("should resolve the namespace of each prefixed attribute from the declarations in scope, its own element's included", () => {
        // Act
        const root = parseXml("<svg xmlns:a=\"urn:a\"><g a:label=\"x\" xmlns:b=\"urn:b\" b:mode=\"y\" c:other=\"z\" plain=\"w\"><rect a:label=\"v\"/></g><g a:label=\"u\" xmlns:a=\"urn:other\"/></svg>");

        // Assert
        const [group, redeclared] = root!.children;
        expect({ ...group!.attrNamespaces }).toEqual({ "a:label": "urn:a", "b:mode": "urn:b" });
        expect({ ...group!.children[0]!.attrNamespaces }).toEqual({ "a:label": "urn:a" });
        expect({ ...redeclared!.attrNamespaces }).toEqual({ "a:label": "urn:other" });
        expect(root!.attrNamespaces).toBeUndefined();
    });

    it("should close an element by its own end tag when one inside it was left open", () => {
        // Act
        const root = parseXml("<svg><g><p></g><rect/></svg>");

        // Assert
        expect(root!.children.map((c) => c.tag)).toEqual(["g", "rect"]);
    });

    it("should refuse a document nested deeper than it reads with an input error", () => {
        // Arrange
        const deep = `<svg>${"<g>".repeat(20000)}<rect/>${"</g>".repeat(20000)}</svg>`;

        // Act & Assert
        expect(() => parseXml(deep)).toThrow(InputError);
        expect(() => parseXml(deep)).toThrow(/more than 256 deep/);
    });

    it("should read a document nested as deep as it allows", () => {
        // Arrange
        const deep = `<svg>${"<g>".repeat(255)}<rect/>${"</g>".repeat(255)}</svg>`;

        // Act
        const root = parseXml(deep);

        // Assert
        expect(root!.tag).toBe("svg");
    });
});

describe("svg xml parser on large and malformed documents", () => {
    const LARGE_INPUT_TIMEOUT = 2_000;
    const nestedEntities = (levels: number): string => [
        "<!ENTITY l0 \"lol\">",
        ...Array.from({ length: levels }, (_, k) => `<!ENTITY l${k + 1} "${`&l${k};`.repeat(10)}">`),
    ].join("");

    it("should refuse entities that expand into each other past what it reads with an input error", () => {
        // Arrange
        const svg = `<!DOCTYPE svg [${nestedEntities(7)}]><svg><path d="&l7;"/></svg>`;

        // Act & Assert
        expect(() => parseXml(svg)).toThrow(InputError);
        expect(() => parseXml(svg)).toThrow(/entities expand/);
    });

    it("should refuse a flat entity referenced so often that the references expand past what it reads", () => {
        // Arrange
        const svg = `<!DOCTYPE svg [<!ENTITY big "${"x".repeat(10_000)}">]><svg>${"<rect id=\"&big;\"/>".repeat(1_000)}</svg>`;

        // Act & Assert
        expect(() => parseXml(svg)).toThrow(InputError);
    });

    it("should read entities referenced within its budget, an entity built from another included", () => {
        // Arrange
        const svg = `<!DOCTYPE svg [<!ENTITY c "#f00"><!ENTITY st "fill:&c;">]><svg>${"<rect style=\"&st;\"/>".repeat(2_000)}</svg>`;

        // Act
        const root = parseXml(svg);

        // Assert
        expect(root!.children).toHaveLength(2_000);
        expect(root!.children.every((c) => c.attrs["style"] === "fill:#f00")).toBe(true);
    });

    it("should leave a reference to a name every object inherits as written", () => {
        // Act
        const root = parseXml("<!DOCTYPE svg [<!ENTITY a \"1\">]><svg><rect id=\"&constructor;&toString;&__proto__;\"/></svg>");

        // Assert
        expect(root!.children[0]!.attrs["id"]).toBe("&constructor;&toString;&__proto__;");
    });

    it("should read a character reference past the last code point as the replacement character", () => {
        // Act
        const root = parseXml("<svg><rect id=\"&#x110000;&#99999999999999;&#x41;\"/></svg>");

        // Assert
        expect(root!.children[0]!.attrs["id"]).toBe("\uFFFD\uFFFDA");
    });

    it("should keep an attribute named after a name every object inherits as an attribute of its own", () => {
        // Act
        const root = parseXml("<svg><rect __proto__=\"a\" constructor=\"b\"/><circle/></svg>");

        // Assert
        expect(Object.keys(root!.children[0]!.attrs)).toEqual(["__proto__", "constructor"]);
        expect(root!.children[0]!.attrs["__proto__"]).toBe("a");
        expect(root!.children[1]!.attrs["constructor"]).toBeUndefined();
    });

    it("should find the end of a <style> whose prefix is regular expression syntax", () => {
        // Act
        const root = parseXml("<svg><a[:style>.c{fill:red}</A[:STYLE ><rect/></svg>");

        // Assert
        expect(root!.children.map((c) => c.tag)).toEqual(["style", "rect"]);
        expect(root!.children[0]!.text).toBe(".c{fill:red}");
    });

    it("should step over a long run that almost closes a <style> named with a nested quantifier", () => {
        // Arrange
        const svg = `<svg><(a+)+:style>.c{fill:red}</${"a".repeat(27)}!</(a+)+:style><rect/></svg>`;

        // Act
        const root = parseXml(svg);

        // Assert
        expect(root!.children.map((c) => c.tag)).toEqual(["style", "rect"]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read a <style> full of unterminated CDATA openings in time linear in its length", () => {
        // Arrange
        const svg = `<svg><style>${"<![CDATA[".repeat(60_000)}</style><rect/></svg>`;

        // Act
        const root = parseXml(svg);

        // Assert
        expect(root!.children.map((c) => c.tag)).toEqual(["style", "rect"]);
    }, LARGE_INPUT_TIMEOUT);
});

describe("svg xml parser, elements and attributes", () => {
    it("parses nested elements and attributes", () => {
        const root = parseXml("<svg width=\"10\"><g id=\"a\"><rect x=\"1\"/></g></svg>");
        expect(root?.tag).toBe("svg");
        expect(root?.attrs["width"]).toBe("10");
        expect(root?.children[0]!.tag).toBe("g");
        expect(root?.children[0]!.children[0]!.tag).toBe("rect");
    });

    it("handles single-quoted attributes", () => {
        const root = parseXml("<svg><rect x='3' y='4'/></svg>");
        expect(root?.children[0]!.attrs["x"]).toBe("3");
        expect(root?.children[0]!.attrs["y"]).toBe("4");
    });

    it("skips comments, CDATA, PI and DOCTYPE; decodes entities", () => {
        const root = parseXml("<?xml version='1.0'?><!DOCTYPE svg><svg><!-- c --><![CDATA[x]]><text>a &amp; b</text></svg>");
        expect(root?.tag).toBe("svg");
        expect(root?.children[0]!.tag).toBe("text");
    });

    it("strips namespace prefixes from tag names", () => {
        const root = parseXml("<svg:svg><svg:rect/></svg:svg>");
        expect(root?.tag).toBe("svg");
        expect(root?.children[0]!.tag).toBe("rect");
    });

    it("returns undefined when there is no element", () => {
        expect(parseXml("not xml at all")).toBeUndefined();
    });
});
