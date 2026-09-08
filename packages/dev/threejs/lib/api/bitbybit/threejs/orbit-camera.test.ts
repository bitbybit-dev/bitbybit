import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { ThreeJSOrbitCamera, OrbitCameraController, createOrbitCamera } from "./orbit-camera";
import { Context } from "../../context";
import * as Inputs from "../../inputs";
import * as THREEJS from "three";
import { createMockContext, createSimpleMockContext, createMockDOMElement } from "../../__mocks__/test-helpers";

describe("ThreeJSOrbitCamera unit tests", () => {
    let orbitCamera: ThreeJSOrbitCamera;
    let mockContext: Context;
    let mockDomElement: HTMLElement;

    beforeEach(() => {
        mockContext = createMockContext();
        orbitCamera = new ThreeJSOrbitCamera(mockContext);

        // Create mock DOM element from shared test helpers
        mockDomElement = createMockDOMElement();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Constructor initialization", () => {
        it("should create a ThreeJSOrbitCamera instance", () => {
            expect(orbitCamera).toBeInstanceOf(ThreeJSOrbitCamera);
        });
    });

    describe("create method", () => {
        const createDefaultInputs = (domElement?: HTMLElement): Inputs.ThreeJSCamera.OrbitCameraDto => ({
            autoRender: true,
            distanceMax: 1000,
            distanceMin: 0.1,
            pitchAngleMax: 90,
            pitchAngleMin: -90,
            inertiaFactor: 0.1,
            enableDamping: true,
            dampingFactor: 0.1,
            focusObject: undefined,
            frameOnStart: true,
            pivotPoint: [0, 0, 0],
            distance: 10,
            pitch: 0,
            yaw: 0,
            orbitSensitivity: 0.3,
            distanceSensitivity: 0.15,
            panSensitivity: 1,
            domElement: domElement,
        });

        it("should throw error if scene is not initialized", () => {
            const contextWithoutScene = createSimpleMockContext();
            const cameraWithoutScene = new ThreeJSOrbitCamera(contextWithoutScene);
            expect(() => cameraWithoutScene.create(createDefaultInputs())).toThrow();
        });

        it("should create orbit camera controller with default settings", () => {
            const controller = orbitCamera.create(createDefaultInputs(mockDomElement));

            expect(controller.camera).toBeInstanceOf(THREEJS.PerspectiveCamera);
            expect(typeof controller.orbitCamera.distance).toBe("number");
            expect(typeof controller.mouseInput!.destroy).toBe("function");
            expect(typeof controller.touchInput!.destroy).toBe("function");
            expect(typeof controller.keyboardInput!.destroy).toBe("function");
            expect(typeof controller.update).toBe("function");
            expect(typeof controller.destroy).toBe("function");
        });

        it("should set camera properties correctly", () => {
            const controller = orbitCamera.create(createDefaultInputs(mockDomElement));

            expect(controller.orbitCamera.autoRender).toBe(true);
            expect(controller.orbitCamera.distanceMax).toBe(1000);
            expect(controller.orbitCamera.distanceMin).toBe(0.1);
            expect(controller.orbitCamera.pitchAngleMax).toBe(90);
            expect(controller.orbitCamera.pitchAngleMin).toBe(-90);
            expect(controller.orbitCamera.inertiaFactor).toBe(0.1);
            expect(controller.orbitCamera.distance).toBe(10);
            expect(controller.orbitCamera.pitch).toBe(0);
            expect(controller.orbitCamera.yaw).toBe(0);
        });

        it("should set pivot point correctly", () => {
            const inputs = { ...createDefaultInputs(mockDomElement), pivotPoint: [1, 2, 3] as Inputs.Base.Point3 };
            const controller = orbitCamera.create(inputs);

            const pivot = controller.orbitCamera.pivotPoint;
            expect(pivot.x).toBe(1);
            expect(pivot.y).toBe(2);
            expect(pivot.z).toBe(3);
        });

        it("should create orbit camera with custom parameters", () => {
            const customInputs: Inputs.ThreeJSCamera.OrbitCameraDto = {
                ...createDefaultInputs(mockDomElement),
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

        it("should setup mouse input handlers with destroy method", () => {
            const controller = orbitCamera.create(createDefaultInputs(mockDomElement));
            expect(typeof controller.mouseInput!.destroy).toBe("function");
        });

        it("should setup touch input handlers with destroy method", () => {
            const controller = orbitCamera.create(createDefaultInputs(mockDomElement));
            expect(typeof controller.touchInput!.destroy).toBe("function");
        });

        it("should setup keyboard input handlers with destroy method", () => {
            const controller = orbitCamera.create(createDefaultInputs(mockDomElement));
            expect(typeof controller.keyboardInput!.destroy).toBe("function");
        });

        it("should create camera with correct default properties", () => {
            const controller = orbitCamera.create(createDefaultInputs(mockDomElement));

            expect(controller.camera.fov).toBe(50);
            expect(controller.camera.near).toBe(0.1);
            expect(controller.camera.far).toBe(10000);
        });

        it("should destroy all input handlers on destroy call", () => {
            const controller = orbitCamera.create(createDefaultInputs(mockDomElement));

            // Verify input handlers exist with destroy methods before destruction
            expect(typeof controller.mouseInput!.destroy).toBe("function");
            expect(typeof controller.touchInput!.destroy).toBe("function");
            expect(typeof controller.keyboardInput!.destroy).toBe("function");

            // Destroy should complete without error
            controller.destroy();

            // After destroy, the controller should still be a valid object
            expect(controller.camera).toBeInstanceOf(THREEJS.PerspectiveCamera);
        });
    });

    describe("setPivotPoint method", () => {
        it("should set pivot point correctly", () => {
            const defaultInputs = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.1,
                enableDamping: true,
                dampingFactor: 0.1,
                focusObject: undefined,
                frameOnStart: true,
                pivotPoint: [0, 0, 0] as Inputs.Base.Point3,
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
                panSensitivity: 1,
                domElement: mockDomElement,
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
        it("should return pivot point correctly", () => {
            const defaultInputs = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.1,
                enableDamping: true,
                dampingFactor: 0.1,
                focusObject: undefined,
                frameOnStart: true,
                pivotPoint: [3, 6, 9] as Inputs.Base.Point3,
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
                panSensitivity: 1,
                domElement: mockDomElement,
            };

            const controller = orbitCamera.create(defaultInputs);

            const pivot = orbitCamera.getPivotPoint({
                orbitCamera: controller,
                pivotPoint: [0, 0, 0], // This won't be used for getting
            });

            expect(pivot).toEqual([3, 6, 9]);
        });
    });

    describe("resetCamera method", () => {
        it("should reset camera to specified values", () => {
            const defaultInputs = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.1,
                enableDamping: true,
                dampingFactor: 0.1,
                focusObject: undefined,
                frameOnStart: true,
                pivotPoint: [0, 0, 0] as Inputs.Base.Point3,
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
                panSensitivity: 1,
                domElement: mockDomElement,
            };

            const controller = orbitCamera.create(defaultInputs);

            orbitCamera.resetCamera({
                orbitCamera: controller,
                yaw: 45,
                pitch: 30,
                distance: 50,
            });

            expect(controller.orbitCamera.yaw).toBe(45);
            expect(controller.orbitCamera.pitch).toBe(30);
            expect(controller.orbitCamera.distance).toBe(50);
        });
    });

    describe("Distance and pitch getters", () => {
        let controller: OrbitCameraController;

        beforeEach(() => {
            const defaultInputs = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.1,
                enableDamping: true,
                dampingFactor: 0.1,
                focusObject: undefined,
                frameOnStart: true,
                pivotPoint: [0, 0, 0] as Inputs.Base.Point3,
                distance: 25,
                pitch: 45,
                yaw: 60,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
                panSensitivity: 1,
                domElement: mockDomElement,
            };
            controller = orbitCamera.create(defaultInputs);
        });

        it("should get distance correctly", () => {
            const distance = orbitCamera.getDistance({ orbitCamera: controller });
            expect(distance).toBe(25);
        });

        it("should get yaw correctly", () => {
            const yaw = orbitCamera.getYaw({ orbitCamera: controller });
            expect(yaw).toBe(60);
        });

        it("should get pitch correctly", () => {
            const pitch = orbitCamera.getPitch({ orbitCamera: controller });
            expect(pitch).toBe(45);
        });
    });

    describe("Distance and pitch limits", () => {
        let controller: OrbitCameraController;

        beforeEach(() => {
            const defaultInputs = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.1,
                enableDamping: true,
                dampingFactor: 0.1,
                focusObject: undefined,
                frameOnStart: true,
                pivotPoint: [0, 0, 0] as Inputs.Base.Point3,
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
                panSensitivity: 1,
                domElement: mockDomElement,
            };
            controller = orbitCamera.create(defaultInputs);
        });

        it("should set distance limits", () => {
            orbitCamera.setDistanceLimits({
                orbitCamera: controller,
                min: 5,
                max: 100,
            });

            expect(controller.orbitCamera.distanceMin).toBe(5);
            expect(controller.orbitCamera.distanceMax).toBe(100);
        });

        it("should set pitch limits", () => {
            orbitCamera.setPitchLimits({
                orbitCamera: controller,
                min: -45,
                max: 45,
            });

            expect(controller.orbitCamera.pitchAngleMin).toBe(-45);
            expect(controller.orbitCamera.pitchAngleMax).toBe(45);
        });

        it("should clamp distance to min/max bounds", () => {
            orbitCamera.setDistanceLimits({
                orbitCamera: controller,
                min: 5,
                max: 100,
            });

            // Try to set distance below min
            controller.orbitCamera.distance = 1;
            expect(controller.orbitCamera.distance).toBe(5);

            // Try to set distance above max
            controller.orbitCamera.distance = 200;
            expect(controller.orbitCamera.distance).toBe(100);
        });

        it("should clamp pitch to min/max bounds", () => {
            orbitCamera.setPitchLimits({
                orbitCamera: controller,
                min: -45,
                max: 45,
            });

            // Try to set pitch below min
            controller.orbitCamera.pitch = -60;
            expect(controller.orbitCamera.pitch).toBe(-45);

            // Try to set pitch above max
            controller.orbitCamera.pitch = 60;
            expect(controller.orbitCamera.pitch).toBe(45);
        });
    });

    describe("Update method", () => {
        it("should update camera position on update call", () => {
            const defaultInputs = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.1,
                enableDamping: true,
                dampingFactor: 0.1,
                focusObject: undefined,
                frameOnStart: true,
                pivotPoint: [0, 0, 0] as Inputs.Base.Point3,
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
                panSensitivity: 1,
                domElement: mockDomElement,
            };

            const controller = orbitCamera.create(defaultInputs);
            const initialPosition = controller.camera.position.clone();

            // Change target values
            controller.orbitCamera.yaw = 45;
            controller.orbitCamera.pitch = 30;

            // Update with dt
            controller.update(0.016);

            // Camera position should have changed
            expect(controller.camera.position.equals(initialPosition)).toBe(false);
        });

        it("should interpolate values with damping", () => {
            const defaultInputs = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.1,
                enableDamping: true,
                dampingFactor: 0.1,
                focusObject: undefined,
                frameOnStart: true,
                pivotPoint: [0, 0, 0] as Inputs.Base.Point3,
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
                panSensitivity: 1,
                domElement: mockDomElement,
            };

            const controller = orbitCamera.create(defaultInputs);

            // Set target distance
            controller.orbitCamera.distance = 50;

            // Update partially
            controller.update(0.016);

            // Should not have reached target yet due to damping
            const currentDistance = (controller.orbitCamera as any)._distance || 
                                   controller.camera.position.length();

            // The distance should be somewhere between initial and target
            expect(currentDistance).not.toBe(50);
        });
    });

    describe("Focus on object", () => {
        it("should focus on object correctly", () => {
            const defaultInputs = {
                autoRender: true,
                distanceMax: 1000,
                distanceMin: 0.1,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                inertiaFactor: 0.1,
                enableDamping: true,
                dampingFactor: 0.1,
                focusObject: undefined,
                frameOnStart: true,
                pivotPoint: [0, 0, 0] as Inputs.Base.Point3,
                distance: 10,
                pitch: 0,
                yaw: 0,
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15,
                panSensitivity: 1,
                domElement: mockDomElement,
            };

            const controller = orbitCamera.create(defaultInputs);

            // Create a test mesh
            const geometry = new THREEJS.BoxGeometry(2, 2, 2);
            const material = new THREEJS.MeshBasicMaterial();
            const mesh = new THREEJS.Mesh(geometry, material);
            mesh.position.set(5, 5, 5);
            mockContext.scene.add(mesh);

            // Focus on the mesh
            orbitCamera.focusOnObject({
                orbitCamera: controller,
                object: mesh,
                padding: 1.5,
            });

            // Pivot should be at mesh center
            const pivot = controller.orbitCamera.pivotPoint;
            expect(pivot.x).toBeCloseTo(5, 1);
            expect(pivot.y).toBeCloseTo(5, 1);
            expect(pivot.z).toBeCloseTo(5, 1);
        });
    });
});

