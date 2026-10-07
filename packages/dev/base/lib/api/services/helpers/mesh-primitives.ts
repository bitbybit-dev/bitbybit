import type { MeshArrays } from "./helper-types";
import { ICOSAHEDRON_FACES, ICOSAHEDRON_POINTS } from "./mesh-primitives.constants";

function onUnitSphere([x, y, z]: readonly [number, number, number]): [number, number, number] {
    const length = Math.hypot(x, y, z);
    return [x / length, y / length, z / length];
}

export const icosphere = (detail: number): MeshArrays => {
    const points = ICOSAHEDRON_POINTS.map(onUnitSphere);
    let faces = ICOSAHEDRON_FACES;
    for (let level = 0; level < detail; level++) {
        const middles = new Map<string, number>();
        const middle = (a: number, b: number): number => {
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            let index = middles.get(key);
            if (index === undefined) {
                const [p, q] = [points[a]!, points[b]!];
                index = points.push(onUnitSphere([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2])) - 1;
                middles.set(key, index);
            }
            return index;
        };
        faces = faces.flatMap(([a, b, c]): [number, number, number][] => {
            const [ab, bc, ca] = [middle(a, b), middle(b, c), middle(c, a)];
            return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]];
        });
    }
    return { positions: points.flat(), indices: faces.flat() };
};

export const frustum = (sides: number, bottomRadius: number, topRadius: number, height: number): MeshArrays => {
    const positions: number[] = [0, 0, 0, 0, 0, height];
    for (const [radius, z] of [[bottomRadius, 0], [topRadius, height]] as const) {
        for (let side = 0; side < sides; side++) {
            const angle = side / sides * 2 * Math.PI;
            positions.push(radius * Math.cos(angle), radius * Math.sin(angle), z);
        }
    }
    const bottom = (side: number): number => 2 + side % sides;
    const top = (side: number): number => 2 + sides + side % sides;
    const indices: number[] = [];
    for (let side = 0; side < sides; side++) {
        indices.push(0, bottom(side + 1), bottom(side));
        indices.push(1, top(side), top(side + 1));
        indices.push(bottom(side), bottom(side + 1), top(side + 1));
        indices.push(bottom(side), top(side + 1), top(side));
    }
    return { positions, indices };
};
