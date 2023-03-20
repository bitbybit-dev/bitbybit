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
    class AssetFileByUrlDto {
        assetFile: string;
        rootUrl: string;
    }
}declare namespace BabylonCamera {
    class ArcRotateCameraDto {
        /**
         * Defines the camera rotation along the longitudinal axis
         */
        alpha: number;
        /**
         * Defines the camera rotation along the latitudinal axis
         */
        beta: number;
        /**
         * Defines the camera distance from its target
         */
        radius: number;
        /**
         * Target of the arc rotate camera
         */
        target?: Base.Point3;
    }
    class FreeCameraDto {
        /**
         * Position of the free camera
         */
        position: Base.Point3;
        /**
         * Target of the free camera
         */
        target: Base.Point3;
    }
    class TargetCameraDto {
        /**
         * Position of the free camera
         */
        position: Base.Point3;
        /**
         * Target of the free camera
         */
        target: Base.Point3;
    }
    class PositionDto {
        /**
         * Target camera
         */
        camera: TargetCamera;
        /**
         * Position of the free camera
         */
        position: Base.Point3;
    }
    class SpeedDto {
        /**
         * Target camera
         */
        camera: TargetCamera;
        /**
         * speed of the camera
         */
        speed: number;
    }
    class TargetDto {
        /**
         * Target camera
         */
        camera: TargetCamera;
        /**
         * target of the camera
         */
        target: Base.Point3;
    }
    class MinZDto {
        /**
         * Free camera
         */
        camera: Camera;
        /**
         * minZ of the camera
         */
        minZ: number;
    }
    class MaxZDto {
        /**
         * Free camera
         */
        camera: Camera;
        /**
         * maxZ of the camera
         */
        maxZ: number;
    }
    class CameraDto {
        /**
         * Camera
         */
        camera: Camera;
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
}declare namespace BabylonMaterial {
    class PBRMetallicRoughnessDto {
        /**
         * Name of the material
         */
        name: string;
        /**
         * Base color of the material
         */
        baseColor: string;
        /**
         * Metallic value of the material
         */
        metallic: number;
        /**
         * Roughness value of the material
         */
        roughness: number;
        /**
         * Defines the transparency of the material
         */
        alpha: number;
        /**
         * Identifies if both sides of the surface should have material applied
         */
        backFaceCulling: boolean;
    }
    class BaseColorDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * Base color of the material
         */
        baseColor?: string;
    }
    class MetallicDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * Metallic value of the material
         */
        metallic?: number;
    }
    class RoughnessDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * Roughness value of the material
         */
        roughness?: number;
    }
    class AlphaDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * Alpha value of the material
         */
        alpha?: number;
    }
    class BackFaceCullingDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * back face culling
         */
        backFaceCulling?: boolean;
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
    class IntersectsMeshDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh2: Mesh | InstancedMesh;
        /**
         * Should check precisely
         */
        precise: boolean;
        /**
         * Check descendant intersections as well
         */
        includeDescendants: boolean;
    }
    class IntersectsPointDto {
        /**
         * Babylon Mesh that needs to be updated
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * point
         */
        point: Base.Point3;
    }
    class BabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
    }
    class ShowHideMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Include children when showing hiding
         */
        includeChildren: Boolean;
    }
    class CloneBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
    }
    class ChildMeshesBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Include only direct descendants
         */
        directDescendantsOnly: boolean;
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
    class NameBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh?: Mesh;
        /**
         * name of the mesh
         */
        name: string;
        /**
         * Set name also on children
         */
        includeChildren?: boolean;
    }
    class MaterialBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh?: Mesh;
        /**
         * material of the mesh
         */
        material: Material;
        /**
         * Set material on children also
         */
        includeChildren: Boolean;
    }
    class IdBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh?: Mesh;
        /**
         * id of the mesh
         */
        id: string;
    }
    class UniqueIdBabylonMeshDto {
        /**
         * Unique id of the mesh
         */
        uniqueId: number;
    }
    class PickableBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Pickable
         */
        pickable: boolean;
        /**
         * Apply set to children also
         */
        includeChildren: boolean;
    }
    class CheckCollisionsBabylonMeshDto {
        /**
         * BabylonJS mesh
         */
        babylonMesh: Mesh;
        /**
         * Check collisions
         */
        checkCollisions: boolean;
        /**
         * Apply set to children also
         */
        includeChildren: boolean;
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
        /**
         * Include children
         */
        includeChildren: boolean;
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
}declare namespace BabylonPick {
    class RayDto {
        /**
         * Ray
         */
        ray: Ray;
    }
    class PickInfo {
        /**
         * Information about picking result
         */
        pickInfo: PickingInfo;
    }
}declare namespace BabylonRay {
    class BaseRayDto {
        /**
         * Origin of the ray
         */
        origin: Base.Point3;
        /**
         * Direction of the ray
         */
        direction: Base.Vector3;
        /**
         * Length of the ray
         */
        length?: number;
    }
    class RayDto {
        /**
         * ray to analyze
         */
        ray: Ray;
    }
    class FromToDto {
        /**
         * From point
         */
        from: Base.Point3;
        /**
         * To point
         */
        to: Base.Point3;
    }
}declare namespace BabylonWebXR {
    class DefaultWebXRWithTeleportationDto {
        /**
         * Create XR experience with ground meshes
         */
        groundMeshes: Mesh[];
    }
}declare namespace Base {
    type Point2 = [number, number];
    type Vector2 = [number, number];
    type Point3 = [number, number, number];
    type Vector3 = [number, number, number];
    type Line2 = {
        start: Base.Point2;
        end: Base.Point2;
    };
    type Line3 = {
        start: Base.Point3;
        end: Base.Point3;
    };
    enum skyboxEnum {
        default = "default",
        clearSky = "clearSky",
        city = "city"
    }
}declare namespace Draw {
    class DrawAny {
        /**
         * Entity to be drawn - can be a single or multiple points, lines, polylines, verb curves, verb surfaces, jscad meshes, jscad polygons, jscad paths, occt shapes, tags, nodes
         * @default undefined
         */
        entity: any;
        /**
         * Entity to be used when updating
         * @default undefined
         * @optional true
         * @hidden true
         */
        babylonMesh?: any;
        /**
         * Options that help you control how your drawn objects look like. This property is optional. In order to pick the right option you need to know which entity you are going to draw. For example if you draw points, lines, polylines or jscad meshes you can use basic geometry options, but if you want to draw OCCT shapes, use OCCT options.
         * @default undefined
         * @optional true
         */
        options: DrawBasicGeometryOptions | DrawOcctShapeOptions | DrawNodeOptions;
    }
    class SceneDrawGridMeshDto {
        /**
         * Width of the grid
         * @default 400
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        width: number;
        /**
         * Height of the ground
         * @default 400
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        height: number;
        /**
         * Ground subdivisions
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions: number;
        /**
         * The frequency of thicker lines.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        majorUnitFrequency: number;
        /**
         * The visibility of minor units in the grid.
         * @default 0.45
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        minorUnitVisibility: number;
        /**
         * The scale of the grid compared to unit.
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        gridRatio: number;
        /**
         * The grid opacity outside of the lines.
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity: number;
        /**
         * Cull the back faces
         * @default false
         */
        backFaceCulling: boolean;
        /**
         * Main color of the grid (e.g. between lines)
         * @default #000000
         */
        mainColor: Base.Color;
        /**
         * Color of the grid lines.
         * @default #555555
         */
        secondaryColor: Base.Color;
    }
    /**
     * Draw options for basic geometry types like points, lines, polylines, surfaces and jscad meshes
     * @link https://docs.bitbybit.dev/classes/inputs_draw_inputs.draw.drawbasicgeometryoptions.html
     */
    class DrawBasicGeometryOptions {
        /**
         * Basic geometry colours to use for lines, points, polylines, surfaces, jscad meshes.
         * @default #ff0000
         */
        colours: string | string[];
        /**
         * Size affect how big the drawn points are and how wide lines are.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size: number;
        /**
         * Opacity of the point 0 to 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity: number;
        /**
         * If geometry needs to be updated later
         * @default false
         */
        updatable: boolean;
        /**
         * Hidden
         * @default false
         */
        hidden: boolean;
    }
    /**
     * Draw options for Nodes
     * @link https://docs.bitbybit.dev/classes/inputs_draw_inputs.draw.drawnodeoptions.html
     */
    class DrawNodeOptions {
        /**
         * X Axis colour
         * @default #ff0000
         */
        colorX: Base.Color;
        /**
         * Y Axis colour
         * @default #00ff00
         */
        colorY: Base.Color;
        /**
         * Z Axis colour
         * @default #0000ff
         */
        colorZ: Base.Color;
        /**
         * Length of the node axis
         * @default 2
         * @minimum 0
         * @maximum Infinity
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
         * @default 1
         * @minimum 0
         * @maximum Infinity
         *
         */
        faceOpacity: number;
        /**
         * Edge opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         */
        edgeOpacity: number;
        /**
         * Hex colour string for the edges
         * @default #ffffff
         */
        edgeColour: Base.Color;
        /**
         * Hex colour string for face colour
         * @default #ff0000
         */
        faceColour: Base.Color;
        /**
         * Face material
         * @default undefined
         * @optional true
         */
        faceMaterial?: any;
        /**
         * Edge width
         * @default 2
         * @minimum 0
         * @maximum Infinity
         */
        edgeWidth: number;
        /**
         * You can turn off drawing of edges via this property
         * @default true
         */
        drawEdges: boolean;
        /**
         * You can turn off drawing of faces via this property
         * @default true
         */
        drawFaces: boolean;
        /**
         * Precision
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         */
        precision: number;
        /**
         * Draw index of edges in space
         * @default false
         */
        drawEdgeIndexes: boolean;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         */
        edgeIndexHeight: number;
        /**
         * Edge index colour if the edges are drawn
         * @default ff00ff
         */
        edgeIndexColour: Base.Color;
        /**
         * Draw indexes of faces in space
         * @default false
         */
        drawFaceIndexes: boolean;
        /**
         * Indicates the edge index height if they are drawn
         * @default 0.06
         * @minimum 0
         * @maximum Infinity
         */
        faceIndexHeight: number;
        /**
         * Edge index colour if the edges are drawn
         * @default #0000ff
         */
        faceIndexColour: Base.Color;
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
        colours: string | string[];
        /**
         * Indicates wether this solid will be transformed in time
         */
        updatable: boolean;
        /**
         * Hidden
         */
        hidden: boolean;
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
         * Should be hidden
         */
        hidden: boolean;
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
    class PointOnLineDto {
        /**
         * Line to get point on
         */
        line: LinePointsDto;
        /**
         * Param to use for point on line
         */
        param: number;
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
    class TransformsLinesDto {
        /**
         * Lines to transform
         */
        lines: LinePointsDto[];
        /**
         * Transformations matrix or a list of transformations matrixes
         */
        matrix: number[][][] | number[][][][];
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
}declare namespace Point {
    class PointDto {
        /**
         * Point
         * @default undefined
         */
        point: Base.Point3;
    }
    class PointXYZDto {
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        x: number;
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        y: number;
        /**
        * Point
        * @default 0
        * @minimum -Infinity
        * @maximum Infinity
        * @step 0.5
        */
        z: number;
    }
    class PointsDto {
        /**
         * Points
         * @default undefined
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
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity: number;
        /**
         * Size of the point
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size: number;
        /**
         * Hex colour string
         * @default #444444
         */
        colours: string | string[];
        /**
         * Indicates wether the position of this point will change in time
         * @default false
         */
        updatable: boolean;
        /**
         * Point mesh variable in case it already exists and needs updating
         * @default undefined
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
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity: number;
        /**
         * Size of the points
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size: number;
        /**
         * Hex colour string or collection of strings
         * @default #444444
         */
        colours: string | string[];
        /**
         * Indicates wether the position of this point will change in time
         * @default false
         */
        updatable: boolean;
        /**
         * Points mesh variable in case it already exists and needs updating
         * @default undefined
         */
        pointsMesh?: Mesh;
    }
    class TransformPointDto {
        /**
         * Point to transform
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        matrix: number[][] | number[][][];
    }
    class TransformPointsDto {
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        matrix: number[][] | number[][][];
    }
    class TransformsForPointsDto {
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Transformations that have to match nr of points
         * @default undefined
         */
        matrix: number[][][] | number[][][][];
    }
    class ClosestPointFromPointsDto {
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        point: Base.Point3;
    }
    class StartEndPointsDto {
        /**
         * Start point
         * @default undefined
         */
        startPoint: Base.Point3;
        /**
         * End point
         * @default undefined
         */
        endPoint: Base.Point3;
    }
    class MultiplyPointDto {
        /**
         * Point for multiplication
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Number of points to create in the list
         * @default undefined
         */
        amountOfPoints: number;
    }
    class SpiralDto {
        /**
         * Identifies phi angle
         * @default 0.9
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        phi: number;
        /**
         * Identifies how many points will be created
         * @default 200
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        numberPoints: number;
        /**
         * Widening factor of the spiral
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        widening: number;
        /**
         * Radius of the spiral
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Factor of the spiral
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        factor: number;
    }
    class HexGridCentersDto {
        /**
         * Number of hexagons on Y direction
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsY: number;
        /**
         * Number of Hexagons on Z direction
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsX: number;
        /**
         * radius of a single hexagon
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
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
    class ActiveCameraDto {
        /**
         * Camera to activate
         */
        camera: Camera;
    }
    class UseRightHandedSystemDto {
        use: boolean;
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
    class SkyboxDto {
        /**
         * Skybox type
         */
        skybox: Base.skyboxEnum;
        /**
         * Skybox size
         */
        size: number;
        /**
         * Identifies if skybox texture should affect scene environment
         */
        blur: number;
        /**
         * Identifies if skybox texture should affect scene environment
         */
        environmentIntensity: number;
    }
    class PointerDto {
        statement_update: () => void;
    }
    class FogDto {
        /**
         * Fog mode
         */
        mode: number;
        /**
         * Fog color
         */
        color: string;
        /**
         * Fog density
         */
        density: number;
        /**
         * Fog start
         */
        start: number;
        /**
         * Fog end
         */
        end: number;
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
    class TranslationsXYZDto {
        /**
         * Translation vectors with [x, y, z] distances
         */
        translations: Base.Vector3[];
    }
}declare namespace Vector {
    class TwoVectorsDto {
        /**
         * First vector
         * @default undefined
         */
        first: Base.Vector3;
        /**
         * Second vector
         * @default undefined
         */
        second: Base.Vector3;
    }
    class VectorBoolDto {
        /**
         * Vector of booleans
         * @default undefined
         */
        vector: boolean[];
    }
    class VectorDto {
        /**
         * Vector array of numbers
         * @default undefined
         */
        vector: number[];
    }
    class RangeMaxDto {
        /**
         * Maximum range boundary
         * @default 10
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        max: number;
    }
    class VectorXYZDto {
        /**
         * X value of vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        x: number;
        /**
         * Y value of vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        y: number;
        /**
         * Z value of vector
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        z: number;
    }
    class SpanDto {
        /**
         * Step of the span
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        step: number;
        /**
        * Min value of the span
        * @default 1
        * @minimum -Infinity
        * @maximum Infinity
        * @step 1
        */
        min: number;
        /**
        * Max value of the span
        * @default 1
        * @minimum -Infinity
        * @maximum Infinity
        * @step 1
        */
        max: number;
    }
    class RayPointDto {
        /**
         * Origin location of the ray
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Distance to the point on the ray
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        distance: number;
        /**
         * Vector array of numbers
         * @default undefined
         */
        vector: number[];
    }
    class VectorsDto {
        /**
         * Vectors array
         * @default undefined
         */
        vectors: number[][];
    }
    class FractionTwoVectorsDto {
        /**
         * Fraction number
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        fraction: number;
        /**
         * First vector
         * @default undefined
         */
        first: Base.Vector3;
        /**
         * Second vector
         * @default undefined
         */
        second: Base.Vector3;
    }
    class VectorScalarDto {
        /**
         * Scalar number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scalar: number;
        /**
         * Vector array of numbers
         * @default undefined
         */
        vector: number[];
    }
    class TwoVectorsReferenceDto {
        /**
         * Reference vector
         * @default undefined
         */
        reference: number[];
        /**
         * First vector
         * @default undefined
         */
        first: Base.Vector3;
        /**
         * Second vector
         * @default undefined
         */
        second: Base.Vector3;
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
         * Should be hidden
         */
        hidden: boolean;
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
         * Should be hidden
         */
        hidden: boolean;
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
         * Indicates if surface should be hidden
         */
        hidden: boolean;
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
    