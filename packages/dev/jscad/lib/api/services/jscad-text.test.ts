import { describe, it, expect, beforeAll } from "vitest";
import { expectSolid, getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const TEXT = "AV";
const SEGMENTS = 8;
const HEIGHT = 10;
const EXTRUSION_HEIGHT = 2;
const EXTRUSION_SIZE = 0.5;
const RADIUS = 0.5;

describe("JSCADText", () => {
    let jscad: Jscad;

    beforeAll(async () => {
        ({ jscad } = await getJscad());
    });

    describe("createVectorText", () => {
        it("should give one stroke list per character of the text", () => {
            // Act
            const strokes = jscad.text.createVectorText(new Inputs.JSCAD.TextDto(TEXT, SEGMENTS));

            // Assert
            expect(strokes.length).toBeGreaterThanOrEqual(TEXT.length);
        });

        it("should give every stroke as a list of points on the plane", () => {
            // Act
            const strokes = jscad.text.createVectorText(new Inputs.JSCAD.TextDto(TEXT, SEGMENTS));

            // Assert
            expect(strokes[0]![0]).toHaveLength(2);
        });

        it("should scale the strokes to the height it was given", () => {
            // Act
            const small = jscad.text.createVectorText(new Inputs.JSCAD.TextDto(TEXT, SEGMENTS, 0, 0, 1));
            const large = jscad.text.createVectorText(new Inputs.JSCAD.TextDto(TEXT, SEGMENTS, 0, 0, HEIGHT));

            // Assert
            const highestSmall = Math.max(...small.flat().map((point) => point[1]));
            const highestLarge = Math.max(...large.flat().map((point) => point[1]));
            expect(highestLarge).toBeGreaterThan(highestSmall);
        });
    });

    describe("cylindricalText", () => {
        it("should build one solid per character", () => {
            // Act
            const solids = jscad.text.cylindricalText(new Inputs.JSCAD.CylinderTextDto(TEXT, EXTRUSION_HEIGHT, EXTRUSION_SIZE, SEGMENTS));

            // Assert
            expect(solids.length).toBeGreaterThanOrEqual(TEXT.length);
        });

        it("should build solids rather than paths", () => {
            // Act
            const solids = jscad.text.cylindricalText(new Inputs.JSCAD.CylinderTextDto(TEXT, EXTRUSION_HEIGHT, EXTRUSION_SIZE, SEGMENTS));

            // Assert
            expect(expectSolid(solids[0]!).polygons.length).toBeGreaterThan(0);
        });

        it("should centre the run on the origin rather than starting there", () => {
            // Act
            const solids = jscad.text.cylindricalText(new Inputs.JSCAD.CylinderTextDto(TEXT, EXTRUSION_HEIGHT, EXTRUSION_SIZE, SEGMENTS));
            const xs = solids.flatMap((solid) => expectSolid(solid).polygons.flatMap((p) => p.vertices.map((v) => v[0])));

            // Assert
            expect(Math.min(...xs)).toBeLessThan(0);
            expect(Math.max(...xs)).toBeGreaterThan(0);
        });
    });

    describe("sphericalText", () => {
        it("should build one solid per character", () => {
            // Act
            const solids = jscad.text.sphericalText(new Inputs.JSCAD.SphereTextDto(TEXT, RADIUS, SEGMENTS));

            // Assert
            expect(solids.length).toBeGreaterThanOrEqual(TEXT.length);
        });

        it("should build solids rather than paths", () => {
            // Act
            const solids = jscad.text.sphericalText(new Inputs.JSCAD.SphereTextDto(TEXT, RADIUS, SEGMENTS));

            // Assert
            expect(expectSolid(solids[0]!).polygons.length).toBeGreaterThan(0);
        });

        it("should centre the run on the origin rather than starting there", () => {
            // Act
            const solids = jscad.text.sphericalText(new Inputs.JSCAD.SphereTextDto(TEXT, RADIUS, SEGMENTS));
            const xs = solids.flatMap((solid) => expectSolid(solid).polygons.flatMap((p) => p.vertices.map((v) => v[0])));

            // Assert
            expect(Math.min(...xs)).toBeLessThan(0);
            expect(Math.max(...xs)).toBeGreaterThan(0);
        });
    });
});
