import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../__test__/headless";
import { BabylonRay } from "./ray";
import * as Inputs from "../../inputs";

describe("BabylonRay", () => {
    let headless: HeadlessScene;
    let service: BabylonRay;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonRay(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("createRay", () => {
        it("should build a ray from the origin, direction and length it was given", () => {
            // Act
            const ray = service.createRay(new Inputs.BabylonRay.BaseRayDto([1, 2, 3], [0, 1, 0], 10));

            // Assert
            expect(ray).toBeInstanceOf(BABYLON.Ray);
            expect(service.getOrigin(new Inputs.BabylonRay.RayDto(ray))).toEqual([1, 2, 3]);
            expect(service.getDirection(new Inputs.BabylonRay.RayDto(ray))).toEqual([0, 1, 0]);
            expect(service.getLength(new Inputs.BabylonRay.RayDto(ray))).toBe(10);
        });

        it("should let the ray run on for ever when it was given a length of zero", () => {
            // Act
            const ray = service.createRay(new Inputs.BabylonRay.BaseRayDto([0, 0, 0], [1, 0, 0], 0));

            // Assert
            expect(service.getLength(new Inputs.BabylonRay.RayDto(ray))).toBe(Number.MAX_VALUE);
        });
    });

    describe("createRayFromTo", () => {
        it("should build a ray that starts where it was told and points at the other end", () => {
            // Act
            const ray = service.createRayFromTo(new Inputs.BabylonRay.FromToDto([0, 0, 0], [0, 0, 5]));

            // Assert
            expect(service.getOrigin(new Inputs.BabylonRay.RayDto(ray))).toEqual([0, 0, 0]);
            expect(service.getDirection(new Inputs.BabylonRay.RayDto(ray))).toEqual([0, 0, 1]);
        });

        it("should reach exactly as far as the point it was pointed at", () => {
            // Act
            const ray = service.createRayFromTo(new Inputs.BabylonRay.FromToDto([0, 0, 0], [0, 0, 5]));

            // Assert
            expect(service.getLength(new Inputs.BabylonRay.RayDto(ray))).toBeCloseTo(5, 6);
        });
    });

    describe("createPickingRay", () => {
        it("should build a ray out of the camera through wherever the pointer is", () => {
            // Act
            const ray = service.createPickingRay();

            // Assert
            expect(ray).toBeInstanceOf(BABYLON.Ray);
            expect(service.getDirection(new Inputs.BabylonRay.RayDto(ray))).toHaveLength(3);
        });
    });
});
