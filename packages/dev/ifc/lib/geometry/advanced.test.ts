import type { Base } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import { signedVolumeOf } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-measures";
import { checkRecipe } from "@bitbybit-dev/base";
import { modelOf } from "../api/services/service-support";
import { withContext } from "../__test__/geometry-fixtures";
import { ItemConverter } from "./items";
import { RecipeBuilder } from "./recipe-builder";

const REACH = 1000;
const SEGMENTS = 32;
const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const PROJECT_ROWS = ["#90=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);", "#91=IFCUNITASSIGNMENT((#90));", "#92=IFCPROJECT('0YvctVUKr0kugbFTf53O9L',$,'Project',$,$,$,$,(#3),#91);"];

class Rows {
    readonly rows: string[] = [...PROJECT_ROWS];
    private next = 100;

    add(text: string): number {
        const id = this.next++;
        this.rows.push(`#${id}=${text};`);
        return id;
    }

    point(x: number, y: number, z: number): number {
        return this.add(`IFCCARTESIANPOINT((${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}))`);
    }

    direction(x: number, y: number, z: number): number {
        return this.add(`IFCDIRECTION((${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}))`);
    }

    placement(origin: Base.Point3, z: Base.Vector3 = [0, 0, 1], x: Base.Vector3 = z[2] === 0 ? [0, 0, 1] : [1, 0, 0]): number {
        return this.add(`IFCAXIS2PLACEMENT3D(#${this.point(...origin)},#${this.direction(...z)},#${this.direction(...x)})`);
    }

    vertex(x: number, y: number, z: number): number {
        return this.add(`IFCVERTEXPOINT(#${this.point(x, y, z)})`);
    }

