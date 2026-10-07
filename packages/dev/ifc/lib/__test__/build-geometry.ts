import type { IfcModel } from "../model/model-types";
import type { IfcTypedValue, IfcValue } from "../step/step-types";
import { isEnumeration, isList, isReference, isTyped } from "../step/values";
import type { AxisPlacement, UnwrappedBody } from "./fixture-types";

const ROUNDING = 1e6;

export function refOf(value: IfcValue): number {
    if (!isReference(value)) {
        throw new Error(`Expected a reference, got ${JSON.stringify(value)}`);
    }
    return value.ref;
}

export function refsOf(value: IfcValue): number[] {
    if (!isList(value)) {
        throw new Error(`Expected a list of references, got ${JSON.stringify(value)}`);
    }
    return value.map(refOf);
}

export function numbersOf(value: IfcValue): number[] {
    if (!isList(value)) {
        throw new Error(`Expected a list of numbers, got ${JSON.stringify(value)}`);
    }
    return value.map((item) => {
        if (typeof item !== "number") {
            throw new Error(`Expected a number, got ${JSON.stringify(item)}`);
        }
        return item;
    });
}

export function enumOf(value: IfcValue): string {
    if (!isEnumeration(value)) {
        throw new Error(`Expected an enumeration value, got ${JSON.stringify(value)}`);
    }
    return value.enum;
}

export function typedOf(value: IfcValue): IfcTypedValue {
    if (!isTyped(value)) {
        throw new Error(`Expected a typed value, got ${JSON.stringify(value)}`);
    }
    return { type: value.type, value: value.value };
}

export function firstOf(ids: readonly number[]): number {
    const first = ids[0];
    if (first === undefined) {
        throw new Error("Expected at least one entity");
    }
    return first;
}

export function onlyOf(model: IfcModel, type: string): number {
    const found = model.byType(type);
    if (found.length !== 1) {
        throw new Error(`Expected exactly one ${type}, found ${found.length}`);
    }
    return firstOf(found.map((entity) => entity.id));
}

export function round(value: number): number {
    return Math.round(value * ROUNDING) / ROUNDING + 0;
}

export function rounded(points: readonly (readonly number[])[]): number[][] {
    return points.map((point) => point.map(round));
}

export function pointOf(model: IfcModel, point: number): number[] {
    return numbersOf(model.attribute(point, "Coordinates"));
}

export function directionOf(model: IfcModel, value: IfcValue): number[] | null {
    return isReference(value) ? numbersOf(model.attribute(value.ref, "DirectionRatios")) : null;
}

export function axisPlacementOf(model: IfcModel, axisPlacement: number): Omit<AxisPlacement, "relativeTo"> {
    return {
        location: pointOf(model, refOf(model.attribute(axisPlacement, "Location"))),
        axis: directionOf(model, model.attribute(axisPlacement, "Axis")),
        refDirection: directionOf(model, model.attribute(axisPlacement, "RefDirection")),
    };
}

export function localPlacementOf(model: IfcModel, localPlacement: number): AxisPlacement {
    const relativeTo = model.attribute(localPlacement, "PlacementRelTo");
    return {
        relativeTo: isReference(relativeTo) ? relativeTo.ref : null,
        ...axisPlacementOf(model, refOf(model.attribute(localPlacement, "RelativePlacement"))),
    };
}

export function objectPlacementOf(model: IfcModel, product: number): number {
    return refOf(model.attribute(product, "ObjectPlacement"));
}

export function placementOf(model: IfcModel, product: number): AxisPlacement {
    return localPlacementOf(model, objectPlacementOf(model, product));
}

export function representationsOf(model: IfcModel, product: number): number[] {
    const shape = refOf(model.attribute(product, "Representation"));
    return refsOf(model.attribute(shape, "Representations"));
}

export function representationNamed(model: IfcModel, product: number, identifier: string): number {
    const found = representationsOf(model, product).filter((representation) => model.attribute(representation, "RepresentationIdentifier") === identifier);
    if (found.length !== 1) {
        throw new Error(`Expected one ${identifier} representation of #${product}, found ${found.length}`);
    }
    return firstOf(found);
}

export function bodyOf(model: IfcModel, product: number): number {
    return representationNamed(model, product, "Body");
}

export function bodyItemOf(model: IfcModel, product: number): number {
    return firstOf(refsOf(model.attribute(bodyOf(model, product), "Items")));
}

export function unwrapBody(model: IfcModel, product: number): UnwrappedBody {
    const clippings: number[] = [];
    const halfSpaces: number[] = [];
    let current = bodyItemOf(model, product);
    while (model.typeOf(current) === "IfcBooleanClippingResult") {
        clippings.push(current);
        halfSpaces.unshift(refOf(model.attribute(current, "SecondOperand")));
        current = refOf(model.attribute(current, "FirstOperand"));
    }
    return { solid: current, clippings, halfSpaces };
}

