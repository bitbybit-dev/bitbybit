import { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { PathBuilder } from "../svg/path-builder";

/**
 * Generic 2D-path builder. Describe a complex path with the
 * line/quadratic/cubic/arc vocabulary and build a wire or face in a single call.
 * SVG-agnostic; also used by the SVG importer.
 */
export class OCCTPath {
    private readonly builder: PathBuilder;

    constructor(
        occ: BitbybitOcctModule,
        och: OccHelper
    ) {
        this.builder = new PathBuilder(occ, och);
    }

    /**
     * Builds a single shape (wire, compound of wires, or a face when makeFaces is set) from path subpaths.
     * @param inputs Subpaths described with the line/quadratic/cubic/arc vocabulary plus placement options
     * @group create
     * @shortname shape from path
     * @drawable true
     */
    shapeFromPath(inputs: Inputs.OCCT.ShapeFromPathDto): TopoDS_Shape | undefined {
        return this.builder.shapeFromPath(inputs);
    }
}
