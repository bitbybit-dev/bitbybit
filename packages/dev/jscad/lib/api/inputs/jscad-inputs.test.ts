import { describe, it, expect } from "vitest";
import * as Inputs from "./index";

// Every parameter object the JSCAD kernel accepts. These carry no behaviour beyond two things, and
// both are load-bearing: the defaults they declare are what the visual editors are generated from,
// and each constructor argument has to land on the property of the same name - a constructor whose
// parameters slipped out of order would build the wrong shape silently.
//
// The table below is every DTO the namespace exports. A class missing from it is a class no test
// constructs; the two cases below then run against all of them.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDto = new (...args: any[]) => object;

const DTOS: [string, AnyDto][] = [
    ["PolylinePropertiesDto", Inputs.JSCAD.PolylinePropertiesDto],
    ["MeshDto", Inputs.JSCAD.MeshDto],
    ["MeshesDto", Inputs.JSCAD.MeshesDto],
    ["DrawSolidMeshDto", Inputs.JSCAD.DrawSolidMeshDto<unknown>],
    ["DrawSolidMeshesDto", Inputs.JSCAD.DrawSolidMeshesDto<unknown>],
    ["DrawPathDto", Inputs.JSCAD.DrawPathDto<unknown>],
    ["TransformSolidsDto", Inputs.JSCAD.TransformSolidsDto],
    ["TransformSolidDto", Inputs.JSCAD.TransformSolidDto],
    ["DownloadSolidDto", Inputs.JSCAD.DownloadSolidDto],
    ["DownloadGeometryDto", Inputs.JSCAD.DownloadGeometryDto],
    ["DownloadSolidsDto", Inputs.JSCAD.DownloadSolidsDto],
    ["ColorizeDto", Inputs.JSCAD.ColorizeDto],
    ["BooleanObjectsDto", Inputs.JSCAD.BooleanObjectsDto],
    ["BooleanTwoObjectsDto", Inputs.JSCAD.BooleanTwoObjectsDto],
    ["BooleanObjectsFromDto", Inputs.JSCAD.BooleanObjectsFromDto],
    ["ExpansionDto", Inputs.JSCAD.ExpansionDto],
    ["OffsetDto", Inputs.JSCAD.OffsetDto],
    ["ExtrudeLinearDto", Inputs.JSCAD.ExtrudeLinearDto],
    ["HullDto", Inputs.JSCAD.HullDto],
    ["ExtrudeRectangularDto", Inputs.JSCAD.ExtrudeRectangularDto],
    ["ExtrudeRectangularPointsDto", Inputs.JSCAD.ExtrudeRectangularPointsDto],
    ["ExtrudeRotateDto", Inputs.JSCAD.ExtrudeRotateDto],
    ["PolylineDto", Inputs.JSCAD.PolylineDto],
    ["CurveDto", Inputs.JSCAD.CurveDto],
    ["PointsDto", Inputs.JSCAD.PointsDto],
    ["PathDto", Inputs.JSCAD.PathDto],
    ["PathFromPointsDto", Inputs.JSCAD.PathFromPointsDto],
    ["PathsFromPointsDto", Inputs.JSCAD.PathsFromPointsDto],
    ["PathFromPolylineDto", Inputs.JSCAD.PathFromPolylineDto],
    ["PathAppendCurveDto", Inputs.JSCAD.PathAppendCurveDto],
    ["PathAppendPointsDto", Inputs.JSCAD.PathAppendPointsDto],
    ["PathAppendPolylineDto", Inputs.JSCAD.PathAppendPolylineDto],
    ["PathAppendArcDto", Inputs.JSCAD.PathAppendArcDto],
    ["CircleDto", Inputs.JSCAD.CircleDto],
    ["EllipseDto", Inputs.JSCAD.EllipseDto],
    ["SquareDto", Inputs.JSCAD.SquareDto],
    ["RectangleDto", Inputs.JSCAD.RectangleDto],
    ["RoundedRectangleDto", Inputs.JSCAD.RoundedRectangleDto],
    ["StarDto", Inputs.JSCAD.StarDto],
    ["CubeDto", Inputs.JSCAD.CubeDto],
    ["CubeCentersDto", Inputs.JSCAD.CubeCentersDto],
    ["CuboidDto", Inputs.JSCAD.CuboidDto],
    ["CuboidCentersDto", Inputs.JSCAD.CuboidCentersDto],
    ["RoundedCuboidDto", Inputs.JSCAD.RoundedCuboidDto],
    ["RoundedCuboidCentersDto", Inputs.JSCAD.RoundedCuboidCentersDto],
    ["CylidnerEllipticDto", Inputs.JSCAD.CylidnerEllipticDto],
    ["CylidnerCentersEllipticDto", Inputs.JSCAD.CylidnerCentersEllipticDto],
    ["CylidnerDto", Inputs.JSCAD.CylidnerDto],
    ["RoundedCylidnerDto", Inputs.JSCAD.RoundedCylidnerDto],
    ["EllipsoidDto", Inputs.JSCAD.EllipsoidDto],
    ["EllipsoidCentersDto", Inputs.JSCAD.EllipsoidCentersDto],
    ["GeodesicSphereDto", Inputs.JSCAD.GeodesicSphereDto],
    ["GeodesicSphereCentersDto", Inputs.JSCAD.GeodesicSphereCentersDto],
    ["CylidnerCentersDto", Inputs.JSCAD.CylidnerCentersDto],
    ["RoundedCylidnerCentersDto", Inputs.JSCAD.RoundedCylidnerCentersDto],
    ["SphereDto", Inputs.JSCAD.SphereDto],
    ["SphereCentersDto", Inputs.JSCAD.SphereCentersDto],
    ["TorusDto", Inputs.JSCAD.TorusDto],
    ["TextDto", Inputs.JSCAD.TextDto],
    ["CylinderTextDto", Inputs.JSCAD.CylinderTextDto],
    ["SphereTextDto", Inputs.JSCAD.SphereTextDto],
    ["FromPolygonPoints", Inputs.JSCAD.FromPolygonPoints],
];

// Distinct values, one per constructor parameter, so that a parameter landing on the wrong property
// is visible: every one of them has to appear on the object that comes back.
const sentinels = (count: number): unknown[] => Array.from({ length: count }, (_, index) => ({ argument: index }));

describe("the JSCAD input DTOs", () => {
    describe("constructed with nothing", () => {
        it.each(DTOS)("%s should carry no property it left undefined", (_name, Dto) => {
            // Act
            const built = new Dto();

            // Assert
            expect(Object.entries(built).filter(([, value]) => value === undefined)).toEqual([]);
        });
    });

    describe("constructed with values", () => {
        it.each(DTOS)("%s should hold every value its constructor was given", (_name, Dto) => {
            // Arrange
            const values = sentinels(Dto.length);

            // Act
            const built = new Dto(...values);

            // Assert
            expect(Object.values(built)).toEqual(expect.arrayContaining(values));
        });

        it.each(DTOS)("%s should give each value a property of its own", (_name, Dto) => {
            // Arrange
            const values = sentinels(Dto.length);

            // Act
            const built = new Dto(...values);
            const held = Object.values(built).filter((value) => values.includes(value));

            // Assert
            expect(held).toHaveLength(values.length);
        });
    });
});
