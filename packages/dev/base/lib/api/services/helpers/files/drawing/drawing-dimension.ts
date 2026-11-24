import * as Inputs from "../../../../inputs";
import type * as Resolved from "../../../../resolved-inputs";
import { InputError } from "../../../../kernel-calls";
import { simplex } from "../../../../models/simplex";
import { conicArcSamples } from "../../curves/conic-arcs";
import { degreesOf, radiansOf, roundedTo } from "../../geometry/scalars";
import { add2, between2, distance2, dot2, leftOf2, polar2, scale2, subtract2, unit2Of } from "../../geometry/vectors";
import { strokeTextAdvance, strokeTextStrokes } from "../../text/stroke-font";
import { drawingTextOf, finiteNumber, isDrawable, positiveNumber } from "./drawing-model";
import { textCornersOf, textStrokesOf } from "./drawing-text";
import type { DimensionLayout, DimensionLine, DrawingDimension, DrawingText, TextInk } from "./drawing-types";
import { FULL_TURN_DEGREES, SAME_POINT } from "./drawing.constants";
import {
    ARC_TOLERANCE_SHARE, ARROWS_INSIDE_ROOM, ARROW_TAIL_SHARE, ARROW_WIDTH_SHARE, DEGREE_SIGN, DIAMETER_SIGN, EXTENSION_GAP_SHARE, EXTENSION_OVERSHOOT_SHARE,
    MOST_DECIMAL_PLACES, PLUS_MINUS_SIGN, RADIUS_SIGN, TEXT_GAP_SHARE, TOLERANCE_DECIMAL_PLACES, UPRIGHT_SLACK,
} from "./drawing-dimension.constants";

type Point2 = Inputs.Base.Point2;
type Vec2 = Inputs.Base.Vector2;

const KINDS = new Set<string>(Object.values(Inputs.IO.dimensionKindEnum));
const DEFAULTS = new Inputs.IO.DrawingDimensionDto();
const QUARTER_TURN = Math.PI / 2;

const point2Of = (value: unknown, property: string): Point2 => {
    if (!Array.isArray(value) || value.length !== 2 || !value.every(isDrawable)) {
        throw new InputError(`\`${property}\` must be a point of 2 finite numbers.`, property);
    }
    return [value[0] as number, value[1] as number];
};

const amountOf = (value: unknown, property: string): number | undefined => {
    if (value === undefined) {
        return undefined;
    }
    const amount = finiteNumber(value, property);
    if (amount < 0) {
        throw new InputError(`\`${property}\` is an amount and must not be below 0; it is ${amount}.`, property);
    }
    return amount;
};

const decimalPlacesOf = (value: unknown): number => {
    const places = finiteNumber(value, "decimalPlaces");
    if (!Number.isInteger(places) || places < 0 || places > MOST_DECIMAL_PLACES) {
        throw new InputError(`\`decimalPlaces\` must be a whole number from 0 to ${MOST_DECIMAL_PLACES}; it is ${places}.`, "decimalPlaces");
    }
    return places;
};

const writtenNumber = (value: number, places: number): string => {
    const fixed = roundedTo(value, places).toFixed(places);
    const trimmed = fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
    return trimmed === "-0" ? "0" : trimmed;
};

const toleranceText = (upper: number | undefined, lower: number | undefined): string => {
    if (upper === undefined && lower === undefined) {
        return "";
    }
    const above = writtenNumber(upper ?? 0, TOLERANCE_DECIMAL_PLACES);
    const below = writtenNumber(lower ?? 0, TOLERANCE_DECIMAL_PLACES);
    return above === below ? ` ${PLUS_MINUS_SIGN}${above}` : ` +${above}/-${below}`;
};

const radiusOf = (start: Point2, end: Point2): number => {
    const radius = distance2(start, end);
    if (radius <= SAME_POINT) {
        throw new InputError("`end` lies on `start`, so the dimension has no circle or arm to measure.", "end");
    }
    return radius;
};

const sweepOf = (value: unknown): number => {
    const degrees = finiteNumber(value, "angle");
    if (degrees <= 0 || degrees >= FULL_TURN_DEGREES) {
        throw new InputError(`\`angle\` must lie between 0 and ${FULL_TURN_DEGREES} degrees, both left out; it is ${degrees}.`, "angle");
    }
    return radiansOf(degrees);
};

