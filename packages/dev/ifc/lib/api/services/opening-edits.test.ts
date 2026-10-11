import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { modelOf } from "./service-support";
import { addRightWall, errorFrom, expressIdOf, groundFloor, oneWall, writingInto } from "../../__test__/build-setup";
import { bodySolidOf, boxOf, countOf, extrusionOf, footprintOf, refOf, relatedBy, round } from "../../__test__/build-geometry";
import { handMadeSlab, rehungDoor, wallWithNiche, wallWithOpening } from "../../__test__/hand-made";
import { CONTAINMENT } from "../../build/constants";
import { absoluteFrame } from "../../build/placement";
import { detach } from "../../build/relationships";
import type { Frame3 } from "../../build/build-types";
import type { IfcModel } from "../../model/model-types";

function worldFrameOf(model: IfcModel, id: number): Frame3 {
    const snapshot = modelOf(model);
    return absoluteFrame(snapshot, refOf(snapshot.attribute(id, "ObjectPlacement")));
}

function rounded(frame: Frame3): number[][] {
    return [frame.origin, frame.x, frame.z].map((vector) => vector.map(round));
}

function onlyOpening(model: IfcModel): number {
    return model.byType("IfcOpeningElement")[0]!.id;
}

function withHatch(offset: number, sill: number, width: number, height: number): Fixture {
    const { ifc, model } = oneWall();
    return { ifc, model: ifc.openings.add({ model, wall: "south", id: "hatch", offset, sill, width, height }) };
}

function withDoorAt(offset: number): Fixture {
    const { ifc, model: wall } = oneWall();
    const model = ifc.doors.addType({ model: wall, id: "door", width: 900, height: 2100 });
    return { ifc, model: ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset }) };
}

function floor(): Fixture {
    const { ifc, model: ground } = groundFloor();
    const model = ifc.spatial.addStorey({ model: ground, id: "first", elevation: 3000 });
    return { ifc, model: ifc.slabs.add({ model, storey: "first", id: "floor", outline: [[0, 0], [8000, 0], [8000, 6000], [0, 6000]], thickness: 250, topOffset: 50 }) };
}

