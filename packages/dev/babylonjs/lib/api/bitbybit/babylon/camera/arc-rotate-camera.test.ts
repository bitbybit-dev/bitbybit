import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonArcRotateCamera } from "./arc-rotate-camera";
import * as Inputs from "../../../inputs";

describe("BabylonArcRotateCamera", () => {
    let headless: HeadlessScene;
    let service: BabylonArcRotateCamera;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonArcRotateCamera(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const cameraFor = (adjust: (inputs: Inputs.BabylonCamera.ArcRotateCameraDto) => void = () => undefined): BABYLON.ArcRotateCamera => {
        const inputs = new Inputs.BabylonCamera.ArcRotateCameraDto(30, 90, 45);
        adjust(inputs);
        return service.create(inputs);
    };

    describe("create", () => {
        it("should place the camera on the context's scene at the radius it was given", () => {
            // Act
            const camera = cameraFor();

            // Assert
            expect(camera).toBeInstanceOf(BABYLON.ArcRotateCamera);
            expect(camera.getScene()).toBe(headless.scene);
            expect(camera.radius).toBe(30);
        });

        it("should turn the angles it was given from degrees into radians", () => {
            // Act
            const camera = cameraFor();

            // Assert
            expect(camera.alpha).toBeCloseTo(Math.PI / 2, 10);
            expect(camera.beta).toBeCloseTo(Math.PI / 4, 10);
        });

        it("should orbit the other way round when it is given a negative angle", () => {
            // Act
            const camera = cameraFor((inputs) => { inputs.alpha = -90; });

            // Assert
            expect(Math.cos(camera.alpha)).toBeCloseTo(0, 10);
            expect(Math.sin(camera.alpha)).toBeCloseTo(-1, 10);
        });

        it("should orbit whatever target it was given", () => {
            // Act
            const camera = cameraFor((inputs) => { inputs.target = [1, 2, 3]; });

            // Assert
            expect([camera.target.x, camera.target.y, camera.target.z]).toEqual([1, 2, 3]);
        });

        it("should take the sensibilities and the wheel precision it was given", () => {
            // Act
            const camera = cameraFor((inputs) => {
                inputs.angularSensibilityX = 500;
                inputs.angularSensibilityY = 600;
                inputs.panningSensibility = 700;
                inputs.wheelPrecision = 8;
            });

            // Assert
            expect(camera.angularSensibilityX).toBe(500);
            expect(camera.angularSensibilityY).toBe(600);
            expect(camera.panningSensibility).toBe(700);
            expect(camera.wheelPrecision).toBe(8);
        });

        it("should take the radius limits it was given", () => {
            // Act
            const camera = cameraFor((inputs) => { inputs.lowerRadiusLimit = 5; inputs.upperRadiusLimit = 50; });

            // Assert
            expect(camera.lowerRadiusLimit).toBe(5);
            expect(camera.upperRadiusLimit).toBe(50);
        });

        it("should turn the angle limits it was given from degrees into radians too", () => {
            // Act
            const camera = cameraFor((inputs) => {
                inputs.lowerAlphaLimit = 0;
                inputs.upperAlphaLimit = 180;
                inputs.lowerBetaLimit = 10;
                inputs.upperBetaLimit = 170;
            });

            // Assert
            expect(camera.lowerAlphaLimit).toBeCloseTo(0, 10);
            expect(camera.upperAlphaLimit).toBeCloseTo(Math.PI, 10);
            expect(camera.lowerBetaLimit).toBeCloseTo(Math.PI / 18, 10);
            expect(camera.upperBetaLimit).toBeCloseTo(Math.PI * 17 / 18, 10);
        });

        it("should leave every optional property at the engine's own value when none was given", () => {
            // Arrange
            const reference = new BABYLON.ArcRotateCamera("reference", 0, 0, 1, BABYLON.Vector3.Zero(), headless.scene);

            // Act
            const camera = cameraFor();

            // Assert
            expect(camera.lowerRadiusLimit).toBe(reference.lowerRadiusLimit);
            expect(camera.upperAlphaLimit).toBe(reference.upperAlphaLimit);
            expect(camera.wheelPrecision).toBe(reference.wheelPrecision);
        });

        it("should take the far clipping plane it was given, and clip nothing near", () => {
            // Act
            const camera = cameraFor((inputs) => { inputs.maxZ = 2000; });

            // Assert
            expect(camera.maxZ).toBe(2000);
            expect(camera.minZ).toBe(0);
        });

        it("should give each camera a name of its own", () => {
            // Act
            const first = cameraFor();
            const second = cameraFor();

            // Assert
            expect(first.name).not.toBe(second.name);
            expect(first.name).toContain("arcRotateCamera");
        });
    });
});
