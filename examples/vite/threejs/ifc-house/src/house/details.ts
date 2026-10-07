import { Inputs } from "@bitbybit-dev/threejs";
import {
    BOARD, CANTILEVER_DRIP, CARPORT, CARPORT_DECK_BOTTOM, CAVITY, COPING, DECK_TOP, GLASS_RAIL, RAILS, STUDY_GLAZING, DOOR_TYPES, DOORS, FACADE_DEPTH, FIRST_FLOOR_ELEVATION, FIRST_FLOOR_EAST_FACE, FIRST_FLOOR_WALL_TOP, FIRST_INTERIOR,
    GROUND_INTERIOR, PARAPET_INSET, PARAPET_TOP, ROOF_DEPTH, SILLED_WINDOWS, SLAB_DEPTH, STAIR, SURROUNDED_WINDOWS, TIMBER_WALL, WALL_RUNS, WINDOW_TYPES, WINDOWS, railLine, thicknessOf,
} from "./house-plan";
import type { DetailSpec, FacadeLine, FacadeOpening, FacadeSide, FillingSpec, WallSide } from "./house-types";

const { memberPredefinedTypeEnum } = Inputs.IFC;
const BOARD_PLANE = TIMBER_WALL + CAVITY + BOARD.thickness / 2;
const FLASHING = { height: 0.06, projection: 0.03 };
const ABOVE_FLASHING = -SLAB_DEPTH + FLASHING.height;
const SURROUND = { thickness: 0.03, projection: 0.15 };
const SILL = { thickness: 0.03, drip: 0.04 };
const FRAME_DEPTH = 0.09;
const MIN_PIECE = 0.02;
const CORNER_BOARD_LIMIT = FIRST_INTERIOR.y0 - TIMBER_WALL - CAVITY;
const ROOF_TOP = FIRST_FLOOR_WALL_TOP + ROOF_DEPTH;
const SOLAR = { width: 1.13, length: 1.72, thickness: 0.04, lift: 0.15, tilt: 10, gap: 0.05, rows: [-1.2, 1.6], columns: 7, firstColumn: 1.2 };
const SOLAR_RAIL = { width: 0.06, inset: 0.1, clearance: 0.003 };
const STRINGER = { thickness: 0.012, depth: 0.22, below: 0.08, past: 0.03 };
const HANDRAIL = { radius: 0.021, height: 0.9, wallGap: 0.02 };
const BALUSTER = { radius: 0.008, below: 0.05, underRail: 0.015 };
const DOWNPIPE = { radius: 0.05, standoff: 0.09, positions: [0.45, 10.5] };
const HOPPER = { height: 0.25, width: 0.22, depth: 0.17, belowCoping: 0.51 };
const CANOPY = {
    from: 5.75, to: 8.35, projection: 1.4, underside: 2.75, cover: 0.02, upstand: 0.02,
    fascia: { thickness: 0.03, depth: 0.14 },
    slat: { width: 0.06, gap: 0.02, depth: 0.03, above: 0.03 },
    lights: [6.665, 7.915], light: { radius: 0.035, depth: 0.01, out: 0.7 },
};

const FIRST_SIDES: FacadeSide[] = [
    { wall: "ff-south", along: "x", line: FIRST_INTERIOR.y0, outward: -1, from: -FACADE_DEPTH, to: FIRST_INTERIOR.x1 + FACADE_DEPTH, start: FIRST_INTERIOR.x0, direction: 1 },
    { wall: "ff-north", along: "x", line: FIRST_INTERIOR.y1, outward: 1, from: -FACADE_DEPTH, to: FIRST_INTERIOR.x1 + FACADE_DEPTH, start: FIRST_INTERIOR.x1, direction: -1 },
    { wall: "ff-west", along: "y", line: FIRST_INTERIOR.x0, outward: -1, from: CORNER_BOARD_LIMIT, to: FIRST_INTERIOR.y1 + TIMBER_WALL + CAVITY, start: FIRST_INTERIOR.y1, direction: -1 },
    { wall: "ff-east", along: "y", line: FIRST_INTERIOR.x1, outward: 1, from: CORNER_BOARD_LIMIT, to: FIRST_INTERIOR.y1 + TIMBER_WALL + CAVITY, start: FIRST_INTERIOR.y0, direction: 1 },
];

