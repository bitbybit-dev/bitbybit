import { describe, expect, it } from "vitest";
import type { Geom2, Geom3, Path2, Poly3 } from "@jscad/modeling/src/geometries/types";
import type * as Inputs from "./jscad-inputs";

type MutuallyAssignable<A extends B, B extends C, C = A> = true;

type Geom2Matches = MutuallyAssignable<Inputs.JSCAD.JSCADGeom2, Geom2>;
type Geom3Matches = MutuallyAssignable<Inputs.JSCAD.JSCADGeom3, Geom3>;
type Path2Matches = MutuallyAssignable<Inputs.JSCAD.JSCADPath2, Path2>;
type Poly3Matches = MutuallyAssignable<Inputs.JSCAD.JSCADPoly3, Poly3>;

describe("the JSCAD entity mirror", () => {
    it("should describe the same shapes the library does", () => {
        const matches: [Geom2Matches, Geom3Matches, Path2Matches, Poly3Matches] = [true, true, true, true];
        const solid: Inputs.JSCAD.JSCADGeom3 = { polygons: [], transforms: IDENTITY };

        // Act
        const asLibraryType: Geom3 = solid;

        // Assert
        expect(matches).toHaveLength(4);
        expect(asLibraryType.polygons).toEqual([]);
    });

    it("should narrow to one of the three shapes", () => {
        // Arrange
        const path: Inputs.JSCAD.JSCADEntity = { points: [], isClosed: false, transforms: IDENTITY };

        // Act
        const isPath = "isClosed" in path;

        // Assert
        expect(isPath).toBe(true);
    });
});

const IDENTITY: Inputs.JSCAD.JSCADMat4 = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
];
