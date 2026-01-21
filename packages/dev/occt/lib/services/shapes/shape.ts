import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTShape {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    purgeInternalEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        // Note: TopOpeBRepTool_PurgeInternalEdges is not exposed in this build
        // Return the input shape unchanged as a fallback
        return inputs.shape;
    }

    unifySameDomain(inputs: Inputs.OCCT.UnifySameDomainDto<TopoDS_Shape>): TopoDS_Shape {
        return this.occ.ShapeUpgrade_UnifySameDomain_Perform(
            inputs.shape, 
            inputs.unifyEdges, 
            inputs.unifyFaces, 
            inputs.concatBSplines
        );
    }

    isClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Closed();
    }

    isConvex(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Convex();
    }

    isChecked(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Checked();
    }

    isFree(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Free();
    }

    isInfinite(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Infinite();
    }

    isModified(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Modified();
    }

    isLocked(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Locked();
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
        const orientation = inputs.shape.Orientation();
        let result: Inputs.OCCT.topAbsOrientationEnum;
        if (orientation === this.occ.TopAbs_Orientation.FORWARD) {
            result = Inputs.OCCT.topAbsOrientationEnum.forward;
        } else if (orientation === this.occ.TopAbs_Orientation.REVERSED) {
            result = Inputs.OCCT.topAbsOrientationEnum.reversed;
        } else if (orientation === this.occ.TopAbs_Orientation.INTERNAL) {
            result = Inputs.OCCT.topAbsOrientationEnum.internal;
        } else if (orientation === this.occ.TopAbs_Orientation.EXTERNAL) {
            result = Inputs.OCCT.topAbsOrientationEnum.external;
        }
        return result;
    }

    getShapeType(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.shapeTypeEnum {
        return this.och.enumService.getShapeTypeEnum(inputs.shape);
    }

}
