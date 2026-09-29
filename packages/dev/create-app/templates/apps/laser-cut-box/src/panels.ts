export type Joint = "fingers" | "slots" | "plain";

export type Point2 = [number, number];

export interface BoxParams {
    length: number;
    width: number;
    height: number;
    thickness: number;
    kerf: number;
    fingerWidth: number;
    lid: boolean;
    sheetWidth: number;
    sheetHeight: number;
    gap: number;
}

export interface EdgeSpec {
    joint: Joint;
    inset: number;
}

export interface PanelSpec {
    id: string;
    u: number;
    v: number;
    edges: [EdgeSpec, EdgeSpec, EdgeSpec, EdgeSpec];
}

export interface Slot {
    length: number;
    radius: number;
}

export interface Part {
    id: string;
    outline: Point2[];
    width: number;
    height: number;
    fingers: number;

    slot?: Slot;
}

export interface PlacedPart extends Part {
    x: number;
    y: number;
}

export interface Layout {
    parts: PlacedPart[];
    usedWidth: number;
    usedHeight: number;
    fits: boolean;
}

export const UNITS = "mm";

export const LIMITS = {
    length: { min: 40, max: 600, step: 1 },
    width: { min: 40, max: 600, step: 1 },
    height: { min: 20, max: 400, step: 1 },
    thickness: { min: 1.5, max: 12, step: 0.5 },
    kerf: { min: 0, max: 0.5, step: 0.05 },
    fingerWidth: { min: 5, max: 60, step: 1 },
    sheetWidth: { min: 100, max: 1500, step: 10 },
    sheetHeight: { min: 100, max: 1000, step: 10 },
    gap: { min: 1, max: 20, step: 0.5 },
} as const;

export const defaultParams: BoxParams = {
    length: 120,
    width: 80,
    height: 60,
    thickness: 3,
    kerf: 0.15,
    fingerWidth: 12,
    lid: true,
    sheetWidth: 400,
    sheetHeight: 300,
    gap: 4,
};

export function clampParams(params: BoxParams): BoxParams {
    const clamp = (value: number, limit: { min: number; max: number }): number => Math.min(Math.max(value, limit.min), limit.max);
    const thickness = clamp(params.thickness, LIMITS.thickness);
    const length = Math.max(clamp(params.length, LIMITS.length), thickness * 6);
    const width = Math.max(clamp(params.width, LIMITS.width), thickness * 6);
    const height = Math.max(clamp(params.height, LIMITS.height), thickness * 4);
    return {
        ...params,
        length, width, height, thickness,
        kerf: clamp(params.kerf, LIMITS.kerf),
        fingerWidth: Math.max(clamp(params.fingerWidth, LIMITS.fingerWidth), thickness),
        sheetWidth: clamp(params.sheetWidth, LIMITS.sheetWidth),
        sheetHeight: clamp(params.sheetHeight, LIMITS.sheetHeight),
        gap: clamp(params.gap, LIMITS.gap),
    };
}

export function panelSpecs(p: BoxParams): PanelSpec[] {
    const t = p.thickness;
    const edge = (joint: Joint, inset = 0): EdgeSpec => ({ joint, inset });
    const top = (inset: number): EdgeSpec => (p.lid ? edge("slots", inset) : edge("plain"));
    const specs: PanelSpec[] = [
        { id: "bottom", u: p.length - 2 * t, v: p.width - 2 * t, edges: [edge("fingers"), edge("fingers"), edge("fingers"), edge("fingers")] },
        { id: "front", u: p.length - 2 * t, v: p.height, edges: [edge("slots"), edge("fingers"), top(0), edge("fingers")] },
        { id: "back", u: p.length - 2 * t, v: p.height, edges: [edge("slots"), edge("fingers"), top(0), edge("fingers")] },
        { id: "left", u: p.width, v: p.height, edges: [edge("slots", t), edge("slots"), top(t), edge("slots")] },
        { id: "right", u: p.width, v: p.height, edges: [edge("slots", t), edge("slots"), top(t), edge("slots")] },
    ];
    if (p.lid) specs.push({ id: "lid", u: p.length - 2 * t, v: p.width - 2 * t, edges: [edge("fingers"), edge("fingers"), edge("fingers"), edge("fingers")] });
    return specs;
}

export function segmentsAlong(edgeLength: number, fingerWidth: number): number {
    const n = Math.max(3, Math.floor(edgeLength / fingerWidth));
    return n % 2 === 1 ? n : n - 1;
}

