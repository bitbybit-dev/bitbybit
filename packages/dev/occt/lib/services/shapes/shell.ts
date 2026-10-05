import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shell } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";

/**
 * Shells in OpenCascade: sets of faces joined along their edges. A shell that closes on itself with
 * no gaps bounds a volume and can become a solid with `shapes.solid.fromClosedShell`; an open shell
 * is a surface with a rim. Build one by sewing faces together, check whether it is closed and
 * measure its area.
 */
export class OCCTShell {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Collects diagnostic facts about a shell: whether it is valid, how many faces and edges it
     * has, its total area and, for every face, the surface type, degrees, control point counts,
     * bounds and area.
     *
     * An empty or null shape gives a report marked invalid with zero counts.
     * @param inputs - The shell to inspect
     * @returns The report with counts, area and one entry per face
     * @group debug
     * @shortname shell debug info
     * @drawable false
     * @example
     * ```typescript
     * const info = await bitbybit.occt.shapes.shell.debugInfo({ shape: shell });
     * ```
     */
    debugInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): Models.OCCT.ShellDebugInfo {
        if (!inputs.shape || inputs.shape.IsNull()) {
            return { valid: false, nbFaces: 0, nbEdges: 0, area: 0, faces: [] };
        }
        const faces = this.och.shapeGettersService.getFaces({ shape: inputs.shape });
        const faceInfos = faces.map((f) => JSON.parse(this.occ.FaceDebugInfoJson(f)) as Models.OCCT.FaceDebugInfo);
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const area = faceInfos.reduce((sum, f) => sum + (f.area ?? 0), 0);
        return { valid: true, nbFaces: faces.length, nbEdges: edges.length, area, faces: faceInfos };
    }

    /**
     * Joins faces into a shell by sewing their edges together where they meet within the tolerance.
     *
     * Faces further apart than the tolerance stay unjoined, so a closed shell may come out open; a
     * larger tolerance sews more. A lone face comes back as that face, and faces that do not all
     * join as a compound of what did.
     * @param inputs - The faces and the sewing tolerance
     * @returns The shell, or the face or compound when the faces do not join into one
     * @group create
     * @shortname sew
     * @drawable true
     * @example
     * ```typescript
     * const shell = await bitbybit.occt.shapes.shell.sewFaces({ shapes: [top, bottom, side], tolerance: 1e-7 });
     * ```
     */
    sewFaces(inputs: Inputs.OCCT.SewDto<TopoDS_Face>): TopoDS_Shell {
        const resolved = resolveDto(Inputs.OCCT.SewDto, inputs) as Resolved.OCCT.SewDto<TopoDS_Face>;
        return this.och.shellsService.sewFaces(resolved);
    }

    /**
     * Tells whether a shell closes on itself with no gaps, which is what a solid needs.
     * @param inputs - The shell
     * @returns True when the shell is closed
     */
    isClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): boolean {
        return this.occ.BRep_Tool_IsClosed(inputs.shape);
    }

    /**
     * Measures the total area of all the faces of a shell, in square model units.
     * @param inputs - The shell
     * @returns The surface area
     * @group get
     * @shortname area
     * @drawable false
     * @example
     * ```typescript
     * const area = await bitbybit.occt.shapes.shell.getShellSurfaceArea({ shape: shell });
     * ```
     */
    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): number {
        return this.och.shellsService.getShellSurfaceArea(inputs);
    }
}
