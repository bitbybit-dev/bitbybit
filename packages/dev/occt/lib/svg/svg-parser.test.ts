import { parsePathData } from "./svg-path-parser";
import { applyToPoint, parseTransform, transformSegment } from "./svg-transform";
import { shapeToSubpaths } from "./svg-shapes";
import { parseXml } from "./svg-xml";
import { normalizeSvg } from "./svg-normalizer";
import { SvgArcSegment, SvgCubicSegment, SvgLineSegment, SvgQuadSegment } from "./svg-models";

const near = (a: number, b: number, eps = 1e-9): boolean => Math.abs(a - b) < eps;

describe("svg path-data parser", () => {
    it("parses absolute M/L into one open subpath", () => {
        const sp = parsePathData("M 10 20 L 30 40 L 50 60");
        expect(sp).toHaveLength(1);
        expect(sp[0].start).toEqual([10, 20]);
        expect(sp[0].segments).toHaveLength(2);
        expect(sp[0].segments[0]).toEqual({ type: "line", to: [30, 40] });
        expect(sp[0].closed).toBe(false);
    });

    it("treats implicit coordinate pairs after M as linetos", () => {
        const sp = parsePathData("M0 0 1 1 2 2");
        expect(sp[0].segments).toEqual([
            { type: "line", to: [1, 1] },
            { type: "line", to: [2, 2] },
        ]);
    });

    it("treats implicit pairs after relative m as relative linetos", () => {
        const sp = parsePathData("m0 0 1 1 1 1");
        expect(sp[0].segments).toEqual([
            { type: "line", to: [1, 1] },
            { type: "line", to: [2, 2] },
        ]);
    });

    it("handles relative commands and H/V (absolute + relative)", () => {
        const sp = parsePathData("M10 10 h5 v5 l-5 0 z");
        expect(sp[0].segments[0]).toEqual({ type: "line", to: [15, 10] });
        expect(sp[0].segments[1]).toEqual({ type: "line", to: [15, 15] });
        expect(sp[0].segments[2]).toEqual({ type: "line", to: [10, 15] });
        expect(sp[0].closed).toBe(true);
    });

    it("handles absolute H and V", () => {
        const sp = parsePathData("M0 0 H10 V10");
        expect(sp[0].segments[0]).toEqual({ type: "line", to: [10, 0] });
        expect(sp[0].segments[1]).toEqual({ type: "line", to: [10, 10] });
    });

    it("parses scientific notation and sign-packed numbers", () => {
        const sp = parsePathData("M1e2 1E1 L-5-5");
        expect(sp[0].start).toEqual([100, 10]);
        expect(sp[0].segments[0]).toEqual({ type: "line", to: [-5, -5] });
    });

    it("parses decimals without separators (M.5.5)", () => {
        const sp = parsePathData("M.5.5 L1.5.5");
        expect(sp[0].start).toEqual([0.5, 0.5]);
        expect(sp[0].segments[0]).toEqual({ type: "line", to: [1.5, 0.5] });
    });

    it("reflects the control point for smooth cubic S", () => {
        const sp = parsePathData("M0 0 C1 1 2 2 3 3 S5 5 6 6");
        const smooth = sp[0].segments[1] as SvgCubicSegment;
        expect(smooth.c1).toEqual([4, 4]); // reflection of (2,2) about (3,3)
        expect(smooth.c2).toEqual([5, 5]);
        expect(smooth.to).toEqual([6, 6]);
    });

    it("treats S with no preceding cubic as using current point for first control", () => {
        const sp = parsePathData("M2 2 S5 5 6 6");
        const seg = sp[0].segments[0] as SvgCubicSegment;
        expect(seg.c1).toEqual([2, 2]); // no reflection -> current point
    });

    it("reflects the control point for smooth quadratic T", () => {
        const sp = parsePathData("M0 0 Q1 2 2 0 T6 0");
        const t = sp[0].segments[1] as SvgQuadSegment;
        // reflection of (1,2) about endpoint (2,0) -> (3,-2)
        expect(t.c).toEqual([3, -2]);
        expect(t.to).toEqual([6, 0]);
    });

    it("parses packed arc flags", () => {
        const sp = parsePathData("M0 0 a5 5 0 016 6");
        const arc = sp[0].segments[0] as SvgArcSegment;
        expect(arc.type).toBe("arc");
        expect(arc.to).toEqual([6, 6]);
        expect(arc.deltaAngle).toBeGreaterThan(0); // sweep=1
    });

    it("converts a semicircle arc to center form", () => {
        const sp = parsePathData("M0 0 A10 10 0 0 1 20 0");
        const arc = sp[0].segments[0] as SvgArcSegment;
        expect(near(arc.center[0], 10)).toBe(true);
        expect(near(arc.center[1], 0)).toBe(true);
        expect(near(arc.rx, 10)).toBe(true);
        expect(near(Math.abs(arc.deltaAngle), Math.PI)).toBe(true);
    });

    it("sets sweep sign from the sweep flag", () => {
        const cw = parsePathData("M0 0 A10 10 0 0 0 20 0")[0].segments[0] as SvgArcSegment;
        const ccw = parsePathData("M0 0 A10 10 0 0 1 20 0")[0].segments[0] as SvgArcSegment;
        expect(cw.deltaAngle).toBeLessThan(0);
        expect(ccw.deltaAngle).toBeGreaterThan(0);
    });

    it("falls back to a line when arc radius is zero", () => {
        const sp = parsePathData("M0 0 A0 0 0 0 1 10 10");
        expect(sp[0].segments[0]).toEqual({ type: "line", to: [10, 10] } as SvgLineSegment);
    });

    it("scales up out-of-range arc radii", () => {
        // endpoints 40 apart but radius only 10 -> radii must scale to >= 20
        const arc = parsePathData("M0 0 A10 10 0 0 1 40 0")[0].segments[0] as SvgArcSegment;
        expect(arc.rx).toBeGreaterThanOrEqual(20 - 1e-9);
    });

    it("starts a new subpath after Z", () => {
        const sp = parsePathData("M0 0 L1 0 Z M2 2 L3 2");
        expect(sp).toHaveLength(2);
        expect(sp[0].closed).toBe(true);
        expect(sp[1].start).toEqual([2, 2]);
    });

    it("ignores a lone moveto with no geometry", () => {
        const sp = parsePathData("M5 5");
        expect(sp).toHaveLength(0);
    });
});

