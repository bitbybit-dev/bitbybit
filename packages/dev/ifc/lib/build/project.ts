import { WORLD_AXES } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { projectGlobalId, randomGlobalId } from "../model/guid";
import type { ModelSnapshot } from "../model/snapshot";
import { emptyModel } from "../model/io";
import { IfcTransaction } from "../model/transaction";
import { DERIVED, enumValue, isEnumeration, isList, isReference, isTyped, ref } from "../step/values";
import * as Inputs from "../api/inputs";
import type { MeasuredUnit, NewProject } from "./build-types";
import { AGGREGATION, DEFAULT_PRECISION_METRES, LENGTH_PREFIXES, METRES_TO_MILLIMETRES } from "./constants";
import { EntityWriter } from "./entity-writer";
import { relate } from "./relationships";

export const SCHEMA_FOR_NEW_MODELS = "IFC4";
export const DESIGN_TRANSFER_VIEW = "ViewDefinition [DesignTransferView_V1.0]";

const PREFIX_OF_UNIT: Readonly<Record<Inputs.IFC.lengthUnitEnum, string | undefined>> = {
    [Inputs.IFC.lengthUnitEnum.millimetre]: "MILLI",
    [Inputs.IFC.lengthUnitEnum.centimetre]: "CENTI",
    [Inputs.IFC.lengthUnitEnum.metre]: undefined,
};

function siUnit(writer: EntityWriter, unitType: string, name: string, prefix?: string): number {
    return writer.create("IfcSIUnit", { Dimensions: DERIVED, UnitType: enumValue(unitType), Prefix: prefix === undefined ? null : enumValue(prefix), Name: enumValue(name) });
}

export function precisionFor(unit: Inputs.IFC.lengthUnitEnum): number {
    return DEFAULT_PRECISION_METRES / metresPerUnit(PREFIX_OF_UNIT[unit]);
}

const UNIT_POWERS: Readonly<Record<MeasuredUnit, number>> = { LENGTHUNIT: 1, AREAUNIT: 2, VOLUMEUNIT: 3, PLANEANGLEUNIT: 1 };
const NAMED_UNIT = "IfcNamedUnit";
const MAX_UNIT_DEPTH = 8;

function metresPerUnit(prefix: string | undefined): number {
    return prefix === undefined ? 1 : LENGTH_PREFIXES[prefix] ?? 1;
}

export function createProject(project: NewProject): ModelSnapshot {
    const globalId = project.seed === undefined ? randomGlobalId() : projectGlobalId(project.seed);
    const tx = new IfcTransaction(emptyModel(SCHEMA_FOR_NEW_MODELS, project.header), globalId);
    const writer = new EntityWriter(tx);
    const precision = precisionFor(project.lengthUnit);
    const units = writer.create("IfcUnitAssignment", {
        Units: [
            siUnit(writer, "LENGTHUNIT", "METRE", PREFIX_OF_UNIT[project.lengthUnit]),
            siUnit(writer, "AREAUNIT", "SQUARE_METRE"),
            siUnit(writer, "VOLUMEUNIT", "CUBIC_METRE"),
            siUnit(writer, "PLANEANGLEUNIT", "RADIAN"),
        ].map(ref),
    });
    const model3d = writer.create("IfcGeometricRepresentationContext", {
        ContextType: "Model",
        CoordinateSpaceDimension: 3,
        Precision: precision,
        WorldCoordinateSystem: ref(writer.placement3(WORLD_AXES)),
        TrueNorth: ref(writer.direction([0, 1])),
    });
    const plan = writer.create("IfcGeometricRepresentationContext", {
        ContextType: "Plan",
        CoordinateSpaceDimension: 2,
        Precision: precision,
        WorldCoordinateSystem: ref(writer.placement2([0, 0])),
    });
    const subContext = (parent: number, identifier: string, type: string, view: string): number => writer.create("IfcGeometricRepresentationSubContext", {
        ContextIdentifier: identifier,
        ContextType: type,
        ParentContext: ref(parent),
        TargetView: enumValue(view),
    });
    subContext(model3d, "Body", "Model", "MODEL_VIEW");
    subContext(model3d, "Axis", "Model", "GRAPH_VIEW");
    subContext(model3d, "Box", "Model", "MODEL_VIEW");
    subContext(plan, "Axis", "Plan", "GRAPH_VIEW");
    subContext(plan, "FootPrint", "Plan", "PLAN_VIEW");
    const projectId = writer.create("IfcProject", {
        GlobalId: tx.givenGlobalId(globalId),
        Name: project.name,
        RepresentationContexts: [ref(model3d), ref(plan)],
        UnitsInContext: ref(units),
    });
    const sitePlacement = writer.localPlacement(undefined, WORLD_AXES);
    const site = writer.create("IfcSite", {
        GlobalId: tx.structureGlobalId("site"),
        Name: project.siteName,
        ObjectPlacement: ref(sitePlacement),
        CompositionType: enumValue("ELEMENT"),
    });
    const building = writer.create("IfcBuilding", {
        GlobalId: tx.structureGlobalId("building"),
        Name: project.buildingName,
        ObjectPlacement: ref(writer.localPlacement(sitePlacement, WORLD_AXES)),
        CompositionType: enumValue("ELEMENT"),
    });
    relate(tx, writer, AGGREGATION, projectId, [site]);
    relate(tx, writer, AGGREGATION, site, [building]);
    return tx.commit();
}

export function projectOf(model: ModelSnapshot): number {
    const project = model.byType("IfcProject")[0];
    if (!project) {
        throw new Error("The model has no IfcProject");
    }
    return project.id;
}

function siFactor(model: ModelSnapshot, unit: number, power: number, depth: number): number {
    if (depth > MAX_UNIT_DEPTH) {
        throw new Error(`The unit #${unit} is converted through more than ${MAX_UNIT_DEPTH} other units, or through itself`);
    }
    const entity = model.entity(unit);
    if (entity.type === "IfcSIUnit") {
        const prefix = model.attribute(unit, "Prefix");
        return metresPerUnit(isEnumeration(prefix) ? prefix.enum : undefined) ** power;
    }
    const measure = model.schema.isSubtypeOf(entity.type, "IfcConversionBasedUnit") ? model.attribute(unit, "ConversionFactor") : null;
    if (!isReference(measure)) {
        return 1;
    }
    const value = model.attribute(measure.ref, "ValueComponent");
    const base = model.attribute(measure.ref, "UnitComponent");
    const factor = isTyped(value) && typeof value.value === "number" ? value.value : 1;
    return factor * (isReference(base) ? siFactor(model, base.ref, power, depth + 1) : 1);
}

export function siPerUnit(model: ModelSnapshot, unitType: MeasuredUnit): number {
    const units = model.attribute(projectOf(model), "UnitsInContext");
    const list = isReference(units) ? model.attribute(units.ref, "Units") : null;
    for (const unit of isList(list) ? list : []) {
        if (!isReference(unit) || !model.schema.isSubtypeOf(model.entity(unit.ref).type, NAMED_UNIT)) {
            continue;
        }
        const type = model.attribute(unit.ref, "UnitType");
        if (isEnumeration(type) && type.enum === unitType) {
            return siFactor(model, unit.ref, UNIT_POWERS[unitType], 0);
        }
    }
    return 1;
}

export function millimetresPerUnit(model: ModelSnapshot): number {
    return siPerUnit(model, "LENGTHUNIT") * METRES_TO_MILLIMETRES;
}

export function radiansPerUnit(model: ModelSnapshot): number {
    return siPerUnit(model, "PLANEANGLEUNIT");
}
