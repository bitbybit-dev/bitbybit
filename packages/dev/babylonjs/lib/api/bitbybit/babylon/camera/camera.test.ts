import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonCamera } from "./camera";
import { BabylonFreeCamera } from "./free-camera";
import { BabylonArcRotateCamera } from "./arc-rotate-camera";
import { BabylonTargetCamera } from "./target-camera";
import * as Inputs from "../../../inputs";

describe("BabylonCamera", () => {
    let headless: HeadlessScene;
    let service: BabylonCamera;
    let camera: BABYLON.TargetCamera;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonCamera(headless.context);
        camera = new BABYLON.TargetCamera("camera", new BABYLON.Vector3(0, 0, -10), headless.scene);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("the builders it carries", () => {
        it("should offer a builder for each of the three kinds of camera", () => {
            // Assert
            expect(service.free).toBeInstanceOf(BabylonFreeCamera);
            expect(service.arcRotate).toBeInstanceOf(BabylonArcRotateCamera);
            expect(service.target).toBeInstanceOf(BabylonTargetCamera);
        });
    });

    describe("the projection matrix", () => {
        it("should stop the projection matrix following the camera once it is frozen", () => {
            // Arrange
            const before = camera.getProjectionMatrix(true).clone();
            service.freezeProjectionMatrix(new Inputs.BabylonCamera.CameraDto(camera));

            // Act
            camera.fov = 0.2;

            // Assert
            expect(camera.getProjectionMatrix(true).equals(before)).toBe(true);
        });

        it("should let the projection matrix follow the camera again once it is unfrozen", () => {
            // Arrange
            const before = camera.getProjectionMatrix(true).clone();
            service.freezeProjectionMatrix(new Inputs.BabylonCamera.CameraDto(camera));
            camera.fov = 0.2;

            // Act
            service.unfreezeProjectionMatrix(new Inputs.BabylonCamera.CameraDto(camera));

            // Assert
            expect(camera.getProjectionMatrix(true).equals(before)).toBe(false);
        });
    });

    describe("position and target", () => {
        it("should set and read the position", () => {
            // Act
            service.setPosition(new Inputs.BabylonCamera.PositionDto(camera, [1, 2, 3]));

            // Assert
            expect(service.getPosition(new Inputs.BabylonCamera.PositionDto(camera))).toEqual([1, 2, 3]);
        });

        it("should set and read the target", () => {
            // Act
            service.setTarget(new Inputs.BabylonCamera.TargetDto(camera, [4, 5, 6]));
            camera.computeWorldMatrix();

            // Assert
            const target = service.getTarget(new Inputs.BabylonCamera.PositionDto(camera));
            expect(target[0]).toBeCloseTo(4, 5);
            expect(target[1]).toBeCloseTo(5, 5);
            expect(target[2]).toBeCloseTo(6, 5);
        });
    });

    describe("speed", () => {
        it("should set and read the speed the camera moves at", () => {
            // Act
            service.setSpeed(new Inputs.BabylonCamera.SpeedDto(camera, 3));

            // Assert
            expect(service.getSpeed(new Inputs.BabylonCamera.PositionDto(camera))).toBe(3);
        });
    });

    describe("the clipping planes", () => {
        it("should set the near plane", () => {
            // Act
            service.setMinZ(new Inputs.BabylonCamera.MinZDto(camera, 0.5));

            // Assert
            expect(camera.minZ).toBe(0.5);
        });

        it("should set the far plane", () => {
            // Act
            service.setMaxZ(new Inputs.BabylonCamera.MaxZDto(camera, 5000));

            // Assert
            expect(camera.maxZ).toBe(5000);
        });
    });

    describe("the projection mode", () => {
        it("should make the camera orthographic over the box it was given", () => {
            // Act
            service.makeCameraOrthographic(new Inputs.BabylonCamera.OrthographicDto(camera, -5, 5, 3, -3));

            // Assert
            expect(camera.mode).toBe(BABYLON.Camera.ORTHOGRAPHIC_CAMERA);
            expect(camera.orthoLeft).toBe(-5);
            expect(camera.orthoRight).toBe(5);
            expect(camera.orthoTop).toBe(3);
            expect(camera.orthoBottom).toBe(-3);
        });

        it("should fall back to a unit box where a bound was left at zero", () => {
            // Act
            service.makeCameraOrthographic(new Inputs.BabylonCamera.OrthographicDto(camera, 0, 0, 0, 0));

            // Assert
            expect(camera.orthoLeft).toBe(-1);
            expect(camera.orthoRight).toBe(1);
            expect(camera.orthoTop).toBe(1);
            expect(camera.orthoBottom).toBe(-1);
        });

        it("should make the camera perspective again", () => {
            // Arrange
            service.makeCameraOrthographic(new Inputs.BabylonCamera.OrthographicDto(camera));

            // Act
            service.makeCameraPerspective(new Inputs.BabylonCamera.CameraDto(camera));

            // Assert
            expect(camera.mode).toBe(BABYLON.Camera.PERSPECTIVE_CAMERA);
        });
    });
});
