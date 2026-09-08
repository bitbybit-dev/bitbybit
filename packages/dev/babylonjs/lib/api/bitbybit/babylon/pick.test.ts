import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../__test__/headless";
import { BabylonPick } from "./pick";
import * as Inputs from "../../inputs";

describe("BabylonPick", () => {
    let headless: HeadlessScene;
    let service: BabylonPick;
    let box: BABYLON.Mesh;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonPick(headless.context);
        box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, headless.scene);
        box.computeWorldMatrix(true);
    });

    afterEach(() => {
        headless.dispose();
    });

    const hitFromOutside = (): Inputs.BabylonPick.PickInfo => {
        const ray = new BABYLON.Ray(new BABYLON.Vector3(0, 0, -10), new BABYLON.Vector3(0, 0, 1), 100);
        return new Inputs.BabylonPick.PickInfo(service.pickWithRay(new Inputs.BabylonPick.RayDto(ray)));
    };

    const missFromOutside = (): Inputs.BabylonPick.PickInfo => {
        const ray = new BABYLON.Ray(new BABYLON.Vector3(0, 100, -10), new BABYLON.Vector3(0, 0, 1), 100);
        return new Inputs.BabylonPick.PickInfo(service.pickWithRay(new Inputs.BabylonPick.RayDto(ray)));
    };

    describe("pickWithRay", () => {
        it("should report a hit on the mesh the ray runs into", () => {
            // Act
            const pick = hitFromOutside();

            // Assert
            expect(service.hit(pick)).toBe(true);
            expect(service.getPickedMesh(pick)).toBe(box);
        });

        it("should report where on the mesh the ray struck", () => {
            // Act
            const pick = hitFromOutside();

            // Assert
            expect(service.getPickedPoint(pick)).toEqual([0, 0, -1]);
            expect(service.getDistance(pick)).toBeCloseTo(9, 6);
        });

        it("should report which triangle of which submesh was struck", () => {
            // Act
            const pick = hitFromOutside();

            // Assert
            expect(service.getSubMeshId(pick)).toBe(0);
            expect(service.getSubMeshFaceId(pick)).toBeGreaterThanOrEqual(0);
        });

        it("should report where inside that triangle the ray struck", () => {
            // Act
            const pick = hitFromOutside();

            // Assert
            expect(service.getBU(pick)).toBeGreaterThanOrEqual(0);
            expect(service.getBV(pick)).toBeGreaterThanOrEqual(0);
        });

        it("should report no hit when the ray runs past everything", () => {
            // Act
            const pick = missFromOutside();

            // Assert
            expect(service.hit(pick)).toBe(false);
            expect(service.getPickedMesh(pick)).toBeNull();
        });

        it("should report no sprite when the ray struck a mesh", () => {
            // Act
            const pick = hitFromOutside();

            // Assert
            expect(service.getPickedSprite(pick)).toBeNull();
        });
    });

    describe("pickWithPickingRay", () => {
        it("should cast a ray out of the camera through wherever the pointer is", () => {
            // Act
            const pickInfo = service.pickWithPickingRay();

            // Assert
            expect(pickInfo).toBeInstanceOf(BABYLON.PickingInfo);
        });
    });
});
