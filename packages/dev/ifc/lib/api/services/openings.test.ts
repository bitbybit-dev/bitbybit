import { describe, expect, it } from "vitest";
import { addCentredWall, addRightWall, expressIdOf, groundFloor, notAModel, oneWall } from "../../__test__/build-setup";
import { countOf, enumOf, extrusionOf, objectPlacementOf, placementOf, refOf, relatedBy, sweptAreaOf } from "../../__test__/build-geometry";

describe("IFCOpenings.add", () => {
    it("should place the opening its offset along the wall, a quarter of the thickness proud of the face, at its sill", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.openings.add({ model, wall: "south", id: "hatch", offset: 1500, sill: 300, width: 1200, height: 900 });

        // Assert
        expect(placementOf(changed, expressIdOf(changed, "hatch"))).toEqual({
            relativeTo: objectPlacementOf(changed, expressIdOf(changed, "south")),
            location: [1500, 50, 300],
            axis: null,
            refDirection: null,
        });
    });

    it("should place the opening from the far face of a centred wall", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = addCentredWall(ifc, ground, "inner", [0, 0], [6000, 0], 200);

        // Act
        const changed = ifc.openings.add({ model, wall: "inner", id: "pass" });

        // Assert
        expect(placementOf(changed, expressIdOf(changed, "pass")).location).toEqual([1000, 150, 0]);
    });

    it("should extrude the opening's rectangle back through the whole wall and a margin on each side", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.openings.add({ model, wall: "south", id: "hatch", width: 1200, height: 900 });

        // Assert
        const opening = expressIdOf(changed, "hatch");
        const profile = sweptAreaOf(changed, opening);
        const profilePosition = refOf(changed.attribute(profile, "Position"));
        expect(changed.typeOf(profile)).toBe("IfcRectangleProfileDef");
        expect([changed.attribute(profile, "XDim"), changed.attribute(profile, "YDim")]).toEqual([1200, 900]);
        expect(changed.attribute(refOf(changed.attribute(profilePosition, "Location")), "Coordinates")).toEqual([600, 450]);
        expect(extrusionOf(changed, opening)).toEqual({
            position: { location: [0, 0, 0], axis: [0, -1, 0], refDirection: [1, 0, 0] },
            direction: [0, 0, 1],
            depth: 300,
        });
    });

    it("should make the opening void the wall", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.openings.add({ model, wall: "south", id: "hatch" });

        // Assert
        expect(relatedBy(changed, "IfcRelVoidsElement", "RelatingBuildingElement", "RelatedOpeningElement", expressIdOf(changed, "south")))
            .toEqual([expressIdOf(changed, "hatch")]);
    });

    it("should mark the element an opening and give it the name it was given", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.openings.add({ model, wall: "south", id: "hatch", name: "Service hatch" });

        // Assert
        const opening = expressIdOf(changed, "hatch");
        expect(changed.typeOf(opening)).toBe("IfcOpeningElement");
        expect(changed.attribute(opening, "Name")).toBe("Service hatch");
        expect(enumOf(changed.attribute(opening, "PredefinedType"))).toBe("OPENING");
    });

    it("should cut a 1000 by 2000 opening 1000 from the start by default", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.openings.add({ model, wall: "south", id: "pass" });

        // Assert
        const opening = expressIdOf(changed, "pass");
        const profile = sweptAreaOf(changed, opening);
        expect(placementOf(changed, opening).location).toEqual([1000, 50, 0]);
        expect([changed.attribute(profile, "XDim"), changed.attribute(profile, "YDim")]).toEqual([1000, 2000]);
    });

    it("should leave the opening out of the storey, since the wall it voids is in it", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.openings.add({ model, wall: "south", id: "pass" });

        // Assert
        expect(ifc.model.element({ model: changed, element: "pass" }).storey).toBe("");
    });

    it("should keep the opening in its wall when the wall is joined", () => {
        // Arrange
        const { ifc, model: walled } = oneWall();
        let model = addRightWall(ifc, walled, "east", [10000, 0], [10000, 8000]);
        model = ifc.openings.add({ model, wall: "south", id: "pass", offset: 9000 });

        // Act
        const changed = ifc.walls.connect({ model, wall: "south", other: "east" });

        // Assert
        expect(relatedBy(changed, "IfcRelVoidsElement", "RelatingBuildingElement", "RelatedOpeningElement", expressIdOf(changed, "south")))
            .toEqual([expressIdOf(changed, "pass")]);
        expect(placementOf(changed, expressIdOf(changed, "pass")).relativeTo).toBe(objectPlacementOf(changed, expressIdOf(changed, "south")));
    });

    it("should fit an opening that reaches exactly to the wall's end", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.openings.add({ model, wall: "south", id: "end", offset: 9000, width: 1000 });

        // Assert
        expect(countOf(changed, "IfcOpeningElement")).toBe(1);
    });

    it("should refuse an opening that runs past the wall's end", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.openings.add({ model, wall: "south", offset: 9500, width: 1000 })).toThrow("does not fit along the wall, which is 10000 long");
    });

    it("should refuse an opening that starts before the wall's start", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.openings.add({ model, wall: "south", offset: -100, width: 1000 })).toThrow("does not fit along the wall");
    });

    it.each([[0, 1000], [1000, 0], [-500, 1000]])("should refuse an opening %s wide and %s high", (width, height) => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.openings.add({ model, wall: "south", width, height })).toThrow("An opening needs a width and a height of more than zero");
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        ifc.openings.add({ model, wall: "south", id: "pass" });

        // Assert
        expect(countOf(model, "IfcOpeningElement")).toBe(0);
        expect(countOf(model, "IfcRelVoidsElement")).toBe(0);
    });

    it("should refuse a wall the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.openings.add({ model, wall: "garden" })).toThrow("The model has no wall 'garden'");
    });

    it("should refuse an id that names something other than a wall", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.openings.add({ model, wall: "ground" })).toThrow("'ground' is an IfcBuildingStorey, not a wall");
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.openings.add({ model: notAModel(), wall: "south" })).toThrow(TypeError);
    });
});
