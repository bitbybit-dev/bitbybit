import type { AffineMatrix2 } from "../../geometry/affine2";
import { AFFINE_IDENTITY2, affineAreaScale2, affineProduct2, affineScaling2, affineTranslation2 } from "../../geometry/affine2";
import { millimetresPerUnitOf } from "../../geometry/lengths";
import { WorkBudget } from "../work-budget";
import type { Base } from "../../../../inputs/base-inputs";
import type { CssMatches } from "./svg-css";
import { matchStylesheet, parseStylesheets } from "./svg-css";
import type { AspectRatio, ViewBox } from "./svg-document";
import { documentFrame, fittedViewBox, parseAspectRatio, parseViewBox } from "./svg-document";
import { remembered } from "./svg-memo";
import type { SvgElement, SvgScene, SvgSubpath } from "./svg-scene-types";
import type { LengthAxis, SvgLength, ViewportSize } from "./svg-numbers";
import { millimetresPerPixel, pixelsOf } from "./svg-numbers";
import { parseSvgPathData } from "./svg-path-data";
import type { LengthOf } from "./svg-shapes";
import { shapeToSubpaths } from "./svg-shapes";
import type { StyleProps, StyleState } from "./svg-style";
import { INITIAL_STYLE, STYLE_PROPERTIES, computeStyle, isKeyword, specifiedValues, styleReadings, toSvgStyle } from "./svg-style";

import { parseTransformList, transformSubpath } from "./svg-transform";
import type { XmlNode } from "./svg-xml";
import { parseXml } from "./svg-xml";
import {
    MAX_DASH_VALUES, MAX_LISTED_SELECTORS, MAX_LISTED_TAGS, MAX_USE_DEPTH, MAX_VISITED_ELEMENTS, MAX_WALK_DEPTH, SEGMENT_CEILING, SEGMENT_FLOOR,
    SEGMENTS_PER_INPUT_CHARACTER, SELECTOR_MATCH_STEP_CEILING, SELECTOR_MATCH_STEP_FLOOR, SELECTOR_MATCH_STEPS_PER_INPUT_CHARACTER,
} from "./svg-reader.constants";

export interface NormalizeOptions {
    unit?: `${Base.unitOfLengthEnum}` | undefined;
}

interface WalkContext {
    matrix: AffineMatrix2;
    style: StyleState;
    viewport: ViewportSize;
    useDepth: number;
    depth: number;
    layer: string | undefined;
}

interface ViewportOverride {
    width?: string | undefined;
    height?: string | undefined;
}

interface ViewportFrame {
    box: ViewBox | undefined;
    aspect: AspectRatio;
}

