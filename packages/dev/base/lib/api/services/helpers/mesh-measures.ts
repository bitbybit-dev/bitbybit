const CORNERS = 3;
const TETRAHEDRA_PER_PARALLELEPIPED = 6;

export const signedVolumeOf = (positions: ArrayLike<number>, indices: ArrayLike<number>, start = 0, end = indices.length): number => {
    if (end <= start) {
        return 0;
    }
    const origin = indices[start]! * CORNERS;
    const ox = positions[origin]!;
    const oy = positions[origin + 1]!;
    const oz = positions[origin + 2]!;
    let sixfold = 0;
    for (let at = start; at + 2 < end; at += CORNERS) {
        const a = indices[at]! * CORNERS;
        const b = indices[at + 1]! * CORNERS;
        const c = indices[at + 2]! * CORNERS;
        const ax = positions[a]! - ox;
        const ay = positions[a + 1]! - oy;
        const az = positions[a + 2]! - oz;
        const bx = positions[b]! - ox;
        const by = positions[b + 1]! - oy;
        const bz = positions[b + 2]! - oz;
        const cx = positions[c]! - ox;
        const cy = positions[c + 1]! - oy;
        const cz = positions[c + 2]! - oz;
        sixfold += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
    }
    return sixfold / TETRAHEDRA_PER_PARALLELEPIPED;
};
