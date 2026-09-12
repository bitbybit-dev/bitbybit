// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { dimensionEndTypeEnum, directionEnum } from "./enums";
import { LPolygonDto } from "./profiles-and-primitive-solids";
import { ChristmasTreeDto, Heart2DDto, NGonWireDto, ParallelogramDto, StarDto } from "./faces-2d-curves-and-decorative-wires";

/**
 * Two points and the drawing settings for `dimensions.simpleLinearLengthDimension`: where the
 * dimension line sits, how the extension lines, arrows and label look, and how the distance is
 * written.
 */
export class SimpleLinearLengthDimensionDto {
    constructor(start?: Base.Point3, end?: Base.Point3, direction?: Base.Vector3, offsetFromPoints?: number, crossingSize?: number, labelSuffix?: string, labelSize?: number, labelOffset?: number, labelRotation?: number, arrowType?: dimensionEndTypeEnum, arrowSize?: number, arrowAngle?: number, arrowsFlipped?: boolean, labelFlipHorizontal?: boolean, labelFlipVertical?: boolean, labelOverwrite?: string, removeTrailingZeros?: boolean) {
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (direction !== undefined) { this.direction = direction; }
        if (offsetFromPoints !== undefined) { this.offsetFromPoints = offsetFromPoints; }
        if (crossingSize !== undefined) { this.crossingSize = crossingSize; }
        if (labelSuffix !== undefined) { this.labelSuffix = labelSuffix; }
        if (labelSize !== undefined) { this.labelSize = labelSize; }
        if (labelOffset !== undefined) { this.labelOffset = labelOffset; }
        if (labelRotation !== undefined) { this.labelRotation = labelRotation; }
        if (arrowType !== undefined) { this.endType = arrowType; }
        if (arrowSize !== undefined) { this.arrowSize = arrowSize; }
        if (arrowAngle !== undefined) { this.arrowAngle = arrowAngle; }
        if (arrowsFlipped !== undefined) { this.arrowsFlipped = arrowsFlipped; }
        if (labelFlipHorizontal !== undefined) { this.labelFlipHorizontal = labelFlipHorizontal; }
        if (labelFlipVertical !== undefined) { this.labelFlipVertical = labelFlipVertical; }
        if (labelOverwrite !== undefined) { this.labelOverwrite = labelOverwrite; }
        if (removeTrailingZeros !== undefined) { this.removeTrailingZeros = removeTrailingZeros; }
    }
    /**
     * The first of the two points whose distance is measured.
     * @default undefined
     */
    start!: Base.Point3;
    /**
     * The second of the two points whose distance is measured.
     * @default undefined
     */
    end!: Base.Point3;
    /**
     * The vector from the measured points to the dimension line; its length is the offset, in model
     * units, and it must not run along the measured line.
     * @default undefined
     */
    direction!: Base.Vector3;
    /**
     * The gap between each measured point and the start of its extension line, in model units, so
     * the dimension does not touch the geometry.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offsetFromPoints?: number | undefined = 0;
    /**
     * How far the lines stick out past their crossings, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    crossingSize?: number | undefined = 0.2;
    /**
     * How many decimals the distance is rounded to in the label.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    decimalPlaces?: number | undefined = 2;
    /**
     * Text written after the number, such as a unit; the model has no unit of its own.
     * @default (cm)
     */
    labelSuffix?: string | undefined = "(cm)";
    /**
     * The height of the label's capital letters, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    labelSize?: number | undefined = 0.1;
    /**
     * How far the label sits from the dimension line, in model units.
     * @default 0.3
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    labelOffset?: number | undefined = 0.3;
    /**
     * Extra rotation of the label in its plane, in degrees.
     * @default 0
     * @minimum -360
     * @maximum 360
     * @step 1
     */
    labelRotation?: number | undefined = 0;
    /**
     * What the dimension line ends with: nothing, or an arrowhead.
     * @default none
     */
    endType?: dimensionEndTypeEnum | undefined = dimensionEndTypeEnum.none;
    /**
     * The length of the arrowheads, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    arrowSize?: number | undefined = 0.3;
    /**
     * The full angle between the two lines of an arrowhead, in degrees, up to 90.
     * @default 30
     * @minimum 0
     * @maximum 90
     * @step 1
     */
    arrowAngle?: number | undefined = 30;
    /**
     * When true, the arrowheads point outward from the dimension instead of inward.
     * @default false
     */
    arrowsFlipped?: boolean | undefined = false;
    /**
     * When true, the label is mirrored left to right.
     * @default false
     */
    labelFlipHorizontal?: boolean | undefined = false;
    /**
     * When true, the label is mirrored top to bottom.
     * @default false
     */
    labelFlipVertical?: boolean | undefined = false;
    /**
     * An expression written instead of the plain number, with `val` standing for the distance, such
     * as `100*val` or `Length: val mm`.
     * @default 1*val
     * @optional true
     */
    labelOverwrite?: string | undefined = "1*val";
    /**
     * When true, zeros at the end of the decimals are dropped, so 2.50 becomes 2.5.
     * @default false
     */
    removeTrailingZeros?: boolean | undefined = false;
}
/**
 * A center, two directions and the drawing settings for `dimensions.simpleAngularDimension`: the
 * arc, the extension lines, the arrows and the label with the angle.
 */
