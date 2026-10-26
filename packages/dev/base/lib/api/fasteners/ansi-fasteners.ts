import * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import { radiansOf, roundedToMillionths } from "../services/helpers/geometry/scalars";
import { ansiThread, checkedAnsiSize } from "../threads/ansi-threads";
import { UNIFIED_THREADS } from "../threads/ansi-threads.constants";
import type { AnsiThreadSize } from "../threads/thread-types";
import type { AnsiSetScrewPoint, AnsiWasherSeries, ClearanceFit, HexBoltSizes, HexNutSizes, SetScrewSizes, SocketHeadCapScrewSizes, WasherSizes } from "./fastener-types";
import {
    ANSI_CLEARANCE_HOLES, ANSI_CONE_LONG_ANGLE, ANSI_CONE_SHORT_ANGLE, ANSI_COUNTERBORE_SINK, ANSI_CUP_ANGLE, ANSI_FLAT_ANGLE, ANSI_HEX_CAP_SCREWS, ANSI_HEX_NUTS, ANSI_PLAIN_WASHERS,
    ANSI_SET_SCREWS, ANSI_SOCKET_HEAD_CAP_SCREWS, HEX_CAP_LENGTH_BREAK, HEX_CAP_THREAD_EXTRA_LONG, HEX_CAP_THREAD_EXTRA_SHORT,
} from "./ansi-fasteners.constants";
import { checkedFit } from "./iso-fasteners";

const POINTS: readonly AnsiSetScrewPoint[] = Object.values(Inputs.Engineering.ansiSetScrewPointEnum);
const WASHER_SERIES: readonly AnsiWasherSeries[] = Object.values(Inputs.Engineering.ansiWasherSeriesEnum);

const listed = <T>(row: T | undefined, size: AnsiThreadSize, standard: string): T => {
    if (row === undefined) {
        throw new InputError(`\`size\` is ${size}, which ${standard} gives no size for.`, "size");
    }
    return row;
};

export function ansiClearanceHoleDiameter(size: AnsiThreadSize, fit: ClearanceFit): number {
    return listed(ANSI_CLEARANCE_HOLES[checkedAnsiSize(size)], size, "ASME B18.2.8")[checkedFit(fit)];
}

export function ansiSocketHeadCapScrewSizes(size: AnsiThreadSize): SocketHeadCapScrewSizes {
    const row = listed(ANSI_SOCKET_HEAD_CAP_SCREWS[checkedAnsiSize(size)], size, "ASME B18.3");
    return { ...row, counterboreDepth: roundedToMillionths(row.counterboreDepth + ANSI_COUNTERBORE_SINK) };
}

export function ansiHexBoltSizes(size: AnsiThreadSize, length: number): HexBoltSizes {
    const row = listed(ANSI_HEX_CAP_SCREWS[checkedAnsiSize(size)], size, "ASME B18.2.1");
    if (!(length > 0)) {
        throw new InputError("`length` is not more than 0.", "length");
    }
    const extra = length <= HEX_CAP_LENGTH_BREAK ? HEX_CAP_THREAD_EXTRA_SHORT : HEX_CAP_THREAD_EXTRA_LONG;
    return { acrossFlats: row.acrossFlats, headHeight: row.height, threadLength: roundedToMillionths(2 * UNIFIED_THREADS[size].diameter + extra) };
}

export function ansiHexNutSizes(size: AnsiThreadSize): HexNutSizes {
    const row = ANSI_HEX_NUTS[checkedAnsiSize(size)];
    return { acrossFlats: row.acrossFlats, height: row.height };
}

export function ansiWasherSizes(size: AnsiThreadSize, series: AnsiWasherSeries): WasherSizes {
    const row = listed(ANSI_PLAIN_WASHERS[checkedAnsiSize(size)], size, "ASME B18.22.1");
    if (!WASHER_SERIES.includes(series)) {
        throw new InputError(`\`series\` is not one of ${WASHER_SERIES.join(", ")}.`, "series");
    }
    return { ...row[series] };
}

export function ansiSetScrewSizes(size: AnsiThreadSize, point: AnsiSetScrewPoint, series: "UNC" | "UNF", length = Infinity): SetScrewSizes {
    const row = listed(ANSI_SET_SCREWS[checkedAnsiSize(size)], size, "ASME B18.3");
    if (!POINTS.includes(point)) {
        throw new InputError(`\`point\` is not one of ${POINTS.join(", ")}.`, "point");
    }
    const root = ansiThread(size, series).minorDiameter / 2;
    const shortUpTo = point === "cup" || point === "flat" ? row.cupAndFlatShortUpTo : point === "halfDog" ? row.halfDogShortUpTo : row.coneAndOvalShortUpTo;
    const short = length < shortUpTo;
    const socket = { socketSize: row.key, socketDepth: short ? Math.min(row.depthShort, row.depthLong) : row.depthLong, shortUpTo };
    if (point === "cup") {
        return { ...socket, pointDiameter: row.pointDiameter, pointLength: roundedToMillionths(row.pointDiameter / 2 / Math.tan(radiansOf(ANSI_CUP_ANGLE / 2))), pointAngle: ANSI_CUP_ANGLE, pointRadius: 0 };
    }
    if (point === "cone") {
        const angle = length >= row.coneSteepFrom ? ANSI_CONE_LONG_ANGLE : ANSI_CONE_SHORT_ANGLE;
        return { ...socket, pointDiameter: 0, pointLength: roundedToMillionths(root / Math.tan(radiansOf(angle / 2))), pointAngle: angle, pointRadius: 0 };
    }
    if (point === "oval") {
        return { ...socket, pointDiameter: 0, pointLength: roundedToMillionths(row.ovalRadius - Math.sqrt(row.ovalRadius * row.ovalRadius - root * root)), pointAngle: 0, pointRadius: row.ovalRadius };
    }
    const diameter = point === "flat" ? row.pointDiameter : row.halfDogDiameter;
    const chamfer = (root - diameter / 2) / Math.tan(radiansOf(ANSI_FLAT_ANGLE / 2));
    return { ...socket, pointDiameter: diameter, pointLength: roundedToMillionths(chamfer + (point === "halfDog" ? row.halfDogLength : 0)), pointAngle: ANSI_FLAT_ANGLE, pointRadius: 0 };
}
