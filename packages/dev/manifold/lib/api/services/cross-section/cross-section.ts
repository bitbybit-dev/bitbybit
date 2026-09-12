import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";
import { CrossSectionShapes } from "./cross-section-shapes";
import { CrossSectionOperations } from "./cross-section-operations";
import { CrossSectionTransforms } from "./cross-section-transforms";
import { CrossSectionBooleans } from "./cross-section-booleans";
import { CrossSectionEvaluate } from "./cross-section-evaluate";
import { BaseBitByBit } from "../../../base";

/**
 * Flat outlines in the Manifold kernel, the 2D shapes that `operations.extrude` and
 * `operations.revolve` turn into solids and that `slice` and `project` cut out of them. A
 * cross-section is one or more closed polygons in the XY plane, holes included; `shapes` builds
 * them, `booleans` combines them, `operations` offsets, hulls and extrudes them, `transforms` moves
 * them and `evaluate` measures them. The methods here convert between cross-sections and plain
 * point lists, and free the memory a cross-section holds.
 */
export class CrossSection {

    shapes: CrossSectionShapes;
    operations: CrossSectionOperations;
    booleans: CrossSectionBooleans;
    transforms: CrossSectionTransforms;
    evaluate: CrossSectionEvaluate;

    private manifold: Manifold3D.ManifoldToplevel;
    private base: BaseBitByBit;

    constructor(wasm: Manifold3D.ManifoldToplevel, base: BaseBitByBit) {
        this.manifold = wasm;
        this.base = base;
        this.shapes = new CrossSectionShapes(wasm);
        this.operations = new CrossSectionOperations(wasm);
        this.booleans = new CrossSectionBooleans(wasm);
        this.transforms = new CrossSectionTransforms(wasm);
        this.evaluate = new CrossSectionEvaluate(wasm);
    }

