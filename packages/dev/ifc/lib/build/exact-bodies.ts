import type { Base } from "@bitbybit-dev/base";
import { Recipes } from "@bitbybit-dev/base";
import { isRigidMatrix, linearDeterminant, movedPoint, turnedVector } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { enumValue, ref } from "../step/values";
import type { BodyItems, BrepItems, PlacedSource } from "./build-types";
import { POINT3_SIZE, TRIANGLE_CORNERS } from "./constants";
import type { EntityWriter } from "./entity-writer";
import { direction3Of, frameFrom } from "./math";

const RECIPES = new Recipes();

const UNSPECIFIED = "UNSPECIFIED";
const DIFFERENCE = "DIFFERENCE";
const ADVANCED_BREP = "AdvancedBrep";
const SURFACE_MODEL = "SurfaceModel";
const TESSELLATION = "Tessellation";
const SOLID_MODEL = "SolidModel";

class Placer {
    constructor(private readonly matrix: readonly number[], private readonly scale: number) { }

    point(point: readonly number[]): Base.Point3 {
        return scale3(movedPoint(this.matrix, point), this.scale);
    }

    turned(vector: readonly number[]): Base.Vector3 {
        return turnedVector(this.matrix, vector);
    }

    vector(vector: readonly number[]): Base.Vector3 {
        return direction3Of(this.turned(vector));
    }

    length(length: number): number {
        return length * this.scale;
    }
}

function numbers(buffers: Base.RecipeBuffers, range: Base.RecipeRange): number[] {
    return Array.from(buffers.f64.subarray(range[0], range[0] + range[1]));
}

function triples(values: readonly number[]): number[][] {
    const out: number[][] = [];
    for (let at = 0; at + 2 < values.length; at += POINT3_SIZE) {
        out.push([values[at]!, values[at + 1]!, values[at + 2]!]);
    }
    return out;
}

class BrepWriter {
    private readonly vertices = new Map<number, number>();
    private readonly curves = new Map<number, number>();
    private readonly surfaces = new Map<number, number>();
    private readonly edges = new Map<number, number>();
    private readonly corners: number[][];

    constructor(private readonly writer: EntityWriter, private readonly node: Base.RecipeBrepNode, private readonly buffers: Base.RecipeBuffers, private readonly placer: Placer) {
        this.corners = triples(numbers(buffers, node.vertices));
    }

    items(): BrepItems {
        if (!this.node.closed) {
            const shell = this.writer.create("IfcOpenShell", { CfsFaces: this.node.faces.map((face) => ref(this.face(face, false))) });
            return { items: [this.writer.create("IfcShellBasedSurfaceModel", { SbsmBoundary: [ref(shell)] })], carved: false };
        }
        const solids = this.solids();
        const items = solids.map((solid) => {
            const cavities = solid.voids ?? [];
            const outer = this.brep(solid.outer, false);
            if (!cavities.length) {
                return outer;
            }
            const carved = cavities.reduce((kept, cavity) => this.writer.create("IfcBooleanResult", { Operator: enumValue(DIFFERENCE), FirstOperand: ref(kept), SecondOperand: ref(this.brep(cavity, true)) }), outer);
            return this.writer.create("IfcCsgSolid", { TreeRootExpression: ref(carved) });
        });
        return { items, carved: solids.some((solid) => (solid.voids ?? []).length > 0) };
    }

    private brep(faces: readonly number[], turned: boolean): number {
        const shell = this.writer.create("IfcClosedShell", { CfsFaces: faces.map((face) => ref(this.face(this.node.faces[face]!, turned))) });
        return this.writer.create("IfcAdvancedBrep", { Outer: ref(shell) });
    }

    private solids(): readonly Base.RecipeBrepSolid[] {
        if (this.node.solids !== undefined) {
            return this.node.solids;
        }
        const roots = this.node.faces.map((_, at) => at);
        const rootOf = (face: number): number => {
            let at = face;
            while (roots[at] !== at) {
                at = roots[at]!;
            }
            return at;
        };
        const firstFaceOfEdge = new Map<number, number>();
        this.node.faces.forEach((face, at) => {
            for (const bound of face.bounds) {
                for (const edge of bound.edges) {
                    const other = firstFaceOfEdge.get(edge);
                    if (other === undefined) {
                        firstFaceOfEdge.set(edge, at);
                    } else {
                        const [a, b] = [rootOf(other), rootOf(at)];
                        roots[Math.max(a, b)] = Math.min(a, b);
                    }
                }
            }
        });
        const shells = new Map<number, number[]>();
        roots.forEach((_, at) => {
            const root = rootOf(at);
            shells.set(root, [...(shells.get(root) ?? []), at]);
        });
        return [...shells.values()].map((outer) => ({ outer }));
    }

