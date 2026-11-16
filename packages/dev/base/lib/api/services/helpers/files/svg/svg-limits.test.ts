import { describe, it, expect } from "vitest";
import { InputError } from "../../../../kernel-calls";
import { normalizeSvg } from "./svg-normalizer";
import type { SvgScene } from "./svg-scene-types";
import { parseXml } from "./svg-xml";

const LARGE_INPUT_TIMEOUT = 20_000;
const NS = "xmlns=\"http://www.w3.org/2000/svg\"";
const svgOf = (body: string, prolog = ""): string => `${prolog}<svg ${NS}>${body}</svg>`;
const segmentsOf = (scene: SvgScene): number => scene.elements.reduce((sum, e) => sum + e.subpaths.reduce((count, sp) => count + sp.segments.length, 0), 0);
const numbersOf = (scene: SvgScene): number[] => scene.elements.flatMap((e) => e.subpaths.flatMap((sp) => [...sp.start, ...sp.segments.flatMap((s) => [...s.to])]));
const doubled = (levels: number, leaf: string): string => {
    const groups = Array.from({ length: levels }, (_, k) => `<g id="l${k + 1}"><use href="#l${k}"/><use href="#l${k}" x="1"/></g>`);
    return svgOf(`<defs><g id="l0">${leaf}</g>${groups.join("")}</defs><use href="#l${levels}"/>`);
};
const segmentsWarning = (capacity: number): string =>
    `The SVG holds more than ${capacity} path segments once its <use> references are expanded, more than the importer builds from a file of its size; the rest is not imported.`;

describe("svg xml on large and malformed documents", () => {
    const entities = (declarations: string): string => `<!DOCTYPE svg [${declarations}]>`;

    it("should refuse entities that expand into each other past the size limit with an input error", () => {
        // Arrange
        const nested = ["<!ENTITY e0 \"M0 0L1 1\">", ...Array.from({ length: 9 }, (_, k) => `<!ENTITY e${k + 1} "${`&e${k};`.repeat(10)}">`)].join("");

        // Act & Assert
        expect(() => parseXml(svgOf("<path d=\"&e9;\"/>", entities(nested)))).toThrow(InputError);
    }, LARGE_INPUT_TIMEOUT);

    it("should refuse a small file whose entities expand past the sixty-four thousand characters it reads from it", () => {
        // Arrange
        const prolog = entities(`<!ENTITY a "${"l1 1 1 -1 ".repeat(10)}"><!ENTITY b "${"&a;".repeat(10)}"><!ENTITY c "${"&b;".repeat(10)}">`);
        const svg = svgOf(`<path d="M0 0 ${"&c;".repeat(10)}"/>`, prolog);

        // Act & Assert
        expect(svg.length).toBeLessThan(400);
        expect(() => parseXml(svg)).toThrow(new InputError("The SVG's entities expand to more than 65536 characters, more than the importer reads from a file of its size; replace the entity references with their text and import it again.", "svg"));
    });

    it("should let a larger file expand its entities in proportion to its size", () => {
        // Arrange
        const prolog = entities(`<!ENTITY a "${"l1 1 1 -1 ".repeat(10)}"><!ENTITY b "${"&a;".repeat(10)}"><!ENTITY c "${"&b;".repeat(10)}">`);
        const svg = svgOf(`<path d="M0 0 ${"&c;".repeat(10)}"/><desc>${" ".repeat(20_000)}</desc>`, prolog);

        // Act
        const root = parseXml(svg);

        // Assert
        expect(root!.children[0]!.attrs["d"]).toHaveLength("M0 0 ".length + 100_000);
    });

    it("should read character references of a hundred thousand digits as replacement characters", () => {
        // Act
        const root = parseXml(svgOf(`<path id="&#x${"f".repeat(100_000)};&#${"9".repeat(100_000)};" d="M0 0L1 1"/>`));

        // Assert
        expect(root!.children[0]!.attrs["id"]).toBe("��");
    }, LARGE_INPUT_TIMEOUT);

    it("should read a document type whose entity declarations never end without hanging", () => {
        // Act
        const root = parseXml(`<!DOCTYPE svg [${"<!ENTITY a '".repeat(50_000)}`);

        // Assert
        expect(root).toBeUndefined();
    }, LARGE_INPUT_TIMEOUT);

    it("should read nothing after a comment that never closes", () => {
        // Act
        const scene = normalizeSvg(`<svg ${NS}><path d="M0 0L1 1"/><!--${"x".repeat(1_000_000)}`);

        // Assert
        expect(scene.elements).toHaveLength(1);
    }, LARGE_INPUT_TIMEOUT);

    it("should refuse a document nested two hundred thousand deep with an input error", () => {
        // Act & Assert
        expect(() => parseXml(svgOf("<g>".repeat(200_000)))).toThrow(InputError);
    }, LARGE_INPUT_TIMEOUT);

    it("should resolve the namespaces of elements that each declare one in time linear in the document", () => {
        // Arrange
        const prefixes = Array.from({ length: 30_000 }, (_, k) => ` xmlns:p${k}="urn:p"`).join("");
        const svg = `<svg ${NS}${prefixes}>${"<g xmlns:q=\"urn:q\"/>".repeat(30_000)}</svg>`;

        // Act
        const root = parseXml(svg);

        // Assert
        expect(root!.children).toHaveLength(30_000);
        expect(root!.children.every((child) => child.namespace === "http://www.w3.org/2000/svg")).toBe(true);
    }, LARGE_INPUT_TIMEOUT);

    it("should put a prefix an element declares out of scope when the element closes, an element left open inside it included", () => {
        // Act
        const root = parseXml("<svg xmlns:p=\"urn:outer\"><g xmlns:p=\"urn:inner\"><p:a/><b xmlns:p=\"urn:open\"><p:c/></g><p:d/></svg>");

        // Assert
        const g = root!.children[0]!;
        expect([g.children[0]!.namespace, g.children[1]!.children[0]!.namespace, root!.children[1]!.namespace]).toEqual(["urn:inner", "urn:open", "urn:outer"]);
    });
});