const linearMeasureOf = (start: Point2, end: Point2, direction: Vec2 | undefined): number => {
    const along = direction ?? unit2Of(subtract2(end, start));
    const measured = along === undefined ? 0 : Math.abs(dot2(subtract2(end, start), along));
    if (measured <= SAME_POINT) {
        throw new InputError("`end` lies level with `start` along the measured direction, so the dimension measures no distance.", "end");
    }
    return measured;
};

const directionOf = (value: unknown): Vec2 | undefined => {
    if (value === undefined) {
        return undefined;
    }
    const direction = unit2Of(point2Of(value, "direction"));
    if (direction === undefined) {
        throw new InputError("`direction` must not be a zero vector.", "direction");
    }
    return direction;
};

const dimensionOf = (dimension: Resolved.IO.DrawingDimensionDto): DrawingDimension => {
    const kind = dimension.kind ?? DEFAULTS.kind!;
    if (typeof kind !== "string" || !KINDS.has(kind)) {
        throw new InputError(`\`kind\` must be one of ${[...KINDS].join(", ")}.`, "kind");
    }
    const start = point2Of(dimension.start, "start");
    const end = point2Of(dimension.end, "end");
    const textHeight = positiveNumber(dimension.textHeight ?? DEFAULTS.textHeight, "textHeight");
    const arrowLength = dimension.arrowLength === undefined ? textHeight : positiveNumber(dimension.arrowLength, "arrowLength");
    const places = decimalPlacesOf(dimension.decimalPlaces ?? DEFAULTS.decimalPlaces);
    const upper = amountOf(dimension.upperTolerance, "upperTolerance");
    const lower = amountOf(dimension.lowerTolerance, "lowerTolerance");
    const given = dimension.value === undefined ? undefined : finiteNumber(dimension.value, "value");
    const direction = kind === Inputs.IO.dimensionKindEnum.linear ? directionOf(dimension.direction) : undefined;
    const offset = finiteNumber(dimension.offset ?? DEFAULTS.offset, "offset");
    const sweep = kind === Inputs.IO.dimensionKindEnum.angular ? sweepOf(dimension.angle ?? DEFAULTS.angle) : 0;
    let measured: number;
    let prefix = "";
    let suffix = "";
    if (kind === Inputs.IO.dimensionKindEnum.linear) {
        measured = linearMeasureOf(start, end, direction);
    } else if (kind === Inputs.IO.dimensionKindEnum.angular) {
        const radius = radiusOf(start, end);
        if (radius < arrowLength) {
            throw new InputError(`\`end\` lies ${radius} from \`start\`, nearer than an arrowhead is long (${arrowLength}), so the arc has no room for its arrows.`, "end");
        }
        measured = degreesOf(sweep);
        suffix = DEGREE_SIGN;
    } else {
        const radius = radiusOf(start, end);
        measured = kind === Inputs.IO.dimensionKindEnum.diameter ? 2 * radius : radius;
        prefix = kind === Inputs.IO.dimensionKindEnum.diameter ? DIAMETER_SIGN : RADIUS_SIGN;
    }
    return {
        kind,
        start,
        end,
        direction,
        offset,
        sweep,
        text: `${prefix}${writtenNumber(given ?? measured, places)}${suffix}${toleranceText(upper, lower)}`,
        textHeight,
        arrowLength,
    };
};

const arrowhead = (tip: Point2, intoBody: Vec2, length: number): Point2[] => {
    const base = add2(tip, scale2(intoBody, length));
    const side = scale2(leftOf2(intoBody), length * ARROW_WIDTH_SHARE / 2);
    return [tip, subtract2(base, side), add2(base, side)];
};

const readableTurn = (along: Vec2): number => {
    const turn = Math.atan2(along[1], along[0]);
    if (turn > QUARTER_TURN + UPRIGHT_SLACK) {
        return turn - Math.PI;
    }
    return turn <= -QUARTER_TURN + UPRIGHT_SLACK ? turn + Math.PI : turn;
};

const inkOf = (value: string): TextInk => {
    let low = 0;
    let high = 0;
    for (const stroke of strokeTextStrokes(simplex, value)) {
        for (const point of stroke) {
            low = Math.min(low, point[1]);
            high = Math.max(high, point[1]);
        }
    }
    return { low, high };
};

