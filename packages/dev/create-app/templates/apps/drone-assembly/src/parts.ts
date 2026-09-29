import type { Occt, Point3, Shape, Wire } from "./kernel";

type Trihedron = Parameters<Occt["operations"]["pipeWireCylindrical"]>[0]["trihedronEnum"];

const TRIHEDRON = { constantNormal: "isConstantNormal" as Trihedron, correctedFrenet: "isCorrectedFrenet" as Trihedron };

export const FRAME = {
    plate: { length: 150, width: 96, thickness: 3, corner: 26, openingRadius: 6, hex: { width: 56, depth: 20, across: 5, rows: 2, scale: 0.8, at: 60 } },
    gap: 10,
    armRoot: 28,
    arm: { rootWidth: 26, tipWidth: 16, height: 10, padRadius: 15, hexFrom: 62, hexPitch: 24, hexWall: 3.5, hexRound: 1.2 },
    hatch: { length: 50, width: 34, corner: 9, thickness: 1.4 },
    honeycomb: { grow: 1.02, rows: 3, acrossLong: 8, acrossShort: 5, scale: 0.8, round: 0.35 },
    motor: { baseRadius: 13, bellRadius: 14, wall: 1.6, shaftRadius: 2.5, height: 28, boltCircle: 8, slots: 8 },
    propeller: { hubRadius: 8, hubBelow: 5, hubAbove: 7, junctionFillet: 0.6 },
    canopy: { height: 32, forward: 4, hatchForward: 10 },
    standoff: { radius: 3.2, ring: 40 },
    leg: { drop: 46, reach: 26, tube: 4, ring: 52, boss: 5.5, flange: 20, boltOffset: 7.5, entry: 12, bends: [12, 6] as [number, number] },
    damper: { cap: 6.5, capHeight: 4, barrel: 5.5, collar: 6.2, rod: 2.2, length: 30 },
    spring: { radius: 4.2, wire: 0.9, pitch: 2.8, height: 12.5, bottom: 29.8 },
    foot: { height: 10, rings: [[0, 3.2], [-2, 7], [-5, 9.5], [-8, 9], [-10, 7]] as [number, number][] },
    bolt: { headRadius: 2.75, headHeight: 3, shankRadius: 1.5 },
    emblem: { width: 26, thickness: 1, inset: 0.96 },
    gps: { mastRadius: 2.5, mastHeight: 34, puckRadius: 11, puckHeight: 6 },
    antenna: { radius: 1.5, length: 42 },
} as const;

export const PLATE_TOP = FRAME.plate.thickness;
export const ARM_TOP = PLATE_TOP + FRAME.gap;
export const TOP_PLATE_TOP = ARM_TOP + FRAME.plate.thickness;
export const CANOPY_TOP = TOP_PLATE_TOP + FRAME.canopy.height;
export const MOTOR_TOP = ARM_TOP + FRAME.motor.height;
export const GROUND_LIFT = FRAME.leg.drop + FRAME.damper.length + FRAME.foot.height;
export const HATCH_TOP = CANOPY_TOP + FRAME.hatch.thickness;
export const armRootWidth = (arms: number): number => Math.min(FRAME.arm.rootWidth, Math.round(2 * FRAME.armRoot * Math.sin(Math.PI / arms) * 0.9));

async function roundedRect(occt: Occt, width: number, length: number, radius: number, center: Point3, direction: Point3 = [0, 1, 0]): Promise<Wire> {
    const rectangle = await occt.shapes.wire.createRectangleWire({ width, length, center, direction });
    return occt.fillets.fillet2d({ shape: rectangle, radius });
}

async function prism(occt: Occt, outline: Wire, direction: Point3): Promise<Shape> {
    const face = await occt.shapes.face.createFaceFromWire({ shape: outline, planar: true });
    return occt.operations.extrude({ shape: face, direction });
}

function winding(points: number[][]): number {
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
        const [ax = 0, , az = 0] = points[i] ?? [];
        const [bx = 0, , bz = 0] = points[(i + 1) % points.length] ?? [];
        sum += ax * bz - bx * az;
    }
    return sum;
}

