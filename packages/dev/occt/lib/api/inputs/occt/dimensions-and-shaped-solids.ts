// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { dimensionEndTypeEnum, directionEnum } from "./enums";
import { LPolygonDto } from "./profiles-and-primitive-solids";
import { ChristmasTreeDto, Heart2DDto, NGonWireDto, ParallelogramDto, StarDto } from "./faces-2d-curves-and-decorative-wires";

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
     * The start point for dimension
     * @default undefined
     */
    start!: Base.Point3;
    /**
     * The end point for dimension
     * @default undefined
     */
    end!: Base.Point3;
    /**
     * The dimension direction (must include length)
     * @default undefined
     */
    direction!: Base.Vector3;
    /**
     * The dimension label
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offsetFromPoints?: number | undefined = 0;
    /**
     * The dimension crossing size
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    crossingSize?: number | undefined = 0.2;
    /**
     * The dimension label decimal places
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    decimalPlaces?: number | undefined = 2;
    /**
     * The dimension label suffix
     * @default (cm)
     */
    labelSuffix?: string | undefined = "(cm)";
    /**
     * The dimension label size
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    labelSize?: number | undefined = 0.1;
    /**
     * The dimension label offset
     * @default 0.3
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    labelOffset?: number | undefined = 0.3;
    /**
     * The dimension label rotation
     * @default 0
     * @minimum -360
     * @maximum 360
     * @step 1
     */
    labelRotation?: number | undefined = 0;
    /**
     * End type for dimension
     * @default none
     */
    endType?: dimensionEndTypeEnum | undefined = dimensionEndTypeEnum.none;
    /**
     * The size/length of dimension arrows
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    arrowSize?: number | undefined = 0.3;
    /**
     * The total angle between arrow lines (max 90 degrees)
     * @default 30
     * @minimum 0
     * @maximum 90
     * @step 1
     */
    arrowAngle?: number | undefined = 30;
    /**
     * Flip arrows to point outward instead of inward
     * @default false
     */
    arrowsFlipped?: boolean | undefined = false;
    /**
     * Flip label horizontally
     * @default false
     */
    labelFlipHorizontal?: boolean | undefined = false;
    /**
     * Flip label vertically
     * @default false
     */
    labelFlipVertical?: boolean | undefined = false;
    /**
     * Override label text with custom expression (supports 'val' for computed value, e.g., '100*val', 'Length: val mm')
     * @default 1*val
     * @optional true
     */
    labelOverwrite?: string | undefined = "1*val";
    /**
     * Remove trailing zeros from decimal places
     * @default false
     */
    removeTrailingZeros?: boolean | undefined = false;
}
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
     * The first direction for dimension
     * @default [1, 0, 0]
     */
    direction1: Base.Point3 = [1, 0, 0];
    /**
     * The second direction for dimension
     * @default [0, 0, 1]
     */
    direction2: Base.Point3 = [0, 0, 1];
    /**
     * The center point for dimension
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The dimension radius
     * @default 4
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 4;
    /**
     * Offset from center
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    offsetFromCenter = 0.5;
    /**
     * The dimension crossing size
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extraSize = 0;
    /**
     * The dimension label decimal places
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    decimalPlaces = 2;
    /**
     * The dimension label suffix
     * @default (deg)
     */
    labelSuffix = "(deg)";
    /**
     * The dimension label size
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    labelSize = 0.1;
    /**
     * The dimension label offset
     * @default 0.3
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    labelOffset = 0.3;
    /**
     * If true the angle is in radians
     * @default false
     */
    radians = false;
    /**
     * End type for dimension
     * @default none
     */
    endType?: dimensionEndTypeEnum | undefined = dimensionEndTypeEnum.none;
    /**
     * The size/length of dimension arrows
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    arrowSize?: number | undefined = 0.3;
    /**
     * The total angle between arrow lines (max 90 degrees)
     * @default 30
     * @minimum 0
     * @maximum 90
     * @step 1
     */
    arrowAngle?: number | undefined = 30;
    /**
     * Flip arrows to point outward instead of inward
     * @default false
     */
    arrowsFlipped?: boolean | undefined = false;
    /**
     * Additional rotation angle for the label in degrees
     * @default 0
     * @minimum -360
     * @maximum 360
     * @step 1
     */
    labelRotation?: number | undefined = 0;
    /**
     * Flip label horizontally
     * @default false
     */
    labelFlipHorizontal?: boolean | undefined = false;
    /**
     * Flip label vertically
     * @default false
     */
    labelFlipVertical?: boolean | undefined = false;
    /**
     * Override label text with custom expression (supports 'val' for computed value, e.g., '100*val', 'Angle: val deg')
     * @default 1*val
     * @optional true
     */
    labelOverwrite?: string | undefined = "1*val";
    /**
     * Remove trailing zeros from decimal places
     * @default false
     */
    removeTrailingZeros?: boolean | undefined = false;
}
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
     * The start point for dimension
     * @default [0, 0, 0]
     */
    startPoint: Base.Point3 = [0, 0, 0];
    /**
     * The end point for dimension
     * @default [0, 5, 2]
     */
    endPoint?: Base.Point3 | undefined = [0, 5, 2];
    /**
     * The dimension direction (must include length)
     * @default [0, 0, 1]
     */
    direction?: Base.Vector3 | undefined = [0, 0, 1];
    /**
     * Offset from the start point
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    offsetFromStart?: number | undefined = 0;
    /**
     * The dimension label
     * @default Pin
     */
    label?: string | undefined = "Pin";
    /**
     * The dimension label offset
     * @default 0.3
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    labelOffset?: number | undefined = 0.3;
    /**
     * The dimension label size
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    labelSize?: number | undefined = 0.1;
    /**
     * End type for dimension
     * @default none
     */
    endType?: dimensionEndTypeEnum | undefined = dimensionEndTypeEnum.none;
    /**
     * The size/length of dimension arrows
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    arrowSize?: number | undefined = 0.3;
    /**
     * The total angle between arrow lines (max 90 degrees)
     * @default 30
     * @minimum 0
     * @maximum 90
     * @step 1
     */
    arrowAngle?: number | undefined = 30;
    /**
     * Flip arrows to point outward instead of inward
     * @default false
     */
    arrowsFlipped?: boolean | undefined = false;
    /**
     * Additional rotation angle for the label in degrees
     * @default 0
     * @minimum -360
     * @maximum 360
     * @step 1
     */
    labelRotation?: number | undefined = 0;
    /**
     * Flip label horizontally
     * @default false
     */
    labelFlipHorizontal?: boolean | undefined = false;
    /**
     * Flip label vertically
     * @default false
     */
    labelFlipVertical?: boolean | undefined = false;
}
export class StarSolidDto extends StarDto {
    constructor(outerRadius?: number, innerRadius?: number, numRays?: number, center?: Base.Point3, direction?: Base.Vector3, offsetOuterEdges?: number, half?: boolean, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(outerRadius, innerRadius, numRays, center, direction, offsetOuterEdges, half);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * Extrusion length in the forward direction
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * Extrusion length in the backward direction
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
export class NGonSolidDto extends NGonWireDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, nrCorners?: number, radius?: number, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(center, direction, nrCorners, radius);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * Extrusion length in the forward direction
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * Extrusion length in the backward direction
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
export class ParallelogramSolidDto extends ParallelogramDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, aroundCenter?: boolean, width?: number, height?: number, angle?: number, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(center, direction, aroundCenter, width, height, angle);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * Extrusion length in the forward direction
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * Extrusion length in the backward direction
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
export class HeartSolidDto extends Heart2DDto {
    constructor(center?: Base.Point3, direction?: Base.Vector3, rotation?: number, sizeApprox?: number, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(center, direction, rotation, sizeApprox);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * Extrusion length in the forward direction
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * Extrusion length in the backward direction
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
export class ChristmasTreeSolidDto extends ChristmasTreeDto {
    constructor(height?: number, innerDist?: number, outerDist?: number, nrSkirts?: number, trunkHeight?: number, trunkWidth?: number, half?: boolean, rotation?: number, origin?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(height, innerDist, outerDist, nrSkirts, trunkHeight, trunkWidth, half, rotation, origin, direction);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * Extrusion length in the forward direction
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * Extrusion length in the backward direction
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
export class LPolygonSolidDto extends LPolygonDto {
    constructor(widthFirst?: number, lengthFirst?: number, widthSecond?: number, lengthSecond?: number, align?: directionEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(widthFirst, lengthFirst, widthSecond, lengthSecond, align, rotation, center, direction);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * Extrusion length in the forward direction
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * Extrusion length in the backward direction
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}

