import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import * as Resolved from "../../api/resolved-inputs";
import { resolveDto } from "@bitbybit-dev/base";
import { checkedNumber, checkedShape, checkedShapes, checkedWithin } from "../base/input-checks";
import { clashOf } from "../base/surface-analysis";

/**
 * Finding shapes and faces that overlap or come closer than a clearance: pairs among a list of
 * placed shapes, faces of two shapes within a distance of each other, and faces of one shape that
 * cut through each other. Each clash names the two items by index with the distance between them
 * and, for solids, the volume they share.
 */
export class OCCTAnalysisClashes {

    constructor(
        private readonly occ: BitbybitOcctModule,
        _och: OccHelper,
    ) { }

    /**
     * Finds every pair among a list of shapes that overlap, touch or come within a clearance of each
     * other, such as colliding parts.
     *
     * A clash names the two by their positions in the list, from 0, with their distance, 0 where they
     * touch, overlap or nest, and the volume two solids share.
     * @param inputs - The shapes and the clearance
     * @returns The clashing pairs, in list order
     * @group clashes
     * @shortname clashes between shapes
     * @drawable false
     * @example
     * ```typescript
     * const clashes = await bitbybit.occt.analysis.clashes.betweenShapes({ shapes: [bracket, bolt, plate], clearance: 0.5 });
     * const overlapping = clashes.filter(clash => clash.volume > 0);
     * ```
     */
    betweenShapes(inputs: Inputs.OCCT.ClashesBetweenShapesDto<TopoDS_Shape>): Models.OCCT.Clash[] {
        const resolved = resolveDto(Inputs.OCCT.ClashesBetweenShapesDto, inputs) as Resolved.OCCT.ClashesBetweenShapesDto<TopoDS_Shape>;
        const shapes = checkedShapes(resolved.shapes);
        const clearance = checkedNumber(resolved.clearance, "clearance", 0);
        return this.occ.ClashesBetween(shapes, clearance).map(clashOf);
    }

    /**
     * Finds the faces of one shape that come within a clearance of faces of another, each pair
     * measured exactly.
     *
     * A clash names a face of each as `shapes.face.getFaces` numbers them, sorted by the first shape's
     * face. Candidates come from meshes of copies at `precision`, so the shapes given stay unmeshed;
     * faces without a surface take no part.
     * @param inputs - The two shapes, the clearance and the meshing precision
     * @returns The pairs of faces within the clearance
     * @group clashes
     * @shortname faces within
     * @drawable false
     * @example
     * ```typescript
     * const tooClose = await bitbybit.occt.analysis.clashes.facesWithin({ shapeA: housing, shapeB: board, clearance: 0.2, precision: 0.01 });
     * ```
     */
    facesWithin(inputs: Inputs.OCCT.FacesWithinDto<TopoDS_Shape>): Models.OCCT.Clash[] {
        const resolved = resolveDto(Inputs.OCCT.FacesWithinDto, inputs) as Resolved.OCCT.FacesWithinDto<TopoDS_Shape>;
        const shapeA = checkedShape(resolved.shapeA, "shapeA");
        const shapeB = checkedShape(resolved.shapeB, "shapeB");
        const clearance = checkedNumber(resolved.clearance, "clearance", 0);
        const precision = checkedWithin(resolved.precision, "precision", { above: 0 });
        return this.occ.FacesWithin(shapeA, shapeB, clearance, precision).map(clashOf);
    }

    /**
     * Finds the pairs of faces of one shape that cross each other anywhere but along an edge they
     * share.
     *
     * A clash names the two faces as `shapes.face.getFaces` numbers them, with both points at one
     * place on their crossing. Candidates come from a mesh of a copy at `precision` and are confirmed
     * exactly; a mere touch can be missed.
     * @param inputs - The shape and the meshing precision
     * @returns The pairs of crossing faces
     * @group clashes
     * @shortname self intersections
     * @drawable false
     * @example
     * ```typescript
     * const crossings = await bitbybit.occt.analysis.clashes.selfIntersections({ shape: sweep, precision: 0.01 });
     * const isClean = crossings.length === 0;
     * ```
     */
    selfIntersections(inputs: Inputs.OCCT.SelfIntersectionsDto<TopoDS_Shape>): Models.OCCT.Clash[] {
        const resolved = resolveDto(Inputs.OCCT.SelfIntersectionsDto, inputs) as Resolved.OCCT.SelfIntersectionsDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const precision = checkedWithin(resolved.precision, "precision", { above: 0 });
        return this.occ.SelfIntersections(shape, precision).map(clashOf);
    }
}
