import { Inputs } from "@bitbybit-dev/threejs";
import type { DoorTypeSpec, FillingSpec, LayerSetSpec, MaterialSpec, PassageSpec, Point, PropertySetSpec, RailRun, RailSpec, RoomSpec, SlabSpec, TreeSpec, WallRun, WindowTypeSpec } from "./house-types";

const { wallAlignmentEnum, doorOperationEnum, doorHandleEnum, slabPredefinedTypeEnum } = Inputs.IFC;

export const FIRST_FLOOR_ELEVATION = 3.2;
export const SLAB_DEPTH = 0.3;
export const FIRST_FLOOR_WALL_TOP = 3.0;
export const FACADE_DEPTH = 0.48;
export const TIMBER_WALL = 0.415;
export const CAVITY = 0.04;
export const BOARD = { width: 0.12, gap: 0.02, thickness: 0.025 };
export const ROOF_DEPTH = 0.56;
export const PARAPET = { thickness: 0.2, height: 0.91 };
export const PARAPET_TOP = FIRST_FLOOR_WALL_TOP + PARAPET.height;
export const COPING = { thickness: 0.03, drip: 0.03 };
export const DECK_TOP = 0.04;
const GLASS_DOOR_WIDTH = 0.9;
export const SOFFIT_DEPTH = 0.2;
export const CANTILEVER_DRIP = -SLAB_DEPTH - SOFFIT_DEPTH - 0.02;

export function rect(x0: number, y0: number, x1: number, y1: number): Point[] {
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
}

export const GROUND_INTERIOR = { x0: 0, y0: 0, x1: 14.2, y1: 8.4 };
export const FIRST_INTERIOR = { x0: 0, y0: -2.2, x1: 10.6, y1: 8.4 };
export const FIRST_OUTLINE = rect(FIRST_INTERIOR.x0, FIRST_INTERIOR.y0, FIRST_INTERIOR.x1, FIRST_INTERIOR.y1);
export const FIRST_FLOOR_EAST_FACE = FIRST_INTERIOR.x1 + TIMBER_WALL;
const VOID = { x0: 5.48, y0: 5.06, x1: 9.45, y1: 6.17 };
export const STAIR_VOID = rect(VOID.x0, VOID.y0, VOID.x1, VOID.y1);
export const PARAPET_INSET = TIMBER_WALL - PARAPET.thickness;
const UNDER_SLAB = FIRST_FLOOR_ELEVATION - SLAB_DEPTH;
const { x1: GX, y1: GY } = GROUND_INTERIOR;

export const MATERIALS: MaterialSpec[] = [
    { name: "Silicate render", category: "plaster", color: "#f1efea" },
    { name: "EPS insulation", category: "insulation" },
    { name: "Aerated concrete", category: "block" },
    { name: "Gypsum plaster", category: "plaster", color: "#ece9e3" },
    { name: "Facade membrane", category: "membrane", color: "#161514" },
    { name: "Wood fibre board", category: "insulation" },
    { name: "Timber frame with mineral wool", category: "wood" },
    { name: "Mineral wool", category: "insulation" },
    { name: "OSB", category: "wood" },
    { name: "Service void insulation", category: "insulation" },
    { name: "Gypsum board", category: "plaster", color: "#ece9e3" },
    { name: "Timber studs", category: "wood" },
    { name: "Charred larch", category: "wood", color: "#3b342e" },
    { name: "Polished concrete", category: "concrete", color: "#c9c5bc" },
    { name: "Reinforced concrete", category: "concrete", color: "#a9a59d" },
    { name: "XPS insulation", category: "insulation" },
    { name: "Oak", category: "wood", color: "#b2865a" },
    { name: "Screed", category: "concrete" },
    { name: "Impact insulation", category: "insulation" },
    { name: "Pale gravel", category: "stone", color: "#d3cfc6" },
    { name: "Roofing membrane", category: "membrane" },
    { name: "PIR insulation", category: "insulation" },
    { name: "Vapour control layer", category: "membrane" },
    { name: "Cross-laminated timber", category: "wood" },
    { name: "Thermo ash decking", category: "wood", color: "#8b6b52" },
    { name: "Limestone paving", category: "stone", color: "#dcd7cc" },
    { name: "Concrete pavers", category: "concrete", color: "#bdb8ae" },
    { name: "Fibre cement", category: "cement", color: "#e7e5e0" },
    { name: "Anthracite aluminium", category: "aluminium", color: "#2b2f33" },
    { name: "Clear glass", category: "glass", color: "#b8d0d8", transparency: 0.72 },
    { name: "White lacquer", category: "wood", color: "#f4f2ed" },
    { name: "Smoked oak", category: "wood", color: "#5c4433" },
    { name: "Brushed stainless steel", category: "steel", color: "#b4b8bc" },
    { name: "Blackened steel", category: "steel", color: "#2f3236" },
    { name: "Solar module", category: "glass", color: "#1c2530" },
    { name: "Sedum", category: "vegetation", color: "#8d9a5c" },
    { name: "Plywood", category: "wood" },
    { name: "Glulam spruce", category: "wood", color: "#c9a272" },
    { name: "Lawn", category: "soil", color: "#9fb184" },
    { name: "Birch foliage", category: "vegetation", color: "#9db277" },
    { name: "Maple foliage", category: "vegetation", color: "#6f8f58" },
    { name: "Pine needles", category: "vegetation", color: "#50684b" },
    { name: "Birch bark", category: "wood", color: "#ddd8cc" },
    { name: "Bark", category: "wood", color: "#5b4a3c" },
];

