import type { Base } from "@bitbybit-dev/base";

export type StepLengthUnit = `${Base.unitOfLengthEnum}`;

export interface StepFailure {
    readonly node: number;
    readonly reason: string;
}

export interface BuiltRootReport {
    readonly built: true;
    readonly uncut?: StepFailure;
    readonly approximated?: StepFailure;
}

export interface FailedRootReport extends StepFailure {
    readonly built: false;
}

export type RecipeRootReport = BuiltRootReport | FailedRootReport;

export interface RecipeKernelReport {
    readonly roots: RecipeRootReport[];
}

export interface FirstFailure extends StepFailure {
    readonly index: number;
}

export interface KernelRecipeBuild<T> {
    readonly shapes: (T | null)[];
    readonly report: string;
}

export interface BuiltRoots<T> {
    readonly shapes: (T | null)[];
    readonly reports: readonly RecipeRootReport[];
}

export interface PlannedPart {
    readonly root: Base.RecipeRoot;
    readonly roots: number[];
}

export interface PlannedInstance {
    readonly part: number;
    readonly matrix: Base.TransformMatrix;
}

export interface RecipeDocumentPlan {
    readonly parts: readonly PlannedPart[];
    readonly instances: readonly PlannedInstance[];
    readonly lengthUnit: StepLengthUnit;
}

export interface KernelBrepDescription {
    readonly description: string;
    readonly numbers: ArrayLike<number>;
}

export interface KernelDescribedShape {
    readonly nodes: Base.RecipeBrepNode[];
    readonly tolerance: number;
}
