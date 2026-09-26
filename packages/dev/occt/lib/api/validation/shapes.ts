import { DtoRules, atLeastOne, custom, defineRules, distinct, lessThan } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";
import * as Resolved from "../resolved-inputs";

const extrudedEitherWay = <T extends { extrusionLengthFront: number; extrusionLengthBack: number }>() =>
    custom<T>("extrusionLengthFront", (inputs) => inputs.extrusionLengthFront > 0 || inputs.extrusionLengthBack > 0, "or extrusionLengthBack must be above 0, or the profile has no thickness", ["extrusionLengthFront", "extrusionLengthBack"]);

const bezierWeightsMatch = (inputs: Resolved.OCCT.BezierWeightsDto): boolean =>
    inputs.periodic || !inputs.closed ? inputs.points.length === inputs.weights.length : inputs.points.length === inputs.weights.length - 1;

/**
 * Wires, faces, solids and slicing: a line needs two different ends, a weighted Bezier one weight
 * per point (one more when it is closed), a torus a tube thinner than its ring, a profile solid
 * some thickness, and a slice a step that moves.
 */
export const shapeRules: readonly DtoRules[] = [
    defineRules<Resolved.OCCT.LineWithExtensionsDto>(Inputs.OCCT.LineWithExtensionsDto, [distinct("end", "start")]),
    defineRules<Resolved.OCCT.BezierWeightsDto>(Inputs.OCCT.BezierWeightsDto, [custom("weights", bezierWeightsMatch, "must have one weight per point, and one more when the curve is closed but not periodic", ["weights", "points", "closed", "periodic"])]),
    defineRules<Resolved.OCCT.WiresBetweenStartEndPointsOfWiresAndEdgesDto<unknown>>(Inputs.OCCT.WiresBetweenStartEndPointsOfWiresAndEdgesDto, [custom("shapes", (inputs) => inputs.shapes.length >= 2, "must hold at least two wires or edges")]),
    defineRules<Resolved.OCCT.WiresBetweenSubdividedPointsOfWiresAndEdgesDto<unknown>>(Inputs.OCCT.WiresBetweenSubdividedPointsOfWiresAndEdgesDto, [custom("shapes", (inputs) => inputs.shapes.length >= 2, "must hold at least two wires or edges")]),
    defineRules<Resolved.OCCT.FaceFromMultipleCircleTanWireCollectionsDto<unknown>>(Inputs.OCCT.FaceFromMultipleCircleTanWireCollectionsDto, [
        custom("listsOfCircles", (inputs) => inputs.combination === Inputs.OCCT.combinationCirclesForFaceEnum.allWithAll || inputs.listsOfCircles.every((list) => list.length === inputs.listsOfCircles[0]?.length), "must hold lists of one length when circles are joined in order", ["listsOfCircles", "combination"]),
    ]),
    defineRules<Resolved.OCCT.TorusDto>(Inputs.OCCT.TorusDto, [lessThan("minorRadius", "majorRadius")]),
    defineRules<Resolved.OCCT.SliceDto<unknown>>(Inputs.OCCT.SliceDto, [custom("step", (inputs) => inputs.step > 0, "must be above 0")]),
    defineRules<Resolved.OCCT.SliceInStepPatternDto<unknown>>(Inputs.OCCT.SliceInStepPatternDto, [atLeastOne("steps", (step) => typeof step === "number" && step > 0, "must hold at least one step above 0")]),
    defineRules<Resolved.OCCT.IBeamProfileSolidDto>(Inputs.OCCT.IBeamProfileSolidDto, [extrudedEitherWay()]),
    defineRules<Resolved.OCCT.HBeamProfileSolidDto>(Inputs.OCCT.HBeamProfileSolidDto, [extrudedEitherWay()]),
    defineRules<Resolved.OCCT.TBeamProfileSolidDto>(Inputs.OCCT.TBeamProfileSolidDto, [extrudedEitherWay()]),
    defineRules<Resolved.OCCT.UBeamProfileSolidDto>(Inputs.OCCT.UBeamProfileSolidDto, [extrudedEitherWay()]),
    defineRules<Resolved.OCCT.StarSolidDto>(Inputs.OCCT.StarSolidDto, [extrudedEitherWay()]),
    defineRules<Resolved.OCCT.NGonSolidDto>(Inputs.OCCT.NGonSolidDto, [extrudedEitherWay()]),
    defineRules<Resolved.OCCT.ParallelogramSolidDto>(Inputs.OCCT.ParallelogramSolidDto, [extrudedEitherWay()]),
    defineRules<Resolved.OCCT.HeartSolidDto>(Inputs.OCCT.HeartSolidDto, [extrudedEitherWay()]),
    defineRules<Resolved.OCCT.ChristmasTreeSolidDto>(Inputs.OCCT.ChristmasTreeSolidDto, [extrudedEitherWay()]),
    defineRules<Resolved.OCCT.LPolygonSolidDto>(Inputs.OCCT.LPolygonSolidDto, [extrudedEitherWay()]),
];