export const LAYER_SETS: LayerSetSpec[] = [
    { name: "Rendered masonry wall", layers: [{ material: "Silicate render", thickness: 0.015 }, { material: "EPS insulation", thickness: 0.2 }, { material: "Aerated concrete", thickness: 0.25 }, { material: "Gypsum plaster", thickness: 0.015 }] },
    {
        name: "Timber frame wall",
        layers: [
            { material: "Facade membrane", thickness: 0.002 }, { material: "Wood fibre board", thickness: 0.08 }, { material: "Timber frame with mineral wool", thickness: 0.24 },
            { material: "OSB", thickness: 0.018 }, { material: "Service void insulation", thickness: 0.05 }, { material: "Gypsum board", thickness: 0.025 },
        ],
    },
    { name: "Parapet", layers: [{ material: "Facade membrane", thickness: 0.002 }, { material: "Timber frame with mineral wool", thickness: 0.198 }] },
    { name: "Partition", layers: [{ material: "Gypsum board", thickness: 0.0125 }, { material: "Timber studs", thickness: 0.095 }, { material: "Gypsum board", thickness: 0.0125 }] },
    { name: "Glass partition", layers: [{ material: "Clear glass", thickness: 0.03 }] },
    { name: "Glass balustrade", layers: [{ material: "Clear glass", thickness: 0.02 }] },
    { name: "Insulated ground slab", layers: [{ material: "Polished concrete", thickness: 0.06 }, { material: "Reinforced concrete", thickness: 0.2 }, { material: "XPS insulation", thickness: 0.25 }] },
    { name: "Upper floor slab", layers: [{ material: "Oak", thickness: 0.02 }, { material: "Screed", thickness: 0.06 }, { material: "Impact insulation", thickness: 0.03 }, { material: "Reinforced concrete", thickness: 0.19 }] },
    { name: "Terrace roof slab", layers: [{ material: "Roofing membrane", thickness: 0.005 }, { material: "PIR insulation", thickness: 0.18 }, { material: "Reinforced concrete", thickness: 0.115 }] },
    { name: "Warm flat roof", layers: [{ material: "Pale gravel", thickness: 0.05 }, { material: "Roofing membrane", thickness: 0.005 }, { material: "PIR insulation", thickness: 0.3 }, { material: "Vapour control layer", thickness: 0.005 }, { material: "Cross-laminated timber", thickness: 0.2 }] },
    { name: "Insulated soffit", layers: [{ material: "Mineral wool", thickness: 0.18 }, { material: "Charred larch", thickness: 0.02 }] },
    { name: "Carport roof", layers: [{ material: "Sedum", thickness: 0.06 }, { material: "Roofing membrane", thickness: 0.005 }, { material: "Plywood", thickness: 0.025 }] },
    { name: "Decking", layers: [{ material: "Thermo ash decking", thickness: 0.04 }] },
    { name: "Garden paving", layers: [{ material: "Limestone paving", thickness: 0.05 }, { material: "Reinforced concrete", thickness: 0.1 }] },
    { name: "Driveway", layers: [{ material: "Concrete pavers", thickness: 0.08 }, { material: "Reinforced concrete", thickness: 0.1 }] },
];

