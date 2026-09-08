import { vi, type Mock } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Test helper functions for creating mock contexts and objects for Three.js
 */

import { Context } from "../context";
import * as THREEJS from "three";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Vector } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";

/**
 * A test double implements the part of `T` that the test actually exercises. The assertion is
 * single and from `Partial<T>`, not through `unknown`, so every member supplied is checked against
 * the real type: one that is renamed or retyped upstream fails here, instead of passing through an
 * assertion that had erased it.
 */
const partialMock = <T>(members: Partial<T>): T => members as T;

/**
 * Creates a basic mock context with scene
 */
export function createMockContext(): Context {
    const mockScene = new THREEJS.Scene();
    return {
        scene: mockScene
    } as Context;
}

/**
 * Creates a simple mock context without scene
 */
export function createSimpleMockContext(): Context {
    return new Context();
}

/**
 * Creates mock worker managers for testing
 */
export function createMockWorkerManagers() {
    const mockJscadWorkerManager = partialMock<JSCADWorkerManager>({
        genericCallToWorkerPromise: vi.fn().mockResolvedValue({
            positions: [],
            normals: [],
            indices: [],
            transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        })
    });

    const mockManifoldWorkerManager = partialMock<ManifoldWorkerManager>({
        genericCallToWorkerPromise: vi.fn().mockResolvedValue({
            positions: [],
            normals: [],
            indices: []
        })
    });

    const mockOccWorkerManager = partialMock<OCCTWorkerManager>({
        genericCallToWorkerPromise: vi.fn().mockResolvedValue({
            faceList: [],
            edgeList: [],
            pointsList: []
        })
    });

    return {
        mockJscadWorkerManager,
        mockManifoldWorkerManager,
        mockOccWorkerManager
    };
}

/**
 * Creates a mock JSCADText service
 */
export function createMockJSCADText(): JSCADText {
    return partialMock<JSCADText>({
        createVectorText: vi.fn().mockResolvedValue([])
    });
}

/**
 * Creates a mock Vector service
 */
export function createMockVector(): Vector {
    return partialMock<Vector>({
        add: vi.fn().mockReturnValue([0, 0, 0]),
        lerp: vi.fn().mockImplementation(({ first, second, fraction }) => {
            return [
                first[0] + (second[0] - first[0]) * fraction,
                first[1] + (second[1] - first[1]) * fraction,
                first[2] + (second[2] - first[2]) * fraction
            ];
        })
    });
}

/**
 * Creates a complete set of mocks for DrawHelper tests
 */
export function createDrawHelperMocks() {
    const mockContext = createMockContext();
    const mockSolidText = createMockJSCADText();
    const mockVector = createMockVector();
    const { mockJscadWorkerManager, mockManifoldWorkerManager, mockOccWorkerManager } = createMockWorkerManagers();

    return {
        mockContext,
        mockSolidText,
        mockVector,
        mockJscadWorkerManager,
        mockManifoldWorkerManager,
        mockOccWorkerManager,
        mockScene: mockContext.scene
    };
}

/**
 * Converts hex color string to RGB object with values 0-1
 * @param hex - Hex color string (e.g., "#ff0000" or "#f00")
 * @returns RGB object with r, g, b values between 0 and 1
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Handle 3-digit hex colors
    if (hex.length === 4) {
        hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error(`Invalid hex color: ${hex}`);
    }

    return {
        r: parseInt(result[1]!, 16) / 255,
        g: parseInt(result[2]!, 16) / 255,
        b: parseInt(result[3]!, 16) / 255
    };
}

/**
 * Checks if two colors are approximately equal within a tolerance
 * @param color1 - THREE.Color object
 * @param color2 - RGB object with r, g, b values
 * @param tolerance - Maximum difference per channel (default 0.01)
 * @returns true if colors are within tolerance
 */
export function colorsAreEqual(color1: THREEJS.Color, color2: { r: number; g: number; b: number }, tolerance = 0.01): boolean {
    return Math.abs(color1.r - color2.r) < tolerance &&
        Math.abs(color1.g - color2.g) < tolerance &&
        Math.abs(color1.b - color2.b) < tolerance;
}

/**
 * Extracts material from a Three.js mesh or line segments
 * @param mesh - Three.js Mesh or LineSegments object
 * @returns Material object or undefined
 */
export function getMaterialFromMesh(mesh: THREEJS.Mesh | THREEJS.LineSegments | THREEJS.Points): THREEJS.Material | THREEJS.Material[] | undefined {
    if (!mesh || !mesh.material) return undefined;
    return mesh.material;
}

/**
 * Creates mock JSCAD mesh data for testing
 */
export function createMockJSCADMesh(overrides: Partial<Inputs.JSCAD.JSCADGeom3> = {}): Inputs.JSCAD.JSCADGeom3 {
    // A minimal JSCAD solid. These suites mock the worker manager, so nothing reads the geometry -
    // but it should be the shape the API says it is. What stood here was `{ type: "occ-shape" }`,
    // which is an OCCT pointer's shape, not a JSCAD one.
    return {
        polygons: [],
        transforms: [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ],
        ...overrides
    };
}

/**
 * Creates mock OCCT shape data for testing
 */
export function createMockOCCTShape(overrides = {}) {
    return {
        hash: 123,
        type: "occ-shape" as const,
        ...overrides
    };
}

/**
 * Simulates worker error for testing error handling
 */
export function mockWorkerError(workerManager: any, method: string, error: Error) {
    (workerManager.genericCallToWorkerPromise as Mock)
        .mockImplementation((methodName) => {
            if (methodName === method) {
                return Promise.reject(error);
            }
            // Return default mock for other methods
            return Promise.resolve({
                positions: [],
                normals: [],
                indices: [],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });
        });
}

/**
 * Creates a mock window object for testing
 */
export function mockWindow() {
    (globalThis as any).window = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        innerWidth: 1920,
        innerHeight: 1080,
    };
}

/**
 * Creates a mock DOM element for testing orbit camera inputs.
 * Supports event listener tracking for simulating user interactions.
 */
export function createMockDOMElement(): HTMLElement {
    const listeners: { [key: string]: Array<(...args: unknown[]) => void> } = {};
    return {
        addEventListener: vi.fn((type: string, handler: (...args: unknown[]) => void) => {
            if (!listeners[type]) {
                listeners[type] = [];
            }
            listeners[type].push(handler);
        }),
        removeEventListener: vi.fn((type: string, handler: (...args: unknown[]) => void) => {
            if (listeners[type]) {
                const idx = listeners[type].indexOf(handler);
                if (idx >= 0) {
                    listeners[type].splice(idx, 1);
                }
            }
        }),
        dispatchEvent: vi.fn((event: Event) => {
            const handlers = listeners[event.type];
            if (handlers) {
                handlers.forEach(h => h(event));
            }
        }),
        getBoundingClientRect: vi.fn(() => ({
            left: 0,
            top: 0,
            width: 1920,
            height: 1080,
        })),
    } as unknown as HTMLElement;
}

/**
 * Creates mock app and scene for orbit camera tests
 */
export function createOrbitCameraMocks() {
    mockWindow();
    const mockScene = new THREEJS.Scene();
    const mockDomElement = createMockDOMElement();
    const mockContext = {
        scene: mockScene,
    } as Context;

    return {
        mockScene,
        mockDomElement,
        mockContext
    };
}

