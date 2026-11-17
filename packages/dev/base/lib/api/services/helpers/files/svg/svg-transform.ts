import type { AffineMatrix2 } from "../../geometry/affine2";
import { AFFINE_IDENTITY2, affinePoint2, affineProduct2, affineScaling2, affineTranslation2 } from "../../geometry/affine2";
import type { SvgSegment, SvgSubpath } from "./svg-scene-types";
import { affineEllipseArc2 } from "../../geometry/ellipse-arcs";
import { radiansOf } from "../../geometry/scalars";
import { scanSvgNumbers } from "./svg-path-data";
import { MATRIX_ARGUMENTS, ROTATE_ABOUT_POINT_ARGUMENTS } from "./svg-reader.constants";

export interface ParsedTransform {
    matrix: AffineMatrix2;
    malformed: boolean;
}

interface TransformItem {
    readonly counts: readonly number[];
    readonly matrix: (nums: readonly number[]) => AffineMatrix2;
}

const TRANSFORM_ITEM = /[\s,]*([A-Za-z]+)\s*\(([^)]*)\)/y;
const ONLY_SEPARATORS = /^[\s,]*$/;

function rotation(nums: readonly number[]): AffineMatrix2 {
    const ang = radiansOf(nums[0] || 0);
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const rot: AffineMatrix2 = [cos, sin, -sin, cos, 0, 0];
    if (nums.length < ROTATE_ABOUT_POINT_ARGUMENTS) {
        return rot;
    }
    const cx = nums[1]!;
    const cy = nums[2]!;
    return affineProduct2(affineTranslation2(cx, cy), affineProduct2(rot, affineTranslation2(-cx, -cy)));
}

const TRANSFORM_ITEMS: ReadonlyMap<string, TransformItem> = new Map<string, TransformItem>([
    ["matrix", { counts: [MATRIX_ARGUMENTS], matrix: nums => [nums[0]!, nums[1]!, nums[2]!, nums[3]!, nums[4]!, nums[5]!] }],
    ["translate", { counts: [1, 2], matrix: nums => affineTranslation2(nums[0] || 0, nums[1] || 0) }],
    ["scale", { counts: [1, 2], matrix: nums => affineScaling2(nums[0]!, nums.length > 1 ? nums[1]! : nums[0]!) }],
    ["rotate", { counts: [1, ROTATE_ABOUT_POINT_ARGUMENTS], matrix: rotation }],
    ["skewX", { counts: [1], matrix: nums => [1, 0, Math.tan(radiansOf(nums[0] || 0)), 1, 0, 0] }],
    ["skewY", { counts: [1], matrix: nums => [1, Math.tan(radiansOf(nums[0] || 0)), 0, 1, 0, 0] }],
]);

export function parseTransformList(value: string | undefined | null): ParsedTransform {
    if (!value) { return { matrix: AFFINE_IDENTITY2, malformed: false }; }
    let matrix: AffineMatrix2 = AFFINE_IDENTITY2;
    let at = 0;
    while (at < value.length) {
        TRANSFORM_ITEM.lastIndex = at;
        const match = TRANSFORM_ITEM.exec(value);
        if (!match) {
            return ONLY_SEPARATORS.test(value.slice(at)) ? { matrix, malformed: false } : { matrix: AFFINE_IDENTITY2, malformed: true };
        }
        at = TRANSFORM_ITEM.lastIndex;
        const scanned = scanSvgNumbers(match[2]);
        const item = TRANSFORM_ITEMS.get(match[1]!);
        if (!item || scanned.malformed || !item.counts.includes(scanned.numbers.length)) { return { matrix: AFFINE_IDENTITY2, malformed: true }; }
        matrix = affineProduct2(matrix, item.matrix(scanned.numbers));
    }
    return { matrix, malformed: false };
}

export function parseTransform(value: string | undefined | null): AffineMatrix2 {
    return parseTransformList(value).matrix;
}

export function transformSegment(m: AffineMatrix2, seg: SvgSegment): SvgSegment {
    switch (seg.type) {
        case "line":
            return { type: "line", to: affinePoint2(m, seg.to) };
        case "quad":
            return { type: "quad", c: affinePoint2(m, seg.c), to: affinePoint2(m, seg.to) };
        case "cubic":
            return {
                type: "cubic",
                c1: affinePoint2(m, seg.c1),
                c2: affinePoint2(m, seg.c2),
                to: affinePoint2(m, seg.to),
            };
        case "arc":
            return { type: "arc", to: affinePoint2(m, seg.to), ...affineEllipseArc2(m, seg) };
    }
}

export function transformSubpath(m: AffineMatrix2, sp: SvgSubpath): SvgSubpath {
    return {
        start: affinePoint2(m, sp.start),
        segments: sp.segments.map((s) => transformSegment(m, s)),
        closed: sp.closed,
    };
}
