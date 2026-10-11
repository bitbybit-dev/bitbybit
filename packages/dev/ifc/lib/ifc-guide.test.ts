import { describe, it, expect, beforeAll, vi } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { IFCService } from "./api/ifc-service";

vi.mock("node:fs", async (importOriginal) => ({ ...await importOriginal<typeof import("node:fs")>(), writeFileSync: vi.fn() }));

const GUIDE = new URL("../../../../docs/learn/using-ai-with-bitbybit/ifc-models.md", import.meta.url);
const PACKAGE_ENTRY = fileURLToPath(new URL("./index.ts", import.meta.url));
const HOUSE_SECTION = "A house to start from";

function sectionCode(markdown: string, heading: string): string {
    const section = markdown.split(/^## /m).find((part) => part.startsWith(`${heading}\n`));
    const code = /```typescript\n([\s\S]*?)```/.exec(section ?? "")?.[1];
    if (code === undefined) {
        throw new Error(`the guide has no typescript block under "${heading}"`);
    }
    return code;
}

describe("the IFC guide's house to start from, run from the page", () => {
    const ifc = new IFCService();
    let written: unknown[];

    beforeAll(async () => {
        const code = sectionCode(readFileSync(GUIDE, "utf8"), HOUSE_SECTION).split("\"@bitbybit-dev/ifc\"").join(JSON.stringify(PACKAGE_ENTRY));
        const file = join(await mkdtemp(join(tmpdir(), "ifc-guide-")), "house.ts");
        await writeFile(file, code);
        await import(pathToFileURL(file).href);
        written = vi.mocked(writeFileSync).mock.calls.map((call) => call[0]);
    });

    it("should write one file, house.ifc", () => {
        // Assert
        expect(written).toEqual(["house.ifc"]);
    });

    it("should write the house the page describes: two storeys, eight joined walls, two windows, a door, two floors and a gabled roof of two planes, and one room", () => {
        // Arrange
        const bytes = vi.mocked(writeFileSync).mock.calls[0]?.[1];
        if (!(bytes instanceof Uint8Array)) {
            throw new Error("the house was not written as bytes");
        }

        // Act
        const model = ifc.model.read({ data: bytes });

        // Assert
        const summary = ifc.model.summary({ model });
        expect([summary.schema, summary.storeys.map((storey) => storey.name)]).toEqual(["IFC4", ["Ground floor", "First floor"]]);
        expect(summary.elementCounts).toMatchObject({ IfcWall: 8, IfcWindow: 2, IfcDoor: 1, IfcSlab: 4, IfcRoof: 1 });
        expect(ifc.spaces.list({ model }).map((space) => space.name)).toEqual(["0.01"]);
        expect(ifc.geometry.unsupported({ model })).toEqual([]);
    });
});
