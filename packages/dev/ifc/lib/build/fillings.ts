import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, isList, isReference, ref } from "../step/values";
import type { DoorTypeSpec, FillingSpec, ModelReader, TypeBounds, MaterialPart, WindowTypeSpec } from "./build-types";
import { requirePositive } from "./checks";
import { bodyContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { extrusionCorners, frameOf } from "./solids";
import { dressParts, materialsOfParts } from "./materials";
import { createWallOpening } from "./openings";
import { containIn, containerOf, describeObject } from "./spatial";
import { declareInProject, defineByType } from "./type-objects";
import * as Inputs from "../api/inputs";

const RIGHT_HINGE = "_RIGHT";
const PULL_BAR_SHARE_OF_HEIGHT = 0.45;

function box(writer: EntityWriter, min: Base.Point3, max: Base.Point3): number {
    const width = max[0] - min[0];
    const depth = max[1] - min[1];
    const profile = writer.create("IfcRectangleProfileDef", {
        ProfileType: enumValue("AREA"),
        Position: ref(writer.placement2([min[0] + width / 2, min[1] + depth / 2])),
        XDim: width,
        YDim: depth,
    });
    return writer.extrusion(profile, { ...WORLD_AXES, origin: [0, 0, min[2]] }, max[2] - min[2]);
}

function positiveSizes(sizes: Readonly<Record<string, number>>): void {
    Object.entries(sizes).forEach(([name, value]) => requirePositive(value, name));
}

function handleEdge(spec: DoorTypeSpec): number {
    const reach = spec.liningThickness + spec.hardware.inset;
    return spec.operation.endsWith(RIGHT_HINGE) ? reach : spec.width - reach;
}

function handleItems(writer: EntityWriter, spec: DoorTypeSpec, panelFront: number): number[] {
    if (spec.handle === Inputs.IFC.doorHandleEnum.none) {
        return [];
    }
    const size = spec.hardware;
    const edge = handleEdge(spec);
    const inwards = edge < spec.width / 2 ? 1 : -1;
    const outwardOf = (face: number, side: number, from: number, to: number): [number, number] => {
        const ends = [face + side * from, face + side * to];
        return [Math.min(...ends), Math.max(...ends)];
    };
    const items: number[] = [];
    for (const [face, side] of [[panelFront, -1], [panelFront + spec.panelThickness, 1]] as const) {
        if (spec.handle === Inputs.IFC.doorHandleEnum.lever) {
            const z = Math.min(size.leverHeight, spec.height - spec.liningThickness - size.leverSection);
            const [neckFrom, neckTo] = outwardOf(face, side, 0, size.leverStandoff);
            const [barFrom, barTo] = outwardOf(face, side, size.leverStandoff, size.leverStandoff + size.leverSection);
            const [x0, x1] = [edge - inwards * size.leverSection / 2, edge + inwards * size.leverLength].sort((a, b) => a - b) as [number, number];
            items.push(box(writer, [edge - size.leverSection / 2, neckFrom, z - size.leverSection / 2], [edge + size.leverSection / 2, neckTo, z + size.leverSection / 2]));
            items.push(box(writer, [x0, barFrom, z - size.leverSection / 2], [x1, barTo, z + size.leverSection / 2]));
        } else {
            const length = Math.min(size.pullBarLength, spec.height * PULL_BAR_SHARE_OF_HEIGHT);
            const middle = Math.min(size.pullBarMiddle, spec.height / 2);
            const [postFrom, postTo] = outwardOf(face, side, 0, size.pullBarStandoff);
            const [barFrom, barTo] = outwardOf(face, side, size.pullBarStandoff, size.pullBarStandoff + size.pullBarSection);
            for (const end of [-1, 1]) {
                const z = middle + end * (length / 2 - size.pullBarPostInset);
                items.push(box(writer, [edge - size.pullBarPost / 2, postFrom, z - size.pullBarPost / 2], [edge + size.pullBarPost / 2, postTo, z + size.pullBarPost / 2]));
            }
            items.push(box(writer, [edge - size.pullBarSection / 2, barFrom, middle - length / 2], [edge + size.pullBarSection / 2, barTo, middle + length / 2]));
        }
    }
    return items;
}

function representationMap(writer: EntityWriter, items: readonly number[]): number {
    const body = writer.shapeRepresentation(bodyContext(writer.tx, writer), "Body", "SweptSolid", items);
    return writer.create("IfcRepresentationMap", { MappingOrigin: ref(writer.placement3(WORLD_AXES)), MappedRepresentation: ref(body) });
}

export function createDoorType(tx: IfcTransaction, writer: EntityWriter, spec: DoorTypeSpec): number {
    positiveSizes({ width: spec.width, height: spec.height, "lining thickness": spec.liningThickness, "lining depth": spec.liningDepth, "panel thickness": spec.panelThickness });
    const lining = spec.liningThickness;
    if (2 * lining >= spec.width || lining >= spec.height || spec.panelThickness > spec.liningDepth) {
        throw new Error("The door's lining and panel do not fit inside its width, height and depth");
    }
    const panelFront = (spec.liningDepth - spec.panelThickness) / 2;
    const linings = [
        box(writer, [0, 0, 0], [lining, spec.liningDepth, spec.height]),
        box(writer, [spec.width - lining, 0, 0], [spec.width, spec.liningDepth, spec.height]),
        box(writer, [lining, 0, spec.height - lining], [spec.width - lining, spec.liningDepth, spec.height]),
    ];
    const panel = box(writer, [lining, panelFront, 0], [spec.width - lining, panelFront + spec.panelThickness, spec.height - lining]);
    const handles = handleItems(writer, spec, panelFront);
    const parts: MaterialPart[] = [
        { name: "Lining", items: linings, material: spec.liningMaterial },
        { name: "Panel", items: [panel], material: spec.panelMaterial },
        ...(handles.length ? [{ name: "Hardware", items: handles, material: spec.handleMaterial }] : []),
    ];
    const materials = materialsOfParts(tx, parts);
    const type = writer.create("IfcDoorType", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name,
        RepresentationMaps: [ref(representationMap(writer, [...linings, panel, ...handles]))],
        PredefinedType: enumValue("DOOR"),
        OperationType: enumValue(spec.operation),
    });
    dressParts(tx, writer, type, parts, materials);
    declareInProject(tx, writer, type);
    return type;
}

