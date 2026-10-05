import { vi, type Mock } from "vitest";
 

import { Context } from "../context";
import { MockScene, instanceOf } from "./babylonjs.mock";
import * as BABYLON from "@babylonjs/core";
import type { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import type { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import type { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import type { Vector } from "@bitbybit-dev/base";

export const partialMock = <T>(members: Partial<T>): T => members as T;

function contextWithSceneDouble(): { context: Context, scene: MockScene } {
    const scene = new MockScene();
    const context = new Context();
    context.scene = instanceOf(scene, BABYLON.Scene);
    return { context, scene };
}

export function createMockContext(): Context {
    return contextWithSceneDouble().context;
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
    mockScene: MockScene;
    createVectorText: Mock;
    vectorAdd: Mock;
}

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

export function createMockJSCADText(createVectorText: Mock = vi.fn().mockResolvedValue([])): JSCADText {
    return partialMock<JSCADText>({
        createVectorText
    });
}

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
