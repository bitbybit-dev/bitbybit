import { describe, expect, it } from "vitest";
import { modelOf } from "./service-support";
import { errorFrom, groundFloor, notAModel } from "../../__test__/build-setup";
import { countOf, enumOf, firstOf, footprintOf, layerThicknessesOf, materialOf, refOf, refsOf } from "../../__test__/build-geometry";
import { findLayerSet, findMaterial } from "../../build/materials";
import type { IfcModel } from "../../model/model-types";
import type { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";

function materialNamed(model: IfcModel, name: string): number {
    const material = findMaterial(modelOf(model), name);
    if (material === undefined) {
        throw new Error(`No material named ${name}`);
    }
    return material;
}

function layerSetNamed(model: IfcModel, name: string): number {
    const layerSet = findLayerSet(modelOf(model), name);
    if (layerSet === undefined) {
        throw new Error(`No layer set named ${name}`);
    }
    return layerSet;
}

function surfaceStyleOf(model: IfcModel, material: number): number {
    const definition = model.byType("IfcMaterialDefinitionRepresentation").find((entity) => refOf(model.attribute(entity.id, "RepresentedMaterial")) === material);
    if (!definition) {
        throw new Error(`#${material} has no definition representation`);
    }
    const representation = firstOf(refsOf(model.attribute(definition.id, "Representations")));
    const styled = firstOf(refsOf(model.attribute(representation, "Items")));
    return firstOf(refsOf(model.attribute(styled, "Styles")));
}

function shadingOf(model: IfcModel, material: number): number {
    return firstOf(refsOf(model.attribute(surfaceStyleOf(model, material), "Styles")));
}

function colourOf(model: IfcModel, material: number): number[] {
    const rgb = refOf(model.attribute(shadingOf(model, material), "SurfaceColour"));
    return ["Red", "Green", "Blue"].map((channel) => {
        const value = model.attribute(rgb, channel);
        if (typeof value !== "number") {
            throw new Error(`#${rgb} has no ${channel}`);
        }
        return value;
    });
}

function withBrickAndInsulation(ifc: IFCService, model: IfcModel): IfcModel {
    const brick = ifc.materials.add({ model, name: "Brick", category: "brick", color: "#b5651d" });
    return ifc.materials.add({ model: brick, name: "Insulation" });
}

describe("IFCMaterials.add", () => {
    it("should add a material with its name and category", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.materials.add({ model, name: "Concrete", category: "concrete" });

        // Assert
        const material = materialNamed(changed, "Concrete");
        expect(changed.attribute(material, "Category")).toBe("concrete");
    });

    it("should leave the category unset when none is given", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.materials.add({ model, name: "Concrete" });

        // Assert
        expect(changed.attribute(materialNamed(changed, "Concrete"), "Category")).toBe(null);
    });

    it("should give a coloured material a surface style in that colour", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.materials.add({ model, name: "Orange", color: "#ff8000" });

        // Assert
        const [red, green, blue] = colourOf(changed, materialNamed(changed, "Orange"));
        expect(red).toBe(1);
        expect(green).toBeCloseTo(0.50196, 5);
        expect(green).toBe(128 / 255);
        expect(blue).toBe(0);
    });

    it("should name the surface style after the material and show both sides", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.materials.add({ model, name: "Orange", color: "#ff8000" });

        // Assert
        const style = surfaceStyleOf(changed, materialNamed(changed, "Orange"));
        expect(changed.typeOf(style)).toBe("IfcSurfaceStyle");
        expect(changed.attribute(style, "Name")).toBe("Orange");
        expect(enumOf(changed.attribute(style, "Side"))).toBe("BOTH");
    });

    it("should read a colour written without its hash", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.materials.add({ model, name: "Blue", color: "0000FF" });

        // Assert
        expect(colourOf(changed, materialNamed(changed, "Blue"))).toEqual([0, 0, 1]);
    });

    it("should write the transparency of a see-through material", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.materials.add({ model, name: "Glass", color: "#ffffff", transparency: 0.7 });

        // Assert
        expect(changed.attribute(shadingOf(changed, materialNamed(changed, "Glass")), "Transparency")).toBe(0.7);
    });

    it("should leave the transparency of an opaque material unset", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.materials.add({ model, name: "Brick", color: "#b5651d" });

        // Assert
        expect(changed.attribute(shadingOf(changed, materialNamed(changed, "Brick")), "Transparency")).toBe(null);
    });

    it("should add no style to a material without a colour", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.materials.add({ model, name: "Plain" });

        // Assert
        expect(countOf(changed, "IfcSurfaceStyle")).toBe(0);
        expect(countOf(changed, "IfcMaterialDefinitionRepresentation")).toBe(0);
    });

    it.each(["orange", "#ff80", "#gg0000", "#ff800000", ""])("should refuse the colour '%s'", (color) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.materials.add({ model, name: "Odd", color })).toThrow("A colour is written as hex");
    });

    it.each([1.5, -0.1, Number.NaN])("should refuse a transparency of %s", (transparency) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.materials.add({ model, name: "Glass", color: "#ffffff", transparency })).toThrow(RangeError);
    });

    it("should refuse a second material of the same name", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const changed = ifc.materials.add({ model, name: "Brick" });

        // Act & Assert
        expect(() => ifc.materials.add({ model: changed, name: "Brick" })).toThrow("The model already has a material named 'Brick'");
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        ifc.materials.add({ model, name: "Brick", color: "#b5651d" });

        // Assert
        expect(countOf(model, "IfcMaterial")).toBe(0);
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.materials.add({ model: notAModel(), name: "Brick" })).toThrow(TypeError);
    });
});