export class SimpleAngularDimensionDto {
    constructor(direction1?: Base.Point3, direction2?: Base.Point3, center?: Base.Point3, radius?: number, offsetFromCenter?: number, crossingSize?: number, radians?: boolean, labelSuffix?: string, labelSize?: number, labelOffset?: number, endType?: dimensionEndTypeEnum, arrowSize?: number, arrowAngle?: number, arrowsFlipped?: boolean, labelRotation?: number, labelFlipHorizontal?: boolean, labelFlipVertical?: boolean, labelOverwrite?: string, removeTrailingZeros?: boolean) {
        if (direction1 !== undefined) { this.direction1 = direction1; }
        if (direction2 !== undefined) { this.direction2 = direction2; }
        if (center !== undefined) { this.center = center; }
        if (radius !== undefined) { this.radius = radius; }
        if (offsetFromCenter !== undefined) { this.offsetFromCenter = offsetFromCenter; }
        if (crossingSize !== undefined) { this.extraSize = crossingSize; }
        if (radians !== undefined) { this.radians = radians; }
        if (labelSuffix !== undefined) { this.labelSuffix = labelSuffix; }
        if (labelSize !== undefined) { this.labelSize = labelSize; }
        if (labelOffset !== undefined) { this.labelOffset = labelOffset; }
        if (endType !== undefined) { this.endType = endType; }
        if (arrowSize !== undefined) { this.arrowSize = arrowSize; }
        if (arrowAngle !== undefined) { this.arrowAngle = arrowAngle; }
        if (arrowsFlipped !== undefined) { this.arrowsFlipped = arrowsFlipped; }
        if (labelRotation !== undefined) { this.labelRotation = labelRotation; }
        if (labelFlipHorizontal !== undefined) { this.labelFlipHorizontal = labelFlipHorizontal; }
        if (labelFlipVertical !== undefined) { this.labelFlipVertical = labelFlipVertical; }
        if (labelOverwrite !== undefined) { this.labelOverwrite = labelOverwrite; }
        if (removeTrailingZeros !== undefined) { this.removeTrailingZeros = removeTrailingZeros; }
    }

