import { GeometryHelper } from "@bitbybit-dev/base";
import * as Inputs from "../inputs/jscad-inputs";
import { MathBitByBit } from "@bitbybit-dev/base";
import * as JSCAD from "@jscad/modeling";
import { asKind, asRegion, oneOrMany } from "./entity-narrowing";

/**
 * Turning flat JSCAD shapes into solids: straight extrusion along Z with an optional twist, a wall
 * built along an outline, and revolution around the Z axis. Every flat shape lies in the XY plane,
 * so the result grows out of that plane along Z.
 */
export class JSCADExtrusions {

    constructor(
        private readonly jscad: typeof JSCAD,
        private readonly geometryHelper: GeometryHelper,
        private readonly math: MathBitByBit
    ) { }

    /**
     * Extrudes a flat 2D shape straight along Z by `height` into a solid, twisting it on the way
     * when `twistAngle` is not zero.
     *
     * `twistAngle` in degrees turns the top relative to the bottom around Z and `twistSteps` is the
     * number of slices used for it, at least 1. A negative `height` extrudes downward.
     * @param inputs - The 2D shape, the height, the twist angle and the twist steps
     * @returns The extruded solid
     * @group extrude
     * @shortname linear
     * @drawable true
     * @example
     * ```typescript
     * const square = await bitbybit.jscad.polygon.square({ center: [0, 0], size: 10 });
     * const twisted = await bitbybit.jscad.extrusions.extrudeLinear({ geometry: square, height: 20, twistAngle: 90, twistSteps: 15 });
     * ```
     */
    extrudeLinear(inputs: Inputs.JSCAD.ExtrudeLinearDto): Inputs.JSCAD.JSCADEntity {
        const geometry = asKind<Inputs.JSCAD.JSCADGeom2>(oneOrMany(inputs.geometry));

        const extrusions = this.jscad.extrusions.extrudeLinear({
            height: inputs.height,
            twistAngle: this.math.degToRad({ number: inputs.twistAngle }),
            twistSteps: inputs.twistSteps
        }, ...geometry);

        return extrusions;
    }

    /**
     * Builds a wall along the outline of a 2D shape or path: the outline is thickened by `size` on
     * each side and raised by `height` along Z.
     *
     * The wall stands on the XY plane and is twice `size` thick, centered on the outline; the
     * inside of a 2D shape stays empty. A list of inputs gives a list of walls.
     * @param inputs - The 2D shape or path, the height and the half thickness
     * @returns The wall as a solid
     * @group extrude
     * @shortname rectangular
     * @drawable true
     * @example
     * ```typescript
     * const circle = await bitbybit.jscad.polygon.circle({ center: [0, 0], radius: 10, segments: 32 });
     * const ring = await bitbybit.jscad.extrusions.extrudeRectangular({ geometry: circle, height: 5, size: 0.5 });
     * ```
     */
    extrudeRectangular(inputs: Inputs.JSCAD.ExtrudeRectangularDto): Inputs.JSCAD.JSCADEntity {
        const geometry = asKind<Inputs.JSCAD.JSCADGeom2>(oneOrMany(inputs.geometry));

        const extrusions = this.jscad.extrusions.extrudeRectangular({ height: inputs.height, size: inputs.size }, ...geometry);
       
        return extrusions;
    }

    /**
     * Builds a wall along a polyline of points, as `extrudeRectangular` does for a path: the line
     * is thickened by `size` on each side and raised by `height` along Z.
     *
     * Only the X and Y coordinates of the points are used and repeated consecutive points are
     * dropped.
     * @param inputs - The points, the height and the half thickness
     * @returns The wall as a solid
     * @group extrude
     * @shortname rectangular points
     * @drawable true
     * @example
     * ```typescript
     * const wall = await bitbybit.jscad.extrusions.extrudeRectangularPoints({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]], height: 5, size: 0.5 });
     * ```
     */
    extrudeRectangularPoints(inputs: Inputs.JSCAD.ExtrudeRectangularPointsDto): Inputs.JSCAD.JSCADEntity {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveVectorDuplicates(twoDimensionalPoints);
        const path = this.jscad.geometries.path2.fromPoints({}, duplicatePointsRemoved as JSCAD.maths.vec2.Vec2[]);
        const extrusion = this.extrudeRectangular({ height: inputs.height, size: inputs.size, geometry: path });
        return extrusion;
    }

    /**
     * Revolves a flat 2D shape around the Z axis into a solid.
     *
     * The shape lies in the XY plane, so its X coordinate is its distance from the axis, and a
     * shape crossing the axis is clipped there. `angle` and `startAngle` are in degrees, 360 makes
     * a full ring, and `segments` counts the steps of a full turn.
     * @param inputs - The 2D shape, the sweep angle, the start angle and the segment count
     * @returns The revolved solid
     * @group extrude
     * @shortname rotational
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.jscad.polygon.circle({ center: [10, 0], radius: 3, segments: 24 });
     * const ring = await bitbybit.jscad.extrusions.extrudeRotate({ polygon: profile, angle: 360, startAngle: 0, segments: 48 });
     * ```
     */
    extrudeRotate(inputs: Inputs.JSCAD.ExtrudeRotateDto): Inputs.JSCAD.JSCADEntity {
        const options = {
            angle: this.math.degToRad({ number: inputs.angle }),
            startAngle: this.math.degToRad({ number: inputs.startAngle }),
            overflow: "cap",
            segments: inputs.segments
        };
        const extrusion = this.jscad.extrusions.extrudeRotate(options as any, asRegion(inputs.polygon, "extrudeRotate"));
        return extrusion;
    }

}