export async function faceWithHoles(occt: Occt, outline: Wire, holes: Wire[]): Promise<Shape> {
    if (holes.length === 0) return occt.shapes.face.createFaceFromWire({ shape: outline, planar: true });
    const all = await occt.shapes.compound.makeCompound({ shapes: [outline, ...holes] });
    const runs = await occt.shapes.wire.wiresToPoints({ shape: all, angularDeflection: 0.1, curvatureDeflection: 0.1, minimumOfPoints: 2, uTolerance: 1e-9, minimumLength: 1e-7 });
    const [outlineRun = [], ...holeRuns] = runs;
    const outer = Math.sign(winding(outlineRun));
    const turned: Wire[] = [];
    for (const [i, hole] of holes.entries()) {
        turned.push(Math.sign(winding(holeRuns[i] ?? [])) === outer ? await occt.shapes.wire.reversedWire({ shape: hole }) : hole);
    }
    return occt.shapes.face.createFaceFromWires({ shapes: [outline, ...turned], planar: true });
}

async function revolved(occt: Occt, profile: Point3[]): Promise<Shape> {
    const wire = await occt.shapes.wire.createPolygonWire({ points: profile });
    const face = await occt.shapes.face.createFaceFromWire({ shape: wire, planar: true });
    return occt.operations.revolve({ shape: face, angle: 360, direction: [0, 1, 0], copy: false });
}

export async function plate(occt: Occt): Promise<Shape> {
    const p = FRAME.plate;
    const outline = await roundedRect(occt, p.width, p.length, p.corner, [0, 0, 0]);
    const openings: Wire[] = [];
    for (const angle of [45, 135, 225, 315]) {
        const a = (angle * Math.PI) / 180;
        openings.push(await occt.shapes.wire.createCircleWire({ radius: p.openingRadius, center: [FRAME.leg.ring * Math.cos(a), 0, -FRAME.leg.ring * Math.sin(a)], direction: [0, 1, 0] }));
    }
    const cells = await occt.shapes.wire.hexagonsInGrid({ width: p.hex.width, height: p.hex.depth, nrHexagonsInWidth: p.hex.across, nrHexagonsInHeight: p.hex.rows, flatTop: true, scalePatternWidth: [p.hex.scale], scalePatternHeight: [p.hex.scale] });
    const zones: Wire[] = [];
    for (const z of [p.hex.at, -p.hex.at]) {
        for (const cell of cells) zones.push(await occt.transforms.translate({ shape: cell, translation: [0, 0, z] }));
    }
    const face = await faceWithHoles(occt, outline, [...openings, ...zones]);
    return occt.operations.extrude({ shape: face, direction: [0, p.thickness, 0] });
}

export async function honeycomb(occt: Occt): Promise<Shape> {
    const h = FRAME.honeycomb;
    const shell = await canopy(occt);
    const centre = await occt.operations.boundingBoxCenterOfShape({ shape: shell });
    const grown = await occt.transforms.scale3d({ shape: shell, scale: [h.grow, h.grow, h.grow], center: [centre[0], 0, centre[2]] });
    const faces = await occt.shapes.face.getFaces({ shape: grown });
    const areas = await occt.shapes.face.getFacesAreas({ shapes: faces });
    const largest = Math.max(...areas.slice(0, -2));
    const wires: Wire[] = [];
    for (const [i, face] of faces.entries()) {
        const normal = await occt.shapes.face.normalOnUV({ shape: face, paramU: 0.5, paramV: 0.5 });
        if (Math.abs(normal[1]) > 0.9) continue;
        const across = (areas[i] ?? 0) > largest * 0.7 ? h.acrossLong : h.acrossShort;
        wires.push(...await occt.shapes.face.subdivideToHexagonWires({ shape: face, nrHexagonsU: across, nrHexagonsV: h.rows, flatU: false, scalePatternU: [h.scale], scalePatternV: [h.scale], filletPattern: [h.round], offsetFromBorderU: 0.05, offsetFromBorderV: 0.08 }));
    }
    return occt.shapes.compound.makeCompound({ shapes: wires });
}

