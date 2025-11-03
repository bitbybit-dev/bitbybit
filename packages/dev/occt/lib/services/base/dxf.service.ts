import {
    TopoDS_Edge, TopoDS_Shape
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";
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
        // Get all wires from the shape
        const wires = this.shapeGettersService.getWires({ shape: inputs.shape });
        
        const paths: IO.DxfPathDto[] = [];

        wires.forEach(wire => {
            // Get edges along the wire in order with consistent direction
            const edges = this.edgesService.getEdgesAlongWire({ shape: wire });
            
            if (edges.length === 0) {
                return;
            }

            // Check if the entire wire is closed once at the beginning
            const isWireClosed = this.wiresService.isWireClosed({ shape: wire });

            const segments: (IO.DxfLineSegmentDto | IO.DxfArcSegmentDto | IO.DxfCircleSegmentDto | IO.DxfPolylineSegmentDto)[] = [];
            
            let i = 0;
            while (i < edges.length) {
                const edge = edges[i];
                
                // Check if edge is a full circle - handle separately
                if (this.edgesService.isEdgeCircular({ shape: edge })) {
                    const bounds = this.edgesService.getEdgeBounds(edge);
                    const angleRange = bounds.uMax - bounds.uMin;
                    const isFullCircle = Math.abs(angleRange - 2 * Math.PI) < 0.01;
                    
                    if (isFullCircle) {
                        const circle = this.edgesService.getCircularEdgeCenterPoint({ shape: edge });
                        const radius = this.edgesService.getCircularEdgeRadius({ shape: edge });
                        segments.push({
                            center: [circle[0], circle[2]], // XZ plane (remove Y)
                            radius: radius
                        });
                        i++;
                        continue;
                    }
                }
                
                // Try to collect all edges (linear, arc, and complex) into a unified polyline with bulges
                const polylineResult = this.tryCreateUnifiedPolyline(edges, i, inputs, isWireClosed && i === 0);
                if (polylineResult) {
                    segments.push(polylineResult.polyline);
                    i = polylineResult.nextIndex;
                    continue;
                }
                
                // Fallback: shouldn't reach here normally
                i++;
            }
            
            // Create path from segments
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
        const model: IO.DxfModelDto = {
            dxfPathsParts: inputs.pathsParts
        };
        const dxfContent = this.base.io.dxf.dxfCreate(model);
        return dxfContent;
    }

    /**
     * Try to create a unified polyline from consecutive edges (linear, arc, and complex)
     * This creates a single LWPOLYLINE with bulges where applicable
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
            const currentEdge = edges[j];
            const isLinear = this.edgesService.isEdgeLinear({ shape: currentEdge });
            const isCircular = this.edgesService.isEdgeCircular({ shape: currentEdge });
            
            // Check if it's a full circle - stop here
            if (isCircular) {
                const bounds = this.edgesService.getEdgeBounds(currentEdge);
                const angleRange = bounds.uMax - bounds.uMin;
                if (Math.abs(angleRange - 2 * Math.PI) < 0.01) {
                    break; // Full circle, handle separately
                }
            }
            
            const startPt = this.edgesService.startPointOnEdge({ shape: currentEdge });
            const endPt = this.edgesService.endPointOnEdge({ shape: currentEdge });
            
            if (isLinear) {
                // Linear edge: add start point with bulge 0
                points.push([startPt[0], startPt[2]]);
                bulges.push(0);
            } else if (isCircular) {
                // Arc edge: add start point with calculated bulge
                const center = this.edgesService.getCircularEdgeCenterPoint({ shape: currentEdge });
                
                points.push([startPt[0], startPt[2]]);
                
                // DXF bulge is the tangent of 1/4 of the included angle
                // Positive bulge = arc curves to the left when traveling from start to end
                // Negative bulge = arc curves to the right when traveling from start to end
                
                // Calculate the included angle
                const startAngle = Math.atan2(startPt[2] - center[2], startPt[0] - center[0]);
                const endAngle = Math.atan2(endPt[2] - center[2], endPt[0] - center[0]);
                
                let includedAngle = endAngle - startAngle;
                
                // Normalize to [-π, π]
                while (includedAngle > Math.PI) includedAngle -= 2 * Math.PI;
                while (includedAngle < -Math.PI) includedAngle += 2 * Math.PI;
                
                // Determine the sign by checking which side of the chord the center is on
                // Using 2D cross product in the XZ plane (bird's eye view, Y removed)
                const dx = endPt[0] - startPt[0];
                const dz = endPt[2] - startPt[2];
                
                // Vector from start point to center
                const centerDx = center[0] - startPt[0];
                const centerDz = center[2] - startPt[2];
                
                // Cross product in 2D: determines which side of the chord vector the center is on
                // Positive = center is to the left of chord (when facing from start to end)
                // Negative = center is to the right of chord
                const crossProduct = dx * centerDz - dz * centerDx;
                
                // Bulge formula: sign * tan(|includedAngle| / 4)
                const absIncludedAngle = Math.abs(includedAngle);
                
                let sign: number;
                if (Math.abs(crossProduct) < 1e-10) {
                    // Degenerate case: center is on the chord line
                    // Sample a point on the arc at the midpoint angle to determine which side
                    const midAngle = (startAngle + endAngle) / 2;
                    const radius = this.edgesService.getCircularEdgeRadius({ shape: currentEdge });
                    const midPt = [
                        center[0] + radius * Math.cos(midAngle),
                        center[2] + radius * Math.sin(midAngle)
                    ];
                    
                    // Check which side of the chord this midpoint is on
                    const midCrossProduct = dx * (midPt[1] - startPt[2]) - dz * (midPt[0] - startPt[0]);
                    sign = Math.sign(midCrossProduct);
                } else {
                    sign = Math.sign(crossProduct);
                }
                
                const bulge = sign * Math.tan(absIncludedAngle / 4);
                bulges.push(bulge);
            } else {
                // Complex edge: tessellate and add points with bulge 0
                const points3d = this.edgesService.edgeToPoints({
                    shape: currentEdge,
                    angularDeflection: inputs.angularDeflection,
                    curvatureDeflection: inputs.curvatureDeflection,
                    minimumOfPoints: inputs.minimumOfPoints,
                    uTolerance: inputs.uTolerance,
                    minimumLength: inputs.minimumLength
                });
                
                // Add all tessellation points except the last one for all edges
                // The last point of each edge will be the start point of the next edge
                // For closed wires, the last edge's last point equals the first edge's first point
                for (let k = 0; k < points3d.length - 1; k++) {
                    points.push([points3d[k][0], points3d[k][2]]);
                    bulges.push(0);
                }
            }
            
            j++;
        }
        
        // Add the final endpoint for open polylines
        if (j > startIndex && !shouldBeClosed) {
            const lastEdge = edges[j - 1];
            const endPt = this.edgesService.endPointOnEdge({ shape: lastEdge });
            points.push([endPt[0], endPt[2]]);
            bulges.push(0);
        }
        
        // Return null if we didn't process any edges
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

    /**
     * Try to create a polyline with bulges from consecutive line/arc segments
     * Returns the polyline and next index, or null if not applicable
     */
    private tryCreatePolylineWithBulges(
        edges: TopoDS_Edge[],
        startIndex: number,
        shouldBeClosed: boolean
    ): { polyline: IO.DxfPolylineSegmentDto, nextIndex: number } | null {
        const edge = edges[startIndex];
        
        // Must start with either a line or an arc (not a full circle)
        const isLinear = this.edgesService.isEdgeLinear({ shape: edge });
        const isCircular = this.edgesService.isEdgeCircular({ shape: edge });
        
        if (!isLinear && !isCircular) {
            return null; // Complex edge, can't create polyline with bulges
        }
        
        // Check if it's a full circle
        if (isCircular) {
            const bounds = this.edgesService.getEdgeBounds(edge);
            const angleRange = bounds.uMax - bounds.uMin;
            const isFullCircle = Math.abs(angleRange - 2 * Math.PI) < 0.01;
            if (isFullCircle) {
                return null; // Full circle, handle separately
            }
        }
        
        // Collect consecutive linear and arc edges
        const points: Base.Point2[] = [];
        const bulges: number[] = [];
        let j = startIndex;
        
        while (j < edges.length) {
            const currentEdge = edges[j];
            const isCurrentLinear = this.edgesService.isEdgeLinear({ shape: currentEdge });
            const isCurrentCircular = this.edgesService.isEdgeCircular({ shape: currentEdge });
            
            // Stop if we hit a complex edge
            if (!isCurrentLinear && !isCurrentCircular) {
                break;
            }
            
            // Stop if we hit a full circle
            if (isCurrentCircular) {
                const bounds = this.edgesService.getEdgeBounds(currentEdge);
                const angleRange = bounds.uMax - bounds.uMin;
                if (Math.abs(angleRange - 2 * Math.PI) < 0.01) {
                    break;
                }
            }
            
            const startPt = this.edgesService.startPointOnEdge({ shape: currentEdge });
            points.push([startPt[0], startPt[2]]); // XZ plane
            
            if (isCurrentLinear) {
                // Linear segment: bulge = 0
                bulges.push(0);
            } else {
                // Arc segment: calculate bulge
                const endPt = this.edgesService.endPointOnEdge({ shape: currentEdge });
                const center = this.edgesService.getCircularEdgeCenterPoint({ shape: currentEdge });
                
                // Calculate the included angle using the actual arc geometry
                const startAngle = Math.atan2(startPt[2] - center[2], startPt[0] - center[0]);
                const endAngle = Math.atan2(endPt[2] - center[2], endPt[0] - center[0]);
                
                let includedAngle = endAngle - startAngle;
                
                // Normalize to [-2π, 2π]
                while (includedAngle > Math.PI) includedAngle -= 2 * Math.PI;
                while (includedAngle < -Math.PI) includedAngle += 2 * Math.PI;
                
                // Bulge = tan(included_angle / 4)
                const bulge = Math.tan(includedAngle / 4);
                bulges.push(bulge);
            }
            
            j++;
        }
        
        // Add the end point of the last edge
        if (j > startIndex) {
            const lastEdge = edges[j - 1];
            const endPt = this.edgesService.endPointOnEdge({ shape: lastEdge });
            points.push([endPt[0], endPt[2]]); // XZ plane
            bulges.push(0); // Last vertex doesn't need a bulge
        }
        
        // Only create polyline with bulges if we have at least 2 edges or if it's beneficial
        if (j - startIndex < 2) {
            return null; // Not enough edges to justify polyline
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
