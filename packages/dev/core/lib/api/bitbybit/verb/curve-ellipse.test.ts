import { describe, it, expect, beforeAll } from "vitest";
import * as verb from "verb-nurbs-web";
import { MathBitByBit } from "@bitbybit-dev/base";
import { ContextBase } from "../../context";
import { VerbCurveEllipse } from "./curve-ellipse";
import * as Inputs from "../../inputs";

const CENTER: Inputs.Base.Point3 = [1, 2, 3];
const X_AXIS: Inputs.Base.Vector3 = [4, 0, 0];
const Y_AXIS: Inputs.Base.Vector3 = [0, 2, 0];
const MIN_ANGLE = 30;
const MAX_ANGLE = 120;

describe("VerbCurveEllipse", () => {
    let ellipseService: VerbCurveEllipse;
    let ellipse: ReturnType<VerbCurveEllipse["createEllipse"]>;
    let arc: ReturnType<VerbCurveEllipse["createArc"]>;

    beforeAll(() => {
        const context = new ContextBase();
        context.verb = verb;
        ellipseService = new VerbCurveEllipse(context, new MathBitByBit());
        ellipse = ellipseService.createEllipse(new Inputs.Verb.EllipseParametersDto(X_AXIS, Y_AXIS, CENTER));
        arc = ellipseService.createArc(new Inputs.Verb.EllipseArcParametersDto(MIN_ANGLE, MAX_ANGLE, X_AXIS, Y_AXIS, CENTER));
    });

    describe("createEllipse", () => {
        it("should build an ellipse around the centre it was given", () => {
            expect(ellipseService.center(new Inputs.Verb.EllipseDto(ellipse))).toEqual(CENTER);
        });

        it("should reach the end of its x axis a quarter of the way round", () => {
            // Act
            const start = ellipse.point(0);

            // Assert
            expect(start[0]).toBeCloseTo(CENTER[0] + X_AXIS[0], 5);
            expect(start[1]).toBeCloseTo(CENTER[1], 5);
        });
    });

    describe("createArc", () => {
        it("should hold the angles it was given in degrees", () => {
            expect(ellipseService.minAngle(new Inputs.Verb.EllipseDto(arc))).toBeCloseTo(MIN_ANGLE, 5);
            expect(ellipseService.maxAngle(new Inputs.Verb.EllipseDto(arc))).toBeCloseTo(MAX_ANGLE, 5);
        });

        it("should start at the angle it was given", () => {
            // Act
            const start = arc.point(0);

            // Assert
            expect(start[0]).toBeCloseTo(CENTER[0] + X_AXIS[0] * Math.cos(Math.PI / 6), 5);
            expect(start[1]).toBeCloseTo(CENTER[1] + Y_AXIS[1] * Math.sin(Math.PI / 6), 5);
        });
    });

    describe("center", () => {
        it("should give the centre of an arc as well", () => {
            expect(ellipseService.center(new Inputs.Verb.EllipseDto(arc))).toEqual(CENTER);
        });
    });

    describe("xAxis", () => {
        it("should give the x axis the ellipse was built on", () => {
            expect(ellipseService.xAxis(new Inputs.Verb.EllipseDto(ellipse))).toEqual(X_AXIS);
        });
    });

    describe("yAxis", () => {
        it("should give the y axis the ellipse was built on", () => {
            expect(ellipseService.yAxis(new Inputs.Verb.EllipseDto(ellipse))).toEqual(Y_AXIS);
        });
    });
});
