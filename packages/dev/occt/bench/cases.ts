import { TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../lib/occ-service";
import * as Inputs from "../lib/api/inputs";

/**
 * A measured workload. It builds its shapes through the public API, as a script would, and returns
 * numbers that describe its output, so a faster run can be told apart from a different one.
 */
export type BenchCase = {
    name: string;
    run: (occt: OCCTService) => number[];
};

const volumeOf = (occt: OCCTService, shape: TopoDS_Shape): number =>
    occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);

const airfoil = (chord: number, thickness: number, twist: number, y: number): Inputs.Base.Point3[] =>
    Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * 2 * Math.PI;
        const x = (Math.cos(angle) * chord) / 2;
        const z = Math.sin(angle) * thickness * (1 - Math.abs(Math.cos(angle)) * 0.6);
        return [x * Math.cos(twist) - z * Math.sin(twist), y, x * Math.sin(twist) + z * Math.cos(twist)];
    });

/** The workloads, each a path many scripts take: patterns, text, sampling, booleans, lofts, fillets and meshing. */
export const benchCases: BenchCase[] = [
    {
        name: "hexagon facade, 30 x 30 holes",
        run: (occt) => {
            const panel = occt.shapes.face.createRectangleFace({ width: 3000, length: 2000, center: [0, 0, 0], direction: [0, 1, 0] });
            const faces = occt.shapes.face.subdivideToHexagonHoles({ shape: panel, nrHexagonsU: 30, nrHexagonsV: 30 });
            const wall = occt.operations.extrude({ shape: faces[0]!, direction: [0, 40, 0] });
            const result = [faces.length, occt.shapes.face.getFaces({ shape: wall }).length, volumeOf(occt, wall)];
            [panel, wall, ...faces].forEach(shape => shape.delete());
            return result;
        },
    },
    {
        name: "text, 256 characters as extruded letters",
        run: (occt) => {
            const line = "Bit by bit developers 0123456789 - the quick brown fox jumps over ";
            const wires = occt.shapes.wire.textWires({ text: line.repeat(4), height: 5 });
            const letters = wires.map(wire => occt.shapes.face.createFaceFromWire({ shape: wire, planar: true }));
            const solids = letters.map(letter => occt.operations.extrude({ shape: letter, direction: [0, 1, 0] }));
            const result = [wires.length, solids.reduce((sum, solid) => sum + volumeOf(occt, solid), 0)];
            [...wires, ...letters, ...solids].forEach(shape => shape.delete());
            return result;
        },
    },
    {
        name: "sampling a spline, 6000 points",
        run: (occt) => {
            const points: Inputs.Base.Point3[] = Array.from({ length: 60 }, (_, i) => [i * 2, Math.sin(i / 3) * 10, Math.cos(i / 5) * 8]);
            const curve = occt.shapes.wire.interpolatePoints({ points });
            const even = occt.shapes.wire.divideWireByEqualDistanceToPoints({ shape: curve, nrOfDivisions: 2000 });
            const byParam = occt.shapes.wire.divideWireByParamsToPoints({ shape: curve, nrOfDivisions: 2000 });
            const atLength = occt.shapes.wire.pointsOnWireAtEqualLength({ shape: curve, length: 0.1 });
            const sum = [...even, ...byParam, ...atLength].reduce((total, point) => total + point[0] + point[1] + point[2], 0);
            curve.delete();
            return [even.length, byParam.length, atLength.length, sum];
        },
    },
    {
        name: "plate drilled with 64 holes",
        run: (occt) => {
            const plate = occt.shapes.solid.createBox({ width: 200, length: 200, height: 10, center: [0, 0, 0] });
            const holes = Array.from({ length: 64 }, (_, i) => occt.shapes.solid.createCylinder({
                radius: 4, height: 20, center: [((i % 8) - 3.5) * 22, -10, (Math.floor(i / 8) - 3.5) * 22], direction: [0, 1, 0],
            }));
            const drilled = occt.booleans.difference({ shape: plate, shapes: holes });
            const result = [occt.shapes.face.getFaces({ shape: drilled }).length, volumeOf(occt, drilled)];
            [plate, drilled, ...holes].forEach(shape => shape.delete());
            return result;
        },
    },
    {
        name: "twisted blade lofted through 16 sections, measured and meshed",
        run: (occt) => {
            const sections = Array.from({ length: 16 }, (_, i) => occt.shapes.wire.interpolatePoints({
                points: airfoil(40 - i * 1.5, 4 - i * 0.15, (i * Math.PI) / 36, i * 12), periodic: true,
            }));
            const blade = occt.operations.loft({ shapes: sections, makeSolid: true });
            const solids = occt.shapes.solid.getSolids({ shape: blade });
            const mesh = occt.shapeToMesh({ shape: blade, precision: 0.01 });
            const result = [
                solids.length,
                volumeOf(occt, blade),
                solids.reduce((sum, solid) => sum + occt.shapes.solid.getSolidSurfaceArea({ shape: solid }), 0),
                mesh.faceList.reduce((sum, face) => sum + face.numberOfTriangles, 0),
            ];
            [blade, ...sections, ...solids].forEach(shape => shape.delete());
            return result;
        },
    },
    {
        name: "block with a boss and four holes, every edge filleted",
        run: (occt) => {
            const block = occt.shapes.solid.createBox({ width: 50, length: 30, height: 20, center: [0, 0, 0] });
            const boss = occt.shapes.solid.createCylinder({ radius: 8, height: 15, center: [0, 5, 0], direction: [0, 1, 0] });
            const holes = Array.from({ length: 4 }, (_, i) => occt.shapes.solid.createCylinder({
                radius: 3, height: 40, center: [i < 2 ? -17 : 17, -20, i % 2 === 0 ? -8 : 8], direction: [0, 1, 0],
            }));
            const joined = occt.booleans.union({ shapes: [block, boss] });
            const drilled = occt.booleans.difference({ shape: joined, shapes: holes });
            const rounded = occt.fillets.filletEdges({ shape: drilled, radius: 1 });
            const result = [occt.shapes.face.getFaces({ shape: rounded }).length, volumeOf(occt, rounded)];
            [block, boss, joined, drilled, rounded, ...holes].forEach(shape => shape.delete());
            return result;
        },
    },
    {
        name: "meshing a drilled, filleted part",
        run: (occt) => {
            const plate = occt.shapes.solid.createBox({ width: 120, length: 80, height: 12, center: [0, 0, 0] });
            const rounded = occt.fillets.filletEdges({ shape: plate, radius: 2 });
            const holes = Array.from({ length: 12 }, (_, i) => occt.shapes.solid.createCylinder({
                radius: 5, height: 30, center: [((i % 4) - 1.5) * 25, -15, (Math.floor(i / 4) - 1) * 25], direction: [0, 1, 0],
            }));
            const part = occt.booleans.difference({ shape: rounded, shapes: holes });
            const mesh = occt.shapeToMesh({ shape: part, precision: 0.01 });
            const result = [
                mesh.faceList.length,
                mesh.faceList.reduce((sum, face) => sum + face.numberOfTriangles, 0),
                mesh.edgeList.reduce((sum, edge) => sum + edge.vertexCoord.length, 0),
            ];
            [plate, rounded, part, ...holes].forEach(shape => shape.delete());
            return result;
        },
    },
];
