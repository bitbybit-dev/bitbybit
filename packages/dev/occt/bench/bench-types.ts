import type { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OCCTService } from "../lib/occ-service";

export interface BenchCase {
    readonly name: string;
    readonly run: (occt: OCCTService) => number[];
}

export interface LoadedKernel {
    readonly label: string;
    readonly occ: BitbybitOcctModule;
}

export interface KernelGlue {
    readonly default: (options: object) => Promise<BitbybitOcctModule>;
}
