import { strToU8, zipSync } from "fflate";
import type * as JSCAD from "@jscad/modeling";
import type { MaybeNamed, ThreeMfMesh, ThreeMfSettings, ThreeMfSolid, ThreeMfUnit } from "./three-mf-types";
import {
    APPLICATION, CHANNEL_MAX, CORE_NAMESPACE, COLOR_CHANNELS, COLOR_CHANNELS_WITH_ALPHA, CONTENT_TYPES, CONTENT_TYPES_PART, DEFAULT_COLOR,
    DEFAULT_UNIT, HEX_DIGITS, HEX_RADIX, INDENT, ITEM_INDENT, LIST_INDENT, MESH_INDENT, MODEL_PART, OBJECT_INDENT, RELATIONSHIPS, RELATIONSHIPS_PART,
    THREE_MF_UNITS, TRIANGLE_CORNERS, XML_DECLARATION, XML_ESCAPES, ZIP_COMMENT,
} from "./three-mf.constants";

export function escapeXml(text: string): string {
    return text.replace(/[&<>"']/g, (character) => XML_ESCAPES[character]!);
}

export function hexColorOf(color: readonly number[]): string {
    if (color.length < COLOR_CHANNELS || color.some((channel) => !Number.isFinite(channel))) {
        throw new Error(`A 3MF color needs red, green and blue as finite numbers from 0 to 1, got [${color.join(", ")}]`);
    }
    const channels = color.slice(0, COLOR_CHANNELS_WITH_ALPHA).map((channel) => Math.round(Math.min(1, Math.max(0, channel)) * CHANNEL_MAX));
    return `#${channels.map((channel) => channel.toString(HEX_RADIX).padStart(HEX_DIGITS, "0")).join("").toUpperCase()}`;
}

export function threeMfSettingsOf(options: Record<string, unknown> | undefined): ThreeMfSettings {
    const given = options ?? {};
    const unit = given["unit"] ?? DEFAULT_UNIT;
    if (!THREE_MF_UNITS.includes(unit as ThreeMfUnit)) {
        throw new Error(`A 3MF unit is one of ${THREE_MF_UNITS.join(", ")}, got ${JSON.stringify(unit)}`);
    }
    const color = given["defaultcolor"] ?? DEFAULT_COLOR;
    if (!Array.isArray(color) || !color.every((channel) => typeof channel === "number")) {
        throw new Error("The 3MF option defaultcolor is a list of red, green, blue and an optional alpha, each from 0 to 1");
    }
    return {
        unit: unit as ThreeMfUnit,
        metadata: given["metadata"] !== false,
        defaultColor: color,
        compress: given["compress"] !== false,
    };
}

function flattened(geometry: unknown): unknown[] {
    return Array.isArray(geometry) ? geometry.flatMap(flattened) : [geometry];
}

export function threeMfSolidsOf(jscad: typeof JSCAD, geometry: unknown, defaultColor: number[]): ThreeMfSolid[] {
    const solids = flattened(geometry).filter((entity): entity is JSCAD.geometries.geom3.Geom3 => jscad.geometries.geom3.isA(entity));
    if (solids.length === 0) {
        throw new Error("Only 3D solids can be written to 3MF, and the geometry holds none");
    }
    const triangulated = flattened(jscad.modifiers.generalize({ snap: true, triangulate: true }, solids)) as JSCAD.geometries.geom3.Geom3[];
    return triangulated
        .map((solid) => ({ solid, polygons: jscad.geometries.geom3.toPolygons(solid).map((polygon) => polygon.vertices.map((vertex) => [...vertex])) }))
        .filter(({ polygons }) => polygons.length > 0)
        .map(({ solid, polygons }, index) => {
            const named = (solid as MaybeNamed).name;
            return {
                name: typeof named === "string" && named !== "" ? named : `Part ${index}`,
                color: solid.color ? [...solid.color] : defaultColor,
                polygons,
            };
        });
}

export function threeMfMeshOf(solid: ThreeMfSolid): ThreeMfMesh {
    const vertices: number[][] = [];
    const indexOf = new Map<string, number>();
    const triangles: number[][] = [];
    for (const polygon of solid.polygons) {
        const corners = polygon.map((vertex) => {
            const key = vertex.join(",");
            let index = indexOf.get(key);
            if (index === undefined) {
                index = vertices.push(vertex) - 1;
                indexOf.set(key, index);
            }
            return index;
        });
        for (let corner = 1; corner + 1 < corners.length; corner++) {
            const triangle = [corners[0]!, corners[corner]!, corners[corner + 1]!];
            if (new Set(triangle).size === TRIANGLE_CORNERS) {
                triangles.push(triangle);
            }
        }
    }
    return { vertices, triangles };
}

function solidLines(solid: ThreeMfSolid, index: number, materials: number, lines: string[]): void {
    const mesh = threeMfMeshOf(solid);
    lines.push(`${OBJECT_INDENT}<object id="${index + 1}" type="model" pid="${materials}" pindex="${index}" name="${escapeXml(solid.name)}">`);
    lines.push(`${MESH_INDENT}<mesh>`, `${LIST_INDENT}<vertices>`);
    for (const vertex of mesh.vertices) {
        lines.push(`${ITEM_INDENT}<vertex x="${vertex[0]!}" y="${vertex[1]!}" z="${vertex[2]!}"/>`);
    }
    lines.push(`${LIST_INDENT}</vertices>`, `${LIST_INDENT}<triangles>`);
    for (const triangle of mesh.triangles) {
        lines.push(`${ITEM_INDENT}<triangle v1="${triangle[0]!}" v2="${triangle[1]!}" v3="${triangle[2]!}"/>`);
    }
    lines.push(`${LIST_INDENT}</triangles>`, `${MESH_INDENT}</mesh>`, `${OBJECT_INDENT}</object>`);
}

function listLines(open: string, close: string, items: string[], lines: string[]): void {
    if (items.length === 0) {
        lines.push(`${open.slice(0, -1)}/>`);
        return;
    }
    lines.push(open, ...items, close);
}

export function threeMfModelXml(solids: ThreeMfSolid[], settings: ThreeMfSettings, createdAt: Date): string {
    const lines = [XML_DECLARATION, `<model unit="${settings.unit}" xml:lang="und" xmlns="${CORE_NAMESPACE}">`, `${INDENT}<metadata name="Application">${APPLICATION}</metadata>`];
    if (settings.metadata) {
        lines.push(`${INDENT}<metadata name="CreationDate">${createdAt.toISOString()}</metadata>`);
    }
    const materials = solids.length + 1;
    lines.push(`${INDENT}<resources>`);
    listLines(`${OBJECT_INDENT}<basematerials id="${materials}">`, `${OBJECT_INDENT}</basematerials>`,
        solids.map((solid, index) => `${MESH_INDENT}<base name="mat${index}" displaycolor="${hexColorOf(solid.color)}"/>`), lines);
    solids.forEach((solid, index) => {
        solidLines(solid, index, materials, lines);
    });
    lines.push(`${INDENT}</resources>`);
    listLines(`${INDENT}<build>`, `${INDENT}</build>`, solids.map((_, index) => `${OBJECT_INDENT}<item objectid="${index + 1}"/>`), lines);
    lines.push("</model>", "");
    return lines.join("\n");
}

export function writeThreeMf(jscad: typeof JSCAD, options: Record<string, unknown> | undefined, geometry: unknown, createdAt: Date = new Date()): BlobPart[] {
    const settings = threeMfSettingsOf(options);
    const xml = threeMfModelXml(threeMfSolidsOf(jscad, geometry, settings.defaultColor), settings, createdAt);
    if (!settings.compress) {
        return [xml];
    }
    const zipped = zipSync({
        [MODEL_PART]: strToU8(xml),
        [RELATIONSHIPS_PART]: strToU8(RELATIONSHIPS),
        [CONTENT_TYPES_PART]: strToU8(CONTENT_TYPES),
    }, { comment: ZIP_COMMENT });
    return [zipped.slice().buffer];
}
