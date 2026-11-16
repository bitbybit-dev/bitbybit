import { describe, it, expect } from "vitest";
import type { Base } from "../../../../inputs/base-inputs";
import { normalizeSvg } from "./svg-normalizer";
import { fillsArea } from "./svg-style";
import type { SvgScene } from "./svg-scene-types";

const startsOf = (svg: string): number[][] => normalizeSvg(svg).elements.map((e) => e.subpaths[0]!.start);
const cornersOf = (scene: SvgScene, index = 0): Base.Point2[] => {
    const sp = scene.elements[index]!.subpaths[0]!;
    return [sp.start, ...sp.segments.map((s) => s.to)];
};

describe("svg <use> and <symbol>", () => {
    it("should place the referenced element at the <use> offset", () => {
        // Act
        const scene = normalizeSvg("<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\"><defs><rect id=\"r\" width=\"5\" height=\"5\" fill=\"red\"/></defs><use xlink:href=\"#r\" x=\"10\" y=\"20\"/><use href=\"#r\" transform=\"translate(100 0)\"/></svg>");

        // Assert
        expect(scene.elements.map((e) => e.subpaths[0]!.start)).toEqual([[10, 20], [100, 0]]);
        expect(scene.elements.map((e) => e.style.fill)).toEqual(["red", "red"]);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should let the referenced content inherit the <use> element's style", () => {
        // Act
        const scene = normalizeSvg("<svg><defs><g id=\"g\"><circle r=\"1\"/><rect fill=\"blue\" width=\"1\" height=\"1\"/></g></defs><use href=\"#g\" fill=\"green\"/></svg>");

        // Assert
        expect(scene.elements.map((e) => e.style.fill)).toEqual(["green", "blue"]);
    });

    it("should map a symbol's view box into the size the <use> gives it", () => {
        // Act
        const starts = startsOf("<svg><symbol id=\"s\" viewBox=\"0 0 10 10\"><rect x=\"5\" y=\"5\" width=\"5\" height=\"5\"/></symbol><use href=\"#s\" x=\"100\" width=\"20\" height=\"20\"/></svg>");

        // Assert
        expect(starts).toEqual([[110, 10]]);
    });

    it("should refuse a <use> that refers to an element containing it and say so", () => {
        // Act
        const scene = normalizeSvg("<svg><g id=\"a\"><rect width=\"1\" height=\"1\"/><use href=\"#a\" x=\"5\"/></g></svg>");

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings).toStrictEqual(["A <use> refers to `#a`, which contains that <use> itself; it imports nothing."]);
    });

    it("should refuse two <use> elements that refer to each other", () => {
        // Act
        const scene = normalizeSvg("<svg><defs><g id=\"a\"><use href=\"#b\"/></g><g id=\"b\"><rect width=\"1\" height=\"1\"/><use href=\"#a\"/></g></defs><use href=\"#a\"/></svg>");

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings[0]).toContain("contains that <use> itself");
    });

    it("should refuse a <use> that refers to the root it sits in and say so", () => {
        // Act
        const scene = normalizeSvg("<svg id=\"r\"><rect width=\"1\" height=\"1\"/><use href=\"#r\" x=\"10\"/></svg>");

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings).toStrictEqual(["A <use> refers to `#r`, which contains that <use> itself; it imports nothing."]);
    });

    it("should stop a document whose <use> references multiply a long path past the segments it imports", () => {
        // Arrange
        const path = `<path id="p" d="M0 0${" l1 0".repeat(1_000)}"/>`;
        const levels = Array.from({ length: 4 }, (_, k) => `<g id="l${k + 1}">${`<use href="#${k === 0 ? "p" : `l${k}`}"/>`.repeat(10)}</g>`);

        // Act
        const scene = normalizeSvg(`<svg><defs>${path}${levels.join("")}</defs><use href="#l4"/></svg>`);

        // Assert
        expect(scene.elements.reduce((sum, e) => sum + e.subpaths.reduce((count, sp) => count + sp.segments.length, 0), 0)).toBeLessThanOrEqual(25_000);
        expect(scene.warnings).toStrictEqual(["The SVG holds more than 25000 path segments once its <use> references are expanded, more than the importer builds from a file of its size; the rest is not imported."]);
    });

    it("should stop expanding <use> references nested deeper than it allows", () => {
        // Arrange
        const chain = Array.from({ length: 20 }, (_, i) => `<g id="u${i}"><use href="#u${i + 1}"/></g>`).join("");

        // Act
        const scene = normalizeSvg(`<svg><defs>${chain}<rect id="u20" width="1" height="1"/></defs><use href="#u0"/></svg>`);

        // Assert
        expect(scene.elements).toHaveLength(0);
        expect(scene.warnings).toStrictEqual(["<use> references nest more than 16 deep; deeper ones import nothing."]);
    });

    it("should stop a document whose <use> references expand exponentially", () => {
        // Arrange
        const levels = ["<g id=\"l0\"><desc/></g>", ...Array.from({ length: 8 }, (_, k) => `<g id="l${k + 1}">${`<use href="#l${k}"/>`.repeat(10)}</g>`)];

        // Act
        const scene = normalizeSvg(`<svg><defs>${levels.join("")}</defs><use href="#l8"/></svg>`);

        // Assert
        expect(scene.elements.length).toBeLessThan(500000);
        expect(scene.warnings).toStrictEqual(["The SVG holds more than 500000 elements once its <use> references are expanded; the rest is not imported."]);
    });

    it("should warn about a <use> whose target is missing or in another file", () => {
        // Act
        const scene = normalizeSvg("<svg><use href=\"#nothing\"/><use href=\"other.svg#a\"/></svg>");

        // Assert
        expect(scene.warnings).toStrictEqual([
            "A <use> refers to `#nothing`, which the document does not hold; it imports nothing.",
            "A <use> refers to another file (`other.svg#a`), which is not imported.",
        ]);
    });

    it("should import nothing and say nothing for a <use> that refers to nothing", () => {
        // Act
        const scene = normalizeSvg("<svg><use x=\"5\"/><use href=\"  \"/><rect width=\"1\" height=\"1\"/></svg>");

        // Assert
        expect(scene.elements.map((e) => e.tag)).toEqual(["rect"]);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should map a nested svg's view box into the size the <use> that places it gives", () => {
        // Act
        const scene = normalizeSvg("<svg><defs><svg id=\"v\" width=\"10\" height=\"10\" viewBox=\"0 0 100 100\" fill=\"red\"><rect width=\"100\" height=\"100\"/></svg></defs><use href=\"#v\" x=\"5\" width=\"20\" height=\"20\"/></svg>");

        // Assert
        expect(cornersOf(scene)).toEqual([[5, 0], [25, 0], [25, 20], [5, 20]]);
        expect(scene.elements[0]!.style.fill).toBe("red");
    });

    it("should refuse a <use> inside a nested svg that refers to that svg", () => {
        // Act
        const scene = normalizeSvg("<svg><defs><svg id=\"v\"><rect width=\"1\" height=\"1\"/><use href=\"#v\" x=\"5\"/></svg></defs><use href=\"#v\"/></svg>");

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings).toStrictEqual(["A <use> refers to `#v`, which contains that <use> itself; it imports nothing."]);
    });
});