export function outlineFor(spec: PanelSpec, p: BoxParams): Point2[] {
    const t = p.thickness;
    const k = p.kerf / 2;
    const [c0, c1, c2, c3]: [Point2, Point2, Point2, Point2] = [[-spec.u / 2, -spec.v / 2], [spec.u / 2, -spec.v / 2], [spec.u / 2, spec.v / 2], [-spec.u / 2, spec.v / 2]];
    const sides: { a: Point2; b: Point2; n: Point2; edge: EdgeSpec }[] = [
        { a: c0, b: c1, n: [0, -1], edge: spec.edges[0] },
        { a: c1, b: c2, n: [1, 0], edge: spec.edges[1] },
        { a: c2, b: c3, n: [0, 1], edge: spec.edges[2] },
        { a: c3, b: c0, n: [-1, 0], edge: spec.edges[3] },
    ];
    const points: Point2[] = [];
    for (const { a, b, n, edge } of sides) {
        const d: Point2 = [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])];
        const len = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
        const at = (u: number, level: number): Point2 => [a[0] + d[0] * u + n[0] * (k + level), a[1] + d[1] * u + n[1] * (k + level)];
        const { joint, inset } = edge;
        points.push(at(-k, 0));
        if (joint === "plain") continue;
        const span = len - 2 * inset;
        const count = segmentsAlong(span, p.fingerWidth);
        const s = span / count;
        const level = (i: number): number => (i % 2 === 0 ? (joint === "fingers" ? t : -t) : 0);
        let current = 0;
        for (let i = 0; i <= count; i++) {
            const next = i === count ? 0 : level(i);
            if (next === current) continue;
            const boundary = inset + i * s + (next === 0 ? (current > 0 ? k : -k) : (next > 0 ? -k : k));
            points.push(at(boundary, current), at(boundary, next));
            current = next;
        }
    }
    return tidy(points);
}

const same = (a: Point2, b: Point2): boolean => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;

function tidy(points: Point2[]): Point2[] {
    const out = [...points];
    const around = (index: number): Point2 | undefined => out[(index + out.length) % out.length];
    let changed = true;
    while (changed && out.length > 3) {
        changed = false;
        for (let i = 0; i < out.length; i++) {
            const previous = around(i - 1);
            const here = around(i);
            const next = around(i + 1);
            if (!previous || !here || !next) break;
            if (same(here, next)) { out.splice(i, 1); changed = true; break; }
            if (same(previous, next)) { out.splice(i, 2); changed = true; break; }
        }
    }
    return out;
}

export const HANDLE = { length: 30, radius: 4, clearance: 12 } as const;

export const slotCorner = (slot: Slot): number => slot.radius * 0.99;

export function handleFor(spec: PanelSpec, p: BoxParams): Slot | undefined {
    if (spec.id !== "lid") return undefined;
    const room = 2 * (p.thickness + HANDLE.clearance);
    const length = Math.min(HANDLE.length, spec.u - room);
    if (length < 3 * HANDLE.radius || spec.v - room < 2 * HANDLE.radius) return undefined;
    return { length, radius: HANDLE.radius };
}

export function slotArea(slot: Slot): number {
    const r = slotCorner(slot);
    return slot.length * 2 * slot.radius - (4 - Math.PI) * r * r;
}

export function partsFor(p: BoxParams): Part[] {
    return panelSpecs(p).map((spec) => {
        const outline = outlineFor(spec, p);
        const xs = outline.map((pt) => pt[0]);
        const ys = outline.map((pt) => pt[1]);
        const width = Math.max(...xs) - Math.min(...xs);
        const height = Math.max(...ys) - Math.min(...ys);
        const slot = handleFor(spec, p);
        const part: Part = { id: spec.id, outline, width, height, fingers: segmentsAlong(Math.max(spec.u, spec.v), p.fingerWidth) };
        return slot ? { ...part, slot } : part;
    });
}

export function layoutParts(parts: Part[], p: BoxParams): Layout {
    const order = [...parts].sort((a, b) => b.height - a.height || b.width - a.width);
    const placed: PlacedPart[] = [];
    let cursorX = 0;
    let cursorY = 0;
    let rowHeight = 0;
    let usedWidth = 0;
    for (const part of order) {
        if (cursorX > 0 && cursorX + part.width > p.sheetWidth) {
            cursorX = 0;
            cursorY += rowHeight + p.gap;
            rowHeight = 0;
        }
        placed.push({ ...part, x: cursorX + part.width / 2, y: cursorY + part.height / 2 });
        cursorX += part.width + p.gap;
        rowHeight = Math.max(rowHeight, part.height);
        usedWidth = Math.max(usedWidth, cursorX - p.gap);
    }
    const usedHeight = cursorY + rowHeight;
    return { parts: placed, usedWidth, usedHeight, fits: usedWidth <= p.sheetWidth && usedHeight <= p.sheetHeight };
}

export function partsOverlap(a: PlacedPart, b: PlacedPart): boolean {
    return Math.abs(a.x - b.x) < (a.width + b.width) / 2 && Math.abs(a.y - b.y) < (a.height + b.height) / 2;
}
