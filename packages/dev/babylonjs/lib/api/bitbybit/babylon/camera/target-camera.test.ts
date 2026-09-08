import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonTargetCamera } from "./target-camera";
import * as Inputs from "../../../inputs";

describe("BabylonTargetCamera", () => {
    let headless: HeadlessScene;
    let service: BabylonTargetCamera;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonTargetCamera(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("create", () => {
        it("should place the camera on the context's scene where it was told", () => {
            // Act
            const camera = service.create(new Inputs.BabylonCamera.TargetCameraDto([4, 5, 6], [0, 0, 0]));

            // Assert
            expect(camera).toBeInstanceOf(BABYLON.TargetCamera);
            expect(camera.getScene()).toBe(headless.scene);
            expect([camera.position.x, camera.position.y, camera.position.z]).toEqual([4, 5, 6]);
        });

        it("should point the camera at the target it was given", () => {
            // Act
            const camera = service.create(new Inputs.BabylonCamera.TargetCameraDto([0, 10, 0], [1, 0, 1]));
            camera.computeWorldMatrix();

            // Assert
            expect(camera.target.x).toBeCloseTo(1, 5);
            expect(camera.target.y).toBeCloseTo(0, 5);
            expect(camera.target.z).toBeCloseTo(1, 5);
        });

        it("should clip nothing near and everything past a thousand units", () => {
            // Act
            const camera = service.create(new Inputs.BabylonCamera.TargetCameraDto());

            // Assert
            expect(camera.minZ).toBe(0);
            expect(camera.maxZ).toBe(1000);
        });

        it("should give each camera a name of its own", () => {
            // Act
            const first = service.create(new Inputs.BabylonCamera.TargetCameraDto());
            const second = service.create(new Inputs.BabylonCamera.TargetCameraDto());

            // Assert
            expect(first.name).not.toBe(second.name);
            expect(first.name).toContain("targetCamera");
        });
    });
});
