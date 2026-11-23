import { describe, it, expect } from "vitest";
import { InputError, Inputs as BaseInputs } from "@bitbybit-dev/base";
import { annotationsDrawingOf, annotationsInView, documentAnnotationsInputs, documentMeshInputs } from "./draw-annotations";
import type * as Inputs from "./inputs";
import type * as Models from "./models";

type Point3 = Inputs.Base.Point3;

const ring = (z: number): Point3[][] => [
    [[1, 1, z], [1, 5, z], [5, 5, z], [5, 1, z]],
    [[2, 2, z], [2, 4, z], [4, 4, z], [4, 2, z]],
];

const annotation = (label: string, more: Partial<Models.OCCT.DocumentAnnotation> = {}): Models.OCCT.DocumentAnnotation => ({
    label,
    kind: "dimension",
    type: "Size_Diameter",
    name: "",
    value: 5,
    attached: 1,
    lines: [[[0, 0, 0], [10, 0, 0], [10, 5, 0]]],
    fills: [],
    ...more,
});

const view = (name: string, annotations: string[]): Models.OCCT.DocumentSavedView => ({
    label: `view ${name}`, name, isParallel: true, eye: [0, 0, 50], direction: [0, 0, -1], up: [0, 1, 0], width: 80, height: 60, annotations,
});

const document = (annotations: Models.OCCT.DocumentAnnotation[], views: Models.OCCT.DocumentSavedView[] = []): Models.OCCT.DocumentAnnotations =>
    ({ annotations, views, leftOut: { annotations: 0, views: 0 } });

const areaOf = (positions: readonly number[], indices: readonly number[]): number => {
    let twice = 0;
    for (let at = 0; at < indices.length; at += 3) {
        const [a, b, c] = [indices[at]! * 3, indices[at + 1]! * 3, indices[at + 2]! * 3];
        twice += Math.abs((positions[b]! - positions[a]!) * (positions[c + 1]! - positions[a + 1]!) - (positions[b + 1]! - positions[a + 1]!) * (positions[c]! - positions[a]!));
    }
    return twice / 2;
};

describe("documentMeshInputs and documentAnnotationsInputs", () => {
    const { keep, zUpToYUp, yUpToZUp } = BaseInputs.Base.upAxisConversionEnum;

    it("should ask for the document meshed with the drawing's settings and turned by its upAxis", () => {
        // Arrange
        const meshing = { precision: 0.05, angularDeflection: 0.3, relativeDeflection: true, keepMeshData: true, allowQualityDecrease: false, forceFaceDeflection: true, upAxis: keep };

        // Act
        const inputs = documentMeshInputs("doc", meshing);
        const turned = documentMeshInputs("doc", { ...meshing, upAxis: zUpToYUp });

        // Assert
        expect(inputs).toEqual({ document: "doc", precision: 0.05, upAxis: keep, keepMeshData: true, allowQualityDecrease: false, forceFaceDeflection: true, angularDeflection: 0.3, relativeDeflection: true });
        expect(turned).toEqual({ ...inputs, upAxis: zUpToYUp });
    });

    it("should ask for the annotations at the drawing's precision, turned as the parts are", () => {
        // Arrange
        const meshing = { precision: 0.05, angularDeflection: 0.3, relativeDeflection: true, keepMeshData: true, allowQualityDecrease: false, forceFaceDeflection: true, upAxis: zUpToYUp };

        // Act
        const inputs = documentAnnotationsInputs("doc", meshing);
        const toZUp = documentAnnotationsInputs("doc", { ...meshing, upAxis: yUpToZUp });

        // Assert
        expect(inputs).toEqual({ document: "doc", deflection: 0.05, upAxis: zUpToYUp });
        expect(toZUp).toEqual({ document: "doc", deflection: 0.05, upAxis: yUpToZUp });
    });
});

