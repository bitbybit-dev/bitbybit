import * as Manifold3D from "manifold-3d";
import * as Inputs from "./inputs";
import { Manifold } from "./services/manifold/manifold";
import { CrossSection } from "./services/cross-section/cross-section";
import { Mesh } from "./services/mesh/mesh";

// Worker make an instance of this class itself
export class ManifoldService {
    plugins: any;
    
    public crossSection: CrossSection;
    public manifold: Manifold;
    mesh: Mesh;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.crossSection = new CrossSection(wasm);
        this.manifold = new Manifold(wasm);
        this.mesh = new Mesh(wasm);
    }

    decomposeManifoldOrCrossSection(inputs: Inputs.Manifold.DecomposeManifoldOrCrossSectionDto<Manifold3D.Manifold | Manifold3D.CrossSection>): Manifold3D.Mesh | Manifold3D.SimplePolygon[] {
        if ((inputs.manifoldOrCrossSection as Manifold3D.Manifold).getMesh) {
            return (inputs.manifoldOrCrossSection as Manifold3D.Manifold).getMesh(inputs.normalIdx);
        } else {
            return (inputs.manifoldOrCrossSection as Manifold3D.CrossSection).toPolygons();
        }
    }

    decomposeManifoldsOrCrossSections(inputs: Inputs.Manifold.DecomposeManifoldsOrCrossSectionsDto<Manifold3D.Manifold | Manifold3D.CrossSection>): (Manifold3D.Mesh | Manifold3D.SimplePolygon[])[] {
        return inputs.manifoldsOrCrossSections.map((manifoldOrCrossSection, index) => {
            const normalIdx = inputs.normalIdx ? inputs.normalIdx[index] : undefined;
            return this.decomposeManifoldOrCrossSection({
                manifoldOrCrossSection,
                normalIdx
            });
        });
    }
}
