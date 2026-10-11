import { describe, it, expect, beforeAll } from "vitest";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT selectors", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const box = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 10, length: 30, height: 20, center: [0, 0, 0], originOnCenter: true });
    const cylinder = (): TopoDS_Shape => occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 0, 1] });
    const faceCentres = (shape: TopoDS_Shape): Inputs.Base.Point3[] => occt.shapes.face.getFacesCentersOfMass({ shapes: occt.shapes.face.getFaces({ shape }) });
    const edgeCentres = (shape: TopoDS_Shape): Inputs.Base.Point3[] => occt.shapes.edge.getEdgesCentersOfMass({ shapes: occt.shapes.edge.getEdges({ shape }) });
    const highestOf = (points: Inputs.Base.Point3[]): number => Math.max(...points.map(point => point[2]));
    const onlyWhere = (points: Inputs.Base.Point3[], keep: (point: Inputs.Base.Point3) => boolean): number[] => points.flatMap((point, index) => keep(point) ? [index] : []);
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };
    const loose = <T>(value: unknown): T => value as T;
    const distance = (a: Inputs.Base.Point3, b: Inputs.Base.Point3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const spline = (): TopoDS_Shape => occt.shapes.wire.interpolatePoints({ points: [[2, 0, 0], [3, 2, 0], [5, 1, 0], [6, 3, 0]], periodic: false, tolerance: 1e-7 });
    const circleWire = (radius: number, z: number): TopoDS_Shape => occt.shapes.wire.createCircleWire({ radius, center: [0, 0, z], direction: [0, 0, 1] });
    const facesOfEveryType = (shape: TopoDS_Shape): Partial<Record<Inputs.OCCT.surfaceTypeEnum, number[]>> =>
        Object.fromEntries(Object.values(Inputs.OCCT.surfaceTypeEnum).map(type => [type, occt.select.faces.ofType({ shape, type })]).filter(([, faces]) => (faces as number[]).length > 0));
    const edgesOfEveryType = (shape: TopoDS_Shape): Partial<Record<Inputs.OCCT.curveTypeEnum, number[]>> =>
        Object.fromEntries(Object.values(Inputs.OCCT.curveTypeEnum).map(type => [type, occt.select.edges.ofType({ shape, type })]).filter(([, edges]) => (edges as number[]).length > 0));

    describe("faces", () => {
        it("should choose the faces on each kind of surface", () => {
            // Arrange
            const shape = cylinder();
            const sphere = occt.shapes.solid.createSphere({ radius: 3, center: [0, 0, 0] });

            // Act
            const planes = occt.select.faces.ofType({ shape, type: Inputs.OCCT.surfaceTypeEnum.plane });
            const walls = occt.select.faces.ofType({ shape, type: Inputs.OCCT.surfaceTypeEnum.cylinder });
            const spheres = occt.select.faces.ofType({ shape: sphere, type: Inputs.OCCT.surfaceTypeEnum.sphere });
            const none = occt.select.faces.ofType({ shape, type: Inputs.OCCT.surfaceTypeEnum.torus });

            // Assert
            expect(planes).toHaveLength(2);
            expect(walls).toHaveLength(1);
            expect([...planes, ...walls].sort()).toEqual([0, 1, 2]);
            expect(spheres).toEqual([0]);
            expect(none).toEqual([]);
        });

        it("should choose the faces facing a direction within an angle given in degrees", () => {
            // Arrange
            const shape = box();
            const centres = faceCentres(shape);

            // Act
            const up = occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 0 });
            const nearlyUp = occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 89 });
            const upOrSideways = occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 90 });

            // Assert
            expect(up).toEqual(onlyWhere(centres, point => point[2] === highestOf(centres)));
            expect(nearlyUp).toEqual(up);
            expect(upOrSideways).toHaveLength(5);
        });

        it("should choose the faces furthest along a direction, within the tolerance", () => {
            // Arrange
            const shape = box();
            const centres = faceCentres(shape);

            // Act
            const top = occt.select.faces.extreme({ shape, direction: [0, 0, 1], tolerance: 1e-7 });
            const topAndSides = occt.select.faces.extreme({ shape, direction: [0, 0, 1], tolerance: 16 });

            // Assert
            expect(top).toEqual(onlyWhere(centres, point => point[2] === highestOf(centres)));
            expect(topAndSides).toHaveLength(5);
        });

        it("should choose the faces centred in a box, in a sphere, nearest a point and on a plane", () => {
            // Arrange
            const shape = box();
            const centres = faceCentres(shape);
            const top = onlyWhere(centres, point => point[2] === highestOf(centres));

            // Act
            const inBox = occt.select.faces.inBox({ shape, corner: [-20, -20, 14], oppositeCorner: [20, 20, 16] });
            const inSphere = occt.select.faces.inSphere({ shape, center: [0, 0, 15], radius: 1 });
            const nearest = occt.select.faces.nearest({ shape, point: [0, 0, 100], count: 1 });
            const onPlane = occt.select.faces.onPlane({ shape, origin: [3, 3, 15], normal: [0, 0, -1], tolerance: 1e-7 });

            // Assert
            expect(inBox).toEqual(top);
            expect(inSphere).toEqual(top);
            expect(nearest).toEqual(top);
            expect(onPlane).toEqual(top);
        });

        it("should choose the faces by area and by radius", () => {
            // Arrange
            const shape = box();
            const areas = occt.shapes.face.getFaces({ shape }).map(face => occt.shapes.face.getFaceArea({ shape: face }));

            // Act
            const middle = occt.select.faces.bySize({ shape, min: 250, max: 350 });
            const wall = occt.select.faces.byRadius({ shape: cylinder(), min: 1.9, max: 2.1 });

            // Assert
            expect(middle.map(index => areas[index])).toEqual([300, 300].map(area => expect.closeTo(area, 6)));
            expect(wall).toEqual(occt.select.faces.ofType({ shape: cylinder(), type: Inputs.OCCT.surfaceTypeEnum.cylinder }));
        });

        it("should choose the faces around a face and along edges", () => {
            // Arrange
            const shape = box();
            const [top] = occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 0 });
            const [bottom] = occt.select.faces.facing({ shape, direction: [0, 0, -1], angle: 0 });

            // Act
            const around = occt.select.faces.adjacentTo({ shape, indexes: [top!] });
            const topEdges = occt.select.edges.ofFaces({ shape, indexes: [top!] });
            const alongTopEdges = occt.select.faces.ofEdges({ shape, indexes: topEdges });

            // Assert
            expect(around).toHaveLength(4);
            expect(around).not.toContain(bottom);
            expect(alongTopEdges).toEqual([...around, top!].sort((a, b) => a - b));
        });

        it("should sort the faces along a direction and group them by level", () => {
            // Arrange
            const shape = box();
            const centres = faceCentres(shape);

            // Act
            const sorted = occt.select.faces.sortAlong({ shape, direction: [0, 0, 1] });
            const levels = occt.select.faces.groupAlong({ shape, direction: [0, 0, 1], tolerance: 0.1 });

            // Assert
            expect(sorted.map(index => centres[index]![2])).toEqual([...centres.map(point => point[2])].sort((a, b) => a - b));
            expect(levels.map(level => level.length)).toEqual([1, 4, 1]);
        });

        it("should narrow a choice to the given faces, keeping their order", () => {
            // Arrange
            const shape = box();

            // Act
            const narrowed = occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 180, indexes: [4, 1, 3] });

            // Assert
            expect(narrowed).toEqual([4, 1, 3]);
        });
    });

    describe("edges", () => {
        it("should choose the edges on each kind of curve", () => {
            // Arrange
            const shape = cylinder();

            // Act
            const circles = occt.select.edges.ofType({ shape, type: Inputs.OCCT.curveTypeEnum.circle });
            const lines = occt.select.edges.ofType({ shape, type: Inputs.OCCT.curveTypeEnum.line });

            // Assert
            expect(circles).toHaveLength(2);
            expect(lines).toHaveLength(1);
        });

        it("should choose the straight edges along a direction either way, within an angle in degrees", () => {
            // Arrange
            const shape = box();

            // Act
            const upright = occt.select.edges.along({ shape, direction: [0, 0, -1], angle: 0 });
            const flat = occt.select.edges.along({ shape, direction: [1, 1, 0], angle: 46 });

            // Assert
            expect(upright).toHaveLength(4);
            expect(upright.map(index => edgeCentres(shape)[index]![2])).toEqual([0, 0, 0, 0].map(z => expect.closeTo(z, 9)));
            expect(flat).toHaveLength(8);
        });

        it("should choose the edges by position, by length and by radius", () => {
            // Arrange
            const shape = box();
            const centres = edgeCentres(shape);
            const topEdges = onlyWhere(centres, point => Math.abs(point[2] - 15) < 1e-9);

            // Act
            const extreme = occt.select.edges.extreme({ shape, direction: [0, 0, 1], tolerance: 1e-7 });
            const inBox = occt.select.edges.inBox({ shape, corner: [-20, -20, 14], oppositeCorner: [20, 20, 16] });
            const inSphere = occt.select.edges.inSphere({ shape, center: [0, 0, 15], radius: 10.1 });
            const nearest = occt.select.edges.nearest({ shape, point: [0, 0, 100], count: 4 });
            const onPlane = occt.select.edges.onPlane({ shape, origin: [0, 0, 15], normal: [0, 0, 1], tolerance: 1e-7 });
            const long = occt.select.edges.byLength({ shape, min: 29, max: 31 });
            const rims = occt.select.edges.byRadius({ shape: cylinder(), min: 1.9, max: 2.1 });

            // Assert
            expect(extreme).toEqual(topEdges);
            expect(inBox).toEqual(topEdges);
            expect(inSphere).toEqual(topEdges);
            expect([...nearest].sort((a, b) => a - b)).toEqual(topEdges);
            expect(onPlane).toEqual(topEdges);
            expect(long).toHaveLength(4);
            expect(rims).toHaveLength(2);
        });

        it("should choose the edges where faces meet, and whole tangent chains", () => {
            // Arrange
            const shape = box();
            const [top] = occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 0 });
            const sides = occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 90 }).filter(index => index !== top);
            const rounded = occt.fillets.filletEdges({ shape, radius: 2, indexes: occt.select.edges.along({ shape, direction: [0, 0, 1], angle: 0 }) });
            const [seed] = occt.select.edges.extreme({ shape: rounded, direction: [1, 0, 0], tolerance: 1e-7 }).filter(index => Math.abs(edgeCentres(rounded)[index]![2] - 15) < 1e-6);

            // Act
            const between = occt.select.edges.between({ shape, indexes: [top!], otherIndexes: sides });
            const chain = occt.select.edges.tangentChain({ shape: rounded, indexes: [seed!], angle: 1 });

            // Assert
            expect(between).toEqual(occt.select.edges.ofFaces({ shape, indexes: [top!] }));
            expect(chain).toHaveLength(8);
            expect(chain.map(index => edgeCentres(rounded)[index]![2])).toEqual(Array.from({ length: 8 }, () => expect.closeTo(15, 6)));
        });

        it("should split the edges of a step into convex and concave", () => {
            // Arrange
            const tall = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5], originOnCenter: true });
            const low = occt.shapes.solid.createBox({ width: 10, length: 5, height: 10, center: [15, 5, 2.5], originOnCenter: true });
            const step = occt.booleans.union({ shapes: [tall, low], keepEdges: false });

            // Act
            const concave = occt.select.edges.concave({ shape: step, tangentAngle: 1 });
            const convex = occt.select.edges.convex({ shape: step, tangentAngle: 1 });

            // Assert
            expect(concave).toHaveLength(1);
            expect(edgeCentres(step)[concave[0]!]).toEqual([10, 5, 5].map(value => expect.closeTo(value, 9)));
            expect(convex).toHaveLength(occt.shapes.edge.getEdges({ shape: step }).length - 1);
        });

        it("should sort the edges along a direction and group them by level", () => {
            // Arrange
            const shape = box();

            // Act
            const sorted = occt.select.edges.sortAlong({ shape, direction: [0, 0, 1] });
            const levels = occt.select.edges.groupAlong({ shape, direction: [0, 0, 1], tolerance: 0.1 });

            // Assert
            expect(edgeCentres(shape)[sorted[0]!]![2]).toBeCloseTo(-15, 9);
            expect(levels.map(level => level.length)).toEqual([4, 4, 4]);
        });
    });

    describe("surface and curve types", () => {
        it("should read every face of a cone, a torus, a loft, a revolved curve and an extruded curve as its own kind", () => {
            // Arrange
            const cone = occt.shapes.solid.createCone({ radius1: 2, radius2: 1, height: 3, angle: 360, center: [0, 0, 0], direction: [0, 0, 1] });
            const torus = occt.shapes.solid.createTorus({ majorRadius: 3, minorRadius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
            const loft = occt.operations.loft({ shapes: [circleWire(1, 0), circleWire(2, 3), circleWire(1.5, 6)], makeSolid: false });
            const revolution = occt.operations.revolve({ shape: spline(), angle: 90, direction: [0, 1, 0], copy: false });
            const extrusion = occt.operations.extrude({ shape: spline(), direction: [0, 0, 2] });

            // Act
            const types = [cone, torus, loft, revolution, extrusion].map(facesOfEveryType);

            // Assert
            expect(types).toEqual([
                { cone: [0], plane: [1, 2] },
                { torus: [0] },
                { bspline: [0] },
                { revolution: [0] },
                { extrusion: [0] },
            ]);
        });

        it("should read every edge of a line, a circle, an ellipse, a spline and a Bezier curve as its own kind", () => {
            // Arrange
            const shapes = [
                occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [1, 0, 0] }),
                occt.shapes.edge.createCircleEdge({ radius: 2, center: [0, 0, 0], direction: [0, 0, 1] }),
                occt.shapes.edge.createEllipseEdge({ radiusMinor: 1, radiusMajor: 2, center: [0, 0, 0], direction: [0, 0, 1] }),
                spline(),
                occt.shapes.wire.createBezier({ points: [[0, 0, 0], [1, 2, 0], [3, 0, 0]], closed: false }),
            ];

            // Act
            const types = shapes.map(edgesOfEveryType);

            // Assert
            expect(types).toEqual([{ line: [0] }, { circle: [0] }, { ellipse: [0] }, { bspline: [0] }, { bezier: [0] }]);
        });
    });

    describe("what a selector chooses among", () => {
        it("should choose among every face when indexes are left out, and none when they are empty", () => {
            // Arrange
            const shape = box();

            // Act
            const all = occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 180 });
            const none = occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 180, indexes: [] });

            // Assert
            expect(all).toEqual([0, 1, 2, 3, 4, 5]);
            expect(none).toEqual([]);
            expect(occt.select.faces.ofType({ shape, type: Inputs.OCCT.surfaceTypeEnum.plane, indexes: [] })).toEqual([]);
            expect(occt.select.faces.nearest({ shape, point: [0, 0, 0], count: 3, indexes: [] })).toEqual([]);
            expect(occt.select.faces.groupAlong({ shape, direction: [0, 0, 1], tolerance: 0.1, indexes: [] })).toEqual([]);
            expect(occt.select.edges.sortAlong({ shape, direction: [0, 0, 1], indexes: [] })).toEqual([]);
            expect(occt.select.edges.convex({ shape, tangentAngle: 1, indexes: [] })).toEqual([]);
        });

        it("should keep an empty choice empty when one selector feeds the next", () => {
            // Arrange
            const shape = box();

            // Act
            const tori = occt.select.faces.ofType({ shape, type: Inputs.OCCT.surfaceTypeEnum.torus });
            const topOfTori = occt.select.faces.extreme({ shape, direction: [0, 0, 1], tolerance: 1e-7, indexes: tori });

            // Assert
            expect(tori).toEqual([]);
            expect(topOfTori).toEqual([]);
        });

        it("should narrow edges keeping the given order, and sort given faces by position rather than by order", () => {
            // Arrange
            const shape = box();
            const centres = faceCentres(shape);

            // Act
            const narrowed = occt.select.edges.along({ shape, direction: [1, 0, 0], angle: 0, indexes: [11, 2, 5, 0] });
            const sorted = occt.select.faces.sortAlong({ shape, direction: [0, 0, 1], indexes: [5, 4, 0] });

            // Assert
            expect(narrowed).toEqual([11, 2, 5, 0].filter(index => occt.select.edges.along({ shape, direction: [1, 0, 0], angle: 0 }).includes(index)));
            expect(sorted.map(index => centres[index]![2])).toEqual([...sorted.map(index => centres[index]![2])].sort((a, b) => a - b));
            expect([...sorted].sort()).toEqual([0, 4, 5]);
        });

        it("should give the nearest faces nearest first, and every face with a count of Infinity", () => {
            // Arrange
            const shape = box();
            const centres = faceCentres(shape);
            const point: Inputs.Base.Point3 = [4, 2, 30];

            // Act
            const nearestThree = occt.select.faces.nearest({ shape, point, count: 3 });
            const every = occt.select.faces.nearest({ shape, point, count: Infinity });

            // Assert
            const byDistance = centres.map((centre, index) => ({ index, away: distance(centre, point) })).sort((a, b) => a.away - b.away).map(entry => entry.index);
            expect(nearestThree).toEqual(byDistance.slice(0, 3));
            expect(every).toEqual(byDistance);
        });

        it("should keep faces as near as each other in their given order", () => {
            // Arrange
            const shape = box();
            const centres = faceCentres(shape);
            const sides = onlyWhere(centres, centre => Math.abs(centre[2]) < 1e-9 && Math.abs(centre[1]) < 1e-9);

            // Act
            const forward = occt.select.faces.nearest({ shape, point: [0, 0, 0], count: 2, indexes: sides });
            const backward = occt.select.faces.nearest({ shape, point: [0, 0, 0], count: 2, indexes: [...sides].reverse() });

            // Assert
            expect(sides).toHaveLength(2);
            expect(forward).toEqual(sides);
            expect(backward).toEqual([...sides].reverse());
        });

        it("should take a box's corners either way round", () => {
            // Arrange
            const shape = box();

            // Act
            const forward = occt.select.faces.inBox({ shape, corner: [-6, -11, 14], oppositeCorner: [6, 11, 16] });
            const backward = occt.select.faces.inBox({ shape, corner: [6, 11, 16], oppositeCorner: [-6, -11, 14] });

            // Assert
            expect(forward).toHaveLength(1);
            expect(backward).toEqual(forward);
        });
    });

    describe("what a selector refuses", () => {
        it("should name the list holding an index past the last face or edge", () => {
            // Arrange
            const shape = box();

            // Act
            const facing = thrownBy(() => occt.select.faces.facing({ shape, direction: [0, 0, 1], angle: 0, indexes: [0, 6] }));
            const adjacent = thrownBy(() => occt.select.faces.adjacentTo({ shape, indexes: [9] }));
            const between = thrownBy(() => occt.select.edges.between({ shape, indexes: [0], otherIndexes: [1, 7] }));
            const chain = thrownBy(() => occt.select.edges.tangentChain({ shape, indexes: [12], angle: 1 }));

            // Assert
            expect(facing.property).toBe("indexes");
            expect(facing.message).toBe("`indexes` holds 6, past the shape's last: its faces are numbered from 0 to 5.");
            expect(adjacent.property).toBe("indexes");
            expect(between.property).toBe("otherIndexes");
            expect(chain.message).toContain("its edges are numbered from 0 to 11");
        });

        it.each([
            { name: "a negative index", act: (shape: TopoDS_Shape) => occt.select.faces.ofType({ shape, indexes: [-1] }), property: "indexes" },
            { name: "a fractional index", act: (shape: TopoDS_Shape) => occt.select.edges.byLength({ shape, min: 0, max: 100, indexes: [1.5] }), property: "indexes" },
            { name: "a direction of no length", act: (shape: TopoDS_Shape) => occt.select.faces.extreme({ shape, direction: [0, 0, 0] }), property: "direction" },
            { name: "a negative angle", act: (shape: TopoDS_Shape) => occt.select.faces.facing({ shape, angle: -1 }), property: "angle" },
            { name: "a count of 0", act: (shape: TopoDS_Shape) => occt.select.edges.nearest({ shape, count: 0 }), property: "count" },
            { name: "a count of 2.7", act: (shape: TopoDS_Shape) => occt.select.faces.nearest({ shape, count: 2.7 }), property: "count" },
            { name: "a tolerance that is not a number", act: (shape: TopoDS_Shape) => occt.select.edges.groupAlong({ shape, tolerance: Number.NaN }), property: "tolerance" },
            { name: "a negative radius", act: (shape: TopoDS_Shape) => occt.select.faces.inSphere({ shape, radius: -1 }), property: "radius" },
            { name: "a type that is none of the kinds", act: (shape: TopoDS_Shape) => occt.select.faces.ofType({ shape, type: loose<Inputs.OCCT.surfaceTypeEnum>("Plane") }), property: "type" },
            { name: "a tangent angle beyond a right angle", act: (shape: TopoDS_Shape) => occt.select.edges.concave({ shape, tangentAngle: 100 }), property: "tangentAngle" },
            { name: "a plane with no normal", act: (shape: TopoDS_Shape) => occt.select.edges.onPlane({ shape, normal: [0, 0, 0] }), property: "normal" },
        ])("should refuse $name", ({ act, property }) => {
            // Act
            const error = thrownBy(() => act(box()));

            // Assert
            expect(error.property).toBe(property);
        });

        it("should refuse a shape that is missing or empty", () => {
            // Arrange
            const empty = occt.shapes.shape.purgeInternalEdges({ shape: box() });
            empty.Nullify();

            // Act
            const missing = thrownBy(() => occt.select.faces.facing({ shape: loose<TopoDS_Shape>(undefined) }));
            const nulled = thrownBy(() => occt.select.edges.convex({ shape: empty }));

            // Assert
            expect(missing.property).toBe("shape");
            expect(nulled.property).toBe("shape");
        });
    });
});