export function createWindowType(tx: IfcTransaction, writer: EntityWriter, spec: WindowTypeSpec): number {
    positiveSizes({ width: spec.width, height: spec.height, "frame thickness": spec.frameThickness, "frame depth": spec.frameDepth, "glass thickness": spec.glassThickness });
    const frame = spec.frameThickness;
    if (2 * frame >= spec.width || 2 * frame >= spec.height || spec.glassThickness > spec.frameDepth) {
        throw new Error("The window's frame and glass do not fit inside its width, height and depth");
    }
    const glassFront = (spec.frameDepth - spec.glassThickness) / 2;
    const frames = [
        box(writer, [0, 0, 0], [frame, spec.frameDepth, spec.height]),
        box(writer, [spec.width - frame, 0, 0], [spec.width, spec.frameDepth, spec.height]),
        box(writer, [frame, 0, 0], [spec.width - frame, spec.frameDepth, frame]),
        box(writer, [frame, 0, spec.height - frame], [spec.width - frame, spec.frameDepth, spec.height]),
    ];
    const glass = box(writer, [frame, glassFront, frame], [spec.width - frame, glassFront + spec.glassThickness, spec.height - frame]);
    const parts: MaterialPart[] = [{ name: "Framing", items: frames, material: spec.frameMaterial }, { name: "Glazing", items: [glass], material: spec.glassMaterial }];
    const materials = materialsOfParts(tx, parts);
    const type = writer.create("IfcWindowType", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name,
        RepresentationMaps: [ref(representationMap(writer, [...frames, glass]))],
        PredefinedType: enumValue("WINDOW"),
        PartitioningType: enumValue("SINGLE_PANEL"),
    });
    dressParts(tx, writer, type, parts, materials);
    declareInProject(tx, writer, type);
    return type;
}

function bodyMapOf(reader: ModelReader, type: number): number | undefined {
    const maps = reader.attribute(type, "RepresentationMaps");
    const all = (isList(maps) ? maps : []).filter(isReference).map((map) => map.ref);
    const isBody = (map: number): boolean => {
        const representation = reader.attribute(map, "MappedRepresentation");
        return isReference(representation) && reader.attribute(representation.ref, "RepresentationIdentifier") === "Body";
    };
    return all.find(isBody) ?? all[0];
}

export function typeBounds(reader: ModelReader, type: number, map: number): TypeBounds {
    const origin = frameOf(reader, reader.attribute(map, "MappingOrigin"));
    const representation = reader.attribute(map, "MappedRepresentation");
    const items = isReference(representation) ? reader.attribute(representation.ref, "Items") : null;
    const corners = (isList(items) ? items : []).filter(isReference).flatMap((item) => extrusionCorners(reader, item.ref)).map((corner) => pointToWorld(origin, corner));
    if (!corners.length) {
        throw new Error(`${describeObject(reader, type)} has no geometry this library can size, so it cannot be placed in a wall`);
    }
    const along = (axis: number): number[] => corners.map((corner) => corner[axis]!);
    return {
        min: [Math.min(...along(0)), Math.min(...along(1)), Math.min(...along(2))],
        max: [Math.max(...along(0)), Math.max(...along(1)), Math.max(...along(2))],
    };
}

export function createFilling(tx: IfcTransaction, writer: EntityWriter, kind: "IfcDoor" | "IfcWindow", spec: FillingSpec, tolerance: number): number {
    const map = bodyMapOf(tx, spec.type);
    if (map === undefined) {
        throw new Error(`${describeObject(tx, spec.type)} has no representation map`);
    }
    const { min, max } = typeBounds(tx, spec.type, map);
    const width = max[0] - min[0];
    const height = max[2] - min[2];
    const depth = max[1] - min[1];
    const opening = createWallOpening(tx, writer, { wall: spec.wall, id: undefined, name: undefined, offset: spec.offset, sill: spec.sill, width, height }, tolerance);
    const placement = writer.localPlacement(opening.placement, { ...WORLD_AXES, origin: [-min[0], opening.wallFace + (opening.thickness - depth) / 2 - min[1], -min[2]] });
    const operator = writer.create("IfcCartesianTransformationOperator3D", { LocalOrigin: ref(writer.point([0, 0, 0])) });
    const mapped = writer.create("IfcMappedItem", { MappingSource: ref(map), MappingTarget: ref(operator) });
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "MappedRepresentation", [mapped]);
    const element = writer.create(kind, {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name ?? null,
        ObjectPlacement: ref(placement),
        Representation: ref(writer.productShape([body])),
        OverallHeight: height,
        OverallWidth: width,
    });
    writer.create("IfcRelFillsElement", { GlobalId: tx.globalId(undefined), RelatingOpeningElement: ref(opening.opening), RelatedBuildingElement: ref(element) });
    const storey = containerOf(tx, spec.wall);
    if (storey !== undefined) {
        containIn(tx, writer, storey, element);
    }
    defineByType(tx, writer, element, spec.type);
    return element;
}
