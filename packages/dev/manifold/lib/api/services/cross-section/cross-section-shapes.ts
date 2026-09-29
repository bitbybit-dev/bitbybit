import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";
import { resolveDto } from "@bitbybit-dev/base";
import * as Resolved from "../../resolved-inputs";

/**
 * Building Manifold cross-sections, the flat outlines that become solids: squares, rectangles,
 * circles and outlines from raw polygons. They lie in the XY plane; `center` places a shape on the
 * origin, otherwise its corner sits there.
 */
export class CrossSectionShapes {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Builds a cross-section from polygons given as 2D points, fusing overlapping ones so the
     * result has no crossings.
     *
     * `fillRule` decides which regions count as inside where polygons overlap or a polygon crosses
     * itself.
     * @param inputs - The polygons as 2D point lists and the fill rule
     * @returns The cross-section
     * @group base
     * @shortname create
     * @drawable true
     * @example
     * ```typescript
     * const outline = await bitbybit.manifold.crossSection.shapes.create({ polygons: [[[0, 0], [10, 0], [10, 10], [0, 10]]], fillRule: Bit.Inputs.Manifold.fillRuleEnum.evenOdd });
     * ```
     */
    create(inputs: Inputs.Manifold.CreateContourSectionDto): Manifold3D.CrossSection {
        const resolved = resolveDto(Inputs.Manifold.CreateContourSectionDto, inputs) as Resolved.Manifold.CreateContourSectionDto;
        const { CrossSection } = this.manifold;
        return new CrossSection(resolved.polygons, resolved.fillRule);
    }

    /**
     * Creates a square cross-section of the given side; with `center` true it is centered on the
     * origin, otherwise its corner sits there.
     * @param inputs - The side length and whether to center it
     * @returns The square cross-section
     * @group primitives
     * @shortname square
     * @drawable true
     * @example
     * ```typescript
     * const square = await bitbybit.manifold.crossSection.shapes.square({ size: 10, center: true });
     * ```
     */
    square(inputs: Inputs.Manifold.SquareDto): Manifold3D.CrossSection {
        const resolved = resolveDto(Inputs.Manifold.SquareDto, inputs) as Resolved.Manifold.SquareDto;
        const { CrossSection } = this.manifold;
        return CrossSection.square(resolved.size, resolved.center);
    }

    /**
     * Creates a circular cross-section of the given radius, centered on the origin and drawn with
     * `circularSegments` straight sides.
     * @param inputs - The radius and the number of sides
     * @returns The circle cross-section
     * @group primitives
     * @shortname circle
     * @drawable true
     * @example
     * ```typescript
     * const disc = await bitbybit.manifold.crossSection.shapes.circle({ radius: 5, circularSegments: 64 });
     * ```
     */
    circle(inputs: Inputs.Manifold.CircleDto): Manifold3D.CrossSection {
        const resolved = resolveDto(Inputs.Manifold.CircleDto, inputs) as Resolved.Manifold.CircleDto;
        const { CrossSection } = this.manifold;
        return CrossSection.circle(resolved.radius, resolved.circularSegments);
    }

    /**
     * Creates a rectangular cross-section with `length` along X and `height` along Y; with `center`
     * true it is centered on the origin, otherwise its corner sits there.
     * @param inputs - The length, the height and whether to center it
     * @returns The rectangle cross-section
     * @group primitives
     * @shortname rectangle
     * @drawable true
     * @example
     * ```typescript
     * const rectangle = await bitbybit.manifold.crossSection.shapes.rectangle({ length: 20, height: 10, center: true });
     * ```
     */
    rectangle(inputs: Inputs.Manifold.RectangleDto): Manifold3D.CrossSection {
        const resolved = resolveDto(Inputs.Manifold.RectangleDto, inputs) as Resolved.Manifold.RectangleDto;
        const { CrossSection } = this.manifold;
        return CrossSection.square([resolved.length, resolved.height], resolved.center);
    }
}
