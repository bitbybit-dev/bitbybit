import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonFreeCamera } from "./free-camera";
import * as Inputs from "../../../inputs";

describe("BabylonFreeCamera", () => {
    let headless: HeadlessScene;
    let service: BabylonFreeCamera;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonFreeCamera(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("create", () => {
        it("should place the camera on the context's scene where it was told", () => {
            // Act
            const camera = service.create(new Inputs.BabylonCamera.FreeCameraDto([1, 2, 3], [0, 0, 0]));

            // Assert
            expect(camera).toBeInstanceOf(BABYLON.FreeCamera);
            expect(camera.getScene()).toBe(headless.scene);
            expect([camera.position.x, camera.position.y, camera.position.z]).toEqual([1, 2, 3]);
        });

        it("should point the camera at the target it was given", () => {
            // Act
            const camera = service.create(new Inputs.BabylonCamera.FreeCameraDto([0, 0, -10], [0, 0, 0]));

            // Assert
            expect([camera.target.x, camera.target.y, camera.target.z]).toEqual([0, 0, 0]);
        });

        it("should clip nothing near and everything past a thousand units", () => {
            // Act
            const camera = service.create(new Inputs.BabylonCamera.FreeCameraDto([0, 0, -10], [0, 0, 0]));

            // Assert
            expect(camera.minZ).toBe(0);
            expect(camera.maxZ).toBe(1000);
        });

        it("should give each camera a name of its own", () => {
            // Act
            const first = service.create(new Inputs.BabylonCamera.FreeCameraDto());
            const second = service.create(new Inputs.BabylonCamera.FreeCameraDto());

            // Assert
            expect(first.name).not.toBe(second.name);
            expect(first.name).toContain("freeCamera");
        });
    });
});
