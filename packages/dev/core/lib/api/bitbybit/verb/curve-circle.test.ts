import { describe, it, expect, beforeAll } from "vitest";
import * as verb from "verb-nurbs-web";
import { MathBitByBit } from "@bitbybit-dev/base";
import { ContextBase } from "../../context";
import { VerbCurveCircle } from "./curve-circle";
import * as Inputs from "../../inputs";

const RADIUS = 5;
const CENTER: Inputs.Base.Point3 = [1, 2, 3];
const X_AXIS: Inputs.Base.Vector3 = [1, 0, 0];
const Y_AXIS: Inputs.Base.Vector3 = [0, 1, 0];
const MIN_ANGLE = 30;
const MAX_ANGLE = 120;

describe("VerbCurveCircle", () => {
    let circleService: VerbCurveCircle;
    let circle: ReturnType<VerbCurveCircle["createCircle"]>;
    let arc: ReturnType<VerbCurveCircle["createArc"]>;

    beforeAll(() => {
        const context = new ContextBase();
        context.verb = verb;
        circleService = new VerbCurveCircle(context, new MathBitByBit());
        circle = circleService.createCircle(new Inputs.Verb.CircleParametersDto(X_AXIS, Y_AXIS, RADIUS, CENTER));
        arc = circleService.createArc(new Inputs.Verb.ArcParametersDto(MIN_ANGLE, MAX_ANGLE, X_AXIS, Y_AXIS, RADIUS, CENTER));
    });

    describe("createCircle", () => {
        it("should build a circle of the radius it was given", () => {
            expect(circleService.radius(new Inputs.Verb.CircleDto(circle))).toBe(RADIUS);
        });

        it("should build a circle around the centre it was given", () => {
            expect(circleService.center(new Inputs.Verb.CircleDto(circle))).toEqual(CENTER);
        });

        it("should close the circle, so its start and end points meet", () => {
            // Act
            const start = circle.point(0);
            const end = circle.point(1);

            // Assert
            expect(start[0]).toBeCloseTo(end[0], 5);
            expect(start[1]).toBeCloseTo(end[1], 5);
        });
    });

    describe("createArc", () => {
        it("should hold the angles it was given in degrees", () => {
            expect(circleService.minAngle(new Inputs.Verb.CircleDto(arc))).toBeCloseTo(MIN_ANGLE, 5);
            expect(circleService.maxAngle(new Inputs.Verb.CircleDto(arc))).toBeCloseTo(MAX_ANGLE, 5);
        });

        it("should span only the angles it was given", () => {
            // Act
            const start = arc.point(0);

            expect(start[0]).toBeCloseTo(CENTER[0] + RADIUS * Math.cos(Math.PI / 6), 5);
            expect(start[1]).toBeCloseTo(CENTER[1] + RADIUS * Math.sin(Math.PI / 6), 5);
        });
    });

    describe("center", () => {
        it("should give the centre of an arc as well", () => {
            expect(circleService.center(new Inputs.Verb.CircleDto(arc))).toEqual(CENTER);
        });
    });

    describe("radius", () => {
        it("should give the radius of an arc as well", () => {
            expect(circleService.radius(new Inputs.Verb.CircleDto(arc))).toBe(RADIUS);
        });
    });

    describe("xAxis", () => {
        it("should give the x axis the circle was built on", () => {
            expect(circleService.xAxis(new Inputs.Verb.CircleDto(circle))).toEqual(X_AXIS);
        });
    });

    describe("yAxis", () => {
        it("should give the y axis the circle was built on", () => {
            expect(circleService.yAxis(new Inputs.Verb.CircleDto(circle))).toEqual(Y_AXIS);
        });
    });
});
