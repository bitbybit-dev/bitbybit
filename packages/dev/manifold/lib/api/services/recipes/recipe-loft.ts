import type * as Manifold3D from "manifold-3d";
import { signedVolumeOf } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-measures";
import { signedArea2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";
import { cross3, length3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import type { ProfileRings } from "./recipe-types";
import { FLOAT32_THICKNESS, TRIANGLE_CORNERS } from "./recipes.constants";

const MATRIX_SIZE = 16;
const POSITION_PROPERTIES = 3;

function sameShape(a: ProfileRings, b: ProfileRings): boolean {
    return a.length === b.length && a.every((ring, at) => ring.length === b[at]!.length);
}

function placedArea(rings: ProfileRings, frame: Float64Array): number {
    const areaScale = length3(cross3([frame[0]!, frame[1]!, frame[2]!], [frame[4]!, frame[5]!, frame[6]!]));
    return Math.abs(rings.reduce((sum, ring) => sum + signedArea2(ring), 0)) * areaScale;
}

function farthestCoordinate(positions: Float32Array): number {
    let farthest = 0;
    for (const value of positions) {
        farthest = Math.max(farthest, Math.abs(value));
    }
    return farthest;
}

function capOf(wasm: Manifold3D.ManifoldToplevel, rings: ProfileRings, tolerance: number | undefined): Manifold3D.Vec3[] {
    return wasm.triangulate(rings.map((ring) => [...ring]), tolerance);
}

export function loftMesh(wasm: Manifold3D.ManifoldToplevel, sections: readonly ProfileRings[], frames: Float64Array, tolerance: number | undefined, subject: string): Manifold3D.Mesh {
    const count = frames.length / MATRIX_SIZE;
    const first = sections[0]!;
    if (!sections.every((section) => sameShape(section, first))) {
        throw new Error(`${subject} lofts profiles whose loops hold different numbers of corners, so their corners cannot be joined`);
    }
    const starts: number[] = [];
    let perFrame = 0;
    for (const ring of first) {
        starts.push(perFrame);
        perFrame += ring.length;
    }
    const positions = new Float32Array(count * perFrame * POSITION_PROPERTIES);
    let at = 0;
    for (let frame = 0; frame < count; frame++) {
        const m = frames.subarray(frame * MATRIX_SIZE, (frame + 1) * MATRIX_SIZE);
        for (const ring of sections[sections.length === 1 ? 0 : frame]!) {
            for (const [x, y] of ring) {
                positions[at++] = m[0]! * x + m[4]! * y + m[12]!;
                positions[at++] = m[1]! * x + m[5]! * y + m[13]!;
                positions[at++] = m[2]! * x + m[6]! * y + m[14]!;
            }
        }
    }
    const triangles: number[] = [];
    const corner = (frame: number, ring: number, point: number): number => frame * perFrame + starts[ring]! + (point % first[ring]!.length);
    for (let frame = 0; frame + 1 < count; frame++) {
        first.forEach((ring, r) => {
            for (let point = 0; point < ring.length; point++) {
                const a = corner(frame, r, point);
                const b = corner(frame, r, point + 1);
                const c = corner(frame + 1, r, point + 1);
                const d = corner(frame + 1, r, point);
                triangles.push(a, b, c, a, c, d);
            }
        });
    }
    const lastOffset = (count - 1) * perFrame;
    for (const [a, b, c] of capOf(wasm, first, tolerance)) {
        triangles.push(a, c, b);
    }
    for (const [a, b, c] of capOf(wasm, sections[sections.length - 1]!, tolerance)) {
        triangles.push(lastOffset + a, lastOffset + b, lastOffset + c);
    }
    const indices = Uint32Array.from(triangles);
    const volume = signedVolumeOf(positions, indices);
    let largestArea = 0;
    for (let frame = 0; frame < count; frame++) {
        largestArea = Math.max(largestArea, placedArea(sections[sections.length === 1 ? 0 : frame]!, frames.subarray(frame * MATRIX_SIZE, (frame + 1) * MATRIX_SIZE)));
    }
    if (!(Math.abs(volume) > farthestCoordinate(positions) * FLOAT32_THICKNESS * largestArea)) {
        throw new Error(`${subject} is no thicker than the precision of its coordinates: its frames leave its sections in one plane`);
    }
    if (volume < 0) {
        for (let corner = 0; corner < indices.length; corner += TRIANGLE_CORNERS) {
            const second = indices[corner + 1]!;
            indices[corner + 1] = indices[corner + 2]!;
            indices[corner + 2] = second;
        }
    }
    return new wasm.Mesh({ numProp: POSITION_PROPERTIES, vertProperties: positions, triVerts: indices });
}
