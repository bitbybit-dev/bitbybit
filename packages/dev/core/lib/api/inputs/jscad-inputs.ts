/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";
import { Polyline } from "./polyline-inputs";

// tslint:disable-next-line: no-namespace
export namespace JSCAD {
    export type JSCADEntity = any;

    export enum solidCornerTypeEnum {
        /**
         * Edges will meet at a corner
         */
        edge = "edge",
        /**
         * Edges will be rounded on the corner
         */
        round = "round",
        /**
         * Edges will be chamfered on the corner
         */
        chamfer = "chamfer",
    }
    export enum jscadTextAlignEnum {
        /**
         * Aligns text to the left
         */
        left = "left",
        /**
         * Aligns text to the center
         */
        center = "center",
        /**
         * Aligns text to the right
         */
        right = "right",
    }
    export class DrawSolidMeshDto<T> {
        /**
         * Provide options without default values
         */
        constructor(mesh?: JSCADEntity, opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, jscadMesh?: T) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (hidden !== undefined) { this.hidden = hidden; }
            if (jscadMesh !== undefined) { this.jscadMesh = jscadMesh; }
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
        colours: string | string[] = "#444444";
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
        jscadMesh?: T;
    }
    export class DrawSolidMeshesDto<T> {
        /**
         * Provide options without default values
         */
        constructor(meshes?: JSCADEntity[], opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, jscadMesh?: T) {
            if (meshes !== undefined) { this.meshes = meshes; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (hidden !== undefined) { this.hidden = hidden; }
            if (jscadMesh !== undefined) { this.jscadMesh = jscadMesh; }
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
        colours: string | string[] = "#444444";
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
        jscadMesh?: T;
    }
    export class DrawPathDto<T> {
        /**
         * Provide options without default values
         */
        constructor(path?: JSCADEntity[], colour?: string, opacity?: number, width?: number, updatable?: boolean, pathMesh?: T) {
            if (path !== undefined) { this.path = path; }
            if (colour !== undefined) { this.colour = colour; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (width !== undefined) { this.width = width; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (pathMesh !== undefined) { this.pathMesh = pathMesh; }
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
        colour = "#444444";
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
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width = 10;
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
        pathMesh?: T;
    }
    export class TransformSolidsDto {
        constructor(meshes?: JSCADEntity[], transformation?: Base.TransformMatrixes) {
            if (meshes !== undefined) { this.meshes = meshes; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Solids to be transformed
         * @default undefined
         */
        meshes: JSCADEntity[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        transformation: Base.TransformMatrixes;
    }
    export class TransformSolidDto {
        constructor(mesh?: JSCADEntity, transformation?: Base.TransformMatrixes) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Solid to be transformed
         * @default undefined
         */
        mesh: JSCADEntity;
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        transformation: Base.TransformMatrixes;
    }
    export class DownloadSolidDto {
        constructor(mesh?: JSCADEntity, fileName?: string) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (fileName !== undefined) { this.fileName = fileName; }
        }
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
    export class DownloadGeometryDto {
        constructor(geometry?: JSCADEntity | JSCADEntity[], fileName?: string, options?: any) {
            if (geometry !== undefined) { this.geometry = geometry; }
            if (fileName !== undefined) { this.fileName = fileName; }
            if (options !== undefined) { this.options = options; }
        }
        /**
         * Solid or path to be downloaded, also supports multiple geometries in array
         * @default undefined
         */
        geometry: JSCADEntity | JSCADEntity[];
        /**
         * File name
         * @default jscad-geometry
         */
        fileName = "jscad-geometry";
        /**
         * Options
         * @default undefined
         * @optional true
         */
        options;
    }
    export class DownloadSolidsDto {
        constructor(meshes?: JSCADEntity[], fileName?: string) {
            if (meshes !== undefined) { this.meshes = meshes; }
            if (fileName !== undefined) { this.fileName = fileName; }
        }
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
    export class ColorizeDto {
        constructor(geometry?: JSCADEntity, color?: string) {
            if (geometry !== undefined) { this.geometry = geometry; }
            if (color !== undefined) { this.color = color; }
        }
        /**
         * Solid to be colorized
         * @default undefined
         */
        geometry: JSCADEntity | JSCADEntity[];
        /**
         * Hex color string
         * @default #0000ff
         */
        color = "#0000ff";
    }
    export class BooleanObjectsDto {
        constructor(meshes?: JSCADEntity[]) {
            if (meshes !== undefined) { this.meshes = meshes; }
        }
        /**
         * Contains solid Jscad mesh objects that will be used to perform boolean operation
         * @default undefined
         */
        meshes: JSCADEntity[];
    }
    export class BooleanTwoObjectsDto {
        constructor(first?: JSCADEntity, second?: JSCADEntity) {
            if (first !== undefined) { this.first = first; }
            if (second !== undefined) { this.second = second; }
        }
        /**
         * Contains Jscad Solid
         * @default undefined
         */
        first: JSCADEntity;
        /**
         * Contains Jscad Solid
         * @default undefined
         */
        second: JSCADEntity;
    }
    export class BooleanObjectsFromDto {
        constructor(from?: JSCADEntity, meshes?: JSCADEntity[]) {
            if (from !== undefined) { this.from = from; }
            if (meshes !== undefined) { this.meshes = meshes; }
        }
        /**
         * Contains Jscad Solid
         * @default undefined
         */
        from: JSCADEntity;
        /**
         * Contains Jscad Solid
         * @default undefined
         */
        meshes: JSCADEntity[];
    }
    export class ExpansionDto {
        constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number) {
            if (geometry !== undefined) { this.geometry = geometry; }
            if (delta !== undefined) { this.delta = delta; }
            if (corners !== undefined) { this.corners = corners; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        delta = 0.1;
        /**
         * Type of corner to create during of expansion; edge, chamfer, round
         * @default edge
         */
        corners: solidCornerTypeEnum = solidCornerTypeEnum.edge;
        /**
         * Integer number of segments when creating round corners         
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class OffsetDto {
        constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number) {
            if (geometry !== undefined) { this.geometry = geometry; }
            if (delta !== undefined) { this.delta = delta; }
            if (corners !== undefined) { this.corners = corners; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        delta = 0.1;
        /**
         * Type of corner to create during the offset; edge, chamfer, round.
         * @default edge
         */
        corners: solidCornerTypeEnum = solidCornerTypeEnum.edge;
        /**
         * Integer number of segments when creating round corners
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class ExtrudeLinearDto {
        constructor(geometry?: JSCADEntity, height?: number, twistAngle?: number, twistSteps?: number) {
            if (geometry !== undefined) { this.geometry = geometry; }
            if (height !== undefined) { this.height = height; }
            if (twistAngle !== undefined) { this.twistAngle = twistAngle; }
            if (twistSteps !== undefined) { this.twistSteps = twistSteps; }
        }
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
        height = 1;
        /**
         * Twist angle in degrees
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        twistAngle = 90;
        /**
         * Number of twist steps
         * @default 15
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        twistSteps = 15;
    }

    export class HullDto {
        constructor(meshes?: JSCADEntity[]) {
            if (meshes !== undefined) { this.meshes = meshes; }
        }
        /**
         * Geometries to use in hull
         * @default undefined
         */
        meshes: JSCADEntity[];
    }
    export class ExtrudeRectangularDto {
        constructor(geometry?: JSCADEntity, height?: number, size?: number) {
            if (geometry !== undefined) { this.geometry = geometry; }
            if (height !== undefined) { this.height = height; }
            if (size !== undefined) { this.size = size; }
        }
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
        height = 1;
        /**
         * Size of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
    }
    export class ExtrudeRectangularPointsDto {
        constructor(points?: Base.Point3[], height?: number, size?: number) {
            if (points !== undefined) { this.points = points; }
            if (height !== undefined) { this.height = height; }
            if (size !== undefined) { this.size = size; }
        }
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
        height = 1;
        /**
         * Size of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
    }
    export class ExtrudeRotateDto {
        constructor(polygon?: JSCADEntity, angle?: number, startAngle?: number, segments?: number) {
            if (polygon !== undefined) { this.polygon = polygon; }
            if (angle !== undefined) { this.angle = angle; }
            if (startAngle !== undefined) { this.startAngle = startAngle; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        angle = 90;
        /**
         * Start angle in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle = 0;
        /**
         * Number of segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class PathDto {
        constructor(path?: JSCADEntity) {
            if (path !== undefined) { this.path = path; }
        }
        /**
         * 2D path
         * @default undefined
         */
        path: JSCADEntity;
    }
    export class PathFromPointsDto {
        constructor(points?: Base.Point2[], closed?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (closed !== undefined) { this.closed = closed; }
        }
        /**
         * Points through which to create a path
         * @default undefined
         */
        points: Base.Point2[];
        /**
         * Indicates wether we want to create a closed path
         * @default false
         */
        closed = false;
    }
    export class PathsFromPointsDto {
        constructor(pointsLists?: Base.Point3[][] | Base.Point2[][]) {
            if (pointsLists !== undefined) { this.pointsLists = pointsLists; }
        }
        /**
         * Points
         * @default undefined
         */
        pointsLists: Base.Point3[][] | Base.Point2[][];
    }
    export class PathFromPolylineDto {
        constructor(polyline?: Polyline.PolylinePropertiesDto, closed?: boolean) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (closed !== undefined) { this.closed = closed; }
        }
        /**
         * Polyline
         * @default undefined
         */
        polyline: Polyline.PolylinePropertiesDto;
        /**
         * Indicates wether we want to create a closed path
         * @default false
         */
        closed = false;
    }
    export class PathAppendCurveDto {
        constructor(curve?: JSCADEntity, path?: JSCADEntity) {
            if (curve !== undefined) { this.curve = curve; }
            if (path !== undefined) { this.path = path; }
        }
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
        constructor(points?: Base.Point2[], path?: JSCADEntity) {
            if (points !== undefined) { this.points = points; }
            if (path !== undefined) { this.path = path; }
        }
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
        constructor(polyline?: Polyline.PolylinePropertiesDto, path?: JSCADEntity) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (path !== undefined) { this.path = path; }
        }
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
        constructor(path?: JSCADEntity, endPoint?: Base.Point2, xAxisRotation?: number, clockwise?: boolean, large?: boolean, segments?: number, radiusX?: number, radiusY?: number) {
            if (path !== undefined) { this.path = path; }
            if (endPoint !== undefined) { this.endPoint = endPoint; }
            if (xAxisRotation !== undefined) { this.xAxisRotation = xAxisRotation; }
            if (clockwise !== undefined) { this.clockwise = clockwise; }
            if (large !== undefined) { this.large = large; }
            if (segments !== undefined) { this.segments = segments; }
            if (radiusX !== undefined) { this.radiusX = radiusX; }
            if (radiusY !== undefined) { this.radiusY = radiusY; }
        }
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
        xAxisRotation = 90;
        /**
         * Draw an arc clockwise with respect to the center point
         * @default true
         */
        clockwise = true;
        /**
         * Draw an arc longer than PI radians
         * @default false
         */
        large = false;
        /**
         * Number of segments for the arc
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
        /**
         * X radius of an arc
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        radiusX = 1;
        /**
         * Y radius of an arc
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        radiusY = 1;
    }
    export class CircleDto {
        constructor(center?: Base.Point2, radius?: number, segments?: number) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        radius = 1;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class EllipseDto {
        constructor(center?: Base.Point2, radius?: Base.Point2, segments?: number) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        segments = 24;
    }
    export class SquareDto {
        constructor(center?: Base.Point2, size?: number) {
            if (center !== undefined) { this.center = center; }
            if (size !== undefined) { this.size = size; }
        }
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
        size = 1;

    }
    export class RectangleDto {
        constructor(center?: Base.Point2, width?: number, length?: number) {
            if (center !== undefined) { this.center = center; }
            if (width !== undefined) { this.width = width; }
            if (length !== undefined) { this.length = length; }
        }
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
        width = 1;
        /**
         * Length of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length = 1;
    }
    export class RoundedRectangleDto {
        constructor(center?: Base.Point2, roundRadius?: number, segments?: number, width?: number, length?: number) {
            if (center !== undefined) { this.center = center; }
            if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
            if (segments !== undefined) { this.segments = segments; }
            if (width !== undefined) { this.width = width; }
            if (length !== undefined) { this.length = length; }
        }
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
        roundRadius = 0.2;
        /**
         * Number of segments for corners
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
        /**
         * Width of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        width = 1;
        /**
         * Length of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length = 1;
    }
    export class StarDto {
        constructor(center?: Base.Point2, vertices?: number, density?: number, outerRadius?: number, innerRadius?: number, startAngle?: number) {
            if (center !== undefined) { this.center = center; }
            if (vertices !== undefined) { this.vertices = vertices; }
            if (density !== undefined) { this.density = density; }
            if (outerRadius !== undefined) { this.outerRadius = outerRadius; }
            if (innerRadius !== undefined) { this.innerRadius = innerRadius; }
            if (startAngle !== undefined) { this.startAngle = startAngle; }
        }
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
        vertices = 10;
        /**
         * Density of the star
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        density = 1;
        /**
         * Outer radius of the star
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerRadius = 2;
        /**
         * Inner radius of the star
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        innerRadius = 1;
        /**
         * Starting angle for first vertice, in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle = 0;
    }
    export class CubeDto {
        constructor(center?: Base.Point3, size?: number) {
            if (center !== undefined) { this.center = center; }
            if (size !== undefined) { this.size = size; }
        }
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
        size = 1;
    }
    export class CubeCentersDto {
        constructor(centers?: Base.Point3[], size?: number) {
            if (centers !== undefined) { this.centers = centers; }
            if (size !== undefined) { this.size = size; }
        }
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
        size = 1;
    }
    export class CuboidDto {
        constructor(center?: Base.Point3, width?: number, length?: number, height?: number) {
            if (center !== undefined) { this.center = center; }
            if (width !== undefined) { this.width = width; }
            if (length !== undefined) { this.length = length; }
            if (height !== undefined) { this.height = height; }
        }
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
        width = 1;
        /**
         * Length of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length = 1;
        /**
         * Height of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
    }
    export class CuboidCentersDto {
        constructor(centers?: Base.Point3[], width?: number, length?: number, height?: number) {
            if (centers !== undefined) { this.centers = centers; }
            if (width !== undefined) { this.width = width; }
            if (length !== undefined) { this.length = length; }
            if (height !== undefined) { this.height = height; }
        }
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
        width = 1;
        /**
         * Length of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length = 1;
        /**
         * Height of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
    }
    export class RoundedCuboidDto {
        constructor(center?: Base.Point3, roundRadius?: number, width?: number, length?: number, height?: number, segments?: number) {
            if (center !== undefined) { this.center = center; }
            if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
            if (width !== undefined) { this.width = width; }
            if (length !== undefined) { this.length = length; }
            if (height !== undefined) { this.height = height; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        roundRadius = 1;
        /**
         * Width of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width = 1;
        /**
         * Length of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length = 1;
        /**
         * Height of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Segments of rounded edges
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class RoundedCuboidCentersDto {
        constructor(centers?: Base.Point3[], roundRadius?: number, width?: number, length?: number, height?: number, segments?: number) {
            if (centers !== undefined) { this.centers = centers; }
            if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
            if (width !== undefined) { this.width = width; }
            if (length !== undefined) { this.length = length; }
            if (height !== undefined) { this.height = height; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        roundRadius = 0.1;
        /**
         * Width of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width = 1;
        /**
         * Length of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length = 1;
        /**
         * Height of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Segments of rounded edges
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class CylidnerEllipticDto {
        constructor(center?: Base.Point3, height?: number, startRadius?: Base.Point2, endRadius?: Base.Point2, segments?: number) {
            if (center !== undefined) { this.center = center; }
            if (height !== undefined) { this.height = height; }
            if (startRadius !== undefined) { this.startRadius = startRadius; }
            if (endRadius !== undefined) { this.endRadius = endRadius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        height = 1;
        /**
         * Start radius on X and Y directions
         * @default [1, 2]
         */
        startRadius: Base.Vector2 = [1, 2];
        /**
         * End radius on X and Y directions
         * @default [2, 3]
         */
        endRadius: Base.Vector2 = [2, 3];
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class CylidnerCentersEllipticDto {
        constructor(centers?: Base.Point3[], height?: number, startRadius?: Base.Point2, endRadius?: Base.Point2, segments?: number) {
            if (centers !== undefined) { this.centers = centers; }
            if (height !== undefined) { this.height = height; }
            if (startRadius !== undefined) { this.startRadius = startRadius; }
            if (endRadius !== undefined) { this.endRadius = endRadius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        height = 1;
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
        segments = 24;
    }
    export class CylidnerDto {
        constructor(center?: Base.Point3, height?: number, radius?: number, segments?: number) {
            if (center !== undefined) { this.center = center; }
            if (height !== undefined) { this.height = height; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        height = 1;
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class RoundedCylidnerDto {
        constructor(center?: Base.Point3, roundRadius?: number, height?: number, radius?: number, segments?: number) {
            if (center !== undefined) { this.center = center; }
            if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
            if (height !== undefined) { this.height = height; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        roundRadius = 0.1;
        /**
         * Height of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class EllipsoidDto {
        constructor(center?: Base.Point3, radius?: Base.Point3, segments?: number) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        segments = 24;
    }
    export class EllipsoidCentersDto {
        constructor(centers?: Base.Point3[], radius?: Base.Point3, segments?: number) {
            if (centers !== undefined) { this.centers = centers; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        segments = 24;
    }
    export class GeodesicSphereDto {
        constructor(center?: Base.Point3, radius?: number, frequency?: number) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (frequency !== undefined) { this.frequency = frequency; }
        }
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
        radius = 1;
        /**
         * Subdivision count
         * @default 12
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        frequency = 12;
    }
    export class GeodesicSphereCentersDto {
        constructor(centers?: Base.Point3[], radius?: number, frequency?: number) {
            if (centers !== undefined) { this.centers = centers; }
            if (radius !== undefined) { this.radius = radius; }
            if (frequency !== undefined) { this.frequency = frequency; }
        }
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
        radius = 1;
        /**
         * Subdivision count
         * @default 12
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        frequency = 12;
    }
    export class CylidnerCentersDto {
        constructor(centers?: Base.Point3[], height?: number, radius?: number, segments?: number) {
            if (centers !== undefined) { this.centers = centers; }
            if (height !== undefined) { this.height = height; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        height = 1;
        /**
         * Radius of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class RoundedCylidnerCentersDto {
        constructor(centers?: Base.Point3[], roundRadius?: number, height?: number, radius?: number, segments?: number) {
            if (centers !== undefined) { this.centers = centers; }
            if (roundRadius !== undefined) { this.roundRadius = roundRadius; }
            if (height !== undefined) { this.height = height; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        roundRadius = 0.1;
        /**
         * Height of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Radius of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class SphereDto {
        constructor(center?: Base.Point3, radius?: number, segments?: number) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        radius = 1;
        /**
         * Segment count
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class SphereCentersDto {
        constructor(centers?: Base.Point3[], radius?: number, segments?: number) {
            if (centers !== undefined) { this.centers = centers; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
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
        radius = 1;
        /**
         * Segment count
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
    }
    export class TorusDto {
        constructor(center?: Base.Point3, innerRadius?: number, outerRadius?: number, innerSegments?: number, outerSegments?: number, innerRotation?: number, outerRotation?: number, startAngle?: number) {
            if (center !== undefined) { this.center = center; }
            if (innerRadius !== undefined) { this.innerRadius = innerRadius; }
            if (outerRadius !== undefined) { this.outerRadius = outerRadius; }
            if (innerSegments !== undefined) { this.innerSegments = innerSegments; }
            if (outerSegments !== undefined) { this.outerSegments = outerSegments; }
            if (innerRotation !== undefined) { this.innerRotation = innerRotation; }
            if (outerRotation !== undefined) { this.outerRotation = outerRotation; }
            if (startAngle !== undefined) { this.startAngle = startAngle; }
        }
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
        innerRadius = 1;
        /**
         * Outer radius
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerRadius = 2;
        /**
         * Number of inner segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        innerSegments = 24;
        /**
         * Number of outer segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        outerSegments = 24;
        /**
         * Inner rotation in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        innerRotation = 0;
        /**
         * Outer rotation in degrees
         * @default 360
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        outerRotation = 360;
        /**
         * Start angle in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle = 0;
    }
    export class TextDto {
        constructor(text?: string, segments?: number, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: jscadTextAlignEnum, extrudeOffset?: number) {
            if (text !== undefined) { this.text = text; }
            if (segments !== undefined) { this.segments = segments; }
            if (xOffset !== undefined) { this.xOffset = xOffset; }
            if (yOffset !== undefined) { this.yOffset = yOffset; }
            if (height !== undefined) { this.height = height; }
            if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
            if (letterSpacing !== undefined) { this.letterSpacing = letterSpacing; }
            if (align !== undefined) { this.align = align; }
            if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
        }
        /**
         * Text to write
         * @default Hello World
         */
        text = "Hello World";
        /**
         * Number of segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
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
        align = jscadTextAlignEnum.center;
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
        constructor(text?: string, extrusionHeight?: number, extrusionSize?: number, segments?: number, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: jscadTextAlignEnum, extrudeOffset?: number) {
            if (text !== undefined) { this.text = text; }
            if (extrusionHeight !== undefined) { this.extrusionHeight = extrusionHeight; }
            if (extrusionSize !== undefined) { this.extrusionSize = extrusionSize; }
            if (segments !== undefined) { this.segments = segments; }
            if (xOffset !== undefined) { this.xOffset = xOffset; }
            if (yOffset !== undefined) { this.yOffset = yOffset; }
            if (height !== undefined) { this.height = height; }
            if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
            if (letterSpacing !== undefined) { this.letterSpacing = letterSpacing; }
            if (align !== undefined) { this.align = align; }
            if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
        }
        /**
         * Text to write
         * @default Hello World
         */
        text = "Hello World";
        /**
         * Height of the cylinder
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        extrusionHeight = 0.5;
        /**
         * Radius of the cylinder
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        extrusionSize = 0.1;
        /**
         * Segment subdivision for cylinder
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
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
        align = jscadTextAlignEnum.center;
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
        constructor(text?: string, radius?: number, segments?: number, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: jscadTextAlignEnum, extrudeOffset?: number) {
            if (text !== undefined) { this.text = text; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
            if (xOffset !== undefined) { this.xOffset = xOffset; }
            if (yOffset !== undefined) { this.yOffset = yOffset; }
            if (height !== undefined) { this.height = height; }
            if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
            if (letterSpacing !== undefined) { this.letterSpacing = letterSpacing; }
            if (align !== undefined) { this.align = align; }
            if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
        }
        /**
         * Text to write
         * @default Hello World
         */
        text = "Hello World";
        /**
         * Radius of the spheres
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 0.1;
        /**
         * Segment subdivision for sphere
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 24;
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
        align = jscadTextAlignEnum.center;
        /**
         * Offset the extrusion
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset = 0;
    }
    export class FromPolygonPoints {
        constructor(polygonPoints?: Base.Point3[][]) {
            if (polygonPoints !== undefined) { this.polygonPoints = polygonPoints; }
        }
        /**
         * Points describing polygons
         */
        polygonPoints?: Base.Point3[][];
    }
}
