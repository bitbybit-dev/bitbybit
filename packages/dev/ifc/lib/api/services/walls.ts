import type { Base } from "@bitbybit-dev/base";
import { resolveDto } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToWorld, vectorToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { requireFinite, requirePoint } from "../../build/checks";
import { PARALLEL_TOLERANCE, POINT2_SIZE, POINT3_SIZE } from "../../build/constants";
import { associateMaterial, layerSetFor, materialOf, requireLayerSet } from "../../build/materials";
import { containerOf, storeyFrame } from "../../build/spatial";
import { declareInProject } from "../../build/type-objects";
import { clipWallByRoof } from "../../build/roof-clipping";
import { disconnectWalls, editWall } from "../../build/wall-edits";
import { wallParametersOf } from "../../build/wall-parameters";
import { clipWall, connectWalls, createWall } from "../../build/walls";
import type { IfcModel } from "../../model/model-types";
import type { IfcTransaction } from "../../model/transaction";
import { enumValue } from "../../step/values";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, lengthTolerance, modelOf, oneOf, resolveId } from "./service-support";

function typeLayerSet(tx: IfcTransaction, wallType: number, name: string): number {
    const material = materialOf(tx, wallType);
    if (material === undefined || tx.entity(material).type !== "IfcMaterialLayerSet") {
        throw new Error(`The wall type '${name}' has no layer set`);
    }
    return material;
}

/**
 * Walls: straight walls on a storey, from an axis, a height and a thickness or a layer set, joined
 * at their corners and clipped under roofs. A wall keeps its axis, layers and height, so joins and
 * clippings are worked out again from them whenever a wall changes, and tools that edit IFC walls
 * edit these as walls.
 *
 * Doors, windows and openings go into walls through `doors`, `windows` and `openings`.
 * @beta
 */
export class IFCWalls {

