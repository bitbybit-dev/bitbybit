import type { BitbybitOcctModule, TopoDS_Compound, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import type * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";
import { IO } from "@bitbybit-dev/base/lib/api/inputs";
import { checkedUnitOfLength } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/lengths";
import { checkedFrame, checkedNumber, checkedShape } from "./input-checks";
import { numbersOfFrames } from "./frames";
import { released } from "./release";
import { viewOntoDrawingPlane } from "./file-axes";
import { exactTracing } from "./drawing.service";

export interface CheckedView {
    readonly shape: TopoDS_Shape;
    readonly frame: Inputs.Base.Frame;
    readonly precision: number;
    readonly unit: Inputs.Base.unitOfLengthEnum | undefined;
}

export const checkedView = (shape: TopoDS_Shape, frame: Inputs.Base.Frame, precision: number, unit: Inputs.Base.unitOfLengthEnum | undefined): CheckedView => {
    const checkedPrecision = checkedNumber(precision, "precision", 0);
    if (checkedPrecision === 0) {
        throw new InputError("`precision` must be above 0; it is 0.", "precision");
    }
    const checkedViewShape = checkedShape(shape);
    const checkedViewFrame = checkedFrame(frame, "frame");
    if (unit !== undefined) {
        checkedUnitOfLength(unit, "unit");
    }
    return { shape: checkedViewShape, frame: checkedViewFrame, precision: checkedPrecision, unit };
};

const viewPathsOf = (occ: BitbybitOcctModule, och: OccHelper, drawing: TopoDS_Compound, precision: number): IO.DrawingPathDto[] => {
    occ.BRepLib_BuildCurves3d(drawing);
    const upright = viewOntoDrawingPlane(och, drawing);
    return released([upright], () => och.drawingService.pathsOfShape({ shape: upright, ...exactTracing(precision) }));
};

export const viewParts = (occ: BitbybitOcctModule, och: OccHelper, view: CheckedView, drawHidden: boolean): IO.DrawingPartDto[] => {
    const lines = occ.HiddenLines(view.shape, numbersOfFrames([view.frame]), true, false, drawHidden, false, 0, view.precision);
    try {
        const visible: IO.DrawingPartDto = { layer: "visible", color: "#000000", paths: viewPathsOf(occ, och, lines.visible, view.precision) };
        return drawHidden
            ? [{ layer: "hidden", color: "#000000", lineType: IO.lineTypeEnum.hidden, paths: viewPathsOf(occ, och, lines.hidden, view.precision) }, visible]
            : [visible];
    } finally {
        lines.visible.delete();
        lines.hidden.delete();
    }
};
