import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToLocal, pointToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import * as Inputs from "../api/inputs";
import { textValue } from "../step/values";
import type { ModelReader, WallEnd } from "./build-types";
import { TYPE_DEFINITION } from "./constants";
import { openingsOf } from "./openings";
import { relatingOf } from "./relationships";
import { containerOf, storeyFrame } from "./spatial";
import { alignmentOf, layerSetOf, readWall } from "./wall-geometry";
import { joinsOf } from "./walls";
import { firstItem, unwrapClippings } from "./representations";

const END_OF: Readonly<Record<WallEnd, Inputs.IFC.wallEndEnum>> = {
    ATSTART: Inputs.IFC.wallEndEnum.start,
    ATEND: Inputs.IFC.wallEndEnum.end,
    ATPATH: Inputs.IFC.wallEndEnum.along,
};

function globalIdOf(reader: ModelReader, id: number): string {
    return textValue(reader.attribute(id, "GlobalId")) ?? "";
}

export function wallParametersOf(reader: ModelReader, wall: number, tolerance: number): Inputs.IFC.WallParametersDto {
    const geometry = readWall(reader, wall);
    const storey = containerOf(reader, wall);
    const plan = storey === undefined ? WORLD_AXES : storeyFrame(reader, storey);
    const inPlan = (point: Base.Point2): Base.Point2 => {
        const local = pointToLocal(plan, [point[0], point[1], plan.origin[2]]);
        return [local[0], local[1]];
    };
    const type = relatingOf(reader, TYPE_DEFINITION, wall);
    return {
        globalId: globalIdOf(reader, wall),
        name: textValue(reader.attribute(wall, "Name")) ?? "",
        storey: storey === undefined ? "" : globalIdOf(reader, storey),
        start: inPlan(geometry.start),
        end: inPlan(geometry.end),
        height: geometry.height,
        baseOffset: pointToLocal(plan, pointToWorld(geometry.frame, [0, 0, geometry.base]))[2],
        thickness: geometry.high - geometry.low,
        offset: geometry.low,
        alignment: alignmentOf(geometry, tolerance) ?? "",
        layerSet: textValue(reader.attribute(layerSetOf(reader, geometry), "LayerSetName")) ?? "",
        wallType: type === undefined ? "" : globalIdOf(reader, type),
        joins: joinsOf(reader, wall).map((join) => ({ other: globalIdOf(reader, join.other), at: END_OF[join.mine], otherAt: END_OF[join.theirs] })),
        openings: openingsOf(reader, wall).map((opening) => globalIdOf(reader, opening)),
        clippings: geometry.body === undefined ? 0 : unwrapClippings(reader, firstItem(reader, geometry.body))[1].length,
    };
}
