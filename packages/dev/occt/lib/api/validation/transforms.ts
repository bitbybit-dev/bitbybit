import { DtoRules, custom, defineRules, sameLength } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";
import * as Resolved from "../resolved-inputs";

const notZero = (factor: number): boolean => factor !== 0;

/**
 * A scale factor may be negative, which also mirrors, but never 0, which flattens the shape. The
 * transforms of several shapes at once take one translation, axis, angle, factor or origin per
 * shape, paired by position.
 */
export const transformRules: readonly DtoRules[] = [
    defineRules<Resolved.OCCT.TransformDto<unknown>>(Inputs.OCCT.TransformDto, [custom("scaleFactor", (inputs) => notZero(inputs.scaleFactor), "must not be 0, which flattens the shape")]),
    defineRules<Resolved.OCCT.ScaleDto<unknown>>(Inputs.OCCT.ScaleDto, [custom("factor", (inputs) => notZero(inputs.factor), "must not be 0, which flattens the shape")]),
    defineRules<Resolved.OCCT.ScaleFromCenterDto<unknown>>(Inputs.OCCT.ScaleFromCenterDto, [custom("factor", (inputs) => notZero(inputs.factor), "must not be 0, which flattens the shape")]),
    defineRules<Resolved.OCCT.Scale3DDto<unknown>>(Inputs.OCCT.Scale3DDto, [custom("scale", (inputs) => inputs.scale.every(notZero), "must not hold a 0, which flattens the shape")]),
    defineRules<Resolved.OCCT.TransformShapesDto<unknown>>(Inputs.OCCT.TransformShapesDto, [sameLength("translations", "shapes"), sameLength("rotationAxes", "shapes"), sameLength("rotationAngles", "shapes"), sameLength("scaleFactors", "shapes"), custom("scaleFactors", (inputs) => inputs.scaleFactors.every(notZero), "must not hold a 0, which flattens its shape")]),
    defineRules<Resolved.OCCT.RotateShapesDto<unknown>>(Inputs.OCCT.RotateShapesDto, [sameLength("axes", "shapes"), sameLength("angles", "shapes")]),
    defineRules<Resolved.OCCT.RotateAroundCenterShapesDto<unknown>>(Inputs.OCCT.RotateAroundCenterShapesDto, [sameLength("axes", "shapes"), sameLength("angles", "shapes"), sameLength("centers", "shapes")]),
    defineRules<Resolved.OCCT.AlignShapesDto<unknown>>(Inputs.OCCT.AlignShapesDto, [sameLength("fromOrigins", "shapes"), sameLength("fromDirections", "shapes"), sameLength("toOrigins", "shapes"), sameLength("toDirections", "shapes")]),
    defineRules<Resolved.OCCT.AlignAndTranslateShapesDto<unknown>>(Inputs.OCCT.AlignAndTranslateShapesDto, [sameLength("centers", "shapes"), sameLength("directions", "shapes")]),
    defineRules<Resolved.OCCT.TranslateShapesDto<unknown>>(Inputs.OCCT.TranslateShapesDto, [sameLength("translations", "shapes")]),
    defineRules<Resolved.OCCT.ScaleShapesDto<unknown>>(Inputs.OCCT.ScaleShapesDto, [sameLength("factors", "shapes"), custom("factors", (inputs) => inputs.factors.every(notZero), "must not hold a 0, which flattens its shape")]),
    defineRules<Resolved.OCCT.Scale3DShapesDto<unknown>>(Inputs.OCCT.Scale3DShapesDto, [sameLength("scales", "shapes"), sameLength("centers", "shapes"), custom("scales", (inputs) => inputs.scales.every((scale) => scale.every(notZero)), "must not hold a 0 in any set of factors, which flattens its shape")]),
    defineRules<Resolved.OCCT.MirrorShapesDto<unknown>>(Inputs.OCCT.MirrorShapesDto, [sameLength("directions", "shapes"), sameLength("origins", "shapes")]),
    defineRules<Resolved.OCCT.MirrorAlongNormalShapesDto<unknown>>(Inputs.OCCT.MirrorAlongNormalShapesDto, [sameLength("normals", "shapes"), sameLength("origins", "shapes")]),
];
