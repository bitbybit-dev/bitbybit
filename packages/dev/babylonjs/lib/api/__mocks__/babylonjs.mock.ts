 
 

/**
 * Centralized BabylonJS mocks for testing
 * This file contains all reusable mock classes for BabylonJS types
 */

export class MockVector3 {
    x: number;
    y: number;
    z: number;
    
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    static Zero() {
        return new MockVector3(0, 0, 0);
    }
    
    static FromArray(array: number[]) {
        return new MockVector3(array[0] || 0, array[1] || 0, array[2] || 0);
    }
    
    set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    
    copyFrom(source: MockVector3) {
        this.x = source.x;
        this.y = source.y;
        this.z = source.z;
        return this;
    }
    
    clone() {
        return new MockVector3(this.x, this.y, this.z);
    }
    
    add(other: MockVector3) {
        return new MockVector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
    
    subtract(other: MockVector3) {
        return new MockVector3(this.x - other.x, this.y - other.y, this.z - other.z);
    }
    
    scale(scale: number) {
        return new MockVector3(this.x * scale, this.y * scale, this.z * scale);
    }
    
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
            this.z /= len;
        }
        return this;
    }
}

export class MockColor3 {
    r: number;
    g: number;
    b: number;
    
    constructor(r = 0, g = 0, b = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    
    static FromHexString(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return new MockColor3(
                parseInt(result[1]!, 16) / 255,
                parseInt(result[2]!, 16) / 255,
                parseInt(result[3]!, 16) / 255
            );
        }
        return new MockColor3(1, 0, 0); // Default to red if parsing fails
    }
    
    static FromArray(array: number[]) {
        return new MockColor3(array[0] || 0, array[1] || 0, array[2] || 0);
    }
    
    toHexString() {
        const r = Math.round(this.r * 255).toString(16).padStart(2, "0");
        const g = Math.round(this.g * 255).toString(16).padStart(2, "0");
        const b = Math.round(this.b * 255).toString(16).padStart(2, "0");
        return `#${r}${g}${b}`;
    }
    
    clone() {
        return new MockColor3(this.r, this.g, this.b);
    }
    
    scale(scale: number) {
        return new MockColor3(this.r * scale, this.g * scale, this.b * scale);
    }
}

export class MockColor4 {
    r: number;
    g: number;
    b: number;
    a: number;
    
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

export class MockMatrix {
    _m: Float32Array;
    
    constructor() {
        this._m = new Float32Array(16);
        // Identity matrix
        this._m[0] = 1; this._m[5] = 1; this._m[10] = 1; this._m[15] = 1;
    }
    
    static FromArray(array: number[]) {
        const m = new MockMatrix();
        for (let i = 0; i < 16 && i < array.length; i++) {
            m._m[i] = array[i]!;
        }
        return m;
    }
    
    static Identity() {
        return new MockMatrix();
    }
    
    static Translation(x: number, y: number, z: number) {
        const m = new MockMatrix();
        m._m[12] = x;
        m._m[13] = y;
        m._m[14] = z;
        return m;
    }
    
    copyToArray(target: Float32Array, offset = 0) {
        for (let i = 0; i < 16; i++) {
            target[offset + i] = this._m[i]!;
        }
    }
}

export class MockVertexData {
    positions: number[] = [];
    indices: number[] | Uint16Array | Uint32Array = [];
    normals: number[] = [];
    uvs: number[] = [];
    
    set(data: Float32Array, kind: string) {
        if (kind === "position") {
            this.positions = Array.from(data);
        } else if (kind === "normal") {
            this.normals = Array.from(data);
        }
    }
    
    applyToMesh(mesh: MockMesh, _updatable?: boolean) {
        mesh._vertexData = this;
    }
    
    merge(vertexDataArray: MockVertexData[]) {
        vertexDataArray.forEach(vd => {
            const indexOffset = this.positions.length / 3;
            this.positions.push(...vd.positions);
            this.normals.push(...vd.normals);
            if (vd.uvs) {
                this.uvs.push(...vd.uvs);
            }
            if (vd.indices) {
                const indices = Array.isArray(vd.indices) ? vd.indices : Array.from(vd.indices);
                this.indices = [
                    ...(Array.isArray(this.indices) ? this.indices : Array.from(this.indices)),
                    ...indices.map(i => i + indexOffset)
                ];
            }
        });
    }
    
