import type { BitByBitBase } from "@bitbybit-dev/threejs";

export type Occt = BitByBitBase["occt"];

export type MaterialId = "terracotta" | "concrete" | "oak";

export interface PlanterParams {
    width: number;
    depth: number;
    height: number;
    wallThickness: number;
    cornerRadius: number;
    drainageHoles: number;
    material: MaterialId;
}

export interface PlanterModel {
    shape: Awaited<ReturnType<Occt["booleans"]["difference"]>>;
    volume: number;
    surfaceArea: number;
}

type Shape = Awaited<ReturnType<Occt["operations"]["extrude"]>>;

export const UNITS = "cm";

export const LIMITS = {
    width: { min: 10, max: 120, step: 1 },
    depth: { min: 10, max: 80, step: 1 },
    height: { min: 8, max: 80, step: 1 },
    wallThickness: { min: 0.6, max: 4, step: 0.1 },
    cornerRadius: { min: 0, max: 20, step: 0.5 },
    drainageHoles: { min: 0, max: 9, step: 1 },
} as const;

export const HOLE_RADIUS = 0.8;

export const STYLE = { taperAngle: 4, lipHeight: 2.2, lipStep: 0.6, rimRadius: 0.5, footInset: 3, footDepth: 1.5 } as const;

export const SMALLEST_DRAFTED_CORNER = 1;

const draftedCorner = (radius: number): number => (radius >= SMALLEST_DRAFTED_CORNER ? radius : 0);

export const defaultParams: PlanterParams = {
    width: 40,
    depth: 20,
    height: 18,
    wallThickness: 1.2,
    cornerRadius: 3,
    drainageHoles: 3,
    material: "terracotta",
};

export function clampParams(params: PlanterParams): PlanterParams {
    const clamp = (value: number, limit: { min: number; max: number }): number => Math.min(Math.max(value, limit.min), limit.max);
    const width = clamp(params.width, LIMITS.width);
    const depth = clamp(params.depth, LIMITS.depth);
    const height = clamp(params.height, LIMITS.height);
    const smallestSide = Math.min(width, depth);
    const wallThickness = Math.min(clamp(params.wallThickness, LIMITS.wallThickness), smallestSide / 4);
    const cornerRadius = Math.min(clamp(params.cornerRadius, LIMITS.cornerRadius), smallestSide / 2 - wallThickness - STYLE.lipStep);
    const drainageHoles = Math.round(clamp(params.drainageHoles, LIMITS.drainageHoles));
    return { ...params, width, depth, height, wallThickness, cornerRadius, drainageHoles };
}

export function taperAngle(p: PlanterParams): number {
    const wallHeight = p.height - STYLE.lipHeight;
    const largest = (Math.atan((0.25 * Math.min(p.width, p.depth)) / wallHeight) * 180) / Math.PI;
    return Math.min(STYLE.taperAngle, largest);
}

export function taperInset(p: PlanterParams): number {
    return STYLE.lipStep + (p.height - STYLE.lipHeight) * Math.tan((taperAngle(p) * Math.PI) / 180);
}

export function bottomSize(p: PlanterParams): { width: number; depth: number } {
    const inset = taperInset(p);
    return { width: p.width - 2 * inset, depth: p.depth - 2 * inset };
}

