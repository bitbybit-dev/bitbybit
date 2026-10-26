import * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { KnurlPattern } from "./knurl-types";

const PATTERNS: readonly KnurlPattern[] = Object.values(Inputs.Engineering.knurlPatternEnum);

export function checkedKnurlPattern(pattern: KnurlPattern): KnurlPattern {
    if (!PATTERNS.includes(pattern)) {
        throw new InputError(`\`pattern\` is not one of ${PATTERNS.join(", ")}.`, "pattern");
    }
    return pattern;
}
