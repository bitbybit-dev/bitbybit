export type KernelNumber = number | null;

export type KernelTriple = [KernelNumber, KernelNumber, KernelNumber];

export interface KernelAnnotationPlane {
    origin: KernelTriple;
    normal: KernelTriple;
    direction: KernelTriple;
}

export interface KernelAnnotation {
    entry: string;
    kind: string;
    type: string;
    value: KernelNumber;
    textPoint?: KernelTriple;
    attached: number;
    product?: number;
    label: string;
    plane?: KernelAnnotationPlane;
    lines: KernelNumber[][];
    fills: KernelNumber[][];
    facing?: KernelTriple;
}

export interface KernelSavedView {
    entry: string;
    name: string;
    isParallel: boolean;
    eye: KernelTriple;
    direction: KernelTriple;
    up: KernelTriple;
    width: KernelNumber;
    height: KernelNumber;
    annotations: string[];
}

export interface KernelProductPlacements {
    product: number;
    placements: KernelNumber[][];
}

export interface KernelLeftOut {
    annotations: number;
    views: number;
}

export interface KernelAnnotations {
    annotations: KernelAnnotation[];
    views: KernelSavedView[];
    products?: KernelProductPlacements[];
    leftOut: KernelLeftOut;
}
