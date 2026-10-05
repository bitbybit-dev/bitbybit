import * as Inputs from "./inputs";
import type * as Models from "./models";

/**
 * A kernel shape with the looks to draw it in: a base look for the whole shape and groups of faces
 * that override it. A part that `occt.design.build` returns is one already, and a script can write
 * one by hand to color some faces of any shape.
 */
export interface ShapeWithAppearance {
    /** The shape to draw, as the OCCT kernel returns it. */
    shape: Inputs.OCCT.TopoDSShapePointer;
    /**
     * How the shape looks. Each `faces` entry gives its values to the faces it lists, numbered as
     * `shapes.face.getFaces` numbers them, and each `edges` entry its color to the edges it lists, as
     * `shapes.edge.getEdges` numbers them; left out, the shape takes the colors of the options.
     */
    appearance?: Models.OCCT.DesignBuiltAppearance | undefined;
}

/**
 * How a set of faces is drawn: a color, a metalness and a roughness from 0 to 1, an opacity, and
 * the color the faces give off with its strength. Left out, metalness and roughness take the
 * renderer's defaults for kernel shapes, and the faces give off nothing.
 */
export interface FaceLook {
    color: string;
    metallic?: number | undefined;
    roughness?: number | undefined;
    opacity: number;
    emissive?: string | undefined;
    emissiveStrength?: number | undefined;
}

/** A look, the key that every equal look shares, and the faces that wear it. */
export interface LookGroup {
    key: string;
    look: FaceLook;
    faces: number[];
}

/** Where the triangles of one face sit in an index buffer: `start` and `count` in indices. */
export interface FaceRange {
    face: number;
    start: number;
    count: number;
}

/** The faces of one look as flat arrays a renderer uploads, and where each face's triangles are. */
export interface LookMesh {
    group: LookGroup;
    positions: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
    faceRanges: FaceRange[];
}

/** Where the segments of one edge sit among the segments of a shape: `start` and `count` in segments. */
export interface EdgeRange {
    edge: number;
    start: number;
    count: number;
}

/** The edges of a shape as segments, six numbers each (the start point, then the end point), and where each edge's segments are. */
export interface EdgeSegments {
    positions: Float32Array;
    edgeRanges: EdgeRange[];
}

/** Where a built part is placed: the path of the component that places it and its world matrix, column-major 4 x 4. */
export interface PartPlacement {
    path: string;
    world: readonly number[];
}

/** The faces of a mesh, as `shapeToMesh` returns them. */
export interface LookMeshSource {
    faceList: readonly {
        faceIndex: number;
        vertexCoord: ArrayLike<number>;
        normalCoord: ArrayLike<number>;
        triIndexes: ArrayLike<number>;
    }[];
}

/** The edges of a mesh, as `shapeToMesh` returns them. */
export interface EdgeSource {
    edgeList: readonly {
        edgeIndex: number;
        vertexCoord: readonly (readonly number[] | undefined)[];
    }[];
}

/** The drawing options that decide how a design build looks, as a renderer resolves them. */
export interface DesignLookOptions {
    drawFaces: boolean;
    drawEdges: boolean;
    faceColour: string;
    faceOpacity: number;
    edgeColour: string;
    edgeContrast?: number | undefined;
    edgeWidth: number;
    edgeOpacity: number;
}

/** Parts by id and the components that place them; a build without components places each part once, where it was made. */
export interface PlacementSource {
    parts: readonly { id: string }[];
    components?: readonly {
        path: string;
        part?: string | undefined;
        world: readonly number[];
    }[] | undefined;
}

type LookValues = {
    color?: string | undefined;
    metallic?: number | undefined;
    roughness?: number | undefined;
    opacity?: number | undefined;
    emissive?: string | undefined;
    emissiveStrength?: number | undefined;
};

const IDENTITY: readonly number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

const EIGHT_DIGIT_COLOR = /^#[0-9a-fA-F]{8}$/;

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;

function lookKey(look: FaceLook): string {
    return `${look.color}|${look.metallic ?? ""}|${look.roughness ?? ""}|${look.opacity}|${look.emissive ?? ""}|${look.emissiveStrength ?? ""}`;
}

