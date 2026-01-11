import { ThreeJSCamera } from "./threejs-camera-inputs";

describe("ThreeJSCamera DTO unit tests", () => {
    describe("OrbitCameraDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const distance = 50;
            const pitch = 60;
            const yaw = 90;
            const distanceMin = 1;
            const distanceMax = 500;
            const pitchAngleMin = -60;
            const pitchAngleMax = 60;
            const orbitSensitivity = 0.5;
            const distanceSensitivity = 0.2;
            const panSensitivity = 1.5;
            const inertiaFactor = 0.3;
            const autoRender = false;
            const frameOnStart = false;
            const enableDamping = true;
            const dampingFactor = 0.15;

            // Act
            const result = new ThreeJSCamera.OrbitCameraDto(
                distance,
                pitch,
                yaw,
                distanceMin,
                distanceMax,
                pitchAngleMin,
                pitchAngleMax,
                orbitSensitivity,
                distanceSensitivity,
                panSensitivity,
                inertiaFactor,
                autoRender,
                frameOnStart,
                enableDamping,
                dampingFactor
            );

            // Assert
            expect(result.distance).toBe(50);
            expect(result.pitch).toBe(60);
            expect(result.yaw).toBe(90);
            expect(result.distanceMin).toBe(1);
            expect(result.distanceMax).toBe(500);
            expect(result.pitchAngleMin).toBe(-60);
            expect(result.pitchAngleMax).toBe(60);
            expect(result.orbitSensitivity).toBe(0.5);
            expect(result.distanceSensitivity).toBe(0.2);
            expect(result.panSensitivity).toBe(1.5);
            expect(result.inertiaFactor).toBe(0.3);
            expect(result.autoRender).toBe(false);
            expect(result.frameOnStart).toBe(false);
            expect(result.enableDamping).toBe(true);
            expect(result.dampingFactor).toBe(0.15);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSCamera.OrbitCameraDto();

            // Assert
            expect(result.pivotPoint).toEqual([0, 0, 0]);
            expect(result.distance).toBe(20);
            expect(result.pitch).toBe(30);
            expect(result.yaw).toBe(45);
            expect(result.distanceMin).toBe(0.1);
            expect(result.distanceMax).toBe(1000);
            expect(result.pitchAngleMin).toBe(-90);
            expect(result.pitchAngleMax).toBe(90);
            expect(result.orbitSensitivity).toBe(0.3);
            expect(result.distanceSensitivity).toBe(0.15);
            expect(result.panSensitivity).toBe(1);
            expect(result.inertiaFactor).toBe(0.1);
            expect(result.autoRender).toBe(true);
            expect(result.frameOnStart).toBe(true);
            expect(result.enableDamping).toBe(true);
            expect(result.dampingFactor).toBe(0.1);
            expect(result.focusObject).toBeUndefined();
            expect(result.domElement).toBeUndefined();
        });
    });

    describe("CameraDto", () => {
        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSCamera.CameraDto();

            // Assert
            expect(result.camera).toBeUndefined();
        });
    });

    describe("PositionDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const position = [1, 2, 3] as [number, number, number];

            // Act
            const result = new ThreeJSCamera.PositionDto(undefined, position);

            // Assert
            expect(result.position).toEqual([1, 2, 3]);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSCamera.PositionDto();

            // Assert
            expect(result.position).toEqual([0, 0, 0]);
        });
    });

    describe("PivotPointDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const pivotPoint = [5, 10, 15] as [number, number, number];

            // Act
            const result = new ThreeJSCamera.PivotPointDto(undefined, pivotPoint);

            // Assert
            expect(result.pivotPoint).toEqual([5, 10, 15]);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSCamera.PivotPointDto();

            // Assert
            expect(result.pivotPoint).toEqual([0, 0, 0]);
        });
    });

    describe("FocusObjectDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const padding = 2.5;

            // Act
            const result = new ThreeJSCamera.FocusObjectDto(undefined, undefined, padding);

            // Assert
            expect(result.padding).toBe(2.5);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSCamera.FocusObjectDto();

            // Assert
            expect(result.padding).toBe(1.5);
            expect(result.orbitCamera).toBeUndefined();
            expect(result.object).toBeUndefined();
        });
    });

    describe("ResetCameraDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const yaw = 90;
            const pitch = 45;
            const distance = 50;

            // Act
            const result = new ThreeJSCamera.ResetCameraDto(undefined, yaw, pitch, distance);

            // Assert
            expect(result.yaw).toBe(90);
            expect(result.pitch).toBe(45);
            expect(result.distance).toBe(50);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSCamera.ResetCameraDto();

            // Assert
            expect(result.yaw).toBe(45);
            expect(result.pitch).toBe(30);
            expect(result.distance).toBe(20);
            expect(result.orbitCamera).toBeUndefined();
        });
    });

    describe("OrbitCameraControllerDto", () => {
        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSCamera.OrbitCameraControllerDto();

            // Assert
            expect(result.orbitCamera).toBeUndefined();
        });
    });

    describe("SetDistanceLimitsDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const min = 1;
            const max = 500;

            // Act
            const result = new ThreeJSCamera.SetDistanceLimitsDto(undefined, min, max);

            // Assert
            expect(result.min).toBe(1);
            expect(result.max).toBe(500);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSCamera.SetDistanceLimitsDto();

            // Assert
            expect(result.min).toBe(0.1);
            expect(result.max).toBe(1000);
            expect(result.orbitCamera).toBeUndefined();
        });
    });

    describe("SetPitchLimitsDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const min = -60;
            const max = 60;

            // Act
            const result = new ThreeJSCamera.SetPitchLimitsDto(undefined, min, max);

            // Assert
            expect(result.min).toBe(-60);
            expect(result.max).toBe(60);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSCamera.SetPitchLimitsDto();

            // Assert
            expect(result.min).toBe(-90);
            expect(result.max).toBe(90);
            expect(result.orbitCamera).toBeUndefined();
        });
    });
});
