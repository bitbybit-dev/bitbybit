import * as Inputs from "../../api/inputs";
import { DesignProblem, pointer } from "./problems";

const ANSI_SPLINE_PITCHES: readonly string[] = Object.values(Inputs.Engineering.ansiSplinePitchEnum);

type StandardRule = (feature: Readonly<Record<string, unknown>>, path: string, ansi: boolean) => void;

function only(field: string, feature: Readonly<Record<string, unknown>>, path: string, allowed: boolean, why: string): void {
    if (!allowed && feature[field] !== undefined) {
        throw new DesignProblem(pointer(path, field), why);
    }
}

function needed(field: string, feature: Readonly<Record<string, unknown>>, path: string, why: string): void {
    if (feature[field] === undefined) {
        throw new DesignProblem(path, why);
    }
}

const RULES: Readonly<Record<string, StandardRule>> = {
    knurl: (feature, path, ansi) => {
        only("pitch", feature, path, !ansi, "an ANSI knurl is sized by its diametralPitch, not a pitch");
        only("diametralPitch", feature, path, ansi, "a DIN knurl is sized by its pitch; a diametralPitch belongs to an ANSI one");
    },
    spline: (feature, path, ansi) => {
        if (ansi) {
            only("module", feature, path, false, "an ANSI spline is sized by its pitch and teeth, not a module");
            only("diameter", feature, path, false, "an ANSI spline is sized by its pitch and teeth, not a reference diameter");
            needed("pitch", feature, path, `an ANSI spline needs its pitch, one of ${ANSI_SPLINE_PITCHES.join(", ")}`);
            const pitch = feature["pitch"];
            if (typeof pitch === "string" && !ANSI_SPLINE_PITCHES.includes(pitch)) {
                throw new DesignProblem(pointer(path, "pitch"), `an ANSI spline's pitch is one of ${ANSI_SPLINE_PITCHES.join(", ")}`);
            }
        } else {
            only("pitch", feature, path, false, "a DIN spline is sized by its module; a pitch belongs to an ANSI one");
            only("teeth", feature, path, false, "a DIN spline's teeth follow from its module and diameter; teeth belong to an ANSI one");
            needed("module", feature, path, "a DIN spline needs its module");
        }
    },
    thread: (feature, path, ansi) => {
        only("pitch", feature, path, !ansi, "an ANSI thread's pitch is its series or threadsPerInch");
        only("series", feature, path, ansi, "a series names an ANSI thread's pitch; an ISO thread takes a pitch");
        only("threadsPerInch", feature, path, ansi, "threadsPerInch is an ANSI thread's pitch; an ISO thread takes a pitch");
        if (feature["series"] !== undefined && feature["threadsPerInch"] !== undefined) {
            throw new DesignProblem(pointer(path, "threadsPerInch"), "give a thread's series or its threadsPerInch, not both");
        }
    },
};

export function checkMachiningStandard(type: string, feature: Readonly<Record<string, unknown>>, path: string): void {
    RULES[type]?.(feature, path, feature["standard"] === "ansi");
}