describe("IFCMaterials.addLayerSet", () => {
    it("should stack the layers in order with their materials and thicknesses", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const materials = withBrickAndInsulation(ifc, model);

        // Act
        const changed = ifc.materials.addLayerSet({
            model: materials,
            name: "Exterior",
            layers: [{ material: "Brick", thickness: 115, name: "Outer leaf" }, { material: "Insulation", thickness: 100 }],
        });

        // Assert
        const layerSet = layerSetNamed(changed, "Exterior");
        const layers = refsOf(changed.attribute(layerSet, "MaterialLayers"));
        expect(layerThicknessesOf(changed, layerSet)).toEqual([115, 100]);
        expect(layers.map((layer) => refOf(changed.attribute(layer, "Material")))).toEqual([materialNamed(changed, "Brick"), materialNamed(changed, "Insulation")]);
        expect(layers.map((layer) => changed.attribute(layer, "Name"))).toEqual(["Outer leaf", null]);
    });

    it("should make a wall of the layer set as thick as its layers together", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const layered = ifc.materials.addLayerSet({
            model: withBrickAndInsulation(ifc, model),
            name: "Exterior",
            layers: [{ material: "Brick", thickness: 115 }, { material: "Insulation", thickness: 100 }],
        });

        // Act
        const changed = ifc.walls.add({ model: layered, storey: "ground", id: "south", start: [0, 0], end: [5000, 0], layerSet: "Exterior", alignment: Inputs.IFC.wallAlignmentEnum.left });

        // Assert
        expect(footprintOf(changed, firstOf(changed.byType("IfcWall").map((wall) => wall.id)))).toEqual([[0, 0], [5000, 0], [5000, 215], [0, 215]]);
    });

    it("should allow a layer without a material, 100 thick by default", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.materials.addLayerSet({ model, name: "Air gap", layers: [{}] });

        // Assert
        const layerSet = layerSetNamed(changed, "Air gap");
        const layer = firstOf(refsOf(changed.attribute(layerSet, "MaterialLayers")));
        expect(changed.attribute(layer, "Material")).toBe(null);
        expect(layerThicknessesOf(changed, layerSet)).toEqual([100]);
    });

    it("should refuse a layer whose material the model does not have, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.materials.addLayerSet({ model, name: "Exterior", layers: [{ material: "Granite", thickness: 100 }] })).toThrow("The model has no material named 'Granite'");
    });

    it("should refuse an empty list of layers", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.materials.addLayerSet({ model, name: "Nothing", layers: [] })).toThrow("A layer set needs at least one layer");
    });

    it("should refuse layers that are not a list with a TypeError", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const layers: unknown = { material: "Brick" };

        // Act & Assert
        expect(() => ifc.materials.addLayerSet({ model, name: "Odd", layers: layers as Inputs.IFC.MaterialLayerDto[] })).toThrow(TypeError);
    });

    it.each([-10, Number.NaN, Infinity])("should refuse a layer %s thick", (thickness) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.materials.addLayerSet({ model, name: "Odd", layers: [{ thickness }] })).toThrow("A layer's thickness must be zero or more");
    });

    it("should refuse a second layer set of the same name", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const changed = ifc.materials.addLayerSet({ model, name: "Exterior", layers: [{ thickness: 200 }] });

        // Act
        const error = errorFrom(() => ifc.materials.addLayerSet({ model: changed, name: "Exterior", layers: [{ thickness: 300 }] }));

        // Assert
        expect(error.message).toBe("The model already has a layer set named 'Exterior'");
    });

    it("should associate a wall of the layer set through a layer set usage of it", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const layered = ifc.materials.addLayerSet({ model, name: "Exterior", layers: [{ thickness: 250 }] });

        // Act
        const changed = ifc.walls.add({ model: layered, storey: "ground", id: "south", start: [0, 0], end: [5000, 0], layerSet: "Exterior" });

        // Assert
        const usage = materialOf(changed, firstOf(changed.byType("IfcWall").map((wall) => wall.id)));
        expect(changed.typeOf(usage)).toBe("IfcMaterialLayerSetUsage");
        expect(refOf(changed.attribute(usage, "ForLayerSet"))).toBe(layerSetNamed(changed, "Exterior"));
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.materials.addLayerSet({ model: notAModel(), name: "Exterior", layers: [{ thickness: 200 }] })).toThrow(TypeError);
    });
});
