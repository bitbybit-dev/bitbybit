import type { TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OCCTService } from "../occ-service";
import type * as Inputs from "../api/inputs";
import type * as Models from "../api/models";

export interface Outcome<T> {
    readonly value: T | undefined;
    readonly thrown: unknown;
}

export interface Counts {
    readonly faces: number;
    readonly edges: number;
    readonly vertices: number;
}

export function outcomeOf<T>(act: () => T): Outcome<T> {
    try {
        return { value: act(), thrown: undefined };
    } catch (thrown) {
        return { value: undefined, thrown };
    }
}

export function nameOf(thrown: unknown): string {
    return thrown instanceof Error ? thrown.name : `a bare ${typeof thrown}`;
}

export function refusalParity(plain: Outcome<unknown>, twin: Outcome<unknown>): string[] {
    if (plain.thrown === undefined && twin.thrown !== undefined && nameOf(twin.thrown) !== "InputError") {
        return [`the twin threw ${nameOf(twin.thrown)} (${twin.thrown instanceof Error ? twin.thrown.message : "with no message"}) where the plain call succeeded`];
    }
    if (plain.thrown !== undefined && twin.thrown === undefined) {
        return [`the twin succeeded where the plain call threw ${nameOf(plain.thrown)}`];
    }
    return [];
}

export class HistoryOracles {
    constructor(private readonly occt: OCCTService) { }

    counts(shape: TopoDS_Shape): Counts {
        return {
            faces: this.occt.shapes.face.getFaces({ shape }).length,
            edges: this.occt.shapes.edge.getEdges({ shape }).length,
            vertices: this.occt.shapes.vertex.getVertices({ shape }).length,
        };
    }

    volume(shape: TopoDS_Shape): number {
        return this.occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + this.occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    }

    area(shape: TopoDS_Shape): number {
        return this.occt.shapes.face.getFaces({ shape }).reduce((sum, face) => sum + this.occt.shapes.face.getFaceArea({ shape: face }), 0);
    }

    pointInside(face: TopoDS_Shape): Inputs.Base.Point3 | undefined {
        const mesh = this.occt.shapeToMesh({ shape: face, precision: 0.1, relativeDeflection: true });
        const meshed = mesh.faceList[0];
        if (meshed === undefined || meshed.triIndexes.length === 0) {
            return undefined;
        }
        const corner = (index: number): Inputs.Base.Point3 => [meshed.vertexCoord[3 * index]!, meshed.vertexCoord[3 * index + 1]!, meshed.vertexCoord[3 * index + 2]!];
        const triangles = Array.from({ length: meshed.triIndexes.length / 3 }, (_, at) => [corner(meshed.triIndexes[3 * at]!), corner(meshed.triIndexes[3 * at + 1]!), corner(meshed.triIndexes[3 * at + 2]!)]);
        const areaOf = ([a, b, c]: Inputs.Base.Point3[]): number => {
            const u = [b![0] - a![0], b![1] - a![1], b![2] - a![2]];
            const v = [c![0] - a![0], c![1] - a![1], c![2] - a![2]];
            return Math.hypot(u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!);
        };
        const largest = triangles.reduce((best, triangle) => areaOf(triangle) > areaOf(best) ? triangle : best);
        const centroid: Inputs.Base.Point3 = [0, 1, 2].map(axis => (largest[0]![axis]! + largest[1]![axis]! + largest[2]![axis]!) / 3) as Inputs.Base.Point3;
        return this.occt.operations.closestPointsOnShapeFromPoints({ shape: face, points: [centroid] })[0];
    }

    distanceTo(shape: TopoDS_Shape, point: Inputs.Base.Point3): number {
        return this.occt.operations.distancesToShapeFromPoints({ shape, points: [point] })[0]!;
    }

    shareSurface(source: TopoDS_Shape, successor: TopoDS_Shape): number {
        const onSuccessor = this.pointInside(successor);
        const onSource = this.pointInside(source);
        const distances = [
            onSuccessor === undefined ? Infinity : this.distanceTo(source, onSuccessor),
            onSource === undefined ? Infinity : this.distanceTo(successor, onSource),
        ];
        return Math.min(...distances);
    }

    indexViolations(history: Models.OCCT.ShapeHistory, input: TopoDS_Shape, result: TopoDS_Shape): string[] {
        const given = this.counts(input);
        const made = this.counts(result);
        const violations: string[] = [];
        const expectLength = (name: string, length: number, expected: number): void => {
            if (length !== expected) {
                violations.push(`${name} has ${length} entries for an input with ${expected}`);
            }
        };
        expectLength("faces", history.faces.length, given.faces);
        expectLength("facesFromFaces", history.facesFromFaces.length, given.faces);
        expectLength("edgesFromFaces", history.edgesFromFaces.length, given.faces);
        expectLength("edges", history.edges.length, given.edges);
        expectLength("facesFromEdges", history.facesFromEdges.length, given.edges);
        expectLength("facesFromVertices", history.facesFromVertices.length, given.vertices);
        expectLength("edgesFromVertices", history.edgesFromVertices.length, given.vertices);
        const faceIndexes = [...history.faces, ...history.facesFromFaces, ...history.facesFromEdges, ...history.facesFromVertices, history.firstFaces, history.lastFaces].flat();
        const edgeIndexes = [...history.edges, ...history.edgesFromFaces, ...history.edgesFromVertices].flat();
        faceIndexes.filter(face => !(Number.isInteger(face) && face >= 0 && face < made.faces)).forEach(face => violations.push(`face ${face} is not one of the result's ${made.faces}`));
        edgeIndexes.filter(edge => !(Number.isInteger(edge) && edge >= 0 && edge < made.edges)).forEach(edge => violations.push(`edge ${edge} is not one of the result's ${made.edges}`));
        return violations;
    }

    successorViolations(history: Models.OCCT.ShapeHistory, input: TopoDS_Shape, result: TopoDS_Shape, tolerance: number): string[] {
        const sources = this.occt.shapes.face.getFaces({ shape: input });
        const results = this.occt.shapes.face.getFaces({ shape: result });
        return history.faces.flatMap((successors, source) => successors
            .filter(successor => results[successor] !== undefined)
            .map(successor => ({ successor, gap: this.shareSurface(sources[source]!, results[successor]!) }))
            .filter(({ gap }) => !(gap <= tolerance))
            .map(({ successor, gap }) => `face ${source} became face ${successor}, which lies ${gap} away from it`));
    }

    reached(histories: readonly Models.OCCT.ShapeHistory[]): number {
        return new Set(histories.flatMap(history => [
            ...history.faces.flat(), ...history.facesFromFaces.flat(), ...history.facesFromEdges.flat(),
            ...history.facesFromVertices.flat(), ...history.firstFaces, ...history.lastFaces,
        ])).size;
    }
}
