import { describe, it, expect } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import type { ArcPiece, CubicPiece, LinePiece, Piece, QuadraticPiece, Vec2 } from "./outline";
import { arcThrough, cornerBetween, endTangent, outlineOf, segmentsOf, signedArea, startTangent, subpathOf } from "./outline";

const near = (actual: Vec2, expected: Vec2): void => {
    expect(Math.hypot(actual[0] - expected[0], actual[1] - expected[1])).toBeLessThan(1e-9);
};
const lengthOf = (a: Vec2, b: Vec2): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
const piecesOf = (commands: unknown, start: Vec2 = [0, 0]): Piece[] => outlineOf(commands, start).outline.pieces;
const messageOf = (commands: unknown): string => {
    try {
        outlineOf(commands, [0, 0]);
    } catch (error) {
        expect(error).toBeInstanceOf(InputError);
        return (error as InputError).message;
    }
    throw new Error("expected an InputError, but nothing was thrown");
};

describe("sketch outline", () => {
    describe("signedArea", () => {
        it("should be positive for a counterclockwise run and negative for a clockwise one", () => {
            // Arrange
            const square: Piece[] = [
                { kind: "line", from: [0, 0], to: [10, 0], owner: 0 },
                { kind: "line", from: [10, 0], to: [10, 10], owner: 0 },
                { kind: "line", from: [10, 10], to: [0, 10], owner: 0 },
                { kind: "line", from: [0, 10], to: [0, 0], owner: 0 },
            ];
            const reversed: Piece[] = square.slice().reverse().map(piece => ({ ...piece, from: piece.to, to: piece.from }) as LinePiece);

            // Act
            const forward = signedArea(square);
            const backward = signedArea(reversed);

            // Assert
            expect(forward).toBeCloseTo(100, 12);
            expect(backward).toBeCloseTo(-100, 12);
        });

        it("should count a full circle and a half disc exactly", () => {
            // Arrange
            const circle: ArcPiece = { kind: "arc", from: [5, 2], to: [5, 2], center: [2, 2], radius: 3, start: 0, sweep: 2 * Math.PI, owner: 0 };
            const half: Piece[] = [
                { kind: "line", from: [-1, 0], to: [1, 0], owner: 0 },
                { kind: "arc", from: [1, 0], to: [-1, 0], center: [0, 0], radius: 1, start: 0, sweep: Math.PI, owner: 0 },
            ];

            // Act
            const circleArea = signedArea([circle]);
            const halfArea = signedArea(half);

            // Assert
            expect(circleArea).toBeCloseTo(9 * Math.PI, 12);
            expect(halfArea).toBeCloseTo(Math.PI / 2, 12);
        });

        it("should integrate Bezier pieces exactly", () => {
            // Arrange
            const quadratic: QuadraticPiece = { kind: "quadratic", from: [10, 0], control: [5, 10], to: [0, 0], owner: 0 };
            const cubic: CubicPiece = { kind: "cubic", from: [10, 0], control1: [10, 8], control2: [0, 8], to: [0, 0], owner: 0 };
            const base: LinePiece = { kind: "line", from: [0, 0], to: [10, 0], owner: 0 };

            // Act
            const parabola = signedArea([base, quadratic]);
            const bump = signedArea([base, cubic]);

            // Assert
            expect(parabola).toBeCloseTo(2 / 3 * 10 * 5, 12);
            expect(bump).toBeCloseTo(48, 10);
        });
    });

    describe("arcThrough", () => {
        it("should find the circle through three points and turn the way they turn", () => {
            // Arrange
            const clockwise = arcThrough([0, 0], [5, 5], [10, 0], 3);
            const counterclockwise = arcThrough([0, 0], [5, -5], [10, 0], 4);

            // Act
            const both = [clockwise, counterclockwise];

            // Assert
            both.forEach(arc => {
                expect(arc).toBeDefined();
                near(arc!.center, [5, 0]);
                expect(arc!.radius).toBeCloseTo(5, 12);
            });
            expect(clockwise!.sweep).toBeCloseTo(-Math.PI, 12);
            expect(counterclockwise!.sweep).toBeCloseTo(Math.PI, 12);
            expect(clockwise!.owner).toBe(3);
        });

        it("should give nothing for points on one line or an arc that ends where it starts", () => {
            // Arrange
            const inLine: [Vec2, Vec2, Vec2] = [[0, 0], [1, 1], [2, 2]];
            const closed: [Vec2, Vec2, Vec2] = [[0, 0], [1, 1], [0, 0]];

            // Act
            const results = [arcThrough(...inLine, 0), arcThrough(...closed, 0)];

            // Assert
            expect(results).toEqual([undefined, undefined]);
        });
    });

    describe("tangents", () => {
        it("should read the end directions of every kind of piece, past control points that sit on an end", () => {
            // Arrange
            const arc: ArcPiece = { kind: "arc", from: [1, 0], to: [0, 1], center: [0, 0], radius: 1, start: 0, sweep: Math.PI / 2, owner: 0 };
            const quadratic: QuadraticPiece = { kind: "quadratic", from: [0, 0], control: [0, 0], to: [4, 2], owner: 0 };
            const cubic: CubicPiece = { kind: "cubic", from: [0, 0], control1: [0, 0], control2: [4, 2], to: [4, 2], owner: 0 };

            // Act
            const tangents = [startTangent(arc), endTangent(arc), startTangent(quadratic), endTangent(quadratic), startTangent(cubic), endTangent(cubic)];

            // Assert
            near(tangents[0]!, [0, 1]);
            near(tangents[1]!, [-1, 0]);
            near(tangents[2]!, [2 / Math.sqrt(5), 1 / Math.sqrt(5)]);
            near(tangents[3]!, [2 / Math.sqrt(5), 1 / Math.sqrt(5)]);
            near(tangents[4]!, [2 / Math.sqrt(5), 1 / Math.sqrt(5)]);
            near(tangents[5]!, [2 / Math.sqrt(5), 1 / Math.sqrt(5)]);
        });
    });

    describe("outlineOf", () => {
        it("should draw from the start point, absolute and relative", () => {
            // Arrange
            const commands = [
                { type: "line", to: [10, 0] },
                { type: "line", to: [0, 5], relative: true },
                { type: "polarLine", length: 2, angle: 180 },
                { type: "hLine", length: -3 },
                { type: "vLine", length: -5 },
            ];

            // Act
            const pieces = piecesOf(commands, [1, 0]);

            // Assert
            near(pieces[0]!.from, [1, 0]);
            near(pieces[1]!.to, [10, 5]);
            near(pieces[2]!.to, [8, 5]);
            near(pieces[3]!.to, [5, 5]);
            near(pieces[4]!.to, [5, 0]);
        });

        it("should turn tangent arcs either way and carry tangent lines on from them", () => {
            // Arrange
            const left = [{ type: "hLine", length: 10 }, { type: "tangentArc", to: [20, 10] }, { type: "tangentLine", length: 5 }];
            const right = [{ type: "hLine", length: 10 }, { type: "tangentArc", to: [10, -10], relative: true }];

            // Act
            const leftPieces = piecesOf(left);
            const rightPieces = piecesOf(right);

            // Assert
            const leftArc = leftPieces[1] as ArcPiece;
            const rightArc = rightPieces[1] as ArcPiece;
            near(leftArc.center, [10, 10]);
            expect(leftArc.sweep).toBeCloseTo(Math.PI / 2, 12);
            near(leftPieces[2]!.to, [20, 15]);
            near(rightArc.center, [10, -10]);
            expect(rightArc.sweep).toBeCloseTo(-Math.PI / 2, 12);
        });

        it("should bow sagitta arcs to the left for a positive sagitta and bulge arcs counterclockwise for a positive bulge", () => {
            // Arrange
            const commands = [
                { type: "sagittaArc", to: [10, 0], sagitta: 2 },
                { type: "bulgeArc", to: [0, 0], bulge: 0.5 },
            ];

            // Act
            const pieces = piecesOf(commands);

            // Assert
            const sagitta = pieces[0] as ArcPiece;
            const bulge = pieces[1] as ArcPiece;
            expect(sagitta.sweep).toBeLessThan(0);
            expect(sagitta.center[1]).toBeLessThan(0);
            expect(sagitta.radius - (sagitta.center[1] * -1)).toBeCloseTo(2, 12);
            expect(bulge.sweep).toBeCloseTo(4 * Math.atan(0.5), 12);
        });

        it("should keep relative Bezier control points relative to the pen", () => {
            // Arrange
            const commands = [
                { type: "hLine", length: 1 },
                { type: "quadratic", control: [1, 1], to: [2, 0], relative: true },
                { type: "cubic", control1: [1, 1], control2: [2, 1], to: [3, 0], relative: true },
            ];

            // Act
            const pieces = piecesOf(commands);

            // Assert
            const quadratic = pieces[1] as QuadraticPiece;
            const cubic = pieces[2] as CubicPiece;
            near(quadratic.control, [2, 1]);
            near(quadratic.to, [3, 0]);
            near(cubic.control1, [4, 1]);
            near(cubic.control2, [5, 1]);
            near(cubic.to, [6, 0]);
        });

        it("should close with a straight piece, or with none when the pen is already back", () => {
            // Arrange
            const open = [{ type: "hLine", length: 4 }, { type: "vLine", length: 4 }, { type: "close", id: "back" }];
            const back = [{ type: "hLine", length: 4 }, { type: "vLine", length: 4 }, { type: "line", to: [0, 0] }, { type: "close" }];
            const returned = [{ type: "hLine", length: 4 }, { type: "vLine", length: 4 }, { type: "line", to: [0, 0] }];

            // Act
            const results = [open, back, returned].map(commands => outlineOf(commands, [0, 0]));

            // Assert
            expect(results.map(result => result.outline.pieces.length)).toEqual([3, 3, 3]);
            expect(results.map(result => result.outline.closed)).toEqual([true, true, true]);
            expect(results[0]!.names).toEqual(["0", "1", "back"]);
            near(results[0]!.outline.pieces[2]!.to, [0, 0]);
        });

        it("should name a command with an empty id by its position, as one without an id", () => {
            // Arrange
            const commands = [{ type: "hLine", id: "", length: 4 }, { type: "vLine", id: "", length: 4 }, { type: "close", id: "back" }];

            // Act
            const { names } = outlineOf(commands, [0, 0]);

            // Assert
            expect(names).toEqual(["0", "1", "back"]);
        });

        it("should round a corner after close at the start point, trimming the first and last pieces", () => {
            // Arrange
            const commands = [{ type: "hLine", length: 10 }, { type: "vLine", length: 10 }, { type: "hLine", length: -10 }, { type: "close" }, { type: "filletCorner", radius: 2 }];

            // Act
            const { outline } = outlineOf(commands, [0, 0]);

            // Assert
            const pieces = outline.pieces;
            expect(pieces).toHaveLength(5);
            near(pieces[0]!.from, [2, 0]);
            near(pieces[3]!.to, [0, 2]);
            const corner = pieces[4] as ArcPiece;
            near(corner.center, [2, 2]);
            near(corner.from, [0, 2]);
            near(corner.to, [2, 0]);
            expect(corner.owner).toBe(4);
            expect(signedArea(pieces)).toBeCloseTo(100 - (4 - Math.PI), 10);
        });
    });

    describe("corners", () => {
        const corner = (kind: "fillet" | "chamfer", size: number) => ({ kind, size, owner: 9, label: "the corner" });

        it("should round the corner between two arcs with an arc touching both", () => {
            // Arrange
            const before = arcThrough([-5, 0], [-5 * Math.SQRT1_2, 5 * Math.SQRT1_2], [0, 5], 0)!;
            const after = arcThrough([0, 5], [10 - 10 * Math.SQRT1_2, 5 - 10 * Math.SQRT1_2], [10, -5], 1)!;

            // Act
            const joined = cornerBetween(before, after, corner("fillet", 1), "test");

            // Assert
            const arc = joined.corner as ArcPiece;
            expect(arc.radius).toBeCloseTo(1, 12);
            expect(lengthOf(arc.center, before.center)).toBeCloseTo(before.radius - 1, 10);
            expect(lengthOf(arc.center, after.center)).toBeCloseTo(after.radius + 1, 10);
            near(joined.before.to, arc.from);
            near(joined.after.from, arc.to);
            near(endTangent(joined.before), startTangent(arc));
            near(endTangent(arc), startTangent(joined.after));
            expect(arc.sweep).toBeLessThan(0);
        });

        it("should round the inside of a turn onto an arc with a radius the arc can hold", () => {
            // Arrange
            const before: LinePiece = { kind: "line", from: [-10, 0], to: [0, 10], owner: 0 };
            const after = arcThrough([0, 10], [10, 0], [0, -10], 1)!;

            // Act
            const joined = cornerBetween(before, after, corner("fillet", 2), "test");

            // Assert
            const arc = joined.corner as ArcPiece;
            expect(lengthOf(arc.center, after.center)).toBeCloseTo(after.radius - 2, 10);
            near(endTangent(joined.before), startTangent(arc));
            near(endTangent(arc), startTangent(joined.after));
        });

        it("should bevel the same distance off each piece, measured along arcs", () => {
            // Arrange
            const before: LinePiece = { kind: "line", from: [0, 0], to: [10, 0], owner: 0 };
            const after = arcThrough([10, 0], [15 - 5 * Math.SQRT1_2, -5 * Math.SQRT1_2], [15, -5], 1)!;

            // Act
            const joined = cornerBetween(before, after, corner("chamfer", 1), "test");

            // Assert
            near(joined.before.to, [9, 0]);
            const trimmed = joined.after as ArcPiece;
            expect(trimmed.radius * Math.abs(trimmed.sweep)).toBeCloseTo(5 * Math.PI / 2 - 1, 10);
            near(joined.corner.from, [9, 0]);
            near(joined.corner.to, trimmed.from);
        });

        it("should refuse corners it cannot make", () => {
            // Arrange
            const line = (from: Vec2, to: Vec2): LinePiece => ({ kind: "line", from, to, owner: 0 });
            const smallArc = arcThrough([0, 10], [1, 9], [0, 8], 1)!;
            const cases: [Piece, Piece, ReturnType<typeof corner>, RegExp][] = [
                [line([0, 0], [10, 0]), line([10, 0], [0, 0]), corner("fillet", 1), /double back/],
                [line([0, 0], [1, 0]), line([1, 0], [1, 1]), corner("chamfer", 2), /shorter than that/],
                [line([-5, 5], [0, 10]), smallArc, corner("fillet", 3), /larger than the arc/],
                [line([0, 0], [10, 0]), line([10, 0], [10, 10]), corner("fillet", 50), /too large|does not fit/],
            ];

            // Act
            const messages = cases.map(([before, after, kind]) => {
                try {
                    cornerBetween(before, after, kind, "the corner");
                } catch (error) {
                    return (error as Error).message;
                }
                return "";
            });

            // Assert
            messages.forEach((message, index) => {
                expect(message).toMatch(cases[index]![3]);
            });
        });
    });

    describe("refusals", () => {
        it("should name the command and say what is wrong with it", () => {
            // Arrange
            const cases: [unknown, RegExp][] = [
                [[42], /position 0 is not a pen command/],
                [[{ type: "hLine", id: 5, length: 1 }], /position 0 \(a `hLine`\) has an `id` that is not text/],
                [[{ type: "line", to: [1, 1], relative: "yes" }], /`relative` that is not true or false/],
                [[{ type: "polarLine", length: 1, angle: "up" }], /`angle` that is not a finite number/],
                [[{ type: "hLine", length: 1 }, { type: "tangentLine", length: -1 }], /must be above 0/],
                [[{ type: "hLine", length: 1 }, { type: "filletCorner", radius: 0 }, { type: "vLine", length: 1 }], /radius 0; it must be above 0/],
                [[{ type: "sagittaArc", to: [0, 0], sagitta: 1 }], /ends where it starts/],
                [[{ type: "sagittaArc", to: [5, 0], sagitta: 0 }], /stands no distance off/],
                [[{ type: "quadratic", control: [1, 1], to: [0, 0] }], /curve that ends where it starts/],
                [[{ type: "hLine", length: 5 }, { type: "close" }, { type: "filletCorner", radius: 1 }], /position 2 \(a `filletCorner`\) rounds or bevels a corner where the segments double back/],
                [[{ type: "hLine", id: "2", length: 2 }, { type: "vLine", length: 2 }, { type: "hLine", length: 1 }], /position 0 has the id `2`, the name the command at position 2 takes because it has no id/],
                [[{ type: "hLine", length: 2 }, { type: "vLine", length: 2 }, { type: "hLine", id: "0", length: 1 }], /position 2 has the id `0`, the name the command at position 0 takes because it has no id/],
                [[{ type: "hLine", length: 5 }, { type: "vLine", length: 5 }, { type: "close" }, { type: "filletCorner", radius: 1 }, { type: "filletCorner", radius: 1 }], /follows another corner command/],
            ];

            // Act
            const messages = cases.map(([commands]) => messageOf(commands));

            // Assert
            messages.forEach((message, index) => {
                expect(message).toMatch(cases[index]![1]);
            });
        });
    });

    describe("subpathOf and segmentsOf", () => {
        it("should turn pieces into path segments and group edges by the command that drew them", () => {
            // Arrange
            const { outline, names } = outlineOf([
                { type: "hLine", id: "base", length: 10 },
                { type: "threePointArc", through: [15, 5], to: [10, 10] },
                { type: "quadratic", control: [5, 15], to: [0, 10] },
                { type: "cubic", control1: [-2, 7], control2: [-2, 3], to: [0, 0] },
            ], [0, 0]);

            // Act
            const subpath = subpathOf(outline);
            const segments = segmentsOf(names, outline.pieces);

            // Assert
            expect(subpath.start).toEqual([0, 0]);
            expect(subpath.closed).toBe(true);
            expect(subpath.segments.map(segment => segment.type)).toEqual(["line", "arc", "quadratic", "cubic"]);
            expect(subpath.segments[1]).toMatchObject({ rx: 5, ry: 5, xAxisRotation: 0 });
            expect(segments).toEqual([
                { id: "base", command: 0, edges: [0] },
                { id: "1", command: 1, edges: [1] },
                { id: "2", command: 2, edges: [2] },
                { id: "3", command: 3, edges: [3] },
            ]);
        });
    });
});
