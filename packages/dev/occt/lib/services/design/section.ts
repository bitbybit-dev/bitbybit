import { InputError } from "@bitbybit-dev/base";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { massesAndCentres } from "../base/kernel-arrays";
import { hashText } from "./cache";
import type { Crossing, Kind, LocalPlane, Made, PartCut, Placement, SectionContext, SectionOptions, SourcePart, Vec3 } from "./section-types";

const IDENTITY: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const KEY_DIGITS = 9;
const BOX_VALUES = 6;
const MATRIX_VALUES = 16;
const MOST_BOXES = 4096;
const SIDEWAYS = 0.9;
const TRANSLATION = 12;
const ROW = 4;

function dot(a: readonly number[], b: readonly number[]): number {
    return (a[0] ?? 0) * (b[0] ?? 0) + (a[1] ?? 0) * (b[1] ?? 0) + (a[2] ?? 0) * (b[2] ?? 0);
}

function rounded(value: number): number {
    const kept = Number(value.toFixed(KEY_DIGITS));
    return Object.is(kept, -0) ? 0 : kept;
}

function localPlane(world: Inputs.Base.TransformMatrix, normal: Vec3, offset: number): LocalPlane | undefined {
    const turned: Vec3 = [0, 1, 2].map(column => dot([world[column * ROW] ?? 0, world[column * ROW + 1] ?? 0, world[column * ROW + 2] ?? 0], normal)) as Vec3;
    const length = Math.hypot(...turned);
    if (!Number.isFinite(length) || length === 0) {
        return undefined;
    }
    const local: Vec3 = [turned[0] / length, turned[1] / length, turned[2] / length];
    const shifted = (offset - dot(normal, [world[TRANSLATION] ?? 0, world[TRANSLATION + 1] ?? 0, world[TRANSLATION + 2] ?? 0])) / length;
    return { normal: local, offset: shifted, key: [...local, shifted].map(rounded).join(" ") };
}

function frameOf(plane: LocalPlane): Inputs.Base.Frame {
    const [x, y, z] = plane.normal;
    const across: Vec3 = Math.abs(x) < SIDEWAYS ? [0, z, -y] : [-z, 0, x];
    const length = Math.hypot(...across);
    return {
        origin: [x * plane.offset, y * plane.offset, z * plane.offset],
        normal: plane.normal,
        direction: [across[0] / length, across[1] / length, across[2] / length],
    };
}

function cornersOf(box: readonly number[]): Vec3[] {
    const low = box.slice(0, BOX_VALUES / 2);
    const high = box.slice(BOX_VALUES / 2);
    return [low[0], high[0]].flatMap(x => [low[1], high[1]].flatMap(y => [low[2], high[2]].map((z): Vec3 => [x ?? 0, y ?? 0, z ?? 0])));
}

function sideOf(box: readonly number[], plane: LocalPlane, tolerance: number): -1 | 0 | 1 {
    const distances = cornersOf(box).map(corner => dot(corner, plane.normal) - plane.offset);
    if (Math.max(...distances) < -tolerance) {
        return -1;
    }
    return Math.min(...distances) > tolerance ? 1 : 0;
}

function placementsOf(source: Models.OCCT.DesignSectionSource<TopoDS_Shape>, parts: ReadonlyMap<string, SourcePart>): Map<string, Placement[]> {
    const placements = new Map<string, Placement[]>();
    const add = (part: string, placement: Placement): void => {
        placements.set(part, [...placements.get(part) ?? [], placement]);
    };
    if (source.components === undefined) {
        for (const id of parts.keys()) {
            add(id, { path: id, world: IDENTITY });
        }
        return placements;
    }
    if (!Array.isArray(source.components)) {
        throw new InputError("`build.components` is a list of placements.", "build");
    }
    source.components.forEach((component, index) => {
        if (component.part === undefined) {
            return;
        }
        if (!parts.has(component.part)) {
            throw new InputError(`\`build.components\` at position ${index} places the part "${component.part}", which \`build.parts\` lacks.`, "build");
        }
        if (!Array.isArray(component.world) || component.world.length !== MATRIX_VALUES || !component.world.every(Number.isFinite)) {
            throw new InputError(`\`build.components\` at position ${index} has no 4 x 4 \`world\` matrix.`, "build");
        }
        add(component.part, { path: component.path, world: component.world });
    });
    return placements;
}

