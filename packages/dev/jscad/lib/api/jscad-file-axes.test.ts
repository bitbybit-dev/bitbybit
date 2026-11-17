import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { BaseBitByBit, Inputs as BaseInputs } from "@bitbybit-dev/base";
import { zipEntries, zipEntryData } from "@bitbybit-dev/base/lib/api/services/helpers/files/zip";
import { getJscad } from "./__test__/kernel";
import type { Jscad } from "./jscad-service";
import * as Inputs from "./inputs";

const { leftHanded, rightHanded } = BaseInputs.Base.coordinateSystemEnum;

type System = BaseInputs.Base.coordinateSystemEnum | undefined;
type Point = Inputs.Base.Point3;
type Triangle = [Point, Point, Point];
type Spans = [number, number][];

const AS_MODELLED: Spans = [[9.5, 10.5], [18.5, 21.5], [29, 31]];
const SYSTEMS: [string, System, Spans][] = [
    ["as it was modelled when no coordinate system is set", undefined, AS_MODELLED],
    ["with z up, y and z swapped, in a left-handed system", leftHanded, [[9.5, 10.5], [29, 31], [18.5, 21.5]]],
    ["with z up, turned about x, in a right-handed system", rightHanded, [[9.5, 10.5], [-31, -29], [18.5, 21.5]]],
];
const BOX_VOLUME = 6;