    private vertex(index: number): number {
        let known = this.vertices.get(index);
        if (known === undefined) {
            known = this.writer.create("IfcVertexPoint", { VertexGeometry: ref(this.writer.point(this.placer.point(this.corners[index]!))) });
            this.vertices.set(index, known);
        }
        return known;
    }

    private placement(placement: Base.RecipeBrepPlacement): number {
        return this.writer.placement3(frameFrom(this.placer.point(placement.origin), this.placer.turned(placement.axis), this.placer.turned(placement.xDirection)));
    }

    private curve(index: number): number {
        let known = this.curves.get(index);
        if (known === undefined) {
            known = this.curveEntity(this.node.curves[index]!);
            this.curves.set(index, known);
        }
        return known;
    }

    private curveEntity(curve: Base.RecipeBrepCurve): number {
        switch (curve.kind) {
            case "line": {
                const vector = this.writer.create("IfcVector", { Orientation: ref(this.writer.direction(this.placer.vector(curve.direction))), Magnitude: 1 });
                return this.writer.create("IfcLine", { Pnt: ref(this.writer.point(this.placer.point(curve.origin))), Dir: ref(vector) });
            }
            case "circle":
                return this.writer.create("IfcCircle", { Position: ref(this.placement(curve)), Radius: this.placer.length(curve.radius) });
            case "ellipse":
                return this.writer.create("IfcEllipse", { Position: ref(this.placement(curve)), SemiAxis1: this.placer.length(curve.xRadius), SemiAxis2: this.placer.length(curve.yRadius) });
            case "bspline": {
                const points = triples(numbers(this.buffers, curve.points)).map((point) => ref(this.writer.point(this.placer.point(point))));
                const shared = {
                    Degree: curve.degree,
                    ControlPointsList: points,
                    CurveForm: enumValue(UNSPECIFIED),
                    ClosedCurve: false,
                    SelfIntersect: false,
                    KnotMultiplicities: curve.multiplicities,
                    Knots: numbers(this.buffers, curve.knots),
                    KnotSpec: enumValue(UNSPECIFIED),
                };
                return curve.weights === undefined
                    ? this.writer.create("IfcBSplineCurveWithKnots", shared)
                    : this.writer.create("IfcRationalBSplineCurveWithKnots", { ...shared, WeightsData: numbers(this.buffers, curve.weights) });
            }
        }
    }

    private surface(index: number): number {
        let known = this.surfaces.get(index);
        if (known === undefined) {
            known = this.surfaceEntity(this.node.surfaces[index]!);
            this.surfaces.set(index, known);
        }
        return known;
    }

    private surfaceEntity(surface: Base.RecipeBrepSurface): number {
        switch (surface.kind) {
            case "plane":
                return this.writer.create("IfcPlane", { Position: ref(this.placement(surface)) });
            case "cylinder":
                return this.writer.create("IfcCylindricalSurface", { Position: ref(this.placement(surface)), Radius: this.placer.length(surface.radius) });
            case "sphere":
                return this.writer.create("IfcSphericalSurface", { Position: ref(this.placement(surface)), Radius: this.placer.length(surface.radius) });
            case "torus":
                return this.writer.create("IfcToroidalSurface", { Position: ref(this.placement(surface)), MajorRadius: this.placer.length(surface.majorRadius), MinorRadius: this.placer.length(surface.minorRadius) });
            case "bspline": {
                const points = triples(numbers(this.buffers, surface.points)).map((point) => ref(this.writer.point(this.placer.point(point))));
                const rows = Array.from({ length: surface.uCount }, (_, u) => points.slice(u * surface.vCount, (u + 1) * surface.vCount));
                const shared = {
                    UDegree: surface.uDegree,
                    VDegree: surface.vDegree,
                    ControlPointsList: rows,
                    SurfaceForm: enumValue(UNSPECIFIED),
                    UClosed: false,
                    VClosed: false,
                    SelfIntersect: false,
                    UMultiplicities: surface.uMultiplicities,
                    VMultiplicities: surface.vMultiplicities,
                    UKnots: numbers(this.buffers, surface.uKnots),
                    VKnots: numbers(this.buffers, surface.vKnots),
                    KnotSpec: enumValue(UNSPECIFIED),
                };
                if (surface.weights === undefined) {
                    return this.writer.create("IfcBSplineSurfaceWithKnots", shared);
                }
                const weights = numbers(this.buffers, surface.weights);
                return this.writer.create("IfcRationalBSplineSurfaceWithKnots", { ...shared, WeightsData: Array.from({ length: surface.uCount }, (_, u) => weights.slice(u * surface.vCount, (u + 1) * surface.vCount)) });
            }
            default:
                throw new Error(`A ${surface.kind} surface has no IFC4 form an advanced face takes; describe the shape with ifcSurfaces set, which writes it as a B-spline`);
        }
    }

