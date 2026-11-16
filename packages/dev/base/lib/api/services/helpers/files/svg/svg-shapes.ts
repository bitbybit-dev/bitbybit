import type { Base } from "../../../../inputs/base-inputs";
import type { SvgArcSegment, SvgSegment, SvgSubpath } from "./svg-scene-types";
import type { LengthAxis, ViewportSize } from "./svg-numbers";
import { NO_VIEWPORT, lengthInPixels } from "./svg-numbers";
import { scanSvgNumbers } from "./svg-path-data";
import type { XmlAttributes } from "./svg-xml";

export type LengthOf = (name: string, axis: LengthAxis) => number | undefined;

export function lengthsIn(attrs: XmlAttributes, viewport: ViewportSize): LengthOf {
    return (name: string, axis: LengthAxis): number | undefined => lengthInPixels(attrs[name], viewport, axis);
}

function ellipseSubpath(cx: number, cy: number, rx: number, ry: number): SvgSubpath[] {
    if (!(rx > 0 && ry > 0)) { return []; }
    const start: Base.Point2 = [cx + rx, cy];
    const mid: Base.Point2 = [cx - rx, cy];
    const arc1: SvgArcSegment = {
        type: "arc", to: mid, center: [cx, cy], rx, ry,
        xAxisRotation: 0, startAngle: 0, deltaAngle: Math.PI,
    };
    const arc2: SvgArcSegment = {
        type: "arc", to: start, center: [cx, cy], rx, ry,
        xAxisRotation: 0, startAngle: Math.PI, deltaAngle: Math.PI,
    };
    return [{ start, segments: [arc1, arc2], closed: true }];
}

function parsePoints(value: string | undefined): Base.Point2[] {
    const nums = scanSvgNumbers(value).numbers;
    const pts: Base.Point2[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) { pts.push([nums[i]!, nums[i + 1]!]); }
    return pts;
}

function polySubpath(pts: Base.Point2[], closed: boolean): SvgSubpath[] {
    if (pts.length < 2) { return []; }
    const segments: SvgSegment[] = [];
    for (let i = 1; i < pts.length; i++) { segments.push({ type: "line", to: pts[i]! }); }
    return [{ start: pts[0]!, segments, closed }];
}

function rectSubpath(x: number, y: number, w: number, h: number, rxIn: number, ryIn: number): SvgSubpath[] {
    if (!(w > 0 && h > 0)) { return []; }
    const rx = Math.min(rxIn, w / 2);
    const ry = Math.min(ryIn, h / 2);
    if (rx <= 0 || ry <= 0) {
        return polySubpath([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
    }
    const arc = (to: Base.Point2, center: Base.Point2, start: number): SvgArcSegment => ({
        type: "arc", to, center, rx, ry, xAxisRotation: 0, startAngle: start, deltaAngle: Math.PI / 2,
    });
    const start: Base.Point2 = [x + rx, y];
    const segments: SvgSegment[] = [
        { type: "line", to: [x + w - rx, y] },
        arc([x + w, y + ry], [x + w - rx, y + ry], -Math.PI / 2),
        { type: "line", to: [x + w, y + h - ry] },
        arc([x + w - rx, y + h], [x + w - rx, y + h - ry], 0),
        { type: "line", to: [x + rx, y + h] },
        arc([x, y + h - ry], [x + rx, y + h - ry], Math.PI / 2),
        { type: "line", to: [x, y + ry] },
        arc([x + rx, y], [x + rx, y + ry], Math.PI),
    ];
    return [{ start, segments, closed: true }];
}

function cornerRadii(lengthOf: LengthOf): [number, number] {
    const valid = (value: number | undefined): number | undefined => (value !== undefined && value >= 0 ? value : undefined);
    const rx = valid(lengthOf("rx", "x"));
    const ry = valid(lengthOf("ry", "y"));
    return [rx ?? ry ?? 0, ry ?? rx ?? 0];
}

export function shapeToSubpaths(tag: string, attrs: XmlAttributes, lengthOf: LengthOf = lengthsIn(attrs, NO_VIEWPORT)): SvgSubpath[] {
    const at = (name: string, axis: LengthAxis): number => lengthOf(name, axis) ?? 0;
    switch (tag) {
        case "rect": {
            const [rx, ry] = cornerRadii(lengthOf);
            return rectSubpath(at("x", "x"), at("y", "y"), at("width", "x"), at("height", "y"), rx, ry);
        }
        case "circle": {
            const r = at("r", "other");
            return ellipseSubpath(at("cx", "x"), at("cy", "y"), r, r);
        }
        case "ellipse": {
            const rx = lengthOf("rx", "x");
            const ry = lengthOf("ry", "y");
            return ellipseSubpath(at("cx", "x"), at("cy", "y"), rx ?? ry ?? 0, ry ?? rx ?? 0);
        }
        case "line":
            return [{
                start: [at("x1", "x"), at("y1", "y")],
                segments: [{ type: "line", to: [at("x2", "x"), at("y2", "y")] }],
                closed: false,
            }];
        case "polyline":
            return polySubpath(parsePoints(attrs["points"]), false);
        case "polygon":
            return polySubpath(parsePoints(attrs["points"]), true);
        default:
            return [];
    }
}
