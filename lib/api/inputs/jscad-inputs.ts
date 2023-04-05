import { LinesMesh, Mesh } from '@babylonjs/core';
import { Base } from './base-inputs';
import { Polyline } from './polyline-inputs';

// tslint:disable-next-line: no-namespace
export namespace JSCAD {
    export type JSCADEntity = any;

    export class DrawSolidMeshDto {
        /**
         * Provide options without default values
         */
        constructor(mesh?: JSCADEntity[]) {
            this.mesh = mesh;
        }
        /**
         * Solid Jscad mesh
         */
        mesh: JSCADEntity;
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * Hex colour string
         * @default #444444
         */
        colours: string | string[] = '#444444';
        /**
         * Indicates wether this solid will be transformed in time
         * @default false
         */
        updatable = false;
        /**
         * Hidden
         * @default false
         */
        hidden = false;
        /**
         * Solid mesh variable in case it already exists and needs updating
         * @default undefined
         * @optional true
         * @ignore true
         */
        jscadMesh?: Mesh;
    }
    export class DrawSolidMeshesDto {
        /**
         * Provide options without default values
         */
        constructor(meshes?: JSCADEntity[]) {
            this.meshes = meshes;
        }
        /**
         * Solid Jscad meshes
         * @default undefined
         * @optional true
         */
        meshes: JSCADEntity[];
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * Hex colour string
         * @default #444444
         */
        colours: string | string[] = '#444444';
        /**
         * Indicates wether this solid will be transformed in time
         * @default false
         */
        updatable = false;
        /**
         * Should be hidden
         * @default false
         */
        hidden = false;
        /**
         * Solid mesh variable in case it already exists and needs updating
         * @default undefined
         * @optional true
         * @ignore true
         */
        jscadMesh?: Mesh;
    }
    export class DrawPathDto {
        /**
         * Provide options without default values
         */
        constructor(path?: JSCADEntity[]) {
            this.path = path;
        }
        /**
         * 2D Path to draw         
         * @default undefined
         */
        path: JSCADEntity;
        /**
         * Colour of the path
         * @default #444444
         */
        colour = '#444444';
        /**
         * Opacity of the path
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * Width of the path
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width = 3;
        /**
         * Indicates wether the path will change in time
         * @default false
         */
        updatable = false;
        /**
         * Path mesh variable that will be updated if updatable property is set to true
         * @default undefined
         * @optional true
         * @ignore true
         */
        pathMesh?: LinesMesh;
    }
    export class TransformSolidsDto {
        /**
         * Solids to be transformed
         * @default undefined
         */
        meshes: JSCADEntity[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        matrix: Base.TransformMatrixes;
    }
    export class TransformSolidDto {
        /**
         * Solid to be transformed
         * @default undefined
         */
        mesh: JSCADEntity;
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        matrix: Base.TransformMatrixes;
    }
    export class DownloadSolidDto {
        /**
         * Solid to be downloaded
         * @default undefined
         */
        mesh: JSCADEntity;
        /**
         * File name
         * @default undefined
         */
        fileName: string;
    }
    export class DownloadSolidsDto {
        /**
         * Solids to be downloaded
         * @default undefined
         */
        meshes: JSCADEntity[];
        /**
         * File name
         * @default undefined
         */
        fileName: string;
    }
    export class BooleanObjectsDto {
        /**
         * Contains solid Jscad mesh objects that will be used to perform boolean operation
         * @default undefined
         */
        meshes: JSCADEntity[];
    }
    export class ExpansionDto {
        /**
         * Can contain various Jscad entities from Solid category
         * @default undefined
         */
        geometry: JSCADEntity;
        /**
         * Delta (+/-) of expansion
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        delta: number = 0.1;
        /**
         * Type of corner to create during of expansion; edge, chamfer, round
         * @default edge
         */
        corners: SolidCornerTypeEnum = SolidCornerTypeEnum.edge;
        /**
         * Integer number of segments when creating round corners         
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class OffsetDto {
        /**
         * Can contain various Jscad entities from Solid category
         * @default undefined
         */
        geometry: JSCADEntity;
        /**
         * Delta (+/-) of offset
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        delta: number = 0.1;
        /**
         * Type of corner to create during the offset; edge, chamfer, round.
         * @default edge
         */
        corners: SolidCornerTypeEnum = SolidCornerTypeEnum.edge;
        /**
         * Integer number of segments when creating round corners
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class ExtrudeLinearDto {
        /**
         * Geometry to extrude
         * @default undefined
         */
        geometry: JSCADEntity;
        /**
         * Height of linear extrude
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Twist angle in degrees
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        twistAngle: number = 90;
        /**
         * Number of twist steps
         * @default 15
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        twistSteps: number = 15;
    }

    export class HullDto {
        /**
         * Geometries to use in hull
         * @default undefined
         */
        meshes: JSCADEntity[];
    }
    export class ExtrudeRectangularDto {
        /**
         * Geometry to extrude
         * @default undefined
         */
        geometry: JSCADEntity;
        /**
         * Height of linear extrude
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Size of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size: number = 1;
    }
    export class ExtrudeRectangularPointsDto {
        /**
         * Points for a path
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Height of linear extrude
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Size of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size: number = 1;
    }
    export class ExtrudeRotateDto {
        /**
         * Polygon to extrude
         * @default undefined
         */
        polygon: JSCADEntity;
        /**
         * Angle in degrees
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle: number = 90;
        /**
         * Start angle in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle: number = 0;
        /**
         * Number of segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class PathDto {
        /**
         * 2D path
         * @default undefined
         */
        path: JSCADEntity;
    }
    export class PathFromPointsDto {
        /**
         * Points through which to create a path
         * @default undefined
         */
        points: Base.Point2[];
        /**
         * Indicates wether we want to create a closed path
         * @default false
         */
        closed: boolean = false;
    }
    export class PathFromPolylineDto {
        /**
         * Polyline
         * @default undefined
         */
        polyline: Polyline.PolylinePropertiesDto;
        /**
         * Indicates wether we want to create a closed path
         * @default false
         */
        closed: boolean = false;
    }
    export class PathFromCurveDto {
        /**
         * Verb Nurbs curve
         * @default undefined
         */
        curve: JSCADEntity;
        /**
         * Indicates wether we want to create a closed path
         * @default false
         */
        closed: boolean = false;
    }
    export class PathAppendCurveDto {
        /**
         * Verb Nurbs curve
         * @default undefined
         */
        curve: JSCADEntity;
        /**
         * Path to append the curve to
         * @default undefined
         */
        path: JSCADEntity;
    }
    export class PathAppendPointsDto {
        /**
         * Points to append
         * @default undefined
         */
        points: Base.Point2[];
        /**
         * Path to append the points to
         * @default undefined
         */
        path: JSCADEntity;
    }
    export class PathAppendPolylineDto {
        /**
         * Polyline to append
         * @default undefined
         */
        polyline: Polyline.PolylinePropertiesDto;
        /**
         * Path to append the polyline to
         * @default undefined
         */
        path: JSCADEntity;
    }
    export class PathAppendArcDto {
        /**
         * Path to append the arc to
         * @default undefined
         */
        path: JSCADEntity;
        /**
         * End point of an arc
         * @default [1, 1]
         */
        endPoint: Base.Point2 = [1, 1];
        /**
         * Rotation (degrees) of the X axis of the arc with respect to the X axis of the coordinate system
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        xAxisRotation: number = 90;
        /**
         * Draw an arc clockwise with respect to the center point
         * @default true
         */
        clockwise: boolean = true;
        /**
         * Draw an arc longer than PI radians
         * @default false
         */
        large: boolean = false;
        /**
         * Number of segments for the arc
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
        /**
         * X radius of an arc
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        radiusX: number = 1;
        /**
         * Y radius of an arc
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        radiusY: number = 1;
    }
    export class CircleDto {
        /**
         * Center of the circle
         * @default [0, 0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * Radius of the circle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 1;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class EllipseDto {
        /**
         * Center of the circle
         * @default [0, 0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * Radius of the circle in [x, y] form
         * @default [1, 2]
         */
        radius: Base.Point2 = [1, 2];
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class SquareDto {
        /**
         * Center of the 2D square
         * @default [0, 0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * Size of the square
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        size: number = 1;

    }
    export class RectangleDto {
        /**
         * Center of the 2D rectangle
         * @default [0, 0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * Width of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        width: number = 1;
        /**
         * Length of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length: number = 1;
    }
    export class RoundedRectangleDto {
        /**
         * Center of the 2D rectangle
         * @default [0, 0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * The radius to round the rectangle edge
         * @default 0.2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        roundRadius: number = 0.2;
        /**
         * Number of segments for corners
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
        /**
         * Width of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        width: number = 1;
        /**
         * Length of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length: number = 1;
    }
    export class StarDto {
        /**
         * Center of the 2D star
         * @default [0, 0]
         */
        center: Base.Point2 = [0, 0];
        /**
         * Number of vertices on the star
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        vertices: number = 10;
        /**
         * Density of the star
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        density: number = 1;
        /**
         * Outer radius of the star
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerRadius: number = 2;
        /**
         * Inner radius of the star
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        innerRadius: number = 1;
        /**
         * Starting angle for first vertice, in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle: number = 0;
    }
    export class CubeDto {
        /**
         * Center coordinates of the cube
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Size of the cube
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        size: number = 1;
    }
    export class CubeCentersDto {
        /**
         * Center coordinates of the cubes
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Size of the cube
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size: number = 1;
    }
    export class CuboidDto {
        /**
         * Center coordinates of the cubod
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Width of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number = 1;
        /**
         * Length of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number = 1;
        /**
         * Height of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
    }
    export class CuboidCentersDto {
        /**
         * Center coordinates of the cuboids
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Width of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number = 1;
        /**
         * Length of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number = 1;
        /**
         * Height of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
    }
    export class RoundedCuboidDto {
        /**
         * Center coordinates of the cubod
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Radius for rounding edges
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        roundRadius: number = 1;
        /**
         * Width of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number = 1;
        /**
         * Length of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number = 1;
        /**
         * Height of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Segments of rounded edges
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class RoundedCuboidCentersDto {
        /**
         * Center coordinates of the cuboids
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Radius for rounding edges
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        roundRadius: number = 0.1;
        /**
         * Width of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number = 1;
        /**
         * Length of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number = 1;
        /**
         * Height of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Segments of rounded edges
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class CylidnerEllipticDto {
        /**
         * Center of the cylinder
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Height of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Start radius on X and Y directions
         * @default [1, 2]
         */
        startRadius: number[] = [1, 2];
        /**
         * End radius on X and Y directions
         * @default [2, 3]
         */
        endRadius: number[] = [2, 3];
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class CylidnerCentersEllipticDto {
        /**
         * Centers of the cylinders
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Height of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Start radius on X and Y directions
         * @default [1, 2]
         */
        startRadius: Base.Point2 = [1, 2];
        /**
         * End radius on X and Y directions
         * @default [2, 3]
         */
        endRadius: Base.Point2 = [2, 3];
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class CylidnerDto {
        /**
         * Center of the cylinder
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Height of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 1;
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class RoundedCylidnerDto {
        /**
         * Center of the cylinder
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Rounding radius
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        roundRadius: number = 0.1;
        /**
         * Height of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 1;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class EllipsoidDto {
        /**
         * Center coordinates
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Radius of the ellipsoid in [x, y, z] form
         * @default [1, 2, 3]
         */
        radius: Base.Point3 = [1, 2, 3];
        /**
         * Segment count for ellipsoid
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class EllipsoidCentersDto {
        /**
         * Center coordinates
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Radius of the ellipsoid in [x, y, z] form
         * @default [1, 2, 3]
         */
        radius: Base.Point3 = [1, 2, 3];
        /**
         * Segment count for ellipsoid
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class GeodesicSphereDto {
        /**
         * Center coordinate of the geodesic sphere
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Radius of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 1;
        /**
         * Subdivision count
         * @default 12
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        frequency: number = 12;
    }
    export class GeodesicSphereCentersDto {
        /**
         * Center coordinates of the geodesic spheres
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Radius of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 1;
        /**
         * Subdivision count
         * @default 12
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        frequency: number = 12;
    }
    export class CylidnerCentersDto {
        /**
         * Centers of the cylinders
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Height of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Radius of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 1;
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class RoundedCylidnerCentersDto {
        /**
         * Centers of the cylinders
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Rounding radius
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        roundRadius: number = 0.1;
        /**
         * Height of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number = 1;
        /**
         * Radius of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 1;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class SphereDto {
        /**
         * Center point of the sphere
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Radius of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 1;
        /**
         * Segment count
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class SphereCentersDto {
        /**
         * Center points of the spheres
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Radius of the spheres
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 1;
        /**
         * Segment count
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
    }
    export class TorusDto {
        /**
         * Center coordinate
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Inner radius
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        innerRadius: number = 1;
        /**
         * Outer radius
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerRadius: number = 2;
        /**
         * Number of inner segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        innerSegments: number = 24;
        /**
         * Number of outer segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        outerSegments: number = 24;
        /**
         * Inner rotation in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        innerRotation: number = 0;
        /**
         * Outer rotation in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        outerRotation: number = 360;
        /**
         * Start angle in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle: number = 0;
    }
    export class TextDto {
        /**
         * Text to write
         * @default Hello World
         */
        text: string = "Hello World";
        /**
         * Number of segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
        /**
         * X offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset = 0;
        /**
         * Y offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset = 0;
        /**
         * Height of the text
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Space between lines
         * @default 1.4
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        lineSpacing = 1.4;
        /**
         * Space between letters
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        letterSpacing = 1;
        /**
         * Align between left, center, right
         * @default center
         */
        align = JSCADTextAlignEnum.center;
        /**
         * Offset the extrusion
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset = 0;
    }
    export class CylinderTextDto {
        /**
         * Text to write
         * @default Hello World
         */
        text: string = "Hello World";
        /**
         * Height of the cylinder
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        extrusionHeight: number = 0.5;
        /**
         * Radius of the cylinder
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        extrusionSize: number = 0.1;
        /**
         * Segment subdivision for cylinder
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
        /**
         * X offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset = 0;
        /**
         * Y offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1 
         */
        yOffset = 0;
        /**
         * Height of the text
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Space between lines
         * @default 1.4
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        lineSpacing = 1.4;
        /**
         * Space between letters
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        letterSpacing = 1;
        /**
         * Align between left, center, right
         * @default center
         */
        align = JSCADTextAlignEnum.center;
        /**
         * Offset the extrusion
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset = 0;
    }
    export class SphereTextDto {
        /**
         * Text to write
         * @default Hello World
         */
        text: string = 'Hello World';
        /**
         * Radius of the spheres
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number = 0.1;
        /**
         * Segment subdivision for sphere
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number = 24;
        /**
         * X offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset = 0;
        /**
         * Y offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset = 0;
        /**
         * Height of the text
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Space between lines
         * @default 1.4
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        lineSpacing = 1.4;
        /**
         * Space between letters
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        letterSpacing = 1;
        /**
         * Align between left, center, right
         * @default center
         */
        align = JSCADTextAlignEnum.center;
        /**
         * Offset the extrusion
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset = 0;
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
