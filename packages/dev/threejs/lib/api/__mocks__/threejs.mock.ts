/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

/**
 * Centralized Three.js mocks for testing
 * This file contains all reusable mock classes for Three.js types
 */

// Helper function to parse hex color
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    if (hex.length === 4) {
        hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return { r: 0, g: 0, b: 0 };
    }
    return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    };
}

export class MockColor {
    r: number;
    g: number;
    b: number;
    
    constructor(color?: string | number) {
        if (typeof color === "string") {
            const rgb = hexToRgb(color);
            this.r = rgb.r;
            this.g = rgb.g;
            this.b = rgb.b;
        } else {
            this.r = 0;
            this.g = 0;
            this.b = 0;
        }
    }
    
    set(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        return this;
    }
    
    clone() {
        const c = new MockColor();
        c.r = this.r;
        c.g = this.g;
        c.b = this.b;
        return c;
    }
}

export class MockVector3 {
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
        return this;
    }
    
    clone() {
        return new MockVector3(this.x, this.y, this.z);
    }
    
    copy(v: MockVector3) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
}

export class MockScene {
    background: MockColor | null = null;
    children: object[] = [];
    
    add(obj: object) {
        this.children.push(obj);
    }
    
    remove(obj: object) {
        const idx = this.children.indexOf(obj);
        if (idx > -1) {
            this.children.splice(idx, 1);
        }
    }
}

export class MockHemisphereLight {
    color: MockColor;
    groundColor: MockColor;
    intensity: number;
    position = new MockVector3();
    
    constructor(skyColor?: MockColor, groundColor?: MockColor, intensity?: number) {
        this.color = skyColor || new MockColor();
        this.groundColor = groundColor || new MockColor();
        this.intensity = intensity || 1;
    }
}

export class MockDirectionalLight {
    color: MockColor;
    intensity: number;
    position = new MockVector3();
    castShadow = false;
    target = { position: new MockVector3() };
    shadow = {
        camera: { left: 0, right: 0, top: 0, bottom: 0, near: 0.1, far: 100 },
        mapSize: { width: 1024, height: 1024 },
        radius: 1,
        blurSamples: 1,
        bias: 0,
        normalBias: 0,
    };
    
    constructor(color?: MockColor, intensity?: number) {
        this.color = color || new MockColor();
        this.intensity = intensity || 1;
    }
}

export class MockPlaneGeometry {
    parameters = { width: 10, height: 10 };
    
    constructor(width: number, height: number) {
        this.parameters.width = width;
        this.parameters.height = height;
    }
    
    dispose() { /* mock */ }
}

export class MockMaterial {
    color: MockColor = new MockColor();
    opacity = 1;
    transparent = false;
    side = 0;
    roughness = 0.5;
    metalness = 0.5;
    
    constructor(options?: object) {
        if (options) {
            Object.assign(this, options);
        }
    }
    
    dispose() { /* mock */ }
}

export class MockMesh {
    geometry: MockPlaneGeometry;
    material: MockMaterial;
    rotation = { x: 0, y: 0, z: 0 };
    position = new MockVector3();
    receiveShadow = false;
    
    constructor(geometry: MockPlaneGeometry, material: MockMaterial) {
        this.geometry = geometry;
        this.material = material;
    }
}

export class MockWebGLRenderer {
    domElement: HTMLCanvasElement | null = null;
    shadowMap = { enabled: false, type: 0 };
    _animationLoop: ((time: number) => void) | null = null;
    
    constructor(options: { antialias?: boolean; canvas?: HTMLCanvasElement }) {
        this.domElement = options.canvas || null;
    }
    
    setSize(_width: number, _height: number) { /* mock */ }
    setPixelRatio(_ratio: number) { /* mock */ }
    setAnimationLoop(callback: ((time: number) => void) | null) {
        this._animationLoop = callback;
    }
    render(_scene: MockScene, _camera: object) { /* mock */ }
    dispose() { /* mock */ }
}

// Constants
export const VSMShadowMap = 2;
export const DoubleSide = 2;

/**
 * Create Three.js module mock for jest.mock()
 */
export function createThreeJSMock() {
    return {
        Scene: MockScene,
        Color: MockColor,
        Vector3: MockVector3,
        HemisphereLight: MockHemisphereLight,
        DirectionalLight: MockDirectionalLight,
        WebGLRenderer: MockWebGLRenderer,
        PlaneGeometry: MockPlaneGeometry,
        MeshStandardMaterial: MockMaterial,
        Mesh: MockMesh,
        VSMShadowMap,
        DoubleSide,
    };
}

/**
 * Create mock orbit camera result for testing
 */
export function createMockOrbitCameraResult() {
    return {
        camera: { aspect: 1, updateProjectionMatrix: jest.fn() },
        orbitCamera: { distance: 10, pitch: 0, yaw: 0, pivotPoint: { x: 0, y: 0, z: 0 } },
        mouseInput: { destroy: jest.fn() },
        touchInput: { destroy: jest.fn() },
        keyboardInput: { destroy: jest.fn() },
        update: jest.fn(),
        destroy: jest.fn(),
    };
}

// Type definitions for test assertions
export interface MockMeshType {
    geometry: { parameters: { width: number; height: number } };
    material: { color: { r: number; g: number; b: number } };
}
