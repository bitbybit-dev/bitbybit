import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoAxisDragGizmo } from "./axis-drag-gizmo";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoAxisDragGizmo", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoAxisDragGizmo;
    let manager: BABYLON.GizmoManager;
    let gizmo: BABYLON.IAxisDragGizmo;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoAxisDragGizmo(headless.context);
        manager = new BABYLON.GizmoManager(headless.scene);
        manager.positionGizmoEnabled = true;
        gizmo = manager.gizmos.positionGizmo!.xGizmo;
    });

    afterEach(() => {
        manager.dispose();
        headless.dispose();
    });

    describe("setIsEnabled", () => {
        it("should turn the axis off and hand the gizmo back", () => {
            // Act
            const result = service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledAxisDragGizmoDto(gizmo, false));

            // Assert
            expect(service.getIsEnabled(new Inputs.BabylonGizmo.AxisDragGizmoDto(gizmo))).toBe(false);
            expect(result).toBe(gizmo);
        });

        it("should turn the axis back on", () => {
            // Arrange
            service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledAxisDragGizmoDto(gizmo, false));

            // Act
            service.setIsEnabled(new Inputs.BabylonGizmo.SetIsEnabledAxisDragGizmoDto(gizmo, true));

            // Assert
            expect(service.getIsEnabled(new Inputs.BabylonGizmo.AxisDragGizmoDto(gizmo))).toBe(true);
        });
    });
});
