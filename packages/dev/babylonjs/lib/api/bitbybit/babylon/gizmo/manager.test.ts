import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoManager } from "./manager";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoManager", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoManager;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoManager(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const allEnabled = (): BABYLON.GizmoManager =>
        service.createGizmoManager(new Inputs.BabylonGizmo.CreateGizmoDto(true, true, true, true));

    describe("createGizmoManager", () => {
        it("should build a manager on the context's scene", () => {
            // Act
            const manager = service.createGizmoManager(new Inputs.BabylonGizmo.CreateGizmoDto());

            // Assert
            expect(manager).toBeInstanceOf(BABYLON.GizmoManager);
            expect(manager.utilityLayer.originalScene).toBe(headless.scene);
        });

        it("should turn on each gizmo it was asked for", () => {
            // Act
            const manager = allEnabled();

            // Assert
            expect(manager.positionGizmoEnabled).toBe(true);
            expect(manager.rotationGizmoEnabled).toBe(true);
            expect(manager.scaleGizmoEnabled).toBe(true);
            expect(manager.boundingBoxGizmoEnabled).toBe(true);
        });

        it("should leave every gizmo off when none was asked for", () => {
            // Act
            const manager = service.createGizmoManager(
                new Inputs.BabylonGizmo.CreateGizmoDto(false, false, false, false));

            // Assert
            expect(manager.positionGizmoEnabled).toBe(false);
            expect(manager.rotationGizmoEnabled).toBe(false);
            expect(manager.scaleGizmoEnabled).toBe(false);
            expect(manager.boundingBoxGizmoEnabled).toBe(false);
        });

        it("should take the behaviour settings it was given", () => {
            // Act
            const manager = service.createGizmoManager(
                new Inputs.BabylonGizmo.CreateGizmoDto(true, false, false, false, undefined, false, 2, false));

            // Assert
            expect(manager.clearGizmoOnEmptyPointerEvent).toBe(false);
            expect(manager.scaleRatio).toBe(2);
            expect(manager.usePointerToAttachGizmos).toBe(false);
        });

        it("should limit the manager to the meshes it was given", () => {
            // Arrange
            const mesh = BABYLON.MeshBuilder.CreateBox("box", {}, headless.scene);

            // Act
            const manager = service.createGizmoManager(
                new Inputs.BabylonGizmo.CreateGizmoDto(true, false, false, false, [mesh]));

            // Assert
            expect(manager.attachableMeshes).toEqual([mesh]);
        });

        it("should leave the manager open to every mesh when it was given no list", () => {
            // Act
            const manager = service.createGizmoManager(
                new Inputs.BabylonGizmo.CreateGizmoDto(true, false, false, false, []));

            // Assert
            expect(manager.attachableMeshes).toBeNull();
        });
    });

    describe("the gizmos it hands out", () => {
        it("should hand out the position gizmo", () => {
            // Arrange
            const manager = allEnabled();

            // Act
            const gizmo = service.getPositionGizmo(new Inputs.BabylonGizmo.GizmoManagerDto(manager));

            // Assert
            expect(gizmo).toBe(manager.gizmos.positionGizmo);
        });

        it("should hand out the rotation gizmo", () => {
            // Arrange
            const manager = allEnabled();

            // Act
            const gizmo = service.getRotationGizmo(new Inputs.BabylonGizmo.GizmoManagerDto(manager));

            // Assert
            expect(gizmo).toBe(manager.gizmos.rotationGizmo);
        });

        it("should hand out the scale gizmo", () => {
            // Arrange
            const manager = allEnabled();

            // Act
            const gizmo = service.getScaleGizmo(new Inputs.BabylonGizmo.GizmoManagerDto(manager));

            // Assert
            expect(gizmo).toBe(manager.gizmos.scaleGizmo);
        });

        it("should hand out the bounding box gizmo", () => {
            // Arrange
            const manager = allEnabled();

            // Act
            const gizmo = service.getBoundingBoxGizmo(new Inputs.BabylonGizmo.GizmoManagerDto(manager));

            // Assert
            expect(gizmo).toBe(manager.gizmos.boundingBoxGizmo);
        });
    });

    describe("attaching and detaching", () => {
        it("should attach the manager to the mesh it was given", () => {
            // Arrange
            const manager = allEnabled();
            const mesh = BABYLON.MeshBuilder.CreateBox("box", {}, headless.scene);

            // Act
            const result = service.attachToMesh(new Inputs.BabylonGizmo.AttachToMeshDto(mesh, manager));

            // Assert
            expect(manager.attachedMesh).toBe(mesh);
            expect(result).toBe(manager);
        });

        it("should let go of the mesh it was attached to", () => {
            // Arrange
            const manager = allEnabled();
            const mesh = BABYLON.MeshBuilder.CreateBox("box", {}, headless.scene);
            service.attachToMesh(new Inputs.BabylonGizmo.AttachToMeshDto(mesh, manager));

            // Act
            const result = service.detachMesh(new Inputs.BabylonGizmo.GizmoManagerDto(manager));

            // Assert
            expect(manager.attachedMesh).toBeNull();
            expect(result).toBe(manager);
        });
    });
});
