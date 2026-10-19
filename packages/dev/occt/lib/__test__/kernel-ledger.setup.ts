import { afterAll, vi } from "vitest";
import { writeLedgerReport } from "../../../__test__/ledger-report-file";
import type * as Glue from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Registry from "../services/design/cache-registry";
import type { DesignCaches } from "../services/design/cache-registry-types";

vi.mock("../../bitbybit-dev-occt/bitbybit-dev-occt", async (importOriginal) => {
    const [glue, ledger, { expect }] = await Promise.all([importOriginal<typeof Glue>(), import("./kernel-ledger"), import("vitest")]);
    const context = (): string | undefined => expect.getState().currentTestName;
    const create = async (options?: unknown): Promise<Glue.BitbybitOcctModule> => ledger.watchOcct(await glue.default(options), context);
    return { ...glue, default: create };
});

vi.mock("../services/design/cache-registry", async (importOriginal) => {
    const [registry, { keepOwner }] = await Promise.all([importOriginal<typeof Registry>(), import("../../../__test__/embind-ledger")]);
    const registerDesignCaches = (design: object, caches: DesignCaches): void => {
        keepOwner(caches.cache);
        keepOwner(caches.sections);
        registry.registerDesignCaches(design, caches);
    };
    return { ...registry, registerDesignCaches };
});

writeLedgerReport("loaded");

afterAll(() => writeLedgerReport("finished"));