describe("svg walk on large and malformed documents", () => {
    it("should import no more path segments than a small file's budget however its <use> references multiply them", () => {
        // Arrange
        const svg = doubled(10, `<path d="M0 0${" l1 0".repeat(1_000)}"/>`);

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(svg.length).toBeLessThan(7_000);
        expect(segmentsOf(scene)).toBeLessThanOrEqual(25_000);
        expect(scene.warnings).toStrictEqual([segmentsWarning(25_000)]);
    }, LARGE_INPUT_TIMEOUT);

    it("should give a larger file a segment budget in proportion to its size, up to a ceiling", () => {
        // Arrange
        const padded = (padding: number): string => doubled(10, `<path d="M0 0${" l1 0".repeat(1_000)}"/><desc>${" ".repeat(padding)}</desc>`);

        // Act
        const middle = normalizeSvg(padded(30_000));
        const large = normalizeSvg(padded(200_000));

        // Assert
        expect(middle.warnings).toStrictEqual([segmentsWarning(2 * padded(30_000).length)]);
        expect(large.warnings).toStrictEqual([segmentsWarning(120_000)]);
        expect(segmentsOf(large)).toBeLessThanOrEqual(120_000);
    }, LARGE_INPUT_TIMEOUT);

    it("should count the line that closes a subpath among the segments it imports, and only when it draws one", () => {
        // Act
        const backAtStart = normalizeSvg(doubled(13, "<path d=\"M0 0h1l-1 1v-1z\"/>"));
        const closedByLine = normalizeSvg(doubled(13, "<path d=\"M0 0h1v1h-1z\"/>"));

        // Assert
        expect(backAtStart.warnings).toStrictEqual([]);
        expect(backAtStart.elements).toHaveLength(8_192);
        expect(closedByLine.warnings).toStrictEqual([segmentsWarning(25_000)]);
        expect(closedByLine.elements).toHaveLength(6_250);
    });

    it("should stop <use> references doubling forty levels deep within its budgets", () => {
        // Act
        const scene = normalizeSvg(doubled(40, "<path d=\"M0 0L1 1\"/>"));

        // Assert
        expect(scene.elements.length).toBeLessThanOrEqual(25_000);
        expect(scene.warnings).toHaveLength(1);
    }, LARGE_INPUT_TIMEOUT);

    it("should refuse <use> references that refer to each other in a cycle", () => {
        // Act
        const scene = normalizeSvg(svgOf("<g id=\"a\"><use href=\"#b\"/></g><g id=\"b\"><use href=\"#a\"/><path d=\"M0 0L1 1\"/></g>"));

        // Assert
        expect(scene.elements).toHaveLength(2);
        expect(scene.warnings).toStrictEqual(["A <use> refers to `#a`, which contains that <use> itself; it imports nothing."]);
    });

    it("should read the points of a polygon once however many viewports it is placed in", () => {
        // Arrange
        const viewports = Array.from({ length: 11_000 }, (_, k) => `<svg width="${k + 1}" height="1"><use href="#p"/></svg>`).join("");
        const svg = svgOf(`<defs><polygon id="p" points="0 0${" ".repeat(440_000)}"/></defs>${viewports}`);

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements).toHaveLength(0);
        expect(scene.warnings).toStrictEqual([]);
    }, LARGE_INPUT_TIMEOUT);

    it("should still size a basic shape by each viewport it is placed in", () => {
        // Act
        const scene = normalizeSvg(svgOf("<defs><rect id=\"r\" width=\"50%\" height=\"1\"/></defs><svg width=\"10\" height=\"10\"><use href=\"#r\"/></svg><svg width=\"30\" height=\"10\"><use href=\"#r\"/></svg>"));

        // Assert
        expect(scene.elements.map((e) => e.subpaths[0]!.segments[0]!.to[0])).toEqual([5, 15]);
    });

    it("should name a few of the elements it does not support and count the rest", () => {
        // Act
        const scene = normalizeSvg(svgOf(Array.from({ length: 50_000 }, (_, k) => `<x${k}/>`).join("")));

        // Assert
        expect(scene.warnings).toStrictEqual([
            ...Array.from({ length: 5 }, (_, k) => `<x${k}> is not supported and contributes no geometry.`),
            "49995 more kinds of element are not supported and contribute no geometry.",
        ]);
    }, LARGE_INPUT_TIMEOUT);

    it("should count a single kind of element past the named few in the singular", () => {
        // Act
        const scene = normalizeSvg(svgOf(Array.from({ length: 6 }, (_, k) => `<x${k}/>`).join("")));

        // Assert
        expect(scene.warnings.slice(5)).toStrictEqual(["1 more kind of element is not supported and contributes no geometry."]);
    });

    it("should stop importing elements nested more than five hundred and twelve levels deep once <use> references are expanded, and say so", () => {
        // Arrange
        const nested = (depth: number, inner: string): string => `${"<g>".repeat(depth)}${inner}${"</g>".repeat(depth)}`;
        const levels = `<g id="a"><rect width="1" height="1"/>${nested(200, "<circle r=\"1\"/>")}</g><g id="b">${nested(200, "<use href=\"#a\"/>")}</g><g id="c">${nested(200, "<use href=\"#b\"/>")}</g>`;

        // Act
        const scene = normalizeSvg(svgOf(`<defs>${levels}</defs><use href="#c"/>`));

        // Assert
        expect(scene.elements.map((e) => e.tag)).toEqual(["rect"]);
        expect(scene.warnings).toStrictEqual(["The SVG nests more than 512 levels once its <use> references are expanded; deeper elements are not imported."]);
    }, LARGE_INPUT_TIMEOUT);

    it("should make no elements of three hundred thousand moves that draw nothing", () => {
        // Act
        const scene = normalizeSvg(svgOf(`<path d="${"M0 0".repeat(300_000)}"/>`));

        // Assert
        expect(scene.elements).toHaveLength(0);
    }, LARGE_INPUT_TIMEOUT);

    it("should apply a transform list of a hundred thousand items", () => {
        // Act
        const scene = normalizeSvg(svgOf(`<path transform="${"translate(1) ".repeat(100_000)}" d="M0 0L1 1"/>`));

        // Assert
        expect(scene.elements[0]!.subpaths[0]!.start).toEqual([100_000, 0]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read a style attribute of a hundred thousand declarations", () => {
        // Act
        const scene = normalizeSvg(svgOf(`<path style="${"stroke:red;".repeat(100_000)}fill:blue" d="M0 0L1 1"/>`));

        // Assert
        expect(scene.elements[0]!.style).toMatchObject({ fill: "blue", stroke: "red" });
    }, LARGE_INPUT_TIMEOUT);

    it("should stop reading path data at a number too large for a double", () => {
        // Act
        const scene = normalizeSvg(svgOf("<path d=\"M0 0L1 1L1e400 1\"/>"));

        // Assert
        expect(numbersOf(scene)).toEqual([0, 0, 1, 1]);
    });

    it("should treat __proto__, constructor and toString as ordinary names of ids, attributes, CSS properties, entities and references", () => {
        // Arrange
        const prototypeNames = Object.getOwnPropertyNames(Object.prototype).sort();
        const svg = svgOf(
            "<style>#__proto__ { stroke: red } .constructor { __proto__: x; constructor: y } [toString] { fill: green }</style>"
            + "<g id=\"__proto__\"><path id=\"constructor\" class=\"constructor\" __proto__=\"&__proto__;\" toString=\"1\" style=\"constructor: z; fill: blue\" d=\"M0 0L1 1\"/></g>"
            + "<use href=\"#__proto__\"/><use href=\"#toString\"/>",
            "<!DOCTYPE svg [<!ENTITY __proto__ \"x\"><!ENTITY constructor \"y\">]>"
        );

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements.map((e) => [e.id, e.style.fill, e.style.stroke])).toEqual([["constructor", "blue", "red"], ["constructor", "blue", "red"]]);
        expect(scene.warnings).toStrictEqual(["A <use> refers to `#toString`, which the document does not hold; it imports nothing."]);
        expect(Object.getOwnPropertyNames(Object.prototype).sort()).toEqual(prototypeNames);
        expect(Reflect.get({}, "fill")).toBeUndefined();
    });
});

