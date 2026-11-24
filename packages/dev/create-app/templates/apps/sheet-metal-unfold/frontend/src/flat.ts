export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export interface UnfoldBend {
    angleDeg: number;
    innerRadius: number;
    allowance: number;
    bendDeduction: number;
    bendLineLength: number;
    lineStart: Vec3;
    lineEnd: Vec3;
    flatLineStart?: Vec3;
    flatLineEnd?: Vec3;
    flatLineMid?: Vec3;
    direction: "up" | "down";
}

export interface UnfoldSolidReport {
    solidIndex: number;
    ok: boolean;
    error?: string;
    warning?: string;
    thickness?: number;
    kFactor?: number;
    bends?: UnfoldBend[];
    flatBBox?: [number, number, number, number];
    flatArea?: number;
}

export interface UnfoldResult {
    taskId: string;
    report: UnfoldSolidReport[];
    flatStep: string;
    downloads: { format: string; downloadUrl: string; filename: string }[];
}

export interface BendRow {
    angleDeg: number;
    innerRadius: number;
    allowance: number;
}

export interface FlatSummary {
    solids: number;
    unfolded: number;
    bends: number;
    bendRows: BendRow[];
    thickness: number | null;
    flatArea: number;
    flatWidth: number | null;
    flatHeight: number | null;
    developedLength: number | null;
    problems: string[];
}

function flatLineOf(bend: UnfoldBend): [Vec3, Vec3][] {
    return bend.flatLineStart && bend.flatLineEnd ? [[bend.flatLineStart, bend.flatLineEnd]] : [];
}

export function bendLines(report: UnfoldSolidReport[]): [Vec3, Vec3][] {
    return report.flatMap((solid) => (solid.ok && solid.bends ? solid.bends.flatMap(flatLineOf) : []));
}

export function toPattern([x, , z]: Vec3): Vec2 {
    return [x, -z];
}

export function summarize(report: UnfoldSolidReport[]): FlatSummary {
    const unfolded = report.filter((solid) => solid.ok);
    const bends = unfolded.flatMap((solid) => solid.bends ?? []);
    const first = unfolded[0];
    const box = first?.flatBBox;
    const width = box ? box[2] - box[0] : null;
    const height = box ? box[3] - box[1] : null;
    return {
        solids: report.length,
        unfolded: unfolded.length,
        bends: bends.length,
        bendRows: bends.map(({ angleDeg, innerRadius, allowance }) => ({ angleDeg, innerRadius, allowance })),
        thickness: first?.thickness ?? null,
        flatArea: unfolded.reduce((sum, solid) => sum + (solid.flatArea ?? 0), 0),
        flatWidth: width,
        flatHeight: height,
        developedLength: width !== null && height !== null ? Math.max(width, height) : null,
        problems: report.filter((solid) => !solid.ok).map((solid) => `solid ${solid.solidIndex}: ${solid.error ?? "could not be unfolded"}`),
    };
}
