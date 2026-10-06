import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../../api/models";
import { release } from "./cache";
import type { OCCTService } from "../../occ-service";

interface Placed {
    path: string;
    shape: TopoDS_Shape;
    owned: boolean;
}

const SHARED_VOLUME = 1e-9;

function pairKey(first: string, second: string): string {
    return first < second ? `${first}\n${second}` : `${second}\n${first}`;
}

function placedOf(built: Models.OCCT.DesignBuildResult<TopoDS_Shape>, occt: OCCTService): Placed[] {
    const shapes = new Map(built.parts.map(part => [part.id, part.shape]));
    if (built.components === undefined) {
        return built.parts.map(part => ({ path: part.id, shape: part.shape, owned: false }));
    }
    return built.components.flatMap(component => {
        const shape = component.part === undefined ? undefined : shapes.get(component.part);
        return shape === undefined ? [] : [{ path: component.path, shape: occt.transforms.transformByMatrix({ shape, transformation: component.world }), owned: true }];
    });
}

/**
 * The placed parts of a build that overlap, touch or come within `clearance`, each placed by its
 * world matrix and checked in one kernel call. A touch between two components a joint holds
 * together is what the joint asks for and is left out; an overlap between them is not. A part
 * document's parts are checked where they were built. The placed copies are freed before it
 * returns; the build's own shapes are left to its caller.
 */
export function clashesOf(built: Models.OCCT.DesignBuildResult<TopoDS_Shape>, clearance: number, occt: OCCTService): Models.OCCT.DesignClash[] {
    const joined = new Set((built.joints ?? []).flatMap(joint => joint.to === undefined ? [] : [pairKey(joint.component, joint.to)]));
    const placed = placedOf(built, occt);
    try {
        const pathOf = (index: number): string => placed[index]?.path ?? "";
        return occt.analysis.clashes.betweenShapes({ shapes: placed.map(entry => entry.shape), clearance }).flatMap((clash): Models.OCCT.DesignClash[] => {
            const components: [string, string] = [pathOf(clash.indexA), pathOf(clash.indexB)];
            const isJoined = joined.has(pairKey(...components));
            return isJoined && clash.volume <= SHARED_VOLUME ? [] : [{ components, distance: clash.distance, volume: clash.volume, pointA: clash.pointA, pointB: clash.pointB, joined: isJoined }];
        });
    } finally {
        placed.filter(entry => entry.owned).forEach(entry => release(entry.shape));
    }
}
