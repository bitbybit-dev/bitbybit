import type { Base } from "@bitbybit-dev/base";
import { IFCService } from "../api/ifc-service";
import * as Inputs from "../api/inputs";
import { EntityWriter } from "../build/entity-writer";
import { modelOf } from "../api/services/service-support";
import { isGlobalId, keyGlobalId } from "../model/guid";
import type { IfcModel } from "../model/model-types";
import { IfcTransaction } from "../model/transaction";
import type { Fixture, Writing } from "./fixture-types";

export const TIME_STAMP = "2026-10-06T12:00:00";
export const WALL_HEIGHT = 3000;
export const WALL_THICKNESS = 200;

export function groundFloor(seed = "test"): Fixture {
    const ifc = new IFCService();
    const created = ifc.model.create({ name: "House", seed });
    const model = ifc.spatial.addStorey({ model: created, id: "ground", name: "Ground", elevation: 0 });
    return { ifc, model };
}

export function addRightWall(ifc: IFCService, model: IfcModel, id: string, start: Base.Point2, end: Base.Point2, storey = "ground"): IfcModel {
    return ifc.walls.add({
        model,
        storey,
        id,
        start,
        end,
        height: WALL_HEIGHT,
        thickness: WALL_THICKNESS,
        alignment: Inputs.IFC.wallAlignmentEnum.right,
    });
}

export function addCentredWall(ifc: IFCService, model: IfcModel, id: string, start: Base.Point2, end: Base.Point2, thickness: number, storey = "ground"): IfcModel {
    return ifc.walls.add({
        model,
        storey,
        id,
        start,
        end,
        height: WALL_HEIGHT,
        thickness,
        alignment: Inputs.IFC.wallAlignmentEnum.center,
    });
}

export function oneWall(seed = "test"): Fixture {
    const { ifc, model } = groundFloor(seed);
    return { ifc, model: addRightWall(ifc, model, "south", [0, 0], [10000, 0]) };
}

export function expressIdOf(model: IfcModel, id: string): number {
    const snapshot = modelOf(model);
    const found = isGlobalId(id) && snapshot.byGlobalId(id) !== undefined ? snapshot.byGlobalId(id) : snapshot.byGlobalId(keyGlobalId(snapshot.keySeed, id));
    if (found === undefined) {
        throw new Error(`The model has no object '${id}'`);
    }
    return found;
}

export function errorFrom(call: () => unknown): Error {
    try {
        call();
    } catch (error) {
        if (error instanceof Error) {
            return error;
        }
        throw new Error(`Expected an Error, the call threw ${String(error)}`, { cause: error });
    }
    throw new Error("Expected the call to throw");
}

export function writingInto(model: IfcModel): Writing {
    const tx = new IfcTransaction(modelOf(model));
    return { tx, writer: new EntityWriter(tx) };
}

export function writingIntoNewModel(): Writing {
    return writingInto(new IFCService().model.create({ seed: "writer" }));
}

export function notAModel(): IfcModel {
    const pointer: unknown = { hash: 1, type: "ifc-model" };
    return pointer as IfcModel;
}

export function missingModel(): IfcModel {
    const nothing: unknown = undefined;
    return nothing as IfcModel;
}
