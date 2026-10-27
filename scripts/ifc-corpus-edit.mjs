const WALL_TYPES = new Set(["IfcWall", "IfcWallStandardCase"]);
const MOVED_TYPES = ["IfcColumn", "IfcBeam", "IfcMember", "IfcFurnishingElement", "IfcBuildingElementProxy"];
const REMOVED_TYPES = ["IfcFurnishingElement", "IfcBuildingElementProxy", "IfcCovering", "IfcRailing", "IfcMember"];
const WALLS_TRIED = 50;
const DOOR_AT = 1 / 3;
const CLIP_AT = 0.8;
const TALLER = 1.1;
const STOREY_ABOVE_MILLIMETRES = 3000;
const NEW_WALL_MILLIMETRES = 4000;
const MOVE_MILLIMETRES = 100;

function attempt(edits, name, model, run) {
    try {
        const changed = run(model);
        edits.push({ name });
        return changed;
    } catch (error) {
        edits.push({ name, refused: error instanceof Error ? error.message : String(error) });
        return model;
    }
}

function editableWall(ifc, model, elements) {
    for (const element of elements.filter((candidate) => WALL_TYPES.has(candidate.type)).slice(0, WALLS_TRIED)) {
        try {
            return { wall: element.globalId, parameters: ifc.walls.parameters({ model, wall: element.globalId }) };
        } catch {
            continue;
        }
    }
    return undefined;
}

function firstOf(elements, types, except) {
    return types.map((type) => elements.find((element) => element.type === type && !except.includes(element.globalId))).find((element) => element !== undefined);
}

export function editForValidation(ifc, start, millimetresPerUnit) {
    const edits = [];
    const baseline = start.editable ? start : attempt(edits, "upgrade to IFC4", start, (model) => ifc.model.upgradeToIfc4({ model }));
    if (!baseline.editable) {
        return { baseline, edited: baseline, edits };
    }
    const inUnits = (millimetres) => millimetres / millimetresPerUnit;
    const elements = ifc.model.elements({ model: baseline, type: "IfcElement" });
    const first = elements[0];
    const found = editableWall(ifc, baseline, elements);
    const moved = firstOf(elements, MOVED_TYPES, [first?.globalId, found?.wall]);
    const removed = firstOf(elements, REMOVED_TYPES, [first?.globalId, found?.wall, moved?.globalId]);
    const storeys = ifc.spatial.storeys({ model: baseline });
    const top = storeys.reduce((highest, storey) => Math.max(highest, storey.elevation), 0);
    let model = baseline;
    if (first !== undefined) {
        model = attempt(edits, "attribute", model, (current) => ifc.model.setAttribute({ model: current, element: first.globalId, attribute: "Description", value: "Edited by the corpus lane" }));
        model = attempt(edits, "property set", model, (current) => ifc.properties.addSet({ model: current, elements: [first.globalId], name: "Corpus_Edit", properties: [{ name: "Checked", value: true }, { name: "Count", value: 1, type: "IfcInteger" }] }));
    }
    if (found !== undefined) {
        const { wall, parameters } = found;
        const length = Math.hypot(parameters.end[0] - parameters.start[0], parameters.end[1] - parameters.start[1]);
        model = attempt(edits, "door", model, (current) => ifc.doors.add({ model: ifc.doors.addType({ model: current, id: "corpus-door" }), wall, doorType: "corpus-door", id: "corpus-entrance", offset: length * DOOR_AT }));
        model = attempt(edits, "wall height", model, (current) => ifc.walls.edit({ model: current, wall, height: parameters.height * TALLER }));
        model = attempt(edits, "clipping", model, (current) => ifc.walls.clipByPlane({ model: current, wall, origin: [parameters.start[0], parameters.start[1], parameters.baseOffset + parameters.height * CLIP_AT] }));
    }
    model = attempt(edits, "storey and wall", model, (current) => {
        const storey = ifc.spatial.addStorey({ model: current, id: "corpus-storey", name: "Corpus storey", elevation: top + inUnits(STOREY_ABOVE_MILLIMETRES) });
        return ifc.walls.add({ model: storey, storey: "corpus-storey", id: "corpus-wall", start: [0, 0], end: [inUnits(NEW_WALL_MILLIMETRES), 0] });
    });
    if (moved !== undefined) {
        model = attempt(edits, "move", model, (current) => ifc.model.move({ model: current, element: moved.globalId, translation: [inUnits(MOVE_MILLIMETRES), 0, 0], rotation: 0 }));
    }
    if (removed !== undefined) {
        model = attempt(edits, "removal", model, (current) => ifc.model.remove({ model: current, element: removed.globalId }));
    }
    return { baseline, edited: model, edits };
}