export const WINDOW_TYPES: WindowTypeSpec[] = [
    { id: "w-glazing-3000", name: "Fixed glazing 3000 x 2700", width: 3.0, height: 2.7 },
    { id: "w-glazing-2400", name: "Fixed glazing 2400 x 2700", width: 2.4, height: 2.7 },
    { id: "w-ribbon-3000", name: "Ribbon window 3000 x 900", width: 3.0, height: 0.9 },
    { id: "w-1600", name: "Casement 1600 x 1500", width: 1.6, height: 1.5 },
    { id: "w-1500", name: "Casement 1500 x 1000", width: 1.5, height: 1.0 },
    { id: "w-1200", name: "Casement 1200 x 1000", width: 1.2, height: 1.0 },
    { id: "w-800", name: "Hopper 800 x 600", width: 0.8, height: 0.6 },
    { id: "w-slot-ground", name: "Slot window 600 x 2700", width: 0.6, height: 2.7 },
    { id: "w-glazing-2300", name: "Fixed glazing 2300 x 2600", width: 2.3, height: 2.6 },
    { id: "w-slot-first", name: "Slot window 600 x 2600", width: 0.6, height: 2.6 },
    { id: "w-ribbon-4000", name: "Ribbon window 4000 x 1200", width: 4.0, height: 1.2 },
    { id: "w-1600-high", name: "High window 1600 x 700", width: 1.6, height: 0.7 },
    { id: "w-1000", name: "Casement 1000 x 900", width: 1.0, height: 0.9 },
];

export const DOOR_TYPES: DoorTypeSpec[] = [
    { id: "d-entrance", name: "Smoked oak entrance door 1300 x 2700", width: 1.3, height: 2.7, lining: "Anthracite aluminium", panel: "Smoked oak", operation: doorOperationEnum.singleSwingRight, handle: doorHandleEnum.pullBar, handleMaterial: "Brushed stainless steel" },
    { id: "d-slider-left", name: "Sliding glass door 1800 x 2700", width: 1.8, height: 2.7, lining: "Anthracite aluminium", panel: "Clear glass", operation: doorOperationEnum.slidingToLeft, handle: doorHandleEnum.pullBar, handleMaterial: "Anthracite aluminium" },
    { id: "d-slider-right", name: "Sliding glass door 1800 x 2700", width: 1.8, height: 2.7, lining: "Anthracite aluminium", panel: "Clear glass", operation: doorOperationEnum.slidingToRight, handle: doorHandleEnum.pullBar, handleMaterial: "Anthracite aluminium" },
    { id: "d-slider-2000", name: "Sliding glass door 2000 x 2600", width: 2.0, height: 2.6, lining: "Anthracite aluminium", panel: "Clear glass", operation: doorOperationEnum.slidingToRight, handle: doorHandleEnum.pullBar, handleMaterial: "Anthracite aluminium" },
    { id: "d-interior", name: "Interior door 900 x 2200", width: 0.9, height: 2.2, lining: "White lacquer", panel: "White lacquer", operation: doorOperationEnum.singleSwingLeft, handle: doorHandleEnum.lever, handleMaterial: "Brushed stainless steel" },
    { id: "d-glass", name: "Glass door 900 x 2200", width: GLASS_DOOR_WIDTH, height: 2.2, lining: "Anthracite aluminium", panel: "Clear glass", operation: doorOperationEnum.singleSwingRight, handle: doorHandleEnum.lever, handleMaterial: "Brushed stainless steel" },
];

function closedRun(prefix: string, outline: Point[], names: string[], name?: string): WallRun["walls"] {
    return outline.map((start, index) => ({
        id: `${prefix}-${names[index]}`,
        name: name ?? `${names[index][0].toUpperCase()}${names[index].slice(1)} wall`,
        start,
        end: outline[(index + 1) % outline.length],
    }));
}

function loopJoins(walls: WallRun["walls"]): [string, string][] {
    return walls.map((wall, index) => [wall.id, walls[(index + 1) % walls.length].id]);
}

const SIDES = ["south", "east", "north", "west"];
const FIRST_FLOOR_WALLS = closedRun("ff", FIRST_OUTLINE, SIDES);
const PARAPET_WALLS = closedRun("parapet", rect(FIRST_INTERIOR.x0 - PARAPET_INSET, FIRST_INTERIOR.y0 - PARAPET_INSET, FIRST_INTERIOR.x1 + PARAPET_INSET, FIRST_INTERIOR.y1 + PARAPET_INSET), SIDES, "Parapet");
const TERRACE_EDGE = GX + FACADE_DEPTH;

export const GLASS_RAIL = { shoe: { width: 0.06, depth: 0.12 }, glass: 0.94, cap: { width: 0.05, depth: 0.04 } };
const TERRACE = { house: FIRST_INTERIOR.x1 + FACADE_DEPTH, south: -FACADE_DEPTH + 0.05, east: TERRACE_EDGE - 0.05, north: GY + FACADE_DEPTH - 0.05 };
const VOID_RAIL = { south: VOID.y0 - GLASS_RAIL.shoe.width / 2, east: VOID.x1 + GLASS_RAIL.shoe.width / 2 };

