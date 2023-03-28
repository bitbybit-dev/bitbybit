export const inputDeclarations = `declare namespace Asset {
    class GetAssetDto {
        constructor(fileName?: string);
        /**
         * The fileName associated with the projects asset
         * @default undefined
         */
        fileName: string;
    }
    class AssetFileDto {
        constructor(assetFile?: File);
        /**
         * Asset file that was loaded
         * @default undefined
         */
        assetFile: File;
        /**
         * Import the asset hidden
         * @default false
         */
        hidden: boolean;
    }
    class AssetFileByUrlDto {
        /**
         * Asset file name
         * @default undefined
         */
        assetFile: string;
        /**
         * Root url
         * @default undefined
         */
        rootUrl: string;
        /**
         * Import the asset hidden
         * @default false
         */
        hidden: boolean;
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
         * @default Custom Material
         */
        name: string;
        /**
         * Base color of the material
         * @default #0000ff
         */
        baseColor: Base.Color;
        /**
         * Metallic value of the material
         * @default 0.6
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic: number;
        /**
         * Roughness value of the material
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness: number;
        /**
         * Defines the transparency of the material
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        alpha: number;
        /**
         * Identifies if both sides of the surface should have material applied
         * @default false
         */
        backFaceCulling: boolean;
    }
    class BaseColorDto {
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * Base color of the material
         * @default #0000ff
         */
        baseColor?: Base.Color;
    }
    class MaterialPropDto {
        /**
         * Material to investigate
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial;
    }
    class MetallicDto {
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * Metallic value of the material
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic?: number;
    }
    class RoughnessDto {
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * Roughness value of the material
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness?: number;
    }
    class AlphaDto {
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * Alpha value of the material
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        alpha?: number;
    }
    class BackFaceCullingDto {
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial;
        /**
         * back face culling
         * @default true
         */
        backFaceCulling?: boolean;
    }
}declare namespace BabylonMesh {
    class UpdateDrawnBabylonMesh {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Position to place the mesh into
         * @default undefined
         */
        position: Base.Point3;
        /**
         * Rotation for the mesh
         * @default undefined
         */
        rotation: Base.Vector3;
        /**
         * Scale mesh to certain value
         * @default undefined
         */
        scaling: Base.Vector3;
        /**
         * Colours or a single colour to change
         * @default undefined
         */
        colours: string | string[];
    }
    class SetParentDto {
        /**
         * BabylonJS Mesh that needs to change it's parent
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh | AbstractMesh;
        /**
         * BabylonJS Mesh to use as a parent
         * @default undefined
         */
        parentMesh: Mesh | InstancedMesh | AbstractMesh;
    }
    class UpdateDrawnBabylonMeshPositionDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Position to place the mesh into
         * @default undefined
         */
        position: Base.Point3;
    }
    class UpdateDrawnBabylonMeshRotationDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Rotation for the mesh
         * @default undefined
         */
        rotation: Base.Vector3;
    }
    class UpdateDrawnBabylonMeshScaleDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Scale for the mesh
         * @default undefined
         */
        scale: Base.Vector3;
    }
    class IntersectsMeshDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh2: Mesh | InstancedMesh;
        /**
         * Should check precisely
         * @default false
         */
        precise: boolean;
        /**
         * Check descendant intersections as well
         * @default false
         */
        includeDescendants: boolean;
    }
    class IntersectsPointDto {
        /**
         * Babylon Mesh that needs to be updated
         * @default undefined
         */
        babylonMesh: Mesh | InstancedMesh;
        /**
         * point
         * @default undefined
         */
        point: Base.Point3;
    }
    class BabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
    }
    class ShowHideMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Include children when showing hiding
         * @default true
         */
        includeChildren: boolean;
    }
    class CloneBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
    }
    class ChildMeshesBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Include only direct descendants
         * @default false
         */
        directDescendantsOnly: boolean;
    }
    class TranslateBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * distance to translate
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        distance: number;
    }
    class NameBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         *
         */
        babylonMesh?: Mesh;
        /**
         * name of the mesh
         * @default undefined
         */
        name: string;
        /**
         * Set name also on children
         * @default false
         */
        includeChildren?: boolean;
    }
    class MaterialBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh?: Mesh;
        /**
         * material of the mesh
         * @default undefined
         */
        material: Material;
        /**
         * Set material on children also
         * @default false
         */
        includeChildren: boolean;
    }
    class IdBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh?: Mesh;
        /**
         * id of the mesh
         * @default undefined
         */
        id: string;
    }
    class UniqueIdBabylonMeshDto {
        /**
         * Unique id of the mesh
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        uniqueId: number;
    }
    class PickableBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Pickable
         * @default false
         */
        pickable: boolean;
        /**
         * Apply set to children also
         * @default false
         */
        includeChildren: boolean;
    }
    class CheckCollisionsBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Check collisions
         * @default false
         */
        checkCollisions: boolean;
        /**
         * Apply set to children also
         * @default false
         */
        includeChildren: boolean;
    }
    class RotateBabylonMeshDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * rotate to translate
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        rotate: number;
    }
    class SetMeshVisibilityDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        babylonMesh: Mesh;
        /**
         * Shows mesh if 0 and shows if 1
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        visibility: number;
        /**
         * Include children
         * @default false
         */
        includeChildren: boolean;
    }
    class MeshInstanceAndTransformDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
        mesh: Mesh;
        /**
         * Position
         * @default undefined
         */
        position: Base.Point3;
        /**
         * Rotation
         * @default undefined
         */
        rotation: Base.Vector3;
        /**
         * Scaling
         * @default undefined
         */
        scaling: Base.Vector3;
    }
    class MeshInstanceDto {
        /**
         * BabylonJS mesh
         * @default undefined
         */
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
    type Color = string;
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
}declare namespace Color {
    class HexDto {
        /**
         * Color hex
         * @default #0000ff
         */
        color: Base.Color;
    }
    class HexDtoMapped {
        /**
         * Color hex
         * @default #0000ff
         */
        color: Base.Color;
        /**
         * From min bound
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        from: number;
        /**
         * To max bound
         * @default 255
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        to: number;
    }
    class RGBDto {
        /**
         * Red value component
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 1
         */
        r: number;
        /**
         * Green value component
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 1
         */
        g: number;
        /**
        * Blue value component
        * @default 255
        * @minimum 0
        * @maximum 255
        * @step 1
        */
        b: number;
    }
    class RGBObjectDto {
        /**
         * Red value component
         * @default undefined
         */
        rgb: RGBDto;
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
         * @ignore true
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
    type JSCADEntity = any;
    class DrawSolidMeshDto {
        /**
         * Provide options without default values
         */
        constructor(mesh?: JSCADEntity[]);
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
        opacity: number;
        /**
         * Hex colour string
         * @default #444444
         */
        colours: string | string[];
        /**
         * Indicates wether this solid will be transformed in time
         * @default false
         */
        updatable: boolean;
        /**
         * Hidden
         * @default false
         */
        hidden: boolean;
        /**
         * Solid mesh variable in case it already exists and needs updating
         * @default undefined
         * @optional true
         * @ignore true
         */
        jscadMesh?: Mesh;
    }
    class DrawSolidMeshesDto {
        /**
         * Provide options without default values
         */
        constructor(meshes?: JSCADEntity[]);
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
        opacity: number;
        /**
         * Hex colour string
         * @default #444444
         */
        colours: string | string[];
        /**
         * Indicates wether this solid will be transformed in time
         * @default false
         */
        updatable: boolean;
        /**
         * Should be hidden
         * @default false
         */
        hidden: boolean;
        /**
         * Solid mesh variable in case it already exists and needs updating
         * @default undefined
         * @optional true
         * @ignore true
         */
        jscadMesh?: Mesh;
    }
    class DrawPathDto {
        /**
         * Provide options without default values
         */
        constructor(path?: JSCADEntity[]);
        /**
         * 2D Path to draw
         * @default undefined
         */
        path: JSCADEntity;
        /**
         * Colour of the path
         * @default #444444
         */
        colour: string;
        /**
         * Opacity of the path
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity: number;
        /**
         * Width of the path
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width: number;
        /**
         * Indicates wether the path will change in time
         * @default false
         */
        updatable: boolean;
        /**
         * Path mesh variable that will be updated if updatable property is set to true
         * @default undefined
         * @optional true
         * @ignore true
         */
        pathMesh?: LinesMesh;
    }
    class TransformSolidsDto {
        /**
         * Solids to be transformed
         * @default undefined
         */
        meshes: JSCADEntity[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        matrix: number[][] | number[][][];
    }
    class TransformSolidDto {
        /**
         * Solid to be transformed
         * @default undefined
         */
        mesh: JSCADEntity;
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        matrix: number[][] | number[][][];
    }
    class DownloadSolidDto {
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
    class DownloadSolidsDto {
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
    class BooleanObjectsDto {
        /**
         * Contains solid Jscad mesh objects that will be used to perform boolean operation
         * @default undefined
         */
        meshes: JSCADEntity[];
    }
    class ExpansionDto {
        /**
         * Can contain various Jscad entities from Solid category
         * @default undefined
         */
        geometry: JSCADEntity[];
        /**
         * Delta (+/-) of expansion
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        delta: number;
        /**
         * Type of corner to create during of expansion; edge, chamfer, round
         * @default edge
         */
        corners: SolidCornerTypeEnum;
        /**
         * Integer number of segments when creating round corners
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class OffsetDto {
        /**
         * Can contain various Jscad entities from Solid category
         * @default undefined
         */
        geometry: JSCADEntity[];
        /**
         * Delta (+/-) of offset
         * @default 0.1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        delta: number;
        /**
         * Type of corner to create during the offset; edge, chamfer, round.
         * @default edge
         */
        corners: SolidCornerTypeEnum;
        /**
         * Integer number of segments when creating round corners
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class ExtrudeLinearDto {
        /**
         * Geometry to extrude
         * @default undefined
         */
        geometry: JSCADEntity | JSCADEntity[];
        /**
         * Height of linear extrude
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Twist angle in degrees
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        twistAngle: number;
        /**
         * Number of twist steps
         * @default 15
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        twistSteps: number;
    }
    class HullDto {
        /**
         * Geometries to use in hull
         * @default undefined
         */
        meshes: JSCADEntity[];
    }
    class ExtrudeRectangularDto {
        /**
         * Geometry to extrude
         * @default undefined
         */
        geometry: JSCADEntity | JSCADEntity[];
        /**
         * Height of linear extrude
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Size of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size: number;
    }
    class ExtrudeRectangularPointsDto {
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
        height: number;
        /**
         * Size of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size: number;
    }
    class ExtrudeRotateDto {
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
        angle: number;
        /**
         * Start angle in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle: number;
        /**
         * Number of segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class PathDto {
        /**
         * 2D path
         * @default undefined
         */
        path: JSCADEntity;
    }
    class PathFromPointsDto {
        /**
         * Points through which to create a path
         * @default undefined
         */
        points: Base.Point2[];
        /**
         * Indicates wether we want to create a closed path
         * @default false
         */
        closed: boolean;
    }
    class PathFromPolylineDto {
        /**
         * Polyline
         * @default undefined
         */
        polyline: Polyline.PolylinePropertiesDto;
        /**
         * Indicates wether we want to create a closed path
         * @default false
         */
        closed: boolean;
    }
    class PathFromCurveDto {
        /**
         * Verb Nurbs curve
         * @default undefined
         */
        curve: JSCADEntity;
        /**
         * Indicates wether we want to create a closed path
         * @default false
         */
        closed: boolean;
    }
    class PathAppendCurveDto {
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
    class PathAppendPointsDto {
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
    class PathAppendPolylineDto {
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
    class PathAppendArcDto {
        /**
         * Path to append the arc to
         * @default undefined
         */
        path: JSCADEntity;
        /**
         * End point of an arc
         * @default [1, 1]
         */
        endPoint: Base.Point2;
        /**
         * Rotation (degrees) of the X axis of the arc with respect to the X axis of the coordinate system
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        xAxisRotation: number;
        /**
         * Draw an arc clockwise with respect to the center point
         * @default true
         */
        clockwise: boolean;
        /**
         * Draw an arc longer than PI radians
         * @default false
         */
        large: boolean;
        /**
         * Number of segments for the arc
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
        /**
         * X radius of an arc
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        radiusX: number;
        /**
         * Y radius of an arc
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        radiusY: number;
    }
    class CircleDto {
        /**
         * Center of the circle
         * @default [0, 0]
         */
        center: Base.Point2;
        /**
         * Radius of the circle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class EllipseDto {
        /**
         * Center of the circle
         * @default [0, 0]
         */
        center: Base.Point2;
        /**
         * Radius of the circle in [x, y] form
         * @default [1, 2]
         */
        radius: Base.Point2;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class SquareDto {
        /**
         * Center of the 2D square
         * @default [0, 0]
         */
        center: Base.Point2;
        /**
         * Size of the square
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        size: number;
    }
    class RectangleDto {
        /**
         * Center of the 2D rectangle
         * @default [0, 0]
         */
        center: Base.Point2;
        /**
         * Width of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        width: number;
        /**
         * Length of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length: number;
    }
    class RoundedRectangleDto {
        /**
         * Center of the 2D rectangle
         * @default [0, 0]
         */
        center: Base.Point2;
        /**
         * The radius to round the rectangle edge
         * @default 0.2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        roundRadius: number;
        /**
         * Number of segments for corners
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
        /**
         * Width of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        width: number;
        /**
         * Length of the rectangle
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        length: number;
    }
    class StarDto {
        /**
         * Center of the 2D star
         * @default [0, 0]
         */
        center: Base.Point2;
        /**
         * Number of vertices on the star
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        vertices: number;
        /**
         * Density of the star
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        density: number;
        /**
         * Outer radius of the star
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerRadius: number;
        /**
         * Inner radius of the star
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        innerRadius: number;
        /**
         * Starting angle for first vertice, in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle: number;
    }
    class CubeDto {
        /**
         * Center coordinates of the cube
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Size of the cube
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        size: number;
    }
    class CubeCentersDto {
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
        size: number;
    }
    class CuboidDto {
        /**
         * Center coordinates of the cubod
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Width of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number;
        /**
         * Length of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number;
        /**
         * Height of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
    }
    class CuboidCentersDto {
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
        width: number;
        /**
         * Length of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number;
        /**
         * Height of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
    }
    class RoundedCuboidDto {
        /**
         * Center coordinates of the cubod
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Radius for rounding edges
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        roundRadius: number;
        /**
         * Width of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number;
        /**
         * Length of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number;
        /**
         * Height of the cuboid
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Segments of rounded edges
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class RoundedCuboidCentersDto {
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
        roundRadius: number;
        /**
         * Width of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width: number;
        /**
         * Length of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length: number;
        /**
         * Height of the cuboids
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Segments of rounded edges
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class CylidnerEllipticDto {
        /**
         * Center of the cylinder
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Height of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Start radius on X and Y directions
         * @default [1, 2]
         */
        startRadius: number[];
        /**
         * End radius on X and Y directions
         * @default [2, 3]
         */
        endRadius: number[];
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class CylidnerCentersEllipticDto {
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
        height: number;
        /**
         * Start radius on X and Y directions
         * @default [1, 2]
         */
        startRadius: Base.Point2;
        /**
         * End radius on X and Y directions
         * @default [2, 3]
         */
        endRadius: Base.Point2;
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class CylidnerDto {
        /**
         * Center of the cylinder
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Height of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class RoundedCylidnerDto {
        /**
         * Center of the cylinder
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Rounding radius
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        roundRadius: number;
        /**
         * Height of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class EllipsoidDto {
        /**
         * Center coordinates
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Radius of the ellipsoid in [x, y, z] form
         * @default [1, 2, 3]
         */
        radius: Base.Point3;
        /**
         * Segment count for ellipsoid
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class EllipsoidCentersDto {
        /**
         * Center coordinates
         * @default undefined
         */
        centers: Base.Point3[];
        /**
         * Radius of the ellipsoid in [x, y, z] form
         * @default [1, 2, 3]
         */
        radius: Base.Point3;
        /**
         * Segment count for ellipsoid
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class GeodesicSphereDto {
        /**
         * Center coordinate of the geodesic sphere
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Radius of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Subdivision count
         * @default 12
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        frequency: number;
    }
    class GeodesicSphereCentersDto {
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
        radius: number;
        /**
         * Subdivision count
         * @default 12
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        frequency: number;
    }
    class CylidnerCentersDto {
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
        height: number;
        /**
         * Radius of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Subdivision segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class RoundedCylidnerCentersDto {
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
        roundRadius: number;
        /**
         * Height of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Radius of the cylinders
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Segment number
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class SphereDto {
        /**
         * Center point of the sphere
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Radius of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Segment count
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class SphereCentersDto {
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
        radius: number;
        /**
         * Segment count
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
    }
    class TorusDto {
        /**
         * Center coordinate
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Inner radius
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        innerRadius: number;
        /**
         * Outer radius
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outerRadius: number;
        /**
         * Number of inner segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        innerSegments: number;
        /**
         * Number of outer segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        outerSegments: number;
        /**
         * Inner rotation in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        innerRotation: number;
        /**
         * Outer rotation in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        outerRotation: number;
        /**
         * Start angle in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle: number;
    }
    class TextDto {
        /**
         * Text to write
         * @default Hello World
         */
        text: string;
        /**
         * Number of segments
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
        /**
         * X offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset: number;
        /**
         * Y offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset: number;
        /**
         * Height of the text
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Space between lines
         * @default 1.4
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        lineSpacing: number;
        /**
         * Space between letters
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        letterSpacing: number;
        /**
         * Align between left, center, right
         * @default center
         */
        align: JSCADTextAlignEnum;
        /**
         * Offset the extrusion
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset: number;
    }
    class CylinderTextDto {
        /**
         * Text to write
         * @default Hello World
         */
        text: string;
        /**
         * Height of the cylinder
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        extrusionHeight: number;
        /**
         * Radius of the cylinder
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        extrusionSize: number;
        /**
         * Segment subdivision for cylinder
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
        /**
         * X offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset: number;
        /**
         * Y offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset: number;
        /**
         * Height of the text
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Space between lines
         * @default 1.4
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        lineSpacing: number;
        /**
         * Space between letters
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        letterSpacing: number;
        /**
         * Align between left, center, right
         * @default center
         */
        align: JSCADTextAlignEnum;
        /**
         * Offset the extrusion
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset: number;
    }
    class SphereTextDto {
        /**
         * Text to write
         * @default Hello World
         */
        text: string;
        /**
         * Radius of the spheres
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * Segment subdivision for sphere
         * @default 24
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments: number;
        /**
         * X offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        xOffset: number;
        /**
         * Y offset of the text
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        yOffset: number;
        /**
         * Height of the text
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height: number;
        /**
         * Space between lines
         * @default 1.4
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        lineSpacing: number;
        /**
         * Space between letters
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        letterSpacing: number;
        /**
         * Align between left, center, right
         * @default center
         */
        align: JSCADTextAlignEnum;
        /**
         * Offset the extrusion
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        extrudeOffset: number;
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
}declare namespace JSON {
    class StringifyDto {
        /**
         * Stringify value
         * @default undefined
         */
        json: any;
    }
    class ParseDto {
        /**
         * Stringify value
         * @default undefined
         */
        text: string;
    }
    class QueryDto {
        /**
         * query json structure
         * @default undefined
         */
        json: any;
        /**
         * query path
         * @default undefined
         */
        query: string;
    }
    class SetValueDto {
        /**
        * query json structure
        * @default undefined
        */
        json: any;
        /**
         * query json structure
         * @default undefined
         */
        value: any;
        /**
         * query json structure
         * @default undefined
         */
        path: string;
    }
    class PathsDto {
        /**
         * query json structure
         * @default undefined
         */
        json: any;
        /**
         * query path
         * @default undefined
         */
        query: string;
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
}declare namespace Lists {
    enum FirstLastEnum {
        first = "first",
        last = "last"
    }
    class ListItemDto {
        /**
         * The list to interrogate
         * @default undefined
         */
        list: any[];
        /**
         * Index of the item in the list - 0 means first.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index: number;
    }
    class SubListDto {
        /**
         * The list to split into a sublist
         * @default undefined
         */
        list: any[];
        /**
         * Index from which to start the sublist - 0 means first.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        indexStart: number;
        /**
         * Index to which to end the sublist - 0 means first.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        indexEnd: number;
    }
    class ListDto {
        /**
         * The list to interrogate
         * @default undefined
         */
        list: any[];
    }
    class MultiplyItemDto {
        /**
         * The item to multiply
         * @default undefined
         */
        item: any;
        /**
         * Times to multiply
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        times: number;
    }
    class AddItemAtIndexDto {
        /**
         * The list to which item needs to be added
         * @default undefined
         */
        list: any[];
        /**
         * The item to add
         * @default undefined
         */
        item: any;
        /**
         * The index to add the item at
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index: number;
    }
    class RemoveItemAtIndexDto {
        /**
        * The list from which item needs to be removed
        * @default undefined
        */
        list: any[];
        /**
         * The index to on which remove item
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        index: number;
    }
    class AddItemFirstLastDto {
        /**
         * The list to which item needs to be added
         * @default undefined
         */
        list: any[];
        /**
         * The item to add
         * @default undefined
         */
        item: any;
        /**
         * The option if the item needs to be added at the beginning or the end of the list
         * @default last
         */
        position: FirstLastEnum;
    }
}declare namespace Math {
    enum MathTwoNrOperatorEnum {
        add = "add",
        subtract = "subtract",
        multiply = "multiply",
        divide = "divide",
        power = "power",
        modulus = "modulus"
    }
    enum MathOneNrOperatorEnum {
        absolute = "absolute",
        negate = "negate",
        ln = "ln",
        log10 = "log10",
        tenPow = "tenPow",
        round = "round",
        floor = "floor",
        ceil = "ceil",
        sqrt = "sqrt",
        sin = "sin",
        cos = "cos",
        tan = "tan",
        asin = "asin",
        acos = "acos",
        atan = "atan",
        log = "log",
        exp = "exp"
    }
    class NumberDto {
        /**
         * First number
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number: number;
    }
    class ActionOnTwoNumbersDto {
        /**
         * First number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        first: number;
        /**
         * Second number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        second: number;
        /**
         * Point
         * @default add
         */
        operation: MathTwoNrOperatorEnum;
    }
    class ActionOnOneNumberDto {
        /**
         * First number
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number: number;
        /**
         * Point
         * @default absolute
         */
        operation: MathOneNrOperatorEnum;
    }
    class RemapNumberDto {
        /**
         * Number to remap
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        number: number;
        /**
         * First number range min
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        fromLow: number;
        /**
        * Map to range min
        * @default 1
        * @minimum -Infinity
        * @maximum Infinity
        * @step 0.1
        */
        fromHigh: number;
        /**
         * First number range max
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        toLow: number;
        /**
         * Map to range max
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        toHigh: number;
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
         * @step 0.1
         */
        x: number;
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        y: number;
        /**
        * Point
        * @default 0
        * @minimum -Infinity
        * @maximum Infinity
        * @step 0.1
        */
        z: number;
    }
    class PointXYDto {
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        x: number;
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        y: number;
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
         * @default #ffffff
         */
        colour: Base.Color;
    }
    class PointLightDto {
        /**
         * Position of the point light
         * @default [0, 0, 0]
         */
        position: Base.Point3;
        /**
         * Intensity of the point light, value between 0 and 1
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        intensity: number;
        /**
         * Diffuse colour of the point light
         * @default #ffffff
         */
        diffuse: Base.Color;
        /**
         * Specular colour of the point light
         * @default #ffffff
         */
        specular: Base.Color;
        /**
         * Radius of the sphere mesh representing the light bulb. If 0 light gets created without the mesh
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius: number;
        /**
         * The map size for shadow generator texture if shadows are enabled
         * @default 1024
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowGeneratorMapSize?: number;
        /**
         * Enables shadows
         * @default true
         */
        enableShadows?: boolean;
        /**
         * Shadow darkness
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        shadowDarkness?: number;
    }
    class ActiveCameraDto {
        /**
         * Camera to activate
         * @default undefined
         */
        camera: Camera;
    }
    class UseRightHandedSystemDto {
        /** Indicates to use right handed system
         * @default true
         */
        use: boolean;
    }
    class DirectionalLightDto {
        /**
         * Direction of the directional light
         * @default [-1, -1, -1]
         */
        direction: Base.Vector3;
        /**
         * Intensity of the point light, value between 0 and 1
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        intensity: number;
        /**
         * Diffuse colour of the point light
         * @default #ffffff
         */
        diffuse: Base.Color;
        /**
         * Specular colour of the point light
         * @default #ffffff
         */
        specular: Base.Color;
        /**
         * The map size for shadow generator texture if shadows are enabled
         * @default 1024
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowGeneratorMapSize?: number;
        /**
         * Enables shadows
         * @default true
         */
        enableShadows?: boolean;
        /**
         * Shadow darkness
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        shadowDarkness?: number;
    }
    class CameraConfigurationDto {
        /**
         * Position of the point light
         * @default [10, 10, 10]
         *
         */
        position: Base.Point3;
        /**
         * Look at
         */
        lookAt: Base.Point3;
        /**
         * Lets configure how far the camera can see
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        maxZ: number;
        /**
         * Panning sensibility. If large units are used for the model, this number needs to get larger
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        panningSensibility: number;
        /**
         * Zoom precision of the wheel. If large units are used, this number needs to get smaller
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        wheelPrecision: number;
    }
    class SkyboxDto {
        /**
         * Skybox type
         * @default clearSky
         */
        skybox: Base.skyboxEnum;
        /**
         * Skybox size
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        size: number;
        /**
         * Identifies if skybox texture should affect scene environment
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        blur: number;
        /**
         * Identifies if skybox texture should affect scene environment
         * @default 0.7
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        environmentIntensity: number;
    }
    class PointerDto {
        statement_update: () => void;
    }
    class FogDto {
        /**
         * Fog mode
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        mode: number;
        /**
         * Fog color
         * @default #ffffff
         */
        color: Base.Color;
        /**
         * Fog density
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        density: number;
        /**
         * Fog start
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        start: number;
        /**
         * Fog end
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
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
}declare namespace Text {
    class TextDto {
        /**
         * The text
         * @default Hello World
         */
        text: string;
    }
    class TextSplitDto {
        /**
         * Text to split
         * @default a,b,c
         */
        text: string;
        /**
         * Text to split by
         * @default ,
         */
        separator: string;
    }
    class TextReplaceDto {
        /**
         * Text to replace
         * @default a-c
         */
        text: string;
        /**
         * Text to search for
         * @default -
         */
        search: string;
        /**
         * Text to replace found occurences
         * @default b
         */
        replaceWith: string;
    }
    class TextJoinDto {
        /**
         * Text to join
         * @default undefined
         */
        list: string[];
        /**
         * Text to join by
         * @default ,
         */
        separator: string;
    }
    class ToStringDto {
        /**
         * Item to stringify
         * @default undefined
         */
        item: any;
    }
    class ToStringEachDto {
        /**
         * Item to stringify
         * @default undefined
         */
        list: any[];
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
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle: number;
        /**
         * Axis vector for rotation
         * @default [0, 1, 0]
         */
        axis: Base.Vector3;
        /**
         * The center from which the axis is pointing
         * @default [0, 0, 0]
         */
        center: Base.Point3;
    }
    class RotationCenterDto {
        /**
         * Angle of rotation in degrees
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle: number;
        /**
         * The center from which the axis is pointing
         * @default [0, 0, 0]
         */
        center: Base.Point3;
    }
    class RotationCenterYawPitchRollDto {
        /**
         * Yaw angle (Rotation around X) in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        yaw: number;
        /**
         * Pitch angle (Rotation around Y) in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        pitch: number;
        /**
         * Roll angle (Rotation around Z) in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        roll: number;
        /**
         * The center from which the rotations are applied
         * @default [0, 0, 0]
         */
        center: Base.Point3;
    }
    class ScaleXYZDto {
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         * @default [1, 1, 1]
         */
        scaleXyz: Base.Vector3;
    }
    class ScaleCenterXYZDto {
        /**
         * The center from which the scaling is applied
         * @default [0, 0, 0]
         */
        center: Base.Point3;
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         * @default [1, 1, 1]
         */
        scaleXyz: Base.Vector3;
    }
    class UniformScaleDto {
        /**
         * Uniform scale factor for all x, y, z directions. 1 will keep everything on original size, 2 will scale 200%;
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale: number;
    }
    class UniformScaleFromCenterDto {
        /**
         * Scale factor for all x, y, z directions. 1 will keep everything on original size, 2 will scale 200%;
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale: number;
        /**
         * Center position of the scaling
         * @default [0, 0, 0]
         */
        center: Base.Point3;
    }
    class TranslationXYZDto {
        /**
         * Translation vector with [x, y, z] distances
         * @default [0, 0, 0]
         */
        translation: Base.Vector3;
    }
    class TranslationsXYZDto {
        /**
         * Translation vectors with [x, y, z] distances
         * @default undefined
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
    