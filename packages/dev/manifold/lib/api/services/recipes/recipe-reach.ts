import type * as Manifold3D from "manifold-3d";
import { add3, between3, cross2, cross3, distance2, dot3, length2, length3, scale3, subtract2, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { axesAlong, axesToMatrix, pointToLocal, vectorToLocal } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { rigidInverse } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import type { BoxReach, CornerPlane, CutOutline, FacePlane, OutlineFace, ReachedFaces, ToolRegion, ToolRegions, TriangleIndex } from "./recipe-types";

type Vec2 = Manifold3D.Vec2;
type Vec3 = Manifold3D.Vec3;

const AXES = 3;
const TRIANGLE_CORNERS = 3;
const BOX_VALUES = 2 * AXES;
const MIDDLE = 0.5;
const SAME_DIRECTION = 0.999999;
const ONE_PLANE = 0.999999999999;
const FARTHEST_SLIDE = 2;
const BEYOND = 1.001;
const FILLED = 0.999999999999;
const INDEXED_FROM = 256;
const SLICES_ALONG = 32;
const NOTHING_INDEXED: TriangleIndex = { axis: 0, sorted: new Uint32Array(0), least: new Float64Array(0), widest: 0, big: new Uint32Array(0) };
const ORIGIN: Vec3 = [0, 0, 0];

function pointAt(mesh: Manifold3D.Mesh, vert: number): Vec3 {
    const { numProp, vertProperties } = mesh;
    return [vertProperties[vert * numProp]!, vertProperties[vert * numProp + 1]!, vertProperties[vert * numProp + 2]!];
}

function pointsOf(mesh: Manifold3D.Mesh): Vec3[] {
    return Array.from({ length: mesh.numVert }, (_, vert) => pointAt(mesh, vert));
}

function centredMesh(solid: Manifold3D.Manifold, centre: Vec3): Manifold3D.Mesh {
    const centred = solid.translate(scale3(centre, -1));
    try {
        return centred.getMesh();
    } finally {
        centred.delete();
    }
}

function faceOf(mesh: Manifold3D.Mesh, tri: number): OutlineFace | undefined {
    const corners = cornersOf(mesh.triVerts, tri).map((vert) => pointAt(mesh, vert));
    const [a, b, c] = corners as [Vec3, Vec3, Vec3];
    const spanned = cross3(subtract3(b, a), subtract3(c, a));
    const twiceArea = length3(spanned);
    if (!(twiceArea > 0)) {
        return undefined;
    }
    const normal = scale3(spanned, 1 / twiceArea);
    return { normal, offset: dot3(normal, a), corners };
}

function fillsItsBox(solid: Manifold3D.Manifold, box: Manifold3D.Box): boolean {
    const size = subtract3(box.max, box.min);
    return solid.volume() >= FILLED * size[0] * size[1] * size[2];
}

export function outlineOf(solid: Manifold3D.Manifold): CutOutline {
    const box = solid.boundingBox();
    if (solid.isEmpty() || fillsItsBox(solid, box)) {
        return { solid: undefined, box, centre: ORIGIN, mesh: undefined, boxes: new Float64Array(0), index: NOTHING_INDEXED };
    }
    const centre = between3(box.min, box.max, MIDDLE);
    const mesh = centredMesh(solid, centre);
    const { numProp, triVerts, vertProperties } = mesh;
    const boxes = new Float64Array(mesh.numTri * BOX_VALUES);
    for (let tri = 0; tri < mesh.numTri; tri++) {
        for (let axis = 0; axis < AXES; axis++) {
            let least = Infinity;
            let most = -Infinity;
            for (let corner = 0; corner < TRIANGLE_CORNERS; corner++) {
                const value = vertProperties[triVerts[tri * TRIANGLE_CORNERS + corner]! * numProp + axis]!;
                least = Math.min(least, value);
                most = Math.max(most, value);
            }
            boxes[tri * BOX_VALUES + axis] = least;
            boxes[tri * BOX_VALUES + AXES + axis] = most;
        }
    }
    return { solid: solid.translate(ORIGIN), box, centre, mesh, boxes, index: indexedTriangles(boxes, mesh.numTri, box) };
}

function indexedTriangles(boxes: Float64Array, count: number, box: Manifold3D.Box): TriangleIndex {
    const size = subtract3(box.max, box.min);
    const axis = size.indexOf(Math.max(...size));
    const least = (tri: number): number => boxes[tri * BOX_VALUES + axis]!;
    const extent = (tri: number): number => boxes[tri * BOX_VALUES + AXES + axis]! - least(tri);
    const all = Array.from({ length: count }, (_, tri) => tri);
    const slice = count >= INDEXED_FROM ? size[axis]! / SLICES_ALONG : -1;
    const sorted = all.filter((tri) => extent(tri) <= slice).sort((first, second) => least(first) - least(second));
    return {
        axis,
        sorted: Uint32Array.from(sorted),
        least: Float64Array.from(sorted, least),
        widest: sorted.reduce((widest, tri) => Math.max(widest, extent(tri)), 0),
        big: Uint32Array.from(all.filter((tri) => !(extent(tri) <= slice))),
    };
}

function countBelow(ascending: Float64Array, value: number, orEqual: boolean): number {
    let low = 0;
    let high = ascending.length;
    while (low < high) {
        const middle = (low + high) >>> 1;
        const before = orEqual ? ascending[middle]! <= value : ascending[middle]! < value;
        if (before) {
            low = middle + 1;
        } else {
            high = middle;
        }
    }
    return low;
}

function nearFaces(outline: CutOutline, low: Vec3, high: Vec3, margin: number): OutlineFace[] {
    const { mesh, boxes, index } = outline;
    const faces: OutlineFace[] = [];
    if (mesh === undefined) {
        return faces;
    }
    const consider = (tri: number): void => {
        let meets = true;
        for (let axis = 0; axis < AXES && meets; axis++) {
            meets = boxes[tri * BOX_VALUES + axis]! <= high[axis]! + margin && low[axis]! <= boxes[tri * BOX_VALUES + AXES + axis]! + margin;
        }
        const face = meets ? faceOf(mesh, tri) : undefined;
        if (face) {
            faces.push(face);
        }
    };
    const from = countBelow(index.least, low[index.axis]! - margin - index.widest, false);
    const to = countBelow(index.least, high[index.axis]! + margin, true);
    for (let at = from; at < to; at++) {
        consider(index.sorted[at]!);
    }
    index.big.forEach(consider);
    return faces;
}

function axisDirection(axis: number, sign: number): Vec3 {
    return Array.from({ length: AXES }, (_, at) => (at === axis ? sign : 0)) as Vec3;
}

function boxReach(ofTool: Manifold3D.Box, outside: Manifold3D.Box, reach: number): BoxReach {
    return {
        below: ofTool.min.map((side, axis) => Math.abs(side - outside.min[axis]!) <= reach),
        above: ofTool.max.map((side, axis) => Math.abs(side - outside.max[axis]!) <= reach),
    };
}

function boxShift(vertex: Vec3, ofTool: Manifold3D.Box, sides: BoxReach, reach: number): Vec3 {
    return vertex.map((drawn, axis) => {
        const fromBelow = drawn - ofTool.min[axis]!;
        const fromAbove = ofTool.max[axis]! - drawn;
        const down = sides.below[axis]! && fromBelow <= reach;
        const up = sides.above[axis]! && fromAbove <= reach;
        if (down && (!up || fromBelow <= fromAbove)) {
            return -reach;
        }
        return up ? reach : 0;
    }) as Vec3;
}

function boxReached(tool: Manifold3D.Manifold, ofTool: Manifold3D.Box, sides: BoxReach, reach: number): Manifold3D.Manifold {
    if (!sides.below.includes(true) && !sides.above.includes(true)) {
        return tool.translate([0, 0, 0]);
    }
    return tool.warp((vertex) => {
        const shift = boxShift(vertex, ofTool, sides, reach);
        for (let axis = 0; axis < AXES; axis++) {
            vertex[axis] = vertex[axis]! + shift[axis]!;
        }
    });
}

function reachedBoxSides(outline: CutOutline, sides: BoxReach): FacePlane[] {
    const { box, centre } = outline;
    const planes: FacePlane[] = [];
    for (let axis = 0; axis < AXES; axis++) {
        if (sides.below[axis]) {
            planes.push({ normal: axisDirection(axis, -1), offset: centre[axis]! - box.min[axis]! });
        }
        if (sides.above[axis]) {
            planes.push({ normal: axisDirection(axis, 1), offset: box.max[axis]! - centre[axis]! });
        }
    }
    return planes;
}

function hostFacesNear(outline: CutOutline, ofTool: Manifold3D.Box, sides: BoxReach, reach: number): OutlineFace[] {
    const { centre } = outline;
    const onReachedSides = reachedBoxSides(outline, sides);
    return nearFaces(outline, subtract3(ofTool.min, centre), subtract3(ofTool.max, centre), reach).filter((face) =>
        !onReachedSides.some((side) => dot3(side.normal, face.normal) >= SAME_DIRECTION && Math.abs(side.offset - face.offset) <= reach));
}

function cornersOf(triVerts: Uint32Array, tri: number): [number, number, number] {
    return [triVerts[tri * TRIANGLE_CORNERS]!, triVerts[tri * TRIANGLE_CORNERS + 1]!, triVerts[tri * TRIANGLE_CORNERS + 2]!];
}

function regionsOf(triVerts: Uint32Array, points: readonly Vec3[]): ToolRegions {
    const count = triVerts.length / TRIANGLE_CORNERS;
    const spans = Array.from({ length: count }, (_, tri) => {
        const [a, b, c] = cornersOf(triVerts, tri).map((vert) => points[vert]!) as [Vec3, Vec3, Vec3];
        return cross3(subtract3(b, a), subtract3(c, a));
    });
    const across = new Map<number, number>();
    for (let tri = 0; tri < count; tri++) {
        const corners = cornersOf(triVerts, tri);
        corners.forEach((from, at) => across.set(from * points.length + corners[(at + 1) % TRIANGLE_CORNERS]!, tri));
    }
    const regionOf = new Int32Array(count).fill(-1);
    const regions: ToolRegion[] = [];
    for (let seed = 0; seed < count; seed++) {
        if (regionOf[seed]! >= 0) {
            continue;
        }
        const seedNormal = scale3(spans[seed]!, 1 / length3(spans[seed]!));
        const triangles = [seed];
        regionOf[seed] = regions.length;
        let spanned = spans[seed]!;
        for (let next = 0; next < triangles.length; next++) {
            const corners = cornersOf(triVerts, triangles[next]!);
            corners.forEach((from, at) => {
                const other = across.get(corners[(at + 1) % TRIANGLE_CORNERS]! * points.length + from);
                if (other !== undefined && regionOf[other]! < 0 && dot3(spans[other]!, seedNormal) >= ONE_PLANE * length3(spans[other]!)) {
                    regionOf[other] = regions.length;
                    triangles.push(other);
                    spanned = add3(spanned, spans[other]!);
                }
            });
        }
        const normal = scale3(spanned, 1 / length3(spanned));
        regions.push({ normal, offset: dot3(normal, points[triVerts[seed * TRIANGLE_CORNERS]!]!), triangles });
    }
    return { regions, regionOf };
}

function farthestFrom(points: readonly Vec2[], from: Vec2): Vec2 {
    return points.reduce((farthest, point) => (distance2(point, from) > distance2(farthest, from) ? point : farthest), from);
}

function farthestPair(points: readonly Vec2[]): [Vec2, Vec2] {
    const start = farthestFrom(points, points[0]!);
    return [start, farthestFrom(points, start)];
}

function spansArea(points: readonly Vec2[], reach: number): boolean {
    const [start, end] = farthestPair(points);
    const across = subtract2(end, start);
    const wide = reach * length2(across);
    return points.some((point) => Math.abs(cross2(across, subtract2(point, start))) > wide);
}

function withinTriangle(point: Vec2, corners: readonly Vec2[], reach: number): boolean {
    const turn = Math.sign(cross2(subtract2(corners[1]!, corners[0]!), subtract2(corners[2]!, corners[0]!)));
    return corners.every((from, at) => {
        const edge = subtract2(corners[(at + 1) % corners.length]!, from);
        return (turn * cross2(edge, subtract2(point, from))) / length2(edge) >= -reach;
    });
}

function insidePoints(region: ToolRegion, triVerts: Uint32Array, points: readonly Vec3[]): Vec3[] {
    return region.triangles.flatMap((tri) => {
        const [a, b, c] = cornersOf(triVerts, tri).map((vert) => points[vert]!) as [Vec3, Vec3, Vec3];
        const middleOfAb = between3(a, b, MIDDLE);
        return [middleOfAb, between3(b, c, MIDDLE), between3(c, a, MIDDLE), between3(middleOfAb, c, MIDDLE)];
    });
}

function clearBeyond(region: ToolRegion, triVerts: Uint32Array, points: readonly Vec3[], outline: CutOutline, allowance: number, reach: number): boolean {
    const axes = axesAlong(add3(outline.centre, scale3(region.normal, region.offset)), region.normal)!;
    const footprint = region.triangles.map((tri) => cornersOf(triVerts, tri).map((vert): Vec2 => {
        const [across, along] = pointToLocal(axes, add3(points[vert]!, outline.centre));
        return [across, along];
    }));
    const inFrame = outline.solid!.transform(rigidInverse(axesToMatrix(axes)));
    let section: Manifold3D.CrossSection | undefined;
    let overlap: Manifold3D.CrossSection | undefined;
    try {
        section = inFrame.slice(BEYOND * reach);
        overlap = section.intersect(footprint);
        return overlap.area() <= allowance;
    } finally {
        inFrame.delete();
        section?.delete();
        overlap?.delete();
    }
}

export function releaseOutline(outline: CutOutline): void {
    outline.solid?.delete();
}

function liesOnHost(region: ToolRegion, triVerts: Uint32Array, points: readonly Vec3[], faces: readonly OutlineFace[], outline: CutOutline, reach: number): boolean {
    const corners = [...new Set(region.triangles.flatMap((tri) => cornersOf(triVerts, tri)))].map((vert) => points[vert]!);
    const beneath = faces.filter((face) => dot3(face.normal, region.normal) >= SAME_DIRECTION && corners.every((corner) => Math.abs(dot3(face.normal, corner) - face.offset) <= reach));
    if (beneath.length === 0) {
        return false;
    }
    const axes = axesAlong(ORIGIN, region.normal)!;
    const inPlane = (point: Vec3): Vec2 => {
        const [across, along] = vectorToLocal(axes, point);
        return [across, along];
    };
    const projected = corners.map(inPlane);
    if (!spansArea(projected, reach)) {
        return false;
    }
    const covering = beneath.map((face) => face.corners.map(inPlane));
    const covered = [...projected, ...insidePoints(region, triVerts, points).map(inPlane)].every((point) => covering.some((triangle) => withinTriangle(point, triangle, reach)));
    const [start, end] = farthestPair(projected);
    return covered && clearBeyond(region, triVerts, points, outline, reach * distance2(start, end), reach);
}

function pushOf(plane: CornerPlane, reach: number): number {
    return plane.pushed ? reach : 0;
}

function meetingMove(planes: readonly CornerPlane[], reach: number): Vec3 {
    const [first, second, third] = planes as [CornerPlane, CornerPlane | undefined, CornerPlane | undefined];
    if (second === undefined) {
        return scale3(first.normal, pushOf(first, reach));
    }
    const thirdNormal = third?.normal ?? cross3(first.normal, second.normal);
    const thirdPush = third === undefined ? 0 : pushOf(third, reach);
    const crossOfFirst = cross3(second.normal, thirdNormal);
    const crossOfSecond = cross3(thirdNormal, first.normal);
    const crossOfThird = cross3(first.normal, second.normal);
    const summed = add3(add3(scale3(crossOfFirst, pushOf(first, reach)), scale3(crossOfSecond, pushOf(second, reach))), scale3(crossOfThird, thirdPush));
    return scale3(summed, 1 / dot3(first.normal, crossOfFirst));
}

function cornerMove(planes: readonly CornerPlane[], reach: number): Vec3 | undefined {
    if (planes.length > AXES) {
        return undefined;
    }
    const move = meetingMove(planes, reach);
    return length3(move) <= FARTHEST_SLIDE * reach ? move : undefined;
}

function distinctRegions(at: readonly number[], normals: readonly Vec3[], pushed: readonly boolean[]): number[] | undefined {
    const distinct: number[] = [];
    for (const region of at) {
        const same = distinct.find((other) => dot3(normals[other]!, normals[region]!) >= SAME_DIRECTION);
        if (same === undefined) {
            distinct.push(region);
        } else if (pushed[same] !== pushed[region]) {
            return undefined;
        }
    }
    return distinct;
}

function planesOf(regions: readonly number[], normals: readonly Vec3[], pushed: readonly boolean[]): CornerPlane[] {
    return regions.map((region) => ({ normal: normals[region]!, pushed: pushed[region]! }));
}

function cornerPlanes(atCorner: readonly (readonly number[])[], normals: readonly Vec3[], pushed: readonly boolean[], reach: number): (number[] | undefined)[] {
    return atCorner.map((at) => {
        const distinct = distinctRegions(at, normals, pushed);
        if (distinct === undefined) {
            return undefined;
        }
        if (!distinct.some((region) => pushed[region])) {
            return [];
        }
        return cornerMove(planesOf(distinct, normals, pushed), reach) === undefined ? undefined : distinct;
    });
}

function hasFlushTriangle(triVerts: Uint32Array, points: readonly Vec3[], faces: readonly OutlineFace[], reach: number): boolean {
    for (let tri = 0; tri < triVerts.length / TRIANGLE_CORNERS; tri++) {
        const [a, b, c] = cornersOf(triVerts, tri).map((vert) => points[vert]!) as [Vec3, Vec3, Vec3];
        const spanned = cross3(subtract3(b, a), subtract3(c, a));
        const twiceArea = length3(spanned);
        if (faces.some((face) => dot3(face.normal, spanned) >= SAME_DIRECTION * twiceArea && Math.abs(dot3(face.normal, a) - face.offset) <= reach)) {
            return true;
        }
    }
    return false;
}

function normalsOf(regions: readonly ToolRegion[], triVerts: Uint32Array, points: readonly Vec3[]): Vec3[] {
    return regions.map((region) => {
        const spanned = region.triangles.reduce((sum: Vec3, tri) => {
            const [a, b, c] = cornersOf(triVerts, tri).map((vert) => points[vert]!) as [Vec3, Vec3, Vec3];
            return add3(sum, cross3(subtract3(b, a), subtract3(c, a)));
        }, ORIGIN);
        return scale3(spanned, 1 / length3(spanned));
    });
}

function pushedFaces(triVerts: Uint32Array, points: readonly Vec3[], faces: readonly OutlineFace[], outline: CutOutline, reach: number): ReachedFaces | undefined {
    const { regions, regionOf } = regionsOf(triVerts, points);
    const pushed = regions.map((region) => liesOnHost(region, triVerts, points, faces, outline, reach));
    if (!pushed.includes(true)) {
        return undefined;
    }
    const atCorner: number[][] = points.map(() => []);
    regionOf.forEach((region, tri) => {
        for (const corner of cornersOf(triVerts, tri)) {
            if (region >= 0 && !atCorner[corner]!.includes(region)) {
                atCorner[corner]!.push(region);
            }
        }
    });
    const normals = regions.map((region) => region.normal);
    let planesAt = cornerPlanes(atCorner, normals, pushed, reach);
    while (planesAt.includes(undefined)) {
        planesAt.forEach((planes, corner) => {
            if (planes === undefined) {
                atCorner[corner]!.forEach((region) => {
                    pushed[region] = false;
                });
            }
        });
        planesAt = cornerPlanes(atCorner, normals, pushed, reach);
    }
    return pushed.includes(true) ? { regions, planesAt: planesAt as number[][], pushed } : undefined;
}

export function reachedThrough(tool: Manifold3D.Manifold, outline: CutOutline, reach: number): Manifold3D.Manifold {
    const ofTool = tool.boundingBox();
    const sides = boxReach(ofTool, outline.box, reach);
    const faces = hostFacesNear(outline, ofTool, sides, reach);
    if (faces.length === 0) {
        return boxReached(tool, ofTool, sides, reach);
    }
    const mesh = centredMesh(tool, outline.centre);
    const points = pointsOf(mesh);
    const reached = hasFlushTriangle(mesh.triVerts, points, faces, reach) ? pushedFaces(mesh.triVerts, points, faces, outline, reach) : undefined;
    if (reached === undefined) {
        return boxReached(tool, ofTool, sides, reach);
    }
    return tool.warpBatch((verts, count) => {
        const drawn = Array.from({ length: count }, (_, vert): Vec3 => [verts[vert * AXES]!, verts[vert * AXES + 1]!, verts[vert * AXES + 2]!]);
        const centred = drawn.map((point) => subtract3(point, outline.centre));
        const normals = normalsOf(reached.regions, mesh.triVerts, centred);
        drawn.forEach((point, vert) => {
            const planes = reached.planesAt[vert]!;
            const move = planes.length === 0 ? ORIGIN : meetingMove(planesOf(planes, normals, reached.pushed), reach);
            const shift = add3(move, boxShift(point, ofTool, sides, reach));
            for (let axis = 0; axis < AXES; axis++) {
                verts[vert * AXES + axis] = point[axis]! + shift[axis]!;
            }
        });
    });
}
