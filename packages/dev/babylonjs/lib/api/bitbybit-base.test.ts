jest.mock("@babylonjs/core", () => {
    const { createBabylonJSMock } = jest.requireActual("./__mocks__/babylonjs.mock");
    return createBabylonJSMock();
});

import { BitByBitBase } from "./bitbybit-base";
import * as BABYLON from "@babylonjs/core";

describe("BitByBitBase unit tests", () => {
    let bitByBit: BitByBitBase;

    beforeEach(() => {
        bitByBit = new BitByBitBase();
    });

    describe("Constructor initialization", () => {
        it("should create a BitByBitBase instance", () => {
            expect(bitByBit).toBeDefined();
            expect(bitByBit).toBeInstanceOf(BitByBitBase);
        });

        it("should initialize context", () => {
            expect(bitByBit.context).toBeDefined();
        });

        it("should initialize worker managers", () => {
            expect(bitByBit.jscadWorkerManager).toBeDefined();
            expect(bitByBit.manifoldWorkerManager).toBeDefined();
            expect(bitByBit.occtWorkerManager).toBeDefined();
        });

        it("should initialize math service", () => {
            expect(bitByBit.math).toBeDefined();
        });

        it("should initialize logic service", () => {
            expect(bitByBit.logic).toBeDefined();
        });

        it("should initialize lists service", () => {
            expect(bitByBit.lists).toBeDefined();
        });

        it("should initialize json service", () => {
            expect(bitByBit.json).toBeDefined();
        });

        it("should initialize csv service", () => {
            expect(bitByBit.csv).toBeDefined();
        });

        it("should initialize vector service", () => {
            expect(bitByBit.vector).toBeDefined();
        });

        it("should initialize babylon service", () => {
            expect(bitByBit.babylon).toBeDefined();
        });

        it("should initialize point service", () => {
            expect(bitByBit.point).toBeDefined();
        });

        it("should initialize line service", () => {
            expect(bitByBit.line).toBeDefined();
        });

        it("should initialize transforms service", () => {
            expect(bitByBit.transforms).toBeDefined();
        });

        it("should initialize polyline service", () => {
            expect(bitByBit.polyline).toBeDefined();
        });

        it("should initialize draw service", () => {
            expect(bitByBit.draw).toBeDefined();
        });

        it("should initialize verb service", () => {
            expect(bitByBit.verb).toBeDefined();
        });

        it("should initialize jscad service", () => {
            expect(bitByBit.jscad).toBeDefined();
        });

        it("should initialize manifold service", () => {
            expect(bitByBit.manifold).toBeDefined();
        });

        it("should initialize text service", () => {
            expect(bitByBit.text).toBeDefined();
        });

        it("should initialize dates service", () => {
            expect(bitByBit.dates).toBeDefined();
        });

        it("should initialize tag service", () => {
            expect(bitByBit.tag).toBeDefined();
        });

        it("should initialize time service", () => {
            expect(bitByBit.time).toBeDefined();
        });

        it("should initialize occt service", () => {
            expect(bitByBit.occt).toBeDefined();
        });

        it("should initialize mesh service", () => {
            expect(bitByBit.mesh).toBeDefined();
        });

        it("should initialize asset service", () => {
            expect(bitByBit.asset).toBeDefined();
        });

        it("should initialize color service", () => {
            expect(bitByBit.color).toBeDefined();
        });
    });

    describe("init method", () => {
        let mockScene: BABYLON.Scene;

        beforeEach(() => {
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            mockScene = new MockScene() as unknown as BABYLON.Scene;
        });

        it("should initialize with scene", () => {
            bitByBit.init(mockScene);
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should set verb context", () => {
            bitByBit.init(mockScene);
            expect(bitByBit.context.verb).toBeDefined();
            expect(bitByBit.context.verb.geom).toBeDefined();
            expect(bitByBit.context.verb.core).toBeDefined();
        });

        it("should set jsonpath context", () => {
            bitByBit.init(mockScene);
            expect(bitByBit.context.jsonpath).toBeDefined();
        });

        it("should initialize with scene and occt worker", () => {
            const mockOcctWorker = {
                postMessage: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                terminate: jest.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: jest.fn(),
            } as unknown as Worker;
            
            bitByBit.init(mockScene, mockOcctWorker);
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should initialize with scene and jscad worker", () => {
            const mockJscadWorker = {
                postMessage: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                terminate: jest.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: jest.fn(),
            } as unknown as Worker;
            
            bitByBit.init(mockScene, undefined, mockJscadWorker);
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should initialize with scene and manifold worker", () => {
            const mockManifoldWorker = {
                postMessage: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                terminate: jest.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: jest.fn(),
            } as unknown as Worker;
            
            bitByBit.init(mockScene, undefined, undefined, mockManifoldWorker);
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should initialize with havok plugin", () => {
            const mockHavokPlugin = {
                name: "havok",
                setGravity: jest.fn()
            } as unknown as BABYLON.HavokPlugin;
            
            bitByBit.init(mockScene, undefined, undefined, undefined, mockHavokPlugin);
            expect(bitByBit.context.scene).toBe(mockScene);
            expect(bitByBit.context.havokPlugin).toBe(mockHavokPlugin);
        });

        it("should initialize with all workers", () => {
            const createMockWorker = () => ({
                postMessage: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                terminate: jest.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: jest.fn(),
            } as unknown as Worker);
            
            const mockOcctWorker = createMockWorker();
            const mockJscadWorker = createMockWorker();
            const mockManifoldWorker = createMockWorker();
            
            bitByBit.init(mockScene, mockOcctWorker, mockJscadWorker, mockManifoldWorker);
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should initialize with all parameters", () => {
            const createMockWorker = () => ({
                postMessage: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                terminate: jest.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: jest.fn(),
            } as unknown as Worker);
            
            const mockOcctWorker = createMockWorker();
            const mockJscadWorker = createMockWorker();
            const mockManifoldWorker = createMockWorker();
            const mockHavokPlugin = {
                name: "havok",
                setGravity: jest.fn()
            } as unknown as BABYLON.HavokPlugin;
            
            bitByBit.init(mockScene, mockOcctWorker, mockJscadWorker, mockManifoldWorker, mockHavokPlugin);
            expect(bitByBit.context.scene).toBe(mockScene);
            expect(bitByBit.context.havokPlugin).toBe(mockHavokPlugin);
        });

        it("should handle undefined workers gracefully", () => {
            expect(() => bitByBit.init(mockScene, undefined, undefined, undefined)).not.toThrow();
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should handle undefined havok plugin gracefully", () => {
            expect(() => bitByBit.init(mockScene)).not.toThrow();
            expect(bitByBit.context.scene).toBe(mockScene);
        });
    });

    describe("Service integration", () => {
        it("should have functional math operations", () => {
            const result = bitByBit.math.number({ number: 42 });
            expect(result).toBe(42);
        });

        it("should have functional math rounding", () => {
            const result = bitByBit.math.roundToDecimals({ number: 3.14159, decimalPlaces: 2 });
            expect(result).toBeCloseTo(3.14, 2);
        });

        it("should have functional vector operations", () => {
            const result = bitByBit.vector.add({ first: [1, 2, 3], second: [4, 5, 6] });
            expect(result).toEqual([5, 7, 9]);
        });

        it("should have functional point operations", () => {
            const result = bitByBit.point.distance({ startPoint: [0, 0, 0], endPoint: [3, 4, 0] });
            expect(result).toBeCloseTo(5, 5);
        });

        it("should have functional line creation", () => {
            const result = bitByBit.line.create({ start: [0, 0, 0], end: [1, 1, 1] });
            expect(result).toEqual({ start: [0, 0, 0], end: [1, 1, 1] });
        });

        it("should have functional polyline creation", () => {
            const result = bitByBit.polyline.create({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] });
            expect(result.points).toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0]]);
            expect(result.isClosed).toBe(false);
        });

        it("should have functional list operations", () => {
            const result = bitByBit.lists.getItem({ list: [10, 20, 30], index: 1 });
            expect(result).toBe(20);
        });

        it("should have functional transform operations", () => {
            const result = bitByBit.transforms.translationXYZ({ translation: [1, 2, 3] });
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });

        it("should have functional color operations", () => {
            const result = bitByBit.color.hexToRgb({ color: "#ff0000" });
            expect(result).toEqual({ r: 255, g: 0, b: 0 });
        });

        it("should have functional mesh operations", () => {
            const plane = bitByBit.mesh.calculateTrianglePlane({ 
                triangle: [[0, 0, 0], [1, 0, 0], [0, 1, 0]] 
            });
            expect(plane).toBeDefined();
            expect(plane.normal).toBeDefined();
        });

        it("should have functional logic operations", () => {
            const result = bitByBit.logic.firstDefinedValueGate({ value1: undefined, value2: 5 });
            expect(result).toBe(5);
        });

        it("should have functional boolean operations", () => {
            const result = bitByBit.logic.boolean({ boolean: true });
            expect(result).toBe(true);
        });

        it("should have functional text operations", () => {
            expect(bitByBit.text).toBeDefined();
            expect(typeof bitByBit.text).toBe("object");
        });

        it("should have functional CSV operations", () => {
            expect(bitByBit.csv).toBeDefined();
            expect(typeof bitByBit.csv).toBe("object");
        });
    });

    describe("Multiple instances", () => {
        it("should create independent instances", () => {
            const instance1 = new BitByBitBase();
            const instance2 = new BitByBitBase();
            
            expect(instance1).not.toBe(instance2);
            expect(instance1.context).not.toBe(instance2.context);
        });

        it("should have independent scenes after init", () => {
            const instance1 = new BitByBitBase();
            const instance2 = new BitByBitBase();
            
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            const scene1 = new MockScene() as unknown as BABYLON.Scene;
            const scene2 = new MockScene() as unknown as BABYLON.Scene;
            
            instance1.init(scene1);
            instance2.init(scene2);
            
            expect(instance1.context.scene).toBe(scene1);
            expect(instance2.context.scene).toBe(scene2);
            expect(instance1.context.scene).not.toBe(instance2.context.scene);
        });
    });

    describe("Scene manipulation after init", () => {
        let mockScene: BABYLON.Scene;

        beforeEach(() => {
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            mockScene = new MockScene() as unknown as BABYLON.Scene;
            bitByBit.init(mockScene);
        });

        it("should have scene initialized after init", () => {
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should have draw service available after init", () => {
            expect(bitByBit.draw).toBeDefined();
        });
    });

    describe("Worker manager integration", () => {
        it("should have jscadWorkerManager available", () => {
            expect(bitByBit.jscadWorkerManager).toBeDefined();
            expect(typeof bitByBit.jscadWorkerManager.setJscadWorker).toBe("function");
        });

        it("should have manifoldWorkerManager available", () => {
            expect(bitByBit.manifoldWorkerManager).toBeDefined();
            expect(typeof bitByBit.manifoldWorkerManager.setManifoldWorker).toBe("function");
        });

        it("should have occtWorkerManager available", () => {
            expect(bitByBit.occtWorkerManager).toBeDefined();
            expect(typeof bitByBit.occtWorkerManager.setOccWorker).toBe("function");
        });
    });

    describe("Service dependencies", () => {
        it("should have vector service used by point service", () => {
            // Point service depends on vector service
            const distance = bitByBit.point.distance({ startPoint: [0, 0, 0], endPoint: [1, 0, 0] });
            expect(distance).toBe(1);
        });

        it("should have vector service used by line service", () => {
            // Line service depends on vector service
            const line = bitByBit.line.create({ start: [0, 0, 0], end: [1, 0, 0] });
            expect(line).toBeDefined();
        });

        it("should have vector and point services used by polyline service", () => {
            // Polyline service depends on vector and point services
            const polyline = bitByBit.polyline.create({ points: [[0, 0, 0], [1, 0, 0]] });
            expect(polyline).toBeDefined();
        });

        it("should have math service used by color service", () => {
            // Color service depends on math service
            const rgb = bitByBit.color.hexToRgb({ color: "#ffffff" });
            expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
        });
    });

    describe("Babylon service integration", () => {
        let mockScene: BABYLON.Scene;

        beforeEach(() => {
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            mockScene = new MockScene() as unknown as BABYLON.Scene;
            bitByBit.init(mockScene);
        });

        it("should have babylon service with node access", () => {
            expect(bitByBit.babylon.node).toBeDefined();
        });

        it("should have babylon service with context", () => {
            expect(bitByBit.babylon).toBeDefined();
            // Babylon service should have access to context via draw helper
        });
    });

    describe("Tag service integration", () => {
        let mockScene: BABYLON.Scene;

        beforeEach(() => {
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            mockScene = new MockScene() as unknown as BABYLON.Scene;
            bitByBit.init(mockScene);
        });

        it("should have tag service with context", () => {
            expect(bitByBit.tag).toBeDefined();
            // Tag service should have access to context
        });
    });

    describe("Time service integration", () => {
        let mockScene: BABYLON.Scene;

        beforeEach(() => {
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            mockScene = new MockScene() as unknown as BABYLON.Scene;
            bitByBit.init(mockScene);
        });

        it("should have time service with context", () => {
            expect(bitByBit.time).toBeDefined();
            // Time service should have access to context
        });
    });
});
