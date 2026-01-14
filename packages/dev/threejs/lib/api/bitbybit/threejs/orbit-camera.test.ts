/* eslint-disable @typescript-eslint/no-unused-vars */
import { ThreeJSOrbitCamera, OrbitCameraController, OrbitCameraInstance } from "./orbit-camera";
import { Context } from "../../context";
import * as Inputs from "../../inputs/inputs";
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
        jest.clearAllMocks();
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
            expect(typeof controller.mouseInput.destroy).toBe("function");
            expect(typeof controller.touchInput.destroy).toBe("function");
            expect(typeof controller.keyboardInput.destroy).toBe("function");
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
            expect(typeof controller.mouseInput.destroy).toBe("function");
        });

        it("should setup touch input handlers with destroy method", () => {
            const controller = orbitCamera.create(createDefaultInputs(mockDomElement));
            expect(typeof controller.touchInput.destroy).toBe("function");
        });

        it("should setup keyboard input handlers with destroy method", () => {
            const controller = orbitCamera.create(createDefaultInputs(mockDomElement));
            expect(typeof controller.keyboardInput.destroy).toBe("function");
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
            expect(typeof controller.mouseInput.destroy).toBe("function");
            expect(typeof controller.touchInput.destroy).toBe("function");
            expect(typeof controller.keyboardInput.destroy).toBe("function");

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