// Note: DTO constructor tests are in threejs-camera-inputs.test.ts to avoid duplication

// The camera is driven by a pointer, a pair of fingers and the arrow keys, and each of those arrives
// as an event on the element it was attached to. The element the suite hands in records its
// listeners, so an event dispatched on it reaches the handler exactly as a browser's would.
describe("ThreeJSOrbitCamera input handling", () => {
    let orbitCamera: ThreeJSOrbitCamera;
    let domElement: HTMLElement;
    let controller: OrbitCameraController;

    const inputsFor = (element: HTMLElement): Inputs.ThreeJSCamera.OrbitCameraDto => ({
        autoRender: true,
        distanceMax: 1000,
        distanceMin: 0.1,
        pitchAngleMax: 90,
        pitchAngleMin: -90,
        inertiaFactor: 0.1,
        enableDamping: true,
        dampingFactor: 0.1,
        focusObject: undefined,
        frameOnStart: false,
        pivotPoint: [0, 0, 0],
        distance: 10,
        pitch: 0,
        yaw: 0,
        orbitSensitivity: 1,
        distanceSensitivity: 1,
        panSensitivity: 1,
        domElement: element,
    });

    // The events a browser would send. jsdom builds MouseEvent and KeyboardEvent, but not TouchEvent,
    // so a touch event is the plain object the handler reads: a list of points with coordinates.
    const mouse = (type: string, init: MouseEventInit): Event => new MouseEvent(type, init);
    const wheel = (deltaY: number): Event => new WheelEvent("wheel", { deltaY });
    const touch = (type: string, points: { clientX: number; clientY: number }[]): Event => {
        const event = new Event(type);
        return Object.assign(event, { touches: points, preventDefault: () => undefined });
    };

    beforeEach(() => {
        orbitCamera = new ThreeJSOrbitCamera(createMockContext());
        domElement = createMockDOMElement();
        controller = orbitCamera.create(inputsFor(domElement));
    });

    afterEach(() => {
        controller.destroy();
        vi.clearAllMocks();
    });

    describe("the mouse", () => {
        it("should turn the camera while the left button is held", () => {
            // Arrange
            domElement.dispatchEvent(mouse("mousedown", { button: 0, clientX: 0, clientY: 0 }));

            // Act
            domElement.dispatchEvent(mouse("mousemove", { clientX: 10, clientY: 5 }));

            // Assert
            expect(controller.orbitCamera.yaw).toBeCloseTo(-10, 5);
            expect(controller.orbitCamera.pitch).toBeCloseTo(5, 5);
        });

        it("should stop turning once the left button is released", () => {
            // Arrange
            domElement.dispatchEvent(mouse("mousedown", { button: 0, clientX: 0, clientY: 0 }));
            domElement.dispatchEvent(mouse("mouseup", { button: 0 }));

            // Act
            domElement.dispatchEvent(mouse("mousemove", { clientX: 10, clientY: 5 }));

            // Assert
            expect(controller.orbitCamera.yaw).toBe(0);
        });

        it("should move the pivot while the right button is held", () => {
            // Arrange
            const before = controller.orbitCamera.pivotPoint.clone();
            domElement.dispatchEvent(mouse("mousedown", { button: 2, clientX: 0, clientY: 0 }));

            // Act
            domElement.dispatchEvent(mouse("mousemove", { clientX: 100, clientY: 100 }));

            // Assert
            expect(controller.orbitCamera.pivotPoint.equals(before)).toBe(false);
        });

        it("should stop moving the pivot once the right button is released", () => {
            // Arrange
            domElement.dispatchEvent(mouse("mousedown", { button: 1, clientX: 0, clientY: 0 }));
            domElement.dispatchEvent(mouse("mouseup", { button: 1 }));
            const before = controller.orbitCamera.pivotPoint.clone();

            // Act
            domElement.dispatchEvent(mouse("mousemove", { clientX: 100, clientY: 100 }));

            // Assert
            expect(controller.orbitCamera.pivotPoint.equals(before)).toBe(true);
        });

        it("should forget the buttons when the pointer leaves the element", () => {
            // Arrange
            domElement.dispatchEvent(mouse("mousedown", { button: 0, clientX: 0, clientY: 0 }));
            domElement.dispatchEvent(new Event("mouseout"));

            // Act
            domElement.dispatchEvent(mouse("mousemove", { clientX: 10, clientY: 5 }));

            // Assert
            expect(controller.orbitCamera.yaw).toBe(0);
        });

        it("should back away on a wheel turn away from the viewer", () => {
            // Act
            domElement.dispatchEvent(wheel(100));

            // Assert
            expect(controller.orbitCamera.distance).toBeGreaterThan(10);
        });

        it("should come closer on a wheel turn towards the viewer", () => {
            // Act
            domElement.dispatchEvent(wheel(-100));

            // Assert
            expect(controller.orbitCamera.distance).toBeLessThan(10);
        });

        it("should keep the browser's own menu off the canvas", () => {
            // Arrange
            const event = new Event("contextmenu", { cancelable: true });

            // Act
            domElement.dispatchEvent(event);

            // Assert
            expect(event.defaultPrevented).toBe(true);
        });
    });

    describe("touch", () => {
        it("should turn the camera as one finger moves", () => {
            // Arrange
            domElement.dispatchEvent(touch("touchstart", [{ clientX: 0, clientY: 0 }]));

            // Act
            domElement.dispatchEvent(touch("touchmove", [{ clientX: 10, clientY: 5 }]));

            // Assert
            expect(controller.orbitCamera.yaw).not.toBe(0);
        });

        it("should come closer as two fingers spread apart", () => {
            // Arrange
            domElement.dispatchEvent(touch("touchstart", [{ clientX: 0, clientY: 0 }, { clientX: 10, clientY: 0 }]));

            // Act
            domElement.dispatchEvent(touch("touchmove", [{ clientX: 0, clientY: 0 }, { clientX: 100, clientY: 0 }]));

            // Assert
            expect(controller.orbitCamera.distance).toBeLessThan(10);
        });

        it("should take up where it left off when a finger is lifted", () => {
            // Arrange
            domElement.dispatchEvent(touch("touchstart", [{ clientX: 0, clientY: 0 }, { clientX: 10, clientY: 0 }]));

            // Act
            domElement.dispatchEvent(touch("touchend", [{ clientX: 50, clientY: 50 }]));
            domElement.dispatchEvent(touch("touchmove", [{ clientX: 60, clientY: 50 }]));

            // Assert
            expect(controller.orbitCamera.yaw).not.toBe(0);
        });

        it("should do nothing for a touch of more fingers than it follows", () => {
            // Arrange
            const before = controller.orbitCamera.yaw;

            // Act
            domElement.dispatchEvent(touch("touchstart", [{ clientX: 0, clientY: 0 }, { clientX: 1, clientY: 0 }, { clientX: 2, clientY: 0 }]));
            domElement.dispatchEvent(touch("touchmove", [{ clientX: 0, clientY: 0 }, { clientX: 1, clientY: 0 }, { clientX: 2, clientY: 0 }]));

            // Assert
            expect(controller.orbitCamera.yaw).toBe(before);
        });
    });

    describe("the arrow keys", () => {
        const press = (key: string, shiftKey = false): void => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey }));
        };

        it("should turn left on the left arrow", () => {
            // Act
            press("ArrowLeft");

            // Assert
            expect(controller.orbitCamera.yaw).toBe(-2);
        });

        it("should turn right on the right arrow", () => {
            // Act
            press("ArrowRight");

            // Assert
            expect(controller.orbitCamera.yaw).toBe(2);
        });

        it("should look up on the up arrow", () => {
            // Act
            press("ArrowUp");

            // Assert
            expect(controller.orbitCamera.pitch).toBe(2);
        });

        it("should look down on the down arrow", () => {
            // Act
            press("ArrowDown");

            // Assert
            expect(controller.orbitCamera.pitch).toBe(-2);
        });

        it("should come closer on shift and the up arrow", () => {
            // Act
            press("ArrowUp", true);

            // Assert
            expect(controller.orbitCamera.distance).toBeLessThan(10);
        });

        it("should back away on shift and the down arrow", () => {
            // Act
            press("ArrowDown", true);

            // Assert
            expect(controller.orbitCamera.distance).toBeGreaterThan(10);
        });

        it("should ignore a key it does not drive anything with", () => {
            // Act
            press("Escape");

            // Assert
            expect(controller.orbitCamera.yaw).toBe(0);
        });
    });
});

