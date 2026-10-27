import { afterAll, vi } from "vitest";
import { writeLedgerReport } from "../../../../__test__/ledger-report-file";

vi.mock("manifold-3d", async (importOriginal) => {
    const [original, ledger, vitest] = await Promise.all([importOriginal<typeof import("manifold-3d")>(), import("./kernel-ledger"), import("vitest")]);
    const context = (): string | undefined => vitest.expect.getState().currentTestName;
    const create: typeof original.default = async (options) => ledger.watchManifold(await original.default(options), context);
    return { ...original, default: create };
});

writeLedgerReport("loaded");

afterAll(() => writeLedgerReport("finished"));
