import * as Inputs from "../../../../api/inputs";
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

    setTolerance(inputs: Inputs.Manifold.ManifoldToleranceDto<Manifold3D.Manifold>): Manifold3D.Manifold {
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
}