function partsOf(source: Models.OCCT.DesignSectionSource<TopoDS_Shape>): Map<string, SourcePart> {
    if (typeof source !== "object" || source === null || !Array.isArray(source.parts)) {
        throw new InputError("`build` is a design build: it needs its `parts`.", "build");
    }
    const parts = new Map<string, SourcePart>();
    source.parts.forEach((part, index) => {
        if (typeof part.id !== "string" || typeof part.shapeHash !== "string" || part.shapeHash === "" || typeof part.shape !== "object" || part.shape === null) {
            throw new InputError(`\`build.parts\` at position ${index} needs an \`id\`, a \`shape\` and the \`shapeHash\` the build gave it.`, "build");
        }
        parts.set(part.id, part);
    });
    return parts;
}

function boxOf(part: SourcePart, context: SectionContext): readonly number[] {
    const known = context.boxes.get(part.shapeHash);
    if (known !== undefined) {
        return known;
    }
    if (context.boxes.size >= MOST_BOXES) {
        context.boxes.clear();
    }
    const box = Array.from(context.occ.BoundingBoxOf(part.shape));
    context.boxes.set(part.shapeHash, box);
    return box;
}

function cutsOf(parts: ReadonlyMap<string, SourcePart>, placements: ReadonlyMap<string, Placement[]>, frame: Inputs.Base.Frame, tolerance: number, context: SectionContext): PartCut[] {
    const length = Math.hypot(...frame.normal);
    const normal: Vec3 = [frame.normal[0] / length, frame.normal[1] / length, frame.normal[2] / length];
    const offset = dot(normal, frame.origin);
    return [...parts.values()].flatMap((part): PartCut[] => {
        const box = boxOf(part, context);
        if (box.length < BOX_VALUES) {
            return [];
        }
        const crossings = new Map<string, Crossing>();
        const behind: Placement[] = [];
        for (const placement of placements.get(part.id) ?? []) {
            const plane = localPlane(placement.world, normal, offset);
            const side = plane === undefined ? 1 : sideOf(box, plane, tolerance);
            if (plane !== undefined && side === 0) {
                crossings.set(plane.key, { plane, placements: [...crossings.get(plane.key)?.placements ?? [], placement] });
            } else if (side === -1) {
                behind.push(placement);
            }
        }
        return crossings.size === 0 && behind.length === 0 ? [] : [{ part, crossings: [...crossings.values()], behind }];
    });
}

function keyOf(kind: Kind, part: SourcePart, plane: LocalPlane, tolerance: number): string {
    return hashText(`${kind} ${part.shapeHash} ${plane.key} ${tolerance}`);
}

function lookOf(part: SourcePart): Models.OCCT.DesignBuiltAppearance | undefined {
    if (part.appearance === undefined) {
        return undefined;
    }
    const look: Models.OCCT.DesignBuiltAppearance = { ...part.appearance, faces: [] };
    delete look.edges;
    return look;
}

function withCuttable<T>(shape: TopoDS_Shape, context: SectionContext, use: (cuttable: TopoDS_Shape) => T): T {
    if (shape.ShapeType() !== context.occ.TopAbs_ShapeEnum.COMPOUND) {
        return use(shape);
    }
    const solids = context.occt.shapes.solid.getSolids({ shape });
    if (solids.length === 0) {
        return use(shape);
    }
    const compound = context.occt.shapes.compound.makeCompound({ shapes: solids });
    try {
        return use(compound);
    } finally {
        solids.forEach(solid => { solid.delete(); });
        compound.delete();
    }
}