    /**
     * Adds a straight wall on a storey, from `start` to `end` in the storey's plan, `height` high.
     *
     * The wall is made of its type's layer set, the named `layerSet`, or one layer `thickness` thick,
     * in that order of preference. `alignment` says which side of the axis the layers lie on; join
     * walls at their corners afterwards with `walls.connect`.
     * @param inputs - The model, the storey, the axis, the height, the thickness or layer set, and the alignment
     * @returns A new model with the wall
     * @group create
     * @shortname add wall
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [10000, 0], height: 2700, thickness: 250 });
     * model = await bitbybit.ifc.walls.add({ model, storey: "ground", id: "east", start: [10000, 0], end: [10000, 8000], height: 2700, thickness: 250 });
     * model = await bitbybit.ifc.walls.connect({ model, wall: "south", other: "east" });
     * ```
     */
    add(inputs: Inputs.IFC.AddWallDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddWallDto, inputs) as Resolved.IFC.AddWallDto<IfcModel>;
        const model = modelOf(resolved.model);
        requirePoint(resolved.start, POINT2_SIZE, "start");
        requirePoint(resolved.end, POINT2_SIZE, "end");
        const storey = resolveId(model, resolved.storey, "IfcBuildingStorey", "storey");
        const typeName = resolved.wallType;
        const wallType = typeName === undefined ? undefined : resolveId(model, typeName, "IfcWallType", "wall type");
        const alignment = oneOf(resolved.alignment, Inputs.IFC.wallAlignmentEnum, "wall alignment");
        const predefinedType = oneOf(resolved.predefinedType, Inputs.IFC.wallPredefinedTypeEnum, "predefined type");
        const height = lengthIn(model, resolved.height, DEFAULT_MILLIMETRES.wallHeight);
        const thickness = lengthIn(model, resolved.thickness, DEFAULT_MILLIMETRES.wallThickness);
        return editModel(model, (tx, writer) => {
            createWall(tx, writer, {
                storey,
                id: resolved.id,
                name: resolved.name,
                start: resolved.start,
                end: resolved.end,
                height,
                baseOffset: resolved.baseOffset,
                layerSet: wallType === undefined || typeName === undefined ? layerSetFor(tx, writer, resolved.layerSet, thickness, "Wall") : typeLayerSet(tx, wallType, typeName),
                alignment,
                wallType,
                predefinedType: wallType === undefined ? predefinedType : undefined,
            }, lengthTolerance(model));
        });
    }

    /**
     * Joins two walls where they meet, trimming both: two walls meeting at their ends are mitred
     * into a corner, and a wall ending against another's side is cut back to that side.
     *
     * The join is recorded in the model, and joining the two walls again replaces it. Walls that do
     * not meet cannot be joined.
     * @param inputs - The model and the two walls
     * @returns A new model with the walls joined
     * @group edit
     * @shortname connect walls
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.walls.connect({ model, wall: "south", other: "east" });
     * ```
     */
    connect(inputs: Inputs.IFC.ConnectWallsDto<IfcModel>): IfcModel {
        const model = modelOf(inputs.model);
        const wall = resolveId(model, inputs.wall, "IfcWall", "wall");
        const other = resolveId(model, inputs.other, "IfcWall", "wall");
        return editModel(model, (tx, writer) => {
            connectWalls(tx, writer, wall, other, lengthTolerance(model), PARALLEL_TOLERANCE);
        });
    }

    /**
     * Takes away the join between two walls, so the ends it trimmed are square again.
     * @param inputs - The model and the two walls
     * @returns A new model with the walls no longer joined
     * @group edit
     * @shortname disconnect walls
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.walls.disconnect({ model, wall: "south", other: "east" });
     * ```
     */
    disconnect(inputs: Inputs.IFC.ConnectWallsDto<IfcModel>): IfcModel {
        const model = modelOf(inputs.model);
        const wall = resolveId(model, inputs.wall, "IfcWall", "wall");
        const other = resolveId(model, inputs.other, "IfcWall", "wall");
        return editModel(model, (tx, writer) => {
            disconnectWalls(tx, writer, wall, other, lengthTolerance(model), PARALLEL_TOLERANCE);
        });
    }

    /**
     * Changes a wall's axis, height, base, layers or alignment. Joined walls are trimmed again,
     * clippings stay put, and openings, doors and windows move with it, keeping their offset and sill. A
     * change is refused when it parts the wall from a joined wall, puts an opening off its end, or leaves
     * behind an opening, door or window placed elsewhere.
     * @param inputs - The model, the wall and what to change
     * @returns A new model with the wall changed
     * @group edit
     * @shortname edit wall
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.walls.edit({ model, wall: "south", height: 3200, thickness: 300 });
     * ```
     */
    edit(inputs: Inputs.IFC.EditWallDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.EditWallDto, inputs) as Resolved.IFC.EditWallDto<IfcModel>;
        const model = modelOf(resolved.model);
        const wall = resolveId(model, resolved.wall, "IfcWall", "wall");
        if (resolved.start !== undefined) {
            requirePoint(resolved.start, POINT2_SIZE, "start");
        }
        if (resolved.end !== undefined) {
            requirePoint(resolved.end, POINT2_SIZE, "end");
        }
        if (resolved.baseOffset !== undefined) {
            requireFinite(resolved.baseOffset, "base offset");
        }
        const alignment = resolved.alignment === undefined ? undefined : oneOf(resolved.alignment, Inputs.IFC.wallAlignmentEnum, "wall alignment");
        const tolerance = lengthTolerance(model);
        const storey = containerOf(model, wall);
        const plan = storey === undefined ? WORLD_AXES : storeyFrame(model, storey);
        const inWorld = (point: Base.Point2): Base.Point2 => {
            const world = pointToWorld(plan, [point[0], point[1], 0]);
            return [world[0], world[1]];
        };
        return editModel(model, (tx, writer) => {
            editWall(tx, writer, wall, {
                start: resolved.start === undefined ? undefined : inWorld(resolved.start),
                end: resolved.end === undefined ? undefined : inWorld(resolved.end),
                bottom: resolved.baseOffset === undefined ? undefined : pointToWorld(plan, [0, 0, resolved.baseOffset])[2],
                height: resolved.height,
                layerSet: resolved.layerSet !== undefined ? requireLayerSet(tx, resolved.layerSet) : resolved.thickness !== undefined ? layerSetFor(tx, writer, undefined, resolved.thickness, "Wall") : undefined,
                alignment,
            }, tolerance, PARALLEL_TOLERANCE);
        });
    }

    /**
     * Reads a wall's parameters back from the model: its axis, height, base, thickness, layers and
     * alignment, the walls it is joined to, its openings and its clippings. It reads walls other tools
     * wrote too, when they keep an axis and a layer set usage as IFC's standard walls do.
     * @param inputs - The model and the wall
     * @returns The wall's parameters, in the plan of its storey
     * @group query
     * @shortname wall parameters
     * @drawable false
     * @example
     * ```typescript
     * const wall = await bitbybit.ifc.walls.parameters({ model, wall: "south" });
     * ```
     */
    parameters(inputs: Inputs.IFC.WallDto<IfcModel>): Inputs.IFC.WallParametersDto {
        const model = modelOf(inputs.model);
        return wallParametersOf(model, resolveId(model, inputs.wall, "IfcWall", "wall"), lengthTolerance(model));
    }

    /**
     * Clips a wall with a plane, removing the part on the side the plane's normal points to, as a
     * wall is cut under a sloping roof.
     *
     * The plane is given in the wall's storey, and a wall can be clipped by several planes. Clipping
     * keeps the wall's full height in its data, so joins stay right.
     * @param inputs - The model, the wall, a point on the plane and its normal
     * @returns A new model with the wall clipped
     * @group edit
     * @shortname clip wall by plane
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.walls.clipByPlane({ model, wall: "south", origin: [0, 0, 2600], normal: [0, -0.5, 1] });
     * ```
     */
    clipByPlane(inputs: Inputs.IFC.ClipWallDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.ClipWallDto, inputs) as Resolved.IFC.ClipWallDto<IfcModel>;
        const model = modelOf(resolved.model);
        requirePoint(resolved.origin, POINT3_SIZE, "origin");
        requirePoint(resolved.normal, POINT3_SIZE, "normal");
        const wall = resolveId(model, resolved.wall, "IfcWall", "wall");
        const storey = containerOf(model, wall);
        const frame = storey === undefined ? undefined : storeyFrame(model, storey);
        const origin = frame ? pointToWorld(frame, resolved.origin) : resolved.origin;
        const normal = frame ? vectorToWorld(frame, resolved.normal) : resolved.normal;
        return editModel(model, (tx, writer) => {
            clipWall(tx, writer, wall, origin, normal);
        });
    }

    /**
     * Clips a wall under a roof by each of the roof's planes that cuts it: under the eaves level or
     * along the slope, under a gable to the gable's triangle. Planes above the wall leave it alone, and
     * clipping again changes nothing. A plane below the wall's bottom everywhere is refused, as it would
     * leave nothing of the wall.
     * @param inputs - The model, the wall and the roof
     * @returns A new model with the wall clipped
     * @group edit
     * @shortname clip wall by roof
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.walls.clipByRoof({ model, wall: "west", roof: "roof" });
     * ```
     */
    clipByRoof(inputs: Inputs.IFC.ClipWallByRoofDto<IfcModel>): IfcModel {
        const model = modelOf(inputs.model);
        const wall = resolveId(model, inputs.wall, "IfcWall", "wall");
        const roof = resolveId(model, inputs.roof, "IfcRoof", "roof");
        return editModel(model, (tx, writer) => {
            clipWallByRoof(tx, writer, wall, roof, lengthTolerance(model));
        });
    }

    /**
     * Adds a wall type: a named kind of wall made of a layer set. Walls added with this type as their
     * `wallType` are made of its layers.
     * @param inputs - The model, the type's id and name, its layer set and its kind
     * @returns A new model with the wall type
     * @group types
     * @shortname add wall type
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.walls.addType({ model, id: "exterior", name: "Exterior 230", layerSet: "Exterior wall" });
     * ```
     */
    addType(inputs: Inputs.IFC.AddWallTypeDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddWallTypeDto, inputs) as Resolved.IFC.AddWallTypeDto<IfcModel>;
        const model = modelOf(resolved.model);
        return editModel(model, (tx, writer) => {
            const layerSet = requireLayerSet(tx, resolved.layerSet);
            const type = writer.create("IfcWallType", {
                GlobalId: tx.globalId(resolved.id),
                Name: resolved.name,
                PredefinedType: enumValue(oneOf(resolved.predefinedType, Inputs.IFC.wallPredefinedTypeEnum, "predefined type")),
            });
            associateMaterial(tx, writer, [type], layerSet);
            declareInProject(tx, writer, type);
        });
    }
}
