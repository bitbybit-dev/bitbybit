import type { EmbindLedgerOptions } from "./embind-ledger-types";

const OCCT_BORROWING_METHODS = new Set(["get"]);
const MANIFOLD_LIBRARY_SCRIPT = /[\\/]manifold-3d[\\/]manifold\.js$/;

export const OCCT_LEDGER: EmbindLedgerOptions = {
    kernel: "occt",
    runtime: new Set(["addRunDependency", "removeRunDependency", "decrementExceptionRefcount", "getExceptionMessage", "_BitbybitOcct_Init"]),
    borrowing: (className, method) => className.startsWith("Handle_") && OCCT_BORROWING_METHODS.has(method),
};

export const MANIFOLD_LEDGER: EmbindLedgerOptions = {
    kernel: "manifold",
    runtime: new Set(["setup", "addFunction", "removeFunction", "initTBB"]),
    libraryScript: (fileName) => MANIFOLD_LIBRARY_SCRIPT.test(fileName),
};