export async function canopy(occt: Occt): Promise<Shape> {
    const c = FRAME.canopy;
    const sections: [number, number, number, number, number][] = [
        [0, 140, 90, 26, c.forward],
        [12, 132, 84, 24, c.forward + 2],
        [22, 110, 70, 19, c.forward + 5],
        [29, 76, 48, 13, c.hatchForward],
        [c.height, 52, 36, 10, c.hatchForward],
    ];
    const wires: Wire[] = [];
    for (const [y, length, width, radius, forward] of sections) wires.push(await roundedRect(occt, width, length, radius, [0, y, forward]));
    return occt.operations.loft({ shapes: wires, makeSolid: true });
}

export function armCutouts(armLength: number, rootWidth: number): { x: number; radius: number }[] {
    const a = FRAME.arm;
    const tipX = armLength - a.padRadius + 3;
    const cutouts: { x: number; radius: number }[] = [];
    for (let x = a.hexFrom; x < armLength - a.padRadius - 19; x += a.hexPitch) {
        const width = rootWidth + (a.tipWidth - rootWidth) * ((x - FRAME.armRoot) / (tipX - FRAME.armRoot));
        cutouts.push({ x, radius: Math.max(width / 2 - a.hexWall, 2.5) });
    }
    return cutouts;
}

export async function arm(occt: Occt, armLength: number, rootWidth: number): Promise<Shape> {
    const a = FRAME.arm;
    const tipX = armLength - a.padRadius + 3;
    const plan = await occt.shapes.wire.createPolygonWire({ points: [[FRAME.armRoot, 0, -rootWidth / 2], [tipX, 0, -a.tipWidth / 2], [tipX, 0, a.tipWidth / 2], [FRAME.armRoot, 0, rootWidth / 2]] });
    const outline = await occt.fillets.fillet2d({ shape: plan, radius: 4 });
    const cutouts: Wire[] = [];
    for (const cutout of armCutouts(armLength, rootWidth)) {
        const hexagon = await occt.shapes.wire.createNGonWire({ nrCorners: 6, radius: cutout.radius, center: [cutout.x, 0, 0], direction: [0, 1, 0] });
        cutouts.push(await occt.fillets.fillet2d({ shape: hexagon, radius: a.hexRound }));
    }
    const face = await faceWithHoles(occt, outline, cutouts);
    const slab = await occt.operations.extrude({ shape: face, direction: [0, a.height, 0] });
    const lifted = await occt.transforms.translate({ shape: slab, translation: [0, PLATE_TOP, 0] });
    const pad = await occt.shapes.solid.createCylinder({ radius: a.padRadius, height: a.height, center: [armLength, PLATE_TOP, 0], direction: [0, 1, 0] });
    return occt.booleans.union({ shapes: [lifted, pad], keepEdges: false });
}

export async function motor(occt: Occt): Promise<Shape> {
    const m = FRAME.motor;
    const bellTop = 20;
    const body = await revolved(occt, [
        [0, 0, 0], [m.baseRadius, 0, 0], [m.baseRadius, 3, 0], [8, 3, 0], [8, 6, 0],
        [m.bellRadius, 6, 0], [m.bellRadius, bellTop - 1, 0], [m.bellRadius - 1.2, bellTop, 0], [6, bellTop, 0], [6, bellTop + 2, 0],
        [m.shaftRadius, bellTop + 2, 0], [m.shaftRadius, m.height, 0], [0, m.height, 0],
    ]);
    const cavity = await occt.shapes.solid.createCylinder({ radius: m.bellRadius - m.wall, height: 12, center: [0, 6, 0], direction: [0, 1, 0] });
    const bearingTube = await occt.shapes.solid.createCylinder({ radius: 4, height: 14, center: [0, 5, 0], direction: [0, 1, 0] });
    const ring = await occt.booleans.difference({ shape: cavity, shapes: [bearingTube], keepEdges: false });
    const tools: Shape[] = [ring];
    for (let i = 0; i < m.slots; i++) {
        const slot = await occt.shapes.solid.createBox({ width: 2.2, length: 8, height: 9, center: [0, 13, m.bellRadius - 2] });
        tools.push(await occt.transforms.rotate({ shape: slot, axis: [0, 1, 0], angle: (360 / m.slots) * i }));
    }
    return occt.booleans.difference({ shape: body, shapes: tools, keepEdges: false });
}

