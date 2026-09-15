import { BitbybitOcctModule, TopoDS_Compound, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

/**
 * Compounds in OpenCascade: a loose collection of shapes of any kind kept together as one shape, so
 * a set of parts can be moved, drawn or exported in one go. The shapes stay separate inside; a
 * compound does not fuse them. `shapes.shape` and the getters on the other shape classes take a
 * compound apart again.
 */
export class OCCTCompound {

    constructor(
        _occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Bundles any shapes into one compound so they can be handled as a single shape.
     *
     * The shapes are not joined or fused; they simply travel together.
     * @param inputs - The shapes to bundle
     * @returns The compound holding them
     * @group create
     * @shortname make
     * @drawable true
     * @example
     * ```typescript
     * const group = await bitbybit.occt.shapes.compound.makeCompound({ shapes: [box, sphere] });
     * ```
     */
    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<TopoDS_Shape>): TopoDS_Compound {
        return this.och.converterService.makeCompound(inputs);
    }

    /**
     * Takes a compound apart into the shapes it was made of, in the order they were added.
     * @param inputs - The compound
     * @returns The shapes inside it
     * @group get
     * @shortname get shapes of compound
     * @drawable true
     * @example
     * ```typescript
     * const parts = await bitbybit.occt.shapes.compound.getShapesOfCompound({ shape: group });
     * ```
     */
    getShapesOfCompound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Compound>): TopoDS_Shape[] {
        return this.och.shapeGettersService.getShapesOfCompound(inputs);
    }

}
