import { axesToMatrix, relativeAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type * as Inputs from "../api/inputs";
import type { Frame3 } from "../build/build-types";
import { absoluteFrame, objectPlacementOf } from "../build/placement";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcEntity } from "../step/step-types";
import { isList, isReference } from "../step/values";
import { colourOf } from "./colours";
import type { ModelRecipe } from "./geometry-types";
import { ItemConverter } from "./items";
import { RecipeBuilder } from "./recipe-builder";

const BODY = "Body";
const PRODUCT = "IfcProduct";
const VOIDS = "IfcRelVoidsElement";
const MODEL_CONTEXT = "Model";
const SUB_CONTEXT = "IfcGeometricRepresentationSubContext";
const REACH_MILLIMETRES = 1e6;
const NO_BODY = `The element has no '${BODY}' representation in a '${MODEL_CONTEXT}' context`;
const SKIPPED: Readonly<Record<string, string>> = {
    IfcOpeningElement: "is cut from the element it voids, not described on its own",
    IfcSpatialElement: "is a spatial element, which a recipe does not describe",
    IfcAnnotation: "is an annotation, which a recipe does not describe",
};

function skipReason(model: ModelSnapshot, type: string): string | undefined {
    for (const [skipped, reason] of Object.entries(SKIPPED)) {
        if (model.schema.isSubtypeOf(type, skipped)) {
            return `An ${type} ${reason}`;
        }
    }
    return undefined;
}

function isModelContext(model: ModelSnapshot, context: number): boolean {
    const own = model.attribute(context, "ContextType");
    if (typeof own === "string" || !model.schema.isSubtypeOf(model.entity(context).type, SUB_CONTEXT)) {
        return own === MODEL_CONTEXT;
    }
    const parent = model.attribute(context, "ParentContext");
    return isReference(parent) && model.attribute(parent.ref, "ContextType") === MODEL_CONTEXT;
}

function bodyOf(model: ModelSnapshot, product: number): number | undefined {
    const shape = model.attribute(product, "Representation");
    if (!isReference(shape)) {
        return undefined;
    }
    const representations = model.attribute(shape.ref, "Representations");
    for (const representation of isList(representations) ? representations : []) {
        if (!isReference(representation) || model.attribute(representation.ref, "RepresentationIdentifier") !== BODY) {
            continue;
        }
        const context = model.attribute(representation.ref, "ContextOfItems");
        if (isReference(context) && isModelContext(model, context.ref)) {
            return representation.ref;
        }
    }
    return undefined;
}

function addOpening(openings: Map<number, number[]>, model: ModelSnapshot, rel: number): void {
    const host = model.attribute(rel, "RelatingBuildingElement");
    const opening = model.attribute(rel, "RelatedOpeningElement");
    if (!isReference(host) || !isReference(opening)) {
        return;
    }
    const known = openings.get(host.ref);
    if (known) {
        known.push(opening.ref);
    } else {
        openings.set(host.ref, [opening.ref]);
    }
}

function openingsOf(model: ModelSnapshot, products: readonly IfcEntity[] | undefined): Map<number, number[]> {
    const openings = new Map<number, number[]>();
    if (products === undefined) {
        model.byType(VOIDS).forEach((rel) => addOpening(openings, model, rel.id));
        return openings;
    }
    for (const product of products) {
        const voids = model.referencesTo(product.id).filter((user) => model.schema.isSubtypeOf(model.typeOf(user) ?? "", VOIDS));
        voids.forEach((rel) => addOpening(openings, model, rel));
    }
    return openings;
}

function productsOf(model: ModelSnapshot, wanted: ReadonlySet<string> | undefined): readonly IfcEntity[] {
    if (wanted === undefined) {
        return model.byType(PRODUCT);
    }
    const ids = new Set([...wanted].flatMap((globalId) => model.globalIdOwners(globalId)));
    return [...ids].filter((id) => model.schema.isSubtypeOf(model.typeOf(id) ?? "", PRODUCT)).sort((a, b) => a - b).map((id) => model.entity(id));
}

function frameOf(model: ModelSnapshot, product: number, known: Map<number, Frame3>): Frame3 {
    return absoluteFrame(model, objectPlacementOf(model, product), known);
}

function precisionOf(model: ModelSnapshot, fallback: number): number {
    for (const context of model.byType("IfcGeometricRepresentationContext", false)) {
        const precision = model.attribute(context.id, "Precision");
        if (model.attribute(context.id, "ContextType") === MODEL_CONTEXT && typeof precision === "number" && precision > 0) {
            return precision;
        }
    }
    return fallback;
}

export function modelRecipe(model: ModelSnapshot, globalIds: readonly string[] | undefined, millimetresPerUnit: number, fallbackTolerance: number): ModelRecipe {
    const builder = new RecipeBuilder();
    const converter = new ItemConverter(model, builder, REACH_MILLIMETRES / millimetresPerUnit);
    const colours = new Map<number, number[] | undefined>();
    const frames = new Map<number, Frame3>();
    const problems: Inputs.IFC.GeometryProblemDto[] = [];
    const wanted = globalIds === undefined ? undefined : new Set(globalIds);
    const products = productsOf(model, wanted);
    const openings = openingsOf(model, wanted === undefined ? undefined : products);
    for (const product of products) {
        const globalId = model.attribute(product.id, "GlobalId");
        if (typeof globalId !== "string" || (wanted && !wanted.has(globalId))) {
            continue;
        }
        const skipped = skipReason(model, product.type);
        if (skipped !== undefined) {
            if (wanted) {
                problems.push({ globalId, type: product.type, message: skipped });
            }
            continue;
        }
        try {
            const body = bodyOf(model, product.id);
            if (body === undefined) {
                if (wanted) {
                    problems.push({ globalId, type: product.type, message: NO_BODY });
                }
                continue;
            }
            const frame = frameOf(model, product.id, frames);
            const parts = converter.parts(body);
            const cuts = (openings.get(product.id) ?? []).flatMap((opening) => {
                const openingBody = bodyOf(model, opening);
                if (openingBody === undefined) {
                    return [];
                }
                const matrix = axesToMatrix(relativeAxes(frame, frameOf(model, opening, frames)));
                return [builder.node({ op: "transform", of: converter.representation(openingBody), matrix })];
            });
            const name = model.attribute(product.id, "Name");
            const material = parts.some((part) => !part.rgba) ? colourOf(model, colours, product.id) : undefined;
            for (const part of parts) {
                const rgba = part.rgba ?? material;
                builder.root({
                    node: cuts.length ? builder.node({ op: "voids", host: part.node, openings: cuts }) : part.node,
                    matrix: axesToMatrix(frame),
                    tag: { globalId, type: product.type, name: typeof name === "string" ? name : "", ...(rgba ? { rgba: [...rgba] } : {}) },
                });
            }
        } catch (error) {
            problems.push({ globalId, type: product.type, message: error instanceof Error ? error.message : String(error) });
        }
    }
    return { recipe: builder.build(millimetresPerUnit, precisionOf(model, fallbackTolerance)), problems };
}