    /**
     * Builds a cross-section from one polygon given as points; only the X and Y of each point are
     * used.
     *
     * `fillRule` decides which regions of a self-crossing polygon count as inside;
     * `removeDuplicates` drops consecutive repeated points within `tolerance` first.
     * @param inputs - The polygon points, the fill rule and the duplicate handling
     * @returns The cross-section
     * @group create
     * @shortname cross section from points
     * @drawable true
     * @example
     * ```typescript
     * const outline = await bitbybit.manifold.crossSection.crossSectionFromPoints({
     *     points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]],
     *     fillRule: Bit.Inputs.Manifold.fillRuleEnum.positive,
     *     removeDuplicates: false,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    crossSectionFromPoints(inputs: Inputs.Manifold.CrossSectionFromPolygonPointsDto): Manifold3D.CrossSection {
        let points = inputs.points;
        
        if (inputs.removeDuplicates) {
            points = this.base.point.removeConsecutiveDuplicates({
                points,
                checkFirstAndLast: true,
                tolerance: inputs.tolerance || 1e-7
            });
        }
        
        const polygon: Manifold3D.SimplePolygon = points.map(p => [p[0], p[1]] as Manifold3D.Vec2);
        return this.manifold.CrossSection.ofPolygons([polygon], inputs.fillRule);
    }

    /**
     * Builds a cross-section from several polygons given as points, for instance an outline and its
     * holes; only the X and Y of each point are used.
     *
     * `fillRule` decides which regions count as inside where polygons overlap; `removeDuplicates`
     * drops consecutive repeated points within `tolerance` first.
     * @param inputs - The polygons as point lists, the fill rule and the duplicate handling
     * @returns The cross-section
     * @group create
     * @shortname cross section from polygons
     * @drawable true
     * @example
     * ```typescript
     * const plate = await bitbybit.manifold.crossSection.crossSectionFromPolygons({
     *     polygonPoints: [outerPoints, holePoints],
     *     fillRule: Bit.Inputs.Manifold.fillRuleEnum.evenOdd,
     *     removeDuplicates: false,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    crossSectionFromPolygons(inputs: Inputs.Manifold.CrossSectionFromPolygonsPointsDto): Manifold3D.CrossSection {
        let polygonPoints = inputs.polygonPoints;
        
        if (inputs.removeDuplicates) {
            polygonPoints = polygonPoints.map(polygon => 
                this.base.point.removeConsecutiveDuplicates({
                    points: polygon,
                    checkFirstAndLast: true,
                    tolerance: inputs.tolerance || 1e-7
                })
            );
        }
        
        const polygons: Manifold3D.SimplePolygon[] = polygonPoints.map(polygon => 
            polygon.map(p => [p[0], p[1]] as Manifold3D.Vec2)
        );
        return this.manifold.CrossSection.ofPolygons(polygons, inputs.fillRule);
    }

    /**
     * Reads a cross-section back as its polygons, each a list of 2D points.
     * @param inputs - The cross-section
     * @returns One list of 2D points per polygon
     * @group decompose
     * @shortname cross section to polygons
     * @drawable false
     * @example
     * ```typescript
     * const polygons = await bitbybit.manifold.crossSection.crossSectionToPolygons({ crossSection: outline });
     * ```
     */
    crossSectionToPolygons(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Manifold3D.SimplePolygon[] {
        return inputs.crossSection.toPolygons();
    }

    /**
     * Reads a cross-section back as its polygons with 3D points, Z set to 0, ready for drawing as
     * polylines.
     * @param inputs - The cross-section
     * @returns One list of points per polygon
     * @group decompose
     * @shortname cross section to points
     * @drawable false
     * @example
     * ```typescript
     * const polylines = await bitbybit.manifold.crossSection.crossSectionToPoints({ crossSection: outline });
     * ```
     */
    crossSectionToPoints(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Inputs.Base.Point3[][] {
        const polygons = inputs.crossSection.toPolygons();
        return polygons.map(polygon => polygon.map(point => [point[0], point[1], 0]));
    }

    /**
     * Reads several cross-sections back as their polygons, as `crossSectionToPolygons` does for
     * one.
     * @param inputs - The cross-sections
     * @returns One polygon list per cross-section, in the same order
     * @group decompose
     * @shortname cross sections to polygons
     * @drawable false
     * @example
     * ```typescript
     * const polygons = await bitbybit.manifold.crossSection.crossSectionsToPolygons({ crossSections: [outline, hole] });
     * ```
     */
    crossSectionsToPolygons(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): Manifold3D.SimplePolygon[][] {
        return inputs.crossSections.map((crossSection) => {
            return this.crossSectionToPolygons({
                crossSection
            });
        });
    }

    /**
     * Reads several cross-sections back as polygons with 3D points, as `crossSectionToPoints` does
     * for one.
     * @param inputs - The cross-sections
     * @returns One list of point polygons per cross-section, in the same order
     * @group decompose
     * @shortname cross sections to points
     * @drawable false
     * @example
     * ```typescript
     * const polylines = await bitbybit.manifold.crossSection.crossSectionsToPoints({ crossSections: [outline, hole] });
     * ```
     */
    crossSectionsToPoints(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): number[][][][] {
        return inputs.crossSections.map((crossSection) => {
            return this.crossSectionToPoints({
                crossSection
            });
        });
    }

    /**
     * Frees the memory a cross-section holds inside the kernel; the cross-section cannot be used
     * afterwards. The asynchronous API frees cross-sections through `deleteManifoldOrCrossSection`
     * on the service instead.
     * @param inputs - The cross-section to free
     */
    deleteCrossSection(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): void {
        inputs.crossSection.delete();
    }

    /**
     * Frees the memory several cross-sections hold inside the kernel; they cannot be used
     * afterwards. The asynchronous API frees cross-sections through
     * `deleteManifoldsOrCrossSections` on the service instead.
     * @param inputs - The cross-sections to free
     */
    deleteCrossSections(inputs: Inputs.Manifold.CrossSectionsDto<Manifold3D.CrossSection>): void {
        inputs.crossSections.forEach((crossSection) => {
            return this.deleteCrossSection({
                crossSection
            });
        });
    }
}
