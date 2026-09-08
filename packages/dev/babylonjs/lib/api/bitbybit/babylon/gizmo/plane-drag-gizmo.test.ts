import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoPlaneDragGizmo } from "./plane-drag-gizmo";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoPlaneDragGizmo", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoPlaneDragGizmo;
    let manager: BABYLON.GizmoManager;
    let gizmo: BABYLON.IPlaneDragGizmo;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoPlaneDragGizmo(headless.context);
        manager = new BABYLON.GizmoManager(headless.scene);
        manager.positionGizmoEnabled = true;
        manager.gizmos.positionGizmo!.planarGizmoEnabled = true;
        gizmo = manager.gizmos.positionGizmo!.xPlaneGizmo;
    });

    afterEach(() => {
        manager.dispose();
        headless.dispose();
    });

    describe("setIsEnabled", () => {
        it("should turn the plane handle off and hand the gizmo back", () => {
            // Act
            const result = service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledPlaneDragGizmoDto(gizmo, false));

            // Assert
            expect(service.getIsEnabled(new Inputs.BabylonGizmo.PlaneDragGizmoDto(gizmo))).toBe(false);
            expect(result).toBe(gizmo);
        });

        it("should turn the plane handle back on", () => {
            // Arrange
            service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledPlaneDragGizmoDto(gizmo, false));

            // Act
            service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledPlaneDragGizmoDto(gizmo, true));

            // Assert
            expect(service.getIsEnabled(new Inputs.BabylonGizmo.PlaneDragGizmoDto(gizmo))).toBe(true);
        });
    });
});