    static ComputeNormals(positions: number[], _indices: number[] | Uint16Array | Uint32Array, normals: number[], _options?: { useRightHandedSystem?: boolean }) {
        // Simple mock - fill normals with 0, 0, 1 for each vertex
        normals.length = 0;
        const vertexCount = positions.length / 3;
        for (let i = 0; i < vertexCount; i++) {
            normals.push(0, 0, 1);
        }
    }
}

export class MockMaterial {
    name: string;
    alpha = 1;
    alphaMode = 1;
    backFaceCulling = true;
    doubleSided = false;
    zOffset = 0;
    sideOrientation = 0;
    onDispose: (() => void) | null = null;
    
    constructor(name: string, _scene?: MockScene) {
        this.name = name;
    }
    
    dispose() {
        if (this.onDispose) {
            this.onDispose();
        }
    }
}

export class MockTexture {
    name: string;
    url: string;
    wrapU = 1; // WRAP_ADDRESSMODE
    wrapV = 1; // WRAP_ADDRESSMODE
    uScale = 1;
    vScale = 1;
    uOffset = 0;
    vOffset = 0;
    uAng = 0;
    vAng = 0;
    wAng = 0;
    hasAlpha = false;
    getAlphaFromRGB = false;
    level = 1;
    coordinatesIndex = 0;
    isBlocking = true;

    static NEAREST_SAMPLINGMODE = 1;
    static BILINEAR_SAMPLINGMODE = 2;
    static TRILINEAR_SAMPLINGMODE = 3;
    static WRAP_ADDRESSMODE = 1;
    static CLAMP_ADDRESSMODE = 0;
    static MIRROR_ADDRESSMODE = 2;

    constructor(url: string, _scene?: MockScene, _noMipmap?: boolean, _invertY?: boolean, _samplingMode?: number) {
        this.url = url;
        this.name = url;
    }

    dispose() {
        // Mock dispose
    }
}

/**
 * What the package attaches to a mesh. Babylon treats `metadata` as free user data typed `any`, so
 * this is not the engine's shape - it is the set this package actually writes there and reads back,
 * which is what a mock should describe.
 */
export type MockMeshMetadata = {
    options?: unknown;
    shadowGenerators?: unknown;
    type?: unknown;
    shadows?: unknown;
    linesForRenderLengths?: unknown;
    xr?: unknown;
    guiManager?: unknown;
    pointIndices?: unknown;
    matricesData?: unknown;
    thinInstanceBuffer?: unknown;
    existingProp?: unknown;
};

export class MockPBRMetallicRoughnessMaterial extends MockMaterial {
    baseColor: MockColor3 = new MockColor3(1, 1, 1);
    metallic = 1.0;
    roughness = 0.6;
    emissiveColor: MockColor3 = new MockColor3(0, 0, 0);
    baseTexture: MockTexture | null = null;
    metallicRoughnessTexture: MockTexture | null = null;
    normalTexture: MockTexture | null = null;
    emissiveTexture: MockTexture | null = null;
    occlusionTexture: MockTexture | null = null;
    alphaCutOff = 0.5;
    transparencyMode: number | null = null;
    disableLighting = false;

    static PBRMATERIAL_OPAQUE = 0;
    static PBRMATERIAL_ALPHATEST = 1;
    static PBRMATERIAL_ALPHABLEND = 2;
}

export class MockStandardMaterial extends MockMaterial {
    diffuseColor: MockColor3 = new MockColor3(1, 1, 1);
    emissiveColor: MockColor3 = new MockColor3(0, 0, 0);
    disableLighting = false;
}

/**
 * A node that is deliberately not a mesh.
 *
 * The synchronous draw path skips its detect chain when the entity it was handed is already a
 * `BABYLON.Mesh`, on the grounds that such an entity is being updated rather than drawn. A test for
 * the node branch therefore needs something that is a node and is not a mesh, which the mesh mock
 * cannot be.
 */
export class MockTransformNode {
    name: string;
    id: string;
    metadata: Record<string, unknown> | null = null;
    isPickable = true;
    constructor(name: string) {
        this.name = name;
        this.id = name;
    }
    getChildMeshes(): MockMesh[] { return []; }
    dispose(): void { /* nothing to release in a mock */ }
}

export class MockMesh extends MockTransformNode {
    children: MockMesh[] = [];
    material: MockMaterial | null = null;
    isVisible = true;
    override isPickable = true;
    position: MockVector3 = new MockVector3();
    scaling: MockVector3 = new MockVector3(1, 1, 1);
    override metadata: MockMeshMetadata | null = null;
    _vertexData: MockVertexData | null = null;
    edgesWidth = 0;
    edgesColor: MockColor4 | null = null;
    color: MockColor3 | null = null;
    _edgesRendering = false;
    
