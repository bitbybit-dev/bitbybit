import { DtoRules, defineRules, sameLength } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";
import * as Resolved from "../resolved-inputs";

/**
 * The transforms of several shapes at once take one translation, axis, angle, factor or origin per
 * shape, paired by position.
 */
export const transformRules: readonly DtoRules[] = [
    defineRules<Resolved.OCCT.TransformShapesDto<unknown>>(Inputs.OCCT.TransformShapesDto, [sameLength("translations", "shapes"), sameLength("rotationAxes", "shapes"), sameLength("rotationAngles", "shapes"), sameLength("scaleFactors", "shapes")]),
    defineRules<Resolved.OCCT.RotateShapesDto<unknown>>(Inputs.OCCT.RotateShapesDto, [sameLength("axes", "shapes"), sameLength("angles", "shapes")]),
    defineRules<Resolved.OCCT.RotateAroundCenterShapesDto<unknown>>(Inputs.OCCT.RotateAroundCenterShapesDto, [sameLength("axes", "shapes"), sameLength("angles", "shapes")]),
    defineRules<Resolved.OCCT.AlignShapesDto<unknown>>(Inputs.OCCT.AlignShapesDto, [sameLength("fromOrigins", "shapes"), sameLength("fromDirections", "shapes"), sameLength("toOrigins", "shapes"), sameLength("toDirections", "shapes")]),
    defineRules<Resolved.OCCT.AlignAndTranslateShapesDto<unknown>>(Inputs.OCCT.AlignAndTranslateShapesDto, [sameLength("centers", "shapes"), sameLength("directions", "shapes")]),
    defineRules<Resolved.OCCT.TranslateShapesDto<unknown>>(Inputs.OCCT.TranslateShapesDto, [sameLength("translations", "shapes")]),
    defineRules<Resolved.OCCT.ScaleShapesDto<unknown>>(Inputs.OCCT.ScaleShapesDto, [sameLength("factors", "shapes")]),
    defineRules<Resolved.OCCT.Scale3DShapesDto<unknown>>(Inputs.OCCT.Scale3DShapesDto, [sameLength("scales", "shapes"), sameLength("centers", "shapes")]),
    defineRules<Resolved.OCCT.MirrorShapesDto<unknown>>(Inputs.OCCT.MirrorShapesDto, [sameLength("directions", "shapes"), sameLength("origins", "shapes")]),
    defineRules<Resolved.OCCT.MirrorAlongNormalShapesDto<unknown>>(Inputs.OCCT.MirrorAlongNormalShapesDto, [sameLength("normals", "shapes"), sameLength("origins", "shapes")]),
];
