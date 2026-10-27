import type { OCCTService } from "./occ-service";
import { releaseCachesOf } from "./services/design/cache-registry";

/**
 * Frees what the design builder keeps between builds, so the next build of a document builds every
 * feature again.
 *
 * That is the shape of every feature it built, the cuts `section` made, and the boxes and clash meshes
 * it measured. The parts a build or a section returned stay the caller's and stay usable. Call it
 * where every other kernel object is freed at once, as the worker's `cleanAllCache` does; with nothing
 * kept, it does nothing.
 * @param occt - The service whose design builder lets go of what it kept
 * @example
 * ```typescript
 * for (let run = 0; run < 2; run++) {
 *     const built = occt.design.build({ document: plate });
 *     console.log(built.report.every(feature => !feature.cached));
 *     [...built.parts, ...(built.structure?.parts ?? [])].forEach(part => part.shape.delete());
 *     releaseDesignCaches(occt);
 * }
 * ```
 */
export function releaseDesignCaches(occt: OCCTService): void {
    releaseCachesOf(occt.design);
}