export const RAILS: RailSpec[] = [
    {
        id: "terrace", name: "Terrace balustrade", base: DECK_TOP, external: true,
        runs: [
            { id: "south", along: "x", at: TERRACE.south, from: TERRACE.house, to: TERRACE.east, fromEnd: "flush", toEnd: "butt" },
            { id: "east", along: "y", at: TERRACE.east, from: TERRACE.south, to: TERRACE.north, fromEnd: "lap", toEnd: "lap" },
            { id: "north", along: "x", at: TERRACE.north, from: TERRACE.east, to: TERRACE.house, fromEnd: "butt", toEnd: "flush" },
        ],
    },
    {
        id: "ff-void", name: "Stair balustrade", base: 0, external: false,
        runs: [
            { id: "south", along: "x", at: VOID_RAIL.south, from: VOID.x0, to: VOID_RAIL.east, fromEnd: "flush", toEnd: "lap" },
            { id: "east", along: "y", at: VOID_RAIL.east, from: VOID_RAIL.south, to: VOID.y1, fromEnd: "butt", toEnd: "flush" },
        ],
    },
];

const END_SHIFT = { flush: 0, butt: -1, lap: 1 };

export function railLine(run: RailRun, width: number): [Point, Point] {
    const direction = Math.sign(run.to - run.from);
    const from = run.from - direction * END_SHIFT[run.fromEnd] * width / 2;
    const to = run.to + direction * END_SHIFT[run.toEnd] * width / 2;
    return run.along === "x" ? [[from, run.at], [to, run.at]] : [[run.at, from], [run.at, to]];
}

export const STUDY_GLAZING = { wall: "ff-study-glass", line: 6.23, x0: 5.46, x1: 10.6, panes: 4, frame: { width: 0.05, depth: 0.02 } };
const STUDY_FRAME_FACE = STUDY_GLAZING.line + thicknessOf("Glass partition") / 2 + STUDY_GLAZING.frame.depth;

export const WALL_RUNS: WallRun[] = [
    {
        storey: "ground", layerSet: "Rendered masonry wall", height: UNDER_SLAB, baseOffset: 0, alignment: wallAlignmentEnum.right, external: true,
        walls: [
            { id: "gf-south", name: "South wall", start: [0, 0], end: [FIRST_FLOOR_EAST_FACE, 0] },
            { id: "gf-south-terrace", name: "South wall", start: [FIRST_FLOOR_EAST_FACE, 0], end: [GX, 0], height: FIRST_FLOOR_ELEVATION },
            { id: "gf-east", name: "East wall", start: [GX, 0], end: [GX, GY], height: FIRST_FLOOR_ELEVATION },
            { id: "gf-north-terrace", name: "North wall", start: [GX, GY], end: [FIRST_FLOOR_EAST_FACE, GY], height: FIRST_FLOOR_ELEVATION },
            { id: "gf-north", name: "North wall", start: [FIRST_FLOOR_EAST_FACE, GY], end: [0, GY] },
            { id: "gf-west", name: "West wall", start: [0, GY], end: [0, 0] },
        ],
        joins: [["gf-south-terrace", "gf-east"], ["gf-east", "gf-north-terrace"], ["gf-north", "gf-west"], ["gf-west", "gf-south"]],
    },
    {
        storey: "first", layerSet: "Timber frame wall", height: SLAB_DEPTH + FIRST_FLOOR_WALL_TOP, baseOffset: -SLAB_DEPTH, alignment: wallAlignmentEnum.right, external: true,
        walls: FIRST_FLOOR_WALLS,
        joins: loopJoins(FIRST_FLOOR_WALLS),
    },
    {
        storey: "first", layerSet: "Parapet", height: PARAPET.height, baseOffset: FIRST_FLOOR_WALL_TOP, alignment: wallAlignmentEnum.right, external: true,
        walls: PARAPET_WALLS,
        joins: loopJoins(PARAPET_WALLS),
    },
    {
        storey: "ground", layerSet: "Partition", height: UNDER_SLAB, baseOffset: 0, alignment: wallAlignmentEnum.center, external: false, joins: [],
        walls: [
            { id: "gf-spine", name: "Spine wall", start: [0, 5.0], end: [GX, 5.0] },
            { id: "gf-study-wc", name: "Study partition", start: [3.66, 5.06], end: [3.66, GY] },
            { id: "gf-wc-hall", name: "WC partition", start: [5.36, 5.06], end: [5.36, GY] },
            { id: "gf-hall-utility", name: "Utility partition", start: [10.6, 5.06], end: [10.6, GY] },
        ],
    },
    {
        storey: "first", layerSet: "Partition", height: FIRST_FLOOR_WALL_TOP, baseOffset: 0, alignment: wallAlignmentEnum.center, external: false, joins: [],
        walls: [
            { id: "ff-corridor", name: "Corridor wall", start: [0, 3.6], end: [10.6, 3.6] },
            { id: "ff-bed-1-2", name: "Bedroom partition", start: [3.46, -2.2], end: [3.46, 3.54] },
            { id: "ff-bed-2-3", name: "Bedroom partition", start: [6.96, -2.2], end: [6.96, 3.54] },
            { id: "ff-bath", name: "Bathroom wall", start: [0, 5.0], end: [3.46, 5.0] },
            { id: "ff-bath-wardrobe", name: "Wardrobe partition", start: [3.46, 5.06], end: [3.46, 8.4] },
            { id: "ff-wardrobe", name: "Wardrobe front", start: [3.52, 6.2], end: [5.46, 6.2] },
            { id: "ff-wardrobe-study", name: "Study partition", start: [5.46, STUDY_FRAME_FACE], end: [5.46, 8.4] },
        ],
    },
    {
        storey: "first", layerSet: "Glass partition", height: FIRST_FLOOR_WALL_TOP, baseOffset: 0, alignment: wallAlignmentEnum.center, external: false, joins: [],
        walls: [{ id: STUDY_GLAZING.wall, name: "Study glass wall", start: [STUDY_GLAZING.x0, STUDY_GLAZING.line], end: [STUDY_GLAZING.x1, STUDY_GLAZING.line] }],
    },
    ...RAILS.map((rail): WallRun => ({
        storey: "first", layerSet: "Glass balustrade", height: GLASS_RAIL.glass, baseOffset: rail.base + GLASS_RAIL.shoe.depth, alignment: wallAlignmentEnum.center, external: rail.external, joins: [],
        walls: rail.runs.map((run) => {
            const [start, end] = railLine(run, GLASS_RAIL.shoe.width);
            return { id: `${rail.id}-rail-${run.id}`, name: rail.name, start, end };
        }),
    })),
];

