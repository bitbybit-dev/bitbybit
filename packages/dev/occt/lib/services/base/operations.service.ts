import {
    BRepOffsetAPI_MakeOffset, BRepOffsetAPI_MakeOffsetShape, Bnd_Box, EmbindEnumValue,
    BitbybitOcctModule, TopoDS_Compound, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire,
    Approx_ParametrizationType
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { VectorHelperService } from "../../api/vector-helper.service";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import { EnumService } from "./enum.service";
import { EntitiesService } from "./entities.service";
import { ConverterService } from "./converter.service";
import { BooleansService } from "./booleans.service";
import { TransformsService } from "./transforms.service";
import { ShapeGettersService } from "./shape-getters";
import { EdgesService } from "./edges.service";
import { WiresService } from "./wires.service";
import { FacesService } from "./faces.service";
import { ShellsService } from "./shells.service";
import { SolidsService } from "./solids.service";

export class OperationsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly enumService: EnumService,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly booleansService: BooleansService,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly edgesService: EdgesService,
        private readonly transformsService: TransformsService,
        private readonly vecHelper: VectorHelperService,
        private readonly wiresService: WiresService,
        private readonly facesService: FacesService,
        private readonly solidsService: SolidsService,
        private readonly shellsService: ShellsService,

    ) { }

    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>) {
        if (inputs.periodic && !inputs.closed) {
            throw new Error("Cant construct periodic non closed loft.");
        }
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, inputs.straight, inputs.tolerance);
        const wires: TopoDS_Wire[] = [];
        const vertices: TopoDS_Vertex[] = [];
        if (inputs.startVertex) {
            const v = this.entitiesService.makeVertex(inputs.startVertex);
            pipe.AddVertex(v);
            vertices.push(v);
        }
        if (inputs.closed && !inputs.periodic) {
            inputs.shapes.push(inputs.shapes[0]);
        } else if (inputs.closed && inputs.periodic) {
            const pointsOnCrvs: Inputs.Base.Point3[][] = [];
            inputs.shapes.forEach((s: TopoDS_Wire | TopoDS_Edge) => {
                if (this.enumService.getShapeTypeEnum(s) === Inputs.OCCT.shapeTypeEnum.edge) {
                    s = this.entitiesService.bRepBuilderAPIMakeWire(s);
                }
                const pts = this.wiresService.divideWireByParamsToPoints({ shape: s, nrOfDivisions: inputs.nrPeriodicSections, removeStartPoint: false, removeEndPoint: false });
                pointsOnCrvs.push(pts);
            });

            // <= needed due to start and end points that are added
            for (let i = 0; i <= inputs.nrPeriodicSections; i++) {
                const ptsForPerpWire = pointsOnCrvs.map(p => p[i]);
                const periodicWire = this.wiresService.interpolatePoints({ points: ptsForPerpWire, tolerance: inputs.tolerance, periodic: true });
                pipe.AddWire(periodicWire);
                wires.push(periodicWire);
            }
        }
        if (!inputs.periodic) {
            inputs.shapes.forEach((wire) => {
                pipe.AddWire(wire);
            });
        }
        const endVertices: TopoDS_Vertex[] = [];
        if (inputs.endVertex) {
            const v = this.entitiesService.makeVertex(inputs.endVertex);
            pipe.AddVertex(v);
            endVertices.push(v);
        }
        if (inputs.useSmoothing) {
            pipe.SetSmoothing(inputs.useSmoothing);
        }
        if (inputs.maxUDegree) {
            pipe.SetMaxDegree(inputs.maxUDegree);
        }
        let parType: EmbindEnumValue | undefined = undefined;
        if (inputs.parType === Inputs.OCCT.approxParametrizationTypeEnum.approxChordLength) {
            parType = this.occ.Approx_ParametrizationType.ChordLength;
        } else if (inputs.parType === Inputs.OCCT.approxParametrizationTypeEnum.approxCentripetal) {
            parType = this.occ.Approx_ParametrizationType.Centripetal;
        } else if (inputs.parType === Inputs.OCCT.approxParametrizationTypeEnum.approxIsoParametric) {
            parType = this.occ.Approx_ParametrizationType.IsoParametric;
        }
        if (parType) {
            pipe.SetParType(parType as unknown as Approx_ParametrizationType);
        }
        pipe.CheckCompatibility(false);
        const pipeShape = pipe.Shape();
        const res = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        wires.forEach(w => w.delete());
        vertices.forEach(v => v.delete());
        endVertices.forEach(v => v.delete());
        return res;
    }


    closestPointsBetweenTwoShapes(shape1: TopoDS_Shape, shape2: TopoDS_Shape): [Base.Point3, Base.Point3] {
        const result = this.occ.ClosestPointsBetweenShapes(shape1, shape2);
        // embind returns a VectorDouble object with .size() and .get() methods, not a native array
        if (result.size() === 6) {
            return [[result.get(0), result.get(1), result.get(2)], [result.get(3), result.get(4), result.get(5)]];
        } else {
            throw new Error("Closest points could not be found.");
        }
    }

    closestPointsOnShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const vertexes = inputs.points.map(p => this.entitiesService.makeVertex(p));
        const pointsOnShape = vertexes.map(v => this.closestPointsBetweenTwoShapes(v, inputs.shape));
        return pointsOnShape.map(p => p[1]);
    }

    closestPointsOnShapesFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapesFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const vertexes = inputs.points.map(p => this.entitiesService.makeVertex(p));
        const result: Inputs.Base.Point3[] = [];
        inputs.shapes.forEach((s) => {
            const pointsOnShape = vertexes.map(v => this.closestPointsBetweenTwoShapes(v, s));
            result.push(...pointsOnShape.map(p => p[1]));
        });
        return result;
    }

    distancesToShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): number[] {
        const vertexes = inputs.points.map(p => this.entitiesService.makeVertex(p));
        const pointsOnShape = vertexes.map(v => this.closestPointsBetweenTwoShapes(v, inputs.shape));
        return pointsOnShape.map(p => {
            return this.vecHelper.distanceBetweenPoints(p[0], p[1]);
        });
    }

    boundingBoxOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.BoundingBoxPropsDto {
        const bbox = new this.occ.Bnd_Box();
        this.occ.BRepBndLib.Add(inputs.shape, bbox, false);
        const cornerMin = bbox.CornerMin();
        const cornerMax = bbox.CornerMax();
        const min = [cornerMin.X(), cornerMin.Y(), cornerMin.Z()] as Inputs.Base.Point3;
        const max = [cornerMax.X(), cornerMax.Y(), cornerMax.Z()] as Inputs.Base.Point3;
        const center = [
            (cornerMin.X() + cornerMax.X()) / 2,
            (cornerMin.Y() + cornerMax.Y()) / 2,
            (cornerMin.Z() + cornerMax.Z()) / 2
        ] as Inputs.Base.Point3;
        const size = [
            cornerMax.X() - cornerMin.X(),
            cornerMax.Y() - cornerMin.Y(),
            cornerMax.Z() - cornerMin.Z()
        ] as Inputs.Base.Vector3;
        bbox.delete();
        const result = {
            min,
            max,
            center,
            size
        };
        return result;
    }

    boundingBoxShapeOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        const bbox = this.boundingBoxOfShape(inputs);
        return this.solidsService.createBoxFromCorner({
            corner: bbox.min,
            width: bbox.size[0],
            height: bbox.size[1],
            length: bbox.size[2],
        });
    }

    boundingSphereOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.BoundingSpherePropsDto {
        const bbox = this.boundingBoxOfShape(inputs);
        const center = bbox.center;
        const radius = this.vecHelper.distanceBetweenPoints(bbox.min, center);
        const result = {
            center,
            radius
        };
        return result;
    }

    boundingSphereShapeOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        const bbox = this.boundingSphereOfShape(inputs);
        return this.solidsService.createSphere({
            center: bbox.center,
            radius: bbox.radius,
        });
    }

    loft(inputs: Inputs.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>) {
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, false, 1.0e-06);
        inputs.shapes.forEach((wire) => {
            if (this.enumService.getShapeTypeEnum(wire) === Inputs.OCCT.shapeTypeEnum.edge) {
                wire = this.entitiesService.bRepBuilderAPIMakeWire(wire);
            }
            pipe.AddWire(wire);
        });
        pipe.CheckCompatibility(false);
        const pipeShape = pipe.Shape();
        const res = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        return res;
    }

    offset(inputs: Inputs.OCCT.OffsetDto<TopoDS_Shape, TopoDS_Face>) {
        return this.offsetAdv({ shape: inputs.shape, face: inputs.face, distance: inputs.distance, tolerance: inputs.tolerance, joinType: Inputs.OCCT.joinTypeEnum.arc, removeIntEdges: false });
    }

    offsetAdv(inputs: Inputs.OCCT.OffsetAdvancedDto<TopoDS_Shape, TopoDS_Face>) {
        if (!inputs.tolerance) { inputs.tolerance = 0.1; }
        if (inputs.distance === 0.0) { return inputs.shape; }
        let offset: BRepOffsetAPI_MakeOffset | BRepOffsetAPI_MakeOffsetShape;
        const joinType = this.getJoinType(inputs.joinType);
        // only this mode is implemented currently, so we cannot expose others...
        const brepOffsetMode = this.occ.BRepOffset_Mode.Skin;

        const wires: TopoDS_Wire[] = [];

        if ((this.enumService.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.wire ||
            this.enumService.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.edge)) {
            let wire: TopoDS_Wire;
            if (this.enumService.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.edge) {
                wire = this.entitiesService.bRepBuilderAPIMakeWire(inputs.shape);
                wires.push(wire);
            } else {
                wire = inputs.shape;
            }
            try {
                offset = new this.occ.BRepOffsetAPI_MakeOffset();
                if (inputs.face) {
                    offset.Init(inputs.face, joinType, false);
                } else {
                    offset.InitJoin(joinType, false);
                }
                offset.AddWire(wire);
                offset.Build();
                offset.Perform(inputs.distance, 0.0);
            } catch (ex) {
                offset = new this.occ.BRepOffsetAPI_MakeOffsetShape();
                (offset as BRepOffsetAPI_MakeOffsetShape).PerformByJoin(
                    wire,
                    inputs.distance,
                    inputs.tolerance,
                    brepOffsetMode,
                    false,
                    false,
                    joinType,
                    inputs.removeIntEdges
                );
            }
        } else {
            const shapeToOffset = inputs.shape;
            offset = new this.occ.BRepOffsetAPI_MakeOffsetShape();
            (offset as BRepOffsetAPI_MakeOffsetShape).PerformByJoin(
                shapeToOffset,
                inputs.distance,
                inputs.tolerance,
                brepOffsetMode,
                false,
                false,
                joinType,
                inputs.removeIntEdges
            );
        }
        const offsetShape = offset.Shape();
        const result = this.converterService.getActualTypeOfShape(offsetShape);
        offsetShape.delete();
        if (offset) {
            offset.delete();
        }
        wires.forEach(w => w.delete());
        return result;
    }

    offset3DWire(inputs: Inputs.OCCT.Offset3DWireDto<TopoDS_Wire>): TopoDS_Wire | TopoDS_Edge[] {
        const extrusion = this.extrude({
            shape: inputs.shape,
            direction: inputs.direction,
        });

        const thickSolid = this.makeThickSolidSimple({
            shape: extrusion,
            offset: inputs.offset,
        });

        const nrOfEdges = this.shapeGettersService.getEdges({ shape: inputs.shape }).length;
        const predictedNrOfFaces = nrOfEdges * 4 + 2;

        const lastFaceIndex = predictedNrOfFaces / 2 - 1;
        const firstFaceIndex = lastFaceIndex - nrOfEdges + 1;

        const faceEdges: TopoDS_Edge[] = [];
        this.shapeGettersService.getFaces({ shape: thickSolid }).forEach((f, index) => {
            if (index >= firstFaceIndex && index <= lastFaceIndex) {
                const firstEdge = this.shapeGettersService.getEdges({ shape: f })[2];
                faceEdges.push(firstEdge);
            }
        });

        let result: TopoDS_Wire | TopoDS_Edge[];
        try {
            result = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: faceEdges });
            result = result.Reversed();
            result = this.converterService.getActualTypeOfShape(result);
        }
        catch {
            result = faceEdges;
            return result;
        }
        return result;

    }

    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        return inputs.shapes.map(shape => {
            const extruded = this.extrude({ shape, direction: inputs.direction });
            const result = this.converterService.getActualTypeOfShape(extruded);
            extruded.delete();
            return result;
        });
    }

    extrude(inputs: Inputs.OCCT.ExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        const gpVec = new this.occ.gp_Vec(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        // Use 2-parameter constructor - the 4-parameter version has binding issues in new Emscripten bindings
        const prismMaker = new this.occ.BRepPrimAPI_MakePrism(inputs.shape, gpVec);
        const prismShape = prismMaker.Shape();
        prismMaker.delete();
        gpVec.delete();
        return prismShape;
    }

    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<TopoDS_Shape>): TopoDS_Shape[] {
        const bopalgoBuilder = new this.occ.BOPAlgo_Builder();
        bopalgoBuilder.SetNonDestructive(inputs.nonDestructive);
        bopalgoBuilder.SetFuzzyValue(inputs.localFuzzyTolerance);
        bopalgoBuilder.AddArgument(inputs.shape);
        inputs.shapes.forEach(s => {
            bopalgoBuilder.AddArgument(s);
        });
        bopalgoBuilder.Perform();
        let shapes;
        if (!inputs.nonDestructive) {
            const res = bopalgoBuilder.Modified(inputs.shape);
            const shapeCompound = this.occ.BitListOfShapesToCompound(res);
            shapes = this.shapeGettersService.getShapesOfCompound({ shape: shapeCompound });
        } else {
            const res = bopalgoBuilder.Shape();
            shapes = this.shapeGettersService.getShapesOfCompound({ shape: res });
        }

        return shapes;
    }

    revolve(inputs: Inputs.OCCT.RevolveDto<TopoDS_Shape>) {
        if (!inputs.angle) { inputs.angle = 360.0; }
        if (!inputs.direction) { inputs.direction = [0, 0, 1]; }
        let result;
        const pt1 = new this.occ.gp_Pnt(0, 0, 0);
        const dir = new this.occ.gp_Dir(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        const ax1 = new this.occ.gp_Ax1(pt1, dir);
        if (inputs.angle >= 360.0) {
            // Full revolution - use 2-parameter constructor
            const makeRevol = new this.occ.BRepPrimAPI_MakeRevol(inputs.shape, ax1);
            result = makeRevol.Shape();
            makeRevol.delete();
        } else {
            // Partial revolution - use 4-parameter constructor with angle and copy flag
            const makeRevol = new this.occ.BRepPrimAPI_MakeRevol(inputs.shape,
                ax1,
                inputs.angle * 0.0174533, inputs.copy);
            result = makeRevol.Shape();
            makeRevol.delete();
        }
        pt1.delete();
        dir.delete();
        ax1.delete();
        const actual = this.converterService.getActualTypeOfShape(result);
        result.delete();
        return actual;
    }

    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<TopoDS_Shape>) {
        // Get the bounding box of the input shape to determine its current position
        const bbox = this.boundingBoxOfShape({ shape: inputs.shape });
        const shapeStartY = bbox.min[1]; // Y coordinate of the bottom of the shape
        const shapeEndY = shapeStartY + inputs.height; // Target Y coordinate after extrusion

        const translatedShape = this.transformsService.translate({
            translation: [0, inputs.height, 0],
            shape: inputs.shape,
        });
        const upperPolygon = this.transformsService.rotate(
            {
                axis: [0, 1, 0],
                angle: inputs.angle,
                shape: translatedShape
            });

        // Define the straight spine going from the shape's current position
        const spineWire = this.wiresService.createBSpline({
            points: [
                [0, shapeStartY, 0],
                [0, shapeEndY, 0]
            ],
            closed: false,
        });

        // Define the guiding helical auxiliary spine (which controls the rotation)
        const steps = 30;
        const aspinePoints: Inputs.Base.Point3[] = [];
        for (let i = 0; i <= steps; i++) {
            const alpha = i / steps;
            aspinePoints.push([
                20 * Math.sin(alpha * inputs.angle * 0.0174533),
                shapeStartY + (inputs.height * alpha),
                20 * Math.cos(alpha * inputs.angle * 0.0174533),
            ]);
        }

        const aspineWire = this.wiresService.createBSpline({ points: aspinePoints, closed: false });

        // Sweep the face wires along the spine to create the extrusion
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(spineWire);
        pipe.SetModeWithAuxSpine(aspineWire, true, this.occ.BRepFill_TypeOfContact.NoContact);
        pipe.Add(inputs.shape, false, false);
        pipe.Add(upperPolygon, false, false);
        pipe.Build();

        // default should be to make the solid for backwards compatibility
        if (inputs.makeSolid || inputs.makeSolid === undefined) {
            pipe.MakeSolid();
        }

        const pipeShape = pipe.Shape();
        const result = this.converterService.getActualTypeOfShape(pipeShape);
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
            pipe.Add(sh, false, false);
        });
        pipe.Build();
        pipe.MakeSolid();
        const pipeShape = pipe.Shape();
        const result = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        return result;
    }

    pipePolylineWireNGon(inputs: Inputs.OCCT.PipePolygonWireNGonDto<TopoDS_Wire>) {
        // Input wire (the spine)
        const wire = inputs.shape;

        // Get the edges of the wire
        const edge = this.shapeGettersService.getEdge({ shape: wire, index: 1 });

        // Get the start point and tangent of the first edge
        const startPoint = this.edgesService.pointOnEdgeAtParam({ shape: edge, param: 0 });
        const tangent = this.edgesService.tangentOnEdgeAtParam({ shape: edge, param: 0 });
        const ngon = this.wiresService.createNGonWire({
            radius: inputs.radius,
            center: startPoint,
            direction: tangent,
            nrCorners: inputs.nrCorners
        }) as TopoDS_Wire;

        const reversedNgon = this.wiresService.reversedWire({
            shape: ngon
        });

        let shape = reversedNgon;
        if (inputs.makeSolid) {
            shape = this.facesService.createFaceFromWire({
                shape: reversedNgon,
                planar: true,
            });
        }

        const geomFillTrihedron = this.enumService.getGeomFillTrihedronEnumOCCTValue(inputs.trihedronEnum);

        const pipe = new this.occ.BRepOffsetAPI_MakePipe(wire, shape, geomFillTrihedron, inputs.forceApproxC1 ? true : false);
        pipe.Build();
        const pipeShape = pipe.Shape();

        // Convert and clean up
        const result = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        ngon.delete();
        reversedNgon.delete();
        return result;
    }

    pipeWireCylindrical(inputs: Inputs.OCCT.PipeWireCylindricalDto<TopoDS_Wire>) {
        // Input wire (the spine)
        const wire = inputs.shape;

        // Get the edges of the wire
        const edges = this.shapeGettersService.getEdges({ shape: wire });

        // Get the start point and tangent of the first edge
        const firstEdge = edges[0];
        const startPoint = this.edgesService.startPointOnEdge({ shape: firstEdge });
        const tangent = this.edgesService.tangentOnEdgeAtParam({ shape: firstEdge, param: 0 });

        const circle = this.entitiesService.createCircle(
            inputs.radius,
            startPoint,
            tangent,
            inputs.makeSolid ? Inputs.OCCT.typeSpecificityEnum.face : Inputs.OCCT.typeSpecificityEnum.wire
        ) as TopoDS_Wire;


        // Create the pipe by sweeping the profile along the wire
        const geomFillTrihedron = this.enumService.getGeomFillTrihedronEnumOCCTValue(inputs.trihedronEnum);
        const pipe = new this.occ.BRepOffsetAPI_MakePipe(wire, circle, geomFillTrihedron, inputs.forceApproxC1 ? true : false);
        pipe.Build();
        const pipeShape = pipe.Shape();

        // Convert and clean up
        const result = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        circle.delete();

        return result;
    }

    pipeWiresCylindrical(inputs: Inputs.OCCT.PipeWiresCylindricalDto<TopoDS_Wire>) {
        return inputs.shapes.map(wire => {
            return this.pipeWireCylindrical({ shape: wire, radius: inputs.radius, makeSolid: inputs.makeSolid, trihedronEnum: inputs.trihedronEnum, forceApproxC1: inputs.forceApproxC1 });
        });
    }

    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>) {
        const maker = new this.occ.BRepOffsetAPI_MakeThickSolid();
        maker.MakeThickSolidBySimple(inputs.shape, inputs.offset);
        maker.Build();
        const makerShape = maker.Shape();

        const result = this.converterService.getActualTypeOfShape(makerShape);
        let res2 = result;
        if (inputs.offset > 0) {
            const faces = this.shapeGettersService.getFaces({ shape: result });
            const revFaces = faces.map(face => face.Reversed());
            res2 = this.shellsService.sewFaces({ shapes: revFaces, tolerance: 1e-7 });
            result.delete();
        }
        maker.delete();
        makerShape.delete();
        return res2;
    }

    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<TopoDS_Shape>) {
        const facesToRemove = new this.occ.TopTools_ListOfShape();
        inputs.shapes.forEach(shape => {
            facesToRemove.Append(shape);
        });
        const myBody = new this.occ.BRepOffsetAPI_MakeThickSolid();
        const jointType = this.getJoinType(inputs.joinType);

        myBody.MakeThickSolidByJoin(
            inputs.shape,
            facesToRemove,
            inputs.offset,
            inputs.tolerance,
            this.occ.BRepOffset_Mode.Skin, // currently a single option
            inputs.intersection,
            inputs.selfIntersection,
            jointType,
            inputs.removeIntEdges);
        const makeThick = myBody.Shape();
        const result = this.converterService.getActualTypeOfShape(makeThick);
        makeThick.delete();
        myBody.delete();
        facesToRemove.delete();
        return result;
    }

    private getJoinType(jointType: Inputs.OCCT.joinTypeEnum): EmbindEnumValue {
        let res: EmbindEnumValue;
        switch (jointType) {
            case Inputs.OCCT.joinTypeEnum.arc: {
                res = this.occ.GeomAbs_JoinType.Arc;
                break;
            }
            case Inputs.OCCT.joinTypeEnum.intersection: {
                res = this.occ.GeomAbs_JoinType.Intersection;
                break;
            }
            case Inputs.OCCT.joinTypeEnum.tangent: {
                res = this.occ.GeomAbs_JoinType.Tangent;
                break;
            }
        }
        return res;
    }

    private getBRepOffsetMode(offsetMode: Inputs.OCCT.bRepOffsetModeEnum): EmbindEnumValue {
        let res: EmbindEnumValue;
        switch (offsetMode) {
            case Inputs.OCCT.bRepOffsetModeEnum.skin: {
                res = this.occ.BRepOffset_Mode.Skin;
                break;
            }
            case Inputs.OCCT.bRepOffsetModeEnum.pipe: {
                res = this.occ.BRepOffset_Mode.Pipe;
                break;
            }
            case Inputs.OCCT.bRepOffsetModeEnum.rectoVerso: {
                res = this.occ.BRepOffset_Mode.RectoVerso;
                break;
            }
        }
        return res;
    }

    slice(inputs: Inputs.OCCT.SliceDto<TopoDS_Shape>): TopoDS_Compound {
        if (inputs.step <= 0) {
            throw new Error("Step needs to be positive.");
        }
        const { bbox, transformedShape } = this.createBBoxAndTransformShape(inputs.shape, inputs.direction);
        const intersections = [];
        if (!this.occ.Bnd_Box_IsThin(bbox, 0.0001)) {
            const { minY, maxY, maxDist } = this.computeBounds(bbox);

            const planes = [];
            for (let i = minY; i < maxY; i += inputs.step) {
                const pq = this.facesService.createSquareFace({ size: maxDist, center: [0, i, 0], direction: [0, 1, 0] });
                planes.push(pq);
            }

            this.applySlices(transformedShape, planes, inputs.direction, intersections);
        }
        const res = this.converterService.makeCompound({ shapes: intersections });
        return res;
    }

    sliceInStepPattern(inputs: Inputs.OCCT.SliceInStepPatternDto<TopoDS_Shape>): TopoDS_Compound {
        if (!inputs.steps || inputs.steps.length === 0) {
            throw new Error("Steps must be provided with at elast one positive value");
        }
        const { bbox, transformedShape } = this.createBBoxAndTransformShape(inputs.shape, inputs.direction);
        const intersections = [];
        if (!this.occ.Bnd_Box_IsThin(bbox, 0.0001)) {
            const { minY, maxY, maxDist } = this.computeBounds(bbox);

            const planes = [];

            let index = 0;
            for (let i = minY; i < maxY; i += inputs.steps[index]) {
                const pq = this.facesService.createSquareFace({ size: maxDist, center: [0, i, 0], direction: [0, 1, 0] });
                planes.push(pq);
                if (inputs.steps[index + 1] === undefined) {
                    index = 0;
                } else {
                    index++;
                }
            }

            this.applySlices(transformedShape, planes, inputs.direction, intersections);
        }
        const res = this.converterService.makeCompound({ shapes: intersections });
        return res;
    }

    private createBBoxAndTransformShape(shape: TopoDS_Shape, direction: Inputs.Base.Vector3) {

        // we orient the given shape to the reverse direction of sections so that slicing
        // would always happen in flat bbox aligned orientation
        // after algorithm computes, we turn all intersections to original shape so that it would match a given shape.
        // const fromDir
        const transformedShape = this.transformsService.align({
            shape,
            fromOrigin: [0, 0, 0],
            fromDirection: direction,
            toOrigin: [0, 0, 0],
            toDirection: [0, 1, 0],
        });
        const bbox = new this.occ.Bnd_Box();
        this.occ.BRepBndLib.Add(transformedShape, bbox, false);
        return { bbox, transformedShape };
    }

    private computeBounds(bbox: Bnd_Box) {
        const cornerMin = bbox.CornerMin();
        const cornerMax = bbox.CornerMax();
        const minY = cornerMin.Y();
        const maxY = cornerMax.Y();

        const minX = cornerMin.X();
        const maxX = cornerMax.X();

        const minZ = cornerMin.Z();
        const maxZ = cornerMax.Z();

        const distX = maxX - minX;
        const distZ = maxZ - minZ;

        const percentage = 1.2;
        let maxDist = distX >= distZ ? distX : distZ;
        maxDist *= percentage;
        return { minY, maxY, maxDist };
    }


    private applySlices(transformedShape: TopoDS_Shape, planes: any[], direction: Inputs.Base.Vector3, intersections: any[]) {
        const shapesToSlice = [];
        if (this.enumService.getShapeTypeEnum(transformedShape) === Inputs.OCCT.shapeTypeEnum.solid) {
            shapesToSlice.push(transformedShape);
        } else {
            const solids = this.shapeGettersService.getSolids({ shape: transformedShape });
            shapesToSlice.push(...solids);
        }

        if (shapesToSlice.length === 0) {
            throw new Error("No solids found to slice.");
        }

        shapesToSlice.forEach(s => {
            const intInputs = new Inputs.OCCT.IntersectionDto<TopoDS_Shape>();
            intInputs.keepEdges = true;
            intInputs.shapes = [s];

            const compound = this.converterService.makeCompound({ shapes: planes });
            intInputs.shapes.push(compound);

            const ints = this.booleansService.intersection(intInputs);
            ints.forEach(int => {
                if (int && !int.IsNull()) {
                    const transformedInt = this.transformsService.align({
                        shape: int,
                        fromOrigin: [0, 0, 0],
                        fromDirection: [0, 1, 0],
                        toOrigin: [0, 0, 0],
                        toDirection: direction,
                    });
                    intersections.push(transformedInt);
                }
            });
        });
    }
}
