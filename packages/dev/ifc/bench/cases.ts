import type { Base } from "@bitbybit-dev/base";
import type { IfcModel } from "../index";
import { IFC, IFCService } from "../index";
import type { BenchCase } from "./bench-types";

const ifc = new IFCService();
const STOREYS = 10;
const STOREY_HEIGHT = 3000;
const BAYS = 10;
const BAY = 6000;
const DEPTH = 12000;
const POINT_ROWS = 200000;
const TIME_STAMP = "2026-10-07T12:00:00";

function corners(): Base.Point2[] {
    return [[0, 0], [BAYS * BAY, 0], [BAYS * BAY, DEPTH], [0, DEPTH]];
}

function author(): IfcModel {
    let model = ifc.model.create({ name: "Block", seed: "bench-block" });
    model = ifc.windows.addType({ model, id: "window", width: 1200, height: 1500 });
    for (let level = 0; level < STOREYS; level++) {
        const storey = `storey-${level}`;
        model = ifc.spatial.addStorey({ model, id: storey, elevation: level * STOREY_HEIGHT });
        const outline = corners();
        for (let side = 0; side < outline.length; side++) {
            model = ifc.walls.add({ model, storey, id: `${storey}-outer-${side}`, start: outline[side]!, end: outline[(side + 1) % outline.length]!, height: STOREY_HEIGHT, thickness: 300, alignment: IFC.wallAlignmentEnum.left });
        }
        for (let side = 0; side < outline.length; side++) {
            model = ifc.walls.connect({ model, wall: `${storey}-outer-${side}`, other: `${storey}-outer-${(side + 1) % outline.length}` });
        }
        for (let bay = 1; bay < BAYS; bay++) {
            const wall = `${storey}-party-${bay}`;
            model = ifc.walls.add({ model, storey, id: wall, start: [bay * BAY, DEPTH], end: [bay * BAY, 0], height: STOREY_HEIGHT, thickness: 200 });
            model = ifc.walls.connect({ model, wall, other: `${storey}-outer-0` });
        }
        for (let bay = 0; bay < BAYS; bay++) {
            model = ifc.windows.add({ model, wall: `${storey}-outer-0`, windowType: "window", offset: bay * BAY + 2000 });
            model = ifc.windows.add({ model, wall: `${storey}-outer-2`, windowType: "window", offset: bay * BAY + 2000 });
        }
        model = ifc.slabs.add({ model, storey, id: `${storey}-floor`, outline, thickness: 250 });
    }
    return model;
}

let built: IfcModel | undefined;
let written: string | undefined;

function block(): IfcModel {
    built ??= author();
    return built;
}

function blockText(): string {
    written ??= ifc.model.write({ model: block(), timeStamp: TIME_STAMP });
    return written;
}

function pointFile(): string {
    const rows = Array.from({ length: POINT_ROWS }, (_, index) => `#${index + 1}=IFCCARTESIANPOINT((${index}.,${index * 2}.,0.));`);
    return ["ISO-10303-21;", "HEADER;", "FILE_DESCRIPTION((''),'2;1');", "FILE_NAME('','',(''),(''),'','','');", "FILE_SCHEMA(('IFC4'));", "ENDSEC;", "DATA;", ...rows, "ENDSEC;", "END-ISO-10303-21;", ""].join("\n");
}

const points = pointFile();
const COPIES = 40;
const SHARED_ROWS = /^#\d+=(IFCPROJECT|IFCUNITASSIGNMENT|IFCSIUNIT|IFCGEOMETRICREPRESENTATIONCONTEXT|IFCGEOMETRICREPRESENTATIONSUBCONTEXT)\(/;
const GLOBAL_ID_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";

function idOf(row: string): number {
    return Number(row.slice(1, row.indexOf("=")));
}

function replicated(text: string, copies: number): Uint8Array {
    const dataStart = text.indexOf("DATA;") + "DATA;".length;
    const rows = text.slice(dataStart, text.lastIndexOf("ENDSEC;")).split("\n").filter((row) => row.startsWith("#"));
    const shared = new Set(rows.filter((row) => SHARED_ROWS.test(row)).map(idOf));
    const step = Math.max(...rows.map(idOf));
    const out = [text.slice(0, dataStart), ...rows];
    for (let copy = 1; copy < copies; copy++) {
        for (const row of rows.filter((candidate) => !SHARED_ROWS.test(candidate))) {
            const shifted = row.replace(/#(\d+)/g, (_, id: string) => `#${shared.has(Number(id)) ? id : Number(id) + copy * step}`);
            out.push(shifted.replace(/^(#\d+=[A-Z0-9]+\('.)../, (_, head: string) => `${head}${GLOBAL_ID_ALPHABET[copy >> 6]}${GLOBAL_ID_ALPHABET[copy & 63]}`));
        }
    }
    return new TextEncoder().encode([...out, "ENDSEC;", "END-ISO-10303-21;", ""].join("\n"));
}

let large: Uint8Array | undefined;

function largeFile(): Uint8Array {
    large ??= replicated(blockText(), COPIES);
    return large;
}

export const benchCases: BenchCase[] = [
    { name: "author a 10-storey block: 130 joined walls, 200 windows, 10 slabs", budgetMs: 500, run: () => [ifc.model.summary({ model: author() }).entities] },
    { name: "write the block", budgetMs: 100, run: () => [ifc.model.write({ model: block(), timeStamp: TIME_STAMP }).length] },
    {
        name: "read the block back and decode every entity",
        budgetMs: 200,
        run: () => {
            const model = ifc.model.read({ data: blockText() });
            return [model.ids().reduce((count, id) => count + (model.entity(id).args.length > 0 ? 1 : 0), 0)];
        },
    },
    { name: "read the block and describe it as a recipe", budgetMs: 500, run: () => [ifc.geometry.recipe({ model: ifc.model.read({ data: blockText() }) }).roots.length] },
    { name: "measure the block's quantities", budgetMs: 1200, run: () => [ifc.model.summary({ model: ifc.quantities.compute({ model: block() }) }).entities] },
    {
        name: "make the party walls of every storey thicker",
        budgetMs: 200,
        run: () => {
            let model = block();
            for (let level = 0; level < STOREYS; level++) {
                for (let bay = 1; bay < BAYS; bay += 2) {
                    model = ifc.walls.edit({ model, wall: `storey-${level}-party-${bay}`, thickness: 250 });
                }
            }
            return [ifc.model.summary({ model }).entities];
        },
    },
    {
        name: `read ${COPIES} copies of the block, thicken a joined wall and write the file's bytes`,
        budgetMs: 4500,
        run: () => {
            const model = ifc.model.read({ data: largeFile() });
            const edited = ifc.walls.edit({ model, wall: "storey-5-outer-0", thickness: 350 });
            return [model.ids().length, ifc.model.writeBytes({ model: edited, timeStamp: TIME_STAMP }).length];
        },
    },
    { name: "index a 200,000-row file and decode every row", budgetMs: 3500, run: () => {
        const model = ifc.model.read({ data: points });
        return [model.ids().reduce((sum, id) => sum + (model.entity(id).args.length), 0)];
    } },
];
