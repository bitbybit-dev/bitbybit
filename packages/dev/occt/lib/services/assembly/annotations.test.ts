import { describe, it, expect } from "vitest";
import { BaseBitByBit } from "@bitbybit-dev/base";
import type * as Inputs from "../../api/inputs";
import { documentAnnotationsOf, documentAnnotationsTurned } from "./annotations";
import type { KernelAnnotation, KernelAnnotations } from "./annotations-types";

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const QUARTER_TURN_ABOUT_Z_THEN_UP_10 = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 10, 1];
const ALONG_X_BY_100 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1];

const diameter = (more: Partial<KernelAnnotation> = {}): KernelAnnotation => ({
    entry: "0:1:4:1",
    kind: "dimension",
    type: "Size_Diameter",
    value: 12.5,
    textPoint: [1, 2, 3],
    attached: 1,
    label: "DIM1",
    plane: { origin: [0, 0, 5], normal: [0, 0, 1], direction: [1, 0, 0] },
    lines: [[0, 0, 5, 10, 0, 5], [10, 0, 5, 10, 4, 5, 12, 4, 5]],
    fills: [[1, 1, 5, 2, 1, 5, 2, 2, 5]],
    facing: [0, 0, 1],
    ...more,
});

const textOf = (annotations: KernelAnnotation[], more: Partial<KernelAnnotations> = {}): KernelAnnotations => ({
    annotations,
    views: [],
    products: [],
    leftOut: { annotations: 0, views: 0 },
    ...more,
});

describe("documentAnnotationsOf", () => {
    const base = new BaseBitByBit();

    it("should read an annotation of the whole model as written, its paths as points", () => {
        // Arrange
        const text = textOf([diameter()]);

        // Act
        const read = documentAnnotationsOf(text, base);

        // Assert
        expect(read.annotations).toEqual([{
            label: "0:1:4:1",
            kind: "dimension",
            type: "Size_Diameter",
            name: "DIM1",
            value: 12.5,
            attached: 1,
            plane: { origin: [0, 0, 5], normal: [0, 0, 1], direction: [1, 0, 0] },
            textPoint: [1, 2, 3],
            lines: [[[0, 0, 5], [10, 0, 5]], [[10, 0, 5], [10, 4, 5], [12, 4, 5]]],
            fills: [[[1, 1, 5], [2, 1, 5], [2, 2, 5]]],
            facing: [0, 0, 1],
        }]);
        expect("product" in read.annotations[0]!).toBe(false);
        expect("instance" in read.annotations[0]!).toBe(false);
    });

    it("should leave out the plane, the text point and the facing an annotation does not have", () => {
        // Arrange
        const { plane: _plane, textPoint: _textPoint, facing: _facing, ...bare } = diameter({ kind: "datum", type: "A", value: 0, fills: [] });

        // Act
        const [read] = documentAnnotationsOf(textOf([bare]), base).annotations;

        // Assert
        expect(Object.keys(read!).sort()).toEqual(["attached", "fills", "kind", "label", "lines", "name", "type", "value"]);
        expect(read!.kind).toBe("datum");
    });

    it("should read a number the kernel writes as null, being infinite, as NaN", () => {
        // Arrange
        const text = textOf([diameter({ value: null, lines: [[0, null, 5, 1, 0, 5]] })], {
            views: [{ entry: "0:1:7:1", name: "V", isParallel: true, eye: [0, 0, 0], direction: [0, 0, -1], up: [0, 1, 0], width: null, height: 4, annotations: [] }],
        });

        // Act
        const read = documentAnnotationsOf(text, base);

        // Assert
        expect(read.annotations[0]!.value).toBeNaN();
        expect(read.annotations[0]!.lines[0]![0]![1]).toBeNaN();
        expect(read.views[0]!.width).toBeNaN();
    });

    it("should place an annotation of a product once for each placement, numbering the copies in placement order", () => {
        // Arrange
        const text = textOf([diameter({ product: 2 })], { products: [{ product: 2, placements: [IDENTITY, ALONG_X_BY_100] }] });

        // Act
        const read = documentAnnotationsOf(text, base).annotations;

        // Assert
        expect(read.map(annotation => [annotation.label, annotation.product, annotation.instance])).toEqual([["0:1:4:1", 2, 0], ["0:1:4:1", 2, 1]]);
        expect(read[0]!.lines[0]).toEqual([[0, 0, 5], [10, 0, 5]]);
        expect(read[1]!.lines[0]).toEqual([[100, 0, 5], [110, 0, 5]]);
        expect(read[1]!.fills[0]![0]).toEqual([101, 1, 5]);
        expect(read[1]!.textPoint).toEqual([101, 2, 3]);
        expect(read[1]!.plane!.origin).toEqual([100, 0, 5]);
    });

    it("should turn the directions of a placed annotation without moving them, and keep them unit long", () => {
        // Arrange
        const text = textOf([diameter({ product: 0 })], { products: [{ product: 0, placements: [QUARTER_TURN_ABOUT_Z_THEN_UP_10] }] });

        // Act
        const [read] = documentAnnotationsOf(text, base).annotations;

        // Assert
        expect(read!.lines[0]![1]![0]).toBeCloseTo(0, 12);
        expect(read!.lines[0]![1]![1]).toBeCloseTo(10, 12);
        expect(read!.lines[0]![1]![2]).toBeCloseTo(15, 12);
        expect(read!.plane!.direction.map(value => Math.round(value * 1e12) / 1e12)).toEqual([0, 1, 0]);
        expect(read!.plane!.normal).toEqual([0, 0, 1]);
        expect(read!.facing).toEqual([0, 0, 1]);
    });

    it("should keep an annotation as written when its product has no placements listed", () => {
        // Arrange
        const text = textOf([diameter({ product: 5 })]);

        // Act
        const read = documentAnnotationsOf(text, base).annotations;

        // Assert
        expect(read).toHaveLength(1);
        expect(read[0]!.lines[0]).toEqual([[0, 0, 5], [10, 0, 5]]);
        expect("instance" in read[0]!).toBe(false);
    });

    it("should read the saved views with their labels and the annotations they show, and what was left out", () => {
        // Arrange
        const text = textOf([diameter()], {
            views: [{ entry: "0:1:7:1", name: "FRONT", isParallel: true, eye: [0, -50, 0], direction: [0, 1, 0], up: [0, 0, 1], width: 80, height: 60, annotations: ["0:1:4:1"] }],
            leftOut: { annotations: 3, views: 1 },
        });

        // Act
        const read = documentAnnotationsOf(text, base);

        // Assert
        expect(read.views).toEqual([{ label: "0:1:7:1", name: "FRONT", isParallel: true, eye: [0, -50, 0], direction: [0, 1, 0], up: [0, 0, 1], width: 80, height: 60, annotations: ["0:1:4:1"] }]);
        expect(read.leftOut).toEqual({ annotations: 3, views: 1 });
    });

    it("should give empty lists for a text without annotations or views, the products list left out included", () => {
        // Arrange
        const text: KernelAnnotations = { annotations: [], views: [], leftOut: { annotations: 0, views: 0 } };

        // Act
        const read = documentAnnotationsOf(text, base);

        // Assert
        expect(read).toEqual({ annotations: [], views: [], leftOut: { annotations: 0, views: 0 } });
    });

    it("should leave the kernel's text as it was", () => {
        // Arrange
        const text = textOf([diameter({ product: 2 })], { products: [{ product: 2, placements: [ALONG_X_BY_100] }] });
        const before = JSON.stringify(text);

        // Act
        documentAnnotationsOf(text, base);

        // Assert
        expect(JSON.stringify(text)).toBe(before);
    });
});

