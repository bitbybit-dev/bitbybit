import type { BitByBitBase } from "@bitbybit-dev/threejs";

export type Occt = BitByBitBase["occt"];

export type Point3 = [number, number, number];

export interface PartParams {
    baseWidth: number;
    flangeHeight: number;
    lipHeight: number;
    depth: number;
    thickness: number;
    bendRadius: number;
    kFactor: number;
}

export interface FlatEstimate {
    bends: number;
    outerLengths: number;
    removedAtBends: number;
    allowancePerBend: number;
    total: number;
}

export interface PartModel {
    params: PartParams;
    shape: Awaited<ReturnType<Occt["operations"]["pipe"]>>;
    volume: number;
    profileArea: number;
    estimate: FlatEstimate;
    mounting: Mounting;
}

export interface Mounting {
    baseHoles: [number, number][];

    flangeSlots: { x: number; y: number; length: number }[];
}

export const MOUNTING = { holeRadius: 2.2, slotLength: 10, margin: 3 } as const;

export const UNITS = "mm";

export const LIMITS = {
    baseWidth: { min: 20, max: 300, step: 1 },
    flangeHeight: { min: 10, max: 200, step: 1 },
    lipHeight: { min: 0, max: 60, step: 1 },
    depth: { min: 10, max: 300, step: 1 },
    thickness: { min: 0.5, max: 6, step: 0.1 },
    bendRadius: { min: 0.5, max: 12, step: 0.1 },
    kFactor: { min: 0.3, max: 0.5, step: 0.01 },
} as const;

export const defaultParams: PartParams = {
    baseWidth: 80,
    flangeHeight: 40,
    lipHeight: 12,
    depth: 60,
    thickness: 2,
    bendRadius: 2,
    kFactor: 0.44,
};

export function clampParams(params: PartParams): PartParams {
    const clamp = (value: number, limit: { min: number; max: number }): number => Math.min(Math.max(value, limit.min), limit.max);
    const thickness = clamp(params.thickness, LIMITS.thickness);
    const bendRadius = clamp(params.bendRadius, LIMITS.bendRadius);
    const bend = bendRadius + thickness;
    const baseWidth = Math.max(clamp(params.baseWidth, LIMITS.baseWidth), 2 * bend + 4 * thickness);
    const lipRequested = clamp(params.lipHeight, LIMITS.lipHeight);
    const lipHeight = lipRequested === 0 ? 0 : Math.max(lipRequested, bend + 2 * thickness);
    const flangeHeight = Math.max(clamp(params.flangeHeight, LIMITS.flangeHeight), (lipHeight > 0 ? 2 : 1) * bend + 2 * thickness);
    return {
        baseWidth, flangeHeight, lipHeight, thickness, bendRadius,
        depth: clamp(params.depth, LIMITS.depth),
        kFactor: clamp(params.kFactor, LIMITS.kFactor),
    };
}

export function centreLine(p: PartParams): Point3[] {
    const { baseWidth: w, flangeHeight: h, lipHeight: l, thickness: t } = p;
    const half = w / 2;
    const mid = t / 2;
    if (l === 0) {
        return [[-half + mid, h, 0], [-half + mid, mid, 0], [half - mid, mid, 0], [half - mid, h, 0]];
    }
    return [[-half + l, h - mid, 0], [-half + mid, h - mid, 0], [-half + mid, mid, 0], [half - mid, mid, 0], [half - mid, h - mid, 0], [half - l, h - mid, 0]];
}

export function midRadius(p: PartParams): number {
    return p.bendRadius + p.thickness / 2;
}