    constructor(name: string, scene?: MockScene | null) {
        super(name);
        // Make _parent and _scene non-enumerable to avoid circular reference in JSON serialization
        Object.defineProperty(this, "_parent", {
            value: null,
            writable: true,
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(this, "_scene", {
            value: scene || null,
            writable: true,
            enumerable: false,
            configurable: true
        });
        if (scene) {
            scene._meshes.push(this);
        }
    }
    
    declare _parent: MockMesh | null;
    declare _scene: MockScene | null;

    get parent(): MockMesh | null {
        return this._parent;
    }
    
    set parent(value: MockMesh | null) {
        // Remove from old parent
        const oldParent = this._parent;
        if (oldParent) {
            const index = oldParent.children.indexOf(this);
            if (index > -1) {
                oldParent.children.splice(index, 1);
            }
        }
        this._parent = value;
        // Add to new parent
        if (value && !value.children.includes(this)) {
            value.children.push(this);
        }
    }
    
    override dispose() {
        // Remove from parent
        const parent = this._parent;
        if (parent) {
            const index = parent.children.indexOf(this);
            if (index > -1) {
                parent.children.splice(index, 1);
            }
        }
        // Dispose children
        const childrenCopy = [...this.children];
        childrenCopy.forEach(child => child.dispose());
        this.children = [];
        // Remove from scene
        const scene = this._scene;
        if (scene) {
            const index = scene._meshes.indexOf(this);
            if (index > -1) {
                scene._meshes.splice(index, 1);
            }
        }
    }
    
    addChild(child: MockMesh) {
        child.parent = this;
    }
    
    getChildren() {
        return this.children;
    }
    
    override getChildMeshes(): MockMesh[] {
        // Recursively get all child meshes including instances
        const result: MockMesh[] = [];
        this.children.forEach(child => {
            result.push(child);
            result.push(...child.getChildMeshes());
        });
        return result;
    }
    
    getTotalVertices() {
        return this._vertexData ? this._vertexData.positions.length / 3 : 0;
    }
    
    flipFaces(_flipNormals: boolean) {
        // Mock implementation
    }
    
    setPreTransformMatrix(_matrix: MockMatrix) {
        // Mock implementation
    }
    
    createInstance(name: string) {
        const instance = new MockInstancedMesh(name, this);
        return instance;
    }
    
    enableEdgesRendering() {
        this._edgesRendering = true;
    }
    
    removeChild(child: MockMesh) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
            child._parent = null;
        }
    }
    
    thinInstanceSetBuffer(_kind: string, buffer: Float32Array, _stride: number, _staticBuffer: boolean) {
        // Mock implementation for thin instances
        if (!this.metadata) {
            this.metadata = {};
        }
        this.metadata.thinInstanceBuffer = buffer;
    }
}

export class MockInstancedMesh extends MockMesh {
    sourceMesh: MockMesh;
    
    constructor(name: string, source: MockMesh) {
        super(name);
        this.sourceMesh = source;
    }
}

export class MockLinesMesh extends MockMesh {
    /** The per-vertex colours the line system was built with, so a suite can assert them. */
    _colors: { r: number, g: number, b: number, a: number }[][] = [];

    override enableEdgesRendering() {
        this._edgesRendering = true;
    }
}

export class MockGreasedLineMesh extends MockMesh {
    _points: number[][] = [];
    /** The material options the line was created with, so a suite can assert colour and width. */
    _materialOptions: { color?: MockColor3, colors?: MockColor3[], width?: number, useColors?: boolean } = {};
    
