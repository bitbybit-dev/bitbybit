import { Approx_ParametrizationType, BRepFill_TypeOfContact, BRepOffsetAPI_MakeOffsetShape, BRepOffsetAPI_MakeOffset_1, BRepOffset_Mode, GeomAbs_JoinType, OpenCascadeInstance, TopoDS_Shape, TopoDS_Wire } from '../../../../bitbybit-dev-occt/bitbybit-dev-occt';
import { OccHelper } from '../occ-helper';
import * as Inputs from '../../../api/inputs/inputs';

export class OCCTOperations {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    loft(inputs: Inputs.OCCT.LoftDto<TopoDS_Wire>) {
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, false, 1.0e-06);
        inputs.shapes.forEach((wire) => {
            pipe.AddWire(wire);
        });
        pipe.CheckCompatibility(false);
        let pipeShape = pipe.Shape();
        let res = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        return res;
    }

    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>) {
        if (inputs.periodic && !inputs.closed) {
            throw new Error('Cant construct periodic non closed loft.');
        }
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, inputs.straight, inputs.tolerance);
        const wires = [];
        const vertices = [];
        if (inputs.startVertex) {
            const v = this.och.makeVertex(inputs.startVertex);
            pipe.AddVertex(v);
            vertices.push(v);
        }
        if (inputs.closed && !inputs.periodic) {
            inputs.shapes.push(inputs.shapes[0]);
        } else if (inputs.closed && inputs.periodic) {
            const pointsOnCrvs = [];
            inputs.shapes.forEach((s: TopoDS_Wire) => {
                const pts = this.och.divideWireByParamsToPoints({ shape: s, nrOfDivisions: inputs.nrPeriodicSections, removeStartPoint: false, removeEndPoint: false });
                pointsOnCrvs.push(pts);
            })

            for (let i = 0; i < inputs.nrPeriodicSections; i++) {
                const ptsForPerpWire = pointsOnCrvs.map(p => p[i]);
                const periodicWire = this.och.interpolatePoints({ points: ptsForPerpWire, tolerance: inputs.tolerance, periodic: true });
                pipe.AddWire(periodicWire);
                wires.push(periodicWire);
            }
        }
        if (!inputs.periodic) {
            inputs.shapes.forEach((wire) => {
                pipe.AddWire(wire);
            });
        }
        const endVertices = [];
        if (inputs.endVertex) {
            const v = this.och.makeVertex(inputs.endVertex);
            pipe.AddVertex(v);
            endVertices.push(v);
        }
        if (inputs.useSmoothing) {
            pipe.SetSmoothing(inputs.useSmoothing);
        }
        if (inputs.maxUDegree) {
            pipe.SetMaxDegree(inputs.maxUDegree);
        }
        let parType: Approx_ParametrizationType;
        if (inputs.parType === Inputs.OCCT.ApproxParametrizationTypeEnum.approxChordLength) {
            parType = this.occ.Approx_ParametrizationType.Approx_ChordLength as Approx_ParametrizationType;
        } else if (inputs.parType === Inputs.OCCT.ApproxParametrizationTypeEnum.approxCentripetal) {
            parType = this.occ.Approx_ParametrizationType.Approx_Centripetal as Approx_ParametrizationType;
        } else if (inputs.parType === Inputs.OCCT.ApproxParametrizationTypeEnum.approxIsoParametric) {
            parType = this.occ.Approx_ParametrizationType.Approx_IsoParametric as Approx_ParametrizationType;
        }
        if (parType) {
            pipe.SetParType(parType)
        }
        pipe.CheckCompatibility(false);
        const pipeShape = pipe.Shape();
        const res = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        wires.forEach(w => w.delete());
        vertices.forEach(v => v.delete());
        endVertices.forEach(v => v.delete());
        return res;
    }

    offset(inputs: Inputs.OCCT.OffsetDto<TopoDS_Shape>) {
        if (!inputs.tolerance) { inputs.tolerance = 0.1; }
        if (inputs.distance === 0.0) { return inputs.shape; }
        let offset = null;
        const wires = [];
        if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE ||
            inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
            let wire;
            if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
                wire = this.och.bRepBuilderAPIMakeWire(inputs.shape);
                wires.push(wire);
            } else {
                wire = inputs.shape;
            }
            offset = new this.occ.BRepOffsetAPI_MakeOffset_1();
            (offset as BRepOffsetAPI_MakeOffset_1).Init_2(this.occ.GeomAbs_JoinType.GeomAbs_Arc as GeomAbs_JoinType, false);
            (offset as BRepOffsetAPI_MakeOffset_1).AddWire(wire);
            (offset as BRepOffsetAPI_MakeOffset_1).Perform(inputs.distance, 0.0);
        } else {
            let shell = inputs.shape;
            if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
                shell = this.och.bRepBuilderAPIMakeShell(inputs.shape);
            }
            offset = new this.occ.BRepOffsetAPI_MakeOffsetShape();
            (offset as BRepOffsetAPI_MakeOffsetShape).PerformByJoin(
                shell,
                inputs.distance,
                inputs.tolerance,
                this.occ.BRepOffset_Mode.BRepOffset_Skin as BRepOffset_Mode,
                false,
                false,
                this.occ.GeomAbs_JoinType.GeomAbs_Arc as GeomAbs_JoinType,
                false,
                new this.occ.Message_ProgressRange_1()
            );
        }
        const offsetShape = offset.Shape();
        const result = this.och.getActualTypeOfShape(offsetShape);
        offsetShape.delete();
        if (offset) {
            offset.delete();
        }
        wires.forEach(w => w.delete());
        return result;
    }

    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        return inputs.shapes.map(shape => {
            let extruded = this.extrude({ shape, direction: inputs.direction });
            let result = this.och.getActualTypeOfShape(extruded);
            extruded.delete();
            return result;
        })
    }

    extrude(inputs: Inputs.OCCT.ExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        const gpVec = new this.occ.gp_Vec_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        const prismMaker = new this.occ.BRepPrimAPI_MakePrism_1(
            inputs.shape,
            gpVec,
            false,
            true
        );
        const prismShape = prismMaker.Shape();
        prismMaker.delete();
        gpVec.delete();
        return prismShape;
    }

    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<TopoDS_Shape>) {
        return this.och.splitShapeWithShapes(inputs);
    }

    revolve(inputs: Inputs.OCCT.RevolveDto<TopoDS_Shape>) {
        if (!inputs.angle) { inputs.angle = 360.0; }
        if (!inputs.direction) { inputs.direction = [0, 0, 1]; }
        let result;
        if (inputs.angle >= 360.0) {
            const pt1 = new this.occ.gp_Pnt_3(0, 0, 0);
            const dir = new this.occ.gp_Dir_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
            const ax1 = new this.occ.gp_Ax1_2(pt1, dir);
            const makeRevol = new this.occ.BRepPrimAPI_MakeRevol_2(inputs.shape,
                ax1,
                inputs.copy);
            result = makeRevol.Shape();
            makeRevol.delete();
            pt1.delete();
            dir.delete();
            ax1.delete();
        } else {
            const pt1 = new this.occ.gp_Pnt_3(0, 0, 0);
            const dir = new this.occ.gp_Dir_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
            const ax1 = new this.occ.gp_Ax1_2(pt1, dir);
            const makeRevol = new this.occ.BRepPrimAPI_MakeRevol_1(inputs.shape,
                ax1,
                inputs.angle * 0.0174533, inputs.copy);
            result = makeRevol.Shape();
            makeRevol.delete();
            pt1.delete();
            dir.delete();
            ax1.delete();
        }
        const actual = this.och.getActualTypeOfShape(result);
        result.delete();
        return actual;
    }

    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<TopoDS_Shape>) {
        const translatedShape = this.och.translate({
            translation: [0, inputs.height, 0],
            shape: inputs.shape,
        });
        const upperPolygon = this.och.rotate(
            {
                axis: [0, 1, 0],
                angle: inputs.angle,
                shape: translatedShape
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
        pipe.Build(new this.occ.Message_ProgressRange_1());
        pipe.MakeSolid();

        const pipeShape = pipe.Shape();
        const result = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        aspineWire.delete();
        spineWire.delete();
        upperPolygon.delete();
        translatedShape.delete();
        return result;
    }

    pipe(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Shape>) {
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(inputs.shape);
        inputs.shapes.forEach(sh => {
            pipe.Add_1(sh, false, false);
        });
        pipe.Build(new this.occ.Message_ProgressRange_1());
        pipe.MakeSolid();
        const pipeShape = pipe.Shape();
        const result = this.och.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        return result;
    }

    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>) {
        const maker = new this.occ.BRepOffsetAPI_MakeThickSolid();
        maker.MakeThickSolidBySimple(inputs.shape, inputs.offset);
        maker.Build(new this.occ.Message_ProgressRange_1());
        const makerShape = maker.Shape();
        const result = this.och.getActualTypeOfShape(makerShape);
        maker.delete();
        makerShape.delete();
        return result;
    }

    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<TopoDS_Shape>) {
        const facesToRemove = new this.occ.TopTools_ListOfShape_1();
        inputs.shapes.forEach(shape => {
            facesToRemove.Append_1(shape);
        })
        const myBody = new this.occ.BRepOffsetAPI_MakeThickSolid();
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
            inputs.removeIntEdges,
            new this.occ.Message_ProgressRange_1());
        const makeThick = myBody.Shape();
        const result = this.och.getActualTypeOfShape(makeThick);
        makeThick.delete();
        myBody.delete();
        facesToRemove.delete();
        return result;
    }

}
