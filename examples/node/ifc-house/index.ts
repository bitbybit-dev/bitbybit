import { writeFileSync } from "node:fs";
import { Base, IFC, IFCService } from "@bitbybit-dev/ifc";

const FOOTPRINT: Base.Point2[] = [[0, 0], [10000, 0], [10000, 8000], [0, 8000]];
const STOREY_HEIGHT = 3000;
const GABLE_WALL_HEIGHT = 6500;
const STOREYS = ["ground", "first"];

const ifc = new IFCService();
let model = ifc.model.create({ name: "House", seed: "ifc-house-node-example" });
model = ifc.spatial.addStorey({ model, id: "ground", name: "Ground floor", elevation: 0 });
model = ifc.spatial.addStorey({ model, id: "first", name: "First floor", elevation: STOREY_HEIGHT });

model = ifc.materials.add({ model, name: "Brick", category: "brick", color: "#b5651d" });
model = ifc.materials.add({ model, name: "Plaster", category: "plaster", color: "#f2efe6" });
model = ifc.materials.add({ model, name: "Concrete", category: "concrete", color: "#9a9a9a" });
model = ifc.materials.add({ model, name: "Tiles", category: "tile", color: "#7a2e1d" });
model = ifc.materials.addLayerSet({ model, name: "Exterior wall", layers: [{ material: "Brick", thickness: 235 }, { material: "Plaster", thickness: 15 }] });
model = ifc.materials.addLayerSet({ model, name: "Floor", layers: [{ material: "Concrete", thickness: 200 }] });
model = ifc.materials.addLayerSet({ model, name: "Roof", layers: [{ material: "Tiles", thickness: 220 }] });
model = ifc.doors.addType({ model, id: "door", name: "Door 900", width: 900, height: 2100 });
model = ifc.windows.addType({ model, id: "window", name: "Window 1200", width: 1200, height: 1400 });

for (const storey of STOREYS) {
    for (let i = 0; i < FOOTPRINT.length; i++) {
        const shortSide = i % 2 === 1;
        const gable = storey === "first" && shortSide;
        model = ifc.walls.add({
            model, storey, id: `${storey}-wall-${i}`, name: `Wall ${i + 1}`,
            start: FOOTPRINT[i], end: FOOTPRINT[(i + 1) % FOOTPRINT.length],
            height: gable ? GABLE_WALL_HEIGHT : STOREY_HEIGHT, layerSet: "Exterior wall", alignment: IFC.wallAlignmentEnum.left,
        });
    }
    for (let i = 0; i < FOOTPRINT.length; i++) {
        model = ifc.walls.connect({ model, wall: `${storey}-wall-${i}`, other: `${storey}-wall-${(i + 1) % FOOTPRINT.length}` });
    }
    model = ifc.slabs.add({ model, storey, id: `${storey}-floor`, name: "Floor", outline: FOOTPRINT, layerSet: "Floor" });
    for (const [wall, offset] of [[0, 2000], [0, 6800], [2, 3000], [1, 3400]] as const) {
        model = ifc.windows.add({ model, wall: `${storey}-wall-${wall}`, windowType: "window", offset });
    }
    model = ifc.properties.addSet({
        model, elements: FOOTPRINT.map((_, i) => `${storey}-wall-${i}`), name: "Pset_WallCommon",
        properties: [{ name: "IsExternal", value: true }, { name: "LoadBearing", value: true }],
    });
}
model = ifc.doors.add({ model, wall: "ground-wall-0", doorType: "door", id: "front-door", name: "Front door", offset: 4500 });
model = ifc.openings.addInSlab({ model, slab: "first-floor", id: "stairwell", outline: [[7000, 5000], [9750, 5000], [9750, 6200], [7000, 6200]] });

model = ifc.roofs.add({ model, storey: "first", id: "roof", name: "Roof", outline: FOOTPRINT, kind: IFC.roofKindEnum.gable, pitch: 35, baseOffset: STOREY_HEIGHT, overhang: 400, layerSet: "Roof" });
for (let i = 0; i < FOOTPRINT.length; i++) {
    model = ifc.walls.clipByRoof({ model, wall: `first-wall-${i}`, roof: "roof" });
}

model = ifc.spaces.add({ model, storey: "ground", id: "living", name: "0.01", longName: "Living room", outline: [[250, 250], [6000, 250], [6000, 7750], [250, 7750]], height: 2700 });
model = ifc.spaces.add({ model, storey: "ground", id: "kitchen", name: "0.02", longName: "Kitchen", outline: [[6000, 250], [9750, 250], [9750, 7750], [6000, 7750]], height: 2700 });
model = ifc.spaces.add({ model, storey: "first", id: "bedroom", name: "1.01", longName: "Bedroom", outline: [[250, 250], [9750, 250], [9750, 4000], [250, 4000]], height: 2500 });
model = ifc.quantities.compute({ model });

const summary = ifc.model.summary({ model });
console.log(`Wrote ${summary.entities} entities:`, summary.elementCounts);
for (const space of ifc.spaces.list({ model })) {
    console.log(`  ${space.name} ${space.longName}: ${space.area / 1e6} m2`);
}
const wallVolume = ifc.model.elements({ model, type: "IfcWall" })
    .map((wall) => ifc.quantities.get({ model, element: wall.globalId })[0]?.quantities["NetVolume"] ?? 0)
    .reduce((sum, volume) => sum + volume, 0);
console.log(`  walls: ${wallVolume.toFixed(2)} m3 of brick and plaster`);

const file = process.argv[2] ?? "house.ifc";
writeFileSync(file, ifc.model.writeBytes({ model, fileName: file }));
console.log(`Saved ${file}`);
