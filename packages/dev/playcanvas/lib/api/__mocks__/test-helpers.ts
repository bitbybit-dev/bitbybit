import { vi, type Mock } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Context } from "../context";
import { MockApp, MockScene } from "./playcanvas.mock";
import * as pc from "playcanvas";
import type { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import type { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import type { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import type { Vector } from "@bitbybit-dev/base";

const partialMock = <T>(members: Partial<T>): T => members as T;

export function createMockContext(): Context {
    const context = new Context();
    context.scene = new pc.Entity("root");
    context.app = partialMock<pc.AppBase>({
        graphicsDevice: partialMock<pc.NullGraphicsDevice>({
            _vram: { texShadow: 0, texAsset: 0, texLightmap: 0, tex: 0, vb: 0, ib: 0, ub: 0, sb: 0 },
            createVertexBufferImpl: vi.fn(() => ({ destroy: vi.fn(), unlock: vi.fn() })),
            createIndexBufferImpl: vi.fn(() => ({ destroy: vi.fn(), unlock: vi.fn() })),
        }),
        systems: partialMock<pc.AppBase["systems"]>({}),
    });
    return context;
}

export function createSimpleMockContext(): Context {
    return new Context();
}

export function mockWindow() {
    (globalThis as any).window = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    };
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
    mockScene: pc.Entity;
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
        add: vi.fn().mockReturnValue([0, 0, 0])
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

export function createOrbitCameraMocks() {
    mockWindow();
    const mockApp = new MockApp();
    const mockScene = new MockScene();
    const appStandIn: unknown = mockApp;
    const sceneStandIn: unknown = mockScene;
    const mockContext = {
        app: appStandIn as Context["app"],
        scene: sceneStandIn as Context["scene"],
    } as Context;

    return {
        mockApp,
        mockScene,
        mockContext
    };
}
