import { WORLD_AXES, composeAxes, relativeAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type { Frame3 } from "../build/build-types";
import { bodyContext } from "../build/contexts";
import { planeFrame } from "../build/entity-writer";
import { absoluteFrame, axisPlacementFrame, movePlacement, relativeFrame } from "../build/placement";
import { firstItem, replaceRepresentation, representationOf } from "../build/representations";
import { enumValue, ref } from "../step/values";
import { containIn } from "../build/spatial";
import { expressIdOf, groundFloor, oneWall, writingInto } from "./build-setup";
import { bodySolidOf, objectPlacementOf, onlyOf, refOf } from "./build-geometry";
import type { Fixture } from "./fixture-types";

const OPENING_TURNED_ABOUT_ITS_MIDDLE: Frame3 = { origin: [450, -150, 1050], x: [-1, 0, 0], y: [0, -1, 0], z: [0, 0, 1] };

export function wallWithOpening(profile: "circle" | "rectangle", placedOn: "wall" | "storey"): Fixture {
    const { ifc, model } = oneWall();
    const { tx, writer } = writingInto(model);
    const wall = expressIdOf(model, "south");
    const parent = objectPlacementOf(model, expressIdOf(model, placedOn === "wall" ? "south" : "ground"));
    const placement = writer.localPlacement(parent, { ...WORLD_AXES, origin: [2000, 200, 500] });
    const section = profile === "circle"
        ? writer.create("IfcCircleProfileDef", { ProfileType: enumValue("AREA"), Radius: 300 })
        : writer.create("IfcRectangleProfileDef", { ProfileType: enumValue("AREA"), Position: ref(writer.placement2([300, 300])), XDim: 600, YDim: 600 });
    const solid = writer.extrusion(section, { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 0, 1], z: [0, -1, 0] }, 600);
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [solid]);
    const opening = writer.create("IfcOpeningElement", { GlobalId: tx.globalId("odd"), ObjectPlacement: ref(placement), Representation: ref(writer.productShape([body])) });
    writer.create("IfcRelVoidsElement", { GlobalId: tx.globalId(undefined), RelatingBuildingElement: ref(wall), RelatedOpeningElement: ref(opening) });
    return { ifc, model: tx.commit() };
}

export function wallWithNiche(): Fixture {
    const { ifc, model } = oneWall();
    const { tx, writer } = writingInto(model);
    const wall = expressIdOf(model, "south");
    const placement = writer.localPlacement(objectPlacementOf(model, wall), { ...WORLD_AXES, origin: [2000, 0, 500] });
    const section = writer.create("IfcRectangleProfileDef", { ProfileType: enumValue("AREA"), Position: ref(writer.placement2([300, 300])), XDim: 600, YDim: 600 });
    const solid = writer.extrusion(section, { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 0, 1], z: [0, -1, 0] }, 100);
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [solid]);
    const niche = writer.create("IfcOpeningElement", { GlobalId: tx.globalId("niche"), ObjectPlacement: ref(placement), Representation: ref(writer.productShape([body])), PredefinedType: enumValue("RECESS") });
    writer.create("IfcRelVoidsElement", { GlobalId: tx.globalId(undefined), RelatingBuildingElement: ref(wall), RelatedOpeningElement: ref(niche) });
    return { ifc, model: tx.commit() };
}

export function wallClippedBy(kind: "bounded" | "boxed"): Fixture {
    const { ifc, model } = oneWall();
    const { tx, writer } = writingInto(model);
    const wall = expressIdOf(model, "south");
    const plane = writer.create("IfcPlane", { Position: ref(writer.placement3(planeFrame([5000, 0, 2500], [0.2, 0, 1], [1, 0, 0]))) });
    const halfSpace = kind === "bounded"
        ? writer.create("IfcPolygonalBoundedHalfSpace", {
            BaseSurface: ref(plane),
            AgreementFlag: false,
            Position: ref(writer.placement3({ ...WORLD_AXES, origin: [0, -1000, 0] })),
            PolygonalBoundary: ref(writer.polyCurve2([[0, 0], [10000, 0], [10000, 2000], [0, 2000]], true)),
        })
        : writer.create("IfcBoxedHalfSpace", {
            BaseSurface: ref(plane),
            AgreementFlag: false,
            Enclosure: ref(writer.create("IfcBoundingBox", { Corner: ref(writer.point([0, -1000, 0])), XDim: 10000, YDim: 2000, ZDim: 5000 })),
        });
    const body = representationOf(tx, wall, "Body");
    const clipped = writer.clipping(firstItem(tx, body!), halfSpace);
    replaceRepresentation(tx, wall, body, writer.shapeRepresentation(bodyContext(tx, writer), "Body", "Clipping", [clipped]));
    return { ifc, model: tx.commit() };
}

