import { describe, expect, it } from "vitest";
import { expressIdOf, groundFloor, notAModel } from "../../__test__/build-setup";
import { objectPlacementOf, onlyOf, placementOf, relatedBy } from "../../__test__/build-geometry";
import { IFCService } from "../ifc-service";

describe("IFCSpatial.addStorey", () => {
    it("should add a storey to the building at its elevation", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({ seed: "storeys" });

        // Act
        const changed = ifc.spatial.addStorey({ model, id: "first", name: "First floor", elevation: 3000 });

        // Assert
        const storey = expressIdOf(changed, "first");
        expect(changed.attribute(storey, "Name")).toBe("First floor");
        expect(changed.attribute(storey, "Elevation")).toBe(3000);
        expect(relatedBy(changed, "IfcRelAggregates", "RelatingObject", "RelatedObjects", onlyOf(changed, "IfcBuilding"))).toEqual([storey]);
    });

    it("should place the storey at its elevation relative to the building", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({ seed: "storeys" });

        // Act
        const changed = ifc.spatial.addStorey({ model, id: "first", elevation: 3000 });

        // Assert
        expect(placementOf(changed, expressIdOf(changed, "first"))).toEqual({
            relativeTo: objectPlacementOf(changed, onlyOf(changed, "IfcBuilding")),
            location: [0, 0, 3000],
            axis: null,
            refDirection: null,
        });
    });

    it("should name a storey Storey at elevation zero by default", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({ seed: "storeys" });

        // Act
        const changed = ifc.spatial.addStorey({ model });

        // Assert
        expect(ifc.spatial.storeys({ model: changed }).map((storey) => [storey.name, storey.elevation])).toEqual([["Storey", 0]]);
    });

    it("should add every storey to the one building", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.spatial.addStorey({ model, id: "first", elevation: 3000 });

        // Assert
        expect(relatedBy(changed, "IfcRelAggregates", "RelatingObject", "RelatedObjects", onlyOf(changed, "IfcBuilding")))
            .toEqual([expressIdOf(changed, "ground"), expressIdOf(changed, "first")]);
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({ seed: "storeys" });
        const size = model.size;

        // Act
        ifc.spatial.addStorey({ model, id: "first", elevation: 3000 });

        // Assert
        expect(model.size).toBe(size);
        expect(ifc.spatial.storeys({ model })).toEqual([]);
    });

    it.each([Number.NaN, Infinity, -Infinity])("should refuse an elevation of %s", (elevation) => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({ seed: "storeys" });

        // Act & Assert
        expect(() => ifc.spatial.addStorey({ model, elevation })).toThrow(RangeError);
    });

    it("should refuse a second storey with the same id", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.spatial.addStorey({ model, id: "ground", elevation: 100 })).toThrow("The model already holds an object with the id 'ground'");
    });

    it("should take as a storey's id a name the library uses for its own objects", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const withStorey = ifc.spatial.addStorey({ model, id: "building", elevation: 100 });

        // Assert
        expect(ifc.model.summary({ model: withStorey }).storeys.map((storey) => storey.globalId)).toContain(ifc.model.globalIdOf({ model: withStorey, id: "building" }));
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const ifc = new IFCService();

        // Act & Assert
        expect(() => ifc.spatial.addStorey({ model: notAModel(), id: "ground" })).toThrow(TypeError);
    });
});

describe("IFCSpatial.storeys", () => {
    it("should list the storeys lowest first whatever order they were added in", () => {
        // Arrange
        const ifc = new IFCService();
        let model = ifc.model.create({ seed: "storeys" });
        model = ifc.spatial.addStorey({ model, id: "first", name: "First", elevation: 3000 });
        model = ifc.spatial.addStorey({ model, id: "basement", name: "Basement", elevation: -2800 });
        model = ifc.spatial.addStorey({ model, id: "ground", name: "Ground", elevation: 0 });

        // Act
        const storeys = ifc.spatial.storeys({ model });

        // Assert
        expect(storeys).toEqual([
            { globalId: ifc.model.globalIdOf({ model, id: "basement" }), name: "Basement", elevation: -2800 },
            { globalId: ifc.model.globalIdOf({ model, id: "ground" }), name: "Ground", elevation: 0 },
            { globalId: ifc.model.globalIdOf({ model, id: "first" }), name: "First", elevation: 3000 },
        ]);
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const ifc = new IFCService();

        // Act & Assert
        expect(() => ifc.spatial.storeys({ model: notAModel() })).toThrow(TypeError);
    });
});
