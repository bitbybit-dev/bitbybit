export const baseDeclarations = `declare class Asset {
    readonly assetManager: AssetManager;
    constructor();
    /**
     * Gets the asset file
     * @param inputs file name to get from project assets
     * @returns Blob of asset
     */
    getFile(inputs: Inputs.Asset.GetAssetDto): Promise<File>;
    /**
     * Gets the local asset file stored in your browser.
     * @param inputs asset name to get from local assets
     * @returns Blob of asset
     */
    getLocalFile(inputs: Inputs.Asset.GetAssetDto): Promise<File | File[]>;
}/**
 * Contains various functions that expose BABYLONJS objects
 */
declare class Babylon {
    mesh: BabylonMesh;
    camera: BabylonCamera;
    webxr: BabylonWebXR;
    node: BabylonNode;
    scene: BabylonScene;
    transforms: BabylonTransforms;
    io: BabylonIO;
    ray: BabylonRay;
    pick: BabylonPick;
    material: BabylonMaterial;
    constructor(context: Context, geometryHelper: GeometryHelper, color: Color);
}declare class BabylonArcRotateCamera {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates a arc rotate camera
     * @param inputs Describes the arc rotate camera
     * @returns BabylonJS arc rotate camera
     */
    create(inputs: Inputs.BabylonCamera.ArcRotateCameraDto): ArcRotateCamera;
}declare class BabylonCamera {
    private readonly context;
    free: BabylonFreeCamera;
    arcRotate: BabylonArcRotateCamera;
    target: BabylonTargetCamera;
    constructor(context: Context);
    /**
     * Freeze projection matrix of the camera
     * @param inputs Camera to freeze
     */
    freezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void;
    /**
     * Unfreeze projection matrix of the camera
     * @param inputs Camera to freeze
     */
    unfreezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void;
    /**
     * Changes the position of a camera
     * @param inputs Changes the camera position
     */
    setPosition(inputs: Inputs.BabylonCamera.PositionDto): void;
    /**
     * Gets the position of a camera
     * @param inputs Gets the camera position
     */
    getPosition(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3;
    /**
     * Changes the target of a camera
     * @param inputs Changes the camera target
     */
    setTarget(inputs: Inputs.BabylonCamera.TargetDto): void;
    /**
     * Gets the target of a camera
     * @param inputs Gets the camera position
     */
    getTarget(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3;
    /**
     * Changes the speed of a camera
     * @param inputs Changes the camera target
     */
    setSpeed(inputs: Inputs.BabylonCamera.SpeedDto): void;
    /**
     * Gets the speed of a camera
     * @param inputs Gets the camera position
     */
    getSpeed(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3;
    /**
     * Changes the minZ of a camera
     * @param inputs Changes the camera minZ
     */
    setMinZ(inputs: Inputs.BabylonCamera.MinZDto): void;
    /**
     * Changes the maxZ of a camera
     * @param inputs Changes the camera maxZ
     */
    setMaxZ(inputs: Inputs.BabylonCamera.MaxZDto): void;
}declare class BabylonFreeCamera {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates a free camera
     * @param inputs Describes the free camera
     * @returns BabylonJS free camera
     */
    create(inputs: Inputs.BabylonCamera.FreeCameraDto): FreeCamera;
}declare class BabylonTargetCamera {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates a target camera
     * @param inputs Describes the target camera
     * @returns BabylonJS target camera
     */
    create(inputs: Inputs.BabylonCamera.TargetCameraDto): TargetCamera;
}declare class BabylonIO {
    private readonly context;
    private supportedFileFormats;
    private objectUrl;
    constructor(context: Context);
    /**
     * Imports mesh from the asset that you have uploaded for the project.
     * You must upload your assets to your project via project management page.
     * @returns scene loaded mesh
     * @group load
     * @shortname asset
     */
    loadAssetIntoScene(inputs: Inputs.Asset.AssetFileDto): Promise<Mesh>;
    /**
     * Imports mesh from the asset url that you have uploaded to an accessible web storage.
     * Keep in mind that files need to be publically accessible for this to work, be sure that CORS access is enabled for the assets.
     * @returns scene loaded mesh
     * @group load
     * @shortname asset from url
     */
    loadAssetIntoSceneFromRootUrl(inputs: Inputs.Asset.AssetFileByUrlDto): Promise<Mesh>;
    /**
     * Exports the whole scene to .babylon scene format. You can then edit it further in babylonjs editors.
     * @param inputs filename
     * @group export
     * @shortname babylon scene
     */
    exportBabylon(inputs: Inputs.BabylonIO.ExportSceneDto): void;
    /**
     * Exports the whole scene to .glb format. This file format has become industry standard for web models.
     * @param inputs filename
     * @group export
     * @shortname gltf scene
     */
    exportGLB(inputs: Inputs.BabylonIO.ExportSceneDto): void;
    /**
     * Exports the mesh or meshes to stl
     * @param inputs filename and the mesh
     * @group export
     * @shortname babylon mesh to stl
     */
    exportMeshToStl(inputs: Inputs.BabylonIO.ExportMeshToStlDto): Promise<any>;
    private loadAsset;
}declare class BabylonMaterial {
    private readonly context;
    private readonly color;
    pbrMetallicRoughness: BabylonMaterialPbrMetallicRoughness;
    constructor(context: Context, color: Color);
}declare class BabylonMaterialPbrMetallicRoughness {
    private readonly context;
    private readonly color;
    constructor(context: Context, color: Color);
    /**
     * Create PBR metallic roughnes material.
     * @param inputs required to set up metallic roughness material
     * @returns PBR metallic roughness material
     * @group create
     * @shortname material
     * @disposableOutput true
     */
    create(inputs: Inputs.BabylonMaterial.PBRMetallicRoughnessDto): PBRMetallicRoughnessMaterial;
    /**
     * Sets the base color of material
     * @param inputs base color and material
     * @group set
     * @shortname base color
     */
    setBaseColor(inputs: Inputs.BabylonMaterial.BaseColorDto): void;
    /**
     * Sets the metallic property of material
     * @param inputs metallic value
     * @group set
     * @shortname metallic
     */
    setMetallic(inputs: Inputs.BabylonMaterial.MetallicDto): void;
    /**
     * Sets the roughness of material
     * @param inputs roughness value
     * @group set
     * @shortname roughness
     */
    setRoughness(inputs: Inputs.BabylonMaterial.RoughnessDto): void;
    /**
     * Sets the alpha of material
     * @param inputs alpha value
     * @group set
     * @shortname alpha
     */
    setAlpha(inputs: Inputs.BabylonMaterial.AlphaDto): void;
    /**
     * Sets the back face culling of material
     * @param inputs back face culling boolean
     * @group set
     * @shortname back face culling
     */
    setBackFaceCulling(inputs: Inputs.BabylonMaterial.BackFaceCullingDto): void;
    /**
     * Gets the base color of material
     * @param inputs base color and material
     * @return base color
     * @group get
     * @shortname base color
     */
    getBaseColor(inputs: Inputs.BabylonMaterial.MaterialPropDto): string;
    /**
     * Gets the metallic property of material
     * @param inputs metallic value
     * @return metallic value
     * @group get
     * @shortname metallic
     */
    getMetallic(inputs: Inputs.BabylonMaterial.MaterialPropDto): number;
    /**
     * Gets the roughness of material
     * @param inputs roughness value
     * @return roughness value
     * @group get
     * @shortname roughness
     */
    getRoughness(inputs: Inputs.BabylonMaterial.MaterialPropDto): number;
    /**
     * Gets the alpha of material
     * @param inputs alpha value
     * @return alpha value
     * @group get
     * @shortname alpha
     */
    getAlpha(inputs: Inputs.BabylonMaterial.MaterialPropDto): number;
    /**
     * Gets the back face culling of material
     * @param inputs back face culling boolean
     * @return backfaceculling boolean
     * @group get
     * @shortname back face culling
     */
    getBackFaceCulling(inputs: Inputs.BabylonMaterial.MaterialPropDto): boolean;
}declare class BabylonMesh {
    private readonly context;
    constructor(context: Context);
    /** Disposes drawn mesh object from the scene
     * @param inputs Contains BabylonJS mesh that should be disposed
     * @group memory
     * @shortname dispose
     */
    dispose(inputs: Inputs.BabylonMesh.BabylonMeshDto): void;
    /** Udates drawn BabylonJS mesh object without disposing it
     * @param inputs Contains BabylonJS mesh that should be updated, together with position, rotation, scaling and colour info
     * @returns BabylonJS Mesh
     * @group movement
     * @shortname update drawn
     * @ignore true
     */
    updateDrawn(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMesh): void;
    /**
     * Change the visibility of a drawn BabylonJS mesh
     * @param inputs BabylonJS mesh and parent mesh
     * @group visibility
     * @shortname set visibility
     */
    setVisibility(inputs: Inputs.BabylonMesh.SetMeshVisibilityDto): void;
    /**
     * Hides the mesh
     * @param inputs BabylonJS mesh to hide
     * @group visibility
     * @shortname hide
     */
    hide(inputs: Inputs.BabylonMesh.ShowHideMeshDto): void;
    /**
     * Show the mesh
     * @param inputs BabylonJS mesh to hide
     * @group visibility
     * @shortname show
     */
    show(inputs: Inputs.BabylonMesh.ShowHideMeshDto): void;
    /**
     * Change the parent of the drawn mesh
     * @param inputs BabylonJS mesh and parent mesh
     * @group set
     * @shortname parent
     */
    setParent(inputs: Inputs.BabylonMesh.SetParentDto): void;
    /**
     * Get the parent of the drawn mesh
     * @param inputs BabylonJS mesh
     * @returns Parent mesh
     * @group get
     * @shortname parent
     */
    /**
     * Change the check collisions property of the drawn mesh
     * @param inputs BabylonJS mesh and check collisions
     * @group set
     * @shortname check collisions
     */
    setCheckCollisions(inputs: Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto): void;
    /**
     * Get the check collisions property of the drawn mesh
     * @param inputs BabylonJS mesh and check collisions
     * @group get
     * @shortname check collisions
     */
    getCheckCollisions(inputs: Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto): boolean;
    /**
     * Change the pickable property of the drawn mesh
     * @param inputs BabylonJS mesh and pickable
     * @group get
     * @shortname check collisions
     */
    setPickable(inputs: Inputs.BabylonMesh.PickableBabylonMeshDto): void;
    /**
     * Change the pickable property of the drawn mesh
     * @param inputs BabylonJS mesh and pickable
     * @group get
     * @shortname pickable
     */
    getPickable(inputs: Inputs.BabylonMesh.BabylonMeshDto): boolean;
    /**
     * Gets meshes that have names which contain a given text
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname meshes where name contains
     */
    getMeshesWhereNameContains(inputs: Inputs.BabylonMesh.NameBabylonMeshDto): AbstractMesh[];
    /**
     * Gets child meshes
     * @param inputs BabylonJS mesh and whether to include only direct descendants
     * @group get
     * @shortname child meshes
     */
    getChildMeshes(inputs: Inputs.BabylonMesh.ChildMeshesBabylonMeshDto): AbstractMesh[];
    /**
     * Gets meshes of id
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname meshes by id
     */
    getMeshesOfId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): AbstractMesh[];
    /**
     * Gets mesh of id
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname mesh by id
     */
    getMeshOfId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): AbstractMesh;
    /**
     * Gets mesh of unique id
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname mesh by unique id
     */
    getMeshOfUniqueId(inputs: Inputs.BabylonMesh.UniqueIdBabylonMeshDto): AbstractMesh;
    /**
     * Clones the mesh
     * @param inputs BabylonJS mesh to clone
     * @returns a new mesh
     * @group edit
     * @shortname clone
     * @disposableOutput true
     */
    clone(inputs: Inputs.BabylonMesh.BabylonMeshDto): Mesh;
    /**
     * Change the id of the drawn mesh
     * @param inputs BabylonJS mesh and name
     * @group set
     * @shortname id
     */
    setId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): void;
    /**
     * Get the id of the drawn mesh
     * @param inputs BabylonJS mesh and id
     * @group get
     * @shortname id
     */
    getId(inputs: Inputs.BabylonMesh.IdBabylonMeshDto): string;
    /**
     * Get the unique id of the drawn mesh
     * @param inputs BabylonJS mesh and id
     * @returns unique id number
     * @group get
     * @shortname unique id
     */
    getUniqueId(inputs: Inputs.BabylonMesh.BabylonMeshDto): number;
    /**
     * Change the name of the drawn mesh
     * @param inputs BabylonJS mesh and name
     * @group set
     * @shortname name
     */
    setName(inputs: Inputs.BabylonMesh.NameBabylonMeshDto): void;
    /**
     * Gets the name of babylon mesh
     * @param inputs BabylonJS mesh and name
     * @group get
     * @shortname name
     */
    getName(inputs: Inputs.BabylonMesh.BabylonMeshDto): string;
    /**
     * Change the material of the drawn mesh
     * @param inputs BabylonJS mesh and material
     * @group set
     * @shortname material
     */
    setMaterial(inputs: Inputs.BabylonMesh.MaterialBabylonMeshDto): void;
    /**
     * Gets the material of babylon mesh
     * @param inputs BabylonJS mesh
     * @group get
     * @shortname material
     */
    getMaterial(inputs: Inputs.BabylonMesh.BabylonMeshDto): Material;
    /**
     * Gets the position as point of babylonjs mesh
     * @param inputs BabylonJS mesh
     * @returns point
     * @group get
     * @shortname position
     */
    getPosition(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3;
    /**
     * Gets the absolute position in the world as point of babylonjs mesh
     * @param inputs BabylonJS mesh
     * @returns point
     * @group get
     * @shortname absolute position
     */
    getAbsolutePosition(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3;
    /**
     * Gets the rotation vector of babylonjs mesh
     * @param inputs BabylonJS mesh
     * @group get
     * @shortname rotation
     */
    getRotation(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3;
    /**
     * Gets the scale vector of babylonjs mesh
     * @param inputs BabylonJS mesh
     * @group get
     * @shortname scale
     */
    getScale(inputs: Inputs.BabylonMesh.BabylonMeshDto): Base.Point3;
    /**
     * Moves babylonjs mesh forward in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname forward
     */
    moveForward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
    /**
     * Moves babylonjs mesh backward in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname backward
     */
    moveBackward(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
    /**
     * Moves babylonjs mesh up in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname up
     */
    moveUp(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
    /**
     * Moves babylonjs mesh down in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname down
     */
    moveDown(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
    /**
     * Moves babylonjs mesh right in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname right
     */
    moveRight(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
    /**
     * Moves babylonjs mesh left in local space
     * @param inputs BabylonJS mesh and distance
     * @group move
     * @shortname left
     */
    moveLeft(inputs: Inputs.BabylonMesh.TranslateBabylonMeshDto): void;
    /**
     * Rotates babylonjs mesh around local y axis
     * @param inputs BabylonJS mesh and rotation in degrees
     * @group move
     * @shortname yaw
     */
    yaw(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void;
    /**
     * Rotates babylonjs mesh around local x axis
     * @param inputs BabylonJS mesh and rotation in degrees
     * @group move
     * @shortname pitch
     */
    pitch(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void;
    /**
     * Rotates babylonjs mesh around local z axis
     * @param inputs BabylonJS mesh and rotation in degrees
     * @group move
     * @shortname roll
     */
    roll(inputs: Inputs.BabylonMesh.RotateBabylonMeshDto): void;
    /**
     * Updates the position of the BabylonJS mesh or instanced mesh
     * @param inputs BabylonJS mesh and position point
     * @group set
     * @shortname position
     */
    setPosition(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshPositionDto): void;
    /**
     * Updates the rotation of the BabylonJS mesh or instanced mesh
     * @param inputs BabylonJS mesh and rotation along x, y and z axis in degrees
     * @group set
     * @shortname rotation
     */
    setRotation(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshRotationDto): void;
    /**
     * Updates the scale of the BabylonJS mesh or instanced mesh
     * @param inputs BabylonJS mesh and scale vector
     * @group set
     * @shortname scale
     */
    setScale(inputs: Inputs.BabylonMesh.UpdateDrawnBabylonMeshScaleDto): void;
    /**
     * Checks wether mesh intersects another mesh mesh
     * @param inputs Two BabylonJS meshes
     * @group intersects
     * @shortname mesh
     */
    intersectsMesh(inputs: Inputs.BabylonMesh.IntersectsMeshDto): boolean;
    /**
     * Checks wether mesh intersects point
     * @param inputs BabylonJS mesh and point
     * @group intersects
     * @shortname point
     */
    intersectsPoint(inputs: Inputs.BabylonMesh.IntersectsPointDto): boolean;
    /**
     * Creates mesh instance and transforms it for optimised rendering. These are optimised for max performance
     * when rendering many similar objects in the scene. If the mesh has children, then every child ges a mesh instance.
     * @group instance
     * @shortname create and transform
     * @disposableOutput true
     */
    createMeshInstanceAndTransform(inputs: Inputs.BabylonMesh.MeshInstanceAndTransformDto): Promise<any>;
    /**
     * Creates mesh instance. These are optimised for max performance
     * when rendering many similar objects in the scene. If the mesh has children, then every child gets a mesh instance.
     * @group instance
     * @shortname create
     * @disposableOutput true
     */
    createMeshInstance(inputs: Inputs.BabylonMesh.MeshInstanceDto): InstancedMesh;
    private assignColorToMesh;
}/**
 * Nodes help understand the space and construct more complicated space structures. Nodes can be nested together
 * into child parent relationships to simplify the creation of 3D objects.
 */
declare class BabylonNode {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a node of given size with given colours for every axis
     * @param inputs Contains node data that includes size and colour information
     */
    drawNode(inputs: Inputs.BabylonNode.DrawNodeDto): void;
    /**
     * Draws a nodes of given size with given colours for every axis
     * @param inputs Contains node data that includes size and colour information
     */
    drawNodes(inputs: Inputs.BabylonNode.DrawNodesDto): void;
    /**
     * Creates a node on the origin with the given rotations in the parent coordinate system
     * @param inputs Contains information for origin, rotation and parent node
     * @returns A new node
     */
    createNodeFromRotation(inputs: Inputs.BabylonNode.CreateNodeFromRotationDto): TransformNode;
    /**
     * Creates a world node which has root node as his parent
     * @returns A new node whos parent is the root node of the scene
     */
    createWorldNode(): TransformNode;
    /**
     * Gets the absolute forward facing vector in world space
     * @param inputs Node from which to get the forward vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteForwardVector(inputs: Inputs.BabylonNode.NodeDto): number[];
    /**
     * Gets the absolute right facing vector in world space
     * @param inputs Node from which to get the right vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteRightVector(inputs: Inputs.BabylonNode.NodeDto): number[];
    /**
     * Gets the absolute up facing vector in world space
     * @param inputs Node from which to get the up vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteUpVector(inputs: Inputs.BabylonNode.NodeDto): number[];
    /**
     * Gets the absolute position of the node as origin vector in world space
     * @param inputs Node from which to get the absolute position
     * @returns Vector as an array of numbers indicating location of origin in world space
     */
    getAbsolutePosition(inputs: Inputs.BabylonNode.NodeDto): number[];
    /**
     * Gets the absolute rotation of the node as a transformation matrix encoded in array of 16 numbers
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getAbsoluteRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[];
    /**
     * Gets the rotation of the node in local parent coordinate space as a transformation matrix encoded in array of 16 numbers
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getRotationTransformation(inputs: Inputs.BabylonNode.NodeDto): number[];
    /**
     * Gets children of the node
     * @param inputs Node from which to get the children
     * @returns List of children nodes in the array
     */
    getChildren(inputs: Inputs.BabylonNode.NodeDto): Node[];
    /**
     * Gets parent of the node
     * @param inputs Node from which to get a parent
     * @returns Parent node
     */
    getParent(inputs: Inputs.BabylonNode.NodeDto): Node;
    /**
     * Gets the position of the node expressed in local space
     * @param inputs Node from which to get the position in local space
     * @returns Position vector
     */
    getPositionExpressedInLocalSpace(inputs: Inputs.BabylonNode.NodeDto): number[];
    /**
     * Gets the root node
     * @returns Root node
     */
    getRootNode(): TransformNode;
    /**
     * Gets the euler rotations
     * @param inputs Node from which to get rotation
     * @returns Euler rotations of x, y and z angles in the number array
     */
    getRotation(inputs: Inputs.BabylonNode.NodeDto): number[];
    /**
     * Rotates the node around axis and given position by a given angle
     * @param inputs Rotation around axis information
     */
    rotateAroundAxisWithPosition(inputs: Inputs.BabylonNode.RotateAroundAxisNodeDto): void;
    /**
     * Rotates the node around the origin and given axis
     * @param inputs Rotation information
     */
    rotate(inputs: Inputs.BabylonNode.RotateNodeDto): void;
    /**
     * Sets the absolute position of the node
     * @param inputs Node absolute position information
     */
    setAbsolutePosition(inputs: Inputs.BabylonNode.NodePositionDto): void;
    /**
     * Sets the direction of the node
     * @param inputs Direction information
     */
    setDirection(inputs: Inputs.BabylonNode.NodeDirectionDto): void;
    /**
     * Sets the new parent to the node
     * @param inputs Node parent information
     */
    setParent(inputs: Inputs.BabylonNode.NodeParentDto): void;
    /**
     * Translates the node by a given direction vector and a distance
     * @param inputs Node translation information
     */
    translate(inputs: Inputs.BabylonNode.NodeTranslationDto): void;
}declare class BabylonPick {
    private readonly context;
    constructor(context: Context);
    /**
     * Get a hit result of picking with ray
     * @param inputs ray to use for picking
     * @returns Picking info
     */
    pickWithRay(inputs: Inputs.BabylonPick.RayDto): PickingInfo;
    /**
     * Pick with picking ray of the current mouse position in the active camera
     * @returns Picking info
     */
    pickWithPickingRay(): PickingInfo;
    /**
     * Get the distance to the object if picking result exists
     * @param inputs picking result
     * @returns Distance
     */
    getDistance(inputs: Inputs.BabylonPick.PickInfo): number;
    /**
     * Get the picked mesh
     * @param inputs picking result
     * @returns Picked mesh
     */
    getPickedMesh(inputs: Inputs.BabylonPick.PickInfo): AbstractMesh;
    /**
     * Get the picked point
     * @param inputs picking result
     * @returns Picked point
     */
    getPickedPoint(inputs: Inputs.BabylonPick.PickInfo): Base.Point3;
    /**
     * Check if pick ray hit something in the scene or not
     * @param inputs picking result
     * @returns Indication of a hit
     */
    hit(inputs: Inputs.BabylonPick.PickInfo): boolean;
    /**
     * Gets the unique submesh id if it was picked
     * @param inputs picking result
     * @returns Submesh id
     */
    getSubMeshId(inputs: Inputs.BabylonPick.PickInfo): number;
    /**
     * Gets the unique submesh face id if it was picked
     * @param inputs picking result
     * @returns Submesh face id
     */
    getSubMeshFaceId(inputs: Inputs.BabylonPick.PickInfo): number;
    /**
     * Gets the the barycentric U coordinate that is used when calculating the texture coordinates of the collision
     * @param inputs picking result
     * @returns U coordinate
     */
    getBU(inputs: Inputs.BabylonPick.PickInfo): number;
    /**
     * Gets the the barycentric V coordinate that is used when calculating the texture coordinates of the collision
     * @param inputs picking result
     * @returns V coordinate
     */
    getBV(inputs: Inputs.BabylonPick.PickInfo): number;
    /**
     * Get the picked sprite
     * @param inputs picking result
     * @returns Picked sprite
     */
    getPickedSprite(inputs: Inputs.BabylonPick.PickInfo): Sprite;
}declare class BabylonRay {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates a picking ray of the current mouse position in the active camera
     * @returns Ray
     */
    createPickingRay(): Ray;
    /**
     * Create a ray that start at origin, has direction vector and optionally length
     * @param inputs origin, direction and length
     * @returns ray
     */
    createRay(inputs: Inputs.BabylonRay.BaseRayDto): Ray;
    /**
     * Create a ray from one point to another
     * @param inputs origin, direction and length
     * @returns ray
     */
    createRayFromTo(inputs: Inputs.BabylonRay.FromToDto): Ray;
    /**
     * Get the origin of the ray
     * @param inputs ray
     * @returns origin point
     */
    getOrigin(inputs: Inputs.BabylonRay.RayDto): Base.Point3;
    /**
     * Get the direction of the ray
     * @param inputs ray
     * @returns direction vector
     */
    getDirection(inputs: Inputs.BabylonRay.RayDto): Base.Vector3;
    /**
     * Get the length of the ray
     * @param inputs ray
     * @returns length
     */
    getLength(inputs: Inputs.BabylonRay.RayDto): number;
}declare class BabylonScene {
    private readonly context;
    constructor(context: Context);
    /**
     * Changes the scene background colour for 3D space
     * @param inputs Describes the colour of the scene background
     * @group environment
     * @shortname colour
     */
    backgroundColour(inputs: Inputs.BabylonScene.SceneBackgroundColourDto): void;
    /**
     * Activate camera
     * @param inputs Activates the camera
     * @group camera
     * @shortname activate
     */
    activateCamera(inputs: Inputs.BabylonScene.ActiveCameraDto): void;
    /**
     * Use right handed system
     * @param inputs Activates the camera
     * @group system
     * @shortname hand right
     */
    useRightHandedSystem(inputs: Inputs.BabylonScene.UseRightHandedSystemDto): void;
    /**
     * Creates and draws a point light in the scene
     * @param inputs Describes the light source
     * @returns BabylonJS point light
     * @group lights
     * @shortname point
     * @disposableOutput true
     */
    drawPointLight(inputs: Inputs.BabylonScene.PointLightDto): PointLight;
    /**
     * Creates and draws a directional light in the scene
     * @param inputs Describes the light source
     * @returns BabylonJS directional light
     * @group lights
     * @shortname directional
     * @disposableOutput true
     */
    drawDirectionalLight(inputs: Inputs.BabylonScene.DirectionalLightDto): DirectionalLight;
    /**
     * Adjusts the active arc rotate camera with configuration parameters
     * @group camera
     * @shortname adjust active
     */
    adjustActiveArcRotateCamera(inputs: Inputs.BabylonScene.CameraConfigurationDto): void;
    /**
     * Clears all of the drawn objects in the 3D scene
     * @group environment
     * @shortname clear all drawn
     */
    clearAllDrawn(): void;
    /**
     * Enables skybox
     * @param inputs Skybox configuration
     * @group environment
     * @shortname skybox
     */
    enableSkybox(inputs: Inputs.BabylonScene.SkyboxDto): void;
    /**
     * Registers code to run when pointer is down
     * @param inputs pointer statement
     * @ignore true
     */
    onPointerDown(inputs: Inputs.BabylonScene.PointerDto): void;
    /**
     * Registers code to run when pointer is up
     * @param inputs pointer statement
     * @ignore true
     */
    onPointerUp(inputs: Inputs.BabylonScene.PointerDto): void;
    /**
     * Registers code to run when pointer is moving
     * @param inputs pointer statement
     * @ignore true
     */
    onPointerMove(inputs: Inputs.BabylonScene.PointerDto): void;
    /**
     * Enables fog mode
     * @param inputs fog options
     * @group environment
     * @shortname fog
     */
    fog(inputs: Inputs.BabylonScene.FogDto): void;
}/**
 * Transformations help to move, scale, rotate and mirror objects. You can combine multiple transformations
 * for object to be placed exactly into position and orientation that you want.
 * Contains various methods for transformations that represent 4x4 matrixes in flat 16 number arrays.
 */
declare class BabylonTransforms {
    /**
     * Creates a rotation transformations around the center and an axis
     * @param inputs Rotation around center with an axis information
     * @returns array of transformations
     * @group rotation
     * @shortname center axis
     * @drawable false
     */
    rotationCenterAxis(inputs: Inputs.Transforms.RotationCenterAxisDto): number[][];
    /**
     * Creates a rotation transformations around the center and an X axis
     * @param inputs Rotation around center with an X axis information
     * @returns array of transformations
     * @group rotation
     * @shortname center x
     * @drawable false
     */
    rotationCenterX(inputs: Inputs.Transforms.RotationCenterDto): number[][];
    /**
     * Creates a rotation transformations around the center and an Y axis
     * @param inputs Rotation around center with an Y axis information
     * @returns array of transformations
     * @group rotation
     * @shortname center y
     * @drawable false
     */
    rotationCenterY(inputs: Inputs.Transforms.RotationCenterDto): number[][];
    /**
     * Creates a rotation transformations around the center and an Z axis
     * @param inputs Rotation around center with an Z axis information
     * @returns array of transformations
     * @group rotation
     * @shortname center z
     * @drawable false
     */
    rotationCenterZ(inputs: Inputs.Transforms.RotationCenterDto): number[][];
    /**
     * Creates a rotation transformations with yaw pitch and roll
     * @param inputs Yaw pitch roll rotation information
     * @returns array of transformations
     * @group rotation
     * @shortname yaw pitch roll
     * @drawable false
     */
    rotationCenterYawPitchRoll(inputs: Inputs.Transforms.RotationCenterYawPitchRollDto): number[][];
    /**
     * Scale transformation around center and xyz directions
     * @param inputs Scale center xyz trnansformation
     * @returns array of transformations
     * @group rotation
     * @shortname center xyz
     * @drawable false
     */
    scaleCenterXYZ(inputs: Inputs.Transforms.ScaleCenterXYZDto): number[][];
    /**
     * Creates the scale transformation in x, y and z directions
     * @param inputs Scale XYZ number array information
     * @returns transformation
     * @group scale
     * @shortname xyz
     * @drawable false
     */
    scaleXYZ(inputs: Inputs.Transforms.ScaleXYZDto): number[][];
    /**
     * Creates uniform scale transformation
     * @param inputs Scale Dto
     * @returns transformation
     * @group scale
     * @shortname uniform
     * @drawable false
     */
    uniformScale(inputs: Inputs.Transforms.UniformScaleDto): number[][];
    /**
     * Creates uniform scale transformation from the center
     * @param inputs Scale Dto with center point information
     * @returns array of transformations
     * @group scale
     * @shortname uniform from center
     * @drawable false
     */
    uniformScaleFromCenter(inputs: Inputs.Transforms.UniformScaleFromCenterDto): number[][];
    /**
     * Creates the translation transformation
     * @param inputs Translation information
     * @returns transformation
     * @group translation
     * @shortname xyz
     * @drawable false
     */
    translationXYZ(inputs: Inputs.Transforms.TranslationXYZDto): number[][];
    /**
    * Creates the translation transformation
    * @param inputs Translation information
    * @returns transformation
     * @group translations
     * @shortname xyz
     * @drawable false
    */
    translationsXYZ(inputs: Inputs.Transforms.TranslationsXYZDto): number[][][];
}declare class BabylonWebXR {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates default XR experience with teleportation
     * @param inputs Creates default XR experience with teleportation
     */
    createDefaultXRExperienceWithTeleportation(inputs: Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto): Promise<void>;
}declare namespace BaseTypes {
    /**
     * Interval represents an object that has two properties - min and max.
     */
    class IntervalDto {
        /**
         * Minimum value of the interval
         */
        min: number;
        /**
         * Maximum value of the interval
         */
        max: number;
    }
    /**
     * UV usually represents 2D coordinates on 3D or 2D surfaces. It is similar to XY coordinates in planes.
     */
    class UVDto {
        /**
         * U coordinate of the surface
         */
        u: number;
        /**
         * V coordinate of the surface
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
}declare class Color {
    /**
     * Creates a hex color
     * @param inputs Color hex
     * @returns color string
     * @group create
     * @shortname color
     * @drawable false
     */
    hexColor(inputs: Inputs.Color.HexDto): Inputs.Base.Color;
    /**
     * Creates rgb color from hex
     * @param inputs Color hex
     * @returns rgb color
     * @group convert
     * @shortname hex to rgb
     * @drawable false
     */
    hexToRgb(inputs: Inputs.Color.HexDto): Inputs.Color.RGBDto;
    /**
     * Creates hex color from rgb
     * @param inputs Color hext
     * @returns rgb color
     * @group convert
     * @shortname rgb to hex
     * @drawable false
     */
    rgbToHex(inputs: Inputs.Color.RGBDto): Inputs.Base.Color;
    /**
     * Creates rgb color from hex and maps to 0 - 100 value
     * @param inputs Color hext
     * @returns rgb color
     * @group convert
     * @shortname hex to rgb mapped
     * @drawable false
     */
    hexToRgbMapped(inputs: Inputs.Color.HexDtoMapped): Inputs.Color.RGBDto;
    /**
     * Get red param
     * @param inputs Color hext
     * @returns rgb color
     * @group hex to
     * @shortname red
     * @drawable false
     */
    getRedParam(inputs: Inputs.Color.HexDtoMapped): number;
    /**
     * Get green param
     * @param inputs Color hext
     * @returns rgb color
     * @group hex to
     * @shortname green
     * @drawable false
     */
    getGreenParam(inputs: Inputs.Color.HexDtoMapped): number;
    /**
     * Get blue param
     * @param inputs Color hext
     * @returns blue param
     * @group hex to
     * @shortname blue
     * @drawable false
     */
    getBlueParam(inputs: Inputs.Color.HexDtoMapped): number;
    /**
     * RGB to red
     * @param inputs Color rgb
     * @returns red param
     * @group  rgb to
     * @shortname red
     * @drawable false
     */
    rgbToRed(inputs: Inputs.Color.RGBObjectDto): number;
    /**
     * RGB to green
     * @param inputs Color rgb
     * @returns green param
     * @group rgb to
     * @shortname green
     * @drawable false
     */
    rgbToGreen(inputs: Inputs.Color.RGBObjectDto): number;
    /**
     * RGB to blue
     * @param inputs Color rgb
     * @returns blue param
     * @group rgb to
     * @shortname blue
     * @drawable false
     */
    rgbToBlue(inputs: Inputs.Color.RGBObjectDto): number;
}declare class Draw {
    private readonly point;
    private readonly line;
    private readonly polyline;
    private readonly node;
    private readonly verbCurve;
    private readonly verbSurface;
    private readonly jscad;
    private readonly occt;
    private readonly tag;
    private readonly context;
    private defaultBasicOptions;
    private defaultNodeOptions;
    constructor(point: Point, line: Line, polyline: Polyline, node: BabylonNode, verbCurve: VerbCurve, verbSurface: VerbSurface, jscad: JSCAD, occt: OCCTW, tag: Tag, context: Context);
    /**
     * Draws any kind of geometry after all input promises are resolved. Inputs can also be non-promise like.
     * @param inputs Contains options and entities to be drawn
     * @returns BabylonJS Mesh Promise
     * @group draw
     * @shortname draw anything
     * @disposableOutput true
     */
    drawAnyAsync(inputs: Inputs.Draw.DrawAny): Promise<Mesh>;
    private updateAny;
    /**
     * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
     * @param inputs Describes various parameters of the grid mesh like size, colour, etc.
     * @group draw
     * @shortname draw grid
     * @disposableOutput true
     */
    drawGridMesh(inputs: Inputs.Draw.SceneDrawGridMeshDto): Mesh;
    /**
     * Draws any kind of geometry. Inputs can not be promises.
     * @param inputs Contains options and entities to be drawn
     * @returns BabylonJS Mesh
     */
    private drawAny;
    /**
     * Creates draw options for basic geometry types like points, lines, polylines, surfaces and jscad meshes
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname simple
     */
    optionsSimple(inputs: Inputs.Draw.DrawBasicGeometryOptions): Inputs.Draw.DrawBasicGeometryOptions;
    /**
     * Creates draw options for occt shape geometry like edges, wires, faces, shells, solids and compounds
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname occt shape
     */
    optionsOcctShape(inputs: Inputs.Draw.DrawOcctShapeOptions): Inputs.Draw.DrawOcctShapeOptions;
    /**
     * Creates draw options for babylon js nodes
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname babylon node
     */
    optionsBabylonNode(inputs: Inputs.Draw.DrawNodeOptions): Inputs.Draw.DrawNodeOptions;
    private assignColorToMesh;
    private handleTags;
    private handleTag;
    private handleVerbSurfaces;
    private handleVerbCurves;
    private handleNodes;
    private handlePoints;
    private handleLines;
    private handlePolylines;
    private handleVerbSurface;
    private handleVerbCurve;
    private handleNode;
    private handlePolyline;
    private handlePoint;
    private handleLine;
    private handleJscadMeshes;
    private handleOcctShape;
    private handleJscadMesh;
    private applyGlobalSettingsAndMetadataAndShadowCasting;
    private detectPoint;
    private detectPoints;
    private detectLine;
    private detectLines;
    private detectPolyline;
    private detectPolylines;
    private detectNode;
    private detectNodes;
    private detectVerbCurve;
    private detectVerbSurface;
    private detectVerbCurves;
    private detectVerbSurfaces;
    private detectJscadMesh;
    private detectJscadMeshes;
    private detectOcctShape;
    private detectTag;
    private detectTags;
    private checkIfElementsInArrayAreNumbers;
    private checkIfElementsInArrayAreArrays;
    private arraysInChildrenArraysContainNumbers;
    private arraysInChildrenArraysAreOfLength3;
}/**
 * Contains various functions for Solid booleans from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADBooleans {
    private readonly jscadWorkerManager;
    constructor(jscadWorkerManager: JSCADWorkerManager);
    /**
     * Intersect multiple solid mesh objects
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh
     * @group boolean
     * @shortname intersect
     * @drawable true
     */
    intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<any>;
    /**
     * Subtract multiple solid mesh objects
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh
     * @group boolean
     * @shortname intersect
     * @drawable true
     */
    subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<any>;
    /**
     * Union multiple solid mesh objects
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     * @group boolean
     * @shortname union
     * @drawable true
     */
    union(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<any>;
}/**
 * Contains various functions for Solid expansions from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADExpansions {
    private readonly jscadWorkerManager;
    constructor(jscadWorkerManager: JSCADWorkerManager);
    /**
     * Expand geometries of solid category
     * @param inputs Contains options and geometries for expansion
     * @returns Expanded geometry
     * @group expansion
     * @shortname expand
     * @drawable true
     */
    expand(inputs: Inputs.JSCAD.ExpansionDto): Promise<any>;
    /**
     * Offset 2d geometries of solid category
     * @param inputs Contains options and geometries for offset
     * @returns Expanded geometry
     * @group expansion
     * @shortname offset
     * @drawable true
     */
    offset(inputs: Inputs.JSCAD.ExpansionDto): Promise<any>;
}/**
 * Contains various functions for Solid extrusions from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADExtrusions {
    private readonly jscadWorkerManager;
    constructor(jscadWorkerManager: JSCADWorkerManager);
    /**
     * Linear extrude 2D geometries of solid category
     * @param inputs Contains options and geometries for linear extrude
     * @returns Extruded geometry
     * @group extrude
     * @shortname linear
     * @drawable true
     */
    extrudeLinear(inputs: Inputs.JSCAD.ExtrudeLinearDto): Promise<any>;
    /**
     * Rectangular extrude 2D geometries of solid category. Creates a wall-type extrusion of certain height and size.
     * @param inputs Contains options and geometries for rectangular extrude
     * @returns Extruded geometry
     * @group extrude
     * @shortname rectangular
     * @drawable true
     */
    extrudeRectangular(inputs: Inputs.JSCAD.ExtrudeRectangularDto): Promise<any>;
    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     * @group extrude
     * @shortname rectangular points
     * @drawable true
     */
    extrudeRectangularPoints(inputs: Inputs.JSCAD.ExtrudeRectangularPointsDto): Promise<any>;
    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     * @group extrude
     * @shortname rotational
     * @drawable true
     */
    extrudeRotate(inputs: Inputs.JSCAD.ExtrudeRotateDto): Promise<any>;
}/**
 * Contains various functions for Solid hulls from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADHulls {
    private readonly jscadWorkerManager;
    constructor(jscadWorkerManager: JSCADWorkerManager);
    /**
     * Hull chain connects solids or 2d geometries by filling an empty space in between objects in order.
     * Geometries need to be of the same type.
     * @param inputs Geometries
     * @returns Chain hulled geometry
     * @group hulls
     * @shortname hull chain
     * @drawable true
     */
    hullChain(inputs: Inputs.JSCAD.HullDto): Promise<any>;
    /**
     * Convex hull connects solids or 2d geometries by filling an empty space in between without following order.
     * Geometries need to be of the same type.
     * @param inputs Geometries
     * @returns Hulled geometry
     * @group hulls
     * @shortname hull
     * @drawable true
     */
    hull(inputs: Inputs.JSCAD.HullDto): Promise<any>;
}/**
 * Contains various functions for Solid meshes from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCAD {
    private readonly jscadWorkerManager;
    private readonly context;
    private readonly geometryHelper;
    readonly booleans: JSCADBooleans;
    readonly expansions: JSCADExpansions;
    readonly extrusions: JSCADExtrusions;
    readonly hulls: JSCADHulls;
    readonly path: JSCADPath;
    readonly polygon: JSCADPolygon;
    readonly shapes: JSCADShapes;
    readonly text: JSCADText;
    constructor(jscadWorkerManager: JSCADWorkerManager, context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single solids
     * @param inputs Contains a solid or polygon and information for drawing
     * @returns Mesh that is being drawn by Babylon
     * @group jscad
     * @shortname draw solid
     * @ignore true
     */
    drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto): Promise<Mesh>;
    private makeMesh;
    /**
     * Draws multiple solids
     * @param inputs Contains solids or polygons and information for drawing
     * @returns Mesh that is being drawn by Babylon
     * @group jscad
     * @shortname draw solid
     * @ignore true
     */
    drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto): Promise<Mesh>;
    /**
     * Draws a 2D path
     * @param inputs Contains a path and information for drawing
     * @returns Mesh that is being drawn by Babylon
     * @group jscad
     * @shortname draw solid
     * @ignore true
     */
    drawPath(inputs: Inputs.JSCAD.DrawPathDto): Promise<LinesMesh>;
    /**
     * Transforms the Jscad solid meshes with a given list of transformations.
     * @param inputs Solids with the transformation matrixes
     * @returns Solids with a transformation
     * @group transforms
     * @shortname transform solids
     * @drawable true
     */
    transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): Promise<Inputs.JSCAD.JSCADEntity[]>;
    /**
     * Transforms the Jscad solid mesh with a given list of transformations.
     * @param inputs Solid with the transformation matrixes
     * @returns Solid with a transformation
     * @group transforms
     * @shortname transform solid
     * @drawable true
     */
    transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): Promise<Inputs.JSCAD.JSCADEntity>;
    /**
     * Downloads the binary STL file from a 3D solid
     * @param inputs 3D Solid
     * @group io
     * @shortname solid to stl
     */
    downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): Promise<void>;
    /**
     * Downloads the binary STL file from a 3D solids
     * @param inputs 3D Solid
     * @group io
     * @shortname solids to stl
     */
    downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): Promise<void>;
    private downloadSTL;
    private createMesh;
}/**
 * Contains various functions for Path from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADPath {
    private readonly jscadWorkerManager;
    constructor(jscadWorkerManager: JSCADWorkerManager);
    /**
     * Create a 2D path from a list of points
     * @param inputs Points and indication if we want a closed path or not
     * @returns Path
     * @group from
     * @shortname points
     * @drawable true
     */
    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): Promise<any>;
    /**
     * Create a 2D path from a polyline
     * @param inputs Polyline and indication if we want a closed path or not
     * @returns Path
     * @group from
     * @shortname polyline
     * @drawable true
     */
    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): Promise<any>;
    /**
     * Create a 2D path from a curve
     * @param inputs Curve and indication if we want a closed path or not
     * @returns Path
     * @group from
     * @shortname curve
     * @drawable true
     */
    createFromCurve(inputs: Inputs.JSCAD.PathFromCurveDto): Promise<any>;
    /**
     * Create empty 2D path
     * @returns Empty path
     * @group create
     * @shortname empty
     * @drawable false
     */
    createEmpty(): Promise<any>;
    /**
     * Closes an open 2D path
     * @param inputs Path
     * @returns Closed path
     * @group edit
     * @shortname close
     * @drawable true
     */
    close(inputs: Inputs.JSCAD.PathDto): Promise<any>;
    /**
     * Append the path with 2D points
     * @param inputs Path to append and points
     * @returns Appended path
     * @group append
     * @shortname points
     * @drawable true
     */
    appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): Promise<any>;
    /**
     * Append the path with polyline
     * @param inputs Path to append and polyline
     * @returns Appended path
     * @group append
     * @shortname polyline
     * @drawable true
     */
    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): Promise<any>;
    /**
     * Append the path with the curve
     * @param inputs Path to append and a curve
     * @returns Appended path
     * @group append
     * @shortname curve
     * @drawable true
     */
    appendCurve(inputs: Inputs.JSCAD.PathAppendCurveDto): Promise<any>;
    /**
     * Append the arc to the path
     * @param inputs Path and arc parameters
     * @returns Appended path
     * @group append
     * @shortname arc
     * @drawable true
     */
    appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): Promise<any>;
}/**
 * Contains various functions for Polygon from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADPolygon {
    private readonly jscadWorkerManager;
    constructor(jscadWorkerManager: JSCADWorkerManager);
    /**
     * Create a 2D polygon from a list of points
     * @param inputs Points
     * @returns Path
     * @group from
     * @shortname points
     * @drawable true
     */
    createFromPoints(inputs: Inputs.Point.PointsDto): Promise<any>;
    /**
     * Create a 2D polygon from a polyline
     * @param inputs Polyline
     * @returns Polygon
     * @group from
     * @shortname polyline
     * @drawable true
     */
    createFromPolyline(inputs: Inputs.Polyline.PolylineDto): Promise<any>;
    /**
     * Create a 2D polygon from a curve
     * @param inputs Nurbs curve
     * @returns Polygon
     * @group from
     * @shortname curve
     * @drawable true
     */
    createFromCurve(inputs: Inputs.Verb.CurveDto): Promise<any>;
    /**
     * Create a 2D polygon from a path
     * @param inputs Path
     * @returns Polygon
     * @group from
     * @shortname path
     * @drawable true
     */
    createFromPath(inputs: Inputs.JSCAD.PathDto): Promise<any>;
    /**
     * Create a 2D polygon circle
     * @param inputs Circle parameters
     * @returns Circle polygon
     * @group primitives
     * @shortname circle
     * @drawable true
     */
    circle(inputs: Inputs.JSCAD.CircleDto): Promise<any>;
    /**
     * Create a 2D polygon ellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse polygon
     * @group primitives
     * @shortname ellipse
     * @drawable true
     */
    ellipse(inputs: Inputs.JSCAD.EllipseDto): Promise<any>;
    /**
     * Create a 2D polygon rectangle
     * @param inputs Rectangle parameters
     * @returns Rectangle polygon
     * @group primitives
     * @shortname rectangle
     * @drawable true
     */
    rectangle(inputs: Inputs.JSCAD.RectangleDto): Promise<any>;
    /**
     * Create a 2D rounded rectangle
     * @param inputs Rounded rectangle parameters
     * @returns Rounded rectangle polygon
     * @group primitives
     * @shortname rounded rectangle
     * @drawable true
     */
    roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): Promise<any>;
    /**
     * Create a 2D polygon square
     * @param inputs Square parameters
     * @returns Square polygon
     * @group primitives
     * @shortname square
     * @drawable true
     */
    square(inputs: Inputs.JSCAD.SquareDto): Promise<any>;
    /**
     * Create a 2D polygon star
     * @param inputs Star parameters
     * @returns Star polygon
     * @group primitives
     * @shortname star
     * @drawable true
     */
    star(inputs: Inputs.JSCAD.StarDto): Promise<any>;
}/**
 * Contains various functions for solid 3D shapes from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADShapes {
    private readonly jscadWorkerManager;
    constructor(jscadWorkerManager: JSCADWorkerManager);
    /**
     * Create a 3D cube shape
     * @param inputs Cube parameters
     * @returns Cube solid
     * @group primitives
     * @shortname cube
     * @drawable true
     */
    cube(inputs: Inputs.JSCAD.CubeDto): Promise<any>;
    /**
     * Create a 3D cubes on multiple center points
     * @param inputs Cube with multiple center points parameters
     * @returns List of cube solids
     * @group primitives on centers
     * @shortname cubes
     * @drawable true
     */
    cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): Promise<any[]>;
    /**
     * Create a 3D cuboid shape
     * @param inputs Cuboid parameters
     * @returns Cuboid solid
     * @group primitives
     * @shortname cuboid
     * @drawable true
     */
    cuboid(inputs: Inputs.JSCAD.CuboidDto): Promise<any>;
    /**
     * Create a 3D cuboids on multiple center points
     * @param inputs Cuboids with multiple center point parameters
     * @returns List of cuboid solids
     * @group primitives on centers
     * @shortname cuboids
     * @drawable true
     */
    cuboidsOnCenterPoints(inputs: Inputs.JSCAD.CuboidCentersDto): Promise<any[]>;
    /**
     * Create a 3D elliptic cylinder solid
     * @param inputs Elliptic cylinder parameters
     * @returns Elliptic cylinder solid
     * @group primitives
     * @shortname cylinder elliptic
     * @drawable true
     */
    cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): Promise<any>;
    /**
     * Create a 3D elliptic cylinders on multiple center points
     * @param inputs Elliptic cylinders with multiple center point parameters
     * @returns List of elliptic cylinders solids
     * @group primitives on centers
     * @shortname cylinder elliptic
     * @drawable true
     */
    cylinderEllipticOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersEllipticDto): Promise<any[]>;
    /**
     * Create a 3D cylinder solid
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     * @group primitives
     * @shortname cylinder
     * @drawable true
     */
    cylinder(inputs: Inputs.JSCAD.CylidnerDto): Promise<any>;
    /**
     * Create a 3D cylinders on multiple center points
     * @param inputs Cylinders with multiple center point parameters
     * @returns List of cylinder solids
     * @group primitives on centers
     * @shortname cylinder
     * @drawable true
     */
    cylindersOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersDto): Promise<any[]>;
    /**
     * Create a 3D ellipsoid solid
     * @param inputs Ellipsoid parameters
     * @returns Ellipsoid solid
     * @group primitives
     * @shortname ellipsoid
     * @drawable true
     */
    ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): Promise<any>;
    /**
     * Create a 3D ellipsoids on multiple center points
     * @param inputs Ellipsoid parameters with multiple center points
     * @returns List of ellipsoid solids
     * @group primitives on centers
     * @shortname ellipsoid
     * @drawable true
     */
    ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): Promise<any[]>;
    /**
     * Create a 3D geodesic sphere solid
     * @param inputs Geodesic sphere parameters
     * @returns Geodesic sphere solid
     * @group primitives
     * @shortname geodesic sphere
     * @drawable true
     */
    geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): Promise<any>;
    /**
     * Create a 3D geodesic spheres on multiple center points
     * @param inputs Geodesic sphere parameters with multiple center points
     * @returns List of geodesic spheres
     * @group primitives on centers
     * @shortname geodesic sphere
     * @drawable true
     */
    geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): Promise<any[]>;
    /**
     * Create a 3D rounded cuboid solid
     * @param inputs Rounded cuboid parameters
     * @returns Rounded cuboid solid
     * @group primitives
     * @shortname rounded cuboid
     * @drawable true
     */
    roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): Promise<any>;
    /**
     * Create a 3D rounded cuboids on multiple center points
     * @param inputs Rounded cuboids parameters with multiple center points
     * @returns List of rounded cuboids
     * @group primitives on centers
     * @shortname rounded cuboid
     * @drawable true
     */
    roundedCuboidsOnCenterPoints(inputs: Inputs.JSCAD.RoundedCuboidCentersDto): Promise<any[]>;
    /**
     * Create a 3D rounded cylinder solid
     * @param inputs Rounded cylinder parameters
     * @returns Rounded cylinder solid
     * @group primitives
     * @shortname rounded cylinder
     * @drawable true
     */
    roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): Promise<any>;
    /**
     * Create a 3D rounded cylinders on multiple center points
     * @param inputs Rounded cylinders parameters with multiple center points
     * @returns List of rounded cylinders
     * @group primitives on centers
     * @shortname rounded cylinder
     * @drawable true
     */
    roundedCylindersOnCenterPoints(inputs: Inputs.JSCAD.RoundedCylidnerCentersDto): Promise<any[]>;
    /**
     * Create a 3D sphere solid
     * @param inputs Sphere parameters
     * @returns Sphere solid
     * @group primitives
     * @shortname sphere
     * @drawable true
     */
    sphere(inputs: Inputs.JSCAD.SphereDto): Promise<any>;
    /**
     * Create a 3D sphere on multiple center points
     * @param inputs Sphere parameters with multiple center points
     * @returns List of spheres
     * @group primitives on centers
     * @shortname sphere
     * @drawable true
     */
    spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): Promise<any[]>;
    /**
     * Create a 3D torus solid
     * @param inputs Torus parameters
     * @returns Torus solid
     * @group primitives
     * @shortname torus
     * @drawable true
     */
    torus(inputs: Inputs.JSCAD.TorusDto): Promise<any>;
}/**
 * Contains various functions for solid 3D texts from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADText {
    private readonly jscadWorkerManager;
    constructor(jscadWorkerManager: JSCADWorkerManager);
    /**
     * Creates a text that is based on chain hulling cylinders
     * @param inputs Cylindrical text parameters
     * @returns List of solids for text
     * @group text
     * @shortname cylindrical
     * @drawable true
     */
    cylindricalText(inputs: Inputs.JSCAD.CylinderTextDto): Promise<any[]>;
    /**
     * Creates a text that is based on chain hulling spheres
     * @param inputs Spherical text parameters
     * @returns List of solids for text
     * @group text
     * @shortname spherical
     * @drawable true
     */
    sphericalText(inputs: Inputs.JSCAD.SphereTextDto): Promise<any[]>;
    /**
     * Creates a vector text
     * @param inputs Vector text parameters
     * @returns List of polygons
     * @group text
     * @shortname vector
     * @drawable true
     * @ignore true
     */
    createVectorText(inputs: Inputs.JSCAD.TextDto): Promise<number[][]>;
}/**
 * Contains various json path methods.
 */
declare class JSONBitByBit {
    private readonly context;
    constructor(context: Context);
    /**
     * Stringifies the input value
     * @param inputs a value to be stringified
     * @returns string
     * @group transform
     * @shortname stringify
     * @drawable false
     */
    stringify(inputs: Inputs.JSON.StringifyDto): string;
    /**
     * Parses the input value
     * @param inputs a value to be parsed
     * @returns any
     * @group transform
     * @shortname parse
     * @drawable false
     */
    parse(inputs: Inputs.JSON.ParseDto): any;
    /**
     * Queries the input value
     * @param inputs a value to be queried
     * @returns any
     * @group jsonpath
     * @shortname query
     * @drawable false
     */
    query(inputs: Inputs.JSON.QueryDto): any;
    /**
     * Sets value to the json by providing a path
     * @param inputs a value to be added, json and a path
     * @returns any
     * @group jsonpath
     * @shortname set value
     * @drawable false
     */
    setValue(inputs: Inputs.JSON.SetValueDto): any;
    /**
     * Find paths to elements in object matching path expression
     * @param inputs a json value and a query
     * @returns any
     * @group jsonpath
     * @shortname paths
     * @drawable false
     */
    paths(inputs: Inputs.JSON.PathsDto): any;
    /**
     * Find paths to elements in object matching path expression as strings
     * @param inputs a json value and a query
     * @returns any
     * @group jsonpath
     * @shortname paths as strings
     * @drawable false
     */
    pathsAsStrings(inputs: Inputs.JSON.PathsDto): any;
}{};/**
 * Contains various methods for lines. Line in bitbybit is a simple object that has star and end point properties.
 * { start: [ x, y, z ], end: [ x, y, z ] }
 */
declare class Line {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws multiple lines
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLines(inputs: Inputs.Line.DrawLinesDto): LinesMesh;
    /**
     * Converts a line to a NURBS line curve
     * Returns the verbnurbs Line object
     * @param inputs Line to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Line.LineDto): any;
    /**
     * Converts lines to a NURBS curves
     * Returns array of the verbnurbs Line objects
     * @param inputs Lines to be transformed to curves
     * @returns Verb nurbs curves
     */
    convertLinesToNurbsCurves(inputs: Inputs.Line.LinesDto): any[];
    /**
     * Gets the start point of the line
     * @param inputs Line to be queried
     * @returns Start point
     */
    getStartPoint(inputs: Inputs.Line.LineDto): number[];
    /**
     * Gets the end point of the line
     * @param inputs Line to be queried
     * @returns End point
     */
    getEndPoint(inputs: Inputs.Line.LineDto): Inputs.Base.Point3;
    /**
     * Gets the length of the line
     * @param inputs Line to be queried
     * @returns Length of the line
     */
    length(inputs: Inputs.Line.LineDto): number;
    /**
     * Reverse the endpoints of the line
     * @param inputs Line to be reversed
     * @returns Reversed line
     */
    reverse(inputs: Inputs.Line.LineDto): Inputs.Line.LinePointsDto;
    /**
     * Transform the line
     * @param inputs Line to be transformed
     * @returns Transformed line
     */
    transformLine(inputs: Inputs.Line.TransformLineDto): Inputs.Line.LinePointsDto;
    /**
     * Transforms the lines with multiple transform for each line
     * @param inputs Lines to be transformed and transformations
     * @returns Transformed lines
     */
    transformsForLines(inputs: Inputs.Line.TransformsLinesDto): Inputs.Line.LinePointsDto[];
    /**
     * Create the line
     * @param inputs Endpoints of the line
     * @returns Line
     */
    create(inputs: Inputs.Line.LinePointsDto): Inputs.Line.LinePointsDto;
    /**
     * Create the line from possibly async inputs of points
     * @param inputs Endpoints of the line
     * @returns Line
     */
    createAsync(inputs: Inputs.Line.LinePointsDto): Promise<Inputs.Line.LinePointsDto>;
    /**
     * Gets the point on the line segment at a given param
     * @param inputs Line and parameter
     * @returns Point on line
     */
    getPointOnLine(inputs: Inputs.Line.PointOnLineDto): Inputs.Base.Point3;
    /**
     * Create the line segments between all of the points in a list
     * @param inputs Lines in a list
     * @returns Lines
     */
    linesBetweenPoints(inputs: Inputs.Line.PointsLinesDto): Inputs.Line.LinePointsDto[];
    /**
     * Create the lines between two lists of start and end points of equal length
     * @param inputs Two lists of start and end points
     * @returns Lines
     */
    linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Line.LinePointsDto[];
    /**
     * Create the lines between two lists of start and end points of equal length with potential async inputs
     * @param inputs Two lists of start and end points
     * @returns Lines
     */
    linesBetweenStartAndEndPointsAsync(inputs: Inputs.Line.LineStartEndPointsDto): Promise<Inputs.Line.LinePointsDto[]>;
    private createLineSystemMesh;
}/**
 * Contains various list methods.
 */
declare class Lists {
    constructor();
    /**
     * Gets an item from the list by using a 0 based index
     * @param inputs a list and an index
     * @returns item
     * @group get
     * @shortname item by index
     * @drawable false
     */
    getItem(inputs: Inputs.Lists.ListItemDto): any;
    /**
       * Gets a sub list between start and end indexes
       * @param inputs a list and start and end indexes
       * @returns sub list
       * @group get
       * @shortname sublist
       * @drawable false
       */
    getSubList(inputs: Inputs.Lists.SubListDto): any;
    /**
     * Reverse the list
     * @param inputs a list and an index
     * @returns item
     * @group edit
     * @shortname reverse
     * @drawable false
     */
    reverse(inputs: Inputs.Lists.ListDto): any;
    /**
     * Flip 2d lists - every nth element of each list will form a separate list
     * @param inputs a list of lists to flip
     * @returns item
     * @group edit
     * @shortname flip lists
     * @drawable false
     */
    flipLists(inputs: Inputs.Lists.ListDto): any;
    /**
     * Gets the length of the list
     * @param inputs a length list
     * @returns a number
     * @group get
     * @shortname list length
     * @drawable false
     */
    listLength(inputs: Inputs.Lists.ListDto): number;
    /**
     * Add item to the list
     * @param inputs a list, item and an index
     * @returns list with added item
     * @group add
     * @shortname item at index
     * @drawable false
     */
    addItemAtIndex(inputs: Inputs.Lists.AddItemAtIndexDto): any;
    /**
     * Remove item from the list
     * @param inputs a list and index
     * @returns list with removed item
     * @group remove
     * @shortname item at index
     * @drawable false
     */
    removeItemAtIndex(inputs: Inputs.Lists.RemoveItemAtIndexDto): any;
    /**
     * Add item to the beginning or the end of the list
     * @param inputs a list, item and an option for first or last position
     * @returns list with added item
     * @group add
     * @shortname item at first or last
     * @drawable false
     */
    addItemFirstLast(inputs: Inputs.Lists.AddItemFirstLastDto): any;
    /**
     * Creates an empty list
     * @returns an empty array list
     * @group create
     * @shortname empty list
     * @drawable false
     */
    createEmptyList(): [];
    /**
     * Repeat the item and add it in the new list
     * @param inputs an item to multiply
     * @returns list
     * @group create
     * @shortname repeat
     * @drawable false
     */
    repeat(inputs: Inputs.Lists.MultiplyItemDto): any;
}{};/**
 * Contains various logic methods.
 */
declare class Logic {
    constructor();
    /**
     * Creates a boolean
     * @param inputs a true or false boolean
     * @returns boolean
     * @group create
     * @shortname boolean
     * @drawable false
     */
    boolean(inputs: Inputs.Logic.BooleanDto): boolean;
    /**
     * Does comparison between first and second values
     * @param inputs two values to be compared
     * @returns Result of the comparison
     * @group operations
     * @shortname compare
     * @drawable false
     */
    compare(inputs: Inputs.Logic.ComparisonDto): boolean;
    /**
     * Transmits a value if boolean provided is true and undefined if boolean provided is false
     * @param inputs a value and a boolean value
     * @returns value or undefined
     * @group operations
     * @shortname value gate
     * @drawable false
     */
    valueGate(inputs: Inputs.Logic.ValueGateDto): any;
}/**
 * Contains various math methods.
 */
declare class MathBitByBit {
    constructor();
    /**
     * Creates a number
     * @param inputs a number to be created
     * @returns number
     * @group create
     * @shortname number
     * @drawable false
     */
    number(inputs: Inputs.Math.NumberDto): number;
    /**
     * Does basic math operations
     * @param inputs two numbers and operator
     * @returns Result of math operation action
     * @group operations
     * @shortname two numbers
     * @drawable false
     */
    twoNrOperation(inputs: Inputs.Math.ActionOnTwoNumbersDto): number;
    /**
     * Does basic math operations on one number
     * @param inputs one number and operator action
     * @returns Result of math operation
     * @group operations
     * @shortname one number
     * @drawable false
     */
    oneNrOperation(inputs: Inputs.Math.ActionOnOneNumberDto): number;
    /**
    * Remaps a number from one range to another
    * @param inputs one number and operator action
    * @returns Result of mapping
    * @group operations
    * @shortname remap
    * @drawable false
    */
    remap(inputs: Inputs.Math.RemapNumberDto): number;
}{};declare class OCCTWIO extends OCCTIO {
    readonly occWorkerManager: OCCTWorkerManager;
    private readonly geometryHelper;
    constructor(occWorkerManager: OCCTWorkerManager, geometryHelper: GeometryHelper);
    /**
     * Imports the step or iges asset file
     * @group io
     * @shortname load step | iges
     * @returns OCCT Shape
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.ImportStepIgesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Saves the stl file
     * @param inputs STL filename and shape to be saved
     * @group io
     * @shortname save stl
     * @returns String of a stl file
     */
    saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto>;
}/**
 * Contains various methods for OpenCascade implementation
 */
declare class OCCTW extends OCCT {
    private readonly context;
    readonly occWorkerManager: OCCTWorkerManager;
    private readonly geometryHelper;
    private readonly solidText;
    private readonly vector;
    readonly io: OCCTWIO;
    constructor(context: Context, occWorkerManager: OCCTWorkerManager, geometryHelper: GeometryHelper, solidText: JSCADText, vector: Vector);
    /**
     * Draws OpenCascade shape by going through faces and edges
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     * @group drawing
     * @shortname draw shape
     * @drawable false
     * @ignore true
     */
    drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Mesh>;
    private computeFaceMiddlePos;
    private computeEdgeMiddlePos;
}/**
 * Contains various methods for points. Point in bitbybit is simply an array containing 3 numbers for [x, y, z].
 * Because of this form Point can be interchanged with Vector, which also is an array in [x, y, z] form.
 * When creating 2D points, z coordinate is simply set to 0 - [x, y, 0].
 */
declare class Point {
    private readonly context;
    private readonly geometryHelper;
    private readonly line;
    constructor(context: Context, geometryHelper: GeometryHelper, line: Line);
    /**
     * Draws a single point
     * @param inputs Contains a point to be drawn
     * @returns Mesh that is being drawn by Babylon
     * @group draw
     * @shortname point
     * @drawable false
     * @ignore true
     */
    drawPoint(inputs: Inputs.Point.DrawPointDto): Mesh;
    /**
     * Draws multiple points
     * @param inputs Contains a point array to be drawn
     * @returns Mesh that is being drawn by Babylon
     * @group draw
     * @shortname points sync
     * @drawable false
     * @ignore true
     */
    drawPoints(inputs: Inputs.Point.DrawPointsDto): Mesh;
    /**
     * Draws multiple points async
     * @param inputs Contains a point array to be drawn
     * @returns Promise of a Mesh that will being drawn by Babylon
     * @group draw
     * @shortname points
     * @drawable false
     * @ignore true
     */
    drawPointsAsync(inputs: Inputs.Point.DrawPointsDto): Promise<Mesh>;
    /**
     * Transforms the single point
     * @param inputs Contains a point and the transformations to apply
     * @returns Transformed point
     * @group transforms
     * @shortname transform point
     * @drawable true
     */
    transformPoint(inputs: Inputs.Point.TransformPointDto): Inputs.Base.Point3;
    /**
     * Transforms multiple points
     * @param inputs Contains points and the transformations to apply
     * @returns Transformed points
     * @group transforms
     * @shortname transform points
     * @drawable true
     */
    transformPoints(inputs: Inputs.Point.TransformPointsDto): Inputs.Base.Point3[];
    /**
     * Transforms multiple points by multiple transformations
     * @param inputs Contains points and the transformations to apply
     * @returns Transformed points
     * @group transforms
     * @shortname transforms for points
     * @drawable true
     */
    transformsForPoints(inputs: Inputs.Point.TransformsForPointsDto): Inputs.Base.Point3[];
    /**
     * Measures the closest distance between a point and a collection of points
     * @param inputs Point from which to measure and points to measure the distance against
     * @returns Distance to closest point
     * @group extract
     * @shortname distance to closest pt
     * @drawable false
     */
    closestPointFromPointsDistance(inputs: Inputs.Point.ClosestPointFromPointsDto): number;
    /**
     * Finds the closest point index between a point and a collection of points. Caution, index is not 0 based, it starts with 1.
     * @param inputs Point from which to find the index in a collection of points
     * @returns Closest point index
     * @group extract
     * @shortname index of closest pt
     * @drawable false
     */
    closestPointFromPointsIndex(inputs: Inputs.Point.ClosestPointFromPointsDto): number;
    /**
     * Finds the closest point in a collection
     * @param inputs Point and points collection to find the closest point in
     * @returns Closest point
     * @group extract
     * @shortname closest pt
     * @drawable true
     */
    closestPointFromPoints(inputs: Inputs.Point.ClosestPointFromPointsDto): Inputs.Base.Point3;
    /**
     * Finds the distance between two points
     * @param inputs Coordinates of start and end points
     * @returns Distance
     * @group measure
     * @shortname distance
     * @drawable false
     */
    distance(inputs: Inputs.Point.StartEndPointsDto): number;
    /**
     * Multiply point by a specified amount
     * @param inputs The point to be multiplied and the amount of points to create
     * @returns Distance
     * @group transforms
     * @shortname multiply point
     * @drawable true
     */
    multiplyPoint(inputs: Inputs.Point.MultiplyPointDto): Inputs.Base.Point3[];
    /**
     * Get x coordinate of the point
     * @param inputs The point
     * @returns X coordinate
     * @group get
     * @shortname x coord
     * @drawable false
     */
    getX(inputs: Inputs.Point.PointDto): number;
    /**
     * Get y coordinate of the point
     * @param inputs The point
     * @returns Y coordinate
     * @group get
     * @shortname y coord
     * @drawable false
     */
    getY(inputs: Inputs.Point.PointDto): number;
    /**
     * Get z coordinate of the point
     * @param inputs The point
     * @returns Z coordinate
     * @group get
     * @shortname z coord
     * @drawable false
     */
    getZ(inputs: Inputs.Point.PointDto): number;
    /**
     * Get average point of points
     * @param inputs The points
     * @returns point
     * @group extract
     * @shortname average point
     * @drawable true
     */
    averagePoint(inputs: Inputs.Point.PointsDto): Base.Point3;
    /**
     * Creates the xyz point
     * @param inputs xyz information
     * @returns point 3d
     * @group create
     * @shortname point xyz
     * @drawable true
     */
    pointXYZ(inputs: Inputs.Point.PointXYZDto): Inputs.Base.Point3;
    /**
     * Creates the xy point
     * @param inputs xy information
     * @returns point 3d
     * @group create
     * @shortname point xy
     * @drawable false
     */
    pointXY(inputs: Inputs.Point.PointXYDto): Inputs.Base.Point2;
    /**
     * Creates the spiral out of multiple points
     * @param inputs Spiral information
     * @returns Specified number of points in the array along the spiral
     * @group create
     * @shortname spiral
     * @drawable true
     */
    spiral(inputs: Inputs.Point.SpiralDto): Inputs.Base.Point3[];
    /**
     * Creates a flat point grid on XY plane. This grid contains center points for hexagons of the given radius.
     * Be aware that we control only the nr of hexagons to be made and not the length and width of the grid.
     * @param inputs Information about hexagon and the grid
     * @returns Points in the array on the grid
     * @group create
     * @shortname hex grid
     * @drawable true
     */
    hexGrid(inputs: Inputs.Point.HexGridCentersDto): Inputs.Base.Point3[];
    private closestPointFromPointData;
    private createNewMesh;
    private updatePoints;
    private setUpPositionsAndColours;
}/**
 * Contains various methods for polyline. Polyline in bitbybit is a simple object that has points property containing an array of points.
 * { points: number[][] }
 */
declare class Polyline {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single polyline
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolyline(inputs: Inputs.Polyline.DrawPolylineDto): LinesMesh;
    /**
     * Draws multiple polylines
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolylines(inputs: Inputs.Polyline.DrawPolylinesDto): LinesMesh;
    /**
     * Converts a polyline to a NURBS curve
     * Returns the verbnurbs NurbsCurve object
     * @param inputs Polyline to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Polyline.PolylineDto): any;
    /**
     * Gets the length of the polyline
     * @param inputs Polyline to be queried
     * @returns Length of the polyline
     */
    length(inputs: Inputs.Polyline.PolylineDto): number;
    /**
     * Gets the number of points in the polyline
     * @param inputs Polyline to be queried
     * @returns Number of points in polyline
     */
    countPoints(inputs: Inputs.Polyline.PolylineDto): number;
    /**
     * Gets the points of the polyline
     * @param inputs Polyline to be queried
     * @returns Points of the polyline
     */
    getPoints(inputs: Inputs.Polyline.PolylineDto): number[][];
    /**
     * Reverse the points of the polyline
     * @param inputs Polyline to be reversed
     * @returns Reversed polyline
     */
    reverse(inputs: Inputs.Polyline.PolylineDto): Inputs.Polyline.PolylinePropertiesDto;
    /**
     * Transform the polyline
     * @param inputs Polyline to be transformed
     * @returns Transformed polyline
     */
    transformPolyline(inputs: Inputs.Polyline.TransformPolylineDto): Inputs.Polyline.PolylinePropertiesDto;
    /**
     * Create the polyline
     * @param inputs Points of the polyline
     * @returns Polyline
     */
    create(inputs: Inputs.Polyline.PolylinePropertiesDto): Inputs.Polyline.PolylinePropertiesDto;
}/**
 * Tags help you to put text on top of your 3D objects. Tags are heavily used in data visualization scenarios
 * where you need to convery additional textual information.
 */
declare class Tag {
    /**
     * Creates a tag dto
     * @param inputs Tag description
     * @returns A tag
     */
    create(inputs: Inputs.Tag.TagDto): Inputs.Tag.TagDto;
    /**
     * Draws a single tag
     * @param inputs Information to draw the tag
     * @returns A tag
     */
    drawTag(inputs: Inputs.Tag.DrawTagDto): Inputs.Tag.TagDto;
    /**
     * Draws multiple tags
     * @param inputs Information to draw the tags
     * @returns Tags
     */
    drawTags(inputs: Inputs.Tag.DrawTagsDto): Inputs.Tag.TagDto[];
}/**
 * Contains various text methods.
 */
declare class TextBitByBit {
    constructor();
    /**
     * Creates a text
     * @param inputs a text
     * @returns text
     * @group create
     * @shortname text
     * @drawable false
     */
    create(inputs: Inputs.Text.TextDto): string;
    /**
    * Split the text to multiple pieces by a separator
    * @param inputs a text
    * @returns text
    * @group transform
    * @shortname split
    * @drawable false
    */
    split(inputs: Inputs.Text.TextSplitDto): string[];
    /**
    * Replace all occurrences of a text by another text
    * @param inputs a text
    * @returns text
    * @group transform
    * @shortname replaceAll
    * @drawable false
    */
    replaceAll(inputs: Inputs.Text.TextReplaceDto): string;
    /**
    * Join multiple items by a separator into text
    * @param inputs a list of items
    * @returns text
    * @group transform
    * @shortname join
    * @drawable false
    */
    join(inputs: Inputs.Text.TextJoinDto): string;
    /**
    * Transform any item to text
    * @param inputs any item
    * @returns text
    * @group transform
    * @shortname to string
    * @drawable false
    */
    toString(inputs: Inputs.Text.ToStringDto): string;
    /**
    * Transform each item in list to text
    * @param inputs list of items
    * @returns texts
    * @group transform
    * @shortname to string each
    * @drawable false
    */
    toStringEach(inputs: Inputs.Text.ToStringEachDto): string[];
}{};/**
 * Time functions help to create various interactions which happen in time
 */
declare class Time {
    /**
     * Registers a function to render loop
     * @param update The function to call in render loop
     */
    registerRenderFunction(update: (timePassedMs: number) => void): void;
}/**
 * Contains various methods for vector mathematics. Vector in bitbybit is simply an array, usually containing numbers.
 * In 3D [x, y, z] form describes space, where y is the up vector.
 * Because of this form Vector can be interchanged with Point, which also is an array in [x, y, z] form.
 */
declare class Vector {
    private readonly context;
    constructor(context: Context);
    /**
     * Measures the angle between two vectors in degrees
     * @param inputs Contains two vectors represented as number arrays
     * @group angles
     * @shortname angle
     * @returns Number in degrees
     * @drawable false
     */
    angleBetween(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Measures the normalized 2d angle between two vectors in degrees
     * @param inputs Contains two vectors represented as number arrays
     * @returns Number in degrees
     * @group angles
     * @shortname angle normalized 2d
     * @drawable false
     */
    angleBetweenNormalized2d(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Measures a positive angle between two vectors given the reference vector in degrees
     * @param inputs Contains information of two vectors and a reference vector
     * @returns Number in degrees
     * @group angles
     * @shortname positive angle
     * @drawable false
     */
    positiveAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number;
    /**
     * Adds all vector xyz values together and create a new vector
     * @param inputs Vectors to be added
     * @returns New vector that has xyz values as sums of all the vectors
     * @group sum
     * @shortname add all
     * @drawable false
     */
    addAll(inputs: Inputs.Vector.VectorsDto): number[];
    /**
     * Adds two vectors together
     * @param inputs Two vectors to be added
     * @returns Number array representing vector
     * @group sum
     * @shortname add
     * @drawable false
     */
    add(inputs: Inputs.Vector.TwoVectorsDto): number[];
    /**
     * Checks if the boolean array contains only true values, if there's a single false it will return false.
     * @param inputs Vectors to be checked
     * @returns Boolean indicating if vector contains only true values
     * @group sum
     * @shortname all
     * @drawable false
     */
    all(inputs: Inputs.Vector.VectorBoolDto): boolean;
    /**
     * Cross two vectors
     * @param inputs Two vectors to be crossed
     * @group base
     * @shortname all
     * @returns Crossed vector
     * @drawable false
     */
    cross(inputs: Inputs.Vector.TwoVectorsDto): number[];
    /**
     * Squared distance between two vectors
     * @param inputs Two vectors
     * @returns Number representing squared distance between two vectors
     * @group distance
     * @shortname dist squared
     * @drawable false
     */
    distSquared(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Distance between two vectors
     * @param inputs Two vectors
     * @returns Number representing distance between two vectors
     * @group distance
     * @shortname dist
     * @drawable false
     */
    dist(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Divide the vector by a scalar value
     * @param inputs Contains vector and a scalar
     * @returns Vector that is a result of division by a scalar
     * @group base
     * @shortname div
     * @drawable false
     */
    div(inputs: Inputs.Vector.VectorScalarDto): number[];
    /**
     * Computes the domain between minimum and maximum values of the vector
     * @param inputs Vector information
     * @returns Number representing distance between two vectors
     * @group base
     * @shortname domain
     * @drawable false
     */
    domain(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Dot product between two vectors
     * @param inputs Two vectors
     * @returns Number representing dot product of the vector
     * @group base
     * @shortname dot
     * @drawable false
     */
    dot(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Checks if vector is finite for each number and returns a boolean array
     * @param inputs Vector with possibly infinite values
     * @returns Vector array that contains boolean values for each number in the input
     * vector that identifies if value is finite (true) or infinite (false)
     * @group validate
     * @shortname finite
     * @drawable false
     */
    finite(inputs: Inputs.Vector.VectorDto): boolean[];
    /**
     * Checks if the vector is zero length
     * @param inputs Vector to be checked
     * @returns Boolean that identifies if vector is zero length
     * @group validate
     * @shortname isZero
     * @drawable false
     */
    isZero(inputs: Inputs.Vector.VectorDto): boolean;
    /**
     * Finds in between vector between two vectors by providing a fracture
     * @param inputs Information for finding vector between two vectors using a fraction
     * @returns Vector that is in between two vectors
     * @group distance
     * @shortname lerp
     * @drawable false
     */
    lerp(inputs: Inputs.Vector.FractionTwoVectorsDto): number[];
    /**
     * Finds the maximum value in the vector
     * @param inputs Vector to be checked
     * @returns Largest number in the vector
     * @group extract
     * @shortname max
     * @drawable false
     */
    max(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Finds the minimum value in the vector
     * @param inputs Vector to be checked
     * @returns Lowest number in the vector
     * @group extract
     * @shortname min
     * @drawable false
     */
    min(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Multiple vector with the scalar
     * @param inputs Vector with a scalar
     * @returns Vector that results from multiplication
     * @group base
     * @shortname mul
     * @drawable false
     */
    mul(inputs: Inputs.Vector.VectorScalarDto): number[];
    /**
     * Negates the vector
     * @param inputs Vector to negate
     * @returns Negative vector
     * @group base
     * @shortname neg
     * @drawable false
     */
    neg(inputs: Inputs.Vector.VectorDto): number[];
    /**
     * Compute squared norm
     * @param inputs Vector for squared norm
     * @returns Number that is squared norm
     * @group base
     * @shortname norm squared
     * @drawable false
     */
    normSquared(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Norm of the vector
     * @param inputs Vector to compute the norm
     * @returns Number that is norm of the vector
     * @group base
     * @shortname norm
     * @drawable false
     */
    norm(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Normalize the vector into a unit vector, that has a length of 1
     * @param inputs Vector to normalize
     * @returns Unit vector that has length of 1
     * @group base
     * @shortname normalized
     * @drawable false
     */
    normalized(inputs: Inputs.Vector.VectorDto): number[];
    /**
     * Finds a point coordinates on the given distance ray that spans between the point along the direction vector
     * @param inputs Provide a point, vector and a distance for finding a point
     * @returns Vector representing point on the ray
     * @group base
     * @shortname on ray
     * @drawable false
     */
    onRay(inputs: Inputs.Vector.RayPointDto): number[];
    /**
     * Create a xyz vector
     * @param inputs Max value for the range
     * @returns Create a vector of xyz values
     * @group create
     * @shortname vector XYZ
     * @drawable true
     */
    vectorXYZ(inputs: Inputs.Vector.VectorXYZDto): Inputs.Base.Vector3;
    /**
     * Creates a vector of integers between 0 and maximum ceiling integer
     * @param inputs Max value for the range
     * @returns Vector containing items from 0 to max
     * @group create
     * @shortname range
     * @drawable false
     */
    range(inputs: Inputs.Vector.RangeMaxDto): number[];
    /**
     * Computes signed angle between two vectors and a reference. This will always return a smaller angle between two possible angles.
     * @param inputs Contains information of two vectors and a reference vector
     * @returns Signed angle in degrees
     * @group angles
     * @shortname signed angle
     * @drawable false
     */
    signedAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number;
    /**
     * Creates a vector that contains numbers spanning between minimum and maximum values at a given step
     * @param inputs Span information containing min, max and step values
     * @returns Vector containing number between min, max and increasing at a given step
     * @group create
     * @shortname span
     * @drawable false
     */
    span(inputs: Inputs.Vector.SpanDto): number[];
    /**
     * Subtract two vectors
     * @param inputs Two vectors
     * @returns Vector that result by subtraction two vectors
     * @group base
     * @shortname sub
     * @drawable false
     */
    sub(inputs: Inputs.Vector.TwoVectorsDto): number[];
    /**
     * Sums the values of the vector
     * @param inputs Vector to sum
     * @returns Number that results by adding up all values in the vector
     * @group base
     * @shortname sum
     * @drawable false
     */
    sum(inputs: Inputs.Vector.VectorDto): number;
}/**
 * Contains various methods for nurbs circle.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbCurveCircle {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the circle Nurbs curve
     * @param inputs Circle parameters
     * @returns Circle Nurbs curve
     */
    createCircle(inputs: Inputs.Verb.CircleParametersDto): any;
    /**
     * Creates the arc Nurbs curve
     * @param inputs Arc parameters
     * @returns Arc Nurbs curve
     */
    createArc(inputs: Inputs.Verb.ArcParametersDto): any;
    /**
     * Gets the center point of the circle or an arc
     * @param inputs An arc or a circle Nurbs curve
     * @returns Point
     */
    center(inputs: Inputs.Verb.CircleDto): number[];
    /**
     * Gets the radius of the circle or an arc
     * @param inputs An arc or a circle Nurbs curve
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.CircleDto): number;
    /**
     * Gets the max angle of the arc in degrees
     * @param inputs Arc
     * @returns Max angle in degrees
     */
    maxAngle(inputs: Inputs.Verb.CircleDto): number;
    /**
     * Gets the min angle of the arc in degrees
     * @param inputs Arc
     * @returns Min angle in degrees
     */
    minAngle(inputs: Inputs.Verb.CircleDto): number;
    /**
     * Gets the x angle of the arc
     * @param inputs Circle
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.CircleDto): number[];
    /**
     * Gets the y angle of the arc
     * @param inputs Circle
     * @returns Y axis vector
     */
    yAxis(inputs: Inputs.Verb.CircleDto): number[];
}/**
 * Contains various methods for nurbs ellipse.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbCurveEllipse {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the ellipse Nurbs curve
     * @param inputs Ellipse parameters
     * @returns Ellipse Nurbs curve
     */
    createEllipse(inputs: Inputs.Verb.EllipseParametersDto): any;
    /**
     * Creates the ellipse arc Nurbs curve
     * @param inputs Ellipse arc parameters
     * @returns Ellipse arc Nurbs curve
     */
    createArc(inputs: Inputs.Verb.EllipseArcParametersDto): any;
    /**
     * Gets the center point of the ellipse or an arc
     * @param inputs The arc or the ellipse Nurbs curve
     * @returns Point
     */
    center(inputs: Inputs.Verb.EllipseDto): number[];
    /**
     * Gets the max angle of the arc in degrees
     * @param inputs Arc
     * @returns Max angle in degrees
     */
    maxAngle(inputs: Inputs.Verb.EllipseDto): number;
    /**
     * Gets the min angle of the arc in degrees
     * @param inputs Arc
     * @returns Min angle in degrees
     */
    minAngle(inputs: Inputs.Verb.EllipseDto): number;
    /**
     * Gets the x angle of the arc or an ellipse
     * @param inputs Ellipse or an arc
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.EllipseDto): number[];
    /**
     * Gets the y angle of the arc or an ellipse
     * @param inputs Ellipse or an arc
     * @returns Y axis vector
     */
    yAxis(inputs: Inputs.Verb.EllipseDto): number[];
}/**
 * Contains various methods for nurbs curves.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbCurve {
    private readonly context;
    private readonly geometryHelper;
    readonly circle: VerbCurveCircle;
    readonly ellipse: VerbCurveEllipse;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single curve
     * @param inputs Contains a curve to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurve(inputs: Inputs.Verb.DrawCurveDto): LinesMesh;
    /**
     * Draws multiple curves
     * @param inputs Contains curves to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurves(inputs: Inputs.Verb.DrawCurvesDto): LinesMesh;
    /**
     * Creates a Nurbs curve by providing knots, control points & weights
     * @param inputs Contains knots, control points and weights
     * @returns Nurbs curve
     */
    createCurveByKnotsControlPointsWeights(inputs: Inputs.Verb.CurveNurbsDataDto): any;
    /**
     * Creates a Nurbs curve by providing control points
     * @param inputs Control points
     * @returns Nurbs curve
     */
    createCurveByPoints(inputs: Inputs.Verb.CurvePathDataDto): any;
    /**
     * Creates a Bezier Nurbs curve by providing control points and weights
     * @param inputs Control points
     * @returns Bezier Nurbs curve
     */
    createBezierCurve(inputs: Inputs.Verb.BezierCurveDto): any;
    /**
     * Clone the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Nurbs curve
     */
    clone(inputs: Inputs.Verb.CurveDto): any;
    /**
     * Finds the closest param on the Nurbs curve from the point
     * @param inputs Nurbs curve with point
     * @returns Param number
     */
    closestParam(inputs: Inputs.Verb.ClosestPointDto): number;
    /**
     * Finds the closest params on the Nurbs curve from the points
     * @param inputs Nurbs curve with points
     * @returns Param numbers
     */
    closestParams(inputs: Inputs.Verb.ClosestPointsDto): number[];
    /**
     * Finds the closest point on the Nurbs curve from the point
     * @param inputs Nurbs curve with point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Verb.ClosestPointDto): Inputs.Base.Point3;
    /**
     * Finds the closest points on the Nurbs curve from the list of points
     * @param inputs Nurbs curve with points
     * @returns Points
     */
    closestPoints(inputs: Inputs.Verb.ClosestPointsDto): Inputs.Base.Point3[];
    /**
     * Finds the control points of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Points
     */
    controlPoints(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3[];
    /**
     * Finds the degree of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Degree number
     */
    degree(inputs: Inputs.Verb.CurveDto): number;
    /**
     * Finds the derivatives of the Nurbs curve at parameter
     * @param inputs Nurbs curve with specified derivative number and parameter
     * @returns Derivatives
     */
    derivatives(inputs: Inputs.Verb.CurveDerivativesDto): number[];
    /**
     * Divides the curve by equal arc length to parameters
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByEqualArcLengthToParams(inputs: Inputs.Verb.CurveSubdivisionsDto): number[];
    /**
     * Divides the curve by equal arc length to points
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByEqualArcLengthToPoints(inputs: Inputs.Verb.CurveSubdivisionsDto): Inputs.Base.Point3[];
    /**
     * Divides the curve by arc length to parameters
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByArcLengthToParams(inputs: Inputs.Verb.CurveDivideLengthDto): number[];
    /**
     * Divides the curve by arc length to points
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByArcLengthToPoints(inputs: Inputs.Verb.CurveDivideLengthDto): Inputs.Base.Point3[];
    /**
     * Divides multiple curves by equal arc length to points
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByEqualArcLengthToPoints(inputs: Inputs.Verb.CurvesSubdivisionsDto): Inputs.Base.Point3[][];
    /**
     * Divides multiple curves by arc length to points
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByArcLengthToPoints(inputs: Inputs.Verb.CurvesDivideLengthDto): Inputs.Base.Point3[][];
    /**
     * Finds the domain interval of the curve parameters
     * @param inputs Nurbs curve
     * @returns Interval domain
     */
    domain(inputs: Inputs.Verb.CurveDto): BaseTypes.IntervalDto;
    /**
     * Start point of the curve
     * @param inputs Nurbs curve
     * @returns Start point
     */
    startPoint(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3;
    /**
     * End point of the curve
     * @param inputs Nurbs curve
     * @returns End point
     */
    endPoint(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3;
    /**
     * Start points of the curves
     * @param inputs Nurbs curves
     * @returns Start points
     */
    startPoints(inputs: Inputs.Verb.CurvesDto): Inputs.Base.Point3[];
    /**
     * End points of the curves
     * @param inputs Nurbs curves
     * @returns End points
     */
    endPoints(inputs: Inputs.Verb.CurvesDto): Inputs.Base.Point3[];
    /**
     * Finds the knots of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Knots
     */
    knots(inputs: Inputs.Verb.CurveDto): number[];
    /**
     * Gets the length of the Nurbs curve at specific parameter
     * @param inputs Nurbs curve and parameter
     * @returns Length
     */
    lengthAtParam(inputs: Inputs.Verb.CurveParameterDto): number;
    /**
     * Gets the length of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Length
     */
    length(inputs: Inputs.Verb.CurveDto): number;
    /**
     * Gets the param at specified length on the Nurbs curve
     * @param inputs Nurbs curve, length and tolerance
     * @returns Parameter
     */
    paramAtLength(inputs: Inputs.Verb.CurveLengthToleranceDto): number;
    /**
     * Gets the point at specified parameter on the Nurbs curve
     * @param inputs Nurbs curve and a parameter
     * @returns Point
     */
    pointAtParam(inputs: Inputs.Verb.CurveParameterDto): Inputs.Base.Point3;
    /**
     * Gets the points at specified parameter on the Nurbs curves
     * @param inputs Nurbs curves and a parameter
     * @returns Points in arrays for each curve
     */
    pointsAtParam(inputs: Inputs.Verb.CurvesParameterDto): Inputs.Base.Point3[];
    /**
     * Reverses the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Reversed Nurbs curve
     */
    reverse(inputs: Inputs.Verb.CurveDto): any;
    /**
     * Splits the Nurbs curve in two at a given parameter
     * @param inputs Nurbs curve with parameter
     * @returns Nurbs curves
     */
    split(inputs: Inputs.Verb.CurveParameterDto): any[];
    /**
     * Tangent of the Nurbs curve at a given parameter
     * @param inputs Nurbs curve with parameter
     * @returns Tangent vector
     */
    tangent(inputs: Inputs.Verb.CurveParameterDto): Inputs.Base.Vector3;
    /**
     * Tessellates the Nurbs curve into a list of points
     * @param inputs Nurbs curve with tolerance
     * @returns Points
     */
    tessellate(inputs: Inputs.Verb.CurveToleranceDto): Inputs.Base.Point3[];
    /**
     * Transforms the Nurbs curve
     * @param inputs Nurbs curve with transformation matrixes
     * @returns Transformed curve
     */
    transform(inputs: Inputs.Verb.CurveTransformDto): any;
    /**
     * Transforms the Nurbs curves
     * @param inputs Nurbs curves with transformation matrixes
     * @returns Transformed curves
     */
    transformCurves(inputs: Inputs.Verb.CurvesTransformDto): any[];
    /**
     * Weights of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Weights
     */
    weights(inputs: Inputs.Verb.CurveDto): number[];
}/**
 * Functions that allow to intersect various geometric entities and get the results
 */
declare class VerbIntersect {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Intersects two verb Nurbs curves together and returns intersection results
     * @param inputs Two Nurbs curves
     * @returns Intersection results
     */
    curves(inputs: Inputs.Verb.CurveCurveDto): BaseTypes.CurveCurveIntersection[];
    /**
     * Intersects curve and surface
     * @param inputs Nurbs curve and a Nurbs surface
     * @returns Intersection results
     */
    curveAndSurface(inputs: Inputs.Verb.CurveSurfaceDto): BaseTypes.CurveSurfaceIntersection[];
    /**
     * Intersects two surfaces
     * @param inputs Nurbs curve and a Nurbs surface
     * @returns Nurbs curves along the intersection
     */
    surfaces(inputs: Inputs.Verb.SurfaceSurfaceDto): any[];
    /**
     * Gets intersection parameters on the first curve from curve-curve intersection
     * @param inputs Intersections data
     * @returns Parameters on first curve
     */
    curveCurveFirstParams(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[];
    /**
     * Gets intersection parameters on the second curve from curve-curve intersection
     * @param inputs Intersections data
     * @returns Parameters on second curve
     */
    curveCurveSecondParams(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[];
    /**
     * Gets intersection points on the first curve from curve-curve intersection
     * @param inputs Intersections data
     * @returns Points on first curve
     */
    curveCurveFirstPoints(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[][];
    /**
     * Gets intersection points on the second curve from curve-curve intersection
     * @param inputs Intersections data
     * @returns Points on second curve
     */
    curveCurveSecondPoints(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[][];
    /**
     * Gets intersection parameters on the curve from curve-surface intersection
     * @param inputs Intersections data
     * @returns Parameters on the curve
     */
    curveSurfaceCurveParams(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[];
    /**
     * Gets intersection parameters on the surface from curve-surface intersection
     * @param inputs Intersections data
     * @returns Parameters on the surface
     */
    curveSurfaceSurfaceParams(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): BaseTypes.UVDto[];
    /**
     * Gets intersection points on the curve from curve-surface intersection
     * @param inputs Intersections data
     * @returns Points on the curve
     */
    curveSurfaceCurvePoints(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[][];
    /**
     * Gets intersection points on the surface from curve-surface intersection
     * @param inputs Intersections data
     * @returns Points on the surface
     */
    curveSurfaceSurfacePoints(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[][];
}/**
 * Conical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceConical {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the conical Nurbs surface
     * @param inputs Parameters for Nurbs conical surface
     * @returns Conical Nurbs surface
     */
    create(inputs: Inputs.Verb.ConeAndCylinderParametersDto): any;
    /**
     * Get cone axis
     * @param inputs Nurbs conical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Verb.ConeDto): number[];
    /**
     * Get cone base
     * @param inputs Nurbs conical surface
     * @returns Base point
     */
    base(inputs: Inputs.Verb.ConeDto): number[];
    /**
     * Get cone height
     * @param inputs Nurbs conical surface
     * @returns Height
     */
    height(inputs: Inputs.Verb.ConeDto): number;
    /**
     * Get cone radius
     * @param inputs Nurbs conical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.ConeDto): number;
    /**
     * Get cone x axis
     * @param inputs Nurbs conical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.ConeDto): number[];
}/**
 * Cylindrical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceCylindrical {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the cylindrical Nurbs surface
     * @param inputs Parameters for cylindrical Nurbs surface
     * @returns Cylindrical Nurbs surface
     */
    create(inputs: Inputs.Verb.ConeAndCylinderParametersDto): any;
    /**
     * Get cylinder axis
     * @param inputs Nurbs cylindrical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Verb.CylinderDto): number[];
    /**
     * Get cylinder base
     * @param inputs Nurbs cylindrical surface
     * @returns Base point
     */
    base(inputs: Inputs.Verb.CylinderDto): number[];
    /**
     * Get cylinder height
     * @param inputs Nurbs cylindrical surface
     * @returns Height
     */
    height(inputs: Inputs.Verb.CylinderDto): number;
    /**
     * Get cylinder radius
     * @param inputs Nurbs cylindrical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.CylinderDto): number;
    /**
     * Get cylinder x axis
     * @param inputs Nurbs cylindrical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.CylinderDto): number[];
}/**
 * Extrusion surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceExtrusion {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the Nurbs surface extrusion from the curve
     * @param inputs Nurbs profile curve and direction vector
     * @returns Nurbs surface
     */
    create(inputs: Inputs.Verb.ExtrusionParametersDto): any;
    /**
     * Gets the direction vector of the extrusion
     * @param inputs Extruded Nurbs surface
     * @returns Vector
     */
    direction(inputs: Inputs.Verb.ExtrusionDto): number[];
    /**
     * Gets the profile Nurbs curve of the extrusion
     * @param inputs Extruded Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Verb.ExtrusionDto): number[];
}/**
 * Revolved surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceRevolved {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the revolved Nurbs surface
     * @param inputs Parameters for Nurbs revolved surface
     * @returns Revolved Nurbs surface
     */
    create(inputs: Inputs.Verb.RevolutionParametersDto): any;
    /**
     * Get the profile Nurbs curve of the revolved Nurbs surface
     * @param inputs Revolved Nurbs surface
     * @returns Nurbs curve
     */
    profile(inputs: Inputs.Verb.RevolutionDto): any;
    /**
     * Get the center Nurbs curve of the revolved Nurbs surface
     * @param inputs Revolved Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Verb.RevolutionDto): number[];
    /**
     * Get the rotation axis of the revolved Nurbs surface
     * @param inputs Revolved Nurbs surface
     * @returns Axis vector of rotation
     */
    axis(inputs: Inputs.Verb.RevolutionDto): number[];
    /**
     * Get the angle of rotation from revolved Nurbs surface
     * @param inputs Revolved Nurbs surface
     * @returns Angle in degrees
     */
    angle(inputs: Inputs.Verb.RevolutionDto): number;
}/**
 * Spherical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceSpherical {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the spherical Nurbs surface
     * @param inputs Parameters for Nurbs spherical surface
     * @returns Spherical Nurbs surface
     */
    create(inputs: Inputs.Verb.SphericalParametersDto): any;
    /**
     * Get the radius of the spherical Nurbs surface
     * @param inputs Spherical Nurbs surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.SphereDto): number;
    /**
     * Get the center of the spherical Nurbs surface
     * @param inputs Spherical Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Verb.SphereDto): number[];
}/**
 * Sweep surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceSweep {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the sweep Nurbs surface
     * @param inputs Parameters for Nurbs sweep surface
     * @returns Sweep Nurbs surface
     */
    create(inputs: Inputs.Verb.SweepParametersDto): any;
    /**
     * Get the profile Nurbs curve of the swept Nurbs surface
     * @param inputs Sweep Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Verb.SweepDto): any;
    /**
     * Get the rail Nurbs curve of the swept Nurbs surface
     * @param inputs Sweep Nurbs surface
     * @returns Rail Nurbs curve
     */
    rail(inputs: Inputs.Verb.SweepDto): any;
}/**
 * Contains various functions for Nurbs surfaces.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurface {
    private readonly context;
    private readonly geometryHelper;
    readonly cone: VerbSurfaceConical;
    readonly cylinder: VerbSurfaceCylindrical;
    readonly extrusion: VerbSurfaceExtrusion;
    readonly sphere: VerbSurfaceSpherical;
    readonly revolved: VerbSurfaceRevolved;
    readonly sweep: VerbSurfaceSweep;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single surface
     * @param inputs Contains a surface and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurface(inputs: Inputs.Verb.DrawSurfaceDto): Mesh;
    /**
     * Draws multiple surfaces
     * @param inputs Contains the Nurbs surfaces and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfaces(inputs: Inputs.Verb.DrawSurfacesDto): Mesh;
    /**
     * Draws multiple surfaces with multiple colours. Number of colours has to be equal to number of surfaces
     * @param inputs Contains the Nurbs surfaces, colours and other information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto): Mesh;
    /**
     * Gets the boundary edge Nurbs curves of the surface in a list
     * @param inputs Nurbs surface
     * @returns Array of curves
     */
    boundaries(inputs: Inputs.Verb.SurfaceDto): any[];
    /**
     * Creates the surface by providing 4 points as corners
     * @param inputs 4 points
     * @returns Nurbs surface
     */
    createSurfaceByCorners(inputs: Inputs.Verb.CornersDto): any;
    /**
     * Creates the Nurbs surface by providing uv knots, uv degrees, points and weights
     * @param inputs Surface creation information
     * @returns Nurbs surface
     */
    createSurfaceByKnotsControlPointsWeights(inputs: Inputs.Verb.KnotsControlPointsWeightsDto): any;
    /**
     * Creates the Nurbs surface by lofting curves
     * @param inputs Curves to loft through
     * @returns Nurbs surface
     */
    createSurfaceByLoftingCurves(inputs: Inputs.Verb.LoftCurvesDto): any;
    /**
     * Clone the Nurbs surface
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    clone(inputs: Inputs.Verb.SurfaceDto): any;
    /**
     * Finds the closest parameter on the surface from the point
     * @param inputs Nurbs surface with a point
     * @returns UV parameters
     */
    closestParam(inputs: Inputs.Verb.SurfaceParamDto): BaseTypes.UVDto;
    /**
     * Finds the closest point on the surface from the point
     * @param inputs Nurbs surface with a point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Verb.SurfaceParamDto): number[];
    /**
     * Gets the control points on the surface
     * @param inputs Nurbs surface
     * @returns Two dimensional array of points
     */
    controlPoints(inputs: Inputs.Verb.SurfaceDto): number[][][];
    /**
     * Gets the U degree of the surface
     * @param inputs Nurbs surface
     * @returns U degree
     */
    degreeU(inputs: Inputs.Verb.SurfaceDto): number;
    /**
     * Gets the V degree of the surface
     * @param inputs Nurbs surface
     * @returns V degree
     */
    degreeV(inputs: Inputs.Verb.SurfaceDto): number;
    /**
     * Gets the derivatives of the surface at specified uv coordinate
     * @param inputs Nurbs surface
     * @returns Two dimensional array of vectors
     */
    derivatives(inputs: Inputs.Verb.DerivativesDto): number[][][];
    /**
     * Gets the U domain of the surface
     * @param inputs Nurbs surface
     * @returns U domain as interval
     */
    domainU(inputs: Inputs.Verb.SurfaceDto): BaseTypes.IntervalDto;
    /**
     * Gets the V domain of the surface
     * @param inputs Nurbs surface
     * @returns V domain as interval
     */
    domainV(inputs: Inputs.Verb.SurfaceDto): BaseTypes.IntervalDto;
    /**
     * Gets the Nurbs isocurve on the surface
     * @param inputs Nurbs surface
     * @returns Nurbs curve
     */
    isocurve(inputs: Inputs.Verb.SurfaceParameterDto): any;
    /**
     * Subdivides surface into preferred number of isocurves
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesSubdivision(inputs: Inputs.Verb.IsocurveSubdivisionDto): any[];
    /**
     * Subdivides surface into isocurves on specified array of parameters
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesAtParams(inputs: Inputs.Verb.IsocurvesParametersDto): any[];
    /**
     * Gets the U knots of the surface
     * @param inputs Nurbs surface
     * @returns Knots on u direction
     */
    knotsU(inputs: Inputs.Verb.SurfaceDto): number[];
    /**
     * Gets the V knots of the surface
     * @param inputs Nurbs surface
     * @returns Knots on v direction
     */
    knotsV(inputs: Inputs.Verb.SurfaceDto): number[];
    /**
     * Gets the normal on the surface at uv coordinate
     * @param inputs Nurbs surface
     * @returns Normal vector
     */
    normal(inputs: Inputs.Verb.SurfaceLocationDto): number[];
    /**
     * Gets the point on the surface at uv coordinate
     * @param inputs Nurbs surface
     * @returns Point
     */
    point(inputs: Inputs.Verb.SurfaceLocationDto): number[];
    /**
     * Reverse the Nurbs surface. This will reverse the UV origin and isocurve directions
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    reverse(inputs: Inputs.Verb.SurfaceDto): any;
    /**
     * Splits the Nurbs surface in two halfs.
     * @param inputs Nurbs surface
     * @returns Two Nurbs surfaces
     */
    split(inputs: Inputs.Verb.SurfaceParameterDto): any[];
    /**
     * Transforms the Nurbs surface with a given list of transformations.
     * @param inputs Nurbs surface with transforms
     * @returns Nurbs surface
     */
    transformSurface(inputs: Inputs.Verb.SurfaceTransformDto): any;
    /**
     * Gets the weights of the surface
     * @param inputs Nurbs surface
     * @returns Two dimensional array of weights
     */
    weights(inputs: Inputs.Verb.SurfaceDto): number[][];
    private parseFaces;
}/**
 * Contains various functions for Nurbs curves and surfaces.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class Verb {
    readonly curve: VerbCurve;
    readonly surface: VerbSurface;
    readonly intersect: VerbIntersect;
    constructor(context: Context, geometryHelper: GeometryHelper);
}`;