export const WINDOWS: FillingSpec[] = [
    { id: "gf-living-south", name: "Living room glazing", wall: "gf-south", type: "w-glazing-3000", offset: 0.5, sill: 0 },
    { id: "gf-dining-south", name: "Dining glazing", wall: "gf-south", type: "w-glazing-2400", offset: 7.9, sill: 0 },
    { id: "gf-kitchen-ribbon", name: "Kitchen ribbon window", wall: "gf-south-terrace", type: "w-ribbon-3000", offset: 0.1, sill: 1.05 },
    { id: "gf-kitchen-east", name: "Kitchen glazing", wall: "gf-east", type: "w-glazing-2400", offset: 0.6, sill: 0 },
    { id: "gf-utility-east", name: "Utility window", wall: "gf-east", type: "w-1200", offset: 6.2, sill: 1.2 },
    { id: "gf-utility-north", name: "Utility window", wall: "gf-north-terrace", type: "w-1500", offset: 1.1, sill: 1.2 },
    { id: "gf-hall-slot", name: "Hall sidelight", wall: "gf-north", type: "w-slot-ground", offset: 2.8, sill: 0 },
    { id: "gf-wc", name: "WC window", wall: "gf-north", type: "w-800", offset: 6.1, sill: 1.6 },
    { id: "gf-study", name: "Study window", wall: "gf-north", type: "w-1600", offset: 8.4, sill: 0.9 },
    { id: "gf-living-west", name: "Living room glazing", wall: "gf-west", type: "w-glazing-3000", offset: 5.0, sill: 0 },
    { id: "ff-bedroom-1", name: "Bedroom glazing", wall: "ff-south", type: "w-glazing-2300", offset: 0.6, sill: SLAB_DEPTH },
    { id: "ff-bedroom-2", name: "Bedroom glazing", wall: "ff-south", type: "w-glazing-2300", offset: 4.15, sill: SLAB_DEPTH },
    { id: "ff-main-bedroom", name: "Main bedroom glazing", wall: "ff-south", type: "w-glazing-2300", offset: 7.6, sill: SLAB_DEPTH },
    { id: "ff-landing-slot", name: "Landing slot window", wall: "ff-east", type: "w-slot-first", offset: 7.5, sill: SLAB_DEPTH },
    { id: "ff-study", name: "Study ribbon window", wall: "ff-north", type: "w-ribbon-4000", offset: 0.7, sill: SLAB_DEPTH + 0.9 },
    { id: "ff-bathroom-north", name: "Bathroom window", wall: "ff-north", type: "w-1600-high", offset: 8.1, sill: SLAB_DEPTH + 1.4 },
    { id: "ff-bathroom-west", name: "Bathroom window", wall: "ff-west", type: "w-1000", offset: 1.0, sill: SLAB_DEPTH + 1.2 },
    { id: "ff-bedroom-1-west", name: "Bedroom slot window", wall: "ff-west", type: "w-slot-first", offset: 6.8, sill: SLAB_DEPTH },
];

