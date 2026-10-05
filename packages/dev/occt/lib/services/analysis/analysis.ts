import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import { checkedShape } from "../base/input-checks";
import { OCCTAnalysisCurves } from "./curves";
import { OCCTAnalysisSurfaces } from "./surfaces";
import { OCCTAnalysisMeasure } from "./measure";
import { OCCTAnalysisClashes } from "./clashes";

const SURFACE_TYPES_BY_KERNEL_VALUE: readonly Inputs.OCCT.surfaceTypeEnum[] = [
    Inputs.OCCT.surfaceTypeEnum.plane,
    Inputs.OCCT.surfaceTypeEnum.cylinder,
    Inputs.OCCT.surfaceTypeEnum.cone,
    Inputs.OCCT.surfaceTypeEnum.sphere,
    Inputs.OCCT.surfaceTypeEnum.torus,
    Inputs.OCCT.surfaceTypeEnum.bezier,
    Inputs.OCCT.surfaceTypeEnum.bspline,
    Inputs.OCCT.surfaceTypeEnum.revolution,
    Inputs.OCCT.surfaceTypeEnum.extrusion,
    Inputs.OCCT.surfaceTypeEnum.offset,
];

const CURVE_TYPES_BY_KERNEL_VALUE: readonly Inputs.OCCT.curveTypeEnum[] = [
    Inputs.OCCT.curveTypeEnum.line,
    Inputs.OCCT.curveTypeEnum.circle,
    Inputs.OCCT.curveTypeEnum.ellipse,
    Inputs.OCCT.curveTypeEnum.hyperbola,
    Inputs.OCCT.curveTypeEnum.parabola,
    Inputs.OCCT.curveTypeEnum.bezier,
    Inputs.OCCT.curveTypeEnum.bspline,
    Inputs.OCCT.curveTypeEnum.offset,
];

const tripleAt = (values: Float64Array, index: number): [number, number, number] =>
    [values[3 * index]!, values[3 * index + 1]!, values[3 * index + 2]!];

/**
 * Questions asked of OpenCascade shapes, answered with points, numbers and index lists rather than
 * new shapes. `curves` reads edges and wires, `surfaces` reads faces, `measure` measures boxes,
 * distances, angles and radii, and `clashes` finds shapes and faces that overlap or come too close.
 * `signatures` describes every face and edge of a shape at once. The shapes themselves are left as
 * they are.
 */
export class OCCTAnalysis {
    public readonly curves: OCCTAnalysisCurves;
    public readonly surfaces: OCCTAnalysisSurfaces;
    public readonly measure: OCCTAnalysisMeasure;
    public readonly clashes: OCCTAnalysisClashes;

    constructor(
        private readonly occ: BitbybitOcctModule,
        och: OccHelper,
    ) {
        this.curves = new OCCTAnalysisCurves(occ, och);
        this.surfaces = new OCCTAnalysisSurfaces(occ, och);
        this.measure = new OCCTAnalysisMeasure(occ, och);
        this.clashes = new OCCTAnalysisClashes(occ, och);
    }

    /**
     * Describes every face and edge of a shape in one pass: each face's surface kind, area, centre,
     * outward normal and box, and each edge's curve kind, length, midpoint and direction there.
     *
     * The numbering and the measures are the selectors' own, so a kept description finds the same
     * face again after a rebuild.
     * @param inputs - The shape
     * @returns The signature of every face and every edge
     * @group shape
     * @shortname signatures
     * @drawable false
     * @example
     * ```typescript
     * const { faces, edges } = await bitbybit.occt.analysis.signatures({ shape: bracket });
     * const largest = faces.reduce((a, b) => (b.area > a.area ? b : a));
     * ```
     */
    signatures(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.ShapeSignatures {
        const resolved = resolveDto(Inputs.OCCT.ShapeDto, inputs) as Resolved.OCCT.ShapeDto<TopoDS_Shape>;
        const read = this.occ.ShapeSignatures(checkedShape(resolved.shape));
        const faces = Array.from(read.faceTypes, (type, index): Models.OCCT.FaceSignature => ({
            index,
            type: SURFACE_TYPES_BY_KERNEL_VALUE[type] ?? Inputs.OCCT.surfaceTypeEnum.other,
            area: read.faceAreas[index]!,
            centre: tripleAt(read.faceCentres, index),
            normal: tripleAt(read.faceNormals, index),
            box: { min: tripleAt(read.faceBoxes, 2 * index), max: tripleAt(read.faceBoxes, 2 * index + 1) },
        }));
        const edges = Array.from(read.edgeTypes, (type, index): Models.OCCT.EdgeSignature => ({
            index,
            type: CURVE_TYPES_BY_KERNEL_VALUE[type] ?? Inputs.OCCT.curveTypeEnum.other,
            isDegenerate: type === -1,
            length: read.edgeLengths[index]!,
            midpoint: tripleAt(read.edgeMidpoints, index),
            tangent: tripleAt(read.edgeTangents, index),
        }));
        return { faces, edges };
    }
}
