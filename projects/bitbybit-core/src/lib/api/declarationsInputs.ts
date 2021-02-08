export const inputDeclarations = `* from './vector-inputs';
* from './scene-inputs';
* from './node-inputs';
* from './transforms-inputs';
* from './point-inputs';
* from './line-inputs';
* from './polyline-inputs';
* from './verb-inputs';
* from './jscad-inputs';
* from './tag-inputs';
* from './occ-inputs';declare namespace BaseTypes {
    /**
     * Interval represents an object that has two properties - min and max.
     */
    class IntervalDto {
        /**
         * Minimum value of the interval
         * @link https://docs.bitbybit.dev/classes/bitbybit_base_types.basetypes.intervaldto.html#min
         */
        min: number;
        /**
         * Maximum value of the interval
         * @link https://docs.bitbybit.dev/classes/bitbybit_base_types.basetypes.intervaldto.html#max
         */
        max: number;
    }
    /**
     * UV usually represents 2D coordinates on 3D or 2D surfaces. It is similar to XY coordinates in planes.
     */
    class UVDto {
        /**
         * U coordinate of the surface
         * @link https://docs.bitbybit.dev/classes/bitbybit_base_types.basetypes.uvdto.html#u
         */
        u: number;
        /**
         * V coordinate of the surface
         * @link https://docs.bitbybit.dev/classes/bitbybit_base_types.basetypes.uvdto.html#v
         */
        v: number;
    }
    /**
     * Intersection result of curve curve
     */
    class CurveCurveIntersection {
        /**
         * Point of intersection on the first curve
         */
        point0: number[];
        /**
         * Point of intersection on the second curve
         */
        point1: number[];
        /**
         * Parameter of intersection on the first curve
         */
        u0: number;
        /**
         * Parameter of intersection on the second curve
         */
        u1: number;
    }
    /**
     * Intersection result of curve and surface
     */
    class CurveSurfaceIntersection {
        /**
         * Parameter of intersection on the curve
         */
        u: number;
        /**
         * UV Parameters of intersection on the surface
         */
        uv: UVDto;
        /**
         * Point of intersection on the curve
         */
        curvePoint: number[];
        /**
         * Point of intersection on the surface
         */
        surfacePoint: number[];
    }
    /**
     * Intersection point between two surfaces
     */
    class SurfaceSurfaceIntersectionPoint {
        /**
         * UV parameters of intersection on first surface
         */
        uv0: UVDto;
        /**
         * UV parameters of intersection on second surface
         */
        uv1: UVDto;
        /**
         * Point of intersection
         */
        point: number[];
        /**
         * Distance
         */
        dist: number;
    }
}declare namespace JSCAD {
    class DrawSolidMeshDto {
        /**
         * Provide options without default values
         */
        constructor(mesh?: any[]);
        /**
         * Solid Jscad mesh
         */
        mesh: any;
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable: boolean;
        /**
         * Solid mesh variable in case it already exists and needs updating
         */
        jscadMesh?: Mesh;
    }
    class DrawSolidsMeshDto {
        /**
         * Provide options without default values
         */
        constructor(meshes?: any[]);
        /**
         * Solid Jscad meshes
         */
        meshes: any[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable: boolean;
        /**
         * Solid mesh variable in case it already exists and needs updating
         */
        jscadMesh?: Mesh;
    }
    class DrawPathDto {
        /**
         * Provide options without default values
         */
        constructor(path?: any[]);
        /**
         * 2D Path to draw
         */
        path: any;
        /**
         * Colour of the path
         */
        colour: string;
        /**
         * Opacity of the path
         */
        opacity: number;
        /**
         * Width of the path
         */
        width: number;
        /**
         * Indicates wether the path will change in time
         */
        updatable: boolean;
        /**
         * Path mesh variable that will be updated if updatable property is set to true
         */
        pathMesh?: LinesMesh;
    }
    class TransformSolidsDto {
        /**
         * Solids to be transformed
         */
        solids: any[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class TransformSolidDto {
        /**
         * Solid to be transformed
         */
        solid: any;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class DownloadSolidDto {
        /**
         * Solid to be downloaded
         */
        solid: any;
        /**
         * File name
         */
        fileName: string;
    }
    class DownloadSolidsDto {
        /**
         * Solids to be downloaded
         */
        solids: any[];
        /**
         * File name
         */
        fileName: string;
    }
    class BooleanObjectsDto {
        /**
         * Contains solid Jscad mesh objects that will be used to perform boolean operation
         */
        objects: any[];
    }
    class ExpansionDto {
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
    class OffsetDto {
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
    class ExtrudeLinearDto {
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
    class HullDto {
        /**
         * Geometries to use in hull
         */
        geometry: any[];
    }
    class ExtrudeRectangularDto {
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
    class ExtrudeRectangularPointsDto {
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
    class ExtrudeRotateDto {
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
    class PathDto {
        /**
         * 2D path
         */
        path: any;
    }
    class PathFromPointsDto {
        /**
         * Points through which to create a path
         */
        points: number[][];
        /**
         * Indicates wether we want to create a closed path
         */
        closed: boolean;
    }
    class PathFromPolylineDto {
        /**
         * Polyline
         */
        polyline: Polyline.PolylinePropertiesDto;
        /**
         * Indicates wether we want to create a closed path
         */
        closed: boolean;
    }
    class PathFromCurveDto {
        /**
         * Verb Nurbs curve
         */
        curve: any;
        /**
         * Indicates wether we want to create a closed path
         */
        closed: boolean;
    }
    class PathAppendCurveDto {
        /**
         * Verb Nurbs curve
         */
        curve: any;
        /**
         * Path to append the curve to
         */
        path: any;
    }
    class PathAppendPointsDto {
        /**
         * Points to append
         */
        points: number[][];
        /**
         * Path to append the points to
         */
        path: any;
    }
    class PathAppendPolylineDto {
        /**
         * Polyline to append
         */
        polyline: Polyline.PolylinePropertiesDto;
        /**
         * Path to append the polyline to
         */
        path: any;
    }
    class PathAppendArcDto {
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
    class CircleDto {
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
    class EllipseDto {
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
    class SquareDto {
        /**
         * Center of the 2D square
         */
        center: number[];
        /**
         * Size of the square
         */
        size: number;
    }
    class RectangleDto {
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
    class RoundedRectangleDto extends RectangleDto {
        /**
         * The radius to round the rectangle edge
         */
        roundRadius: number;
        /**
         * Number of segments for corners
         */
        segments: number;
    }
    class StarDto {
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
    class CubeDto {
        /**
         * Center coordinates of the cube
         */
        center: number[];
        /**
         * Size of the cube
         */
        size: number;
    }
    class CubeCentersDto {
        /**
         * Center coordinates of the cubes
         */
        centers: number[][];
        /**
         * Size of the cube
         */
        size: number;
    }
    class CuboidDto {
        /**
         * Center coordinates of the cubod
         */
        center: number[];
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
    class CuboidCentersDto {
        /**
         * Center coordinates of the cuboids
         */
        centers: number[][];
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
    class RoundedCuboidDto extends CuboidDto {
        /**
         * Radius for rounding edges
         */
        roundRadius: number;
        /**
         * Segments of rounded edges
         */
        segments: number;
    }
    class RoundedCuboidCentersDto extends CuboidCentersDto {
        /**
         * Radius for rounding edges
         */
        roundRadius: number;
        /**
         * Segments of rounded edges
         */
        segments: number;
    }
    class CylidnerEllipticDto {
        /**
         * Center of the cylinder
         */
        center: number[];
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
    class CylidnerCentersEllipticDto {
        /**
         * Centers of the cylinders
         */
        centers: number[][];
        /**
         * Height of the cylinders
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
    class CylidnerDto {
        /**
         * Center of the cylinder
         */
        center: number[];
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
    class RoundedCylidnerDto extends CylidnerDto {
        /**
         * Rounding radius
         */
        roundRadius: number;
        /**
         * Segment number
         */
        segments: number;
    }
    class EllipsoidDto {
        /**
         * Center coordinates
         */
        center: number[];
        /**
         * Radius of the ellipsoid in [x, y, z] form
         */
        radius: number[];
        /**
         * Segment count for ellipsoid
         */
        segments: number;
    }
    class EllipsoidCentersDto {
        /**
         * Center coordinates
         */
        centers: number[][];
        /**
         * Radius of the ellipsoid in [x, y, z] form
         */
        radius: number[];
        /**
         * Segment count for ellipsoid
         */
        segments: number;
    }
    class GeodesicSphereDto {
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
        center: number[];
    }
    class GeodesicSphereCentersDto {
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
        centers: number[][];
    }
    class CylidnerCentersDto {
        /**
         * Centers of the cylinders
         */
        centers: number[][];
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
    class RoundedCylidnerCentersDto extends CylidnerCentersDto {
        /**
         * Rounding radius
         */
        roundRadius: number;
        /**
         * Segment number
         */
        segments: number;
    }
    class SphereDto {
        /**
         * Center point of the sphere
         */
        center: number[];
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Segment count
         */
        segments: number;
    }
    class SphereCentersDto {
        /**
         * Center points of the spheres
         */
        centers: number[][];
        /**
         * Radius of the spheres
         */
        radius: number;
        /**
         * Segment count
         */
        segments: number;
    }
    class TorusDto {
        /**
         * Center coordinate
         */
        center: number[];
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
    class TextDto {
        constructor(text?: string);
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
        xOffset: number;
        /**
         * Y offset of the text
         */
        yOffset: number;
        /**
         * Height of the text
         */
        height: number;
        /**
         * Space between lines
         */
        lineSpacing: number;
        /**
         * Space between letters
         */
        letterSpacing: number;
        /**
         * Align between left, center, right
         */
        align: JSCADTextAlignEnum;
        /**
         * Offset the extrusion
         */
        extrudeOffset: number;
    }
    class CylinderTextDto extends TextDto {
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
    class SphereTextDto extends TextDto {
        /**
         * Radius of the spheres
         */
        radius: number;
        /**
         * Segment subdivision for sphere
         */
        segments: number;
    }
    enum SolidCornerTypeEnum {
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
        chamfer = "chamfer"
    }
    enum JSCADTextAlignEnum {
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
        right = "right"
    }
}/**
 * Contains various functions for Solid booleans from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADBooleans {
    private readonly context;
    constructor(context: Context);
    /**
     * Intersect multiple solid mesh objects
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.jscadbooleans.html#intersect
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh
     */
    intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): any;
    /**
     * Subtract multiple solid mesh objects
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.jscadbooleans.html#subtract
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh
     */
    subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): any;
    /**
     * Union multiple solid mesh objects
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.jscadbooleans.html#union
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     */
    union(inputs: Inputs.JSCAD.BooleanObjectsDto): any;
}declare namespace Line {
    class LinePointsDto {
        /**
         * Provide options without default values
         */
        constructor(start?: number[], end?: number[]);
        /**
         * Start point
         */
        start: number[];
        /**
         * End point
         */
        end: number[];
    }
    class LineStartEndPointsDto {
        /**
         * Provide options without default values
         */
        constructor(startPoints?: number[][], endPoints?: number[][]);
        /**
         * Start points
         */
        startPoints: number[][];
        /**
         * End points
         */
        endPoints: number[][];
    }
    class DrawLineDto {
        /**
         * Provide options without default values
         */
        constructor(line?: LinePointsDto);
        /**
         * Line
         */
        line: LinePointsDto;
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Width of the line
         */
        width: number;
        /**
         * Indicates wether the position of this line will change in time
         */
        updatable: boolean;
        /**
         * Line mesh variable in case it already exists and needs updating
         */
        lineMesh?: LinesMesh;
    }
    class DrawLinesDto {
        /**
         * Provide options without default values
         */
        constructor(lines?: LinePointsDto[]);
        /**
         * Lines
         */
        lines: LinePointsDto[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Width of the line
         */
        width: number;
        /**
         * Indicates wether the position of these lines will change in time
         */
        updatable: boolean;
        /**
         * Line mesh variable in case it already exists and needs updating
         */
        linesMesh?: LinesMesh;
    }
    class PointsLinesDto {
        /**
         * Points
         */
        points: number[][];
    }
    class LineDto {
        /**
         * Line to convert
         */
        line: LinePointsDto;
    }
    class LinesDto {
        /**
         * Lines to convert
         */
        lines: LinePointsDto[];
    }
    class TransformLineDto {
        /**
         * Line to transform
         */
        line: LinePointsDto;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class TransformLinesDto {
        /**
         * Lines to transform
         */
        lines: LinePointsDto[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
}/**
 * Contains various functions for Solid expansions from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADExpansions {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Expand geometries of solid category
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_expansions.jscadexpansions.html#expand
     * @param inputs Contains options and geometries for expansion
     * @returns Expanded geometry
     */
    expand(inputs: Inputs.JSCAD.ExpansionDto): any | any[];
    /**
     * Offset 2d geometries of solid category
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_expansions.jscadexpansions.html#offset
     * @param inputs Contains options and geometries for offset
     * @returns Expanded geometry
     */
    offset(inputs: Inputs.JSCAD.ExpansionDto): any | any[];
}declare namespace Node {
    class NodeDto {
        /**
         * Transformation node
         */
        node: TransformNode;
    }
    class NodeTranslationDto extends NodeDto {
        /**
         * Direction vector expressed in [x, y, z] vector array
         */
        direction: number[];
        /**
         * Distance to translate
         */
        distance: number;
    }
    class NodeParentDto extends NodeDto {
        /**
         * Parent node
         */
        parentNode: TransformNode;
    }
    class NodeDirectionDto extends NodeDto {
        /**
         * Direction vector expressed in [x, y, z] vector array
         */
        direction: number[];
    }
    class NodePositionDto extends NodeDto {
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: number[];
    }
    class RotateNodeDto extends NodeDto {
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: number[];
        /**
         * The rotation angle expressed in degrees
         */
        angle: number;
    }
    class RotateAroundAxisNodeDto extends NodeDto {
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: number[];
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: number[];
        /**
         * The rotation angle expressed in degrees
         */
        angle: number;
    }
    class CreateNodeFromRotationDto {
        /**
         * Optional parent node
         */
        parent: TransformNode | null;
        /**
         * Oirigin of the node
         */
        origin: number[];
        /**
         * Rotations of the node around x y z axis
         */
        rotation: number[];
    }
    class DrawNodeDto extends NodeDto {
        /**
         * Provide options without default values
         */
        constructor(node?: TransformNode);
        /**
         * Hex encoded color string for X axis
         */
        colorX: string;
        /**
         * Hex encoded color string for Y axis
         */
        colorY: string;
        /**
         * Hex encoded color string for Z axis
         */
        colorZ: string;
        /**
         * Length of the node axis
         */
        size: number;
    }
    class DrawNodesDto {
        /**
         * Provide options without default values
         */
        constructor(nodes?: TransformNode[]);
        /**
         * Nodes that will be drawn
         */
        nodes: TransformNode[];
        /**
         * Hex encoded color string for X axis
         */
        colorX: string;
        /**
         * Hex encoded color string for Y axis
         */
        colorY: string;
        /**
         * Hex encoded color string for Z axis
         */
        colorZ: string;
        /**
         * Length of the node axis
         */
        size: number;
    }
}/**
 * Contains various functions for Solid extrusions from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADExtrusions {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Linear extrude 2D geometries of solid category
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.jscadextrusions.html#extrudelinear
     * @param inputs Contains options and geometries for linear extrude
     * @returns Extruded geometry
     */
    extrudeLinear(inputs: Inputs.JSCAD.ExtrudeLinearDto): any | any[];
    /**
     * Rectangular extrude 2D geometries of solid category. Creates a wall-type extrusion of certain height and size.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.jscadextrusions.html#extruderectangular
     * @param inputs Contains options and geometries for rectangular extrude
     * @returns Extruded geometry
     */
    extrudeRectangular(inputs: Inputs.JSCAD.ExtrudeRectangularDto): any | any[];
    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.jscadextrusions.html#extruderectangularpoints
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     */
    extrudeRectangularPoints(inputs: Inputs.JSCAD.ExtrudeRectangularPointsDto): any;
    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.jscadextrusions.html#extruderotate
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     */
    extrudeRotate(inputs: Inputs.JSCAD.ExtrudeRotateDto): any;
}declare namespace OCC {
    class DrawShapeDto {
        /**
         * Provide options without default values
         */
        constructor(shape?: any);
        /**
         * Brep OpenCascade geometry
         */
        shape: any;
        /**
         * Face opacity value between 0 and 1
         */
        faceOpacity: number;
        /**
         * Edge opacity value between 0 and 1
         */
        edgeOpacity: number;
        /**
         * Hex colour string for the edges
         */
        edgeColour: string;
        /**
         * Hex colour string for face colour
         */
        faceColour: string;
        /**
         * Edge width
         */
        edgeWidth: number;
        /**
         * You can turn off drawing of edges via this property
         */
        drawEdges: boolean;
        /**
         * You can turn off drawing of faces via this property
         */
        drawFaces: boolean;
        /**
         * Precision
         */
        precision: number;
        /**
         * Draw index of edges in space
         */
        drawEdgeIndexes: boolean;
        /**
         * Indicates the edge index height if they are drawn
         */
        edgeIndexHeight: number;
        /**
         * Edge index colour if the edges are drawn
         */
        edgeIndexColour: string;
        /**
         * Draw indexes of faces in space
         */
        drawFaceIndexes: boolean;
        /**
         * Indicates the edge index height if they are drawn
         */
        faceIndexHeight: number;
        /**
         * Edge index colour if the edges are drawn
         */
        faceIndexColour: string;
    }
    class PolygonDto {
        constructor(points?: number[][]);
        /**
         * Points points
         */
        points: number[][];
    }
    class BoxDto {
        constructor(width?: number, length?: number, height?: number, center?: number[]);
        /**
         * Width of the box
         */
        width: number;
        /**
         * Length of the box
         */
        length: number;
        /**
         * Height of the box
         */
        height: number;
        /**
         * Center of the box
         */
        center: number[];
    }
    class SphereDto {
        constructor(radius?: number, center?: number[]);
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Center of the sphere
         */
        center: number[];
    }
    class ConeDto {
        constructor(radius1?: number, radius2?: number, height?: number);
        /**
         * First radius of the cone
         */
        radius1: number;
        /**
         * Second radius of the cone
         */
        radius2: number;
        /**
         * Height of the cone
         */
        height: number;
    }
    class CylinderDto {
        /**
         * Radius of the cylinder
         */
        radius: number;
        /**
         * Height of the cylinder
         */
        height: number;
        /**
         * Center of the cylinder
         */
        center: number[];
    }
    class FilletDto {
        constructor(shape?: any, radius?: number, edgeList?: number[], all?: boolean);
        /**
         * Shape to apply the fillets
         */
        shape: any;
        /**
         * Radius of the fillets
         */
        radius: number;
        /**
         * List of edge indexes to which apply the fillet, if left empty all edges will be rounded
         */
        edgeList?: any[];
    }
    class ChamferDto {
        constructor(shape?: any, distance?: number, edgeList?: number[], all?: boolean);
        /**
         * Shape to apply the chamfer
         */
        shape: any;
        /**
         * Distance for the chamfer
         */
        distance: number;
        /**
         * List of edge indexes to which apply the chamfer, if left empty all edges will be chamfered
         */
        edgeList?: any[];
    }
    class BSplineDto {
        constructor(points?: number[][], closed?: boolean);
        /**
         * Points through which the BSpline will be created
         */
        points: number[][];
        /**
         * Indicates wether BSpline will be cloed
         */
        closed: boolean;
    }
    class BezierDto {
        constructor(points?: number[][], closed?: boolean);
        /**
         * Points through which the Bezier curve will be created
         */
        points: number[][];
        /**
         * Indicates wether Bezier will be cloed
         */
        closed: boolean;
    }
    class CircleDto {
        constructor(radius?: number, center?: number[]);
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: number[];
    }
    class LoftDto {
        constructor(shapes?: any[], makeSolid?: boolean);
        /**
         * Wires through which the loft passes
         */
        shapes: any[];
        /**
         * Tries to make a solid when lofting
         */
        makeSolid: boolean;
    }
    class OffsetDto {
        constructor(shape?: any, distance?: number, tolerance?: number);
        /**
         * Shape to offset
         */
        shape: any;
        /**
         * Distance of offset
         */
        distance: number;
        /**
         * Offset tolerance
         */
        tolerance: number;
    }
    class RevolveDto {
        constructor(shape?: any, degrees?: number, direction?: number[], copy?: boolean);
        /**
         * Shape to revolve
         */
        shape: any;
        /**
         * Angle degrees
         */
        angle: number;
        /**
         * Direction vector
         */
        direction: number[];
        /**
         * Copy original shape
         */
        copy: boolean;
    }
    class PipeDto {
        constructor(shape?: any, shapes?: number[]);
        /**
         * The wire path
         */
        shape: any;
        /**
         * Shapes along the path to be piped
         */
        shapes: any;
    }
    class ExtrudeDto {
        constructor(shape?: any, direction?: number[]);
        /**
         * Face to extrude
         */
        shape: any;
        /**
         * Direction vector for extrusion
         */
        direction: number[];
    }
    class UnionDto {
        constructor(shapes?: any[], keepEdges?: boolean);
        /**
         * Objects to be joined together
         */
        shapes: any[];
        /**
         * Keeps edges
         */
        keepEdges: boolean;
    }
    class DifferenceDto {
        constructor(shape?: any[], shapes?: any[], keepEdges?: boolean);
        /**
         * Object to subtract from
         */
        shape: any;
        /**
         * Objects to subtract
         */
        shapes: any[];
        /**
         * Keeps edges unaffected
         */
        keepEdges: boolean;
    }
    class IntersectionDto {
        constructor(shapes?: any[], keepEdges?: boolean);
        /**
         * Shapes to intersect
         */
        shapes: any[];
        /**
         * Keep the edges
         */
        keepEdges: boolean;
    }
    class ShapeDto {
        constructor(shape?: any[]);
        /**
         * Shape on which action should be performed
         */
        shape: any;
    }
    class ShapeIndexDto {
        constructor(shape?: any, index?: number);
        /**
         * Shape
         */
        shape: any;
        /**
         * Index of the entity
         */
        index: number;
    }
    class RotationExtrudeDto {
        constructor(shape?: any, height?: number, degrees?: number);
        /**
         * Wire to extrude by rotating
         */
        shape: any;
        /**
         * Height of rotation
         */
        height: number;
        /**
         * Rotation in degrees
         */
        angle: number;
    }
    class TransformDto {
        constructor(shape?: any, translation?: number[], rotationAxis?: number[], rotationDegrees?: number, scale?: number);
        /**
         * Shape to transform
         */
        shape: any;
        /**
         * Translation to apply
         */
        translation: number[];
        /**
         * Rotation to apply
         */
        rotationAxis: number[];
        /**
         * Rotation degrees
         */
        rotationAngle: number;
        /**
         * Scale factor to apply
         */
        scaleFactor: number;
    }
    class TranslateDto {
        constructor(shape?: any, translation?: number[]);
        /**
         * Shape for translation
         */
        shape: any;
        /**
         * Translation vector
         */
        translation: number[];
    }
    class RotateDto {
        constructor(shape?: any, axis?: number[], degrees?: number);
        /**
         * Shape to rotate
         */
        shape: any;
        /**
         * Axis on which to rotate
         */
        axis: number[];
        /**
         * Rotation degrees
         */
        angle: number;
    }
    class ScaleDto {
        constructor(shape?: any, scale?: number);
        /**
         * Shape to scale
         */
        shape: any;
        /**
         * Scale factor to apply
         */
        factor: number;
    }
    class SaveStepDto {
        constructor(shape?: any, filename?: string);
        /**
         * Shape to save
         */
        shape: any;
        /**
         * File name
         */
        filename: string;
    }
    class ImportStepIgesDto {
        constructor(assetName?: any);
        /**
         * The name of the asset to store in the cache.
         */
        assetName: string;
    }
    class ImportStepOrIgesDto {
        constructor(filetext?: any, filename?: string);
        /**
         * Shape to save
         */
        filetext: any;
        /**
         * File name
         */
        filename: string;
    }
    class CompoundShapesDto {
        constructor(shapes?: any[]);
        /**
         * Shapes to add to compound
         */
        shapes: any[];
    }
    class ThisckSolidSimpleDto {
        constructor(shape?: any, offset?: number);
        /**
         * Shape to make thick
         */
        shape: any;
        /**
         * Offset distance
         */
        offset: number;
    }
    class FaceFromWireDto {
        constructor(shape?: any, planar?: boolean);
        /**
         * Wire shape to convert into a face
         */
        shape: any;
        /**
         * Should plane be planar
         */
        planar: boolean;
    }
}/**
 * Contains various functions for Solid hulls from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADHulls {
    private readonly context;
    constructor(context: Context);
    /**
     * Hull chain connects solids or 2d geometries by filling an empty space in between objects in order.
     * Geometries need to be of the same type.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_hulls.jscadhulls.html#chainhull
     * @param inputs Geometries
     * @returns Chain hulled geometry
     */
    hullChain(inputs: Inputs.JSCAD.HullDto): any | any[];
    /**
     * Convex hull connects solids or 2d geometries by filling an empty space in between without following order.
     * Geometries need to be of the same type.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_hulls.jscadhulls.html#chainhull
     * @param inputs Geometries
     * @returns Hulled geometry
     */
    hull(inputs: Inputs.JSCAD.HullDto): any | any[];
}declare namespace Point {
    class PointDto {
        /**
         * Point
         */
        point: number[];
    }
    class PointsDto {
        /**
         * Points
         */
        points: number[][];
    }
    class DrawPointDto {
        /**
         * Provide options without default values
         */
        constructor(point?: number[]);
        /**
         * Point
         */
        point: number[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Size of the point
         */
        size: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Indicates wether the position of this point will change in time
         */
        updatable: boolean;
        /**
         * Point mesh variable in case it already exists and needs updating
         */
        pointMesh?: Mesh;
    }
    class DrawPointsDto {
        /**
         * Provide options without default values
         */
        constructor(points?: number[][]);
        /**
         * Point
         */
        points: number[][];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Size of the points
         */
        size: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Indicates wether the position of this point will change in time
         */
        updatable: boolean;
        /**
         * Points mesh variable in case it already exists and needs updating
         */
        pointsMesh?: Mesh;
    }
    class TransformPointDto {
        /**
         * Point to transform
         */
        point: number[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class TransformPointsDto {
        /**
         * Points to transform
         */
        points: number[][];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class ClosestPointFromPointsDto {
        /**
         * Points to transform
         */
        points: number[][];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        point: number[];
    }
    class StartEndPointsDto {
        /**
         * Start point
         */
        startPoint: number[];
        /**
         * End point
         */
        endPoint: number[];
    }
    class MultiplyPointDto {
        /**
         * Point for multiplication
         */
        point: number[];
        /**
         * Number of points to create in the list
         */
        amountOfPoints: number;
    }
    class SpiralDto {
        /**
         * Identifies phi angle
         */
        phi: number;
        /**
         * Identifies how many points will be created
         */
        numberPoints: number;
        /**
         * Widening factor of the spiral
         */
        widening: number;
        /**
         * Radius of the spiral
         */
        radius: number;
        /**
         * Factor of the spiral
         */
        factor: number;
    }
    class HexGridCentersDto {
        /**
         * Number of hexagons on Y direction
         */
        nrHexagonsY: number;
        /**
         * Number of Hexagons on Z direction
         */
        nrHexagonsX: number;
        /**
         * Total grid span
         */
        radiusHexagon: number;
    }
}/**
 * Contains various functions for Path from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADPath {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 2D path from a list of points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfrompoints
     * @param inputs Points and indication if we want a closed path or not
     * @returns Path
     */
    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): any;
    /**
     * Create a 2D path from a polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfrompolyline
     * @param inputs Polyline and indication if we want a closed path or not
     * @returns Path
     */
    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): any;
    /**
     * Create a 2D path from a curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfromcurve
     * @param inputs Curve and indication if we want a closed path or not
     * @returns Path
     */
    createFromCurve(inputs: Inputs.JSCAD.PathFromCurveDto): any;
    /**
     * Create empty 2D path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createempty
     * @returns Emprty path
     */
    createEmpty(): any;
    /**
     * Closes an open 2D path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#close
     * @param inputs Path
     * @returns Closed path
     */
    close(inputs: Inputs.JSCAD.PathDto): any;
    /**
     * Append the path with 2D points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendpoints
     * @param inputs Path to append and points
     * @returns Appended path
     */
    appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): any;
    /**
     * Append the path with polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendpolyline
     * @param inputs Path to append and polyline
     * @returns Appended path
     */
    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): any;
    /**
     * Append the path with the curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendcurve
     * @param inputs Path to append and a curve
     * @returns Appended path
     */
    appendCurve(inputs: Inputs.JSCAD.PathAppendCurveDto): any;
    /**
     * Append the arc to the path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendarc
     * @param inputs Path and arc parameters
     * @returns Appended path
     */
    appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): any;
    private removeDuplicatesAndCreateFromPoints;
}declare namespace Polyline {
    class PolylinePropertiesDto {
        /**
         * Provide options without default values
         */
        constructor(points?: number[][]);
        /**
         * Points of the polyline
         */
        points: number[][];
    }
    class PolylineDto {
        /**
         * Polyline with points
         */
        polyline: PolylinePropertiesDto;
    }
    class PolylinesDto {
        /**
         * Polylines array
         */
        polylines: PolylinePropertiesDto[];
    }
    class TransformPolylineDto {
        /**
         * Polyline to transform
         */
        polyline: PolylinePropertiesDto;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class DrawPolylineDto {
        /**
         * Provide options without default values
         */
        constructor(polyline?: PolylinePropertiesDto);
        /**
         * Polyline
         */
        polyline: PolylinePropertiesDto;
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Width of the polyline
         */
        width: number;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable: boolean;
        /**
         * Line mesh variable in case it already exists and needs updating
         */
        polylineMesh?: LinesMesh;
    }
    class DrawPolylinesDto {
        /**
         * Provide options without default values
         */
        constructor(polylines?: PolylinePropertiesDto[]);
        /**
         * Polylines
         */
        polylines: PolylinePropertiesDto[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Width of the polyline
         */
        width: number;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable: boolean;
        /**
         * Polyline mesh variable in case it already exists and needs updating
         */
        polylinesMesh?: LinesMesh;
    }
}/**
 * Contains various functions for Polygon from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADPolygon {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 2D polygon from a list of points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompoints
     * @param inputs Points
     * @returns Path
     */
    createFromPoints(inputs: Inputs.Point.PointsDto): any;
    /**
     * Create a 2D polygon from a polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompolyline
     * @param inputs Polyline
     * @returns Polygon
     */
    createFromPolyline(inputs: Inputs.Polyline.PolylineDto): any;
    /**
     * Create a 2D polygon from a curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfromcurve
     * @param inputs Nurbs curve
     * @returns Polygon
     */
    createFromCurve(inputs: Inputs.Verb.CurveDto): any;
    /**
     * Create a 2D polygon from a path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompath
     * @param inputs Path
     * @returns Polygon
     */
    createFromPath(inputs: Inputs.JSCAD.PathDto): any;
    /**
     * Create a 2D polygon circle
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#circle
     * @param inputs Circle parameters
     * @returns Circle polygon
     */
    circle(inputs: Inputs.JSCAD.CircleDto): any;
    /**
     * Create a 2D polygon ellipse
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#ellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse polygon
     */
    ellipse(inputs: Inputs.JSCAD.EllipseDto): any;
    /**
     * Create a 2D polygon rectangle
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#rectangle
     * @param inputs Rectangle parameters
     * @returns Rectangle polygon
     */
    rectangle(inputs: Inputs.JSCAD.RectangleDto): any;
    /**
     * Create a 2D rounded rectangle
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#roundedrectangle
     * @param inputs Rounded rectangle parameters
     * @returns Rounded rectangle polygon
     */
    roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): any;
    /**
     * Create a 2D polygon square
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#square
     * @param inputs Square parameters
     * @returns Square polygon
     */
    square(inputs: Inputs.JSCAD.SquareDto): any;
    /**
     * Create a 2D polygon star
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#star
     * @param inputs Star parameters
     * @returns Star polygon
     */
    star(inputs: Inputs.JSCAD.StarDto): any;
    private removeDuplicatesAndCreateFromPoints;
}declare namespace Scene {
    class SceneBackgroundColourDto {
        /**
         * Provide options without default values
         */
        constructor(colour?: string);
        /**
         * Hex colour string for the scene background colour
         */
        colour: string;
    }
    class SceneDrawGridMeshDto {
        /**
         * Width of the grid
         */
        width: number;
        /**
         * Height of the ground
         */
        height: number;
        /**
         * Ground subdivisions
         */
        subdivisions: number;
        /**
         * The frequency of thicker lines.
         */
        majorUnitFrequency: number;
        /**
         * The visibility of minor units in the grid.
         */
        minorUnitVisibility: number;
        /**
         * The scale of the grid compared to unit.
         */
        gridRatio: number;
        /**
         * The grid opacity outside of the lines.
         */
        opacity: number;
        /**
         * Cull the back faces
         */
        backFaceCulling: boolean;
        /**
         * Main color of the grid (e.g. between lines)
         */
        mainColor: string;
        /**
         * Color of the grid lines.
         */
        secondaryColor: string;
    }
    class PointLightDto {
        /**
         * Position of the point light
         */
        position: number[];
        /**
         * Intensity of the point light, value between 0 and 1
         */
        intensity: number;
        /**
         * Diffuse colour of the point light
         */
        diffuse: string;
        /**
         * Specular colour of the point light
         */
        specular: string;
        /**
         * Radius of the sphere mesh representing the light bulb. If 0 light gets created without the mesh
         */
        radius: number;
    }
    class CameraConfigurationDto {
        /**
         * Position of the point light
         */
        position: number[];
        /**
         * Lets configure how far the camera can see
         */
        maxZ: number;
        /**
         * Panning sensibility. If large units are used for the model, this number needs to get larger
         */
        panningSensibility: number;
        /**
         * Zoom precision of the wheel. If large units are used, this number needs to get smaller
         */
        wheelPrecision: number;
    }
    class MeshInstanceAndTransformDto {
        mesh: Mesh;
        position: number[];
        rotation: number[];
        scaling: number[];
    }
}/**
 * Contains various functions for solid 3D shapes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADShapes {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 3D cube shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cube
     * @param inputs Cube parameters
     * @returns Cube solid
     */
    cube(inputs: Inputs.JSCAD.CubeDto): any;
    /**
     * Create a 3D cubes on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cubesoncenterpoints
     * @param inputs Cube with multiple center points parameters
     * @returns List of cube solids
     */
    cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): any[];
    /**
     * Create a 3D cuboid shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cuboid
     * @param inputs Cuboid parameters
     * @returns Cuboid solid
     */
    cuboid(inputs: Inputs.JSCAD.CuboidDto): any;
    /**
     * Create a 3D cuboids on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cuboidsoncenterpoints
     * @param inputs Cuboids with multiple center point parameters
     * @returns List of cuboid solids
     */
    cuboidsOnCenterPoints(inputs: Inputs.JSCAD.CuboidCentersDto): any[];
    /**
     * Create a 3D elliptic cylinder solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cylinderelliptic
     * @param inputs Elliptic cylinder parameters
     * @returns Elliptic cylinder solid
     */
    cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): any;
    /**
     * Create a 3D elliptic cylinders on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cylinderellipticoncenterpoints
     * @param inputs Elliptic cylinders with multiple center point parameters
     * @returns List of elliptic cylinders solids
     */
    cylinderEllipticOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersEllipticDto): any[];
    /**
     * Create a 3D cylinder solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cylinder
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     */
    cylinder(inputs: Inputs.JSCAD.CylidnerDto): any;
    /**
     * Create a 3D cylinders on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cylinderoncenterpoints
     * @param inputs Cylinders with multiple center point parameters
     * @returns List of cylinder solids
     */
    cylindersOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersDto): any[];
    /**
     * Create a 3D ellipsoid solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#ellipsoid
     * @param inputs Ellipsoid parameters
     * @returns Ellipsoid solid
     */
    ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): any;
    /**
     * Create a 3D ellipsoids on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#ellipsoidsoncenterpoints
     * @param inputs Ellipsoid parameters with multiple center points
     * @returns List of ellipsoid solids
     */
    ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): any[];
    /**
     * Create a 3D geodesic sphere solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#geodesicsphere
     * @param inputs Geodesic sphere parameters
     * @returns Geodesic sphere solid
     */
    geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): any;
    /**
     * Create a 3D geodesic spheres on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#geodesicspheresoncenterpoints
     * @param inputs Geodesic sphere parameters with multiple center points
     * @returns List of geodesic spheres
     */
    geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): any[];
    /**
     * Create a 3D rounded cuboid solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#roundedcuboid
     * @param inputs Rounded cuboid parameters
     * @returns Rounded cuboid solid
     */
    roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): any;
    /**
     * Create a 3D rounded cuboids on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#roundedcuboidsoncenterpoints
     * @param inputs Rounded cuboids parameters with multiple center points
     * @returns List of rounded cuboids
     */
    roundedCuboidsOnCenterPoints(inputs: Inputs.JSCAD.RoundedCuboidCentersDto): any[];
    /**
     * Create a 3D rounded cylinder solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#roundedcylinder
     * @param inputs Rounded cylinder parameters
     * @returns Rounded cylinder solid
     */
    roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): any;
    /**
     * Create a 3D rounded cylinders on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#roundedcylindersoncenterpoints
     * @param inputs Rounded cylinders parameters with multiple center points
     * @returns List of rounded cylinders
     */
    roundedCylindersOnCenterPoints(inputs: Inputs.JSCAD.RoundedCylidnerCentersDto): any[];
    /**
     * Create a 3D sphere solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#sphere
     * @param inputs Sphere parameters
     * @returns Sphere solid
     */
    sphere(inputs: Inputs.JSCAD.SphereDto): any;
    /**
     * Create a 3D sphere on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#spheresoncenterpoints
     * @param inputs Sphere parameters with multiple center points
     * @returns List of spheres
     */
    spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): any[];
    /**
     * Create a 3D torus solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#torus
     * @param inputs Torus parameters
     * @returns Torus solid
     */
    torus(inputs: Inputs.JSCAD.TorusDto): any;
}declare namespace Tag {
    class DrawTagDto {
        constructor(tag?: TagDto);
        /**
         * Text tag to draw
         */
        tag: TagDto;
        /**
         * Indicates that it is updatable tag
         */
        updatable: boolean;
        /**
         * Optional existing tag in case it needs updating
         */
        tagVariable?: TagDto;
    }
    class DrawTagsDto {
        constructor(tags?: TagDto[]);
        /**
         * Text tag to draw
         */
        tags: TagDto[];
        /**
         * Indicates that it is updatable tag
         */
        updatable: boolean;
        /**
         * Optional existing tag in case it needs updating
         */
        tagsVariable?: TagDto[];
    }
    /**
     * Class representing a tag
     * @link https://docs.bitbybit.dev/classes_api_inputs_tag_inputs.tag.tagdto.html
     */
    class TagDto {
        constructor(text?: string);
        /**
         * Text of the tag
         */
        text: string;
        /**
         * Position of the tag
         */
        position: number[];
        /**
         * Colour of the tag
         */
        colour: string;
        /**
         * Text size
         */
        size: number;
        /**
         * Make tags that are further away smaller
         */
        adaptDepth: boolean;
        /**
         * Indicates if tag needs updating
         */
        needsUpdate?: boolean;
        /**
         * Unique id of the tag
         */
        id?: string;
    }
}/**
 * Contains various functions for solid 3D texts from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADText {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates a text that is based on chain hulling cylinders
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_text.jscadtext.html#cylindricaltext
     * @param inputs Cylindrical text parameters
     * @returns List of solids for text
     */
    cylindricalText(inputs: Inputs.JSCAD.CylinderTextDto): any[];
    /**
     * Creates a text that is based on chain hulling spheres
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_text.jscadtext.html#sphericalText
     * @param inputs Spherical text parameters
     * @returns List of solids for text
     */
    sphericalText(inputs: Inputs.JSCAD.SphereTextDto): any[];
    private adjustTextToBeOnCenter;
    createVectorText(inputs: Inputs.JSCAD.TextDto): number[][];
}declare namespace Transforms {
    class RotationCenterAxisDto {
        /**
         * Angle of rotation in degrees
         */
        angle: number;
        /**
         * Axis vector for rotation
         */
        axis: number[];
        /**
         * The center from which the axis is pointing
         */
        center: number[];
    }
    class RotationCenterDto {
        /**
         * Angle of rotation in degrees
         */
        angle: number;
        /**
         * The center from which the axis is pointing
         */
        center: number[];
    }
    class RotationCenterYawPitchRollDto {
        /**
         * Yaw angle (Rotation around X) in degrees
         */
        yaw: number;
        /**
         * Pitch angle (Rotation around Y) in degrees
         */
        pitch: number;
        /**
         * Roll angle (Rotation around Z) in degrees
         */
        roll: number;
        /**
         * The center from which the rotations are applied
         */
        center: number[];
    }
    class ScaleXYZDto {
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         */
        scaleXyz: number[];
    }
    class ScaleCenterXYZDto {
        /**
         * The center from which the scaling is applied
         */
        center: number[];
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         */
        scaleXyz: number[];
    }
    class UniformScaleDto {
        /**
         * Uniform scale factor for all x, y, z directions. 1 will keep everything on original size, 2 will scale 200%;
         */
        scale: number;
    }
    class UniformScaleFromCenterDto {
        /**
         * Scale factor for all x, y, z directions. 1 will keep everything on original size, 2 will scale 200%;
         */
        scale: number;
        /**
         * Center position of the scaling
         */
        center: number[];
    }
    class TranslationXYZDto {
        /**
         * Translation vector with [x, y, z] distances
         */
        translation: number[];
    }
}/**
 * Contains various functions for Solid meshes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCAD {
    readonly booleans: JSCADBooleans;
    readonly expansions: JSCADExpansions;
    readonly extrusions: JSCADExtrusions;
    readonly hulls: JSCADHulls;
    readonly path: JSCADPath;
    readonly polygon: JSCADPolygon;
    readonly shapes: JSCADShapes;
    readonly text: JSCADText;
    private readonly context;
    private readonly geometryHelper;
    constructor(booleans: JSCADBooleans, expansions: JSCADExpansions, extrusions: JSCADExtrusions, hulls: JSCADHulls, path: JSCADPath, polygon: JSCADPolygon, shapes: JSCADShapes, text: JSCADText, context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single solids
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawsolidorpolygonmesh
     * @param inputs Contains a solid or polygon and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto): Mesh;
    /**
     * Draws multiple solids
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawsolidorpolygonmeshes
     * @param inputs Contains solids or polygons and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidsMeshDto): Mesh;
    /**
     * Draws a 2D path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawpath
     * @param inputs Contains a path and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawPath(inputs: Inputs.JSCAD.DrawPathDto): LinesMesh;
    /**
     * Transforms the Jscad solid meshes with a given list of transformations.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#transformsolids
     * @param inputs Solids with the transformation matrixes
     * @returns Solids with a transformation
     */
    transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): any;
    /**
     * Transforms the Jscad solid mesh with a given list of transformations.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#transformsolid
     * @param inputs Solid with the transformation matrixes
     * @returns Solid with a transformation
     */
    transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): any;
    /**
     * Downloads the binary STL file from a 3D solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#downloadsolidstl
     * @param inputs 3D Solid
     */
    downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): void;
    /**
     * Downloads the binary STL file from a 3D solids
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#downloadsolidsstl
     * @param inputs 3D Solid
     */
    downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): void;
    private downloadSTL;
    private createMesh;
}declare namespace Vector {
    class TwoVectorsDto {
        /**
         * First vector
         */
        first: number[];
        /**
         * Second vector
         */
        second: number[];
    }
    class VectorBoolDto {
        /**
         * Vector of booleans
         */
        vector: boolean[];
    }
    class VectorDto {
        /**
         * Vector array of numbers
         */
        vector: number[];
    }
    class RangeMaxDto {
        /**
         * Maximum range boundary
         */
        max: number;
    }
    class SpanDto extends BaseTypes.IntervalDto {
        /**
         * Step of the span
         */
        step: number;
    }
    class RayPointDto extends VectorDto {
        /**
         * Origin location of the ray
         */
        point: number[];
        /**
         * Distance to the point on the ray
         */
        distance: number;
    }
    class VectorsDto {
        /**
         * Vectors array
         */
        vectors: number[][];
    }
    class FractionTwoVectorsDto extends TwoVectorsDto {
        /**
         * Fraction number
         */
        fraction: number;
    }
    class VectorScalarDto extends VectorDto {
        /**
         * Scalar number
         */
        scalar: number;
    }
    class TwoVectorsReferenceDto extends TwoVectorsDto {
        /**
         * Reference vector
         */
        reference: number[];
    }
}/**
 * Contains various methods for lines. Line in bitbybit is a simple object that has star and end point properties.
 * { start: [ x, y, z ], end: [ x, y, z ] }
 */
declare class Line {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#drawline
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLine(inputs: Inputs.Line.DrawLineDto): LinesMesh;
    /**
     * Draws multiple lines
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#drawlines
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLines(inputs: Inputs.Line.DrawLinesDto): LinesMesh;
    /**
     * Converts a line to a NURBS line curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#converttonurbscurve
     * Returns the verbnurbs Line object
     * @link http://verbnurbs.com/docs/geom/Line/
     * @param inputs Line to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Line.LineDto): any;
    /**
     * Converts lines to a NURBS curves
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#convertlinestonurbscurves
     * Returns array of the verbnurbs Line objects
     * @link http://verbnurbs.com/docs/geom/Line/
     * @param inputs Lines to be transformed to curves
     * @returns Verb nurbs curves
     */
    convertLinesToNurbsCurves(inputs: Inputs.Line.LinesDto): any[];
    /**
     * Gets the start point of the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#getstartpoint
     * @param inputs Line to be queried
     * @returns Start point
     */
    getStartPoint(inputs: Inputs.Line.LineDto): number[];
    /**
     * Gets the end point of the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#getendpoint
     * @param inputs Line to be queried
     * @returns End point
     */
    getEndPoint(inputs: Inputs.Line.LineDto): number[];
    /**
     * Gets the length of the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#length
     * @param inputs Line to be queried
     * @returns Length of the line
     */
    length(inputs: Inputs.Line.LineDto): number;
    /**
     * Reverse the endpoints of the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#reverse
     * @param inputs Line to be reversed
     * @returns Reversed line
     */
    reverse(inputs: Inputs.Line.LineDto): Inputs.Line.LinePointsDto;
    /**
     * Transform the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#transformline
     * @param inputs Line to be transformed
     * @returns Transformed line
     */
    transformLine(inputs: Inputs.Line.TransformLineDto): Inputs.Line.LinePointsDto;
    /**
     * Create the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#create
     * @param inputs Endpoints of the line
     * @returns Line
     */
    create(inputs: Inputs.Line.LinePointsDto): Inputs.Line.LinePointsDto;
    /**
     * Create the line segments between all of the points in a list
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#linesbetweenpoints
     * @param inputs Lines in a list
     * @returns Lines
     */
    linesBetweenPoints(inputs: Inputs.Line.PointsLinesDto): Inputs.Line.LinePointsDto[];
    /**
     * Create the lines between two lists of start and end points of equal length
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#linesbetweenstartandendpoints
     * @param inputs Two lists of start and end points
     * @returns Lines
     */
    linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Line.LinePointsDto[];
    private createLineSystemMesh;
}declare namespace Verb {
    class CurveDto {
        /**
         * Nurbs curve
         */
        curve: any;
    }
    class CurvesDto {
        /**
         * Nurbs curves
         */
        curves: any[];
    }
    class ClosestPointDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Point
         */
        point: number[];
    }
    class ClosestPointsDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Points
         */
        points: number[][];
    }
    class BezierCurveDto {
        /**
         * Control points
         */
        points: number[][];
        /**
         * Weights
         */
        weights: number[];
    }
    class DrawCurveDto {
        /**
         * Provide options without default values
         */
        constructor(curve?: any);
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Width of the polyline
         */
        width: number;
        /**
         * Indicates wether the position of this curve will change in time
         */
        updatable: boolean;
        /**
         * Curve mesh variable in case it already exists and needs updating
         */
        curveMesh?: LinesMesh;
    }
    class CurveParameterDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Parameter on the curve
         */
        parameter: number;
    }
    class CurvesParameterDto {
        /**
         * Nurbs curve
         */
        curves: any;
        /**
         * Parameter on the curve
         */
        parameter: number;
    }
    class CurveTransformDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class CurvesTransformDto {
        /**
         * Nurbs curve
         */
        curves: any[];
        /**
         * Transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class CurveToleranceDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Optional tolerance
         */
        tolerance: number;
    }
    class CurveLengthToleranceDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Length on the curve
         */
        length: number;
        /**
         * Tolerance
         */
        tolerance: number;
    }
    class CurveDerivativesDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Number of derivatives
         */
        numDerivatives: number;
        /**
         * Parameter on the curve
         */
        parameter: number;
    }
    class CurveSubdivisionsDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Number of subdivisions
         */
        subdivision: number;
    }
    class CurvesSubdivisionsDto {
        /**
         * Nurbs curves
         */
        curves: any[];
        /**
         * Number of subdivisions
         */
        subdivision: number;
    }
    class CurvesDivideLengthDto {
        /**
         * Nurbs curves
         */
        curves: any[];
        /**
         * Length of subdivisions
         */
        length: number;
    }
    class CurveDivideLengthDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Length of subdivisions
         */
        length: number;
    }
    class DrawCurvesDto {
        /**
         * Provide options without default values
         */
        constructor(curves?: any[]);
        /**
         * Nurbs curves
         */
        curves: any[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Width of the polyline
         */
        width: number;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable: boolean;
        /**
         * Curve mesh variable in case it already exists and needs updating
         */
        curvesMesh?: LinesMesh;
    }
    class CurveNurbsDataDto {
        /**
         * Nurbs curve degree
         */
        degree: number;
        /**
         * Weights that identify strength that attracts curve to control points
         */
        weights: number[];
        /**
         * Knots of the Nurbs curve
         */
        knots: number[];
        /**
         * Control points of the nurbs curve
         */
        points: number[][];
    }
    class CurvePathDataDto {
        /**
         * Nurbs curve degree
         */
        degree: number;
        /**
         * Control points of the nurbs curve
         */
        points: number[][];
    }
    class EllipseDto {
        /**
         * Nurbs ellipse
         */
        ellipse: any;
    }
    class CircleDto {
        /**
         * Nurbs circle
         */
        circle: any;
    }
    class ArcDto {
        /**
         * Nurbs arc
         */
        arc: any;
    }
    class EllipseParametersDto {
        /**
         * X axis of the circle
         */
        xAxis: number[];
        /**
         * Y axis of the circle
         */
        yAxis: number[];
        /**
         * Center of the circle
         */
        center: number[];
    }
    class CircleParametersDto {
        /**
         * X axis of the circle
         */
        xAxis: number[];
        /**
         * Y axis of the circle
         */
        yAxis: number[];
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: number[];
    }
    class ArcParametersDto extends CircleParametersDto {
        /**
         * Minimum angle in degrees
         */
        minAngle: number;
        /**
         * Maximum angle in degrees
         */
        maxAngle: number;
    }
    class EllipseArcParametersDto extends EllipseParametersDto {
        /**
         * Minimum angle in degrees
         */
        minAngle: number;
        /**
         * Maximum angle in degrees
         */
        maxAngle: number;
    }
    class SurfaceDto {
        /**
         * Nurbs surface
         */
        surface: any;
    }
    class SurfaceTransformDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Transformations
         */
        matrix: number[][] | number[][][];
    }
    class SurfaceParameterDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Parameter on the surface
         */
        parameter: number;
        /**
         * Default parameter is on U direction, use V to switch
         */
        useV: boolean;
    }
    class IsocurvesParametersDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Parameter on the surface
         */
        parameters: number[];
        /**
         * Default parameter is on U direction, use V to switch
         */
        useV: boolean;
    }
    class IsocurveSubdivisionDto {
        /**
         * Provide undefined options
         */
        constructor(surface?: any, isocurveSegments?: number);
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Default parameter is on U direction, use V to switch
         */
        useV: boolean;
        /**
         * Check to include the last isocurve
         */
        includeLast: boolean;
        /**
         * Check to include the first isocurve
         */
        includeFirst: boolean;
        /**
         * Number of segments including surface start and end
         */
        isocurveSegments: number;
    }
    class DerivativesDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * U coordinate
         */
        u: number;
        /**
         * V coordinate
         */
        v: number;
        /**
         * Number of derivatives
         */
        numDerivatives: number;
    }
    class SurfaceLocationDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * U coordinate
         */
        u: number;
        /**
         * V coordinate
         */
        v: number;
    }
    class CornersDto {
        /**
         * Corner 1
         */
        point1: number[];
        /**
         * Corner 2
         */
        point2: number[];
        /**
         * Corner 3
         */
        point3: number[];
        /**
         * Corner 4
         */
        point4: number[];
    }
    class SurfaceParamDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Point
         */
        point: number[];
    }
    class KnotsControlPointsWeightsDto {
        /**
         * U direction degree
         */
        degreeU: number;
        /**
         * V direction degree
         */
        degreeV: number;
        /**
         * U direction knots
         */
        knotsU: number[];
        /**
         * V direction knots
         */
        knotsV: number[];
        /**
         * Points
         */
        points: number[][];
        /**
         * Weights
         */
        weights: number[];
    }
    class LoftCurvesDto {
        /**
         * V direction degree
         */
        degreeV: number;
        /**
         * Nurbs curves
         */
        curves: any[];
    }
    class DrawSurfaceDto {
        /**
         * Provide options without default values
         */
        constructor(surface?: any);
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Indicates wether the position of this surface will change in time
         */
        updatable: boolean;
        /**
         * Surface mesh variable in case it already exists and needs updating
         */
        surfaceMesh?: Mesh;
    }
    class DrawSurfacesDto {
        /**
         * Provide options without default values
         */
        constructor(surfaces?: any[]);
        /**
         * Nurbs surfaces
         */
        surfaces: any[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Indicates wether the position of these surfaces will change in time
         */
        updatable: boolean;
        /**
         * Surfaces mesh variable in case it already exists and needs updating
         */
        surfacesMesh?: Mesh;
    }
    class DrawSurfacesColoursDto {
        /**
         * Provide options without default values
         */
        constructor(surfaces?: any[], colours?: string[]);
        /**
         * Nurbs surfaces
         */
        surfaces: any[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour strings, there has to be a colour for every single surface and lengths of arrays need to match
         */
        colours: string[];
        /**
         * Indicates wether the position of these surfaces will change in time
         */
        updatable: boolean;
        /**
         * Surfaces mesh variable in case it already exists and needs updating
         */
        surfacesMesh?: Mesh;
    }
    class ConeAndCylinderParametersDto {
        /**
         * Defines main axis of the cone
         */
        axis: number[];
        /**
         * X axis of the cone
         */
        xAxis: number[];
        /**
         * Base point for the cone
         */
        base: number[];
        /**
         * Height of the cone
         */
        height: number;
        /**
         * Radius of the cone
         */
        radius: number;
    }
    class ConeDto {
        /**
         * Conical Nurbs surface
         */
        cone: any;
    }
    class CylinderDto {
        /**
         * Cylindrical Nurbs surface
         */
        cylinder: any;
    }
    class ExtrusionParametersDto {
        /**
         * Profile Nurbs curve
         */
        profile: any;
        /**
         * Direction vector
         */
        direction: number[];
    }
    class ExtrusionDto {
        /**
         * Nurbs surface created through extrusion
         */
        extrusion: any;
    }
    class SphericalParametersDto {
        /**
         * Radius of the sphere
         */
        radius: any;
        /**
         * Center point
         */
        center: number[];
    }
    class SphereDto {
        /**
         * Spherical Nurbs surface
         */
        sphere: any;
    }
    class RevolutionParametersDto {
        /**
         * Profile Nurbs curve
         */
        profile: any;
        /**
         * Center point
         */
        center: number[];
        /**
         * Axis around which rotation will happen
         */
        axis: number[];
        /**
         * Angle at which to rotate in degrees
         */
        angle: number;
    }
    class RevolutionDto {
        /**
         * Revolved Nurbs surface
         */
        revolution: any;
    }
    class SweepParametersDto {
        /**
         * Profile Nurbs curve
         */
        profile: any;
        /**
         * Rail Nurbs curve
         */
        rail: any;
    }
    class SweepDto {
        /**
         * Revolved Nurbs surface
         */
        sweep: any;
    }
    class CurveCurveDto {
        /**
         * First Nurbs curve
         */
        firstCurve: any;
        /**
         * Second Nurbs curve
         */
        secondCurve: number[];
        /**
         * Optional tolerance parameter
         */
        tolerance?: number;
    }
    class CurveSurfaceDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Optional tolerance parameter
         */
        tolerance?: number;
    }
    class SurfaceSurfaceDto {
        /**
         * Nurbs curve
         */
        firstSurface: any;
        /**
         * Nurbs surface
         */
        secondSurface: any;
        /**
         * Optional tolerance parameter
         */
        tolerance?: number;
    }
    class CurveCurveIntersectionsDto {
        /**
         * Curve curve intersections
         */
        intersections: BaseTypes.CurveCurveIntersection[];
    }
    class CurveSurfaceIntersectionsDto {
        /**
         * Curve curve intersections
         */
        intersections: BaseTypes.CurveSurfaceIntersection[];
    }
}`;
