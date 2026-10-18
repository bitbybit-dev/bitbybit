import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import type * as Inputs from "../../../api/inputs";
import { checkedWithin } from "../../base/input-checks";
import { kernelObjects, releasedOnError } from "../../base/release";
import type { OperationsService } from "../../base/operations.service";
import type { PartBuilder } from "../part-builder";
import { scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { MOST_THREAD_TURNS, THREAD_CREST_SHARE, THREAD_FLANK_TAN, THREAD_HELIX_TOLERANCE, THREAD_HOLE_SHARE, THREAD_OVERSHOOT, THREAD_PLAY_BASE, THREAD_PLAY_PER_PITCH, THREAD_ROOT_SHARE } from "../parts.constants";

type Point3 = Inputs.Base.Point3;

export interface ThreadCut {
    readonly size: Inputs.Engineering.metricSizeEnum;
    readonly pitch?: number | undefined;
    readonly length: number;
    readonly internal: boolean;
    readonly frame?: Inputs.Base.Frame | undefined;
}

export class ThreadCutter {

    constructor(private readonly build: PartBuilder, private readonly sweeps: OperationsService) { }

    tool(cut: ThreadCut): TopoDS_Shape {
        const thread = this.build.base.engineering.mechanical.threads.metricThread({ size: cut.size, pitch: cut.pitch });
        const length = checkedWithin(cut.length, "length", { above: 0 });
        const pitch = thread.pitch;
        const turns = length / pitch;
        if (turns > MOST_THREAD_TURNS) {
            throw new InputError(`\`length\` is ${String(length)}, ${String(turns)} turns of a ${String(pitch)} pitch, and a thread is modelled over at most ${String(MOST_THREAD_TURNS)} turns: make it shorter or its pitch coarser.`, "length");
        }
        const nominal = thread.diameter / 2;
        const over = pitch * THREAD_OVERSHOOT;
        const start = -pitch / 2;
        const flank = (width: number, rise: number): number => width + rise * THREAD_FLANK_TAN;
        const play = (THREAD_PLAY_BASE + THREAD_PLAY_PER_PITCH * pitch) / 2 * THREAD_FLANK_TAN;
        const outline: [number, number][] = cut.internal
            ? [
                [thread.internalMinorDiameter / 2 - over, -flank(pitch * THREAD_HOLE_SHARE, over)],
                [nominal + pitch * THREAD_ROOT_SHARE / THREAD_FLANK_TAN, 0],
                [thread.internalMinorDiameter / 2 - over, flank(pitch * THREAD_HOLE_SHARE, over)],
            ]
            : [
                [thread.minorDiameter / 2, -flank(pitch * THREAD_CREST_SHARE + play, -(nominal - thread.minorDiameter / 2))],
                [nominal + over, -flank(pitch * THREAD_CREST_SHARE + play, over)],
                [nominal + over, flank(pitch * THREAD_CREST_SHARE + play, over)],
                [thread.minorDiameter / 2, flank(pitch * THREAD_CREST_SHARE + play, -(nominal - thread.minorDiameter / 2))],
            ];
        const shapes = this.build.shapes;
        const frame = this.build.frameOf(cut.frame);
        const reach = nominal + pitch;
        const { own, releaseAll } = kernelObjects();
        let swept: TopoDS_Shape;
        try {
            const profile = own(shapes.wire.createPolygonWire({ points: outline.map(([x, z]): Point3 => [x, 0, start + z]) }));
            const helix = own(shapes.wire.createHelixWire({ radius: nominal, pitch, height: length + pitch, center: [0, 0, start], direction: [0, 0, 1], clockwise: false, tolerance: pitch * THREAD_HELIX_TOLERANCE }));
            swept = this.sweeps.pipeWithBinormal(helix, profile, [0, 0, 1]);
        } finally {
            releaseAll();
        }
        const depth = length + 2 * pitch;
        const inside = releasedOnError([swept], () => shapes.solid.createBox({ width: 2 * reach, length: depth, height: 2 * reach, center: [0, 0, depth / 2], originOnCenter: true }));
        const inward: Inputs.Base.Frame = { origin: frame.origin, normal: scale3(frame.normal, -1), direction: cut.internal ? frame.direction : scale3(frame.direction, -1) };
        return this.build.oriented(this.build.common([swept, inside]), inward);
    }
}
