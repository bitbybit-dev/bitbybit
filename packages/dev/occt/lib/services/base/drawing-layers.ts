import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import type { IO } from "@bitbybit-dev/base/lib/api/inputs";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import type * as Resolved from "../../api/resolved-inputs";
import type { CurveTracing } from "./drawing-types";
import { exactTracing } from "./drawing.service";
import { groundAsDrawingPlane } from "./file-axes";
import { checkedNumber, checkedShapes } from "./input-checks";

export const groundPathsOf = (och: OccHelper, shape: TopoDS_Shape, tracing: CurveTracing): IO.DrawingPathDto[] => {
    const turned = groundAsDrawingPlane(och, shape);
    try {
        return och.drawingService.pathsOfShape({ ...tracing, shape: turned ?? shape });
    } finally {
        turned?.delete();
    }
};

const layerPartOf = (och: OccHelper, given: unknown, at: string, tracing: CurveTracing): IO.DrawingPartDto => {
    if (typeof given !== "object" || given === null) {
        throw new InputError(`\`${at}\` must be a layer from \`io.svgLayer\`.`, at);
    }
    const layer = resolveDto(Inputs.OCCT.SvgLayerDto, given) as Resolved.OCCT.SvgLayerDto<TopoDS_Shape>;
    const shapes = checkedShapes(layer.shapes, `${at}.shapes`);
    return { layer: layer.layer, color: layer.color, lineType: layer.lineType, paths: shapes.flatMap(shape => groundPathsOf(och, shape, tracing)) };
};

export const svgModelOf = (och: OccHelper, drawing: Resolved.OCCT.SvgLayersDto<TopoDS_Shape>): IO.SvgModelDto => {
    const tolerance = checkedNumber(drawing.tolerance, "tolerance", 0);
    if (tolerance === 0) {
        throw new InputError("`tolerance` must be above 0; it is 0.", "tolerance");
    }
    if (!Array.isArray(drawing.layers)) {
        throw new InputError("`layers` must be a list of layers from `io.svgLayer`.", "layers");
    }
    const tracing = exactTracing(tolerance);
    const parts = drawing.layers.map((given: unknown, index) => layerPartOf(och, given, `layers[${String(index)}]`, tracing));
    return { parts, unit: drawing.unit, strokeWidth: drawing.strokeWidth, margin: drawing.margin, tolerance };
};
