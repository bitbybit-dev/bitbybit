

import type { AffineMatrix2 } from "../../geometry/affine2";
import { AFFINE_IDENTITY2, affineProduct2, affineScaling2, affineTranslation2 } from "../../geometry/affine2";
import type { ViewportSize } from "./svg-numbers";
import { NO_VIEWPORT, lengthInPixels, millimetresPerPixel } from "./svg-numbers";
import { scanSvgNumbers } from "./svg-path-data";
import type { XmlNode } from "./svg-xml";

export type ViewBox = [number, number, number, number];

export interface DocumentFrame {
    viewBox?: ViewBox;
    width?: number;
    height?: number;
    pageTransform: AffineMatrix2;
    pageInverse: AffineMatrix2;
    contentViewport: ViewportSize;
    millimetresPerUserUnit: number;
}

type AxisAlignment = "min" | "mid" | "max";

export interface AspectRatio {
    stretch: boolean;
    x: AxisAlignment;
    y: AxisAlignment;
    slice: boolean;
}

interface ViewBoxFit {
    scaleX: number;
    scaleY: number;
    offsetX: number;
    offsetY: number;
}

const VIEW_BOX_NUMBERS = 4;
const ALIGNMENT = /^x(min|mid|max)y(min|mid|max)$/;

export function parseViewBox(text: string | undefined): ViewBox | undefined {
    const scanned = scanSvgNumbers(text);
    const [minX, minY, width, height] = scanned.numbers;
    if (scanned.malformed || scanned.numbers.length !== VIEW_BOX_NUMBERS || !(width! > 0) || !(height! > 0)) { return undefined; }
    return [minX!, minY!, width!, height!];
}

function alignedOffset(alignment: AxisAlignment, room: number): number {
    if (alignment === "min") { return 0; }
    return alignment === "mid" ? room / 2 : room;
}

export function parseAspectRatio(preserveAspectRatio: string | undefined): AspectRatio {
    const words = (preserveAspectRatio ?? "").trim().toLowerCase().split(/\s+/).filter((w) => w !== "defer");
    const align = words[0] ?? "xmidymid";
    const parts = ALIGNMENT.exec(align) ?? ["", "mid", "mid"];
    return { stretch: align === "none", x: parts[1] as AxisAlignment, y: parts[2] as AxisAlignment, slice: words[1] === "slice" };
}

function viewBoxFit(box: ViewBox, width: number, height: number, aspect: AspectRatio): ViewBoxFit {
    const [, , boxWidth, boxHeight] = box;
    const sx = width / boxWidth;
    const sy = height / boxHeight;
    if (aspect.stretch) {
        return { scaleX: sx, scaleY: sy, offsetX: 0, offsetY: 0 };
    }
    const s = aspect.slice ? Math.max(sx, sy) : Math.min(sx, sy);
    return { scaleX: s, scaleY: s, offsetX: alignedOffset(aspect.x, width - boxWidth * s), offsetY: alignedOffset(aspect.y, height - boxHeight * s) };
}

export function fittedViewBox(box: ViewBox, width: number, height: number, aspect: AspectRatio): AffineMatrix2 {
    const fit = viewBoxFit(box, width, height, aspect);
    const scaled = affineProduct2(affineScaling2(fit.scaleX, fit.scaleY), affineTranslation2(-box[0], -box[1]));
    return aspect.stretch ? scaled : affineProduct2(affineTranslation2(fit.offsetX, fit.offsetY), scaled);
}

function unfittedViewBox(box: ViewBox, width: number, height: number, aspect: AspectRatio): AffineMatrix2 {
    const fit = viewBoxFit(box, width, height, aspect);
    return affineProduct2(affineTranslation2(box[0], box[1]), affineProduct2(affineScaling2(1 / fit.scaleX, 1 / fit.scaleY), affineTranslation2(-fit.offsetX, -fit.offsetY)));
}

export function viewBoxTransform(box: ViewBox, width: number, height: number, preserveAspectRatio: string | undefined): AffineMatrix2 {
    return fittedViewBox(box, width, height, parseAspectRatio(preserveAspectRatio));
}

function absoluteLength(text: string | undefined, axis: "x" | "y"): number | undefined {
    if (text === undefined || text.trim().endsWith("%")) { return undefined; }
    const pixels = lengthInPixels(text, NO_VIEWPORT, axis);
    return pixels !== undefined && pixels > 0 ? pixels : undefined;
}

export function documentFrame(root: XmlNode): DocumentFrame {
    const box = parseViewBox(root.attrs["viewBox"]);
    let width = absoluteLength(root.attrs["width"], "x");
    let height = absoluteLength(root.attrs["height"], "y");
    if (box) {
        if (width === undefined && height === undefined) {
            width = box[2];
            height = box[3];
        } else if (width === undefined) {
            width = height! * box[2] / box[3];
        } else if (height === undefined) {
            height = width * box[3] / box[2];
        }
    }
    const aspect = parseAspectRatio(root.attrs["preserveAspectRatio"]);
    const fitted = box && width !== undefined && height !== undefined ? { box, width, height } : undefined;
    const pageTransform = fitted ? fittedViewBox(fitted.box, fitted.width, fitted.height, aspect) : AFFINE_IDENTITY2;
    const frame: DocumentFrame = {
        pageTransform,
        pageInverse: fitted ? unfittedViewBox(fitted.box, fitted.width, fitted.height, aspect) : AFFINE_IDENTITY2,
        contentViewport: box ? { width: box[2], height: box[3] } : width !== undefined && height !== undefined ? { width, height } : NO_VIEWPORT,
        millimetresPerUserUnit: pageTransform[0] * millimetresPerPixel(),
    };
    if (box) { frame.viewBox = box; }
    if (width !== undefined && height !== undefined) {
        frame.width = width;
        frame.height = height;
    }
    return frame;
}
