import type { BitbybitOcctModule, TopoDS_Face } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type * as Resolved from "../../api/resolved-inputs";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import { checkedPoints, checkedShape } from "../base/input-checks";
import { checkedUVPairs, uvFractionsOn } from "../base/surface-analysis";

const SURFACE_TYPES_BY_KERNEL_NAME: ReadonlyMap<string, Inputs.OCCT.surfaceTypeEnum> = new Map([
    ["plane", Inputs.OCCT.surfaceTypeEnum.plane],
    ["cylinder", Inputs.OCCT.surfaceTypeEnum.cylinder],
    ["cone", Inputs.OCCT.surfaceTypeEnum.cone],
    ["sphere", Inputs.OCCT.surfaceTypeEnum.sphere],
    ["torus", Inputs.OCCT.surfaceTypeEnum.torus],
    ["bezier", Inputs.OCCT.surfaceTypeEnum.bezier],
    ["bspline", Inputs.OCCT.surfaceTypeEnum.bspline],
    ["revolution", Inputs.OCCT.surfaceTypeEnum.revolution],
    ["extrusion", Inputs.OCCT.surfaceTypeEnum.extrusion],
    ["offset", Inputs.OCCT.surfaceTypeEnum.offset],
]);

const SURFACE_TYPES_BY_KERNEL_ORDER: readonly Inputs.OCCT.surfaceTypeEnum[] = [
    Inputs.OCCT.surfaceTypeEnum.plane,
    Inputs.OCCT.surfaceTypeEnum.cylinder,
    Inputs.OCCT.surfaceTypeEnum.cone,
    Inputs.OCCT.surfaceTypeEnum.sphere,
    Inputs.OCCT.surfaceTypeEnum.torus,
    Inputs.OCCT.surfaceTypeEnum.bezier,
    Inputs.OCCT.surfaceTypeEnum.bspline,
    Inputs.OCCT.surfaceTypeEnum.revolution,
    Inputs.OCCT.surfaceTypeEnum.extrusion,
    Inputs.OCCT.surfaceTypeEnum.offset,
    Inputs.OCCT.surfaceTypeEnum.other,
];

/**
 * Questions asked of faces, answered with points and numbers: the closest point with its (u, v), the
 * principal, mean and Gaussian curvature at (u, v) values, and the kind of surface a face lies on.
 * (u, v) values are fractions of the face's UV bounds, from 0 at the start to 1 at the end, the
 * values `shapes.face.pointOnUV` and the other face samplers take.
 */
export class OCCTAnalysisSurfaces {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper,
    ) { }

    /**
     * Finds the point of a face nearest each given point, with its (u, v) and the face's normal there.
     *
     * The face is bounded, so a point beyond its edges comes to its boundary, which `isOnBoundary`
     * says. `u` and `v` are fractions of the face's UV bounds, as `shapes.face.pointOnUV` takes them;
     * `operations.closestPointsOnShapeFromPoints` gives the points alone, for any shape.
     * @param inputs - The face and the points to measure from
     * @returns One closest point per given point, in the same order
     * @group points
     * @shortname closest points
     * @drawable false
     * @example
     * ```typescript
     * const [nearest] = await bitbybit.occt.analysis.surfaces.closestPoints({ shape: face, points: [[3, 4, 15]] });
     * const normal = await bitbybit.occt.shapes.face.normalOnUV({ shape: face, paramU: nearest.u, paramV: nearest.v });
     * ```
     */
    closestPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Face>): Models.OCCT.FaceClosestPoint[] {
        const resolved = resolveDto(Inputs.OCCT.ClosestPointsOnShapeFromPointsDto, inputs) as Resolved.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Face>;
        const face = checkedShape(resolved.shape);
        const points = checkedPoints(resolved.points, "points");
        const found = this.occ.ClosestPointsOnFace(face, points.flat());
        if (found.length === 0) {
            return [];
        }
        const fractions = uvFractionsOn(this.occ, face);
        return found.map(closest => {
            const [u, v] = fractions(closest.u, closest.v);
            return { point: closest.point, u, v, distance: closest.distance, normal: closest.normal, isOnBoundary: closest.isOnBoundary };
        });
    }

    /**
     * Reads how a face bends at (u, v) pairs: its largest and smallest curvature with their
     * directions, their mean and product, and the normal.
     *
     * U and V are fractions of the face's UV bounds. A curvature is 1 over a radius, positive where the
     * face bulges out along its normal, so the inside of a hole reads negative.
     * @param inputs - The face and the U and V fraction pairs
     * @returns One curvature per pair, in the same order
     * @group curvature
     * @shortname curvatures on uvs
     * @drawable false
     * @example
     * ```typescript
     * const [middle] = await bitbybit.occt.analysis.surfaces.curvaturesOnUVs({ shape: face, paramsUV: [[0.5, 0.5]] });
     * console.log(middle.maxCurvature, middle.gaussianCurvature);
     * ```
     */
    curvaturesOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Models.OCCT.FaceCurvature[] {
        const resolved = resolveDto(Inputs.OCCT.DataOnUVsDto, inputs) as Resolved.OCCT.DataOnUVsDto<TopoDS_Face>;
        const face = checkedShape(resolved.shape);
        const pairs = checkedUVPairs(resolved.paramsUV, "paramsUV");
        return this.occ.CurvaturesOnFace(face, pairs.flat(), true).map(found => ({
            point: found.point,
            normal: found.normal,
            maxCurvature: found.maxCurvature,
            minCurvature: found.minCurvature,
            meanCurvature: found.meanCurvature,
            gaussianCurvature: found.gaussianCurvature,
            maxDirection: found.maxDirection,
            minDirection: found.minDirection,
            isUmbilic: found.isUmbilic,
            isDefined: found.isDefined,
        }));
    }

    /**
     * Tells what kind of surface a face lies on, such as a plane, a cylinder or a B-spline.
     *
     * A surface trimmed to a rectangle reads as the surface it trims, as `select.faces.ofType` reads
     * it, and a face without a surface, as an imported mesh has, reads as `other`. A shape that is not
     * a face is refused.
     * @param inputs - The face
     * @returns The kind of surface
     * @group shape
     * @shortname surface type
     * @drawable false
     * @example
     * ```typescript
     * const type = await bitbybit.occt.analysis.surfaces.surfaceType({ shape: face });
     * const isFlat = type === Bit.Inputs.OCCT.surfaceTypeEnum.plane;
     * ```
     */
    surfaceType(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Inputs.OCCT.surfaceTypeEnum {
        const resolved = resolveDto(Inputs.OCCT.ShapeDto, inputs) as Resolved.OCCT.ShapeDto<TopoDS_Face>;
        const shape = checkedShape(resolved.shape);
        const kind = this.och.enumService.getShapeTypeEnum(shape);
        if (kind !== Inputs.OCCT.shapeTypeEnum.face) {
            throw new InputError(`\`shape\` is a ${kind}, not a face.`, "shape");
        }
        const face = this.occ.CastToFace(shape);
        try {
            const name = this.occ.GetFaceSurfaceType(face);
            if (name === "trimmed") {
                return SURFACE_TYPES_BY_KERNEL_ORDER.find((_, order) => this.occ.SelectFacesOfType(face, [], [order]).length > 0) ?? Inputs.OCCT.surfaceTypeEnum.other;
            }
            return SURFACE_TYPES_BY_KERNEL_NAME.get(name) ?? Inputs.OCCT.surfaceTypeEnum.other;
        } finally {
            face.delete();
        }
    }
}