    setPoints(points: number[][]) {
        this._points = points;
    }
}

export class MockScene {
    _meshes: MockMesh[] = [];
    useRightHandedSystem = false;
    
    addMesh(mesh: MockMesh) {
        this._meshes.push(mesh);
    }
    
    removeMesh(mesh: MockMesh) {
        const index = this._meshes.indexOf(mesh);
        if (index > -1) {
            this._meshes.splice(index, 1);
        }
    }
}

export class MockMeshBuilder {
    static CreateSphere(name: string, _options: Record<string, unknown>, scene?: MockScene | null) {
        const mesh = new MockMesh(name, scene);
        return mesh;
    }
    
    static CreateBox(name: string, _options: Record<string, unknown>, scene?: MockScene | null) {
        const mesh = new MockMesh(name, scene);
        return mesh;
    }
    
    static CreateLines(name: string, _options: { points: MockVector3[] }, scene?: MockScene | null) {
        const mesh = new MockLinesMesh(name, scene);
        return mesh;
    }
    
    static CreateLineSystem(
        name: string | null,
        options: { lines?: { x: number, y: number, z: number }[][]; colors?: { r: number, g: number, b: number, a: number }[][]; instance?: MockLinesMesh | null; updatable?: boolean },
        scene?: MockScene | null
    ) {
        // Babylon updates and returns the mesh it is handed as `instance`, and a line system carries
        // its points as vertex data. A mock that always made a fresh mesh and recorded no vertices
        // reported zero of them, so callers that branch on the vertex count never reached their
        // update path and the reuse could not be tested at all.
        const mesh = options.instance ?? new MockLinesMesh(name || "lineSystem", scene);
        const vertexData = new MockVertexData();
        vertexData.positions = (options.lines ?? []).flat().flatMap((p) => [p.x, p.y, p.z]);
        mesh._vertexData = vertexData;
        mesh._colors = options.colors ?? [];
        return mesh;
    }
}

export function CreateGreasedLine(
    name: string,
    lineOptions: { points?: number[][] },
    materialOptions: { color?: MockColor3, colors?: MockColor3[], width?: number, useColors?: boolean } | undefined,
    scene?: MockScene
) {
    const mesh = new MockGreasedLineMesh(name, scene);
    mesh._points = lineOptions.points || [];
    // The colour and width the line was built with are what a caller is choosing; a mock that dropped
    // the material options left every colour decision unassertable.
    mesh._materialOptions = materialOptions ?? {};
    const material = new MockPBRMetallicRoughnessMaterial(name + "-material");
    if (materialOptions?.color) {
        material.baseColor = materialOptions.color;
    }
    mesh.material = material;
    return mesh;
}

/**
 * Create BabylonJS module mock for vi.mock()
 */
export function createBabylonJSMock() {
    return {
        Vector3: MockVector3,
        Color3: MockColor3,
        Color4: MockColor4,
        Matrix: MockMatrix,
        VertexData: MockVertexData,
        Material: MockMaterial,
        Texture: MockTexture,
        PBRMetallicRoughnessMaterial: MockPBRMetallicRoughnessMaterial,
        PBRMaterial: MockPBRMetallicRoughnessMaterial,
        StandardMaterial: MockStandardMaterial,
        Mesh: MockMesh,
        TransformNode: MockTransformNode,
        InstancedMesh: MockInstancedMesh,
        LinesMesh: MockLinesMesh,
        GreasedLineMesh: MockGreasedLineMesh,
        Scene: MockScene,
        MeshBuilder: MockMeshBuilder,
        CreateGreasedLine: CreateGreasedLine,
        GreasedLineMeshMaterialType: {
            MATERIAL_TYPE_PBR: 0,
            MATERIAL_TYPE_STANDARD: 1
        },
        GreasedLineMeshColorMode: {
            COLOR_MODE_SET: 0,
            COLOR_MODE_ADD: 1,
            COLOR_MODE_MULTIPLY: 2
        }
    };
}

// Scene helper specific mock classes
export class MockEngine {
    _canvas: HTMLCanvasElement;
    _renderLoop: (() => void) | null = null;
    
    constructor(canvas: HTMLCanvasElement, _antialias?: boolean, _options?: object) {
        this._canvas = canvas;
    }
    
