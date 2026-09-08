import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoBase } from "./gizmo-base";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoBase", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoBase;
    let manager: BABYLON.GizmoManager;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoBase(headless.context);
        manager = new BABYLON.GizmoManager(headless.scene);
        manager.positionGizmoEnabled = true;
    });

    afterEach(() => {
        manager.dispose();
        headless.dispose();
    });

    describe("scaleRatio", () => {
        it("should set the ratio a gizmo is drawn at and hand the gizmo back", () => {
            // Arrange
            const gizmo = manager.gizmos.positionGizmo!;

            // Act
            const result = service.scaleRatio(new Inputs.BabylonGizmo.SetGizmoScaleRatioDto(gizmo, 3));

            // Assert
            expect(service.getScaleRatio(new Inputs.BabylonGizmo.GizmoDto(gizmo))).toBe(3);
            expect(result).toBe(gizmo);
        });
    });

    describe("getScaleRatio", () => {
        it("should read nothing off a gizmo that is not there", () => {
            // Arrange
            const inputs = new Inputs.BabylonGizmo.GizmoDto();

            // Act
            const ratio = service.getScaleRatio(inputs);

            // Assert
            expect(ratio).toBeUndefined();
        });
    });
});
