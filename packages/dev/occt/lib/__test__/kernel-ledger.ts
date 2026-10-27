import type { BitbybitOcctModule } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { LedgerRun } from "../../../__test__/embind-ledger-types";
import { handlesIn, isHandle, ledgerRun as windowRun, namesOf, watchModule, watchSurface } from "../../../__test__/embind-ledger";
import { OCCT_LEDGER } from "../../../__test__/kernel-ledger-options";

export { handlesIn, isHandle, namesOf, OCCT_LEDGER };

export function ledgerRun<T>(occt: BitbybitOcctModule, act: () => T): LedgerRun<T> {
    watchModule(occt, OCCT_LEDGER);
    return windowRun(act);
}

export async function watchOcct(occt: BitbybitOcctModule, context?: () => string | undefined): Promise<BitbybitOcctModule> {
    watchModule(occt, OCCT_LEDGER);
    const [{ OCCTService }, { occtDtoRegistry }] = await Promise.all([
        import("../occ-service"),
        import("../api/dto-registry"),
    ]);
    watchSurface({ root: new OCCTService(occt), paths: Object.keys(occtDtoRegistry), ...(context === undefined ? {} : { context }) });
    return occt;
}
