import type { Base } from "@bitbybit-dev/base";
import type { FrameAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type * as Inputs from "../api/inputs";
import type { IfcSchema } from "../schema/schema";
import type { IfcEntity, IfcFileHeader, IfcValue } from "../step/step-types";

export type Frame3 = FrameAxes;

export interface Line2 {
    readonly point: Base.Point2;
    readonly direction: Base.Vector2;
}

export interface EntityReader {
    entity(id: number): IfcEntity;
    attribute(id: number, name: string): IfcValue;
}

export interface ModelReader extends EntityReader {
    readonly schema: IfcSchema;
    get(id: number): IfcEntity | undefined;
    byType(type: string): IfcEntity[];
    referencesTo(id: number): readonly number[];
}

export interface RelationshipRoles {
    readonly relationship: string;
    readonly relating: string;
    readonly related: string;
}

export interface Outline2 {
    readonly outer: readonly Base.Point2[];
    readonly holes: readonly (readonly Base.Point2[])[];
}

export type MeasuredUnit = "LENGTHUNIT" | "AREAUNIT" | "VOLUMEUNIT" | "PLANEANGLEUNIT";

export interface NewProject {
    readonly name: string;
    readonly siteName: string;
    readonly buildingName: string;
    readonly lengthUnit: Inputs.IFC.lengthUnitEnum;
    readonly seed: string | undefined;
    readonly header: IfcFileHeader;
}

export interface LayerSpec {
    readonly material: string | undefined;
    readonly thickness: number;
    readonly name: string | undefined;
}

export interface SurfaceColour {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly transparency: number;
}

export interface PropertySpec {
    readonly name: string;
    readonly value: string | number | boolean;
    readonly type: string | undefined;
}

export interface WallSpec {
    readonly storey: number;
    readonly id: string | undefined;
    readonly name: string | undefined;
    readonly start: Base.Point2;
    readonly end: Base.Point2;
    readonly height: number;
    readonly baseOffset: number;
    readonly layerSet: number;
    readonly alignment: Inputs.IFC.wallAlignmentEnum;
    readonly wallType: number | undefined;
    readonly predefinedType: string | undefined;
}

export type WallEnd = "ATSTART" | "ATEND" | "ATPATH";

export interface WallGeometry {
    readonly wall: number;
    readonly frame: Frame3;
    readonly start: Base.Point2;
    readonly end: Base.Point2;
    readonly direction: Base.Vector2;
    readonly length: number;
    readonly low: number;
    readonly high: number;
    readonly height: number;
    readonly base: number;
    readonly body: number | undefined;
    readonly usage: number;
}

export interface WallCuts {
    readonly start: Line2 | undefined;
    readonly end: Line2 | undefined;
}

export interface WallJoin {
    readonly mine: WallEnd;
    readonly other: number;
    readonly theirs: WallEnd;
    readonly relationship: number;
}

export interface Meeting {
    readonly stemEnd: WallEnd;
    readonly otherEnd: WallEnd;
    readonly gap: number;
}

export interface WallChange {
    readonly start: Base.Point2 | undefined;
    readonly end: Base.Point2 | undefined;
    readonly bottom: number | undefined;
    readonly height: number | undefined;
    readonly layerSet: number | undefined;
    readonly alignment: Inputs.IFC.wallAlignmentEnum | undefined;
}

export interface WallBody {
    readonly height: number;
    readonly base: number;
    readonly halfSpaces: readonly number[];
}

export interface OpeningChange {
    readonly offset: number | undefined;
    readonly sill: number | undefined;
    readonly width: number | undefined;
    readonly height: number | undefined;
}

export interface SlabOpeningSpec {
    readonly slab: number;
    readonly id: string | undefined;
    readonly name: string | undefined;
    readonly outline: readonly Base.Point2[];
}

export interface WallOpeningPlace {
    readonly opening: number;
    readonly placement: number;
    readonly offset: number;
    readonly sill: number;
    readonly width: number;
    readonly height: number;
}

export interface WallOpeningSpec {
    readonly wall: number;
    readonly id: string | undefined;
    readonly name: string | undefined;
    readonly offset: number;
    readonly sill: number;
    readonly width: number;
    readonly height: number;
}

export interface WallOpening {
    readonly opening: number;
    readonly placement: number;
    readonly wallFace: number;
    readonly thickness: number;
}

export interface DoorTypeSpec {
    readonly id: string | undefined;
    readonly name: string;
    readonly width: number;
    readonly height: number;
    readonly liningThickness: number;
    readonly liningDepth: number;
    readonly panelThickness: number;
    readonly operation: Inputs.IFC.doorOperationEnum;
}

export interface WindowTypeSpec {
    readonly id: string | undefined;
    readonly name: string;
    readonly width: number;
    readonly height: number;
    readonly frameThickness: number;
    readonly frameDepth: number;
    readonly glassThickness: number;
}

export interface FillingSpec {
    readonly wall: number;
    readonly type: number;
    readonly id: string | undefined;
    readonly name: string | undefined;
    readonly offset: number;
    readonly sill: number;
}

export interface TypeBounds {
    readonly min: Base.Point3;
    readonly max: Base.Point3;
}

export interface RectangleProfile {
    readonly kind: Inputs.IFC.profileKindEnum.rectangle;
    readonly width: number;
    readonly depth: number;
}

export interface CircleProfile {
    readonly kind: Inputs.IFC.profileKindEnum.circle;
    readonly radius: number;
}

export interface IShapeProfile {
    readonly kind: Inputs.IFC.profileKindEnum.iShape;
    readonly width: number;
    readonly depth: number;
    readonly webThickness: number;
    readonly flangeThickness: number;
}

export type ProfileSpec = RectangleProfile | CircleProfile | IShapeProfile;

export interface SpaceSpec {
    readonly storey: number;
    readonly id: string | undefined;
    readonly name: string | undefined;
    readonly longName: string | undefined;
    readonly outline: readonly Base.Point2[];
    readonly height: number;
    readonly baseOffset: number;
    readonly predefinedType: string;
}

export interface RoofSpec {
    readonly storey: number;
    readonly id: string | undefined;
    readonly name: string | undefined;
    readonly outline: readonly Base.Point2[];
    readonly kind: Inputs.IFC.roofKindEnum;
    readonly pitch: number;
    readonly layerSet: number;
    readonly overhang: number;
    readonly baseOffset: number;
}

export interface RoofPlane {
    readonly origin: Base.Point2;
    readonly along: Base.Vector2;
    readonly inward: Base.Vector2;
    readonly outline: readonly Base.Point2[];
}

export interface Linear2 {
    readonly a: number;
    readonly b: number;
    readonly c: number;
}

export interface Bounds {
    readonly tops: readonly Linear2[];
    readonly bottoms: readonly Linear2[];
    readonly sides: readonly Linear2[];
}

export interface BoundPair {
    readonly top: Linear2;
    readonly bottom: Linear2;
    readonly keeps: readonly Linear2[];
}

export interface ProfileShape {
    readonly area: number;
    readonly perimeter: number;
    readonly outline: readonly Base.Point2[] | undefined;
}

export interface Plane3 {
    readonly origin: Base.Point3;
    readonly normal: Base.Vector3;
}

export type QuantityKind = "length" | "area" | "volume";

export interface MeasuredQuantity {
    readonly name: string;
    readonly kind: QuantityKind;
    readonly value: number;
}

export interface MeasuredSet {
    readonly name: string;
    readonly quantities: readonly MeasuredQuantity[];
}

export interface ExtrudedBody {
    readonly solid: number;
    readonly frame: Frame3;
    readonly depth: number;
    readonly shape: ProfileShape;
}

export interface SlabSpec {
    readonly storey: number;
    readonly id: string | undefined;
    readonly name: string | undefined;
    readonly outline: readonly Base.Point2[];
    readonly holes: readonly (readonly Base.Point2[])[];
    readonly layerSet: number;
    readonly topOffset: number;
    readonly predefinedType: string;
}

export interface MemberSpec {
    readonly storey: number;
    readonly id: string | undefined;
    readonly name: string | undefined;
    readonly start: Base.Point3;
    readonly end: Base.Point3;
    readonly profile: ProfileSpec;
    readonly rotation: number;
    readonly material: number | undefined;
    readonly predefinedType: string;
}

export interface ContextKey {
    readonly contextType: string;
    readonly identifier: string;
    readonly view: string;
}
