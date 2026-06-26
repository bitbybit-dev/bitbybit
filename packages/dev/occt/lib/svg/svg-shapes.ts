/**
 * Conversion of the SVG basic shape elements (rect, circle, ellipse, line,
 * polyline, polygon) into the same subpath/segment vocabulary used by <path>.
 * Once here, every element is treated uniformly downstream.
 */

import { Base } from "@bitbybit-dev/base";
import { SvgArcSegment, SvgSegment, SvgSubpath } from "./svg-models";

type Attrs = { [k: string]: string };

const num = (attrs: Attrs, name: string, def = 0): number => {
    const v = parseFloat(attrs[name]);
    return Number.isNaN(v) ? def : v;
};

/** Full ellipse as two 180-degree arcs (avoids a degenerate 360-degree arc). */
function ellipseSubpath(cx: number, cy: number, rx: number, ry: number): SvgSubpath {
    if (rx <= 0 || ry <= 0) { return { start: [cx, cy], segments: [], closed: true }; }
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
    return { start, segments: [arc1, arc2], closed: true };
}

function parsePoints(value: string | undefined): Base.Point2[] {
    if (!value) { return []; }
    const nums = value.split(/[\s,]+/).map(parseFloat).filter((x) => !Number.isNaN(x));
    const pts: Base.Point2[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) { pts.push([nums[i], nums[i + 1]]); }
    return pts;
}

function polySubpath(pts: Base.Point2[], closed: boolean): SvgSubpath[] {
    if (pts.length < 2) { return []; }
    const segments: SvgSegment[] = [];
    for (let i = 1; i < pts.length; i++) { segments.push({ type: "line", to: pts[i] }); }
    return [{ start: pts[0], segments, closed }];
}

/** Rounded-rectangle subpath honoring SVG rx/ry corner rules. */
function rectSubpath(x: number, y: number, w: number, h: number, rxIn: number, ryIn: number): SvgSubpath[] {
    if (w <= 0 || h <= 0) { return []; }
    let rx = rxIn;
    let ry = ryIn;
    if (rx > w / 2) { rx = w / 2; }
    if (ry > h / 2) { ry = h / 2; }
    if (rx <= 0 || ry <= 0) {
        return polySubpath([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
    }
    const arc = (to: Base.Point2, center: Base.Point2, start: number): SvgArcSegment => ({
        type: "arc", to, center, rx, ry, xAxisRotation: 0, startAngle: start, deltaAngle: Math.PI / 2,
    });
    // Clockwise from top edge start, matching SVG rounded-rect path.
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

/** Convert a basic-shape element to subpaths; returns [] for unsupported tags. */
export function shapeToSubpaths(tag: string, attrs: Attrs): SvgSubpath[] {
    switch (tag) {
        case "rect": {
            const hasRx = attrs.rx !== undefined;
            const hasRy = attrs.ry !== undefined;
            const rx = hasRx ? num(attrs, "rx") : (hasRy ? num(attrs, "ry") : 0);
            const ry = hasRy ? num(attrs, "ry") : (hasRx ? num(attrs, "rx") : 0);
            return rectSubpath(num(attrs, "x"), num(attrs, "y"), num(attrs, "width"), num(attrs, "height"), rx, ry);
        }
        case "circle": {
            const r = num(attrs, "r");
            return [ellipseSubpath(num(attrs, "cx"), num(attrs, "cy"), r, r)];
        }
        case "ellipse":
            return [ellipseSubpath(num(attrs, "cx"), num(attrs, "cy"), num(attrs, "rx"), num(attrs, "ry"))];
        case "line": {
            const x1 = num(attrs, "x1"); const y1 = num(attrs, "y1");
            const x2 = num(attrs, "x2"); const y2 = num(attrs, "y2");
            return [{ start: [x1, y1], segments: [{ type: "line", to: [x2, y2] }], closed: false }];
        }
        case "polyline":
            return polySubpath(parsePoints(attrs.points), false);
        case "polygon":
            return polySubpath(parsePoints(attrs.points), true);
        default:
            return [];
    }
}