function sideOfWall(wall: string): WallSide {
    const run = WALL_RUNS.find((candidate) => candidate.walls.some((spec) => spec.id === wall));
    const spec = run?.walls.find((candidate) => candidate.id === wall);
    if (!run || !spec) {
        throw new Error(`The plan has no wall '${wall}'`);
    }
    const along = spec.start[1] === spec.end[1] ? "x" : "y";
    const axis = along === "x" ? 0 : 1;
    const direction = spec.end[axis] > spec.start[axis] ? 1 : -1;
    const outward = along === "x" ? -direction as 1 | -1 : direction;
    const thickness = run.layerSet === "Timber frame wall" ? TIMBER_WALL : FACADE_DEPTH;
    return { wall, along, line: spec.start[1 - axis], outward, start: spec.start[axis], direction, thickness, baseOffset: run.baseOffset };
}

function sizeOf(filling: FillingSpec): { width: number; height: number } {
    const type = WINDOW_TYPES.find((candidate) => candidate.id === filling.type) ?? DOOR_TYPES.find((candidate) => candidate.id === filling.type);
    if (!type) {
        throw new Error(`The plan has no type '${filling.type}'`);
    }
    return type;
}

function openingOf(filling: FillingSpec, side: FacadeLine & { baseOffset?: number }): FacadeOpening {
    const { width, height } = sizeOf(filling);
    const from = side.direction > 0 ? side.start + filling.offset : side.start - filling.offset - width;
    const bottom = filling.sill + (side.baseOffset ?? -SLAB_DEPTH);
    return { id: filling.id, from, to: from + width, bottom, top: bottom + height };
}

function point(side: FacadeLine, u: number, depth: number, z: number): Inputs.Base.Point3 {
    const across = side.line + side.outward * depth;
    return side.along === "x" ? [u, across, z] : [across, u, z];
}

function boardBottom(side: FacadeSide, to: number): number {
    if (side.wall === "ff-south") {
        return CANTILEVER_DRIP;
    }
    if (side.wall === "ff-north") {
        return to > FIRST_FLOOR_EAST_FACE ? DECK_TOP : ABOVE_FLASHING;
    }
    if (to <= -FACADE_DEPTH) {
        return CANTILEVER_DRIP;
    }
    return side.wall === "ff-west" ? ABOVE_FLASHING : DECK_TOP;
}

function cutAround(bottom: number, top: number, from: number, to: number, openings: readonly FacadeOpening[]): [number, number][] {
    let pieces: [number, number][] = [[bottom, top]];
    for (const opening of openings) {
        if (to <= opening.from || from >= opening.to) {
            continue;
        }
        pieces = pieces.flatMap(([low, high]): [number, number][] => {
            if (high <= opening.bottom || low >= opening.top) {
                return [[low, high]];
            }
            const below: [number, number] = [low, Math.min(high, opening.bottom)];
            const above: [number, number] = [Math.max(low, opening.top), high];
            return [below, above].filter(([a, b]) => b - a > MIN_PIECE);
        });
    }
    return pieces;
}

function facadeOpenings(side: FacadeSide): FacadeOpening[] {
    return [...WINDOWS, ...DOORS].filter((filling) => filling.wall === side.wall).map((filling) => openingOf(filling, side));
}

function claddingBoards(): DetailSpec[] {
    const boards: DetailSpec[] = [];
    const pitch = BOARD.width + BOARD.gap;
    for (const side of FIRST_SIDES) {
        const openings = facadeOpenings(side);
        const count = Math.floor((side.to - side.from + BOARD.gap) / pitch);
        const first = side.from + (side.to - side.from - (count * pitch - BOARD.gap)) / 2;
        for (let index = 0; index < count; index++) {
            const from = first + index * pitch;
            const to = from + BOARD.width;
            const middle = (from + to) / 2;
            cutAround(boardBottom(side, to), PARAPET_TOP, from, to, openings).forEach(([bottom, top], piece) => {
                boards.push({
                    id: `${side.wall}-board-${index}-${piece}`, name: "Cladding board", storey: "first", layer: "first", material: "Charred larch",
                    start: point(side, middle, BOARD_PLANE, bottom), end: point(side, middle, BOARD_PLANE, top),
                    width: BOARD.width, depth: BOARD.thickness, rotation: side.along === "y" ? 90 : 0, kind: memberPredefinedTypeEnum.plate,
                });
            });
        }
    }
    return boards;
}

