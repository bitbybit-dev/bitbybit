import { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { PathBuilder } from "../svg/path-builder";

/**
 * A generic 2D path builder: describe an outline as subpaths of line, quadratic, cubic and arc
 * segments, the vocabulary of SVG paths, and get an OpenCascade wire or face in one call. It knows
 * nothing about SVG itself; the SVG importer in `svg` translates documents into this vocabulary and
 * calls it.
 */
export class OCCTPath {
    private readonly builder: PathBuilder;

    constructor(
        occ: BitbybitOcctModule,
        och: OccHelper
    ) {
        this.builder = new PathBuilder(occ, och);
    }

    /**
     * Builds a shape from path subpaths: one wire per subpath, packed into a compound when there
     * are several, or a face when `makeFaces` is true and the outlines close.
     *
     * `joinSegments` merges consecutive segments into single edges within `tolerance`; `scale` and
     * `flipY` map the path's units and downward Y axis onto the ground plane. An empty path gives
     * undefined.
     * @param inputs - The subpaths, whether to make faces, the joining tolerance and the placement options
     * @returns The wire, compound of wires or face, or undefined for an empty path
     * @group create
     * @shortname shape from path
     * @drawable true
     * @example
     * ```typescript
     * const shape = await bitbybit.occt.path.shapeFromPath({
     *     subpaths: [{ start: [0, 0], segments: [{ type: "line", to: [10, 0] }, { type: "line", to: [10, 10] }, { type: "line", to: [0, 10] }], closed: true }],
     *     makeFaces: true,
     *     joinSegments: true,
     *     tolerance: 1e-7,
     *     scale: 1,
     *     flipY: true,
     *     origin: [0, 0, 0],
     * });
     * ```
     */
    shapeFromPath(inputs: Inputs.OCCT.ShapeFromPathDto): TopoDS_Shape | undefined {
        return this.builder.shapeFromPath(inputs);
    }
}
