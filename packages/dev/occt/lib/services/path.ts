import { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { PathBuilder } from "../svg/path-builder";

/**
 * Generic 2D-path builder. Describe a complex path with the
 * line/quadratic/cubic/arc vocabulary and build a wire or face in one call.
 * Used by the SVG importer, but useful on its own for sketch-style workflows.
 */
export class OCCTPath {
    private readonly builder: PathBuilder;

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
        this.builder = new PathBuilder(occ, och);
    }

    /** Build a single shape (wire/compound, or face when makeFaces) from subpaths. */
    shapeFromPath(inputs: Inputs.OCCT.ShapeFromPathDto): TopoDS_Shape | undefined {
        return this.builder.shapeFromPath(inputs);
    }
}