export const DOORS: FillingSpec[] = [
    { id: "gf-entrance", name: "Front door", wall: "gf-north", type: "d-entrance", offset: 3.7, sill: 0 },
    { id: "gf-garden-slider-west", name: "Garden sliding door", wall: "gf-south", type: "d-slider-left", offset: 3.9, sill: 0 },
    { id: "gf-garden-slider-east", name: "Garden sliding door", wall: "gf-south", type: "d-slider-right", offset: 5.7, sill: 0 },
    { id: "gf-study-door", name: "Study door", wall: "gf-spine", type: "d-interior", offset: 2.5, sill: 0 },
    { id: "gf-utility-door", name: "Utility door", wall: "gf-spine", type: "d-interior", offset: 11.6, sill: 0 },
    { id: "gf-wc-door", name: "WC door", wall: "gf-wc-hall", type: "d-interior", offset: 1.3, sill: 0 },
    { id: "ff-terrace-slider", name: "Terrace sliding door", wall: "ff-east", type: "d-slider-2000", offset: 2.8, sill: SLAB_DEPTH },
    { id: "ff-bedroom-1-door", name: "Bedroom door", wall: "ff-corridor", type: "d-interior", offset: 2.2, sill: 0 },
    { id: "ff-bedroom-2-door", name: "Bedroom door", wall: "ff-corridor", type: "d-interior", offset: 5.6, sill: 0 },
    { id: "ff-main-bedroom-door", name: "Main bedroom door", wall: "ff-corridor", type: "d-interior", offset: 7.4, sill: 0 },
    { id: "ff-bathroom-door", name: "Bathroom door", wall: "ff-bath", type: "d-interior", offset: 2.3, sill: 0 },
    { id: "ff-wardrobe-door", name: "Wardrobe door", wall: "ff-wardrobe", type: "d-interior", offset: 0.5, sill: 0 },
    { id: "ff-study-door", name: "Study door", wall: STUDY_GLAZING.wall, type: "d-glass", offset: STUDY_GLAZING.x1 - STUDY_GLAZING.frame.width - GLASS_DOOR_WIDTH - STUDY_GLAZING.x0, sill: 0 },
];

export const PASSAGES: PassageSpec[] = [
    { id: "gf-hall-passage", name: "Hall passage", wall: "gf-spine", offset: 9.5, width: 1.0, height: 2.4 },
];

export const SURROUNDED_WINDOWS = ["ff-bedroom-1", "ff-bedroom-2", "ff-main-bedroom"];
export const SILLED_WINDOWS = ["gf-kitchen-ribbon", "gf-utility-east", "gf-utility-north", "gf-wc", "gf-study", "ff-study", "ff-bathroom-north", "ff-bathroom-west"];

const GARDEN_TERRACE = rect(-FACADE_DEPTH, -5.2, FIRST_INTERIOR.x1 + FACADE_DEPTH, -FACADE_DEPTH);
const ENTRANCE_PATH = rect(5.95, GY + FACADE_DEPTH, 7.35, 16);
const DRIVEWAY = rect(-4.4, 3.6, -FACADE_DEPTH, 16);

export const SLABS: SlabSpec[] = [
    { id: "gf-slab", name: "Ground floor slab", storey: "ground", outline: rect(-FACADE_DEPTH, -FACADE_DEPTH, TERRACE_EDGE, GY + FACADE_DEPTH), layerSet: "Insulated ground slab", topOffset: 0, kind: slabPredefinedTypeEnum.baseSlab, layer: "ground" },
    { id: "ff-slab", name: "First floor slab", storey: "first", outline: FIRST_OUTLINE, holes: [STAIR_VOID], layerSet: "Upper floor slab", topOffset: 0, kind: slabPredefinedTypeEnum.floor, layer: "first" },
    {
        id: "cantilever-soffit", name: "Insulated soffit", storey: "first", layerSet: "Insulated soffit", topOffset: -SLAB_DEPTH, kind: slabPredefinedTypeEnum.notDefined, layer: "first",
        outline: rect(-TIMBER_WALL - CAVITY, FIRST_INTERIOR.y0 - TIMBER_WALL - CAVITY, FIRST_INTERIOR.x1 + TIMBER_WALL + CAVITY, -FACADE_DEPTH),
    },
    { id: "terrace-slab", name: "Roof terrace slab", storey: "first", outline: rect(FIRST_FLOOR_EAST_FACE, 0, GX, GY), layerSet: "Terrace roof slab", topOffset: 0, kind: slabPredefinedTypeEnum.roof, layer: "first" },
    { id: "terrace-deck", name: "Roof terrace decking", storey: "first", outline: rect(FIRST_FLOOR_EAST_FACE, -FACADE_DEPTH, TERRACE_EDGE, GY + FACADE_DEPTH), layerSet: "Decking", topOffset: DECK_TOP, kind: slabPredefinedTypeEnum.floor, layer: "first" },
    { id: "garden-terrace", name: "Garden terrace", storey: "ground", outline: GARDEN_TERRACE, layerSet: "Garden paving", topOffset: 0, kind: slabPredefinedTypeEnum.floor, layer: "garden" },
    { id: "entrance-path", name: "Entrance path", storey: "ground", outline: ENTRANCE_PATH, layerSet: "Garden paving", topOffset: 0, kind: slabPredefinedTypeEnum.floor, layer: "garden" },
    { id: "driveway", name: "Driveway", storey: "ground", outline: DRIVEWAY, layerSet: "Driveway", topOffset: 0, kind: slabPredefinedTypeEnum.floor, layer: "garden" },
];

