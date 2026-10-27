import { describe, expect, it } from "vitest";
import { BaseBitByBit } from "./base-bitbybit";
import { Color } from "./color";
import { Dates } from "./dates";
import { Engineering } from "./engineering";
import { Frame } from "./frame";
import { GeometryHelper } from "./geometry-helper";
import { IoBitByBit } from "./io";
import { Line } from "./line";
import { Lists } from "./lists";
import { Logic } from "./logic";
import { MathBitByBit } from "./math";
import { MeshBitByBit } from "./mesh";
import { Point } from "./point";
import { Polyline } from "./polyline";
import { Recipes } from "./recipes";
import { TextBitByBit } from "./text";
import { Transforms } from "./transforms";
import { Vector } from "./vector";

describe("BaseBitByBit", () => {
    it("should hold one of every base service", () => {
        // Act
        const base = new BaseBitByBit();

        // Assert
        expect([
            base.geometryHelper, base.math, base.vector, base.transforms, base.lists, base.point, base.line, base.polyline, base.mesh,
            base.textService, base.io, base.frame, base.color, base.logic, base.dates, base.engineering, base.recipes,
        ].map(service => service.constructor)).toEqual([
            GeometryHelper, MathBitByBit, Vector, Transforms, Lists, Point, Line, Polyline, MeshBitByBit,
            TextBitByBit, IoBitByBit, Frame, Color, Logic, Dates, Engineering, Recipes,
        ]);
    });

    it("should wire the services to each other, so ones that need others answer", () => {
        // Arrange
        const base = new BaseBitByBit();

        // Act
        const distance = base.point.distance({ startPoint: [0, 0, 0], endPoint: [3, 4, 0] });
        const lifted = base.frame.offset({ frame: { origin: [0, 0, 0], normal: [0, 0, 2], direction: [1, 0, 0] }, distance: 5 });
        const middle = base.line.getPointOnLine({ line: { start: [0, 0, 0], end: [10, 0, 0] }, param: 0.5 });

        // Assert
        expect(distance).toBe(5);
        expect(lifted.origin).toEqual([0, 0, 5]);
        expect(middle).toEqual([5, 0, 0]);
    });

    it("should measure one length to the same bits through every service that measures it", () => {
        // Arrange
        const base = new BaseBitByBit();

        // Act
        const lengths = [
            base.point.distance({ startPoint: [0, 0, 0], endPoint: [1, 2, 3] }),
            base.polyline.length({ polyline: { points: [[0, 0, 0], [1, 2, 3]] } }),
            base.vector.length({ vector: [1, 2, 3] }),
            base.vector.norm({ vector: [1, 2, 3] }),
            base.vector.dist({ first: [0, 0, 0], second: [1, 2, 3] }),
        ];

        // Assert
        expect(lengths).toEqual([3.7416573867739413, 3.7416573867739413, 3.7416573867739413, 3.7416573867739413, 3.7416573867739413]);
    });
});
