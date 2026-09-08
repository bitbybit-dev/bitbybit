import {
    TopoDS_Edge, TopoDS_Shape
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import { EdgesService } from "./edges.service";
import { ShapeGettersService } from "./shape-getters";
import { BaseBitByBit } from "../../base";
import { WiresService } from "./wires.service";
export class DxfService {

    constructor(
        private readonly base: BaseBitByBit,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly edgesService: EdgesService,
        private readonly wiresService: WiresService,
    ) { }

    /**
     * Step 1: Convert OCCT shape to DXF paths (without layer/color info)
     * This analyzes the shape geometry and creates appropriate DXF segments
     */
    shapeToDxfPaths(inputs: Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>): IO.DxfPathDto[] {
        const wires = this.shapeGettersService.getWires({ shape: inputs.shape });
        
        const paths: IO.DxfPathDto[] = [];

        wires.forEach(wire => {
            const edges = this.edgesService.getEdgesAlongWire({ shape: wire });
            
            if (edges.length === 0) {
                return;
            }

            const isWireClosed = this.wiresService.isWireClosed({ shape: wire });

            const segments: (IO.DxfLineSegmentDto | IO.DxfArcSegmentDto | IO.DxfCircleSegmentDto | IO.DxfPolylineSegmentDto)[] = [];
            
            let i = 0;
            while (i < edges.length) {
                const edge = edges[i]!;
                
                if (this.edgesService.isEdgeCircular({ shape: edge })) {
                    const bounds = this.edgesService.getEdgeBounds(edge);
                    const angleRange = bounds.uMax - bounds.uMin;
                    const isFullCircle = Math.abs(angleRange - 2 * Math.PI) < 0.01;
                    
                    if (isFullCircle) {
                        const circle = this.edgesService.getCircularEdgeCenterPoint({ shape: edge });
                        const radius = this.edgesService.getCircularEdgeRadius({ shape: edge });
                        segments.push({
                            center: [circle[0], circle[2]],
                            radius: radius
                        });
                        i++;
                        continue;
                    }
                }
                
                const polylineResult = this.tryCreateUnifiedPolyline(edges, i, inputs, isWireClosed && i === 0);
                if (polylineResult) {
                    segments.push(polylineResult.polyline);
                    i = polylineResult.nextIndex;
                    continue;
                }
                
                i++;
            }
            
            if (segments.length > 0) {
                paths.push({
                    segments: segments
                });
            }
        });

        return paths;
    }

    /**
     * Step 2: Add layer and color information to DXF paths
     * Takes paths from shapeToDxfPaths and adds styling
     */
    dxfPathsWithLayer(inputs: Inputs.OCCT.DxfPathsWithLayerDto): IO.DxfPathsPartDto {
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
    dxfCreate(inputs: Inputs.OCCT.DxfPathsPartsListDto): string {
        const model = {
            dxfPathsParts: inputs.pathsParts,
            colorFormat: inputs.colorFormat,
            acadVersion: inputs.acadVersion
        } as IO.DxfModelDto;
        const dxfContent = this.base.io.dxf.dxfCreate(model);
        return dxfContent;
    }

    /**
     * Try to create a unified polyline from consecutive edges (linear, arc, and complex).
     * This creates a single LWPOLYLINE with bulges where applicable.
     *
     * A DXF bulge encodes a whole arc as one number on the vertex it starts from:
     * `bulge = tan(includedAngle / 4)`. Positive curves left travelling start to end, negative curves
     * right, and zero is a straight segment.
     *
     * The included angle cannot be recovered from the two endpoint angles alone. Two arcs share those
     * endpoints - the short way round and the long way round - and the difference between them is
     * exactly what the bulge has to express. So a third point, halfway along the edge, is sampled to
     * choose between them: when its offset from the start has the same sign as the end's and is
     * smaller in magnitude, the arc is the short one, and otherwise it is the complement.
     * @param edges the edges to walk from startIndex
     * @param startIndex where in the edge list to begin
     * @param inputs the export options in force
     * @param shouldBeClosed whether the resulting polyline closes
     * @returns the polyline and the index to continue from, or null when none could be built
     */
    private tryCreateUnifiedPolyline(
        edges: TopoDS_Edge[],
        startIndex: number,
        inputs: Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>,
        shouldBeClosed: boolean
    ): { polyline: IO.DxfPolylineSegmentDto, nextIndex: number } | null {
        
        const points: Base.Point2[] = [];
        const bulges: number[] = [];
        let j = startIndex;
        
        while (j < edges.length) {
            const currentEdge = edges[j]!;
            const isLinear = this.edgesService.isEdgeLinear({ shape: currentEdge });
            const isCircular = this.edgesService.isEdgeCircular({ shape: currentEdge });
            
            if (isCircular) {
                const bounds = this.edgesService.getEdgeBounds(currentEdge);
                const angleRange = bounds.uMax - bounds.uMin;
                if (Math.abs(angleRange - 2 * Math.PI) < 0.01) {
                    break;
                }
            }
            
            const startPt = this.edgesService.startPointOnEdge({ shape: currentEdge });
            const endPt = this.edgesService.endPointOnEdge({ shape: currentEdge });
            
            if (isLinear) {
                points.push([startPt[0], startPt[2]]);
                bulges.push(0);
            } else if (isCircular) {
                points.push([startPt[0], startPt[2]]);
                
                const midParam = 0.5;
                const midPt3d = this.edgesService.pointOnEdgeAtParam({ shape: currentEdge, param: midParam });
                
                const center = this.edgesService.getCircularEdgeCenterPoint({ shape: currentEdge });
                
                const startAngle = Math.atan2(startPt[2] - center[2], startPt[0] - center[0]);
                const midAngle = Math.atan2(midPt3d[2] - center[2], midPt3d[0] - center[0]);
                const endAngle = Math.atan2(endPt[2] - center[2], endPt[0] - center[0]);
                
                let angle1 = endAngle - startAngle;
                let angle2 = midAngle - startAngle;
                
                angle1 = Math.atan2(Math.sin(angle1), Math.cos(angle1));
                angle2 = Math.atan2(Math.sin(angle2), Math.cos(angle2));
                
                let includedAngle: number;
                if (Math.sign(angle1) === Math.sign(angle2) && Math.abs(angle2) < Math.abs(angle1) + 0.1) {
                    includedAngle = angle1;
                } else {
                    includedAngle = angle1 > 0 ? angle1 - 2 * Math.PI : angle1 + 2 * Math.PI;
                }
                
                const bulge = Math.tan(includedAngle / 4);
                bulges.push(bulge);
            } else {
                const points3d = this.edgesService.edgeToPoints({
                    shape: currentEdge,
                    angularDeflection: inputs.angularDeflection,
                    curvatureDeflection: inputs.curvatureDeflection,
                    minimumOfPoints: inputs.minimumOfPoints,
                    uTolerance: inputs.uTolerance,
                    minimumLength: inputs.minimumLength
                });
                
                for (let k = 0; k < points3d.length - 1; k++) {
                    points.push([points3d[k]![0], points3d[k]![2]]);
                    bulges.push(0);
                }
            }
            
            j++;
        }
        
        if (j > startIndex && !shouldBeClosed) {
            const lastEdge = edges[j - 1]!;
            const endPt = this.edgesService.endPointOnEdge({ shape: lastEdge });
            points.push([endPt[0], endPt[2]]);
            bulges.push(0);
        }
        
        if (j <= startIndex || points.length < 2) {
            return null;
        }
        
        const polyline: IO.DxfPolylineSegmentDto = {
            points: points,
            closed: shouldBeClosed,
            bulges: bulges
        };
        
        return {
            polyline: polyline,
            nextIndex: j
        };
    }

}
