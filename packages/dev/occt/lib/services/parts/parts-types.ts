import type { Base, ParallelKeySizes } from "@bitbybit-dev/base";
import type { GearOutline } from "@bitbybit-dev/base/lib/api/gears/gear-types";
import type * as Inputs from "../../api/inputs";
import type * as Resolved from "../../api/resolved-inputs";
import type { TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../../api/models";

export interface GearPen {
    readonly commands: Models.OCCT.SketchCommand[];
    readonly start: Base.Point2;
}

export interface ExtrudedGear {
    readonly shape: TopoDS_Shape;
    readonly roles: Map<number, string>;
}

export interface GearSection {
    readonly outline: GearOutline;
    readonly frame: Base.Frame;
}

export interface RoledWire {
    readonly wire: TopoDS_Shape;
    readonly edgeRoles: ReadonlyMap<number, string>;
}

export interface GearSides {
    readonly sides: readonly ExtrudedGear[];
    readonly first: TopoDS_Shape;
    readonly last: TopoDS_Shape;
}

export interface ToothedSizes {
    readonly width: number;
    readonly bore: number;
    readonly hub: number;
    readonly hubLength: number;
    readonly key: ParallelKeySizes | undefined;
    readonly module: number;
}

export type GearBody = (frame: Base.Frame, rotation: number, width: number) => GearSides;

export type PlainGearBody = (frame: Base.Frame, rotation: number, width: number) => ExtrudedGear;

export type ToothedGearInputs = Pick<Resolved.OCCT.SpurGearDto, "width" | "bore" | "hub" | "hubLength" | "keyway" | "rotation" | "frame" | "module">;

export interface RingFace {
    readonly face: TopoDS_Face;
    readonly edgeRoles: Map<number, string>;
}

export interface FaceSpot {
    readonly kind: Inputs.OCCT.surfaceTypeEnum;
    readonly z: number;
    readonly zMin: number;
    readonly zMax: number;
    readonly reach: number;
    readonly span: number;
}

export type FaceRule = (spot: FaceSpot) => string;

export interface ScrewShape {
    readonly diameter: number;
    readonly length: number;
    readonly tip: number;
    readonly threaded: number;
    readonly socketReach: number;
    readonly socketBottom: number;
}

export interface NamedSolid {
    readonly shape: TopoDS_Shape;
    readonly rule: FaceRule;
}

export interface RingRoles {
    readonly seat: string;
    readonly ring: string;
    readonly start: string;
    readonly end: string;
}

export interface DiamondKnurlSpec {
    readonly crest: number;
    readonly root: number;
    readonly grooves: number;
    readonly twist: number;
    readonly length: number;
    readonly outside: number;
}

export interface KnurlMesh {
    readonly positions: number[];
    readonly indices: number[];
}

export interface LoopVertex {
    readonly vertex: number;
    readonly angle: number;
}

export interface CageWall {
    readonly low: TopoDS_Shape;
    readonly high: TopoDS_Shape;
    readonly loops: TopoDS_Shape[];
}
