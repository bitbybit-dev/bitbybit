import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, ClassHandle, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTSolid } from "./shapes";
import { OCCTIO } from "./io";

const MISSING: unknown = undefined;
const BOX_CORNERS_PER_FACE = 4;
const BOX_FACES = 6;
const BOX_TRIANGLES = 12;

function tracked(occt: BitbybitOcctModule, names: string[], act: () => unknown): ClassHandle[] {
    const created: ClassHandle[] = [];
    const originals = names.map(name => [name, Reflect.get(occt, name)] as const);
    originals.forEach(([name, original]) => Reflect.set(occt, name, new Proxy(original, {
        construct(target, args): object {
            const made: ClassHandle = Reflect.construct(target, args);
            created.push(made);
            return made;
        },
    })));
    try {
        act();
    } finally {
        originals.forEach(([name, original]) => Reflect.set(occt, name, original));
    }
    return created;
}

function returnedBy(occt: BitbybitOcctModule, name: string, act: () => unknown): ClassHandle[] {
    const returned: ClassHandle[] = [];
    const original: unknown = Reflect.get(occt, name);
    Reflect.set(occt, name, new Proxy(original as (...args: unknown[]) => ClassHandle, {
        apply(target, thisArg, args): ClassHandle {
            const made = Reflect.apply(target, thisArg, args);
            returned.push(made);
            return made;
        },
    }));
    try {
        act();
    } finally {
        Reflect.set(occt, name, original);
    }
    return returned;
}