interface UseReference {
    target: XmlNode | undefined;
    cycleWarning: string;
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const INKSCAPE_NAMESPACE = "http://www.inkscape.org/namespaces/inkscape";
const INKSCAPE_LAYER = "layer";
const DRAWABLE = new Set(["path", "rect", "circle", "ellipse", "line", "polyline", "polygon"]);
const SIZED_BY_VIEWPORT = new Set(["rect", "circle", "ellipse", "line"]);
const CONTAINERS = new Set(["svg", "g", "a", "switch", "use"]);
const SILENT = new Set([
    "defs", "symbol", "clippath", "mask", "marker", "pattern", "metadata", "title", "desc", "style", "script",
    "view", "set", "animate", "animatemotion", "animatetransform", "animatecolor", "mpath", "lineargradient",
    "radialgradient", "stop", "filter", "cursor", "font", "font-face", "glyph", "missing-glyph", "hkern", "vkern",
    "color-profile", "solidcolor",
]);

const UNSUPPORTED_HINTS: ReadonlyMap<string, string> = new Map([
    ["text", " Convert text to paths before exporting."],
    ["image", " Raster images have no geometry to import."],
    ["foreignobject", " Its content is not SVG."],
]);

const malformedTransformWarning = (text: string): string =>
    `A transform could not be read (\`${text}\`) and is ignored, as a browser ignores it.`;

const unlistedTagsWarning = (count: number): string =>
    `${count} more kind${count === 1 ? "" : "s"} of element ${count === 1 ? "is" : "are"} not supported and contribute${count === 1 ? "s" : ""} no geometry.`;

function segmentsDrawn(subpath: SvgSubpath): number {
    const last = subpath.segments[subpath.segments.length - 1];
    const closesWithLine = subpath.closed && last !== undefined && (last.to[0] !== subpath.start[0] || last.to[1] !== subpath.start[1]);
    return subpath.segments.length + (closesWithLine ? 1 : 0);
}

const isSvgElement = (node: XmlNode): boolean =>
    node.namespace === SVG_NAMESPACE || (node.namespace === undefined && (node.prefix === "" || node.prefix === "svg"));

const isRenderedChoice = (node: XmlNode): boolean =>
    isSvgElement(node) && !SILENT.has(node.tag) && !(node.attrs["requiredExtensions"] ?? "").trim();

function inkscapeAttribute(node: XmlNode, localName: string): string | undefined {
    const namespaces = node.attrNamespaces;
    if (!namespaces) { return undefined; }
    const name = Object.keys(namespaces).find((attribute) => namespaces[attribute] === INKSCAPE_NAMESPACE && attribute.slice(attribute.indexOf(":") + 1) === localName);
    return name === undefined ? undefined : node.attrs[name];
}

function layerNameOf(node: XmlNode): string | undefined {
    if (node.tag !== "g" || inkscapeAttribute(node, "groupmode")?.trim() !== INKSCAPE_LAYER) { return undefined; }
    return inkscapeAttribute(node, "label") ?? node.attrs["id"] ?? "";
}

function findSvgRoot(node: XmlNode | undefined): XmlNode | undefined {
    if (!node) { return undefined; }
    if (node.tag === "svg" && isSvgElement(node)) { return node; }
    for (const child of node.children) {
        const found = findSvgRoot(child);
        if (found) { return found; }
    }
    return undefined;
}

function collect(node: XmlNode, visit: (node: XmlNode) => void): void {
    const pending: XmlNode[] = [node];
    while (pending.length > 0) {
        const current = pending.pop()!;
        visit(current);
        for (let at = current.children.length - 1; at >= 0; at--) { pending.push(current.children[at]!); }
    }
}

function givenLength(length: SvgLength | undefined, viewport: ViewportSize, axis: "x" | "y"): number | undefined {
    const available = axis === "x" ? viewport.width : viewport.height;
    if (length === undefined || (length.unit === "%" && available <= 0)) { return undefined; }
    return pixelsOf(length, viewport, axis);
}

function viewportLength(given: number | undefined, available: number, boxSize: number | undefined): number {
    return given ?? (available > 0 ? available : boxSize ?? 0);
}

function hrefOf(node: XmlNode): string | undefined {
    if (node.attrs["href"] !== undefined) { return node.attrs["href"].trim(); }
    const linked = Object.keys(node.attrs).find((name) => name.endsWith(":href"));
    return linked === undefined ? undefined : node.attrs[linked]!.trim();
}

class SceneWalker {
    readonly elements: SvgElement[] = [];
    readonly warnings: string[] = [];
    private readonly warned = new Set<string>();
    private readonly warnedTags = new Set<string>();
    private unlistedTags = 0;
    private readonly onPath = new Set<XmlNode>();
    private readonly readings = styleReadings();
    private readonly outlines = new Map<XmlNode, SvgSubpath[]>();
    private readonly sizedOutlines = new Map<XmlNode, Map<string, SvgSubpath[]>>();
    private readonly transforms = new Map<XmlNode, AffineMatrix2>();
    private readonly specified = new Map<XmlNode, StyleProps>();
    private readonly viewports = new Map<XmlNode, ViewportFrame>();
    private readonly references = new Map<XmlNode, UseReference | undefined>();
    private readonly choices = new Map<XmlNode, XmlNode | undefined>();
    private readonly layers = new Map<XmlNode, string | undefined>();
    private visited = 0;
    private segmentsSpent = false;

    constructor(
        private readonly ids: Map<string, XmlNode>,
        private readonly css: CssMatches,
        private readonly segments: WorkBudget
    ) { }

    warnOnce(key: string, message: string): void {
        if (this.warned.has(key)) { return; }
        this.warned.add(key);
        this.warnings.push(message);
    }

    styleOf(node: XmlNode, parent: StyleState): StyleState {
        const specified = remembered(this.specified, node, (n) => specifiedValues(n, this.css));
        return computeStyle(specified, parent, this.readings);
    }

    walkRoot(root: XmlNode, context: WalkContext): void {
        this.onPath.add(root);
        try {
            this.walkChildren(root, context);
        } finally {
            this.onPath.delete(root);
        }
    }

    walkChildren(node: XmlNode, context: WalkContext): void {
        for (const child of node.children) { this.walk(child, context); }
    }

