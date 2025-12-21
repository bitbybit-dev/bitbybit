import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

export class ManifoldOperations {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    hull(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.hull();
    }

    hullPoints(inputs: Inputs.Manifold.HullPointsDto<(Inputs.Base.Point3 | Manifold3D.Manifold)[]>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { hull } = Manifold;
        return hull(inputs.points);
    }

    slice(inputs: Inputs.Manifold.SliceDto<Manifold3D.Manifold>): Manifold3D.CrossSection {
        return inputs.manifold.slice(inputs.height);
    }

    project(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.CrossSection {
        return inputs.manifold.project();
    }

    setTolerance(inputs: Inputs.Manifold.ManifoldRefineToleranceDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.setTolerance(inputs.tolerance);
    }

    asOriginal(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.asOriginal();
    }

    reserveIds(inputs: Inputs.Manifold.CountDto): number {
        const { Manifold } = this.manifold;
        const { reserveIDs } = Manifold;
        return reserveIDs(inputs.count);
    }

    compose(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { compose } = Manifold;
        return compose(inputs.manifolds);
    }

    decompose(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.manifold.decompose();
    }

    calculateNormals(inputs: Inputs.Manifold.CalculateNormalsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.calculateNormals(inputs.normalIdx, inputs.minSharpAngle);
    }

    calculateCurvature(inputs: Inputs.Manifold.CalculateCurvatureDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.calculateCurvature(inputs.gaussianIdx, inputs.meanIdx);
    }

    refineToTolerance(inputs: Inputs.Manifold.ManifoldRefineToleranceDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.refineToTolerance(inputs.tolerance);
    }

    refineToLength(inputs: Inputs.Manifold.ManifoldRefineLengthDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.refineToLength(inputs.length);
    }

    refine(inputs: Inputs.Manifold.ManifoldRefineDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.refine(inputs.number);
    }

    smoothOut(inputs: Inputs.Manifold.ManifoldSmoothOutDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.smoothOut(inputs.minSharpAngle, inputs.minSmoothness);
    }

    smoothByNormals(inputs: Inputs.Manifold.ManifoldSmoothByNormalsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.smoothByNormals(inputs.normalIdx);
    }

    simplify(inputs: Inputs.Manifold.ManifoldSimplifyDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.simplify(inputs.tolerance);
    }

    setProperties(inputs: Inputs.Manifold.ManifoldSetPropertiesDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.setProperties(inputs.numProp, inputs.propFunc);
    }
}