describe("OCCT io writing OBJ and PLY", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let io: OCCTIO;
    let solid: OCCTSolid;

    const brick = (): TopoDS_Shape => solid.createBox({ width: 10, height: 20, length: 30, center: [5, 10, 15] });

    const numbersOnLines = (text: string, prefix: string): number[][] => text.split("\n")
        .filter(line => line.startsWith(prefix))
        .map(line => line.slice(prefix.length).trim().split(/\s+/).map(Number));

    const plyVertices = (ply: string): number[][] => {
        const lines = ply.split("\n");
        const count = Number(/^element vertex (\d+)$/m.exec(ply)?.[1]);
        const start = lines.indexOf("end_header") + 1;
        return lines.slice(start, start + count).map(line => line.trim().split(/\s+/).map(Number));
    };

    const plyOutwardShare = (ply: string, center: number[]): number => {
        const lines = ply.split("\n");
        const count = Number(/^element vertex (\d+)$/m.exec(ply)?.[1]);
        const faces = Number(/^element face (\d+)$/m.exec(ply)?.[1]);
        const start = lines.indexOf("end_header") + 1;
        const corners = plyVertices(ply).map(vertex => vertex.slice(0, 3));
        const outward = lines.slice(start + count, start + count + faces).filter(line => {
            const [a, b, c] = line.trim().split(/\s+/).slice(1, 4).map(index => corners[Number(index)]!);
            const ab = [0, 1, 2].map(axis => b![axis]! - a![axis]!);
            const ac = [0, 1, 2].map(axis => c![axis]! - a![axis]!);
            const normal = [ab[1]! * ac[2]! - ab[2]! * ac[1]!, ab[2]! * ac[0]! - ab[0]! * ac[2]!, ab[0]! * ac[1]! - ab[1]! * ac[0]!];
            const away = [0, 1, 2].map(axis => (a![axis]! + b![axis]! + c![axis]!) / 3 - center[axis]!);
            return normal[0]! * away[0]! + normal[1]! * away[1]! + normal[2]! * away[2]! > 0;
        });
        return outward.length / faces;
    };

    const rounded = (value: number): number => Math.round(value * 1e6) / 1e6 + 0;

    const spans = (points: number[][]): number[][] => [0, 1, 2].map(axis => [
        rounded(Math.min(...points.map(point => point[axis]!))),
        rounded(Math.max(...points.map(point => point[axis]!))),
    ]);

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        io = new OCCTIO(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
    });

    describe("saveShapeObj", () => {
        it("should write four corners per face of a box inside the box, named after the file, with no material library", () => {
            // Act
            const files = io.saveShapeObj({ shape: brick(), fileName: "brick.obj", precision: 0.01, adjustYtoZ: false });

            // Assert
            const corners = numbersOnLines(files.obj, "v ");
            expect(corners).toHaveLength(BOX_CORNERS_PER_FACE * BOX_FACES);
            expect(spans(corners)).toEqual([[0, 10], [0, 20], [0, 30]]);
            expect(files.obj).toMatch(/^g brick$/m);
            expect(files.obj).not.toMatch(/^mtllib /m);
            expect(files.mtl).toBe("");
        });

        it("should swap y and z when turning Y-up into Z-up", () => {
            // Act
            const files = io.saveShapeObj({ shape: brick(), adjustYtoZ: true });

            // Assert
            expect(spans(numbersOnLines(files.obj, "v "))).toEqual([[0, 10], [0, 30], [0, 20]]);
        });

        it.each([
            ["a space", "my brick.obj"],
            ["a slash", "parts/brick.obj"],
            ["nothing but its extension", ".."],
        ])("should refuse a file name with %s, which the material library line cannot hold", (_name, fileName) => {
            // Act
            const act = (): unknown => io.saveShapeObj({ shape: brick(), fileName });

            // Assert
            expect(act).toThrow(new InputError(`\`fileName\` must be a file name without spaces or slashes, since the OBJ file names its material library after it; it is ${JSON.stringify(fileName)}.`, "fileName"));
        });

        it("should refuse a precision the mesher cannot work to", () => {
            // Act
            const act = (): unknown => io.saveShapeObj({ shape: brick(), precision: 0 });

            // Assert
            expect(act).toThrow(new InputError("`precision` must be a finite number 1e-7 or more; it is 0.", "precision"));
        });

        it("should refuse a shape that is missing", () => {
            // Act
            const act = (): unknown => io.saveShapeObj({ shape: MISSING as TopoDS_Shape });

            // Assert
            expect(act).toThrow(new InputError("`shape` is missing or empty, as an operation that failed can leave it.", "shape"));
        });
    });

    describe("saveShapePly", () => {
        it("should write an ASCII PLY of a box, four corners per face and two triangles per face, all inside the box", () => {
            // Act
            const ply = io.saveShapePly({ shape: brick(), fileName: "brick.ply", precision: 0.01, adjustYtoZ: false });

            // Assert
            expect(ply.split("\n").slice(0, 2)).toEqual(["ply", "format ascii 1.0"]);
            expect(ply).toMatch(new RegExp(`^element vertex ${BOX_CORNERS_PER_FACE * BOX_FACES}$`, "m"));
            expect(ply).toMatch(new RegExp(`^element face ${BOX_TRIANGLES}$`, "m"));
            expect(spans(plyVertices(ply).map(vertex => vertex.slice(0, 3)))).toEqual([[0, 10], [0, 20], [0, 30]]);
        });

        it("should swap y and z when turning Y-up into Z-up, by default not turning at all", () => {
            // Act
            const turned = io.saveShapePly({ shape: brick(), adjustYtoZ: true });
            const asItIs = io.saveShapePly({ shape: brick() });

            // Assert
            expect(spans(plyVertices(turned).map(vertex => vertex.slice(0, 3)))).toEqual([[0, 10], [0, 30], [0, 20]]);
            expect(spans(plyVertices(asItIs).map(vertex => vertex.slice(0, 3)))).toEqual([[0, 10], [0, 20], [0, 30]]);
        });

        it("should keep the triangles facing out when it turns Y-up into Z-up, a face that carries only a mesh included", () => {
            // Arrange
            const meshFace = io.loadStl({ stlData: io.saveShapeStl({ shape: brick() }), adjustZtoY: false });

            // Act
            const plies = [io.saveShapePly({ shape: brick(), adjustYtoZ: true }), io.saveShapePly({ shape: meshFace, adjustYtoZ: true })];

            // Assert
            plies.forEach(ply => {
                expect(spans(plyVertices(ply).map(vertex => vertex.slice(0, 3)))).toEqual([[0, 10], [0, 30], [0, 20]]);
                expect(plyOutwardShare(ply, [5, 15, 10])).toBe(1);
            });
        });

        it("should delete the placement it makes to turn Y-up into Z-up", () => {
            // Arrange
            const shape = brick();

            // Act
            const created = tracked(occt, ["gp_Trsf", "TopLoc_Location"], () => io.saveShapePly({ shape, adjustYtoZ: true }));

            // Assert
            expect(created).toHaveLength(2);
            expect(created.filter(made => !made.isDeleted())).toEqual([]);
        });

        it("should mesh at its own precision and leave the mesh the shape already had", () => {
            // Arrange
            const triangles = (ply: string): number => Number(/^element face (\d+)$/m.exec(ply)?.[1]);
            const drawn = solid.createSphere({ radius: 5, center: [0, 0, 0] });
            const fine = new occt.BRepMesh_IncrementalMesh(drawn, 0.01, false, 0.5, false);
            const face = occHelper.shapeGettersService.getFaces({ shape: drawn })[0]!;
            const trianglesDrawn = occt.GetFaceTriangulation(face).NbTriangles();
            const coarseFromScratch = triangles(io.saveShapePly({ shape: solid.createSphere({ radius: 5, center: [0, 0, 0] }), precision: 1 }));

            // Act
            const coarse = triangles(io.saveShapePly({ shape: drawn, precision: 1 }));

            // Assert
            expect(coarse).toBe(coarseFromScratch);
            expect(coarse).toBeLessThan(trianglesDrawn);
            expect(occt.GetFaceTriangulation(face).NbTriangles()).toBe(trianglesDrawn);
            fine.delete();
        });

        it("should delete the document it writes through", () => {
            // Arrange
            const shape = brick();

            // Act
            const documents = returnedBy(occt, "BuildAssemblyDocument", () => io.saveShapePly({ shape }));

            // Assert
            expect(documents).toHaveLength(1);
            expect(documents.filter(document => !document.isDeleted())).toEqual([]);
        });

        it("should refuse a precision below the smallest the mesher takes", () => {
            // Act
            const act = (): unknown => io.saveShapePly({ shape: brick(), precision: 1e-8 });

            // Assert
            expect(act).toThrow(new InputError("`precision` must be a finite number 1e-7 or more; it is 1e-8.", "precision"));
        });
    });
});
