/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

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
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255
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
            m._m[i] = array[i];
        }
        return m;
    }
    
    static Identity() {
        return new MockMatrix();
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
    
    applyToMesh(mesh: MockMesh, updatable?: boolean) {
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
    
    static ComputeNormals(positions: number[], indices: number[] | Uint16Array | Uint32Array, normals: number[], options?: { useRightHandedSystem?: boolean }) {
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
    
    constructor(name: string, scene?: MockScene) {
        this.name = name;
    }
    
    dispose() {
        if (this.onDispose) {
            this.onDispose();
        }
    }
}

export class MockPBRMetallicRoughnessMaterial extends MockMaterial {
    baseColor: MockColor3 = new MockColor3(1, 1, 1);
    metallic = 1.0;
    roughness = 0.6;
}

export class MockStandardMaterial extends MockMaterial {
    diffuseColor: MockColor3 = new MockColor3(1, 1, 1);
    emissiveColor: MockColor3 = new MockColor3(0, 0, 0);
    disableLighting = false;
}

export class MockMesh {
    name: string;
    private _parent: MockMesh | null = null;
    children: MockMesh[] = [];
    material: MockMaterial | null = null;
    isVisible = true;
    isPickable = true;
    position: MockVector3 = new MockVector3();
    scaling: MockVector3 = new MockVector3(1, 1, 1);
    metadata: any = null;
    _vertexData: MockVertexData | null = null;
    _scene: MockScene | null = null;
    edgesWidth = 0;
    edgesColor: MockColor4 | null = null;
    color: MockColor3 | null = null;
    _edgesRendering = false;
    
    constructor(name: string, scene?: MockScene | null) {
        this.name = name;
        this._scene = scene || null;
        if (scene) {
            scene._meshes.push(this);
        }
    }
    
    get parent(): MockMesh | null {
        return this._parent;
    }
    
    set parent(value: MockMesh | null) {
        // Remove from old parent
        if (this._parent) {
            const index = this._parent.children.indexOf(this);
            if (index > -1) {
                this._parent.children.splice(index, 1);
            }
        }
        this._parent = value;
        // Add to new parent
        if (value && !value.children.includes(this)) {
            value.children.push(this);
        }
    }
    
    dispose() {
        // Remove from parent
        if (this._parent) {
            const index = this._parent.children.indexOf(this);
            if (index > -1) {
                this._parent.children.splice(index, 1);
            }
        }
        // Dispose children
        const childrenCopy = [...this.children];
        childrenCopy.forEach(child => child.dispose());
        this.children = [];
        // Remove from scene
        if (this._scene) {
            const index = this._scene._meshes.indexOf(this);
            if (index > -1) {
                this._scene._meshes.splice(index, 1);
            }
        }
    }
    
    addChild(child: MockMesh) {
        child.parent = this;
    }
    
    getChildren() {
        return this.children;
    }
    
    getChildMeshes(): MockMesh[] {
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
    
    flipFaces(flipNormals: boolean) {
        // Mock implementation
    }
    
    setPreTransformMatrix(matrix: MockMatrix) {
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
}

export class MockInstancedMesh extends MockMesh {
    sourceMesh: MockMesh;
    
    constructor(name: string, source: MockMesh) {
        super(name);
        this.sourceMesh = source;
    }
}

export class MockLinesMesh extends MockMesh {
    enableEdgesRendering() {
        this._edgesRendering = true;
    }
}

export class MockGreasedLineMesh extends MockMesh {
    _points: number[][] = [];
    
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
    static CreateSphere(name: string, options: any, scene?: MockScene | null) {
        const mesh = new MockMesh(name, scene);
        return mesh;
    }
    
    static CreateBox(name: string, options: any, scene?: MockScene | null) {
        const mesh = new MockMesh(name, scene);
        return mesh;
    }
    
    static CreateLines(name: string, options: { points: MockVector3[] }, scene?: MockScene | null) {
        const mesh = new MockLinesMesh(name, scene);
        return mesh;
    }
    
    static CreateLineSystem(name: string | null, options: any, scene?: MockScene | null) {
        const mesh = new MockLinesMesh(name || "lineSystem", scene);
        return mesh;
    }
}

export function CreateGreasedLine(name: string, lineOptions: any, materialOptions: any, scene?: MockScene) {
    const mesh = new MockGreasedLineMesh(name, scene);
    mesh._points = lineOptions.points || [];
    mesh.material = new MockPBRMetallicRoughnessMaterial(name + "-material");
    return mesh;
}

/**
 * Create BabylonJS module mock for jest.mock()
 */
export function createBabylonJSMock() {
    return {
        Vector3: MockVector3,
        Color3: MockColor3,
        Color4: MockColor4,
        Matrix: MockMatrix,
        VertexData: MockVertexData,
        Material: MockMaterial,
        PBRMetallicRoughnessMaterial: MockPBRMetallicRoughnessMaterial,
        StandardMaterial: MockStandardMaterial,
        Mesh: MockMesh,
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
        Texture: {
            NEAREST_SAMPLINGMODE: 1,
            BILINEAR_SAMPLINGMODE: 2,
            TRILINEAR_SAMPLINGMODE: 3
        }
    };
}