    /**
     * The direction of the first leg of the angle, from the center.
     * @default [1, 0, 0]
     */
    direction1: Base.Point3 = [1, 0, 0];
    /**
     * The direction of the second leg of the angle, from the center.
     * @default [0, 0, 1]
     */
    direction2: Base.Point3 = [0, 0, 1];
    /**
     * The point the angle is measured at.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The distance from the center to the dimension arc, in model units.
     * @default 4
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 4;
    /**
     * The gap between the center and the start of each extension line, in model units.
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offsetFromCenter = 0.5;
    /**
     * How far the extension lines stick out past the arc, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extraSize = 0;
    /**
     * How many decimals the angle is rounded to in the label.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    decimalPlaces = 2;
    /**
     * Text written after the number, such as the unit.
     * @default (deg)
     */
    labelSuffix = "(deg)";
    /**
     * The height of the label's capital letters, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    labelSize = 0.1;
    /**
     * How far the label sits from the arc, in model units.
     * @default 0.3
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    labelOffset = 0.3;
    /**
     * When true, the angle is written in radians instead of degrees.
     * @default false
     */
    radians = false;
    /**
     * What the arc ends with: nothing, or an arrowhead.
     * @default none
     */
    endType?: dimensionEndTypeEnum | undefined = dimensionEndTypeEnum.none;
    /**
     * The length of the arrowheads, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    arrowSize?: number | undefined = 0.3;
    /**
     * The full angle between the two lines of an arrowhead, in degrees, up to 90.
     * @default 30
     * @minimum 0
     * @maximum 90
     * @step 1
     */
    arrowAngle?: number | undefined = 30;
    /**
     * When true, the arrowheads point outward from the dimension instead of inward.
     * @default false
     */
    arrowsFlipped?: boolean | undefined = false;
    /**
     * Extra rotation of the label in its plane, in degrees.
     * @default 0
     * @minimum -360
     * @maximum 360
     * @step 1
     */
    labelRotation?: number | undefined = 0;
    /**
     * When true, the label is mirrored left to right.
     * @default false
     */
    labelFlipHorizontal?: boolean | undefined = false;
    /**
     * When true, the label is mirrored top to bottom.
     * @default false
     */
    labelFlipVertical?: boolean | undefined = false;
    /**
     * An expression written instead of the plain number, with `val` standing for the angle, such as
     * `100*val` or `Angle: val deg`.
     * @default 1*val
     * @optional true
     */
    labelOverwrite?: string | undefined = "1*val";
    /**
     * When true, zeros at the end of the decimals are dropped, so 45.00 becomes 45.
     * @default false
     */
    removeTrailingZeros?: boolean | undefined = false;
}
/**
 * Two points, a label and the drawing settings for `dimensions.pinWithLabel`, a line pointing at a
 * spot on a model with text at its end.
 */
export class PinWithLabelDto {
    constructor(startPoint?: Base.Point3, endPoint?: Base.Point3, direction?: Base.Vector3, offsetFromStart?: number, label?: string, labelOffset?: number, labelSize?: number, endType?: dimensionEndTypeEnum, arrowSize?: number, arrowAngle?: number, arrowsFlipped?: boolean, labelRotation?: number, labelFlipHorizontal?: boolean, labelFlipVertical?: boolean) {
        if (startPoint !== undefined) { this.startPoint = startPoint; }
        if (endPoint !== undefined) { this.endPoint = endPoint; }
        if (direction !== undefined) { this.direction = direction; }
        if (offsetFromStart !== undefined) { this.offsetFromStart = offsetFromStart; }
        if (label !== undefined) { this.label = label; }
        if (labelOffset !== undefined) { this.labelOffset = labelOffset; }
        if (labelSize !== undefined) { this.labelSize = labelSize; }
        if (endType !== undefined) { this.endType = endType; }
        if (arrowSize !== undefined) { this.arrowSize = arrowSize; }
        if (arrowAngle !== undefined) { this.arrowAngle = arrowAngle; }
        if (arrowsFlipped !== undefined) { this.arrowsFlipped = arrowsFlipped; }
        if (labelRotation !== undefined) { this.labelRotation = labelRotation; }
        if (labelFlipHorizontal !== undefined) { this.labelFlipHorizontal = labelFlipHorizontal; }
        if (labelFlipVertical !== undefined) { this.labelFlipVertical = labelFlipVertical; }
    }
    /**
     * The spot on the model the pin marks.
     * @default [0, 0, 0]
     */
    startPoint: Base.Point3 = [0, 0, 0];
    /**
     * The point the pin line ends at, where the label is written.
     * @default [0, 5, 2]
     */
    endPoint?: Base.Point3 | undefined = [0, 5, 2];
    /**
     * The normal of the plane the label is written in.
     * @default [0, 0, 1]
     */
    direction?: Base.Vector3 | undefined = [0, 0, 1];
    /**
     * The gap between the start point and the beginning of the line, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    offsetFromStart?: number | undefined = 0;
    /**
     * The text written at the end of the pin.
     * @default Pin
     */
    label?: string | undefined = "Pin";
    /**
     * The gap between the end of the line and the label, in model units.
     * @default 0.3
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    labelOffset?: number | undefined = 0.3;
    /**
     * The height of the label's capital letters, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    labelSize?: number | undefined = 0.1;
    /**
     * What the pin line ends with at the start point: nothing, or an arrowhead.
     * @default none
     */
    endType?: dimensionEndTypeEnum | undefined = dimensionEndTypeEnum.none;
    /**
     * The length of the arrowhead, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    arrowSize?: number | undefined = 0.3;
    /**
     * The full angle between the two lines of the arrowhead, in degrees, up to 90.
     * @default 30
     * @minimum 0
     * @maximum 90
     * @step 1
     */
    arrowAngle?: number | undefined = 30;
    /**
     * When true, the arrowhead points away from the start point instead of toward it.
     * @default false
     */
    arrowsFlipped?: boolean | undefined = false;
    /**
     * Extra rotation of the label in its plane, in degrees.
     * @default 0
     * @minimum -360
     * @maximum 360
     * @step 1
     */
    labelRotation?: number | undefined = 0;
    /**
     * When true, the label is mirrored left to right.
     * @default false
     */
    labelFlipHorizontal?: boolean | undefined = false;
    /**
     * When true, the label is mirrored top to bottom.
     * @default false
     */
    labelFlipVertical?: boolean | undefined = false;
}
/**
 * A star outline and the extrusion lengths for `shapes.solid.createStarSolid`; at least one length
 * must be above 0.
 */