describe("svg transform", () => {
    it("returns identity for missing/empty transform", () => {
        expect(parseTransform(undefined)).toEqual([1, 0, 0, 1, 0, 0]);
        expect(parseTransform("")).toEqual([1, 0, 0, 1, 0, 0]);
    });

    it("composes translate then scale correctly", () => {
        const m = parseTransform("translate(10 20) scale(2)");
        expect(applyToPoint(m, [1, 1])).toEqual([12, 22]);
    });

    it("parses matrix() directly", () => {
        const m = parseTransform("matrix(1 0 0 1 5 6)");
        expect(applyToPoint(m, [0, 0])).toEqual([5, 6]);
    });

    it("rotates 90 degrees about origin", () => {
        const p = applyToPoint(parseTransform("rotate(90)"), [1, 0]);
        expect(near(p[0], 0)).toBe(true);
        expect(near(p[1], 1)).toBe(true);
    });

    it("rotates about a center point", () => {
        const p = applyToPoint(parseTransform("rotate(90 1 0)"), [1, 0]);
        expect(near(p[0], 1)).toBe(true);
        expect(near(p[1], 0)).toBe(true);
    });

    it("applies single-arg scale uniformly", () => {
        expect(applyToPoint(parseTransform("scale(3)"), [2, 4])).toEqual([6, 12]);
    });

    it("applies skewX", () => {
        const p = applyToPoint(parseTransform("skewX(45)"), [0, 1]);
        expect(near(p[0], 1)).toBe(true);
        expect(near(p[1], 1)).toBe(true);
    });

    it("transforms cubic control points exactly", () => {
        const seg = transformSegment(parseTransform("translate(5 0)"),
            { type: "cubic", c1: [0, 0], c2: [1, 1], to: [2, 2] }) as SvgCubicSegment;
        expect(seg.c1).toEqual([5, 0]);
        expect(seg.to).toEqual([7, 2]);
    });

    it("transforms quad control points exactly", () => {
        const seg = transformSegment(parseTransform("scale(2)"),
            { type: "quad", c: [1, 1], to: [2, 2] }) as SvgQuadSegment;
        expect(seg.c).toEqual([2, 2]);
        expect(seg.to).toEqual([4, 4]);
    });

    it("keeps a uniformly scaled circle arc as a circle arc", () => {
        const arc: SvgArcSegment = {
            type: "arc", to: [20, 0], center: [10, 0], rx: 10, ry: 10,
            xAxisRotation: 0, startAngle: Math.PI, deltaAngle: -Math.PI,
        };
        const out = transformSegment(parseTransform("scale(2)"), arc) as SvgArcSegment;
        expect(near(out.rx, 20)).toBe(true);
        expect(near(out.ry, 20)).toBe(true);
        expect(near(out.center[0], 20)).toBe(true);
    });

    it("turns a circle arc into an ellipse arc under non-uniform scale", () => {
        const arc: SvgArcSegment = {
            type: "arc", to: [10, 0], center: [0, 0], rx: 10, ry: 10,
            xAxisRotation: 0, startAngle: Math.PI, deltaAngle: -Math.PI,
        };
        const out = transformSegment(parseTransform("scale(1 0.5)"), arc) as SvgArcSegment;
        const radii = [out.rx, out.ry].sort((a, b) => a - b);
        expect(near(radii[0], 5)).toBe(true);
        expect(near(radii[1], 10)).toBe(true);
    });

    it("flips sweep direction under a reflection (flipY)", () => {
        const arc: SvgArcSegment = {
            type: "arc", to: [20, 0], center: [10, 0], rx: 10, ry: 10,
            xAxisRotation: 0, startAngle: 0, deltaAngle: Math.PI,
        };
        const out = transformSegment(parseTransform("scale(1 -1)"), arc) as SvgArcSegment;
        expect(Math.sign(out.deltaAngle)).toBe(-Math.sign(arc.deltaAngle));
    });
});

