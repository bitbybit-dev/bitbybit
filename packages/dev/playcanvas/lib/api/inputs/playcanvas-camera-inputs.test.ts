import * as pc from "playcanvas";
import { PlayCanvasCamera } from "./playcanvas-camera-inputs";

describe("PlayCanvasCamera inputs unit tests", () => {

    describe("OrbitCameraDto constructor", () => {

        it("should create OrbitCameraDto with all default values when no arguments provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto();
            expect(dto.pivotPoint).toEqual([0, 0, 0]);
            expect(dto.distance).toBe(20);
            expect(dto.pitch).toBe(30);
            expect(dto.yaw).toBe(45);
            expect(dto.distanceMin).toBe(0.1);
            expect(dto.distanceMax).toBe(1000);
            expect(dto.pitchAngleMin).toBe(-90);
            expect(dto.pitchAngleMax).toBe(90);
            expect(dto.orbitSensitivity).toBe(0.3);
            expect(dto.distanceSensitivity).toBe(0.5);
            expect(dto.inertiaFactor).toBe(0.1);
            expect(dto.autoRender).toBe(true);
            expect(dto.frameOnStart).toBe(true);
            expect(dto.focusEntity).toBeUndefined();
        });

        it("should create OrbitCameraDto with custom distance when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(50);
            expect(dto.distance).toBe(50);
            expect(dto.pitch).toBe(30);
            expect(dto.yaw).toBe(45);
        });

        it("should create OrbitCameraDto with custom pitch when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, 60);
            expect(dto.distance).toBe(20);
            expect(dto.pitch).toBe(60);
            expect(dto.yaw).toBe(45);
        });

        it("should create OrbitCameraDto with custom yaw when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, 90);
            expect(dto.distance).toBe(20);
            expect(dto.pitch).toBe(30);
            expect(dto.yaw).toBe(90);
        });

        it("should create OrbitCameraDto with custom distanceMin when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, 0.5);
            expect(dto.distanceMin).toBe(0.5);
            expect(dto.distanceMax).toBe(1000);
        });

        it("should create OrbitCameraDto with custom distanceMax when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, 500);
            expect(dto.distanceMin).toBe(0.1);
            expect(dto.distanceMax).toBe(500);
        });

        it("should create OrbitCameraDto with custom pitchAngleMin when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, undefined, -45);
            expect(dto.pitchAngleMin).toBe(-45);
            expect(dto.pitchAngleMax).toBe(90);
        });

        it("should create OrbitCameraDto with custom pitchAngleMax when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, undefined, undefined, 45);
            expect(dto.pitchAngleMin).toBe(-90);
            expect(dto.pitchAngleMax).toBe(45);
        });

        it("should create OrbitCameraDto with custom orbitSensitivity when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0.5);
            expect(dto.orbitSensitivity).toBe(0.5);
            expect(dto.distanceSensitivity).toBe(0.5);
        });

        it("should create OrbitCameraDto with custom distanceSensitivity when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0.25);
            expect(dto.orbitSensitivity).toBe(0.3);
            expect(dto.distanceSensitivity).toBe(0.25);
        });

        it("should create OrbitCameraDto with custom inertiaFactor when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0.5);
            expect(dto.inertiaFactor).toBe(0.5);
        });

        it("should create OrbitCameraDto with autoRender false when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false);
            expect(dto.autoRender).toBe(false);
            expect(dto.frameOnStart).toBe(true);
        });

        it("should create OrbitCameraDto with frameOnStart false when provided", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false);
            expect(dto.autoRender).toBe(true);
            expect(dto.frameOnStart).toBe(false);
        });

        it("should create OrbitCameraDto with all custom values", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(100, 45, 180, 1, 2000, -60, 60, 0.5, 0.3, 0.8, false, false);
            expect(dto.distance).toBe(100);
            expect(dto.pitch).toBe(45);
            expect(dto.yaw).toBe(180);
            expect(dto.distanceMin).toBe(1);
            expect(dto.distanceMax).toBe(2000);
            expect(dto.pitchAngleMin).toBe(-60);
            expect(dto.pitchAngleMax).toBe(60);
            expect(dto.orbitSensitivity).toBe(0.5);
            expect(dto.distanceSensitivity).toBe(0.3);
            expect(dto.inertiaFactor).toBe(0.8);
            expect(dto.autoRender).toBe(false);
            expect(dto.frameOnStart).toBe(false);
        });

        it("should create OrbitCameraDto with zero distance", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(0);
            expect(dto.distance).toBe(0);
        });

        it("should create OrbitCameraDto with negative yaw", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, -90);
            expect(dto.yaw).toBe(-90);
        });

        it("should create OrbitCameraDto with negative pitch", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, -45);
            expect(dto.pitch).toBe(-45);
        });

        it("should create OrbitCameraDto with zero inertiaFactor", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0);
            expect(dto.inertiaFactor).toBe(0);
        });

        it("should create OrbitCameraDto with maximum inertiaFactor", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1);
            expect(dto.inertiaFactor).toBe(1);
        });

        it("should allow setting pivotPoint after construction", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto();
            dto.pivotPoint = [10, 20, 30];
            expect(dto.pivotPoint).toEqual([10, 20, 30]);
        });

        it("should allow setting focusEntity after construction", () => {
            const dto = new PlayCanvasCamera.OrbitCameraDto();
            const mockEntity = { name: "test" } as pc.Entity;
            dto.focusEntity = mockEntity;
            expect(dto.focusEntity).toBe(mockEntity);
        });
    });

    describe("CameraDto constructor", () => {

        it("should create CameraDto with undefined camera when no arguments provided", () => {
            const dto = new PlayCanvasCamera.CameraDto();
            expect(dto.camera).toBeUndefined();
        });

        it("should create CameraDto with camera when provided", () => {
            const mockCamera = { name: "camera" } as pc.Entity;
            const dto = new PlayCanvasCamera.CameraDto(mockCamera);
            expect(dto.camera).toBe(mockCamera);
        });

        it("should allow setting camera after construction", () => {
            const dto = new PlayCanvasCamera.CameraDto();
            const mockCamera = { name: "camera" } as pc.Entity;
            dto.camera = mockCamera;
            expect(dto.camera).toBe(mockCamera);
        });
    });

    describe("PositionDto constructor", () => {

        it("should create PositionDto with default values when no arguments provided", () => {
            const dto = new PlayCanvasCamera.PositionDto();
            expect(dto.camera).toBeUndefined();
            expect(dto.position).toEqual([0, 0, 0]);
        });

        it("should create PositionDto with camera when provided", () => {
            const mockCamera = { name: "camera" } as pc.Entity;
            const dto = new PlayCanvasCamera.PositionDto(mockCamera);
            expect(dto.camera).toBe(mockCamera);
            expect(dto.position).toEqual([0, 0, 0]);
        });

        it("should create PositionDto with position when provided", () => {
            const position: [number, number, number] = [10, 20, 30];
            const dto = new PlayCanvasCamera.PositionDto(undefined, position);
            expect(dto.camera).toBeUndefined();
            expect(dto.position).toEqual([10, 20, 30]);
        });

        it("should create PositionDto with camera and position when both provided", () => {
            const mockCamera = { name: "camera" } as pc.Entity;
            const position: [number, number, number] = [10, 20, 30];
            const dto = new PlayCanvasCamera.PositionDto(mockCamera, position);
            expect(dto.camera).toBe(mockCamera);
            expect(dto.position).toEqual([10, 20, 30]);
        });

        it("should create PositionDto with negative position values", () => {
            const position: [number, number, number] = [-10, -20, -30];
            const dto = new PlayCanvasCamera.PositionDto(undefined, position);
            expect(dto.position).toEqual([-10, -20, -30]);
        });

        it("should create PositionDto with zero position", () => {
            const position: [number, number, number] = [0, 0, 0];
            const dto = new PlayCanvasCamera.PositionDto(undefined, position);
            expect(dto.position).toEqual([0, 0, 0]);
        });

        it("should allow updating position after construction", () => {
            const dto = new PlayCanvasCamera.PositionDto();
            dto.position = [100, 200, 300];
            expect(dto.position).toEqual([100, 200, 300]);
        });
    });

    describe("PivotPointDto constructor", () => {

        it("should create PivotPointDto with default values when no arguments provided", () => {
            const dto = new PlayCanvasCamera.PivotPointDto();
            expect(dto.orbitCamera).toBeUndefined();
            expect(dto.pivotPoint).toEqual([0, 0, 0]);
        });

        it("should create PivotPointDto with orbitCamera when provided", () => {
            const mockOrbitCamera = { name: "orbitCamera" };
            const dto = new PlayCanvasCamera.PivotPointDto(mockOrbitCamera);
            expect(dto.orbitCamera).toBe(mockOrbitCamera);
            expect(dto.pivotPoint).toEqual([0, 0, 0]);
        });

        it("should create PivotPointDto with pivotPoint when provided", () => {
            const pivotPoint: [number, number, number] = [5, 10, 15];
            const dto = new PlayCanvasCamera.PivotPointDto(undefined, pivotPoint);
            expect(dto.orbitCamera).toBeUndefined();
            expect(dto.pivotPoint).toEqual([5, 10, 15]);
        });

        it("should create PivotPointDto with orbitCamera and pivotPoint when both provided", () => {
            const mockOrbitCamera = { name: "orbitCamera" };
            const pivotPoint: [number, number, number] = [5, 10, 15];
            const dto = new PlayCanvasCamera.PivotPointDto(mockOrbitCamera, pivotPoint);
            expect(dto.orbitCamera).toBe(mockOrbitCamera);
            expect(dto.pivotPoint).toEqual([5, 10, 15]);
        });

        it("should create PivotPointDto with negative pivotPoint values", () => {
            const pivotPoint: [number, number, number] = [-5, -10, -15];
            const dto = new PlayCanvasCamera.PivotPointDto(undefined, pivotPoint);
            expect(dto.pivotPoint).toEqual([-5, -10, -15]);
        });

        it("should allow updating pivotPoint after construction", () => {
            const dto = new PlayCanvasCamera.PivotPointDto();
            dto.pivotPoint = [50, 60, 70];
            expect(dto.pivotPoint).toEqual([50, 60, 70]);
        });

        it("should allow updating orbitCamera after construction", () => {
            const dto = new PlayCanvasCamera.PivotPointDto();
            const mockOrbitCamera = { name: "orbitCamera" };
            dto.orbitCamera = mockOrbitCamera;
            expect(dto.orbitCamera).toBe(mockOrbitCamera);
        });
    });

    describe("FocusEntityDto constructor", () => {

        it("should create FocusEntityDto with default values when no arguments provided", () => {
            const dto = new PlayCanvasCamera.FocusEntityDto();
            expect(dto.orbitCamera).toBeUndefined();
            expect(dto.entity).toBeUndefined();
        });

        it("should create FocusEntityDto with orbitCamera when provided", () => {
            const mockOrbitCamera = { name: "orbitCamera" };
            const dto = new PlayCanvasCamera.FocusEntityDto(mockOrbitCamera);
            expect(dto.orbitCamera).toBe(mockOrbitCamera);
            expect(dto.entity).toBeUndefined();
        });

        it("should create FocusEntityDto with entity when provided", () => {
            const mockEntity = { name: "entity" } as pc.Entity;
            const dto = new PlayCanvasCamera.FocusEntityDto(undefined, mockEntity);
            expect(dto.orbitCamera).toBeUndefined();
            expect(dto.entity).toBe(mockEntity);
        });

        it("should create FocusEntityDto with orbitCamera and entity when both provided", () => {
            const mockOrbitCamera = { name: "orbitCamera" };
            const mockEntity = { name: "entity" } as pc.Entity;
            const dto = new PlayCanvasCamera.FocusEntityDto(mockOrbitCamera, mockEntity);
            expect(dto.orbitCamera).toBe(mockOrbitCamera);
            expect(dto.entity).toBe(mockEntity);
        });

        it("should allow updating orbitCamera after construction", () => {
            const dto = new PlayCanvasCamera.FocusEntityDto();
            const mockOrbitCamera = { name: "orbitCamera" };
            dto.orbitCamera = mockOrbitCamera;
            expect(dto.orbitCamera).toBe(mockOrbitCamera);
        });

        it("should allow updating entity after construction", () => {
            const dto = new PlayCanvasCamera.FocusEntityDto();
            const mockEntity = { name: "entity" } as pc.Entity;
            dto.entity = mockEntity;
            expect(dto.entity).toBe(mockEntity);
        });
    });

    describe("ResetCameraDto constructor", () => {

        it("should create ResetCameraDto with default values when no arguments provided", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto();
            expect(dto.orbitCamera).toBeUndefined();
            expect(dto.yaw).toBe(45);
            expect(dto.pitch).toBe(30);
            expect(dto.distance).toBe(20);
        });

        it("should create ResetCameraDto with orbitCamera when provided", () => {
            const mockOrbitCamera = { name: "orbitCamera" };
            const dto = new PlayCanvasCamera.ResetCameraDto(mockOrbitCamera);
            expect(dto.orbitCamera).toBe(mockOrbitCamera);
            expect(dto.yaw).toBe(45);
            expect(dto.pitch).toBe(30);
            expect(dto.distance).toBe(20);
        });

        it("should create ResetCameraDto with custom yaw when provided", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, 90);
            expect(dto.yaw).toBe(90);
            expect(dto.pitch).toBe(30);
            expect(dto.distance).toBe(20);
        });

        it("should create ResetCameraDto with custom pitch when provided", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, undefined, 60);
            expect(dto.yaw).toBe(45);
            expect(dto.pitch).toBe(60);
            expect(dto.distance).toBe(20);
        });

        it("should create ResetCameraDto with custom distance when provided", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, undefined, undefined, 50);
            expect(dto.yaw).toBe(45);
            expect(dto.pitch).toBe(30);
            expect(dto.distance).toBe(50);
        });

        it("should create ResetCameraDto with all custom values", () => {
            const mockOrbitCamera = { name: "orbitCamera" };
            const dto = new PlayCanvasCamera.ResetCameraDto(mockOrbitCamera, 180, 45, 100);
            expect(dto.orbitCamera).toBe(mockOrbitCamera);
            expect(dto.yaw).toBe(180);
            expect(dto.pitch).toBe(45);
            expect(dto.distance).toBe(100);
        });

        it("should create ResetCameraDto with negative yaw", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, -90);
            expect(dto.yaw).toBe(-90);
        });

        it("should create ResetCameraDto with negative pitch", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, undefined, -45);
            expect(dto.pitch).toBe(-45);
        });

        it("should create ResetCameraDto with zero distance", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, undefined, undefined, 0);
            expect(dto.distance).toBe(0);
        });

        it("should create ResetCameraDto with zero yaw", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, 0);
            expect(dto.yaw).toBe(0);
        });

        it("should create ResetCameraDto with zero pitch", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, undefined, 0);
            expect(dto.pitch).toBe(0);
        });

        it("should create ResetCameraDto with extreme yaw value", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, 360);
            expect(dto.yaw).toBe(360);
        });

        it("should create ResetCameraDto with maximum pitch boundary", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, undefined, 90);
            expect(dto.pitch).toBe(90);
        });

        it("should create ResetCameraDto with minimum pitch boundary", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto(undefined, undefined, -90);
            expect(dto.pitch).toBe(-90);
        });

        it("should allow updating orbitCamera after construction", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto();
            const mockOrbitCamera = { name: "orbitCamera" };
            dto.orbitCamera = mockOrbitCamera;
            expect(dto.orbitCamera).toBe(mockOrbitCamera);
        });

        it("should allow updating all values after construction", () => {
            const dto = new PlayCanvasCamera.ResetCameraDto();
            dto.yaw = 270;
            dto.pitch = 15;
            dto.distance = 75;
            expect(dto.yaw).toBe(270);
            expect(dto.pitch).toBe(15);
            expect(dto.distance).toBe(75);
        });
    });
});
