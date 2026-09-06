// A fragment of the OCCT inputs namespace: scripts/gen-occ-inputs.mjs assembles every file in this
// directory, in file-name order, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { directionEnum } from "./02-enums";

export class SquareDto {
    constructor(size?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (size !== undefined) { this.size = size; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * size of square
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    size = 1;
    /**
     * Center of the square
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the square
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class RectangleDto {
    constructor(width?: number, length?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * width of the rectangle
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    width = 1;
    /**
     * Height of the rectangle
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    length = 2;
    /**
     * Center of the rectangle
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the rectangle
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class LPolygonDto {
    constructor(widthFirst?: number, lengthFirst?: number, widthSecond?: number, lengthSecond?: number, align?: directionEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (widthFirst !== undefined) { this.widthFirst = widthFirst; }
        if (lengthFirst !== undefined) { this.lengthFirst = lengthFirst; }
        if (widthSecond !== undefined) { this.widthSecond = widthSecond; }
        if (lengthSecond !== undefined) { this.lengthSecond = lengthSecond; }
        if (align !== undefined) { this.align = align; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Width of the first side of L polygon
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    widthFirst = 1;
    /**
     * Length of the first side of L polygon
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    lengthFirst = 2;
    /**
     * Width of the second side of L polygon
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    widthSecond = 0.5;
    /**
     * Length of the second side of L polygon
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    lengthSecond = 2;
    /**
     * Indicates if the L polygon should be aligned inside/outside or middle
     * @default outside
     */
    align = directionEnum.outside;
    /**
     * Rotation of the L polygon
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * Center of the L polygon
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the  L polygon
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class IBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
        if (webThickness !== undefined) { this.webThickness = webThickness; }
        if (flangeThickness !== undefined) { this.flangeThickness = flangeThickness; }
        if (alignment !== undefined) { this.alignment = alignment; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Width of the I-beam (flange width)
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * Height of the I-beam
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * Thickness of the web (vertical part)
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    webThickness = 0.2;
    /**
     * Thickness of the flanges (horizontal parts)
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    flangeThickness = 0.3;
    /**
     * Alignment of the profile origin
     * @default midMid
     */
    alignment = Base.basicAlignmentEnum.midMid;
    /**
     * Rotation of the I-beam profile in degrees
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * Center of the I-beam profile
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the I-beam profile
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class HBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
        if (webThickness !== undefined) { this.webThickness = webThickness; }
        if (flangeThickness !== undefined) { this.flangeThickness = flangeThickness; }
        if (alignment !== undefined) { this.alignment = alignment; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Width of the H-beam (flange width)
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * Height of the H-beam
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * Thickness of the web (vertical part)
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    webThickness = 0.2;
    /**
     * Thickness of the flanges (horizontal parts)
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    flangeThickness = 0.3;
    /**
     * Alignment of the profile origin
     * @default midMid
     */
    alignment = Base.basicAlignmentEnum.midMid;
    /**
     * Rotation of the H-beam profile in degrees
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * Center of the H-beam profile
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the H-beam profile
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class TBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
        if (webThickness !== undefined) { this.webThickness = webThickness; }
        if (flangeThickness !== undefined) { this.flangeThickness = flangeThickness; }
        if (alignment !== undefined) { this.alignment = alignment; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Width of the T-beam (flange width)
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * Height of the T-beam
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 2;
    /**
     * Thickness of the web (vertical part)
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    webThickness = 0.2;
    /**
     * Thickness of the flange (horizontal part)
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    flangeThickness = 0.3;
    /**
     * Alignment of the profile origin
     * @default midMid
     */
    alignment = Base.basicAlignmentEnum.midMid;
    /**
     * Rotation of the T-beam profile in degrees
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * Center of the T-beam profile
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the T-beam profile
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class UBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, flangeWidth?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
        if (webThickness !== undefined) { this.webThickness = webThickness; }
        if (flangeThickness !== undefined) { this.flangeThickness = flangeThickness; }
        if (flangeWidth !== undefined) { this.flangeWidth = flangeWidth; }
        if (alignment !== undefined) { this.alignment = alignment; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * Overall width of the U-beam
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * Height of the U-beam
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * Thickness of the web (back part)
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    webThickness = 0.2;
    /**
     * Thickness of the flanges (side parts)
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    flangeThickness = 0.3;
    /**
     * Width of the flanges (how far they extend inward)
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    flangeWidth = 0.5;
    /**
     * Alignment of the profile origin
     * @default midMid
     */
    alignment = Base.basicAlignmentEnum.midMid;
    /**
     * Rotation of the U-beam profile in degrees
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * Center of the U-beam profile
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the U-beam profile
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class ExtrudedSolidDto {
    constructor(extrusionLengthFront?: number, extrusionLengthBack?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
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
    /**
     * Center of the solid
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of extrusion
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
export class IBeamProfileSolidDto extends IBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(width, height, webThickness, flangeThickness, alignment, rotation, center, direction);
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
export class HBeamProfileSolidDto extends HBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(width, height, webThickness, flangeThickness, alignment, rotation, center, direction);
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
export class TBeamProfileSolidDto extends TBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(width, height, webThickness, flangeThickness, alignment, rotation, center, direction);
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
export class UBeamProfileSolidDto extends UBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, flangeWidth?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(width, height, webThickness, flangeThickness, flangeWidth, alignment, rotation, center, direction);
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
export class BoxDto {
    constructor(width?: number, length?: number, height?: number, center?: Base.Point3, originOnCenter?: boolean) {
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
        if (center !== undefined) { this.center = center; }
        if (originOnCenter !== undefined) { this.originOnCenter = originOnCenter; }
    }
    /**
     * Width of the box
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Length of the box
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 2;
    /**
     * Height of the box
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * Center of the box
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Force origin to be on the center of the cube
     * @default true
     */
    originOnCenter?: boolean | undefined = true;
}
export class CubeDto {
    constructor(size?: number, center?: Base.Point3, originOnCenter?: boolean) {
        if (size !== undefined) { this.size = size; }
        if (center !== undefined) { this.center = center; }
        if (originOnCenter !== undefined) { this.originOnCenter = originOnCenter; }
    }
    /**
     * Size of the cube
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
    /**
     * Center of the box
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Force origin to be on the center of the cube
     * @default true
     */
    originOnCenter?: boolean | undefined = true;
}
export class BoxFromCornerDto {
    constructor(width?: number, length?: number, height?: number, corner?: Base.Point3) {
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
        if (corner !== undefined) { this.corner = corner; }
    }
    /**
     * Width of the box
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * Length of the box
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 2;
    /**
     * Height of the box
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * Corner of the box
     * @default [0, 0, 0]
     */
    corner: Base.Point3 = [0, 0, 0];
}
export class SphereDto {
    constructor(radius?: number, center?: Base.Point3) {
        if (radius !== undefined) { this.radius = radius; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * Radius of the sphere
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Center of the sphere
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
export class ConeDto {
    constructor(radius1?: number, radius2?: number, height?: number, angle?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (radius1 !== undefined) { this.radius1 = radius1; }
        if (radius2 !== undefined) { this.radius2 = radius2; }
        if (height !== undefined) { this.height = height; }
        if (angle !== undefined) { this.angle = angle; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * First radius of the cone
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius1 = 2;
    /**
     * Second radius of the cone
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius2 = 1;
    /**
     * Height of the cone
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 2;
    /**
     * Angle of the cone
     * @default 360
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle = 360;
    /**
     * Center of the cone
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction of the cone
     * @default [0, 1, 0]
     */
    direction: Base.Point3 = [0, 1, 0];

}
export class TorusDto {
    constructor(majorRadius?: number, minorRadius?: number, center?: Base.Point3, direction?: Base.Vector3, angle?: number) {
        if (majorRadius !== undefined) { this.majorRadius = majorRadius; }
        if (minorRadius !== undefined) { this.minorRadius = minorRadius; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * Major radius (distance from the center of the torus to the center of the pipe)
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    majorRadius = 2;
    /**
     * Minor radius (radius of the pipe)
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    minorRadius = 0.5;
    /**
     * Center of the torus
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction (axis) of the torus
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Angle of the torus segment in degrees (360 for full torus)
     * @default 360
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle?: number | undefined = 360;
}