describe("svg basic shapes", () => {
    it("expands a polygon into a closed line subpath", () => {
        const sp = shapeToSubpaths("polygon", { points: "0,0 10,0 10,10" });
        expect(sp[0].closed).toBe(true);
        expect(sp[0].segments).toHaveLength(2);
        expect(sp[0].start).toEqual([0, 0]);
    });

    it("expands a polyline into an OPEN line subpath", () => {
        const sp = shapeToSubpaths("polyline", { points: "0,0 10,0 10,10" });
        expect(sp[0].closed).toBe(false);
    });

    it("expands a line element", () => {
        const sp = shapeToSubpaths("line", { x1: "0", y1: "0", x2: "5", y2: "7" });
        expect(sp[0].start).toEqual([0, 0]);
        expect(sp[0].segments[0]).toEqual({ type: "line", to: [5, 7] });
        expect(sp[0].closed).toBe(false);
    });

    it("expands a circle into two arcs (closed)", () => {
        const sp = shapeToSubpaths("circle", { cx: "5", cy: "5", r: "3" });
        expect(sp[0].segments).toHaveLength(2);
        expect(sp[0].segments.every((s) => s.type === "arc")).toBe(true);
        expect(sp[0].closed).toBe(true);
    });

    it("expands an ellipse with distinct radii", () => {
        const sp = shapeToSubpaths("ellipse", { cx: "0", cy: "0", rx: "4", ry: "2" });
        const arc = sp[0].segments[0] as SvgArcSegment;
        expect(arc.rx).toBe(4);
        expect(arc.ry).toBe(2);
    });

    it("creates a sharp rect as a closed loop", () => {
        const sp = shapeToSubpaths("rect", { x: "0", y: "0", width: "10", height: "5" });
        expect(sp[0].segments).toHaveLength(3);
        expect(sp[0].closed).toBe(true);
    });

    it("creates a rounded rect with four arcs", () => {
        const sp = shapeToSubpaths("rect", { x: "0", y: "0", width: "10", height: "10", rx: "2" });
        expect(sp[0].segments.filter((s) => s.type === "arc")).toHaveLength(4);
    });

    it("defaults ry to rx when only rx is given", () => {
        const sp = shapeToSubpaths("rect", { x: "0", y: "0", width: "10", height: "10", rx: "2" });
        const arc = sp[0].segments.find((s) => s.type === "arc") as SvgArcSegment;
        expect(arc.rx).toBe(2);
        expect(arc.ry).toBe(2);
    });

    it("clamps corner radius to half the smaller side", () => {
        const sp = shapeToSubpaths("rect", { x: "0", y: "0", width: "10", height: "10", rx: "100" });
        const arc = sp[0].segments.find((s) => s.type === "arc") as SvgArcSegment;
        expect(arc.rx).toBe(5);
    });

    it("returns [] for unsupported tags and zero-size shapes", () => {
        expect(shapeToSubpaths("text", {})).toEqual([]);
        expect(shapeToSubpaths("rect", { width: "0", height: "0" })).toEqual([]);
    });
});

