import { describe, it, expect } from "vitest";
import type { SvgArcSegment } from "./svg-scene-types";
import { shapeToSubpaths } from "./svg-shapes";

describe("svg basic shapes", () => {
    it("expands a polygon into a closed line subpath", () => {
        const sp = shapeToSubpaths("polygon", { points: "0,0 10,0 10,10" });
        expect(sp[0]!.closed).toBe(true);
        expect(sp[0]!.segments).toHaveLength(2);
        expect(sp[0]!.start).toEqual([0, 0]);
    });

    it("expands a polyline into an OPEN line subpath", () => {
        const sp = shapeToSubpaths("polyline", { points: "0,0 10,0 10,10" });
        expect(sp[0]!.closed).toBe(false);
    });

    it("expands a line element", () => {
        const sp = shapeToSubpaths("line", { x1: "0", y1: "0", x2: "5", y2: "7" });
        expect(sp[0]!.start).toEqual([0, 0]);
        expect(sp[0]!.segments[0]).toEqual({ type: "line", to: [5, 7] });
        expect(sp[0]!.closed).toBe(false);
    });

    it("expands a circle into two arcs (closed)", () => {
        const sp = shapeToSubpaths("circle", { cx: "5", cy: "5", r: "3" });
        expect(sp[0]!.segments).toHaveLength(2);
        expect(sp[0]!.segments.every((s) => s.type === "arc")).toBe(true);
        expect(sp[0]!.closed).toBe(true);
    });

    it("expands an ellipse with distinct radii", () => {
        const sp = shapeToSubpaths("ellipse", { cx: "0", cy: "0", rx: "4", ry: "2" });
        const arc = sp[0]!.segments[0] as SvgArcSegment;
        expect(arc.rx).toBe(4);
        expect(arc.ry).toBe(2);
    });

    it("creates a sharp rect as a closed loop", () => {
        const sp = shapeToSubpaths("rect", { x: "0", y: "0", width: "10", height: "5" });
        expect(sp[0]!.segments).toHaveLength(3);
        expect(sp[0]!.closed).toBe(true);
    });

    it("creates a rounded rect with four arcs", () => {
        const sp = shapeToSubpaths("rect", { x: "0", y: "0", width: "10", height: "10", rx: "2" });
        expect(sp[0]!.segments.filter((s) => s.type === "arc")).toHaveLength(4);
    });

    it("defaults ry to rx when only rx is given", () => {
        const sp = shapeToSubpaths("rect", { x: "0", y: "0", width: "10", height: "10", rx: "2" });
        const arc = sp[0]!.segments.find((s) => s.type === "arc") as SvgArcSegment;
        expect(arc.rx).toBe(2);
        expect(arc.ry).toBe(2);
    });

    it("clamps corner radius to half the smaller side", () => {
        const sp = shapeToSubpaths("rect", { x: "0", y: "0", width: "10", height: "10", rx: "100" });
        const arc = sp[0]!.segments.find((s) => s.type === "arc") as SvgArcSegment;
        expect(arc.rx).toBe(5);
    });

    it("should read points packed by their signs and decimal points", () => {
        // Act
        const sp = shapeToSubpaths("polygon", { points: "0,0 10-10 .5.5" });

        // Assert
        expect(sp[0]!.start).toEqual([0, 0]);
        expect(sp[0]!.segments).toEqual([{ type: "line", to: [10, -10] }, { type: "line", to: [0.5, 0.5] }]);
    });

    it("should take a rect corner radius of auto from the other radius", () => {
        // Act
        const sp = shapeToSubpaths("rect", { width: "10", height: "10", rx: "auto", ry: "3" });

        // Assert
        const arc = sp[0]!.segments.find((s) => s.type === "arc") as SvgArcSegment;
        expect([arc.rx, arc.ry]).toEqual([3, 3]);
    });

    it("should take an ellipse's missing radius from the one it has", () => {
        // Act
        const sp = shapeToSubpaths("ellipse", { rx: "4" });

        // Assert
        const arc = sp[0]!.segments[0] as SvgArcSegment;
        expect([arc.rx, arc.ry]).toEqual([4, 4]);
    });

    it("should take an ellipse's missing horizontal radius from its vertical one", () => {
        // Act
        const sp = shapeToSubpaths("ellipse", { ry: "3" });

        // Assert
        const arc = sp[0]!.segments[0] as SvgArcSegment;
        expect([arc.rx, arc.ry]).toEqual([3, 3]);
    });

    it("should make no geometry of an ellipse with no radius at all", () => {
        // Act
        const sp = shapeToSubpaths("ellipse", { cx: "1", cy: "2" });

        // Assert
        expect(sp).toEqual([]);
    });

    it("returns [] for unsupported tags and zero-size shapes", () => {
        expect(shapeToSubpaths("text", {})).toEqual([]);
        expect(shapeToSubpaths("rect", { width: "0", height: "0" })).toEqual([]);
    });
});
