import { describe, it, expect, beforeAll, vi } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "./occ-service";

vi.mock("node:fs", async (importOriginal) => ({ ...await importOriginal<typeof import("node:fs")>(), writeFileSync: vi.fn() }));

const GUIDE = new URL("../../../../docs/learn/using-ai-with-bitbybit/cad-geometry.md", import.meta.url);
const PART_SECTION = "A part to start from";
const PACKAGE_IMPORTS: readonly [string, string][] = [
    ["\"@bitbybit-dev/occt/bitbybit-dev-occt/index.js\"", JSON.stringify(fileURLToPath(new URL("../bitbybit-dev-occt/index.js", import.meta.url)))],
    ["\"@bitbybit-dev/occt\"", JSON.stringify(fileURLToPath(new URL("./index.ts", import.meta.url)))],
];

interface BracketModule {
    buildBracket(occt: OCCTService): Promise<TopoDS_Shape>;
}

function isBracketModule(value: unknown): value is BracketModule {
    return typeof value === "object" && value !== null && "buildBracket" in value && typeof value.buildBracket === "function";
}

function sectionBlocks(markdown: string, heading: string): string[] {
    const section = markdown.split(/^## /m).find((part) => part.startsWith(`${heading}\n`)) ?? "";
    return [...section.matchAll(/```typescript\n([\s\S]*?)```/g)].map((match) => match[1] ?? "");
}

function fromWorkspace(code: string): string {
    return PACKAGE_IMPORTS.reduce((text, [specifier, path]) => text.split(specifier).join(path), code);
}

describe("the geometry guide's part to start from, run from the page on the kernel", () => {
    let occt: OCCTService;
    let guide: string;
    let bracket: BracketModule;
    let directory: string;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
        guide = readFileSync(GUIDE, "utf8");
        const [part, runner] = sectionBlocks(guide, PART_SECTION);
        if (part === undefined || runner === undefined) {
            throw new Error(`the guide has no part and Node runner under "${PART_SECTION}"`);
        }
        directory = await mkdtemp(join(tmpdir(), "geometry-guide-"));
        await writeFile(join(directory, "bracket.ts"), part);
        await writeFile(join(directory, "runner.ts"), fromWorkspace(runner));
        const loaded: unknown = await import(pathToFileURL(join(directory, "bracket.ts")).href);
        if (!isBracketModule(loaded)) {
            throw new Error("the guide's part does not export buildBracket");
        }
        bracket = loaded;
    }, 120_000);

    it("should build the valid solid the page describes: its face count, its size and its volume", async () => {
        // Act
        const shape = await bracket.buildBracket(occt);

        // Assert
        const info = occt.shapes.solid.debugInfo({ shape });
        const size = occt.analysis.measure.tightBoundingBox({ shape }).size.map(Math.round);
        expect([info.valid, occt.shapeFix.isValid({ shape }), info.nbFaces, size]).toEqual([true, true, 18, [80, 28, 50]]);
        expect(info.volume).toBeCloseTo(36556.09, 1);
        expect(guide).toContain(`a valid solid of ${info.nbFaces} faces, ${size[0]} by ${size[1]} by ${size[2]} mm, of about ${Math.round(info.volume).toLocaleString("en-US")} mm³`);
    });

    it("should round the circle where the boss meets the plate, which the volume of the same part without the fillet shows", async () => {
        // Arrange
        const plate = occt.shapes.face.createFaceFromWire({ shape: occt.fillets.fillet2d({ shape: occt.shapes.wire.createRectangleWire({ width: 80, length: 50, center: [0, 0, 0], direction: [0, 1, 0] }), radius: 6 }), planar: true });
        const body = occt.booleans.union({ shapes: [occt.operations.extrude({ shape: plate, direction: [0, 8, 0] }), occt.shapes.solid.createCylinder({ radius: 12, height: 28, center: [0, 0, 0], direction: [0, 1, 0] })] });

        // Act
        const shape = await bracket.buildBracket(occt);

        // Assert
        const unrounded = occt.shapes.solid.getSolidVolume({ shape: body });
        const cut = 4 * Math.PI * 3.5 ** 2 * 8 + Math.PI * 6 ** 2 * 28;
        const fillet = occt.shapes.solid.getSolidVolume({ shape }) - (unrounded - cut);
        expect(fillet).toBeGreaterThan(100);
        expect(fillet).toBeLessThan(200);
    });

    it("should run the page's Node runner, which writes the bracket as STEP standing upright, Z along the boss", async () => {
        // Act
        await import(pathToFileURL(join(directory, "runner.ts")).href);

        // Assert
        const [name, text] = vi.mocked(writeFileSync).mock.calls[0] ?? [];
        if (typeof text !== "string") {
            throw new Error("the runner wrote no STEP text");
        }
        const reloaded = occt.io.loadSTEPorIGES({ filetext: text, fileName: "bracket.step", adjustZtoY: false });
        if (reloaded === undefined) {
            throw new Error("the runner's STEP file could not be read back");
        }
        const box = occt.analysis.measure.tightBoundingBox({ shape: reloaded });
        expect(name).toBe("bracket.step");
        expect(box.size.map(Math.round)).toEqual([80, 50, 28]);
        expect(box.min[2]).toBeCloseTo(0, 3);
        expect(box.max[2]).toBeCloseTo(28, 3);
        expect(occt.shapes.solid.getSolidVolume({ shape: reloaded })).toBeCloseTo(36556.09, 1);
    });
});
