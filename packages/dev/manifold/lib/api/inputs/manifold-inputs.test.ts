import { describe, it, expect } from "vitest";
import * as Inputs from "./index";

// Every parameter object the Manifold kernel accepts. These carry no behaviour beyond two things, and
// both are load-bearing: the defaults they declare are what the visual editors are generated from,
// and each constructor argument has to land on the property of the same name - a constructor whose
// parameters slipped out of order would build the wrong shape silently.
//
// The table below is every DTO the namespace exports. A class missing from it is a class no test
// constructs; the two cases below then run against all of them.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDto = new (...args: any[]) => object;

const DTOS: [string, AnyDto][] = [
    ["DecomposedManifoldMeshDto", Inputs.Manifold.DecomposedManifoldMeshDto],
    ["DrawManifoldOrCrossSectionDto", Inputs.Manifold.DrawManifoldOrCrossSectionDto<unknown, unknown>],
    ["DrawManifoldsOrCrossSectionsDto", Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<unknown, unknown>],
    ["CreateFromMeshDto", Inputs.Manifold.CreateFromMeshDto],
    ["FromPolygonPointsDto", Inputs.Manifold.FromPolygonPointsDto],
    ["CrossSectionFromPolygonPointsDto", Inputs.Manifold.CrossSectionFromPolygonPointsDto],
    ["CrossSectionFromPolygonsPointsDto", Inputs.Manifold.CrossSectionFromPolygonsPointsDto],
    ["CubeDto", Inputs.Manifold.CubeDto],
    ["CreateContourSectionDto", Inputs.Manifold.CreateContourSectionDto],
    ["SquareDto", Inputs.Manifold.SquareDto],
    ["SphereDto", Inputs.Manifold.SphereDto],
    ["CylinderDto", Inputs.Manifold.CylinderDto],
    ["CircleDto", Inputs.Manifold.CircleDto],
    ["RectangleDto", Inputs.Manifold.RectangleDto],
    ["ManifoldDto", Inputs.Manifold.ManifoldDto<unknown>],
    ["CalculateNormalsDto", Inputs.Manifold.CalculateNormalsDto<unknown>],
    ["CalculateCurvatureDto", Inputs.Manifold.CalculateCurvatureDto<unknown>],
    ["CountDto", Inputs.Manifold.CountDto],
    ["ManifoldsMinGapDto", Inputs.Manifold.ManifoldsMinGapDto<unknown>],
    ["ManifoldRefineToleranceDto", Inputs.Manifold.ManifoldRefineToleranceDto<unknown>],
    ["ManifoldRefineLengthDto", Inputs.Manifold.ManifoldRefineLengthDto<unknown>],
    ["ManifoldRefineDto", Inputs.Manifold.ManifoldRefineDto<unknown>],
    ["ManifoldSmoothByNormalsDto", Inputs.Manifold.ManifoldSmoothByNormalsDto<unknown>],
    ["ManifoldSimplifyDto", Inputs.Manifold.ManifoldSimplifyDto<unknown>],
    ["ManifoldSetPropertiesDto", Inputs.Manifold.ManifoldSetPropertiesDto<unknown>],
    ["ManifoldSmoothOutDto", Inputs.Manifold.ManifoldSmoothOutDto<unknown>],
    ["HullPointsDto", Inputs.Manifold.HullPointsDto<unknown>],
    ["SliceDto", Inputs.Manifold.SliceDto<unknown>],
    ["MeshDto", Inputs.Manifold.MeshDto<unknown>],
    ["MeshVertexIndexDto", Inputs.Manifold.MeshVertexIndexDto<unknown>],
    ["MeshTriangleRunIndexDto", Inputs.Manifold.MeshTriangleRunIndexDto<unknown>],
    ["MeshHalfEdgeIndexDto", Inputs.Manifold.MeshHalfEdgeIndexDto<unknown>],
    ["MeshTriangleIndexDto", Inputs.Manifold.MeshTriangleIndexDto<unknown>],
    ["CrossSectionDto", Inputs.Manifold.CrossSectionDto<unknown>],
    ["CrossSectionsDto", Inputs.Manifold.CrossSectionsDto<unknown>],
    ["ExtrudeDto", Inputs.Manifold.ExtrudeDto<unknown>],
    ["RevolveDto", Inputs.Manifold.RevolveDto<unknown>],
    ["OffsetDto", Inputs.Manifold.OffsetDto<unknown>],
    ["SimplifyDto", Inputs.Manifold.SimplifyDto<unknown>],
    ["ComposeDto", Inputs.Manifold.ComposeDto<unknown>],
    ["MirrorCrossSectionDto", Inputs.Manifold.MirrorCrossSectionDto<unknown>],
    ["Scale2DCrossSectionDto", Inputs.Manifold.Scale2DCrossSectionDto<unknown>],
    ["TranslateCrossSectionDto", Inputs.Manifold.TranslateCrossSectionDto<unknown>],
    ["RotateCrossSectionDto", Inputs.Manifold.RotateCrossSectionDto<unknown>],
    ["ScaleCrossSectionDto", Inputs.Manifold.ScaleCrossSectionDto<unknown>],
    ["TranslateXYCrossSectionDto", Inputs.Manifold.TranslateXYCrossSectionDto<unknown>],
    ["TransformCrossSectionDto", Inputs.Manifold.TransformCrossSectionDto<unknown>],
    ["CrossSectionWarpDto", Inputs.Manifold.CrossSectionWarpDto<unknown>],
    ["MirrorDto", Inputs.Manifold.MirrorDto<unknown>],
    ["Scale3DDto", Inputs.Manifold.Scale3DDto<unknown>],
    ["TranslateDto", Inputs.Manifold.TranslateDto<unknown>],
    ["TranslateByVectorsDto", Inputs.Manifold.TranslateByVectorsDto<unknown>],
    ["RotateDto", Inputs.Manifold.RotateDto<unknown>],
    ["RotateXYZDto", Inputs.Manifold.RotateXYZDto<unknown>],
    ["ScaleDto", Inputs.Manifold.ScaleDto<unknown>],
    ["TranslateXYZDto", Inputs.Manifold.TranslateXYZDto<unknown>],
    ["TransformDto", Inputs.Manifold.TransformDto<unknown>],
    ["TransformsDto", Inputs.Manifold.TransformsDto<unknown>],
    ["ManifoldWarpDto", Inputs.Manifold.ManifoldWarpDto<unknown>],
    ["TwoCrossSectionsDto", Inputs.Manifold.TwoCrossSectionsDto<unknown>],
    ["TwoManifoldsDto", Inputs.Manifold.TwoManifoldsDto<unknown>],
    ["SplitManifoldsDto", Inputs.Manifold.SplitManifoldsDto<unknown>],
    ["TrimByPlaneDto", Inputs.Manifold.TrimByPlaneDto<unknown>],
    ["SplitByPlaneDto", Inputs.Manifold.SplitByPlaneDto<unknown>],
    ["SplitByPlaneOnOffsetsDto", Inputs.Manifold.SplitByPlaneOnOffsetsDto<unknown>],
    ["ManifoldsDto", Inputs.Manifold.ManifoldsDto<unknown>],
    ["ManifoldToMeshDto", Inputs.Manifold.ManifoldToMeshDto<unknown>],
    ["ManifoldsToMeshesDto", Inputs.Manifold.ManifoldsToMeshesDto<unknown>],
    ["DecomposeManifoldOrCrossSectionDto", Inputs.Manifold.DecomposeManifoldOrCrossSectionDto<unknown>],
    ["ManifoldOrCrossSectionDto", Inputs.Manifold.ManifoldOrCrossSectionDto<unknown>],
    ["ManifoldsOrCrossSectionsDto", Inputs.Manifold.ManifoldsOrCrossSectionsDto<unknown>],
    ["DecomposeManifoldsOrCrossSectionsDto", Inputs.Manifold.DecomposeManifoldsOrCrossSectionsDto<unknown>],
];

// Distinct values, one per constructor parameter, so that a parameter landing on the wrong property
// is visible: every one of them has to appear on the object that comes back.
const sentinels = (count: number): unknown[] => Array.from({ length: count }, (_, index) => ({ argument: index }));

describe("the Manifold input DTOs", () => {
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
