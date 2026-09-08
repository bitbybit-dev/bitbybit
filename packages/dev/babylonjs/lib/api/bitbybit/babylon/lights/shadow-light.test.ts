import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonShadowLight } from "./shadow-light";
import * as Inputs from "../../../inputs";

describe("BabylonShadowLight", () => {
    let headless: HeadlessScene;
    let service: BabylonShadowLight;
    let light: BABYLON.DirectionalLight;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonShadowLight(headless.context);
        light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -1, 0), headless.scene);
        light.position = new BABYLON.Vector3(0, 10, 0);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("setPosition", () => {
        it("should move the light to where it was told", () => {
            // Act
            service.setPosition(new Inputs.BabylonLight.ShadowLightPositionDto(light, [1, 2, 3]));

            // Assert
            expect([light.position.x, light.position.y, light.position.z]).toEqual([1, 2, 3]);
        });
    });

    describe("setDirectionToTarget", () => {
        it("should point the light from where it sits at the target it was given", () => {
            // Act
            service.setDirectionToTarget(new Inputs.BabylonLight.ShadowLightDirectionToTargetDto(light, [0, 0, 0]));

            // Assert
            expect(light.direction.x).toBeCloseTo(0, 6);
            expect(light.direction.y).toBeCloseTo(-1, 6);
            expect(light.direction.z).toBeCloseTo(0, 6);
        });
    });
});
