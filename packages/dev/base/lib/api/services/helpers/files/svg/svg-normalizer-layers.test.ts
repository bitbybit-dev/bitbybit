import { describe, expect, it } from "vitest";
import { normalizeSvg } from "./svg-normalizer";

const NS = "xmlns=\"http://www.w3.org/2000/svg\" xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"";
const svgOf = (body: string): string => `<svg ${NS}>${body}</svg>`;
const LARGE_INPUT_TIMEOUT = 15_000;

describe("svg layers in the scene", () => {
    it("should name the Inkscape layer each element is drawn on, and none outside a layer", () => {
        // Act
        const scene = normalizeSvg(svgOf("<g inkscape:groupmode=\"layer\" inkscape:label=\"Cut\"><g><rect width=\"1\" height=\"1\"/></g></g><rect width=\"2\" height=\"2\"/>"));

        // Assert
        expect(scene.elements.map(element => element.layer)).toEqual(["Cut", undefined]);
    });

    it("should name a layer that has neither a label nor an id with an empty name", () => {
        // Act
        const scene = normalizeSvg(svgOf("<g inkscape:groupmode=\"layer\"><rect width=\"1\" height=\"1\"/></g>"));

        // Assert
        expect(scene.elements[0]!.layer).toBe("");
    });

    it("should not take a group as a layer when Inkscape does not mark it as one", () => {
        // Act
        const scene = normalizeSvg(svgOf("<g inkscape:label=\"Not a layer\" inkscape:groupmode=\"group\"><rect width=\"1\" height=\"1\"/></g>"));

        // Assert
        expect(scene.elements[0]!.layer).toBeUndefined();
    });

    it("should leave everything else it returns as it was", () => {
        // Act
        const scene = normalizeSvg(svgOf("<g inkscape:groupmode=\"layer\" inkscape:label=\"Cut\" id=\"g1\" transform=\"translate(1 2)\"><path id=\"p\" class=\"c\" d=\"M0 0 L1 0\" stroke=\"red\"/></g>"));

        // Assert
        expect(scene.elements).toEqual([{
            tag: "path",
            id: "p",
            className: "c",
            layer: "Cut",
            style: { stroke: "red" },
            subpaths: [{ start: [1, 2], segments: [{ type: "line", to: [2, 2] }], closed: false }],
        }]);
        expect(scene.warnings).toEqual([]);
    });
});

describe("svg dash arrays in the scene", () => {
    it("should read a dash array in user units, scaled by the element's transforms", () => {
        // Act
        const scene = normalizeSvg(svgOf("<g transform=\"scale(2)\"><path d=\"M0 0 L1 0\" stroke-dasharray=\"4, 2\"/></g>"));

        // Assert
        expect(scene.elements[0]!.style.strokeDashArray).toEqual([8, 4]);
    });

    it("should repeat an odd list once, as SVG draws it, and read units and percentages", () => {
        // Act
        const scene = normalizeSvg("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M0 0 L1 0\" stroke-dasharray=\"1mm 2 10%\"/></svg>");

        // Assert
        const dashes = scene.elements[0]!.style.strokeDashArray!;
        expect(dashes).toHaveLength(6);
        expect(dashes[0]).toBeCloseTo(96 / 25.4, 12);
        expect(dashes.slice(1, 3)).toEqual([2, 10]);
        expect(dashes.slice(3)).toEqual(dashes.slice(0, 3));
    });

    it("should inherit a dash array from a group and let an element turn it off", () => {
        // Act
        const scene = normalizeSvg(svgOf("<g stroke-dasharray=\"3 1\"><path d=\"M0 0 L1 0\"/><path d=\"M0 1 L1 1\" style=\"stroke-dasharray: none\"/></g>"));

        // Assert
        expect(scene.elements.map(element => element.style.strokeDashArray)).toEqual([[3, 1], undefined]);
    });

    it("should read a dash array that is negative, not a list of lengths or all zero as a solid line, as a browser draws it", () => {
        // Act
        const scene = normalizeSvg(svgOf(["4 -1", "4,,1", "4 x", "0 0"].map(dashes => `<path d="M0 0 L1 0" stroke-dasharray="${dashes}"/>`).join("")));

        // Assert
        expect(scene.elements.map(element => element.style.strokeDashArray)).toEqual([undefined, undefined, undefined, undefined]);
    });

    it("should read a dash array of more than sixty-four lengths as a solid line and say so once", () => {
        // Act
        const scene = normalizeSvg(svgOf(`<path d="M0 0 L1 0" stroke-dasharray="${"1 ".repeat(65)}"/><path d="M0 1 L1 1" stroke-dasharray="${"1 ".repeat(64)}"/>`));

        // Assert
        expect(scene.elements.map(element => element.style.strokeDashArray?.length)).toEqual([undefined, 64]);
        expect(scene.warnings).toEqual(["A stroke-dasharray holds more than 64 lengths, more than the importer reads; its strokes are read as solid lines."]);
    });

    it("should read a long dash array once however often the elements inheriting it are placed", () => {
        // Arrange
        const levels = Array.from({ length: 6 }, (_, k) => `<g id="l${k + 1}">${`<use href="#l${k}"/>`.repeat(10)}</g>`);
        const svg = `<svg><defs><path id="l0" d="M0 0 L1 1"/>${levels.join("")}</defs><g stroke-dasharray="${"1 ".repeat(40_000)}"><use href="#l6"/></g></svg>`;

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements.length).toBeGreaterThan(1000);
        expect(scene.elements.every(element => element.style.strokeDashArray === undefined)).toBe(true);
    }, LARGE_INPUT_TIMEOUT);
});