    walk(node: XmlNode, context: WalkContext): void {
        if (this.segmentsSpent) { return; }
        if (this.visited >= MAX_VISITED_ELEMENTS) {
            this.warnOnce("budget", `The SVG holds more than ${MAX_VISITED_ELEMENTS} elements once its <use> references are expanded; the rest is not imported.`);
            return;
        }
        this.visited++;
        if (!isSvgElement(node) || SILENT.has(node.tag)) { return; }
        if (context.depth > MAX_WALK_DEPTH) {
            this.warnOnce("depth", `The SVG nests more than ${MAX_WALK_DEPTH} levels once its <use> references are expanded; deeper elements are not imported.`);
            return;
        }
        if (!DRAWABLE.has(node.tag) && !CONTAINERS.has(node.tag)) {
            this.warnUnsupported(node.tag);
            return;
        }
        const style = this.styleOf(node, context.style);
        this.warnAboutStyle(style);
        const layer = remembered(this.layers, node, layerNameOf) ?? context.layer;
        const inner: WalkContext = { ...context, matrix: affineProduct2(context.matrix, this.transformOf(node)), style, depth: context.depth + 1, layer };
        this.onPath.add(node);
        try {
            this.visit(node, inner);
        } finally {
            this.onPath.delete(node);
        }
    }

    private warnUnsupported(tag: string): void {
        if (this.warnedTags.has(tag)) { return; }
        this.warnedTags.add(tag);
        if (this.warnedTags.size > MAX_LISTED_TAGS) {
            this.unlistedTags++;
            return;
        }
        this.warnings.push(`<${tag}> is not supported and contributes no geometry.${UNSUPPORTED_HINTS.get(tag) ?? ""}`);
    }

    finish(): void {
        if (this.unlistedTags > 0) { this.warnings.push(unlistedTagsWarning(this.unlistedTags)); }
    }

    transformIn(text: string | undefined): AffineMatrix2 {
        if (text === undefined) { return AFFINE_IDENTITY2; }
        const parsed = parseTransformList(text);
        if (parsed.malformed) { this.warnOnce("transform", malformedTransformWarning(text)); }
        return parsed.matrix;
    }

    private transformOf(node: XmlNode): AffineMatrix2 {
        return remembered(this.transforms, node, (n) => this.transformIn(n.attrs["transform"]));
    }

    private visit(node: XmlNode, context: WalkContext): void {
        switch (node.tag) {
            case "g":
            case "a":
                this.walkChildren(node, context);
                break;
            case "switch": {
                const chosen = remembered(this.choices, node, (n) => n.children.find(isRenderedChoice));
                if (chosen) { this.walk(chosen, context); }
                break;
            }
            case "svg":
                this.walkViewport(node, context, {});
                break;
            case "use":
                this.instantiate(node, context);
                break;
            default:
                this.addElement(node, context);
                break;
        }
    }

    warnAboutStyle(style: StyleState): void {
        for (const property of ["clip-path", "mask"]) {
            const value = style.props[property];
            if (value !== undefined && !isKeyword(value.trim(), "none")) {
                this.warnOnce(property, `${property} is not applied; the elements it would cut are imported whole.`);
            }
        }
        if (style.props["transform"] !== undefined) {
            this.warnOnce("css-transform", "A transform set in CSS or a style attribute is not applied; use the transform attribute.");
        }
        if ((this.readings.dashes(style.props["stroke-dasharray"])?.length ?? 0) > MAX_DASH_VALUES) {
            this.warnOnce("dashes", `A stroke-dasharray holds more than ${MAX_DASH_VALUES} lengths, more than the importer reads; its strokes are read as solid lines.`);
        }
    }

    private lengthIn(text: string | undefined, viewport: ViewportSize, axis: LengthAxis): number | undefined {
        const length = this.readings.length(text);
        return length === undefined ? undefined : pixelsOf(length, viewport, axis);
    }