describe("svg css work limits on large stylesheets", () => {
    const stepsWarning = (capacity: number): string =>
        `The stylesheet takes more than ${capacity} steps to match against the document, more than the importer allows for a file of its size; the elements after that point are imported without its rules.`;
    const substringTests = (rules: number, valueLength: number): string => svgOf(`<style>${"[x*=ab]{fill:red}".repeat(rules)}</style><path x="${"a".repeat(valueLength)}" d="M0 0L1 1"/>`);

    it("should read at-rule statements followed by a long run of whitespace in time linear in its length", () => {
        // Act
        const scene = normalizeSvg(svgOf(`<style>${"@a;".repeat(200_000)}${" ".repeat(600_000)}</style><rect width="1" height="1"/>`));

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings).toStrictEqual(["These CSS rules cannot be matched and are not applied: `@a`."]);
    }, LARGE_INPUT_TIMEOUT);

    it("should stop matching a compound of twenty thousand attribute tests against as many elements, and say so", () => {
        // Arrange
        const svg = svgOf(`<style>${"[a]".repeat(20_000)}{fill:red}</style>${"<path a=\"\" d=\"M0 0L1 1\"/>".repeat(20_000)}`);

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.warnings).toStrictEqual([stepsWarning(64 * svg.length)]);
    }, LARGE_INPUT_TIMEOUT);

    it("should stop matching a compound of twenty thousand classes against as many elements, and say so", () => {
        // Arrange
        const svg = svgOf(`<style>${".a".repeat(20_000)}{fill:red}</style>${"<path class=\"a\" d=\"M0 0L1 1\"/>".repeat(20_000)}`);

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.warnings).toStrictEqual([stepsWarning(64 * svg.length)]);
    }, LARGE_INPUT_TIMEOUT);

    it("should count the characters an attribute test compares against a long value", () => {
        // Arrange
        const svg = substringTests(5_000, 100_000);

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements[0]!.style.fill).toBeUndefined();
        expect(scene.warnings).toStrictEqual([stepsWarning(64 * svg.length)]);
    }, LARGE_INPUT_TIMEOUT);

    it("should give a stylesheet a matching budget in proportion to the file, from a floor up to a ceiling", () => {
        // Arrange
        const small = substringTests(200, 20_000);
        const middle = substringTests(200, 100_000);
        const large = substringTests(100, 1_100_000);

        // Act
        const warnings = [small, middle, large].map((svg) => normalizeSvg(svg).warnings);

        // Assert
        expect(warnings).toStrictEqual([[stepsWarning(2_000_000)], [stepsWarning(64 * middle.length)], [stepsWarning(64_000_000)]]);
    }, LARGE_INPUT_TIMEOUT);

    it("should stop matching twenty thousand universal rules against twenty thousand elements within its budget", () => {
        // Arrange
        const svg = svgOf(`<style>${"*{fill:red}".repeat(20_000)}</style>${"<g/>".repeat(20_000)}`);

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.warnings).toStrictEqual([stepsWarning(64 * svg.length)]);
    }, LARGE_INPUT_TIMEOUT);

    it("should match a descendant selector two hundred and fifty groups deep against twenty thousand elements", () => {
        // Arrange
        const svg = svgOf(`<style>${"g ".repeat(250)}path{fill:red}</style>${"<g>".repeat(250)}${"<path d=\"M0 0L1 1\"/>".repeat(20_000)}${"</g>".repeat(250)}`);

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements).toHaveLength(20_000);
        expect(scene.elements.every((e) => e.style.fill === "red")).toBe(true);
        expect(scene.warnings).toStrictEqual([]);
    }, LARGE_INPUT_TIMEOUT);

    it("should skip at-rules nested a hundred thousand deep and apply the rules above them", () => {
        // Act
        const scene = normalizeSvg(svgOf(`<style>@media x { rect { fill: red } ${"@media x {".repeat(100_000)} rect { fill: blue } }</style><rect width="1" height="1"/>`));

        // Assert
        expect(scene.elements[0]!.style.fill).toBe("red");
        expect(scene.warnings).toStrictEqual(["These CSS rules cannot be matched and are not applied: `@media x`."]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read fifty thousand CDATA sections in a <style>", () => {
        // Act
        const scene = normalizeSvg(svgOf(`<style>${"<![CDATA[rect{fill:red}]]>".repeat(50_000)}</style><rect width="1" height="1"/>`));

        // Assert
        expect(scene.elements[0]!.style.fill).toBe("red");
        expect(scene.warnings).toStrictEqual([]);
    }, LARGE_INPUT_TIMEOUT);
});
