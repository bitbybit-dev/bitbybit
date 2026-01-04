/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Test helper functions for creating mock contexts and objects for BabylonJS
 */

import { Context } from "../context";
import { MockScene, MockPBRMetallicRoughnessMaterial } from "./babylonjs.mock";
import * as BABYLON from "@babylonjs/core";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Vector } from "@bitbybit-dev/base";

/**
 * Creates a basic mock context with scene
 */
export function createMockContext(): Context {
    const mockScene = new MockScene();
    return {
        scene: mockScene as unknown as BABYLON.Scene,
        engine: null,
        havokPlugin: null,
        getSamplingMode: jest.fn().mockReturnValue(1)
    } as unknown as Context;
}

/**
 * Creates a simple mock context without scene
 */
export function createSimpleMockContext(): Context {
    return {
        scene: null,
        engine: null,
        havokPlugin: null,
    } as unknown as Context;
}

/**
 * Creates mock worker managers for testing
 */
export function createMockWorkerManagers() {
    const mockJscadWorkerManager = {
        genericCallToWorkerPromise: jest.fn().mockResolvedValue({
            positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
            normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
            indices: [0, 1, 2],
            transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        })
    } as unknown as JSCADWorkerManager;

    const mockManifoldWorkerManager = {
        genericCallToWorkerPromise: jest.fn().mockResolvedValue({
            vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
            triVerts: new Uint32Array([0, 1, 2]),
            numProp: 3
        })
    } as unknown as ManifoldWorkerManager;

    const mockOccWorkerManager = {
        genericCallToWorkerPromise: jest.fn().mockResolvedValue({
            faceList: [
                { vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }
            ],
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
        mockScene: mockContext.scene as unknown as MockScene
    };
}