export function centreLineLength(p: PartParams): number {
    const line = centreLine(p);
    const bends = line.length - 2;
    const R = midRadius(p);
    let straight = 0;
    for (const [i, b] of line.entries()) {
        const a = line[i - 1];
        if (a) straight += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    return straight - 2 * R * bends + bends * (Math.PI / 2) * R;
}

export function profileArea(p: PartParams): number {
    return p.thickness * centreLineLength(p);
}

export function flatLengthEstimate(p: PartParams): FlatEstimate {
    const bends = p.lipHeight > 0 ? 4 : 2;
    const outerLengths = p.baseWidth + 2 * p.flangeHeight + 2 * p.lipHeight;
    const removedAtBends = bends * 2 * (p.bendRadius + p.thickness);
    const allowancePerBend = (Math.PI / 2) * (p.bendRadius + p.kFactor * p.thickness);
    return { bends, outerLengths, removedAtBends, allowancePerBend, total: outerLengths - removedAtBends + bends * allowancePerBend };
}

export function mounting(p: PartParams): Mounting {
    const { holeRadius: r, slotLength, margin } = MOUNTING;
    const bend = p.bendRadius + p.thickness;
    const half = p.baseWidth / 2;
    const baseHoles: [number, number][] = half / 2 + r + margin <= half - bend && p.depth / 4 + r + margin <= p.depth / 2
        ? [[-half / 2, -p.depth / 4], [half / 2, p.depth / 4]]
        : [];
    const flatTop = p.lipHeight > 0 ? p.flangeHeight - bend : p.flangeHeight;
    const flangeSlots = flatTop - bend >= 2 * r + 2 * margin && p.depth >= slotLength + 2 * margin
        ? [{ x: -half, y: (bend + flatTop) / 2, length: slotLength }, { x: half - p.thickness, y: (bend + flatTop) / 2, length: slotLength }]
        : [];
    return { baseHoles, flangeSlots };
}

export const SLOT_CORNER = MOUNTING.holeRadius * 0.99;

export function removedVolume(p: PartParams): number {
    const m = mounting(p);
    const { holeRadius: r } = MOUNTING;
    const hole = Math.PI * r * r;
    const slot = 2 * r * MOUNTING.slotLength - (4 - Math.PI) * SLOT_CORNER * SLOT_CORNER;
    return (m.baseHoles.length * hole + m.flangeSlots.length * slot) * p.thickness;
}

export async function buildModel(occt: Occt, params: PartParams): Promise<PartModel> {
    const p = clampParams(params);
    const sharp = await occt.shapes.wire.createPolylineWire({ points: centreLine(p) });
    const path = await occt.fillets.fillet2d({ shape: sharp, radius: midRadius(p) });
    const start = await occt.shapes.wire.startPointOnWire({ shape: path });
    const tangent = await occt.shapes.wire.tangentOnWireAtParam({ shape: path, param: 0 });
    const length = Math.hypot(tangent[0], tangent[1], tangent[2]);
    const direction: Point3 = [tangent[0] / length, tangent[1] / length, tangent[2] / length];
    const section = await occt.shapes.wire.createRectangleWire({ width: p.thickness, length: p.depth, center: start, direction });
    const swept = await occt.operations.pipe({ shape: path, shapes: [section] });
    const features = mounting(p);
    const cutters = [];
    for (const [x, z] of features.baseHoles) {
        cutters.push(await occt.shapes.solid.createCylinder({ radius: MOUNTING.holeRadius, height: p.thickness + 2, center: [x, -1, z], direction: [0, 1, 0] }));
    }
    for (const slot of features.flangeSlots) {
        const outline = await occt.shapes.wire.createRectangleWire({ width: 2 * MOUNTING.holeRadius, length: slot.length, center: [slot.x - 1, slot.y, 0], direction: [1, 0, 0] });
        const rounded = await occt.fillets.fillet2d({ shape: outline, radius: SLOT_CORNER });
        const face = await occt.shapes.face.createFaceFromWire({ shape: rounded, planar: true });
        cutters.push(await occt.operations.extrude({ shape: face, direction: [p.thickness + 2, 0, 0] }));
    }
    const shape = cutters.length > 0 ? await occt.booleans.difference({ shape: swept, shapes: cutters, keepEdges: false }) : swept;
    const volume = await occt.shapes.solid.getSolidVolume({ shape });
    return { params: p, shape, volume, profileArea: profileArea(p), estimate: flatLengthEstimate(p), mounting: features };
}