describe("xml parser", () => {
    it("parses nested elements and attributes", () => {
        const root = parseXml("<svg width=\"10\"><g id=\"a\"><rect x=\"1\"/></g></svg>");
        expect(root?.tag).toBe("svg");
        expect(root?.attrs.width).toBe("10");
        expect(root?.children[0].tag).toBe("g");
        expect(root?.children[0].children[0].tag).toBe("rect");
    });

    it("handles single-quoted attributes", () => {
        const root = parseXml("<svg><rect x='3' y='4'/></svg>");
        expect(root?.children[0].attrs.x).toBe("3");
        expect(root?.children[0].attrs.y).toBe("4");
    });

    it("skips comments, CDATA, PI and DOCTYPE; decodes entities", () => {
        const root = parseXml("<?xml version='1.0'?><!DOCTYPE svg><svg><!-- c --><![CDATA[x]]><text>a &amp; b</text></svg>");
        expect(root?.tag).toBe("svg");
        expect(root?.children[0].tag).toBe("text");
    });

    it("strips namespace prefixes from tag names", () => {
        const root = parseXml("<svg:svg><svg:rect/></svg:svg>");
        expect(root?.tag).toBe("svg");
        expect(root?.children[0].tag).toBe("rect");
    });

    it("returns undefined when there is no element", () => {
        expect(parseXml("not xml at all")).toBeUndefined();
    });
});

describe("normalizeSvg", () => {
    it("flattens a styled, transformed document", () => {
        const svg = `<svg viewBox="0 0 100 100" width="100" height="100">
            <g transform="translate(10 0)" fill="red">
                <rect x="0" y="0" width="10" height="10" stroke-width="2"/>
                <path d="M0 0 L10 0" stroke="#00ff00"/>
            </g>
        </svg>`;
        const scene = normalizeSvg(svg);
        expect(scene.viewBox).toEqual([0, 0, 100, 100]);
        expect(scene.width).toBe(100);
        expect(scene.elements).toHaveLength(2);
        const rect = scene.elements[0];
        expect(rect.tag).toBe("rect");
        expect(rect.style.fill).toBe("red");
        expect(rect.style.strokeWidth).toBe(2);
        expect(rect.subpaths[0].start[0]).toBeCloseTo(10);
        expect(scene.elements[1].style.fill).toBe("red");
        expect(scene.elements[1].style.stroke).toBe("#00ff00");
    });

    it("accumulates nested group transforms", () => {
        const svg = `<svg><g transform="translate(10 0)"><g transform="translate(0 5)">
            <rect x="0" y="0" width="2" height="2"/></g></g></svg>`;
        const scene = normalizeSvg(svg);
        expect(scene.elements[0].subpaths[0].start[0]).toBeCloseTo(10);
        expect(scene.elements[0].subpaths[0].start[1]).toBeCloseTo(5);
    });

    it("lets inline style override presentation attributes", () => {
        const svg = `<svg><rect x="0" y="0" width="5" height="5" style="fill:blue" fill="red"/></svg>`;
        expect(normalizeSvg(svg).elements[0].style.fill).toBe("blue");
    });

    it("marks hidden via display:none and visibility:hidden", () => {
        const a = normalizeSvg(`<svg><rect width="5" height="5" style="display:none"/></svg>`);
        const b = normalizeSvg(`<svg><rect width="5" height="5" visibility="hidden"/></svg>`);
        expect(a.elements[0].style.hidden).toBe(true);
        expect(b.elements[0].style.hidden).toBe(true);
    });

    it("captures fill-rule, opacity, id and class", () => {
        const svg = `<svg><path id="p1" class="c1" fill-rule="evenodd" opacity="0.5" d="M0 0 L1 0 Z"/></svg>`;
        const el = normalizeSvg(svg).elements[0];
        expect(el.style.fillRule).toBe("evenodd");
        expect(el.style.opacity).toBe(0.5);
        expect(el.id).toBe("p1");
        expect(el.className).toBe("c1");
    });

    it("skips geometry inside defs and symbol", () => {
        const svg = `<svg><defs><rect width="5" height="5"/></defs>
            <symbol><circle r="1"/></symbol><circle cx="0" cy="0" r="1"/></svg>`;
        const scene = normalizeSvg(svg);
        expect(scene.elements).toHaveLength(1);
        expect(scene.elements[0].tag).toBe("circle");
    });

    it("warns about embedded <style> CSS", () => {
        const svg = `<svg><style>.c{fill:red}</style><rect class="c" width="5" height="5"/></svg>`;
        const scene = normalizeSvg(svg);
        expect(scene.warnings.some((w) => w.includes("style"))).toBe(true);
    });

    it("preserves document element ordering", () => {
        const svg = `<svg><rect width="1" height="1"/><circle r="1"/><path d="M0 0 L1 1"/></svg>`;
        const tags = normalizeSvg(svg).elements.map((e) => e.tag);
        expect(tags).toEqual(["rect", "circle", "path"]);
    });

    it("warns when there is no svg root", () => {
        const scene = normalizeSvg("<html></html>");
        expect(scene.elements).toHaveLength(0);
        expect(scene.warnings.length).toBeGreaterThan(0);
    });
});
