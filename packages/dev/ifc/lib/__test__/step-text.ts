import { decodeArguments } from "../step/reader";
import type { IfcValue } from "../step/step-types";

export function decodeArgumentText(text: string): IfcValue[] {
    const bytes = new TextEncoder().encode(text);
    return decodeArguments(bytes, 0, bytes.length);
}
