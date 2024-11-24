import * as Inputs from "../../../../api/inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";
import { CrossSectionShapes } from "./cross-section-shapes";
import { CrossSectionOperations } from "./cross-section-operations";
import { CrossSectionTransforms } from "./cross-section-transforms";
import { CrossSectionBooleans } from "./cross-section-booleans";
import { CrossSectionEvaluate } from "./cross-section-evaluate";

export class CrossSection {

    shapes: CrossSectionShapes;
    operations: CrossSectionOperations;
    transforms: CrossSectionTransforms;
    booleans: CrossSectionBooleans;
    evaluate: CrossSectionEvaluate;

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
        this.shapes = new CrossSectionShapes(wasm);
        this.operations = new CrossSectionOperations(wasm);
        this.transforms = new CrossSectionTransforms(wasm);
        this.booleans = new CrossSectionBooleans(wasm);
        this.evaluate = new CrossSectionEvaluate(wasm);
    }

    crossSectionToPolygons(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Manifold3D.SimplePolygon[] {
        return inputs.crossSection.toPolygons();
    }

    crossSectionsToPolygons(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.SimplePolygon[][] {
        return inputs.crossSections.map((crossSection) => {
            return this.crossSectionToPolygons({
                crossSection
            });
        });
    }

    deleteCrossSection(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): void {
        inputs.crossSection.delete();
    }

    deleteCrossSections(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): void {
        inputs.crossSections.forEach((crossSection) => {
            return this.deleteCrossSection({
                crossSection
            });
        });
    }
}