export function handMadeSlab(kind: "upward" | "turned over" | "tilted" | "slanted" | "block" | "boxed" | "round"): Fixture {
    const { ifc, model } = groundFloor();
    const { tx, writer } = writingInto(model);
    const storey = objectPlacementOf(model, expressIdOf(model, "ground"));
    const frame = kind === "tilted" ? planeFrame([0, 0, 0], [0, 0.2, 1], [1, 0, 0]) : WORLD_AXES;
    const placement = writer.localPlacement(storey, frame);
    const rectangle = writer.create("IfcRectangleProfileDef", { ProfileType: enumValue("AREA"), Position: ref(writer.placement2([2000, 1500])), XDim: 4000, YDim: 3000 });
    const items: Record<typeof kind, () => number> = {
        upward: () => writer.extrusion(rectangle, WORLD_AXES, 300),
        "turned over": () => writer.extrusion(writer.profile({ outer: [[0, 0], [4000, 0], [4000, 3000], [0, 3000]], holes: [] }), { origin: [0, 0, 300], x: [1, 0, 0], y: [0, -1, 0], z: [0, 0, -1] }, 300),
        tilted: () => writer.extrusion(rectangle, WORLD_AXES, 300),
        slanted: () => writer.extrusion(rectangle, WORLD_AXES, 300, [0.3, 0, 1]),
        round: () => writer.extrusion(writer.create("IfcArbitraryClosedProfileDef", {
            ProfileType: enumValue("AREA"),
            OuterCurve: ref(writer.create("IfcCircle", { Position: ref(writer.placement2([2000, 1500])), Radius: 1500 })),
        }), WORLD_AXES, 300),
        block: () => writer.create("IfcBlock", { Position: ref(writer.placement3(WORLD_AXES)), XLength: 4000, YLength: 3000, ZLength: 300 }),
        boxed: () => writer.create("IfcBoundingBox", { Corner: ref(writer.point([0, 0, 0])), XDim: 4000, YDim: 3000, ZDim: 300 }),
    };
    const representation = kind === "boxed"
        ? writer.shapeRepresentation(bodyContext(tx, writer), "Box", "BoundingBox", [items[kind]()])
        : writer.shapeRepresentation(bodyContext(tx, writer), "Body", kind === "block" ? "CSG" : "SweptSolid", [items[kind]()]);
    const slab = writer.create("IfcSlab", { GlobalId: tx.globalId("slab"), ObjectPlacement: ref(placement), Representation: ref(writer.productShape([representation])) });
    containIn(tx, writer, expressIdOf(model, "ground"), slab);
    return { ifc, model: tx.commit() };
}

export function rehungDoor(hang: "storey" | "wall" | "reframed opening" | "opening's own placement", offset: number): Fixture {
    const { ifc, model: wall } = oneWall();
    const typed = ifc.doors.addType({ model: wall, id: "door", width: 900, height: 2100 });
    const model = ifc.doors.add({ model: typed, wall: "south", doorType: "door", id: "front", offset });
    const { tx, writer } = writingInto(model);
    const door = objectPlacementOf(model, expressIdOf(model, "front"));
    if (hang === "opening's own placement") {
        tx.update(expressIdOf(model, "front"), { ObjectPlacement: ref(objectPlacementOf(model, onlyOf(model, "IfcOpeningElement"))) });
        tx.dropIfUnused([door]);
    } else if (hang === "reframed opening") {
        const turn = OPENING_TURNED_ABOUT_ITS_MIDDLE;
        const opening = onlyOf(model, "IfcOpeningElement");
        const solid = bodySolidOf(model, opening);
        tx.update(solid, { Position: ref(writer.placement3(relativeAxes(turn, axisPlacementFrame(tx, refOf(tx.attribute(solid, "Position")))))) });
        movePlacement(tx, writer, door, relativeAxes(turn, relativeFrame(tx, door)));
        movePlacement(tx, writer, objectPlacementOf(model, opening), composeAxes(relativeFrame(tx, objectPlacementOf(model, opening)), turn));
    } else {
        const parent = objectPlacementOf(model, expressIdOf(model, hang === "wall" ? "south" : "ground"));
        tx.update(door, { PlacementRelTo: ref(parent), RelativePlacement: ref(writer.placement3(relativeAxes(absoluteFrame(tx, parent), absoluteFrame(tx, door)))) });
    }
    return { ifc, model: tx.commit() };
}
