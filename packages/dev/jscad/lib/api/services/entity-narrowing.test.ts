import { describe, expect, it } from "vitest";
import * as Inputs from "../inputs/jscad-inputs";
import { asEntity, asKind, asPath, asRegion, asSolid, oneOrMany } from "./entity-narrowing";

const IDENTITY: Inputs.JSCAD.JSCADMat4 = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
];
const SOLID: Inputs.JSCAD.JSCADGeom3 = { polygons: [], transforms: IDENTITY };
const REGION: Inputs.JSCAD.JSCADGeom2 = { sides: [], transforms: IDENTITY };
const PATH: Inputs.JSCAD.JSCADPath2 = { points: [], isClosed: false, transforms: IDENTITY };

describe("narrowing a JSCAD entity to the kind an operation needs", () => {
    describe("asSolid", () => {
        it("should return the solid it was given", () => {
            // Act
            const narrowed = asSolid(SOLID, "union");

            // Assert
            expect(narrowed).toBe(SOLID);
        });

        it("should name the operation and what arrived when given a 2D region", () => {
            // Act
            const failing = (): Inputs.JSCAD.JSCADGeom3 => asSolid(REGION, "union");

            // Assert
            expect(failing).toThrow("union needs a 3D solid, but was given a 2D geometry or a path.");
        });

        it("should reject a path as well as a region", () => {
            // Act
            const failing = (): Inputs.JSCAD.JSCADGeom3 => asSolid(PATH, "subtract");

            // Assert
            expect(failing).toThrow("subtract needs a 3D solid");
        });
    });

    describe("asPath", () => {
        it("should return the path it was given", () => {
            // Act
            const narrowed = asPath(PATH, "close");

            // Assert
            expect(narrowed).toBe(PATH);
        });

        it("should name the operation when given a solid", () => {
            // Act
            const failing = (): Inputs.JSCAD.JSCADPath2 => asPath(SOLID, "close");

            // Assert
            expect(failing).toThrow("close needs a 2D path, but was given a 2D region or a solid.");
        });
    });

    describe("asRegion", () => {
        it("should return the region it was given", () => {
            // Act
            const narrowed = asRegion(REGION, "extrudeRotate");

            // Assert
            expect(narrowed).toBe(REGION);
        });

        it("should name the operation when given a path", () => {
            // Act
            const failing = (): Inputs.JSCAD.JSCADGeom2 => asRegion(PATH, "extrudeRotate");

            // Assert
            expect(failing).toThrow("extrudeRotate needs a 2D geometry, but was given a path or a solid.");
        });
    });

    describe("oneOrMany", () => {
        it("should wrap a single geometry in a list", () => {
            // Act
            const list = oneOrMany(SOLID);

            // Assert
            expect(list).toEqual([SOLID]);
        });

        it("should pass a list through unchanged", () => {
            const many = [SOLID, REGION] as unknown as Inputs.JSCAD.JSCADEntity;

            // Act
            const list = oneOrMany(many);

            // Assert
            expect(list).toEqual([SOLID, REGION]);
        });
    });

    describe("the bridges to the kernel's per-kind overloads", () => {
        it("should hand asKind the same list it was given", () => {
            // Act
            const bridged = asKind<Inputs.JSCAD.JSCADGeom3>([SOLID]);

            // Assert
            expect(bridged).toEqual([SOLID]);
        });

        it("should hand asEntity back what the kernel returned", () => {
            // Act
            const bridged = asEntity(REGION);

            // Assert
            expect(bridged).toBe(REGION);
        });
    });
});
