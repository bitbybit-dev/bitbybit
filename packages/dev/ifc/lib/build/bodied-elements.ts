import type { IfcAttributes } from "../model/model-types";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, ref } from "../step/values";
import type { ElementSpec } from "./build-types";
import { bodyContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { writeBodyItems } from "./exact-bodies";
import { associateMaterial } from "./materials";
import { objectPlacementOf } from "./placement";
import { containIn } from "./spatial";

const ELEMENT = "IfcElement";
const PREDEFINED_TYPE = "PredefinedType";
const USERDEFINED = "USERDEFINED";
const NOTDEFINED = "NOTDEFINED";

export function requireElementType(tx: IfcTransaction, type: string): string {
    const name = tx.schema.entityName(type);
    if (name === undefined || !tx.schema.isSubtypeOf(name, ELEMENT) || tx.schema.entity(name).abstract) {
        throw new Error(`'${type}' is not a kind of element the model's schema can hold; give one such as IfcBuildingElementProxy, IfcFurniture or IfcPipeFitting`);
    }
    return name;
}

export function createBodiedElement(tx: IfcTransaction, writer: EntityWriter, spec: ElementSpec): number {
    const type = requireElementType(tx, spec.type);
    const hasPredefinedType = tx.schema.entity(type).attributes.some((attribute) => attribute.name === PREDEFINED_TYPE);
    if (!hasPredefinedType && spec.predefinedType !== undefined) {
        throw new Error(`An ${type} has no predefined type to set`);
    }
    const { items, representationType } = writeBodyItems(writer, spec.body, spec.scale);
    const placement = writer.localPlacement(objectPlacementOf(tx, spec.storey), spec.frame);
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", representationType, items);
    const attributes: IfcAttributes = {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name,
        ObjectPlacement: ref(placement),
        Representation: ref(writer.productShape([body])),
        ...(spec.objectType === undefined ? {} : { ObjectType: spec.objectType }),
        ...(hasPredefinedType ? { PredefinedType: enumValue(spec.objectType === undefined ? spec.predefinedType ?? NOTDEFINED : USERDEFINED) } : {}),
    };
    const element = writer.create(type, attributes);
    containIn(tx, writer, spec.storey, element);
    if (spec.material !== undefined) {
        associateMaterial(tx, writer, [element], spec.material);
    }
    return element;
}
