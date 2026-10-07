import { resolveDto } from "@bitbybit-dev/base";
import { WORLD_AXES, vectorToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { textValue } from "../../step/values";
import { createProject, DESIGN_TRANSFER_VIEW, millimetresPerUnit, projectOf, SCHEMA_FOR_NEW_MODELS } from "../../build/project";
import { isGlobalId, keyGlobalId } from "../../model/guid";
import type { IfcModel } from "../../model/model-types";
import type { ModelSnapshot } from "../../model/snapshot";
import type { IfcFileHeader } from "../../step/step-types";
import { readModel, writeModel, writeModelBytes } from "../../model/io";
import { upgradeToIfc4 } from "../../model/upgrade";
import { DEFAULT_IMPLEMENTATION_LEVEL } from "../../step/constants";
import { isList, isReference } from "../../step/values";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { editModel, lengthTolerance, modelOf, oneOf, resolveId } from "./service-support";
import { PARALLEL_TOLERANCE, POINT3_SIZE } from "../../build/constants";
import { moveElement } from "../../build/moving";
import { removeObject } from "../../build/removal";
import { requireFinite, requirePoint } from "../../build/checks";
import { containerOf, storeyFrame, storeyOf, storeysOf } from "../../build/spatial";

const LIBRARY = "@bitbybit-dev/ifc";
const ISO_SECONDS = 19;

function headerFor(model: ModelSnapshot, resolved: Resolved.IFC.WriteModelDto<IfcModel>): IfcFileHeader {
    return { ...model.header, name: resolved.fileName, timeStamp: resolved.timeStamp ?? new Date().toISOString().slice(0, ISO_SECONDS) };
}

function containers(model: IfcModel): Map<number, number> {
    const container = new Map<number, number>();
    for (const rel of model.byType("IfcRelContainedInSpatialStructure")) {
        const structure = model.attribute(rel.id, "RelatingStructure");
        const elements = model.attribute(rel.id, "RelatedElements");
        for (const element of isList(elements) ? elements : []) {
            if (isReference(element) && isReference(structure)) {
                container.set(element.ref, structure.ref);
            }
        }
    }
    return container;
}

function infoOf(model: IfcModel, id: number, storey: number | undefined): Inputs.IFC.ElementInfoDto {
    const name = model.attribute(id, "Name");
    const storeyGlobalId = storey === undefined ? null : model.attribute(storey, "GlobalId");
    return {
        globalId: textValue(model.attribute(id, "GlobalId")) ?? "",
        type: model.typeOf(id) ?? "",
        name: typeof name === "string" ? name : "",
        storey: typeof storeyGlobalId === "string" ? storeyGlobalId : "",
    };
}

/**
 * Creates, reads, writes and inspects whole IFC models. A model is a value: every method that
 * changes one returns a new model and leaves the one it was given as it was, so a change can be
 * undone by keeping the earlier model.
 *
 * Objects are found by their GlobalId or by the id given when they were added, such as `north-wall`,
 * which the model turns into a GlobalId of its own. Storeys are in `spatial`, building elements in
 * `walls`, `slabs`, `doors` and the rest.
 * @beta
 */
export class IFCModels {

    /**
     * Starts a new IFC4 model with a project, its site and one building, ready for storeys.
     *
     * Every length later given to the model is in `lengthUnit`, millimetres by default. With a
     * `seed`, the same calls always write the same file; without one, the GlobalIds are random.
     * @param inputs - The project's name, the site and building names, the length unit and a seed
     * @returns A new model
     * @group create
     * @shortname create model
     * @drawable false
     * @example
     * ```typescript
     * let model = await bitbybit.ifc.model.create({ name: "House", seed: "house-1" });
     * model = await bitbybit.ifc.spatial.addStorey({ model, id: "ground", name: "Ground floor", elevation: 0 });
     * ```
     */
    create(inputs: Inputs.IFC.CreateModelDto): IfcModel {
        const resolved = resolveDto(Inputs.IFC.CreateModelDto, inputs) as Resolved.IFC.CreateModelDto;
        return createProject({
            name: resolved.name,
            siteName: resolved.siteName,
            buildingName: resolved.buildingName,
            lengthUnit: oneOf(resolved.lengthUnit, Inputs.IFC.lengthUnitEnum, "length unit"),
            seed: resolved.seed,
            header: {
                description: [DESIGN_TRANSFER_VIEW],
                implementationLevel: DEFAULT_IMPLEMENTATION_LEVEL,
                name: "",
                timeStamp: "",
                author: [resolved.author ?? ""],
                organization: [resolved.organization ?? ""],
                preprocessorVersion: LIBRARY,
                originatingSystem: LIBRARY,
                authorization: "",
                schemaIdentifiers: [SCHEMA_FOR_NEW_MODELS],
            },
        });
    }

    /**
     * Reads an IFC file into a model, which can then be inspected, changed and written back.
     *
     * Entities are decoded only when something asks for them, and those left unchanged are written
     * back character for character as they were read. An IFC2X3 file is read through IFC4, to be
     * shown and queried; `upgradeToIfc4` makes it editable.
     * @param inputs - The file's text or bytes
     * @returns The model the file holds
     * @group io
     * @shortname read ifc
     * @drawable false
     * @example
     * ```typescript
     * const model = await bitbybit.ifc.model.read({ data: ifcText });
     * const summary = await bitbybit.ifc.model.summary({ model });
     * ```
     */
    read(inputs: Inputs.IFC.ReadModelDto): IfcModel {
        if (typeof inputs.data !== "string" && !(inputs.data instanceof Uint8Array) && !(inputs.data instanceof ArrayBuffer)) {
            throw new TypeError("Expected the IFC file as a text, a Uint8Array or an ArrayBuffer");
        }
        return readModel(inputs.data);
    }

    /**
     * Turns a model read from an IFC2X3 file into an IFC4 model, which can be changed and is
     * written as IFC4.
     *
     * New attributes stay unset, a newly required enumeration takes `NOTDEFINED`, sets lose repeats
     * and a merged entity becomes its parent; other rows are written as read. Anything else stops
     * the upgrade, naming the entity.
     * @param inputs - The model
     * @returns The upgraded model
     * @group io
     * @shortname upgrade to ifc4
     * @drawable false
     * @example
     * ```typescript
     * const old = await bitbybit.ifc.model.read({ data: ifc2x3Bytes });
     * const model = await bitbybit.ifc.model.upgradeToIfc4({ model: old });
     * ```
     */
    upgradeToIfc4(inputs: Inputs.IFC.ModelDto<IfcModel>): IfcModel {
        return upgradeToIfc4(modelOf(inputs.model));
    }

    /**
     * Writes a model as the text of an `.ifc` file.
     *
     * The header records `fileName` and `timeStamp`; give a fixed `timeStamp` to write the same text
     * every time. Entities read from a file and left unchanged are written as they were read, character
     * for character.
     * @param inputs - The model, the file name and the time stamp
     * @returns The text of the IFC file
     * @group io
     * @shortname write ifc
     * @drawable false
     * @example
     * ```typescript
     * const text = await bitbybit.ifc.model.write({ model, fileName: "house.ifc" });
     * ```
     */
    write(inputs: Inputs.IFC.WriteModelDto<IfcModel>): string {
        const resolved = resolveDto(Inputs.IFC.WriteModelDto, inputs) as Resolved.IFC.WriteModelDto<IfcModel>;
        const model = modelOf(resolved.model);
        return writeModel(model, headerFor(model, resolved));
    }

    /**
     * Writes a model as the bytes of an `.ifc` file, at any size.
     *
     * The header records `fileName` and `timeStamp`, as `model.write`'s does. Entities read from a file
     * and left unchanged are copied byte for byte, so a file of hundreds of megabytes writes in a moment,
     * where its text would not fit one JavaScript string.
     * @param inputs - The model, the file name and the time stamp
     * @returns The bytes of the IFC file
     * @group io
     * @shortname write ifc bytes
     * @drawable false
     * @example
     * ```typescript
     * const bytes = await bitbybit.ifc.model.writeBytes({ model, fileName: "house.ifc" });
     * ```
     */
    writeBytes(inputs: Inputs.IFC.WriteModelDto<IfcModel>): Uint8Array {
        const resolved = resolveDto(Inputs.IFC.WriteModelDto, inputs) as Resolved.IFC.WriteModelDto<IfcModel>;
        const model = modelOf(resolved.model);
        return writeModelBytes(model, headerFor(model, resolved));
    }

    /**
     * Describes what a model holds: its schema, its project, its unit, its storeys and how many
     * elements of each type.
     * @param inputs - The model
     * @returns The model's summary
     * @group query
     * @shortname summary
     * @drawable false
     * @example
     * ```typescript
     * const summary = await bitbybit.ifc.model.summary({ model });
     * console.log(summary.elementCounts.IfcWall);
     * ```
     */
    summary(inputs: Inputs.IFC.ModelDto<IfcModel>): Inputs.IFC.ModelSummaryDto {
        const model = modelOf(inputs.model);
        const counts: Record<string, number> = {};
        for (const element of model.byType("IfcElement")) {
            counts[element.type] = (counts[element.type] ?? 0) + 1;
        }
        const project = model.attribute(projectOf(model), "Name");
        return {
            schema: model.schemaName,
            editable: model.editable,
            project: typeof project === "string" ? project : "",
            millimetresPerUnit: millimetresPerUnit(model),
            entities: model.size,
            storeys: storeysOf(model),
            elementCounts: counts,
        };
    }

    /**
     * Lists the objects of one IFC type, its subtypes included, optionally only those one storey
     * contains.
     *
     * `type` is any type with a GlobalId, such as `IfcWall`, `IfcDoor` or `IfcElement` for every
     * building element. The list is in the order the model holds them.
     * @param inputs - The model, the type and an optional storey
     * @returns Each object's GlobalId, type, name and storey
     * @group query
     * @shortname elements
     * @drawable false
     * @example
     * ```typescript
     * const walls = await bitbybit.ifc.model.elements({ model, type: "IfcWall", storey: "ground" });
     * ```
     */
    elements(inputs: Inputs.IFC.ElementsDto<IfcModel>): Inputs.IFC.ElementInfoDto[] {
        const resolved = resolveDto(Inputs.IFC.ElementsDto, inputs) as Resolved.IFC.ElementsDto<IfcModel>;
        const model = modelOf(resolved.model);
        if (!model.schema.hasEntity(resolved.type) || !model.schema.isSubtypeOf(resolved.type, "IfcRoot")) {
            throw new Error(`${resolved.type} is not an IFC type with a GlobalId`);
        }
        const storey = resolved.storey === undefined ? undefined : resolveId(model, resolved.storey, "IfcSpatialElement", "storey");
        const container = containers(model);
        return model.byType(resolved.type)
            .filter((entity) => storey === undefined || container.get(entity.id) === storey)
            .map((entity) => infoOf(model, entity.id, container.get(entity.id)));
    }

    /**
     * Describes one object of a model: its GlobalId, its type, its name and its storey.
     * @param inputs - The model and the object
     * @returns The object's GlobalId, type, name and storey
     * @group query
     * @shortname element
     * @drawable false
     * @example
     * ```typescript
     * const wall = await bitbybit.ifc.model.element({ model, element: "north-wall" });
     * ```
     */
    element(inputs: Inputs.IFC.ElementDto<IfcModel>): Inputs.IFC.ElementInfoDto {
        const model = modelOf(inputs.model);
        const element = resolveId(model, inputs.element, "IfcRoot", "object");
        return infoOf(model, element, containerOf(model, element));
    }

    /**
     * Removes an element, an empty storey or space, or a type nothing is of, with what only it uses.
     * A wall takes its openings with their doors and windows, and the walls it was joined to are
     * trimmed again; a door or window leaves its opening; an opening takes its doors and windows.
     * @param inputs - The model and the object
     * @returns A new model without the object
     * @group edit
     * @shortname remove
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.model.remove({ model, element: "partition" });
     * ```
     */
    remove(inputs: Inputs.IFC.ElementDto<IfcModel>): IfcModel {
        const model = modelOf(inputs.model);
        const object = resolveId(model, inputs.element, "IfcObjectDefinition", "object");
        return editModel(model, (tx, writer) => {
            removeObject(tx, writer, object, lengthTolerance(model), PARALLEL_TOLERANCE);
        });
    }

    /**
     * Moves an element or a space, and turns it about the vertical through its own origin; what is
     * placed on it, such as a wall's openings, moves with it. A joined wall moves with `walls.edit`,
     * and an opening, door or window with `openings.edit`.
     * @param inputs - The model, the element, how far to move it and how far to turn it
     * @returns A new model with the element moved
     * @group edit
     * @shortname move
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.model.move({ model, element: "column-1", translation: [500, 0, 0], rotation: 45 });
     * ```
     */
    move(inputs: Inputs.IFC.MoveElementDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.MoveElementDto, inputs) as Resolved.IFC.MoveElementDto<IfcModel>;
        const model = modelOf(resolved.model);
        requirePoint(resolved.translation, POINT3_SIZE, "translation");
        requireFinite(resolved.rotation, "rotation in degrees");
        const element = resolveId(model, resolved.element, "IfcProduct", "element");
        const storey = storeyOf(model, element);
        const plan = storey === undefined ? WORLD_AXES : storeyFrame(model, storey);
        return editModel(model, (tx, writer) => {
            moveElement(tx, writer, element, vectorToWorld(plan, resolved.translation), resolved.rotation);
        });
    }

    /**
     * Sets one attribute of an object to a text, a number, true or false, such as a wall's `Name`,
     * `Description` or `Tag`.
     *
     * The value is checked against the IFC schema, and an attribute that holds a reference, a derived
     * attribute or the `GlobalId` cannot be set this way.
     * @param inputs - The model, the object, the attribute's name and the new value
     * @returns A new model with the attribute set
     * @group edit
     * @shortname set attribute
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.model.setAttribute({ model, element: "north-wall", attribute: "Description", value: "Load bearing" });
     * ```
     */
    setAttribute(inputs: Inputs.IFC.SetAttributeDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.SetAttributeDto, inputs) as Resolved.IFC.SetAttributeDto<IfcModel>;
        const model = modelOf(resolved.model);
        if (resolved.attribute === "GlobalId") {
            throw new Error("An object's GlobalId identifies it and cannot be changed");
        }
        if (typeof resolved.value !== "string" && typeof resolved.value !== "number" && typeof resolved.value !== "boolean") {
            throw new TypeError("An attribute is set to a text, a number, or true or false");
        }
        const element = resolveId(model, resolved.element, "IfcRoot", "object");
        return editModel(model, (tx) => tx.update(element, { [resolved.attribute]: resolved.value }));
    }

    /**
     * Reads one attribute of an object, such as a wall's `Name`, `Description` or `Tag`.
     *
     * The value comes back as the model holds it: a text, a number, true or false, `null` when the
     * attribute is unset, `{ enum }` for an enumeration value, `{ type, value }` for a typed value,
     * `{ ref }` for a reference to another entity, or a list of these.
     * @param inputs - The model, the object and the attribute's name
     * @returns The attribute's value
     * @group query
     * @shortname get attribute
     * @drawable false
     * @example
     * ```typescript
     * const description = await bitbybit.ifc.model.getAttribute({ model, element: "north-wall", attribute: "Description" });
     * ```
     */
    getAttribute(inputs: Inputs.IFC.GetAttributeDto<IfcModel>): Inputs.IFC.IfcAttributeValue {
        const resolved = resolveDto(Inputs.IFC.GetAttributeDto, inputs) as Resolved.IFC.GetAttributeDto<IfcModel>;
        const model = modelOf(resolved.model);
        return model.attribute(resolveId(model, resolved.element, "IfcRoot", "object"), resolved.attribute);
    }

    /**
     * Says which GlobalId an id stands for in a model: the GlobalId itself, or the one the model
     * derives from an id of your own such as `north-wall`.
     *
     * The answer does not depend on whether the model holds such an object yet.
     * @param inputs - The model and the id
     * @returns The GlobalId, 22 characters
     * @group query
     * @shortname global id of
     * @drawable false
     * @example
     * ```typescript
     * const globalId = await bitbybit.ifc.model.globalIdOf({ model, id: "north-wall" });
     * ```
     */
    globalIdOf(inputs: Inputs.IFC.GlobalIdOfDto<IfcModel>): string {
        const model = modelOf(inputs.model);
        if (typeof inputs.id !== "string" || inputs.id.length === 0) {
            throw new TypeError("Expected an id as a text");
        }
        return isGlobalId(inputs.id) && model.byGlobalId(inputs.id) !== undefined ? inputs.id : keyGlobalId(model.keySeed, inputs.id);
    }
}
