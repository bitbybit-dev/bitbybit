import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import type * as Inputs from "../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT hidden lines", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const isometric: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [1, 1, 1], direction: [1, -1, 0] };
    const fromAbove: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
    const fromBelow: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, -1], direction: [-1, 0, 0] };
    const block = (corner: Inputs.Base.Point3, opposite: Inputs.Base.Point3): TopoDS_Shape => occt.shapes.solid.createBoxFromCorner({
        corner,
        width: opposite[0] - corner[0],
        height: opposite[1] - corner[1],
        length: opposite[2] - corner[2],
    });
    const cube = (): TopoDS_Shape => block([0, 0, 0], [10, 10, 10]);
    const lengthOf = (shape: TopoDS_Shape): number => occt.shapes.edge.getEdges({ shape }).reduce((sum, edge) => sum + occt.shapes.edge.getEdgeLength({ shape: edge }), 0);
    const boxOf = (shape: TopoDS_Shape): Inputs.OCCT.BoundingBoxPropsDto => occt.operations.boundingBoxOfShape({ shape });
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };

    it("should draw nine edges of an isometric cube visible and three hidden, exactly and from a mesh", () => {
        // Arrange
        const projected = 10 * Math.sqrt(2 / 3);

        // Act
        const exact = occt.operations.hiddenLines({ shape: cube(), frame: isometric, exact: true, smoothEdges: false, hiddenEdges: true, focus: 0, precision: 0.01 });
        const meshed = occt.operations.hiddenLines({ shape: cube(), frame: isometric, exact: false, precision: 0.01 });

        // Assert
        expect(lengthOf(exact.visible)).toBeCloseTo(9 * projected, 6);
        expect(lengthOf(exact.hidden)).toBeCloseTo(3 * projected, 6);
        expect(lengthOf(meshed.visible)).toBeCloseTo(9 * projected, 6);
        expect(lengthOf(meshed.hidden)).toBeCloseTo(3 * projected, 6);
    });

    it("should lay the drawing on the XZ plane with x along the frame's direction and z along the normal crossed with it", () => {
        // Arrange
        const aside: Inputs.Base.Frame = { origin: [100, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
        const slab = block([0, 2, 0], [10, 3, 10]);

        // Act
        const front = occt.operations.hiddenLines({ shape: cube(), frame: aside });
        const high = occt.operations.hiddenLines({ shape: slab, frame: aside });
        const top = occt.operations.hiddenLines({ shape: block([0, 0, 2], [10, 10, 3]), frame: { origin: [0, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });

        // Assert
        const drawn = boxOf(front.visible);
        expect(drawn.min).toEqual([-100, 0, 0].map(value => expect.closeTo(value, 4)));
        expect(drawn.max).toEqual([-90, 0, 10].map(value => expect.closeTo(value, 4)));
        expect([boxOf(high.visible).min[2], boxOf(high.visible).max[2]]).toEqual([2, 3].map(value => expect.closeTo(value, 4)));
        expect([boxOf(top.visible).min[2], boxOf(top.visible).max[2]]).toEqual([-3, -2].map(value => expect.closeTo(value, 4)));
    });

    it("should see the step of a cube with a quarter cut away from above and from below", () => {
        // Arrange
        const stepped = occt.booleans.difference({ shape: cube(), shapes: [block([5, -1, 5], [11, 11, 11])], keepEdges: false });

        // Act
        const above = occt.operations.hiddenLines({ shape: stepped, frame: fromAbove });
        const below = occt.operations.hiddenLines({ shape: stepped, frame: fromBelow });

        // Assert
        expect(lengthOf(above.visible)).toBeCloseTo(50, 6);
        expect(lengthOf(above.hidden)).toBeCloseTo(50, 6);
        expect(lengthOf(below.visible)).toBeCloseTo(40, 6);
        expect(lengthOf(below.hidden)).toBeCloseTo(60, 6);
    });

    it("should leave the hidden compound empty when hidden edges are not wanted", () => {
        // Arrange
        const shape = cube();

        // Act
        const lines = occt.operations.hiddenLines({ shape, frame: isometric, hiddenEdges: false });

        // Assert
        expect(occt.shapes.edge.getEdges({ shape: lines.hidden })).toEqual([]);
        expect(lengthOf(lines.visible)).toBeCloseTo(90 * Math.sqrt(2 / 3), 6);
    });

    it("should also draw the borders of fillets when smooth edges are asked for", () => {
        // Arrange
        const rounded = occt.fillets.filletEdges({ shape: cube(), radius: 1 });

        // Act
        const sharpOnly = occt.operations.hiddenLines({ shape: rounded, frame: isometric });
        const withSmooth = occt.operations.hiddenLines({ shape: rounded, frame: isometric, smoothEdges: true });

        // Assert
        expect(lengthOf(withSmooth.visible)).toBeGreaterThan(lengthOf(sharpOnly.visible) + 10);
        expect(lengthOf(withSmooth.hidden)).toBeGreaterThan(lengthOf(sharpOnly.hidden) + 10);
    });

    it("should enlarge what lies near the eye in a perspective", () => {
        // Arrange
        const high = block([-1, -1, 8], [1, 1, 10]);

        // Act
        const perspective = occt.operations.hiddenLines({ shape: high, frame: fromAbove, focus: 20 });
        const parallel = occt.operations.hiddenLines({ shape: high, frame: fromAbove, focus: 0 });

        // Assert
        const topSide = 8 / (1 - 10 / 20);
        const bottomSide = 8 / (1 - 8 / 20);
        const runUp = 4 * Math.SQRT2 * (1 / (1 - 10 / 20) - 1 / (1 - 8 / 20));
        expect(lengthOf(perspective.visible)).toBeCloseTo(topSide, 6);
        expect(lengthOf(perspective.hidden)).toBeCloseTo(bottomSide + runUp, 6);
        expect(lengthOf(parallel.visible)).toBeCloseTo(8, 6);
        expect(lengthOf(parallel.hidden)).toBeCloseTo(8, 6);
    });

    it("should refuse a negative focus, a mesh precision of 0 and a frame that is not one", () => {
        // Arrange
        const shape = cube();

        // Act
        const focus = thrownBy(() => occt.operations.hiddenLines({ shape, frame: isometric, focus: -1 }));
        const precision = thrownBy(() => occt.operations.hiddenLines({ shape, frame: isometric, exact: false, precision: 0 }));
        const frame = thrownBy(() => occt.operations.hiddenLines({ shape, frame: { origin: [0, 0, 0], normal: [0, 0, 0], direction: [1, 0, 0] } }));
        const exactIgnoresPrecision = occt.operations.hiddenLines({ shape, frame: isometric, exact: true, precision: 0 });

        // Assert
        expect(focus.message).toBe("`focus` must be a finite number 0 or more; it is -1.");
        expect(precision.message).toBe("`precision` must be a finite number above 0; it is 0.");
        expect(frame.message).toBe("`frame` is not a frame: its `normal` has no length.");
        expect(lengthOf(exactIgnoresPrecision.visible)).toBeCloseTo(90 * Math.sqrt(2 / 3), 6);
    });

    it("should refuse a perspective from a mesh as an input error on exact, and an eye inside the shape as one on focus", () => {
        // Arrange
        const shape = cube();

        // Act
        const meshed = thrownBy(() => occt.operations.hiddenLines({ shape, frame: fromAbove, exact: false, focus: 50 }));
        const inside = thrownBy(() => occt.operations.hiddenLines({ shape, frame: fromAbove, focus: 5 }));

        // Assert
        expect([meshed.property, meshed.message]).toEqual(["exact", "`exact` is false, and only the exact algorithm draws a perspective: set `exact` to true, or `focus` to 0 for a parallel view."]);
        expect([inside.property, inside.message]).toEqual(["focus", "`focus` is 5, which puts the eye inside the shape or leaves part of it behind the eye: give a focus that keeps the whole shape in front of the eye, or 0 for a parallel view."]);
    });
});
