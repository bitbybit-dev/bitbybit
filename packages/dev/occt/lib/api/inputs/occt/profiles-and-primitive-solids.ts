// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { directionEnum } from "./enums";

/**
 * A side length and a placement for `shapes.wire.createSquareWire` and
 * `shapes.face.createSquareFace`.
 */
export class SquareDto {
    constructor(size?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (size !== undefined) { this.size = size; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The length of each side, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    size = 1;
    /**
     * The point the square is centered on.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the square lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * A width, a length and a placement for `shapes.wire.createRectangleWire` and
 * `shapes.face.createRectangleFace`.
 */
export class RectangleDto {
    constructor(width?: number, length?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The side along X on the ground plane, in model units, before the rectangle is turned to face
     * `direction`.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    width = 1;
    /**
     * The side along Z on the ground plane, in model units, before the rectangle is turned to face
     * `direction`.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    length = 2;
    /**
     * The point the rectangle is centered on.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the rectangle lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * The two legs of an L shape and its placement for `shapes.wire.createLPolygonWire` and
 * `shapes.face.createLPolygonFace`.
 */
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
     * The thickness of the first leg, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    widthFirst = 1;
    /**
     * The length of the first leg, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    lengthFirst = 2;
    /**
     * The thickness of the second leg, in model units.
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    widthSecond = 0.5;
    /**
     * The length of the second leg, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    lengthSecond = 2;
    /**
     * Where the corner of the L sits relative to the legs: on their outside, their inside or their
     * middle.
     * @default outside
     */
    align = directionEnum.outside;
    /**
     * How far the shape is turned in its plane, in degrees.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * The point the shape is placed at.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the shape lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * The cross-section of an I-beam, two horizontal flanges joined by a vertical web, for
 * `shapes.wire.createIBeamProfileWire` and `shapes.face.createIBeamProfileFace`.
 */
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
     * The width of the flanges, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * The total height of the profile, in model units.
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * The thickness of the vertical web, in model units.
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    webThickness = 0.2;
    /**
     * The thickness of each horizontal flange, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    flangeThickness = 0.3;
    /**
     * Which point of the profile's bounding box sits on `center`, such as its middle or its top
     * left corner.
     * @default midMid
     */
    alignment = Base.basicAlignmentEnum.midMid;
    /**
     * How far the profile is turned in its plane, in degrees.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * The point the profile is placed at.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the profile lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * The cross-section of an H-beam, two vertical flanges joined by a horizontal web, for
 * `shapes.wire.createHBeamProfileWire` and `shapes.face.createHBeamProfileFace`.
 */
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
     * The total width of the profile, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * The height of the flanges, in model units.
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * The thickness of the horizontal web, in model units.
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    webThickness = 0.2;
    /**
     * The thickness of each vertical flange, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    flangeThickness = 0.3;
    /**
     * Which point of the profile's bounding box sits on `center`, such as its middle or its top
     * left corner.
     * @default midMid
     */
    alignment = Base.basicAlignmentEnum.midMid;
    /**
     * How far the profile is turned in its plane, in degrees.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * The point the profile is placed at.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the profile lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * The cross-section of a T-beam, a horizontal flange with a vertical web hanging from its middle,
 * for `shapes.wire.createTBeamProfileWire` and `shapes.face.createTBeamProfileFace`.
 */
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
     * The width of the flange, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * The total height of the profile, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 2;
    /**
     * The thickness of the vertical web, in model units.
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    webThickness = 0.2;
    /**
     * The thickness of the flange, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    flangeThickness = 0.3;
    /**
     * Which point of the profile's bounding box sits on `center`, such as its middle or its top
     * left corner.
     * @default midMid
     */
    alignment = Base.basicAlignmentEnum.midMid;
    /**
     * How far the profile is turned in its plane, in degrees.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * The point the profile is placed at.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the profile lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * The cross-section of a U-beam, a channel with two flanges standing up from a web, for
 * `shapes.wire.createUBeamProfileWire` and `shapes.face.createUBeamProfileFace`.
 */
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
     * The total width of the profile, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 2;
    /**
     * The total height of the profile, in model units.
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * The thickness of the web at the back of the channel, in model units.
     * @default 0.2
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    webThickness = 0.2;
    /**
     * The thickness of each flange, in model units.
     * @default 0.3
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    flangeThickness = 0.3;
    /**
     * How far each flange reaches inward from the side of the channel, in model units.
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    flangeWidth = 0.5;
    /**
     * Which point of the profile's bounding box sits on `center`, such as its middle or its top
     * left corner.
     * @default midMid
     */
    alignment = Base.basicAlignmentEnum.midMid;
    /**
     * How far the profile is turned in its plane, in degrees.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 15
     */
    rotation = 0;
    /**
     * The point the profile is placed at.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the plane the profile lies in; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * How far a flat profile is extruded each way along its normal, the part the beam profile solid
 * inputs share.
 */
export class ExtrudedSolidDto {
    constructor(extrusionLengthFront?: number, extrusionLengthBack?: number, center?: Base.Point3, direction?: Base.Vector3) {
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * How far the profile grows along its normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the profile grows against its normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
    /**
     * The point the profile is placed at.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The normal of the profile's plane, which is the direction of the extrusion.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
}
/**
 * An I-beam profile and the extrusion lengths for `shapes.solid.createIBeamProfileSolid`; at least
 * one length must be above 0.
 */
export class IBeamProfileSolidDto extends IBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(width, height, webThickness, flangeThickness, alignment, rotation, center, direction);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the profile grows along its normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the profile grows against its normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
/**
 * An H-beam profile and the extrusion lengths for `shapes.solid.createHBeamProfileSolid`; at least
 * one length must be above 0.
 */
export class HBeamProfileSolidDto extends HBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(width, height, webThickness, flangeThickness, alignment, rotation, center, direction);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the profile grows along its normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the profile grows against its normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
/**
 * A T-beam profile and the extrusion lengths for `shapes.solid.createTBeamProfileSolid`; at least
 * one length must be above 0.
 */
export class TBeamProfileSolidDto extends TBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(width, height, webThickness, flangeThickness, alignment, rotation, center, direction);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the profile grows along its normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the profile grows against its normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
/**
 * A U-beam profile and the extrusion lengths for `shapes.solid.createUBeamProfileSolid`; at least
 * one length must be above 0.
 */
export class UBeamProfileSolidDto extends UBeamProfileDto {
    constructor(width?: number, height?: number, webThickness?: number, flangeThickness?: number, flangeWidth?: number, alignment?: Base.basicAlignmentEnum, rotation?: number, center?: Base.Point3, direction?: Base.Vector3, extrusionLengthFront?: number, extrusionLengthBack?: number) {
        super(width, height, webThickness, flangeThickness, flangeWidth, alignment, rotation, center, direction);
        if (extrusionLengthFront !== undefined) { this.extrusionLengthFront = extrusionLengthFront; }
        if (extrusionLengthBack !== undefined) { this.extrusionLengthBack = extrusionLengthBack; }
    }
    /**
     * How far the profile grows along its normal, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthFront = 1;
    /**
     * How far the profile grows against its normal, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionLengthBack = 0;
}
/**
 * The three sides of a box and where it sits, for `shapes.solid.createBox`; `width` runs along X,
 * `height` along Y, which is up, and `length` along Z.
 */
export class BoxDto {
    constructor(width?: number, length?: number, height?: number, center?: Base.Point3, originOnCenter?: boolean) {
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
        if (center !== undefined) { this.center = center; }
        if (originOnCenter !== undefined) { this.originOnCenter = originOnCenter; }
    }
    /**
     * The side along X, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * The side along Z, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 2;
    /**
     * The side along Y, which is up, in model units.
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * The point the box is centered on, or stands on when `originOnCenter` is false.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * When true, the box is centered on `center`; when false it stands on it, so `center` is the
     * middle of the bottom face.
     * @default true
     */
    originOnCenter?: boolean | undefined = true;
}
/**
 * The side of a cube and where it sits, for `shapes.solid.createCube`.
 */
export class CubeDto {
    constructor(size?: number, center?: Base.Point3, originOnCenter?: boolean) {
        if (size !== undefined) { this.size = size; }
        if (center !== undefined) { this.center = center; }
        if (originOnCenter !== undefined) { this.originOnCenter = originOnCenter; }
    }
    /**
     * The length of every side, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
    /**
     * The point the cube is centered on, or stands on when `originOnCenter` is false.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * When true, the cube is centered on `center`; when false it stands on it, so `center` is the
     * middle of the bottom face.
     * @default true
     */
    originOnCenter?: boolean | undefined = true;
}
/**
 * The three sides of a box and its corner, for `shapes.solid.createBoxFromCorner`, which grows the
 * box along the positive axes from there.
 */
export class BoxFromCornerDto {
    constructor(width?: number, length?: number, height?: number, corner?: Base.Point3) {
        if (width !== undefined) { this.width = width; }
        if (length !== undefined) { this.length = length; }
        if (height !== undefined) { this.height = height; }
        if (corner !== undefined) { this.corner = corner; }
    }
    /**
     * The side along X, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    width = 1;
    /**
     * The side along Z, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 2;
    /**
     * The side along Y, which is up, in model units.
     * @default 3
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 3;
    /**
     * The corner with the smallest X, Y and Z; the box extends from it along the positive axes.
     * @default [0, 0, 0]
     */
    corner: Base.Point3 = [0, 0, 0];
}
/**
 * A radius and a center for `shapes.solid.createSphere`.
 */
export class SphereDto {
    constructor(radius?: number, center?: Base.Point3) {
        if (radius !== undefined) { this.radius = radius; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * The distance from the center to the surface, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * The point the sphere is centered on.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}
/**
 * The two radii, height and placement of a cone or truncated cone for `shapes.solid.createCone`.
 */
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
     * The radius of the base at `center`, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius1 = 2;
    /**
     * The radius at the top, in model units; 0 makes a pointed cone.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius2 = 1;
    /**
     * The distance from the base to the top along `direction`, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 2;
    /**
     * How much of the full round to build, in degrees; less than 360 cuts a wedge out.
     * @default 360
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle = 360;
    /**
     * The center of the base.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The direction from the base to the top.
     * @default [0, 1, 0]
     */
    direction: Base.Point3 = [0, 1, 0];

}
/**
 * The two radii and placement of a ring for `shapes.solid.createTorus`.
 */
export class TorusDto {
    constructor(majorRadius?: number, minorRadius?: number, center?: Base.Point3, direction?: Base.Vector3, angle?: number) {
        if (majorRadius !== undefined) { this.majorRadius = majorRadius; }
        if (minorRadius !== undefined) { this.minorRadius = minorRadius; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * The distance from the center of the ring to the middle of its tube, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    majorRadius = 2;
    /**
     * The radius of the tube itself, in model units.
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    minorRadius = 0.5;
    /**
     * The point the ring is centered on.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The axis the ring goes around; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * How much of the full ring to build, in degrees; less than 360 gives a partial ring.
     * @default 360
     * @minimum 0
     * @maximum 360
     * @step 1
     */
    angle?: number | undefined = 360;
}