function flashings(): DetailSpec[] {
    const outer = FACADE_DEPTH + FLASHING.projection;
    const middle = (TIMBER_WALL + outer) / 2;
    const width = outer - TIMBER_WALL;
    const z = -SLAB_DEPTH + FLASHING.height / 2;
    const [, north, west] = FIRST_SIDES as [FacadeSide, FacadeSide, FacadeSide, FacadeSide];
    const flashing = (id: string, start: Inputs.Base.Point3, end: Inputs.Base.Point3): DetailSpec => ({
        id, name: "Floor line flashing", storey: "first", layer: "first", material: "Anthracite aluminium", start, end, width, depth: FLASHING.height,
    });
    return [
        flashing("flashing-north", point(north, -outer, middle, z), point(north, FIRST_FLOOR_EAST_FACE, middle, z)),
        flashing("flashing-west", point(west, -FACADE_DEPTH, middle, z), point(west, FIRST_INTERIOR.y1 + TIMBER_WALL, middle, z)),
    ];
}

function windowSurrounds(): DetailSpec[] {
    const t = SURROUND.thickness;
    const inner = TIMBER_WALL / 2 + FRAME_DEPTH / 2;
    const outer = FACADE_DEPTH + SURROUND.projection;
    const middle = (inner + outer) / 2;
    const width = outer - inner;
    const [side] = FIRST_SIDES as [FacadeSide];
    return WINDOWS.filter((window) => SURROUNDED_WINDOWS.includes(window.id)).flatMap((window) => {
        const opening = openingOf(window, side);
        const plate = (suffix: string, start: Inputs.Base.Point3, end: Inputs.Base.Point3, horizontal: boolean): DetailSpec => ({
            id: `${window.id}-surround-${suffix}`, name: "Window surround", storey: "first", layer: "first", material: "Anthracite aluminium",
            start, end, width: horizontal ? width : t, depth: horizontal ? t : width,
        });
        return [
            plate("head", point(side, opening.from, middle, opening.top - t / 2), point(side, opening.to, middle, opening.top - t / 2), true),
            plate("sill", point(side, opening.from, middle, opening.bottom + t / 2), point(side, opening.to, middle, opening.bottom + t / 2), true),
            plate("left", point(side, opening.from + t / 2, middle, opening.bottom + t), point(side, opening.from + t / 2, middle, opening.top - t), false),
            plate("right", point(side, opening.to - t / 2, middle, opening.bottom + t), point(side, opening.to - t / 2, middle, opening.top - t), false),
        ];
    });
}

function windowSills(): DetailSpec[] {
    return WINDOWS.filter((window) => SILLED_WINDOWS.includes(window.id)).map((window): DetailSpec => {
        const side = sideOfWall(window.wall);
        const opening = openingOf(window, side);
        const inner = side.thickness / 2 + FRAME_DEPTH / 2;
        const outer = FACADE_DEPTH + SILL.drip;
        const z = opening.bottom + SILL.thickness / 2;
        const storey = window.wall.startsWith("ff") ? "first" : "ground";
        return {
            id: `${window.id}-sill`, name: "Window sill", storey, layer: storey, material: "Anthracite aluminium",
            start: point(side, opening.from, (inner + outer) / 2, z), end: point(side, opening.to, (inner + outer) / 2, z), width: outer - inner, depth: SILL.thickness,
        };
    });
}

function copings(): DetailSpec[] {
    const inner = PARAPET_INSET - COPING.drip;
    const outer = FACADE_DEPTH + COPING.drip;
    const middle = (inner + outer) / 2;
    const z = PARAPET_TOP + COPING.thickness / 2;
    return FIRST_SIDES.map((side): DetailSpec => {
        const [from, to] = side.along === "x" ? [-outer, FIRST_INTERIOR.x1 + outer] : [FIRST_INTERIOR.y0 - inner, FIRST_INTERIOR.y1 + inner];
        return {
            id: `${side.wall}-coping`, name: "Parapet coping", storey: "first", layer: "first", material: "Anthracite aluminium",
            start: point(side, from, middle, z), end: point(side, to, middle, z), width: outer - inner, depth: COPING.thickness,
        };
    });
}

