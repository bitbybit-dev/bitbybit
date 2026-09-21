import type { BitByBitBase } from "@bitbybit-dev/threejs";
import { clampParams, layoutParts, partsFor, slotCorner, type BoxParams, type Layout, type PlacedPart, type Slot } from "./panels";

export type Occt = BitByBitBase["occt"];

type Shape = Awaited<ReturnType<Occt["operations"]["extrude"]>>;

export interface BuiltPart extends PlacedPart {
    face: Shape;
    assembled: Shape;
    flat: Shape;
    flatSolid: Shape;
}

export interface BoxModel {
    params: BoxParams;
    parts: BuiltPart[];
    layout: Layout;
    sheetOutline: Shape;
}

export const LAYOUT_LIFT = 1;

export { clampParams, defaultParams, LIMITS, UNITS, type BoxParams } from "./panels";

export async function buildModel(occt: Occt, params: BoxParams): Promise<BoxModel> {
    const p = clampParams(params);
    const parts = partsFor(p);
    const layout = layoutParts(parts, p);
    const built: BuiltPart[] = [];
    for (const part of layout.parts) {
        const wire = await occt.shapes.wire.createPolygonWire({ points: part.outline.map(([u, v]) => [u, 0, v]) });
        const face = part.slot ? await faceWithHole(occt, wire, await slotWire(occt, part.slot)) : await occt.shapes.face.createFaceFromWire({ shape: wire, planar: true });
        const flat = await occt.transforms.translate({ shape: face, translation: [part.x - p.sheetWidth / 2, 0, part.y - p.sheetHeight / 2] });
        const flatSlab = await occt.operations.extrude({ shape: flat, direction: [0, p.thickness, 0] });
        const flatSolid = await occt.transforms.translate({ shape: flatSlab, translation: [0, LAYOUT_LIFT, 0] });
        const slab = await occt.operations.extrude({ shape: face, direction: [0, p.thickness, 0] });
        const assembled = await place(occt, slab, part.id, p);
        built.push({ ...part, face, flat, flatSolid, assembled });
    }
    const sheetOutline = await occt.shapes.wire.createRectangleWire({ width: p.sheetWidth, length: p.sheetHeight, center: [0, LAYOUT_LIFT, 0], direction: [0, 1, 0] });
    return { params: p, parts: built, layout, sheetOutline };
}

type Wire = Awaited<ReturnType<Occt["shapes"]["wire"]["createRectangleWire"]>>;

function winding(points: number[][]): number {
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
        const [ax = 0, , az = 0] = points[i] ?? [];
        const [bx = 0, , bz = 0] = points[(i + 1) % points.length] ?? [];
        sum += ax * bz - bx * az;
    }
    return sum;
}

async function faceWithHole(occt: Occt, outline: Wire, hole: Wire): Promise<Shape> {
    const both = await occt.shapes.compound.makeCompound({ shapes: [outline, hole] });
    const runs = await occt.shapes.wire.wiresToPoints({ shape: both, angularDeflection: 0.1, curvatureDeflection: 0.1, minimumOfPoints: 2, uTolerance: 1e-9, minimumLength: 1e-7 });
    const [outlineRun = [], holeRun = []] = runs;
    const turned = Math.sign(winding(outlineRun)) === Math.sign(winding(holeRun)) ? await occt.shapes.wire.reversedWire({ shape: hole }) : hole;
    return occt.shapes.face.createFaceFromWires({ shapes: [outline, turned], planar: true });
}

async function slotWire(occt: Occt, slot: Slot): Promise<Wire> {
    const rectangle = await occt.shapes.wire.createRectangleWire({ width: slot.length, length: 2 * slot.radius, center: [0, 0, 0], direction: [0, 1, 0] });
    return occt.fillets.fillet2d({ shape: rectangle, radius: slotCorner(slot) });
}

async function place(occt: Occt, slab: Shape, id: string, p: BoxParams): Promise<Shape> {
    const t = p.thickness;
    const upright = (shape: Shape): Promise<Shape> => occt.transforms.rotate({ shape, axis: [1, 0, 0], angle: -90 });
    const move = (shape: Shape, translation: [number, number, number]): Promise<Shape> => occt.transforms.translate({ shape, translation });
    switch (id) {
        case "bottom": return slab;
        case "lid": return move(slab, [0, p.height - t, 0]);
        case "front": return move(await upright(slab), [0, p.height / 2, -p.width / 2 + t]);
        case "back": {
            const turned = await occt.transforms.rotate({ shape: await upright(slab), axis: [0, 1, 0], angle: 180 });
            return move(turned, [0, p.height / 2, p.width / 2 - t]);
        }
        case "left": {
            const turned = await occt.transforms.rotate({ shape: await upright(slab), axis: [0, 1, 0], angle: 90 });
            return move(turned, [-p.length / 2 + t, p.height / 2, 0]);
        }
        case "right": {
            const turned = await occt.transforms.rotate({ shape: await upright(slab), axis: [0, 1, 0], angle: -90 });
            return move(turned, [p.length / 2 - t, p.height / 2, 0]);
        }
        default: throw new Error(`no placement for panel ${id}`);
    }
}
