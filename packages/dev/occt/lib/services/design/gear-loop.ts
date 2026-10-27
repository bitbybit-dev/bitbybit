import { resolveDto } from "@bitbybit-dev/base";
import { ringGearOutline, spurGearOutline } from "@bitbybit-dev/base/lib/api/gears/gears";
import { rackOutline } from "@bitbybit-dev/base/lib/api/gears/racks";
import type { RackMove } from "@bitbybit-dev/base";
import type { GearOutline, RackOutline } from "@bitbybit-dev/base/lib/api/gears/gear-types";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type * as Resolved from "../../api/resolved-inputs";
import { checkTeeth, gearPen } from "../parts/mechanical/gear-pen";
import type { DrawnLoop } from "./loop-types";
import { pointer, problemsAt } from "./problems";
import type { DesignRun } from "./state";
import { numberOf } from "./values";
import { GEAR_NUMBERS, RACK_NUMBERS } from "./constants";
import { add2, rotated2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

export function isGear(command: Models.OCCT.DesignPenCommand): command is Models.OCCT.DesignGearCommand {
    return command.type === "gear";
}

function outlineOf(gear: Models.OCCT.DesignGearCommand, given: Record<string, number>, centre: Inputs.Base.Point2, at: string): GearOutline {
    return problemsAt(at, () => {
        checkTeeth(given["teeth"]!);
        if (gear.internal === true) {
            const ring = resolveDto(Inputs.OCCT.RingGearProfileDto, given) as Resolved.OCCT.RingGearProfileDto;
            return ringGearOutline(ring, centre, ring.rotation);
        }
        const spur = resolveDto(Inputs.OCCT.SpurGearProfileDto, given) as Resolved.OCCT.SpurGearProfileDto;
        return spurGearOutline(spur, centre, spur.rotation);
    });
}

export function drawnGear(gear: Models.OCCT.DesignGearCommand, frame: Inputs.Base.Frame, at: string, run: DesignRun): DrawnLoop {
    const given: Record<string, number> = Object.fromEntries(GEAR_NUMBERS.flatMap(key => gear[key] === undefined ? [] : [[key, numberOf(gear[key], run.parameters, pointer(at, key))]]));
    const centre: Inputs.Base.Point2 = [numberOf(gear.centre[0], run.parameters, pointer(at, "centre", 0)), numberOf(gear.centre[1], run.parameters, pointer(at, "centre", 1))];
    return drawnOutline(outlineOf(gear, given, centre, at), frame, run);
}

function drawnOutline(outline: GearOutline | RackOutline, frame: Inputs.Base.Frame, run: DesignRun): DrawnLoop {
    const pen = gearPen(outline);
    const drawn = run.occt.sketch.penWithSegments({ commands: pen.commands, start: pen.start, frame, makeFace: false });
    return { wire: drawn.shape, segments: drawn.segments.map(segment => ({ command: 0, edges: segment.edges, part: outline.moves[segment.command]!.part })) };
}

export function isRack(command: Models.OCCT.DesignPenCommand): command is Models.OCCT.DesignRackCommand {
    return command.type === "rack";
}

function placedRack(outline: RackOutline, start: Inputs.Base.Point2, radians: number): RackOutline {
    const at = (point: Inputs.Base.Point2): Inputs.Base.Point2 => add2(start, rotated2(point, radians));
    return {
        start: at(outline.start),
        moves: outline.moves.map((move): RackMove => move.kind === "arc" ? { ...move, through: at(move.through), to: at(move.to) } : { ...move, to: at(move.to) }),
    };
}

export function drawnRack(rack: Models.OCCT.DesignRackCommand, frame: Inputs.Base.Frame, at: string, run: DesignRun): DrawnLoop {
    const given: Record<string, number> = Object.fromEntries(RACK_NUMBERS.flatMap(key => rack[key] === undefined ? [] : [[key, numberOf(rack[key], run.parameters, pointer(at, key))]]));
    const start: Inputs.Base.Point2 = [numberOf(rack.start[0], run.parameters, pointer(at, "start", 0)), numberOf(rack.start[1], run.parameters, pointer(at, "start", 1))];
    const angle = rack.angle === undefined ? 0 : numberOf(rack.angle, run.parameters, pointer(at, "angle"));
    return drawnOutline(problemsAt(at, () => {
        checkTeeth(given["teeth"]!);
        return placedRack(rackOutline(resolveDto(Inputs.OCCT.RackProfileDto, given) as Resolved.OCCT.RackProfileDto), start, run.base.math.degToRad({ number: angle }));
    }), frame, run);
}
