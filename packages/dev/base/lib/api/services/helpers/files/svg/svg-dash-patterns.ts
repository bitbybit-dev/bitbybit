import * as Inputs from "../../../../inputs";
import { LINE_TYPE_PATTERNS } from "../drawing/drawing.constants";
import { DASH_MATCH_SHARE } from "./svg-reading.constants";

interface DashMatch {
    readonly lineType: Inputs.IO.lineTypeEnum;
    readonly unit: number;
}

const DASHED_TYPES = Object.values(Inputs.IO.lineTypeEnum).filter(lineType => LINE_TYPE_PATTERNS[lineType]!.elements.length > 0);

const totalOf = (lengths: readonly number[]): number => lengths.reduce((total, length) => total + length, 0);

const dashMatches = (dashes: readonly number[]): DashMatch[] => {
    const total = totalOf(dashes);
    const matches: DashMatch[] = [];
    for (const lineType of DASHED_TYPES) {
        const pattern = LINE_TYPE_PATTERNS[lineType]!.elements.map(element => Math.abs(element));
        if (dashes.length % pattern.length !== 0) {
            continue;
        }
        const period = totalOf(pattern);
        const unit = total * pattern.length / (period * dashes.length);
        const slack = DASH_MATCH_SHARE * unit * period;
        if (unit > 0 && dashes.every((dash, at) => Math.abs(dash - unit * pattern[at % pattern.length]!) <= slack)) {
            matches.push({ lineType, unit });
        }
    }
    return matches;
};

export const lineTypeOfDashes = (dashes: readonly number[], patternUnit: () => number | undefined): Inputs.IO.lineTypeEnum | undefined => {
    const matches = dashMatches(dashes);
    if (matches.length <= 1) {
        return matches[0]?.lineType;
    }
    const unit = patternUnit();
    if (unit === undefined || !(unit > 0)) {
        return matches[0]!.lineType;
    }
    const offBy = (match: DashMatch): number => Math.abs(Math.log(match.unit / unit));
    return matches.reduce((best, match) => (offBy(match) < offBy(best) ? match : best)).lineType;
};
