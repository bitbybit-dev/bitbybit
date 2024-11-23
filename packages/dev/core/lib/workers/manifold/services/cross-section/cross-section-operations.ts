import * as Inputs from "../../../../api/inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class CrossSectionOperations {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    extrude(inputs: Inputs.Manifold.ExtrudeDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        return inputs.crossSection.extrude(inputs.height, inputs.nDivisions, inputs.twistDegrees, [inputs.scaleTopX, inputs.scaleTopY], inputs.center);
    }

    revolve(inputs: Inputs.Manifold.RevolveDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        return inputs.crossSection.revolve(inputs.circularSegments, inputs.revolveDegrees);
    }

    offset(inputs: Inputs.Manifold.OffsetDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.offset(inputs.delta, inputs.joinType, inputs.miterLimit, inputs.circularSegments);
    }

    simplify(inputs: Inputs.Manifold.SimplifyDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.simplify(inputs.epsilon);
    }
}