export async function buildModel(occt: Occt, params: PlanterParams): Promise<PlanterModel> {
    const p = clampParams(params);
    const t = p.wallThickness;
    const s = STYLE.lipStep;
    const wallHeight = p.height - STYLE.lipHeight;
    const angle = taperAngle(p);
    const walls = await tapered(occt, await roundedBlock(occt, p.width - 2 * s, p.depth - 2 * s, draftedCorner(p.cornerRadius - s), 0, wallHeight), angle, wallHeight);
    const lip = await roundedBlock(occt, p.width, p.depth, p.cornerRadius, wallHeight, STYLE.lipHeight);
    const outer = await occt.booleans.union({ shapes: [walls, lip], keepEdges: false });
    const cavity = await tapered(occt, await roundedBlock(occt, p.width - 2 * (t + s), p.depth - 2 * (t + s), draftedCorner(p.cornerRadius - t - s), t, p.height), angle, wallHeight);
    const hollow = await occt.booleans.difference({ shape: outer, shapes: [cavity], keepEdges: false });
    const rimmed = await roundRim(occt, hollow, p.height);
    const bottom = bottomSize(p);
    const footDepth = Math.min(STYLE.footDepth, t / 2);
    const recess = await roundedBlock(occt, bottom.width - 2 * STYLE.footInset, bottom.depth - 2 * STYLE.footInset, Math.max(p.cornerRadius - taperInset(p) - STYLE.footInset, 0), -1, 1 + footDepth);
    const shape = await occt.booleans.difference({ shape: rimmed, shapes: [recess, ...await drainageHoles(occt, p)], keepEdges: false });
    const volume = await occt.shapes.solid.getSolidVolume({ shape });
    const surfaceArea = await occt.shapes.solid.getSolidSurfaceArea({ shape });
    return { shape, volume, surfaceArea };
}

async function roundedBlock(occt: Occt, width: number, depth: number, radius: number, bottom: number, height: number): Promise<Shape> {
    const rectangle = await occt.shapes.wire.createRectangleWire({ width, length: depth, center: [0, bottom, 0], direction: [0, 1, 0] });
    const outline = radius > 0 ? await occt.fillets.fillet2d({ shape: rectangle, radius }) : rectangle;
    const face = await occt.shapes.face.createFaceFromWire({ shape: outline, planar: true });
    return occt.operations.extrude({ shape: face, direction: [0, height, 0] });
}

async function tapered(occt: Occt, block: Shape, angle: number, top: number): Promise<Shape> {
    if (angle <= 0) return block;
    const faces = await occt.shapes.face.getFaces({ shape: block });
    const sides = [];
    for (const face of faces) {
        const normal = await occt.shapes.face.normalOnUV({ shape: face, paramU: 0.5, paramV: 0.5 });
        if (Math.abs(normal[1]) < 0.5) sides.push(face);
    }
    return occt.draft.draftAngle({ shape: block, faces: sides, direction: [0, 1, 0], angle: -angle, neutralPlaneOrigin: [0, top, 0], neutralPlaneDirection: [0, 1, 0], flag: true });
}

async function roundRim(occt: Occt, shape: Shape, top: number): Promise<Shape> {
    const edges = await occt.shapes.edge.getEdges({ shape });
    const centers = await occt.shapes.edge.getEdgesCentersOfMass({ shapes: edges });
    const indexes = centers.map((center, index) => (Math.abs(center[1] - top) < 1e-4 ? index : -1)).filter((index) => index >= 0);
    return occt.fillets.filletEdges({ shape, radius: STYLE.rimRadius, indexes });
}

export function drainageHoleCenters(params: PlanterParams): [number, number, number][] {
    const count = params.drainageHoles;
    if (count === 0) return [];
    const bottom = bottomSize(params);
    const inset = params.wallThickness + STYLE.footInset + HOLE_RADIUS * 2;
    const usableWidth = Math.max(bottom.width - 2 * inset, 0);
    const usableDepth = Math.max(bottom.depth - 2 * inset, 0);
    const columns = Math.ceil(Math.sqrt(count * Math.max(usableWidth / Math.max(usableDepth, 1), 1)));
    const rows = Math.ceil(count / columns);
    const centers: [number, number, number][] = [];
    for (let row = 0; row < rows && centers.length < count; row++) {
        for (let column = 0; column < columns && centers.length < count; column++) {
            const x = columns === 1 ? 0 : -usableWidth / 2 + (usableWidth * column) / (columns - 1);
            const z = rows === 1 ? 0 : -usableDepth / 2 + (usableDepth * row) / (rows - 1);
            centers.push([x, -1, z]);
        }
    }
    return centers;
}

async function drainageHoles(occt: Occt, params: PlanterParams): Promise<Shape[]> {
    const holes: Shape[] = [];
    for (const center of drainageHoleCenters(params)) {
        holes.push(await occt.shapes.solid.createCylinder({ radius: HOLE_RADIUS, height: params.wallThickness + 2, center, direction: [0, 1, 0] }));
    }
    return holes;
}
