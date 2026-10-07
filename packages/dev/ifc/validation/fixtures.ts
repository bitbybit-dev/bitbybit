import type { Base } from "@bitbybit-dev/base";
import type { IfcModel } from "../index";
import { IFC, IFCService } from "../index";
import { rehungDoor } from "../lib/__test__/hand-made";
import { OTHER_TOOL_FILE, WALL_A, WALL_B, WALL_B_PLACED_APART_FROM_ITS_AXIS } from "../lib/__test__/other-tool-file";
import type { ValidationFixture } from "./validation-types";

const CORNERS: Base.Point2[] = [[0, 0], [10, 0], [10, 8], [0, 8]];
const STOREY_HEIGHT = 3;

function house(): IfcModel {
    const ifc = new IFCService();
    let model = ifc.model.create({ name: "House", lengthUnit: IFC.lengthUnitEnum.metre, seed: "validation-house" });
    model = ifc.spatial.addStorey({ model, id: "ground", name: "Ground floor", elevation: 0 });
    model = ifc.spatial.addStorey({ model, id: "first", name: "First floor", elevation: STOREY_HEIGHT });
    model = ifc.materials.add({ model, name: "Brick", category: "brick", color: "#b5651d" });
    model = ifc.materials.add({ model, name: "Plaster", category: "plaster", color: "#f2efe6" });
    model = ifc.materials.add({ model, name: "Concrete", category: "concrete", color: "#9a9a9a" });
    model = ifc.materials.addLayerSet({ model, name: "Exterior wall", layers: [{ material: "Brick", thickness: 0.115 }, { material: "Plaster", thickness: 0.015 }] });
    model = ifc.materials.addLayerSet({ model, name: "Floor", layers: [{ material: "Concrete", thickness: 0.2 }] });
    model = ifc.doors.addType({ model, id: "door", name: "Door 900", width: 0.9, height: 2.1 });
    model = ifc.windows.addType({ model, id: "window", name: "Window 1200", width: 1.2, height: 1.4 });
    for (const storey of ["ground", "first"]) {
        for (const [i, start] of CORNERS.entries()) {
            model = ifc.walls.add({
                model, storey, id: `${storey}-wall-${i}`, name: `Wall ${i + 1}`,
                start, end: CORNERS[(i + 1) % CORNERS.length]!,
                height: STOREY_HEIGHT, layerSet: "Exterior wall", alignment: IFC.wallAlignmentEnum.right,
            });
        }
        for (let i = 0; i < CORNERS.length; i++) {
            model = ifc.walls.connect({ model, wall: `${storey}-wall-${i}`, other: `${storey}-wall-${(i + 1) % CORNERS.length}` });
        }
        model = ifc.slabs.add({ model, storey, id: `${storey}-floor`, name: "Floor", outline: CORNERS, layerSet: "Floor" });
        for (const [wall, offset] of [[0, 2], [0, 6.5], [2, 3], [1, 3]] as const) {
            model = ifc.windows.add({ model, wall: `${storey}-wall-${wall}`, windowType: "window", offset });
        }
    }
    model = ifc.doors.add({ model, wall: "ground-wall-0", doorType: "door", id: "front-door", name: "Front door", offset: 4.5 });
    for (const wall of [0, 1, 3]) {
        model = ifc.walls.clipByPlane({ model, wall: `first-wall-${wall}`, origin: [0, 0, 2.4], normal: [0, -0.2, 1] });
    }
    return model;
}