export function bodySolidOf(model: IfcModel, product: number): number {
    return unwrapBody(model, product).solid;
}

export function curvePointsOf(model: IfcModel, curve: number): number[][] {
    const list = refOf(model.attribute(curve, "Points"));
    const coordinates = model.attribute(list, "CoordList");
    if (!isList(coordinates)) {
        throw new Error(`#${list} has no coordinate list`);
    }
    return coordinates.map(numbersOf);
}

export function outerCurveOf(model: IfcModel, profile: number): number[][] {
    return curvePointsOf(model, refOf(model.attribute(profile, "OuterCurve")));
}

export function innerCurvesOf(model: IfcModel, profile: number): number[][][] {
    return refsOf(model.attribute(profile, "InnerCurves")).map((curve) => curvePointsOf(model, curve));
}

export function sweptAreaOf(model: IfcModel, product: number): number {
    return refOf(model.attribute(bodySolidOf(model, product), "SweptArea"));
}

export function footprintOf(model: IfcModel, product: number): number[][] {
    return rounded(outerCurveOf(model, sweptAreaOf(model, product)));
}

export function extrusionOf(model: IfcModel, product: number): { position: Omit<AxisPlacement, "relativeTo">; direction: number[] | null; depth: IfcValue } {
    const solid = bodySolidOf(model, product);
    return {
        position: axisPlacementOf(model, refOf(model.attribute(solid, "Position"))),
        direction: directionOf(model, model.attribute(solid, "ExtrudedDirection")),
        depth: model.attribute(solid, "Depth"),
    };
}

export function axisPointsOf(model: IfcModel, product: number): number[][] {
    const axis = representationNamed(model, product, "Axis");
    return rounded(curvePointsOf(model, firstOf(refsOf(model.attribute(axis, "Items")))));
}

export function relatedBy(model: IfcModel, relationship: string, relating: string, related: string, whole: number): number[] {
    return model.byType(relationship)
        .filter((rel) => refOf(model.attribute(rel.id, relating)) === whole)
        .flatMap((rel) => {
            const parts = model.attribute(rel.id, related);
            return isList(parts) ? refsOf(parts) : [refOf(parts)];
        });
}

export function relatingOf(model: IfcModel, relationship: string, relating: string, related: string, part: number): number[] {
    return model.byType(relationship)
        .filter((rel) => {
            const parts = model.attribute(rel.id, related);
            return isList(parts) ? refsOf(parts).includes(part) : refOf(parts) === part;
        })
        .map((rel) => refOf(model.attribute(rel.id, relating)));
}

export function materialOf(model: IfcModel, object: number): number {
    return firstOf(relatingOf(model, "IfcRelAssociatesMaterial", "RelatingMaterial", "RelatedObjects", object));
}

export function layerThicknessesOf(model: IfcModel, layerSet: number): number[] {
    return refsOf(model.attribute(layerSet, "MaterialLayers")).map((layer) => {
        const thickness = model.attribute(layer, "LayerThickness");
        if (typeof thickness !== "number") {
            throw new Error(`#${layer} has no thickness`);
        }
        return thickness;
    });
}

export function countOf(model: IfcModel, type: string): number {
    return model.byType(type).length;
}

export function representationMapOf(model: IfcModel, type: number): number {
    return firstOf(refsOf(model.attribute(type, "RepresentationMaps")));
}

export function mapItemsOf(model: IfcModel, type: number): number[] {
    const representation = refOf(model.attribute(representationMapOf(model, type), "MappedRepresentation"));
    return refsOf(model.attribute(representation, "Items"));
}

export function boxOf(model: IfcModel, solid: number): number[][] {
    const profile = refOf(model.attribute(solid, "SweptArea"));
    const centre = pointOf(model, refOf(model.attribute(refOf(model.attribute(profile, "Position")), "Location")));
    const origin = pointOf(model, refOf(model.attribute(refOf(model.attribute(solid, "Position")), "Location")));
    const width = model.attribute(profile, "XDim");
    const depth = model.attribute(profile, "YDim");
    const height = model.attribute(solid, "Depth");
    if (typeof width !== "number" || typeof depth !== "number" || typeof height !== "number") {
        throw new Error(`#${solid} is not an extruded rectangle`);
    }
    const [x = 0, y = 0] = centre;
    const z = origin[2] ?? 0;
    return rounded([[x - width / 2, y - depth / 2, z], [x + width / 2, y + depth / 2, z + height]]);
}