const textAlong = (dimension: DrawingDimension, centre: Point2, along: Vec2, outward: Vec2 | undefined): DrawingText => {
    const turn = readableTurn(along);
    const up = leftOf2(polar2(1, turn));
    const ink = inkOf(dimension.text);
    const gap = dimension.textHeight * TEXT_GAP_SHARE;
    const away = outward ?? up;
    const clearance = dot2(up, away) >= 0 ? gap - ink.low * dimension.textHeight : gap + ink.high * dimension.textHeight;
    const position = add2(centre, scale2(away, clearance));
    return drawingTextOf({ text: dimension.text, position, height: dimension.textHeight, anchor: "middle", rotation: degreesOf(turn) }, "");
};

const textWidthOf = (dimension: DrawingDimension): number => strokeTextAdvance(simplex, dimension.text) * dimension.textHeight;

const straightLayout = (dimension: DrawingDimension, line: DimensionLine, extensions: Point2[][]): DimensionLayout => {
    const length = dimension.arrowLength;
    const span = distance2(line.from, line.to);
    const along = scale2(subtract2(line.to, line.from), 1 / span);
    const arrows = line.arrowAtFrom ? 2 : 1;
    const inside = span >= ARROWS_INSIDE_ROOM * length * arrows / 2;
    const tail = inside ? 0 : ARROW_TAIL_SHARE * length;
    const fills = [arrowhead(line.to, scale2(along, inside ? -1 : 1), length)];
    if (line.arrowAtFrom) {
        fills.unshift(arrowhead(line.from, scale2(along, inside ? 1 : -1), length));
    }
    const width = textWidthOf(dimension);
    const gap = dimension.textHeight * TEXT_GAP_SHARE;
    const room = span - (inside ? arrows * length : 0);
    const fits = width + 2 * gap <= room;
    const centre = fits ? between2(line.from, line.to, 1 / 2) : add2(line.to, scale2(along, tail + gap + width / 2));
    const first = line.arrowAtFrom ? subtract2(line.from, scale2(along, tail)) : line.from;
    const last = fits ? add2(line.to, scale2(along, tail)) : add2(centre, scale2(along, width / 2));
    return { lines: [[first, last], ...extensions], fills, text: textAlong(dimension, centre, along, undefined) };
};

const extensionLine = (point: Point2, foot: Point2, side: Vec2, dimension: DrawingDimension): Point2[] => {
    const toward = subtract2(foot, point);
    const reach = distance2(foot, point);
    const along = reach > SAME_POINT ? scale2(toward, 1 / reach) : side;
    const gap = dimension.textHeight * EXTENSION_GAP_SHARE;
    const from = reach > gap ? add2(point, scale2(along, gap)) : point;
    return [from, add2(foot, scale2(along, dimension.textHeight * EXTENSION_OVERSHOOT_SHARE))];
};

const linearLayout = (dimension: DrawingDimension): DimensionLayout => {
    const along = dimension.direction ?? unit2Of(subtract2(dimension.end, dimension.start))!;
    const side = leftOf2(along);
    const height = dot2(dimension.start, side) + dimension.offset;
    const footOf = (point: Point2): Point2 => add2(scale2(along, dot2(point, along)), scale2(side, height));
    const firstFoot = footOf(dimension.start);
    const secondFoot = footOf(dimension.end);
    const outward = dimension.offset < 0 ? scale2(side, -1) : side;
    const extensions = [extensionLine(dimension.start, firstFoot, outward, dimension), extensionLine(dimension.end, secondFoot, outward, dimension)];
    return straightLayout(dimension, { from: firstFoot, to: secondFoot, arrowAtFrom: true }, extensions);
};

const circleLayout = (dimension: DrawingDimension): DimensionLayout => {
    if (dimension.kind === Inputs.IO.dimensionKindEnum.radius) {
        return straightLayout(dimension, { from: dimension.start, to: dimension.end, arrowAtFrom: false }, []);
    }
    const opposite = subtract2(scale2(dimension.start, 2), dimension.end);
    return straightLayout(dimension, { from: opposite, to: dimension.end, arrowAtFrom: true }, []);
};

