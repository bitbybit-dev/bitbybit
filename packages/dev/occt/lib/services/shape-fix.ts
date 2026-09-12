import { OccHelper } from "../occ-helper";
import { BitbybitOcctModule, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs";

/**
 * Repairs for OpenCascade shapes that came out of a file or an operation with small defects: gaps
 * between edges, edges too short to matter, wires whose edges point different ways, tolerances that
 * drifted. Run `basicShapeRepair` on a shape that fails `shapes.shape.isValid` or refuses a
 * boolean; the wire fixes clean up outlines before they become faces. Every method returns a new
 * shape.
 */
export class OCCTShapeFix {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Runs the kernel's general repair over a shape: closes small gaps, fixes wire and face defects
     * and brings tolerances into the given range.
     *
     * `precision` is the size of defect to look for, `minTolerance` and `maxTolerance` bound the
     * tolerances the repaired shape may carry, all in model units. Try it first on any shape that
     * fails `shapes.shape.isValid`.
     * @param inputs - The shape and the precision and tolerance bounds
     * @returns The repaired shape
     * @group shape
     * @shortname basic shape repair
     * @drawable true
     * @example
     * ```typescript
     * const fixed = await bitbybit.occt.shapeFix.basicShapeRepair({ shape: imported, precision: 0.001, maxTolerance: 0.01, minTolerance: 0.0001 });
     * ```
     */
    basicShapeRepair(inputs: Inputs.OCCT.BasicShapeRepairDto<TopoDS_Shape>): TopoDS_Shape {
        const shapeFix = new this.occ.ShapeFix_Shape();
        shapeFix.Init(inputs.shape);
        shapeFix.SetPrecision(inputs.precision);
        shapeFix.SetMaxTolerance(inputs.maxTolerance);
        shapeFix.SetMinTolerance(inputs.minTolerance);
        shapeFix.Perform();
        const result = shapeFix.Shape();
        shapeFix.delete();
        return result;
    }

    /**
     * Removes edges shorter than `precsmall` from a wire and closes the gaps they leave, so a tiny
     * sliver no longer breaks a fillet or a face.
     *
     * With `lockvtx` true the existing vertices are kept in place; otherwise they may move to close
     * the gap. A `precsmall` of 0 uses the wire's own tolerance.
     * @param inputs - The wire, whether to keep vertices fixed and the length below which an edge counts as small
     * @returns The cleaned wire
     * @group wire
     * @shortname fix small edge
     * @drawable true
     * @example
     * ```typescript
     * const clean = await bitbybit.occt.shapeFix.fixSmallEdgeOnWire({ shape: wire, lockvtx: false, precsmall: 0.001 });
     * ```
     */
    fixSmallEdgeOnWire(inputs: Inputs.OCCT.FixSmallEdgesInWireDto<TopoDS_Wire>): TopoDS_Wire {
        const wireFix = new this.occ.ShapeFix_Wire();
        wireFix.Load(inputs.shape);
        wireFix.FixSmall(inputs.lockvtx, inputs.precsmall);
        wireFix.Perform();
        const result = wireFix.Wire();
        return result;
    }

    /**
     * Rebuilds a wire so its edges run head to tail in one direction along it.
     *
     * A wire assembled from loose edges can hold edges pointing against the flow; this walks the
     * wire in order and joins the edges again the right way round, which some operations need.
     * @param inputs - The wire
     * @returns The wire with consistently oriented edges
     * @group wire
     * @shortname fix edge orientations
     * @drawable true
     * @example
     * ```typescript
     * const ordered = await bitbybit.occt.shapeFix.fixEdgeOrientationsAlongWire({ shape: wire });
     * ```
     */
    fixEdgeOrientationsAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.edgesService.fixEdgeOrientationsAlongWire(inputs);
    }
}
