import { composeAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { add2, scale2 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import type * as Inputs from "../api/inputs";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcTransaction } from "../model/transaction";
import { isList, isReference, ref, textValue } from "../step/values";
import type { MeasuredQuantity, MeasuredSet, ModelReader, QuantityKind } from "./build-types";
import { AGGREGATION, PROPERTY_DEFINITION, VOIDING } from "./constants";
import type { EntityWriter } from "./entity-writer";
import { areaBetween, areaWithin, boundsOf, extrudedBodyOf, profileShape, volumeBetween, withLevels } from "./measure";
import { openingsOf, readWallOpening } from "./openings";
import { absoluteFrame, objectPlacementOf } from "./placement";
import { siPerUnit } from "./project";
import { definitionsOf } from "./properties";
import { relate, relatedOf, relatingOf } from "./relationships";
import { firstItem, unwrapClippings } from "./representations";
import { clippingPlanes } from "./roof-clipping";
import { frameOf } from "./solids";
import { describeObject } from "./spatial";
import { readableWall, sideLine } from "./wall-geometry";
import { placedOnPlan } from "./math";

const QUANTITY_ENTITIES: Readonly<Record<QuantityKind, string>> = { length: "IfcQuantityLength", area: "IfcQuantityArea", volume: "IfcQuantityVolume" };
const VALUE_ATTRIBUTES: Readonly<Record<string, string>> = {
    IfcQuantityLength: "LengthValue",
    IfcQuantityArea: "AreaValue",
    IfcQuantityVolume: "VolumeValue",
    IfcQuantityCount: "CountValue",
    IfcQuantityWeight: "WeightValue",
    IfcQuantityTime: "TimeValue",
};
const MEMBER_SETS: Readonly<Record<string, string>> = { IfcColumn: "Qto_ColumnBaseQuantities", IfcBeam: "Qto_BeamBaseQuantities", IfcMember: "Qto_MemberBaseQuantities" };
const FILLING_SETS: Readonly<Record<string, string>> = { IfcDoor: "Qto_DoorBaseQuantities", IfcWindow: "Qto_WindowBaseQuantities" };
const MEASURED_TYPES = ["IfcWall", "IfcSlab", "IfcColumn", "IfcBeam", "IfcMember", "IfcDoor", "IfcWindow", "IfcOpeningElement", "IfcSpace", "IfcRoof"];
const ELEMENT_QUANTITY = "IfcElementQuantity";
const PLAIN_HALF_SPACE = "IfcHalfSpaceSolid";

function quantity(name: string, kind: QuantityKind, value: number): MeasuredQuantity {
    return { name, kind, value: Math.max(0, value) };
}

function wallSet(reader: ModelReader, wall: number, tolerance: number): MeasuredSet | undefined {
    const geometry = readableWall(reader, wall);
    const items = geometry?.body === undefined ? null : reader.attribute(geometry.body, "Items");
    if (!geometry?.body || !isList(items) || items.length !== 1) {
        return undefined;
    }
    const [solid, halfSpaces] = unwrapClippings(reader, firstItem(reader, geometry.body));
    const profile = reader.entity(solid).type === "IfcExtrudedAreaSolid" ? reader.attribute(solid, "SweptArea") : null;
    const outline = isReference(profile) ? profileShape(reader, profile.ref)?.outline : undefined;
    if (!outline || halfSpaces.some((halfSpace) => reader.entity(halfSpace).type !== PLAIN_HALF_SPACE)) {
        return undefined;
    }
    const solidFrame = composeAxes(geometry.frame, frameOf(reader, reader.attribute(solid, "Position")));
    const footprint = outline.map((point) => placedOnPlan(solidFrame, point));
    const base = geometry.frame.origin[2] + geometry.base;
    const bounds = boundsOf(base, base + geometry.height, clippingPlanes(reader, geometry, geometry.body));
    const thickness = geometry.high - geometry.low;
    const middle = sideLine(geometry, (geometry.low + geometry.high) / 2);
    const along = (distance: number): [number, number] => add2(middle.point, scale2(middle.direction, distance));
    const grossSide = areaBetween(along(0), along(geometry.length), bounds);
    const grossVolume = volumeBetween(footprint, bounds);
    const footprintArea = areaWithin(footprint, bounds.sides);
    const places = openingsOf(reader, wall).flatMap((opening) => readWallOpening(reader, geometry, objectPlacementOf(reader, wall), opening, tolerance) ?? []);
    const cutSide = places.reduce((sum, place) => sum + areaBetween(along(place.offset), along(place.offset + place.width), withLevels(bounds, base + place.sill, base + place.sill + place.height)), 0);
    const cutFootprint = places.filter((place) => place.sill <= tolerance).reduce((sum, place) => sum + place.width * thickness, 0);
    return {
        name: "Qto_WallBaseQuantities",
        quantities: [
            quantity("Length", "length", geometry.length),
            quantity("Width", "length", thickness),
            quantity("Height", "length", geometry.height),
            quantity("GrossFootprintArea", "area", footprintArea),
            quantity("NetFootprintArea", "area", footprintArea - cutFootprint),
            quantity("GrossSideArea", "area", grossSide),
            quantity("NetSideArea", "area", grossSide - cutSide),
            quantity("GrossVolume", "volume", grossVolume),
            quantity("NetVolume", "volume", grossVolume - cutSide * thickness),
        ],
    };
}

function slabSet(reader: ModelReader, slab: number): MeasuredSet | undefined {
    const extruded = extrudedBodyOf(reader, slab);
    if (!extruded) {
        return undefined;
    }
    const cut = openingsOf(reader, slab).reduce((sum, opening) => sum + (extrudedBodyOf(reader, opening)?.shape.area ?? 0), 0);
    const { area, perimeter } = extruded.shape;
    return {
        name: "Qto_SlabBaseQuantities",
        quantities: [
            quantity("Width", "length", extruded.depth),
            quantity("Perimeter", "length", perimeter),
            quantity("GrossArea", "area", area),
            quantity("NetArea", "area", area - cut),
            quantity("GrossVolume", "volume", area * extruded.depth),
            quantity("NetVolume", "volume", (area - cut) * extruded.depth),
        ],
    };
}

function memberSet(reader: ModelReader, member: number, name: string): MeasuredSet | undefined {
    const extruded = extrudedBodyOf(reader, member);
    if (!extruded) {
        return undefined;
    }
    const { area, perimeter } = extruded.shape;
    return {
        name,
        quantities: [
            quantity("Length", "length", extruded.depth),
            quantity("CrossSectionArea", "area", area),
            quantity("OuterSurfaceArea", "area", perimeter * extruded.depth),
            quantity("GrossVolume", "volume", area * extruded.depth),
            quantity("NetVolume", "volume", area * extruded.depth),
        ],
    };
}

function fillingSet(reader: ModelReader, filling: number, name: string): MeasuredSet | undefined {
    const width = reader.attribute(filling, "OverallWidth");
    const height = reader.attribute(filling, "OverallHeight");
    if (typeof width !== "number" || typeof height !== "number") {
        return undefined;
    }
    return {
        name,
        quantities: [
            quantity("Width", "length", width),
            quantity("Height", "length", height),
            quantity("Perimeter", "length", 2 * (width + height)),
            quantity("Area", "area", width * height),
        ],
    };
}

function openingSet(reader: ModelReader, opening: number, tolerance: number): MeasuredSet | undefined {
    const host = relatingOf(reader, VOIDING, opening);
    const wall = host === undefined ? undefined : readableWall(reader, host);
    const place = wall === undefined || host === undefined ? undefined : readWallOpening(reader, wall, objectPlacementOf(reader, host), opening, tolerance);
    if (!wall || !place) {
        return undefined;
    }
    return {
        name: "Qto_OpeningElementBaseQuantities",
        quantities: [quantity("Width", "length", place.width), quantity("Height", "length", place.height), quantity("Depth", "length", wall.high - wall.low)],
    };
}

function spaceSet(reader: ModelReader, space: number): MeasuredSet | undefined {
    const extruded = extrudedBodyOf(reader, space);
    if (!extruded) {
        return undefined;
    }
    const { area, perimeter } = extruded.shape;
    return {
        name: "Qto_SpaceBaseQuantities",
        quantities: [
            quantity("Height", "length", extruded.depth),
            quantity("GrossPerimeter", "length", perimeter),
            quantity("GrossFloorArea", "area", area),
            quantity("NetFloorArea", "area", area),
            quantity("GrossVolume", "volume", area * extruded.depth),
            quantity("NetVolume", "volume", area * extruded.depth),
        ],
    };
}

function roofSet(reader: ModelReader, roof: number): MeasuredSet | undefined {
    const parts = relatedOf(reader, AGGREGATION, roof);
    const measured = parts.flatMap((part) => {
        const extruded = extrudedBodyOf(reader, part);
        if (!extruded) {
            return [];
        }
        const frame = composeAxes(absoluteFrame(reader, objectPlacementOf(reader, part)), extruded.frame);
        return [{ area: extruded.shape.area, projected: extruded.shape.area * Math.abs(frame.z[2]) }];
    });
    if (!measured.length || measured.length !== parts.length) {
        return undefined;
    }
    const area = measured.reduce((sum, part) => sum + part.area, 0);
    return {
        name: "Qto_RoofBaseQuantities",
        quantities: [
            quantity("GrossArea", "area", area),
            quantity("NetArea", "area", area),
            quantity("ProjectedArea", "area", measured.reduce((sum, part) => sum + part.projected, 0)),
        ],
    };
}

function measuredSetOf(reader: ModelReader, element: number, tolerance: number): MeasuredSet | undefined {
    const type = reader.entity(element).type;
    const is = (ancestor: string): boolean => reader.schema.isSubtypeOf(type, ancestor);
    if (is("IfcWall")) {
        return wallSet(reader, element, tolerance);
    }
    if (is("IfcSlab")) {
        return slabSet(reader, element);
    }
    const member = Object.keys(MEMBER_SETS).find(is);
    if (member !== undefined) {
        return memberSet(reader, element, MEMBER_SETS[member]!);
    }
    const filling = Object.keys(FILLING_SETS).find(is);
    if (filling !== undefined) {
        return fillingSet(reader, element, FILLING_SETS[filling]!);
    }
    if (is("IfcOpeningElement")) {
        return openingSet(reader, element, tolerance);
    }
    if (is("IfcSpace")) {
        return spaceSet(reader, element);
    }
    return is("IfcRoof") ? roofSet(reader, element) : undefined;
}

function scales(model: ModelSnapshot): Readonly<Record<QuantityKind, number>> {
    const metres = siPerUnit(model, "LENGTHUNIT");
    return { length: 1, area: metres * metres / siPerUnit(model, "AREAUNIT"), volume: metres * metres * metres / siPerUnit(model, "VOLUMEUNIT") };
}

function replaceSet(tx: IfcTransaction, writer: EntityWriter, element: number, set: MeasuredSet, scale: Readonly<Record<QuantityKind, number>>): void {
    for (const user of tx.referencesTo(element)) {
        const relating = tx.get(user)?.type === PROPERTY_DEFINITION.relationship ? tx.attribute(user, PROPERTY_DEFINITION.relating) : null;
        if (!isReference(relating) || tx.entity(relating.ref).type !== ELEMENT_QUANTITY || tx.attribute(relating.ref, "Name") !== set.name) {
            continue;
        }
        const related = tx.attribute(user, PROPERTY_DEFINITION.related);
        const kept = (isList(related) ? related : []).filter((item) => !(isReference(item) && item.ref === element));
        if (kept.length) {
            tx.update(user, { [PROPERTY_DEFINITION.related]: kept });
        } else {
            tx.delete(user);
        }
        tx.dropIfUnused([relating.ref]);
    }
    const quantities = set.quantities.map((measured) => {
        const entity = QUANTITY_ENTITIES[measured.kind];
        return writer.create(entity, { Name: measured.name, [VALUE_ATTRIBUTES[entity]!]: measured.value * scale[measured.kind] });
    });
    const written = writer.create(ELEMENT_QUANTITY, { GlobalId: tx.globalId(undefined), Name: set.name, MethodOfMeasurement: "BaseQuantities", Quantities: quantities.map(ref) });
    relate(tx, writer, PROPERTY_DEFINITION, written, [element]);
}

export function computeQuantities(tx: IfcTransaction, writer: EntityWriter, model: ModelSnapshot, elements: readonly number[] | undefined, tolerance: number): void {
    const scale = scales(model);
    const targets = elements ?? [...new Set(MEASURED_TYPES.flatMap((type) => model.byType(type).map((entity) => entity.id)))];
    for (const element of targets) {
        const set = measuredSetOf(tx, element, tolerance);
        if (set) {
            replaceSet(tx, writer, element, set, scale);
        } else if (elements) {
            throw new Error(`${describeObject(tx, element)} is not an element whose base quantities this library measures`);
        }
    }
}

export function quantitiesOf(reader: ModelReader, element: number): Inputs.IFC.QuantitySetInfoDto[] {
    return definitionsOf(reader, element)
        .filter((definition) => reader.entity(definition).type === ELEMENT_QUANTITY)
        .map((set) => {
            const values: Record<string, number> = {};
            const quantities = reader.attribute(set, "Quantities");
            for (const item of isList(quantities) ? quantities : []) {
                const attribute = isReference(item) ? VALUE_ATTRIBUTES[reader.entity(item.ref).type] : undefined;
                const name = isReference(item) ? reader.attribute(item.ref, "Name") : null;
                const value = isReference(item) && attribute !== undefined ? reader.attribute(item.ref, attribute) : null;
                if (typeof name === "string" && typeof value === "number") {
                    values[name] = value;
                }
            }
            return { name: textValue(reader.attribute(set, "Name")) ?? "", quantities: values };
        });
}

