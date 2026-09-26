import { RuleBook, ruleBook } from "@bitbybit-dev/base";
import { filletRules } from "./fillets";
import { shapeRules } from "./shapes";
import { transformRules } from "./transforms";

/**
 * What the inputs of an OCCT operation have to satisfy together, beyond what each property accepts
 * on its own, by the DTO the operation takes. `validateInputs` from the base package runs them.
 */
export const occtDtoRules: RuleBook = ruleBook(...filletRules, ...transformRules, ...shapeRules);
