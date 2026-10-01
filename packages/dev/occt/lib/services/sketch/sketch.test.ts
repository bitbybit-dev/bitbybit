import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { TopoDS_Edge, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";

type Point3 = Inputs.Base.Point3;

describe("OCCT sketch", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const ground = (x: number, y: number): Point3 => [x, 0, -y];
    const distance = (a: Point3, b: Point3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const expectPoint = (actual: Point3, expected: Point3): void => {
        expect(distance(actual, expected)).toBeLessThan(1e-6);
    };
    const edgesOf = (shape: TopoDS_Shape): TopoDS_Edge[] => occt.shapes.edge.getEdges({ shape });
    const middleOf = (edge: TopoDS_Edge): Point3 => occt.shapes.edge.pointOnEdgeAtParam({ shape: edge, param: 0.5 });
    const areaOf = (shape: TopoDS_Shape): number => occt.shapes.face.getFaceArea({ shape: shape });
    const normalOf = (shape: TopoDS_Shape): Point3 => occt.shapes.face.normalOnUV({ shape: shape, paramU: 0.5, paramV: 0.5 });
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
    const rectangle: Models.OCCT.SketchCommand[] = [
        { type: "hLine", id: "base", length: 40 },
        { type: "vLine", id: "right", length: 10 },
        { type: "hLine", id: "top", length: -40 },
        { type: "close", id: "left" },
    ];

    describe("pen", () => {
        it("should draw a closed run of lines as a face lying on the ground and facing up", () => {
            // Arrange
            const commands = rectangle;

            // Act
            const face = occt.sketch.pen({ commands, makeFace: true });

            // Assert
            expect(occt.shapes.shape.getShapeType({ shape: face })).toBe(Inputs.OCCT.shapeTypeEnum.face);
            expect(areaOf(face)).toBeCloseTo(400, 6);
            expectPoint(normalOf(face), [0, 1, 0]);
            const middles = edgesOf(face).map(middleOf);
            expect(middles).toHaveLength(4);
            expectPoint(middles[0]!, ground(20, 0));
            expectPoint(middles[1]!, ground(40, 5));
            expectPoint(middles[2]!, ground(20, 10));
            expectPoint(middles[3]!, ground(0, 5));
        });

        it("should draw an open run as a wire without closing it", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [{ type: "hLine", length: 10 }, { type: "vLine", length: 5 }];

            // Act
            const wire = occt.sketch.pen({ commands });

            // Assert
            expect(occt.shapes.shape.getShapeType({ shape: wire })).toBe(Inputs.OCCT.shapeTypeEnum.wire);
            expect(occt.shapes.wire.isWireClosed({ shape: wire })).toBe(false);
            expectPoint(occt.shapes.wire.endPointOnWire({ shape: wire }), ground(10, 5));
        });

        it("should face along the frame's normal whichever way the outline runs", () => {
            // Arrange
            const clockwise: Models.OCCT.SketchCommand[] = [{ type: "vLine", length: 10 }, { type: "hLine", length: 40 }, { type: "vLine", length: -10 }, { type: "close" }];
            const frame: Inputs.Base.Frame = { origin: [1, 2, 3], normal: [1, 0, 0], direction: [0, 1, 0] };

            // Act
            const onGround = occt.sketch.pen({ commands: clockwise, makeFace: true });
            const onFrame = occt.sketch.pen({ commands: clockwise, makeFace: true, frame });

            // Assert
            expectPoint(normalOf(onGround), [0, 1, 0]);
            expectPoint(normalOf(onFrame), [1, 0, 0]);
            expect(areaOf(onGround)).toBeCloseTo(400, 6);
        });

        it("should lay the sketch's x axis along the frame's direction and its y axis along the normal crossed with it", () => {
            // Arrange
            const frame: Inputs.Base.Frame = { origin: [1, 2, 3], normal: [1, 0, 0], direction: [0, 1, 0] };

            // Act
            const wire = occt.sketch.pen({ commands: [{ type: "line", to: [10, 5] }], start: [2, 1], frame });

            // Assert
            expectPoint(occt.shapes.wire.startPointOnWire({ shape: wire }), [1, 4, 4]);
            expectPoint(occt.shapes.wire.endPointOnWire({ shape: wire }), [1, 12, 8]);
        });

        it("should extrude a face it drew into a solid standing on the frame", () => {
            // Arrange
            const face = occt.sketch.pen({ commands: rectangle, makeFace: true });

            // Act
            const solid = occt.operations.extrude({ shape: face, direction: [0, 5, 0] });

            // Assert
            expect(occt.shapes.solid.getSolidVolume({ shape: solid })).toBeCloseTo(2000, 5);
            expect(occt.operations.boundingBoxMinOfShape({ shape: solid })[1]).toBeCloseTo(0, 6);
        });

        it("should draw every kind of arc as an exact circle", () => {
            // Arrange
            const cases: { commands: Models.OCCT.SketchCommand[]; center: Point3; radius: number; middle: Point3 }[] = [
                { commands: [{ type: "threePointArc", through: [5, 5], to: [10, 0] }], center: ground(5, 0), radius: 5, middle: ground(5, 5) },
                { commands: [{ type: "hLine", length: 10 }, { type: "tangentArc", to: [20, 10] }], center: ground(10, 10), radius: 10, middle: ground(10 + 10 * Math.SQRT1_2, 10 - 10 * Math.SQRT1_2) },
                { commands: [{ type: "sagittaArc", to: [10, 0], sagitta: 5 }], center: ground(5, 0), radius: 5, middle: ground(5, 5) },
                { commands: [{ type: "bulgeArc", to: [10, 0], bulge: 1 }], center: ground(5, 0), radius: 5, middle: ground(5, -5) },
                { commands: [{ type: "hLine", length: 2 }, { type: "threePointArc", through: [5, 5], to: [10, 0], relative: true }], center: ground(7, 0), radius: 5, middle: ground(7, 5) },
            ];

            // Act
            const arcs = cases.map(item => {
                const edges = edgesOf(occt.sketch.pen({ commands: item.commands }));
                return edges[edges.length - 1]!;
            });

            // Assert
            arcs.forEach((arc, index) => {
                const expected = cases[index]!;
                expect(occt.shapes.edge.isEdgeCircular({ shape: arc })).toBe(true);
                expect(occt.shapes.edge.getCircularEdgeRadius({ shape: arc })).toBeCloseTo(expected.radius, 6);
                expectPoint(occt.shapes.edge.getCircularEdgeCenterPoint({ shape: arc }), expected.center);
            });
            expectPoint(middleOf(arcs[2]!), cases[2]!.middle);
            expectPoint(middleOf(arcs[3]!), cases[3]!.middle);
            expectPoint(middleOf(arcs[4]!), cases[4]!.middle);
        });

        it("should carry a tangent line on in the direction the arc before it ended in", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [{ type: "threePointArc", through: [5, 5], to: [10, 0] }, { type: "tangentLine", length: 4 }];

            // Act
            const wire = occt.sketch.pen({ commands });

            // Assert
            expectPoint(occt.shapes.wire.endPointOnWire({ shape: wire }), ground(10, -4));
        });

        it("should draw lines by angle, by axis and relative to the pen", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [
                { type: "polarLine", length: 10, angle: 90 },
                { type: "line", to: [3, 0], relative: true },
                { type: "line", to: [0, 0] },
            ];

            // Act
            const middles = edgesOf(occt.sketch.pen({ commands })).map(middleOf);

            // Assert
            expectPoint(middles[0]!, ground(0, 5));
            expectPoint(middles[1]!, ground(1.5, 10));
            expectPoint(middles[2]!, ground(1.5, 5));
        });

        it("should draw Bezier curves through their end points and enclose the area the curves bound", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [
                { type: "hLine", length: 10 },
                { type: "cubic", control1: [15, 3], control2: [15, 7], to: [10, 10] },
                { type: "quadratic", control: [5, 15], to: [0, 10] },
                { type: "close" },
            ];

            // Act
            const face = occt.sketch.pen({ commands, makeFace: true });

            // Assert
            const cubicBulge = 45 * (3 / 20 + 8 / 30 + 3 / 20);
            const quadraticBulge = 2 / 3 * 10 * 2.5;
            expect(areaOf(face)).toBeCloseTo(100 + cubicBulge + quadraticBulge, 5);
            expectPoint(middleOf(edgesOf(face)[1]!), ground(13.75, 5));
        });

        it("should round and bevel corners between lines, the start corner too", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [
                { type: "hLine", length: 40 },
                { type: "vLine", length: 10 },
                { type: "filletCorner", radius: 2 },
                { type: "hLine", length: -40 },
                { type: "close" },
                { type: "chamferCorner", distance: 1 },
            ];

            // Act
            const face = occt.sketch.pen({ commands, makeFace: true });

            // Assert
            expect(areaOf(face)).toBeCloseTo(400 - (4 - Math.PI) - 0.5, 6);
            const round = edgesOf(face).find(edge => occt.shapes.edge.isEdgeCircular({ shape: edge }));
            expect(round).toBeDefined();
            expect(occt.shapes.edge.getCircularEdgeRadius({ shape: round! })).toBeCloseTo(2, 6);
            expectPoint(occt.shapes.edge.getCircularEdgeCenterPoint({ shape: round! }), ground(38, 8));
            expect(edgesOf(face)).toHaveLength(6);
        });

        it("should round the corner between a line and an arc with an arc touching both", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [
                { type: "hLine", length: 20 },
                { type: "filletCorner", radius: 2 },
                { type: "threePointArc", through: [20 + 10 - 10 * Math.SQRT1_2, 10 * Math.SQRT1_2], to: [30, 10] },
            ];

            // Act
            const edges = edgesOf(occt.sketch.pen({ commands }));

            // Assert
            expect(edges).toHaveLength(3);
            const fillet = edges[1]!;
            const filletCenter = occt.shapes.edge.getCircularEdgeCenterPoint({ shape: fillet });
            expect(occt.shapes.edge.getCircularEdgeRadius({ shape: fillet })).toBeCloseTo(2, 6);
            expect(Math.abs(filletCenter[2])).toBeCloseTo(2, 6);
            expect(distance(filletCenter, ground(30, 0))).toBeCloseTo(10 + 2, 6);
            expectPoint(occt.shapes.edge.endPointOnEdge({ shape: edges[0]! }), occt.shapes.edge.startPointOnEdge({ shape: fillet }));
            expectPoint(occt.shapes.edge.endPointOnEdge({ shape: fillet }), occt.shapes.edge.startPointOnEdge({ shape: edges[2]! }));
        });

        it("should accept the commands the command builders make", () => {
            // Arrange
            const commands = [
                occt.sketch.commands.hLine({ length: 40, id: "base" }),
                occt.sketch.commands.vLine({ length: 10 }),
                occt.sketch.commands.filletCorner({ radius: 2 }),
                occt.sketch.commands.line({ to: [0, 10] }),
                occt.sketch.commands.close({}),
                occt.sketch.commands.chamferCorner({ distance: 1 }),
            ];

            // Act
            const face = occt.sketch.pen({ commands, makeFace: true });

            // Assert
            expect(commands[0]).toEqual({ type: "hLine", length: 40, id: "base" });
            expect(commands[3]).toEqual({ type: "line", to: [0, 10], relative: false });
            expect(areaOf(face)).toBeCloseTo(400 - (4 - Math.PI) - 0.5, 6);
        });

        it("should make every command with its fields and defaults, naming it only when given an id", () => {
            // Arrange
            const builders = occt.sketch.commands;

            // Act
            const made = [
                builders.polarLine({ length: 12, angle: 30, id: "p" }),
                builders.tangentLine({}),
                builders.threePointArc({ through: [1, 2], to: [3, 0] }),
                builders.tangentArc({ to: [4, 4], relative: true }),
                builders.sagittaArc({ to: [6, 0], sagitta: -1 }),
                builders.bulgeArc({ to: [2, 0], bulge: 1 }),
                builders.quadratic({ control: [1, 1], to: [2, 0] }),
                builders.cubic({ control1: [1, 1], control2: [2, 1], to: [3, 0], relative: true }),
                builders.close({ id: "shut" }),
                builders.hLine({ length: 3, id: "" }),
            ];

            // Assert
            expect(made).toEqual([
                { type: "polarLine", length: 12, angle: 30, id: "p" },
                { type: "tangentLine", length: 10 },
                { type: "threePointArc", through: [1, 2], to: [3, 0], relative: false },
                { type: "tangentArc", to: [4, 4], relative: true },
                { type: "sagittaArc", to: [6, 0], sagitta: -1, relative: false },
                { type: "bulgeArc", to: [2, 0], bulge: 1, relative: false },
                { type: "quadratic", control: [1, 1], to: [2, 0], relative: false },
                { type: "cubic", control1: [1, 1], control2: [2, 1], to: [3, 0], relative: true },
                { type: "close", id: "shut" },
                { type: "hLine", length: 3 },
            ]);
        });
    });

    describe("pen with segments", () => {
        it("should report the edges each command drew by its id or position", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [
                { type: "hLine", id: "base", length: 40 },
                { type: "vLine", length: 10 },
                { type: "filletCorner", id: "round", radius: 2 },
                { type: "hLine", id: "top", length: -40 },
                { type: "close", id: "left" },
            ];

            // Act
            const drawn = occt.sketch.penWithSegments({ commands, makeFace: true });

            // Assert
            expect(drawn.segments).toEqual([
                { id: "base", command: 0, edges: [0] },
                { id: "1", command: 1, edges: [1] },
                { id: "round", command: 2, edges: [2] },
                { id: "top", command: 3, edges: [3] },
                { id: "left", command: 4, edges: [4] },
            ]);
            const middles = edgesOf(drawn.shape).map(middleOf);
            expectPoint(middles[0]!, ground(20, 0));
            expectPoint(middles[1]!, ground(40, 4));
            expectPoint(middles[3]!, ground(19, 10));
            expectPoint(middles[4]!, ground(0, 5));
        });

        it("should list the start corner's edge last, where the outline returns to its start", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [
                { type: "hLine", id: "base", length: 10 },
                { type: "vLine", id: "side", length: 10 },
                { type: "hLine", id: "top", length: -10 },
                { type: "close", id: "left" },
                { type: "filletCorner", id: "start", radius: 2 },
            ];

            // Act
            const drawn = occt.sketch.penWithSegments({ commands, makeFace: true });

            // Assert
            expect(drawn.segments.at(-1)).toEqual({ id: "start", command: 4, edges: [4] });
            const corner = edgesOf(drawn.shape)[4]!;
            expect(occt.shapes.edge.isEdgeCircular({ shape: corner })).toBe(true);
            expectPoint(occt.shapes.edge.getCircularEdgeCenterPoint({ shape: corner }), ground(2, 2));
            expect(areaOf(drawn.shape)).toBeCloseTo(100 - (4 - Math.PI), 6);
        });

        it("should leave out a close that drew nothing", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [
                { type: "hLine", id: "a", length: 10 },
                { type: "vLine", id: "b", length: 10 },
                { type: "line", id: "c", to: [0, 0] },
                { type: "close", id: "shut" },
            ];

            // Act
            const drawn = occt.sketch.penWithSegments({ commands, makeFace: true });

            // Assert
            expect(drawn.segments.map(segment => segment.id)).toEqual(["a", "b", "c"]);
            expect(areaOf(drawn.shape)).toBeCloseTo(50, 6);
        });
    });

    describe("refusals", () => {
        const refusal = (commands: unknown, extra: Partial<Inputs.OCCT.SketchPenDto> = {}): string => thrownBy(() => occt.sketch.pen({ commands: commands as Models.OCCT.SketchCommand[], ...extra })).message;

        it("should refuse commands that cannot be drawn, naming the command", () => {
            // Arrange
            const cases: [unknown, RegExp][] = [
                [{ hLine: 10 }, /commands/],
                [[{ type: "spiral" }], /position 0 has the type "spiral"/],
                [[{ type: "tangentLine", length: 5 }], /position 0 continues from the segment before it/],
                [[{ type: "filletCorner", radius: 1 }], /position 0 rounds or bevels a corner with no segment before it/],
                [[{ type: "hLine", length: 5 }, { type: "filletCorner", radius: 1 }], /position 1 rounds or bevels a corner that has no segment after it/],
                [[{ type: "hLine", length: 5 }, { type: "filletCorner", radius: 1 }, { type: "chamferCorner", distance: 1 }], /position 2 follows another corner command/],
                [[{ type: "hLine", length: 5 }, { type: "vLine", length: 5 }, { type: "close" }, { type: "hLine", length: 1 }], /position 3 comes after `close`/],
                [[{ type: "hLine", length: 0 }], /position 0 has the length 0/],
                [[{ type: "line", to: [0, 0] }], /draws a segment of no length/],
                [[{ type: "threePointArc", through: [1, 1], to: [2, 2] }], /three points lie on one line/],
                [[{ type: "hLine", length: 5 }, { type: "tangentArc", to: [10, 0] }], /straight ahead/],
                [[{ type: "hLine", id: "x", length: 5 }, { type: "vLine", id: "x", length: 5 }], /\(`x`\) uses the id `x`/],
                [[{ type: "line", to: [1] }], /`to` that is not a point/],
                [[{ type: "hLine", length: 2 }, { type: "filletCorner", radius: 5 }, { type: "vLine", length: 2 }], /too large|does not fit/],
                [[{ type: "hLine", length: 5 }, { type: "filletCorner", radius: 1 }, { type: "quadratic", control: [8, 5], to: [10, 0] }], /next to a Bezier curve/],
                [[{ type: "hLine", length: 5 }, { type: "filletCorner", radius: 1 }, { type: "hLine", length: 5 }], /meet in a straight line/],
                [[], /draw nothing/],
            ];

            // Act
            const messages = cases.map(([commands]) => refusal(commands));

            // Assert
            messages.forEach((message, index) => {
                expect(message).toMatch(cases[index]![1]);
            });
        });

        it("should refuse a face for an outline that is open or crosses itself", () => {
            // Arrange
            const open: Models.OCCT.SketchCommand[] = [{ type: "hLine", length: 10 }, { type: "vLine", length: 10 }];
            const bowTie: Models.OCCT.SketchCommand[] = [{ type: "line", to: [10, 10] }, { type: "vLine", length: -10 }, { type: "line", to: [0, 6] }, { type: "close" }];

            // Act
            const flat: Models.OCCT.SketchCommand[] = [{ type: "hLine", length: 10 }, { type: "hLine", length: -10 }];
            const openMessage = refusal(open, { makeFace: true });
            const crossingMessage = refusal(bowTie, { makeFace: true });
            const flatMessage = refusal(flat, { makeFace: true });

            // Assert
            expect(openMessage).toMatch(/needs a closed outline/);
            expect(crossingMessage).toMatch(/crosses itself/);
            expect(flatMessage).toMatch(/encloses no area/);
        });

        it("should refuse a start point or frame that is not one", () => {
            // Arrange
            const commands: Models.OCCT.SketchCommand[] = [{ type: "hLine", length: 10 }];

            // Act
            const startMessage = refusal(commands, { start: loose<Inputs.Base.Point2>([1, 2, 3]) });
            const frameMessage = refusal(commands, { frame: { origin: [0, 0, 0], normal: [0, 0, 0], direction: [1, 0, 0] } });

            // Assert
            expect(startMessage).toMatch(/`start` is not a 2D point/);
            expect(frameMessage).toMatch(/`frame` is not a frame/);
        });
    });

    describe("stroke", () => {
        const line = (): TopoDS_Shape => occt.sketch.pen({ commands: [{ type: "hLine", length: 20 }] });

        it("should outline an open wire with the chosen ends", () => {
            // Arrange
            const wire = line();

            // Act
            const round = occt.sketch.stroke({ shape: wire, width: 4, cap: Inputs.OCCT.strokeCapEnum.round });
            const flat = occt.sketch.stroke({ shape: wire, width: 4, cap: Inputs.OCCT.strokeCapEnum.flat });
            const square = occt.sketch.stroke({ shape: wire, width: 4, cap: Inputs.OCCT.strokeCapEnum.square });

            // Assert
            expect(areaOf(round)).toBeCloseTo(80 + Math.PI * 4, 5);
            expect(areaOf(flat)).toBeCloseTo(80, 5);
            expect(areaOf(square)).toBeCloseTo(96, 5);
            expectPoint(normalOf(flat), [0, 1, 0]);
        });

        it("should outline a closed wire as a ring", () => {
            // Arrange
            const circle = occt.shapes.wire.createCircleWire({ radius: 10, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const ring = occt.sketch.stroke({ shape: circle, width: 2 });
            const wires = occt.sketch.stroke({ shape: circle, width: 2, makeFace: false });

            // Assert
            expect(areaOf(ring)).toBeCloseTo(2 * Math.PI * 10 * 2, 4);
            expect(occt.shapes.wire.getWires({ shape: wires })).toHaveLength(2);
        });

        it("should outline a clockwise closed wire as a ring facing the frame's normal", () => {
            // Arrange
            const clockwise = occt.sketch.pen({ commands: [{ type: "vLine", length: 10 }, { type: "hLine", length: 10 }, { type: "vLine", length: -10 }, { type: "close" }] });

            // Act
            const ring = occt.sketch.stroke({ shape: clockwise, width: 2, join: Inputs.OCCT.joinTypeEnum.intersection });

            // Assert
            expect(areaOf(ring)).toBeCloseTo(144 - 64, 5);
            expectPoint(normalOf(ring), [0, 1, 0]);
        });

        it("should refuse a width that splits the inside of a closed wire apart", () => {
            // Arrange
            const dumbbell = occt.sketch.pen({ commands: [
                { type: "hLine", length: 10 }, { type: "vLine", length: 4 }, { type: "hLine", length: 10 }, { type: "vLine", length: -4 },
                { type: "hLine", length: 10 }, { type: "vLine", length: 10 }, { type: "hLine", length: -10 }, { type: "vLine", length: -4 },
                { type: "hLine", length: -10 }, { type: "vLine", length: 4 }, { type: "hLine", length: -10 }, { type: "close" },
            ] });

            // Act
            const message = thrownBy(() => occt.sketch.stroke({ shape: dumbbell, width: 4, join: Inputs.OCCT.joinTypeEnum.intersection })).message;

            // Assert
            expect(message).toMatch(/`width` is too wide for the wire: its offset breaks apart/);
        });

        it("should pass on the kernel's failure when the inside of a closed wire vanishes", () => {
            // Arrange
            const small = occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const act = (): unknown => occt.sketch.stroke({ shape: small, width: 4 });

            // Assert
            expect(act).toThrow(/offset could not be built/);
        });

        it("should return the outline as a closed wire when no face is asked for", () => {
            // Arrange
            const wire = line();

            // Act
            const outline = occt.sketch.stroke({ shape: wire, width: 4, makeFace: false });

            // Assert
            expect(occt.shapes.shape.getShapeType({ shape: outline })).toBe(Inputs.OCCT.shapeTypeEnum.wire);
            expect(occt.shapes.wire.isWireClosed({ shape: outline })).toBe(true);
        });

        it("should refuse a wire off the frame's plane", () => {
            // Arrange
            const raised = occt.shapes.wire.createLineWire({ start: [0, 1, 0], end: [10, 1, 0] });

            // Act
            const message = thrownBy(() => occt.sketch.stroke({ shape: raised, width: 2 })).message;

            // Assert
            expect(message).toMatch(/does not lie in the frame's plane/);
        });

        it("should go around corners as the join says, and take a bare edge as a wire", () => {
            // Arrange
            const corner = occt.sketch.pen({ commands: [{ type: "hLine", length: 20 }, { type: "vLine", length: 20 }] });
            const edge = occt.shapes.edge.line({ start: [0, 0, 0], end: [20, 0, 0] });

            // Act
            const sharp = occt.sketch.stroke({ shape: corner, width: 4, cap: Inputs.OCCT.strokeCapEnum.flat, join: Inputs.OCCT.joinTypeEnum.intersection });
            const rounded = occt.sketch.stroke({ shape: corner, width: 4, cap: Inputs.OCCT.strokeCapEnum.flat, join: Inputs.OCCT.joinTypeEnum.arc });
            const fromEdge = occt.sketch.stroke({ shape: edge, width: 4, cap: Inputs.OCCT.strokeCapEnum.flat });

            // Assert
            expect(areaOf(sharp)).toBeCloseTo(160, 5);
            expect(areaOf(rounded)).toBeCloseTo(156 + Math.PI, 5);
            expect(areaOf(fromEdge)).toBeCloseTo(80, 5);
        });

        it("should refuse a shape that is not a wire or an edge", () => {
            // Arrange
            const face = occt.sketch.pen({ commands: rectangle, makeFace: true });

            // Act
            const message = thrownBy(() => occt.sketch.stroke({ shape: face, width: 2 })).message;

            // Assert
            expect(message).toMatch(/`shape` is not a wire or an edge/);
        });
    });

    describe("hull", () => {
        const circle = (x: number, y: number, radius: number): TopoDS_Wire => occt.shapes.wire.createCircleWire({ radius, center: ground(x, y), direction: [0, 1, 0] });

        it("should wrap circles in tangent lines and the arcs of the circles", () => {
            // Arrange
            const shapes = [circle(0, 0, 2), circle(20, 0, 2), circle(20, 10, 2), circle(0, 10, 2)];

            // Act
            const hull = occt.sketch.hull({ shapes });

            // Assert
            expect(areaOf(hull)).toBeCloseTo(200 + 2 * (20 + 10) * 2 + Math.PI * 4, 5);
            expectPoint(normalOf(hull), [0, 1, 0]);
            const circular = edgesOf(hull).filter(edge => occt.shapes.edge.isEdgeCircular({ shape: edge }));
            expect(circular).toHaveLength(4);
        });

        it("should wrap circles of different sizes", () => {
            // Arrange
            const shapes = [circle(0, 0, 5), circle(20, 0, 2)];

            // Act
            const hull = occt.sketch.hull({ shapes });

            // Assert
            const tilt = Math.asin(3 / 20);
            const straight = 2 * Math.sqrt(400 - 9) * (5 + 2) / 2;
            const expected = straight + (Math.PI + 2 * tilt) * 25 / 2 + (Math.PI - 2 * tilt) * 4 / 2;
            expect(areaOf(hull)).toBeCloseTo(expected, 4);
        });

        it("should wrap vertices, lines and arcs, leaving out what lies inside", () => {
            // Arrange
            const arc = occt.shapes.edge.arcThroughThreePoints({ start: ground(5, 0), middle: ground(0, 5), end: ground(-5, 0) });
            const below = occt.shapes.vertex.vertexFromPoint({ point: ground(0, -5) });
            const inside = occt.shapes.wire.createLineWire({ start: ground(-1, 0), end: ground(1, 1) });

            const backwards = occt.shapes.edge.arcThroughThreePoints({ start: ground(-5, 0), middle: ground(0, 5), end: ground(5, 0) });

            // Act
            const hull = occt.sketch.hull({ shapes: [arc, below, inside] });
            const fromBackwards = occt.sketch.hull({ shapes: [backwards, below] });

            // Assert
            expect(areaOf(hull)).toBeCloseTo(Math.PI * 25 / 2 + 25, 5);
            expect(areaOf(fromBackwards)).toBeCloseTo(Math.PI * 25 / 2 + 25, 5);
        });

        it("should wrap shapes lying in the plane of the frame it is given", () => {
            // Arrange
            const frame: Inputs.Base.Frame = { origin: [0, 0, 5], normal: [0, 0, 1], direction: [1, 0, 0] };
            const shapes = [
                occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 5], direction: [0, 0, 1] }),
                occt.shapes.wire.createCircleWire({ radius: 1, center: [10, 0, 5], direction: [0, 0, -1] }),
            ];

            // Act
            const hull = occt.sketch.hull({ shapes, frame });

            // Assert
            expect(areaOf(hull)).toBeCloseTo(20 + Math.PI, 5);
            expectPoint(normalOf(hull), [0, 0, 1]);
        });

        it("should give a wire when no face is asked for", () => {
            // Arrange
            const shapes = [circle(0, 0, 1), circle(5, 0, 1)];

            // Act
            const hull = occt.sketch.hull({ shapes, makeFace: false });

            // Assert
            expect(occt.shapes.shape.getShapeType({ shape: hull })).toBe(Inputs.OCCT.shapeTypeEnum.wire);
            expect(occt.shapes.wire.isWireClosed({ shape: hull })).toBe(true);
        });

        it("should refuse shapes it cannot wrap exactly", () => {
            // Arrange
            const spline = occt.shapes.wire.interpolatePoints({ points: [ground(0, 0), ground(5, 3), ground(10, 0)], periodic: false, tolerance: 1e-7 });
            const tilted = occt.shapes.wire.createCircleWire({ radius: 2, center: [0, 0, 0], direction: [1, 0, 0] });
            const raised = occt.shapes.vertex.vertexFromPoint({ point: [0, 3, 0] });
            const inLine = [occt.shapes.vertex.vertexFromPoint({ point: ground(0, 0) }), occt.shapes.vertex.vertexFromPoint({ point: ground(5, 0) })];

            // Act
            const empty = occt.shapes.compound.makeCompound({ shapes: [] });
            const messages = [[spline], [tilted], [raised], inLine, [], [empty]].map(shapes => thrownBy(() => occt.sketch.hull({ shapes })).message);

            // Assert
            expect(messages[0]).toMatch(/neither straight nor circular/);
            expect(messages[1]).toMatch(/tilted out of the frame's plane/);
            expect(messages[2]).toMatch(/does not lie in the frame's plane/);
            expect(messages[3]).toMatch(/wrap no area/);
            expect(messages[4]).toMatch(/nothing to wrap/);
            expect(messages[5]).toMatch(/has no vertex or edge to wrap/);
        });
    });
});
