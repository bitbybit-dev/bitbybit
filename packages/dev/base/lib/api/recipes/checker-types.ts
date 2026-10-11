import type { Base } from "../inputs/base-inputs";
import type { RecipeIssue } from "./recipe-types";

export type Kind = "profile" | "solid" | "halfSpace";

export interface Checker {
    readonly issues: RecipeIssue[];
    readonly buffers: Base.RecipeBuffers;
    readonly kinds: (Kind | undefined)[];
    readonly depths: number[];
    referenced: number;
}

export interface NodeSummary {
    readonly kind: Kind | undefined;
    readonly depth: number;
}
