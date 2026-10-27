import type { TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { DesignProblem, pointer } from "./problems";
import type { DesignRun } from "./state";

export function faceOfLoops(loops: TopoDS_Wire[], path: string, run: DesignRun): TopoDS_Shape {
    try {
        return run.occt.shapes.face.createFaceFromWires({ shapes: loops, planar: true });
    } catch (error) {
        if (!(error instanceof InputError) || error.property !== "shapes") {
            throw error;
        }
        const reason = error.message.replace(/^`shapes` cannot bound one face: /, "").replace(/\.$/, "").replace(/\bwire (\d+)/g, "loop $1");
        throw new DesignProblem(pointer(path, "loops"), `the loops make no valid face: ${reason}`);
    }
}
