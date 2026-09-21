import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
import { Inputs, OCCTService, OccHelper, VectorHelperService, ShapesHelperService } from "@bitbybit-dev/occt";
import { buildModel, clampParams, defaultParams, type BoxParams, type Occt } from "../src/model.ts";
import { partsOverlap, slotArea } from "../src/panels.ts";

interface BoxCheck {
    parts: number;
    fingers: Record<string, number>;
    dxfPaths: Record<string, number>;
    layout: { fits: boolean; usedWidth: number; usedHeight: number };
    handle: boolean;
    materialVolume: number;
    hollowBox: number;
    jointsClosed: boolean | string;
}

function inProcess(service: object): Occt {
    return service as Occt;
}

function pairs<T>(items: T[]): [T, T][] {
    return items.flatMap((a, i) => items.slice(i + 1).map((b): [T, T] => [a, b]));
}

const require = createRequire(import.meta.url);
const kernelDir = dirname(require.resolve("@bitbybit-dev/occt/bitbybit-dev-occt/index.js"));
const wasmFile = readdirSync(kernelDir).find((file) => file.endsWith(".wasm"));
if (!wasmFile) throw new Error(`no OCCT kernel (.wasm) found in ${kernelDir}`);
const occ = await initOpenCascade({ locateFile: (file: string) => (file.endsWith(".wasm") ? join(kernelDir, wasmFile) : file) });
const occt = inProcess(new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ)));

const round = (n: number): number => Math.round(n * 1000) / 1000;
const spans = (box: number[], expected: [number, number, number], slack: number): boolean => expected.every((value, i) => Math.abs((box[i] ?? Number.NaN) - value) <= slack);
const problems: string[] = [];

async function check(name: string, params: BoxParams): Promise<BoxCheck> {
    const p = clampParams(params);
    const model = await buildModel(occt, params);
    const expectedParts = p.lid ? 6 : 5;
    if (model.parts.length !== expectedParts) problems.push(`${name}: ${model.parts.length} parts, expected ${expectedParts}`);

    const dxfPaths: Record<string, number> = {};
    for (const part of model.parts) {
        if (await occt.shapes.shape.getShapeType({ shape: part.face }) !== Inputs.OCCT.shapeTypeEnum.face) problems.push(`${name}: part ${part.id} is not one planar face`);
        const paths = await occt.io.shapeToDxfPaths({ shape: part.flat, angularDeflection: 0.1, curvatureDeflection: 0.1, minimumOfPoints: 2, uTolerance: 1e-9, minimumLength: 1e-7 });
        dxfPaths[part.id] = paths.length;
        if (paths.length === 0) problems.push(`${name}: part ${part.id} produced no DXF path`);
    }

    for (const [a, b] of pairs(model.layout.parts)) {
        if (partsOverlap(a, b)) problems.push(`${name}: parts ${a.id} and ${b.id} overlap in the layout`);
    }

    const assembled = await occt.shapes.compound.makeCompound({ shapes: model.parts.map((part) => part.assembled) });
    const bbox = await occt.operations.boundingBoxOfShape({ shape: assembled });
    const expectedMin: [number, number, number] = [-p.length / 2, 0, -p.width / 2];
    const expectedMax: [number, number, number] = [p.length / 2, p.height, p.width / 2];
    const slack = p.kerf / 2 + 0.001;
    const within = spans(bbox.min, expectedMin, slack) && spans(bbox.max, expectedMax, slack);
    if (!within) problems.push(`${name}: the assembled box spans ${JSON.stringify([bbox.min.map(round), bbox.max.map(round)])}, expected ${JSON.stringify([expectedMin, expectedMax])}`);

    const volumes = await Promise.all(model.parts.map((part) => occt.shapes.solid.getSolidVolume({ shape: part.assembled })));
    const sum = volumes.reduce((a, b) => a + b, 0);
    const t = p.thickness;
    const handle = model.parts.reduce((total, part) => total + (part.slot ? slotArea(part.slot) * t : 0), 0);
    const hollowBox = p.length * p.width * p.height - (p.length - 2 * t) * (p.width - 2 * t) * (p.height - (p.lid ? 2 * t : t)) - handle;
    let jointsClosed: boolean | string = "not checked with a kerf";
    if (p.kerf === 0) {
        jointsClosed = Math.abs(sum - hollowBox) <= hollowBox * 1e-6;
        if (!jointsClosed) problems.push(`${name}: the panels do not tile the box: their volumes sum to ${round(sum)}, the hollow box less the handle is ${round(hollowBox)}`);
        for (const [a, b] of pairs(model.parts)) {
            const overlap = await occt.booleans.intersection({ shapes: [a.assembled, b.assembled], keepEdges: false });
            const shared = await occt.shapes.solid.getSolidVolume({ shape: overlap });
            if (shared > hollowBox * 1e-6) { jointsClosed = false; problems.push(`${name}: panels ${a.id} and ${b.id} share ${round(shared)} of volume`); }
        }
    }

    return {
        parts: model.parts.length,
        fingers: Object.fromEntries(model.parts.map((part) => [part.id, part.fingers])),
        dxfPaths,
        layout: { fits: model.layout.fits, usedWidth: round(model.layout.usedWidth), usedHeight: round(model.layout.usedHeight) },
        handle: model.parts.some((part) => part.slot),
        materialVolume: round(sum),
        hollowBox: round(hollowBox),
        jointsClosed,
    };
}

const summary = {
    template: "laser-cut-box",
    params: defaultParams,
    default: await check("default", defaultParams),
    noKerf: await check("noKerf", { ...defaultParams, kerf: 0 }),
    noLid: await check("noLid", { ...defaultParams, lid: false, kerf: 0 }),
    tall: await check("tall", { ...defaultParams, length: 60, width: 60, height: 200, thickness: 4, kerf: 0 }),
};
console.log(JSON.stringify(summary));

if (problems.length) {
    console.error(`smoke: ${problems.join("; ")}`);
    process.exit(1);
}