describe("documentAnnotationsTurned", () => {
    const base = new BaseBitByBit();
    const Y_AND_Z_SWAPPED: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1];

    it("should turn every point and direction of every annotation and view, keeping labels, copies and what was left out", () => {
        // Arrange
        const text = textOf([diameter({ product: 2 })], {
            products: [{ product: 2, placements: [ALONG_X_BY_100] }],
            views: [{ entry: "0:1:7:1", name: "FRONT", isParallel: true, eye: [5, 10, 100], direction: [0, 0, -1], up: [0, -1, 0], width: 80, height: 60, annotations: ["0:1:4:1"] }],
            leftOut: { annotations: 1, views: 2 },
        });
        const read = documentAnnotationsOf(text, base);
        const before = JSON.stringify(read);

        // Act
        const turned = documentAnnotationsTurned(read, Y_AND_Z_SWAPPED, base);

        // Assert
        expect(turned.annotations[0]).toMatchObject({
            label: "0:1:4:1", product: 2, instance: 0, textPoint: [101, 3, 2], facing: [0, 1, 0],
            plane: { origin: [100, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] },
            lines: [[[100, 5, 0], [110, 5, 0]], [[110, 5, 0], [110, 5, 4], [112, 5, 4]]],
            fills: [[[101, 5, 1], [102, 5, 1], [102, 5, 2]]],
        });
        expect(turned.views[0]).toMatchObject({ name: "FRONT", eye: [5, 100, 10], direction: [0, -1, 0], up: [0, 0, -1], annotations: ["0:1:4:1"] });
        expect(turned.leftOut).toEqual({ annotations: 1, views: 2 });
        expect(JSON.stringify(read)).toBe(before);
    });
});
