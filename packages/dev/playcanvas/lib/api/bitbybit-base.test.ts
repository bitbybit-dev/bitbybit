jest.mock("playcanvas", () => {
    const actual = jest.requireActual("playcanvas");
    const mockNode = {
        scene: {
            layers: {
                getLayerById: jest.fn(() => ({
                    addMeshInstances: jest.fn(),
                    removeMeshInstances: jest.fn()
                }))
            }
        }
    };
    return {
        ...actual,
        Mesh: class MockMesh extends actual.Mesh {
            constructor(graphicsDevice?: any) {
                const mockDevice = graphicsDevice || { vram: { vb: 0, ib: 0, tex: 0, total: 0 } };
                super(mockDevice);
            }
            update() {
                return this;
            }
        },
        Entity: class MockEntity extends actual.Entity {
            constructor(name?: string) {
                super(name);
            }
            addComponent(type: string, data: any) {
                const mockComponent = { type, ...data };
                return mockComponent;
            }
            setLocalPosition(x: number, y: number, z: number) {
                // Mock implementation
                if (this.localPosition) {
                    this.localPosition.set(x, y, z);
                }
            }
            addChild(entity: any) {
                // Mock implementation - use the actual parent class method
                if (super.addChild) {
                    super.addChild(entity);
                }
            }
        },
        MeshInstance: jest.fn((mesh, material, node = mockNode) => ({
            mesh,
            material,
            node
        }))
    };
});

import { BitByBitBase } from "./bitbybit-base";

import * as pc from "playcanvas";

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

        it("should initialize vector service", () => {
            expect(bitByBit.vector).toBeDefined();
        });

        it("should initialize playcanvas service", () => {
            expect(bitByBit.playcanvas).toBeDefined();
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
        it("should initialize with app and scene", () => {
            const mockApp = {} as pc.AppBase;
            const scene = new pc.Entity("root");
            bitByBit.init(mockApp, scene);
            expect(bitByBit.context.scene).toBe(scene);
            expect(bitByBit.context.app).toBe(mockApp);
        });

        it("should set verb context", () => {
            const mockApp = {} as pc.AppBase;
            const scene = new pc.Entity("root");
            bitByBit.init(mockApp, scene);
            expect(bitByBit.context.verb).toBeDefined();
            expect(bitByBit.context.verb.geom).toBeDefined();
            expect(bitByBit.context.verb.core).toBeDefined();
        });

        it("should set jsonpath context", () => {
            const mockApp = {} as pc.AppBase;
            const scene = new pc.Entity("root");
            bitByBit.init(mockApp, scene);
            expect(bitByBit.context.jsonpath).toBeDefined();
        });

        it("should initialize with app, scene and occt worker", () => {
            const mockApp = {} as pc.AppBase;
            const scene = new pc.Entity("root");
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
            
            bitByBit.init(mockApp, scene, mockOcctWorker);
            expect(bitByBit.context.scene).toBe(scene);
            expect(bitByBit.context.app).toBe(mockApp);
        });

        it("should initialize with app, scene and jscad worker", () => {
            const mockApp = {} as pc.AppBase;
            const scene = new pc.Entity("root");
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
            
            bitByBit.init(mockApp, scene, undefined, mockJscadWorker);
            expect(bitByBit.context.scene).toBe(scene);
            expect(bitByBit.context.app).toBe(mockApp);
        });

        it("should initialize with app, scene and manifold worker", () => {
            const mockApp = {} as pc.AppBase;
            const scene = new pc.Entity("root");
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
            
            bitByBit.init(mockApp, scene, undefined, undefined, mockManifoldWorker);
            expect(bitByBit.context.scene).toBe(scene);
            expect(bitByBit.context.app).toBe(mockApp);
        });

        it("should initialize with all workers", () => {
            const mockApp = {} as pc.AppBase;
            const scene = new pc.Entity("root");
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
            
            bitByBit.init(mockApp, scene, mockOcctWorker, mockJscadWorker, mockManifoldWorker);
            expect(bitByBit.context.scene).toBe(scene);
            expect(bitByBit.context.app).toBe(mockApp);
        });

        it("should handle undefined workers gracefully", () => {
            const mockApp = {} as pc.AppBase;
            const scene = new pc.Entity("root");
            expect(() => bitByBit.init(mockApp, scene, undefined, undefined, undefined)).not.toThrow();
            expect(bitByBit.context.scene).toBe(scene);
            expect(bitByBit.context.app).toBe(mockApp);
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
            
            const mockApp1 = {} as pc.AppBase;
            const mockApp2 = {} as pc.AppBase;
            const scene1 = new pc.Entity("root1");
            const scene2 = new pc.Entity("root2");
            scene1.name = "scene1";
            scene2.name = "scene2";
            
            instance1.init(mockApp1, scene1);
            instance2.init(mockApp2, scene2);
            
            expect(instance1.context.scene).toBe(scene1);
            expect(instance2.context.scene).toBe(scene2);
            expect(instance1.context.scene).not.toBe(instance2.context.scene);
        });
    });

    describe("Scene manipulation after init", () => {
        it("should allow adding objects to the scene via draw", () => {
            const mockApp = {
                graphicsDevice: {
                    vram: { vb: 0, ib: 0, tex: 0, total: 0 }
                },
                systems: {}
            } as unknown as pc.AppBase;
            const scene = new pc.Entity("root");
            bitByBit.init(mockApp, scene);
            
            // Draw a point
            const result = bitByBit.draw.drawAny({ entity: [1, 2, 3] });
            expect(result).toBeDefined();
            expect(scene.children.length).toBeGreaterThan(0);
        });

        it("should allow multiple draws to the same scene", () => {
            const mockApp = {
                graphicsDevice: {
                    vram: { vb: 0, ib: 0, tex: 0, total: 0 }
                },
                systems: {}
            } as unknown as pc.AppBase;
            const scene = new pc.Entity("root");
            bitByBit.init(mockApp, scene);
            
            bitByBit.draw.drawAny({ entity: [1, 2, 3] });
            bitByBit.draw.drawAny({ entity: [4, 5, 6] });
            bitByBit.draw.drawAny({ entity: [[0, 0, 0], [1, 1, 1]] }); // line
            
            expect(scene.children.length).toBeGreaterThanOrEqual(3);
        });
    });
});
