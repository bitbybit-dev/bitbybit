import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoPlaneRotationGizmo } from "./plane-rotation-gizmo";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoPlaneRotationGizmo", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoPlaneRotationGizmo;
    let manager: BABYLON.GizmoManager;
    let gizmo: BABYLON.IPlaneRotationGizmo;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoPlaneRotationGizmo(headless.context);
        manager = new BABYLON.GizmoManager(headless.scene);
        manager.rotationGizmoEnabled = true;
        gizmo = manager.gizmos.rotationGizmo!.zGizmo;
    });

    afterEach(() => {
        manager.dispose();
        headless.dispose();
    });

    describe("setIsEnabled", () => {
        it("should turn the ring off and hand the gizmo back", () => {
            // Act
            const result = service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto(gizmo, false));

            // Assert
            expect(service.getIsEnabled(new Inputs.BabylonGizmo.PlaneRotationGizmoDto(gizmo))).toBe(false);
            expect(result).toBe(gizmo);
        });

        it("should turn the ring back on", () => {
            // Arrange
            service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto(gizmo, false));

            // Act
            service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto(gizmo, true));

            // Assert
            expect(service.getIsEnabled(new Inputs.BabylonGizmo.PlaneRotationGizmoDto(gizmo))).toBe(true);
        });
    });
});