export async function stator(occt: Occt): Promise<Shape> {
    return occt.shapes.solid.createCylinder({ radius: FRAME.motor.bellRadius - FRAME.motor.wall - 0.6, height: 11, center: [0, 6.5, 0], direction: [0, 1, 0] });
}

export async function propeller(occt: Occt, diameter: number): Promise<Shape> {
    const p = FRAME.propeller;
    const handed = 1;
    const root = p.hubRadius - 2;
    const span = diameter / 2 - root;
    const stations: [number, number, number, number, number][] = [
        [0, 12, 3.2, 38, 0],
        [0.25, 17, 2.4, 24, 0.6],
        [0.5, 15.5, 1.8, 16, 1.8],
        [0.78, 11, 1.4, 11, 3.6],
        [1, 4.5, 1, 8, 6],
    ];
    const sections: Wire[] = [];
    for (const [t, chord, thickness, twist, sweep] of stations) {
        const r = root + span * t;
        const ellipse = await occt.shapes.wire.createEllipseWire({ center: [r, 0, sweep], direction: [1, 0, 0], radiusMinor: thickness / 2, radiusMajor: chord / 2 });
        sections.push(await occt.transforms.rotateAroundCenter({ shape: ellipse, angle: handed * twist, center: [r, 0, sweep], axis: [1, 0, 0] }));
    }
    const blade = await occt.operations.loft({ shapes: sections, makeSolid: true });
    const other = await occt.transforms.rotate({ shape: blade, axis: [0, 1, 0], angle: 180 });
    const hub = await revolved(occt, [[0, -p.hubBelow, 0], [p.hubRadius, -p.hubBelow, 0], [p.hubRadius, p.hubAbove - 2.5, 0], [p.hubRadius - 1.5, p.hubAbove - 0.8, 0], [4.5, p.hubAbove, 0], [0, p.hubAbove, 0]]);
    const fused = await occt.booleans.union({ shapes: [hub, blade, other], keepEdges: false });
    const edges = await occt.shapes.edge.getEdges({ shape: fused });
    const centers = await occt.shapes.edge.getEdgesCentersOfMass({ shapes: edges });
    const junction = [];
    for (const [i, edge] of edges.entries()) {
        const c = centers[i];
        if (c && Math.abs(Math.hypot(c[0], c[2]) - p.hubRadius) < 0.6 && !await occt.shapes.edge.isEdgeCircular({ shape: edge })) junction.push(edge);
    }
    if (junction.length === 0) return fused;
    try {
        return await occt.fillets.filletEdgesListOneRadius({ shape: fused, edges: junction, radius: p.junctionFillet });
    } catch {
        return fused;
    }
}

export async function mirrored(occt: Occt, shape: Shape): Promise<Shape> {
    return occt.transforms.mirrorAlongNormal({ shape, origin: [0, 0, 0], normal: [0, 0, 1] });
}

export async function bolt(occt: Occt, length: number): Promise<Shape> {
    const b = FRAME.bolt;
    const body = await revolved(occt, [
        [0, -b.headHeight, 0], [b.headRadius - 0.4, -b.headHeight, 0], [b.headRadius, -b.headHeight + 0.4, 0], [b.headRadius, 0, 0],
        [b.shankRadius, 0, 0], [b.shankRadius, length - 0.4, 0], [b.shankRadius - 0.4, length, 0], [0, length, 0],
    ]);
    const socketOutline = await occt.shapes.wire.createNGonWire({ nrCorners: 6, radius: 1.45, center: [0, -b.headHeight - 0.5, 0], direction: [0, 1, 0] });
    const socket = await prism(occt, socketOutline, [0, 2.5, 0]);
    return occt.booleans.difference({ shape: body, shapes: [socket], keepEdges: false });
}

export async function nut(occt: Occt): Promise<Shape> {
    const height = 3.5;
    const hexOutline = await occt.shapes.wire.createNGonWire({ nrCorners: 6, radius: 3.6, center: [0, 0, 0], direction: [0, 1, 0] });
    const hex = await prism(occt, hexOutline, [0, height, 0]);
    const silhouette = await revolved(occt, [[0, 0, 0], [2.9, 0, 0], [3.7, 0.7, 0], [3.7, height - 0.7, 0], [2.9, height, 0], [0, height, 0]]);
    return occt.booleans.intersection({ shapes: [hex, silhouette], keepEdges: false });
}

