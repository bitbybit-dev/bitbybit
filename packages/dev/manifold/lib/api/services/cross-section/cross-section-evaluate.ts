import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

export class CrossSectionEvaluate {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    area(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): number {
        return inputs.crossSection.area();
    }

    isEmpty(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): boolean {
        return inputs.crossSection.isEmpty();
    }

    numVert(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): number {
        return inputs.crossSection.numVert();
    }

    numContour(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): number {
        return inputs.crossSection.numContour();
    }

    bounds(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Inputs.Base.Vector2[] {
        const bounds = inputs.crossSection.bounds();
        return [bounds.min, bounds.max];
    }

}
