import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Wire, Geom_Surface, Handle_Geom_Surface } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type { Base } from "../../api/inputs";
import type { ShapeGettersService } from "./shape-getters";
import type { EntitiesService } from "./entities.service";
import type { EnumService } from "./enum.service";
import type { WiresService } from "./wires.service";
import type { BooleansService } from "./booleans.service";
import type { ConverterService } from "./converter.service";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import { occtFailure } from "../../kernel-failures";
import { coordinatesOf, massesAndCentres, pointsFromCoordinates } from "./kernel-arrays";
import { checkedNumber, checkedNumberList, checkedShape, checkedShapes, checkedWithin } from "./input-checks";
import { withKernelErrorsRead, withKernelRefusals } from "./kernel-refusals";
import { release, released, releasedOnError } from "./release";
import { add3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

const FACE_REFUSAL = /(?:^|\s)(?:MakeFaceFromWires(?:OnFace)?|MakeFaceFromFaceSurfaceAndWires): (.*)$/;

export class FacesService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly entitiesService: EntitiesService,
        private readonly enumService: EnumService,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly converterService: ConverterService,
        public booleansService: BooleansService,
        private readonly wiresService: WiresService,
        private readonly base: BaseBitByBit,
    ) { }

    createFaceFromWireOnFace(inputs: Resolved.OCCT.FaceFromWireOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        const result = this.entitiesService.bRepBuilderAPIMakeFaceFromWireOnFace(inputs.face, inputs.wire, inputs.inside);
        return result;
    }

    createFacesFromWiresOnFace(inputs: Resolved.OCCT.FacesFromWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face[] {
        checkedShape(inputs.face, "face");
        this.checkedWires(inputs.wires, "wires");
        const result = this.entitiesService.bRepBuilderAPIMakeFacesFromWiresOnFace(inputs.face, inputs.wires, inputs.inside);
        return result;
    }

    createFaceFromWire(inputs: Resolved.OCCT.FaceFromWireDto<TopoDS_Wire>): TopoDS_Face {
        let result: TopoDS_Face;
        if (this.enumService.getShapeTypeEnum(inputs.shape) !== Inputs.OCCT.shapeTypeEnum.wire) {
            throw new InputError("Provided input shape is not a wire", "shape");
        }
        if (inputs.planar) {
            const wire = this.occ.CastToWire(inputs.shape);
            try {
                result = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, inputs.planar);
            } finally {
                wire.delete();
            }
        } else {
            const wire = this.occ.CastToWire(inputs.shape);
            const filling = releasedOnError([wire], () => new this.occ.BRepFill_Filling());
            result = released([filling, wire], () => withKernelErrorsRead(this.occ, () => {
                const edges = this.shapeGettersService.getEdges({ shape: wire });
                released(edges, () => edges.forEach(edge => this.occ.BRepFill_Filling_AddEdge(filling, edge, 0, true)));
                this.occ.BRepFill_Filling_Build(filling);
                if (!this.occ.BRepFill_Filling_IsDone(filling)) {
                    throw new Error("BRepFill_Filling failed to create face from wire");
                }
                return this.occ.BRepFill_Filling_Face(filling);
            }));
        }

        return result;
    }



    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return massesAndCentres(this.occ.SurfacePropertiesOfEach([inputs.shape]))[0]!.mass;
    }

    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        checkedShapes(inputs.shapes);
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return massesAndCentres(this.occ.SurfacePropertiesOfEach(inputs.shapes)).map(properties => properties.mass);
    }

    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        return massesAndCentres(this.occ.SurfacePropertiesOfEach([inputs.shape]))[0]!.centre;
    }

    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
        checkedShapes(inputs.shapes);
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return massesAndCentres(this.occ.SurfacePropertiesOfEach(inputs.shapes)).map(properties => properties.centre);
    }

    filterFacePoints(inputs: Resolved.OCCT.FilterFacePointsDto<TopoDS_Face>): Base.Point3[] {
        const face = inputs.shape;
        const points = inputs.points;
        const tolerance = inputs.tolerance;
        const keepOn = inputs.keepOn !== false;
        const keepIn = inputs.keepIn !== false;
        const keepOut = inputs.keepOut === true;
        const keepUnknown = inputs.keepUnknown === true;
        const bounds = inputs.useBndBox ? this.enlargedBoundingBox(face, inputs.gapTolerance) : undefined;

        const outside = (pt: Base.Point3): boolean => bounds !== undefined && this.isOutsideBounds(bounds, pt);
        const classified = points.filter(pt => !outside(pt));
        const states = this.occ.ClassifyPointsOnFace(face, coordinatesOf(classified), tolerance);
        const kept = (state: number): boolean => (state === 0 && keepIn) || (state === 1 && keepOut) || (state === 2 && keepOn) || (state === 3 && keepUnknown);
        let next = 0;
        return points.filter(pt => outside(pt) ? keepOut : kept(states[next++]!));
    }

    private enlargedBoundingBox(shape: TopoDS_Shape, gap: number): { min: Base.Point3, max: Base.Point3 } | undefined {
        const box = this.occ.BoundingBoxOf(shape);
        if (box.length < 6) {
            return undefined;
        }
        const reach: Base.Vector3 = [gap, gap, gap];
        return { min: subtract3([box[0]!, box[1]!, box[2]!], reach), max: add3([box[3]!, box[4]!, box[5]!], reach) };
    }

    private isOutsideBounds(bounds: { min: Base.Point3, max: Base.Point3 }, pt: Base.Point3): boolean {
        return pt.some((coordinate, axis) => coordinate < bounds.min[axis]! || coordinate > bounds.max[axis]!);
    }


    createSquareFace(inputs: Resolved.OCCT.SquareDto): TopoDS_Face {
        const squareWire = this.wiresService.createSquareWire(inputs);
        const faceMakerFromWire = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(squareWire, true);
        squareWire.delete();
        return faceMakerFromWire;
    }

    createRectangleFace(inputs: Resolved.OCCT.RectangleDto): TopoDS_Face {
        const rectangleWire = this.wiresService.createRectangleWire(inputs);
        const faceMakerFromWire = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(rectangleWire, true);
        rectangleWire.delete();
        return faceMakerFromWire;
    }

    createFaceFromMultipleCircleTanWires(inputs: Resolved.OCCT.FaceFromMultipleCircleTanWiresDto<TopoDS_Wire>): TopoDS_Shape {
        const circleWires = inputs.circles;
        const faces: TopoDS_Face[] = [];
        return releasedOnError(faces, () => {
            if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.allWithAll) {
                for (let i = 0; i < circleWires.length; i++) {
                    for (let j = i + 1; j < circleWires.length; j++) {
                        const wire = this.tangentWireBetween(circleWires[i]!, circleWires[j]!, inputs.tolerance, "circles", `at position ${i}`, `at position ${j}`);
                        faces.push(this.faceOfTangentWire(wire));
                    }
                }
            } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrder) {
                for (let i = 0; i < circleWires.length - 1; i++) {
                    const wire = this.tangentWireBetween(circleWires[i]!, circleWires[i + 1]!, inputs.tolerance, "circles", `at position ${i}`, `at position ${i + 1}`);
                    faces.push(this.faceOfTangentWire(wire));
                }
            } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrderClosed) {
                for (let i = 0; i < circleWires.length; i++) {
                    const next = (i + 1) % circleWires.length;
                    const wire = this.tangentWireBetween(circleWires[i]!, circleWires[next]!, inputs.tolerance, "circles", `at position ${i}`, `at position ${next}`);
                    faces.push(this.faceOfTangentWire(wire));
                }
            }
            return this.joinedFaces(faces, inputs.unify);
        });
    }

    createFaceFromMultipleCircleTanWireCollections(inputs: Resolved.OCCT.FaceFromMultipleCircleTanWireCollectionsDto<TopoDS_Wire>): TopoDS_Shape {
        const listsOfCircles = inputs.listsOfCircles;

        const faces: TopoDS_Face[] = [];
        return releasedOnError(faces, () => {
            if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.allWithAll) {
                for (let i = 0; i < listsOfCircles.length; i++) {
                    const currentCirclesList = listsOfCircles[i]!;
                    const nextCirclesList = listsOfCircles[(i + 1)];
                    if (nextCirclesList) {
                        for (let j = 0; j < currentCirclesList.length; j++) {
                            for (let k = 0; k < nextCirclesList.length; k++) {
                                const wire = this.tangentWireBetween(currentCirclesList[j]!, nextCirclesList[k]!, inputs.tolerance, "listsOfCircles", `at list ${i}, position ${j}`, `at list ${i + 1}, position ${k}`);
                                faces.push(this.faceOfTangentWire(wire));
                            }
                        }
                    } else {
                        break;
                    }
                }
            } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrder) {
                for (let i = 0; i < listsOfCircles.length; i++) {
                    if (listsOfCircles[i]!.length !== listsOfCircles[0]!.length) {
                        throw new Error("All lists of circles must have the same length in order to use inOrder strategy.");
                    }
                }
                for (let i = 0; i < listsOfCircles.length - 1; i++) {
                    for (let j = 0; j < listsOfCircles[i]!.length; j++) {
                        const wire = this.tangentWireBetween(listsOfCircles[i]![j]!, listsOfCircles[i + 1]![j]!, inputs.tolerance, "listsOfCircles", `at list ${i}, position ${j}`, `at list ${i + 1}, position ${j}`);
                        faces.push(this.faceOfTangentWire(wire));
                    }
                }
            } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrderClosed) {
                for (let i = 0; i < listsOfCircles.length; i++) {
                    if (listsOfCircles[i]!.length !== listsOfCircles[0]!.length) {
                        throw new Error("All lists of circles must have the same length in order to use inOrderClosed strategy.");
                    }
                }
                for (let i = 0; i < listsOfCircles.length - 1; i++) {
                    for (let j = 0; j < listsOfCircles[i]!.length; j++) {
                        const wire = this.tangentWireBetween(listsOfCircles[i]![j]!, listsOfCircles[i + 1]![j]!, inputs.tolerance, "listsOfCircles", `at list ${i}, position ${j}`, `at list ${i + 1}, position ${j}`);
                        faces.push(this.faceOfTangentWire(wire));
                    }
                }
                for (let i = 0; i < listsOfCircles.length; i++) {
                    for (let j = 0; j < listsOfCircles[i]!.length; j++) {
                        const next = (j + 1) % listsOfCircles[i]!.length;
                        const wire = this.tangentWireBetween(listsOfCircles[i]![j]!, listsOfCircles[i]![next]!, inputs.tolerance, "listsOfCircles", `at list ${i}, position ${j}`, `at list ${i}, position ${next}`);
                        faces.push(this.faceOfTangentWire(wire));
                    }
                }
            }
            return this.joinedFaces(faces, inputs.unify);
        });
    }

    private checkedWires(shapes: unknown, property: string): void {
        const checked = checkedShapes(shapes, property);
        const notAWire = checked.findIndex(shape => this.enumService.getShapeTypeEnum(shape) !== Inputs.OCCT.shapeTypeEnum.wire);
        if (notAWire !== -1) {
            throw new InputError(`\`${property}\` holds something other than a wire at position ${notAWire}; each is a wire.`, property);
        }
    }

    private tangentWireBetween(circle1: TopoDS_Wire, circle2: TopoDS_Wire, tolerance: number, property: string, first: string, second: string): TopoDS_Wire {
        try {
            return this.wiresService.createWireFromTwoCirclesTan({
                circle1,
                circle2,
                keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                tolerance,
            });
        } catch (error) {
            if (error instanceof InputError && (error.property === "circle1" || error.property === "circle2")) {
                throw new InputError(error.message.replace("`circle1`", `\`${property}\` ${first}`).replace("`circle2`", `\`${property}\` ${second}`), property);
            }
            throw error;
        }
    }

    private faceOfTangentWire(wire: TopoDS_Wire): TopoDS_Face {
        return released([wire], () => this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true));
    }

    private joinedFaces(faces: TopoDS_Face[], unify: boolean): TopoDS_Shape {
        const result = unify
            ? this.booleansService.union({ shapes: faces, keepEdges: false, strategy: Inputs.OCCT.booleanStrategyEnum.oneAfterAnother })
            : this.converterService.makeCompound({ shapes: faces });
        faces.filter(face => face !== result).forEach(release);
        return result;
    }

    faceNormalOnUV(inputs: Resolved.OCCT.DataOnUVDto<TopoDS_Face>): Base.Vector3 {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        return this.surfaceNormalsAt(face, [uMin + (uMax - uMin) * inputs.paramU, vMin + (vMax - vMin) * inputs.paramV])[0]!;
    }

    getUVBounds(face: TopoDS_Face): { uMin: number, uMax: number, vMin: number, vMax: number } {
        const result = this.occ.GetFaceUVBounds(face);
        return result.IsValid
            ? { uMin: result.UMin, uMax: result.UMax, vMin: result.VMin, vMax: result.VMax }
            : { uMin: 0, uMax: 0, vMin: 0, vMax: 0 };
    }

    createFaceFromWires(inputs: Resolved.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face {
        checkedShapes(inputs.shapes);
        return this.boundedFace("shapes", () => this.entitiesService.bRepBuilderAPIMakeFaceFromWires(inputs.shapes, inputs.planar));
    }

    createFaceFromWiresOnFace(inputs: Resolved.OCCT.FaceFromWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        checkedShapes(inputs.wires, "wires");
        checkedShape(inputs.face, "face");
        return this.boundedFace("wires", () => this.entitiesService.bRepBuilderAPIMakeFaceFromWires(inputs.wires, false, inputs.face, inputs.inside));
    }

    private boundedFace(property: string, make: () => TopoDS_Face): TopoDS_Face {
        return withKernelRefusals(this.occ, make, message => {
            const refusal = FACE_REFUSAL.exec(message);
            return refusal === null ? undefined : new InputError(`\`${property}\` cannot bound one face: ${refusal[1]!}.`, property);
        });
    }

    createFaceBoundedByWiresOnFace(inputs: Resolved.OCCT.FaceBoundedByWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        const face = checkedShape(inputs.face, "face");
        const wires = checkedShapes(inputs.wires, "wires");
        return this.boundedFace("wires", () => this.occ.MakeFaceFromFaceSurfaceAndWires(face, wires));
    }

    faceFromSurface(inputs: Resolved.OCCT.ShapeWithToleranceDto<Geom_Surface>): TopoDS_Face {
        return this.occ.MakeFaceFromSurface(inputs.shape, inputs.tolerance);
    }

    faceFromSurfaceAndWire(inputs: Resolved.OCCT.FaceFromSurfaceAndWireDto<Geom_Surface, TopoDS_Wire>): TopoDS_Face {
        return this.occ.MakeFaceFromSurfaceAndWire(inputs.surface, inputs.wire, inputs.inside);
    }

    createFacesFromWires(inputs: Resolved.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face[] {
        this.checkedWires(inputs.shapes, "shapes");
        const faces: TopoDS_Face[] = [];
        return releasedOnError(faces, () => {
            inputs.shapes.forEach(shape => faces.push(this.createFaceFromWire({ shape, planar: inputs.planar })));
            return faces;
        });
    }

    getUMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { uMin } = this.getUVBounds(face);
        return uMin;
    }

    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { uMax } = this.getUVBounds(face);
        return uMax;
    }

    getVMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { vMin } = this.getUVBounds(face);
        return vMin;
    }

    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const face = inputs.shape;
        const { vMax } = this.getUVBounds(face);
        return vMax;
    }

    subdivideToPointsControlled(inputs: Resolved.OCCT.FaceSubdivisionControlledDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const uv: number[] = [];

        for (let i = 0; i < inputs.nrDivisionsU; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;

            for (let j = 0; j < inputs.nrDivisionsV; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                let v = vMin + stepsV;
                v += (inputs.shiftHalfStepNthV && (i + inputs.shiftHalfStepVOffsetN) % inputs.shiftHalfStepNthV === 0) ? halfStepV : 0;
                let u = uMin + stepsU;
                u += (inputs.shiftHalfStepNthU && (j + inputs.shiftHalfStepUOffsetN) % inputs.shiftHalfStepNthU === 0) ? halfStepU : 0;

                let shouldPush = true;
                if (i === 0 && inputs.removeStartEdgeNthU && (j + inputs.removeStartEdgeUOffsetN) % inputs.removeStartEdgeNthU === 0) {
                    shouldPush = false;
                } else if (i === inputs.nrDivisionsU - 1 && inputs.removeEndEdgeNthU && (j + inputs.removeEndEdgeUOffsetN) % inputs.removeEndEdgeNthU === 0) {
                    shouldPush = false;
                } else if (j === 0 && inputs.removeStartEdgeNthV && (i + inputs.removeStartEdgeVOffsetN) % inputs.removeStartEdgeNthV === 0) {
                    shouldPush = false;
                } else if (j === inputs.nrDivisionsV - 1 && inputs.removeEndEdgeNthV && (i + inputs.removeEndEdgeVOffsetN) % inputs.removeEndEdgeNthV === 0) {
                    shouldPush = false;
                }
                if (shouldPush) {
                    uv.push(u, v);
                }
            }
        }
        return this.surfacePointsAt(face, uv);
    }

    subdivideToPoints(inputs: Resolved.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const uv: number[] = [];

        const uStartRemoval = inputs.removeStartEdgeU ? 1 : 0;
        const uEndRemoval = inputs.removeEndEdgeU ? 1 : 0;

        const vStartRemoval = inputs.removeStartEdgeV ? 1 : 0;
        const vEndRemoval = inputs.removeEndEdgeV ? 1 : 0;

        for (let i = 0 + uStartRemoval; i < inputs.nrDivisionsU - uEndRemoval; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;
            const u = uMin + (inputs.shiftHalfStepU ? halfStepU : 0) + stepsU;
            for (let j = 0 + vStartRemoval; j < inputs.nrDivisionsV - vEndRemoval; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                const v = vMin + (inputs.shiftHalfStepV ? halfStepV : 0) + stepsV;
                uv.push(u, v);
            }
        }
        return this.surfacePointsAt(face, uv);
    }

    subdivideToWires(inputs: Resolved.OCCT.FaceSubdivisionToWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const nrDivisions = checkedNumber(inputs.nrDivisions, "nrDivisions", 1);
        const params: number[] = [];
        const step = 1 / nrDivisions;
        for (let i = 0; i <= nrDivisions; i++) {
            const p = step * i;
            params.push(p);
        }

        if (inputs.removeStart) {
            params.shift();
        }
        if (inputs.removeEnd) {
            params.pop();
        }

        if (inputs.shiftHalfStep) {
            const halfStep = step / 2;
            params.forEach((_p, i) => {
                params[i] = params[i]! + halfStep;
            });
        }

        return this.wiresAlongFaceParams(inputs.shape, inputs.isU, params);
    }

    subdivideToRectangleWires(inputs: Resolved.OCCT.FaceSubdivideToRectangleWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);

        const paramsU = [];
        const stepU = (1 - inputs.offsetFromBorderU * 2) / inputs.nrRectanglesU;
        const halfStepU = stepU / 2;

        for (let i = 0; i < inputs.nrRectanglesU; i++) {
            const pU = stepU * i + halfStepU + inputs.offsetFromBorderU;
            paramsU.push(pU);
        }

        const paramsV = [];
        const stepV = (1 - inputs.offsetFromBorderV * 2) / inputs.nrRectanglesV;
        const halfStepV = stepV / 2;

        for (let i = 0; i < inputs.nrRectanglesV; i++) {
            const pV = stepV * i + halfStepV + inputs.offsetFromBorderV;
            paramsV.push(pV);
        }

        let unitLengths: { alongU: number, alongV: number } | undefined;
        const scaleU = (uMax - uMin);
        const scaleV = (vMax - vMin);
        const outlines = new OutlineList();

        let currentScalePatternUIndex = 0;
        let currentScalePatternVIndex = 0;
        let currentInclusionPatternIndex = 0;
        let currentFilletPatternIndex = 0;

        for (let i = 0; i < paramsU.length; i++) {
            for (let j = 0; j < paramsV.length; j++) {

                let scaleFromPatternU = 1;
                if (inputs.scalePatternU && inputs.scalePatternU.length > 0) {
                    scaleFromPatternU = inputs.scalePatternU[currentScalePatternUIndex] ?? 1;
                    currentScalePatternUIndex++;
                    if (currentScalePatternUIndex >= inputs.scalePatternU.length) {
                        currentScalePatternUIndex = 0;
                    }
                }

                let scaleFromPatternV = 1;
                if (inputs.scalePatternV && inputs.scalePatternV.length > 0) {
                    scaleFromPatternV = inputs.scalePatternV[currentScalePatternVIndex] ?? 1;
                    currentScalePatternVIndex++;
                    if (currentScalePatternVIndex >= inputs.scalePatternV.length) {
                        currentScalePatternVIndex = 0;
                    }
                }
                let include = true;
                if (inputs.inclusionPattern && inputs.inclusionPattern.length > 0) {
                    include = inputs.inclusionPattern[currentInclusionPatternIndex] ?? true;
                    currentInclusionPatternIndex++;
                    if (currentInclusionPatternIndex >= inputs.inclusionPattern.length) {
                        currentInclusionPatternIndex = 0;
                    }
                }

                let filletFactor = 0;
                if (inputs.filletPattern && inputs.filletPattern.length > 0) {
                    filletFactor = inputs.filletPattern[currentFilletPatternIndex] ?? 0;
                    currentFilletPatternIndex++;
                    if (currentFilletPatternIndex >= inputs.filletPattern.length) {
                        currentFilletPatternIndex = 0;
                    }
                }

                if (include && scaleFromPatternU > 0 && scaleFromPatternV > 0) {
                    const width = stepV * scaleFromPatternV;
                    const length = stepU * scaleFromPatternU;
                    const shiftU = paramsU[i]! * scaleU + uMin;
                    const shiftV = paramsV[j]! * scaleV + vMin;
                    if (filletFactor > 0) {
                        unitLengths ??= this.unitParameterLengths(face);
                        const halfU = length * scaleU * unitLengths.alongU / 2;
                        const halfV = width * scaleV * unitLengths.alongV / 2;
                        outlines.add(this.rectangleCorners(halfU, halfV), Math.min(halfU, halfV) * filletFactor,
                            1 / unitLengths.alongU, 1 / unitLengths.alongV, shiftU, shiftV);
                    } else {
                        outlines.add(this.rectangleCorners(length * scaleU / 2, width * scaleV / 2), 0, 1, 1, shiftU, shiftV);
                    }
                }
            }
        }
        return this.outlinesOnFace(face, outlines);
    }

    subdivideToRectangleHoles(inputs: Resolved.OCCT.FaceSubdivideToRectangleHolesDto<TopoDS_Face>): TopoDS_Face[] {
        const wires = this.subdivideToRectangleWires({
            ...inputs,
            scalePatternU: inputs.scalePatternU ?? [0.5],
            scalePatternV: inputs.scalePatternV ?? [0.5],
        });
        return this.cutOutlines(inputs.shape, wires, inputs.holesToFaces);
    }


    subdivideToHexagonWires(inputs: Inputs.OCCT.FaceSubdivideToHexagonWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        const resolved = resolveDto(Inputs.OCCT.FaceSubdivideToHexagonWiresDto, inputs) as Resolved.OCCT.FaceSubdivideToHexagonWiresDto<TopoDS_Face>;
        if (resolved.shape === undefined) {
            throw new Error("Face not defined");
        }
        const face = resolved.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);

        const scaleU = uMax - uMin;
        const scaleV = vMax - vMin;

        if (scaleU <= 0 || scaleV <= 0) {
            console.warn("Face has zero or negative parametric range. Skipping.");
            return [];
        }

        const offsetFromBorderU = resolved.offsetFromBorderU;
        const offsetFromBorderV = resolved.offsetFromBorderV;
        const gridHeightU = scaleU * (1 - offsetFromBorderU * 2);
        const gridWidthV = scaleV * (1 - offsetFromBorderV * 2);

        const gridOriginU = uMin + scaleU * offsetFromBorderU;
        const gridOriginV = vMin + scaleV * offsetFromBorderV;

        if (gridHeightU <= 0 || gridWidthV <= 0) {
            console.warn("Grid dimensions are zero or negative after applying offset. Skipping.");
            return [];
        }

        const hex = this.base.point.hexGridScaledToFit({
            width: gridWidthV,
            height: gridHeightU,
            nrHexagonsInHeight: resolved.nrHexagonsU,
            nrHexagonsInWidth: resolved.nrHexagonsV,
            centerGrid: false,
            pointsOnGround: true,
            flatTop: resolved.flatU,
            extendTop: resolved.extendUUp,
            extendBottom: resolved.extendUBottom,
            extendLeft: resolved.extendVBottom,
            extendRight: resolved.extendVUp,
        });

        const nrHexagonsU = resolved.nrHexagonsU;
        const nrHexagonsV = resolved.nrHexagonsV;

        const outlines = new OutlineList();
        let currentScalePatternUIndex = 0;
        let currentScalePatternVIndex = 0;
        let currentInclusionPatternIndex = 0;
        let currentFilletPatternIndex = 0;

        for (let i = 0; i < nrHexagonsU; i++) {
            for (let j = 0; j < nrHexagonsV; j++) {
                const hexIndex = i * nrHexagonsV + j;

                let scaleFromPatternU = 1;
                if (resolved.scalePatternU && resolved.scalePatternU.length > 0) {
                    scaleFromPatternU = resolved.scalePatternU[currentScalePatternUIndex % resolved.scalePatternU.length]!;
                    currentScalePatternUIndex++;
                }

                let scaleFromPatternV = 1;
                if (resolved.scalePatternV && resolved.scalePatternV.length > 0) {
                    scaleFromPatternV = resolved.scalePatternV[currentScalePatternVIndex % resolved.scalePatternV.length]!;
                    currentScalePatternVIndex++;
                }

                let include = true;
                if (resolved.inclusionPattern && resolved.inclusionPattern.length > 0) {
                    include = resolved.inclusionPattern[currentInclusionPatternIndex % resolved.inclusionPattern.length]!;
                    currentInclusionPatternIndex++;
                }

                let filletFactor = 0;
                if (resolved.filletPattern && resolved.filletPattern.length > 0) {
                    filletFactor = resolved.filletPattern[currentFilletPatternIndex % resolved.filletPattern.length]!;
                    currentFilletPatternIndex++;
                }

                if (include && scaleFromPatternU > 0 && scaleFromPatternV > 0) {
                    const center = hex.centers[hexIndex]!;
                    const corners = hex.hexagons[hexIndex]!.flatMap(point => [point[2] - center[2], point[0] - center[0]]);
                    const filletRadius = (hex.maxFilletRadius ?? 0) * filletFactor;
                    outlines.add(corners, filletRadius > 1e-6 ? filletRadius : 0, scaleFromPatternU, scaleFromPatternV,
                        center[2] + gridOriginU, center[0] + gridOriginV);
                }
            }
        }
        return this.outlinesOnFace(face, outlines);
    }

    subdivideToHexagonHoles(inputs: Resolved.OCCT.FaceSubdivideToHexagonHolesDto<TopoDS_Face>): TopoDS_Wire[] {
        const wires = this.subdivideToHexagonWires({
            ...inputs,
            scalePatternU: inputs.scalePatternU ?? [0.5],
            scalePatternV: inputs.scalePatternV ?? [0.5],
        });
        return this.cutOutlines(inputs.shape, wires, inputs.holesToFaces);
    }

    subdivideToNormals(inputs: Resolved.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Vector3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const uv: number[] = [];

        const uStartRemoval = inputs.removeStartEdgeU ? 1 : 0;
        const uEndRemoval = inputs.removeEndEdgeU ? 1 : 0;

        const vStartRemoval = inputs.removeStartEdgeV ? 1 : 0;
        const vEndRemoval = inputs.removeEndEdgeV ? 1 : 0;

        for (let i = 0 + uStartRemoval; i < inputs.nrDivisionsU - uEndRemoval; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;
            const u = uMin + (inputs.shiftHalfStepU ? halfStepU : 0) + stepsU;
            for (let j = 0 + vStartRemoval; j < inputs.nrDivisionsV - vEndRemoval; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                const v = vMin + (inputs.shiftHalfStepV ? halfStepV : 0) + stepsV;
                uv.push(u, v);
            }
        }
        return this.surfaceNormalsAt(face, uv);
    }

    wireAlongParam(inputs: Resolved.OCCT.WireAlongParamDto<TopoDS_Face>): TopoDS_Wire {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        return this.wiresAlongFaceParams(inputs.shape, inputs.isU, [checkedWithin(inputs.param, "param", {})])[0]!;
    }

    private wiresAlongFaceParams(face: TopoDS_Face, isU: boolean, params: readonly number[]): TopoDS_Wire[] {
        const handle = this.occ.BRep_Tool_Surface(face);
        const wires: TopoDS_Wire[] = [];
        return released([handle], () => releasedOnError(wires, () => {
            const surface = this.surfaceOf(handle);
            const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
            params.forEach(param => wires.push(this.placeWireOnParamSurface(isU, param, uMin, uMax, vMin, vMax, surface)));
            return wires;
        }));
    }

    private placeWireOnParamSurface(isU: boolean, param: number, uMin: number, uMax: number, vMin: number, vMax: number, surface: Geom_Surface) {
        let paramToUse: number;

        let wire;
        if (isU) {
            paramToUse = uMin + (uMax - uMin) * param;
            wire = this.wiresService.createLineWire({
                start: [vMin, 0, paramToUse],
                end: [vMax, 0, paramToUse],
            });
        } else {
            paramToUse = vMin + (vMax - vMin) * param;
            wire = this.wiresService.createLineWire({
                start: [paramToUse, 0, uMin],
                end: [paramToUse, 0, uMax],
            });
        }

        return released([wire], () => this.wiresService.placeWire(wire, surface));
    }

    wiresAlongParams(inputs: Resolved.OCCT.WiresAlongParamsDto<TopoDS_Face>): TopoDS_Wire[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        return this.wiresAlongFaceParams(inputs.shape, inputs.isU, checkedNumberList(inputs.params, "params"));
    }

    subdivideToPointsOnParam(inputs: Resolved.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const uv: number[] = [];
        const removeStart = inputs.removeStartPoint ? 1 : 0;
        const removeEnd = inputs.removeEndPoint ? 1 : 0;

        let param = inputs.param;

        if (inputs.isU) {
            param = uMin + (uMax - uMin) * param;
        } else {
            param = vMin + (vMax - vMin) * param;
        }
        for (let j = 0 + removeStart; j < inputs.nrPoints - removeEnd; j++) {
            let p;
            if (inputs.isU) {
                const stepV = (vMax - vMin) / (inputs.nrPoints - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                p = vMin + (inputs.shiftHalfStep ? halfStepV : 0) + stepsV;
            } else {
                const stepU = (uMax - uMin) / (inputs.nrPoints - 1);
                const halfStepU = stepU / 2;
                const stepsU = stepU * j;
                p = uMin + (inputs.shiftHalfStep ? halfStepU : 0) + stepsU;
            }
            if (inputs.isU) {
                uv.push(param, p);
            } else {
                uv.push(p, param);
            }
        }
        return this.surfacePointsAt(face, uv);
    }

    subdivideToUVOnParam(inputs: Resolved.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const uvs: Base.Point2[] = [];
        const removeStart = inputs.removeStartPoint ? 1 : 0;
        const removeEnd = inputs.removeEndPoint ? 1 : 0;

        let param = inputs.param;
        if (inputs.isU) {
            param = uMin + (uMax - uMin) * param;
        } else {
            param = vMin + (vMax - vMin) * param;
        }
        for (let j = 0 + removeStart; j < inputs.nrPoints - removeEnd; j++) {
            let p;
            if (inputs.isU) {
                const stepV = (vMax - vMin) / (inputs.nrPoints - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                p = vMin + (inputs.shiftHalfStep ? halfStepV : 0) + stepsV;
            } else {
                const stepU = (uMax - uMin) / (inputs.nrPoints - 1);
                const halfStepU = stepU / 2;
                const stepsU = stepU * j;
                p = uMin + (inputs.shiftHalfStep ? halfStepU : 0) + stepsU;
            }
            let uv: Inputs.Base.Point2;
            if (inputs.isU) {
                uv = [param, p];
            } else {
                uv = [p, param];
            }
            uvs.push(uv);
        }
        return uvs;
    }

    subdivideToUV(inputs: Resolved.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);

        const uvs: Base.Point2[] = [];

        const uStartRemoval = inputs.removeStartEdgeU ? 1 : 0;
        const uEndRemoval = inputs.removeEndEdgeU ? 1 : 0;

        const vStartRemoval = inputs.removeStartEdgeV ? 1 : 0;
        const vEndRemoval = inputs.removeEndEdgeV ? 1 : 0;

        for (let i = 0 + uStartRemoval; i < inputs.nrDivisionsU - uEndRemoval; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;
            const u = uMin + (inputs.shiftHalfStepU ? halfStepU : 0) + stepsU;
            for (let j = 0 + vStartRemoval; j < inputs.nrDivisionsV - vEndRemoval; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                const v = vMin + (inputs.shiftHalfStepV ? halfStepV : 0) + stepsV;
                uvs.push([u, v]);
            }
        }
        return uvs;
    }

    uvOnFace(inputs: Resolved.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point2 {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const u = uMin + (uMax - uMin) * inputs.paramU;
        const v = vMin + (vMax - vMin) * inputs.paramV;
        return [u, v];
    }

    pointsOnUVs(inputs: Resolved.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Point3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        return this.surfacePointsAt(inputs.shape, this.parametersOf(inputs.shape, inputs.paramsUV));
    }

    normalsOnUVs(inputs: Resolved.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Vector3[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        return this.surfaceNormalsAt(inputs.shape, this.parametersOf(inputs.shape, inputs.paramsUV));
    }

    pointOnUV(inputs: Resolved.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point3 {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        return this.surfacePointsAt(inputs.shape, this.parametersOf(inputs.shape, [[inputs.paramU, inputs.paramV]]))[0]!;
    }

    normalOnUV(inputs: Resolved.OCCT.DataOnUVDto<TopoDS_Face>): Base.Vector3 {
        return this.faceNormalOnUV(inputs);
    }

    createPolygonFace(inputs: Inputs.OCCT.PolygonDto) {
        const wire = this.wiresService.createPolygonWire(inputs);
        const result = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, false);
        wire.delete();
        return result;
    }

    private rectangleCorners(halfU: number, halfV: number): number[] {
        return [-halfU, halfV, -halfU, -halfV, halfU, -halfV, halfU, halfV];
    }

    private unitParameterLengths(face: TopoDS_Face): { alongU: number, alongV: number } {
        const handle = this.occ.BRep_Tool_Surface(face);
        return released([handle], () => {
            const surface = this.surfaceOf(handle);
            const lengthAlong = (end: Base.Point3): number => {
                const line = this.wiresService.createLineWire({ start: [0, 0, 0], end });
                const placed = released([line], () => this.wiresService.placeWire(line, surface));
                return released([placed], () => this.wiresService.getWireLength({ shape: placed }));
            };
            return { alongU: lengthAlong([0, 0, 1]), alongV: lengthAlong([1, 0, 0]) };
        });
    }

    private outlinesOnFace(face: TopoDS_Face, outlines: OutlineList): TopoDS_Wire[] {
        const wires = this.occ.OutlinesOnFace(face, outlines.counts, outlines.corners, outlines.placements);
        if (wires === null) {
            throw occtFailure("occt.fillet.failed");
        }
        return wires;
    }

    private cutOutlines(face: TopoDS_Face, wires: TopoDS_Wire[], holesToFaces: boolean): TopoDS_Face[] {
        const holed = this.occ.FaceWithHoles(face, wires);
        const cells = holesToFaces ? this.occ.FacesInsideWires(face, wires) : [];
        wires.forEach(wire => wire.delete());
        return [holed, ...cells];
    }

    private parametersOf(face: TopoDS_Face, fractions: Base.Point2[]): number[] {
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        return fractions.flatMap(([u, v]) => [uMin + (uMax - uMin) * u, vMin + (vMax - vMin) * v]);
    }

    private surfacePointsAt(face: TopoDS_Face, parameters: number[]): Base.Point3[] {
        const coordinates = this.occ.FacePointsAtUV(face, parameters);
        if (coordinates === null) {
            throw new Error("Face has no surface");
        }
        return pointsFromCoordinates(coordinates);
    }

    private surfaceNormalsAt(face: TopoDS_Face, parameters: number[]): Base.Vector3[] {
        const coordinates = this.occ.FaceNormalsAtUV(face, parameters);
        if (coordinates === null) {
            throw new Error("Face has no surface");
        }
        return pointsFromCoordinates(coordinates);
    }

    private surfaceOf(handle: Handle_Geom_Surface): Geom_Surface {
        const surface = handle.get();
        if (!surface) {
            throw new Error("Face has no surface");
        }
        return surface;
    }
}

class OutlineList {
    readonly counts: number[] = [];
    readonly corners: number[] = [];
    readonly placements: number[] = [];

    add(corners: number[], radius: number, scaleU: number, scaleV: number, shiftU: number, shiftV: number): void {
        this.counts.push(corners.length / 2);
        this.corners.push(...corners);
        this.placements.push(radius, scaleU, scaleV, shiftU, shiftV);
    }
}
