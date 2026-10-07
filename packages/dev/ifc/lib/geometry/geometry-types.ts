import type { Base } from "@bitbybit-dev/base";
import type * as Inputs from "../api/inputs";

export type ProfileRegion = PolygonRegion | CircleRegion;

export interface PolygonRegion {
    readonly kind: "polygon";
    readonly outer: Base.Point2[];
    readonly holes: Base.Point2[][];
}

export interface CircleRegion {
    readonly kind: "circle";
    readonly center: Base.Point2;
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
    readonly point: Base.Point2 | undefined;
    readonly parameter: number | undefined;
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