function lookOver(values: LookValues | undefined, under: FaceLook): FaceLook {
    const look: FaceLook = {
        color: (values?.color ?? under.color).toLowerCase(),
        opacity: values?.opacity ?? under.opacity,
    };
    const metallic = values?.metallic ?? under.metallic;
    const roughness = values?.roughness ?? under.roughness;
    const emissive = values?.emissive?.toLowerCase() ?? under.emissive;
    const emissiveStrength = values?.emissiveStrength ?? under.emissiveStrength;
    if (metallic !== undefined) {
        look.metallic = metallic;
    }
    if (roughness !== undefined) {
        look.roughness = roughness;
    }
    if (emissive !== undefined) {
        look.emissive = emissive;
    }
    if (emissiveStrength !== undefined) {
        look.emissiveStrength = emissiveStrength;
    }
    return look;
}

/**
 * The looks the faces of a shape wear, each with the faces that wear it: the base look first, then
 * every other look in the order its first face comes. Faces take the values of the last `faces`
 * entry that lists them over the base look; a face the mesh does not have is left out, and so is a
 * look that no face wears.
 * @param appearance - The appearance of the shape, or undefined for one look in `fallbackColor`
 * @param faces - The indexes of the faces the mesh has
 * @param fallbackColor - The color of faces the appearance gives none
 * @returns The looks with their faces
 */
export function lookGroupsOf(appearance: Models.OCCT.DesignBuiltAppearance | undefined, faces: readonly number[], fallbackColor: string): LookGroup[] {
    const base = lookOver(appearance, { color: fallbackColor, opacity: 1 });
    const lookOfFace = new Map<number, FaceLook>();
    for (const entry of appearance?.faces ?? []) {
        const look = lookOver(entry, base);
        for (const face of entry.indexes) {
            lookOfFace.set(face, look);
        }
    }
    const baseKey = lookKey(base);
    const groups = new Map<string, LookGroup>([[baseKey, { key: baseKey, look: base, faces: [] }]]);
    for (const face of faces) {
        const look = lookOfFace.get(face) ?? base;
        const key = lookKey(look);
        const group = groups.get(key);
        if (group) {
            group.faces.push(face);
        } else {
            groups.set(key, { key, look, faces: [face] });
        }
    }
    return [...groups.values()].filter(group => group.faces.length > 0);
}

/**
 * The looks of a mesh made from an assembly document, from its color groups: a key of eight hex
 * digits (`#rrggbbaa`) gives its last two as the opacity. Faces in no group take `fallbackColor`.
 * @param colorGroups - The faces of each color, as `docToMesh` returns them
 * @param faces - The indexes of the faces the mesh has
 * @param fallbackColor - The color of faces in no group
 * @returns The looks with their faces
 */
export function lookGroupsOfColors(colorGroups: Readonly<Record<string, readonly number[]>>, faces: readonly number[], fallbackColor: string): LookGroup[] {
    const entries = Object.entries(colorGroups).map(([color, indexes]) => EIGHT_DIGIT_COLOR.test(color)
        ? { indexes: [...indexes], color: color.slice(0, 7), opacity: parseInt(color.slice(7, 9), 16) / 255 }
        : { indexes: [...indexes], color });
    return lookGroupsOf({ faces: entries }, faces, fallbackColor);
}

/**
 * The color of each edge of a shape, in the order of `edges`. The last `edges` entry that lists an
 * edge decides it: its color, or the appearance's `edgeColor` when it gives none. An edge no entry
 * lists takes `edgeColor`, and without one `fallbackColor`.
 * @param appearance - The appearance of the shape, or undefined for every edge in `fallbackColor`
 * @param edges - The indexes of the edges the mesh has
 * @param fallbackColor - The color of edges the appearance gives none
 * @returns One lowercase color per edge
 */
export function edgeColorsOf(appearance: Models.OCCT.DesignBuiltAppearance | undefined, edges: readonly number[], fallbackColor: string): string[] {
    const base = (appearance?.edgeColor ?? fallbackColor).toLowerCase();
    const colorOfEdge = new Map<number, string>();
    for (const entry of appearance?.edges ?? []) {
        const color = entry.color?.toLowerCase() ?? base;
        for (const edge of entry.indexes) {
            colorOfEdge.set(edge, color);
        }
    }
    return edges.map(edge => colorOfEdge.get(edge) ?? base);
}

