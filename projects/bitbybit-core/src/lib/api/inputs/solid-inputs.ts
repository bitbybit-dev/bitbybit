import { Mesh } from '@babylonjs/core';
import { Polyline } from './polyline-inputs';

// tslint:disable-next-line: no-namespace
export namespace Solid {
    export class DrawSolidMeshDto {
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
        colour = '#444444';
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable = false;
        /**
         * Solid mesh variable in case it already exists and needs updating
         */
        jscadMesh?: Mesh;
    }
    export class DrawSolidsMeshDto {
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
        colour = '#444444';
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable = false;
        /**
         * Solid mesh variable in case it already exists and needs updating
         */
        jscadMesh?: Mesh;
    }
    export class TransformSolidsDto {
        /**
         * Solids to be transformed
         */
        solids: any[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class TransformSolidDto {
        /**
         * Solid to be transformed
         */
        solid: any;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class DownloadSolidDto {
        /**
         * Solid to be downloaded
         */
        solid: any;
        /**
         * File name
         */
        fileName: string;
    }
    export class DownloadSolidsDto {
        /**
         * Solids to be downloaded
         */
        solids: any[];
        /**
         * File name
         */
        fileName: string;
    }
    export class BooleanObjectsDto {
        /**
         * Contains solid Jscad mesh objects that will be used to perform boolean operation
         */
        objects: any[];
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
        geometry: any[];
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
        points: number[][];
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
        points: number[][];
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
        center: number[];
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
        center: number[];
        /**
         * Radius of the circle in [x, y] form
         */
        radius: number[];
        /**
         * Segment number
         */
        segments: number;
    }
    export class SquareDto {
        /**
         * Center of the 2D square
         */
        center: number[];
        /**
         * Size of the square
         */
        size: number;

    }
    export class RectangleDto {
        /**
         * Center of the 2D rectangle
         */
        center: number[];
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
        center: number[];
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
    export enum SolidTextAlignEnum {
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