    line(from: number, to: number, a: Base.Point3, b: Base.Point3): number {
        const vector = this.add(`IFCVECTOR(#${this.direction(b[0] - a[0], b[1] - a[1], b[2] - a[2])},1.)`);
        return this.add(`IFCEDGECURVE(#${from},#${to},#${this.add(`IFCLINE(#${this.point(...a)},#${vector})`)},.T.)`);
    }

    loop(edges: readonly (readonly [number, boolean])[]): number {
        return this.add(`IFCEDGELOOP((${edges.map(([edge, forward]) => `#${this.add(`IFCORIENTEDEDGE(*,*,#${edge},${forward ? ".T." : ".F."})`)}`).join(",")}))`);
    }

    face(loops: readonly (readonly [number, boolean])[], surface: number, sameSense = true): number {
        const bounds = loops.map(([loop, forward], at) => `#${this.add(`${at === 0 ? "IFCFACEOUTERBOUND" : "IFCFACEBOUND"}(#${loop},${forward ? ".T." : ".F."})`)}`);
        return this.add(`IFCADVANCEDFACE((${bounds.join(",")}),#${surface},${sameSense ? ".T." : ".F."})`);
    }

    brep(faces: readonly number[]): number {
        return this.add(`IFCADVANCEDBREP(#${this.add(`IFCCLOSEDSHELL((${faces.map((face) => `#${face}`).join(",")}))`)})`);
    }
}

function cubeRows(): { rows: string[]; brep: number } {
    const rows = new Rows();
    return { rows: rows.rows, brep: cubeIn(rows) };
}

function cubeIn(rows: Rows, shift = 0): number {
    const corners: Base.Point3[] = ([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] as Base.Point3[]).map(([x, y, z]) => [x + shift, y, z]);
    const vertices = corners.map((corner) => rows.vertex(...corner));
    const edges = new Map<string, number>();
    const edge = (a: number, b: number): readonly [number, boolean] => {
        const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
        if (!edges.has(key)) {
            const [first, second] = [Math.min(a, b), Math.max(a, b)];
            edges.set(key, rows.line(vertices[first]!, vertices[second]!, corners[first]!, corners[second]!));
        }
        return [edges.get(key)!, a < b];
    };
    const sides: readonly (readonly [number[], Base.Vector3, Base.Point3])[] = [
        [[0, 3, 2, 1], [0, 0, -1], [shift, 0, 0]], [[4, 5, 6, 7], [0, 0, 1], [shift, 0, 1]], [[0, 1, 5, 4], [0, -1, 0], [shift, 0, 0]],
        [[2, 3, 7, 6], [0, 1, 0], [shift, 1, 0]], [[1, 2, 6, 5], [1, 0, 0], [shift + 1, 0, 0]], [[3, 0, 4, 7], [-1, 0, 0], [shift, 0, 0]],
    ];
    const faces = sides.map(([ring, normal, origin]) => {
        const loop = rows.loop(ring.map((corner, at) => edge(corner, ring[(at + 1) % ring.length]!)));
        return rows.face([[loop, true]], rows.add(`IFCPLANE(#${rows.placement(origin, normal)})`));
    });
    return rows.brep(faces);
}

function meshOf(rows: readonly string[], item: number): { positions: number[]; indices: number[] } {
    const builder = new RecipeBuilder();
    const converter = new ItemConverter(modelOf(withContext(rows)), builder, REACH);
    builder.root({ node: converter.item(item), matrix: IDENTITY, tag: {} });
    const recipe = builder.build(1, 0.001);
    const last = recipe.nodes.at(-1);
    const node = last?.op === "brep" && last.fallback !== undefined ? recipe.nodes[last.fallback] : last;
    if (node?.op !== "triangles") {
        throw new Error("not a triangle mesh");
    }
    return {
        positions: [...recipe.buffers.f64.slice(node.positions[0], node.positions[0] + node.positions[1])],
        indices: [...recipe.buffers.i32.slice(node.indices[0], node.indices[0] + node.indices[1])],
    };
}

function exactOf(rows: readonly string[], item: number): { recipe: Base.Recipe; node: Base.RecipeNode } {
    const builder = new RecipeBuilder();
    const converter = new ItemConverter(modelOf(withContext(rows)), builder, REACH);
    builder.root({ node: converter.item(item), matrix: IDENTITY, tag: {} });
    const recipe = builder.build(1, 0.001);
    return { recipe, node: recipe.nodes.at(-1)! };
}

function numbersIn(recipe: Base.Recipe, range: Base.RecipeRange): number[] {
    return [...recipe.buffers.f64.slice(range[0], range[0] + range[1])];
}

function edgeUses(indices: readonly number[]): { closed: boolean; consistent: boolean } {
    const directed = new Map<string, number>();
    for (let at = 0; at < indices.length; at += 3) {
        for (let corner = 0; corner < 3; corner++) {
            const key = `${indices[at + corner]}>${indices[at + ((corner + 1) % 3)]}`;
            directed.set(key, (directed.get(key) ?? 0) + 1);
        }
    }
    const keys = [...directed.keys()];
    return { closed: keys.every((key) => directed.has(key.split(">").reverse().join(">"))), consistent: [...directed.values()].every((count) => count === 1) };
}

describe("ItemConverter and advanced breps", () => {
    it("should build a cube of planar advanced faces as a closed mesh of its volume", () => {
        // Arrange
        const { rows, brep } = cubeRows();

        // Act
        const mesh = meshOf(rows, brep);

        // Assert
        expect(signedVolumeOf(mesh.positions, mesh.indices)).toBeCloseTo(1, 9);
        expect(edgeUses(mesh.indices)).toEqual({ closed: true, consistent: true });
    });

    it("should turn a face an exporter wrote inside out to wind with its neighbours, so the closed mesh still holds its volume", () => {
        // Arrange
        const { rows, brep } = cubeRows();
        const firstFace = rows.findIndex((row) => row.includes("IFCADVANCEDFACE("));
        const flipped = rows.map((row, at) => (at === firstFace ? row.replace(/,\.T\.\);$/, ",.F.);") : row));

        // Act
        const mesh = meshOf(flipped, brep);

        // Assert
        expect(flipped[firstFace]).toMatch(/,\.F\.\);$/);
        expect(signedVolumeOf(mesh.positions, mesh.indices)).toBeCloseTo(1, 9);
        expect(edgeUses(mesh.indices)).toEqual({ closed: true, consistent: true });
    });

    it("should close a cylinder whose side wraps between two circles with no seam edge, and its two caps", () => {
        // Arrange
        const rows = new Rows();
        const bottom = rows.vertex(1, 0, 0);
        const top = rows.vertex(1, 0, 2);
        const circleAt = (z: number, vertex: number): number => rows.add(`IFCEDGECURVE(#${vertex},#${vertex},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, z])},1.)`)},.T.)`);
        const [low, high] = [circleAt(0, bottom), circleAt(2, top)];
        const lowLoop = rows.loop([[low, true]]);
        const highLoop = rows.loop([[high, true]]);
        const side = rows.face([[lowLoop, true], [highLoop, false]], rows.add(`IFCCYLINDRICALSURFACE(#${rows.placement([0, 0, 0])},1.)`));
        const floor = rows.face([[lowLoop, false]], rows.add(`IFCPLANE(#${rows.placement([0, 0, 0], [0, 0, -1])})`));
        const roof = rows.face([[highLoop, true]], rows.add(`IFCPLANE(#${rows.placement([0, 0, 2])})`));
        const brep = rows.brep([side, floor, roof]);

        // Act
        const mesh = meshOf(rows.rows, brep);

        // Assert
        expect(signedVolumeOf(mesh.positions, mesh.indices)).toBeCloseTo((SEGMENTS / 2) * Math.sin((2 * Math.PI) / SEGMENTS) * 2, 9);
        expect(edgeUses(mesh.indices)).toEqual({ closed: true, consistent: true });
    });

    it("should close each half of a sphere over its pole", () => {
        // Arrange
        const rows = new Rows();
        const start = rows.vertex(1, 0, 0);
        const equator = rows.add(`IFCEDGECURVE(#${start},#${start},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, 0])},1.)`)},.T.)`);
        const loop = rows.loop([[equator, true]]);
        const sphere = rows.add(`IFCSPHERICALSURFACE(#${rows.placement([0, 0, 0])},1.)`);
        const brep = rows.brep([rows.face([[loop, true]], sphere), rows.face([[loop, false]], sphere)]);

        // Act
        const mesh = meshOf(rows.rows, brep);
        const volume = signedVolumeOf(mesh.positions, mesh.indices);

        // Assert
        expect(volume).toBeGreaterThan(0.97 * (4 / 3) * Math.PI);
        expect(volume).toBeLessThanOrEqual((4 / 3) * Math.PI);
        expect(edgeUses(mesh.indices).closed).toBe(true);
    });

    it("should mesh a face whose loop passes through its surface's apex, splitting the apex into the angles it arrives and leaves at", () => {
        // Arrange
        const rows = new Rows();
        const [right, left, apex] = [rows.vertex(1, 0, 0), rows.vertex(-1, 0, 0), rows.vertex(0, 0, 1)];
        const profile = rows.add(`IFCPOLYLINE((#${rows.point(1, 0, 0)},#${rows.point(0, 0, 1)}))`);
        const axis = rows.add(`IFCAXIS1PLACEMENT(#${rows.point(0, 0, 0)},#${rows.direction(0, 0, 1)})`);
        const surface = rows.add(`IFCSURFACEOFREVOLUTION(#${rows.add(`IFCARBITRARYOPENPROFILEDEF(.CURVE.,$,#${profile})`)},$,#${axis})`);
        const base = rows.add(`IFCEDGECURVE(#${right},#${left},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, 0])},1.)`)},.T.)`);
        const loop = rows.loop([[base, true], [rows.line(left, apex, [-1, 0, 0], [0, 0, 1]), true], [rows.line(apex, right, [0, 0, 1], [1, 0, 0]), true]]);
        const model = rows.add(`IFCSHELLBASEDSURFACEMODEL((#${rows.add(`IFCOPENSHELL((#${rows.face([[loop, true]], surface)}))`)}))`);

        // Act
        const mesh = meshOf(rows.rows, model);
        const offCone = mesh.positions.filter((_, at) => at % 3 === 0).some((x, at) => {
            const [y, z] = [mesh.positions[at * 3 + 1]!, mesh.positions[at * 3 + 2]!];
            return Math.abs(Math.hypot(x, y) - (1 - z)) > 1e-9;
        });

        // Assert
        expect(mesh.indices.length / 3).toBeGreaterThanOrEqual(SEGMENTS / 2);
        expect(offCone).toBe(false);
        expect(mesh.positions.filter((_, at) => at % 3 === 1).every((y) => y >= -1e-9)).toBe(true);
    });

    it("should mesh a face of a surface of revolution and refuse a face on a surface it does not read", () => {
        // Arrange
        const rows = new Rows();
        const [a, b, c, d] = [rows.vertex(1, 0, 0), rows.vertex(1, 0, 1), rows.vertex(0, 1, 1), rows.vertex(0, 1, 0)];
        const profile = rows.add(`IFCPOLYLINE((#${rows.point(1, 0, 0)},#${rows.point(1, 0, 1)}))`);
        const axis = rows.add(`IFCAXIS1PLACEMENT(#${rows.point(0, 0, 0)},#${rows.direction(0, 0, 1)})`);
        const surface = rows.add(`IFCSURFACEOFREVOLUTION(#${rows.add(`IFCARBITRARYOPENPROFILEDEF(.CURVE.,$,#${profile})`)},$,#${axis})`);
        const arc = (from: number, to: number, z: number): number => rows.add(`IFCEDGECURVE(#${from},#${to},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, z])},1.)`)},.T.)`);
        const loop = rows.loop([[rows.line(a, b, [1, 0, 0], [1, 0, 1]), true], [arc(b, c, 1), true], [rows.line(d, c, [0, 1, 0], [0, 1, 1]), false], [arc(a, d, 0), false]]);
        const face = rows.face([[loop, true]], surface);
        const odd = rows.face([[loop, true]], rows.add(`IFCOFFSETCURVE2D(#${profile},1.,.F.)`));
        const surfaceModel = rows.add(`IFCSHELLBASEDSURFACEMODEL((#${rows.add(`IFCOPENSHELL((#${face}))`)}))`);
        const oddModel = rows.add(`IFCSHELLBASEDSURFACEMODEL((#${rows.add(`IFCOPENSHELL((#${odd}))`)}))`);

        // Act
        const mesh = meshOf(rows.rows, surfaceModel);
        const attempt = (): void => {
            new ItemConverter(modelOf(withContext(rows.rows)), new RecipeBuilder(), REACH).item(oddModel);
        };

        // Assert
        expect(mesh.indices.length / 3).toBeGreaterThanOrEqual(2 * (SEGMENTS / 4));
        expect(mesh.positions.every((_, at) => at % 3 === 2 || Math.abs(Math.hypot(mesh.positions[at - (at % 3)]!, mesh.positions[at - (at % 3) + 1]!) - 1) < 1e-9)).toBe(true);
        expect(attempt).toThrow("A face on an IfcOffsetCurve2D is not supported yet");
    });
});

describe("ItemConverter and the faces advanced breps are made of", () => {
    function surfaceModel(rows: Rows, faces: readonly number[]): number {
        return rows.add(`IFCSHELLBASEDSURFACEMODEL((#${rows.add(`IFCOPENSHELL((${faces.map((face) => `#${face}`).join(",")}))`)}))`);
    }

    function attempt(rows: Rows, item: number): () => void {
        return () => {
            new ItemConverter(modelOf(withContext(rows.rows)), new RecipeBuilder(), REACH).item(item);
        };
    }

    it("should mesh a face without a surface in the plane of its edges", () => {
        // Arrange
        const rows = new Rows();
        const corners: Base.Point3[] = [[0, 0, 1], [2, 0, 1], [0, 2, 1]];
        const [a, b, c] = corners.map((corner) => rows.vertex(...corner));
        const loop = rows.loop([[rows.line(a!, b!, corners[0]!, corners[1]!), true], [rows.line(b!, c!, corners[1]!, corners[2]!), true], [rows.line(c!, a!, corners[2]!, corners[0]!), true]]);
        const face = rows.add(`IFCFACE((#${rows.add(`IFCFACEOUTERBOUND(#${loop},.T.)`)}))`);

        // Act
        const mesh = meshOf(rows.rows, surfaceModel(rows, [face]));

        // Assert
        expect(mesh.indices).toHaveLength(3);
        expect(mesh.positions.filter((_, at) => at % 3 === 2)).toEqual([1, 1, 1]);
    });

    it("should split a sphere's pole on a loop through it into the angles the loop arrives and leaves at, facing the way its sense says", () => {
        // Arrange
        const octant = (sameSense: boolean): { rows: Rows; face: number } => {
            const rows = new Rows();
            const [east, north, top] = [rows.vertex(1, 0, 0), rows.vertex(0, 1, 0), rows.vertex(0, 0, 1)];
            const arc = (from: number, to: number, z: Base.Vector3, x: Base.Vector3): number => rows.add(`IFCEDGECURVE(#${from},#${to},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, 0], z, x)},1.)`)},.T.)`);
            const loop = rows.loop([[arc(east, north, [0, 0, 1], [1, 0, 0]), true], [arc(north, top, [1, 0, 0], [0, 1, 0]), true], [arc(top, east, [0, 1, 0], [0, 0, 1]), true]]);
            return { rows, face: rows.face([[loop, true]], rows.add(`IFCSPHERICALSURFACE(#${rows.placement([0, 0, 0])},1.)`), sameSense) };
        };
        const facing = (mesh: { positions: number[]; indices: number[] }): number[] => Array.from({ length: mesh.indices.length / 3 }, (_, triangle) => {
            const [a, b, c] = [0, 1, 2].map((corner) => mesh.indices[triangle * 3 + corner]! * 3).map((at) => [mesh.positions[at]!, mesh.positions[at + 1]!, mesh.positions[at + 2]!]) as [number[], number[], number[]];
            const [u, v] = [[b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!], [c[0]! - a[0]!, c[1]! - a[1]!, c[2]! - a[2]!]];
            const normal = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
            return Math.sign(normal[0]! * (a[0]! + b[0]! + c[0]!) + normal[1]! * (a[1]! + b[1]! + c[1]!) + normal[2]! * (a[2]! + b[2]! + c[2]!));
        });
        const areaOf = (mesh: { positions: number[]; indices: number[] }): number => Array.from({ length: mesh.indices.length / 3 }, (_, triangle) => {
            const [a, b, c] = [0, 1, 2].map((corner) => mesh.indices[triangle * 3 + corner]! * 3).map((at) => [mesh.positions[at]!, mesh.positions[at + 1]!, mesh.positions[at + 2]!]) as [number[], number[], number[]];
            const [u, v] = [[b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!], [c[0]! - a[0]!, c[1]! - a[1]!, c[2]! - a[2]!]];
            return Math.hypot(u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!) / 2;
        }).reduce((sum, area) => sum + area, 0);
        const [outward, inward] = [octant(true), octant(false)];

        // Act
        const mesh = meshOf(outward.rows.rows, surfaceModel(outward.rows, [outward.face]));
        const turned = meshOf(inward.rows.rows, surfaceModel(inward.rows, [inward.face]));
        const radii = Array.from({ length: mesh.positions.length / 3 }, (_, at) => Math.hypot(mesh.positions[at * 3]!, mesh.positions[at * 3 + 1]!, mesh.positions[at * 3 + 2]!));
        const degenerate = Array.from({ length: mesh.indices.length / 3 }, (_, triangle) => mesh.indices.slice(triangle * 3, triangle * 3 + 3)).filter(([a, b, c]) => a === b || b === c || c === a);

        // Assert
        expect(mesh.indices.length / 3).toBeGreaterThan(SEGMENTS / 4);
        expect(radii.every((radius) => Math.abs(radius - 1) < 1e-9)).toBe(true);
        expect(mesh.positions.every((value) => value >= -1e-9)).toBe(true);
        expect(areaOf(mesh) / (Math.PI / 2)).toBeCloseTo(1, 1);
        expect(degenerate).toEqual([]);
        expect(facing(mesh).every((sign) => sign > 0)).toBe(true);
        expect(facing(turned).every((sign) => sign < 0)).toBe(true);
    });

    it("should leave a hole open in a patch of a cylinder, and read a rational patch written with its points multiplied by its weights", () => {
        // Arrange
        const rows = new Rows();
        const cylinder = rows.add(`IFCCYLINDRICALSURFACE(#${rows.placement([0, 0, 0])},1.)`);
        const [a, b, c, d] = [rows.vertex(1, 0, 0), rows.vertex(0, 1, 0), rows.vertex(0, 1, 2), rows.vertex(1, 0, 2)];
        const arc = (from: number, to: number, z: number): number => rows.add(`IFCEDGECURVE(#${from},#${to},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, z])},1.)`)},.T.)`);
        const outer = rows.loop([[arc(a, b, 0), true], [rows.line(b, c, [0, 1, 0], [0, 1, 2]), true], [arc(d, c, 2), false], [rows.line(a, d, [1, 0, 0], [1, 0, 2]), false]]);
        const hole = [0.6, 0.9].flatMap((angle) => [0.8, 1.2].map((z) => rows.point(Math.cos(angle), Math.sin(angle), z)));
        const holeLoop = rows.add(`IFCPOLYLOOP((#${hole[0]},#${hole[2]},#${hole[3]},#${hole[1]}))`);
        const patch = rows.face([[outer, true], [holeLoop, true]], cylinder);
        const net = [rows.point(0, 0, 0), rows.point(0, 2, 0), rows.point(2, 0, 0), rows.point(4, 4, 0)];
        const rational = rows.add(`IFCRATIONALBSPLINESURFACEWITHKNOTS(1,1,((#${net[0]},#${net[1]}),(#${net[2]},#${net[3]})),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.,((1.,1.),(1.,2.)))`);
        const corners: Base.Point3[] = [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0]];
        const vertices = corners.map((corner) => rows.vertex(...corner));
        const square = rows.loop(corners.map((corner, at) => [rows.line(vertices[at]!, vertices[(at + 1) % 4]!, corner, corners[(at + 1) % 4]!), true] as const));
        const weighted = rows.face([[square, true]], rational);
        const curvedNet = [rows.point(0, 0, 0), rows.point(0, 2, 0), rows.point(2, 0, 0), rows.point(4, 4, 4)];
        const curvedRational = rows.add(`IFCRATIONALBSPLINESURFACEWITHKNOTS(1,1,((#${curvedNet[0]},#${curvedNet[1]}),(#${curvedNet[2]},#${curvedNet[3]})),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.,((1.,1.),(1.,2.)))`);
        const saddle: Base.Point3[] = [[0, 0, 0], [2, 0, 0], [2, 2, 2], [0, 2, 0]];
        const saddleVertices = saddle.map((corner) => rows.vertex(...corner));
        const saddleLoop = rows.loop(saddle.map((corner, at) => [rows.line(saddleVertices[at]!, saddleVertices[(at + 1) % 4]!, corner, saddle[(at + 1) % 4]!), true] as const));
        const curved = rows.face([[saddleLoop, true]], curvedRational);

        // Act
        const holed = meshOf(rows.rows, surfaceModel(rows, [patch]));
        const divided = meshOf(rows.rows, surfaceModel(rows, [weighted]));
        const curvedMesh = meshOf(rows.rows, surfaceModel(rows, [curved]));
        const offPatch = Array.from({ length: curvedMesh.positions.length / 3 }, (_, at) => {
            const [x, y, z] = [curvedMesh.positions[at * 3]!, curvedMesh.positions[at * 3 + 1]!, curvedMesh.positions[at * 3 + 2]!];
            const product = z / (4 - z);
            const [u, v] = [(x * (1 + product)) / 2 - product, (y * (1 + product)) / 2 - product];
            return Math.abs(u * v - product);
        });

        // Assert
        expect(holed.indices.length / 3).toBeGreaterThan(8);
        expect(Math.max(...divided.positions)).toBeCloseTo(2, 9);
        expect(Math.max(...offPatch)).toBeLessThan(1e-6);
        expect(curvedMesh.indices.length / 3).toBeGreaterThan(2);
    });

    it("should cut a band of a sphere open along a seam sampled as the sphere curves, the same points on both sides", () => {
        // Arrange
        const rows = new Rows();
        const latitude = (z: number): number => {
            const radius = Math.sqrt(1 - z * z);
            const vertex = rows.vertex(radius, 0, z);
            return rows.loop([[rows.add(`IFCEDGECURVE(#${vertex},#${vertex},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, z])},${radius.toFixed(6)})`)},.T.)`), true]]);
        };
        const band = rows.face([[latitude(-0.8), true], [latitude(0.8), false]], rows.add(`IFCSPHERICALSURFACE(#${rows.placement([0, 0, 0])},1.)`));

        // Act
        const mesh = meshOf(rows.rows, surfaceModel(rows, [band]));
        const seam = mesh.positions.filter((_, at) => at % 3 === 0).filter((x, at) => Math.abs(mesh.positions[at * 3 + 1]!) < 1e-9 && x > 0).length;

        // Assert
        expect(edgeUses(mesh.indices).consistent).toBe(true);
        expect(seam).toBeGreaterThan(2);
    });

    it("should refuse faces that wrap around a cylinder without closing, the same way twice or three times, and a loop of two points", () => {
        // Arrange
        const rows = new Rows();
        const cylinder = rows.add(`IFCCYLINDRICALSURFACE(#${rows.placement([0, 0, 0])},1.)`);
        const circleAt = (z: number): number => {
            const vertex = rows.vertex(1, 0, z);
            return rows.loop([[rows.add(`IFCEDGECURVE(#${vertex},#${vertex},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, z])},1.)`)},.T.)`), true]]);
        };
        const [low, middle, high] = [circleAt(0), circleAt(1), circleAt(2)];
        const lone = surfaceModel(rows, [rows.face([[low, true]], cylinder)]);
        const same = surfaceModel(rows, [rows.face([[low, true], [high, true]], cylinder)]);
        const three = surfaceModel(rows, [rows.face([[low, true], [middle, false], [high, false]], cylinder)]);
        const [p, q] = [rows.vertex(0, 0, 0), rows.vertex(1, 0, 0)];
        const lens = surfaceModel(rows, [rows.face([[rows.loop([[rows.line(p, q, [0, 0, 0], [1, 0, 0]), true]]), true]], cylinder)]);

        // Act & Assert
        expect(attempt(rows, lone)).toThrow("A face that wraps around its surface without closing over a pole is not supported yet");
        expect(attempt(rows, same)).toThrow("A face whose loops wrap around its surface the same way is not supported yet");
        expect(attempt(rows, three)).toThrow("A face whose 3 loops wrap around its surface is not supported yet");
        expect(attempt(rows, lens)).toThrow("bounds no area");
    });
});

describe("ItemConverter and the exact description of advanced breps", () => {
    it("should describe a cube of planar faces as eight vertices, twelve edges on lines and six faces on planes, its triangles as the fallback", () => {
        // Arrange
        const { rows, brep } = cubeRows();

        // Act
        const { recipe, node } = exactOf(rows, brep);

        // Assert
        expect(checkRecipe(recipe)).toEqual([]);
        expect(node.op).toBe("brep");
        if (node.op !== "brep") {
            return;
        }
        expect(node.vertices[1]).toBe(8 * 3);
        expect(node.edges).toHaveLength(12);
        expect(node.curves.every((curve) => curve.kind === "line")).toBe(true);
        expect(node.surfaces.map((surface) => surface.kind)).toEqual(Array(6).fill("plane"));
        expect(node.faces.every((face) => face.bounds.length === 1 && face.bounds[0]!.outer && face.bounds[0]!.edges.length === 4)).toBe(true);
        expect(node.closed).toBe(true);
        expect(recipe.nodes[node.fallback!]!.op).toBe("triangles");
        const coordinates = numbersIn(recipe, node.vertices);
        const corners = Array.from({ length: 8 }, (_, at) => coordinates.slice(at * 3, at * 3 + 3).join(","));
        expect(new Set(corners)).toEqual(new Set(["0,0,0", "1,0,0", "1,1,0", "0,1,0", "0,0,1", "1,0,1", "1,1,1", "0,1,1"]));
    });

    it("should share a circle's edge between the faces that meet on it and fold a reversed bound into its edges", () => {
        // Arrange
        const rows = new Rows();
        const bottom = rows.vertex(1, 0, 0);
        const top = rows.vertex(1, 0, 2);
        const circleAt = (z: number, vertex: number): number => rows.add(`IFCEDGECURVE(#${vertex},#${vertex},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, z])},1.)`)},.T.)`);
        const [low, high] = [circleAt(0, bottom), circleAt(2, top)];
        const lowLoop = rows.loop([[low, true]]);
        const highLoop = rows.loop([[high, true]]);
        const side = rows.face([[lowLoop, true], [highLoop, false]], rows.add(`IFCCYLINDRICALSURFACE(#${rows.placement([0, 0, 0])},1.)`));
        const floor = rows.face([[lowLoop, false]], rows.add(`IFCPLANE(#${rows.placement([0, 0, 0], [0, 0, -1])})`), false);
        const brep = rows.brep([side, floor]);

        // Act
        const { recipe, node } = exactOf(rows.rows, brep);

        // Assert
        expect(checkRecipe(recipe)).toEqual([]);
        if (node.op !== "brep") {
            throw new Error("not a brep node");
        }
        expect(node.edges).toEqual([{ curve: 0, start: 0, end: 0 }, { curve: 1, start: 1, end: 1 }]);
        expect(node.curves[0]).toEqual({ kind: "circle", origin: [0, 0, 0], axis: [0, 0, 1], xDirection: [1, 0, 0], radius: 1 });
        expect(node.surfaces[0]).toEqual({ kind: "cylinder", origin: [0, 0, 0], axis: [0, 0, 1], xDirection: [1, 0, 0], radius: 1 });
        expect(node.faces[0]!.bounds).toEqual([{ outer: true, edges: [0], forward: [true] }, { outer: false, edges: [1], forward: [false] }]);
        expect(node.faces[1]).toEqual({ surface: 1, sameSense: false, bounds: [{ outer: true, edges: [0], forward: [false] }] });
    });

    it("should describe a surface written once for two faces once, and keep an edge against its curve's sense", () => {
        // Arrange
        const rows = new Rows();
        const start = rows.vertex(1, 0, 0);
        const equator = rows.add(`IFCEDGECURVE(#${start},#${start},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, 0])},1.)`)},.F.)`);
        const loop = rows.loop([[equator, true]]);
        const sphere = rows.add(`IFCSPHERICALSURFACE(#${rows.placement([0, 0, 0])},1.)`);
        const brep = rows.brep([rows.face([[loop, true]], sphere), rows.face([[loop, false]], sphere)]);

        // Act
        const { node } = exactOf(rows.rows, brep);

        // Assert
        if (node.op !== "brep") {
            throw new Error("not a brep node");
        }
        expect(node.surfaces).toEqual([{ kind: "sphere", origin: [0, 0, 0], axis: [0, 0, 1], xDirection: [1, 0, 0], radius: 1 }]);
        expect(node.edges).toEqual([{ curve: 0, start: 0, end: 0, sameSense: false }]);
    });

    it("should describe B-spline edges and surfaces with their knots, dividing the points of a surface written multiplied by its weights", () => {
        // Arrange
        const rows = new Rows();
        const net = [rows.point(0, 0, 0), rows.point(0, 2, 0), rows.point(2, 0, 0), rows.point(4, 4, 4)];
        const rational = rows.add(`IFCRATIONALBSPLINESURFACEWITHKNOTS(1,1,((#${net[0]},#${net[1]}),(#${net[2]},#${net[3]})),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.,((1.,1.),(1.,2.)))`);
        const corners: Base.Point3[] = [[0, 0, 0], [2, 0, 0], [2, 2, 2], [0, 2, 0]];
        const vertices = corners.map((corner) => rows.vertex(...corner));
        const splineEdge = rows.add(`IFCEDGECURVE(#${vertices[0]},#${vertices[1]},#${rows.add(`IFCBSPLINECURVEWITHKNOTS(2,(#${rows.point(0, 0, 0)},#${rows.point(1, 0, 0)},#${rows.point(2, 0, 0)}),.UNSPECIFIED.,.F.,.F.,(3,3),(0.,1.),.UNSPECIFIED.)`)},.T.)`);
        const polylineEdge = rows.add(`IFCEDGECURVE(#${vertices[1]},#${vertices[2]},#${rows.add(`IFCPOLYLINE((#${rows.point(2, 0, 0)},#${rows.point(2, 1, 1)},#${rows.point(2, 2, 2)}))`)},.T.)`);
        const square = rows.loop([[splineEdge, true], [polylineEdge, true], [rows.line(vertices[2]!, vertices[3]!, corners[2]!, corners[3]!), true], [rows.line(vertices[3]!, vertices[0]!, corners[3]!, corners[0]!), true]]);
        const brep = rows.brep([rows.face([[square, true]], rational)]);

        // Act
        const { recipe, node } = exactOf(rows.rows, brep);

        // Assert
        expect(checkRecipe(recipe)).toEqual([]);
        if (node.op !== "brep") {
            throw new Error("not a brep node");
        }
        const [spline, polyline] = node.curves;
        const surface = node.surfaces[0]!;
        expect(spline).toMatchObject({ kind: "bspline", degree: 2, multiplicities: [3, 3] });
        expect(polyline).toMatchObject({ kind: "bspline", degree: 1, multiplicities: [2, 1, 2] });
        if (polyline?.kind !== "bspline" || surface.kind !== "bspline") {
            throw new Error("not B-splines");
        }
        expect(numbersIn(recipe, polyline.knots)).toEqual([0, 1, 2]);
        expect(numbersIn(recipe, surface.points)).toEqual([0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 2, 2]);
        expect(numbersIn(recipe, surface.weights!)).toEqual([1, 1, 1, 2]);
        expect(surface).toMatchObject({ uDegree: 1, vDegree: 1, uCount: 2, vCount: 2, uMultiplicities: [2, 2], vMultiplicities: [2, 2] });
    });

    it("should describe a face on a surface of revolution by its profile, keep only the triangles of a face on a surface it does not describe, and only the description of a brep whose triangles fail", () => {
        // Arrange
        const rows = new Rows();
        const [a, b, c, d] = [rows.vertex(1, 0, 0), rows.vertex(1, 0, 1), rows.vertex(0, 1, 1), rows.vertex(0, 1, 0)];
        const profile = rows.add(`IFCPOLYLINE((#${rows.point(1, 0, 0)},#${rows.point(1, 0, 1)}))`);
        const axis = rows.add(`IFCAXIS1PLACEMENT(#${rows.point(0, 0, 0)},#${rows.direction(0, 0, 1)})`);
        const revolution = rows.add(`IFCSURFACEOFREVOLUTION(#${rows.add(`IFCARBITRARYOPENPROFILEDEF(.CURVE.,$,#${profile})`)},$,#${axis})`);
        const arc = (from: number, to: number, z: number): number => rows.add(`IFCEDGECURVE(#${from},#${to},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, z])},1.)`)},.T.)`);
        const loop = rows.loop([[rows.line(a, b, [1, 0, 0], [1, 0, 1]), true], [arc(b, c, 1), true], [rows.line(d, c, [0, 1, 0], [0, 1, 1]), false], [arc(a, d, 0), false]]);
        const turned = rows.brep([rows.face([[loop, true]], revolution)]);
        const [e, f] = [rows.vertex(2, 0, 1), rows.vertex(2, 0, 0)];
        const square = rows.loop([
            [rows.line(a, f, [1, 0, 0], [2, 0, 0]), true], [rows.line(f, e, [2, 0, 0], [2, 0, 1]), true],
            [rows.line(e, b, [2, 0, 1], [1, 0, 1]), true], [rows.line(b, a, [1, 0, 1], [1, 0, 0]), true],
        ]);
        const trimmed = rows.add(`IFCRECTANGULARTRIMMEDSURFACE(#${rows.add(`IFCPLANE(#${rows.placement([0, 0, 0], [0, 1, 0])})`)},0.,0.,2.,2.,.T.,.T.)`);
        const flat = rows.brep([rows.face([[square, true]], trimmed)]);
        const cylinder = rows.add(`IFCCYLINDRICALSURFACE(#${rows.placement([0, 0, 0])},1.)`);
        const vertex = rows.vertex(1, 0, 3);
        const ring = rows.loop([[rows.add(`IFCEDGECURVE(#${vertex},#${vertex},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, 3])},1.)`)},.T.)`), true]]);
        const wrapped = rows.brep([rows.face([[ring, true]], cylinder)]);

        // Act
        const turnedRecipe = exactOf(rows.rows, turned);
        const flatNode = exactOf(rows.rows, flat).node;
        const wrappedNode = exactOf(rows.rows, wrapped).node;

        // Assert
        expect(checkRecipe(turnedRecipe.recipe)).toEqual([]);
        if (turnedRecipe.node.op !== "brep") {
            throw new Error("not a brep node");
        }
        const surface = turnedRecipe.node.surfaces[0]!;
        expect(surface).toEqual({ kind: "revolution", curve: surface.kind === "revolution" ? surface.curve : -1, origin: [0, 0, 0], axis: [0, 0, 1] });
        const turnedCurve = turnedRecipe.node.curves[surface.kind === "revolution" ? surface.curve : 0]!;
        expect(turnedCurve.kind === "bspline" && numbersIn(turnedRecipe.recipe, turnedCurve.points)).toEqual([1, 0, 0, 1, 0, 1]);
        expect(flatNode.op).toBe("triangles");
        expect(wrappedNode.op).toBe("brep");
        expect(wrappedNode.op === "brep" && wrappedNode.fallback).toBeUndefined();
    });
});

describe("ItemConverter and a representation of several advanced breps", () => {
    it("should describe every brep of the representation in one node, their joined triangles as its fallback", () => {
        // Arrange
        const rows = new Rows();
        const [first, second] = [cubeIn(rows), cubeIn(rows, 3)];
        const representation = rows.add(`IFCSHAPEREPRESENTATION(#3,'Body','AdvancedBrep',(#${first},#${second}))`);
        const builder = new RecipeBuilder();
        const converter = new ItemConverter(modelOf(withContext(rows.rows)), builder, REACH);

        // Act
        builder.root({ node: converter.representation(representation), matrix: IDENTITY, tag: {} });
        const recipe = builder.build(1, 0.001);
        const node = recipe.nodes.at(-1)!;

        // Assert
        expect(checkRecipe(recipe)).toEqual([]);
        expect(recipe.nodes.map((step) => step.op)).toEqual(["triangles", "brep"]);
        if (node.op !== "brep") {
            throw new Error("not a brep node");
        }
        expect(node.faces).toHaveLength(12);
        expect(node.vertices[1]).toBe(16 * 3);
        const fallback = recipe.nodes[node.fallback!]!;
        expect(fallback.op === "triangles" && fallback.indices[1]).toBe(2 * 12 * 3);
    });
});

describe("ItemConverter and the rarer forms of an exact description", () => {
    function face(rows: Rows, edges: readonly (readonly [number, boolean])[], surface: number): number {
        return rows.face([[rows.loop(edges), true]], surface);
    }

    function plane(rows: Rows): number {
        return rows.add(`IFCPLANE(#${rows.placement([0, 0, 0])})`);
    }

    function attempt(rows: Rows, item: number): () => void {
        return () => {
            new ItemConverter(modelOf(withContext(rows.rows)), new RecipeBuilder(), REACH).item(item);
        };
    }

    it("should describe a trimmed curve and a surface curve by the curve they lie on, once for both edges on it", () => {
        // Arrange
        const rows = new Rows();
        const [right, left] = [rows.vertex(1, 0, 0), rows.vertex(-1, 0, 0)];
        const circle = rows.add(`IFCCIRCLE(#${rows.placement([0, 0, 0])},1.)`);
        const trimmed = rows.add(`IFCTRIMMEDCURVE(#${circle},(IFCPARAMETERVALUE(0.)),(IFCPARAMETERVALUE(3.141592653589793)),.T.,.PARAMETER.)`);
        const onSurface = rows.add(`IFCSURFACECURVE(#${circle},(),.CURVE3D.)`);
        const upper = rows.add(`IFCEDGECURVE(#${right},#${left},#${trimmed},.T.)`);
        const lower = rows.add(`IFCEDGECURVE(#${left},#${right},#${onSurface},.T.)`);
        const disc = rows.brep([face(rows, [[upper, true], [lower, true]], plane(rows))]);

        // Act
        const { recipe, node } = exactOf(rows.rows, disc);

        // Assert
        expect(checkRecipe(recipe)).toEqual([]);
        if (node.op !== "brep") {
            throw new Error("not a brep node");
        }
        expect(node.curves).toEqual([{ kind: "circle", origin: [0, 0, 0], axis: [0, 0, 1], xDirection: [1, 0, 0], radius: 1 }]);
        expect(node.edges.map((edge) => edge.curve)).toEqual([0, 0]);
    });

    it("should divide the points of a rational edge written multiplied by its weights, and join repeated knots", () => {
        // Arrange
        const rows = new Rows();
        const [start, end] = [rows.vertex(0, 0, 0), rows.vertex(2, 0, 0)];
        const spline = rows.add(`IFCRATIONALBSPLINECURVEWITHKNOTS(1,(#${rows.point(0, 0, 0)},#${rows.point(4, 0, 0)}),.UNSPECIFIED.,.F.,.F.,(1,1,2),(0.,0.,1.),.UNSPECIFIED.,(1.,2.))`);
        const along = rows.add(`IFCEDGECURVE(#${start},#${end},#${spline},.T.)`);
        const back = rows.line(end, start, [2, 0, 0], [0, 0, 0]);
        const sliver = rows.brep([face(rows, [[along, true], [back, true]], plane(rows))]);

        // Act
        const { recipe, node } = exactOf(rows.rows, sliver);

        // Assert
        if (node.op !== "brep") {
            throw new Error("not a brep node");
        }
        const curve = node.curves[0]!;
        if (curve.kind !== "bspline") {
            throw new Error("not a B-spline");
        }
        expect(numbersIn(recipe, curve.points)).toEqual([0, 0, 0, 2, 0, 0]);
        expect(numbersIn(recipe, curve.weights!)).toEqual([1, 2]);
        expect(numbersIn(recipe, curve.knots)).toEqual([0, 1]);
        expect(curve.multiplicities).toEqual([2, 2]);
    });

    it("should describe an ellipse with its two semi-axes, and a surface of extrusion by its profile placed by the surface", () => {
        // Arrange
        const rows = new Rows();
        const vertex = rows.vertex(2, 0, 0);
        const ellipse = rows.add(`IFCEDGECURVE(#${vertex},#${vertex},#${rows.add(`IFCELLIPSE(#${rows.placement([0, 0, 0])},2.,1.)`)},.T.)`);
        const flat = rows.brep([face(rows, [[ellipse, true]], plane(rows))]);
        const profile = rows.add(`IFCPOLYLINE((#${rows.point(0, 0, 0)},#${rows.point(1, 0, 0)}))`);
        const extrusion = rows.add(`IFCSURFACEOFLINEAREXTRUSION(#${rows.add(`IFCARBITRARYOPENPROFILEDEF(.CURVE.,$,#${profile})`)},#${rows.placement([0, 0, 5])},#${rows.direction(0, 1, 0)},2.)`);
        const [a, b, c, d] = [rows.vertex(0, 0, 5), rows.vertex(1, 0, 5), rows.vertex(1, 2, 5), rows.vertex(0, 2, 5)];
        const wall = rows.brep([face(rows, [[rows.line(a, b, [0, 0, 5], [1, 0, 5]), true], [rows.line(b, c, [1, 0, 5], [1, 2, 5]), true], [rows.line(c, d, [1, 2, 5], [0, 2, 5]), true], [rows.line(d, a, [0, 2, 5], [0, 0, 5]), true]], extrusion)]);

        // Act
        const ellipseNode = exactOf(rows.rows, flat).node;
        const { recipe, node } = exactOf(rows.rows, wall);

        // Assert
        expect(ellipseNode.op === "brep" && ellipseNode.curves[0]).toEqual({ kind: "ellipse", origin: [0, 0, 0], axis: [0, 0, 1], xDirection: [1, 0, 0], xRadius: 2, yRadius: 1 });
        if (node.op !== "brep") {
            throw new Error("not a brep node");
        }
        const surface = node.surfaces[0]!;
        expect(surface).toEqual({ kind: "extrusion", curve: surface.kind === "extrusion" ? surface.curve : -1, direction: [0, 1, 0] });
        const swept = node.curves[surface.kind === "extrusion" ? surface.curve : 0]!;
        expect(swept.kind === "bspline" && numbersIn(recipe, swept.points)).toEqual([0, 0, 5, 1, 0, 5]);
    });

    it("should describe a brep with voids as the faces of its outer shell and of each void, its triangles counting a void against the outside", () => {
        // Arrange
        const rows = new Rows();
        const outer = cubeIn(rows);
        const inner = cubeIn(rows, 5);
        const shellOf = (brep: number): number => Number(/IFCADVANCEDBREP\(#(\d+)\)/.exec(rows.rows.find((row) => row.startsWith(`#${brep}=`))!)![1]);
        const [outerShell, innerShell] = [shellOf(outer), shellOf(inner)];
        const hollow = rows.add(`IFCADVANCEDBREPWITHVOIDS(#${outerShell},(#${innerShell}))`);

        // Act
        const { recipe, node } = exactOf(rows.rows, hollow);

        // Assert
        expect(checkRecipe(recipe)).toEqual([]);
        if (node.op !== "brep") {
            throw new Error("not a brep node");
        }
        expect(node.faces).toHaveLength(12);
        const fallback = recipe.nodes[node.fallback!]!;
        if (fallback.op !== "triangles") {
            throw new Error("no triangles");
        }
        const positions = numbersIn(recipe, fallback.positions);
        const indices = [...recipe.buffers.i32.slice(fallback.indices[0], fallback.indices[0] + fallback.indices[1])];
        expect(signedVolumeOf(positions, indices)).toBeCloseTo(0, 9);
    });

    it("should keep the points and weights of a rational spline surface written as the standard has them", () => {
        // Arrange
        const rows = new Rows();
        const net = [rows.point(0, 0, 0), rows.point(0, 2, 0), rows.point(2, 0, 0), rows.point(2, 2, 2)];
        const rational = rows.add(`IFCRATIONALBSPLINESURFACEWITHKNOTS(1,1,((#${net[0]},#${net[1]}),(#${net[2]},#${net[3]})),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.,((1.,1.),(1.,2.)))`);
        const corners: Base.Point3[] = [[0, 0, 0], [2, 0, 0], [2, 2, 2], [0, 2, 0]];
        const vertices = corners.map((corner) => rows.vertex(...corner));
        const square = rows.loop(corners.map((corner, at) => [rows.line(vertices[at]!, vertices[(at + 1) % 4]!, corner, corners[(at + 1) % 4]!), true] as const));
        const brep = rows.brep([rows.face([[square, true]], rational)]);

        // Act
        const { recipe, node } = exactOf(rows.rows, brep);

        // Assert
        const surface = node.op === "brep" ? node.surfaces[0] : undefined;
        if (surface?.kind !== "bspline") {
            throw new Error("not a B-spline surface");
        }
        expect(numbersIn(recipe, surface.points)).toEqual([0, 0, 0, 0, 2, 0, 2, 0, 0, 2, 2, 2]);
        expect(numbersIn(recipe, surface.weights!)).toEqual([1, 1, 1, 2]);
    });

    it("should take an edge written without a curve as straight for the triangles and leave the exact description out", () => {
        // Arrange
        const rows = new Rows();
        const [a, b, c] = [rows.vertex(0, 0, 0), rows.vertex(1, 0, 0), rows.vertex(0, 1, 0)];
        const bare = rows.add(`IFCEDGECURVE(#${a},#${b},$,.T.)`);
        const triangle = rows.brep([face(rows, [[bare, true], [rows.line(b, c, [1, 0, 0], [0, 1, 0]), true], [rows.line(c, a, [0, 1, 0], [0, 0, 0]), true]], plane(rows))]);

        // Act
        const node = exactOf(rows.rows, triangle).node;

        // Assert
        expect(node.op).toBe("triangles");
    });

    it("should fail with the reason the triangles give a trimmed curve without its basis, a revolution without an axis and a spline surface of degree 0", () => {
        // Arrange
        const rows = new Rows();
        const [start, end] = [rows.vertex(1, 0, 0), rows.vertex(-1, 0, 0)];
        const orphan = rows.add(`IFCEDGECURVE(#${start},#${end},#${rows.add("IFCTRIMMEDCURVE($,(IFCPARAMETERVALUE(0.)),(IFCPARAMETERVALUE(1.)),.T.,.PARAMETER.)")},.T.)`);
        const back = rows.line(end, start, [-1, 0, 0], [1, 0, 0]);
        const trimmed = rows.brep([face(rows, [[orphan, true], [back, true]], plane(rows))]);
        const profile = rows.add(`IFCARBITRARYOPENPROFILEDEF(.CURVE.,$,#${rows.add(`IFCPOLYLINE((#${rows.point(1, 0, 0)},#${rows.point(1, 0, 1)}))`)})`);
        const axisless = rows.brep([face(rows, [[back, true], [rows.line(start, end, [1, 0, 0], [-1, 0, 0]), true]], rows.add(`IFCSURFACEOFREVOLUTION(#${profile},$,$)`))]);
        const points = [rows.point(0, 0, 0), rows.point(0, 1, 0), rows.point(1, 0, 0), rows.point(1, 1, 0)];
        const flatSpline = rows.add(`IFCBSPLINESURFACEWITHKNOTS(0,1,((#${points[0]},#${points[1]}),(#${points[2]},#${points[3]})),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.)`);
        const degreeless = rows.brep([face(rows, [[back, true], [rows.line(start, end, [1, 0, 0], [-1, 0, 0]), true]], flatSpline)]);

        // Act & Assert
        expect(attempt(rows, trimmed)).toThrow();
        expect(attempt(rows, axisless)).toThrow();
        expect(attempt(rows, degreeless)).toThrow();
    });

    it("should keep only the triangles of a brep whose faces have no surface or are bounded by polygons", () => {
        // Arrange
        const rows = new Rows();
        const corners = [rows.point(0, 0, 0), rows.point(1, 0, 0), rows.point(0, 1, 0)];
        const polygon = rows.add(`IFCPOLYLOOP((#${corners.join(",#")}))`);
        const plain = rows.add(`IFCFACE((#${rows.add(`IFCFACEOUTERBOUND(#${polygon},.T.)`)}))`);
        const onPlane = rows.face([[polygon, true]], plane(rows));
        const [plainBrep, polygonBrep] = [rows.brep([plain]), rows.brep([onPlane])];

        // Act
        const plainNode = exactOf(rows.rows, plainBrep).node;
        const polygonNode = exactOf(rows.rows, polygonBrep).node;

        // Assert
        expect(plainNode.op).toBe("triangles");
        expect(polygonNode.op).toBe("triangles");
    });

    it("should report the triangles' reason when neither the triangles nor the exact description can be made", () => {
        // Arrange
        const rows = new Rows();
        const vertex = rows.vertex(1, 0, 0);
        const ring = rows.loop([[rows.add(`IFCEDGECURVE(#${vertex},#${vertex},#${rows.add(`IFCCIRCLE(#${rows.placement([0, 0, 0])},1.)`)},.T.)`), true]]);
        const flat = rows.add(`IFCCYLINDRICALSURFACE(#${rows.placement([0, 0, 0])},0.)`);
        const broken = rows.brep([rows.face([[ring, true]], flat)]);

        // Act & Assert
        expect(attempt(rows, broken)).toThrow("has no Radius above zero");
    });

    it("should fail with the reason the triangles give a brep with an edge on a polyline of one point, or on a spline surface whose rows differ", () => {
        // Arrange
        const rows = new Rows();
        const [start, end] = [rows.vertex(0, 0, 0), rows.vertex(1, 0, 0)];
        const lonely = rows.add(`IFCEDGECURVE(#${start},#${end},#${rows.add(`IFCPOLYLINE((#${rows.point(0, 0, 0)}))`)},.T.)`);
        const back = rows.line(end, start, [1, 0, 0], [0, 0, 0]);
        const onePoint = rows.brep([face(rows, [[lonely, true], [back, true]], plane(rows))]);
        const points = [rows.point(0, 0, 0), rows.point(0, 1, 0), rows.point(1, 0, 0)];
        const ragged = rows.add(`IFCBSPLINESURFACEWITHKNOTS(1,1,((#${points[0]},#${points[1]}),(#${points[2]})),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.)`);
        const raggedBrep = rows.brep([face(rows, [[rows.line(start, end, [0, 0, 0], [1, 0, 0]), true], [back, true]], ragged)]);

        // Act & Assert
        expect(attempt(rows, onePoint)).toThrow("bounds no area");
        expect(attempt(rows, raggedBrep)).toThrow();
    });
});