describe("IFCOpenings.edit", () => {
    it("should move an opening along its wall and up it as an opening added there would be", () => {
        // Arrange
        const { ifc, model } = withHatch(2000, 500, 600, 600);
        const { model: built } = withHatch(4000, 900, 600, 600);

        // Act
        const changed = ifc.openings.edit({ model, opening: "hatch", offset: 4000, sill: 900 });

        // Assert
        expect(rounded(worldFrameOf(changed, expressIdOf(changed, "hatch")))).toEqual(rounded(worldFrameOf(built, expressIdOf(built, "hatch"))));
    });

    it("should resize an empty opening as an opening added that size would be", () => {
        // Arrange
        const { ifc, model } = withHatch(2000, 500, 600, 600);
        const { model: built } = withHatch(2000, 500, 1200, 900);

        // Act
        const changed = ifc.openings.edit({ model, opening: "hatch", width: 1200, height: 900 });

        // Assert
        expect(boxOf(changed, bodySolidOf(changed, expressIdOf(changed, "hatch")))).toEqual(boxOf(built, bodySolidOf(built, expressIdOf(built, "hatch"))));
    });

    it("should move a door given by its own id, with the opening it is in", () => {
        // Arrange
        const { ifc, model } = withDoorAt(1000);
        const { model: built } = withDoorAt(6000);

        // Act
        const changed = ifc.openings.edit({ model, opening: "front", offset: 6000 });

        // Assert
        expect(rounded(worldFrameOf(changed, expressIdOf(changed, "front")))).toEqual(rounded(worldFrameOf(built, expressIdOf(built, "front"))));
        expect(rounded(worldFrameOf(changed, onlyOpening(changed)))).toEqual(rounded(worldFrameOf(built, onlyOpening(built))));
    });

    it("should move a door hung on its wall's placement, and one in an opening another tool framed otherwise, as a door added there", () => {
        // Arrange
        const { model: built } = withDoorAt(6000);
        const fixtures = [rehungDoor("wall", 1000), rehungDoor("reframed opening", 1000)];

        // Act
        const changed = fixtures.map(({ ifc, model }) => ifc.openings.edit({ model, opening: "front", offset: 6000 }));

        // Assert
        const framesOf = (model: IfcModel): number[][][] => [rounded(worldFrameOf(model, expressIdOf(model, "front"))), rounded(worldFrameOf(model, onlyOpening(model))), boxOf(model, bodySolidOf(model, onlyOpening(model)))];
        expect(changed.map(framesOf)).toEqual([framesOf(built), framesOf(built)]);
    });

    it("should move a door that shares its opening's placement once, with the opening", () => {
        // Arrange
        const { model: built } = withDoorAt(6000);
        const { ifc, model } = rehungDoor("opening's own placement", 1000);

        // Act
        const changed = ifc.openings.edit({ model, opening: "front", offset: 6000 });

        // Assert
        const opening = rounded(worldFrameOf(changed, onlyOpening(changed)));
        expect([rounded(worldFrameOf(changed, expressIdOf(changed, "front"))), opening]).toEqual([opening, rounded(worldFrameOf(built, onlyOpening(built)))]);
    });

    it("should refuse to move an opening whose door hangs on its storey", () => {
        // Arrange
        const { ifc, model } = rehungDoor("storey", 1000);

        // Act
        const error = errorFrom(() => ifc.openings.edit({ model, opening: "front", offset: 6000 }));

        // Assert
        expect(error.message).toContain("is not an opening this library can move");
    });

    it("should refuse to resize an opening a door is in", () => {
        // Arrange
        const { ifc, model } = withDoorAt(1000);

        // Act
        const error = errorFrom(() => ifc.openings.edit({ model, opening: "front", width: 1200 }));

        // Assert
        expect(error.message).toContain("takes its size from the door or window in it");
    });

    it("should refuse to move an opening off its wall's end", () => {
        // Arrange
        const { ifc, model } = withHatch(2000, 500, 600, 600);

        // Act
        const error = errorFrom(() => ifc.openings.edit({ model, opening: "hatch", offset: 9800 }));

        // Assert
        expect(error.message).toBe("The opening from 9800 to 10400 does not fit along the wall, which is 10000 long");
    });

    it("should refuse an opening of no width", () => {
        // Arrange
        const { ifc, model } = withHatch(2000, 500, 600, 600);

        // Act
        const error = errorFrom(() => ifc.openings.edit({ model, opening: "hatch", width: 0 }));

        // Assert
        expect(error.message).toBe("An opening needs a width and a height of more than zero, got 0 by 600");
    });

    it("should refuse an element that is neither an opening nor a door or window in one", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const error = errorFrom(() => ifc.openings.edit({ model, opening: "south", offset: 100 }));

        // Assert
        expect(error.message).toContain("is neither an opening nor a door or window in one");
    });

    it("should refuse an opening that is not in a wall", () => {
        // Arrange
        const { ifc, model: slab } = floor();
        const model = ifc.openings.addInSlab({ model: slab, slab: "floor", id: "stair", outline: [[1000, 1000], [3000, 1000], [3000, 2000], [1000, 2000]] });

        // Act
        const error = errorFrom(() => ifc.openings.edit({ model, opening: "stair", offset: 100 }));

        // Assert
        expect(error.message).toContain("is not an opening in a wall");
    });

    it("should refuse to move a niche, which stops inside its wall", () => {
        // Arrange
        const { ifc, model } = wallWithNiche();

        // Act
        const error = errorFrom(() => ifc.openings.edit({ model, opening: "niche", offset: 4000 }));

        // Assert
        expect(error.message).toContain("is not an opening this library can move");
    });

    it("should refuse an opening whose shape it cannot read", () => {
        // Arrange
        const { ifc, model } = wallWithOpening("circle", "wall");

        // Act
        const error = errorFrom(() => ifc.openings.edit({ model, opening: "odd", offset: 100 }));

        // Assert
        expect(error.message).toContain("is not an opening this library can move");
    });
});

