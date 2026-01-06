/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

/**
 * Centralized PlayCanvas mocks for testing
 * This file contains all reusable mock classes for PlayCanvas types
 */

export class MockVec2 {
    x: number;
    y: number;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    mulScalar(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    copy(other: MockVec2) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
}

export class MockVec3 {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    copy(other: MockVec3) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        return this;
    }
    sub(other: MockVec3) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        return this;
    }
    sub2(a: MockVec3, b: MockVec3) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }
    add(other: MockVec3) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        return this;
    }
    mulScalar(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
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
    lerp(from: MockVec3, to: MockVec3, t: number) {
        this.x = from.x + (to.x - from.x) * t;
        this.y = from.y + (to.y - from.y) * t;
        this.z = from.z + (to.z - from.z) * t;
        return this;
    }
}

export class MockQuat {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    setFromEulerAngles(x: number, y: number, z: number) {
        return this;
    }
    setFromMat4(mat: any) {
        // Simplified matrix to quaternion conversion for testing
        // This is a mock implementation that just sets identity quaternion
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        return this;
    }
    transformVector(vec: MockVec3, out?: MockVec3) {
        const result = out || vec;
        return result;
    }
    mul2(a: MockQuat, b: MockQuat) {
        // Simplified quaternion multiplication for testing
        this.x = a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y;
        this.y = a.w * b.y + a.y * b.w + a.z * b.x - a.x * b.z;
        this.z = a.w * b.z + a.z * b.w + a.x * b.y - a.y * b.x;
        this.w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
        return this;
    }
}

export class MockBoundingBox {
    center = new MockVec3();
    halfExtents = new MockVec3();
    add() { }
    compute() { }
}

