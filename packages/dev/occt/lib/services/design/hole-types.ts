export interface HoleCounterbore {
    readonly diameter: number;
    readonly depth: number;
}

export interface HoleSize {
    readonly diameter: number;
    readonly counterbore: HoleCounterbore | undefined;
    readonly tapped: boolean;
}
