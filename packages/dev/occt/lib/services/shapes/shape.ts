import { OpenCascadeInstance, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs/inputs";

export class OCCTShape {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    purgeInternalEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        const purge = new this.occ.TopOpeBRepTool_PurgeInternalEdges(inputs.shape, true);
        purge.Perform();
        if (purge.IsDone()) {
            return purge.Shape();
        } else {
            throw new Error("Could not purge internal edges for the shape");
        }
    }

    unifySameDomain(inputs: Inputs.OCCT.UnifySameDomainDto<TopoDS_Shape>): TopoDS_Shape {
        const unify = new this.occ.ShapeUpgrade_UnifySameDomain_2(inputs.shape, inputs.unifyEdges, inputs.unifyFaces, inputs.concatBSplines);
        unify.Build();
        return unify.Shape();
    }

    isClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Closed_1();
    }

    isConvex(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Convex_1();
    }

    isChecked(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Checked_1();
    }

    isFree(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Free_1();
    }

    isInfinite(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Infinite_1();
    }

    isModified(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Modified_1();
    }

    isLocked(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Locked_1();
    }

    isNull(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsNull();
    }

    isEqual(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsEqual(inputs.otherShape);
    }

    isNotEqual(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsNotEqual(inputs.otherShape);
    }

    isPartner(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsPartner(inputs.otherShape);
    }

    isSame(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsSame(inputs.otherShape);
    }

    getOrientation(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.topAbsOrientationEnum {
        const orientation = inputs.shape.Orientation_1();
        let result: Inputs.OCCT.topAbsOrientationEnum;
        if (orientation === this.occ.TopAbs_Orientation.TopAbs_FORWARD) {
            result = Inputs.OCCT.topAbsOrientationEnum.forward;
        } else if (orientation === this.occ.TopAbs_Orientation.TopAbs_REVERSED) {
            result = Inputs.OCCT.topAbsOrientationEnum.reversed;
        } else if (orientation === this.occ.TopAbs_Orientation.TopAbs_INTERNAL) {
            result = Inputs.OCCT.topAbsOrientationEnum.internal;
        } else if (orientation === this.occ.TopAbs_Orientation.TopAbs_EXTERNAL) {
            result = Inputs.OCCT.topAbsOrientationEnum.external;
        }
        return result;
    }

    getShapeType(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.shapeTypeEnum {
        return this.och.enumService.getShapeTypeEnum(inputs.shape);
    }

}
