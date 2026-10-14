import type { TopoDS_Compound, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type { OccHelper } from "../../occ-helper";
import { numbersOfFrames } from "./frames";

function withCuttable<T>(och: OccHelper, shape: TopoDS_Shape, use: (cuttable: TopoDS_Shape) => T): T {
    if (shape.ShapeType() !== och.occ.TopAbs_ShapeEnum.COMPOUND) {
        return use(shape);
    }
    const solids = och.shapeGettersService.getSolids({ shape });
    if (solids.length === 0) {
        return use(shape);
    }
    const compound = och.converterService.makeCompound({ shapes: solids });
    try {
        return use(compound);
    } finally {
        solids.forEach(solid => { solid.delete(); });
        compound.delete();
    }
}

export function sliceAlongFrames(och: OccHelper, shape: TopoDS_Shape, frames: readonly Inputs.Base.Frame[], makeFaces: boolean, tolerance: number): TopoDS_Compound[] {
    return withCuttable(och, shape, cuttable => och.occ.SliceByFrames(cuttable, numbersOfFrames(frames), makeFaces, tolerance));
}

export function splitAlongFrame(och: OccHelper, shape: TopoDS_Shape, frame: Inputs.Base.Frame): [TopoDS_Compound, TopoDS_Compound] {
    return withCuttable(och, shape, cuttable => {
        const [front, back] = och.occ.SplitByFrame(cuttable, numbersOfFrames([frame]));
        return [front!, back!];
    });
}

export function keptBehind(och: OccHelper, shape: TopoDS_Shape, frames: readonly Inputs.Base.Frame[], keep: Inputs.OCCT.sectionKeepEnum): TopoDS_Compound {
    const behindAll = keep === Inputs.OCCT.sectionKeepEnum.behindAll;
    const kept: TopoDS_Compound[] = [];
    let carried: TopoDS_Compound | undefined;
    try {
        for (const frame of frames) {
            const [front, back] = splitAlongFrame(och, carried ?? shape, frame);
            carried?.delete();
            carried = behindAll ? back : front;
            if (behindAll) {
                front.delete();
            } else {
                kept.push(back);
            }
        }
        if (behindAll && carried !== undefined) {
            const result = carried;
            carried = undefined;
            return result;
        }
        return och.converterService.makeCompound({ shapes: kept });
    } finally {
        carried?.delete();
        kept.forEach(piece => { piece.delete(); });
    }
}

export function eachShape<T extends TopoDS_Compound | TopoDS_Compound[]>(shapes: readonly TopoDS_Shape[], cut: (shape: TopoDS_Shape) => T): T[] {
    const made: T[] = [];
    try {
        shapes.forEach(shape => { made.push(cut(shape)); });
        return made;
    } catch (error) {
        made.flat().forEach(compound => { compound.delete(); });
        throw error;
    }
}
