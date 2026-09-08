import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoScaleGizmo } from "./scale-gizmo";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoScaleGizmo", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoScaleGizmo;
    let manager: BABYLON.GizmoManager;
    let gizmo: BABYLON.IScaleGizmo;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoScaleGizmo(headless.context);
        manager = new BABYLON.GizmoManager(headless.scene);
        manager.scaleGizmoEnabled = true;
        gizmo = manager.gizmos.scaleGizmo!;
    });

    afterEach(() => {
        manager.dispose();
        headless.dispose();
    });

    describe("the writers and the readers", () => {
        it("should set and read the distance a drag snaps to", () => {
            // Act
            const result = service.snapDistance(new Inputs.BabylonGizmo.SetScaleGizmoSnapDistanceDto(gizmo, 0.1));

            // Assert
            expect(service.getSnapDistance(new Inputs.BabylonGizmo.ScaleGizmoDto(gizmo))).toBe(0.1);
            expect(result).toBe(gizmo);
        });

        it("should set and read whether each snap adds to the last", () => {
            // Act
            const result = service.setIncrementalSnap(new Inputs.BabylonGizmo.SetScaleGizmoIncrementalSnapDto(gizmo, true));

            // Assert
            expect(service.getIncrementalSnap(new Inputs.BabylonGizmo.ScaleGizmoDto(gizmo))).toBe(true);
            expect(result).toBe(gizmo);
        });

        it("should set and read how far the mesh scales per unit of drag", () => {
            // Act
            const result = service.sensitivity(new Inputs.BabylonGizmo.SetScaleGizmoSensitivityDto(gizmo, 4));

            // Assert
            expect(service.getSensitivity(new Inputs.BabylonGizmo.ScaleGizmoDto(gizmo))).toBe(4);
            expect(result).toBe(gizmo);
        });
    });

    describe("the smaller gizmos it holds", () => {
        it("should hand out one handle per axis", () => {
            // Assert
            expect(service.getXGizmo(new Inputs.BabylonGizmo.ScaleGizmoDto(gizmo))).toBe(gizmo.xGizmo);
            expect(service.getYGizmo(new Inputs.BabylonGizmo.ScaleGizmoDto(gizmo))).toBe(gizmo.yGizmo);
            expect(service.getZGizmo(new Inputs.BabylonGizmo.ScaleGizmoDto(gizmo))).toBe(gizmo.zGizmo);
        });
    });

    describe("createScaleGizmoObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createScaleGizmoObservableSelector(
                new Inputs.BabylonGizmo.ScaleGizmoObservableSelectorDto(Inputs.BabylonGizmo.scaleGizmoObservableSelectorEnum.onDragObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGizmo.scaleGizmoObservableSelectorEnum.onDragObservable);
        });
    });
});
