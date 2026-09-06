import { BitbybitOcctModule, TopoDS_Compound, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTCompound {

    constructor(
        _occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Makes the compound shape, which can include any kind of shapes
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     * @group create
     * @shortname make
     * @drawable true
     */
    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<TopoDS_Shape>): TopoDS_Compound {
        return this.och.converterService.makeCompound(inputs);
    }

    /**
     * Gets the shapes that compound is made of
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     * @group get
     * @shortname get shapes of compound
     * @drawable true
     */
    getShapesOfCompound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Compound>): TopoDS_Shape[] {
        return this.och.shapeGettersService.getShapesOfCompound(inputs);
    }

}