const angularLayout = (dimension: DrawingDimension): DimensionLayout => {
    const centre = dimension.start;
    const radius = distance2(dimension.start, dimension.end);
    const first = Math.atan2(dimension.end[1] - centre[1], dimension.end[0] - centre[0]);
    const last = first + dimension.sweep;
    const length = dimension.arrowLength;
    const inside = radius * dimension.sweep >= ARROWS_INSIDE_ROOM * length;
    const arrowTurn = length / radius;
    const tailTurn = inside ? 0 : ARROW_TAIL_SHARE * length / radius;
    const onArc = (turn: number): Point2 => add2(centre, polar2(radius, turn));
    const arrowAt = (turn: number, bodyTurn: number): Point2[] => {
        const tip = onArc(turn);
        return arrowhead(tip, unit2Of(subtract2(onArc(bodyTurn), tip))!, length);
    };
    const fills = inside
        ? [arrowAt(first, first + arrowTurn), arrowAt(last, last - arrowTurn)]
        : [arrowAt(first, first - arrowTurn), arrowAt(last, last + arrowTurn)];
    const arc = conicArcSamples({ frame: { center: [centre[0], centre[1], 0], xAxis: [radius, 0, 0], yAxis: [0, radius, 0] }, start: first - tailTurn, sweep: dimension.sweep + 2 * tailTurn }, dimension.textHeight * ARC_TOLERANCE_SHARE)
        .map((point): Point2 => [point[0], point[1]]);
    const gap = dimension.textHeight * EXTENSION_GAP_SHARE;
    const overshoot = dimension.textHeight * EXTENSION_OVERSHOOT_SHARE;
    const arm = (turn: number): Point2[] => [add2(centre, polar2(radius > gap ? gap : 0, turn)), add2(centre, polar2(radius + overshoot, turn))];
    const middle = first + dimension.sweep / 2;
    const text = textAlong(dimension, onArc(middle), polar2(1, middle + QUARTER_TURN), polar2(1, middle));
    return { lines: [arc, arm(first), arm(last)], fills, text };
};

const layoutOf = (dimension: DrawingDimension): DimensionLayout => {
    if (dimension.kind === Inputs.IO.dimensionKindEnum.linear) {
        return linearLayout(dimension);
    }
    return dimension.kind === Inputs.IO.dimensionKindEnum.angular ? angularLayout(dimension) : circleLayout(dimension);
};

const extentOf = (layout: DimensionLayout): Inputs.IO.DrawingExtentDto => {
    const min: Point2 = [Infinity, Infinity];
    const max: Point2 = [-Infinity, -Infinity];
    const corners = textCornersOf(layout.text).map((corner): Point2 => [corner[0], corner[1]]);
    for (const point of [...layout.lines.flat(), ...layout.fills.flat(), ...corners]) {
        min[0] = Math.min(min[0], point[0]);
        min[1] = Math.min(min[1], point[1]);
        max[0] = Math.max(max[0], point[0]);
        max[1] = Math.max(max[1], point[1]);
    }
    return { min, max };
};

const withoutRepeats = (strokes: readonly (readonly Point2[])[]): Point2[][] => strokes
    .map(stroke => stroke.filter((point, at) => at === 0 || distance2(point, stroke[at - 1]!) > SAME_POINT))
    .filter(stroke => stroke.length > 1);

export const dimensionExtentOf = (dimension: Resolved.IO.DrawingDimensionDto): Inputs.IO.DrawingExtentDto => extentOf(layoutOf(dimensionOf(dimension)));

export const dimensionPictureOf = (dimension: Resolved.IO.DrawingDimensionDto): Inputs.IO.DrawingDimensionPictureDto => {
    const layout = layoutOf(dimensionOf(dimension));
    const corners = textCornersOf(layout.text);
    return {
        lines: withoutRepeats(layout.lines),
        fills: layout.fills,
        textStrokes: withoutRepeats(textStrokesOf(layout.text).map(stroke => stroke.map((point): Point2 => [point[0], point[1]]))),
        text: { text: layout.text.value, position: [layout.text.position[0], layout.text.position[1]], height: layout.text.height, anchor: layout.text.anchor, rotation: layout.text.rotationDegrees, widthFactor: layout.text.widthFactor },
        textPoint: between2([corners[0]![0], corners[0]![1]], [corners[2]![0], corners[2]![1]], 1 / 2),
        extent: extentOf(layout),
    };
};
