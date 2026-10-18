import type { BOPAlgo_Builder, BRepOffsetAPI_MakeOffsetShape, BRepOffsetAPI_MakePipe, BRepOffsetAPI_MakePipeShell, BRepOffsetAPI_MakeThickSolid, BRepOffsetAPI_ThruSections, BRepPrimAPI_MakePrism, BRepPrimAPI_MakeRevol, Bnd_Box, EmbindEnumValue, BitbybitOcctModule, TopoDS_Compound, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import type { Base } from "../../api/inputs";
import type { EnumService } from "./enum.service";
import type { EntitiesService } from "./entities.service";
import type { ConverterService } from "./converter.service";
import type { TransformsService } from "./transforms.service";
import type { ShapeGettersService } from "./shape-getters";
import type { EdgesService } from "./edges.service";
import type { WiresService } from "./wires.service";
import type { FacesService } from "./faces.service";
import type { SolidsService } from "./solids.service";
import type * as Resolved from "../../api/resolved-inputs";
import { InputError } from "@bitbybit-dev/base";
import type * as Models from "../../api/models";
import { historiesFromKernel } from "./history";
import { occtFailure } from "../../kernel-failures";
import { kernelObjects, releasedOnError } from "./release";
import type { KernelObjects } from "./release-types";
import { coordinatesOf, pointsFromCoordinates } from "./kernel-arrays";
import { checkedDirection, checkedShapes } from "./input-checks";
import { withKernelFailure } from "./kernel-refusals";
import { holdsSolid, isBrokenResult } from "./solid-results";
import { tubeArguments, tubeOf } from "./tubes";
import { add3, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

const MOST_SLICES = 100000;

function tooManySlices(property: string): InputError {
    return new InputError(`\`${property}\` would cut the shape into more than ${MOST_SLICES} slices; use a larger spacing.`, property);
}

export class OperationsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly enumService: EnumService,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly edgesService: EdgesService,
        private readonly transformsService: TransformsService,
        private readonly base: BaseBitByBit,
        private readonly wiresService: WiresService,
        private readonly facesService: FacesService,
        private readonly solidsService: SolidsService,
    ) { }

    /**
     * `read`, when given, sees the loft maker and its result before the maker is released.
     */
    loftAdvanced(inputs: Resolved.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>, read?: (maker: BRepOffsetAPI_ThruSections, result: TopoDS_Shape) => void): TopoDS_Shape {
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
        const { own, releaseAll } = kernelObjects();
        try {
            const pipe = own(new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, inputs.straight, inputs.tolerance));
            if (inputs.startVertex) {
                pipe.AddVertex(own(this.entitiesService.makeVertex(inputs.startVertex)));
            }
            const sections = inputs.shapes.map(section => this.sectionWireOf(section, own));
            if (inputs.periodic) {
                const pointsOnCrvs = sections.map(section => this.wiresService.divideWireByParamsToPoints({ shape: section, nrOfDivisions: inputs.nrPeriodicSections, removeStartPoint: false, removeEndPoint: false }));
                for (let i = 0; i <= inputs.nrPeriodicSections; i++) {
                    const ptsForPerpWire = pointsOnCrvs.map(p => p[i]!);
                    pipe.AddWire(own(this.wiresService.interpolatePoints({ points: ptsForPerpWire, tolerance: inputs.tolerance, periodic: true })));
                }
            } else {
                (inputs.closed ? [...sections, sections[0]!] : sections).forEach(section => pipe.AddWire(section));
            }
            if (inputs.endVertex) {
                pipe.AddVertex(own(this.entitiesService.makeVertex(inputs.endVertex)));
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
            return this.loftedBy(pipe, inputs.makeSolid, sections, own, read);
        } finally {
            releaseAll();
        }
    }

    private sectionWireOf(section: TopoDS_Wire | TopoDS_Edge, own: KernelObjects["own"]): TopoDS_Wire {
        return this.enumService.getShapeTypeEnum(section) === Inputs.OCCT.shapeTypeEnum.edge ? own(this.entitiesService.bRepBuilderAPIMakeWire(section)) : section;
    }

    private loftedBy(pipe: BRepOffsetAPI_ThruSections, makeSolid: boolean, sections: TopoDS_Wire[], own: KernelObjects["own"], read?: (maker: BRepOffsetAPI_ThruSections, result: TopoDS_Shape) => void): TopoDS_Shape {
        const edgeCounts = new Set(sections.map(section => this.occ.CountSubShapes(section, this.occ.TopAbs_ShapeEnum.EDGE, true)));
        pipe.CheckCompatibility(edgeCounts.size > 1);
        withKernelFailure(this.occ, () => pipe.Build(), () => occtFailure("occt.loft.failed"));
        if (!pipe.IsDone()) {
            throw occtFailure("occt.loft.failed");
        }
        const pipeShape = own(pipe.Shape());
        if (isBrokenResult(this.occ, pipeShape, makeSolid)) {
            throw occtFailure("occt.loft.failed");
        }
        read?.(pipe, pipeShape);
        return this.converterService.getActualTypeOfShape(pipeShape);
    }


    closestPointsBetweenTwoShapes(shape1: TopoDS_Shape, shape2: TopoDS_Shape): [Base.Point3, Base.Point3] {
        const result = this.occ.ClosestPointsBetweenShapes(shape1, shape2);
        try {
            if (result.size() === 6) {
                return [[result.get(0)!, result.get(1)!, result.get(2)!], [result.get(3)!, result.get(4)!, result.get(5)!]];
            }
            throw new Error("Closest points could not be found.");
        } finally {
            result.delete();
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
        return inputs.points.map((point, index) => this.base.point.distance({ startPoint: point, endPoint: closest[index]! }));
    }

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
            center: scale3(add3(min, max), 1 / 2),
            size: subtract3(max, min),
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
        const radius = this.base.point.distance({ startPoint: bbox.min, endPoint: center });
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

    /**
     * `read`, when given, sees the loft maker and its result before the maker is released.
     */
    loft(inputs: Resolved.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>, read?: (maker: BRepOffsetAPI_ThruSections, result: TopoDS_Shape) => void): TopoDS_Shape {
        checkedShapes(inputs.shapes);
        if (inputs.shapes.length < 2) {
            throw new InputError(`A loft needs at least two sections, and got ${inputs.shapes.length}.`, "shapes");
        }
        const { own, releaseAll } = kernelObjects();
        try {
            const pipe = own(new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, false, 1.0e-06));
            const sections = inputs.shapes.map(section => this.sectionWireOf(section, own));
            sections.forEach(section => pipe.AddWire(section));
            return this.loftedBy(pipe, inputs.makeSolid, sections, own, read);
        } finally {
            releaseAll();
        }
    }

    offset(inputs: Resolved.OCCT.OffsetDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        return this.offsetAdv({ shape: inputs.shape, face: inputs.face, distance: inputs.distance, tolerance: inputs.tolerance, joinType: Inputs.OCCT.joinTypeEnum.arc, removeIntEdges: false });
    }

    offsetAdv(inputs: Resolved.OCCT.OffsetAdvancedDto<TopoDS_Shape, TopoDS_Face>, read?: (maker: BRepOffsetAPI_MakeOffsetShape, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.distance === 0.0 && read === undefined) { return inputs.shape; }
        const kind = this.enumService.getShapeTypeEnum(inputs.shape);
        if (kind === Inputs.OCCT.shapeTypeEnum.wire || kind === Inputs.OCCT.shapeTypeEnum.edge) {
            if (read !== undefined) {
                throw new InputError("`shape` is a wire or an edge, whose offset keeps no history of faces: offset a face, a shell or a solid.", "shape");
            }
            return this.offsetCurve(inputs, kind === Inputs.OCCT.shapeTypeEnum.edge);
        }
        const { own, releaseAll } = kernelObjects();
        try {
            const offset = own(new this.occ.BRepOffsetAPI_MakeOffsetShape());
            const made = withKernelFailure(this.occ, () => {
                offset.PerformByJoin(inputs.shape, inputs.distance, inputs.tolerance, this.occ.BRepOffset_Mode.Skin, false, false, this.getJoinType(inputs.joinType), inputs.removeIntEdges);
                return offset.IsDone() ? own(offset.Shape()) : undefined;
            }, () => occtFailure("occt.offset.failed"));
            if (made === undefined || isBrokenResult(this.occ, made, holdsSolid(this.occ, inputs.shape))) {
                throw occtFailure("occt.offset.failed");
            }
            read?.(offset, made);
            return this.converterService.getActualTypeOfShape(made);
        } finally {
            releaseAll();
        }
    }

    private offsetCurve(inputs: Resolved.OCCT.OffsetAdvancedDto<TopoDS_Shape, TopoDS_Face>, isEdge: boolean): TopoDS_Shape {
        const { own, releaseAll } = kernelObjects();
        try {
            const wire = isEdge ? own(this.entitiesService.bRepBuilderAPIMakeWire(inputs.shape)) : inputs.shape;
            const offset = own(new this.occ.BRepOffsetAPI_MakeOffset());
            const joinType = this.getJoinType(inputs.joinType);
            const made = withKernelFailure(this.occ, () => {
                if (inputs.face) {
                    offset.Init(inputs.face, joinType, false);
                } else {
                    offset.InitJoin(joinType, false);
                }
                offset.AddWire(wire);
                offset.Build();
                offset.Perform(inputs.distance, 0.0);
                return offset.IsDone() ? own(offset.Shape()) : undefined;
            }, () => occtFailure("occt.offset.failed"));
            if (made === undefined || made.IsNull()) {
                throw occtFailure("occt.offset.failed");
            }
            return this.converterService.getActualTypeOfShape(made);
        } finally {
            releaseAll();
        }
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
            const result = this.converterService.castAndRelease(extruded);
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

    splitShapeWithShapesWithHistory(inputs: Resolved.OCCT.SplitDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        let made: Models.OCCT.ShapeWithHistories<TopoDS_Shape> | undefined;
        const pieces = this.splitShapeWithShapes(inputs, (builder, parts) => {
            if (parts.length === 0) {
                throw new InputError("`shapes` cut nothing off `shape`, so there are no pieces to follow: give shapes that cut through it.", "shapes");
            }
            const shape = this.converterService.makeCompound({ shapes: parts });
            made = releasedOnError([shape], () => ({ shape, histories: historiesFromKernel(this.occ.HistoryOfBuilder(builder, [inputs.shape, ...inputs.shapes], shape)) }));
        });
        pieces.forEach(piece => piece.delete());
        return made!;
    }

    splitShapeWithShapes(inputs: Resolved.OCCT.SplitDto<TopoDS_Shape>, read?: (builder: BOPAlgo_Builder, pieces: TopoDS_Shape[]) => void): TopoDS_Shape[] {
        checkedShapes(inputs.shapes);
        const bopalgoBuilder = new this.occ.BOPAlgo_Builder();
        bopalgoBuilder.SetNonDestructive(inputs.nonDestructive);
        bopalgoBuilder.SetFuzzyValue(inputs.localFuzzyTolerance);
        bopalgoBuilder.AddArgument(inputs.shape);
        inputs.shapes.forEach(s => {
            bopalgoBuilder.AddArgument(s);
        });
        bopalgoBuilder.Perform();
        let shapes: TopoDS_Shape[];
        if (!inputs.nonDestructive) {
            const res = bopalgoBuilder.Modified(inputs.shape);
            const shapeCompound = this.occ.BitListOfShapesToCompound(res);
            shapes = this.shapeGettersService.getShapesOfCompound({ shape: shapeCompound });
            shapeCompound.delete();
            res.delete();
        } else {
            const res = bopalgoBuilder.Shape();
            shapes = this.shapeGettersService.getShapesOfCompound({ shape: res });
            res.delete();
        }
        if (read) {
            releasedOnError([bopalgoBuilder, ...shapes], () => read(bopalgoBuilder, shapes));
        }
        bopalgoBuilder.delete();
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
        const { own, releaseAll } = kernelObjects();
        try {
            const ax1 = own(this.entitiesService.gpAx1([0, 0, 0], checkedDirection(inputs.direction, "direction")));
            const makeRevol = own(withKernelFailure(this.occ, () => Math.abs(angle) >= 360.0
                ? new this.occ.BRepPrimAPI_MakeRevol(inputs.shape, ax1)
                : new this.occ.BRepPrimAPI_MakeRevol(inputs.shape, ax1, this.base.math.degToRad({ number: angle }), inputs.copy), () => occtFailure("occt.revolve.failed")));
            const made = makeRevol.IsDone() ? own(makeRevol.Shape()) : undefined;
            if (made === undefined || made.IsNull()) {
                throw occtFailure("occt.revolve.failed");
            }
            read?.(makeRevol, made);
            return this.converterService.getActualTypeOfShape(made);
        } finally {
            releaseAll();
        }
    }

    rotatedExtrude(inputs: Resolved.OCCT.RotationExtrudeDto<TopoDS_Shape>, read?: (maker: BRepOffsetAPI_MakePipeShell, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.height === 0) {
            throw new InputError("`height` is 0, so the profile has no length to twist along: give a height other than 0.", "height");
        }
        const { own, releaseAll } = kernelObjects();
        try {
            const outline = this.sweptOutlineOf(inputs.shape);
            const profile = outline === inputs.shape ? outline : own(outline);
            const shapeStartY = this.lowestHeightOf(profile);
            const shapeEndY = shapeStartY + inputs.height;
            const translatedShape = own(this.transformsService.translate({ translation: [0, inputs.height, 0], shape: profile }));
            const upperPolygon = own(this.transformsService.rotate({ axis: [0, 1, 0], angle: inputs.angle, shape: translatedShape }));
            const spineWire = own(this.wiresService.createBSpline({ points: [[0, shapeStartY, 0], [0, shapeEndY, 0]], closed: false }));
            const steps = 30;
            const aspinePoints: Inputs.Base.Point3[] = [];
            for (let i = 0; i <= steps; i++) {
                const alpha = i / steps;
                aspinePoints.push([
                    20 * Math.sin(this.base.math.degToRad({ number: alpha * inputs.angle })),
                    shapeStartY + (inputs.height * alpha),
                    20 * Math.cos(this.base.math.degToRad({ number: alpha * inputs.angle })),
                ]);
            }
            const aspineWire = own(this.wiresService.createBSpline({ points: aspinePoints, closed: false }));
            const pipe = own(new this.occ.BRepOffsetAPI_MakePipeShell(spineWire));
            pipe.SetModeWithAuxSpine(aspineWire, true, this.occ.BRepFill_TypeOfContact.NoContact);
            withKernelFailure(this.occ, () => {
                pipe.Add(profile, false, false);
                pipe.Add(upperPolygon, false, false);
                pipe.Build();
            }, () => occtFailure("occt.pipe.failed"));
            if (!pipe.IsDone()) {
                throw occtFailure("occt.pipe.failed");
            }
            if (inputs.makeSolid) {
                pipe.MakeSolid();
            }
            const pipeShape = own(pipe.Shape());
            read?.(pipe, pipeShape);
            return this.converterService.getActualTypeOfShape(pipeShape);
        } finally {
            releaseAll();
        }
    }

    pipeWithBinormal(spine: TopoDS_Wire, profile: TopoDS_Shape, binormal: Inputs.Base.Vector3): TopoDS_Shape {
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(spine);
        const direction = this.entitiesService.gpDir(binormal);
        try {
            pipe.SetModeDir(direction);
            pipe.Add(profile, false, false);
            pipe.Build();
            if (!pipe.IsDone()) {
                throw occtFailure("occt.pipe.failed");
            }
            pipe.MakeSolid();
            const made = pipe.Shape();
            const result = this.converterService.castAndRelease(made);
            return result;
        } finally {
            direction.delete();
            pipe.delete();
        }
    }

    /**
     * `read`, when given, sees the pipe maker and its result before the maker is released.
     */
    pipe(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Shape>, read?: (maker: BRepOffsetAPI_MakePipeShell, result: TopoDS_Shape) => void): TopoDS_Shape {
        checkedShapes(inputs.shapes);
        const { own, releaseAll } = kernelObjects();
        try {
            const pipe = own(new this.occ.BRepOffsetAPI_MakePipeShell(inputs.shape));
            const profiles = inputs.shapes.map(profile => profile.ShapeType() === this.occ.TopAbs_ShapeEnum.EDGE ? own(this.entitiesService.bRepBuilderAPIMakeWire(profile)) : profile);
            withKernelFailure(this.occ, () => {
                profiles.forEach(profile => pipe.Add(profile, false, false));
                pipe.Build();
            }, () => occtFailure("occt.pipe.failed"));
            if (!pipe.IsDone()) {
                throw occtFailure("occt.pipe.failed");
            }
            pipe.MakeSolid();
            const pipeShape = own(pipe.Shape());
            read?.(pipe, pipeShape);
            return this.converterService.getActualTypeOfShape(pipeShape);
        } finally {
            releaseAll();
        }
    }

    pipePolylineWireNGon(inputs: Resolved.OCCT.PipePolygonWireNGonDto<TopoDS_Wire>, read?: (maker: BRepOffsetAPI_MakePipe, result: TopoDS_Shape) => void): TopoDS_Shape {
        const wire = inputs.shape;
        const { own, releaseAll } = kernelObjects();
        try {
            const edge = own(this.shapeGettersService.getEdge({ shape: wire, index: 0 }));
            const startPoint = this.edgesService.pointOnEdgeAtParam({ shape: edge, param: 0 });
            const tangent = this.edgesService.tangentOnEdgeAtParam({ shape: edge, param: 0 });
            const ngon = own(this.wiresService.createNGonWire({ radius: inputs.radius, center: startPoint, direction: tangent, nrCorners: inputs.nrCorners }));
            const reversedNgon = own(this.wiresService.reversedWire({ shape: ngon }));
            const profile = inputs.makeSolid ? own(this.facesService.createFaceFromWire({ shape: reversedNgon, planar: true })) : reversedNgon;
            const geomFillTrihedron = this.enumService.getGeomFillTrihedronEnumOCCTValue(inputs.trihedronEnum);
            const pipe = own(new this.occ.BRepOffsetAPI_MakePipe(wire, profile, geomFillTrihedron, inputs.forceApproxC1 ? true : false));
            pipe.Build();
            if (!pipe.IsDone()) {
                throw occtFailure("occt.pipe.failed");
            }
            const pipeShape = own(pipe.Shape());
            read?.(pipe, pipeShape);
            return this.validPipe(this.converterService.getActualTypeOfShape(pipeShape), inputs.trihedronEnum);
        } finally {
            releaseAll();
        }
    }

    pipeWireCylindrical(inputs: Resolved.OCCT.PipeWireCylindricalDto<TopoDS_Wire>): TopoDS_Shape {
        const made = tubeOf(this.occ, () => this.occ.PipeCircular(...tubeArguments(inputs, this.enumService)));
        return this.validPipe(this.converterService.castAndRelease(made), inputs.trihedronEnum);
    }

    pipeWireCylindricalWithHistory(inputs: Resolved.OCCT.PipeWireCylindricalDto<TopoDS_Wire>): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
        const made = tubeOf(this.occ, () => this.occ.PipeCircularWithHistory(...tubeArguments(inputs, this.enumService)));
        const shape = this.validPipe(this.converterService.castAndRelease(made.shape), inputs.trihedronEnum);
        return { shape, history: historiesFromKernel(made.histories)[0]! };
    }

    private validPipe(pipe: TopoDS_Shape, trihedron: Inputs.OCCT.geomFillTrihedronEnum): TopoDS_Shape {
        if (!this.occ.ShapeIsValid(pipe)) {
            pipe.delete();
            throw occtFailure("occt.pipe.notValid", { trihedron });
        }
        return pipe;
    }

    pipeWiresCylindrical(inputs: Resolved.OCCT.PipeWiresCylindricalDto<TopoDS_Wire>): TopoDS_Shape[] {
        const { shapes, ...tube } = inputs;
        checkedShapes(shapes);
        return shapes.map(shape => this.pipeWireCylindrical({ ...tube, shape }));
    }

    /**
     * `read`, when given, sees the thick solid maker and its result before the maker is released.
     */
    makeThickSolidSimple(inputs: Resolved.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>, read?: (maker: BRepOffsetAPI_MakeThickSolid, result: TopoDS_Shape) => void): TopoDS_Shape {
        const { own, releaseAll } = kernelObjects();
        try {
            const maker = own(new this.occ.BRepOffsetAPI_MakeThickSolid());
            const made = this.thickSolidOf(maker, () => {
                maker.MakeThickSolidBySimple(inputs.shape, inputs.offset);
                maker.Build();
            }, own);
            const outward = inputs.offset > 0 ? own(made.Reversed()) : made;
            read?.(maker, outward);
            return this.converterService.getActualTypeOfShape(outward);
        } finally {
            releaseAll();
        }
    }

    /**
     * `read`, when given, sees the thick solid maker and its result before the maker is released.
     */
    makeThickSolidByJoin(inputs: Resolved.OCCT.ThickSolidByJoinDto<TopoDS_Shape>, read?: (maker: BRepOffsetAPI_MakeThickSolid, result: TopoDS_Shape) => void): TopoDS_Shape {
        checkedShapes(inputs.shapes);
        const { own, releaseAll } = kernelObjects();
        try {
            const facesToRemove = own(new this.occ.TopTools_ListOfShape());
            inputs.shapes.forEach(shape => facesToRemove.Append(shape));
            const maker = own(new this.occ.BRepOffsetAPI_MakeThickSolid());
            const jointType = this.getJoinType(inputs.joinType);
            const made = this.thickSolidOf(maker, () => maker.MakeThickSolidByJoin(inputs.shape, facesToRemove, inputs.offset, inputs.tolerance, this.occ.BRepOffset_Mode.Skin, inputs.intersection, inputs.selfIntersection, jointType, inputs.removeIntEdges), own);
            read?.(maker, made);
            return this.converterService.getActualTypeOfShape(made);
        } finally {
            releaseAll();
        }
    }

    private thickSolidOf(maker: BRepOffsetAPI_MakeThickSolid, perform: () => void, own: KernelObjects["own"]): TopoDS_Shape {
        const made = withKernelFailure(this.occ, () => {
            perform();
            return maker.IsDone() ? own(maker.Shape()) : undefined;
        }, () => occtFailure("occt.thickSolid.failed"));
        if (made === undefined || isBrokenResult(this.occ, made, true)) {
            throw occtFailure("occt.thickSolid.failed");
        }
        return made;
    }

    private lowestHeightOf(shape: TopoDS_Shape): number {
        const box = new this.occ.Bnd_Box();
        try {
            this.occ.BRepBndLib.Add(shape, box, false);
            if (box.IsVoid()) {
                throw new InputError("`shape` has no geometry to bound, so it has no bounding box.", "shape");
            }
            const corner = box.CornerMin();
            try {
                return corner.Y() + box.GetGap();
            } finally {
                corner.delete();
            }
        } finally {
            box.delete();
        }
    }

    private sweptOutlineOf(shape: TopoDS_Shape): TopoDS_Shape {
        if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.EDGE) {
            return this.entitiesService.bRepBuilderAPIMakeWire(shape);
        }
        if (shape.ShapeType() !== this.occ.TopAbs_ShapeEnum.FACE) {
            return shape;
        }
        const wires = this.shapeGettersService.getWires({ shape: shape });
        if (wires.length === 0) {
            throw new InputError("`shape` is a face without an outline, such as an unbounded plane, and a twisted sweep follows one outline: give a bounded face, or a wire.", "shape");
        }
        if (wires.length !== 1) {
            wires.forEach(wire => wire.delete());
            throw new InputError(`\`shape\` is a face with ${wires.length - 1} hole(s), and a twisted sweep follows one outline: give a face without holes, or its outer wire.`, "shape");
        }
        return wires[0]!;
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
            if ((highest - lowest) / inputs.step > MOST_SLICES) {
                throw tooManySlices("step");
            }
            for (let level = lowest; level < highest; level += inputs.step) {
                if (levels.length === MOST_SLICES) {
                    throw tooManySlices("step");
                }
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
                if (levels.length === MOST_SLICES) {
                    throw tooManySlices("steps");
                }
                levels.push(level);
                index = inputs.steps[index + 1] === undefined ? 0 : index + 1;
            }
            return levels;
        });
    }

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