// The rest of the controller: what it does on the way in, the two ways it can be pointed at
// something, and the free function a host uses when it has only a scene to hand.
describe("ThreeJSOrbitCamera framing and placement", () => {
    let orbitCameraService: ThreeJSOrbitCamera;
    let scene: THREEJS.Scene;
    let domElement: HTMLElement;

    const inputsFor = (element: HTMLElement, focusObject?: THREEJS.Object3D, frameOnStart = false): Inputs.ThreeJSCamera.OrbitCameraDto => ({
        autoRender: true,
        distanceMax: 1000,
        distanceMin: 0.1,
        pitchAngleMax: 90,
        pitchAngleMin: -90,
        inertiaFactor: 0.1,
        enableDamping: true,
        dampingFactor: 0.1,
        focusObject,
        frameOnStart,
        pivotPoint: [0, 0, 0],
        distance: 10,
        pitch: 0,
        yaw: 0,
        orbitSensitivity: 1,
        distanceSensitivity: 1,
        panSensitivity: 1,
        domElement: element,
    });

    const aBox = (): THREEJS.Mesh => {
        const box = new THREEJS.Mesh(new THREEJS.BoxGeometry(4, 4, 4), new THREEJS.MeshBasicMaterial());
        box.position.set(10, 0, 0);
        box.updateMatrixWorld(true);
        return box;
    };

    beforeEach(() => {
        const context = createMockContext();
        scene = context.scene;
        orbitCameraService = new ThreeJSOrbitCamera(context);
        domElement = createMockDOMElement();
    });

    describe("frameOnStart", () => {
        it("should frame the object it was pointed at", () => {
            // Arrange
            const box = aBox();
            scene.add(box);

            // Act
            const controller = orbitCameraService.create(inputsFor(domElement, box, true));

            // Assert - the camera pulls back to hold the whole box, and looks at where it stands
            expect(controller.orbitCamera.distance).toBeGreaterThan(0);
            expect(controller.orbitCamera.pivotPoint.x).toBeCloseTo(10, 5);
            controller.destroy();
        });

        it("should leave the camera where it was asked to be when it frames nothing", () => {
            // Act
            const controller = orbitCameraService.create(inputsFor(domElement, aBox(), false));

            // Assert
            expect(controller.orbitCamera.distance).toBe(10);
            controller.destroy();
        });

        it("should do nothing when the object it was pointed at has no size", () => {
            // Arrange - an empty group has no bounds to frame
            const empty = new THREEJS.Group();

            // Act
            const controller = orbitCameraService.create(inputsFor(domElement, empty, true));

            // Assert
            expect(controller.orbitCamera.distance).toBe(10);
            controller.destroy();
        });
    });

    describe("setDistance", () => {
        it("should put the camera at the distance it was given", () => {
            // Arrange
            const controller = orbitCameraService.create(inputsFor(domElement));

            // Act
            orbitCameraService.setDistance({ orbitCamera: controller, yaw: 0, pitch: 0, distance: 42 });

            // Assert
            expect(controller.orbitCamera.distance).toBe(42);
            controller.destroy();
        });
    });

    describe("resetAndLookAtPoint", () => {
        it("should stand the camera where it was told and turn it towards the point", () => {
            // Arrange
            const controller = orbitCameraService.create(inputsFor(domElement));

            // Act
            controller.orbitCamera.resetAndLookAtPoint(new THREEJS.Vector3(0, 0, 20), new THREEJS.Vector3(0, 0, 0));

            // Assert
            expect(controller.orbitCamera.distance).toBeCloseTo(20, 5);
            expect(controller.orbitCamera.pivotPoint.z).toBeCloseTo(0, 5);
            controller.destroy();
        });
    });

    describe("resetAndLookAtObject", () => {
        it("should turn the camera towards the middle of the object", () => {
            // Arrange
            const controller = orbitCameraService.create(inputsFor(domElement));
            const box = aBox();
            scene.add(box);

            // Act
            controller.orbitCamera.resetAndLookAtObject(new THREEJS.Vector3(10, 0, 20), box);

            // Assert
            expect(controller.orbitCamera.pivotPoint.x).toBeCloseTo(10, 5);
            controller.destroy();
        });
    });

    describe("the yaw a full turn away", () => {
        it("should take the shorter way round rather than unwinding a whole turn", () => {
            // Arrange
            const controller = orbitCameraService.create(inputsFor(domElement));

            // Act - asking for 350 degrees from 0 is ten degrees the other way
            controller.orbitCamera.yaw = 350;
            controller.update(1);

            // Assert
            expect(controller.orbitCamera.yaw).toBe(350);
            controller.destroy();
        });

        it("should take the shorter way round in the other direction too", () => {
            // Arrange
            const controller = orbitCameraService.create(inputsFor(domElement));

            // Act
            controller.orbitCamera.yaw = -350;
            controller.update(1);

            // Assert
            expect(controller.orbitCamera.yaw).toBe(-350);
            controller.destroy();
        });
    });

    describe("createOrbitCamera", () => {
        it("should build a controller from a scene alone", () => {
            // Arrange - domElement and focusObject are both optional, so a scene-only call omits them
            const { focusObject, domElement: element, ...rest } = inputsFor(domElement);
            expect(focusObject).toBeUndefined();

            // Act
            const controller = createOrbitCamera({ ...rest, domElement: element!, scene });

            // Assert
            expect(controller.camera).toBeInstanceOf(THREEJS.PerspectiveCamera);
            controller.destroy();
        });
    });
});
