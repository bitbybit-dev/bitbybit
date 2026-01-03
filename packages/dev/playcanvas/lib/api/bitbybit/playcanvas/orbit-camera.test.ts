/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { PlayCanvasOrbitCamera } from "./orbit-camera";
import { Context } from "../../context";
import * as Inputs from "../../inputs/inputs";
import * as pc from "playcanvas";
import { createOrbitCameraMocks } from "../../__mocks__/test-helpers";

// Mock the entire playcanvas module
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
    
    // Use the centralized mocks from playcanvas.mock.ts
    const { MockVec2, MockVec3, MockQuat, MockBoundingBox, MockColor, MockGraphNode, MockEntity } = jest.requireActual("../../__mocks__/playcanvas.mock");
    
    return {
        ...actual,
        Vec2: MockVec2,
        Vec3: MockVec3,
        Quat: MockQuat,
        BoundingBox: MockBoundingBox,
        Entity: MockEntity,
        Color: MockColor,
        GraphNode: MockGraphNode,
        Mesh: class MockMesh extends actual.Mesh {
            constructor(graphicsDevice?: any) {
                const mockDevice = graphicsDevice || { vram: { vb: 0, ib: 0, tex: 0, total: 0 } };
                super(mockDevice);
            }
            update() {
                return this;
            }
        },
        MeshInstance: jest.fn((mesh: any, material: any, node: any = mockNode) => ({
            mesh,
            material,
            node
        })),
        math: {
            lerp: (a: number, b: number, t: number) => {
                return a + (b - a) * t;
            },
            clamp: (value: number, min: number, max: number) => {
                return Math.min(Math.max(value, min), max);
            },
        },
        MOUSEBUTTON_LEFT: 0,
        MOUSEBUTTON_MIDDLE: 1,
        MOUSEBUTTON_RIGHT: 2,
        EVENT_MOUSEDOWN: "mousedown",
        EVENT_MOUSEUP: "mouseup",
        EVENT_MOUSEMOVE: "mousemove",
        EVENT_MOUSEWHEEL: "mousewheel",
        EVENT_TOUCHSTART: "touchstart",
        EVENT_TOUCHEND: "touchend",
        EVENT_TOUCHMOVE: "touchmove",
        EVENT_TOUCHCANCEL: "touchcancel",
    };
});

