import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoAxisScaleGizmo } from "./axis-scale-gizmo";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoAxisScaleGizmo", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoAxisScaleGizmo;
    let manager: BABYLON.GizmoManager;
    let gizmo: BABYLON.IAxisScaleGizmo;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoAxisScaleGizmo(headless.context);
        manager = new BABYLON.GizmoManager(headless.scene);
        manager.scaleGizmoEnabled = true;
        gizmo = manager.gizmos.scaleGizmo!.yGizmo;
    });

    afterEach(() => {
        manager.dispose();
        headless.dispose();
    });

    describe("setIsEnabled", () => {
        it("should turn the axis off and hand the gizmo back", () => {
            // Act
            const result = service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledAxisScaleGizmoDto(gizmo, false));

            // Assert
            expect(service.getIsEnabled(new Inputs.BabylonGizmo.AxisScaleGizmoDto(gizmo))).toBe(false);
            expect(result).toBe(gizmo);
        });

        it("should turn the axis back on", () => {
            // Arrange
            service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledAxisScaleGizmoDto(gizmo, false));

            // Act
            service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledAxisScaleGizmoDto(gizmo, true));

            // Assert
            expect(service.getIsEnabled(new Inputs.BabylonGizmo.AxisScaleGizmoDto(gizmo))).toBe(true);
        });
    });
});
