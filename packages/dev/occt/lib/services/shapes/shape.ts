import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTShape {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Remove internal edges that are not connected to any face in the shape
     * @param inputs shape
     * @returns purged shape
     * @group edit
     * @shortname purge internal edges
     * @drawable true
     */
    purgeInternalEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        return inputs.shape;
    }

    /**
     * Unifies faces, edges in the same domain and has possibility to concatinate bsplines
     * @param inputs shape
     * @returns unified shape
     * @group edit
     * @shortname unify same domain
     * @drawable true
     */
    unifySameDomain(inputs: Inputs.OCCT.UnifySameDomainDto<TopoDS_Shape>): TopoDS_Shape {
        return this.occ.ShapeUpgrade_UnifySameDomain_Perform(
            inputs.shape, 
            inputs.unifyEdges, 
            inputs.unifyFaces, 
            inputs.concatBSplines
        );
    }

    /**
     * Check if the shape is closed
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is closed
     * @drawable false
     */
    isClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Closed();
    }

    /**
     * Check if the shape is convex
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is convex
     * @drawable false
     */
    isConvex(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Convex();
    }

    /**
     * Check if the shape is checked
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is checked
     * @drawable false
     */
    isChecked(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Checked();
    }

    /**
     * Check if the shape is free
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is free
     * @drawable false
     */
    isFree(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Free();
    }

    /**
     * Check if the shape is infinite
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is infinite
     * @drawable false
     */
    isInfinite(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Infinite();
    }

    /**
     * Check if the shape is modified
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is modified
     * @drawable false
     */
    isModified(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Modified();
    }

    /**
     * Check if the shape is locked
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is locked
     * @drawable false
     */
    isLocked(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.Locked();
    }

    /**
     * Check if the shape is null
     * @param inputs shape
     * @returns boolean answer
     * @group analysis
     * @shortname is null
     * @drawable false
     */
    isNull(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsNull();
    }

    /**
     * Check if the shape is equal to other shape
     * @param inputs shapes
     * @returns boolean answer
     * @group analysis
     * @shortname is equal
     * @drawable false
     */
    isEqual(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsEqual(inputs.otherShape);
    }

    /**
     * Check if the shape is not equal to other shape
     * @param inputs shapes
     * @returns boolean answer
     * @group analysis
     * @shortname is not equal
     * @drawable false
     */
    isNotEqual(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsNotEqual(inputs.otherShape);
    }

    /**
     * Check if the shape is partner to other shape
     * @param inputs shapes
     * @returns boolean answer
     * @group analysis
     * @shortname is partner
     * @drawable false
     */
    isPartner(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsPartner(inputs.otherShape);
    }

    /**
     * Check if the shape is the same as the other shape
     * @param inputs shapes
     * @returns boolean answer
     * @group analysis
     * @shortname is same
     * @drawable false
     */
    isSame(inputs: Inputs.OCCT.CompareShapesDto<TopoDS_Shape>): boolean {
        return inputs.shape.IsSame(inputs.otherShape);
    }

    /**
     * Get the shape orientation
     * @param inputs shape
     * @returns shape orientation
     * @group analysis
     * @shortname get orientation
     * @drawable false
     */
    getOrientation(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.topAbsOrientationEnum {
        const orientation = inputs.shape.Orientation();
        let result!: Inputs.OCCT.topAbsOrientationEnum;
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

    /**
     * Get the shape type
     * @param inputs shape
     * @returns shape type
     * @group analysis
     * @shortname get shape type
     * @drawable false
     */
    getShapeType(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.shapeTypeEnum {
        return this.och.enumService.getShapeTypeEnum(inputs.shape);
    }

}
