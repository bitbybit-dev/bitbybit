import * as Inputs from "../../inputs/inputs";
import * as Manifold3D from "manifold-3d";
import { CrossSectionShapes } from "./cross-section-shapes";
import { CrossSectionOperations } from "./cross-section-operations";
import { CrossSectionTransforms } from "./cross-section-transforms";
import { CrossSectionBooleans } from "./cross-section-booleans";
import { CrossSectionEvaluate } from "./cross-section-evaluate";
import { BaseBitByBit } from "../../../base";

export class CrossSection {

    shapes: CrossSectionShapes;
    operations: CrossSectionOperations;
    transforms: CrossSectionTransforms;
    booleans: CrossSectionBooleans;
    evaluate: CrossSectionEvaluate;

    private manifold: Manifold3D.ManifoldToplevel;
    private base: BaseBitByBit;

    constructor(wasm: Manifold3D.ManifoldToplevel, base: BaseBitByBit) {
        this.manifold = wasm;
        this.base = base;
        this.shapes = new CrossSectionShapes(wasm);
        this.operations = new CrossSectionOperations(wasm);
        this.transforms = new CrossSectionTransforms(wasm);
        this.booleans = new CrossSectionBooleans(wasm);
        this.evaluate = new CrossSectionEvaluate(wasm);
    }

    crossSectionFromPoints(inputs: Inputs.Manifold.CrossSectionFromPolygonPointsDto): Manifold3D.CrossSection {
        let points = inputs.points;
        
        // Remove consecutive duplicates if requested
        if (inputs.removeDuplicates) {
            points = this.base.point.removeConsecutiveDuplicates({
                points,
                checkFirstAndLast: true,
                tolerance: inputs.tolerance || 1e-7
            });
        }
        
        // Convert Base.Point3[] to SimplePolygon (array of 2D points [x, y])
        const polygon: Manifold3D.SimplePolygon = points.map(p => [p[0], p[1]] as Manifold3D.Vec2);
        return this.manifold.CrossSection.ofPolygons([polygon], inputs.fillRule as Manifold3D.FillRule);
    }

    crossSectionFromPolygons(inputs: Inputs.Manifold.CrossSectionFromPolygonsPointsDto): Manifold3D.CrossSection {
        let polygonPoints = inputs.polygonPoints;
        
        // Remove consecutive duplicates from each polygon if requested
        if (inputs.removeDuplicates) {
            polygonPoints = polygonPoints.map(polygon => 
                this.base.point.removeConsecutiveDuplicates({
                    points: polygon,
                    checkFirstAndLast: true,
                    tolerance: inputs.tolerance || 1e-7
                })
            );
        }
        
        // Convert Base.Point3[][] to SimplePolygon[] (array of 2D points [x, y])
        const polygons: Manifold3D.SimplePolygon[] = polygonPoints.map(polygon => 
            polygon.map(p => [p[0], p[1]] as Manifold3D.Vec2)
        );
        return this.manifold.CrossSection.ofPolygons(polygons, inputs.fillRule as Manifold3D.FillRule);
    }

    crossSectionToPolygons(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Manifold3D.SimplePolygon[] {
        return inputs.crossSection.toPolygons();
    }

    crossSectionToPoints(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Inputs.Base.Point3[][] {
        const polygons = inputs.crossSection.toPolygons();
        return polygons.map(polygon => polygon.map(point => [point[0], point[1], 0]));
    }

    crossSectionsToPolygons(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.SimplePolygon[][] {
        return inputs.crossSections.map((crossSection) => {
            return this.crossSectionToPolygons({
                crossSection
            });
        });
    }

    crossSectionsToPoints(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): number[][][][] {
        return inputs.crossSections.map((crossSection) => {
            return this.crossSectionToPoints({
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
