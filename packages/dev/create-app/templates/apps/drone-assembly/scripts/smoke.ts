import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
import { OCCTService, OccHelper, VectorHelperService, ShapesHelperService } from "@bitbybit-dev/occt";
import { billOfMaterials, buildDocument, expectedPlacements, Z_UP } from "../src/assembly.ts";
import type { Occt, Shape } from "../src/kernel.ts";
import { buildModel, defaultParams, layout, maxPropDiameter, type ArmCount, type DroneParams } from "../src/model.ts";
import { armCutouts, armRootWidth, FRAME, MOTOR_TOP } from "../src/parts.ts";

interface PartStats {
    solids: number;
    faces: number;
    edges: number;
    volume: number;
}

type Solids = Awaited<ReturnType<Occt["shapes"]["solid"]["getSolids"]>>;

function inProcess(service: object): Occt {
    return service as Occt;
}

function asShape(loaded: object): Shape {
    return loaded as Shape;
}

const require = createRequire(import.meta.url);
const kernelDir = dirname(require.resolve("@bitbybit-dev/occt/bitbybit-dev-occt/index.js"));
const wasmFile = readdirSync(kernelDir).find((file) => file.endsWith(".wasm"));
if (!wasmFile) throw new Error(`no OCCT kernel (.wasm) found in ${kernelDir}`);
const kernelOptions = { locateFile: (file: string): string => (file.endsWith(".wasm") ? join(kernelDir, wasmFile) : file), print: (): void => undefined };
const occ = await initOpenCascade(kernelOptions);
const service = new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ));
const occt = inProcess(service);

const LOGO_URL = "https://git-cdn.bitbybit.dev/latest/assets/logo/logo-faces.stp";
const round = (n: number): number => Math.round(n * 1000) / 1000;
const problems: string[] = [];

async function fetchLogo(): Promise<Shape | undefined> {
    try {
        const response = await fetch(LOGO_URL, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) return undefined;
        const loaded = service.io.loadSTEPorIGES({ filetext: await response.text(), fileName: "logo-faces.stp", adjustZtoY: true });
        return loaded ? asShape(loaded) : undefined;
    } catch {
        return undefined;
    }
}

const logo = await fetchLogo();
const started = Date.now();
const model = await buildModel(occt, defaultParams, logo);
const partsMs = Date.now() - started;

const solidsOf = (shape: Shape): Promise<Solids> => occt.shapes.solid.getSolids({ shape });

const parts: Record<string, PartStats> = {};
for (const part of model.parts) {
    const solids = await solidsOf(part.shape);
    const edges = (await occt.shapes.edge.getEdges({ shape: part.shape })).length;
    const volumes = await occt.shapes.solid.getSolidsVolumes({ shapes: solids });
    const volume = volumes.reduce((sum, v) => sum + v, 0);
    if (part.kind === "wires") {
        if (solids.length !== 0) problems.push(`${part.id} is a wire part but carries solids`);
        if (edges === 0) problems.push(`${part.id} has no edges`);
    } else {
        if (solids.length === 0) problems.push(`${part.id} has no solid`);
        const infos = await Promise.all(solids.map((solid) => occt.shapes.solid.debugInfo({ shape: solid })));
        if (!infos.every((info) => info.valid)) problems.push(`${part.id} is not a valid solid`);
        if (!(volume > 0)) problems.push(`${part.id} has no volume`);
    }
    parts[part.id] = { solids: solids.length, faces: (await occt.shapes.face.getFaces({ shape: part.shape })).length, edges, volume: round(volume) };
}
if (logo && !model.parts.some((part) => part.id === "emblem")) problems.push("the logo was fetched but no emblem was built");

