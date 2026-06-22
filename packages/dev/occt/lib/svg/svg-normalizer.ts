/**
 * Normalizer: walks the parsed XML tree, accumulates the transform stack and a
 * (pragmatic) style cascade, expands every drawable element into transformed
 * subpaths, and emits the flat SvgScene the OCCT builder consumes.
 *
 * Scope of the style cascade: presentation attributes + inline `style="..."`
 * inherited down the tree. Full external/embedded CSS stylesheet selectors are
 * intentionally out of scope (rare in machine-generated SVG); when a <style>
 * element is present we record a warning rather than silently mis-styling.
 */

import { SvgElement, SvgScene, SvgStyle, SvgSubpath } from "./svg-models";
import { parsePathData } from "./svg-path-parser";
import { shapeToSubpaths } from "./svg-shapes";
import { IDENTITY, Matrix, multiply, parseTransform, transformSubpath } from "./svg-transform";
import { parseXml, XmlNode } from "./svg-xml";

const DRAWABLE = new Set(["path", "rect", "circle", "ellipse", "line", "polyline", "polygon"]);
const SKIP_GEOMETRY = new Set(["defs", "symbol", "clippath", "mask", "marker", "pattern", "metadata", "title", "desc"]);

const STYLE_KEYS = [
    "fill", "stroke", "stroke-width", "opacity", "fill-opacity",
    "stroke-opacity", "fill-rule", "display", "visibility",
];

function parseInlineStyle(style: string | undefined): { [k: string]: string } {
    const out: { [k: string]: string } = {};
    if (!style) { return out; }
    for (const decl of style.split(";")) {
        const idx = decl.indexOf(":");
        if (idx === -1) { continue; }
        const key = decl.slice(0, idx).trim().toLowerCase();
        const val = decl.slice(idx + 1).trim();
        if (val) { out[key] = val; }
    }
    return out;
}

/** Resolve presentation values for a node, layering inline style over attributes. */
function resolveStyleProps(node: XmlNode, inherited: { [k: string]: string }): { [k: string]: string } {
    const props: { [k: string]: string } = { ...inherited };
    for (const key of STYLE_KEYS) {
        if (node.attrs[key] !== undefined) { props[key] = node.attrs[key]; }
    }
    const inline = parseInlineStyle(node.attrs.style);
    for (const key of Object.keys(inline)) { props[key] = inline[key]; }
    return props;
}

function num(v: string | undefined): number | undefined {
    if (v === undefined) { return undefined; }
    const f = parseFloat(v);
    return Number.isNaN(f) ? undefined : f;
}

function toStyle(props: { [k: string]: string }): SvgStyle {
    const style: SvgStyle = {};
    if (props.fill !== undefined) { style.fill = props.fill; }
    if (props.stroke !== undefined) { style.stroke = props.stroke; }
    const sw = num(props["stroke-width"]);
    if (sw !== undefined) { style.strokeWidth = sw; }
    const op = num(props.opacity);
    if (op !== undefined) { style.opacity = op; }
    const fo = num(props["fill-opacity"]);
    if (fo !== undefined) { style.fillOpacity = fo; }
    const so = num(props["stroke-opacity"]);
    if (so !== undefined) { style.strokeOpacity = so; }
    if (props["fill-rule"] === "evenodd" || props["fill-rule"] === "nonzero") {
        style.fillRule = props["fill-rule"];
    }
    if (props.display === "none" || props.visibility === "hidden" || props.visibility === "collapse") {
        style.hidden = true;
    }
    return style;
}

function parseViewBox(v: string | undefined): [number, number, number, number] | undefined {
    if (!v) { return undefined; }
    const n = v.split(/[\s,]+/).map(parseFloat).filter((x) => !Number.isNaN(x));
    return n.length === 4 ? [n[0], n[1], n[2], n[3]] : undefined;
}

function subpathsForNode(node: XmlNode, warnings: string[]): SvgSubpath[] {
    if (node.tag === "path") {
        const d = node.attrs.d;
        if (!d) { return []; }
        try {
            return parsePathData(d);
        } catch (e) {
            warnings.push(`Failed to parse path data: ${(e as Error).message}`);
            return [];
        }
    }
    return shapeToSubpaths(node.tag, node.attrs);
}

/** Parse an SVG string and reduce it to a flat scene of styled, transformed elements. */
export function normalizeSvg(svg: string): SvgScene {
    const warnings: string[] = [];
    const root = parseXml(svg);
    if (!root || (root.tag !== "svg" && root.tag !== "#root")) {
        warnings.push("No <svg> root element found.");
        return { elements: [], warnings };
    }
    const svgRoot = root.tag === "svg" ? root : root.children.find((c) => c.tag === "svg");
    if (!svgRoot) {
        warnings.push("No <svg> root element found.");
        return { elements: [], warnings };
    }

    const viewBox = parseViewBox(svgRoot.attrs.viewBox);
    const width = num(svgRoot.attrs.width);
    const height = num(svgRoot.attrs.height);

    const elements: SvgElement[] = [];
    let warnedStyleEl = false;

    const walk = (node: XmlNode, parentMatrix: Matrix, inheritedProps: { [k: string]: string }): void => {
        if (node.tag === "style" && !warnedStyleEl) {
            warnings.push("Embedded <style> CSS is not applied; use presentation attributes or inline style for styling.");
            warnedStyleEl = true;
        }
        if (SKIP_GEOMETRY.has(node.tag)) { return; }

        const matrix = multiply(parentMatrix, parseTransform(node.attrs.transform));
        const props = resolveStyleProps(node, inheritedProps);

        if (DRAWABLE.has(node.tag)) {
            const local = subpathsForNode(node, warnings);
            if (local.length > 0) {
                const subpaths = local.map((sp) => transformSubpath(matrix, sp));
                const el: SvgElement = {
                    tag: node.tag,
                    style: toStyle(props),
                    subpaths,
                };
                if (node.attrs.id) { el.id = node.attrs.id; }
                if (node.attrs.class) { el.className = node.attrs.class; }
                elements.push(el);
            }
        }

        for (const child of node.children) { walk(child, matrix, props); }
    };

    // Root <svg> may itself carry a transform; start the cascade from its props.
    const rootMatrix = multiply(IDENTITY, parseTransform(svgRoot.attrs.transform));
    const rootProps = resolveStyleProps(svgRoot, {});
    for (const child of svgRoot.children) { walk(child, rootMatrix, rootProps); }

    const scene: SvgScene = { elements, warnings };
    if (viewBox) { scene.viewBox = viewBox; }
    if (width !== undefined) { scene.width = width; }
    if (height !== undefined) { scene.height = height; }
    return scene;
}