describe("svg <use> expansion of costly elements", () => {
    const LARGE_INPUT_TIMEOUT = 15_000;
    const LONG = 40_000;
    const BUDGET_WARNING = "The SVG holds more than 500000 elements once its <use> references are expanded; the rest is not imported.";
    const SEGMENTS_WARNING = expect.stringMatching(/^The SVG holds more than \d+ path segments once its <use> references are expanded, more than the importer builds from a file of its size; the rest is not imported\.$/);
    const placedAMillionTimes = (target: string): string => {
        const levels = Array.from({ length: 6 }, (_, k) => `<g id="l${k + 1}">${`<use href="#l${k}"/>`.repeat(10)}</g>`);
        return `<svg><defs><g id="l0">${target}</g>${levels.join("")}</defs><use href="#l6"/></svg>`;
    };

    it("should count the elements it skips without drawing towards the elements it expands", () => {
        // Act
        const scene = normalizeSvg(placedAMillionTimes(`${"<desc/>".repeat(LONG / 2)}<sodipodi:guide xmlns:sodipodi="urn:sodipodi"/>`));

        // Assert
        expect(scene.elements).toHaveLength(0);
        expect(scene.warnings).toStrictEqual([BUDGET_WARNING]);
    }, LARGE_INPUT_TIMEOUT);

    it("should choose the child a <switch> draws once however often it is placed", () => {
        // Act
        const scene = normalizeSvg(placedAMillionTimes(`<switch>${"<desc/>".repeat(LONG / 2)}<rect width="1" height="1"/></switch>`));

        // Assert
        expect(scene.warnings).toStrictEqual([SEGMENTS_WARNING]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read the transform and the style of an element once however often it is placed", () => {
        // Act
        const scene = normalizeSvg(placedAMillionTimes(`<path d="M0 0 L1 1" transform="${"translate(0 0) ".repeat(LONG / 20)}" style="${"fill: red; ".repeat(LONG / 10)}"/>`));

        // Assert
        expect(scene.elements.every((e) => e.style.fill === "red")).toBe(true);
        expect(scene.warnings).toStrictEqual([SEGMENTS_WARNING]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read the outline of a basic shape once however often it is placed", () => {
        // Act
        const scene = normalizeSvg(placedAMillionTimes(`<polygon points="0 0 1 1${" ".repeat(LONG)}"/><rect width="1${" ".repeat(LONG)}" height="1"/>`));

        // Assert
        expect(scene.elements.length).toBeGreaterThan(0);
        expect(scene.warnings).toStrictEqual([SEGMENTS_WARNING]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read long style values once however often the elements holding or inheriting them are placed", () => {
        // Arrange
        const digits = "0".repeat(LONG);
        const target = `<g fill="url(#${"x".repeat(LONG)})" stroke-width="1${digits}q" fill-opacity="0.${digits}5"><path d="M0 0 L1 1" opacity="0.${digits}5" style="clip-path: none${" x".repeat(LONG / 2)}; display: x${digits}"/></g>`;

        // Act
        const scene = normalizeSvg(placedAMillionTimes(target));

        // Assert
        expect(scene.elements[0]!.style.strokeWidth).toBeUndefined();
        expect(scene.warnings).toStrictEqual(["clip-path is not applied; the elements it would cut are imported whole.", BUDGET_WARNING]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read the attributes of a nested viewport once however often it is placed", () => {
        // Arrange
        const digits = "0".repeat(LONG);
        const viewport = `<svg x="0.${digits}1" y="${digits}" width="1${digits}" height="1.${digits}" viewBox="0 0 1 1${" ".repeat(LONG)}" preserveAspectRatio="xMinYMin${" ".repeat(LONG)}slice"><path d="M0 0 L1 1"/></svg>`;

        // Act
        const scene = normalizeSvg(placedAMillionTimes(viewport));

        // Assert
        expect(scene.elements.length).toBeGreaterThan(0);
        expect(scene.warnings).toStrictEqual([BUDGET_WARNING]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read the attributes of a <use> once however often it is placed", () => {
        // Arrange
        const digits = "0".repeat(LONG);
        const levels = Array.from({ length: 6 }, (_, k) => `<g id="l${k + 1}">${`<use href="#l${k}" x="0.${digits}1" y="${digits}"/>`.repeat(10)}</g>`);

        // Act
        const scene = normalizeSvg(`<svg><defs><path id="l0" d="M0 0 L1 1"/>${levels.join("")}</defs><use href="#l6"/></svg>`);

        // Assert
        expect(scene.elements.length).toBeGreaterThan(0);
        expect(scene.warnings).toStrictEqual([SEGMENTS_WARNING]);
    }, LARGE_INPUT_TIMEOUT);
});

describe("svg visibility and paint", () => {
    it("should keep an element hidden under a hidden group whatever its own display", () => {
        // Act
        const scene = normalizeSvg("<svg><g style=\"display:none\"><g style=\"display:inline\"><rect width=\"5\" height=\"5\"/></g></g></svg>");

        // Assert
        expect(scene.elements[0]!.style.hidden).toBe(true);
    });

    it("should let a child show itself under a group made invisible by visibility", () => {
        // Act
        const scene = normalizeSvg("<svg><g visibility=\"hidden\"><rect width=\"5\" height=\"5\"/><rect visibility=\"visible\" width=\"5\" height=\"5\"/></g></svg>");

        // Assert
        expect(scene.elements.map((e) => e.style.hidden)).toEqual([true, undefined]);
    });

    it("should multiply opacity down the tree", () => {
        // Act
        const scene = normalizeSvg("<svg><g opacity=\"0.5\"><g style=\"opacity: 50%\"><rect opacity=\"0.5\" width=\"5\" height=\"5\"/></g></g></svg>");

        // Assert
        expect(scene.elements[0]!.style.opacity).toBe(0.125);
    });

    it("should resolve inherit to the parent's value", () => {
        // Act
        const scene = normalizeSvg("<svg><g fill=\"red\" stroke=\"blue\"><g fill=\"green\"><rect fill=\"inherit\" style=\"stroke: inherit\" width=\"5\" height=\"5\"/></g></g></svg>");

        // Assert
        expect(scene.elements[0]!.style.fill).toBe("green");
        expect(scene.elements[0]!.style.stroke).toBe("blue");
    });

    it("should resolve currentColor to the element's own color", () => {
        // Act
        const scene = normalizeSvg("<svg color=\"#f00\"><g fill=\"currentColor\"><rect width=\"5\" height=\"5\"/><rect color=\"blue\" width=\"5\" height=\"5\"/></g><rect stroke=\"currentcolor\" style=\"color: inherit\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(scene.elements.map((e) => e.style.fill)).toEqual(["#f00", "blue", undefined]);
        expect(scene.elements[2]!.style.stroke).toBe("#f00");
    });

    it("should scale the stroke width by the element's transforms and read its unit", () => {
        // Act
        const scene = normalizeSvg("<svg><g transform=\"scale(10)\"><rect stroke-width=\"0.1\" width=\"5\" height=\"5\"/><rect transform=\"scale(1 4)\" stroke-width=\"1mm\" width=\"5\" height=\"5\"/></g></svg>");

        // Assert
        expect(scene.elements[0]!.style.strokeWidth).toBeCloseTo(1, 12);
        expect(scene.elements[1]!.style.strokeWidth).toBeCloseTo(20 * 96 / 25.4, 10);
    });

    it("should count a fill of none, transparent or zero opacity as no fill", () => {
        // Act
        const filled = normalizeSvg(`<svg><rect fill="none"/><rect fill="transparent"/><rect fill="rgba(0, 0, 0, 0)"/><rect fill="#00000000"/>
            <rect fill-opacity="0"/><g opacity="0"><rect/></g><rect fill="rgb(0, 0, 0)"/><rect/><rect fill="url(#gradient)"/></svg>`
            .replace(/<rect/g, "<rect width=\"5\" height=\"5\"")).elements.map((e) => fillsArea(e.style));

        // Assert
        expect(filled).toEqual([false, false, false, false, false, false, true, true, true]);
    });
});

describe("svg elements the importer skips", () => {
    it("should skip elements of other namespaces without a warning", () => {
        // Act
        const scene = normalizeSvg("<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:sodipodi=\"urn:sodipodi\" xmlns:inkscape=\"urn:inkscape\"><sodipodi:namedview><inkscape:grid/><inkscape:page/></sodipodi:namedview><i:pgf/><rect width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should warn about an unsupported element once and not about what it contains", () => {
        // Act
        const scene = normalizeSvg("<svg><text>a<tspan>b</tspan></text><foreignObject><div xmlns=\"http://www.w3.org/1999/xhtml\"><p>x</p></div></foreignObject></svg>");

        // Assert
        expect(scene.warnings).toStrictEqual([
            "<text> is not supported and contributes no geometry. Convert text to paths before exporting.",
            "<foreignobject> is not supported and contributes no geometry. Its content is not SVG.",
        ]);
    });

    it("should warn that clip paths and masks are not applied", () => {
        // Act
        const scene = normalizeSvg("<svg><clipPath id=\"c\"><rect width=\"5\" height=\"5\"/></clipPath><circle clip-path=\"url(#c)\" r=\"50\"/><g style=\"mask: url(#m)\"><circle r=\"1\"/></g></svg>");

        // Assert
        expect(scene.elements).toHaveLength(2);
        expect(scene.warnings).toStrictEqual([
            "clip-path is not applied; the elements it would cut are imported whole.",
            "mask is not applied; the elements it would cut are imported whole.",
        ]);
    });

    it("should warn that a transform given in CSS is not applied", () => {
        // Act
        const scene = normalizeSvg("<svg><rect style=\"transform: translate(10px, 0)\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(scene.warnings).toStrictEqual(["A transform set in CSS or a style attribute is not applied; use the transform attribute."]);
    });

    it("should warn about a malformed transform and draw the element untransformed, as a browser draws it", () => {
        // Act
        const scene = normalizeSvg("<svg><rect transform=\"translate(10 0) matrix(1 0 0 1)\" width=\"5\" height=\"5\"/><rect transform=\"translate(100 0) scale(2\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(scene.elements.map((e) => e.subpaths[0]!.start)).toEqual([[0, 0], [0, 0]]);
        expect(scene.warnings).toStrictEqual(["A transform could not be read (`translate(10 0) matrix(1 0 0 1)`) and is ignored, as a browser ignores it."]);
    });

    it("should draw only the first child of a <switch> it can render", () => {
        // Act
        const starts = startsOf("<svg><switch><foreignObject requiredExtensions=\"http://ns.adobe.com/AdobeIllustrator/10.0/\"/><rect x=\"1\" width=\"5\" height=\"5\"/><rect x=\"2\" width=\"5\" height=\"5\"/></switch></svg>");

        // Assert
        expect(starts).toEqual([[1, 0]]);
    });

    it("should find the svg root inside a wrapper element", () => {
        // Act
        const scene = normalizeSvg("<html><body><svg><rect width=\"5\" height=\"5\"/></svg></body></html>");

        // Assert
        expect(scene.elements).toHaveLength(1);
    });

    it("should look past the wrapper's children that hold no svg for the one that does", () => {
        // Act
        const scene = normalizeSvg("<html><head><title>t</title></head><body><p/><svg><rect width=\"5\" height=\"5\"/></svg></body></html>");

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should say there is no svg root in text that holds no element at all", () => {
        // Act
        const scene = normalizeSvg("just some text");

        // Assert
        expect(scene).toEqual({ elements: [], warnings: ["No <svg> root element found."] });
    });

    it("should draw nothing of a <switch> none of whose children it can render", () => {
        // Act
        const scene = normalizeSvg("<svg><switch><title>t</title><rect requiredExtensions=\"urn:other\" width=\"5\" height=\"5\"/></switch><circle r=\"1\"/></svg>");

        // Assert
        expect(scene.elements.map((e) => e.tag)).toEqual(["circle"]);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should make no geometry of a path without path data", () => {
        // Act
        const scene = normalizeSvg("<svg><path/><path d=\"M0 0 L1 0\"/></svg>");

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should warn about a malformed transform on the root and draw its content untransformed", () => {
        // Act
        const scene = normalizeSvg("<svg transform=\"rotate(\"><rect x=\"2\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(cornersOf(scene)[0]).toEqual([2, 0]);
        expect(scene.warnings).toStrictEqual(["A transform could not be read (`rotate(`) and is ignored, as a browser ignores it."]);
    });

    it("should make no geometry of a circle of radius 0", () => {
        // Act
        const scene = normalizeSvg("<svg><circle r=\"0\"/><ellipse rx=\"0\" ry=\"3\"/></svg>");

        // Assert
        expect(scene.elements).toHaveLength(0);
    });
});

describe("normalizeSvg", () => {
    it("flattens a styled, transformed document", () => {
        const svg = `<svg viewBox="0 0 100 100" width="100" height="100">
            <g transform="translate(10 0)" fill="red">
                <rect x="0" y="0" width="10" height="10" stroke-width="2"/>
                <path d="M0 0 L10 0" stroke="#00ff00"/>
            </g>
        </svg>`;
        const scene = normalizeSvg(svg);
        expect(scene.viewBox).toEqual([0, 0, 100, 100]);
        expect(scene.width).toBe(100);
        expect(scene.elements).toHaveLength(2);
        const rect = scene.elements[0]!;
        expect(rect.tag).toBe("rect");
        expect(rect.style.fill).toBe("red");
        expect(rect.style.strokeWidth).toBe(2);
        expect(rect.subpaths[0]!.start[0]).toBeCloseTo(10);
        expect(scene.elements[1]!.style.fill).toBe("red");
        expect(scene.elements[1]!.style.stroke).toBe("#00ff00");
    });

    it("accumulates nested group transforms", () => {
        const svg = `<svg><g transform="translate(10 0)"><g transform="translate(0 5)">
            <rect x="0" y="0" width="2" height="2"/></g></g></svg>`;
        const scene = normalizeSvg(svg);
        expect(scene.elements[0]!.subpaths[0]!.start[0]).toBeCloseTo(10);
        expect(scene.elements[0]!.subpaths[0]!.start[1]).toBeCloseTo(5);
    });

    it("lets inline style override presentation attributes", () => {
        const svg = `<svg><rect x="0" y="0" width="5" height="5" style="fill:blue" fill="red"/></svg>`;
        expect(normalizeSvg(svg).elements[0]!.style.fill).toBe("blue");
    });

    it("marks hidden via display:none and visibility:hidden", () => {
        const a = normalizeSvg(`<svg><rect width="5" height="5" style="display:none"/></svg>`);
        const b = normalizeSvg(`<svg><rect width="5" height="5" visibility="hidden"/></svg>`);
        expect(a.elements[0]!.style.hidden).toBe(true);
        expect(b.elements[0]!.style.hidden).toBe(true);
    });

    it("captures fill-rule, opacity, id and class", () => {
        const svg = `<svg><path id="p1" class="c1" fill-rule="evenodd" opacity="0.5" d="M0 0 L1 0 Z"/></svg>`;
        const el = normalizeSvg(svg).elements[0]!;
        expect(el.style.fillRule).toBe("evenodd");
        expect(el.style.opacity).toBe(0.5);
        expect(el.id).toBe("p1");
        expect(el.className).toBe("c1");
    });

    it("skips geometry inside defs and symbol", () => {
        const svg = `<svg><defs><rect width="5" height="5"/></defs>
            <symbol><circle r="1"/></symbol><circle cx="0" cy="0" r="1"/></svg>`;
        const scene = normalizeSvg(svg);
        expect(scene.elements).toHaveLength(1);
        expect(scene.elements[0]!.tag).toBe("circle");
    });

    it("should bring in the geometry a <use> element refers to inside <defs>", () => {
        // Arrange
        const svg = `<svg><defs><rect id="r" width="5" height="5"/></defs><use href="#r"/></svg>`;

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements.map((e) => e.tag)).toEqual(["rect"]);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("warns once per unsupported element rather than once per occurrence", () => {
        // Arrange
        const svg = `<svg><text x="0" y="0">a</text><text x="1" y="1">b</text><image href="x.png"/></svg>`;

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.warnings.filter((w) => w.includes("<text>"))).toHaveLength(1);
        expect(scene.warnings.filter((w) => w.includes("<image>"))).toHaveLength(1);
    });

    it("warns about an unsupported element it has no particular advice for", () => {
        // Arrange
        const svg = "<svg><mesh/><circle r=\"1\"/></svg>";

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings).toStrictEqual(["<mesh> is not supported and contributes no geometry."]);
    });

    it("should say nothing about the elements it descends through", () => {
        // Arrange
        const svg = `<svg><g><a><switch><circle r="1"/></switch></a></g></svg>`;

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements).toHaveLength(1);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should say nothing about the elements it deliberately skips", () => {
        // Arrange
        const svg = `<svg><title>t</title><desc>d</desc><metadata/><circle r="1"/></svg>`;

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should apply embedded <style> CSS without a warning", () => {
        // Arrange
        const svg = `<svg><style>.c{fill:red}</style><rect class="c" width="5" height="5"/></svg>`;

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements[0]!.style.fill).toBe("red");
        expect(scene.warnings).toStrictEqual([]);
    });

    it("preserves document element ordering", () => {
        const svg = `<svg><rect width="1" height="1"/><circle r="1"/><path d="M0 0 L1 1"/></svg>`;
        const tags = normalizeSvg(svg).elements.map((e) => e.tag);
        expect(tags).toEqual(["rect", "circle", "path"]);
    });

    it("warns when there is no svg root", () => {
        const scene = normalizeSvg("<html></html>");
        expect(scene.elements).toHaveLength(0);
        expect(scene.warnings.length).toBeGreaterThan(0);
    });
});

describe("svg units in the scene", () => {
    it("should read shape lengths with units as pixels", () => {
        // Act
        const scene = normalizeSvg("<svg><rect x=\"1in\" width=\"10mm\" height=\"12pt\"/></svg>");

        // Assert
        const corners = cornersOf(scene);
        expect(corners[0]![0]).toBeCloseTo(96, 10);
        expect(corners[1]![0] - corners[0]![0]).toBeCloseTo(96 / 2.54, 10);
        expect(corners[2]![1]).toBeCloseTo(16, 10);
    });

    it("should resolve shape percentages against the view box", () => {
        // Act
        const scene = normalizeSvg("<svg width=\"600\" height=\"400\" viewBox=\"0 0 300 200\"><rect width=\"100%\" height=\"50%\"/><circle r=\"10%\"/></svg>");

        // Assert
        expect(cornersOf(scene)[2]).toEqual([300, 100]);
        expect(scene.elements[1]!.subpaths[0]!.start[0]).toBeCloseTo(0.1 * Math.sqrt((300 * 300 + 200 * 200) / 2), 10);
    });

    it("should map a nested svg's position, size and view box", () => {
        // Act
        const scene = normalizeSvg("<svg viewBox=\"0 0 100 100\"><svg x=\"50\" y=\"50\" width=\"10\" height=\"10\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\"/></svg></svg>");

        // Assert
        expect(cornersOf(scene)).toEqual([[50, 50], [60, 50], [60, 60], [50, 60]]);
    });

    it("should resolve percentages inside a nested svg against its own view box", () => {
        // Act
        const scene = normalizeSvg("<svg viewBox=\"0 0 100 100\"><svg width=\"50\" height=\"50\" viewBox=\"0 0 10 10\"><rect width=\"50%\" height=\"50%\"/></svg></svg>");

        // Assert
        expect(cornersOf(scene)[2]).toEqual([25, 25]);
    });

    it("should draw a nested svg of no stated size inside a document of no stated size", () => {
        // Act
        const scene = normalizeSvg("<svg><svg x=\"5\" width=\"50%\"><rect width=\"10\" height=\"10\"/></svg></svg>");

        // Assert
        expect(cornersOf(scene)[0]).toEqual([5, 0]);
        expect(cornersOf(scene)[2]).toEqual([15, 10]);
    });

    it("should fit a nested svg of no stated size into the whole viewport around it", () => {
        // Act
        const scene = normalizeSvg("<svg viewBox=\"0 0 200 100\"><svg viewBox=\"0 0 10 10\"><rect width=\"10\" height=\"10\"/></svg></svg>");

        // Assert
        expect(cornersOf(scene)).toEqual([[50, 0], [150, 0], [150, 100], [50, 100]]);
    });

    it("should draw nothing of a nested svg whose width is 0", () => {
        // Act
        const scene = normalizeSvg("<svg viewBox=\"0 0 100 100\"><svg width=\"0\"><rect width=\"10\" height=\"10\"/></svg></svg>");

        // Assert
        expect(scene.elements).toHaveLength(0);
    });

    it("should keep a symbol's own units when neither the <use> nor the document gives a size", () => {
        // Act
        const scene = normalizeSvg("<svg><symbol id=\"s\" viewBox=\"10 10 20 20\"><rect x=\"10\" y=\"10\" width=\"5\" height=\"5\"/></symbol><use href=\"#s\" x=\"100\"/></svg>");

        // Assert
        expect(cornersOf(scene)[0]).toEqual([100, 0]);
        expect(cornersOf(scene)[2]).toEqual([105, 5]);
    });

    it("should keep root user units by default whatever the page size", () => {
        // Act
        const scene = normalizeSvg("<svg width=\"210mm\" height=\"297mm\" viewBox=\"0 0 21000 29700\"><rect width=\"10000\" height=\"5000\"/></svg>");

        // Assert
        expect(cornersOf(scene)[2]).toEqual([10000, 5000]);
        expect(scene.millimetresPerUserUnit).toBeCloseTo(0.01, 12);
    });

    it("should bring the drawing to true size in the unit asked for", () => {
        // Act
        const mm = normalizeSvg("<svg width=\"210mm\" height=\"297mm\" viewBox=\"0 0 21000 29700\"><rect x=\"100\" width=\"10000\" height=\"5000\"/></svg>", { unit: "mm" });
        const inches = normalizeSvg("<svg width=\"2in\" height=\"1in\" viewBox=\"0 0 200 100\"><rect width=\"100\" height=\"50\"/></svg>", { unit: "in" });

        // Assert
        const corner = cornersOf(mm)[2]!;
        expect(corner[0]).toBeCloseTo(101, 9);
        expect(corner[1]).toBeCloseTo(50, 9);
        expect(cornersOf(inches)[2]![0]).toBeCloseTo(1, 12);
        expect(cornersOf(inches)[2]![1]).toBeCloseTo(0.5, 12);
    });

    it("should place a view box with an offset on the page when importing at true size", () => {
        // Act
        const scene = normalizeSvg("<svg width=\"100mm\" height=\"100mm\" viewBox=\"50 50 100 100\"><rect x=\"50\" y=\"50\" width=\"10\" height=\"10\"/></svg>", { unit: "cm" });

        // Assert
        expect(cornersOf(scene)[0]![0]).toBeCloseTo(0, 12);
        expect(cornersOf(scene)[0]![1]).toBeCloseTo(0, 12);
        expect(cornersOf(scene)[2]![0]).toBeCloseTo(1, 12);
    });

    it("should apply the root's transform outside its view box, where a browser shows it, when keeping user units", () => {
        // Act
        const scene = normalizeSvg("<svg width=\"100\" height=\"100\" viewBox=\"10 10 10 10\" transform=\"translate(50 0)\"><rect x=\"10\" y=\"10\" width=\"1\" height=\"1\"/></svg>");

        // Assert
        expect(cornersOf(scene)[0]![0]).toBeCloseTo(15, 12);
        expect(cornersOf(scene)[0]![1]).toBeCloseTo(10, 12);
        expect(cornersOf(scene)[2]![0]).toBeCloseTo(16, 12);
    });

    it("should apply the root's transform outside its view box when importing at true size", () => {
        // Act
        const scene = normalizeSvg("<svg width=\"100mm\" height=\"100mm\" viewBox=\"10 10 10 10\" transform=\"translate(50 0)\"><rect x=\"10\" y=\"10\" width=\"1\" height=\"1\"/></svg>", { unit: "mm" });

        // Assert
        expect(cornersOf(scene)[0]![0]).toBeCloseTo(50 * 25.4 / 96, 12);
        expect(cornersOf(scene)[0]![1]).toBeCloseTo(0, 12);
    });

    it("should count a document without a size at 96 pixels to the inch when importing at true size", () => {
        // Act
        const scene = normalizeSvg("<svg><rect width=\"96\" height=\"48\"/></svg>", { unit: "in" });

        // Assert
        expect(cornersOf(scene)[2]![0]).toBeCloseTo(1, 12);
        expect(cornersOf(scene)[2]![1]).toBeCloseTo(0.5, 12);
    });
});
