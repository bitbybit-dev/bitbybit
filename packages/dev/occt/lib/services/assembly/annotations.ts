import type { BaseBitByBit } from "@bitbybit-dev/base";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type { KernelAnnotation, KernelAnnotations, KernelNumber, KernelSavedView, KernelTriple } from "./annotations-types";

type Point3 = Inputs.Base.Point3;
type Matrix = Inputs.Base.TransformMatrix;
type Annotation = Models.OCCT.DocumentAnnotation;

const POINT_SIZE = 3;
const ORIGIN: Point3 = [0, 0, 0];

const numberOf = (value: KernelNumber): number => value ?? NaN;

const tripleOf = (value: KernelTriple): Point3 => [numberOf(value[0]), numberOf(value[1]), numberOf(value[2])];

const pointsOf = (path: readonly KernelNumber[]): Point3[] => {
    const points: Point3[] = [];
    for (let at = 0; at + POINT_SIZE <= path.length; at += POINT_SIZE) {
        points.push([numberOf(path[at]!), numberOf(path[at + 1]!), numberOf(path[at + 2]!)]);
    }
    return points;
};

const annotationOf = (annotation: KernelAnnotation): Annotation => ({
    label: annotation.entry,
    kind: annotation.kind as Models.OCCT.DocumentAnnotationKind,
    type: annotation.type,
    name: annotation.label,
    value: numberOf(annotation.value),
    attached: annotation.attached,
    ...(annotation.plane === undefined ? {} : {
        plane: { origin: tripleOf(annotation.plane.origin), normal: tripleOf(annotation.plane.normal), direction: tripleOf(annotation.plane.direction) },
    }),
    ...(annotation.textPoint === undefined ? {} : { textPoint: tripleOf(annotation.textPoint) }),
    lines: annotation.lines.map(pointsOf),
    fills: annotation.fills.map(pointsOf),
    ...(annotation.facing === undefined ? {} : { facing: tripleOf(annotation.facing) }),
});

const viewOf = (view: KernelSavedView): Models.OCCT.DocumentSavedView => ({
    label: view.entry,
    name: view.name,
    isParallel: view.isParallel,
    eye: tripleOf(view.eye),
    direction: tripleOf(view.direction),
    up: tripleOf(view.up),
    width: numberOf(view.width),
    height: numberOf(view.height),
    annotations: view.annotations,
});

class Placer {
    constructor(private readonly base: BaseBitByBit, private readonly matrix: Matrix) { }

    points(points: Point3[]): Point3[] {
        return this.base.point.transformPoints({ points, transformation: [this.matrix] });
    }

    point(point: Point3): Point3 {
        return this.points([point])[0]!;
    }

    direction(direction: Point3): Point3 {
        const [moved, origin] = this.points([direction, ORIGIN]);
        const turned = this.base.vector.sub({ first: moved!, second: origin! });
        return (this.base.vector.normalized({ vector: turned }) ?? turned) as Point3;
    }

    annotation(annotation: Annotation): Annotation {
        return {
            ...annotation,
            ...(annotation.plane === undefined ? {} : {
                plane: { origin: this.point(annotation.plane.origin), normal: this.direction(annotation.plane.normal), direction: this.direction(annotation.plane.direction) },
            }),
            ...(annotation.textPoint === undefined ? {} : { textPoint: this.point(annotation.textPoint) }),
            lines: annotation.lines.map(line => this.points(line)),
            fills: annotation.fills.map(fill => this.points(fill)),
            ...(annotation.facing === undefined ? {} : { facing: this.direction(annotation.facing) }),
        };
    }
}

export function documentAnnotationsTurned(annotations: Models.OCCT.DocumentAnnotations, matrix: Matrix, base: BaseBitByBit): Models.OCCT.DocumentAnnotations {
    const placer = new Placer(base, matrix);
    return {
        annotations: annotations.annotations.map(annotation => placer.annotation(annotation)),
        views: annotations.views.map(view => ({ ...view, eye: placer.point(view.eye), direction: placer.direction(view.direction), up: placer.direction(view.up) })),
        leftOut: annotations.leftOut,
    };
}

export function documentAnnotationsOf(text: KernelAnnotations, base: BaseBitByBit): Models.OCCT.DocumentAnnotations {
    const placementsOf = new Map((text.products ?? []).map(entry => [entry.product, entry.placements.map(matrix => matrix.map(numberOf) as Matrix)]));
    const annotations = text.annotations.flatMap((annotation): Annotation[] => {
        const written = annotationOf(annotation);
        const placements = annotation.product === undefined ? undefined : placementsOf.get(annotation.product);
        if (placements === undefined) {
            return [written];
        }
        return placements.map((matrix, instance) => ({ ...new Placer(base, matrix).annotation(written), product: annotation.product, instance }));
    });
    return {
        annotations,
        views: text.views.map(viewOf),
        leftOut: { annotations: text.leftOut.annotations, views: text.leftOut.views },
    };
}
