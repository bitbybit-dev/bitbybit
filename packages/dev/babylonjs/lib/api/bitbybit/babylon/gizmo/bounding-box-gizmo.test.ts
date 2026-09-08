import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGizmoBoundingBoxGizmo } from "./bounding-box-gizmo";
import * as Inputs from "../../../inputs";

describe("BabylonGizmoBoundingBoxGizmo", () => {
    let headless: HeadlessScene;
    let service: BabylonGizmoBoundingBoxGizmo;
    let manager: BABYLON.GizmoManager;
    let gizmo: BABYLON.BoundingBoxGizmo;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGizmoBoundingBoxGizmo(headless.context);
        manager = new BABYLON.GizmoManager(headless.scene);
        manager.boundingBoxGizmoEnabled = true;
        gizmo = manager.gizmos.boundingBoxGizmo as BABYLON.BoundingBoxGizmo;
    });

    afterEach(() => {
        manager.dispose();
        headless.dispose();
    });

    describe("the sizes of the handles", () => {
        it("should set and read the size of the rotation spheres", () => {
            // Act
            const result = service.setRotationSphereSize(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSphereSizeDto(gizmo, 0.2));

            // Assert
            expect(service.getRotationSphereSize(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toBe(0.2);
            expect(result).toBe(gizmo);
        });

        it("should set and read the size of the scale boxes", () => {
            // Act
            const result = service.setScaleBoxSize(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleBoxSizeDto(gizmo, 0.15));

            // Assert
            expect(service.getScaleBoxSize(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toBe(0.15);
            expect(result).toBe(gizmo);
        });
    });

    describe("how the handles keep their size on screen", () => {
        it("should set and read whether the handles keep a fixed size on screen", () => {
            // Act
            const result = service.setFixedDragMeshScreenSize(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDto(gizmo, true));

            // Assert
            expect(service.getFixedDragMeshScreenSize(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toBe(true);
            expect(result).toBe(gizmo);
        });

        it("should set and read whether the handles keep a fixed size against the bounds", () => {
            // Act
            const result = service.setFixedDragMeshBoundsSize(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshBoundsSizeDto(gizmo, true));

            // Assert
            expect(service.getFixedDragMeshBoundsSize(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toBe(true);
            expect(result).toBe(gizmo);
        });

        it("should set and read the distance that fixed size is measured against", () => {
            // Act
            const result = service.setFixedDragMeshScreenSizeDistanceFactor(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDistanceFactorDto(gizmo, 12));

            // Assert
            expect(service.getFixedDragMeshScreenSizeDistanceFactor(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toBe(12);
            expect(result).toBe(gizmo);
        });
    });

    describe("snapping", () => {
        it("should set and read the distance a scale snaps to", () => {
            // Act
            const result = service.setScalingSnapDistance(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoScalingSnapDistanceDto(gizmo, 0.25));

            // Assert
            expect(service.getScalingSnapDistance(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toBe(0.25);
            expect(result).toBe(gizmo);
        });

        it("should set and read the angle a rotation snaps to", () => {
            // Act
            const result = service.setRotationSnapDistance(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSnapDistanceDto(gizmo, 0.5));

            // Assert
            expect(service.getRotationSnapDistance(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toBe(0.5);
            expect(result).toBe(gizmo);
        });

        it("should set and read whether each snap adds to the last", () => {
            // Act
            const result = service.setIncrementalSnap(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoIncrementalSnapDto(gizmo, true));

            // Assert
            expect(service.getIncrementalSnap(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toBe(true);
            expect(result).toBe(gizmo);
        });
    });

    describe("how a drag scales the mesh", () => {
        it("should set and read the point a scale is measured from", () => {
            // Act
            const result = service.setScalePivot(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoScalePivotDto(gizmo, [0, -1, 0]));

            // Assert
            expect(service.getScalePivot(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toEqual([0, -1, 0]);
            expect(result).toBe(gizmo);
        });

        it("should set and read the axes a scale is allowed along", () => {
            // Act
            const result = service.setAxisFactor(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoAxisFactorDto(gizmo, [1, 0, 1]));

            // Assert
            expect(service.getAxisFactor(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toEqual([1, 0, 1]);
            expect(result).toBe(gizmo);
        });

        it("should set and read how fast a drag scales the mesh", () => {
            // Act
            const result = service.setScaleDragSpeed(
                new Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleDragSpeedDto(gizmo, 3));

            // Assert
            expect(service.getScaleDragSpeed(new Inputs.BabylonGizmo.BoundingBoxGizmoDto(gizmo))).toBe(3);
            expect(result).toBe(gizmo);
        });
    });

    describe("the readers when there is no gizmo", () => {
        it("should read nothing rather than throw", () => {
            // Arrange
            const inputs = new Inputs.BabylonGizmo.BoundingBoxGizmoDto();

            // Assert
            expect(service.getRotationSphereSize(inputs)).toBeUndefined();
            expect(service.getScalePivot(inputs)).toBeUndefined();
            expect(service.getAxisFactor(inputs)).toBeUndefined();
        });
    });

    describe("createBoundingBoxGizmoObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createBoundingBoxGizmoObservableSelector(
                new Inputs.BabylonGizmo.BoundingBoxGizmoObservableSelectorDto(Inputs.BabylonGizmo.boundingBoxGizmoObservableSelectorEnum.onScaleBoxDragObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGizmo.boundingBoxGizmoObservableSelectorEnum.onScaleBoxDragObservable);
        });
    });
});