export async function standoff(occt: Occt): Promise<Shape> {
    return occt.shapes.solid.createCylinder({ radius: FRAME.standoff.radius, height: FRAME.gap, center: [0, 0, 0], direction: [0, 1, 0] });
}

export async function leg(occt: Occt): Promise<Shape> {
    const l = FRAME.leg;
    const path = await occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [6, -18, 0], [l.reach, -l.drop + l.entry, 0], [l.reach, -l.drop - FRAME.damper.capHeight / 2, 0]] });
    const rounded = await occt.fillets.fillet3DWire({ shape: path, radiusList: [...l.bends], indexes: [0, 1], direction: [0, 0, 1] });
    const tube = await occt.operations.pipeWireCylindrical({ shape: rounded, radius: l.tube, makeSolid: true, trihedronEnum: TRIHEDRON.constantNormal, forceApproxC1: false });
    const flange = await occt.shapes.solid.createBox({ width: l.flange, length: 12, height: 3, center: [0, -1.5, 0] });
    const boss = await occt.shapes.solid.createCylinder({ radius: l.boss, height: 3 + FRAME.plate.thickness + 0.4, center: [0, -3, 0], direction: [0, 1, 0] });
    return occt.booleans.union({ shapes: [tube, flange, boss], keepEdges: false });
}

export async function damper(occt: Occt): Promise<Shape> {
    const d = FRAME.damper;
    return revolved(occt, [
        [0, 0, 0], [d.cap, 0, 0], [d.cap, -d.capHeight, 0], [d.barrel, -d.capHeight - 0.5, 0], [d.barrel, -14, 0], [d.collar, -14, 0], [d.collar, -16.5, 0],
        [4, -16.5, 0], [4, -18, 0], [d.rod, -18, 0], [d.rod, -d.length, 0], [0, -d.length, 0],
    ]);
}

export async function spring(occt: Occt): Promise<Shape> {
    const s = FRAME.spring;
    const helix = await occt.shapes.wire.createHelixWire({ radius: s.radius, pitch: s.pitch, height: s.height, center: [0, -s.bottom, 0], direction: [0, 1, 0], clockwise: false, tolerance: 1e-4 });
    return occt.operations.pipeWireCylindrical({ shape: helix, radius: s.wire, makeSolid: true, trihedronEnum: TRIHEDRON.correctedFrenet, forceApproxC1: false });
}

export async function foot(occt: Occt): Promise<Shape> {
    const rings: Wire[] = [];
    for (const [y, radius] of FRAME.foot.rings) rings.push(await occt.shapes.wire.createCircleWire({ radius, center: [0, y, 0], direction: [0, 1, 0] }));
    return occt.operations.loft({ shapes: rings, makeSolid: true });
}

export async function led(occt: Occt): Promise<Shape> {
    const dome = await occt.shapes.solid.createSphere({ radius: 3, center: [0, 0, 0] });
    const upper = await occt.shapes.solid.createBox({ width: 8, length: 8, height: 4, center: [0, 2, 0] });
    return occt.booleans.difference({ shape: dome, shapes: [upper], keepEdges: false });
}

export async function gimbal(occt: Occt): Promise<Shape> {
    const outline = await occt.shapes.wire.createPolygonWire({ points: [[-4, 19, -4], [19.5, 19, -4], [19.5, -7, -4], [14.5, -7, -4], [14.5, 15, -4], [-4, 15, -4]] });
    const rounded = await occt.fillets.fillet2d({ shape: outline, radius: 1.5 });
    const bracket = await prism(occt, rounded, [0, 0, 8]);
    const yaw = await occt.shapes.solid.createCylinder({ radius: 9, height: 8, center: [0, 18, 0], direction: [0, 1, 0] });
    const roll = await occt.shapes.solid.createCylinder({ radius: 6, height: 5, center: [14.5, 0, 0], direction: [-1, 0, 0] });
    return occt.booleans.union({ shapes: [yaw, bracket, roll], keepEdges: false });
}

