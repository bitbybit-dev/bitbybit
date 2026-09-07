import {
    EmbindEnumValue, BitbybitOcctModule, TopoDS_Shape
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";

export class EnumService {

    constructor(
        private readonly occ: BitbybitOcctModule,
    ) { }

    getShapeTypeEnum(shape: TopoDS_Shape): Inputs.OCCT.shapeTypeEnum {
        const st = shape.ShapeType();
        if (st === this.occ.TopAbs_ShapeEnum.EDGE) {
            return Inputs.OCCT.shapeTypeEnum.edge;
        } else if (st === this.occ.TopAbs_ShapeEnum.WIRE) {
            return Inputs.OCCT.shapeTypeEnum.wire;
        } else if (st === this.occ.TopAbs_ShapeEnum.VERTEX) {
            return Inputs.OCCT.shapeTypeEnum.vertex;
        } else if (st === this.occ.TopAbs_ShapeEnum.SOLID) {
            return Inputs.OCCT.shapeTypeEnum.solid;
        } else if (st === this.occ.TopAbs_ShapeEnum.SHELL) {
            return Inputs.OCCT.shapeTypeEnum.shell;
        } else if (st === this.occ.TopAbs_ShapeEnum.FACE) {
            return Inputs.OCCT.shapeTypeEnum.face;
        } else if (st === this.occ.TopAbs_ShapeEnum.COMPSOLID) {
            return Inputs.OCCT.shapeTypeEnum.compSolid;
        } else if (st === this.occ.TopAbs_ShapeEnum.COMPOUND) {
            return Inputs.OCCT.shapeTypeEnum.compound;
        } else {
            return Inputs.OCCT.shapeTypeEnum.shape;
        }
    }

    getGccEntPositionFromEnum(position: Inputs.OCCT.gccEntPositionEnum): EmbindEnumValue {
        if (position === Inputs.OCCT.gccEntPositionEnum.unqualified) {
            return this.occ.GccEnt_Position.unqualified;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.enclosed) {
            return this.occ.GccEnt_Position.enclosed;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.enclosing) {
            return this.occ.GccEnt_Position.enclosing;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.outside) {
            return this.occ.GccEnt_Position.outside;
        } else if (position === Inputs.OCCT.gccEntPositionEnum.noqualifier) {
            return this.occ.GccEnt_Position.noqualifier;
        } else {
            return this.occ.GccEnt_Position.noqualifier;
        }
    }

    getTopAbsStateEnum(state: EmbindEnumValue): Inputs.OCCT.topAbsStateEnum {
        if (state.value === this.occ.TopAbs_State.IN.value) {
            return Inputs.OCCT.topAbsStateEnum.in;
        } else if (state.value === this.occ.TopAbs_State.OUT.value) {
            return Inputs.OCCT.topAbsStateEnum.out;
        } else if (state.value === this.occ.TopAbs_State.ON.value) {
            return Inputs.OCCT.topAbsStateEnum.on;
        } else {
            return Inputs.OCCT.topAbsStateEnum.unknown;
        }
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
