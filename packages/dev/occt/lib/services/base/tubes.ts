import type { BitbybitOcctModule, EmbindEnumValue, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Resolved from "../../api/resolved-inputs";
import { occtFailure } from "../../kernel-failures";
import { withKernelRefusals } from "./kernel-refusals";
import type { EnumService } from "./enum.service";
import { checkedWithin } from "./input-checks";

const TUBE_BEND_MISFIT = /PipeCircular(?:WithHistory)?: the bend radius does not fit the path at corners ([\d, ]+) \(counted from 1\)/;
const TUBE_TOO_TIGHT = /PipeCircular(?:WithHistory)?: the path bends tighter/;
const TUBE_NOT_SWEPT = /PipeCircular(?:WithHistory)?: OCCT could not sweep the tube/;

export function tubeArguments(inputs: Resolved.OCCT.PipeWireCylindricalDto<TopoDS_Wire>, enums: EnumService): [TopoDS_Wire, number, boolean, EmbindEnumValue, boolean, number] {
    const radius = checkedWithin(inputs.radius, "radius", { above: 0 });
    const bendRadius = checkedWithin(inputs.bendRadius, "bendRadius", { atLeast: 0 });
    const trihedron = enums.getGeomFillTrihedronEnumOCCTValue(inputs.trihedronEnum);
    return [inputs.shape, radius, inputs.makeSolid, trihedron, inputs.forceApproxC1 ? true : false, bendRadius];
}

export function tubeOf<T>(occ: BitbybitOcctModule, build: () => T): T {
    return withKernelRefusals(occ, build, message => {
        const corners = TUBE_BEND_MISFIT.exec(message);
        if (corners !== null) {
            return occtFailure("occt.pipe.bendDoesNotFit", { corners: corners[1]!.split(", ").map(Number) });
        }
        if (TUBE_TOO_TIGHT.test(message)) {
            return occtFailure("occt.pipe.tooTight");
        }
        return TUBE_NOT_SWEPT.test(message) ? occtFailure("occt.pipe.failed") : undefined;
    });
}
