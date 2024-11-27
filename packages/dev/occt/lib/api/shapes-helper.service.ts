import { Base } from "./inputs";

export class ShapesHelperService {

    starLines(innerRadius: number, outerRadius: number, numRays: number, half: boolean, offsetOuterEdges: number):Base.Line3[] {
        let lines: Base.Line3[] = [];
        const angle_step = (2 * Math.PI) / numRays;
        for (let i = 0; i < numRays; i++) {
            const angle_i = i * angle_step;
            const offset = offsetOuterEdges ? offsetOuterEdges : 0;
            const outer_point: Base.Point3 = [
                outerRadius * Math.cos(angle_i),
                offset,
                outerRadius * Math.sin(angle_i)
            ];
            const inner_point: Base.Point3 = [
                innerRadius * Math.cos(angle_i + angle_step / 2),
                0,
                innerRadius * Math.sin(angle_i + angle_step / 2)
            ];
            const next_outer_point: Base.Point3 = [
                outerRadius * Math.cos(angle_i + angle_step),
                offset,
                outerRadius * Math.sin(angle_i + angle_step)
            ];
            lines.push({ start: outer_point, end: inner_point });
            lines.push({ start: inner_point, end: next_outer_point });
        }
        if (half) {
            lines = lines.slice(0, lines.length / 2);
        }
        return lines;
    }

    parallelogram(width: number, height: number, angle: number, center: boolean): Base.Line3[] {
        const radians = (angle * Math.PI) / 180;

        let x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number;
        if (center) {
            x1 = -width / 2;
            y1 = -height / 2;
            x2 = width / 2;
            y2 = -height / 2;
            x3 = width / 2;
            y3 = height / 2;
            x4 = -width / 2;
            y4 = height / 2;
        } else {
            x1 = 0;
            y1 = 0;
            x2 = width;
            y2 = 0;
            x3 = width;
            y3 = height;
            x4 = 0;
            y4 = height;
        }

        const shift = height * Math.tan(radians) / 2;
        x1 += shift;
        x2 += shift;
        x3 -= shift;
        x4 -= shift;

        const pt1: Base.Point3 = [x1, 0, y1];
        const pt2: Base.Point3 = [x2, 0, y2];
        const pt3: Base.Point3 = [x3, 0, y3];
        const pt4: Base.Point3 = [x4, 0, y4];

        const line1: Base.Line3 = { start: pt1, end: pt2 };
        const line2: Base.Line3 = { start: pt2, end: pt3 };
        const line3: Base.Line3 = { start: pt3, end: pt4 };
        const line4: Base.Line3 = { start: pt4, end: pt1 };

        return [line1, line2, line3, line4];
    }

    ngon(n: number, radius: number, center: Base.Point2): Base.Line3[] {
        const angle = (2 * Math.PI) / n;
        const edges: Base.Line3[] = [];

        for (let i = 0; i < n; i++) {
            const start = [center[0] + radius * Math.cos(i * angle), 0, center[1] + radius * Math.sin(i * angle)] as Base.Point3;
            const end = [center[0] + radius * Math.cos((i + 1) * angle), 0, center[1] + radius * Math.sin((i + 1) * angle)] as Base.Point3;
            edges.push({ start, end });
        }

        return edges;
    }
    polygonL(widthFirst: number, lengthFirst: number, widthSecond: number, lengthSecond: number): Base.Point3[] {
        return [
            [0, 0, 0],
            [lengthFirst, 0, 0],
            [lengthFirst, 0, -widthFirst],
            [-widthSecond, 0, -widthFirst],
            [-widthSecond, 0, lengthSecond],
            [0, 0, lengthSecond],
        ];
    }
    polygonLInverted(widthFirst: number, lengthFirst: number, widthSecond: number, lengthSecond: number): Base.Point3[] {
        if (widthFirst >= lengthSecond) {
            widthFirst = lengthSecond - 1e-6;
            console.warn("width first is bigger than length second, to make it work, width second is set to length first - 1e-6");
        }
        if (widthSecond >= lengthFirst) {
            widthSecond = lengthFirst - 1e-6;
            console.warn("width second is bigger than length first, to make it work, width second is set to length first - 1e-6");
        }

        return [
            [0, 0, 0],
            [lengthFirst, 0, 0],
            [lengthFirst, 0, widthFirst],
            [widthSecond, 0, widthFirst],
            [widthSecond, 0, lengthSecond],
            [0, 0, lengthSecond],
        ];
    }

    polygonLMiddle(widthFirst: number, lengthFirst: number, widthSecond: number, lengthSecond: number): Base.Point3[] {
        if (widthFirst >= lengthSecond) {
            widthFirst = lengthSecond - 1e-6;
            console.warn("width first is bigger than length second, to make it work, width second is set to length first - 1e-6");
        }
        if (widthSecond >= lengthFirst) {
            widthSecond = lengthFirst - 1e-6;
            console.warn("width second is bigger than length first, to make it work, width second is set to length first - 1e-6");
        }

        return [
            [widthSecond / 2, 0, widthFirst / 2],
            [widthSecond / 2, 0, lengthSecond ],
            [-widthSecond / 2, 0, lengthSecond],
            [-widthSecond / 2, 0, -widthFirst / 2],
            [lengthFirst, 0, -widthFirst / 2],
            [lengthFirst, 0, widthFirst / 2],
        ];
    }
}


