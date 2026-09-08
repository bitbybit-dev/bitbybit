import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoRotationGizmo } from "./rotation-gizmo";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoRotationGizmo", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoRotationGizmo;
    let manager: BABYLON.GizmoManager;
    let gizmo: BABYLON.IRotationGizmo;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoRotationGizmo(headless.context);
        manager = new BABYLON.GizmoManager(headless.scene);
        manager.rotationGizmoEnabled = true;
        gizmo = manager.gizmos.rotationGizmo!;
    });

    afterEach(() => {
        manager.dispose();
        headless.dispose();
    });

    describe("the writers and the readers", () => {
        it("should set and read the angle a turn snaps to", () => {
            // Act
            const result = service.snapDistance(new Inputs.BabylonGizmo.SetRotationGizmoSnapDistanceDto(gizmo, 0.25));

            // Assert
            expect(service.getSnapDistance(new Inputs.BabylonGizmo.RotationGizmoDto(gizmo))).toBe(0.25);
            expect(result).toBe(gizmo);
        });

        it("should set and read how far the mesh turns per unit of drag", () => {
            // Act
            const result = service.sensitivity(new Inputs.BabylonGizmo.SetRotationGizmoSensitivityDto(gizmo, 2));

            // Assert
            expect(service.getSensitivity(new Inputs.BabylonGizmo.RotationGizmoDto(gizmo))).toBe(2);
            expect(result).toBe(gizmo);
        });
    });

    describe("the mesh it is attached to", () => {
        it("should read the mesh the gizmo was put on", () => {
            // Arrange
            const mesh = BABYLON.MeshBuilder.CreateBox("box", {}, headless.scene);
            manager.attachToMesh(mesh);

            // Assert
            expect(service.getAttachedMesh(new Inputs.BabylonGizmo.RotationGizmoDto(gizmo))).toBe(mesh);
            expect(service.getAttachedNode(new Inputs.BabylonGizmo.RotationGizmoDto(gizmo))).toBe(mesh);
        });

        it("should read nothing while the gizmo sits on no mesh at all", () => {
            // Assert
            expect(service.getAttachedMesh(new Inputs.BabylonGizmo.RotationGizmoDto(gizmo))).toBeNull();
        });
    });

    describe("the smaller gizmos it holds", () => {
        it("should hand out one ring per axis", () => {
            // Assert
            expect(service.getXGizmo(new Inputs.BabylonGizmo.RotationGizmoDto(gizmo))).toBe(gizmo.xGizmo);
            expect(service.getYGizmo(new Inputs.BabylonGizmo.RotationGizmoDto(gizmo))).toBe(gizmo.yGizmo);
            expect(service.getZGizmo(new Inputs.BabylonGizmo.RotationGizmoDto(gizmo))).toBe(gizmo.zGizmo);
        });
    });

    describe("createRotationGizmoObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createRotationGizmoObservableSelector(
                new Inputs.BabylonGizmo.RotationGizmoObservableSelectorDto(Inputs.BabylonGizmo.rotationGizmoObservableSelectorEnum.onDragEndObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGizmo.rotationGizmoObservableSelectorEnum.onDragEndObservable);
        });
    });
});
