export type StlAxis = readonly [source: 0 | 1 | 2, negated: boolean];

export interface StlAxes {
    readonly x: StlAxis;
    readonly y: StlAxis;
    readonly z: StlAxis;
    readonly mirrors: boolean;
}