const statsOf = (id: string): PartStats => {
    const stats = parts[id];
    if (!stats) throw new Error(`no ${id} part was built`);
    return stats;
};
const roundedRectArea = (width: number, length: number, corner: number): number => width * length - (4 - Math.PI) * corner * corner;
const hexagonArea = (radius: number): number => (3 * Math.sqrt(3) / 2) * radius * radius;
const plateUncut = (roundedRectArea(FRAME.plate.width, FRAME.plate.length, FRAME.plate.corner) - 4 * Math.PI * FRAME.plate.openingRadius ** 2) * FRAME.plate.thickness;
if (!(statsOf("plate").volume < plateUncut - 1)) problems.push(`the plate's openings or honeycomb were not cut: volume ${statsOf("plate").volume} is not below ${round(plateUncut)}`);
const rootWidth = armRootWidth(model.params.arms);
const tipX = model.params.armLength - FRAME.arm.padRadius + 3;
const armPlan = ((rootWidth + FRAME.arm.tipWidth) / 2) * (tipX - FRAME.armRoot) + Math.PI * FRAME.arm.padRadius ** 2;
const armCut = armCutouts(model.params.armLength, rootWidth).reduce((sum, cutout) => sum + hexagonArea(cutout.radius), 0);
if (!(statsOf("arm").volume < (armPlan - armCut * 0.9) * FRAME.arm.height)) problems.push(`the arm's cutouts were not cut: volume ${statsOf("arm").volume} is not below ${round((armPlan - armCut * 0.9) * FRAME.arm.height)}`);
if (logo) {
    const logoArea = statsOf("emblem").volume / FRAME.emblem.thickness / FRAME.emblem.inset ** 2;
    const hatchExpected = (roundedRectArea(FRAME.hatch.width, FRAME.hatch.length, FRAME.hatch.corner) - logoArea) * FRAME.hatch.thickness;
    if (Math.abs(statsOf("hatch").volume - hatchExpected) > hatchExpected * 0.01) problems.push(`the logo is not cut through the hatch: volume ${statsOf("hatch").volume}, expected ${round(hatchExpected)}`);
}

const layouts: Record<string, { instances: number; bolts: number; propDiameter: number }> = {};
for (const arms of [4, 6, 8] as ArmCount[]) {
    const params: DroneParams = { ...defaultParams, arms };
    const placed = layout(params, logo !== undefined);
    const expected = (logo ? 39 : 38) + 15 * arms;
    if (placed.counts.instances !== expected) problems.push(`${arms} arms place ${placed.counts.instances} instances, not ${expected}`);
    if (placed.counts.bolts !== 8 * arms + 8) problems.push(`${arms} arms use ${placed.counts.bolts} bolts, not ${8 * arms + 8}`);
    if (placed.counts.modules !== arms + 3) problems.push(`${arms} arms make ${placed.counts.modules} modules, not ${arms + 3}`);
    if (placed.counts.definitions !== 1 || placed.counts.references !== 4) problems.push(`${arms} arms: ${placed.counts.definitions} definitions placed ${placed.counts.references} times, not one leg placed four times`);
    if (expectedPlacements({ ...placed, parts: model.parts }).instances !== placed.counts.instances) problems.push(`${arms} arms: the document would hold a different number of placements than the layout counts`);
    const partIds = new Set(model.parts.map((part) => part.id));
    const nodeIds = new Set(placed.nodes.map((node) => node.id));
    const definitionIds = new Set(placed.nodes.filter((node) => node.kind === "definition").map((node) => node.id));
    for (const node of placed.nodes) {
        if (node.kind === "instance" && !partIds.has(node.partId)) problems.push(`${node.id} places the unknown part ${node.partId}`);
        if (node.kind === "instance" && !nodeIds.has(node.parentId)) problems.push(`${node.id} sits under the unknown module ${node.parentId}`);
        if (node.kind === "reference" && !definitionIds.has(node.definitionId)) problems.push(`${node.id} references the unknown definition ${node.definitionId}`);
    }
    const neighbours = 2 * placed.params.armLength * Math.sin(Math.PI / arms);
    if (!(placed.params.propDiameter < neighbours)) problems.push(`${arms} arms: ${placed.params.propDiameter} mm propellers overlap at ${round(neighbours)} mm motor spacing`);
    if (placed.params.propDiameter > maxPropDiameter(arms, placed.params.armLength)) problems.push(`${arms} arms: the propeller was not limited`);
    layouts[`arms${arms}`] = { instances: placed.counts.instances, bolts: placed.counts.bolts, propDiameter: placed.params.propDiameter };
}

