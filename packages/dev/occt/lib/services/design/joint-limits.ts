import { DesignProblem } from "./problems";
import { formatNumber } from "./values";

const LIMIT_SHARE = 1e-9;

function slackOf(least: number, most: number): number {
    return LIMIT_SHARE * Math.max(Math.abs(most - least), Math.abs(least), Math.abs(most));
}

/**
 * Refuses limits whose least lies above their most by more than rounding, and a value outside them
 * by more than rounding: a billionth of the range or of its ends, so `0.1 + 0.2` stands at a limit
 * of `0.3`. Anything further off differs from the limit within the twelve digits the message shows.
 */
export function checkWithinLimits(value: number | undefined, least: number, most: number, limitsPath: string, valuePath: string): void {
    const slack = slackOf(least, most);
    if (least > most + slack) {
        throw new DesignProblem(limitsPath, `the least, ${formatNumber(least)}, is more than the most, ${formatNumber(most)}`);
    }
    if (value !== undefined && (value < least - slack || value > most + slack)) {
        throw new DesignProblem(valuePath, `${formatNumber(value)} is outside the joint's limits, ${formatNumber(least)} to ${formatNumber(most)}`);
    }
}
