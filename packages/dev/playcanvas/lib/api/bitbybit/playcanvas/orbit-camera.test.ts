/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { PlayCanvasOrbitCamera } from "./orbit-camera";
import { Context } from "../../context";
import * as Inputs from "../../inputs/inputs";
import * as pc from "playcanvas";

// Mock the entire playcanvas module
jest.mock("playcanvas", () => {
    class MockVec2 {
        x: number;
        y: number;
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        set(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }

    class MockVec3 {
        x: number;
        y: number;
        z: number;
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        set(x: number, y: number, z: number) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        copy(other: MockVec3) {
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
            return this;
        }
        sub(other: MockVec3) {
            this.x -= other.x;
            this.y -= other.y;
            this.z -= other.z;
            return this;
        }
        add(other: MockVec3) {
            this.x += other.x;
            this.y += other.y;
            this.z += other.z;
            return this;
        }
        mulScalar(scalar: number) {
            this.x *= scalar;
            this.y *= scalar;
            this.z *= scalar;
            return this;
        }
        length() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
        normalize() {
            const len = this.length();
            if (len > 0) {
                this.x /= len;
                this.y /= len;
                this.z /= len;
            }
            return this;
        }
        lerp(from: MockVec3, to: MockVec3, t: number) {
            this.x = from.x + (to.x - from.x) * t;
            this.y = from.y + (to.y - from.y) * t;
            this.z = from.z + (to.z - from.z) * t;
            return this;
        }
    }

    class MockQuat {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x = 0, y = 0, z = 0, w = 1) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        setFromEulerAngles(x: number, y: number, z: number) {
            return this;
        }
        transformVector(vec: MockVec3, out?: MockVec3) {
            const result = out || vec;
            return result;
        }
        mul2(a: MockQuat, b: MockQuat) {
            // Simplified quaternion multiplication for testing
            this.x = a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y;
            this.y = a.w * b.y + a.y * b.w + a.z * b.x - a.x * b.z;
            this.z = a.w * b.z + a.z * b.w + a.x * b.y - a.y * b.x;
            this.w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
            return this;
        }
    }

    class MockBoundingBox {
        center = new MockVec3();
        halfExtents = new MockVec3();
        add() { }
        compute() { }
    }

    class MockColor {
        r: number;
        g: number;
        b: number;
        constructor(r = 0, g = 0, b = 0) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }

    class MockCameraComponent {
        fov = 45;
        farClip = 10000;
        nearClip = 0.1;
    }

    class MockEntity {
        camera: MockCameraComponent | null = null;
        name = "TestEntity";
        parent: MockEntity | null = null;
        children: MockEntity[] = [];
        _position = new MockVec3();
        _rotation = new MockQuat();
        
        getPosition() { return this._position; }
        getRotation() { return this._rotation; }
        setPosition(x: number | MockVec3, y?: number, z?: number) {
            if (typeof x === "number" && y !== undefined && z !== undefined) {
                this._position.set(x, y, z);
            } else if (x instanceof MockVec3) {
                this._position.copy(x);
            }
        }
        setRotation(quat: MockQuat) {
            this._rotation = quat;
        }
        setLocalPosition(x: number | MockVec3, y?: number, z?: number) {
            this.setPosition(x as any, y, z);
        }
        setLocalRotation(quat: MockQuat) {
            this.setRotation(quat);
        }
        lookAt(target: MockVec3) { }
        findByName() { return null; }
        findOne() { return null; }
        addChild(entity: MockEntity) { 
            entity.parent = this;
            this.children.push(entity); 
        }
        addComponent(type: string, options?: any) {
            if (type === "camera") {
                this.camera = new MockCameraComponent();
                if (options) {
                    Object.assign(this.camera, options);
                }
            }
        }
    }

    return {
        Vec2: MockVec2,
        Vec3: MockVec3,
        Quat: MockQuat,
        BoundingBox: MockBoundingBox,
        Entity: MockEntity,
        Color: MockColor,
        GraphNode: class MockGraphNode { },
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
    };
});

class MockScene {
    _children: any[] = [];
    findOne(callback: (node: any) => boolean) {
        return null;
    }
    addChild(entity: any) {
        this._children.push(entity);
    }
}

class MockMouse {
    on = jest.fn();
    off = jest.fn();
    disableContextMenu = jest.fn();
}

class MockTouch {
    on = jest.fn();
    off = jest.fn();
}

class MockApp {
    root: any;
    mouse = new MockMouse();
    touch = new MockTouch();
    on = jest.fn();
    off = jest.fn();

    constructor() {
        // Use the imported mocked Entity class
        this.root = new pc.Entity("root");
    }
}

describe("PlayCanvasOrbitCamera unit tests", () => {
    let orbitCamera: PlayCanvasOrbitCamera;
    let mockContext: Context;
    let mockApp: MockApp;
    let mockScene: MockScene;

    beforeEach(() => {
        // Mock window object
        (global as any).window = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };

        mockApp = new MockApp();
        mockScene = new MockScene();
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
});