export class StarSolidDto extends StarDto {
    constructor(outerRadius?: number, innerRadius?: number, numRays?: number, center?: Base.Point3, direction?: Base.Vector3, offsetOuterEdges?: number, half?: boolean, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(outerRadius, innerRadius, numRays, center, direction, offsetOuterEdges, half);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the star grows along its plane normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the star grows against its plane normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
/**
 * A regular polygon and the extrusion lengths for `shapes.solid.createNGonSolid`; at least one
 * length must be above 0.
 */
export class NGonSolidDto extends NGonWireDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, nrCorners?: number, radius?: number, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(center, direction, nrCorners, radius);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the polygon grows along its plane normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the polygon grows against its plane normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
/**
 * A parallelogram and the extrusion lengths for `shapes.solid.createParallelogramSolid`; at least
 * one length must be above 0.
 */
export class ParallelogramSolidDto extends ParallelogramDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, aroundCenter?: boolean, width?: number, height?: number, angle?: number, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(center, direction, aroundCenter, width, height, angle);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the parallelogram grows along its plane normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the parallelogram grows against its plane normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
/**
 * A heart outline and the extrusion lengths for `shapes.solid.createHeartSolid`; at least one
 * length must be above 0.
 */
export class HeartSolidDto extends Heart2DDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, rotation?: number, sizeApprox?: number, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(center, direction, rotation, sizeApprox);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the heart grows along its plane normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the heart grows against its plane normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
/**
 * A tree outline and the extrusion lengths for `shapes.solid.createChristmasTreeSolid`; at least
 * one length must be above 0.
 */
export class ChristmasTreeSolidDto extends ChristmasTreeDto {
    constructor(height?: number, innerDist?: number, outerDist?: number, nrSkirts?: number, trunkHeight?: number, trunkWidth?: number, half?: boolean, rotation?: number, origin?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(height, innerDist, outerDist, nrSkirts, trunkHeight, trunkWidth, half, rotation, origin, direction);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the tree grows along its plane normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the tree grows against its plane normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
/**
 * An L shape and the extrusion lengths for `shapes.solid.createLPolygonSolid`; at least one length
 * must be above 0.
 */
export class LPolygonSolidDto extends LPolygonDto {
    constructor(widthFirst?: number, lengthFirst?: number, widthSecond?: number, lengthSecond?: number, align?: directionEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(widthFirst, lengthFirst, widthSecond, lengthSecond, align, rotation, center, direction);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the L shape grows along its plane normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the L shape grows against its plane normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}

