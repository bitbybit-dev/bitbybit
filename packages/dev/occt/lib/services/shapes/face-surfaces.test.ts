import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT faces through points and between edges", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const close = (values: number[], digits = 9): unknown[] => values.map(value => expect.closeTo(value, digits));
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
    const farthest = (face: TopoDS_Shape, points: Inputs.Base.Point3[]): number =>
        Math.max(...occt.analysis.surfaces.closestPoints({ shape: loose<TopoDS_Face>(face), points }).map(found => found.distance));
    const areaOf = (shape: TopoDS_Shape): number => occt.shapes.face.getFaces({ shape }).reduce((sum, face) => sum + occt.shapes.face.getFaceArea({ shape: face }), 0);
    const segments = (points: Inputs.Base.Point3[]): TopoDS_Edge[] => points.slice(1).map((end, index) => occt.shapes.edge.line({ start: points[index]!, end }));
    const saddleGrid = (): Inputs.Base.Point3[][] => [0, 3, 6, 9].map(x => [0, 2, 4, 6, 8].map((y): Inputs.Base.Point3 => [x, y, x * y / 10]));
    const bumpyGrid = (height: number): Inputs.Base.Point3[][] => Array.from({ length: 8 }, (_, row) => Array.from({ length: 8 }, (__, column): Inputs.Base.Point3 => [row, column, (row + column) % 2 === 0 ? height : -height]));

    describe("fromPointGrid", () => {
        it("should interpolate a grid through every point, the rows stepping along u and each row running along v", () => {
            // Arrange
            const points = saddleGrid();

            // Act
            const face = occt.shapes.face.fromPointGrid({ points });

            // Assert
            expect(farthest(face, points.flat())).toBeLessThan(1e-7);
            expect(occt.shapes.face.pointOnUV({ shape: face, paramU: 0, paramV: 0 })).toEqual(close([0, 0, 0]));
            expect(occt.shapes.face.pointOnUV({ shape: face, paramU: 0, paramV: 1 })).toEqual(close([0, 8, 0]));
            expect(occt.shapes.face.pointOnUV({ shape: face, paramU: 1, paramV: 0 })).toEqual(close([9, 0, 0]));
            expect(occt.shapes.face.pointOnUV({ shape: face, paramU: 1, paramV: 1 })).toEqual(close([9, 8, 7.2]));
        });

        it("should approximate within the tolerance asked, and smooth bumps away at a large one", () => {
            // Arrange
            const points = bumpyGrid(0.2);

            // Act
            const tight = occt.shapes.face.fromPointGrid({ points, interpolate: false, tolerance: 1e-3 });
            const smooth = occt.shapes.face.fromPointGrid({ points, interpolate: false, tolerance: 0.5 });

            // Assert
            expect(farthest(tight, points.flat())).toBeLessThan(1e-3);
            expect(farthest(smooth, points.flat())).toBeGreaterThan(0.01);
        });

        it("should close a periodic grid into a tube in u through every point", () => {
            // Arrange
            const points = Array.from({ length: 8 }, (_, row) => [0, 1, 2].map((z): Inputs.Base.Point3 => [2 * Math.cos(row * Math.PI / 4), 2 * Math.sin(row * Math.PI / 4), z]));

            // Act
            const tube = occt.shapes.face.fromPointGrid({ points, periodic: true });

            // Assert
            expect(farthest(tube, points.flat())).toBeLessThan(1e-7);
            expect(occt.shapes.face.pointOnUV({ shape: tube, paramU: 1, paramV: 0.5 })).toEqual(close(occt.shapes.face.pointOnUV({ shape: tube, paramU: 0, paramV: 0.5 })));
        });

        it("should read the degrees and the tolerance only when approximating", () => {
            // Arrange
            const points = saddleGrid();

            // Act
            const interpolated = occt.shapes.face.fromPointGrid({ points, degreeMin: 0, degreeMax: 30, tolerance: 0 });
            const refused = thrownBy(() => occt.shapes.face.fromPointGrid({ points, interpolate: false, degreeMin: 0 }));

            // Assert
            expect(farthest(interpolated, points.flat())).toBeLessThan(1e-7);
            expect(refused.message).toBe("`degreeMin` must be a whole number from 1 to 25; it is 0.");
        });

        it.each([
            { name: "points that are not rows", inputs: { points: loose<Inputs.Base.Point3[][]>([1, 2]) }, message: "`points` is not a list of rows of points." },
            { name: "a flat list of points", inputs: { points: loose<Inputs.Base.Point3[][]>([[0, 0, 0], [1, 0, 0]]) }, message: "`points` holds something other than a point in row 0 at position 0; each is three finite numbers." },
            { name: "rows of different lengths", inputs: { points: [[[0, 0, 0], [0, 1, 0]], [[1, 0, 0]]] as Inputs.Base.Point3[][] }, message: "`points` holds rows of different lengths: row 1 has 1 points and row 0 has 2." },
            { name: "a single row", inputs: { points: [[[0, 0, 0], [0, 1, 0]]] as Inputs.Base.Point3[][] }, message: "`points` needs at least two rows of at least two points; it has 1 rows, the first of 2 points." },
            { name: "a point that is not a number", inputs: { points: [[[0, 0, 0], [0, 1, 0]], [[1, 0, 0], [1, Number.NaN, 0]]] as Inputs.Base.Point3[][] }, message: "`points` holds something other than a point in row 1 at position 1; each is three finite numbers." },
            { name: "degrees the wrong way round", inputs: { points: saddleGrid(), interpolate: false, degreeMin: 5, degreeMax: 3 }, message: "`degreeMax` is 3, below `degreeMin`, which is 5." },
            { name: "a tolerance of 0", inputs: { points: saddleGrid(), interpolate: false, tolerance: 0 }, message: "`tolerance` must be a finite number above 0; it is 0." },
        ])("should refuse $name", ({ inputs, message }) => {
            // Act
            const error = thrownBy(() => occt.shapes.face.fromPointGrid(inputs));

            // Assert
            expect(error.message).toBe(message);
        });

        it("should refuse neighbouring rows that hold the same points", () => {
            // Arrange
            const grid = saddleGrid();

            // Act
            const repeated = messageOf(() => occt.shapes.face.fromPointGrid({ points: [grid[0]!, grid[0]!, grid[1]!] }));

            // Assert
            expect(repeated).toBe("Standard_DomainError: FaceThroughPointGrid: two neighbouring rows or columns hold the same points");
        });
    });

    describe("ruledBetween", () => {
        it("should rule a face between two edges", () => {
            // Arrange
            const bottom = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
            const top = occt.shapes.edge.line({ start: [0, 5, 0], end: [10, 5, 0] });

            // Act
            const ruled = occt.shapes.face.ruledBetween({ shapeA: bottom, shapeB: top });

            // Assert
            expect(occt.shapes.shape.getShapeType({ shape: ruled })).toBe(Inputs.OCCT.shapeTypeEnum.face);
            expect(occt.shapes.face.getFaceArea({ shape: loose<TopoDS_Face>(ruled) })).toBeCloseTo(50, 9);
        });

        it("should rule a shell of one face per pair of edges between two wires", () => {
            // Arrange
            const lower = occt.shapes.wire.createSquareWire({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
            const upper = occt.shapes.wire.createSquareWire({ size: 10, center: [0, 5, 0], direction: [0, 1, 0] });

            // Act
            const walls = occt.shapes.face.ruledBetween({ shapeA: lower, shapeB: upper });

            // Assert
            expect(occt.shapes.shape.getShapeType({ shape: walls })).toBe(Inputs.OCCT.shapeTypeEnum.shell);
            expect(occt.shapes.face.getFaces({ shape: walls })).toHaveLength(4);
            expect(areaOf(walls)).toBeCloseTo(200, 9);
        });

        it("should join the points at the same share of each curve with straight lines", () => {
            // Arrange
            const line = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
            const arc = occt.shapes.edge.arcThroughThreePoints({ start: [0, 0, 5], middle: [5, 3, 5], end: [10, 0, 5] });

            // Act
            const face = occt.shapes.face.ruledBetween({ shapeA: line, shapeB: arc });

            // Assert
            expect(farthest(face, [[0, 0, 2.5], [10, 0, 2.5], [5, 3, 5], [5, 0, 0]])).toBeLessThan(1e-7);
        });

        it("should refuse shapes that are not two edges or two wires, one shape twice, and wires of different edge counts", () => {
            // Arrange
            const box = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0], originOnCenter: true });
            const line = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
            const square = occt.shapes.wire.createSquareWire({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
            const triangle = occt.shapes.wire.createPolygonWire({ points: [[0, 5, 0], [10, 5, 0], [0, 5, 10]] });

            // Act
            const solids = messageOf(() => occt.shapes.face.ruledBetween({ shapeA: box, shapeB: box }));
            const twice = messageOf(() => occt.shapes.face.ruledBetween({ shapeA: line, shapeB: line }));
            const counts = messageOf(() => occt.shapes.face.ruledBetween({ shapeA: square, shapeB: triangle }));
            const missing = thrownBy(() => occt.shapes.face.ruledBetween({ shapeA: loose<TopoDS_Shape>(undefined), shapeB: line }));

            // Assert
            expect(solids).toBe("Standard_DomainError: RuledBetween: the shapes are not two edges or two wires");
            expect(twice).toBe("Standard_DomainError: RuledBetween: the shapes are one and the same");
            expect(counts).toBe("Standard_DomainError: RuledBetween: the wires have different numbers of edges");
            expect(missing.property).toBe("shapeA");
        });
    });

    describe("boundaryPatch", () => {
        it("should fill a flat square of four edges given in any order and direction", () => {
            // Arrange
            const [bottom, right, top, left] = segments([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [0, 0, 0]]);
            const reversedTop = occt.shapes.edge.reversedEdge({ shape: top! });

            // Act
            const patch = occt.shapes.face.boundaryPatch({ edges: [left!, bottom!, reversedTop, right!] });

            // Assert
            expect(occt.shapes.face.getFaceArea({ shape: patch })).toBeCloseTo(100, 9);
            expect(occt.analysis.measure.tightBoundingBox({ shape: patch }).size[2]).toBeCloseTo(0, 6);
        });

        it("should pass a patch of a twisted quad through its corners, in each style", () => {
            // Arrange
            const corners: Inputs.Base.Point3[] = [[0, 0, 0], [10, 0, 3], [10, 10, 0], [0, 10, 3]];
            const edges = segments([...corners, corners[0]!]);

            // Act
            const patches = [Inputs.OCCT.fillingStyleEnum.stretch, Inputs.OCCT.fillingStyleEnum.coons, Inputs.OCCT.fillingStyleEnum.curved]
                .map(style => occt.shapes.face.boundaryPatch({ edges, style }));

            // Assert
            patches.forEach(patch => expect(farthest(patch, [...corners, [5, 0, 1.5], [10, 5, 1.5]])).toBeLessThan(1e-7));
        });

        it("should close three edges with a straight fourth side between the free ends", () => {
            // Arrange
            const threeSidesOutOfOrder = segments([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]]).reverse();
            const triangle = segments([[0, 0, 0], [10, 0, 0], [0, 10, 0], [0, 0, 0]]);

            // Act
            const square = occt.shapes.face.boundaryPatch({ edges: threeSidesOutOfOrder });
            const halfSquare = occt.shapes.face.boundaryPatch({ edges: triangle });

            // Assert
            expect(occt.shapes.face.getFaceArea({ shape: square })).toBeCloseTo(100, 6);
            expect(occt.shapes.face.getFaceArea({ shape: halfSquare })).toBeCloseTo(50, 6);
        });

        it("should join two edges as opposite sides, or sweep one along the other in the curved style", () => {
            // Arrange
            const lower = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
            const upper = occt.shapes.edge.line({ start: [0, 5, 0], end: [10, 5, 0] });
            const along = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
            const up = occt.shapes.edge.line({ start: [0, 0, 0], end: [0, 5, 0] });

            // Act
            const strip = occt.shapes.face.boundaryPatch({ edges: [lower, upper] });
            const swept = occt.shapes.face.boundaryPatch({ edges: [along, up], style: Inputs.OCCT.fillingStyleEnum.curved });

            // Assert
            expect(occt.shapes.face.getFaceArea({ shape: strip })).toBeCloseTo(50, 6);
            expect(occt.shapes.face.getFaceArea({ shape: swept })).toBeCloseTo(50, 6);
            expect(farthest(swept, [[10, 5, 0]])).toBeLessThan(1e-7);
        });

        it("should refuse fewer than two or more than four edges, and a style that is none of the kinds", () => {
            // Arrange
            const edges = segments([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [4, 0, 0], [5, 0, 0]]);

            // Act
            const one = thrownBy(() => occt.shapes.face.boundaryPatch({ edges: edges.slice(0, 1) }));
            const five = thrownBy(() => occt.shapes.face.boundaryPatch({ edges }));
            const style = thrownBy(() => occt.shapes.face.boundaryPatch({ edges: edges.slice(0, 2), style: loose<Inputs.OCCT.fillingStyleEnum>("Coons") }));

            // Assert
            expect(one.message).toBe("`edges` holds 1 edges, and a patch is bounded by two, three or four.");
            expect(five.property).toBe("edges");
            expect(style.property).toBe("style");
        });

        it("should refuse four edges that do not close up, and two opposite edges in the curved style", () => {
            // Arrange
            const open = segments([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [0, 1, 0]]);
            const lower = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
            const upper = occt.shapes.edge.line({ start: [0, 5, 0], end: [10, 5, 0] });

            // Act
            const gap = messageOf(() => occt.shapes.face.boundaryPatch({ edges: open }));
            const apart = messageOf(() => occt.shapes.face.boundaryPatch({ edges: [lower, upper], style: Inputs.OCCT.fillingStyleEnum.curved }));

            // Assert
            expect(gap).toBe("Standard_DomainError: BoundaryPatch: the four edges do not close up end to end");
            expect(apart).toBe("Standard_DomainError: BoundaryPatch: in CurvedStyle two edges must share a corner");
        });
    });

    describe("fillPatch", () => {
        const squareEdges = (): TopoDS_Edge[] => segments([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [0, 0, 0]]);
        const cylinderWithRim = (): { cylinder: TopoDS_Shape; rim: TopoDS_Edge; side: TopoDS_Face } => {
            const cylinder = occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });
            const [rimIndex] = occt.select.edges.inSphere({ shape: cylinder, center: [0, 0, 5], radius: 1e-6 });
            const [sideIndex] = occt.select.faces.ofType({ shape: cylinder, type: Inputs.OCCT.surfaceTypeEnum.cylinder });
            return { cylinder, rim: occt.shapes.edge.getEdge({ shape: cylinder, index: rimIndex! }), side: occt.shapes.face.getFace({ shape: cylinder, index: sideIndex! }) };
        };
        const rimPoints: Inputs.Base.Point3[] = [[2, 0, 5], [0, 2, 5], [-2, 0, 5], [0, -2, 5]];
        const radialAlignment = (patch: TopoDS_Face): number[] => occt.analysis.surfaces.closestPoints({ shape: patch, points: rimPoints })
            .map(found => Math.abs(found.normal[0] * found.point[0] / 2 + found.normal[1] * found.point[1] / 2));
        const prismRimAndWalls = (): { rim: TopoDS_Edge[]; walls: TopoDS_Face[] } => {
            const prism = occt.operations.extrude({ shape: occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 0, 1] }), direction: [0, 0, 5] });
            const [top] = occt.select.faces.facing({ shape: prism, direction: [0, 0, 1], angle: 0 });
            const rim = occt.select.edges.ofFaces({ shape: prism, indexes: [top!] });
            return {
                rim: rim.map(index => occt.shapes.edge.getEdge({ shape: prism, index })),
                walls: rim.map(index => occt.shapes.face.getFace({ shape: prism, index: occt.select.faces.ofEdges({ shape: prism, indexes: [index] }).find(face => face !== top)! })),
            };
        };
        const quarterCylinder = (): TopoDS_Face => loose<TopoDS_Face>(occt.operations.revolve({ shape: occt.shapes.edge.line({ start: [2, 0, 0], end: [2, 0, 5] }), angle: 90, direction: [0, 0, 1] }));

        it("should fill a flat square flat, and reach up to a point above its middle keeping its boundary", () => {
            // Arrange
            const edges = squareEdges();

            // Act
            const flat = occt.shapes.face.fillPatch({ edges });
            const raised = occt.shapes.face.fillPatch({ edges, points: [[5, 5, 2]] });

            // Assert
            expect(occt.shapes.face.getFaceArea({ shape: flat })).toBeCloseTo(100, 3);
            expect(occt.analysis.measure.tightBoundingBox({ shape: flat }).size[2]).toBeLessThan(1e-6);
            expect(farthest(raised, [[5, 5, 2]])).toBeLessThan(1e-3);
            expect(farthest(raised, [[0, 0, 0], [5, 0, 0], [10, 10, 0], [0, 5, 0]])).toBeLessThan(1e-4);
        });

        it("should leave a cylinder's rim along the cylinder when tangent to it, and not when only passing through", () => {
            // Arrange
            const { rim, side } = cylinderWithRim();

            // Act
            const tangent = occt.shapes.face.fillPatch({ edges: [rim], continuities: [Inputs.OCCT.continuityEnum.tangent], supports: [side], points: [[0, 0, 7]] });
            const through = occt.shapes.face.fillPatch({ edges: [rim], points: [[0, 0, 7]] });

            // Assert
            radialAlignment(tangent).forEach(alignment => expect(alignment).toBeGreaterThan(Math.cos(0.02)));
            radialAlignment(through).forEach(alignment => expect(alignment).toBeLessThan(Math.cos(0.2)));
            expect(farthest(tangent, [[0, 0, 7]])).toBeLessThan(1e-3);
        });

        it("should hold a lid upright on a prism's walls given as supports, which its rim does not bound as curves", () => {
            // Arrange
            const { rim, walls } = prismRimAndWalls();
            const tangent = rim.map(() => Inputs.OCCT.continuityEnum.tangent);

            // Act
            const lid = occt.shapes.face.fillPatch({ edges: rim, continuities: tangent, supports: walls, points: [[0, 0, 7]] });
            const unsupported = messageOf(() => occt.shapes.face.fillPatch({ edges: rim, continuities: tangent, points: [[0, 0, 7]] }));

            // Assert
            occt.analysis.surfaces.closestPoints({ shape: lid, points: [[5, 0, 5], [0, 5, 5], [-5, 0, 5], [0, -5, 5]] })
                .forEach(found => expect(Math.abs(found.normal[2])).toBeLessThan(Math.sin(0.02)));
            expect(unsupported).toBe("Standard_DomainError: FillPatch: boundary edge 0 lies on no face to be tangent to; give it a support face");
        });

        it("should give an edge whose support entry is undefined no support face, at its own position", () => {
            // Arrange
            const { rim, walls } = prismRimAndWalls();
            const tangent = rim.map(() => Inputs.OCCT.continuityEnum.tangent);

            // Act
            const secondMissing = messageOf(() => occt.shapes.face.fillPatch({ edges: rim, continuities: tangent, supports: [walls[0], undefined, walls[2], walls[3]], points: [[0, 0, 7]] }));

            // Assert
            expect(secondMissing).toBe("Standard_DomainError: FillPatch: boundary edge 1 lies on no face to be tangent to; give it a support face");
        });

        it("should read empty lists, and null support entries, as nothing given", () => {
            // Arrange
            const edges = squareEdges();

            // Act
            const empty = occt.shapes.face.fillPatch({ edges, continuities: [], supports: [], points: [] });
            const nulls = occt.shapes.face.fillPatch({ edges, supports: loose<(TopoDS_Face | undefined)[]>([null, null, null, null]) });

            // Assert
            expect(occt.shapes.face.getFaceArea({ shape: empty })).toBeCloseTo(100, 3);
            expect(occt.shapes.face.getFaceArea({ shape: nulls })).toBeCloseTo(100, 3);
        });

        it("should delete the empty shapes it hands the kernel for edges without a support face", () => {
            // Arrange
            const quarter = quarterCylinder();
            const edges = occt.shapes.edge.getEdges({ shape: quarter });
            const made: { isDeleted(): boolean }[] = [];
            const original = kernel.TopoDS_Shape;
            Reflect.set(kernel, "TopoDS_Shape", new Proxy(original, {
                construct(target, args): object {
                    const shape = Reflect.construct(target, args);
                    made.push(shape);
                    return shape;
                },
            }));

            // Act
            try {
                occt.shapes.face.fillPatch({ edges, supports: [undefined, quarter, undefined, undefined] });
            } finally {
                Reflect.set(kernel, "TopoDS_Shape", original);
            }

            // Assert
            expect(made).toHaveLength(3);
            expect(made.filter(shape => !shape.isDeleted())).toEqual([]);
        });

        it.each([
            { name: "continuities that are not a list", inputs: { continuities: loose<Inputs.OCCT.continuityEnum[]>("tangent") }, message: "`continuities` is not a list." },
            { name: "continuities that are not one per edge", inputs: { continuities: [Inputs.OCCT.continuityEnum.tangent] }, message: "`continuities` holds 1 entries for 4 edges; give one per edge, or leave it out." },
            { name: "a continuity that is none of the kinds", inputs: { continuities: ["position", "position", "smooth", "position"] as Inputs.OCCT.continuityEnum[] }, message: "`continuities` is smooth, which is none of position, tangent, curvature." },
            { name: "a support that is no shape", inputs: { supports: [undefined, loose<TopoDS_Face>(7), undefined, undefined] }, message: "`supports` holds an empty shape or something other than a shape at position 1; an edge without a face beside it takes an undefined entry." },
            { name: "a point that is not a point", inputs: { points: [[5, 5]] as unknown[] as Inputs.Base.Point3[] }, message: "`points` holds something other than a point at position 0; each is three finite numbers." },
            { name: "a plate degree of 10", inputs: { degree: 10 }, message: "`degree` must be a whole number from 2 to 9; it is 10." },
            { name: "one point on each curve", inputs: { pointsOnCurves: 1 }, message: "`pointsOnCurves` must be a whole number 2 or more; it is 1." },
            { name: "no iterations", inputs: { iterations: 0 }, message: "`iterations` must be a whole number 1 or more; it is 0." },
            { name: "a tolerance of 0", inputs: { tolerance: 0 }, message: "`tolerance` must be a finite number above 0; it is 0." },
        ])("should refuse $name", ({ inputs, message }) => {
            // Act
            const error = thrownBy(() => occt.shapes.face.fillPatch({ edges: squareEdges(), ...inputs }));

            // Assert
            expect(error.message).toBe(message);
        });

        it("should refuse a tangent edge that bounds no face and has no support, and a boundary that does not close", () => {
            // Arrange
            const edges = squareEdges();

            // Act
            const noFace = messageOf(() => occt.shapes.face.fillPatch({ edges, continuities: [Inputs.OCCT.continuityEnum.tangent, Inputs.OCCT.continuityEnum.position, Inputs.OCCT.continuityEnum.position, Inputs.OCCT.continuityEnum.position] }));
            const open = messageOf(() => occt.shapes.face.fillPatch({ edges: edges.slice(0, 3) }));
            const none = thrownBy(() => occt.shapes.face.fillPatch({ edges: loose<TopoDS_Edge[]>(undefined) }));

            // Assert
            expect(noFace).toBe("Standard_DomainError: FillPatch: boundary edge 0 lies on no face to be tangent to; give it a support face");
            expect(open).toBe("Standard_DomainError: FillPatch: the boundary edges do not close up into one loop");
            expect(none.property).toBe("edges");
        });
    });
});
