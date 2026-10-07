import type { Inputs } from "@bitbybit-dev/threejs";

export type Point = Inputs.Base.Point2;

export type StoreyKey = "ground" | "first";

export type Layer = "ground" | "first" | "roof" | "garden";

export interface MaterialSpec {
    name: string;
    category: string;
    color?: string;
    transparency?: number;
}

export interface LayerSetSpec {
    name: string;
    layers: { material: string; thickness: number }[];
}

export interface WallSpec {
    id: string;
    name: string;
    start: Point;
    end: Point;
    height?: number;
}

export interface WallRun {
    storey: StoreyKey;
    layerSet: string;
    height: number;
    baseOffset: number;
    alignment: Inputs.IFC.wallAlignmentEnum;
    walls: WallSpec[];
    joins: [string, string][];
    external: boolean;
}

export interface WindowTypeSpec {
    id: string;
    name: string;
    width: number;
    height: number;
}

export interface DoorTypeSpec {
    id: string;
    name: string;
    width: number;
    height: number;
    lining: string;
    panel: string;
    operation: Inputs.IFC.doorOperationEnum;
    handle: Inputs.IFC.doorHandleEnum;
    handleMaterial: string;
}

export interface FillingSpec {
    id: string;
    name: string;
    wall: string;
    type: string;
    offset: number;
    sill: number;
}

export interface PassageSpec {
    id: string;
    name: string;
    wall: string;
    offset: number;
    width: number;
    height: number;
}

export interface SlabSpec {
    id: string;
    name: string;
    storey: StoreyKey;
    outline: Point[];
    holes?: Point[][];
    layerSet: string;
    topOffset: number;
    kind: Inputs.IFC.slabPredefinedTypeEnum;
    layer: Layer;
}

export interface TreeSpec {
    id: string;
    species: string;
    position: Point;
    height: number;
    crown: number;
    trunk: number;
    foliage: string;
    bark: string;
}

export interface DetailSpec {
    id: string;
    name: string;
    storey: StoreyKey;
    start: Inputs.Base.Point3;
    end: Inputs.Base.Point3;
    material: string;
    layer: Layer;
    width?: number;
    depth?: number;
    radius?: number;
    rotation?: number;
    kind?: Inputs.IFC.memberPredefinedTypeEnum;
    beam?: boolean;
}

export interface FacadeLine {
    wall: string;
    along: "x" | "y";
    line: number;
    outward: 1 | -1;
    start: number;
    direction: 1 | -1;
}

export interface FacadeSide extends FacadeLine {
    from: number;
    to: number;
}

export interface WallSide extends FacadeLine {
    thickness: number;
    baseOffset: number;
}

export interface FacadeOpening {
    id: string;
    from: number;
    to: number;
    bottom: number;
    top: number;
}

export interface PropertySetSpec {
    name: string;
    elements: string[];
    properties: Inputs.IFC.PropertyDto[];
}

export type RailEnd = "flush" | "butt" | "lap";

export interface RailRun {
    id: string;
    along: "x" | "y";
    at: number;
    from: number;
    to: number;
    fromEnd: RailEnd;
    toEnd: RailEnd;
}

export interface RailSpec {
    id: string;
    name: string;
    base: number;
    external: boolean;
    runs: RailRun[];
}

export interface RoomSpec {
    id: string;
    number: string;
    name: string;
    storey: StoreyKey;
    outline: Point[];
    height: number;
}

export interface HouseModel {
    model: Inputs.IFC.IfcModelPointer;
    layers: Map<string, Layer>;
    rooms: RoomSpec[];
}
