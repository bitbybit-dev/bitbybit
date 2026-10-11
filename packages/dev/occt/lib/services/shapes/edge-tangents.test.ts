import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Vertex } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { readKernelException } from "../../kernel-exception";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type * as Inputs from "../../api/inputs";

describe("OCCT edges tangent to planar curves", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const XY: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
    const GROUND: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] };
    const close = (values: readonly number[], digits = 9): unknown[] => values.map(value => expect.closeTo(value, digits));
    const distance = (a: Inputs.Base.Point3, b: Inputs.Base.Point3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const loose = <T>(value: unknown): T => value as T;
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };
    const messageOf = (action: () => unknown): string => {
        try {
            action();
        } catch (error) {
            const read = readKernelException(kernel, error);
            return read instanceof Error ? read.message : String(read);
        }
        return "nothing thrown";
    };
    const segment = (start: Inputs.Base.Point3, end: Inputs.Base.Point3): TopoDS_Edge => occt.shapes.edge.line({ start, end });
    const vertex = (point: Inputs.Base.Point3): TopoDS_Vertex => occt.shapes.vertex.vertexFromPoint({ point });
    const circle = (radius: number, center: Inputs.Base.Point3): TopoDS_Edge => occt.shapes.edge.createCircleEdge({ radius, center, direction: [0, 0, 1] });
    const radii = (circles: TopoDS_Edge[]): number[] => circles.map(edge => occt.shapes.edge.getCircularEdgeRadius({ shape: edge })).sort((a, b) => a - b);
    const centers = (circles: TopoDS_Edge[]): Inputs.Base.Point3[] => circles.map(edge => occt.shapes.edge.getCircularEdgeCenterPoint({ shape: edge }));
    const ends = (edge: TopoDS_Edge): Inputs.Base.Point3[] => [occt.shapes.edge.startPointOnEdge({ shape: edge }), occt.shapes.edge.endPointOnEdge({ shape: edge })];
    const byStartX = (lines: TopoDS_Edge[]): TopoDS_Edge[] => [...lines].sort((a, b) => ends(a)[0]![0] - ends(b)[0]![0]);
    const triangleSides = (): TopoDS_Edge[] => [segment([0, 0, 0], [4, 0, 0]), segment([0, 0, 0], [0, 3, 0]), segment([4, 0, 0], [0, 3, 0])];

    describe("circlesTangentToThree", () => {
        it("should draw the incircle and the three excircles of a 3-4-5 triangle", () => {
            // Arrange
            const sides = triangleSides();

            // Act
            const circles = occt.shapes.edge.circlesTangentToThree({ shapes: sides, frame: XY });

            // Assert
            expect(radii(circles)).toEqual(close([1, 2, 3, 6]));
        });

        it("should keep only the incircle when the circles must touch the sides themselves", () => {
            // Arrange
            const sides = triangleSides();

            // Act
            const circles = occt.shapes.edge.circlesTangentToThree({ shapes: sides, frame: XY, tolerance: 1e-7, onArgumentsOnly: true });

            // Assert
            expect(radii(circles)).toEqual(close([1]));
            expect(centers(circles)).toEqual([close([1, 1, 0])]);
        });

        it("should solve the same triangle drawn on the ground plane", () => {
            // Arrange
            const sides = [segment([0, 0, 0], [4, 0, 0]), segment([0, 0, 0], [0, 0, 3]), segment([4, 0, 0], [0, 0, 3])];

            // Act
            const circles = occt.shapes.edge.circlesTangentToThree({ shapes: sides, frame: GROUND, onArgumentsOnly: true });

            // Assert
            expect(radii(circles)).toEqual(close([1]));
            expect(centers(circles)).toEqual([close([1, 0, 1])]);
        });

        it("should pass a circle through three vertices", () => {
            // Arrange
            const corners = [vertex([0, 0, 0]), vertex([2, 0, 0]), vertex([0, 2, 0])];

            // Act
            const circles = occt.shapes.edge.circlesTangentToThree({ shapes: corners, frame: XY });

            // Assert
            expect(radii(circles)).toEqual(close([Math.SQRT2]));
            expect(centers(circles)).toEqual([close([1, 1, 0])]);
        });

        it("should refuse a wrong count, a bad tolerance, frame and flag, a missing shape and an edge off the plane", () => {
            // Arrange
            const sides = triangleSides();
            const raised = segment([4, 0, 1], [0, 3, 1]);

            // Act
            const two = thrownBy(() => occt.shapes.edge.circlesTangentToThree({ shapes: sides.slice(0, 2), frame: XY }));
            const noTolerance = thrownBy(() => occt.shapes.edge.circlesTangentToThree({ shapes: sides, frame: XY, tolerance: 0 }));
            const noFrame = thrownBy(() => occt.shapes.edge.circlesTangentToThree({ shapes: sides, frame: loose(undefined) }));
            const notAFlag = thrownBy(() => occt.shapes.edge.circlesTangentToThree({ shapes: sides, frame: XY, onArgumentsOnly: loose("no") }));
            const missing = thrownBy(() => occt.shapes.edge.circlesTangentToThree({ shapes: [sides[0]!, loose(undefined), sides[2]!], frame: XY }));
            const offThePlane = messageOf(() => occt.shapes.edge.circlesTangentToThree({ shapes: [sides[0]!, sides[1]!, raised], frame: XY }));

            // Assert
            expect(two.message).toBe("`shapes` holds 2 shapes; it takes 3 edges or vertices.");
            expect(noTolerance.message).toBe("`tolerance` must be a finite number above 0; it is 0.");
            expect(noFrame.message).toBe("`frame` is not a frame: it needs `origin`, `normal` and `direction`, three finite numbers each.");
            expect(notAFlag.message).toBe("`onArgumentsOnly` must be true or false; it is no.");
            expect(missing.message).toBe("`shapes` holds a missing or empty shape at position 1, as an operation that failed can leave it.");
            expect(offThePlane).toBe("Standard_DomainError: CirclesTangentToThree: argument 2 does not lie in the plane");
        });
    });

    describe("circlesTangentToTwoWithRadius", () => {
        it("should put a circle of radius 1 by default in each corner of two crossing lines, and only the one between the segments when asked", () => {
            // Arrange
            const legs = [segment([0, 0, 0], [10, 0, 0]), segment([0, 0, 0], [0, 10, 0])];

            // Act
            const everywhere = occt.shapes.edge.circlesTangentToTwoWithRadius({ shapes: legs, frame: XY });
            const onTheLegs = occt.shapes.edge.circlesTangentToTwoWithRadius({ shapes: legs, frame: XY, radius: 1, onArgumentsOnly: true });

            // Assert
            expect(radii(everywhere)).toEqual(close([1, 1, 1, 1]));
            expect(centers(everywhere).map(center => center.map(Math.abs))).toEqual([close([1, 1, 0]), close([1, 1, 0]), close([1, 1, 0]), close([1, 1, 0])]);
            expect(centers(onTheLegs)).toEqual([close([1, 1, 0])]);
        });

        it("should draw the one circle of radius 1 through a point of the unit circle that touches it", () => {
            // Arrange
            const unitCircle = circle(1, [0, 0, 0]);

            // Act
            const circles = occt.shapes.edge.circlesTangentToTwoWithRadius({ shapes: [unitCircle, vertex([1, 0, 0])], frame: XY, radius: 1 });

            // Assert
            expect(centers(circles)).toEqual([close([2, 0, 0])]);
        });

        it("should refuse a radius of 0 and three shapes", () => {
            // Arrange
            const legs = [segment([0, 0, 0], [10, 0, 0]), segment([0, 0, 0], [0, 10, 0])];

            // Act
            const noRadius = thrownBy(() => occt.shapes.edge.circlesTangentToTwoWithRadius({ shapes: legs, frame: XY, radius: 0 }));
            const three = thrownBy(() => occt.shapes.edge.circlesTangentToTwoWithRadius({ shapes: [...legs, legs[0]!], frame: XY }));

            // Assert
            expect(noRadius.message).toBe("`radius` must be a finite number above 0; it is 0.");
            expect(three.message).toBe("`shapes` holds 3 shapes; it takes 2 edges or vertices.");
        });
    });

    describe("circlesTangentToTwoCenteredOn", () => {
        it("should center a circle between two lines on a third", () => {
            // Arrange
            const rails = [segment([-10, 3, 0], [10, 3, 0]), segment([-10, -3, 0], [10, -3, 0])];
            const axis = segment([2, -10, 0], [2, 10, 0]);

            // Act
            const circles = occt.shapes.edge.circlesTangentToTwoCenteredOn({ shapes: rails, centerOn: axis, frame: XY });

            // Assert
            expect(radii(circles)).toEqual(close([3]));
            expect(centers(circles)).toEqual([close([2, 0, 0])]);
        });

        it("should touch a line and pass through a vertex with its center on an axis", () => {
            // Arrange
            const floor = segment([-10, 0, 0], [10, 0, 0]);
            const axis = segment([0, -10, 0], [0, 10, 0]);

            // Act
            const circles = occt.shapes.edge.circlesTangentToTwoCenteredOn({ shapes: [floor, vertex([0, 4, 0])], centerOn: axis, frame: XY });

            // Assert
            expect(radii(circles)).toEqual(close([2]));
            expect(centers(circles)).toEqual([close([0, 2, 0])]);
        });

        it("should drop a circle whose center falls beyond the ends of the center edge when asked", () => {
            // Arrange
            const rails = [segment([-10, 3, 0], [10, 3, 0]), segment([-10, -3, 0], [10, -3, 0])];
            const shortAxis = segment([2, 5, 0], [2, 6, 0]);

            // Act
            const anywhere = occt.shapes.edge.circlesTangentToTwoCenteredOn({ shapes: rails, centerOn: shortAxis, frame: XY, onArgumentsOnly: false });
            const onTheAxis = occt.shapes.edge.circlesTangentToTwoCenteredOn({ shapes: rails, centerOn: shortAxis, frame: XY, onArgumentsOnly: true });

            // Assert
            expect(centers(anywhere)).toEqual([close([2, 0, 0])]);
            expect(onTheAxis).toEqual([]);
        });

        it("should refuse a missing center edge and a vertex as the center curve", () => {
            // Arrange
            const rails = [segment([-10, 3, 0], [10, 3, 0]), segment([-10, -3, 0], [10, -3, 0])];

            // Act
            const missing = thrownBy(() => occt.shapes.edge.circlesTangentToTwoCenteredOn({ shapes: rails, centerOn: loose(undefined), frame: XY }));
            const point = messageOf(() => occt.shapes.edge.circlesTangentToTwoCenteredOn({ shapes: rails, centerOn: vertex([2, 0, 0]), frame: XY }));

            // Assert
            expect(missing.message).toBe("`centerOn` is missing or empty, as an operation that failed can leave it.");
            expect(point).toBe("Standard_DomainError: CirclesTangentToTwoCenteredOn: the center curve is a vertex; a circle with a known center is not a tangency problem");
        });
    });

    describe("linesTangentToTwo", () => {
        it("should draw the four common tangents of two wheels, each from the first wheel to the second", () => {
            // Arrange
            const wheels = [circle(1, [0, 0, 0]), circle(1, [5, 0, 0])];

            // Act
            const lines = occt.shapes.edge.linesTangentToTwo({ shapes: wheels, frame: XY });

            // Assert
            expect(lines.map(line => occt.shapes.edge.getEdgeLength({ shape: line })).sort((a, b) => a - b)).toEqual(close([Math.sqrt(21), Math.sqrt(21), 5, 5]));
            lines.forEach(line => {
                const [start, end] = ends(line);
                expect(distance(start!, [0, 0, 0])).toBeCloseTo(1, 9);
                expect(distance(end!, [5, 0, 0])).toBeCloseTo(1, 9);
            });
        });

        it("should keep only the tangent that touches both upper half circles when asked", () => {
            // Arrange
            const arcs = [
                occt.shapes.edge.arcThroughThreePoints({ start: [1, 0, 0], middle: [0, 1, 0], end: [-1, 0, 0] }),
                occt.shapes.edge.arcThroughThreePoints({ start: [6, 0, 0], middle: [5, 1, 0], end: [4, 0, 0] }),
            ];

            // Act
            const wholeCircles = occt.shapes.edge.linesTangentToTwo({ shapes: arcs, frame: XY, onArgumentsOnly: false });
            const onTheArcs = occt.shapes.edge.linesTangentToTwo({ shapes: arcs, frame: XY, onArgumentsOnly: true });

            // Assert
            expect(wholeCircles).toHaveLength(4);
            expect(onTheArcs.map(ends)).toEqual([[close([0, 1, 0]), close([5, 1, 0])]]);
        });

        it("should draw the two tangents from a vertex to a circle, starting at the vertex", () => {
            // Arrange
            const unitCircle = circle(1, [0, 0, 0]);

            // Act
            const lines = byStartX(occt.shapes.edge.linesTangentToTwo({ shapes: [vertex([5, 0, 0]), unitCircle], frame: XY }));

            // Assert
            expect(lines).toHaveLength(2);
            const touches = lines.map(line => ends(line)[1]!).sort((a, b) => a[1] - b[1]);
            expect(touches).toEqual([close([0.2, -Math.sqrt(24) / 5, 0]), close([0.2, Math.sqrt(24) / 5, 0])]);
            lines.forEach(line => expect(ends(line)[0]).toEqual(close([5, 0, 0])));
        });

        it("should refuse two vertices, a straight edge and an angular tolerance of 0", () => {
            // Arrange
            const unitCircle = circle(1, [0, 0, 0]);

            // Act
            const twoPoints = messageOf(() => occt.shapes.edge.linesTangentToTwo({ shapes: [vertex([0, 0, 0]), vertex([1, 0, 0])], frame: XY }));
            const straight = messageOf(() => occt.shapes.edge.linesTangentToTwo({ shapes: [segment([0, 3, 0], [5, 3, 0]), unitCircle], frame: XY }));
            const noTolerance = thrownBy(() => occt.shapes.edge.linesTangentToTwo({ shapes: [vertex([5, 0, 0]), unitCircle], frame: XY, angularTolerance: 0 }));

            // Assert
            expect(twoPoints).toBe("Standard_DomainError: LinesTangentToTwo: both arguments are vertices; a line through two points is not a tangency problem");
            expect(straight).toBe("Standard_DomainError: LinesTangentToTwo: argument 0 is straight; the only line tangent to it is its own");
            expect(noTolerance.message).toBe("`angularTolerance` must be a finite number above 0; it is 0.");
        });
    });

    describe("linesTangentAtAngle", () => {
        it("should draw the two tangents at 45 degrees by default, from each touch to the reference line", () => {
            // Arrange
            const wheel = circle(2, [0, 0, 0]);
            const axis = segment([-10, 0, 0], [10, 0, 0]);

            // Act
            const lines = byStartX(occt.shapes.edge.linesTangentAtAngle({ shape: wheel, reference: axis, frame: XY }));

            // Assert
            expect(lines.map(ends)).toEqual([
                [close([-Math.SQRT2, Math.SQRT2, 0]), close([-2 * Math.SQRT2, 0, 0])],
                [close([Math.SQRT2, -Math.SQRT2, 0]), close([2 * Math.SQRT2, 0, 0])],
            ]);
        });

        it("should turn clockwise for a negative angle", () => {
            // Arrange
            const wheel = circle(2, [0, 0, 0]);
            const axis = segment([-10, 0, 0], [10, 0, 0]);

            // Act
            const lines = occt.shapes.edge.linesTangentAtAngle({ shape: wheel, reference: axis, frame: XY, angle: -45 });

            // Assert
            expect(lines).toHaveLength(2);
            lines.forEach(line => {
                const [start, end] = ends(line);
                expect((end![0] - start![0]) * (end![1] - start![1])).toBeLessThan(0);
                expect(distance(start!, end!)).toBeCloseTo(2, 9);
            });
        });

        it("should center a line parallel to the reference on its touch, as long as the reference, and drop it when asked", () => {
            // Arrange
            const wheel = circle(2, [0, 0, 0]);
            const axis = segment([-10, 0, 0], [10, 0, 0]);

            // Act
            const parallel = occt.shapes.edge.linesTangentAtAngle({ shape: wheel, reference: axis, frame: XY, angle: 0 });
            const crossingOnly = occt.shapes.edge.linesTangentAtAngle({ shape: wheel, reference: axis, frame: XY, angle: 0, onArgumentsOnly: true });

            // Assert
            expect(parallel.map(line => occt.shapes.edge.getEdgeLength({ shape: line }))).toEqual(close([20, 20]));
            expect(parallel.map(line => occt.shapes.edge.pointOnEdgeAtParam({ shape: line, param: 0.5 }).map(Math.abs))).toEqual([close([0, 2, 0]), close([0, 2, 0])]);
            expect(crossingOnly).toEqual([]);
        });

        it("should refuse a curved reference, an angle that is not a number and a missing reference", () => {
            // Arrange
            const wheel = circle(2, [0, 0, 0]);

            // Act
            const curved = messageOf(() => occt.shapes.edge.linesTangentAtAngle({ shape: wheel, reference: circle(1, [5, 5, 0]), frame: XY }));
            const notANumber = thrownBy(() => occt.shapes.edge.linesTangentAtAngle({ shape: wheel, reference: segment([-10, 0, 0], [10, 0, 0]), frame: XY, angle: NaN }));
            const missing = thrownBy(() => occt.shapes.edge.linesTangentAtAngle({ shape: wheel, reference: loose(undefined), frame: XY }));

            // Assert
            expect(curved).toBe("Standard_DomainError: LinesTangentAtAngle: the reference is not a straight edge");
            expect(notANumber.message).toBe("`angle` must be a finite number -Infinity or more; it is NaN.");
            expect(missing.message).toBe("`reference` is missing or empty, as an operation that failed can leave it.");
        });
    });
});
