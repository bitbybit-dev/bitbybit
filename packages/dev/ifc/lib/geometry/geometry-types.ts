import type { Base } from "@bitbybit-dev/base";
import type { FrameAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type * as Inputs from "../api/inputs";

export type ProfileRegion = PolygonRegion | CircleRegion | CompositeRegion;

export interface PolygonRegion {
    readonly kind: "polygon";
    readonly outer: Base.Point2[];
    readonly holes: Base.Point2[][];
    readonly plane?: FrameAxes;
}

export interface CircleRegion {
    readonly kind: "circle";
    readonly center: Base.Point2;
    readonly radius: number;
    readonly innerRadius: number;
}

export interface CompositeRegion {
    readonly kind: "composite";
    readonly parts: readonly ProfileRegion[];
}

export interface ProfileCorner {
    readonly point: Base.Point2;
    readonly radius: number;
}

export interface ModelRecipe {
    readonly recipe: Base.Recipe;
    readonly problems: Inputs.IFC.GeometryProblemDto[];
}

export interface DescribedModel {
    readonly key: string;
    readonly described: ModelRecipe;
}

export interface TriangleMesh {
    readonly positions: readonly number[];
    readonly indices: readonly number[];
}

export interface CurveTrim {
    readonly point: Base.Point3 | undefined;
    readonly parameter: number | undefined;
}

export interface ParametricSurface {
    readonly periods: readonly [number | undefined, number | undefined];
    point(u: number, v: number): Base.Point3;
    parameters(point: Base.Point3, near: Base.Point2 | undefined): Base.Point2;
    pole(axis: number, side: number): number | undefined;
}

export interface SurfaceFit {
    readonly uv: Base.Point2;
    readonly miss: number;
}

export interface PolePoint {
    readonly axis: number;
    readonly at: number;
}

export interface CutEdge {
    readonly uv: Base.Point2[];
    readonly points: Base.Point3[];
}

export interface FaceLoop {
    readonly points: readonly Base.Point3[];
    readonly uv: readonly Base.Point2[];
    readonly winding: readonly [number, number];
}

export interface BoundLoop extends FaceLoop {
    readonly outer: boolean;
}

export interface AssembledFace {
    readonly uv: Base.Point2[];
    readonly positions: Base.Point3[];
    readonly indices: number[][];
}

export interface ProfilePolyline {
    readonly points: readonly Base.Point3[];
    readonly lengths: readonly number[];
    readonly closed: boolean;
}

export interface BSplineCurve {
    readonly degree: number;
    readonly points: readonly Base.Point3[];
    readonly weights: readonly number[] | undefined;
    readonly knots: readonly number[];
}

export interface ConicFrame {
    readonly origin: Base.Point3;
    readonly x: Base.Vector3;
    readonly y: Base.Vector3;
    readonly radii: readonly [number, number];
}

export interface RecipePart {
    readonly node: number;
    readonly rgba: readonly number[] | undefined;
}

export interface ItemEntry {
    readonly item: number;
}

export interface NodeEntry {
    readonly node: number;
}

export type PartEntry = ItemEntry | NodeEntry;

export interface PartGroup {
    readonly rgba: readonly number[] | undefined;
    readonly entries: PartEntry[];
}
