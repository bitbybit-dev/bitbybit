import * as verb from "verb-nurbs-web";
import { GeometryHelper, MathBitByBit } from "@bitbybit-dev/base";
import { ContextBase } from "../context";
import { VerbCurve } from "../bitbybit/verb/curve";
import { VerbSurface } from "../bitbybit/verb/surface";

// The verb services reach the library through the context, exactly as they do in an application.
export function verbCurve(): VerbCurve {
    const context = new ContextBase();
    context.verb = verb;
    return new VerbCurve(context, new GeometryHelper(), new MathBitByBit());
}

export function verbSurface(): VerbSurface {
    const context = new ContextBase();
    context.verb = verb;
    return new VerbSurface(context, new GeometryHelper(), new MathBitByBit());
}
