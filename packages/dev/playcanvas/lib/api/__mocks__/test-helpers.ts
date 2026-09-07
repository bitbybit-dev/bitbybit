import { vi } from "vitest";
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
 * A test double implements the part of `T` that the test actually exercises. The assertion is
 * single and from `Partial<T>`, not through `unknown`, so every member supplied is checked against
 * the real type: one that is renamed or retyped upstream fails here, instead of passing through an
 * assertion that had erased it.
 */
const partialMock = <T>(members: Partial<T>): T => members as T;

/**
 * Creates a basic mock context with app and scene
 */
export function createMockContext(): Context {
    const context = new Context();
    context.scene = new pc.Entity("root");
    // The engine creates buffers through the concrete device, not the abstract one, so the
    // stand-in is typed as the null device playcanvas ships for exactly this - which is what makes
    // the members below checkable at all.
    context.app = partialMock<pc.AppBase>({
        graphicsDevice: partialMock<pc.NullGraphicsDevice>({
            // The engine's own counter, under the name and shape it really has: the stand-in used
            // to declare a `vram` with a `total`, neither of which exists on a GraphicsDevice.
            _vram: { texShadow: 0, texAsset: 0, texLightmap: 0, tex: 0, vb: 0, ib: 0, ub: 0, sb: 0 },
            // The buffer impls answer to the members the engine calls on them. They used to be
            // `{}`, so an unlock would have thrown had anything reached it.
            createVertexBufferImpl: vi.fn(() => ({ destroy: vi.fn(), unlock: vi.fn() })),
            createIndexBufferImpl: vi.fn(() => ({ destroy: vi.fn(), unlock: vi.fn() })),
        }),
        systems: partialMock<pc.AppBase["systems"]>({}),
    });
    return context;
}

/**
 * Creates a simple mock context without app
 */
export function createSimpleMockContext(): Context {
    return new Context();
}

/**
 * Creates a mock window object for testing
 */
export function mockWindow() {
    (globalThis as any).window = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    };
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
        add: vi.fn().mockReturnValue([0, 0, 0])
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
 * Creates mock app and scene for orbit camera tests
 */
export function createOrbitCameraMocks() {
    mockWindow();
    const mockApp = new MockApp();
    const mockScene = new MockScene();
    // The stand-ins carry the members the camera reaches for, which is where a partial stand-in
    // meets the engine's full types.
    const mockContext = {
        app: mockApp as unknown as Context["app"],
        scene: mockScene as unknown as Context["scene"],
    } as Context;

    return {
        mockApp,
        mockScene,
        mockContext
    };
}
