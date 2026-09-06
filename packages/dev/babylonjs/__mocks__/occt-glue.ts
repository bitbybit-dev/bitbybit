// Stands in for the emscripten glue (@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt.js)
// under jest. The real module is ESM using import.meta, which this suite's CommonJS transform
// cannot load, and no unit test here instantiates the kernel: everything reaching it goes through
// the worker manager, which these tests construct without a worker.
export default async function createBitbybitDevOcct(): Promise<never> {
    throw new Error("The OCCT kernel is not available in unit tests");
}