function wallsAndJoins(): IfcModel {
    const ifc = new IFCService();
    let model = ifc.model.create({ name: "Walls", seed: "validation-walls" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    model = ifc.materials.add({ model, name: "Block", category: "block" });
    model = ifc.materials.addLayerSet({ model, name: "Block 250", layers: [{ material: "Block", thickness: 250 }] });
    model = ifc.walls.addType({ model, id: "block-wall", name: "Block wall", layerSet: "Block 250", predefinedType: IFC.wallPredefinedTypeEnum.solidWall });
    model = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [8000, 0], height: 3000, wallType: "block-wall", alignment: IFC.wallAlignmentEnum.center });
    model = ifc.walls.add({ model, storey: "ground", id: "east", start: [8000, 0], end: [8000, 6000], height: 3000, thickness: 300, alignment: IFC.wallAlignmentEnum.center });
    model = ifc.walls.add({ model, storey: "ground", id: "partition", start: [4000, 0], end: [4000, 6000], height: 2700, thickness: 100, baseOffset: 100, alignment: IFC.wallAlignmentEnum.left, predefinedType: IFC.wallPredefinedTypeEnum.partitioning });
    model = ifc.walls.connect({ model, wall: "south", other: "east" });
    return ifc.walls.connect({ model, wall: "partition", other: "south" });
}