function solarArray(): DetailSpec[] {
    const tilt = SOLAR.tilt * Math.PI / 180;
    const slope = Math.tan(tilt);
    const run = SOLAR.length * Math.cos(tilt);
    const base = ROOF_TOP + SOLAR.lift;
    const halfDepth = SOLAR.thickness / 2 / Math.cos(tilt);
    const left = SOLAR.firstColumn - SOLAR.width / 2;
    const right = SOLAR.firstColumn + (SOLAR.columns - 1) * (SOLAR.width + SOLAR.gap) + SOLAR.width / 2;
    return SOLAR.rows.flatMap((y, row) => {
        const rail = (id: string, near: number): DetailSpec => {
            const top = base + (near - y) * slope - halfDepth - SOLAR_RAIL.clearance;
            const middle = near + SOLAR_RAIL.width / 2;
            return {
                id, name: "Mounting rail", storey: "first", layer: "roof", material: "Anthracite aluminium",
                start: [left, middle, (ROOF_TOP + top) / 2], end: [right, middle, (ROOF_TOP + top) / 2], width: SOLAR_RAIL.width, depth: top - ROOF_TOP,
            };
        };
        const panels = Array.from({ length: SOLAR.columns }, (_, column): DetailSpec => {
            const x = SOLAR.firstColumn + column * (SOLAR.width + SOLAR.gap);
            return {
                id: `solar-panel-${row}-${column}`, name: "Solar panel", storey: "first", layer: "roof", material: "Solar module",
                start: [x, y, base], end: [x, y + run, base + run * slope], width: SOLAR.width, depth: SOLAR.thickness, kind: memberPredefinedTypeEnum.plate,
            };
        });
        return [...panels, rail(`solar-rail-front-${row}`, y + SOLAR_RAIL.inset), rail(`solar-rail-back-${row}`, y + run - SOLAR_RAIL.inset - SOLAR_RAIL.width)];
    });
}

function stairParts(): DetailSpec[] {
    const [near, far] = STAIR.sides;
    const slope = STAIR.riser / STAIR.going;
    const nosing = (x: number): number => STAIR.riser + (STAIR.bottomEdge - x) * slope;
    const treadMiddle = (step: number): number => STAIR.bottomEdge - (step - 0.5) * STAIR.going;
    const steps = Array.from({ length: STAIR.risers - 1 }, (_, index) => index + 1);
    const top = STAIR.voidEdge + 0.07;
    const bottom = STAIR.bottomEdge + STRINGER.past;
    const railBottom = STAIR.bottomEdge;
    const railY = far + STRINGER.thickness + BALUSTER.radius;
    const stringerY = far + STRINGER.thickness / 2;
    const steel = { storey: "ground", layer: "ground", material: "Blackened steel" } as const;
    return [
        ...steps.map((step): DetailSpec => ({
            id: `stair-tread-${step}`, name: `Tread ${step}`, storey: "ground", layer: "ground", material: "Oak",
            start: [treadMiddle(step), near, step * STAIR.riser - STAIR.treadThickness / 2], end: [treadMiddle(step), far, step * STAIR.riser - STAIR.treadThickness / 2],
            width: STAIR.treadDepth, depth: STAIR.treadThickness,
        })),
        {
            ...steel, id: "stair-stringer", name: "Stair stringer", kind: memberPredefinedTypeEnum.stringer, width: STRINGER.thickness, depth: STRINGER.depth,
            start: [bottom, stringerY, nosing(bottom) - STRINGER.below], end: [top, stringerY, nosing(top) - STRINGER.below],
        },
        ...([["stair-handrail-wall", near + HANDRAIL.wallGap], ["stair-handrail-open", railY]] as const).map(([id, y]): DetailSpec => ({
            ...steel, id, name: "Handrail", radius: HANDRAIL.radius,
            start: [railBottom, y, nosing(railBottom) + HANDRAIL.height], end: [top, y, nosing(top) + HANDRAIL.height],
        })),
        ...steps.map((step): DetailSpec => ({
            ...steel, id: `stair-baluster-${step}`, name: "Baluster", radius: BALUSTER.radius, kind: memberPredefinedTypeEnum.post,
            start: [treadMiddle(step), railY, step * STAIR.riser - BALUSTER.below],
            end: [treadMiddle(step), railY, nosing(treadMiddle(step)) + HANDRAIL.height - HANDRAIL.radius - BALUSTER.underRail],
        })),
    ];
}

