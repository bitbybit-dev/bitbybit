import type { OCCTService } from "@bitbybit-dev/occt";

export interface ConvertOptions {
    meshPrecision: number;
    stlPrecision: number;
    stl: boolean;
}

export interface Stats {
    file: string;
    solids: number;
    faces: number;
    edges: number;
    volume: number;
    bbox: { min: number[]; max: number[] };
    glbBytes: number;
    stlBytes: number;
    ms: number;
}

export interface Converted {
    glb: Uint8Array;
    stl: string | null;
    stats: Stats;
}

export const defaultOptions: ConvertOptions = { meshPrecision: 0.005, stlPrecision: 0.1, stl: true };

export const GLB_MAGIC = "glTF";

export function convertFile(occt: OCCTService, file: string, text: string, options: ConvertOptions = defaultOptions): Converted {
    const started = Date.now();
    const shape = occt.io.loadSTEPorIGES({ filetext: text, fileName: file, adjustZtoY: true });
    if (!shape) throw new Error(`${file}: the kernel could not read this file as STEP or IGES`);
    const solids = occt.shapes.solid.getSolids({ shape });
    const faces = occt.shapes.face.getFaces({ shape }).length;
    const edges = occt.shapes.edge.getEdges({ shape }).length;
    const volume = occt.shapes.solid.getSolidsVolumes({ shapes: solids }).reduce((sum, v) => sum + v, 0);
    const bbox = occt.operations.boundingBoxOfShape({ shape });
    const glb = occt.io.convertStepToGltf({ stepData: text, meshPrecision: options.meshPrecision, meshAngle: 0.5, meshRelative: true, internalVerticesMode: false, controlSurfaceDeflection: false });
    const stl = options.stl ? occt.io.saveShapeStl({ shape, fileName: file, precision: options.stlPrecision, adjustYtoZ: true, tryDownload: false, binary: false }) : null;
    return {
        glb,
        stl,
        stats: {
            file,
            solids: solids.length,
            faces,
            edges,
            volume: round(volume),
            bbox: { min: bbox.min.map(round), max: bbox.max.map(round) },
            glbBytes: glb.byteLength,
            stlBytes: stl ? Buffer.byteLength(stl) : 0,
            ms: Date.now() - started,
        },
    };
}

export function isGlb(bytes: Uint8Array): boolean {
    return bytes.byteLength > 12 && String.fromCharCode(...bytes.subarray(0, 4)) === GLB_MAGIC;
}

function round(value: number): number {
    return Math.round(value * 1000) / 1000;
}
