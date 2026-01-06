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
    return {
        scene: null,
    } as Context;
}

/**
 * Creates mock worker managers for testing
 */
export function createMockWorkerManagers() {
    const mockJscadWorkerManager = {
        genericCallToWorkerPromise: jest.fn().mockResolvedValue({
            positions: [],
            normals: [],
            indices: [],
            transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        })
    } as unknown as JSCADWorkerManager;

    const mockManifoldWorkerManager = {
        genericCallToWorkerPromise: jest.fn().mockResolvedValue({
            positions: [],
            normals: [],
            indices: []
        })
    } as unknown as ManifoldWorkerManager;

    const mockOccWorkerManager = {
        genericCallToWorkerPromise: jest.fn().mockResolvedValue({
            faceList: [],
            edgeList: [],
            pointsList: []
        })
    } as unknown as OCCTWorkerManager;

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
    return {
        createVectorText: jest.fn().mockResolvedValue([])
    } as unknown as JSCADText;
}

/**
 * Creates a mock Vector service
 */
export function createMockVector(): Vector {
    return {
        add: jest.fn().mockReturnValue([0, 0, 0]),
        lerp: jest.fn().mockImplementation(({ first, second, fraction }) => {
            return [
                first[0] + (second[0] - first[0]) * fraction,
                first[1] + (second[1] - first[1]) * fraction,
                first[2] + (second[2] - first[2]) * fraction
            ];
        })
    } as unknown as Vector;
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
        mockScene: mockContext.scene as THREEJS.Scene
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
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
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
export function createMockJSCADMesh(overrides = {}) {
    return {
        type: "solid" as const,
        polygons: [],
        ...overrides
    };
}

/**
 * Creates mock OCCT shape data for testing
 */
export function createMockOCCTShape(overrides = {}) {
    return {
        hash: 123,
        type: "solid" as const,
        ...overrides
    };
}

/**
 * Simulates worker error for testing error handling
 */
export function mockWorkerError(workerManager: any, method: string, error: Error) {
    (workerManager.genericCallToWorkerPromise as jest.Mock)
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
