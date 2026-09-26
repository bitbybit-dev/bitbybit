import { DtoRules, defineRules, sameLength, when } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";
import * as Resolved from "../resolved-inputs";

const bothGiven = <T>(a: keyof T, b: keyof T) => (inputs: T): boolean => {
    const first = inputs[a], second = inputs[b];
    return Array.isArray(first) && first.length > 0 && Array.isArray(second) && second.length > 0;
};

/**
 * Fillets and chamfers pair their lists by position: a radius or a distance for each index or
 * edge, a face for each edge, a list of parameters for each list of radii.
 */
export const filletRules: readonly DtoRules[] = [
    defineRules<Resolved.OCCT.FilletDto<unknown>>(Inputs.OCCT.FilletDto, [when(bothGiven("radiusList", "indexes"), sameLength("radiusList", "indexes"))]),
    defineRules<Resolved.OCCT.FilletShapesDto<unknown>>(Inputs.OCCT.FilletShapesDto, [when(bothGiven("radiusList", "indexes"), sameLength("radiusList", "indexes"))]),
    defineRules<Resolved.OCCT.Fillet3DWireDto<unknown>>(Inputs.OCCT.Fillet3DWireDto, [when(bothGiven("radiusList", "indexes"), sameLength("radiusList", "indexes"))]),
    defineRules<Resolved.OCCT.Fillet3DWiresDto<unknown>>(Inputs.OCCT.Fillet3DWiresDto, [when(bothGiven("radiusList", "indexes"), sameLength("radiusList", "indexes"))]),
    defineRules<Resolved.OCCT.ChamferDto<unknown>>(Inputs.OCCT.ChamferDto, [when(bothGiven("distanceList", "indexes"), sameLength("distanceList", "indexes"))]),
    defineRules<Resolved.OCCT.FilletEdgesListDto<unknown, unknown>>(Inputs.OCCT.FilletEdgesListDto, [sameLength("radiusList", "edges")]),
    defineRules<Resolved.OCCT.FilletEdgeVariableRadiusDto<unknown, unknown>>(Inputs.OCCT.FilletEdgeVariableRadiusDto, [sameLength("radiusList", "paramsU")]),
    defineRules<Resolved.OCCT.FilletEdgesSameVariableRadiusDto<unknown, unknown>>(Inputs.OCCT.FilletEdgesSameVariableRadiusDto, [sameLength("radiusList", "paramsU")]),
    defineRules<Resolved.OCCT.FilletEdgesVariableRadiusDto<unknown, unknown>>(Inputs.OCCT.FilletEdgesVariableRadiusDto, [sameLength("radiusLists", "edges"), sameLength("paramsULists", "edges")]),
    defineRules<Resolved.OCCT.ChamferEdgesListDto<unknown, unknown>>(Inputs.OCCT.ChamferEdgesListDto, [sameLength("distanceList", "edges")]),
    defineRules<Resolved.OCCT.ChamferEdgesTwoDistancesDto<unknown, unknown, unknown>>(Inputs.OCCT.ChamferEdgesTwoDistancesDto, [sameLength("faces", "edges")]),
    defineRules<Resolved.OCCT.ChamferEdgesTwoDistancesListsDto<unknown, unknown, unknown>>(Inputs.OCCT.ChamferEdgesTwoDistancesListsDto, [sameLength("faces", "edges"), sameLength("distances1", "edges"), sameLength("distances2", "edges")]),
    defineRules<Resolved.OCCT.ChamferEdgesDistsAnglesDto<unknown, unknown, unknown>>(Inputs.OCCT.ChamferEdgesDistsAnglesDto, [sameLength("faces", "edges"), sameLength("distances", "edges"), sameLength("angles", "edges")]),
    defineRules<Resolved.OCCT.ChamferEdgesDistAngleDto<unknown, unknown, unknown>>(Inputs.OCCT.ChamferEdgesDistAngleDto, [sameLength("faces", "edges")]),
];
