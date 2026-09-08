import { describe, it, expect, beforeAll } from "vitest";
import * as verb from "verb-nurbs-web";
import { GeometryHelper, MathBitByBit } from "@bitbybit-dev/base";
import { ContextBase } from "../../context";
import { VerbSurface } from "./surface";
import { VerbCurve } from "./curve";
import * as Inputs from "../../inputs";

// The six primitive surfaces verb builds - cone, cylinder, extrusion, sphere, revolution and sweep -
// each reached through its own service on the surface API. Every service builds one and reads back
// the parameters it was built from, and the revolution is the only one that converts, holding its
// angle in radians while the API speaks degrees.

const AXIS: Inputs.Base.Vector3 = [0, 1, 0];
const X_AXIS: Inputs.Base.Vector3 = [1, 0, 0];
const BASE: Inputs.Base.Point3 = [0, 0, 0];
const HEIGHT = 10;
const RADIUS = 3;
const ANGLE = 90;

describe("the verb primitive surfaces", () => {
    let surface: VerbSurface;
    let curve: VerbCurve;
    let profile: ReturnType<VerbCurve["createCurveByPoints"]>;

    beforeAll(() => {
        const context = new ContextBase();
        context.verb = verb;
        const geometryHelper = new GeometryHelper();
        const math = new MathBitByBit();
        surface = new VerbSurface(context, geometryHelper, math);
        curve = new VerbCurve(context, geometryHelper, math);
        profile = curve.createCurveByPoints(new Inputs.Verb.CurvePathDataDto(1, [[1, 0, 0], [1, 5, 0]]));
    });

    describe("cone", () => {
        let cone: ReturnType<VerbSurface["cone"]["create"]>;

        beforeAll(() => {
            cone = surface.cone.create(new Inputs.Verb.ConeAndCylinderParametersDto(AXIS, X_AXIS, BASE, HEIGHT, RADIUS));
        });

        it("should be built on the axis it was given", () => {
            expect(surface.cone.axis(new Inputs.Verb.ConeDto(cone))).toEqual(AXIS);
        });

        it("should be built on the x axis it was given", () => {
            expect(surface.cone.xAxis(new Inputs.Verb.ConeDto(cone))).toEqual(X_AXIS);
        });

        it("should be built from the base it was given", () => {
            expect(surface.cone.base(new Inputs.Verb.ConeDto(cone))).toEqual(BASE);
        });

        it("should hold the height it was given", () => {
            expect(surface.cone.height(new Inputs.Verb.ConeDto(cone))).toBe(HEIGHT);
        });

        it("should hold the radius it was given", () => {
            expect(surface.cone.radius(new Inputs.Verb.ConeDto(cone))).toBe(RADIUS);
        });
    });

    describe("cylinder", () => {
        let cylinder: ReturnType<VerbSurface["cylinder"]["create"]>;

        beforeAll(() => {
            cylinder = surface.cylinder.create(new Inputs.Verb.ConeAndCylinderParametersDto(AXIS, X_AXIS, BASE, HEIGHT, RADIUS));
        });

        it("should be built on the axis it was given", () => {
            expect(surface.cylinder.axis(new Inputs.Verb.CylinderDto(cylinder))).toEqual(AXIS);
        });

        it("should be built on the x axis it was given", () => {
            expect(surface.cylinder.xAxis(new Inputs.Verb.CylinderDto(cylinder))).toEqual(X_AXIS);
        });

        it("should be built from the base it was given", () => {
            expect(surface.cylinder.base(new Inputs.Verb.CylinderDto(cylinder))).toEqual(BASE);
        });

        it("should hold the height it was given", () => {
            expect(surface.cylinder.height(new Inputs.Verb.CylinderDto(cylinder))).toBe(HEIGHT);
        });

        it("should hold the radius it was given", () => {
            expect(surface.cylinder.radius(new Inputs.Verb.CylinderDto(cylinder))).toBe(RADIUS);
        });
    });

    describe("extrusion", () => {
        let extrusion: ReturnType<VerbSurface["extrusion"]["create"]>;

        beforeAll(() => {
            extrusion = surface.extrusion.create(new Inputs.Verb.ExtrusionParametersDto(profile, AXIS));
        });

        it("should be built along the direction it was given", () => {
            expect(surface.extrusion.direction(new Inputs.Verb.ExtrusionDto(extrusion))).toEqual(AXIS);
        });

        it("should hold the profile it was built from", () => {
            expect(surface.extrusion.profile(new Inputs.Verb.ExtrusionDto(extrusion))).toBe(profile);
        });
    });

    describe("sphere", () => {
        let sphere: ReturnType<VerbSurface["sphere"]["create"]>;

        beforeAll(() => {
            sphere = surface.sphere.create(new Inputs.Verb.SphericalParametersDto(RADIUS, BASE));
        });

        it("should hold the radius it was given", () => {
            expect(surface.sphere.radius(new Inputs.Verb.SphereDto(sphere))).toBe(RADIUS);
        });

        it("should be built around the centre it was given", () => {
            expect(surface.sphere.center(new Inputs.Verb.SphereDto(sphere))).toEqual(BASE);
        });
    });

    describe("revolved", () => {
        const CENTER: Inputs.Base.Point3 = [1, 2, 3];
        let revolved: ReturnType<VerbSurface["revolved"]["create"]>;

        beforeAll(() => {
            revolved = surface.revolved.create(new Inputs.Verb.RevolutionParametersDto(profile, CENTER, AXIS, ANGLE));
        });

        it("should hold the profile it was built from", () => {
            expect(surface.revolved.profile(new Inputs.Verb.RevolutionDto(revolved))).toBe(profile);
        });

        it("should be built around the centre it was given", () => {
            expect(surface.revolved.center(new Inputs.Verb.RevolutionDto(revolved))).toEqual(CENTER);
        });

        it("should answer with the centre when asked for the axis, which is what verb holds", () => {
            // The surface is built around the axis that was given - only the reader is wrong, and it
            // is verb's: RevolvedSurface.axis() returns its own _center (verb 2.1.0). This API hands
            // back what the library holds, so it repeats the answer rather than correcting it.
            expect(surface.revolved.axis(new Inputs.Verb.RevolutionDto(revolved))).toEqual(CENTER);
        });

        it("should sweep the profile around the axis it was given", () => {
            // Act - the profile starts at [1, 0, 0], which sits at [0, -2, -3] from the centre; a
            // quarter turn about Y carries that to [-3, -2, 0], and back from the centre to [-2, 0, 3]
            const swept = revolved.point(1, 0);

            // Assert
            expect(swept[0]).toBeCloseTo(-2, 5);
            expect(swept[2]).toBeCloseTo(3, 5);
        });

        it("should give back the angle it was given in degrees", () => {
            expect(surface.revolved.angle(new Inputs.Verb.RevolutionDto(revolved))).toBeCloseTo(ANGLE, 5);
        });
    });

    describe("sweep", () => {
        let sweep: ReturnType<VerbSurface["sweep"]["create"]>;
        let rail: ReturnType<VerbCurve["createCurveByPoints"]>;

        beforeAll(() => {
            rail = curve.createCurveByPoints(new Inputs.Verb.CurvePathDataDto(1, [[0, 0, 0], [0, 0, 10]]));
            sweep = surface.sweep.create(new Inputs.Verb.SweepParametersDto(profile, rail));
        });

        it("should hold the profile it was built from", () => {
            expect(surface.sweep.profile(new Inputs.Verb.SweepDto(sweep))).toBe(profile);
        });

        it("should hold the rail it was built along", () => {
            expect(surface.sweep.rail(new Inputs.Verb.SweepDto(sweep))).toBe(rail);
        });
    });
});