describe("PlayCanvasOrbitCamera unit tests", () => {
    let orbitCamera: PlayCanvasOrbitCamera;
    let mockContext: Context;
    let mockApp: any;
    let mockScene: any;

    beforeEach(() => {
        const mocks = createOrbitCameraMocks();
        mockApp = mocks.mockApp;
        mockScene = mocks.mockScene;
        mockContext = {
            app: mockApp as any,
            scene: mockScene as any,
        } as Context;

        orbitCamera = new PlayCanvasOrbitCamera(mockContext);
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete (global as any).window;
    });

    describe("Constructor initialization", () => {
        it("should create a PlayCanvasOrbitCamera instance", () => {
            expect(orbitCamera).toBeDefined();
            expect(orbitCamera).toBeInstanceOf(PlayCanvasOrbitCamera);
        });

        it("should have context reference", () => {
            expect((orbitCamera as any).context).toBe(mockContext);
        });
    });

    describe("create method", () => {
        const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
            autoRender: true,
            distanceMax: 1000,
            distanceMin: 0.1,
            pitchAngleMax: 90,
            pitchAngleMin: -90,
            inertiaFactor: 0.2,
            focusEntity: null,
            frameOnStart: true,
            pivotPoint: [0, 0, 0],
            distance: 10,
            pitch: 0,
            yaw: 0,
            orbitSensitivity: 0.3,
            distanceSensitivity: 0.15,
        };

        it("should throw error if app is not initialized", () => {
            mockContext.app = null;
            expect(() => orbitCamera.create(defaultInputs)).toThrow();
        });

        it("should create orbit camera controller with default settings", () => {
            const controller = orbitCamera.create(defaultInputs);

            expect(controller).toBeDefined();
            expect(controller.orbitCamera).toBeDefined();
            expect(controller.cameraEntity).toBeDefined();
            expect(controller.mouseInput).toBeDefined();
            expect(controller.touchInput).toBeDefined();
            expect(controller.update).toBeDefined();
            expect(controller.destroy).toBeDefined();
        });

        it("should set camera properties correctly", () => {
            const controller = orbitCamera.create(defaultInputs);

            expect(controller.orbitCamera.autoRender).toBe(true);
            expect(controller.orbitCamera.distanceMax).toBe(1000);
            expect(controller.orbitCamera.distanceMin).toBe(0.1);
            expect(controller.orbitCamera.pitchAngleMax).toBe(90);
            expect(controller.orbitCamera.pitchAngleMin).toBe(-90);
            expect(controller.orbitCamera.inertiaFactor).toBe(0.2);
            expect(controller.orbitCamera.distance).toBe(10);
            expect(controller.orbitCamera.pitch).toBe(0);
            expect(controller.orbitCamera.yaw).toBe(0);
        });

        it("should set pivot point correctly", () => {
            const inputs = { ...defaultInputs, pivotPoint: [1, 2, 3] as Inputs.Base.Point3 };
            const controller = orbitCamera.create(inputs);

            const pivot = controller.orbitCamera.pivotPoint;
            expect(pivot.x).toBe(1);
            expect(pivot.y).toBe(2);
            expect(pivot.z).toBe(3);
        });

        it("should create orbit camera with custom parameters", () => {
            const customInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                ...defaultInputs,
                distance: 20,
                pitch: 45,
                yaw: 90,
                distanceMax: 500,
                distanceMin: 1,
                pitchAngleMax: 80,
                pitchAngleMin: -80,
                inertiaFactor: 0.5,
            };

            const controller = orbitCamera.create(customInputs);

            expect(controller.orbitCamera.distance).toBe(20);
            expect(controller.orbitCamera.pitch).toBe(45);
            expect(controller.orbitCamera.yaw).toBe(90);
            expect(controller.orbitCamera.distanceMax).toBe(500);
            expect(controller.orbitCamera.distanceMin).toBe(1);
            expect(controller.orbitCamera.pitchAngleMax).toBe(80);
            expect(controller.orbitCamera.pitchAngleMin).toBe(-80);
            expect(controller.orbitCamera.inertiaFactor).toBe(0.5);
        });

        it("should register update function on app", () => {
            orbitCamera.create(defaultInputs);
            expect(mockApp.on).toHaveBeenCalledWith("update", expect.any(Function));
        });

        it("should setup mouse input handlers", () => {
            const controller = orbitCamera.create(defaultInputs);
            expect(controller.mouseInput).not.toBeNull();
        });

        it("should setup touch input handlers", () => {
            const controller = orbitCamera.create(defaultInputs);
            expect(controller.touchInput).not.toBeNull();
        });

        it("should return null for mouse input when mouse is not available", () => {
            mockApp.mouse = null as any;
            const controller = orbitCamera.create(defaultInputs);
            expect(controller.mouseInput).toBeNull();
        });

        it("should return null for touch input when touch is not available", () => {
            mockApp.touch = null as any;
            const controller = orbitCamera.create(defaultInputs);
            expect(controller.touchInput).toBeNull();
        });

        it("should handle focus entity when provided", () => {
            const focusEntity = new pc.Entity() as any;
            const inputs = { ...defaultInputs, focusEntity, frameOnStart: true };
            
            const controller = orbitCamera.create(inputs);
            expect(controller.orbitCamera.focusEntity).toBe(focusEntity);
        });

        it("should not focus on entity when frameOnStart is false", () => {
            const focusEntity = new pc.Entity() as any;
            const inputs = { ...defaultInputs, focusEntity, frameOnStart: false };
            
            const controller = orbitCamera.create(inputs);
            expect(controller.orbitCamera.focusEntity).toBe(focusEntity);
        });

        it("should create camera entity if not found", () => {
            const controller = orbitCamera.create(defaultInputs);
            expect(controller.cameraEntity).toBeDefined();
        });
    });

    describe("setPivotPoint method", () => {
        it("should set pivot point correctly", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);

            orbitCamera.setPivotPoint({
                orbitCamera: controller,
                pivotPoint: [5, 10, 15],
            });

            const pivot = controller.orbitCamera.pivotPoint;
            expect(pivot.x).toBe(5);
            expect(pivot.y).toBe(10);
            expect(pivot.z).toBe(15);
        });
    });

    describe("getPivotPoint method", () => {
        it("should get pivot point correctly", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [1, 2, 3],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);

            const point = orbitCamera.getPivotPoint({ orbitCamera: controller, pivotPoint: [0, 0, 0] });
            
            expect(point[0]).toBe(1);
            expect(point[1]).toBe(2);
            expect(point[2]).toBe(3);
        });
    });

    describe("focusOnEntity method", () => {
        it("should call focus on the orbit camera instance", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            const mockEntity = new pc.Entity() as any;
            
            controller.orbitCamera.focus = jest.fn();

            orbitCamera.focusOnEntity({
                orbitCamera: controller,
                entity: mockEntity,
            });

            expect(controller.orbitCamera.focus).toHaveBeenCalledWith(mockEntity);
        });
    });

    describe("resetCamera method", () => {
        it("should call reset on the orbit camera instance", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            controller.orbitCamera.reset = jest.fn();

            orbitCamera.resetCamera({
                orbitCamera: controller,
                yaw: 45,
                pitch: 30,
                distance: 15,
            });

            expect(controller.orbitCamera.reset).toHaveBeenCalledWith(45, 30, 15);
        });
    });

    describe("destroy functionality", () => {
        it("should cleanup resources when destroy is called", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(() => controller.destroy()).not.toThrow();
        });
    });

    describe("update functionality", () => {
        it("should provide update function", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(typeof controller.update).toBe("function");
            expect(() => controller.update(0.016)).not.toThrow();
        });
    });

    describe("orbit camera instance properties", () => {
        it("should have all required properties", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            const instance = controller.orbitCamera;

            expect(instance).toHaveProperty("autoRender");
            expect(instance).toHaveProperty("distanceMax");
            expect(instance).toHaveProperty("distanceMin");
            expect(instance).toHaveProperty("pitchAngleMax");
            expect(instance).toHaveProperty("pitchAngleMin");
            expect(instance).toHaveProperty("inertiaFactor");
            expect(instance).toHaveProperty("focusEntity");
            expect(instance).toHaveProperty("frameOnStart");
            expect(instance).toHaveProperty("distance");
            expect(instance).toHaveProperty("pitch");
            expect(instance).toHaveProperty("yaw");
            expect(instance).toHaveProperty("pivotPoint");
            expect(instance).toHaveProperty("focus");
            expect(instance).toHaveProperty("resetAndLookAtPoint");
            expect(instance).toHaveProperty("resetAndLookAtEntity");
            expect(instance).toHaveProperty("reset");
            expect(instance).toHaveProperty("update");
        });
    });

    describe("resetAndLookAtPoint method", () => {
        it("should reset camera position and look at specified point", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            const resetPoint = new pc.Vec3(10, 10, 10);
            const lookAtPoint = new pc.Vec3(0, 0, 0);

            controller.orbitCamera.resetAndLookAtPoint(resetPoint, lookAtPoint);

            expect(controller.orbitCamera.pivotPoint.x).toBe(0);
            expect(controller.orbitCamera.pivotPoint.y).toBe(0);
            expect(controller.orbitCamera.pivotPoint.z).toBe(0);
        });

        it("should update distance based on reset and look at points", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            const resetPoint = new pc.Vec3(5, 0, 0);
            const lookAtPoint = new pc.Vec3(0, 0, 0);

            controller.orbitCamera.resetAndLookAtPoint(resetPoint, lookAtPoint);

            expect(controller.orbitCamera.distance).toBe(5);
        });
    });

    describe("Mouse input handlers", () => {
        it("should handle mouse down event for left button", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(mockApp.mouse.on).toHaveBeenCalledWith(pc.EVENT_MOUSEDOWN, expect.any(Function));
        });

        it("should handle mouse up event", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(mockApp.mouse.on).toHaveBeenCalledWith(pc.EVENT_MOUSEUP, expect.any(Function));
        });

        it("should handle mouse move event", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(mockApp.mouse.on).toHaveBeenCalledWith(pc.EVENT_MOUSEMOVE, expect.any(Function));
        });

        it("should handle mouse wheel event", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(mockApp.mouse.on).toHaveBeenCalledWith(pc.EVENT_MOUSEWHEEL, expect.any(Function));
        });

        it("should cleanup mouse handlers on destroy", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            controller.destroy();
            
            expect(mockApp.mouse.off).toHaveBeenCalledWith(pc.EVENT_MOUSEDOWN, expect.any(Function));
            expect(mockApp.mouse.off).toHaveBeenCalledWith(pc.EVENT_MOUSEUP, expect.any(Function));
            expect(mockApp.mouse.off).toHaveBeenCalledWith(pc.EVENT_MOUSEMOVE, expect.any(Function));
            expect(mockApp.mouse.off).toHaveBeenCalledWith(pc.EVENT_MOUSEWHEEL, expect.any(Function));
        });
    });

    describe("Touch input handlers", () => {
        it("should handle touch start event", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(mockApp.touch.on).toHaveBeenCalledWith("touchstart", expect.any(Function));
        });

        it("should handle touch end event", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(mockApp.touch.on).toHaveBeenCalledWith("touchend", expect.any(Function));
        });

        it("should handle touch cancel event", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(mockApp.touch.on).toHaveBeenCalledWith("touchcancel", expect.any(Function));
        });

        it("should handle touch move event", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            expect(mockApp.touch.on).toHaveBeenCalledWith("touchmove", expect.any(Function));
        });

        it("should cleanup touch handlers on destroy", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            controller.destroy();
            
            expect(mockApp.touch.off).toHaveBeenCalledWith("touchstart", expect.any(Function));
            expect(mockApp.touch.off).toHaveBeenCalledWith("touchend", expect.any(Function));
            expect(mockApp.touch.off).toHaveBeenCalledWith("touchcancel", expect.any(Function));
            expect(mockApp.touch.off).toHaveBeenCalledWith("touchmove", expect.any(Function));
        });
    });

    describe("Touch event behavior", () => {
        it("should handle single touch start and update touch point", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            // Get the touchstart handler
            const touchStartCall = mockApp.touch.on.mock.calls.find(
                (call: any[]) => call[0] === "touchstart"
            );
            expect(touchStartCall).toBeDefined();
            const onTouchStart = touchStartCall[1];

            // Simulate single touch event
            const touchEvent = {
                touches: [{ x: 100, y: 150 }]
            };

            // Call the handler - this tests onTouchStartEndCancel with single touch
            expect(() => onTouchStart(touchEvent)).not.toThrow();
        });

        it("should handle two-finger touch start for pinch gesture", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            // Get the touchstart handler
            const touchStartCall = mockApp.touch.on.mock.calls.find(
                (call: any[]) => call[0] === "touchstart"
            );
            const onTouchStart = touchStartCall[1];

            // Simulate two-finger touch - this tests getPinchDistance and calcMidPoint
            const touchEvent = {
                touches: [
                    { x: 100, y: 100 },
                    { x: 200, y: 200 }
                ]
            };

            expect(() => onTouchStart(touchEvent)).not.toThrow();
        });

        it("should handle single touch move and update camera orientation", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 10,
                yaw: 20,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            // Get handlers
            const touchStartCall = mockApp.touch.on.mock.calls.find(
                (call: any[]) => call[0] === "touchstart"
            );
            const touchMoveCall = mockApp.touch.on.mock.calls.find(
                (call: any[]) => call[0] === "touchmove"
            );
            
            const onTouchStart = touchStartCall[1];
            const onTouchMove = touchMoveCall[1];

            // Start with initial touch
            onTouchStart({ touches: [{ x: 100, y: 100 }] });

            const initialPitch = controller.orbitCamera.pitch;
            const initialYaw = controller.orbitCamera.yaw;

            // Move touch - this tests onTouchMove with single touch
            onTouchMove({ touches: [{ x: 110, y: 120 }] });

            // Verify camera orientation changed
            expect(controller.orbitCamera.pitch).not.toBe(initialPitch);
            expect(controller.orbitCamera.yaw).not.toBe(initialYaw);
        });

        it("should handle two-finger pinch zoom", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            // Add mock screenToWorld to camera
            if (controller.cameraEntity.camera) {
                controller.cameraEntity.camera.screenToWorld = jest.fn((x: number, y: number, distance: number, result: any) => {
                    result.set(x / 100, y / 100, distance);
                    return result;
                });
            }

            const touchStartCall = mockApp.touch.on.mock.calls.find(
                (call: any[]) => call[0] === "touchstart"
            );
            const touchMoveCall = mockApp.touch.on.mock.calls.find(
                (call: any[]) => call[0] === "touchmove"
            );
            
            const onTouchStart = touchStartCall[1];
            const onTouchMove = touchMoveCall[1];

            // Start with two fingers close together
            onTouchStart({
                touches: [
                    { x: 100, y: 100 },
                    { x: 110, y: 110 }
                ]
            });

            const initialDistance = controller.orbitCamera.distance;

            // Move fingers apart (zoom in) - this tests getPinchDistance, calcMidPoint, and pan
            onTouchMove({
                touches: [
                    { x: 90, y: 90 },
                    { x: 120, y: 120 }
                ]
            });

            // Verify distance changed
            expect(controller.orbitCamera.distance).not.toBe(initialDistance);
        });

        it("should handle touch end event", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            const touchEndCall = mockApp.touch.on.mock.calls.find(
                (call: any[]) => call[0] === "touchend"
            );
            const onTouchEnd = touchEndCall[1];

            // Should not throw when handling touch end
            expect(() => onTouchEnd({ touches: [] })).not.toThrow();
        });

        it("should handle touch cancel event", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            const touchCancelCall = mockApp.touch.on.mock.calls.find(
                (call: any[]) => call[0] === "touchcancel"
            );
            const onTouchCancel = touchCancelCall[1];

            // Should not throw when handling touch cancel
            expect(() => onTouchCancel({ touches: [] })).not.toThrow();
        });
    });

    describe("Mouse event behavior", () => {
        it("should handle left mouse button down for orbit", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            const mouseDownCall = mockApp.mouse.on.mock.calls.find(
                (call: any[]) => call[0] === pc.EVENT_MOUSEDOWN
            );
            const onMouseDown = mouseDownCall[1];

            // Simulate left button press
            const leftButtonEvent = { button: pc.MOUSEBUTTON_LEFT };
            expect(() => onMouseDown(leftButtonEvent)).not.toThrow();
        });

        it("should handle middle mouse button down for pan", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            const mouseDownCall = mockApp.mouse.on.mock.calls.find(
                (call: any[]) => call[0] === pc.EVENT_MOUSEDOWN
            );
            const onMouseDown = mouseDownCall[1];

            // Simulate middle button press
            const middleButtonEvent = { button: pc.MOUSEBUTTON_MIDDLE };
            expect(() => onMouseDown(middleButtonEvent)).not.toThrow();
        });

        it("should handle right mouse button down for pan", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            const mouseDownCall = mockApp.mouse.on.mock.calls.find(
                (call: any[]) => call[0] === pc.EVENT_MOUSEDOWN
            );
            const onMouseDown = mouseDownCall[1];

            // Simulate right button press
            const rightButtonEvent = { button: pc.MOUSEBUTTON_RIGHT };
            expect(() => onMouseDown(rightButtonEvent)).not.toThrow();
        });

        it("should handle mouse button up", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            const mouseUpCall = mockApp.mouse.on.mock.calls.find(
                (call: any[]) => call[0] === pc.EVENT_MOUSEUP
            );
            const onMouseUp = mouseUpCall[1];

            // Simulate button release
            const leftButtonUpEvent = { button: pc.MOUSEBUTTON_LEFT };
            expect(() => onMouseUp(leftButtonUpEvent)).not.toThrow();
        });

        it("should handle mouse move for orbiting", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 10,
                yaw: 20,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            const mouseDownCall = mockApp.mouse.on.mock.calls.find(
                (call: any[]) => call[0] === pc.EVENT_MOUSEDOWN
            );
            const mouseMoveCall = mockApp.mouse.on.mock.calls.find(
                (call: any[]) => call[0] === pc.EVENT_MOUSEMOVE
            );
            
            const onMouseDown = mouseDownCall[1];
            const onMouseMove = mouseMoveCall[1];

            // Press left button
            onMouseDown({ button: pc.MOUSEBUTTON_LEFT });

            const initialPitch = controller.orbitCamera.pitch;
            const initialYaw = controller.orbitCamera.yaw;

            // Move mouse
            onMouseMove({ dx: 10, dy: 5, x: 100, y: 100 });

            // Verify camera orientation changed
            expect(controller.orbitCamera.pitch).not.toBe(initialPitch);
            expect(controller.orbitCamera.yaw).not.toBe(initialYaw);
        });

        it("should handle mouse move for panning", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            // Add mock screenToWorld to camera
            if (controller.cameraEntity.camera) {
                controller.cameraEntity.camera.screenToWorld = jest.fn((x: number, y: number, distance: number, result: any) => {
                    result.set(x / 100, y / 100, distance);
                    return result;
                });
            }

            const mouseDownCall = mockApp.mouse.on.mock.calls.find(
                (call: any[]) => call[0] === pc.EVENT_MOUSEDOWN
            );
            const mouseMoveCall = mockApp.mouse.on.mock.calls.find(
                (call: any[]) => call[0] === pc.EVENT_MOUSEMOVE
            );
            
            const onMouseDown = mouseDownCall[1];
            const onMouseMove = mouseMoveCall[1];

            // Press middle button
            onMouseDown({ button: pc.MOUSEBUTTON_MIDDLE });

            // Move mouse - this tests the pan function
            onMouseMove({ dx: 10, dy: 5, x: 110, y: 105 });

            // Verify pan was called (camera should have screenToWorld invoked)
            expect(controller.cameraEntity.camera?.screenToWorld).toHaveBeenCalled();
        });

        it("should handle mouse wheel for zoom", () => {
            const defaultInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(defaultInputs);
            
            const mouseWheelCall = mockApp.mouse.on.mock.calls.find(
                (call: any[]) => call[0] === pc.EVENT_MOUSEWHEEL
            );
            const onMouseWheel = mouseWheelCall[1];

            const initialDistance = controller.orbitCamera.distance;

            // Simulate mouse wheel scroll
            const mockPreventDefault = jest.fn();
            onMouseWheel({ 
                wheelDelta: -1, 
                event: { preventDefault: mockPreventDefault } 
            });

            // Verify distance changed
            expect(controller.orbitCamera.distance).not.toBe(initialDistance);
            expect(mockPreventDefault).toHaveBeenCalled();
        });
    });

    describe("Sensitivity settings", () => {
        it("should use custom orbit sensitivity", () => {
            const customInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.5,
                distanceSensitivity: 0.15,
            };

            const controller = orbitCamera.create(customInputs);
            
            // Verify controller is created with custom settings
            expect(controller).toBeDefined();
            expect(controller.mouseInput).toBeDefined();
        });

        it("should use custom distance sensitivity", () => {
            const customInputs: Inputs.PlayCanvasCamera.OrbitCameraDto = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.2,
                focusEntity: null,
                frameOnStart: true,
                pivotPoint: [0, 0, 0],
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.25,
            };

            const controller = orbitCamera.create(customInputs);
            
            // Verify controller is created with custom settings
            expect(controller).toBeDefined();
            expect(controller.mouseInput).toBeDefined();
        });
    });
});
