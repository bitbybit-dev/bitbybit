import * as Inputs from "../../../../api/inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";
import { CrossSectionShapes } from "./cross-section-shapes";
import { CrossSectionOperations } from "./cross-section-operations";

export class CrossSection {

    shapes: CrossSectionShapes;
    operations: CrossSectionOperations;

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
        this.shapes = new CrossSectionShapes(wasm);
        this.operations = new CrossSectionOperations(wasm);
    }

    crossSectionToPolygons(inputs: Inputs.Manifold.ManifoldToMeshDto<Manifold3D.CrossSection>): Manifold3D.SimplePolygon[] {
        return (inputs.manifold as Manifold3D.CrossSection).toPolygons();
    }

}
