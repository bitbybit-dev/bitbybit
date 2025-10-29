import * as Inputs from "../../../inputs";
import { DxfGenerator } from "./dxf-generator";

export class Dxf {

    private dxfGenerator = new DxfGenerator();

    /**
     * Creates a line segment for DXF paths
     * @param inputs Line segment definition
     * @returns Line segment DTO
     * @group dxf
     * @shortname line segment
     * @drawable false
     */
    lineSegment(inputs: Inputs.IO.DxfLineSegmentDto): Inputs.IO.DxfLineSegmentDto {
        return inputs;
    }

    /**
     * Creates an arc segment for DXF paths
     * @param inputs Arc segment definition
     * @returns Arc segment DTO
     * @group dxf
     * @shortname arc segment
     * @drawable false
     */
    arcSegment(inputs: Inputs.IO.DxfArcSegmentDto): Inputs.IO.DxfArcSegmentDto {
        return inputs;
    }

    /**
     * Creates a circle segment for DXF paths
     * @param inputs Circle segment definition
     * @returns Circle segment DTO
     * @group dxf
     * @shortname circle segment
     * @drawable false
     */
    circleSegment(inputs: Inputs.IO.DxfCircleSegmentDto): Inputs.IO.DxfCircleSegmentDto {
        return inputs;
    }

    /**
     * Creates a polyline segment for DXF paths
     * @param inputs Polyline segment definition
     * @returns Polyline segment DTO
     * @group dxf
     * @shortname polyline segment
     * @drawable false
     */
    polylineSegment(inputs: Inputs.IO.DxfPolylineSegmentDto): Inputs.IO.DxfPolylineSegmentDto {
        return inputs;
    }

    /**
     * Creates a spline segment for DXF paths
     * @param inputs Spline segment definition
     * @returns Spline segment DTO
     * @group dxf
     * @shortname spline segment
     * @drawable false
     */
    splineSegment(inputs: Inputs.IO.DxfSplineSegmentDto): Inputs.IO.DxfSplineSegmentDto {
        return inputs;
    }

    /**
     * Creates a path from segments
     * @param inputs Path definition with segments
     * @returns Path DTO
     * @group dxf
     * @shortname path
     * @drawable false
     */
    path(inputs: Inputs.IO.DxfPathDto): Inputs.IO.DxfPathDto {
        return inputs;
    }

    /**
     * Creates a paths part with layer and color
     * @param inputs Paths part definition
     * @returns Paths part DTO
     * @group dxf
     * @shortname paths part
     * @drawable false
     */
    pathsPart(inputs: Inputs.IO.DxfPathsPartDto): Inputs.IO.DxfPathsPartDto {
        return inputs;
    }

    /**
     * DXF generator that supports lines, arcs, circles, polylines, and splines organized in paths.
     * Paths can combine multiple segment types similar to OCCT wires.
     * @param inputs DXF model definition
     * @returns DXF file content as string
     * @group dxf
     * @shortname dxf create
     * @drawable false
     */
    dxfCreate(inputs: Inputs.IO.DxfModelDto): string {
        return this.dxfGenerator.generateDxf(inputs);
    }

}