/**
 * A color for edges on faces of `color`: moved toward black when the color is light and toward
 * white when it is dark, by `contrast` from 0, the color itself, to 1, black or white. A color is
 * light when its luminance is above one half.
 * @param color - The color of the faces, as `#rgb`, `#rrggbb` or `#rrggbbaa`, whose alpha is ignored
 * @param contrast - How far to move it, from 0 to 1; a value outside is clamped
 * @returns The edge color, as lowercase `#rrggbb`
 */
export function contrastColor(color: string, contrast: number): string {
    if (!HEX_COLOR.test(color)) {
        throw new Error(`The color ${color} is not a hex color, so no edge color can be derived from it.`);
    }
    const digits = color.length === 4 ? [...color.slice(1)].map(digit => digit + digit).join("") : color.slice(1, 7);
    const channels = [0, 2, 4].map(start => parseInt(digits.slice(start, start + 2), 16) / 255);
    const amount = Math.min(1, Math.max(0, Number.isFinite(contrast) ? contrast : 0));
    const luminance = channels.reduce((sum, channel, index) => sum + channel * LUMINANCE[index]!, 0);
    const target = luminance > 0.5 ? 0 : 1;
    return `#${channels.map(channel => Math.round((channel + (target - channel) * amount) * 255).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * The color of the edges nothing else colors: `edgeColour`, or, when `edgeContrast` is given, the
 * color of their faces moved by it as `contrastColor` moves it.
 * @param faceColor - The color of the faces the edges bound
 * @param edgeColour - The edge color of the drawing options
 * @param edgeContrast - The edge contrast of the drawing options, if any
 * @returns The edge color
 */
export function defaultEdgeColor(faceColor: string, edgeColour: string, edgeContrast: number | undefined): string {
    return edgeContrast === undefined ? edgeColour : contrastColor(faceColor, edgeContrast);
}

/**
 * The faces of each look merged into flat arrays, in the order of `groups`, with where each face's
 * triangles are. Indices count from the first vertex of their look.
 * @param mesh - The mesh whose faces are merged
 * @param groups - The looks and their faces
 * @returns One merged mesh per look
 */
export function lookMeshesOf(mesh: LookMeshSource, groups: readonly LookGroup[]): LookMesh[] {
    const faceOf = new Map(mesh.faceList.map(face => [face.faceIndex, face]));
    return groups.map(group => {
        const present = group.faces.flatMap(index => {
            const face = faceOf.get(index);
            return face ? [face] : [];
        });
        let vertexCount = 0;
        let indexCount = 0;
        for (const face of present) {
            vertexCount += face.vertexCoord.length / 3;
            indexCount += face.triIndexes.length;
        }
        const positions = new Float32Array(vertexCount * 3);
        const normals = new Float32Array(vertexCount * 3);
        const indices = new Uint32Array(indexCount);
        const faceRanges: FaceRange[] = [];
        let vertexOffset = 0;
        let indexOffset = 0;
        for (const face of present) {
            positions.set(face.vertexCoord, vertexOffset * 3);
            normals.set(face.normalCoord, vertexOffset * 3);
            for (let i = 0; i < face.triIndexes.length; i++) {
                indices[indexOffset + i] = face.triIndexes[i]! + vertexOffset;
            }
            faceRanges.push({ face: face.faceIndex, start: indexOffset, count: face.triIndexes.length });
            vertexOffset += face.vertexCoord.length / 3;
            indexOffset += face.triIndexes.length;
        }
        return { group, positions, normals, indices, faceRanges };
    });
}

/**
 * The edges of a mesh as segments between consecutive points of each edge, with where each edge's
 * segments are. A missing point is skipped.
 * @param mesh - The mesh whose edges are cut into segments
 * @returns The segments and the range of each edge
 */
export function edgeSegmentsOf(mesh: EdgeSource): EdgeSegments {
    const points = mesh.edgeList.map(edge => edge.vertexCoord.filter((point): point is readonly number[] => point !== undefined));
    const count = points.reduce((sum, edge) => sum + Math.max(0, edge.length - 1), 0);
    const positions = new Float32Array(count * 6);
    const edgeRanges: EdgeRange[] = [];
    let segment = 0;
    mesh.edgeList.forEach((edge, index) => {
        const edgePoints = points[index]!;
        const start = segment;
        for (let i = 1; i < edgePoints.length; i++) {
            const from = edgePoints[i - 1]!;
            const to = edgePoints[i]!;
            positions.set([from[0] ?? 0, from[1] ?? 0, from[2] ?? 0, to[0] ?? 0, to[1] ?? 0, to[2] ?? 0], segment * 6);
            segment++;
        }
        edgeRanges.push({ edge: edge.edgeIndex, start, count: segment - start });
    });
    return { positions, edgeRanges };
}

/**
 * Where each part is placed, by part id, in the order of the components. A build without components
 * places each of its parts once, at the origin; a part no component places is left out.
 * @param source - The parts and the components that place them
 * @returns The placements of each part
 */
export function partPlacementsOf(source: PlacementSource): Map<string, PartPlacement[]> {
    const placements = new Map<string, PartPlacement[]>();
    if (source.components === undefined) {
        for (const part of source.parts) {
            placements.set(part.id, [{ path: part.id, world: IDENTITY }]);
        }
        return placements;
    }
    for (const component of source.components) {
        if (component.part === undefined) {
            continue;
        }
        const list = placements.get(component.part);
        if (list) {
            list.push({ path: component.path, world: component.world });
        } else {
            placements.set(component.part, [{ path: component.path, world: component.world }]);
        }
    }
    return placements;
}

/** A part of a design build as a drawer reads it: its appearance, its shape's handle and its `shapeHash`. */
export interface DesignDrawnPart {
    appearance?: Models.OCCT.DesignBuiltAppearance | undefined;
    shape?: { hash?: unknown } | undefined;
    shapeHash?: string | undefined;
}

/**
 * What a part's mesh depends on: its `shapeHash`, the same in every build that makes the same shape,
 * or without one the handle of its shape, which no other build shares.
 * @param part - The part
 * @returns The key a drawer keeps the part's mesh under
 */
export function designMeshKeyOf(part: DesignDrawnPart): string {
    return part.shapeHash ?? `handle:${String(part.shape?.hash)}`;
}

/** A mesh the worker made for a design part, as much of it as a cache counts. */
export type DesignMesh = LookMeshSource & EdgeSource;

/**
 * How many numbers a mesh holds: its vertex, normal and index data and its edge points, which is
 * what a cache of meshes weighs it by.
 * @param mesh - The mesh
 * @returns The count of numbers it holds
 */
export function meshNumbersOf(mesh: DesignMesh): number {
    const faces = mesh.faceList.reduce((sum, face) => sum + face.vertexCoord.length + face.normalCoord.length + face.triIndexes.length, 0);
    const edges = mesh.edgeList.reduce((sum, edge) => sum + edge.vertexCoord.length * 3, 0);
    return faces + edges;
}

/**
 * Where a drawer keeps the mesh of a design part across the builds it draws: the part's `shapeHash`
 * with the meshing options, or undefined for a part without a `shapeHash`, whose shape no other build
 * shares.
 * @param part - The part
 * @param meshing - The options the part is meshed with, written out as text
 * @returns The key, or undefined when the mesh is not worth keeping
 */
export function designMeshCacheKeyOf(part: DesignDrawnPart, meshing: string): string | undefined {
    return part.shapeHash === undefined ? undefined : `${part.shapeHash}|${meshing}`;
}

/**
 * The meshes a drawer made for design parts, kept across every build it draws, so a part meshed for
 * one drawn build, such as a preview, is not meshed again for another, such as the model. The least
 * recently used are forgotten beyond `capacity` meshes or `budget` numbers.
 */
export class DesignMeshCache<T extends DesignMesh> {
    /** The most meshes it keeps. */
    readonly capacity: number;
    /** The most numbers its meshes hold together. */
    readonly budget: number;
    private readonly entries = new Map<string, { mesh: T; numbers: number }>();
    private numbers = 0;

    /**
     * @param capacity - The most meshes it keeps
     * @param budget - The most numbers its meshes hold together
     */
    constructor(capacity = 256, budget = 16_000_000) {
        this.capacity = capacity;
        this.budget = budget;
    }

    /** How many meshes it keeps. */
    get size(): number {
        return this.entries.size;
    }

    /** How many numbers its meshes hold together. */
    get weight(): number {
        return this.numbers;
    }

    /**
     * The mesh kept under `key`, which is now the most recently used.
     * @param key - The key, as `designMeshCacheKeyOf` makes it
     * @returns The mesh, or undefined when it is not kept
     */
    get(key: string): T | undefined {
        const found = this.entries.get(key);
        if (found === undefined) {
            return undefined;
        }
        this.entries.delete(key);
        this.entries.set(key, found);
        return found.mesh;
    }

    /**
     * Keeps `mesh` under `key` as the most recently used, then forgets the least recently used until
     * the cache is within its capacity and its budget. A mesh heavier than the whole budget is not kept.
     * @param key - The key, as `designMeshCacheKeyOf` makes it
     * @param mesh - The mesh
     */
    set(key: string, mesh: T): void {
        const previous = this.entries.get(key);
        if (previous !== undefined) {
            this.entries.delete(key);
            this.numbers -= previous.numbers;
        }
        const numbers = meshNumbersOf(mesh);
        if (numbers > this.budget) {
            return;
        }
        this.entries.set(key, { mesh, numbers });
        this.numbers += numbers;
        for (const [oldest, entry] of this.entries) {
            if (this.entries.size <= this.capacity && this.numbers <= this.budget) {
                break;
            }
            this.entries.delete(oldest);
            this.numbers -= entry.numbers;
        }
    }

    /** Forgets every mesh. */
    clear(): void {
        this.entries.clear();
        this.numbers = 0;
    }
}

/**
 * What decides how one placed part of a design build looks on its own: its appearance and the shape it
 * draws. Under the same drawing options, a redraw keeps what it drew for a part whose key is the same.
 * @param part - The part
 * @returns A string that changes whenever the part's own look does
 */
export function designPartKeyOf(part: DesignDrawnPart): string {
    return JSON.stringify([part.appearance ?? null, designMeshKeyOf(part)]);
}

/**
 * What decides how every part of a design build looks: the drawing options. A redraw under other
 * options draws every part again.
 * @param options - The resolved drawing options
 * @returns A string that changes whenever the options that decide the look do
 */
export function designOptionsKeyOf(options: DesignLookOptions): string {
    return JSON.stringify({
        drawFaces: options.drawFaces,
        drawEdges: options.drawEdges,
        edgeColour: options.edgeColour,
        edgeContrast: options.edgeContrast ?? null,
        edgeWidth: options.edgeWidth,
        edgeOpacity: options.edgeOpacity,
        faceColour: options.faceColour,
        faceOpacity: options.faceOpacity,
    });
}

/**
 * What decides how the placed parts of a design build look: their appearances, the shapes they
 * draw and the drawing options. A redraw with the same signature and the same placements only moves
 * what is drawn.
 * @param parts - The appearance and shape of each part, by part id
 * @param placed - The ids of the placed parts, in drawing order
 * @param options - The resolved drawing options
 * @returns A string that changes whenever the look does
 */
export function designSignatureOf(parts: ReadonlyMap<string, DesignDrawnPart>, placed: readonly string[], options: DesignLookOptions): string {
    return JSON.stringify({
        looks: placed.map(id => [id, designPartKeyOf(parts.get(id) ?? {})]),
        options: designOptionsKeyOf(options),
    });
}

/**
 * Whether two sets of placements place the same parts at the same component paths, in the same
 * order, whatever their matrices: a redraw between them only moves what is drawn.
 * @param first - One set of placements
 * @param second - The other set of placements
 * @returns True when only the matrices may differ
 */
export function samePlacements(first: ReadonlyMap<string, readonly PartPlacement[]>, second: ReadonlyMap<string, readonly PartPlacement[]>): boolean {
    if (first.size !== second.size) {
        return false;
    }
    for (const [part, list] of first) {
        const other = second.get(part);
        if (!other || other.length !== list.length) {
            return false;
        }
        for (let i = 0; i < list.length; i++) {
            if (list[i]!.path !== other[i]!.path) {
                return false;
            }
        }
    }
    return true;
}
