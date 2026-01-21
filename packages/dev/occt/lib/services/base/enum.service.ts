import {
    EmbindEnumValue, BitbybitOcctModule, TopoDS_Shape
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";

export class EnumService {

    constructor(
        private readonly occ: BitbybitOcctModule,
    ) { }

    getShapeTypeEnum(shape: TopoDS_Shape): Inputs.OCCT.shapeTypeEnum {
        let result = Inputs.OCCT.shapeTypeEnum.unknown;
        const st = shape.ShapeType();
        if (st === this.occ.TopAbs_ShapeEnum.EDGE) {
            result = Inputs.OCCT.shapeTypeEnum.edge;
        } else if (st === this.occ.TopAbs_ShapeEnum.WIRE) {
            result = Inputs.OCCT.shapeTypeEnum.wire;
        } else if (st === this.occ.TopAbs_ShapeEnum.VERTEX) {
            result = Inputs.OCCT.shapeTypeEnum.vertex;
        } else if (st === this.occ.TopAbs_ShapeEnum.SOLID) {
            result = Inputs.OCCT.shapeTypeEnum.solid;
        } else if (st === this.occ.TopAbs_ShapeEnum.SHELL) {
            result = Inputs.OCCT.shapeTypeEnum.shell;
        } else if (st === this.occ.TopAbs_ShapeEnum.FACE) {
            result = Inputs.OCCT.shapeTypeEnum.face;
        } else if (st === this.occ.TopAbs_ShapeEnum.COMPSOLID) {
            result = Inputs.OCCT.shapeTypeEnum.compSolid;
        } else if (st === this.occ.TopAbs_ShapeEnum.COMPOUND) {
            result = Inputs.OCCT.shapeTypeEnum.compound;
        } else {
            result = Inputs.OCCT.shapeTypeEnum.shape;
        }
        return result;
    }

    getGccEntPositionFromEnum(position: Inputs.OCCT.gccEntPositionEnum): EmbindEnumValue {
        let result = this.occ.GccEnt_Position.noqualifier;
        if (position === Inputs.OCCT.gccEntPositionEnum.unqualified) {
            result = this.occ.GccEnt_Position.unqualified;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.enclosed) {
            result = this.occ.GccEnt_Position.enclosed;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.enclosing) {
            result = this.occ.GccEnt_Position.enclosing;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.outside) {
            result = this.occ.GccEnt_Position.outside;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.noqualifier) {
            result = this.occ.GccEnt_Position.noqualifier;
        } else {
            result = this.occ.GccEnt_Position.noqualifier;
        }
        return result;
    }

    getTopAbsStateEnum(state: EmbindEnumValue): Inputs.OCCT.topAbsStateEnum {
        let result = Inputs.OCCT.topAbsStateEnum.unknown;
        if (state.value === this.occ.TopAbs_State.IN.value) {
            result = Inputs.OCCT.topAbsStateEnum.in;
        } else if (state.value === this.occ.TopAbs_State.OUT.value) {
            result = Inputs.OCCT.topAbsStateEnum.out;
        } else if (state.value === this.occ.TopAbs_State.ON.value) {
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

    getGeomFillTrihedronEnumOCCTValue(value: Inputs.OCCT.geomFillTrihedronEnum): EmbindEnumValue {
        if (value === Inputs.OCCT.geomFillTrihedronEnum.isConstantNormal) {
            return this.occ.GeomFill_Trihedron.IsConstantNormal;
        } else if (value === Inputs.OCCT.geomFillTrihedronEnum.isCorrectedFrenet) {
            return this.occ.GeomFill_Trihedron.IsCorrectedFrenet;
        } else if (value === Inputs.OCCT.geomFillTrihedronEnum.isDarboux) {
            return this.occ.GeomFill_Trihedron.IsDarboux;
        } else if (value === Inputs.OCCT.geomFillTrihedronEnum.isDiscreteTrihedron) {
            return this.occ.GeomFill_Trihedron.IsDiscreteTrihedron;
        } else if (value === Inputs.OCCT.geomFillTrihedronEnum.isFixed) {
            return this.occ.GeomFill_Trihedron.IsFixed;
        } else if (value === Inputs.OCCT.geomFillTrihedronEnum.isFrenet) {
            return this.occ.GeomFill_Trihedron.IsFrenet;
        } else if (value === Inputs.OCCT.geomFillTrihedronEnum.isGuideAC) {
            return this.occ.GeomFill_Trihedron.IsGuideAC;
        } else if (value === Inputs.OCCT.geomFillTrihedronEnum.isGuideACWithContact) {
            return this.occ.GeomFill_Trihedron.IsGuideACWithContact;
        } else if (value === Inputs.OCCT.geomFillTrihedronEnum.isGuidePlan) {
            return this.occ.GeomFill_Trihedron.IsGuidePlan;
        } else if (value === Inputs.OCCT.geomFillTrihedronEnum.isGuidePlanWithContact) {
            return this.occ.GeomFill_Trihedron.IsGuidePlanWithContact;
        } else {
            return this.occ.GeomFill_Trihedron.IsConstantNormal;
        }
    }

}
