import { BRepFill_TypeOfContact, BRepOffset_Mode, GeomAbs_JoinType, OpenCascadeInstance } from 'opencascade.js';
import { OccHelper } from '../occ-helper';
import * as Inputs from '../../../api/inputs/inputs';

export class OCCTOperations {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    loft(inputs: Inputs.OCCT.LoftDto): any {
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, false, 1.0e-06);
        inputs.shapes.forEach((wire) => { pipe.AddWire(wire); });
        pipe.CheckCompatibility(false);
        // pipe.Build();
        return pipe.Shape();
    }
    
    offset(inputs: Inputs.OCCT.OffsetDto): any {
        if (!inputs.tolerance) { inputs.tolerance = 0.1; }
        if (inputs.distance === 0.0) { return inputs.shape; }
        let offset = null;
        if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE ||
            inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
            let wire;
            if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
                wire = this.och.bRepBuilderAPIMakeWire(inputs.shape);
            } else {
                wire = inputs.shape;
            }
            offset = new this.occ.BRepOffsetAPI_MakeOffset_1();
            offset.Init_2(this.occ.GeomAbs_JoinType.GeomAbs_Arc, false);
            offset.AddWire(wire);
            offset.Perform(inputs.distance, 0.0);
        } else {
            let shell = inputs.shape;
            if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
                shell = this.och.bRepBuilderAPIMakeShell(inputs.shape);
            }
            offset = new this.occ.BRepOffsetAPI_MakeOffsetShape_1();
            offset.PerformByJoin(
                shell,
                inputs.distance,
                inputs.tolerance,
                this.occ.BRepOffset_Mode.BRepOffset_Skin,
                false,
                false,
                this.occ.GeomAbs_JoinType.GeomAbs_Arc,
                false
            );
        }
        let offsetShape = offset.Shape();
        return offsetShape;
    }

    extrude(inputs: Inputs.OCCT.ExtrudeDto): any {
        return new this.occ.BRepPrimAPI_MakePrism_1(
            inputs.shape,
            new this.occ.gp_Vec_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
            false,
            true
        ).Shape();
    }

    revolve(inputs: Inputs.OCCT.RevolveDto): any {
        if (!inputs.angle) { inputs.angle = 360.0; }
        if (!inputs.direction) { inputs.direction = [0, 0, 1]; }
        let result;
        if (inputs.angle >= 360.0) {
            result = new this.occ.BRepPrimAPI_MakeRevol_2(inputs.shape,
                new this.occ.gp_Ax1_2(new this.occ.gp_Pnt_3(0, 0, 0),
                    new this.occ.gp_Dir_4(inputs.direction[0], inputs.direction[1], inputs.direction[2])),
                inputs.copy).Shape();
        } else {
            result = new this.occ.BRepPrimAPI_MakeRevol_1(inputs.shape,
                new this.occ.gp_Ax1_2(new this.occ.gp_Pnt_3(0, 0, 0),
                    new this.occ.gp_Dir_4(inputs.direction[0], inputs.direction[1], inputs.direction[2])),
                inputs.angle * 0.0174533, inputs.copy).Shape();
        }
        return result;
    }

    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto): any {
        const upperPolygon = this.och.rotate(
            {
                axis: [0, 1, 0],
                angle: inputs.angle,
                shape: this.och.translate({
                    translation: [0, inputs.height, 0],
                    shape: inputs.shape,
                })
            });

        // Define the straight spine going up the middle of the sweep
        const spineWire = this.och.createBSpline({
            points: [
                [0, 0, 0],
                [0, inputs.height, 0]
            ],
            closed: false,
        });

        // Define the guiding helical auxiliary spine (which controls the rotation)
        const steps = 30;
        const aspinePoints = [];
        for (let i = 0; i <= steps; i++) {
            const alpha = i / steps;
            aspinePoints.push([
                20 * Math.sin(alpha * inputs.angle * 0.0174533),
                inputs.height * alpha,
                20 * Math.cos(alpha * inputs.angle * 0.0174533),
            ]);
        }

        const aspineWire = this.och.createBSpline({ points: aspinePoints, closed: false });

        // Sweep the face wires along the spine to create the extrusion
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(spineWire);
        pipe.SetMode_5(aspineWire, true, (this.occ.BRepFill_TypeOfContact.BRepFill_NoContact as BRepFill_TypeOfContact));
        pipe.Add_1(inputs.shape, false, false);
        pipe.Add_1(upperPolygon, false, false);
        pipe.Build();
        pipe.MakeSolid();
        return pipe.Shape();
    }

    pipe(inputs: Inputs.OCCT.ShapeShapesDto): any {
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(inputs.shape);
        inputs.shapes.forEach(sh => {
            pipe.Add_1(sh, false, false);
        });
        pipe.Build();
        pipe.MakeSolid();
        return pipe.Shape();
    }

    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto): any {
        const maker = new this.occ.BRepOffsetAPI_MakeThickSolid_1();
        maker.MakeThickSolidBySimple(inputs.shape, inputs.offset);

        maker.Build();
        return maker.Shape();
    }
   
    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto) {
        const facesToRemove = new this.occ.TopTools_ListOfShape_1();
        inputs.shapes.forEach(shape => {
            facesToRemove.Append_1(shape);
        })
        const myBody = new this.occ.BRepOffsetAPI_MakeThickSolid_1();
        let jointType: GeomAbs_JoinType;

        if (inputs.joinType === Inputs.OCCT.JoinTypeEnum.arc) {
            jointType = this.occ.GeomAbs_JoinType.GeomAbs_Arc as GeomAbs_JoinType;
        } else if (inputs.joinType === Inputs.OCCT.JoinTypeEnum.intersection) {
            jointType = this.occ.GeomAbs_JoinType.GeomAbs_Intersection as GeomAbs_JoinType;
        } else if (inputs.joinType === Inputs.OCCT.JoinTypeEnum.tangent) {
            jointType = this.occ.GeomAbs_JoinType.GeomAbs_Tangent as GeomAbs_JoinType;
        }

        myBody.MakeThickSolidByJoin(
            inputs.shape,
            facesToRemove,
            inputs.offset,
            inputs.tolerance,
            this.occ.BRepOffset_Mode.BRepOffset_Skin as BRepOffset_Mode, // currently a single option
            inputs.intersection,
            inputs.selfIntersection,
            jointType,
            inputs.removeIntEdges);
        return this.och.getActualTypeOfShape(myBody.Shape());
    }

}
