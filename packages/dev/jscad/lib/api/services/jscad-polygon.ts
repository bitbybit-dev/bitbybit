import { GeometryHelper, resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";
import { MathBitByBit } from "@bitbybit-dev/base";
import * as JSCAD from "@jscad/modeling";
import { asPath } from "./entity-narrowing";
import * as Resolved from "../resolved-inputs";

/**
 * Building flat JSCAD shapes, the filled 2D regions that booleans combine and extrusions turn into
 * solids. They lie in the XY plane: a shape made from points or a curve keeps only the X and Y
 * coordinates, and the circle, ellipse, rectangle, square and star primitives take a 2D center.
 * List outline points counter-clockwise.
 */
export class JSCADPolygon {

    constructor(
        private readonly jscad: typeof JSCAD,
        private readonly geometryHelper: GeometryHelper,
        private readonly math: MathBitByBit

    ) { }

    /**
     * Builds a filled 2D shape from the outline points, taken in order and closed back to the
     * first.
     *
     * The points may be 2D or 3D; only X and Y are used. Repeated consecutive points are removed
     * and at least three distinct points are needed. Counter-clockwise order gives a normal shape,
     * clockwise gives a negative one.
     * @param inputs - The outline points
     * @returns The 2D shape
     * @group from
     * @shortname polygon from points
     * @drawable true
     * @example
     * ```typescript
     * const triangle = await bitbybit.jscad.polygon.createFromPoints({ points: [[0, 0, 0], [10, 0, 0], [5, 8, 0]] });
     * ```
     */
    createFromPoints(inputs: Inputs.JSCAD.PointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]) as Inputs.Base.Point2[];
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    /**
     * Builds a filled 2D shape from the points of a polyline, closed back to the first point
     * whatever the polyline says.
     *
     * Only X and Y are used, Z is dropped; repeated consecutive points are removed and at least
     * three distinct points are needed.
     * @param inputs - The polyline
     * @returns The 2D shape
     * @group from
     * @shortname polyline
     * @drawable true
     * @example
     * ```typescript
     * const shape = await bitbybit.jscad.polygon.createFromPolyline({ polyline: { points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]], isClosed: true } });
     * ```
     */
    createFromPolyline(inputs: Inputs.JSCAD.PolylineDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]) as Inputs.Base.Point2[];
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    /**
     * Builds a filled 2D shape from a NURBS curve by sampling it into points and closing the
     * outline.
     *
     * Only X and Y of the sampled points are used, Z is dropped.
     * @param inputs - The NURBS curve
     * @returns The 2D shape
     * @group from
     * @shortname curve
     * @drawable true
     * @deprecated This takes a verb-nurbs curve, and verb is deprecated for removal in the next major,
so this goes with it. It is also the one method here that converts between two different CAD
kernels, which belongs above a kernel-specific package rather than inside one. Build the polygon
from points or from a polyline instead.
     * @example
     * ```typescript
     * const shape = await bitbybit.jscad.polygon.createFromCurve({ curve });
     * ```
     */
    createFromCurve(inputs: Inputs.JSCAD.CurveDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.curve.tessellate().map((pt: Inputs.Base.Point3) => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints);
    }

    /**
     * Builds a filled 2D shape from the points of a 2D path, closed back to the first point.
     *
     * Repeated consecutive points are removed and at least three distinct points are needed; a 2D
     * shape or a solid throws an error.
     * @param inputs - The 2D path
     * @returns The 2D shape
     * @group from
     * @shortname path
     * @drawable true
     * @example
     * ```typescript
     * const path = await bitbybit.jscad.path.createFromPoints({ points: [[0, 0], [10, 0], [10, 10]], closed: true });
     * const shape = await bitbybit.jscad.polygon.createFromPath({ path });
     * ```
     */
    createFromPath(inputs: Inputs.JSCAD.PathDto): Inputs.JSCAD.JSCADEntity {
        return this.removeDuplicatesAndCreateFromPoints(asPath(inputs.path, "createFromPath").points);
    }

    /**
     * Builds a filled circle of the given `radius` around a 2D `center`; `segments` is the number
     * of straight sides that approximate it.
     * @param inputs - The center, the radius and the segment count
     * @returns The circle as a 2D shape
     * @group primitives
     * @shortname circle
     * @drawable true
     * @example
     * ```typescript
     * const disc = await bitbybit.jscad.polygon.circle({ center: [0, 0], radius: 5, segments: 32 });
     * ```
     */
    circle(inputs: Inputs.JSCAD.CircleDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.CircleDto, inputs) as Resolved.JSCAD.CircleDto;
        return this.jscad.primitives.circle({ center: resolved.center, radius: resolved.radius, segments: resolved.segments });
    }

    /**
     * Builds a filled ellipse around a 2D `center`, with `radius` holding the X and Y half-sizes;
     * `segments` is the number of straight sides that approximate it.
     * @param inputs - The center, the two radii and the segment count
     * @returns The ellipse as a 2D shape
     * @group primitives
     * @shortname ellipse
     * @drawable true
     * @example
     * ```typescript
     * const oval = await bitbybit.jscad.polygon.ellipse({ center: [0, 0], radius: [10, 5], segments: 48 });
     * ```
     */
    ellipse(inputs: Inputs.JSCAD.EllipseDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.EllipseDto, inputs) as Resolved.JSCAD.EllipseDto;
        return this.jscad.primitives.ellipse(
            {
                center: resolved.center,
                radius: [resolved.radius[0], resolved.radius[1]],
                segments: resolved.segments
            }
        );
    }

    /**
     * Builds a filled rectangle around a 2D `center`, with `width` along X and `length` along Y.
     * @param inputs - The center, the width and the length
     * @returns The rectangle as a 2D shape
     * @group primitives
     * @shortname rectangle
     * @drawable true
     * @example
     * ```typescript
     * const plate = await bitbybit.jscad.polygon.rectangle({ center: [0, 0], width: 20, length: 10 });
     * ```
     */
    rectangle(inputs: Inputs.JSCAD.RectangleDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.RectangleDto, inputs) as Resolved.JSCAD.RectangleDto;
        return this.jscad.primitives.rectangle(
            {
                center: [resolved.center[0], resolved.center[1]],
                size: [resolved.width, resolved.length]
            }
        );
    }

    /**
     * Builds a filled rectangle with its four corners rounded by `roundRadius`, around a 2D
     * `center` with `width` along X and `length` along Y.
     *
     * `roundRadius` must be less than half of the smaller side or an error is thrown; `segments`
     * sets how smoothly each corner is faceted.
     * @param inputs - The center, the rounding radius, the segment count, the width and the length
     * @returns The rounded rectangle as a 2D shape
     * @group primitives
     * @shortname rounded rectangle
     * @drawable true
     * @example
     * ```typescript
     * const plate = await bitbybit.jscad.polygon.roundedRectangle({ center: [0, 0], roundRadius: 2, segments: 16, width: 20, length: 10 });
     * ```
     */
    roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.RoundedRectangleDto, inputs) as Resolved.JSCAD.RoundedRectangleDto;
        return this.jscad.primitives.roundedRectangle({
            center: [resolved.center[0], resolved.center[1]],
            size: [resolved.width, resolved.length],
            roundRadius: resolved.roundRadius,
            segments: resolved.segments,
        });
    }

    /**
     * Builds a filled square of side `size` around a 2D `center`, with its sides parallel to the
     * axes.
     * @param inputs - The center and the side length
     * @returns The square as a 2D shape
     * @group primitives
     * @shortname square
     * @drawable true
     * @example
     * ```typescript
     * const tile = await bitbybit.jscad.polygon.square({ center: [0, 0], size: 10 });
     * ```
     */
    square(inputs: Inputs.JSCAD.SquareDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.SquareDto, inputs) as Resolved.JSCAD.SquareDto;
        return this.jscad.primitives.square({ center: [resolved.center[0], resolved.center[1]], size: resolved.size });
    }

    /**
     * Builds a filled star with `vertices` tips around a 2D `center`, the tips at `outerRadius` and
     * the notches between them at `innerRadius`.
     *
     * `startAngle` in degrees turns the first tip away from the X axis. `density` matters only when
     * `innerRadius` is 0: the notch radius is then derived from it, as in a pentagram with density
     * 2.
     * @param inputs - The center, the number of tips, the density, the two radii and the start angle
     * @returns The star as a 2D shape
     * @group primitives
     * @shortname star
     * @drawable true
     * @example
     * ```typescript
     * const star = await bitbybit.jscad.polygon.star({ center: [0, 0], vertices: 5, density: 2, outerRadius: 10, innerRadius: 4, startAngle: 90 });
     * ```
     */
    star(inputs: Inputs.JSCAD.StarDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.StarDto, inputs) as Resolved.JSCAD.StarDto;
        return this.jscad.primitives.star({
            center: [resolved.center[0], resolved.center[1]],
            vertices: resolved.vertices,
            density: resolved.density,
            outerRadius: resolved.outerRadius,
            innerRadius: resolved.innerRadius,
            startAngle: this.math.degToRad({ number: resolved.startAngle }),
        });
    }

    private removeDuplicatesAndCreateFromPoints(twoDimensionalPoints: Inputs.Base.Point2[]): Inputs.JSCAD.JSCADEntity {
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveVectorDuplicates(twoDimensionalPoints);
        const polygon = this.jscad.primitives.polygon({ points: duplicatePointsRemoved as JSCAD.maths.vec2.Vec2[] });
        return polygon;
    }

}
