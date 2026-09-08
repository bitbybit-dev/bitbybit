import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoPositionGizmo } from "./position-gizmo";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoPositionGizmo", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoPositionGizmo;
    let manager: BABYLON.GizmoManager;
    let gizmo: BABYLON.IPositionGizmo;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoPositionGizmo(headless.context);
        manager = new BABYLON.GizmoManager(headless.scene);
        manager.positionGizmoEnabled = true;
        gizmo = manager.gizmos.positionGizmo!;
    });

    afterEach(() => {
        manager.dispose();
        headless.dispose();
    });

    describe("the writers and the readers", () => {
        it("should set and read whether the plane handles are drawn", () => {
            // Act
            const result = service.planarGizmoEnabled(new Inputs.BabylonGizmo.SetPlanarGizmoEnabled(gizmo, true));

            // Assert
            expect(service.getPlanarGizmoEnabled(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(true);
            expect(result).toBe(gizmo);
        });

        it("should set and read the distance a drag snaps to", () => {
            // Act
            const result = service.snapDistance(new Inputs.BabylonGizmo.SetPositionGizmoSnapDistanceDto(gizmo, 0.5));

            // Assert
            expect(service.getSnapDistance(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(0.5);
            expect(result).toBe(gizmo);
        });

        it("should report that nothing is being dragged while nobody is dragging", () => {
            // Assert
            expect(service.getIsDragging(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(false);
        });
    });

    describe("the mesh it is attached to", () => {
        it("should read the mesh the gizmo was put on", () => {
            // Arrange
            const mesh = BABYLON.MeshBuilder.CreateBox("box", {}, headless.scene);
            manager.attachToMesh(mesh);

            // Assert
            expect(service.getAttachedMesh(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(mesh);
            expect(service.getAttachedNode(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(mesh);
        });

        it("should read nothing while the gizmo sits on no mesh at all", () => {
            // Assert
            expect(service.getAttachedMesh(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBeNull();
        });
    });

    describe("the smaller gizmos it holds", () => {
        it("should hand out the three axis handles", () => {
            // Assert
            expect(service.getXGizmo(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(gizmo.xGizmo);
            expect(service.getYGizmo(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(gizmo.yGizmo);
            expect(service.getZGizmo(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(gizmo.zGizmo);
        });

        it("should hand out the three plane handles", () => {
            // Assert
            expect(service.getXPlaneGizmo(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(gizmo.xPlaneGizmo);
            expect(service.getYPlaneGizmo(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(gizmo.yPlaneGizmo);
            expect(service.getZPlaneGizmo(new Inputs.BabylonGizmo.PositionGizmoDto(gizmo))).toBe(gizmo.zPlaneGizmo);
        });
    });

    describe("createPositionGizmoObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createPositionGizmoObservableSelector(
                new Inputs.BabylonGizmo.PositionGizmoObservableSelectorDto(Inputs.BabylonGizmo.positionGizmoObservableSelectorEnum.onDragStartObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGizmo.positionGizmoObservableSelectorEnum.onDragStartObservable);
        });
    });
});
