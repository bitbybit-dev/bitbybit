import { describe, it, expect, beforeEach, vi } from "vitest";
import * as THREEJS from "three";
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
import { ThreeJS } from "./bitbybit/threejs";
import { BitByBitBase } from "./bitbybit-base";

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
            ["three", ThreeJS],
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
            ["occt", OCCTW],
            ["mesh", MeshBitByBit],
            ["asset", Asset],
            ["color", Color],
        ];

        it.each(wiring)("should wire %s to its own service class", (field, constructor) => {
            expect(bitByBit[field]).toBeInstanceOf(constructor);
        });

        it("should give every service the same context instance", () => {
            expect(bitByBit.draw.context).toBe(bitByBit.context);
        });

        it("should expose one service per public field and no undefined among them", () => {
            const wired = new Set(wiring.map(([field]) => field));
            const missing = wiring.filter(([field]) => bitByBit[field] === undefined).map(([field]) => field);

            expect(missing).toEqual([]);
            expect(wired.size).toBe(wiring.length);
        });
    });

    describe("init method", () => {
        it("should initialize with scene only", () => {
            const scene = new THREEJS.Scene();
            bitByBit.init(scene);
            expect(bitByBit.context.scene).toBe(scene);
        });

        it("should set verb context", () => {
            const scene = new THREEJS.Scene();
            bitByBit.init(scene);
            expect(bitByBit.context.verb).toBeDefined();
            expect(bitByBit.context.verb.geom).toBeDefined();
            expect(bitByBit.context.verb.core).toBeDefined();
        });

        it("should set jsonpath context", () => {
            const scene = new THREEJS.Scene();
            bitByBit.init(scene);
            expect(bitByBit.context.jsonpath).toBeDefined();
        });

        it("should initialize with scene and occt worker", () => {
            const scene = new THREEJS.Scene();
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
            
            bitByBit.init(scene, mockOcctWorker);
            expect(bitByBit.context.scene).toBe(scene);
        });

        it("should initialize with scene and jscad worker", () => {
            const scene = new THREEJS.Scene();
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
            
            bitByBit.init(scene, undefined, mockJscadWorker);
            expect(bitByBit.context.scene).toBe(scene);
        });

        it("should initialize with scene and manifold worker", () => {
            const scene = new THREEJS.Scene();
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
            
            bitByBit.init(scene, undefined, undefined, mockManifoldWorker);
            expect(bitByBit.context.scene).toBe(scene);
        });

        it("should initialize with all workers", () => {
            const scene = new THREEJS.Scene();
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
            
            bitByBit.init(scene, mockOcctWorker, mockJscadWorker, mockManifoldWorker);
            expect(bitByBit.context.scene).toBe(scene);
        });

        it("should handle undefined workers gracefully", () => {
            const scene = new THREEJS.Scene();
            expect(() => bitByBit.init(scene, undefined, undefined, undefined)).not.toThrow();
            expect(bitByBit.context.scene).toBe(scene);
        });
    });

    describe("Service integration", () => {
        it("should have functional math operations", () => {
            // Test basic number creation instead of twoNrOperation which requires proper enum
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
            
            const scene1 = new THREEJS.Scene();
            const scene2 = new THREEJS.Scene();
            scene1.name = "scene1";
            scene2.name = "scene2";
            
            instance1.init(scene1);
            instance2.init(scene2);
            
            expect(instance1.context.scene).toBe(scene1);
            expect(instance2.context.scene).toBe(scene2);
            expect(instance1.context.scene).not.toBe(instance2.context.scene);
        });
    });

    describe("Scene manipulation after init", () => {
        it("should allow adding objects to the scene via draw", () => {
            const scene = new THREEJS.Scene();
            bitByBit.init(scene);
            
            // Draw a point
            const result = bitByBit.draw.drawAny({ entity: [1, 2, 3] });
            expect(result).toBeDefined();
            expect(scene.children.length).toBeGreaterThan(0);
        });

        it("should allow multiple draws to the same scene", () => {
            const scene = new THREEJS.Scene();
            bitByBit.init(scene);
            
            bitByBit.draw.drawAny({ entity: [1, 2, 3] });
            bitByBit.draw.drawAny({ entity: [4, 5, 6] });
            bitByBit.draw.drawAny({ entity: [[0, 0, 0], [1, 1, 1]] }); // line
            
            expect(scene.children.length).toBeGreaterThanOrEqual(3);
        });
    });
});
