import { crc32 as zlibCrc32, deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { crc32 } from "./crc32";
import { dosDateTime, isZip, zipEntries, zipEntryData, zipStored, zipStoredBlob, zipStoredParts } from "./zip";

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

describe("zipStored", () => {
    it("should write an archive the reader takes back whole, every entry passing its CRC-32", () => {
        // Arrange
        const files = [
            { name: "screenshot-front.jpg", data: Uint8Array.from([0xff, 0xd8, 0xff, 0x00]) },
            { name: "model/house.ifc", data: HOUSE },
            { name: "empty.txt", data: new Uint8Array(0) },
        ];

        // Act
        const archive = zipStored(files);
        const entries = zipEntries(archive);

        // Assert
        expect(isZip(archive)).toBe(true);
        expect(entries.map((entry) => [entry.name, entry.method, entry.size, entry.compressedSize])).toEqual([
            ["screenshot-front.jpg", 0, 4, 4],
            ["model/house.ifc", 0, HOUSE.length, HOUSE.length],
            ["empty.txt", 0, 0, 0],
        ]);
        expect(entries.map((entry) => Array.from(zipEntryData(archive, entry)))).toEqual(files.map((file) => Array.from(file.data)));
    });

    it("should mark its names as UTF-8 so a name in any alphabet survives", () => {
        // Act
        const entries = zipEntries(zipStored([{ name: "nuotrauka-\u0161onas.png", data: HOUSE }]));

        // Assert
        expect(entries.map((entry) => entry.name)).toEqual(["nuotrauka-\u0161onas.png"]);
    });

    it("should write a valid empty archive", () => {
        // Act
        const archive = zipStored([]);

        // Assert
        expect(archive.length).toBe(22);
        expect(zipEntries(archive)).toEqual([]);
    });

    it("should give the same bytes from its parts as whole, so a caller may hold the data in any container", () => {
        // Arrange
        const modified = new Date(2026, 9, 28, 17, 45, 31);
        const data = HOUSE.subarray(0, 64);

        // Act
        const whole = zipStored([{ name: "a.bin", data }], modified);
        const parts = zipStoredParts([{ name: "a.bin", size: data.length, crc32: crc32(data), data }], modified);
        const joined = Uint8Array.from(parts.flatMap((part) => Array.from(part)));

        // Assert
        expect(Array.from(joined)).toEqual(Array.from(whole));
    });
});

describe("zipStoredBlob", () => {
    it("should hand over the same archive as a Blob, so a browser can download it without another copy in memory", async () => {
        // Arrange
        const modified = new Date(2026, 9, 28, 17, 45, 31);
        const files = [{ name: "front.jpg", data: Uint8Array.from([0xff, 0xd8, 0xff, 0x00]) }, { name: "side.png", data: HOUSE.subarray(0, 32) }];

        // Act
        const blob = zipStoredBlob(files, modified);
        const bytes = new Uint8Array(await blob.arrayBuffer());

        // Assert
        expect(blob.type).toBe("application/zip");
        expect(Array.from(bytes)).toEqual(Array.from(zipStored(files, modified)));
    });
});

describe("zipStoredParts limits", () => {
    it("should refuse an entry name that would climb out of the folder it is extracted to, or be read as a different path", () => {
        // Arrange
        const data = new Uint8Array(1);
        const unsafe = ["../evil.png", "a/../../evil.png", "/etc/passwd", "C:/x.png", "a\\b.png", "", "bad\u0007name.png"];

        // Act
        const refusals = unsafe.map((name) => {
            try {
                zipStored([{ name, data }]);
                return "written";
            } catch {
                return "refused";
            }
        });

        // Assert
        expect(refusals).toEqual(unsafe.map(() => "refused"));
        expect(zipEntries(zipStored([{ name: "views/front..side.png", data }])).map((entry) => entry.name)).toEqual(["views/front..side.png"]);
    });

    it("should refuse what only ZIP64 can hold, instead of writing an archive that lies about its sizes", () => {
        // Arrange
        const tooBig = [{ name: "a.bin", size: 0xffffffff, crc32: 0, data: "" }];
        const tooMany = Array.from({ length: 0xffff }, (_, index) => ({ name: `${index}.bin`, size: 0, crc32: 0, data: "" }));

        // Act & Assert
        expect(() => zipStoredParts(tooBig)).toThrow("4 GB");
        expect(() => zipStoredParts(tooMany)).toThrow("entries");
    });
});

describe("dosDateTime", () => {
    it("should pack the local date and time the way zip tools read them, and hold dates before 1980 at 1980", () => {
        // Act
        const stamp = dosDateTime(new Date(2026, 9, 28, 17, 45, 31));
        const early = dosDateTime(new Date(1970, 0, 1, 0, 0, 0));

        // Assert
        expect(stamp).toEqual({ date: ((2026 - 1980) << 9) | (10 << 5) | 28, time: (17 << 11) | (45 << 5) | 15 });
        expect(early.date >> 9).toBe(0);
    });
});
