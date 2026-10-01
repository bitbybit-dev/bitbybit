import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import * as Resolved from "../../api/resolved-inputs";

const named = <T extends Models.OCCT.SketchCommand>(command: T, id: string | undefined): T => id === undefined ? command : { ...command, id };

/**
 * Making the commands `sketch.pen` draws, one at a time: lines, circular arcs, Bezier curves,
 * closing the outline, and rounding or beveling a corner. Each method returns one command as plain
 * data, the same object a script can write by hand, so a list of them is what `sketch.pen` takes.
 */
export class OCCTSketchCommands {

    /**
     * Makes a command that draws a straight segment to a point.
     *
     * `to` is a point in the sketch's x and y, or an offset from where the pen is when `relative`
     * is true.
     * @param inputs - The point to draw to, whether it is relative and the command's id
     * @returns The command
     * @group lines
     * @shortname line
     * @drawable false
     * @example
     * ```typescript
     * const side = await bitbybit.occt.sketch.commands.line({ to: [0, 10], relative: true, id: "side" });
     * const outline = await bitbybit.occt.sketch.pen({ commands: [side, { type: "hLine", length: 20 }] });
     * ```
     */
    line(inputs: Inputs.OCCT.SketchLineDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchLineDto, inputs) as Resolved.OCCT.SketchLineDto;
        return named<Models.OCCT.SketchLineCommand>({ type: "line", to: resolved.to, relative: resolved.relative }, resolved.id);
    }

    /**
     * Makes a command that draws a straight segment along the sketch's x axis.
     *
     * A negative `length` draws in the negative x direction.
     * @param inputs - The length and the command's id
     * @returns The command
     * @group lines
     * @shortname h line
     * @drawable false
     * @example
     * ```typescript
     * const base = await bitbybit.occt.sketch.commands.hLine({ length: 40, id: "base" });
     * ```
     */
    hLine(inputs: Inputs.OCCT.SketchHLineDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchHLineDto, inputs) as Resolved.OCCT.SketchHLineDto;
        return named<Models.OCCT.SketchHLineCommand>({ type: "hLine", length: resolved.length }, resolved.id);
    }

    /**
     * Makes a command that draws a straight segment along the sketch's y axis.
     *
     * A negative `length` draws in the negative y direction.
     * @param inputs - The length and the command's id
     * @returns The command
     * @group lines
     * @shortname v line
     * @drawable false
     * @example
     * ```typescript
     * const side = await bitbybit.occt.sketch.commands.vLine({ length: 10, id: "side" });
     * ```
     */
    vLine(inputs: Inputs.OCCT.SketchVLineDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchVLineDto, inputs) as Resolved.OCCT.SketchVLineDto;
        return named<Models.OCCT.SketchVLineCommand>({ type: "vLine", length: resolved.length }, resolved.id);
    }

    /**
     * Makes a command that draws a straight segment of a given length at an angle.
     *
     * `angle` is in degrees from the sketch's x axis, counterclockwise; a negative `length` draws
     * the opposite way.
     * @param inputs - The length, the angle in degrees and the command's id
     * @returns The command
     * @group lines
     * @shortname polar line
     * @drawable false
     * @example
     * ```typescript
     * const slope = await bitbybit.occt.sketch.commands.polarLine({ length: 12, angle: 30 });
     * ```
     */
    polarLine(inputs: Inputs.OCCT.SketchPolarLineDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchPolarLineDto, inputs) as Resolved.OCCT.SketchPolarLineDto;
        return named<Models.OCCT.SketchPolarLineCommand>({ type: "polarLine", length: resolved.length, angle: resolved.angle }, resolved.id);
    }

    /**
     * Makes a command that draws straight on in the direction the previous segment ended in.
     *
     * It needs a segment before it, and is how a straight run leaves an arc smoothly.
     * @param inputs - The length and the command's id
     * @returns The command
     * @group lines
     * @shortname tangent line
     * @drawable false
     * @example
     * ```typescript
     * const runOut = await bitbybit.occt.sketch.commands.tangentLine({ length: 15 });
     * ```
     */
    tangentLine(inputs: Inputs.OCCT.SketchTangentLineDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchTangentLineDto, inputs) as Resolved.OCCT.SketchTangentLineDto;
        return named<Models.OCCT.SketchTangentLineCommand>({ type: "tangentLine", length: resolved.length }, resolved.id);
    }

    /**
     * Makes a command that draws a circular arc through one point to another.
     *
     * The arc turns whichever way takes it from where the pen is through `through` to `to`; the
     * three points must not lie on one line.
     * @param inputs - The point to pass through, the point to end at, whether they are relative and the command's id
     * @returns The command
     * @group arcs
     * @shortname three point arc
     * @drawable false
     * @example
     * ```typescript
     * const crown = await bitbybit.occt.sketch.commands.threePointArc({ through: [10, 4], to: [20, 0] });
     * ```
     */
    threePointArc(inputs: Inputs.OCCT.SketchThreePointArcDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchThreePointArcDto, inputs) as Resolved.OCCT.SketchThreePointArcDto;
        return named<Models.OCCT.SketchThreePointArcCommand>({ type: "threePointArc", through: resolved.through, to: resolved.to, relative: resolved.relative }, resolved.id);
    }

    /**
     * Makes a command that draws a circular arc to a point, leaving in the direction the previous
     * segment ended in.
     *
     * It needs a segment before it. The arc's radius follows from where it ends; an end straight
     * ahead is refused, as `tangentLine` draws that.
     * @param inputs - The point to end at, whether it is relative and the command's id
     * @returns The command
     * @group arcs
     * @shortname tangent arc
     * @drawable false
     * @example
     * ```typescript
     * const bend = await bitbybit.occt.sketch.commands.tangentArc({ to: [10, 10], relative: true });
     * ```
     */
    tangentArc(inputs: Inputs.OCCT.SketchTangentArcDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchTangentArcDto, inputs) as Resolved.OCCT.SketchTangentArcDto;
        return named<Models.OCCT.SketchTangentArcCommand>({ type: "tangentArc", to: resolved.to, relative: resolved.relative }, resolved.id);
    }

    /**
     * Makes a command that draws a circular arc to a point, bowed out by a given distance.
     *
     * `sagitta` is how far the middle of the arc stands off the straight line to `to`: positive to
     * the left of the direction of travel, negative to the right.
     * @param inputs - The point to end at, the sagitta, whether the point is relative and the command's id
     * @returns The command
     * @group arcs
     * @shortname sagitta arc
     * @drawable false
     * @example
     * ```typescript
     * const bow = await bitbybit.occt.sketch.commands.sagittaArc({ to: [20, 0], sagitta: 3 });
     * ```
     */
    sagittaArc(inputs: Inputs.OCCT.SketchSagittaArcDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchSagittaArcDto, inputs) as Resolved.OCCT.SketchSagittaArcDto;
        return named<Models.OCCT.SketchSagittaArcCommand>({ type: "sagittaArc", to: resolved.to, sagitta: resolved.sagitta, relative: resolved.relative }, resolved.id);
    }

    /**
     * Makes a command that draws a circular arc to a point, given by its bulge as DXF files write
     * arcs.
     *
     * `bulge` is the tangent of a quarter of the angle swept: positive turns counterclockwise, 1
     * draws a half circle and 0 is refused, being a straight line.
     * @param inputs - The point to end at, the bulge, whether the point is relative and the command's id
     * @returns The command
     * @group arcs
     * @shortname bulge arc
     * @drawable false
     * @example
     * ```typescript
     * const half = await bitbybit.occt.sketch.commands.bulgeArc({ to: [-20, 0], bulge: 1, relative: true });
     * ```
     */
    bulgeArc(inputs: Inputs.OCCT.SketchBulgeArcDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchBulgeArcDto, inputs) as Resolved.OCCT.SketchBulgeArcDto;
        return named<Models.OCCT.SketchBulgeArcCommand>({ type: "bulgeArc", to: resolved.to, bulge: resolved.bulge, relative: resolved.relative }, resolved.id);
    }

    /**
     * Makes a command that draws a quadratic Bezier curve to a point, pulled toward a control point.
     *
     * With `relative` true, `control` and `to` are offsets from where the pen is.
     * @param inputs - The control point, the point to end at, whether they are relative and the command's id
     * @returns The command
     * @group curves
     * @shortname quadratic
     * @drawable false
     * @example
     * ```typescript
     * const sweep = await bitbybit.occt.sketch.commands.quadratic({ control: [10, 8], to: [20, 0] });
     * ```
     */
    quadratic(inputs: Inputs.OCCT.SketchQuadraticDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchQuadraticDto, inputs) as Resolved.OCCT.SketchQuadraticDto;
        return named<Models.OCCT.SketchQuadraticCommand>({ type: "quadratic", control: resolved.control, to: resolved.to, relative: resolved.relative }, resolved.id);
    }

    /**
     * Makes a command that draws a cubic Bezier curve to a point, shaped by two control points.
     *
     * The curve leaves toward `control1` and arrives from `control2`; with `relative` true all three
     * points are offsets from where the pen is.
     * @param inputs - The two control points, the point to end at, whether they are relative and the command's id
     * @returns The command
     * @group curves
     * @shortname cubic
     * @drawable false
     * @example
     * ```typescript
     * const wave = await bitbybit.occt.sketch.commands.cubic({ control1: [5, 10], control2: [15, -10], to: [20, 0] });
     * ```
     */
    cubic(inputs: Inputs.OCCT.SketchCubicDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchCubicDto, inputs) as Resolved.OCCT.SketchCubicDto;
        return named<Models.OCCT.SketchCubicCommand>({ type: "cubic", control1: resolved.control1, control2: resolved.control2, to: resolved.to, relative: resolved.relative }, resolved.id);
    }

    /**
     * Makes a command that closes the outline with a straight segment back to the start point.
     *
     * Only corner commands may follow it. When the pen is already at the start point it draws
     * nothing and only closes the outline.
     * @param inputs - The command's id
     * @returns The command
     * @group outline
     * @shortname close
     * @drawable false
     * @example
     * ```typescript
     * const close = await bitbybit.occt.sketch.commands.close({ id: "back" });
     * ```
     */
    close(inputs: Inputs.OCCT.SketchCloseDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchCloseDto, inputs);
        return named<Models.OCCT.SketchCloseCommand>({ type: "close" }, resolved.id);
    }

    /**
     * Makes a command that rounds the corner between the segment before it and the segment after
     * it with an arc of a given radius.
     *
     * Placed after `close`, it rounds the corner at the start point. Only lines and circular arcs
     * take a corner, and a radius too large for them is refused.
     * @param inputs - The radius and the command's id
     * @returns The command
     * @group corners
     * @shortname fillet corner
     * @drawable false
     * @example
     * ```typescript
     * const round = await bitbybit.occt.sketch.commands.filletCorner({ radius: 2 });
     * ```
     */
    filletCorner(inputs: Inputs.OCCT.SketchFilletCornerDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchFilletCornerDto, inputs) as Resolved.OCCT.SketchFilletCornerDto;
        return named<Models.OCCT.SketchFilletCornerCommand>({ type: "filletCorner", radius: resolved.radius }, resolved.id);
    }

    /**
     * Makes a command that bevels the corner between the segment before it and the segment after it,
     * cutting the same distance off each.
     *
     * `distance` is measured along each segment. Placed after `close`, it bevels the corner at the
     * start point; only lines and circular arcs take a corner.
     * @param inputs - The distance and the command's id
     * @returns The command
     * @group corners
     * @shortname chamfer corner
     * @drawable false
     * @example
     * ```typescript
     * const bevel = await bitbybit.occt.sketch.commands.chamferCorner({ distance: 1.5 });
     * ```
     */
    chamferCorner(inputs: Inputs.OCCT.SketchChamferCornerDto): Models.OCCT.SketchCommand {
        const resolved = resolveDto(Inputs.OCCT.SketchChamferCornerDto, inputs) as Resolved.OCCT.SketchChamferCornerDto;
        return named<Models.OCCT.SketchChamferCornerCommand>({ type: "chamferCorner", distance: resolved.distance }, resolved.id);
    }
}