    setHardwareScalingLevel(_level: number) { /* mock */ }
    resize() { /* mock */ }
    
    runRenderLoop(callback: () => void) {
        this._renderLoop = callback;
    }
    
    stopRenderLoop() {
        this._renderLoop = null;
    }
    
    dispose() { /* mock */ }
}

export class MockBabylonScene {
    _meshes: MockMesh[] = [];
    metadata: { shadowGenerators: MockShadowGenerator[] } = { shadowGenerators: [] };
    clearColor: MockColor4 | null = null;
    activeCamera: MockArcRotateCamera | null = null;
    
    dispose() { /* mock */ }
    render() { /* mock */ }
}

export class MockHemisphericLight {
    name: string;
    direction: MockVector3;
    diffuse: MockColor3;
    groundColor: MockColor3;
    intensity = 1;
    
    constructor(name: string, direction: MockVector3, _scene: MockBabylonScene) {
        this.name = name;
        this.direction = direction;
        this.diffuse = new MockColor3(1, 1, 1);
        this.groundColor = new MockColor3(0.5, 0.5, 0.5);
    }
    
    dispose() { /* mock */ }
}

export class MockDirectionalLight {
    name: string;
    direction: MockVector3;
    position: MockVector3;
    diffuse: MockColor3;
    intensity = 1;
    
    constructor(name: string, direction: MockVector3, _scene: MockBabylonScene) {
        this.name = name;
        this.direction = direction;
        this.position = new MockVector3();
        this.diffuse = new MockColor3(1, 1, 1);
    }
    
    dispose() { /* mock */ }
}

export class MockShadowGenerator {
    useBlurExponentialShadowMap = false;
    blurKernel = 0;
    darkness = 0;
    
    constructor(_mapSize: number, _light: MockDirectionalLight) { /* mock */ }
}

export class MockArcRotateCamera {
    name: string;
    alpha: number;
    beta: number;
    radius: number;
    target: MockVector3;
    angularSensibilityX = 1000;
    angularSensibilityY = 1000;
    lowerRadiusLimit: number | null = null;
    upperRadiusLimit: number | null = null;
    panningSensibility = 1000;
    wheelPrecision = 3;
    maxZ = 10000;
    minZ = 0.1;
    lowerBetaLimit: number | null = null;
    upperBetaLimit: number | null = null;
    lowerAlphaLimit: number | null = null;
    upperAlphaLimit: number | null = null;
    
    constructor(
        name: string,
        alpha: number,
        beta: number,
        radius: number,
        target: MockVector3,
        scene: MockBabylonScene
    ) {
        this.name = name;
        this.alpha = alpha;
        this.beta = beta;
        this.radius = radius;
        this.target = target;
        scene.activeCamera = this;
    }
    
    attachControl(_canvas: HTMLCanvasElement, _noPreventDefault?: boolean) { /* mock */ }
    dispose() { /* mock */ }
}

export const MockTools = {
    ToRadians: (degrees: number) => degrees * (Math.PI / 180)
};

// Type definitions for test assertions
export interface MockMeshType {
    name: string;
    position: MockVector3;
    receiveShadows: boolean;
    material: object | null;
    _groundWidth?: number;
    _groundHeight?: number;
}

/**
 * Create scene helper mock for vi.mock("@babylonjs/core")
 */
export function createSceneHelperMock() {
    return {
        Engine: MockEngine,
        Scene: MockBabylonScene,
        Vector3: MockVector3,
        Color3: MockColor3,
        Color4: MockColor4,
        HemisphericLight: MockHemisphericLight,
        DirectionalLight: MockDirectionalLight,
        ShadowGenerator: MockShadowGenerator,
        ArcRotateCamera: MockArcRotateCamera,
        MeshBuilder: {
            CreateGround: (name: string, options: { width: number; height: number }, _scene: MockBabylonScene) => {
                const mesh = new MockMesh(name, null) as unknown as MockMeshType;
                mesh._groundWidth = options.width;
                mesh._groundHeight = options.height;
                mesh.receiveShadows = false;
                return mesh;
            }
        },
        StandardMaterial: MockStandardMaterial,
        Tools: MockTools,
    };
}