describe("annotationsInView", () => {
    const front = annotation("0:1:4:1");
    const top = annotation("0:1:4:2");
    const both = annotation("0:1:4:3");
    const all = document([front, top, both], [view("FRONT", ["0:1:4:1", "0:1:4:3"]), view("TOP", ["0:1:4:2", "0:1:4:3"])]);

    it("should give every annotation when no view is named, or the name is empty", () => {
        // Act
        const unnamed = annotationsInView(all, undefined);
        const empty = annotationsInView(all, "");

        // Assert
        expect(unnamed).toEqual([front, top, both]);
        expect(empty).toEqual([front, top, both]);
    });

    it("should give only the annotations the named view shows, in the document's order", () => {
        // Act
        const shown = annotationsInView(all, "TOP");

        // Assert
        expect(shown).toEqual([top, both]);
    });

    it("should give every copy of an annotation placed several times, the copies sharing its label", () => {
        // Arrange
        const placed = document([annotation("0:1:4:1", { product: 1, instance: 0 }), annotation("0:1:4:1", { product: 1, instance: 1 })], [view("FRONT", ["0:1:4:1"])]);

        // Act
        const shown = annotationsInView(placed, "FRONT");

        // Assert
        expect(shown.map(entry => entry.instance)).toEqual([0, 1]);
    });

    it("should join the annotations of every view that bears the name", () => {
        // Arrange
        const twice = document([front, top], [view("SECTION", ["0:1:4:1"]), view("SECTION", ["0:1:4:2"])]);

        // Act
        const shown = annotationsInView(twice, "SECTION");

        // Assert
        expect(shown).toEqual([front, top]);
    });

    it("should refuse a name no saved view bears, naming the views there are", () => {
        // Act
        const act = (): unknown => annotationsInView(all, "SIDE");

        // Assert
        expect(act).toThrow(new InputError("`annotationsView` is \"SIDE\", which no saved view of the document is called; its views are \"FRONT\", \"TOP\".", "annotationsView"));
    });

    it("should refuse a name when the document saves no views, saying so", () => {
        // Act
        const act = (): unknown => annotationsInView(document([front]), "FRONT");

        // Assert
        expect(act).toThrow(new InputError("`annotationsView` is \"FRONT\", which no saved view of the document is called; it saves no views.", "annotationsView"));
    });
});

describe("annotationsDrawingOf", () => {
    it("should draw every line of every annotation as a polyline, in order", () => {
        // Arrange
        const annotations = [annotation("a"), annotation("b", { lines: [[[0, 0, 1], [1, 1, 1]]] })];

        // Act
        const drawing = annotationsDrawingOf(annotations, true);

        // Assert
        expect(drawing.lines).toEqual([[[0, 0, 0], [10, 0, 0], [10, 5, 0]], [[0, 0, 1], [1, 1, 1]]]);
        expect(drawing.positions).toEqual([]);
        expect(drawing.indices).toEqual([]);
    });

    it("should fill a letter's loops under the even-odd rule, its hole left open", () => {
        // Arrange
        const annotations = [annotation("a", { lines: [], fills: ring(35) })];

        // Act
        const drawing = annotationsDrawingOf(annotations, true);

        // Assert
        expect(drawing.lines).toEqual([]);
        expect(drawing.positions).toHaveLength(8 * 3);
        expect(areaOf(drawing.positions, drawing.indices)).toBeCloseTo(16 - 4, 12);
    });

    it("should number the corners of each annotation's letters after those of the one before", () => {
        // Arrange
        const annotations = [annotation("a", { fills: ring(0) }), annotation("b", { fills: ring(10) })];

        // Act
        const drawing = annotationsDrawingOf(annotations, true);

        // Assert
        expect(drawing.positions).toHaveLength(16 * 3);
        expect(Math.min(...drawing.indices.slice(drawing.indices.length / 2))).toBeGreaterThanOrEqual(8);
        expect(areaOf(drawing.positions, drawing.indices)).toBeCloseTo(2 * 12, 12);
    });

    it("should outline the letters instead, each loop closed among the lines, when they are not filled", () => {
        // Arrange
        const annotations = [annotation("a", { lines: [], fills: ring(35) })];

        // Act
        const drawing = annotationsDrawingOf(annotations, false);

        // Assert
        expect(drawing.lines).toEqual(ring(35).map(loop => [...loop, loop[0]!]));
        expect(drawing.positions).toEqual([]);
        expect(drawing.indices).toEqual([]);
    });

    it("should skip lines of one point and loops that enclose nothing", () => {
        // Arrange
        const annotations = [annotation("a", { lines: [[[0, 0, 0]]], fills: [[[0, 0, 0], [1, 0, 0], [2, 0, 0]]] })];

        // Act
        const drawing = annotationsDrawingOf(annotations, true);

        // Assert
        expect(drawing).toEqual({ lines: [], positions: [], indices: [] });
    });

    it("should leave the annotations it was given as they were", () => {
        // Arrange
        const annotations = [annotation("a", { fills: ring(0) })];
        const before = JSON.stringify(annotations);

        // Act
        annotationsDrawingOf(annotations, false);
        annotationsDrawingOf(annotations, true);

        // Assert
        expect(JSON.stringify(annotations)).toBe(before);
    });
});
