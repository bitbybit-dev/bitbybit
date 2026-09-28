import { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Wire, Geom_Surface, Handle_Geom_Surface } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import { ShapeGettersService } from "./shape-getters";
import { EntitiesService } from "./entities.service";
import { EnumService } from "./enum.service";
import { WiresService } from "./wires.service";
import { BooleansService } from "./booleans.service";
import { ConverterService } from "./converter.service";
import { BaseBitByBit } from "../../base";
import * as Resolved from "../../api/resolved-inputs";
import { resolveDto } from "@bitbybit-dev/base";
import { occtFailure } from "../../kernel-failures";
import { coordinatesOf, massesAndCentres, pointsFromCoordinates } from "./kernel-arrays";

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
        const result = this.entitiesService.bRepBuilderAPIMakeFacesFromWiresOnFace(inputs.face, inputs.wires, inputs.inside);
        return result;
    }

    createFaceFromWire(inputs: Resolved.OCCT.FaceFromWireDto<TopoDS_Wire>): TopoDS_Face {
        let result: TopoDS_Face;
        if (this.enumService.getShapeTypeEnum(inputs.shape) !== Inputs.OCCT.shapeTypeEnum.wire) {
            throw new Error("Provided input shape is not a wire");
        }
        if (inputs.planar) {
            const wire = this.occ.CastToWire(inputs.shape);
            result = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, inputs.planar);
            wire.delete();
        } else {
            const wire = this.occ.CastToWire(inputs.shape);
            const edges = this.shapeGettersService.getEdges({ shape: wire });
            const filling = new this.occ.BRepFill_Filling();
            try {
                for (const edge of edges) {
                    this.occ.BRepFill_Filling_AddEdge(filling, edge, 0, true);
                    edge.delete();
                }
                this.occ.BRepFill_Filling_Build(filling);
                if (!this.occ.BRepFill_Filling_IsDone(filling)) {
                    throw new Error("BRepFill_Filling failed to create face from wire");
                }
                result = this.occ.BRepFill_Filling_Face(filling);
            } finally {
                filling.delete();
                wire.delete();
            }
        }

        return result;
    }



    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return massesAndCentres(this.occ.SurfacePropertiesOfEach([inputs.shape]))[0]!.mass;
    }

    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return massesAndCentres(this.occ.SurfacePropertiesOfEach(inputs.shapes)).map(properties => properties.mass);
    }

    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        return massesAndCentres(this.occ.SurfacePropertiesOfEach([inputs.shape]))[0]!.centre;
    }

    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
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
        return {
            min: [box[0]! - gap, box[1]! - gap, box[2]! - gap],
            max: [box[3]! + gap, box[4]! + gap, box[5]! + gap],
        };
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
        if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.allWithAll) {
            for (let i = 0; i < circleWires.length; i++) {
                for (let j = i + 1; j < circleWires.length; j++) {
                    const wire = this.wiresService.createWireFromTwoCirclesTan({
                        circle1: circleWires[i]!,
                        circle2: circleWires[j]!,
                        keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                        circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                        tolerance: inputs.tolerance,
                    });
                    const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                    faces.push(face);
                }
            }
        } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrder) {
            for (let i = 0; i < circleWires.length - 1; i++) {
                const wire = this.wiresService.createWireFromTwoCirclesTan({
                    circle1: circleWires[i]!,
                    circle2: circleWires[i + 1]!,
                    keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                    circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                    tolerance: inputs.tolerance,
                });
                const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                faces.push(face);
            }
        } else if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.inOrderClosed) {
            for (let i = 0; i < circleWires.length; i++) {
                const wire = this.wiresService.createWireFromTwoCirclesTan({
                    circle1: circleWires[i]!,
                    circle2: circleWires[(i + 1) % circleWires.length]!,
                    keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                    circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                    tolerance: inputs.tolerance,
                });
                const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                faces.push(face);
            }
        }
        let result;
        if (inputs.unify) {
            result = this.booleansService.union({ shapes: faces, keepEdges: false });
        } else {
            result = this.converterService.makeCompound({ shapes: faces });
        }
        return result;
    }

    createFaceFromMultipleCircleTanWireCollections(inputs: Resolved.OCCT.FaceFromMultipleCircleTanWireCollectionsDto<TopoDS_Wire>): TopoDS_Shape {
        const listsOfCircles = inputs.listsOfCircles;

        const faces: TopoDS_Face[] = [];
        if (inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.allWithAll) {
            for (let i = 0; i < listsOfCircles.length; i++) {
                const currentCirclesList = listsOfCircles[i]!;
                const nextCirclesList = listsOfCircles[(i + 1)];
                if (nextCirclesList) {
                    for (let j = 0; j < currentCirclesList.length; j++) {
                        for (let k = 0; k < nextCirclesList.length; k++) {
                            const circle1 = currentCirclesList[j]!;
                            const circle2 = nextCirclesList[k]!;
                            const wire = this.wiresService.createWireFromTwoCirclesTan({
                                circle1,
                                circle2,
                                keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                                circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                                tolerance: inputs.tolerance,
                            });
                            const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                            faces.push(face);
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
                    const wire = this.wiresService.createWireFromTwoCirclesTan({
                        circle1: listsOfCircles[i]![j]!,
                        circle2: listsOfCircles[i + 1]![j]!,
                        keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                        circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                        tolerance: inputs.tolerance,
                    });
                    const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                    faces.push(face);
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
                    const wire = this.wiresService.createWireFromTwoCirclesTan({
                        circle1: listsOfCircles[i]![j]!,
                        circle2: listsOfCircles[i + 1]![j]!,
                        keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                        circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                        tolerance: inputs.tolerance,
                    });
                    const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                    faces.push(face);
                }
            }
            for (let i = 0; i < listsOfCircles.length; i++) {
                for (let j = 0; j < listsOfCircles[i]!.length; j++) {
                    const wire = this.wiresService.createWireFromTwoCirclesTan({
                        circle1: listsOfCircles[i]![j]!,
                        circle2: listsOfCircles[i]![(j + 1) % listsOfCircles[i]!.length]!,
                        keepLines: Inputs.OCCT.twoSidesStrictEnum.outside,
                        circleRemainders: Inputs.OCCT.fourSidesStrictEnum.outside,
                        tolerance: inputs.tolerance,
                    });
                    const face = this.entitiesService.bRepBuilderAPIMakeFaceFromWire(wire, true);
                    faces.push(face);
                }
            }
        }
        let result;
        if (inputs.unify) {
            result = this.booleansService.union({ shapes: faces, keepEdges: false });
        } else {
            result = this.converterService.makeCompound({ shapes: faces });
        }
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
        const result = this.entitiesService.bRepBuilderAPIMakeFaceFromWires(inputs.shapes, inputs.planar);
        return result;
    }

    createFaceFromWiresOnFace(inputs: Resolved.OCCT.FaceFromWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        const result = this.entitiesService.bRepBuilderAPIMakeFaceFromWires(inputs.wires, false, inputs.face, inputs.inside);
        return result;
    }

    faceFromSurface(inputs: Resolved.OCCT.ShapeWithToleranceDto<Geom_Surface>): TopoDS_Face {
        return this.occ.MakeFaceFromSurface(inputs.shape, inputs.tolerance);
    }

    faceFromSurfaceAndWire(inputs: Resolved.OCCT.FaceFromSurfaceAndWireDto<Geom_Surface, TopoDS_Wire>): TopoDS_Face {
        return this.occ.MakeFaceFromSurfaceAndWire(inputs.surface, inputs.wire, inputs.inside);
    }

    createFacesFromWires(inputs: Resolved.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face[] {
        const result = inputs.shapes.map(shape => {
            return this.createFaceFromWire({ shape, planar: inputs.planar });
        });
        return result;
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
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool_Surface(face);
        const surface = this.surfaceOf(handle);
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);

        const params: number[] = [];
        const step = 1 / inputs.nrDivisions;
        for (let i = 0; i <= inputs.nrDivisions; i++) {
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

        const wires: TopoDS_Wire[] = [];
        for (let i = 0; i < params.length; i++) {
            const param = params[i]!;
            const placedWire = this.placeWireOnParamSurface(inputs.isU, param, uMin, uMax, vMin, vMax, surface);
            wires.push(placedWire);
        }
        handle.delete();
        return wires;
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
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool_Surface(face);
        const surface = this.surfaceOf(handle);
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        const placedWire = this.placeWireOnParamSurface(inputs.isU, inputs.param, uMin, uMax, vMin, vMax, surface);
        handle.delete();
        return placedWire;
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

        const placedWire = this.wiresService.placeWire(wire, surface);
        wire.delete();
        return placedWire;
    }

    wiresAlongParams(inputs: Resolved.OCCT.WiresAlongParamsDto<TopoDS_Face>): TopoDS_Wire[] {
        if (inputs.shape === undefined) {
            throw (Error(("Face not defined")));
        }
        const face = inputs.shape;
        const handle = this.occ.BRep_Tool_Surface(face);
        const surface = this.surfaceOf(handle);
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);

        const wires: TopoDS_Wire[] = [];
        for (let i = 0; i < inputs.params.length; i++) {
            const param = inputs.params[i]!;
            const placedWire = this.placeWireOnParamSurface(inputs.isU, param, uMin, uMax, vMin, vMax, surface);
            wires.push(placedWire);
        }
        handle.delete();
        return wires;
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

    /**
     * The corners of a rectangle about the origin with half sides `halfU` and `halfV`, in the order a
     * rectangle wire runs: counterclockwise from the corner at the lowest u and highest v.
     */
    private rectangleCorners(halfU: number, halfV: number): number[] {
        return [-halfU, halfV, -halfU, -halfV, halfU, -halfV, halfU, halfV];
    }

    /**
     * How long one unit of each parameter is along a face's surface, from its parameter origin, which
     * turns lengths on the surface into parameter steps and back.
     */
    private unitParameterLengths(face: TopoDS_Face): { alongU: number, alongV: number } {
        const handle = this.occ.BRep_Tool_Surface(face);
        const surface = this.surfaceOf(handle);
        const lengthAlong = (end: Base.Point3): number => {
            const line = this.wiresService.createLineWire({ start: [0, 0, 0], end });
            const placed = this.wiresService.placeWire(line, surface);
            const length = this.wiresService.getWireLength({ shape: placed });
            line.delete();
            placed.delete();
            return length;
        };
        const lengths = { alongU: lengthAlong([0, 0, 1]), alongV: lengthAlong([1, 0, 0]) };
        handle.delete();
        return lengths;
    }

    /**
     * The wires of the outlines on a face in one kernel call, leaving out those that reach outside its
     * trims or into its holes.
     */
    private outlinesOnFace(face: TopoDS_Face, outlines: OutlineList): TopoDS_Wire[] {
        const wires = this.occ.OutlinesOnFace(face, outlines.counts, outlines.corners, outlines.placements);
        if (wires === null) {
            throw occtFailure("occt.fillet.failed");
        }
        return wires;
    }

    /** The face with the wires cut from it as holes, and when asked, a face inside each wire. */
    private cutOutlines(face: TopoDS_Face, wires: TopoDS_Wire[], holesToFaces: boolean): TopoDS_Face[] {
        const holed = this.occ.FaceWithHoles(face, wires);
        const cells = holesToFaces ? this.occ.FacesInsideWires(face, wires) : [];
        wires.forEach(wire => wire.delete());
        return [holed, ...cells];
    }

    /** The u and v parameters of a face at fractions of its parameter ranges, u and v one after the other. */
    private parametersOf(face: TopoDS_Face, fractions: Base.Point2[]): number[] {
        const { uMin, uMax, vMin, vMax } = this.getUVBounds(face);
        return fractions.flatMap(([u, v]) => [uMin + (uMax - uMin) * u, vMin + (vMax - vMin) * v]);
    }

    /** The points of a face's surface at u and v parameters given one pair after the other, in one kernel call. */
    private surfacePointsAt(face: TopoDS_Face, parameters: number[]): Base.Point3[] {
        const coordinates = this.occ.FacePointsAtUV(face, parameters);
        if (coordinates === null) {
            throw new Error("Face has no surface");
        }
        return pointsFromCoordinates(coordinates);
    }

    /**
     * The unit normals of a face at u and v parameters given one pair after the other, in one kernel
     * call, turned over where the face is reversed or mirrored so they point out of its material.
     */
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

/**
 * Outlines in a face's parameter space, gathered for one kernel call: the corner count, the corners
 * and the placement of each, in flat lists.
 */
class OutlineList {
    readonly counts: number[] = [];
    readonly corners: number[] = [];
    readonly placements: number[] = [];

    /**
     * Adds an outline: its corners, x and y one after the other, the radius its corners are rounded
     * with, and the scales and shifts that place it at u = x * scaleU + shiftU, v = y * scaleV + shiftV.
     */
    add(corners: number[], radius: number, scaleU: number, scaleV: number, shiftU: number, shiftV: number): void {
        this.counts.push(corners.length / 2);
        this.corners.push(...corners);
        this.placements.push(radius, scaleU, scaleV, shiftU, shiftV);
    }
}
