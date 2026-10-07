import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, composeAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type { IfcTransaction } from "../model/transaction";
import type { IfcValue } from "../step/step-types";
import type { EntityReader, ModelReader } from "./build-types";
import type { EntityWriter } from "./entity-writer";
import { isList, isReference, ref } from "../step/values";
import type { Frame3 } from "./build-types";
import { frameFrom } from "./math";

const MAX_PLACEMENT_DEPTH = 256;
const PRODUCT = "IfcProduct";
const LOCAL_PLACEMENT = "IfcLocalPlacement";

export function numbersOf(value: IfcValue, what: string): readonly number[] {
    if (!isList(value) || !value.every((item): item is number => typeof item === "number" && Number.isFinite(item))) {
        throw new Error(`${what} is not a list of finite numbers`);
    }
    return value;
}

export function pointOf(reader: EntityReader, value: IfcValue): Base.Point3 {
    if (!isReference(value)) {
        throw new Error("A point is missing");
    }
    const coordinates = numbersOf(reader.attribute(value.ref, "Coordinates"), `#${value.ref} Coordinates`);
    return [coordinates[0] ?? 0, coordinates[1] ?? 0, coordinates[2] ?? 0];
}

export function directionOf(reader: EntityReader, value: IfcValue, fallback: Base.Vector3): Base.Vector3 {
    if (!isReference(value)) {
        return fallback;
    }
    const ratios = numbersOf(reader.attribute(value.ref, "DirectionRatios"), `#${value.ref} DirectionRatios`);
    return [ratios[0] ?? 0, ratios[1] ?? 0, ratios[2] ?? 0];
}

export function axisPlacementFrame(reader: EntityReader, placement: number): Frame3 {
    const entity = reader.entity(placement);
    if (entity.type !== "IfcAxis2Placement2D" && entity.type !== "IfcAxis2Placement3D") {
        throw new Error(`#${placement} is an ${entity.type}, not an axis placement`);
    }
    const origin = pointOf(reader, reader.attribute(placement, "Location"));
    if (entity.type === "IfcAxis2Placement2D") {
        const x = directionOf(reader, reader.attribute(placement, "RefDirection"), [1, 0, 0]);
        return frameFrom(origin, [0, 0, 1], [x[0], x[1], 0]);
    }
    const z = directionOf(reader, reader.attribute(placement, "Axis"), [0, 0, 1]);
    const alongX = Math.abs(z[1]) + Math.abs(z[2]) === 0;
    const x = directionOf(reader, reader.attribute(placement, "RefDirection"), alongX ? [0, 1, 0] : [1, 0, 0]);
    return frameFrom(origin, z, x);
}

export function relativeFrame(reader: EntityReader, localPlacement: number): Frame3 {
    const relative = reader.attribute(localPlacement, "RelativePlacement");
    if (!isReference(relative)) {
        throw new Error(`#${localPlacement} has no relative placement`);
    }
    return axisPlacementFrame(reader, relative.ref);
}

export function absoluteFrame(reader: EntityReader, localPlacement: number, known?: Map<number, Frame3>): Frame3 {
    const chain: number[] = [];
    const seen = new Set<number>();
    let base = WORLD_AXES;
    for (let current: number | undefined = localPlacement; current !== undefined;) {
        const placed = known?.get(current);
        if (placed) {
            base = placed;
            break;
        }
        if (seen.has(current) || chain.length > MAX_PLACEMENT_DEPTH) {
            throw new Error(`The placement #${localPlacement} is relative to itself through #${current}`);
        }
        seen.add(current);
        if (reader.entity(current).type !== LOCAL_PLACEMENT) {
            throw new Error(`#${current} is a ${reader.entity(current).type}, which this library does not place`);
        }
        chain.unshift(current);
        const parent = reader.attribute(current, "PlacementRelTo");
        current = isReference(parent) ? parent.ref : undefined;
    }
    return chain.reduce((frame, placement) => {
        const placed = composeAxes(frame, relativeFrame(reader, placement));
        known?.set(placement, placed);
        return placed;
    }, base);
}

export function objectPlacementOf(reader: EntityReader, product: number): number {
    const placement = reader.attribute(product, "ObjectPlacement");
    if (!isReference(placement)) {
        throw new Error(`#${product} has no placement`);
    }
    return placement.ref;
}

export function parentPlacementOf(reader: EntityReader, product: number): number | undefined {
    const placement = reader.attribute(product, "ObjectPlacement");
    const parent = isReference(placement) && reader.entity(placement.ref).type === LOCAL_PLACEMENT ? reader.attribute(placement.ref, "PlacementRelTo") : null;
    return isReference(parent) ? parent.ref : undefined;
}

export function movePlacement(tx: IfcTransaction, writer: EntityWriter, placement: number, frame: Frame3): void {
    const old = tx.attribute(placement, "RelativePlacement");
    tx.update(placement, { RelativePlacement: ref(writer.placement3(frame)) });
    if (isReference(old)) {
        tx.dropIfUnused([old.ref]);
    }
}

export function productsPlacedBy(reader: ModelReader, placement: number): number[] {
    return reader.referencesTo(placement).filter((user) => {
        if (!reader.schema.isSubtypeOf(reader.entity(user).type, PRODUCT)) {
            return false;
        }
        const placed = reader.attribute(user, "ObjectPlacement");
        return isReference(placed) && placed.ref === placement;
    });
}