function openingsDoorsAndWindows(): IfcModel {
    const ifc = new IFCService();
    let model = ifc.model.create({ name: "Openings", seed: "validation-openings" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    model = ifc.walls.add({ model, storey: "ground", id: "wall", start: [0, 0], end: [9000, 0], height: 3000, thickness: 240 });
    model = ifc.openings.add({ model, wall: "wall", id: "hatch", name: "Service hatch", offset: 500, sill: 900, width: 600, height: 600 });
    model = ifc.doors.addType({ model, id: "double", name: "Double door", width: 1600, height: 2200, liningThickness: 60, liningDepth: 140, panelThickness: 50, operation: IFC.doorOperationEnum.doubleSwingLeft });
    model = ifc.materials.add({ model, name: "Aluminium", category: "aluminium", color: "#2e3236" });
    model = ifc.materials.add({ model, name: "Glass", category: "glass", color: "#a9c7d6", transparency: 0.7 });
    model = ifc.materials.add({ model, name: "Oak", category: "wood" });
    model = ifc.doors.addType({ model, id: "sliding", name: "Sliding door", width: 1000, height: 2100, operation: IFC.doorOperationEnum.slidingToRight, liningMaterial: "Aluminium", panelMaterial: "Glass" });
    model = ifc.windows.addType({ model, id: "window", name: "Window", width: 1200, height: 1500, frameThickness: 70, frameDepth: 90, glassThickness: 24, frameMaterial: "Oak", glassMaterial: "Glass" });
    model = ifc.doors.add({ model, wall: "wall", doorType: "double", id: "entrance", offset: 1500 });
    model = ifc.doors.add({ model, wall: "wall", doorType: "sliding", offset: 3600 });
    model = ifc.windows.add({ model, wall: "wall", windowType: "window", offset: 5200, sill: 800 });
    return ifc.windows.add({ model, wall: "wall", windowType: "window", offset: 7000 });
}

function slabs(): IfcModel {
    const ifc = new IFCService();
    let model = ifc.model.create({ name: "Slabs", lengthUnit: IFC.lengthUnitEnum.centimetre, seed: "validation-slabs" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    model = ifc.spatial.addStorey({ model, id: "roof", elevation: 300 });
    model = ifc.materials.add({ model, name: "Concrete", category: "concrete" });
    model = ifc.materials.add({ model, name: "Screed", category: "screed" });
    model = ifc.materials.addLayerSet({ model, name: "Floor", layers: [{ material: "Concrete", thickness: 20 }, { material: "Screed", thickness: 5 }] });
    model = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: [[0, 0], [1200, 0], [1200, 900], [600, 900], [600, 600], [0, 600]], holes: [[[200, 200], [400, 200], [400, 400], [200, 400]]], layerSet: "Floor" });
    return ifc.slabs.add({ model, storey: "roof", id: "roof-slab", outline: [[0, 0], [1200, 0], [1200, 900], [0, 900]], thickness: 25, topOffset: 10, predefinedType: IFC.slabPredefinedTypeEnum.roof });
}

function columnsAndBeams(): IfcModel {
    const ifc = new IFCService();
    let model = ifc.model.create({ name: "Frame", seed: "validation-frame" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    model = ifc.materials.add({ model, name: "Steel", category: "steel", color: "#8899aa" });
    model = ifc.columns.add({ model, storey: "ground", id: "c1", position: [0, 0], height: 3000, profile: IFC.profileKindEnum.rectangle, width: 300, depth: 300, material: "Steel" });
    model = ifc.columns.add({ model, storey: "ground", id: "c2", position: [6000, 0], height: 3000, profile: IFC.profileKindEnum.circle, radius: 150 });
    model = ifc.columns.add({ model, storey: "ground", id: "c3", position: [6000, 4000], height: 3000, baseOffset: 200, profile: IFC.profileKindEnum.iShape, width: 200, depth: 300, webThickness: 10, flangeThickness: 15, rotation: 30, material: "Steel" });
    model = ifc.beams.add({ model, storey: "ground", id: "b1", start: [0, 0, 3000], end: [6000, 0, 3000], profile: IFC.profileKindEnum.iShape, width: 150, depth: 300, webThickness: 8, flangeThickness: 12, material: "Steel" });
    return ifc.beams.add({ model, storey: "ground", id: "b2", start: [6000, 0, 3000], end: [6000, 4000, 2800], profile: IFC.profileKindEnum.rectangle, width: 200, depth: 250, rotation: 15 });
}

function propertiesAndAttributes(): IfcModel {
    const ifc = new IFCService();
    let model = ifc.model.create({ name: "Data", seed: "validation-data", author: "Validation", organization: "Bit By Bit Developers" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    model = ifc.materials.add({ model, name: "Timber", category: "wood" });
    model = ifc.materials.addLayerSet({ model, name: "Timber 200", layers: [{ material: "Timber", thickness: 200 }] });
    model = ifc.walls.addType({ model, id: "type", layerSet: "Timber 200", predefinedType: IFC.wallPredefinedTypeEnum.standard });
    model = ifc.walls.add({ model, storey: "ground", id: "wall", start: [0, 0], end: [5000, 0], height: 3000, wallType: "type" });
    model = ifc.properties.addSet({
        model, elements: ["wall"], name: "Pset_WallCommon",
        properties: [
            { name: "IsExternal", value: true },
            { name: "LoadBearing", value: false },
            { name: "FireRating", value: "REI 60" },
            { name: "ThermalTransmittance", value: 0.24, type: "IfcThermalTransmittanceMeasure" },
            { name: "AcousticRating", value: "52 dB", type: "IfcLabel" },
        ],
    });
    model = ifc.properties.addSet({ model, elements: ["type"], name: "Custom_Product", properties: [{ name: "Supplier", value: "Somebody" }, { name: "Count", value: 3, type: "IfcInteger" }] });
    model = ifc.model.setAttribute({ model, element: "wall", attribute: "Description", value: "A wall with data" });
    return ifc.model.setAttribute({ model, element: "wall", attribute: "Tag", value: "W-01" });
}

function otherToolFile(): IfcModel {
    const ifc = new IFCService();
    let model = ifc.model.read({ data: OTHER_TOOL_FILE });
    model = ifc.walls.connect({ model, wall: WALL_A, other: WALL_B });
    model = ifc.doors.addType({ model, id: "door", width: 0.9, height: 2.1 });
    model = ifc.doors.add({ model, wall: WALL_A, doorType: "door", id: "entrance", offset: 1 });
    return ifc.model.setAttribute({ model, element: WALL_B, attribute: "Description", value: "Load bearing" });
}

function wallPlacedApartFromItsAxis(): IfcModel {
    const ifc = new IFCService();
    let model = ifc.walls.connect({ model: ifc.model.read({ data: WALL_B_PLACED_APART_FROM_ITS_AXIS }), wall: WALL_A, other: WALL_B });
    model = ifc.doors.addType({ model, id: "door", width: 0.9, height: 2.1 });
    model = ifc.doors.add({ model, wall: WALL_B, doorType: "door", id: "back", offset: 1 });
    return ifc.walls.edit({ model, wall: WALL_B, end: [7, 5], thickness: 0.4 });
}

function carriedDoor(hang: "wall" | "reframed opening"): () => IfcModel {
    return () => {
        const { ifc, model } = rehungDoor(hang, 3000);
        const thicker = ifc.walls.edit({ model, wall: "south", thickness: 300 });
        return ifc.openings.edit({ model: thicker, opening: "front", offset: 6000 });
    };
}

function editedWalls(): IfcModel {
    const ifc = new IFCService();
    let model = ifc.model.create({ name: "Edited walls", seed: "validation-edits" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    model = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [9000, 0], height: 3000, thickness: 200, alignment: IFC.wallAlignmentEnum.right });
    model = ifc.walls.add({ model, storey: "ground", id: "east", start: [9000, 0], end: [9000, 6000], height: 3000, thickness: 200, alignment: IFC.wallAlignmentEnum.right });
    model = ifc.walls.add({ model, storey: "ground", id: "north", start: [9000, 6000], end: [0, 6000], height: 3000, thickness: 200, alignment: IFC.wallAlignmentEnum.right });
    model = ifc.walls.add({ model, storey: "ground", id: "partition", start: [4500, 6000], end: [4500, 0], height: 3000, thickness: 100 });
    model = ifc.walls.connect({ model, wall: "south", other: "east" });
    model = ifc.walls.connect({ model, wall: "east", other: "north" });
    model = ifc.walls.connect({ model, wall: "partition", other: "south" });
    model = ifc.doors.addType({ model, id: "door", width: 900, height: 2100 });
    model = ifc.doors.add({ model, wall: "south", doorType: "door", offset: 1500 });
    model = ifc.openings.add({ model, wall: "east", offset: 2000, sill: 900, width: 1200, height: 1200 });
    model = ifc.walls.edit({ model, wall: "south", start: [-1500, 0], thickness: 300, height: 3200 });
    model = ifc.walls.edit({ model, wall: "east", alignment: IFC.wallAlignmentEnum.center, baseOffset: 150 });
    model = ifc.walls.edit({ model, wall: "partition", thickness: 150 });
    return ifc.walls.disconnect({ model, wall: "north", other: "east" });
}

function removedElements(): IfcModel {
    let model = house();
    const ifc = new IFCService();
    model = ifc.model.remove({ model, element: "first-wall-3" });
    model = ifc.model.remove({ model, element: "front-door" });
    model = ifc.model.remove({ model, element: "ground-floor" });
    const groundWindow = ifc.model.elements({ model, type: "IfcWindow", storey: "ground" })[0]!;
    model = ifc.model.remove({ model, element: groundWindow.globalId });
    return model;
}

function editedOpenings(): IfcModel {
    let model = openingsDoorsAndWindows();
    const ifc = new IFCService();
    model = ifc.openings.edit({ model, opening: "hatch", offset: 8300, sill: 1200, width: 600 });
    model = ifc.openings.edit({ model, opening: "entrance", offset: 1200 });
    model = ifc.spatial.addStorey({ model, id: "first", elevation: 3000 });
    model = ifc.slabs.add({ model, storey: "first", id: "first-floor", outline: [[0, -240], [9000, -240], [9000, 5000], [0, 5000]], thickness: 220, topOffset: 50 });
    model = ifc.openings.addInSlab({ model, slab: "first-floor", id: "stair", outline: [[1000, 1000], [3500, 1000], [3500, 2200], [1000, 2200]] });
    return ifc.openings.addInSlab({ model, slab: "first-floor", id: "notch", outline: [[9000, 4000], [8000, 4000], [8000, 5000], [9000, 5000]] });
}

function editedProperties(): IfcModel {
    const ifc = new IFCService();
    let model = propertiesAndAttributes();
    model = ifc.walls.add({ model, storey: "ground", id: "second", start: [0, 3000], end: [5000, 3000], height: 3000, wallType: "type" });
    model = ifc.properties.addSet({ model, elements: ["wall", "second"], name: "Shared", properties: [{ name: "Zone", value: "A" }, { name: "Level", value: 1, type: "IfcInteger" }] });
    model = ifc.properties.setValues({ model, element: "wall", name: "Shared", properties: [{ name: "Zone", value: "B" }] });
    model = ifc.properties.setValues({ model, element: "wall", name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 90" }, { name: "Combustible", value: false }] });
    model = ifc.properties.removeValues({ model, element: "wall", name: "Pset_WallCommon", names: ["AcousticRating"] });
    model = ifc.properties.setValues({ model, element: "second", name: "Pset_WallCommon", properties: [{ name: "IsExternal", value: false }] });
    return ifc.properties.removeSet({ model, element: "type", name: "Custom_Product" });
}

function spacesAndStoreys(): IfcModel {
    const ifc = new IFCService();
    let model = house();
    model = ifc.spaces.add({ model, storey: "ground", id: "living", name: "0.01", longName: "Living room", outline: [[0, 0], [6, 0], [6, 8], [0, 8]], height: 2.7 });
    model = ifc.spaces.add({ model, storey: "ground", id: "kitchen", name: "0.02", longName: "Kitchen", outline: [[6, 0], [10, 0], [10, 8], [6, 8]], height: 2.7, predefinedType: IFC.spacePredefinedTypeEnum.internal });
    model = ifc.spaces.add({ model, storey: "first", id: "bedroom", name: "1.01", longName: "Bedroom", outline: [[0, 0], [10, 0], [10, 8], [0, 8]], height: 2.4 });
    return ifc.spatial.setElevation({ model, storey: "first", elevation: 3.2 });
}

function siteAndDoorHardware(): IfcModel {
    const ifc = new IFCService();
    let model = house();
    model = ifc.materials.add({ model, name: "Lawn", category: "soil", color: "#8fa877" });
    model = ifc.materials.add({ model, name: "Foliage", category: "vegetation", color: "#6d8a5a" });
    model = ifc.materials.add({ model, name: "Bark", category: "wood", color: "#5b4a3c" });
    model = ifc.materials.add({ model, name: "Stainless steel", category: "steel", color: "#b8bcc0" });
    model = ifc.site.addTerrain({ model, id: "terrain", outline: [[-20, -20], [30, -20], [30, 25], [-20, 25]], holes: [[[-0.13, -0.13], [10.13, -0.13], [10.13, 8.13], [-0.13, 8.13]]], depth: 0.5, material: "Lawn" });
    model = ifc.site.addTree({ model, id: "birch", species: "Silver birch", position: [-6, -7], height: 9, crownRadius: 2.2, crownMaterial: "Foliage", trunkMaterial: "Bark" });
    model = ifc.site.addTree({ model, id: "maple", position: [16, 12], height: 7 });
    model = ifc.doors.addType({ model, id: "entrance", name: "Entrance door", width: 1.1, height: 2.2, handle: IFC.doorHandleEnum.pullBar, handleMaterial: "Stainless steel" });
    model = ifc.doors.addType({ model, id: "lever", name: "Lever door", width: 0.9, height: 2.1, operation: IFC.doorOperationEnum.singleSwingRight, handle: IFC.doorHandleEnum.lever });
    model = ifc.doors.add({ model, wall: "ground-wall-2", doorType: "entrance", offset: 5 });
    return ifc.doors.add({ model, wall: "ground-wall-3", doorType: "lever", offset: 2 });
}

function membersAndMoves(): IfcModel {
    const ifc = new IFCService();
    let model = columnsAndBeams();
    model = ifc.members.add({ model, storey: "ground", id: "brace", start: [0, 0, 0], end: [6000, 0, 3000], width: 120, depth: 120, predefinedType: IFC.memberPredefinedTypeEnum.brace });
    model = ifc.members.add({ model, storey: "ground", id: "post", start: [3000, 2000, 0], end: [3000, 2000, 1100], profile: IFC.profileKindEnum.circle, radius: 40, predefinedType: IFC.memberPredefinedTypeEnum.post });
    model = ifc.model.move({ model, element: "c2", translation: [0, 500, 0], rotation: 30 });
    model = ifc.walls.add({ model, storey: "ground", id: "screen", start: [0, 6000], end: [4000, 6000], height: 2000, thickness: 150 });
    model = ifc.openings.add({ model, wall: "screen", offset: 1000, sill: 500, width: 800, height: 800 });
    return ifc.model.move({ model, element: "screen", translation: [500, 500, 0], rotation: -15 });
}

function roofedHouse(kind: IFC.roofKindEnum): () => IfcModel {
    return () => {
        const ifc = new IFCService();
        let model = ifc.model.create({ name: "Roofed house", lengthUnit: IFC.lengthUnitEnum.metre, seed: `validation-roof-${kind}` });
        model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
        const outer = 0.25;
        for (let i = 0; i < CORNERS.length; i++) {
            const gable = kind !== IFC.roofKindEnum.hip && kind !== IFC.roofKindEnum.flat && i % 2 === 1;
            model = ifc.walls.add({ model, storey: "ground", id: `wall-${i}`, start: CORNERS[i]!, end: CORNERS[(i + 1) % CORNERS.length]!, height: gable || kind === IFC.roofKindEnum.monoPitch ? 9 : STOREY_HEIGHT, thickness: outer, alignment: IFC.wallAlignmentEnum.right });
        }
        for (let i = 0; i < CORNERS.length; i++) {
            model = ifc.walls.connect({ model, wall: `wall-${i}`, other: `wall-${(i + 1) % CORNERS.length}` });
        }
        model = ifc.roofs.add({ model, storey: "ground", id: "roof", kind, pitch: 35, baseOffset: STOREY_HEIGHT, overhang: 0.4, thickness: 0.25, outline: [[-outer, -outer], [10 + outer, -outer], [10 + outer, 8 + outer], [-outer, 8 + outer]] });
        for (let i = 0; i < CORNERS.length; i++) {
            model = ifc.walls.clipByRoof({ model, wall: `wall-${i}`, roof: "roof" });
        }
        return model;
    };
}

export const VALIDATION_FIXTURES: readonly ValidationFixture[] = [
    { name: "house", build: house },
    { name: "walls-and-joins", build: wallsAndJoins },
    { name: "openings-doors-and-windows", build: openingsDoorsAndWindows },
    { name: "slabs", build: slabs },
    { name: "columns-and-beams", build: columnsAndBeams },
    { name: "properties-and-attributes", build: propertiesAndAttributes },
    { name: "other-tool-file", build: otherToolFile },
    { name: "edited-walls", build: editedWalls },
    { name: "wall-placed-apart-from-its-axis", build: wallPlacedApartFromItsAxis },
    { name: "door-hung-on-its-wall", build: carriedDoor("wall") },
    { name: "door-in-a-reframed-opening", build: carriedDoor("reframed opening") },
    { name: "removed-elements", build: removedElements },
    { name: "edited-openings", build: editedOpenings },
    { name: "edited-properties", build: editedProperties },
    { name: "spaces-and-storeys", build: spacesAndStoreys },
    { name: "members-and-moves", build: membersAndMoves },
    { name: "site-and-door-hardware", build: siteAndDoorHardware },
    { name: "gable-roof", build: roofedHouse(IFC.roofKindEnum.gable) },
    { name: "hip-roof", build: roofedHouse(IFC.roofKindEnum.hip) },
    { name: "mono-pitch-roof", build: roofedHouse(IFC.roofKindEnum.monoPitch) },
    { name: "flat-roof", build: roofedHouse(IFC.roofKindEnum.flat) },
];