    private walkViewport(node: XmlNode, context: WalkContext, override: ViewportOverride): void {
        const x = this.lengthIn(node.attrs["x"], context.viewport, "x") ?? 0;
        const y = this.lengthIn(node.attrs["y"], context.viewport, "y") ?? 0;
        const { box, aspect } = remembered(this.viewports, node, (n) => ({ box: parseViewBox(n.attrs["viewBox"]), aspect: parseAspectRatio(n.attrs["preserveAspectRatio"]) }));
        const givenWidth = givenLength(this.readings.length(override.width ?? node.attrs["width"]), context.viewport, "x");
        const givenHeight = givenLength(this.readings.length(override.height ?? node.attrs["height"]), context.viewport, "y");
        if ((givenWidth !== undefined && givenWidth <= 0) || (givenHeight !== undefined && givenHeight <= 0)) { return; }
        const width = viewportLength(givenWidth, context.viewport.width, box?.[2]);
        const height = viewportLength(givenHeight, context.viewport.height, box?.[3]);
        const sized = width > 0 && height > 0;
        const placed = affineProduct2(context.matrix, affineTranslation2(x, y));
        this.walkChildren(node, {
            ...context,
            matrix: box && sized ? affineProduct2(placed, fittedViewBox(box, width, height, aspect)) : placed,
            viewport: box ? { width: box[2], height: box[3] } : sized ? { width, height } : context.viewport,
        });
    }

    private referenceOf(use: XmlNode): UseReference | undefined {
        return remembered(this.references, use, (node) => {
            const href = hrefOf(node);
            if (!href) { return undefined; }
            if (!href.startsWith("#")) {
                this.warnOnce("use-external", `A <use> refers to another file (\`${href}\`), which is not imported.`);
                return undefined;
            }
            const target = this.ids.get(href.slice(1));
            if (!target) { this.warnOnce("use-missing", `A <use> refers to \`${href}\`, which the document does not hold; it imports nothing.`); }
            return { target, cycleWarning: `A <use> refers to \`${href}\`, which contains that <use> itself; it imports nothing.` };
        });
    }

    private instantiate(use: XmlNode, context: WalkContext): void {
        const reference = this.referenceOf(use);
        const target = reference?.target;
        if (!reference || !target) { return; }
        if (this.onPath.has(target)) {
            this.warnOnce("use-cycle", reference.cycleWarning);
            return;
        }
        if (context.useDepth >= MAX_USE_DEPTH) {
            this.warnOnce("use-depth", `<use> references nest more than ${MAX_USE_DEPTH} deep; deeper ones import nothing.`);
            return;
        }
        const x = this.lengthIn(use.attrs["x"], context.viewport, "x") ?? 0;
        const y = this.lengthIn(use.attrs["y"], context.viewport, "y") ?? 0;
        const placed: WalkContext = { ...context, matrix: affineProduct2(context.matrix, affineTranslation2(x, y)), useDepth: context.useDepth + 1 };
        const size: ViewportOverride = { width: use.attrs["width"], height: use.attrs["height"] };
        if (target.tag === "symbol" && isSvgElement(target)) {
            this.instantiateSymbol(target, placed, size);
        } else if (target.tag === "svg" && isSvgElement(target)) {
            this.onPath.add(target);
            try {
                this.walkViewport(target, { ...placed, style: this.styleOf(target, placed.style) }, size);
            } finally {
                this.onPath.delete(target);
            }
        } else {
            this.walk(target, placed);
        }
    }

    private instantiateSymbol(symbol: XmlNode, context: WalkContext, size: ViewportOverride): void {
        const style = this.styleOf(symbol, context.style);
        this.warnAboutStyle(style);
        this.onPath.add(symbol);
        try {
            this.walkViewport(symbol, { ...context, style }, size);
        } finally {
            this.onPath.delete(symbol);
        }
    }

    private addElement(node: XmlNode, context: WalkContext): void {
        const local = this.subpathsOf(node, context.viewport);
        if (local.length === 0) { return; }
        const count = local.reduce((sum, sp) => sum + segmentsDrawn(sp), 0);
        if (!this.segments.affords(count)) {
            this.segmentsSpent = true;
            this.warnOnce("segments", `The SVG holds more than ${this.segments.capacity} path segments once its <use> references are expanded, more than the importer builds from a file of its size; the rest is not imported.`);
            return;
        }
        this.segments.spend(count);
        const element: SvgElement = {
            tag: node.tag,
            style: toSvgStyle(context.style, context.viewport, affineAreaScale2(context.matrix), this.readings),
            subpaths: local.map((sp) => transformSubpath(context.matrix, sp)),
        };
        if (node.attrs["id"]) { element.id = node.attrs["id"]; }
        if (node.attrs["class"]) { element.className = node.attrs["class"]; }
        if (context.layer !== undefined) { element.layer = context.layer; }
        this.elements.push(element);
    }

