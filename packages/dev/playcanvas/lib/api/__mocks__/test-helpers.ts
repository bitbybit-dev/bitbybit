/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Test helper functions for creating mock contexts and objects
 */

import { Context } from "../context";
import { MockApp, MockScene } from "./playcanvas.mock";
import * as pc from "playcanvas";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Vector } from "@bitbybit-dev/base";

/**
 * Creates a basic mock context with app and scene
 */
export function createMockContext(): Context {
    const mockScene = new pc.Entity("root");
    return {
        scene: mockScene,
        app: {
            graphicsDevice: {
                vram: { vb: 0, ib: 0, tex: 0, total: 0 }
            },
            systems: {}
        } as unknown as pc.AppBase
    } as Context;
}

/**
 * Creates a simple mock context without app
 */
export function createSimpleMockContext(): Context {
    return {
        app: null,
        scene: null,
    } as Context;
}

/**
 * Creates a mock window object for testing
 */
export function mockWindow() {
    (global as any).window = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    };
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
        add: jest.fn().mockReturnValue([0, 0, 0])
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
        mockScene: mockContext.scene as pc.Entity
    };
}

/**
 * Creates mock app and scene for orbit camera tests
 */
export function createOrbitCameraMocks() {
    mockWindow();
    const mockApp = new MockApp();
    const mockScene = new MockScene();
    const mockContext = {
        app: mockApp as any,
        scene: mockScene as any,
    } as Context;

    return {
        mockApp,
        mockScene,
        mockContext
    };
}
