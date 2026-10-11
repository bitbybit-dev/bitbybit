import { WORLD_AXES } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, ref } from "../step/values";
import { AGGREGATION, CONTAINMENT } from "./constants";
import type { EntityWriter } from "./entity-writer";
import { objectPlacementOf } from "./placement";
import { detach, relate, relatingOf } from "./relationships";
import { containIn, containerOf, describeObject } from "./spatial";
import type { AssemblySpec } from "./build-types";

const FEATURE_ELEMENT = "IfcFeatureElement";

function containerOfParts(tx: IfcTransaction, parts: readonly number[]): number {
    const containers = new Set<number>();
    for (const part of parts) {
        if (tx.schema.isSubtypeOf(tx.entity(part).type, FEATURE_ELEMENT)) {
            throw new Error(`${describeObject(tx, part)} cuts or adds to another element, so it cannot be part of an assembly`);
        }
        const whole = relatingOf(tx, AGGREGATION, part);
        if (whole !== undefined) {
            throw new Error(`${describeObject(tx, part)} is already part of ${describeObject(tx, whole)}`);
        }
        const container = containerOf(tx, part);
        if (container === undefined) {
            throw new Error(`${describeObject(tx, part)} stands in no storey or other part of the structure, so an assembly of it has nowhere to stand`);
        }
        containers.add(container);
    }
    if (containers.size !== 1) {
        throw new Error(`The parts stand in ${containers.size} parts of the structure; an assembly stands in one`);
    }
    return [...containers][0]!;
}

export function createAssembly(tx: IfcTransaction, writer: EntityWriter, spec: AssemblySpec): number {
    const container = containerOfParts(tx, spec.parts);
    const assembly = writer.create("IfcElementAssembly", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name ?? null,
        ObjectType: spec.objectType ?? null,
        ObjectPlacement: ref(writer.localPlacement(objectPlacementOf(tx, container), WORLD_AXES)),
        PredefinedType: enumValue(spec.predefinedType),
    });
    for (const part of spec.parts) {
        detach(tx, CONTAINMENT, part);
    }
    containIn(tx, writer, container, assembly);
    relate(tx, writer, AGGREGATION, assembly, spec.parts);
    return assembly;
}