export const ROOF = {
    id: "roof", name: "Warm flat roof", layerSet: "Warm flat roof", baseOffset: FIRST_FLOOR_WALL_TOP,
    outline: rect(FIRST_INTERIOR.x0 - PARAPET_INSET, FIRST_INTERIOR.y0 - PARAPET_INSET, FIRST_INTERIOR.x1 + PARAPET_INSET, FIRST_INTERIOR.y1 + PARAPET_INSET),
};

export const CARPORT = {
    x0: -4.4,
    x1: -FACADE_DEPTH,
    y0: 3.6,
    y1: GY + FACADE_DEPTH,
    clearance: 2.6,
    upstand: 0.02,
    beam: { width: 0.08, depth: 0.3 },
    joist: { width: 0.07, depth: 0.18, count: 9 },
    ledger: 0.06,
    post: 0.1,
};

export function thicknessOf(layerSet: string): number {
    return LAYER_SETS.find((candidate) => candidate.name === layerSet)?.layers.reduce((sum, layer) => sum + layer.thickness, 0) ?? 0;
}

export const CARPORT_DECK_BOTTOM = CARPORT.clearance + CARPORT.beam.depth - CARPORT.upstand - thicknessOf("Carport roof");

export const TERRAIN_OUTLINE = rect(-60, -60, 75, 65);
export const HARD_SURFACES: Point[] = [
    [-FACADE_DEPTH, -5.2], [FIRST_INTERIOR.x1 + FACADE_DEPTH, -5.2], [FIRST_INTERIOR.x1 + FACADE_DEPTH, -FACADE_DEPTH], [TERRACE_EDGE, -FACADE_DEPTH],
    [TERRACE_EDGE, GY + FACADE_DEPTH], [7.35, GY + FACADE_DEPTH], [7.35, 16], [5.95, 16], [5.95, GY + FACADE_DEPTH], [-FACADE_DEPTH, GY + FACADE_DEPTH],
    [-FACADE_DEPTH, 16], [-4.4, 16], [-4.4, 3.6], [-FACADE_DEPTH, 3.6],
];

export const TREES: TreeSpec[] = [
    { id: "tree-birch-1", species: "Silver birch", position: [-11, -10], height: 11, crown: 2.4, trunk: 0.16, foliage: "Birch foliage", bark: "Birch bark" },
    { id: "tree-birch-2", species: "Silver birch", position: [-7.5, -15], height: 9, crown: 2.0, trunk: 0.13, foliage: "Birch foliage", bark: "Birch bark" },
    { id: "tree-maple-1", species: "Norway maple", position: [25, 2], height: 10, crown: 3.4, trunk: 0.24, foliage: "Maple foliage", bark: "Bark" },
    { id: "tree-maple-2", species: "Norway maple", position: [20, 18], height: 8.5, crown: 3.0, trunk: 0.2, foliage: "Maple foliage", bark: "Bark" },
    { id: "tree-pine-1", species: "Scots pine", position: [-14, 13], height: 13, crown: 2.3, trunk: 0.22, foliage: "Pine needles", bark: "Bark" },
    { id: "tree-pine-2", species: "Scots pine", position: [3, 25], height: 12, crown: 2.1, trunk: 0.2, foliage: "Pine needles", bark: "Bark" },
    { id: "tree-maple-3", species: "Norway maple", position: [-17, -1], height: 7.5, crown: 2.8, trunk: 0.18, foliage: "Maple foliage", bark: "Bark" },
];

export const STAIR = {
    risers: 16,
    riser: FIRST_FLOOR_ELEVATION / 16,
    going: 0.26,
    bottomEdge: 9.4,
    sides: [5.11, 6.11] as const,
    treadDepth: 0.3,
    treadThickness: 0.06,
    voidEdge: 5.48,
};

