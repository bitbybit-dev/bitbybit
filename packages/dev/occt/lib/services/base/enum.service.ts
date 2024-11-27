import {
    GccEnt_Position, OpenCascadeInstance, TopAbs_State, TopoDS_Shape
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";

export class EnumService {

    constructor(
        private readonly occ: OpenCascadeInstance,
    ) { }

    getShapeTypeEnum(shape: TopoDS_Shape): Inputs.OCCT.shapeTypeEnum {
        let result = Inputs.OCCT.shapeTypeEnum.unknown;
        const st = shape.ShapeType();
        if (st === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
            result = Inputs.OCCT.shapeTypeEnum.edge;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
            result = Inputs.OCCT.shapeTypeEnum.wire;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX) {
            result = Inputs.OCCT.shapeTypeEnum.vertex;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_SOLID) {
            result = Inputs.OCCT.shapeTypeEnum.solid;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_SHELL) {
            result = Inputs.OCCT.shapeTypeEnum.shell;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
            result = Inputs.OCCT.shapeTypeEnum.face;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID) {
            result = Inputs.OCCT.shapeTypeEnum.compSolid;
        } else if (st === this.occ.TopAbs_ShapeEnum.TopAbs_COMPOUND) {
            result = Inputs.OCCT.shapeTypeEnum.compound;
        } else {
            result = Inputs.OCCT.shapeTypeEnum.shape;
        }
        return result;
    }

    getGccEntPositionFromEnum(position: Inputs.OCCT.gccEntPositionEnum): GccEnt_Position {
        let result = this.occ.GccEnt_Position.GccEnt_noqualifier;
        if (position === Inputs.OCCT.gccEntPositionEnum.unqualified) {
            result = this.occ.GccEnt_Position.GccEnt_unqualified;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.enclosed) {
            result = this.occ.GccEnt_Position.GccEnt_enclosed;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.enclosing) {
            result = this.occ.GccEnt_Position.GccEnt_enclosing;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.outside) {
            result = this.occ.GccEnt_Position.GccEnt_outside;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.noqualifier) {
            result = this.occ.GccEnt_Position.GccEnt_noqualifier;
        } else {
            result = this.occ.GccEnt_Position.GccEnt_noqualifier;
        }
        return result as GccEnt_Position;
    }

    getTopAbsStateEnum(state: TopAbs_State): Inputs.OCCT.topAbsStateEnum {
        let result = Inputs.OCCT.topAbsStateEnum.unknown;
        if (state === this.occ.TopAbs_State.TopAbs_IN) {
            result = Inputs.OCCT.topAbsStateEnum.in;
        } else if (state === this.occ.TopAbs_State.TopAbs_OUT) {
            result = Inputs.OCCT.topAbsStateEnum.out;
        } else if (state === this.occ.TopAbs_State.TopAbs_ON) {
            result = Inputs.OCCT.topAbsStateEnum.on;
        } else {
            result = Inputs.OCCT.topAbsStateEnum.unknown;
        }
        return result;
    }


    convertFourSidesStrictEnumToTwoCircleInclusionEnum(value: Inputs.OCCT.fourSidesStrictEnum) {
        if (value === Inputs.OCCT.fourSidesStrictEnum.inside) {
            return Inputs.OCCT.twoCircleInclusionEnum.inside;
        } else if (value === Inputs.OCCT.fourSidesStrictEnum.outside) {
            return Inputs.OCCT.twoCircleInclusionEnum.outside;
        } else if (value === Inputs.OCCT.fourSidesStrictEnum.insideOutside) {
            return Inputs.OCCT.twoCircleInclusionEnum.insideOutside;
        } else if (value === Inputs.OCCT.fourSidesStrictEnum.outsideInside) {
            return Inputs.OCCT.twoCircleInclusionEnum.outsideInside;
        } else {
            return Inputs.OCCT.twoCircleInclusionEnum.none;
        }
    }

}
