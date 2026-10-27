import type { DtoRegistry } from "@bitbybit-dev/base";

export interface Known {
    features: Map<string, string>;
    sketches: Map<string, Set<string>>;
    bodies: Set<string>;
    parameters: Set<string>;
    materials: Set<string>;
    assets: Set<string>;
    pinnedAssets: Set<string>;
    holePositions: Map<string, Set<string>>;
    faceSketches: Set<string>;
    registry: DtoRegistry;
    operations: ReadonlySet<string>;
    lengthUnit: string;
}

export type Check = (value: unknown, path: string, known: Known) => void;
