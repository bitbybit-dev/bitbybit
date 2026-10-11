import type * as Inputs from "../../inputs";
import type { ThreePointArc } from "./helper-types";
import { add3, cross3, dot3, length3, scale3, subtract3 } from "./vectors";

type Point3 = Inputs.Base.Point3;

const FULL_TURN = 2 * Math.PI;
const COLLINEAR_RATIO = 1e-12;

export const arcThroughThreePoints = (start: Point3, middle: Point3, end: Point3): ThreePointArc | undefined => {
    const toMiddle = subtract3(middle, start);
    const toEnd = subtract3(end, start);
    const normal = cross3(toMiddle, toEnd);
    const twiceArea = length3(normal);
    const reach = Math.max(dot3(toMiddle, toMiddle), dot3(toEnd, toEnd));
    if (!(twiceArea > COLLINEAR_RATIO * reach)) {
        return undefined;
    }
    const offset = scale3(
        add3(scale3(cross3(normal, toMiddle), dot3(toEnd, toEnd)), scale3(cross3(toEnd, normal), dot3(toMiddle, toMiddle))),
        1 / (2 * twiceArea * twiceArea),
    );
    const center = add3(start, offset);
    const radius = length3(offset);
    const x = scale3(offset, -1 / radius);
    const y = scale3(cross3(normal, x), 1 / twiceArea);
    const towardEnd = subtract3(end, center);
    const angle = Math.atan2(dot3(towardEnd, y), dot3(towardEnd, x));
    return { center, x, y, radius, sweep: angle > 0 ? angle : angle + FULL_TURN };
};

export const pointsOnArc = (arc: ThreePointArc, start: Point3, end: Point3, segments: number): Point3[] => {
    const points: Point3[] = [start];
    for (let step = 1; step < segments; step++) {
        const angle = arc.sweep * step / segments;
        points.push(add3(arc.center, add3(scale3(arc.x, arc.radius * Math.cos(angle)), scale3(arc.y, arc.radius * Math.sin(angle)))));
    }
    points.push(end);
    return points;
};
