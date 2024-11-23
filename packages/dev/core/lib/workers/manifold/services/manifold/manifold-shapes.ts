import * as Inputs from "../../../../api/inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class ManifoldShapes {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    cube(inputs: Inputs.Manifold.CubeDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { cube } = Manifold;
        return cube(inputs.size, inputs.center);
    }

    sphere(inputs: Inputs.Manifold.SphereDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { sphere } = Manifold;
        return sphere(inputs.radius, inputs.circularSegments);
    }

    tetrahedron(): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { tetrahedron } = Manifold;
        return tetrahedron();
    }

    cylinder(inputs: Inputs.Manifold.CylinderDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { cylinder } = Manifold;
        return cylinder(inputs.height, inputs.radiusLow, inputs.radiusHigh, inputs.circularSegments, inputs.center);
    }

}
