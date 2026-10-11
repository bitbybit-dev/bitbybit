import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, ClassHandle, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { readKernelException } from "../kernel-exception";
import { OCCTSolid } from "./shapes";
import { OCCTIO } from "./io";
import * as Inputs from "../api/inputs";

const MISSING: unknown = undefined;
const STL_HEADER_BYTES = 80;
const STL_COUNT_BYTES = 4;
const STL_TRIANGLE_BYTES = 50;
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
    } catch {
        return created;
    } finally {
        originals.forEach(([name, original]) => Reflect.set(occt, name, original));
    }
    return created;
}

describe("OCCT io reading and writing STL and BREP", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let io: OCCTIO;
    let solid: OCCTSolid;

    const brick = (): TopoDS_Shape => solid.createBox({ width: 10, height: 20, length: 30, center: [5, 10, 15] });

    const boundsOf = (shape: TopoDS_Shape): { min: number[]; max: number[] } => {
        const bounds = occHelper.operationsService.boundingBoxOfShape({ shape });
        const rounded = (values: number[]): number[] => values.map(value => Math.round(value * 1e6) / 1e6 + 0);
        return { min: rounded(bounds.min), max: rounded(bounds.max) };
    };

    const binaryStlOf = (shape: TopoDS_Shape, adjustYtoZ = false): Uint8Array => {
        const stl = io.saveShapeStl({ shape, adjustYtoZ, binary: true });
        if (!(stl instanceof Uint8Array)) {
            throw new Error("expected the STL file as bytes");
        }
        return stl;
    };

    const outwardShareOf = (shape: TopoDS_Shape, center: number[]): number => {
        const mesh = occHelper.meshingService.shapeToMesh({ shape, precision: 0.01, adjustYtoZ: false });
        let outward = 0;
        let triangles = 0;
        mesh.faceList.forEach(face => {
            const corner = (index: number): number[] => [0, 1, 2].map(axis => face.vertexCoord[index * 3 + axis]!);
            for (let at = 0; at < face.triIndexes.length; at += 3) {
                const [a, b, c] = [corner(face.triIndexes[at]!), corner(face.triIndexes[at + 1]!), corner(face.triIndexes[at + 2]!)];
                const ab = [0, 1, 2].map(axis => b[axis]! - a[axis]!);
                const ac = [0, 1, 2].map(axis => c[axis]! - a[axis]!);
                const normal = [ab[1]! * ac[2]! - ab[2]! * ac[1]!, ab[2]! * ac[0]! - ab[0]! * ac[2]!, ab[0]! * ac[1]! - ab[1]! * ac[0]!];
                const away = [0, 1, 2].map(axis => (a[axis]! + b[axis]! + c[axis]!) / 3 - center[axis]!);
                outward += normal[0]! * away[0]! + normal[1]! * away[1]! + normal[2]! * away[2]! > 0 ? 1 : 0;
                triangles += 1;
            }
        });
        return outward / triangles;
    };

    const kernelMessageOf = (act: () => unknown): string => {
        try {
            act();
        } catch (thrown) {
            const read = readKernelException(occt, thrown);
            return read instanceof Error ? read.message : String(read);
        }
        return "no exception";
    };

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        io = new OCCTIO(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
    });

    describe("saveShapeStl in its binary form", () => {
        it("should write an 80 byte header, the triangle count and 50 bytes per triangle", () => {
            // Act
            const bytes = binaryStlOf(brick());

            // Assert
            expect(bytes.length).toBe(STL_HEADER_BYTES + STL_COUNT_BYTES + STL_TRIANGLE_BYTES * BOX_TRIANGLES);
            expect(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(STL_HEADER_BYTES, true)).toBe(BOX_TRIANGLES);
        });

        it("should write the corners where the shape has them", () => {
            // Arrange
            const bytes = binaryStlOf(brick());
            const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
            const corners: number[][] = [];
            for (let triangle = 0; triangle < BOX_TRIANGLES; triangle++) {
                for (let corner = 0; corner < 3; corner++) {
                    const at = STL_HEADER_BYTES + STL_COUNT_BYTES + triangle * STL_TRIANGLE_BYTES + 12 + corner * 12;
                    corners.push([view.getFloat32(at, true), view.getFloat32(at + 4, true), view.getFloat32(at + 8, true)]);
                }
            }

            // Act
            const distinct = new Set(corners.map(corner => corner.join(" ")));

            // Assert
            expect([...distinct].sort()).toEqual(["0 0 0", "0 0 30", "0 20 0", "0 20 30", "10 0 0", "10 0 30", "10 20 0", "10 20 30"]);
        });

        it("should swap y and z of an ASCII file when turning Y-up into Z-up, its triangles still facing out", () => {
            // Arrange
            const text = io.saveShapeStl({ shape: brick(), adjustYtoZ: true });

            // Act
            const mesh = io.loadStl({ stlData: text, asFaces: true, adjustZtoY: false });

            // Assert
            expect(boundsOf(mesh)).toEqual({ min: [0, 0, 0], max: [10, 30, 20] });
            expect(outwardShareOf(mesh, [5, 15, 10])).toBe(1);
        });

        it("should turn a face that carries only a mesh when turning Y-up into Z-up", () => {
            // Arrange
            const meshFace = io.loadStl({ stlData: binaryStlOf(brick()) });

            // Act
            const bytes = binaryStlOf(meshFace, true);

            // Assert
            expect(boundsOf(meshFace)).toEqual({ min: [0, 0, 0], max: [10, 30, 20] });
            expect(boundsOf(io.loadStl({ stlData: bytes, asFaces: true, adjustZtoY: false }))).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
        });

        it("should keep writing ASCII text by default", () => {
            // Act
            const stl = io.saveShapeStl({ shape: brick() });

            // Assert
            expect(typeof stl).toBe("string");
            expect(stl).toContain("facet normal");
        });

        it("should delete the writer and the mesher it makes, and leave no file behind", () => {
            // Arrange
            const shape = brick();

            // Act
            const created = tracked(occt, ["StlAPI_Writer", "BRepMesh_IncrementalMesh"], () => io.saveShapeStl({ shape, binary: true }));

            // Assert
            expect(created).toHaveLength(2);
            expect(created.filter(made => !made.isDeleted())).toEqual([]);
            expect(occt.FS.analyzePath("/x", false).exists).toBe(false);
        });

        it("should delete what it made and leave no file behind when a shape without faces cannot be written", () => {
            // Arrange
            const edge = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [1, 0, 0] });

            // Act
            const created = tracked(occt, ["StlAPI_Writer", "BRepMesh_IncrementalMesh"], () => io.saveShapeStl({ shape: edge, binary: true }));

            // Assert
            expect(() => io.saveShapeStl({ shape: edge, binary: true })).toThrow("Failed when writing stl file.");
            expect(created.filter(made => !made.isDeleted())).toEqual([]);
            expect(occt.FS.analyzePath("/x", false).exists).toBe(false);
        });
    });

    describe("loadStl", () => {
        it("should read a binary file into one planar face per triangle, sharing the edges of shared corners", () => {
            // Arrange
            const bytes = binaryStlOf(brick());

            // Act
            const mesh = io.loadStl({ stlData: bytes, asFaces: true, adjustZtoY: false });

            // Assert
            expect(occHelper.enumService.getShapeTypeEnum(mesh)).toBe(Inputs.OCCT.shapeTypeEnum.compound);
            expect([occt.FacesOf(mesh, false).length, occt.EdgesOf(mesh, true).length, occt.VerticesOf(mesh, true).length]).toEqual([12, 18, 8]);
            expect(boundsOf(mesh)).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
        });

        it("should read an ASCII file into one face that carries the whole mesh by default", () => {
            // Arrange
            const text = io.saveShapeStl({ shape: brick(), adjustYtoZ: true });

            // Act
            const mesh = io.loadStl({ stlData: text });

            // Assert
            expect(occHelper.enumService.getShapeTypeEnum(mesh)).toBe(Inputs.OCCT.shapeTypeEnum.face);
            expect(boundsOf(mesh)).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
        });

        it("should read the file's bytes handed over as an ArrayBuffer", () => {
            // Arrange
            const bytes = binaryStlOf(brick());

            // Act
            const mesh = io.loadStl({ stlData: bytes.slice().buffer, asFaces: true, adjustZtoY: false });

            // Assert
            expect(occt.FacesOf(mesh, false)).toHaveLength(12);
        });

        it("should give back what saveShapeStl wrote with Y-up turned into Z-up", () => {
            // Arrange
            const bytes = binaryStlOf(brick(), true);

            // Act
            const mesh = io.loadStl({ stlData: bytes, asFaces: true, adjustZtoY: true });

            // Assert
            expect(boundsOf(mesh)).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
        });

        it.each([
            ["binary, as faces", true, true],
            ["binary, as one mesh", true, false],
            ["ASCII, as faces", false, true],
            ["ASCII, as one mesh", false, false],
        ])("should keep every triangle facing out when it turns Z-up into Y-up, %s", (_name, binary, asFaces) => {
            // Arrange
            const stlData = binary ? binaryStlOf(brick()) : io.saveShapeStl({ shape: brick() });

            // Act
            const mesh = io.loadStl({ stlData, asFaces, adjustZtoY: true });

            // Assert
            expect(boundsOf(mesh)).toEqual({ min: [0, 0, 0], max: [10, 30, 20] });
            expect(outwardShareOf(mesh, [5, 15, 10])).toBe(1);
        });

        it("should leave the bytes it was given as they were", () => {
            // Arrange
            const bytes = binaryStlOf(brick());
            const before = bytes.slice();

            // Act
            io.loadStl({ stlData: bytes, adjustZtoY: true });

            // Assert
            expect(bytes).toEqual(before);
        });

        it("should refuse a file without triangles, as the kernel names it", () => {
            // Act
            const message = kernelMessageOf(() => io.loadStl({ stlData: "solid empty\nendsolid empty\n" }));

            // Assert
            expect(message).toBe("Standard_DomainError: ReadStlFromBytes: the file holds no mesh");
        });

        it("should refuse a Blob, which only the worker layer reads", () => {
            // Act
            const act = (): unknown => io.loadStl({ stlData: new Blob(["solid a\nendsolid a\n"]) });

            // Assert
            expect(act).toThrow(new InputError("`stlData` is not text or bytes: a File or Blob is read by the worker layer before the call reaches the kernel.", "stlData"));
        });
    });

    describe("saveShapeBrep and loadBrep", () => {
        it("should write a BREP text that reads back into a solid of the same size and place", () => {
            // Arrange
            const shape = brick();

            // Act
            const brep = io.saveShapeBrep({ shape });
            const copy = io.loadBrep({ brepData: brep });

            // Assert
            expect(brep).toMatch(/^\s*CASCADE Topology V\d/);
            expect(occHelper.enumService.getShapeTypeEnum(copy)).toBe(Inputs.OCCT.shapeTypeEnum.solid);
            expect(occHelper.solidsService.getSolidVolume({ shape: copy })).toBeCloseTo(6000, 9);
            expect(boundsOf(copy)).toEqual({ min: [0, 0, 0], max: [10, 20, 30] });
        });

        it("should keep the orientation of an inside-out solid", () => {
            // Arrange
            const insideOut = brick().Reversed();

            // Act
            const copy = io.loadBrep({ brepData: io.saveShapeBrep({ shape: insideOut }) });

            // Assert
            expect(occHelper.solidsService.getSolidVolume({ shape: copy })).toBeCloseTo(-6000, 9);
        });

        it("should read the text handed over as bytes, as the worker hands over a File", () => {
            // Arrange
            const bytes: unknown = new TextEncoder().encode(io.saveShapeBrep({ shape: brick() }));

            // Act
            const copy = io.loadBrep({ brepData: bytes as string });

            // Assert
            expect(occHelper.solidsService.getSolidVolume({ shape: copy })).toBeCloseTo(6000, 9);
        });

        it("should refuse a BREP text cut short, and the kernel should keep working afterwards", () => {
            // Arrange
            const brep = io.saveShapeBrep({ shape: brick() });

            // Act
            const act = (): unknown => io.loadBrep({ brepData: brep.slice(0, brep.length / 2) });

            // Assert
            expect(act).toThrow(new InputError("`brepData` is not a whole BREP file: its header, its table of shapes or the shape it names at the end is missing.", "brepData"));
            expect(occHelper.solidsService.getSolidVolume({ shape: brick() })).toBeCloseTo(6000, 9);
        });

        it("should refuse a BREP text whose shape refers to one not written before it, and the kernel should keep working afterwards", () => {
            // Arrange
            const brep = io.saveShapeBrep({ shape: brick() }).replace(/\n([-+])\d+ 0 ([-+]\d+ 0 \*)/, "\n$11 0 $2");

            // Act
            const act = (): unknown => io.loadBrep({ brepData: brep });

            // Assert
            expect(act).toThrow(new InputError("`brepData` is damaged: shape 3 refers to a shape not written before it.", "brepData"));
            expect(occHelper.solidsService.getSolidVolume({ shape: brick() })).toBeCloseTo(6000, 9);
        });

        it("should refuse a BREP text with a word where a number belongs instead of reading it forever", () => {
            // Arrange
            const whole = io.saveShapeBrep({ shape: brick() });
            const edge = whole.indexOf("\nEd\n");
            const curve = whole.indexOf("\n1  ", edge);
            const brep = `${whole.slice(0, curve + 1)}q${whole.slice(curve + 2)}`;

            // Act
            const act = (): unknown => io.loadBrep({ brepData: brep });

            // Assert
            expect(act).toThrow(new InputError("`brepData` is damaged: shape 3 is missing a value or has a word for a number.", "brepData"));
        });

        it("should refuse text that is not BREP at all", () => {
            // Act
            const act = (): unknown => io.loadBrep({ brepData: "hello" });

            // Assert
            expect(act).toThrow(InputError);
        });

        it("should refuse a whole BREP text of a version the reader does not know, since it holds no shape the reader can build", () => {
            // Arrange
            const brep = io.saveShapeBrep({ shape: brick() }).replace(/CASCADE Topology V\d/, "CASCADE Topology V9");

            // Act
            const act = (): unknown => io.loadBrep({ brepData: brep });

            // Assert
            expect(act).toThrow(new InputError("`brepData` holds no shape a BREP reader can build.", "brepData"));
        });

        it("should refuse to write a shape that is missing", () => {
            // Act
            const act = (): unknown => io.saveShapeBrep({ shape: MISSING as TopoDS_Shape });

            // Assert
            expect(act).toThrow(new InputError("`shape` is missing or empty, as an operation that failed can leave it.", "shape"));
        });
    });
});