export const ROOMS: RoomSpec[] = [
    { id: "room-living", number: "0.01", name: "Living, dining and kitchen", storey: "ground", outline: rect(0, 0, 14.2, 4.94), height: 2.9 },
    { id: "room-study", number: "0.02", name: "Study", storey: "ground", outline: rect(0, 5.06, 3.6, 8.4), height: 2.9 },
    { id: "room-wc", number: "0.03", name: "Shower room", storey: "ground", outline: rect(3.72, 5.06, 5.3, 8.4), height: 2.9 },
    { id: "room-hall", number: "0.04", name: "Entrance hall", storey: "ground", outline: rect(5.42, 5.06, 10.54, 8.4), height: 2.9 },
    { id: "room-utility", number: "0.05", name: "Utility and pantry", storey: "ground", outline: rect(10.66, 5.06, 14.2, 8.4), height: 2.9 },
    { id: "room-bedroom-1", number: "1.01", name: "Bedroom", storey: "first", outline: rect(0, -2.2, 3.4, 3.54), height: 3.0 },
    { id: "room-bedroom-2", number: "1.02", name: "Bedroom", storey: "first", outline: rect(3.52, -2.2, 6.9, 3.54), height: 3.0 },
    { id: "room-main-bedroom", number: "1.03", name: "Main bedroom", storey: "first", outline: rect(7.02, -2.2, 10.6, 3.54), height: 3.0 },
    { id: "room-corridor", number: "1.04", name: "Corridor", storey: "first", outline: rect(0, 3.66, 10.6, 4.94), height: 3.0 },
    { id: "room-landing", number: "1.05", name: "Landing", storey: "first", outline: rect(3.52, 5.06, 5.48, 6.14), height: 3.0 },
    { id: "room-bathroom", number: "1.06", name: "Bathroom", storey: "first", outline: rect(0, 5.06, 3.4, 8.4), height: 3.0 },
    { id: "room-wardrobe", number: "1.07", name: "Wardrobe", storey: "first", outline: rect(3.52, 6.26, 5.4, 8.4), height: 3.0 },
    { id: "room-office", number: "1.08", name: "Home office", storey: "first", outline: rect(5.52, 6.26, 10.6, 8.4), height: 3.0 },
];

const BOOLEAN = "IfcBoolean";
const U_VALUE = "IfcThermalTransmittanceMeasure";
const EXTERNAL = { name: "IsExternal", value: true, type: BOOLEAN };
const INTERNAL = { name: "IsExternal", value: false, type: BOOLEAN };
const NOT_LOAD_BEARING = { name: "LoadBearing", value: false, type: BOOLEAN };
const LOAD_BEARING = { name: "LoadBearing", value: true, type: BOOLEAN };

function wallsOf(layerSet: string, external: boolean): string[] {
    return WALL_RUNS.filter((run) => run.layerSet === layerSet && run.external === external).flatMap((run) => run.walls.map((wall) => wall.id));
}

function uValue(value: number): PropertySetSpec["properties"][number] {
    return { name: "ThermalTransmittance", value, type: U_VALUE };
}

export const PROPERTY_SETS: PropertySetSpec[] = [
    { name: "Pset_WallCommon", elements: wallsOf("Rendered masonry wall", true), properties: [EXTERNAL, LOAD_BEARING, uValue(0.12)] },
    { name: "Pset_WallCommon", elements: wallsOf("Timber frame wall", true), properties: [EXTERNAL, LOAD_BEARING, uValue(0.11)] },
    { name: "Pset_WallCommon", elements: wallsOf("Parapet", true), properties: [EXTERNAL, NOT_LOAD_BEARING] },
    { name: "Pset_WallCommon", elements: wallsOf("Partition", false), properties: [INTERNAL, NOT_LOAD_BEARING, { name: "AcousticRating", value: "Rw 45 dB", type: "IfcLabel" }] },
    { name: "Pset_WallCommon", elements: [...wallsOf("Glass partition", false), ...wallsOf("Glass balustrade", false)], properties: [INTERNAL, NOT_LOAD_BEARING] },
    { name: "Pset_SlabCommon", elements: ["gf-slab", "terrace-slab"], properties: [EXTERNAL, LOAD_BEARING, uValue(0.13)] },
    { name: "Pset_SlabCommon", elements: ["cantilever-soffit"], properties: [EXTERNAL, NOT_LOAD_BEARING, uValue(0.19)] },
    { name: "Pset_RoofCommon", elements: [ROOF.id], properties: [EXTERNAL, uValue(0.07)] },
    { name: "Pset_WindowCommon", elements: WINDOWS.map((window) => window.id), properties: [EXTERNAL, uValue(0.75), { name: "GlazingAreaFraction", value: 0.88, type: "IfcPositiveRatioMeasure" }] },
    { name: "Pset_DoorCommon", elements: ["gf-entrance", "gf-garden-slider-west", "gf-garden-slider-east", "ff-terrace-slider"], properties: [EXTERNAL, uValue(0.8)] },
];
