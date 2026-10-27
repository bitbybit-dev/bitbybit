import { describe, it, expect, beforeAll } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import type { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTGeom } from "./geom";

describe("OCCT edge unit tests", () => {
    let geom: OCCTGeom;
    let occHelper: OccHelper;
    let occt: BitbybitOcctModule;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
        geom = new OCCTGeom(occt, occHelper);
    });

    it("should create circle curve", () => {
        const circle = geom.curves.geomCircleCurve({
            radius: 10,
            center: [0, 0, 0],
            direction: [0, 0, 1]
        });
        expect(circle).toBeDefined();
        circle.delete();
    });

    it("should create 2d circle curve", () => {
        const circle = geom.curves.geom2dCircle({
            radius: 10,
            center: [0, 0],
            direction: [0, 1],
            sense: false
        });
        expect(circle).toBeDefined();
        const point = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: circle,
            param: 0
        });
        expect(point).toEqual([0, 10]);
       

        circle.delete();
    });

    it("should create 2d trimmed curve", () => {
        const circle = geom.curves.geom2dCircle({
            radius: 10,
            center: [0, 0],
            direction: [0, 1],
            sense: false
        });
        const trimmed = geom.curves.geom2dTrimmedCurve({
            shape: circle,
            u1: 0,
            u2: 0.5,
            sense: false,
            adjustPeriodic: false
        });

        const point = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: trimmed,
            param: trimmed.LastParameter()
        });
        const point2 = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: circle,
            param: circle.LastParameter()
        });

        expect(point[0]).toBeCloseTo(0, 10);
        expect(point[1]).toBeCloseTo(10, 10);
        expect(point2[0]).toBeCloseTo(0, 10);
        expect(point2[1]).toBeCloseTo(10, 10);
        circle.delete();
        trimmed.delete();
    });

    it("should create ellipse curve", () => {
        const ellipse = geom.curves.geomEllipseCurve({
            radiusMajor: 10,
            radiusMinor: 5,
            center: [0, 0, 0],
            direction: [0, 0, 1]
        });
        expect(ellipse).toBeDefined();
        ellipse.delete();
    });

    it("should get 2d point from 2d curve on param", () => {
        const circle = geom.curves.geom2dCircle({
            radius: 10,
            center: [0, 0],
            direction: [1, 0],
            sense: false
        });
        const point = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: circle,
            param: 0.5
        });
        expect(point).toBeDefined();
        expect(point).toEqual([8.775825618903728, 4.79425538604203]);
        circle.delete();
    });

    it("should create geom 2d segment", () => {
        const segment = geom.curves.geom2dSegment({
            start: [1, 0],
            end: [10, 10]
        });
        expect(segment).toBeDefined();
        const pt = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: segment,
            param: 0.5
        });
        expect(pt).toEqual([1.3344823658112248, 0.3716470731235832]);

        const ptStart = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: segment,
            param: segment.FirstParameter()
        });
        expect(ptStart).toEqual([1, 0]);

        const ptEnd = geom.curves.get2dPointFrom2dCurveOnParam({
            shape: segment,
            param: segment.LastParameter()
        });
        expect(ptEnd).toEqual([10, 10]);
        segment.delete();
    });

    describe("refusing a curve or a surface that cannot be made", () => {
        it.each([-1, 0])("should refuse a 2d circle of radius %s", radius => {
            // Act
            const act = (): unknown => geom.curves.geom2dCircle({ center: [0, 0], direction: [1, 0], radius, sense: false });

            // Assert
            expect(act).toThrow(new InputError(`\`radius\` must be a finite number above 0; it is ${radius}.`, "radius"));
        });

        it.each([-1, 0])("should refuse a circle wire of radius %s, as it refuses a 2d circle, rather than hand back an empty wire", radius => {
            // Act
            const act = (): unknown => geom.curves.geomCircleCurve({ center: [0, 0, 0], direction: [0, 1, 0], radius });

            // Assert
            expect(act).toThrow(new InputError(`\`radius\` must be a finite number above 0; it is ${radius}.`, "radius"));
        });

        it("should refuse an ellipse wire whose minor radius exceeds its major one, as it refuses a 2d ellipse, rather than hand back an empty wire", () => {
            // Act
            const act = (): unknown => geom.curves.geomEllipseCurve({ center: [0, 0, 0], direction: [0, 1, 0], radiusMinor: 3, radiusMajor: 2 });

            // Assert
            expect(act).toThrow(new InputError("`radiusMinor` must not exceed `radiusMajor`; it is 3 and `radiusMajor` is 2.", "radiusMinor"));
        });

        it("should say why a 2d circle along a direction with no length cannot be made", () => {
            // Act
            const act = (): unknown => geom.curves.geom2dCircle({ center: [0, 0], direction: [0, 0], radius: 1, sense: false });

            // Assert
            expect(act).toThrow("Standard_DomainError: gp_Dir2d: the vector has no length");
        });

        it.each([-1, 0])("should refuse a 2d ellipse of minor radius %s", radiusMinor => {
            // Act
            const act = (): unknown => geom.curves.geom2dEllipse({ center: [0, 0], direction: [1, 0], radiusMinor, radiusMajor: 2, sense: false });

            // Assert
            expect(act).toThrow(new InputError(`\`radiusMinor\` must be a finite number above 0; it is ${radiusMinor}.`, "radiusMinor"));
        });

        it("should refuse a 2d ellipse whose minor radius exceeds its major one, which the kernel would hand back as no curve", () => {
            // Act
            const act = (): unknown => geom.curves.geom2dEllipse({ center: [0, 0], direction: [1, 0], radiusMinor: 3, radiusMajor: 2, sense: false });

            // Assert
            expect(act).toThrow(new InputError("`radiusMinor` must not exceed `radiusMajor`; it is 3 and `radiusMajor` is 2.", "radiusMinor"));
        });

        it("should refuse a 2d segment between two equal points, which the kernel would hand back as no curve", () => {
            // Act
            const act = (): unknown => geom.curves.geom2dSegment({ start: [1, 1], end: [1, 1] });

            // Assert
            expect(act).toThrow(new InputError("`start` and `end` are the same point, so there is no segment between them.", "end"));
        });

        it.each([-1, 0])("should refuse a cylindrical surface of radius %s", radius => {
            // Act
            const act = (): unknown => geom.surfaces.cylindricalSurface({ radius, center: [0, 0, 0], direction: [0, 1, 0] });

            // Assert
            expect(act).toThrow(new InputError(`\`radius\` must be a finite number above 0; it is ${radius}.`, "radius"));
        });

        it("should refuse a cylindrical surface along a direction with no length", () => {
            // Act
            const act = (): unknown => geom.surfaces.cylindricalSurface({ radius: 1, center: [0, 0, 0], direction: [0, 0, 0] });

            // Assert
            expect(act).toThrow(new InputError("`direction` is [0, 0, 0], which points nowhere.", "direction"));
        });

        it("should keep making a cylindrical surface of the radius it is given", () => {
            // Act
            const surface = geom.surfaces.cylindricalSurface({ radius: 2.5, center: [0, 0, 0], direction: [0, 1, 0] });

            // Assert
            expect(surface.Radius()).toBe(2.5);
            surface.delete();
        });
    });
});