const { document } = await buildDocument(occt, model);
const bom = await billOfMaterials(occt, document);
const tree = await occt.assembly.query.getAssemblyHierarchy({ document });
const expectedNodes = 1 + model.counts.modules + model.counts.references + model.counts.instances;
if (bom.parts !== model.parts.length) problems.push(`the document holds ${bom.parts} parts, not ${model.parts.length}`);
if (bom.instances !== model.counts.instances) problems.push(`the bill of materials counts ${bom.instances} placements, not ${model.counts.instances}`);
if (tree.totalNodes !== expectedNodes) problems.push(`the hierarchy has ${tree.totalNodes} nodes, not ${expectedNodes}`);
const legs = (await occt.assembly.query.getDocumentParts({ document })).find((entry) => entry.name === "Leg");
if (legs?.instanceCount !== 4) problems.push(`the leg sub-assembly is placed ${legs?.instanceCount ?? 0} times, not 4`);

const glb = await occt.assembly.manager.exportDocumentToGltf({ document, meshDeflection: 0.05, meshAngle: 0.5, internalVerticesMode: false, controlSurfaceDeflection: false, mergeFaces: true, forceUVExport: false, fileName: "drone.glb", tryDownload: false });
if (new TextDecoder().decode(glb.subarray(0, 4)) !== "glTF") problems.push("the GLB export does not start with the glTF magic");
const zUp = await buildDocument(occt, model, Z_UP);
const step = await occt.assembly.manager.exportDocumentToStep({ document: zUp.document, fileName: "drone.step", author: "smoke", organization: "smoke", compress: false, tryDownload: false });
const stepText = new TextDecoder().decode(step);
if (!stepText.startsWith("ISO-10303-21")) problems.push("the STEP export does not start with ISO-10303-21");
const reloaded = service.io.loadSTEPorIGES({ filetext: stepText, fileName: "drone.step", adjustZtoY: false });
const reloadedShape = reloaded ? asShape(reloaded) : undefined;
const reloadedSolids = reloadedShape ? (await solidsOf(reloadedShape)).length : 0;
const expectedSolids = expectedPlacements(model).solidsOf((part) => statsOf(part.id).solids);
if (reloadedSolids !== expectedSolids) problems.push(`the STEP reads back with ${reloadedSolids} solids, not ${expectedSolids}`);
const origin: [number, number, number] = [0, 0, 0];
const box = reloadedShape ? await occt.operations.boundingBoxOfShape({ shape: reloadedShape }) : { min: origin, max: origin };
const nutTop = model.lift + MOTOR_TOP + 3.5;
const reach = model.params.armLength + model.params.propDiameter / 2;
if (Math.abs(box.min[2]) > 0.5) problems.push(`the feet stand at z ${round(box.min[2])} in the Z-up STEP, not on the ground`);
if (box.max[2] < nutTop - 0.5 || box.max[2] > nutTop + FRAME.propeller.hubAbove + 12) problems.push(`the Z-up STEP tops out at ${round(box.max[2])}, not around the propeller nuts at ${round(nutTop)}`);
if (Math.max(Math.abs(box.min[0]), box.max[0], Math.abs(box.min[1]), box.max[1]) > reach + 20) problems.push(`the STEP reaches beyond ${reach} mm from the centre`);

console.log(JSON.stringify({
    template: "drone-assembly",
    params: model.params,
    emblem: logo !== undefined,
    partsMs,
    parts,
    layouts,
    bom: Object.fromEntries(bom.rows.map((row) => [row.name, row.count])),
    modules: model.counts.modules,
    legPlacements: model.counts.references,
    instances: model.counts.instances,
    bolts: model.counts.bolts,
    glbBytes: glb.byteLength,
    stepBytes: step.byteLength,
    stepSolids: reloadedSolids,
    envelope: { min: box.min.map(round), max: box.max.map(round) },
}));

if (problems.length) {
    console.error(`smoke: ${problems.join("; ")}`);
    process.exit(1);
}