    private subpathsOf(node: XmlNode, viewport: ViewportSize): SvgSubpath[] {
        if (node.tag === "path") { return remembered(this.outlines, node, (n) => parseSvgPathData(n.attrs["d"] ?? "")); }
        if (!SIZED_BY_VIEWPORT.has(node.tag)) { return remembered(this.outlines, node, (n) => shapeToSubpaths(n.tag, n.attrs)); }
        const inViewports = remembered(this.sizedOutlines, node, () => new Map<string, SvgSubpath[]>());
        return remembered(inViewports, `${viewport.width} ${viewport.height}`, () => shapeToSubpaths(node.tag, node.attrs, this.lengthsIn(node, viewport)));
    }

    private lengthsIn(node: XmlNode, viewport: ViewportSize): LengthOf {
        return (name: string, axis: LengthAxis): number | undefined => this.lengthIn(node.attrs[name], viewport, axis);
    }
}

function stylesheetTexts(root: XmlNode): string[] {
    const texts: string[] = [];
    collect(root, (node) => {
        const type = node.attrs["type"]?.trim().toLowerCase();
        if (node.tag === "style" && isSvgElement(node) && node.text && (!type || type === "text/css")) { texts.push(node.text); }
    });
    return texts;
}

function idsOf(root: XmlNode): Map<string, XmlNode> {
    const ids = new Map<string, XmlNode>();
    collect(root, (node) => {
        const id = node.attrs["id"];
        if (id !== undefined && !ids.has(id)) { ids.set(id, node); }
    });
    return ids;
}

function unsupportedSelectorsWarning(selectors: string[]): string {
    const unique = [...new Set(selectors)];
    const listed = unique.slice(0, MAX_LISTED_SELECTORS).map((s) => `\`${s}\``).join(", ");
    const more = unique.length > MAX_LISTED_SELECTORS ? ` and ${unique.length - MAX_LISTED_SELECTORS} more` : "";
    return `These CSS rules cannot be matched and are not applied: ${listed}${more}.`;
}

export function normalizeSvg(svg: string, options: NormalizeOptions = {}): SvgScene {
    const root = findSvgRoot(parseXml(svg));
    if (!root) {
        return { elements: [], warnings: ["No <svg> root element found."] };
    }
    const frame = documentFrame(root);
    const sheet = parseStylesheets(stylesheetTexts(root), STYLE_PROPERTIES);
    const matching = WorkBudget.forInput(svg.length, SELECTOR_MATCH_STEPS_PER_INPUT_CHARACTER, SELECTOR_MATCH_STEP_FLOOR, SELECTOR_MATCH_STEP_CEILING);
    const css = matchStylesheet(root, sheet, matching);
    const walker = new SceneWalker(idsOf(root), css.matches, WorkBudget.forInput(svg.length, SEGMENTS_PER_INPUT_CHARACTER, SEGMENT_FLOOR, SEGMENT_CEILING));
    if (sheet.unsupported.length > 0) { walker.warnings.push(unsupportedSelectorsWarning(sheet.unsupported)); }
    if (css.exhausted) { walker.warnings.push(`The stylesheet takes more than ${matching.capacity} steps to match against the document, more than the importer allows for a file of its size; the elements after that point are imported without its rules.`); }

    const rootTransform = walker.transformIn(root.attrs["transform"]);
    const unitsPerPixel = options.unit === undefined ? undefined : millimetresPerPixel() / millimetresPerUnitOf(options.unit);
    const onPage = affineProduct2(rootTransform, frame.pageTransform);
    const inUserUnits = rootTransform === AFFINE_IDENTITY2 ? AFFINE_IDENTITY2 : affineProduct2(frame.pageInverse, onPage);
    const matrix = unitsPerPixel === undefined ? inUserUnits : affineProduct2(affineScaling2(unitsPerPixel, unitsPerPixel), onPage);
    const style = walker.styleOf(root, INITIAL_STYLE);
    walker.warnAboutStyle(style);
    walker.walkRoot(root, { matrix, style, viewport: frame.contentViewport, useDepth: 0, depth: 1, layer: undefined });
    walker.finish();

    const scene: SvgScene = { elements: walker.elements, warnings: walker.warnings, millimetresPerUserUnit: frame.millimetresPerUserUnit };
    if (frame.viewBox) { scene.viewBox = frame.viewBox; }
    if (frame.width !== undefined && frame.height !== undefined) {
        scene.width = frame.width;
        scene.height = frame.height;
    }
    return scene;
}
