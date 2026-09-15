import { BitbybitOcctModule, TopoDS_Face, Geom_CylindricalSurface, Geom_Surface } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

/**
 * Construction surfaces of OpenCascade: the infinite mathematical surfaces that faces are cut from.
 * `cylindricalSurface` builds one and `surfaceFromFace` reads the surface a face lies on; both feed
 * `shapes.face.faceFromSurface`, `shapes.face.faceFromSurfaceAndWire` and
 * `shapes.edge.makeEdgeFromGeom2dCurveAndSurface`. A surface has no boundary and cannot be drawn by
 * itself.
 */
export class OCCTSurfaces {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Creates an infinite cylindrical surface of the given radius around an axis through `center`
     * along `direction`.
     *
     * It has no ends and cannot be drawn; cut a face from it with
     * `shapes.face.faceFromSurfaceAndWire` or place wires on it with `shapes.wire.placeWireOnFace`
     * after making a face.
     * @param inputs - The radius, a point on the axis and the axis direction
     * @returns The cylindrical surface
     * @group surfaces
     * @shortname cylindrical
     * @drawable false
     * @example
     * ```typescript
     * const cylinder = await bitbybit.occt.geom.surfaces.cylindricalSurface({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    cylindricalSurface(inputs: Inputs.OCCT.GeomCylindricalSurfaceDto): Geom_CylindricalSurface {
        const ax = this.och.entitiesService.gpAx3_4(inputs.center, inputs.direction);
        const res = new this.occ.Geom_CylindricalSurface(ax, inputs.radius);
        ax.delete();
        return res;
    }

    /**
     * Reads the underlying surface a face lies on, without its boundary.
     *
     * A face is a bounded piece of such a surface; the surface itself extends beyond the face,
     * which is what lets a new wire be placed on it and cut into a different face.
     * @param inputs - The face
     * @returns The surface the face lies on
     * @group surfaces
     * @shortname from face
     * @drawable false
     * @example
     * ```typescript
     * const surface = await bitbybit.occt.geom.surfaces.surfaceFromFace({ shape: face });
     * ```
     */
    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Geom_Surface {
        return this.och.surfaceFromFace(inputs);
    }

}