function rainwater(): DetailSpec[] {
    const y = GROUND_INTERIOR.y1 + FACADE_DEPTH + DOWNPIPE.standoff;
    const hopperBottom = FIRST_FLOOR_ELEVATION + PARAPET_TOP - HOPPER.belowCoping;
    const aluminium = { storey: "ground", layer: "ground", material: "Anthracite aluminium" } as const;
    return DOWNPIPE.positions.flatMap((x, index): DetailSpec[] => [
        { ...aluminium, id: `downpipe-${index}`, name: "Downpipe", radius: DOWNPIPE.radius, start: [x, y, 0], end: [x, y, hopperBottom] },
        { ...aluminium, id: `rainwater-hopper-${index}`, name: "Rainwater hopper", start: [x, y, hopperBottom], end: [x, y, hopperBottom + HOPPER.height], width: HOPPER.width, depth: HOPPER.depth },
    ]);
}

function entranceCanopy(): DetailSpec[] {
    const { from, to, fascia, slat, light } = CANOPY;
    const wall = GROUND_INTERIOR.y1 + FACADE_DEPTH;
    const front = wall + CANOPY.projection;
    const t = fascia.thickness;
    const fasciaZ = CANOPY.underside + fascia.depth / 2;
    const coverZ = CANOPY.underside + fascia.depth - CANOPY.upstand - CANOPY.cover / 2;
    const slatZ = CANOPY.underside + slat.above + slat.depth / 2;
    const inner = { from: from + t, to: to - t, front: front - t };
    const pitch = slat.width + slat.gap;
    const count = Math.floor((inner.to - inner.from + slat.gap) / pitch);
    const first = inner.from + (inner.to - inner.from - (count * pitch - slat.gap)) / 2 + slat.width / 2;
    const metal = { storey: "ground", layer: "ground", material: "Anthracite aluminium" } as const;
    return [
        { ...metal, id: "canopy-fascia-front", name: "Canopy fascia", start: [from, front - t / 2, fasciaZ], end: [to, front - t / 2, fasciaZ], width: t, depth: fascia.depth, beam: true },
        { ...metal, id: "canopy-fascia-left", name: "Canopy fascia", start: [from + t / 2, wall, fasciaZ], end: [from + t / 2, inner.front, fasciaZ], width: t, depth: fascia.depth, beam: true },
        { ...metal, id: "canopy-fascia-right", name: "Canopy fascia", start: [to - t / 2, wall, fasciaZ], end: [to - t / 2, inner.front, fasciaZ], width: t, depth: fascia.depth, beam: true },
        {
            ...metal, id: "canopy-cover", name: "Canopy cover", kind: memberPredefinedTypeEnum.plate,
            start: [inner.from, (wall + inner.front) / 2, coverZ], end: [inner.to, (wall + inner.front) / 2, coverZ], width: inner.front - wall, depth: CANOPY.cover,
        },
        ...Array.from({ length: count }, (_, index): DetailSpec => ({
            id: `canopy-slat-${index}`, name: "Canopy soffit slat", storey: "ground", layer: "ground", material: "Smoked oak",
            start: [first + index * pitch, wall, slatZ], end: [first + index * pitch, inner.front, slatZ], width: slat.width, depth: slat.depth,
        })),
        ...CANOPY.lights.map((x, index): DetailSpec => ({
            id: `canopy-light-${index}`, name: "Downlight", storey: "ground", layer: "ground", material: "Brushed stainless steel", radius: light.radius,
            start: [x, wall + light.out, CANOPY.underside + slat.above - light.depth], end: [x, wall + light.out, CANOPY.underside + slat.above],
        })),
    ];
}

function carportFrame(): DetailSpec[] {
    const { x0, x1, y0, y1, beam, joist } = CARPORT;
    const beamZ = CARPORT.clearance + beam.depth / 2;
    const joistZ = CARPORT_DECK_BOTTOM - joist.depth / 2;
    const inner = { x0: x0 + beam.width, y0: y0 + beam.width, y1: y1 - beam.width };
    const ledgerX = x1 - CARPORT.ledger / 2;
    const spacing = (inner.y1 - inner.y0) / (joist.count + 1);
    const steel = { storey: "ground", layer: "garden", material: "Blackened steel", beam: true } as const;
    return [
        { ...steel, id: "carport-beam-outer", name: "Carport edge beam", start: [x0 + beam.width / 2, y0, beamZ], end: [x0 + beam.width / 2, y1, beamZ], width: beam.width, depth: beam.depth },
        { ...steel, id: "carport-beam-south", name: "Carport edge beam", start: [inner.x0, y0 + beam.width / 2, beamZ], end: [x1, y0 + beam.width / 2, beamZ], width: beam.width, depth: beam.depth },
        { ...steel, id: "carport-beam-north", name: "Carport edge beam", start: [inner.x0, y1 - beam.width / 2, beamZ], end: [x1, y1 - beam.width / 2, beamZ], width: beam.width, depth: beam.depth },
        { ...steel, id: "carport-ledger", name: "Carport wall ledger", start: [ledgerX, inner.y0, joistZ], end: [ledgerX, inner.y1, joistZ], width: CARPORT.ledger, depth: joist.depth },
        ...Array.from({ length: joist.count }, (_, index): DetailSpec => ({
            id: `carport-joist-${index}`, name: "Carport joist", storey: "ground", layer: "garden", material: "Glulam spruce", beam: true,
            start: [inner.x0, inner.y0 + (index + 1) * spacing, joistZ], end: [x1 - CARPORT.ledger, inner.y0 + (index + 1) * spacing, joistZ], width: joist.width, depth: joist.depth,
        })),
    ];
}