describe("IFCOpenings.addInSlab", () => {
    it("should cut an outline through a slab's whole thickness, placed on the slab", () => {
        // Arrange
        const { ifc, model } = floor();

        // Act
        const changed = ifc.openings.addInSlab({ model, slab: "floor", id: "stair", outline: [[1000, 1000], [3000, 1000], [3000, 2000], [1000, 2000]] });

        // Assert
        const opening = expressIdOf(changed, "stair");
        const extrusion = extrusionOf(changed, opening);
        expect(footprintOf(changed, opening)).toEqual([[1000, 1000], [3000, 1000], [3000, 2000], [1000, 2000]]);
        expect([extrusion.direction, extrusion.depth]).toEqual([[0, 0, -1], 250 * 1.5]);
        expect(worldFrameOf(changed, opening).origin).toEqual([0, 0, 3050 + 250 * 0.25]);
        expect(relatedBy(changed, "IfcRelVoidsElement", "RelatingBuildingElement", "RelatedOpeningElement", expressIdOf(changed, "floor"))).toEqual([opening]);
    });

    it("should cut a notch whose outline runs along the slab's edge", () => {
        // Arrange
        const { ifc, model } = floor();

        // Act
        const changed = ifc.openings.addInSlab({ model, slab: "floor", outline: [[0, 0], [2000, 0], [2000, 1000], [0, 1000]] });

        // Assert
        expect(countOf(changed, "IfcOpeningElement")).toBe(1);
    });

    it("should refuse an outline that reaches outside the slab", () => {
        // Arrange
        const { ifc, model } = floor();

        // Act
        const error = errorFrom(() => ifc.openings.addInSlab({ model, slab: "floor", outline: [[7000, 5000], [9000, 5000], [9000, 7000], [7000, 7000]] }));

        // Assert
        expect(error.message).toMatch(/^The opening's outline reaches outside the IfcSlab /);
    });

    it("should refuse an outline whose corners are all on a slab whose edge one of its sides crosses", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.slabs.add({ model: ground, storey: "ground", id: "floor", outline: [[0, 0], [8000, 0], [8000, 3000], [3000, 3000], [3000, 6000], [0, 6000]], thickness: 250 });

        // Act
        const error = errorFrom(() => ifc.openings.addInSlab({ model, slab: "floor", outline: [[2000, 5000], [7000, 1000], [7000, 2500]] }));

        // Assert
        expect(error.message).toMatch(/^The opening's outline reaches outside the IfcSlab /);
    });

    it("should check an outline against the outer edge of a slab with holes, letting it overlap a hole", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.slabs.add({ model: ground, storey: "ground", id: "floor", outline: [[0, 0], [8000, 0], [8000, 6000], [0, 6000]], holes: [[[1000, 1000], [3000, 1000], [3000, 3000], [1000, 3000]]], thickness: 250 });

        // Act
        const overlapping = ifc.openings.addInSlab({ model, slab: "floor", outline: [[2000, 2000], [4000, 2000], [4000, 4000], [2000, 4000]] });
        const error = errorFrom(() => ifc.openings.addInSlab({ model, slab: "floor", outline: [[7000, 5000], [9000, 5000], [9000, 7000], [7000, 7000]] }));

        // Assert
        expect(countOf(overlapping, "IfcOpeningElement")).toBe(1);
        expect(error.message).toMatch(/^The opening's outline reaches outside the IfcSlab /);
    });

    it("should cut a slab another tool extruded down from a frame turned over, checking the outline against the slab as it lies", () => {
        // Arrange
        const { ifc, model } = handMadeSlab("turned over");

        // Act
        const changed = ifc.openings.addInSlab({ model, slab: "slab", id: "shaft", outline: [[500, -2500], [1500, -2500], [1500, -1500], [500, -1500]] });
        const error = errorFrom(() => ifc.openings.addInSlab({ model, slab: "slab", outline: [[500, 500], [1500, 500], [1500, 1500], [500, 1500]] }));

        // Assert
        const opening = expressIdOf(changed, "shaft");
        expect([worldFrameOf(changed, opening).origin[2], extrusionOf(changed, opening).depth]).toEqual([300 + 300 * 0.25, 300 * 1.5]);
        expect(error.message).toMatch(/^The opening's outline reaches outside the IfcSlab /);
    });

    it("should cut a slab another tool extruded upwards from a rectangle, through its whole thickness", () => {
        // Arrange
        const { ifc, model } = handMadeSlab("upward");

        // Act
        const changed = ifc.openings.addInSlab({ model, slab: "slab", id: "shaft", outline: [[500, 500], [1500, 500], [1500, 1500], [500, 1500]] });

        // Assert
        const opening = expressIdOf(changed, "shaft");
        expect([worldFrameOf(changed, opening).origin[2], extrusionOf(changed, opening).depth]).toEqual([300 + 300 * 0.25, 300 * 1.5]);
    });

    it("should cut a round slab whose outline is no polyline without checking the opening against it", () => {
        // Arrange
        const { ifc, model } = handMadeSlab("round");

        // Act
        const changed = ifc.openings.addInSlab({ model, slab: "slab", outline: [[1500, 1000], [2500, 1000], [2500, 2000], [1500, 2000]] });

        // Assert
        expect(countOf(changed, "IfcOpeningElement")).toBe(1);
    });

    it("should take the outline of a slab no storey contains in the building's plan", () => {
        // Arrange
        const { ifc, model: slab } = handMadeSlab("upward");
        const { tx } = writingInto(slab);
        detach(tx, CONTAINMENT, expressIdOf(slab, "slab"));
        const model = tx.commit();

        // Act
        const changed = ifc.openings.addInSlab({ model, slab: "slab", id: "shaft", outline: [[500, 500], [1500, 500], [1500, 1500], [500, 1500]] });

        // Assert
        expect(footprintOf(changed, expressIdOf(changed, "shaft"))).toEqual([[500, 500], [1500, 500], [1500, 1500], [500, 1500]]);
    });

    it.each([
        ["tilted", "is not level, so this library does not cut it"],
        ["slanted", "is not extruded straight up or down"],
        ["block", "has a body this library does not cut: an IfcBlock"],
        ["boxed", "has no Body representation to cut"],
    ] as const)("should refuse a %s slab", (kind, message) => {
        // Arrange
        const { ifc, model } = handMadeSlab(kind);

        // Act
        const error = errorFrom(() => ifc.openings.addInSlab({ model, slab: "slab", outline: [[500, 500], [1500, 500], [1500, 1500], [500, 1500]] }));

        // Assert
        expect(error.message).toContain(message);
    });

    it("should take a slab's openings with it when the slab is removed", () => {
        // Arrange
        const { ifc, model: slab } = floor();
        const model = ifc.openings.addInSlab({ model: slab, slab: "floor", outline: [[1000, 1000], [3000, 1000], [3000, 2000], [1000, 2000]] });

        // Act
        const changed = ifc.model.remove({ model, element: "floor" });

        // Assert
        expect([countOf(changed, "IfcSlab"), countOf(changed, "IfcOpeningElement"), countOf(changed, "IfcRelVoidsElement")]).toEqual([0, 0, 0]);
    });

    it("should leave a slab's opening out of its storey's elements, as IFC relates it to the slab alone", () => {
        // Arrange
        const { ifc, model: slab } = floor();
        const model = ifc.openings.addInSlab({ model: slab, slab: "floor", id: "stair", outline: [[1000, 1000], [3000, 1000], [3000, 2000], [1000, 2000]] });
        const wall = addRightWall(ifc, model, "south", [0, 0], [8000, 0], "first");

        // Act
        const elements = ifc.model.elements({ model: wall, type: "IfcElement", storey: "first" }).map((element) => element.type);

        // Assert
        expect(elements.sort()).toEqual(["IfcSlab", "IfcWall"]);
    });
});
