import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../occ-helper";
import { OCCTWire } from "./shapes";
import { OCCTIO } from "./io";
import * as Inputs from "../api/inputs";

const { leftHanded, rightHanded } = Inputs.Base.coordinateSystemEnum;
const { millimetre } = Inputs.Base.unitOfLengthEnum;
const { continuous, hidden } = Inputs.IO.lineTypeEnum;

const viewBoxOf = (svg: string): number[] => (/viewBox="([^"]*)"/.exec(svg)?.[1] ?? "").split(" ").map(Number);

const groupOf = (svg: string, layer: string): string => {
    const start = svg.indexOf(`<g id="layer-${layer}"`);
    return start === -1 ? "" : svg.slice(start, svg.indexOf("\n  </g>", start));
};

describe("OCCT io drawing layers of shapes as SVG", () => {
    let occHelper: OccHelper;
    let io: OCCTIO;
    let wire: OCCTWire;

    const outline = (): TopoDS_Shape[] => [
        wire.createRectangleWire({ width: 60, length: 40, center: [10, 0, 5], direction: [0, 1, 0] }),
        wire.createCircleWire({ radius: 3, center: [-5, 0, 10], direction: [0, 1, 0] }),
        wire.interpolatePoints({ points: [[-15, 0, -10], [0, 0, -6], [20, 0, -12]], periodic: false, tolerance: 1e-7 }),
    ];

    beforeAll(async () => {
        const occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
        io = new OCCTIO(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
    });

    afterEach(() => {
        occHelper.base.settings = {};
    });

    it("should hand back the shapes with the style it was given, and the defaults for a style it was not", () => {
        // Arrange
        const shapes = outline();

        // Act
        const given = io.svgLayer({ shapes, layer: "cut", color: "#ff0000", lineType: hidden });
        const plain = io.svgLayer({ shapes });

        // Assert
        expect(given).toEqual({ shapes, layer: "cut", color: "#ff0000", lineType: hidden });
        expect(plain).toEqual({ shapes, layer: "Default", color: "#000000", lineType: continuous });
    });

    it("should draw each layer as a group Inkscape reads as a layer, in its own color, the hidden one dashed", () => {
        // Arrange
        const [rectangle, circle] = outline();

        // Act
        const svg = io.svgCreate({
            layers: [
                io.svgLayer({ shapes: [rectangle!], layer: "cut", color: "#ff0000" }),
                io.svgLayer({ shapes: [circle!], layer: "behind", color: "#0000ff", lineType: hidden }),
            ],
            tryDownload: false,
        });

        // Assert
        expect(groupOf(svg, "cut")).toContain("inkscape:label=\"cut\"");
        expect(groupOf(svg, "cut")).toContain("stroke=\"#ff0000\"");
        expect(groupOf(svg, "cut")).not.toContain("stroke-dasharray");
        expect(groupOf(svg, "behind")).toContain("inkscape:label=\"behind\"");
        expect(groupOf(svg, "behind")).toContain("stroke=\"#0000ff\"");
        expect(groupOf(svg, "behind")).toContain("stroke-dasharray");
    });

    it.each([leftHanded, rightHanded])("should draw shapes in a %s system exactly as the drawing paths traced from them are drawn", (system) => {
        // Arrange
        occHelper.base.settings = { coordinateSystem: system };
        const shapes = outline();
        const traced = shapes.flatMap(shape => io.shapeToDxfPaths({ shape, curvatureDeflection: 0.01 }));
        const expected = occHelper.base.io.svg.svgCreate({ parts: [{ layer: "cut", color: "#ff0000", lineType: continuous, paths: traced }], unit: millimetre });

        // Act
        const svg = io.svgCreate({ layers: [io.svgLayer({ shapes, layer: "cut", color: "#ff0000" })], unit: millimetre, tryDownload: false });

        // Assert
        expect(svg).toBe(expected);
    });

    it("should draw the outline mirrored front to back in a right-handed system, as it lies on that system's ground", () => {
        // Arrange
        const shapes = outline();
        const layers = [io.svgLayer({ shapes, layer: "cut" })];

        // Act
        occHelper.base.settings = { coordinateSystem: leftHanded };
        const left = io.svgCreate({ layers, tryDownload: false });
        occHelper.base.settings = { coordinateSystem: rightHanded };
        const right = io.svgCreate({ layers, tryDownload: false });

        // Assert
        const [leftX, leftY, leftWidth, leftHeight] = viewBoxOf(left);
        const [rightX, rightY, rightWidth, rightHeight] = viewBoxOf(right);
        expect([rightX, rightWidth, rightHeight]).toEqual([leftX, leftWidth, leftHeight]);
        expect(rightY).toBeCloseTo(-(leftY! + leftHeight!), 9);
        expect(rightY).not.toBeCloseTo(leftY!, 3);
    });

    it("should refuse a tolerance of 0, layers that are no list, a layer that is no object and a shape that is none, naming each input", () => {
        // Arrange
        const shapes = outline();
        const layer = io.svgLayer({ shapes });
        const refusal = (inputs: unknown): unknown => {
            try {
                io.svgCreate(inputs as Inputs.OCCT.SvgLayersDto<TopoDS_Shape>);
            } catch (error) {
                return error instanceof InputError ? error.property : error;
            }
            return undefined;
        };

        // Act
        const refused = [
            refusal({ layers: [layer], tolerance: 0 }),
            refusal({ layers: "cut" }),
            refusal({ layers: [layer, null] }),
            refusal({ layers: [layer, { shapes: [shapes[0], undefined] }] }),
        ];

        // Assert
        expect(refused).toEqual(["tolerance", "layers", "layers[1]", "layers[1].shapes"]);
    });
});
