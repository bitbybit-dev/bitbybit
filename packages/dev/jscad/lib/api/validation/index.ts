import type { RuleBook } from "@bitbybit-dev/base";
import { custom, defineRules, lessThan, ruleBook } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";

/**
 * What the inputs of a JSCAD operation have to satisfy together, beyond what each property accepts
 * on its own, by the DTO the operation takes; rules written for a shared parent apply to both
 * DTOs that extend it. `validateInputs` from the base package runs them.
 *
 * A rounding has to fit: less than half of a box's smallest side, and less than half of a
 * cylinder's height and at most its radius, or JSCAD refuses the shape. A cylinder rounded by
 * exactly its radius is a capsule.
 */
export const jscadDtoRules: RuleBook = ruleBook(
    defineRules<Resolved.JSCAD.RoundedCuboidSharedDto>(Inputs.JSCAD.RoundedCuboidSharedDto, [
        lessThan("roundRadius", (inputs) => Math.min(inputs.width, inputs.length, inputs.height) / 2, "must be less than half of the smallest side", ["width", "length", "height"]),
    ]),
    defineRules<Resolved.JSCAD.RoundedCylinderSharedDto>(Inputs.JSCAD.RoundedCylinderSharedDto, [
        lessThan("roundRadius", (inputs) => inputs.height / 2, "must be less than half of the height", ["height"]),
        custom("roundRadius", (inputs) => inputs.roundRadius <= inputs.radius, "must not be greater than radius", ["roundRadius", "radius"]),
    ]),
);