function madeFor(cut: PartCut, kind: Exclude<Kind, "whole">, options: SectionOptions, context: SectionContext, used: Set<string>): Map<string, TopoDS_Shape> {
    const keyed = cut.crossings.map(crossing => ({ plane: crossing.plane, key: keyOf(kind, cut.part, crossing.plane, options.tolerance) }));
    const missing = keyed.filter(each => !context.cache.has(each.key));
    if (missing.length > 0) {
        const frames = missing.map(each => frameOf(each.plane));
        const made = withCuttable(cut.part.shape, context, shape => kind === "cap"
            ? context.occt.operations.sliceByFrames({ shape, frames, makeFaces: true, tolerance: options.tolerance })
            : frames.map(frame => {
                const { front, back } = context.occt.operations.splitByFrame({ shape, frame });
                front.delete();
                return back;
            }));
        missing.forEach((each, index) => {
            const shape = made[index];
            if (shape !== undefined) {
                context.cache.keep(each.key, { kind: "body", shape, names: [] });
            }
        });
    }
    const shapes = new Map<string, TopoDS_Shape>();
    for (const { plane, key } of keyed) {
        const kept = context.cache.take(key);
        if (kept !== undefined) {
            used.add(key);
            shapes.set(plane.key, kept.shape);
        }
    }
    return shapes;
}

function measured(kind: Kind, shapes: readonly TopoDS_Shape[], occ: BitbybitOcctModule): number[] {
    if (shapes.length === 0) {
        return [];
    }
    const list = [...shapes];
    return massesAndCentres(kind === "cap" ? occ.SurfacePropertiesOfEach(list) : occ.VolumePropertiesOfEach(list)).map(each => each.mass);
}

function sectionParts(cut: PartCut, kind: Exclude<Kind, "whole">, options: SectionOptions, context: SectionContext, used: Set<string>): Made[] {
    if (cut.crossings.length === 0) {
        return [];
    }
    const shapes = madeFor(cut, kind, options, context, used);
    const ordered = cut.crossings.flatMap(crossing => {
        const shape = shapes.get(crossing.plane.key);
        return shape === undefined ? [] : [{ crossing, shape }];
    });
    const sizes = measured(kind, ordered.map(each => each.shape), context.occ);
    const look = lookOf(cut.part);
    return ordered.flatMap(({ crossing, shape }, index): Made[] => {
        const size = sizes[index] ?? 0;
        if (kind === "cap" && !(size > 0)) {
            return [];
        }
        const shapeHash = keyOf(kind, cut.part, crossing.plane, options.tolerance);
        return [{
            part: {
                id: `${cut.part.id}:${kind}:${shapeHash}`,
                kind,
                from: cut.part.id,
                shape: shape.clone(),
                shapeHash,
                ...look === undefined ? {} : { appearance: look },
                ...kind === "cap" ? { area: size } : size > 0 ? { volume: size } : {},
            },
            placements: crossing.placements,
        }];
    });
}

function wholePart(cut: PartCut, occ: BitbybitOcctModule): Made[] {
    if (cut.behind.length === 0) {
        return [];
    }
    const look = lookOf(cut.part);
    const [volume] = measured("whole", [cut.part.shape], occ);
    return [{
        part: {
            id: cut.part.id,
            kind: "whole",
            from: cut.part.id,
            shape: cut.part.shape.clone(),
            shapeHash: cut.part.shapeHash,
            ...look === undefined ? {} : { appearance: look },
            ...volume !== undefined && volume > 0 ? { volume } : {},
        },
        placements: cut.behind,
    }];
}

export function sectionOf(source: Models.OCCT.DesignSectionSource<TopoDS_Shape>, frame: Inputs.Base.Frame, options: SectionOptions, context: SectionContext): Models.OCCT.DesignSection<TopoDS_Shape> {
    const parts = partsOf(source);
    const placements = placementsOf(source, parts);
    const used = new Set<string>();
    const made: Made[] = [];
    try {
        for (const cut of cutsOf(parts, placements, frame, options.tolerance, context)) {
            made.push(...sectionParts(cut, "cap", options, context, used));
            if (options.cut) {
                made.push(...sectionParts(cut, "piece", options, context, used), ...wholePart(cut, context.occ));
            }
        }
    } catch (error) {
        made.forEach(each => { each.part.shape.delete(); });
        throw error;
    } finally {
        context.cache.trim(used);
    }
    const section: Models.OCCT.DesignSection<TopoDS_Shape> = { frame, parts: made.map(each => each.part) };
    return source.components === undefined
        ? section
        : { ...section, components: made.flatMap(each => each.placements.map(placement => ({ path: placement.path, part: each.part.id, world: placement.world }))) };
}
