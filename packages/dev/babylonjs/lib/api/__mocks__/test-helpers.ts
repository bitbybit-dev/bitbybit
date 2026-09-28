import { vi, type Mock } from "vitest";
 

/**
 * Test helper functions for creating mock contexts and objects for BabylonJS
 */

import { Context } from "../context";
import { MockScene, instanceOf } from "./babylonjs.mock";
import * as BABYLON from "@babylonjs/core";
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
export const partialMock = <T>(members: Partial<T>): T => members as T;

/**
 * A scene double and a Babylon scene are unrelated types, so this is the one place the two meet.
 * Both views of the same object are returned, and a test takes the `MockScene` one from here
 * rather than reinterpreting `context.scene` again wherever it reads the double's state.
 */
function contextWithSceneDouble(): { context: Context, scene: MockScene } {
    const scene = new MockScene();
    const context = new Context();
    context.scene = instanceOf(scene, BABYLON.Scene);
    return { context, scene };
}

/**
 * Creates a basic mock context with scene
 */
export function createMockContext(): Context {
    return contextWithSceneDouble().context;
}

/**
 * Creates a simple mock context without scene. `Context` declares its members as definitely
 * assigned, so one that was never given a scene simply has none - no stand-in value is needed.
 */
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
    mockScene: MockScene;
    createVectorText: Mock;
    vectorAdd: Mock;
}

/**
 * Creates mock worker managers for testing, with the mock behind each manager's
 * `genericCallToWorkerPromise` alongside it, so a suite asserts on the mock itself
 */
export function createMockWorkerManagers(): MockWorkerManagers {
    const jscadWorkerCall = vi.fn().mockResolvedValue({
        positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
        normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
        indices: [0, 1, 2],
        transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    });
    const mockJscadWorkerManager = partialMock<JSCADWorkerManager>({
        genericCallToWorkerPromise: jscadWorkerCall
    });

    const manifoldWorkerCall = vi.fn().mockResolvedValue({
        vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
        triVerts: new Uint32Array([0, 1, 2]),
        numProp: 3
    });
    const mockManifoldWorkerManager = partialMock<ManifoldWorkerManager>({
        genericCallToWorkerPromise: manifoldWorkerCall
    });

    const occtWorkerCall = vi.fn().mockResolvedValue({
        faceList: [
            { vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }
        ],
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

/**
 * Creates a mock JSCADText service
 */
export function createMockJSCADText(createVectorText: Mock = vi.fn().mockResolvedValue([])): JSCADText {
    return partialMock<JSCADText>({
        createVectorText
    });
}

/**
 * Creates a mock Vector service
 */
export function createMockVector(add: Mock = vi.fn().mockReturnValue([0, 0, 0])): Vector {
    return partialMock<Vector>({
        add,
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
export function createDrawHelperMocks(): DrawHelperMocks {
    const { context: mockContext, scene: mockScene } = contextWithSceneDouble();
    const createVectorText = vi.fn().mockResolvedValue([]);
    const mockSolidText = createMockJSCADText(createVectorText);
    const vectorAdd = vi.fn().mockReturnValue([0, 0, 0]);
    const mockVector = createMockVector(vectorAdd);
    const workerManagers = createMockWorkerManagers();

    return {
        mockContext,
        mockSolidText,
        mockVector,
        ...workerManagers,
        mockScene,
        createVectorText,
        vectorAdd
    };
}