export async function camera(occt: Occt): Promise<Shape> {
    const body = await occt.shapes.solid.createBox({ width: 24, length: 20, height: 18, center: [0, 0, 0] });
    const soft = await occt.fillets.filletEdges({ shape: body, radius: 3 });
    const barrel = await occt.shapes.solid.createCylinder({ radius: 6.5, height: 9, center: [0, 0, 8], direction: [0, 0, 1] });
    return occt.booleans.union({ shapes: [soft, barrel], keepEdges: false });
}

export async function lens(occt: Occt): Promise<Shape> {
    return occt.shapes.solid.createCylinder({ radius: 5.2, height: 1.5, center: [0, 0, 16.5], direction: [0, 0, 1] });
}

export async function battery(occt: Occt): Promise<Shape> {
    const brick = await occt.shapes.solid.createBox({ width: 36, length: 72, height: 26, center: [0, 0, 0] });
    return occt.fillets.filletEdges({ shape: brick, radius: 3 });
}

export async function strap(occt: Occt): Promise<Shape> {
    const outer = await occt.shapes.solid.createBox({ width: 40, length: 10, height: 30, center: [0, 0, 0] });
    const inner = await occt.shapes.solid.createBox({ width: 36.5, length: 12, height: 26.5, center: [0, 0, 0] });
    return occt.booleans.difference({ shape: outer, shapes: [inner], keepEdges: false });
}

export async function gps(occt: Occt): Promise<Shape> {
    const g = FRAME.gps;
    const mast = await occt.shapes.solid.createCylinder({ radius: g.mastRadius, height: g.mastHeight, center: [0, 0, 0], direction: [0, 1, 0] });
    const puck = await occt.shapes.solid.createCylinder({ radius: g.puckRadius, height: g.puckHeight, center: [0, g.mastHeight, 0], direction: [0, 1, 0] });
    const rounded = await occt.fillets.filletEdges({ shape: puck, radius: 1.5 });
    return occt.booleans.union({ shapes: [mast, rounded], keepEdges: false });
}

export async function antenna(occt: Occt): Promise<Shape> {
    const a = FRAME.antenna;
    const rod = await occt.shapes.solid.createCylinder({ radius: a.radius, height: a.length, center: [0, 0, 0], direction: [0, 1, 0] });
    const tip = await occt.shapes.solid.createSphere({ radius: a.radius, center: [0, a.length, 0] });
    return occt.booleans.union({ shapes: [rod, tip], keepEdges: false });
}

export async function logoFaces(occt: Occt, logo: Shape, width: number): Promise<Shape> {
    const mirrored = await occt.transforms.mirrorAlongNormal({ shape: logo, origin: [0, 0, 0], normal: [1, 0, 0] });
    const size = await occt.operations.boundingBoxSizeOfShape({ shape: mirrored });
    const scaled = await occt.transforms.scale({ shape: mirrored, factor: width / Math.max(size[0], size[2]) });
    const box = await occt.operations.boundingBoxOfShape({ shape: scaled });
    return occt.transforms.translate({ shape: scaled, translation: [-box.center[0], -box.min[1], -box.center[2]] });
}

export async function hatch(occt: Occt, logo?: Shape): Promise<Shape> {
    const h = FRAME.hatch;
    const outline = await roundedRect(occt, h.width, h.length, h.corner, [0, 0, 0]);
    const holes = logo ? await occt.shapes.wire.getWires({ shape: await logoFaces(occt, logo, FRAME.emblem.width) }) : [];
    const face = await faceWithHoles(occt, outline, holes);
    return occt.operations.extrude({ shape: face, direction: [0, h.thickness, 0] });
}

export async function emblem(occt: Occt, logo: Shape, width: number, thickness: number): Promise<Shape> {
    const faces = await occt.shapes.face.getFaces({ shape: await logoFaces(occt, logo, width * FRAME.emblem.inset) });
    const solids: Shape[] = [];
    for (const face of faces) solids.push(await occt.operations.extrude({ shape: face, direction: [0, thickness, 0] }));
    return occt.shapes.compound.makeCompound({ shapes: solids });
}
