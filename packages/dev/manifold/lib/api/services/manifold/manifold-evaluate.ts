import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

export class ManifoldEvaluate {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    volume(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.volume();
    }

    surfaceArea(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.surfaceArea();
    }

    isEmpty(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): boolean {
        return inputs.manifold.isEmpty();
    }

    numVert(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numVert();
    }

    numTri(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numTri();
    }

    numEdge(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numEdge();
    }

    numProp(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numProp();
    }

    numPropVert(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numPropVert();
    }

    boundingBox(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Inputs.Base.Vector3[] {
        const bounds = inputs.manifold.boundingBox();
        return [bounds.min, bounds.max];
    }

    tolerance(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.tolerance();
    }

    genus(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.genus();
    }

    minGap(inputs: Inputs.Manifold.ManifoldsMinGapDto<Manifold3D.Manifold>): number {
        return inputs.manifold1.minGap(inputs.manifold2, inputs.searchLength);
    }

    originalID(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.originalID();
    }

    status(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): string {
        return inputs.manifold.status();
    }

}
