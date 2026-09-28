import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { Base } from "../../api/inputs";
import { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import { BaseBitByBit } from "../../base";
import * as Resolved from "../../api/resolved-inputs";
export class DxfService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly base: BaseBitByBit,
    ) { }

    /**
     * Step 1: the DXF paths of a shape's wires in the XZ plane, read in one kernel call: a closed
     * circle becomes a circle, and every other run of edges one polyline whose arcs are bulges.
     */
    shapeToDxfPaths(inputs: Resolved.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>): IO.DxfPathDto[] {
        const values = this.occ.DxfPathsOf(inputs.shape, inputs.angularDeflection, inputs.curvatureDeflection,
            inputs.minimumOfPoints, inputs.uTolerance, inputs.minimumLength);
        let at = 0;
        const next = (): number => values[at++]!;
        return Array.from({ length: next() }, () => ({
            segments: Array.from({ length: next() }, (): IO.DxfCircleSegmentDto | IO.DxfPolylineSegmentDto => {
                if (next() === 0) {
                    const center: Base.Point2 = [next(), next()];
                    return { center, radius: next() };
                }
                const closed = next() === 1;
                const points: Base.Point2[] = [];
                const bulges: number[] = [];
                const count = next();
                for (let vertex = 0; vertex < count; vertex++) {
                    points.push([next(), next()]);
                    bulges.push(next());
                }
                return { points, closed, bulges };
            }),
        }));
    }

    /**
     * Step 2: Add layer and color information to DXF paths
     * Takes paths from shapeToDxfPaths and adds styling
     */
    dxfPathsWithLayer(inputs: Resolved.OCCT.DxfPathsWithLayerDto): IO.DxfPathsPartDto {
        return {
            layer: inputs.layer,
            color: inputs.color,
            paths: inputs.paths
        };
    }

    /**
     * Step 3: Assemble multiple path parts into a complete DXF file
     * Takes multiple outputs from dxfPathsWithLayer and creates final DXF
     */
    dxfCreate(inputs: Resolved.OCCT.DxfPathsPartsListDto): string {
        const model = {
            dxfPathsParts: inputs.pathsParts,
            colorFormat: inputs.colorFormat,
            acadVersion: inputs.acadVersion
        } as IO.DxfModelDto;
        const dxfContent = this.base.io.dxf.dxfCreate(model);
        return dxfContent;
    }

}
