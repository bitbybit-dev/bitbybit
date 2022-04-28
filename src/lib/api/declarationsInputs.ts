export const inputDeclarations = `declare namespace Asset {
    class GetAssetDto {
        /**
         * Provide options without default values
         */
        constructor(fileName?: string);
        /**
         * The fileName associated with the projects asset
         */
        fileName: string;
    }
    class AssetFileDto {
        constructor(assetFile?: File);
        assetFile: File;
    }
}declare namespace BabylonIO {
    class ExportSceneDto {
        /**
         * File name that should be used for the scene.
         */
        filename: string;
    }
    class ExportMeshToStlDto {
        /**
         * Mesh or meshes to export
         */
        mesh: Mesh;
        /**
         * File name that should be used for the scene.
         */
        filename: string;
    }
}declare namespace BabylonMesh {
    class UpdateDrawnBabylonMesh {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh;
        /**
         * Position to place the mesh into
         */
        position: Base.Point3;
        /**
         * Rotation for the mesh
         */
        rotation: Base.Vector3;
        /**
         * Scale mesh to certain value
         */
        scaling: Base.Vector3;
        /**
         * Colours or a single colour to change
         */
        colours: string | string[];
    }
    class SetParentDto {
        /**
         * BabylonJS Mesh that needs to change it's parent
         */
        babylonMesh: Mesh | InstancedMesh | AbstractMesh;
        /**
         * BabylonJS Mesh to use as a parent
         */
        parentMesh: Mesh | InstancedMesh | AbstractMesh;
    }
    class UpdateDrawnBabylonMeshPositionDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Position to place the mesh into
         */
        position: Base.Point3;
    }
    class UpdateDrawnBabylonMeshRotationDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Rotation for the mesh
         */
        rotation: Base.Vector3;
    }
    class UpdateDrawnBabylonMeshScaleDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Scale for the mesh
         */
        scale: Base.Vector3;
    }
    class BabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
    }
    class TranslateBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * distance to translate
         */
        distance: number;
    }
    class RotateBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * rotate to translate
         */
        rotate: number;
    }
    class SetMeshVisibilityDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Shows mesh if 0 and shows if 1
         */
        visibility: number;
    }
    class MeshInstanceAndTransformDto {
        mesh: Mesh;
        position: Base.Point3;
        rotation: Base.Vector3;
        scaling: Base.Vector3;
    }
    class MeshInstanceDto {
        mesh: Mesh;
    }
}declare namespace Base {
    type Point2 = [number, number];
    type Vector2 = [number, number];
    type Point3 = [number, number, number];
    type Vector3 = [number, number, number];
}declare namespace Draw {
    class DrawAny {
        /**
         * Entity to be drawn - can be a single or multiple points, lines, polylines, verb curves, verb surfaces, jscad meshes, jscad polygons, jscad paths, occt shapes, tags, nodes
         */
        entity: any;
        /**
         * Entity to be used when updating
         */
        babylonMesh?: any;
        /**
         * Options that help you control how your drawn objects look like. This property is optional. In order to pick the right option you need to know which entity you are going to draw. For example if you draw points, lines, polylines or jscad meshes you can use basic geometry options, but if you want to draw OCCT shapes, use OCCT options.
         */
        options: DrawBasicGeometryOptions | DrawOcctShapeOptions | DrawNodeOptions;
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
    /**
     * Draw options for basic geometry types like points, lines, polylines, surfaces and jscad meshes
     * @link https://docs.bitbybit.dev/classes/inputs_draw_inputs.draw.drawbasicgeometryoptions.html
     */
    class DrawBasicGeometryOptions {
        /**
         * Basic geometry colours to use for lines, points, polylines, surfaces, jscad meshes.
         */
        colours: string | string[];
        /**
         * Size affect how big the drawn points are and how wide lines are.
         */
        size: number;
        /**
         * Opacity of the point 0 to 1
         */
        opacity: number;
        /**
         * If geometry needs to be updated later
         */
        updatable: boolean;
    }
    /**
     * Draw options for Nodes
     * @link https://docs.bitbybit.dev/classes/inputs_draw_inputs.draw.drawnodeoptions.html
     */
    class DrawNodeOptions {
        /**
         * X Axis colour
         */
        colorX: string;
        /**
         * Y Axis colour
         */
        colorY: string;
        /**
         * Z Axis colour
         */
        colorZ: string;
        /**
         * Length of the node axis
         */
        size: number;
    }
    /**
     * Draw options for OCCT shapes
     * @link https://docs.bitbybit.dev/classes/inputs_draw_inputs.draw.drawocctshapeoptions.html
     */
    class DrawOcctShapeOptions {
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
    enum drawingTypes {
        point = 0,
        points = 1,
        line = 2,
        lines = 3,
        node = 4,
        nodes = 5,
        polyline = 6,
        polylines = 7,
        verbCurve = 8,
        verbCurves = 9,
        verbSurface = 10,
        verbSurfaces = 11,
        jscadMesh = 12,
        jscadMeshes = 13,
        occt = 14,
        tag = 15,
        tags = 16
    }
}* from './vector-inputs';
* from './scene-inputs';
* from './babylon-io-inputs';
* from './node-inputs';
* from './transforms-inputs';
* from './point-inputs';
* from './line-inputs';
* from './polyline-inputs';
* from './verb-inputs';
* from './jscad-inputs';
* from './tag-inputs';
* from './occ-inputs';
* from './asset-inputs';
* from './base-inputs';
* from './draw-inputs';
* from './babylon-mesh-inputs';
* from './time-inputs';* from './vector-inputs';
* from './scene-inputs';
* from './babylon-io-inputs';
* from './node-inputs';
* from './transforms-inputs';
* from './point-inputs';
* from './line-inputs';
* from './polyline-inputs';
* from './verb-inputs';
* from './jscad-inputs';
* from './tag-inputs';
* from './occ-inputs';
* from './asset-inputs';
* from './base-inputs';
* from './draw-inputs';
* from './babylon-mesh-inputs';
* from './time-inputs';declare namespace JSCAD {
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
        colours: string | string[];
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable: boolean;
        /**
         * Solid mesh variable in case it already exists and needs updating
         */
        jscadMesh?: Mesh;
    }
    class DrawSolidMeshesDto {
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
        colours: string | string[];
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
        meshes: any[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class TransformSolidDto {
        /**
         * Solid to be transformed
         */
        mesh: any;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class DownloadSolidDto {
        /**
         * Solid to be downloaded
         */
        mesh: any;
        /**
         * File name
         */
        fileName: string;
    }
    class DownloadSolidsDto {
        /**
         * Solids to be downloaded
         */
        meshes: any[];
        /**
         * File name
         */
        fileName: string;
    }
    class BooleanObjectsDto {
        /**
         * Contains solid Jscad mesh objects that will be used to perform boolean operation
         */
        meshes: any[];
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
        meshes: any[];
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
        points: Base.Point3[];
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
        points: Base.Point3[];
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
    class EllipseDto {
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
    class SquareDto {
        /**
         * Center of the 2D square
         */
        center: Base.Point3;
        /**
         * Size of the square
         */
        size: number;
    }
    class RectangleDto {
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
    class CubeDto {
        /**
         * Center coordinates of the cube
         */
        center: Base.Point3;
        /**
         * Size of the cube
         */
        size: number;
    }
    class CubeCentersDto {
        /**
         * Center coordinates of the cubes
         */
        centers: Base.Point3[];
        /**
         * Size of the cube
         */
        size: number;
    }
    class CuboidDto {
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
    class CuboidCentersDto {
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
    class CylidnerCentersEllipticDto {
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
    class CylidnerDto {
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
    class EllipsoidCentersDto {
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
        center: Base.Point3;
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
        centers: Base.Point3[];
    }
    class CylidnerCentersDto {
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
    class SphereCentersDto {
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
    class TorusDto {
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
}declare namespace Line {
    class LinePointsDto {
        /**
         * Provide options without default values
         */
        constructor(start?: Base.Point3, end?: Base.Point3);
        /**
         * Start point
         */
        start: Base.Point3;
        /**
         * End point
         */
        end: Base.Point3;
    }
    class LineStartEndPointsDto {
        /**
         * Provide options without default values
         */
        constructor(startPoints?: Base.Point3[], endPoints?: Base.Point3[]);
        /**
         * Start points
         */
        startPoints: Base.Point3[];
        /**
         * End points
         */
        endPoints: Base.Point3[];
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
        colours: string | string[];
        /**
         * Width of the line
         */
        size: number;
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
        colours: string | string[];
        /**
         * Width of the line
         */
        size: number;
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
        points: Base.Point3[];
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
}declare namespace BabylonNode {
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
        direction: Base.Vector3;
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
        position: Base.Point3;
    }
    class RotateNodeDto extends NodeDto {
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: Base.Vector3;
        /**
         * The rotation angle expressed in degrees
         */
        angle: number;
    }
    class RotateAroundAxisNodeDto extends NodeDto {
        /**
         * Position vector expressed in [x, y, z] vector array
         */
        position: Base.Point3;
        /**
         * Rotate around the axis expressed in [x, y, z] vector array
         */
        axis: Base.Vector3;
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
        origin: Base.Point3;
        /**
         * Rotations of the node around x y z axis
         */
        rotation: Base.Vector3;
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
}declare namespace OCCT {
    enum JoinTypeEnum {
        arc = "arc",
        intersection = "intersection",
        tangent = "tangent"
    }
    class ShapesDto {
        constructor(shapes?: any);
        /**
         * The shapes
         */
        shapes?: any;
    }
    class FilletTwoEdgesInPlaneDto extends ShapesDto {
        /**
         * First edge to fillet
         */
        edge1: any;
        /**
         * Second edge to fillet
         */
        edge2: any;
        /**
         * Plane origin that is also used to find the closest solution if two solutions exist.
         */
        planeOrigin: Base.Point3;
        /**
         * Plane direction for fillet
         */
        planeDirection: Base.Vector3;
        /**
         * Radius of the fillet
         */
        radius: number;
        /**
         * if solution is -1 planeOrigin chooses a particular fillet in case of several fillets may be constructed (for example, a circle intersecting a segment in 2 points). Put the intersecting (or common) point of the edges
         */
        solution?: number;
    }
    class FaceFromSurfaceAndWireDto extends ShapesDto {
        /**
         * Surface from which to create a face
         */
        surface: any;
        /**
         * Wire that represents a boundary on the surface to delimit the face
         */
        wire: any;
        /**
         * Indicates wether face should be created inside or outside the wire
         */
        inside: boolean;
    }
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
        constructor(points?: Base.Point3[]);
        /**
         * Points points
         */
        points: Base.Point3[];
    }
    class BoxDto {
        constructor(width?: number, length?: number, height?: number, center?: Base.Point3);
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
        center: Base.Point3;
    }
    class SphereDto {
        constructor(radius?: number, center?: Base.Point3);
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Center of the sphere
         */
        center: Base.Point3;
    }
    class ConeDto {
        constructor(radius1?: number, radius2?: number, height?: number, angle?: number, center?: Base.Point3, direction?: Base.Point3);
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
        /**
         * Angle of the cone
         */
        angle: number;
        /**
         * Center of the cone
         */
        center: Base.Point3;
        /**
         * Direction of the cone
         */
        direction: Base.Point3;
    }
    class LineDto {
        /**
         * Start of the line
         */
        start: Base.Point3;
        /**
         * End of the line
         */
        end: Base.Point3;
    }
    class ArcEdgeThreePointsDto {
        /**
         * Start of the arc
         */
        start: Base.Point3;
        /**
        * Middle of the arc
        */
        middle: Base.Point3;
        /**
         * End of the arc
         */
        end: Base.Point3;
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
        center: Base.Point3;
        /**
         * Direction for the cylinder
         */
        direction?: Base.Vector3;
    }
    class CylindersOnLinesDto {
        /**
         * Radius of the cylinder
         */
        radius: number;
        /**
         * Lines between which to span cylinders
         */
        lines: Line.LinePointsDto[];
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
        constructor(points?: Base.Point3[], closed?: boolean);
        /**
         * Points through which the BSpline will be created
         */
        points: Base.Point3[];
        /**
         * Indicates wether BSpline will be cloed
         */
        closed: boolean;
    }
    class BezierDto {
        constructor(points?: Base.Point3[], closed?: boolean);
        /**
         * Points through which the Bezier curve will be created
         */
        points: Base.Point3[];
        /**
         * Indicates wether Bezier will be cloed
         */
        closed: boolean;
    }
    class DivideWireDto {
        constructor(shape: any, nrOfDivisions?: number, excludeEndPoints?: boolean);
        /**
         * Shape representing a wire
         */
        shape: any;
        /**
         * The number of divisions that will be performed on the curve
         */
        nrOfDivisions: number;
        /**
         * If true end points will not be given in the list
         */
        excludeEndPoints: boolean;
    }
    class DataOnGeometryAtParamDto {
        constructor(shape: any, param?: number);
        /**
         * Shape representing a geometry
         */
        shape: any;
        /**
         * 0 - 1 value
         */
        param: any;
    }
    class PointInFaceDto extends ShapesDto {
        constructor(face: any, edge: any, tEdgeParam?: number, distance2DParam?: number);
        /**
         * OCCT face to be used for calculation
         */
        face: any;
        /**
         * OCCT edge to be used for calculation
         */
        edge: any;
        /**
         * 0 - 1 value
         */
        tEdgeParam: number;
        /**
         * The point will be distanced on <distance2DParam> from the 2d curve.
         */
        distance2DParam: number;
    }
    class DataOnGeometryAtLengthDto {
        constructor(shape: any, length?: number);
        /**
         * Shape representing a wire
         */
        shape: any;
        /**
         * length at which to evaluate the point
         */
        length: any;
    }
    class CircleDto {
        constructor(radius?: number, center?: Base.Point3, direction?: Base.Vector3);
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: Base.Point3;
        /**
         * Direction vector for circle
         */
        direction: Base.Vector3;
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
        constructor(shape?: any, degrees?: number, direction?: Base.Vector3, copy?: boolean);
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
        direction: Base.Vector3;
        /**
         * Copy original shape
         */
        copy: boolean;
    }
    class ShapeShapesDto {
        constructor(shape?: any, shapes?: any[]);
        /**
         * The wire path
         */
        shape: any;
        /**
         * Shapes along the path to be piped
         */
        shapes: any[];
    }
    class ExtrudeDto {
        constructor(shape?: any, direction?: Base.Vector3);
        /**
         * Face to extrude
         */
        shape: any;
        /**
         * Direction vector for extrusion
         */
        direction: Base.Vector3;
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
    class ShapesWithToleranceDto {
        constructor(shapes?: any);
        /**
         * The shapes
         */
        shapes: any;
        /**
         * Tolerance used for intersections
         */
        tolerance: number;
    }
    class ShapeWithToleranceDto {
        constructor(shape?: any);
        /**
         * The shape
         */
        shape: any;
        /**
         * Tolerance used for intersections
         */
        tolerance: number;
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
    class ThickSolidByJoinDto {
        constructor(shape?: any, shapes?: any[], offset?: number);
        /**
         * Shape to make thick
         */
        shape: any;
        /**
         * closing faces
         */
        shapes: any[];
        /**
         * Offset to apply
         */
        offset: number;
        /**
         * Tolerance defines the tolerance criterion for coincidence in generated shapes
         */
        tolerance: number;
        /**
         * if Intersection is false (default value), the intersection is calculated with the parallels to the two adjacent shapes
         */
        intersection: boolean;
        /**
         * SelfInter tells the algorithm whether a computation to eliminate self-intersections needs to be applied to the resulting shape. However, as this functionality is not yet implemented, you should use the default value (false)
         */
        selfIntersection: boolean;
        /**
         * Join defines how to fill the holes that may appear between parallels to the two adjacent faces. It may take values GeomAbs_Arc or GeomAbs_Intersection:
         * if Join is equal to GeomAbs_Arc, then pipes are generated between two free edges of two adjacent parallels, and spheres are generated on "images" of vertices; it is the default value
        */
        joinType: JoinTypeEnum;
        /**
         * if Join is equal to GeomAbs_Intersection, then the parallels to the two adjacent faces are enlarged and intersected, so that there are no free edges on parallels to faces. RemoveIntEdges flag defines whether to remove the INTERNAL edges from the result or not. Warnings Since the algorithm of MakeThickSolid is based on MakeOffsetShape algorithm, the warnings are the same as for MakeOffsetShape.
         */
        removeIntEdges: boolean;
    }
    class TransformDto {
        constructor(shape?: any, translation?: Base.Vector3, rotationAxis?: Base.Vector3, rotationDegrees?: number, scale?: number);
        /**
         * Shape to transform
         */
        shape: any;
        /**
         * Translation to apply
         */
        translation: Base.Vector3;
        /**
         * Rotation to apply
         */
        rotationAxis: Base.Vector3;
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
        constructor(shape?: any, translation?: Base.Vector3);
        /**
         * Shape for translation
         */
        shape: any;
        /**
         * Translation vector
         */
        translation: Base.Vector3;
    }
    class MirrorDto {
        constructor(shape?: any, origin?: Base.Point3, direction?: Base.Vector3);
        /**
         * Shape to mirror
         */
        shape: any;
        /**
         * Axis origin point
         */
        origin: Base.Point3;
        /**
         * Axis direction vector
         */
        direction: Base.Vector3;
    }
    class RotateDto {
        constructor(shape?: any, axis?: Base.Vector3, degrees?: number);
        /**
         * Shape to rotate
         */
        shape: any;
        /**
         * Axis on which to rotate
         */
        axis: Base.Vector3;
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
    class SaveStlDto {
        constructor(shape?: any, filename?: string, precision?: number);
        /**
         * Shape to save
         */
        shape: any;
        /**
         * File name
         */
        filename: string;
        /**
         * Precision of the mesh - lower means higher res
         */
        precision: number;
    }
    class ImportStepIgesDto {
        constructor(assetFile?: File);
        /**
         * The name of the asset to store in the cache.
         */
        assetFile: File;
    }
    class LoadStepOrIgesDto {
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
    class FaceIsoCurveAtParamDto {
        constructor(shape?: any, param?: number);
        /**
         * Face shape
         */
        shape: any;
        /**
         * Param at which to find isocurve
         */
        param: number;
        /**
         * Direction to find the isocurve
         */
        dir: 'u' | 'v';
    }
    class DivideFaceToUVPointsDto {
        constructor(shape?: any);
        /**
         * Face shape
         */
        shape: any;
        /**
         * Number of points on U direction
         */
        nrOfPointsU: number;
        /**
         * Number of points on V direction
         */
        nrOfPointsV: number;
        /**
         * Flatten the output
         */
        flat: boolean;
    }
    class Geom2dEllipseDto {
        /**
         * Center of the ellipse
         */
        center: Base.Point2;
        /**
         * Direction of the vector
         */
        direction: Base.Vector2;
        /**
         * Minor radius of an ellipse
         */
        radiusMinor: number;
        /**
         * Major radius of an ellipse
         */
        radiusMajor: number;
        /**
         * If true will sense the direction
         */
        sense: boolean;
    }
    class EllipseDto {
        /**
         * Center of the ellipse
         */
        center: Base.Point3;
        /**
         * Direction of the vector
         */
        direction: Base.Vector3;
        /**
         * Minor radius of an ellipse
         */
        radiusMinor: number;
        /**
         * Major radius of an ellipse
         */
        radiusMajor: number;
    }
    class GeomCylindricalSurfaceDto {
        /**
         * Radius of the cylindrical surface
         */
        radius: number;
        /**
         * Center of the cylindrical surface
         */
        center: Base.Point3;
        /**
         * Axis of direction for cylindrical surface
         */
        direction: Base.Vector3;
    }
    class Geom2dTrimmedCurveDto {
        /**
         * 2D Curve to trim
         */
        shape: any;
        /**
         * First param on the curve for trimming. U1 can be greater or lower than U2. The returned curve is oriented from U1 to U2.
         */
        u1: number;
        /**
         * Second parameter on the curve for trimming
         */
        u2: number;
        /**
         *  If the basis curve C is periodic there is an ambiguity because two parts are available. In this case by default the trimmed curve has the same orientation as the basis curve (Sense = True). If Sense = False then the orientation of the trimmed curve is opposite to the orientation of the basis curve C.
         */
        sense: boolean;
        /**
         * If the curve is closed but not periodic it is not possible to keep the part of the curve including the junction point (except if the junction point is at the beginning or at the end of the trimmed curve) because you could lose the fundamental characteristics of the basis curve which are used for example to compute the derivatives of the trimmed curve. So for a closed curve the rules are the same as for a open curve.
         */
        theAdjustPeriodic: boolean;
    }
    class Geom2dSegmentDto {
        /**
         * Start 2d point for segment
         */
        start: Base.Point2;
        /**
         * End 2d point for segment
         */
        end: Base.Point2;
    }
}declare namespace Point {
    class PointDto {
        /**
         * Point
         */
        point: Base.Point3;
    }
    class PointsDto {
        /**
         * Points
         */
        points: Base.Point3[];
    }
    class DrawPointDto {
        /**
         * Provide options without default values
         */
        constructor(point?: Base.Point3);
        /**
         * Point
         */
        point: Base.Point3;
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
        colours: string | string[];
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
        constructor(points?: Base.Point3[]);
        /**
         * Point
         */
        points: Base.Point3[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Size of the points
         */
        size: number;
        /**
         * Hex colour string or collection of strings
         */
        colours: string | string[];
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
        point: Base.Point3;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class TransformPointsDto {
        /**
         * Points to transform
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class ClosestPointFromPointsDto {
        /**
         * Points to transform
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        point: Base.Point3;
    }
    class StartEndPointsDto {
        /**
         * Start point
         */
        startPoint: Base.Point3;
        /**
         * End point
         */
        endPoint: Base.Point3;
    }
    class MultiplyPointDto {
        /**
         * Point for multiplication
         */
        point: Base.Point3;
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
}declare namespace Polyline {
    class PolylinePropertiesDto {
        /**
         * Provide options without default values
         */
        constructor(points?: Base.Point3[]);
        /**
         * Points of the polyline
         */
        points: Base.Point3[];
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
        colours: string | string[];
        /**
         * Width of the polyline
         */
        size: number;
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
        colours: string | string[];
        /**
         * Width of the polyline
         */
        size: number;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable: boolean;
        /**
         * Polyline mesh variable in case it already exists and needs updating
         */
        polylinesMesh?: LinesMesh;
    }
}declare namespace BabylonScene {
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
    class PointLightDto {
        /**
         * Position of the point light
         */
        position: Base.Point3;
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
        /**
         * The map size for shadow generator texture if shadows are enabled
         */
        shadowGeneratorMapSize?: number;
        /**
         * Enables shadows
         */
        enableShadows?: boolean;
        /**
         * Shadow darkness
         */
        shadowDarkness?: number;
    }
    class DirectionalLightDto {
        /**
         * Direction of the directional light
         */
        direction: Base.Vector3;
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
         * The map size for shadow generator texture if shadows are enabled
         */
        shadowGeneratorMapSize?: number;
        /**
         * Enables shadows
         */
        enableShadows?: boolean;
        /**
         * Shadow darkness
         */
        shadowDarkness?: number;
    }
    class CameraConfigurationDto {
        /**
         * Position of the point light
         */
        position: Base.Point3;
        /**
         * Look at
         */
        lookAt: Base.Point3;
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
        position: Base.Point3;
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
}declare namespace Time {
    class PostFromIframe {
        /**
         * The data object to post
         */
        data: any;
        /**
         * Thir party iframe origin url to which data should be posted
         */
        targetOrigin: string;
    }
}declare namespace Transforms {
    class RotationCenterAxisDto {
        /**
         * Angle of rotation in degrees
         */
        angle: number;
        /**
         * Axis vector for rotation
         */
        axis: Base.Vector3;
        /**
         * The center from which the axis is pointing
         */
        center: Base.Point3;
    }
    class RotationCenterDto {
        /**
         * Angle of rotation in degrees
         */
        angle: number;
        /**
         * The center from which the axis is pointing
         */
        center: Base.Point3;
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
        center: Base.Point3;
    }
    class ScaleXYZDto {
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         */
        scaleXyz: Base.Vector3;
    }
    class ScaleCenterXYZDto {
        /**
         * The center from which the scaling is applied
         */
        center: Base.Point3;
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         */
        scaleXyz: Base.Vector3;
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
        center: Base.Point3;
    }
    class TranslationXYZDto {
        /**
         * Translation vector with [x, y, z] distances
         */
        translation: Base.Vector3;
    }
}declare namespace Vector {
    class TwoVectorsDto {
        /**
         * First vector
         */
        first: Base.Vector3;
        /**
         * Second vector
         */
        second: Base.Vector3;
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
        point: Base.Point3;
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
        point: Base.Point3;
    }
    class ClosestPointsDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Points
         */
        points: Base.Point3[];
    }
    class BezierCurveDto {
        /**
         * Control points
         */
        points: Base.Point3[];
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
        colours: string | string[];
        /**
         * Width of the polyline
         */
        size: number;
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
        colours: string | string[];
        /**
         * Width of the polyline
         */
        size: number;
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
        points: Base.Point3[];
    }
    class CurvePathDataDto {
        /**
         * Nurbs curve degree
         */
        degree: number;
        /**
         * Control points of the nurbs curve
         */
        points: Base.Point3[];
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
        xAxis: Base.Vector3;
        /**
         * Y axis of the circle
         */
        yAxis: Base.Vector3;
        /**
         * Center of the circle
         */
        center: Base.Point3;
    }
    class CircleParametersDto {
        /**
         * X axis of the circle
         */
        xAxis: Base.Vector3;
        /**
         * Y axis of the circle
         */
        yAxis: Base.Vector3;
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: Base.Point3;
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
        point1: Base.Point3;
        /**
         * Corner 2
         */
        point2: Base.Point3;
        /**
         * Corner 3
         */
        point3: Base.Point3;
        /**
         * Corner 4
         */
        point4: Base.Point3;
    }
    class SurfaceParamDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Point
         */
        point: Base.Point3;
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
        points: Base.Point3[];
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
        colours: string | string[];
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
        colours: string | string[];
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
        colours: string | string[];
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
        axis: Base.Vector3;
        /**
         * X axis of the cone
         */
        xAxis: Base.Vector3;
        /**
         * Base point for the cone
         */
        base: Base.Point3;
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
        direction: Base.Vector3;
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
    