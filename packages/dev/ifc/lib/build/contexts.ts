import type { IfcTransaction } from "../model/transaction";
import { enumValue, isEnumeration, isReference, ref } from "../step/values";
import type { ContextKey, ModelReader } from "./build-types";
import type { EntityWriter } from "./entity-writer";

export const BODY_CONTEXT: ContextKey = { contextType: "Model", identifier: "Body", view: "MODEL_VIEW" };
export const AXIS_CONTEXT: ContextKey = { contextType: "Plan", identifier: "Axis", view: "GRAPH_VIEW" };

const SUB_CONTEXT = "IfcGeometricRepresentationSubContext";
const known = new WeakMap<IfcTransaction, Map<ContextKey, number>>();

function parentType(reader: ModelReader, context: number): unknown {
    const parent = reader.attribute(context, "ParentContext");
    return isReference(parent) ? reader.attribute(parent.ref, "ContextType") : undefined;
}

export function findContext(reader: ModelReader, key: ContextKey): number | undefined {
    const candidates = reader.byType(SUB_CONTEXT).filter((context) => reader.attribute(context.id, "ContextIdentifier") === key.identifier);
    const exact = candidates.find((context) => {
        const view = reader.attribute(context.id, "TargetView");
        return isEnumeration(view) && view.enum === key.view && parentType(reader, context.id) === key.contextType;
    });
    return (exact ?? candidates[0])?.id;
}

function createContext(tx: IfcTransaction, writer: EntityWriter, key: ContextKey): number {
    const parents = tx.byType("IfcGeometricRepresentationContext").filter((context) => context.type === "IfcGeometricRepresentationContext");
    const parent = parents.find((context) => tx.attribute(context.id, "ContextType") === key.contextType) ?? parents.find((context) => tx.attribute(context.id, "ContextType") === BODY_CONTEXT.contextType);
    if (!parent) {
        throw new Error(`The model has no geometric representation context to hold its ${key.identifier} representations`);
    }
    return writer.create(SUB_CONTEXT, {
        ContextIdentifier: key.identifier,
        ContextType: tx.attribute(parent.id, "ContextType"),
        ParentContext: ref(parent.id),
        TargetView: enumValue(key.view),
    });
}

export function contextFor(tx: IfcTransaction, writer: EntityWriter, key: ContextKey): number {
    let contexts = known.get(tx);
    if (!contexts) {
        contexts = new Map();
        known.set(tx, contexts);
    }
    let context = contexts.get(key);
    if (context === undefined) {
        context = findContext(tx, key) ?? createContext(tx, writer, key);
        contexts.set(key, context);
    }
    return context;
}

export function bodyContext(tx: IfcTransaction, writer: EntityWriter): number {
    return contextFor(tx, writer, BODY_CONTEXT);
}

export function axisContext(tx: IfcTransaction, writer: EntityWriter): number {
    return contextFor(tx, writer, AXIS_CONTEXT);
}