describe("the axes of the files JSCAD writes", () => {
    let jscad: Jscad;
    let box: Inputs.JSCAD.JSCADEntity;
    const base = new BaseBitByBit();

    beforeAll(async () => {
        ({ jscad } = await getJscad());
        box = jscad.shapes.cuboid(new Inputs.JSCAD.CuboidDto([10, 20, 30], 1, 2, 3));
    });

    afterEach(() => {
        jscad.settings = {};
    });

    const inSystem = (system: System): void => {
        jscad.settings = system === undefined ? {} : { coordinateSystem: system };
    };
    const rounded = (value: number): number => Math.round(value * 1e3) / 1e3 + 0;
    const spansOf = (triangles: Triangle[]): Spans => [0, 1, 2].map((axis): [number, number] => [
        rounded(Math.min(...triangles.flat().map(point => point[axis]!))),
        rounded(Math.max(...triangles.flat().map(point => point[axis]!))),
    ]);
    const volumeOf = (triangles: Triangle[]): number => rounded(base.mesh.signedVolume({ mesh: triangles }));
    const bytesOf = async (blob: Blob): Promise<Uint8Array> => new Uint8Array(await blob.arrayBuffer());
    const trianglesOfStl = (file: Uint8Array): Triangle[] => {
        const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
        const point = (at: number): Point => [view.getFloat32(at, true), view.getFloat32(at + 4, true), view.getFloat32(at + 8, true)];
        return Array.from({ length: view.getUint32(80, true) }, (_triangle, at): Triangle => {
            const first = 84 + at * 50 + 12;
            return [point(first), point(first + 12), point(first + 24)];
        });
    };
    const trianglesOfThreeMf = (file: Uint8Array): Triangle[][] => {
        const model = zipEntries(file).find(entry => entry.name.endsWith(".model"))!;
        const xml = new TextDecoder().decode(zipEntryData(file, model));
        return [...xml.matchAll(/<mesh>([\s\S]*?)<\/mesh>/g)].map(([, mesh]) => {
            const vertices = [...mesh!.matchAll(/<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"/g)].map(([, x, y, z]): Point => [Number(x), Number(y), Number(z)]);
            return [...mesh!.matchAll(/<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"/g)].map(([, a, b, c]): Triangle => [vertices[Number(a)]!, vertices[Number(b)]!, vertices[Number(c)]!]);
        });
    };
    const trianglesOfDxf = (text: string): Triangle[] => text.split("3DFACE").slice(1).map((face): Triangle => {
        const corner = (slot: number): Point => [1, 2, 3].map(axis => Number(new RegExp(`\\n\\s*${axis}${slot}\\n\\s*(\\S+)`).exec(face)![1])) as Point;
        return [corner(0), corner(1), corner(2)];
    });

    describe.each(SYSTEMS)("a solid written %s", (_name, system, spans) => {
        it("should stand so in an STL, its facets facing outward", async () => {
            // Arrange
            inSystem(system);

            // Act
            const file = trianglesOfStl(await bytesOf(jscad.downloadSolidSTL(new Inputs.JSCAD.DownloadSolidDto(box, "part")).blob));

            // Assert
            expect(spansOf(file)).toEqual(spans);
            expect(volumeOf(file)).toBe(BOX_VOLUME);
        });

        it("should stand so in an STL of several solids", async () => {
            // Arrange
            inSystem(system);

            // Act
            const file = trianglesOfStl(await bytesOf(jscad.downloadSolidsSTL(new Inputs.JSCAD.DownloadSolidsDto([box, box], "parts")).blob));

            // Assert
            expect(spansOf(file)).toEqual(spans);
            expect(volumeOf(file)).toBe(2 * BOX_VOLUME);
        });

        it("should stand so in a 3MF, alone and in a list", async () => {
            // Arrange
            inSystem(system);

            // Act
            const alone = trianglesOfThreeMf(await bytesOf(jscad.downloadGeometry3MF(new Inputs.JSCAD.DownloadGeometryDto(box, "part")).blob));
            const listed = trianglesOfThreeMf(await bytesOf(jscad.downloadGeometry3MF(new Inputs.JSCAD.DownloadGeometryDto([box, box], "parts")).blob));

            // Assert
            expect([alone, ...listed.map(object => [object])].map(objects => objects.map(spansOf))).toEqual([[spans], [spans], [spans]]);
            expect([...alone, ...listed].map(volumeOf)).toEqual([BOX_VOLUME, BOX_VOLUME, BOX_VOLUME]);
        });

        it("should stand so in a DXF, its faces facing outward", async () => {
            // Arrange
            inSystem(system);

            // Act
            const file = trianglesOfDxf(await jscad.downloadGeometryDxf(new Inputs.JSCAD.DownloadGeometryDto(box, "part")).blob.text());

            // Assert
            expect(spansOf(file)).toEqual(spans);
            expect(volumeOf(file)).toBe(BOX_VOLUME);
        });
    });

    it.each([
        ["a left-handed", leftHanded],
        ["a right-handed", rightHanded],
    ])("should write a flat drawing into a DXF as it is drawn in %s system", async (_name, system) => {
        // Arrange
        const drawing = jscad.polygon.rectangle(new Inputs.JSCAD.RectangleDto([3, 5], 2, 4));
        const before = await jscad.downloadGeometryDxf(new Inputs.JSCAD.DownloadGeometryDto(drawing, "drawing")).blob.text();
        inSystem(system);

        // Act
        const written = await jscad.downloadGeometryDxf(new Inputs.JSCAD.DownloadGeometryDto(drawing, "drawing")).blob.text();

        // Assert
        expect(written).toBe(before);
    });

    it("should leave the solid it wrote where it was", () => {
        // Arrange
        inSystem(leftHanded);
        const placeOfTheBox = (): Spans => spansOf(jscad.toPolygonPoints({ mesh: box }));
        const before = placeOfTheBox();

        // Act
        jscad.downloadSolidSTL(new Inputs.JSCAD.DownloadSolidDto(box, "part"));
        jscad.downloadGeometry3MF(new Inputs.JSCAD.DownloadGeometryDto(box, "part"));

        // Assert
        expect(placeOfTheBox()).toEqual(before);
        expect(before).toEqual(AS_MODELLED);
    });

    it("should refuse a name that is no setting and keep the settings it had", () => {
        // Arrange
        jscad.settings = { coordinateSystem: rightHanded };

        // Act & Assert
        expect(() => { jscad.settings = JSON.parse("{\"handedness\":\"right\"}"); }).toThrow("`handedness` is not a setting");
        expect(jscad.settings).toEqual({ coordinateSystem: "rightHanded" });
    });
});
