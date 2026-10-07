import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, isList, isReference, ref } from "../step/values";
import type { DoorTypeSpec, FillingSpec, ModelReader, TypeBounds, WindowTypeSpec } from "./build-types";
import { requirePositive } from "./checks";
import { bodyContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { extrusionCorners, frameOf } from "./solids";
import { createWallOpening } from "./openings";
import { containIn, containerOf, describeObject } from "./spatial";
import { declareInProject, defineByType } from "./type-objects";

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
    const items = [
        box(writer, [0, 0, 0], [lining, spec.liningDepth, spec.height]),
        box(writer, [spec.width - lining, 0, 0], [spec.width, spec.liningDepth, spec.height]),
        box(writer, [lining, 0, spec.height - lining], [spec.width - lining, spec.liningDepth, spec.height]),
        box(writer, [lining, panelFront, 0], [spec.width - lining, panelFront + spec.panelThickness, spec.height - lining]),
    ];
    const type = writer.create("IfcDoorType", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name,
        RepresentationMaps: [ref(representationMap(writer, items))],
        PredefinedType: enumValue("DOOR"),
        OperationType: enumValue(spec.operation),
    });
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
    const items = [
        box(writer, [0, 0, 0], [frame, spec.frameDepth, spec.height]),
        box(writer, [spec.width - frame, 0, 0], [spec.width, spec.frameDepth, spec.height]),
        box(writer, [frame, 0, 0], [spec.width - frame, spec.frameDepth, frame]),
        box(writer, [frame, 0, spec.height - frame], [spec.width - frame, spec.frameDepth, spec.height]),
        box(writer, [frame, glassFront, frame], [spec.width - frame, glassFront + spec.glassThickness, spec.height - frame]),
    ];
    const type = writer.create("IfcWindowType", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name,
        RepresentationMaps: [ref(representationMap(writer, items))],
        PredefinedType: enumValue("WINDOW"),
        PartitioningType: enumValue("SINGLE_PANEL"),
    });
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