export class MockColor {
    r: number;
    g: number;
    b: number;
    constructor(r = 0, g = 0, b = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

export class MockCameraComponent {
    fov = 45;
    farClip = 10000;
    nearClip = 0.1;
}

export class MockEntity {
    camera: MockCameraComponent | null = null;
    name = "TestEntity";
    parent: MockEntity | null = null;
    children: MockEntity[] = [];
    _position = new MockVec3();
    _rotation = new MockQuat();
    _localScale = new MockVec3(1, 1, 1);
    localPosition?: MockVec3;
    
    constructor(name?: string) {
        if (name) {
            this.name = name;
        }
        this.localPosition = this._position;
    }
    
    getPosition() { return this._position; }
    getRotation() { return this._rotation; }
    getLocalPosition() { return this._position; }
    getLocalScale() { return this._localScale; }
    
    setPosition(x: number | MockVec3, y?: number, z?: number) {
        if (typeof x === "number" && y !== undefined && z !== undefined) {
            this._position.set(x, y, z);
        } else if (x instanceof MockVec3) {
            this._position.copy(x);
        }
    }
    setRotation(quat: MockQuat) {
        this._rotation = quat;
    }
    setLocalPosition(x: number | MockVec3, y?: number, z?: number) {
        if (typeof x === "number" && y !== undefined && z !== undefined) {
            this._position.set(x, y, z);
        } else if (x instanceof MockVec3) {
            this._position.copy(x);
        }
        if (this.localPosition) {
            if (typeof x === "number" && y !== undefined && z !== undefined) {
                this.localPosition.set(x, y, z);
            } else if (x instanceof MockVec3) {
                this.localPosition.copy(x);
            }
        }
    }
    setLocalScale(x: number | MockVec3, y?: number, z?: number) {
        if (typeof x === "number" && y !== undefined && z !== undefined) {
            this._localScale.set(x, y, z);
        } else if (x instanceof MockVec3) {
            this._localScale.copy(x);
        }
    }
    setLocalRotation(quat: MockQuat) {
        this.setRotation(quat);
    }
    lookAt(target: MockVec3) { }
    findByName() { return null; }
    findOne() { return null; }
    destroy() { 
        // Mock destroy - cleanup children references
        this.children.forEach(child => {
            child.parent = null;
        });
        this.children = [];
        if (this.parent) {
            const index = this.parent.children.indexOf(this);
            if (index > -1) {
                this.parent.children.splice(index, 1);
            }
            this.parent = null;
        }
    }
    addChild(entity: MockEntity) { 
        entity.parent = this;
        this.children.push(entity); 
    }
    addComponent(type: string, options?: any) {
        if (type === "camera") {
            this.camera = new MockCameraComponent();
            if (options) {
                Object.assign(this.camera, options);
            }
            return this.camera;
        }
        // Mock implementation for other component types
        const mockComponent = { type, ...options };
        (this as any)[type] = mockComponent;
        return mockComponent;
    }
}

export class MockGraphNode { }

export class MockScene {
    _children: any[] = [];
    findOne(callback: (node: any) => boolean) {
        return null;
    }
    addChild(entity: any) {
        this._children.push(entity);
    }
}

export class MockMouse {
    on = jest.fn();
    off = jest.fn();
    disableContextMenu = jest.fn();
}

export class MockTouch {
    on = jest.fn();
    off = jest.fn();
}

export class MockApp {
    root: any;
    mouse = new MockMouse();
    touch = new MockTouch();
    on = jest.fn();
    off = jest.fn();
    graphicsDevice = {
        vram: { vb: 0, ib: 0, tex: 0, total: 0 },
        createVertexBufferImpl: jest.fn(() => ({})),
        createIndexBufferImpl: jest.fn(() => ({})),
    };
    systems = {};

    constructor() {
        this.root = new MockEntity("root");
    }
}

/**
 * Creates a mock node with scene for mesh instances
 */
export function createMockNode() {
    return {
        scene: {
            layers: {
                getLayerById: jest.fn(() => ({
                    addMeshInstances: jest.fn(),
                    removeMeshInstances: jest.fn()
                }))
            }
        }
    };
}

/**
 * Creates PlayCanvas module mock for jest.mock()
 * Includes basic mock and extends with actual PlayCanvas where needed
 */
export function createPlayCanvasMock() {
    const actual = jest.requireActual("playcanvas");
    const mockNode = createMockNode();
    
    // Mock graphics device for instancing
    const mockGraphicsDevice = {
        vram: { vb: 0, ib: 0, tex: 0, total: 0 },
        createVertexBufferImpl: jest.fn(() => ({})),
        createIndexBufferImpl: jest.fn(() => ({})),
    };
    
    return {
        ...actual,
        Vec2: MockVec2,
        Vec3: MockVec3,
        Quat: MockQuat,
        BoundingBox: MockBoundingBox,
        Entity: MockEntity,
        Color: MockColor,
        GraphNode: MockGraphNode,
        // Mock Texture class to avoid graphics device registry issues
        Texture: class MockTexture {
            name: string;
            addressU: number;
            addressV: number;
            minFilter: number;
            magFilter: number;
            device: any;
            _source: any;
            
            constructor(graphicsDevice: any, options?: any) {
                this.device = graphicsDevice;
                this.name = options?.name || "Texture";
                this.addressU = options?.addressU ?? actual.ADDRESS_REPEAT;
                this.addressV = options?.addressV ?? actual.ADDRESS_REPEAT;
                this.minFilter = actual.FILTER_NEAREST;
                this.magFilter = actual.FILTER_NEAREST;
            }
            
            setSource(source: any) {
                this._source = source;
            }
            
            destroy() {
                // Mock cleanup
            }
        },
        Mesh: class MockMesh extends actual.Mesh {
            constructor(graphicsDevice?: any) {
                const mockDevice = graphicsDevice || mockGraphicsDevice;
                super(mockDevice);
            }
            update() {
                return this;
            }
            // Mock fromGeometry static method for GPU instancing
            static fromGeometry(graphicsDevice: any, geometry: any) {
                return new MockMesh(graphicsDevice);
            }
        },
        // Mock SphereGeometry for point rendering
        SphereGeometry: class MockSphereGeometry {
            constructor(options?: any) {
                // Store options for potential validation
            }
        },
        // Mock VertexFormat for instancing
        VertexFormat: class MockVertexFormat {
            constructor() {}
            static getDefaultInstancingFormat(graphicsDevice: any) {
                return new MockVertexFormat();
            }
        },
        // Mock VertexBuffer for instancing
        VertexBuffer: class MockVertexBuffer {
            private data: ArrayBuffer;
            constructor(graphicsDevice: any, format: any, numVertices: number, options?: any) {
                // Allocate buffer for instance data (16 floats per instance for Mat4)
                this.data = new ArrayBuffer(numVertices * 16 * 4); // 4 bytes per float
            }
            lock() {
                return this.data;
            }
            unlock() {}
            setData(data: Float32Array) {
                // Mock data storage
            }
            destroy() {
                // Mock cleanup
            }
        },
        MeshInstance: jest.fn((mesh: any, material: any, node: any = mockNode) => ({
            mesh,
            material,
            node,
            // Mock setInstancing method for GPU instancing
            setInstancing: jest.fn((vertexBuffer: any) => {}),
        })),
        math: {
            lerp: (a: number, b: number, t: number) => {
                return a + (b - a) * t;
            },
            clamp: (value: number, min: number, max: number) => {
                return Math.min(Math.max(value, min), max);
            },
        },
        // Add BUFFER_STATIC constant for VertexBuffer usage
        BUFFER_STATIC: 0,
        MOUSEBUTTON_LEFT: 0,
        MOUSEBUTTON_MIDDLE: 1,
        MOUSEBUTTON_RIGHT: 2,
        EVENT_MOUSEDOWN: "mousedown",
        EVENT_MOUSEUP: "mouseup",
        EVENT_MOUSEMOVE: "mousemove",
        EVENT_MOUSEWHEEL: "mousewheel",
        EVENT_TOUCHSTART: "touchstart",
        EVENT_TOUCHEND: "touchend",
        EVENT_TOUCHMOVE: "touchmove",
        EVENT_TOUCHCANCEL: "touchcancel",
    };
}