function glassRails(): DetailSpec[] {
    const { shoe, cap, glass } = GLASS_RAIL;
    return RAILS.flatMap((rail) => rail.runs.flatMap((run): DetailSpec[] => {
        const [shoeStart, shoeEnd] = railLine(run, shoe.width);
        const [capStart, capEnd] = railLine(run, cap.width);
        const shoeZ = rail.base + shoe.depth / 2;
        const capZ = rail.base + shoe.depth + glass + cap.depth / 2;
        return [
            {
                id: `${rail.id}-shoe-${run.id}`, name: "Balustrade base shoe", storey: "first", layer: "first", material: "Anthracite aluminium",
                start: [...shoeStart, shoeZ], end: [...shoeEnd, shoeZ], width: shoe.width, depth: shoe.depth,
            },
            {
                id: `${rail.id}-cap-${run.id}`, name: "Balustrade handrail", storey: "first", layer: "first", material: "Brushed stainless steel",
                start: [...capStart, capZ], end: [...capEnd, capZ], width: cap.width, depth: cap.depth,
            },
        ];
    }));
}

function studyGlazing(): DetailSpec[] {
    const { wall, line, x0, panes, frame } = STUDY_GLAZING;
    const w = frame.width;
    const door = openingOf(DOORS.find((filling) => filling.wall === wall)!, { wall, along: "x", line, outward: 1, start: x0, direction: 1, baseOffset: 0 });
    const pane = (door.from - w - (x0 + w) - (panes - 1) * w) / panes;
    const mullions = Array.from({ length: panes - 1 }, (_, index) => x0 + w + (index + 1) * pane + index * w);
    const verticals = [x0, ...mullions, door.from - w, door.to];
    const bays = verticals.slice(0, -1).map((left, index) => ({ from: left + w, to: verticals[index + 1]!, door: left + w === door.from }));
    const faces = [line - thicknessOf("Glass partition") / 2 - frame.depth / 2, line + thicknessOf("Glass partition") / 2 + frame.depth / 2];
    const steel = { storey: "first", layer: "first", material: "Blackened steel" } as const;
    return faces.flatMap((y, face): DetailSpec[] => [
        ...verticals.map((left, index): DetailSpec => ({
            ...steel, id: `study-mullion-${face}-${index}`, name: "Glazing mullion", kind: memberPredefinedTypeEnum.mullion,
            start: [left + w / 2, y, 0], end: [left + w / 2, y, FIRST_FLOOR_WALL_TOP], width: w, depth: frame.depth,
        })),
        ...bays.flatMap((bay, index): DetailSpec[] => {
            const rails: [string, number][] = [["transom", door.top + w / 2], ["head", FIRST_FLOOR_WALL_TOP - w / 2], ...(bay.door ? [] : [["sill", w / 2] as [string, number]])];
            return rails.map(([kind, z]): DetailSpec => ({
                ...steel, id: `study-${kind}-${face}-${index}`, name: "Glazing rail", start: [bay.from, y, z], end: [bay.to, y, z], width: frame.depth, depth: w,
            }));
        }),
    ]);
}

export function houseDetails(): DetailSpec[] {
    return [...claddingBoards(), ...flashings(), ...windowSurrounds(), ...windowSills(), ...copings(), ...solarArray(), ...stairParts(), ...rainwater(), ...entranceCanopy(), ...carportFrame(), ...glassRails(), ...studyGlazing()];
}
