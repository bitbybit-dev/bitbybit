import * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { ClearanceFit } from "./fastener-types";

const FITS: readonly ClearanceFit[] = Object.values(Inputs.Engineering.clearanceFitEnum);

export function checkedFit(fit: ClearanceFit): ClearanceFit {
    if (!FITS.includes(fit)) {
        throw new InputError(`\`fit\` is not one of ${FITS.join(", ")}.`, "fit");
    }
    return fit;
}
