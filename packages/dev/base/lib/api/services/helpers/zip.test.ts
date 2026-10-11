import { crc32 as zlibCrc32, deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { crc32 } from "./crc32";
import { isZip, zipEntries, zipEntryData } from "./zip";

interface ArchivedFile {
    readonly name: string;
    readonly data: Uint8Array;
    readonly method?: number;
    readonly flags?: number;
    readonly crc?: number;
}

const encoder = new TextEncoder();
const HOUSE = encoder.encode("ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\n#1=IFCPROJECT('x',$,$,$,$,$,$,$,$);\nENDSEC;\nEND-ISO-10303-21;\n".repeat(20));

function uint16(value: number): number[] {
    return [value & 0xff, (value >>> 8) & 0xff];
}

function uint32(value: number): number[] {
    return [...uint16(value & 0xffff), ...uint16(value >>> 16)];
}

function archiveOf(files: readonly ArchivedFile[], comment = "", count = files.length): Uint8Array {
    const local: number[] = [];
    const central: number[] = [];
    for (const file of files) {
        const method = file.method ?? 8;
        const stored = method === 8 ? Array.from(deflateRawSync(file.data)) : Array.from(file.data);
        const name = Array.from(encoder.encode(file.name));
        const crc = file.crc ?? zlibCrc32(file.data);
        const shared = [...uint16(20), ...uint16(file.flags ?? 0), ...uint16(method), ...uint16(0), ...uint16(0), ...uint32(crc), ...uint32(stored.length), ...uint32(file.data.length), ...uint16(name.length), ...uint16(0)];
        central.push(...uint32(0x02014b50), ...uint16(20), ...shared, ...uint16(0), ...uint16(0), ...uint16(0), ...uint32(0), ...uint32(local.length), ...name);
        local.push(...uint32(0x04034b50), ...shared, ...name, ...stored);
    }
    const remark = Array.from(encoder.encode(comment));
    const end = [...uint32(0x06054b50), ...uint16(0), ...uint16(0), ...uint16(count), ...uint16(count), ...uint32(central.length), ...uint32(local.length), ...uint16(remark.length), ...remark];
    return Uint8Array.from([...local, ...central, ...end]);
}

describe("zipEntries and zipEntryData", () => {
    it("should list an archive's entries and read stored and deflated ones", () => {
        // Arrange
        const archive = archiveOf([{ name: "readme.txt", data: encoder.encode("hello"), method: 0 }, { name: "model/house.ifc", data: HOUSE }]);

        // Act
        const entries = zipEntries(archive);
        const contents = entries.map((entry) => zipEntryData(archive, entry));

        // Assert
        expect(entries.map((entry) => [entry.name, entry.method, entry.size, entry.encrypted])).toEqual([["readme.txt", 0, 5, false], ["model/house.ifc", 8, HOUSE.length, false]]);
        expect(contents.map((bytes) => Buffer.from(bytes).toString("utf8"))).toEqual(["hello", Buffer.from(HOUSE).toString("utf8")]);
    });

    it("should read names as UTF-8 when the entry says so, and byte by byte as Windows-1252 otherwise, and find the directory behind a comment", () => {
        // Arrange
        const archive = archiveOf([{ name: "Häuser.ifc", data: HOUSE, flags: 0x800 }, { name: "plain.ifc", data: HOUSE }], "made by a test");
        const latin = archiveOf([{ name: "Ä", data: HOUSE }]);

        // Act
        const names = zipEntries(archive).map((entry) => entry.name);
        const latinName = zipEntries(latin)[0]!.name;

        // Assert
        expect(names).toEqual(["Häuser.ifc", "plain.ifc"]);
        expect(latinName).toBe("Ã„");
    });

    it("should refuse an entry that fails its CRC-32, is encrypted or is compressed another way", () => {
        // Arrange
        const archive = archiveOf([
            { name: "corrupt.ifc", data: HOUSE, crc: 1 },
            { name: "locked.ifc", data: HOUSE, flags: 1 },
            { name: "bzip.ifc", data: HOUSE, method: 12 },
        ]);
        const [corrupt, locked, bzip] = zipEntries(archive);

        // Act & Assert
        expect(() => zipEntryData(archive, corrupt!)).toThrow("corrupt.ifc fails its CRC-32 check");
        expect(() => zipEntryData(archive, locked!)).toThrow("locked.ifc in the zip archive is encrypted");
        expect(() => zipEntryData(archive, bzip!)).toThrow("bzip.ifc is compressed with zip method 12; only stored and deflated entries are read");
    });

    it("should refuse an archive without its directory, a ZIP64 one, a corrupt directory and entries that run past the end", () => {
        // Arrange
        const archive = archiveOf([{ name: "house.ifc", data: HOUSE }]);
        const entry = zipEntries(archive)[0]!;

        // Act & Assert
        expect(() => zipEntries(HOUSE)).toThrow("The zip archive has no end of central directory record");
        expect(() => zipEntries(archiveOf([{ name: "house.ifc", data: HOUSE }], "", 0xffff))).toThrow("The zip archive is a ZIP64 archive, which is not read");
        expect(() => zipEntries(archiveOf([{ name: "house.ifc", data: HOUSE }], "", 2))).toThrow("The zip archive's central directory is corrupt at entry 1");
        expect(() => zipEntryData(archive, { ...entry, compressedSize: archive.length })).toThrow("house.ifc runs past the end of the zip archive");
        expect(() => zipEntryData(archive, { ...entry, localOffset: 4 })).toThrow("The zip archive's local header of house.ifc is missing");
        expect(() => zipEntryData(archive, { ...entry, method: 0, size: HOUSE.length })).toThrow(`house.ifc holds ${entry.compressedSize} bytes, not the ${HOUSE.length} its zip archive records`);
    });
});

describe("zipEntryData and archives cut short", () => {
    it("should refuse a local header that the archive ends in the middle of", () => {
        // Arrange
        const archive = archiveOf([{ name: "house.ifc", data: HOUSE }]);
        const entry = zipEntries(archive)[0]!;
        const signatureOnly = Uint8Array.from([...uint32(0x04034b50), ...new Array<number>(22).fill(0)]);

        // Act & Assert
        expect(() => zipEntryData(archive, { ...entry, localOffset: archive.length - 2 })).toThrow("The zip archive ends in the middle of a header");
        expect(() => zipEntryData(signatureOnly, { ...entry, localOffset: 0 })).toThrow("The zip archive ends in the middle of a header");
    });
});

describe("isZip", () => {
    it("should know an archive by its first local header", () => {
        // Assert
        expect([isZip(archiveOf([{ name: "a.ifc", data: HOUSE }])), isZip(HOUSE), isZip(new Uint8Array(2))]).toEqual([true, false, false]);
    });
});

describe("crc32", () => {
    it("should give zlib's CRC-32", () => {
        // Assert
        expect([crc32(HOUSE), crc32(new Uint8Array(0))]).toEqual([zlibCrc32(HOUSE), 0]);
    });
});
