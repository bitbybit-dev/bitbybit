import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { release } from "../base/release";
import type { ClashContext, ThreadSide } from "./clash-types";
import { LEAST_TOUCH, TOUCH_SHARE } from "./constants";
import type { FaceNames } from "./names";
import { referenceOfName } from "./synthesis";

export function facesInRole(names: FaceNames, role: string): number[] {
    return names.flatMap((list, face) => list.some(name => referenceOfName(name).role === role) ? [face] : []);
}

const holeWallsByShape = new WeakMap<TopoDS_Shape, Map<number, boolean>>();

function boundsAHole(side: ThreadSide, index: number, context: ClashContext): boolean {
    let known = holeWallsByShape.get(side.own);
    if (known === undefined) {
        known = new Map();
        holeWallsByShape.set(side.own, known);
    }
    let isHole = known.get(index);
    if (isHole === undefined) {
        const face = context.occt.shapes.face.getFace({ shape: side.own, index });
        try {
            const point = context.occt.shapes.face.pointOnUV({ shape: face, paramU: 0.5, paramV: 0.5 });
            const normal = context.occt.shapes.face.normalOnUV({ shape: face, paramU: 0.5, paramV: 0.5 });
            const centre = context.occt.shapes.face.getFaceCenterOfMass({ shape: face });
            isHole = context.base.vector.dot({ first: context.base.vector.sub({ first: centre, second: point }), second: normal }) > 0;
        } finally {
            release(face);
        }
        known.set(index, isHole);
    }
    return isHole;
}

function engagedFacesOf(side: ThreadSide, faces: ReadonlySet<number>, context: ClashContext): TopoDS_Shape {
    const shapes = [...faces].map(index => context.occt.shapes.face.getFace({ shape: side.shape, index }));
    try {
        return context.occt.shapes.compound.makeCompound({ shapes });
    } finally {
        shapes.forEach(release);
    }
}

export function beyondThreads(clash: Models.OCCT.Clash, sides: readonly [ThreadSide, ThreadSide], clearance: number, precision: number, context: ClashContext): Models.OCCT.Clash[] {
    const [first, second] = sides;
    const touch = Math.max(LEAST_TOUCH, TOUCH_SHARE * precision);
    const pairs = context.occt.analysis.clashes.facesWithin({ shapeA: first.shape, shapeB: second.shape, clearance, precision });
    const engaged = pairs.filter(pair => pair.distance <= touch && first.faces.has(pair.indexA) && second.faces.has(pair.indexB)
        && boundsAHole(first, pair.indexA, context) !== boundsAHole(second, pair.indexB, context));
    if (engaged.length === 0) {
        return [clash];
    }
    const engagedA = new Set(engaged.map(pair => pair.indexA));
    const engagedB = new Set(engaged.map(pair => pair.indexB));
    const shaftA = engaged.some(pair => !boundsAHole(first, pair.indexA, context));
    const compounds = new Map<ThreadSide, TopoDS_Shape>();
    const onEngaged = (side: ThreadSide, faces: ReadonlySet<number>, point: Inputs.Base.Point3): boolean => {
        let compound = compounds.get(side);
        if (compound === undefined) {
            compound = engagedFacesOf(side, faces, context);
            compounds.set(side, compound);
        }
        return context.occt.operations.distancesToShapeFromPoints({ shape: compound, points: [point] })[0]! <= touch;
    };
    const standsOut = (pair: Models.OCCT.Clash): boolean => pair.distance <= touch
        && (shaftA ? first.ends.has(pair.indexA) : second.ends.has(pair.indexB))
        && onEngaged(first, engagedA, pair.pointA) && onEngaged(second, engagedB, pair.pointB);
    const restsOnThreads = (pair: Models.OCCT.Clash): boolean => engagedA.has(pair.indexA) || engagedB.has(pair.indexB) || standsOut(pair);
    try {
        const nearest = pairs
            .filter(pair => !restsOnThreads(pair))
            .reduce<Models.OCCT.Clash | undefined>((best, pair) => best === undefined || pair.distance < best.distance ? pair : best, undefined);
        return nearest === undefined ? [] : [{ ...clash, distance: nearest.distance, pointA: nearest.pointA, pointB: nearest.pointB }];
    } finally {
        compounds.forEach(release);
    }
}
