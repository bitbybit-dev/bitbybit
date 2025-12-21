import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class CrossSectionOperations {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    hull(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.hull();
    }

    extrude(inputs: Inputs.Manifold.ExtrudeDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        return inputs.crossSection.extrude(inputs.height, inputs.nDivisions, inputs.twistDegrees, [inputs.scaleTopX, inputs.scaleTopY], inputs.center);
    }

    revolve(inputs: Inputs.Manifold.RevolveDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        const res = inputs.crossSection.revolve(inputs.circularSegments, inputs.revolveDegrees);
        if (inputs.matchProfile) {
            return res.rotate([90, 0, 0]);
        } else {
            return res;
        }
    }

    offset(inputs: Inputs.Manifold.OffsetDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.offset(inputs.delta, inputs.joinType as Manifold3D.JoinType, inputs.miterLimit, inputs.circularSegments);
    }

    simplify(inputs: Inputs.Manifold.SimplifyDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.simplify(inputs.epsilon);
    }

    compose(inputs: Inputs.Manifold.ComposeDto<(Manifold3D.CrossSection | Manifold3D.Polygons)[]>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { compose } = CrossSection;
        return compose(inputs.polygons);
    }

    decompose(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection[] {
        return inputs.crossSection.decompose();
    }
}
