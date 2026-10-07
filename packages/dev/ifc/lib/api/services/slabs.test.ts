import { describe, expect, it } from "vitest";
import { modelOf } from "./service-support";
import { expressIdOf, groundFloor, notAModel } from "../../__test__/build-setup";
import { countOf, enumOf, extrusionOf, innerCurvesOf, materialOf, objectPlacementOf, outerCurveOf, placementOf, refOf, rounded, sweptAreaOf } from "../../__test__/build-geometry";
import { findLayerSet } from "../../build/materials";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type { Base } from "@bitbybit-dev/base";

const SQUARE: Base.Point2[] = [[0, 0], [10000, 0], [10000, 8000], [0, 8000]];
const CLOCKWISE_SQUARE: Base.Point2[] = [[0, 0], [0, 8000], [10000, 8000], [10000, 0]];
const STAIR_HOLE: Base.Point2[] = [[2000, 2000], [3000, 2000], [3000, 4000], [2000, 4000]];

function layerSetNamed(model: IfcModel, name: string): number {
    const layerSet = findLayerSet(modelOf(model), name);
    if (layerSet === undefined) {
        throw new Error(`No layer set named ${name}`);
    }
    return layerSet;
}

describe("IFCSlabs.add", () => {
    it("should keep a counter-clockwise outline as it was given", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE });

        // Assert
        const profile = sweptAreaOf(changed, expressIdOf(changed, "floor"));
        expect(changed.typeOf(profile)).toBe("IfcArbitraryClosedProfileDef");
        expect(outerCurveOf(changed, profile)).toEqual(SQUARE);
    });

    it("should turn a clockwise outline counter-clockwise", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: CLOCKWISE_SQUARE });

        // Assert
        expect(outerCurveOf(changed, sweptAreaOf(changed, expressIdOf(changed, "floor")))).toEqual([[10000, 0], [10000, 8000], [0, 8000], [0, 0]]);
    });

    it("should wind a hole clockwise, the other way from the outline", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE, holes: [STAIR_HOLE] });

        // Assert
        const profile = sweptAreaOf(changed, expressIdOf(changed, "floor"));
        expect(changed.typeOf(profile)).toBe("IfcArbitraryProfileDefWithVoids");
        expect(outerCurveOf(changed, profile)).toEqual(SQUARE);
        expect(innerCurvesOf(changed, profile)).toEqual([[[2000, 4000], [3000, 4000], [3000, 2000], [2000, 2000]]]);
    });

    it("should keep a hole that is already clockwise", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const clockwiseHole: Base.Point2[] = [[2000, 4000], [3000, 4000], [3000, 2000], [2000, 2000]];

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: CLOCKWISE_SQUARE, holes: [clockwiseHole] });

        // Assert
        expect(innerCurvesOf(changed, sweptAreaOf(changed, expressIdOf(changed, "floor")))).toEqual([clockwiseHole]);
    });

    it("should close the outline's curve back to its first point", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE });

        // Assert
        const curve = refOf(changed.attribute(sweptAreaOf(changed, expressIdOf(changed, "floor")), "OuterCurve"));
        expect(changed.attribute(curve, "Segments")).toEqual([{ type: "IfcLineIndex", value: [1, 2, 3, 4, 1] }]);
    });

    it("should extrude the slab down from its top by its thickness", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE, thickness: 250 });

        // Assert
        expect(extrusionOf(changed, expressIdOf(changed, "floor"))).toEqual({
            position: { location: [0, 0, 0], axis: null, refDirection: null },
            direction: [0, 0, -1],
            depth: 250,
        });
    });

    it("should put the slab's top its top offset above the storey's floor", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE, topOffset: 50 });

        // Assert
        expect(placementOf(changed, expressIdOf(changed, "floor"))).toEqual({
            relativeTo: objectPlacementOf(changed, expressIdOf(changed, "ground")),
            location: [0, 0, 50],
            axis: null,
            refDirection: null,
        });
    });

    it("should make the slab of a named layer set, as thick as its layers together", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.addLayerSet({ model: ground, name: "Floor build-up", layers: [{ thickness: 50 }, { thickness: 250 }] });

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE, layerSet: "Floor build-up", thickness: 100 });

        // Assert
        const slab = expressIdOf(changed, "floor");
        const usage = materialOf(changed, slab);
        expect(extrusionOf(changed, slab).depth).toBe(300);
        expect(rounded([extrusionOf(changed, slab).position.location])).toEqual([[0, 0, 0]]);
        expect(refOf(changed.attribute(usage, "ForLayerSet"))).toBe(layerSetNamed(changed, "Floor build-up"));
        expect(enumOf(changed.attribute(usage, "LayerSetDirection"))).toBe("AXIS3");
        expect(enumOf(changed.attribute(usage, "DirectionSense"))).toBe("NEGATIVE");
        expect(changed.attribute(usage, "OffsetFromReferenceLine")).toBe(0);
    });

    it("should share one layer set named after the thickness between slabs of that thickness", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        let changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE });
        changed = ifc.slabs.add({ model: changed, storey: "ground", id: "terrace", outline: [[10000, 0], [14000, 0], [14000, 4000], [10000, 4000]] });

        // Assert
        expect(changed.byType("IfcMaterialLayerSet").map((set) => changed.attribute(set.id, "LayerSetName"))).toEqual(["Slab 200"]);
    });

    it("should make a slab given only a thickness that thick even when a layer set already has the name it would use", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.addLayerSet({ model: ground, name: "Slab 200", layers: [{ thickness: 300 }] });

        // Act
        const changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE, thickness: 200 });

        // Assert
        expect(extrusionOf(changed, expressIdOf(changed, "floor")).depth).toBe(200);
    });

    it("should mark a slab a floor unless told otherwise, and contain it in its storey", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        let changed = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE });
        changed = ifc.slabs.add({ model: changed, storey: "ground", id: "roof", outline: SQUARE, topOffset: 3000, predefinedType: Inputs.IFC.slabPredefinedTypeEnum.roof });

        // Assert
        expect(enumOf(changed.attribute(expressIdOf(changed, "floor"), "PredefinedType"))).toBe("FLOOR");
        expect(enumOf(changed.attribute(expressIdOf(changed, "roof"), "PredefinedType"))).toBe("ROOF");
        expect(ifc.model.elements({ model: changed, type: "IfcSlab", storey: "ground" })).toHaveLength(2);
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        ifc.slabs.add({ model, storey: "ground", id: "floor", outline: SQUARE });

        // Assert
        expect(countOf(model, "IfcSlab")).toBe(0);
    });

    it("should refuse an outline of fewer than three points", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: [[0, 0], [1000, 0]] })).toThrow("The outline must be a list of at least 3 [x, y] points");
    });

    it("should refuse an outline that encloses no area", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: [[0, 0], [1000, 0], [2000, 0]] })).toThrow("The outline must enclose an area");
    });

    it("should refuse a hole of fewer than three points", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: SQUARE, holes: [[[0, 0], [1, 1]]] })).toThrow("The hole 0 must be a list of at least 3 [x, y] points");
    });

    it("should refuse an outline that is not a list of finite points with a TypeError", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const notPoints: unknown = [[0, 0, 0], [1000, 0, 0], [1000, 1000, 0]];

        // Act & Assert
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: notPoints as Base.Point2[] })).toThrow(TypeError);
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: [[0, 0], [Number.NaN, 0], [1000, 1000]] })).toThrow(TypeError);
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: SQUARE, holes: [[[0, 0], [Infinity, 0], [1000, 1000]]] })).toThrow("The hole 0's point 1 must be two finite numbers");
    });

    it.each([0, -200])("should refuse a thickness of %s", (thickness) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: SQUARE, thickness })).toThrow(RangeError);
    });

    it("should refuse a top offset that is not finite", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: SQUARE, topOffset: Number.NaN })).toThrow(RangeError);
    });

    it("should refuse a layer set the model does not have, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.slabs.add({ model, storey: "ground", outline: SQUARE, layerSet: "Screed" })).toThrow("The model has no layer set named 'Screed'");
    });

    it("should refuse a storey the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.slabs.add({ model, storey: "roof", outline: SQUARE })).toThrow("The model has no storey 'roof'");
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.slabs.add({ model: notAModel(), storey: "ground", outline: SQUARE })).toThrow(TypeError);
    });
});
