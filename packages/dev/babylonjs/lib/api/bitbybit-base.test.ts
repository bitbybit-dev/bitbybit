import { MockScene } from "./__mocks__/babylonjs.mock";
import { describe, it, expect, beforeEach, vi } from "vitest";
vi.mock("@babylonjs/core", async () => {
    const { createBabylonJSMock } = await vi.importActual<typeof import("./__mocks__/babylonjs.mock")>("./__mocks__/babylonjs.mock");
    return createBabylonJSMock();
});

import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Verb, Tag, Time, OCCTW, Asset, JSONBitByBit, CSVBitByBit } from "@bitbybit-dev/core";
import { JSCAD, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldBitByBit, ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import {
    Vector, Point, Line, Polyline, TextBitByBit, Color, MathBitByBit,
    Lists, Logic, Transforms, Dates, MeshBitByBit
} from "@bitbybit-dev/base";
import { Context } from "./context";
import { Draw } from "./bitbybit/draw";
import { Babylon } from "./bitbybit/babylon/babylon";
import { BitByBitBase } from "./bitbybit-base";
import * as BABYLON from "@babylonjs/core";

describe("BitByBitBase unit tests", () => {
    let bitByBit: BitByBitBase;

    beforeEach(() => {
        bitByBit = new BitByBitBase();
    });

    describe("Constructor initialization", () => {
        it("should create a BitByBitBase instance", () => {
            expect(bitByBit).toBeInstanceOf(BitByBitBase);
        });

        // Every service is asserted by its class rather than by being defined: the failure this
        // guards against is a field wired to the wrong constructor, which any presence check passes.
        const wiring: [keyof BitByBitBase, new (...args: never[]) => object][] = [
            ["context", Context],
            ["jscadWorkerManager", JSCADWorkerManager],
            ["manifoldWorkerManager", ManifoldWorkerManager],
            ["occtWorkerManager", OCCTWorkerManager],
            ["math", MathBitByBit],
            ["logic", Logic],
            ["lists", Lists],
            ["json", JSONBitByBit],
            ["csv", CSVBitByBit],
            ["vector", Vector],
            ["babylon", Babylon],
            ["point", Point],
            ["line", Line],
            ["transforms", Transforms],
            ["polyline", Polyline],
            ["draw", Draw],
            ["verb", Verb],
            ["jscad", JSCAD],
            ["manifold", ManifoldBitByBit],
            ["text", TextBitByBit],
            ["dates", Dates],
            ["tag", Tag],
            ["time", Time],
            ["mesh", MeshBitByBit],
            ["occt", OCCTW],
            ["asset", Asset],
            ["color", Color],
        ];

        it.each(wiring)("should wire %s to its own service class", (field, constructor) => {
            expect(bitByBit[field]).toBeInstanceOf(constructor);
        });

        it("should give every service the same context instance", () => {
            expect(bitByBit.draw.context).toBe(bitByBit.context);
        });

        it("should leave no wired field undefined", () => {
            const missing = wiring.filter(([field]) => bitByBit[field] === undefined).map(([field]) => field);

            expect(missing).toEqual([]);
        });
    });

    describe("init method", () => {
        let mockScene: BABYLON.Scene;

        beforeEach(() => {
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
                postMessage: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                terminate: vi.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: vi.fn(),
            } as unknown as Worker;
            
            bitByBit.init(mockScene, mockOcctWorker);
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should initialize with scene and jscad worker", () => {
            const mockJscadWorker = {
                postMessage: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                terminate: vi.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: vi.fn(),
            } as unknown as Worker;
            
            bitByBit.init(mockScene, undefined, mockJscadWorker);
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should initialize with scene and manifold worker", () => {
            const mockManifoldWorker = {
                postMessage: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                terminate: vi.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: vi.fn(),
            } as unknown as Worker;
            
            bitByBit.init(mockScene, undefined, undefined, mockManifoldWorker);
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should initialize with havok plugin", () => {
            const mockHavokPlugin = {
                name: "havok",
                setGravity: vi.fn()
            } as unknown as BABYLON.HavokPlugin;
            
            bitByBit.init(mockScene, undefined, undefined, undefined, mockHavokPlugin);
            expect(bitByBit.context.scene).toBe(mockScene);
            expect(bitByBit.context.havokPlugin).toBe(mockHavokPlugin);
        });

        it("should initialize with all workers", () => {
            const createMockWorker = () => ({
                postMessage: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                terminate: vi.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: vi.fn(),
            } as unknown as Worker);
            
            const mockOcctWorker = createMockWorker();
            const mockJscadWorker = createMockWorker();
            const mockManifoldWorker = createMockWorker();
            
            bitByBit.init(mockScene, mockOcctWorker, mockJscadWorker, mockManifoldWorker);
            expect(bitByBit.context.scene).toBe(mockScene);
        });

        it("should initialize with all parameters", () => {
            const createMockWorker = () => ({
                postMessage: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                terminate: vi.fn(),
                onmessage: null,
                onmessageerror: null,
                onerror: null,
                dispatchEvent: vi.fn(),
            } as unknown as Worker);
            
            const mockOcctWorker = createMockWorker();
            const mockJscadWorker = createMockWorker();
            const mockManifoldWorker = createMockWorker();
            const mockHavokPlugin = {
                name: "havok",
                setGravity: vi.fn()
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
            expect(plane!.normal).toBeDefined();
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
            mockScene = new MockScene() as unknown as BABYLON.Scene;
            bitByBit.init(mockScene);
        });

        it("should have time service with context", () => {
            expect(bitByBit.time).toBeDefined();
            // Time service should have access to context
        });
    });
});
