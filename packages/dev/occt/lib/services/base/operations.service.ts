import {
    BRepOffsetAPI_MakeOffset, BRepOffsetAPI_MakeOffsetShape, BRepPrimAPI_MakePrism, BRepPrimAPI_MakeRevol, Bnd_Box, EmbindEnumValue,
    BitbybitOcctModule, TopoDS_Compound, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire,
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { VectorHelperService } from "../../api/vector-helper.service";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import { EnumService } from "./enum.service";
import { EntitiesService } from "./entities.service";
import { ConverterService } from "./converter.service";
import { TransformsService } from "./transforms.service";
import { ShapeGettersService } from "./shape-getters";
import { EdgesService } from "./edges.service";
import { WiresService } from "./wires.service";
import { FacesService } from "./faces.service";
import { SolidsService } from "./solids.service";
import * as Resolved from "../../api/resolved-inputs";
import { InputError } from "@bitbybit-dev/base";
import { occtFailure } from "../../kernel-failures";
import { coordinatesOf, pointsFromCoordinates } from "./kernel-arrays";
import { checkedShapes } from "./input-checks";

export class OperationsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly enumService: EnumService,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly edgesService: EdgesService,
        private readonly transformsService: TransformsService,
        private readonly vecHelper: VectorHelperService,
        private readonly wiresService: WiresService,
        private readonly facesService: FacesService,
        private readonly solidsService: SolidsService,
    ) { }

    loftAdvanced(inputs: Resolved.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        checkedShapes(inputs.shapes);
        if (inputs.periodic && !inputs.closed) {
            throw new Error("Cant construct periodic non closed loft.");
        }
        const sections = inputs.shapes.length + (inputs.startVertex ? 1 : 0) + (inputs.endVertex ? 1 : 0);
        if (sections < 2) {
            throw new InputError(`A loft needs at least two sections, counting a start or end point, and got ${sections}.`, "shapes");
        }
        if (inputs.shapes.length === 0) {
            throw new InputError("A loft needs at least one wire or edge among its sections; a start or end point can only begin or end it.", "shapes");
        }
        if (inputs.periodic && inputs.shapes.length < 3) {
            throw new InputError(`A periodic loft runs a closed curve through its sections, which needs at least three, and got ${inputs.shapes.length}.`, "shapes");
        }
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, inputs.straight, inputs.tolerance);
        const wires: TopoDS_Wire[] = [];
        const vertices: TopoDS_Vertex[] = [];
        if (inputs.startVertex) {
            const v = this.entitiesService.makeVertex(inputs.startVertex);
            pipe.AddVertex(v);
            vertices.push(v);
        }
        const shapes = inputs.closed && !inputs.periodic ? [...inputs.shapes, inputs.shapes[0]!] : inputs.shapes;
        if (inputs.closed && inputs.periodic) {
            const pointsOnCrvs: Inputs.Base.Point3[][] = [];
            inputs.shapes.forEach((s: TopoDS_Wire | TopoDS_Edge) => {
                if (this.enumService.getShapeTypeEnum(s) === Inputs.OCCT.shapeTypeEnum.edge) {
                    s = this.entitiesService.bRepBuilderAPIMakeWire(s);
                }
                const pts = this.wiresService.divideWireByParamsToPoints({ shape: s, nrOfDivisions: inputs.nrPeriodicSections, removeStartPoint: false, removeEndPoint: false });
                pointsOnCrvs.push(pts);
            });

            for (let i = 0; i <= inputs.nrPeriodicSections; i++) {
                const ptsForPerpWire = pointsOnCrvs.map(p => p[i]!);
                const periodicWire = this.wiresService.interpolatePoints({ points: ptsForPerpWire, tolerance: inputs.tolerance, periodic: true });
                pipe.AddWire(periodicWire);
                wires.push(periodicWire);
            }
        }
        if (!inputs.periodic) {
            shapes.forEach((wire) => {
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
            pipe.SetParType(parType);
        }
        pipe.CheckCompatibility(false);
        pipe.Build();
        const built = pipe.IsDone();
        const pipeShape = built ? pipe.Shape() : undefined;
        pipe.delete();
        wires.forEach(w => w.delete());
        vertices.forEach(v => v.delete());
        endVertices.forEach(v => v.delete());
        if (!pipeShape) {
            throw occtFailure("occt.loft.failed");
        }
        const res = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        return res;
    }


    closestPointsBetweenTwoShapes(shape1: TopoDS_Shape, shape2: TopoDS_Shape): [Base.Point3, Base.Point3] {
        const result = this.occ.ClosestPointsBetweenShapes(shape1, shape2);
        if (result.size() === 6) {
            return [[result.get(0)!, result.get(1)!, result.get(2)!], [result.get(3)!, result.get(4)!, result.get(5)!]];
        } else {
            throw new Error("Closest points could not be found.");
        }
    }

    closestPointsOnShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.closestPointsOn(inputs.shape, inputs.points);
    }

    closestPointsOnShapesFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapesFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        checkedShapes(inputs.shapes);
        return inputs.shapes.flatMap(shape => this.closestPointsOn(shape, inputs.points));
    }

    distancesToShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): number[] {
        const closest = this.closestPointsOn(inputs.shape, inputs.points);
        return inputs.points.map((point, index) => this.vecHelper.distanceBetweenPoints(point, closest[index]!));
    }

    /** The point of `shape` nearest to each of `points`, found in one kernel call that prepares `shape` once. */
    private closestPointsOn(shape: TopoDS_Shape, points: Inputs.Base.Point3[]): Inputs.Base.Point3[] {
        const closest = pointsFromCoordinates(this.occ.ClosestPointsOnShape(shape, coordinatesOf(points)));
        if (closest.length !== points.length) {
            throw new Error("Closest points could not be found.");
        }
        return closest;
    }

    boundingBoxOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.BoundingBoxPropsDto {
        const box = this.occ.BoundingBoxOf(inputs.shape);
        if (box.length < 6) {
            throw new InputError("`shape` has no geometry to bound, so it has no bounding box.", "shape");
        }
        const min: Inputs.Base.Point3 = [box[0]!, box[1]!, box[2]!];
        const max: Inputs.Base.Point3 = [box[3]!, box[4]!, box[5]!];
        return {
            min,
            max,
            center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
            size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
        };
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

    loft(inputs: Resolved.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        checkedShapes(inputs.shapes);
        if (inputs.shapes.length < 2) {
            throw new InputError(`A loft needs at least two sections, and got ${inputs.shapes.length}.`, "shapes");
        }
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, false, 1.0e-06);
        inputs.shapes.forEach((wire) => {
            if (this.enumService.getShapeTypeEnum(wire) === Inputs.OCCT.shapeTypeEnum.edge) {
                wire = this.entitiesService.bRepBuilderAPIMakeWire(wire);
            }
            pipe.AddWire(wire);
        });
        pipe.CheckCompatibility(false);
        pipe.Build();
        const built = pipe.IsDone();
        const pipeShape = built ? pipe.Shape() : undefined;
        pipe.delete();
        if (!pipeShape) {
            throw occtFailure("occt.loft.failed");
        }
        const res = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        return res;
    }

    offset(inputs: Resolved.OCCT.OffsetDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        return this.offsetAdv({ shape: inputs.shape, face: inputs.face, distance: inputs.distance, tolerance: inputs.tolerance, joinType: Inputs.OCCT.joinTypeEnum.arc, removeIntEdges: false });
    }

    offsetAdv(inputs: Resolved.OCCT.OffsetAdvancedDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        if (inputs.distance === 0.0) { return inputs.shape; }
        let offset: BRepOffsetAPI_MakeOffset | BRepOffsetAPI_MakeOffsetShape;
        const joinType = this.getJoinType(inputs.joinType);
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
            offset = new this.occ.BRepOffsetAPI_MakeOffset();
            try {
                if (inputs.face) {
                    offset.Init(inputs.face, joinType, false);
                } else {
                    offset.InitJoin(joinType, false);
                }
                offset.AddWire(wire);
                offset.Build();
                offset.Perform(inputs.distance, 0.0);
            } catch (thrown) {
                offset.delete();
                wires.forEach(w => w.delete());
                throw thrown;
            }
        } else {
            const shapeToOffset = inputs.shape;
            offset = new this.occ.BRepOffsetAPI_MakeOffsetShape();
            (offset).PerformByJoin(
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
        const offsetShape = offset.IsDone() ? offset.Shape() : undefined;
        offset.delete();
        wires.forEach(w => w.delete());
        if (!offsetShape || offsetShape.IsNull()) {
            offsetShape?.delete();
            throw occtFailure("occt.offset.failed");
        }
        const result = this.converterService.getActualTypeOfShape(offsetShape);
        offsetShape.delete();
        return result;
    }

    offset3DWire(inputs: Resolved.OCCT.Offset3DWireDto<TopoDS_Wire>): TopoDS_Wire | TopoDS_Edge[] {
        const [x, y, z] = inputs.direction;
        if (x === 0 && y === 0 && z === 0) {
            throw new InputError("`direction` must not be the zero vector: the offset is taken across it.", "direction");
        }
        const offset = this.occ.OffsetWire3D(inputs.shape, inputs.offset, x, y, z);
        if (offset.IsNull()) {
            offset.delete();
            throw occtFailure("occt.offset.failed");
        }
        if (offset.ShapeType() === this.occ.TopAbs_ShapeEnum.WIRE) {
            const wire = this.occ.CastToWire(offset);
            offset.delete();
            return wire;
        }
        const edges = this.occ.EdgesOf(offset, true);
        offset.delete();
        return edges;
    }

    extrudeShapes(inputs: Resolved.OCCT.ExtrudeShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        checkedShapes(inputs.shapes);
        return inputs.shapes.map(shape => {
            const extruded = this.extrude({ shape, direction: inputs.direction });
            const result = this.converterService.getActualTypeOfShape(extruded);
            extruded.delete();
            return result;
        });
    }

    /**
     * `read`, when given, sees the prism maker and its result before the maker is released.
     */
    extrude(inputs: Resolved.OCCT.ExtrudeDto<TopoDS_Shape>, read?: (maker: BRepPrimAPI_MakePrism, result: TopoDS_Shape) => void): TopoDS_Shape {
        const direction = inputs.direction;
        if (!direction.every(Number.isFinite)) {
            throw new InputError(`\`direction\` is [${direction.join(", ")}], and the direction of an extrusion has to be finite numbers.`, "direction");
        }
        if (direction.every(component => component === 0)) {
            throw new InputError("`direction` is [0, 0, 0], and an extrusion needs a direction with some length: the shape travels along it for that length.", "direction");
        }
        const solids = new this.occ.TopExp_Explorer(inputs.shape, this.occ.TopAbs_ShapeEnum.SOLID, this.occ.TopAbs_ShapeEnum.SHAPE);
        const holdsSolid = solids.More();
        solids.delete();
        if (holdsSolid) {
            throw new InputError("`shape` holds a solid, which cannot be extruded; extrude its faces, a shell or a wire instead.", "shape");
        }
        const gpVec = new this.occ.gp_Vec(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        const prismMaker = new this.occ.BRepPrimAPI_MakePrism(inputs.shape, gpVec);
        const prismShape = prismMaker.Shape();
        try {
            read?.(prismMaker, prismShape);
        } catch (error) {
            prismShape.delete();
            throw error;
        } finally {
            prismMaker.delete();
            gpVec.delete();
        }
        return prismShape;
    }

    splitShapeWithShapes(inputs: Resolved.OCCT.SplitDto<TopoDS_Shape>): TopoDS_Shape[] {
        checkedShapes(inputs.shapes);
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

    /**
     * `read`, when given, sees the revolution maker and its result before the maker is released.
     */
    revolve(inputs: Resolved.OCCT.RevolveDto<TopoDS_Shape>, read?: (maker: BRepPrimAPI_MakeRevol, result: TopoDS_Shape) => void): TopoDS_Shape {
        const angle = inputs.angle;
        if (angle === 0) {
            throw new Error("The revolve angle must not be 0, or nothing is swept.");
        }
        const direction = inputs.direction;
        let result;
        const pt1 = new this.occ.gp_Pnt(0, 0, 0);
        const dir = new this.occ.gp_Dir(direction[0], direction[1], direction[2]);
        const ax1 = new this.occ.gp_Ax1(pt1, dir);
        const swept = (makeRevol: BRepPrimAPI_MakeRevol): TopoDS_Shape | undefined => {
            try {
                const made = makeRevol.IsDone() ? makeRevol.Shape() : undefined;
                if (made) {
                    try {
                        read?.(makeRevol, made);
                    } catch (error) {
                        made.delete();
                        throw error;
                    }
                }
                return made;
            } finally {
                makeRevol.delete();
            }
        };
        try {
            result = Math.abs(angle) >= 360.0
                ? swept(new this.occ.BRepPrimAPI_MakeRevol(inputs.shape, ax1))
                : swept(new this.occ.BRepPrimAPI_MakeRevol(inputs.shape, ax1, angle * Math.PI / 180, inputs.copy));
        } finally {
            pt1.delete();
            dir.delete();
            ax1.delete();
        }
        if (!result) {
            throw occtFailure("occt.revolve.failed");
        }
        const actual = this.converterService.getActualTypeOfShape(result);
        result.delete();
        return actual;
    }

    rotatedExtrude(inputs: Resolved.OCCT.RotationExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        const bbox = this.boundingBoxOfShape({ shape: inputs.shape });
        const shapeStartY = bbox.min[1];
        const shapeEndY = shapeStartY + inputs.height;

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

        const spineWire = this.wiresService.createBSpline({
            points: [
                [0, shapeStartY, 0],
                [0, shapeEndY, 0]
            ],
            closed: false,
        });

        const steps = 30;
        const aspinePoints: Inputs.Base.Point3[] = [];
        for (let i = 0; i <= steps; i++) {
            const alpha = i / steps;
            aspinePoints.push([
                20 * Math.sin(alpha * inputs.angle * Math.PI / 180),
                shapeStartY + (inputs.height * alpha),
                20 * Math.cos(alpha * inputs.angle * Math.PI / 180),
            ]);
        }

        const aspineWire = this.wiresService.createBSpline({ points: aspinePoints, closed: false });

        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(spineWire);
        pipe.SetModeWithAuxSpine(aspineWire, true, this.occ.BRepFill_TypeOfContact.NoContact);
        pipe.Add(inputs.shape, false, false);
        pipe.Add(upperPolygon, false, false);
        pipe.Build();

        if (inputs.makeSolid) {
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

    pipe(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Shape>): TopoDS_Shape {
        checkedShapes(inputs.shapes);
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(inputs.shape);
        inputs.shapes.forEach(sh => {
            pipe.Add(sh, false, false);
        });
        pipe.Build();
        if (!pipe.IsDone()) {
            pipe.delete();
            throw occtFailure("occt.pipe.failed");
        }
        pipe.MakeSolid();
        const pipeShape = pipe.Shape();
        const result = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        return result;
    }

    pipePolylineWireNGon(inputs: Resolved.OCCT.PipePolygonWireNGonDto<TopoDS_Wire>): TopoDS_Shape {
        const wire = inputs.shape;

        const edge = this.shapeGettersService.getEdge({ shape: wire, index: 0 });

        const startPoint = this.edgesService.pointOnEdgeAtParam({ shape: edge, param: 0 });
        const tangent = this.edgesService.tangentOnEdgeAtParam({ shape: edge, param: 0 });
        const ngon = this.wiresService.createNGonWire({
            radius: inputs.radius,
            center: startPoint,
            direction: tangent,
            nrCorners: inputs.nrCorners
        });

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
        if (!pipe.IsDone()) {
            pipe.delete();
            ngon.delete();
            reversedNgon.delete();
            throw occtFailure("occt.pipe.failed");
        }
        const pipeShape = pipe.Shape();

        const result = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        ngon.delete();
        reversedNgon.delete();
        return result;
    }

    pipeWireCylindrical(inputs: Resolved.OCCT.PipeWireCylindricalDto<TopoDS_Wire>): TopoDS_Shape {
        const wire = inputs.shape;

        const edges = this.shapeGettersService.getEdges({ shape: wire });

        const firstEdge = edges[0]!;
        const startPoint = this.edgesService.startPointOnEdge({ shape: firstEdge });
        const tangent = this.edgesService.tangentOnEdgeAtParam({ shape: firstEdge, param: 0 });

        const circle = this.entitiesService.createCircle(
            inputs.radius,
            startPoint,
            tangent,
            inputs.makeSolid ? Inputs.OCCT.typeSpecificityEnum.face : Inputs.OCCT.typeSpecificityEnum.wire
        );


        const geomFillTrihedron = this.enumService.getGeomFillTrihedronEnumOCCTValue(inputs.trihedronEnum);
        const pipe = new this.occ.BRepOffsetAPI_MakePipe(wire, circle, geomFillTrihedron, inputs.forceApproxC1 ? true : false);
        pipe.Build();
        if (!pipe.IsDone()) {
            pipe.delete();
            circle.delete();
            throw occtFailure("occt.pipe.failed");
        }
        const pipeShape = pipe.Shape();

        const result = this.converterService.getActualTypeOfShape(pipeShape);
        pipeShape.delete();
        pipe.delete();
        circle.delete();

        return result;
    }

    pipeWiresCylindrical(inputs: Resolved.OCCT.PipeWiresCylindricalDto<TopoDS_Wire>): TopoDS_Shape[] {
        checkedShapes(inputs.shapes);
        return inputs.shapes.map(wire => {
            return this.pipeWireCylindrical({ shape: wire, radius: inputs.radius, makeSolid: inputs.makeSolid, trihedronEnum: inputs.trihedronEnum, forceApproxC1: inputs.forceApproxC1 });
        });
    }

    makeThickSolidSimple(inputs: Resolved.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>): TopoDS_Shape {
        const maker = new this.occ.BRepOffsetAPI_MakeThickSolid();
        maker.MakeThickSolidBySimple(inputs.shape, inputs.offset);
        maker.Build();
        if (!maker.IsDone()) {
            maker.delete();
            throw occtFailure("occt.thickSolid.failed");
        }
        const makerShape = maker.Shape();
        const outward = inputs.offset > 0 ? makerShape.Reversed() : makerShape;
        const result = this.converterService.getActualTypeOfShape(outward);
        if (outward !== makerShape) {
            outward.delete();
        }
        maker.delete();
        makerShape.delete();
        return result;
    }

    makeThickSolidByJoin(inputs: Resolved.OCCT.ThickSolidByJoinDto<TopoDS_Shape>): TopoDS_Shape {
        checkedShapes(inputs.shapes);
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
            this.occ.BRepOffset_Mode.Skin,
            inputs.intersection,
            inputs.selfIntersection,
            jointType,
            inputs.removeIntEdges);
        if (!myBody.IsDone()) {
            myBody.delete();
            facesToRemove.delete();
            throw occtFailure("occt.thickSolid.failed");
        }
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

    slice(inputs: Resolved.OCCT.SliceDto<TopoDS_Shape>): TopoDS_Compound {
        if (inputs.step <= 0) {
            throw new Error("Step needs to be positive.");
        }
        return this.sliceAlong(inputs.shape, inputs.direction, (lowest, highest) => {
            const levels: number[] = [];
            for (let level = lowest; level < highest; level += inputs.step) {
                levels.push(level);
            }
            return levels;
        });
    }

    sliceInStepPattern(inputs: Resolved.OCCT.SliceInStepPatternDto<TopoDS_Shape>): TopoDS_Compound {
        if (inputs.steps.reduce((sum, step) => sum + step, 0) <= 0) {
            throw new Error("Steps must add up to more than 0, or the slices never move along the shape.");
        }
        return this.sliceAlong(inputs.shape, inputs.direction, (lowest, highest) => {
            const levels: number[] = [];
            let index = 0;
            for (let level = lowest; level < highest; level += inputs.steps[index]!) {
                levels.push(level);
                index = inputs.steps[index + 1] === undefined ? 0 : index + 1;
            }
            return levels;
        });
    }

    /**
     * The section faces of the solids of `shape` at the levels `levelsBetween` picks between the
     * lowest and the highest point of the shape along `direction`, sliced by the kernel in one call
     * per solid: one compound per solid that the planes cross, holding its faces once each, in
     * a compound of them all. A shape too thin to slice gives an empty compound.
     */
    private sliceAlong(shape: TopoDS_Shape, direction: Inputs.Base.Vector3, levelsBetween: (lowest: number, highest: number) => number[]): TopoDS_Compound {
        const { bbox, transformedShape } = this.createBBoxAndTransformShape(shape, direction);
        try {
            if (this.occ.Bnd_Box_IsThin(bbox, 0.0001)) {
                return this.converterService.makeCompound({ shapes: [] });
            }
            const { minY, maxY, centerX, centerZ } = this.computeBounds(bbox);
            const frames = levelsBetween(minY, maxY).flatMap(level => [centerX, level, centerZ, 0, 1, 0, 1, 0, 0]);
            const isSolid = this.enumService.getShapeTypeEnum(transformedShape) === Inputs.OCCT.shapeTypeEnum.solid;
            const solids = isSolid ? [transformedShape] : this.shapeGettersService.getSolids({ shape: transformedShape });
            try {
                if (solids.length === 0) {
                    throw new Error("No solids found to slice.");
                }
                const slices = solids.flatMap(solid => this.slicesOfSolid(solid, frames, direction));
                const result = this.converterService.makeCompound({ shapes: slices });
                slices.forEach(slice => slice.delete());
                return result;
            } finally {
                if (!isSolid) {
                    solids.forEach(solid => solid.delete());
                }
            }
        } finally {
            bbox.delete();
            transformedShape.delete();
        }
    }

    /**
     * The faces where the planes of `frames` cross `solid`, gathered into one compound turned back
     * from the Y axis onto `direction`, or nothing when no plane crosses it. A plane given twice
     * receives the same face twice from the kernel, which is kept once.
     */
    private slicesOfSolid(solid: TopoDS_Shape, frames: number[], direction: Inputs.Base.Vector3): TopoDS_Shape[] {
        const perFrame = this.occ.SliceByFrames(solid, frames, true, 1e-7);
        const pieces = perFrame.flatMap(slice => this.occ.ChildrenOf(slice));
        perFrame.forEach(slice => slice.delete());
        const faces = pieces.filter((piece, index) => pieces.findIndex(other => other.IsSame(piece)) === index);
        pieces.filter(piece => !faces.includes(piece)).forEach(piece => piece.delete());
        if (faces.length === 0) {
            return [];
        }
        const compound = this.converterService.makeCompound({ shapes: faces });
        faces.forEach(face => face.delete());
        const turned = this.transformsService.align({
            shape: compound,
            fromOrigin: [0, 0, 0],
            fromDirection: [0, 1, 0],
            toOrigin: [0, 0, 0],
            toDirection: direction,
        });
        compound.delete();
        return [turned];
    }

    private createBBoxAndTransformShape(shape: TopoDS_Shape, direction: Inputs.Base.Vector3) {

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
        cornerMin.delete();
        cornerMax.delete();

        return { minY, maxY, centerX: (minX + maxX) / 2, centerZ: (minZ + maxZ) / 2 };
    }
}
