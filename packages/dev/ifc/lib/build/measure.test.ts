import { describe, expect, it } from "vitest";
import type { Base } from "@bitbybit-dev/base";
import { writingIntoNewModel } from "../__test__/build-setup";
import { enumValue, ref } from "../step/values";
import { areaBetween, boundsOf, profileShape, volumeBetween } from "./measure";

const SQUARE: Base.Point2[] = [[0, 0], [10, 0], [10, 10], [0, 10]];
const UP: Base.Vector3 = [0, 0, 1];

describe("volumeBetween", () => {
    it("should give a box its footprint times its height", () => {
        // Act
        const volume = volumeBetween(SQUARE, boundsOf(1, 4, []));

        // Assert
        expect(volume).toBeCloseTo(300, 12);
    });

    it("should cut a wedge under a top that slopes across the footprint", () => {
        // Arrange
        const slope = { origin: [0, 0, 0] as Base.Point3, normal: [-1, 0, 1] as Base.Vector3 };

        // Act
        const volume = volumeBetween(SQUARE, boundsOf(0, 100, [slope]));

        // Assert
        expect(volume).toBeCloseTo(500, 12);
    });

    it("should raise the bottom where a clipping removes from below", () => {
        // Arrange
        const floor = { origin: [0, 0, 2] as Base.Point3, normal: [0, 0, -1] as Base.Vector3 };

        // Act
        const volume = volumeBetween(SQUARE, boundsOf(0, 5, [floor]));

        // Assert
        expect(volume).toBeCloseTo(300, 12);
    });

    it("should trim the footprint where a clipping stands upright, counting a clipping at the top's own height once", () => {
        // Arrange
        const side = { origin: [4, 0, 0] as Base.Point3, normal: [1, 0, 0] as Base.Vector3 };

        // Act
        const volume = volumeBetween(SQUARE, boundsOf(0, 1, [side, { origin: [0, 0, 1], normal: UP }]));

        // Assert
        expect(volume).toBeCloseTo(40, 12);
    });

    it("should give nothing where the top is under the bottom", () => {
        // Act
        const volume = volumeBetween(SQUARE, boundsOf(5, 1, []));

        // Assert
        expect(volume).toBe(0);
    });

    it("should give nothing over a footprint that encloses no area", () => {
        // Act
        const volume = volumeBetween([[0, 0], [5, 0], [10, 0]], boundsOf(0, 1, []));

        // Assert
        expect(volume).toBe(0);
    });
});

describe("areaBetween", () => {
    it("should give the area under a sloping top along a line", () => {
        // Arrange
        const slope = { origin: [0, 0, 0] as Base.Point3, normal: [-1, 0, 1] as Base.Vector3 };

        // Act
        const area = areaBetween([0, 5], [10, 5], boundsOf(0, 100, [slope]));

        // Assert
        expect(area).toBeCloseTo(50, 12);
    });

    it("should cap the area where the level top is lower than a slope", () => {
        // Arrange
        const slope = { origin: [0, 0, 0] as Base.Point3, normal: [-1, 0, 1] as Base.Vector3 };

        // Act
        const area = areaBetween([0, 5], [10, 5], boundsOf(0, 4, [slope]));

        // Assert
        expect(area).toBeCloseTo(32, 12);
    });

    it("should give nothing along a line an upright clipping removes whole", () => {
        // Arrange
        const side = { origin: [0, 6, 0] as Base.Point3, normal: [0, -1, 0] as Base.Vector3 };

        // Act
        const area = areaBetween([0, 5], [10, 5], boundsOf(0, 4, [side]));

        // Assert
        expect(area).toBe(0);
    });

    it("should keep the whole line where an upright clipping passes beside it", () => {
        // Arrange
        const side = { origin: [0, 4, 0] as Base.Point3, normal: [0, -1, 0] as Base.Vector3 };

        // Act
        const area = areaBetween([0, 5], [10, 5], boundsOf(0, 4, [side]));

        // Assert
        expect(area).toBeCloseTo(40, 12);
    });
});

describe("areaBetween where tops tie", () => {
    it("should follow the lower of two slopes that cross, counting a top given twice once", () => {
        // Arrange
        const rising = { origin: [0, 0, 0] as Base.Point3, normal: [-1, 0, 1] as Base.Vector3 };
        const falling = { origin: [10, 0, 0] as Base.Point3, normal: [1, 0, 1] as Base.Vector3 };

        // Act
        const area = areaBetween([0, 5], [10, 5], boundsOf(0, 100, [rising, falling, rising]));

        // Assert
        expect(area).toBeCloseTo(25, 12);
    });

    it("should take a slope that meets the level top at the line's end as the top up to there", () => {
        // Arrange
        const rising = { origin: [0, 0, 0] as Base.Point3, normal: [-1, 0, 1] as Base.Vector3 };

        // Act
        const area = areaBetween([0, 5], [10, 5], boundsOf(0, 10, [rising]));

        // Assert
        expect(area).toBeCloseTo(50, 12);
    });
});

describe("profileShape", () => {
    it("should measure a rectangle, a circle, an I section and an outline with a hole", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const rectangle = writer.create("IfcRectangleProfileDef", { ProfileType: enumValue("AREA"), Position: ref(writer.placement2([5, 0])), XDim: 4, YDim: 2 });
        const circle = writer.create("IfcCircleProfileDef", { ProfileType: enumValue("AREA"), Radius: 1 });
        const section = writer.create("IfcIShapeProfileDef", { ProfileType: enumValue("AREA"), OverallWidth: 10, OverallDepth: 20, WebThickness: 1, FlangeThickness: 2 });
        const holed = writer.profile({ outer: SQUARE, holes: [[[2, 2], [4, 2], [4, 4], [2, 4]]] });

        // Act
        const shapes = [rectangle, circle, section, holed].map((profile) => profileShape(tx, profile));

        // Assert
        expect(shapes.map((shape) => [shape?.area, shape?.perimeter])).toEqual([[8, 12], [Math.PI, 2 * Math.PI], [56, 78], [96, 40]]);
        expect(shapes[0]?.outline).toEqual([[3, -1], [7, -1], [7, 1], [3, 1]]);
    });

    it("should leave a profile it does not measure, and an outline that is no polyline, unmeasured", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const ellipse = writer.create("IfcEllipseProfileDef", { ProfileType: enumValue("AREA"), SemiAxis1: 2, SemiAxis2: 1 });
        const round = writer.create("IfcArbitraryClosedProfileDef", { ProfileType: enumValue("AREA"), OuterCurve: ref(writer.create("IfcCircle", { Position: ref(writer.placement2([0, 0])), Radius: 1 })) });

        // Act
        const shapes = [ellipse, round].map((profile) => profileShape(tx, profile));

        // Assert
        expect(shapes).toEqual([undefined, undefined]);
    });

});
