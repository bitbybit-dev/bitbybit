import { LinesMesh, Mesh } from '@babylonjs/core';
import { Base } from './base-inputs';
import { Polyline } from './polyline-inputs';

// tslint:disable-next-line: no-namespace
export namespace JSCAD {
    export class DrawSolidMeshDto {
        /**
         * Provide options without default values
         */
        constructor(mesh?: any[]) {
            this.mesh = mesh;
        }
        /**
         * Solid Jscad mesh
         */
        mesh: any;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colours: string | string[] = '#444444';
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable = false;
        /**
         * Hidden
         */
        hidden = false;
        /**
         * Solid mesh variable in case it already exists and needs updating
         */
        jscadMesh?: Mesh;
    }
    export class DrawSolidMeshesDto {
        /**
         * Provide options without default values
         */
        constructor(meshes?: any[]) {
            this.meshes = meshes;
        }
        /**
         * Solid Jscad meshes
         */
        meshes: any[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colours: string | string[] = '#444444';
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable = false;
        /**
         * Should be hidden
         */
        hidden = false;
        /**
         * Solid mesh variable in case it already exists and needs updating
         */
        jscadMesh?: Mesh;
    }
    export class DrawPathDto {
        /**
         * Provide options without default values
         */
        constructor(path?: any[]) {
            this.path = path;
        }
        /**
         * 2D Path to draw
         */
        path: any;
        /**
         * Colour of the path
         */
        colour = '#444444';
        /**
         * Opacity of the path
         */
        opacity = 1;
        /**
         * Width of the path
         */
        width = 3;
        /**
         * Indicates wether the path will change in time
         */
        updatable = false;
        /**
         * Path mesh variable that will be updated if updatable property is set to true
         */
        pathMesh?: LinesMesh;
    }
    export class TransformSolidsDto {
        /**
         * Solids to be transformed
         */
        meshes: any[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class TransformSolidDto {
        /**
         * Solid to be transformed
         */
        mesh: any;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class DownloadSolidDto {
        /**
         * Solid to be downloaded
         */
        mesh: any;
        /**
         * File name
         */
        fileName: string;
    }
    export class DownloadSolidsDto {
        /**
         * Solids to be downloaded
         */
        meshes: any[];
        /**
         * File name
         */
        fileName: string;
    }
    export class BooleanObjectsDto {
        /**
         * Contains solid Jscad mesh objects that will be used to perform boolean operation
         */
        meshes: any[];
    }
    export class ExpansionDto {
        /**
         * Delta (+/-) of expansion
         */
        delta: number;
        /**
         * Type of corner to create during of expansion; edge, chamfer, round
         */
        corners: SolidCornerTypeEnum;
        /**
         * Integer number of segments when creating round corners
         */
        segments: number;
        /**
         * Can contain various Jscad entities from Solid category
         */
        geometry: any[];
    }
    export class OffsetDto {
        /**
         * Delta (+/-) of offset
         */
        delta: number;
        /**
         * Type of corner to create during the offset; edge, chamfer, round.
         */
        corners: SolidCornerTypeEnum;
        /**
         * Integer number of segments when creating round corners
         */
        segments: number;
        /**
         * Can contain various Jscad entities from Solid category
         */
        geometry: any[];
    }
    export class ExtrudeLinearDto {
        /**
         * Height of linear extrude
         */
        height: number;
        /**
         * Twist angle in degrees
         */
        twistAngle: number;
        /**
         * Number of twist steps
         */
        twistSteps: number;
        /**
         * Geometry to extrude
         */
        geometry: any | any[];
    }

    export class HullDto {
        /**
         * Geometries to use in hull
         */
        meshes: any[];
    }
    export class ExtrudeRectangularDto {
        /**
         * Height of linear extrude
         */
        height: number;
        /**
         * Size of the rectangle
         */
        size: number;
        /**
         * Geometry to extrude
         */
        geometry: any | any[];
    }
    export class ExtrudeRectangularPointsDto {
        /**
         * Height of linear extrude
         */
        height: number;
        /**
         * Size of the rectangle
         */
        size: number;
        /**
         * Points for a path
         */
        points: Base.Point3[];
    }
    export class ExtrudeRotateDto {
        /**
         * Angle in degrees
         */
        angle: number;
        /**
         * Start angle in degrees
         */
        startAngle: number;
        /**
         * Number of segments
         */
        segments: number;
        /**
         * Polygon to extrude
         */
        polygon: any;
    }
    export class PathDto {
        /**
         * 2D path
         */
        path: any;
    }
    export class PathFromPointsDto {
        /**
         * Points through which to create a path
         */
        points: Base.Point3[];
        /**
         * Indicates wether we want to create a closed path
         */
        closed: boolean;
    }
    export class PathFromPolylineDto {
        /**
         * Polyline
         */
        polyline: Polyline.PolylinePropertiesDto;
        /**
         * Indicates wether we want to create a closed path
         */
        closed: boolean;
    }
    export class PathFromCurveDto {
        /**
         * Verb Nurbs curve
         */
        curve: any;
        /**
         * Indicates wether we want to create a closed path
         */
        closed: boolean;
    }
    export class PathAppendCurveDto {
        /**
         * Verb Nurbs curve
         */
        curve: any;
        /**
         * Path to append the curve to
         */
        path: any;
    }
    export class PathAppendPointsDto {
        /**
         * Points to append
         */
        points: number[][];
        /**
         * Path to append the points to
         */
        path: any;
    }
    export class PathAppendPolylineDto {
        /**
         * Polyline to append
         */
        polyline: Polyline.PolylinePropertiesDto;
        /**
         * Path to append the polyline to
         */
        path: any;
    }
    export class PathAppendArcDto {
        /**
         * Path to append the arc to
         */
        path: any;
        /**
         * End point of an arc
         */
        endPoint: number[];
        /**
         * Rotation (degrees) of the X axis of the arc with respect to the X axis of the coordinate system
         */
        xAxisRotation: number;
        /**
         * Draw an arc clockwise with respect to the center point
         */
        clockwise: boolean;
        /**
         * Draw an arc longer than PI radians
         */
        large: boolean;
        /**
         * Number of segments for the arc
         */
        segments: number;
        /**
         * X radius of an arc
         */
        radiusX: number;
        /**
         * Y radius of an arc
         */
        radiusY: number;
    }
    export class CircleDto {
        /**
         * Center of the circle
         */
        center: Base.Point3;
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Segment number
         */
        segments: number;
    }
    export class EllipseDto {
        /**
         * Center of the circle
         */
        center: Base.Point3;
        /**
         * Radius of the circle in [x, y] form
         */
        radius: Base.Point2;
        /**
         * Segment number
         */
        segments: number;
    }
    export class SquareDto {
        /**
         * Center of the 2D square
         */
        center: Base.Point3;
        /**
         * Size of the square
         */
        size: number;

    }
    export class RectangleDto {
        /**
         * Center of the 2D rectangle
         */
        center: Base.Point3;
        /**
         * Width of the rectangle
         */
        width: number;
        /**
         * Length of the rectangle
         */
        length: number;
    }
    export class RoundedRectangleDto extends RectangleDto {
        /**
         * The radius to round the rectangle edge
         */
        roundRadius: number;
        /**
         * Number of segments for corners
         */
        segments: number;
    }
    export class StarDto {
        /**
         * Center of the 2D star
         */
        center: Base.Point3;
        /**
         * Number of vertices on the star
         */
        vertices: number;
        /**
         * Density of the star
         */
        density: number;
        /**
         * Outer radius of the star
         */
        outerRadius: number;
        /**
         * Inner radius of the star
         */
        innerRadius: number;
        /**
         * Starting angle for first vertice, in degrees
         */
        startAngle: number;
    }
    export class CubeDto {
        /**
         * Center coordinates of the cube
         */
        center: Base.Point3;
        /**
         * Size of the cube
         */
        size: number;
    }
    export class CubeCentersDto {
        /**
         * Center coordinates of the cubes
         */
        centers: Base.Point3[];
        /**
         * Size of the cube
         */
        size: number;
    }
    export class CuboidDto {
        /**
         * Center coordinates of the cubod
         */
        center: Base.Point3;
        /**
         * Width of the cuboid
         */
        width: number;
        /**
         * Length of the cuboid
         */
        length: number;
        /**
         * Height of the cuboid
         */
        height: number;
    }
    export class CuboidCentersDto {
        /**
         * Center coordinates of the cuboids
         */
        centers: Base.Point3[];
        /**
         * Width of the cuboids
         */
        width: number;
        /**
         * Length of the cuboids
         */
        length: number;
        /**
         * Height of the cuboids
         */
        height: number;
    }
    export class RoundedCuboidDto extends CuboidDto {
        /**
         * Radius for rounding edges
         */
        roundRadius: number;
        /**
         * Segments of rounded edges
         */
        segments: number;
    }
    export class RoundedCuboidCentersDto extends CuboidCentersDto {
        /**
         * Radius for rounding edges
         */
        roundRadius: number;
        /**
         * Segments of rounded edges
         */
        segments: number;
    }
    export class CylidnerEllipticDto {
        /**
         * Center of the cylinder
         */
        center: Base.Point3;
        /**
         * Height of the cylinder
         */
        height: number;
        /**
         * Start radius on X and Y directions
         */
        startRadius: number[];
        /**
         * End radius on X and Y directions
         */
        endRadius: number[];
        /**
         * Subdivision segments
         */
        segments: number;
    }
    export class CylidnerCentersEllipticDto {
        /**
         * Centers of the cylinders
         */
        centers: Base.Point3[];
        /**
         * Height of the cylinders
         */
        height: number;
        /**
         * Start radius on X and Y directions
         */
        startRadius: Base.Point2;
        /**
         * End radius on X and Y directions
         */
        endRadius: Base.Point2;
        /**
         * Subdivision segments
         */
        segments: number;
    }
    export class CylidnerDto {
        /**
         * Center of the cylinder
         */
        center: Base.Point3;
        /**
         * Height of the cylinder
         */
        height: number;
        /**
         * Radius of the cylinder
         */
        radius: number;
        /**
         * Subdivision segments
         */
        segments: number;
    }
    export class RoundedCylidnerDto extends CylidnerDto {
        /**
         * Rounding radius
         */
        roundRadius: number;
        /**
         * Segment number
         */
        override segments: number;
    }
    export class EllipsoidDto {
        /**
         * Center coordinates
         */
        center: Base.Point3;
        /**
         * Radius of the ellipsoid in [x, y, z] form
         */
        radius: Base.Point3;
        /**
         * Segment count for ellipsoid
         */
        segments: number;
    }
    export class EllipsoidCentersDto {
        /**
         * Center coordinates
         */
        centers: Base.Point3[];
        /**
         * Radius of the ellipsoid in [x, y, z] form
         */
        radius: Base.Point3;
        /**
         * Segment count for ellipsoid
         */
        segments: number;
    }
    export class GeodesicSphereDto {
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Subdivision count
         */
        frequency: number;
        /**
         * Center coordinate of the geodesic sphere
         */
        center: Base.Point3;
    }
    export class GeodesicSphereCentersDto {
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Subdivision count
         */
        frequency: number;
        /**
         * Center coordinates of the geodesic spheres
         */
        centers: Base.Point3[];
    }
    export class CylidnerCentersDto {
        /**
         * Centers of the cylinders
         */
        centers: Base.Point3[];
        /**
         * Height of the cylinders
         */
        height: number;
        /**
         * Radius of the cylinders
         */
        radius: number;
        /**
         * Subdivision segmentss
         */
        segments: number;
    }
    export class RoundedCylidnerCentersDto extends CylidnerCentersDto {
        /**
         * Rounding radius
         */
        roundRadius: number;
        /**
         * Segment number
         */
        override segments: number;
    }
    export class SphereDto {
        /**
         * Center point of the sphere
         */
        center: Base.Point3;
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Segment count
         */
        segments: number;
    }
    export class SphereCentersDto {
        /**
         * Center points of the spheres
         */
        centers: Base.Point3[];
        /**
         * Radius of the spheres
         */
        radius: number;
        /**
         * Segment count
         */
        segments: number;
    }
    export class TorusDto {
        /**
         * Center coordinate
         */
        center: Base.Point3;
        /**
         * Inner radius
         */
        innerRadius: number;
        /**
         * Outer radius
         */
        outerRadius: number;
        /**
         * Number of inner segments
         */
        innerSegments: number;
        /**
         * Number of outer segments
         */
        outerSegments: number;
        /**
         * Inner rotation in degrees
         */
        innerRotation: number;
        /**
         * Outer rotation in degrees
         */
        outerRotation: number;
        /**
         * Start angle in degrees
         */
        startAngle: number;
    }
    export class TextDto {

        constructor(text?: string) {
            this.text = text;
        }
        /**
         * Text to write
         */
        text: string;
        /**
         * Number of segments
         */
        /**
         * X offset of the text
         */
        xOffset = 0;
        /**
         * Y offset of the text
         */
        yOffset = 0;
        /**
         * Height of the text
         */
        height = 1;
        /**
         * Space between lines
         */
        lineSpacing = 1.4;
        /**
         * Space between letters
         */
        letterSpacing = 1;
        /**
         * Align between left, center, right
         */
        align = JSCADTextAlignEnum.center;
        /**
         * Offset the extrusion
         */
        extrudeOffset = 0;
    }
    export class CylinderTextDto extends TextDto {
        /**
         * Height of the cylinder
         */
        extrusionHeight: number;
        /**
         * Radius of the cylinder
         */
        extrusionSize: number;
        /**
         * Segment subdivision for cylinder
         */
        segments: number;
    }
    export class SphereTextDto extends TextDto {
        /**
         * Radius of the spheres
         */
        radius: number;
        /**
         * Segment subdivision for sphere
         */
        segments: number;
    }

    export enum SolidCornerTypeEnum {
        /**
         * Edges will meet at a corner
         */
        edge = 'edge',
        /**
         * Edges will be rounded on the corner
         */
        round = 'round',
        /**
         * Edges will be chamfered on the corner
         */
        chamfer = 'chamfer',
    }
    export enum JSCADTextAlignEnum {
        /**
         * Aligns text to the left
         */
        left = 'left',
        /**
         * Aligns text to the center
         */
        center = 'center',
        /**
         * Aligns text to the right
         */
        right = 'right',
    }
}
