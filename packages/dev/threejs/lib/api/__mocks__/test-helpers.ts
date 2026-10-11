import { vi, type Mock } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Context } from "../context";
import * as THREEJS from "three";
import type { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import type { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import type { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import type { Vector } from "@bitbybit-dev/base";
import type * as Inputs from "../inputs";

export const partialMock = <T>(members: Partial<T>): T => members as T;

export function createMockContext(): Context {
    const mockScene = new THREEJS.Scene();
    return {
        scene: mockScene
    } as Context;
}

export function createSimpleMockContext(): Context {
    return new Context();
}

export interface MockWorkerManagers {
    mockJscadWorkerManager: JSCADWorkerManager;
    mockManifoldWorkerManager: ManifoldWorkerManager;
    mockOccWorkerManager: OCCTWorkerManager;
    jscadWorkerCall: Mock;
    manifoldWorkerCall: Mock;
    occtWorkerCall: Mock;
}

export interface DrawHelperMocks extends MockWorkerManagers {
    mockContext: Context;
    mockSolidText: JSCADText;
    mockVector: Vector;
    mockScene: THREEJS.Scene;
}

export function createMockWorkerManagers(): MockWorkerManagers {
    const jscadWorkerCall = vi.fn().mockResolvedValue({
        positions: [],
        normals: [],
        indices: [],
        transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    });
    const mockJscadWorkerManager = partialMock<JSCADWorkerManager>({
        genericCallToWorkerPromise: jscadWorkerCall
    });

    const manifoldWorkerCall = vi.fn().mockResolvedValue({
        positions: [],
        normals: [],
        indices: []
    });
    const mockManifoldWorkerManager = partialMock<ManifoldWorkerManager>({
        genericCallToWorkerPromise: manifoldWorkerCall
    });

    const occtWorkerCall = vi.fn().mockResolvedValue({
        faceList: [],
        edgeList: [],
        pointsList: []
    });
    const mockOccWorkerManager = partialMock<OCCTWorkerManager>({
        genericCallToWorkerPromise: occtWorkerCall
    });

    return {
        mockJscadWorkerManager,
        mockManifoldWorkerManager,
        mockOccWorkerManager,
        jscadWorkerCall,
        manifoldWorkerCall,
        occtWorkerCall
    };
}

export function createMockJSCADText(): JSCADText {
    return partialMock<JSCADText>({
        createVectorText: vi.fn().mockResolvedValue([])
    });
}

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

export function createDrawHelperMocks(): DrawHelperMocks {
    const mockContext = createMockContext();
    const mockSolidText = createMockJSCADText();
    const mockVector = createMockVector();
    const workerManagers = createMockWorkerManagers();

    return {
        mockContext,
        mockSolidText,
        mockVector,
        ...workerManagers,
        mockScene: mockContext.scene
    };
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const isThreeDigitHex = hex.length === 4;
    if (isThreeDigitHex) {
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

export function colorsAreEqual(color1: THREEJS.Color, color2: { r: number; g: number; b: number }, tolerance = 0.01): boolean {
    return Math.abs(color1.r - color2.r) < tolerance &&
        Math.abs(color1.g - color2.g) < tolerance &&
        Math.abs(color1.b - color2.b) < tolerance;
}

export function getMaterialFromMesh(mesh: THREEJS.Mesh | THREEJS.LineSegments | THREEJS.Points): THREEJS.Material | THREEJS.Material[] | undefined {
    if (!mesh || !mesh.material) {
        return undefined;
    }
    return mesh.material;
}

export function createMockJSCADMesh(overrides: Partial<Inputs.JSCAD.JSCADGeom3> = {}): Inputs.JSCAD.JSCADGeom3 {
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

export function createMockOCCTShape(overrides = {}) {
    return {
        hash: 123,
        type: "occ-shape" as const,
        ...overrides
    };
}

export function mockWorkerError(workerManager: any, method: string, error: Error) {
    (workerManager.genericCallToWorkerPromise as Mock)
        .mockImplementation((methodName) => {
            if (methodName === method) {
                return Promise.reject(error);
            }
            return Promise.resolve({
                positions: [],
                normals: [],
                indices: [],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });
        });
}

export function mockWindow() {
    (globalThis as any).window = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        innerWidth: 1920,
        innerHeight: 1080,
    };
}

export function createMockDOMElement(): HTMLElement {
    const listeners: { [key: string]: Array<(...args: unknown[]) => void> } = {};
    return partialMock<HTMLElement>({
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
            return !event.defaultPrevented;
        }),
        getBoundingClientRect: vi.fn(() => partialMock<DOMRect>({
            left: 0,
            top: 0,
            width: 1920,
            height: 1080,
        })),
    });
}

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

export function flatOf(attribute: THREEJS.BufferAttribute | THREEJS.InterleavedBufferAttribute): number[] {
    return Array.from("data" in attribute ? attribute.data.array : attribute.array);
}