    private edge(index: number): number {
        let known = this.edges.get(index);
        if (known === undefined) {
            const edge = this.node.edges[index]!;
            known = this.writer.create("IfcEdgeCurve", {
                EdgeStart: ref(this.vertex(edge.start)),
                EdgeEnd: ref(this.vertex(edge.end)),
                EdgeGeometry: ref(this.curve(edge.curve)),
                SameSense: edge.sameSense !== false,
            });
            this.edges.set(index, known);
        }
        return known;
    }

    private face(face: Base.RecipeBrepFace, turned: boolean): number {
        const bounds = face.bounds.map((bound) => {
            const uses = bound.edges.map((edge, use) => this.writer.create("IfcOrientedEdge", { EdgeElement: ref(this.edge(edge)), Orientation: bound.forward[use] === true }));
            const loop = this.writer.create("IfcEdgeLoop", { EdgeList: uses.map(ref) });
            return this.writer.create(bound.outer ? "IfcFaceOuterBound" : "IfcFaceBound", { Bound: ref(loop), Orientation: !turned });
        });
        return this.writer.create("IfcAdvancedFace", { Bounds: bounds.map(ref), FaceSurface: ref(this.surface(face.surface)), SameSense: face.sameSense !== turned });
    }
}

function faceSetOf(writer: EntityWriter, node: Base.RecipeTrianglesNode, buffers: Base.RecipeBuffers, placer: Placer): number {
    const points = triples(numbers(buffers, node.positions)).map((point) => placer.point(point));
    const indices = Array.from(buffers.i32.subarray(node.indices[0], node.indices[0] + node.indices[1]));
    const triangles: number[][] = [];
    const directed = new Set<string>();
    for (let at = 0; at + 2 < indices.length; at += TRIANGLE_CORNERS) {
        const corners = [indices[at]!, indices[at + 1]!, indices[at + 2]!];
        triangles.push(corners.map((corner) => corner + 1));
        corners.forEach((corner, use) => directed.add(`${corner}>${corners[(use + 1) % TRIANGLE_CORNERS]!}`));
    }
    const closed = triangles.length > 0 && [...directed].every((edge) => directed.has(edge.split(">").reverse().join(">")));
    const list = writer.create("IfcCartesianPointList3D", { CoordList: points });
    return writer.create("IfcTriangulatedFaceSet", { Coordinates: ref(list), Closed: closed, CoordIndex: triangles });
}

function placedSourceOf(recipe: Base.Recipe, root: Base.RecipeRoot, at: number): PlacedSource {
    const source = RECIPES.sourceOf({ recipe, node: root.node, matrix: root.matrix });
    if (!isRigidMatrix(source.matrix) || linearDeterminant(source.matrix) < 0) {
        throw new Error(`Root ${at} of the body is placed by a matrix that scales or mirrors; a body is written only moved and turned`);
    }
    return { node: recipe.nodes[source.node]!, matrix: source.matrix };
}

export function writeBodyItems(writer: EntityWriter, recipe: Base.Recipe, scale: number): BodyItems {
    const kinds = new Set<string>();
    let carved = false;
    const items = recipe.roots.flatMap((root, at) => {
        const { node, matrix } = placedSourceOf(recipe, root, at);
        const placer = new Placer(matrix, scale);
        if (node.op === "brep") {
            kinds.add(node.closed ? ADVANCED_BREP : SURFACE_MODEL);
            const written = new BrepWriter(writer, node, recipe.buffers, placer).items();
            carved ||= written.carved;
            return written.items;
        }
        if (node.op === "triangles") {
            kinds.add(TESSELLATION);
            return [faceSetOf(writer, node, recipe.buffers, placer)];
        }
        throw new Error(`Root ${at} of the body is a ${node.op} step; a body is written from brep and triangles steps, so describe a shape exactly first`);
    });
    if (items.length === 0) {
        throw new Error("The body has no roots to write");
    }
    if (kinds.size > 1) {
        throw new Error(`The body mixes ${[...kinds].join(" and ")} items, which one IFC representation cannot hold`);
    }
    const kind = [...kinds][0]!;
    return { items, representationType: carved ? SOLID_MODEL : kind };
}
