// Hand-written members of the generated class of the same name (see scripts/gen-worker-api.mjs).
// Each member's marker says where it lands: `// replaces <path>` takes the kernel method's slot (and its doc,
// when the member has none), `// after <path>` follows that slot, `// first` and `// last` frame the class.
import { Inputs, Models } from "@bitbybit-dev/occt";
import { ShapeParser } from "../../../shape-parser";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTWire {
    constructor(private readonly occWorkerManager: OCCTWorkerManager) { }

    // replaces shapes.wire.textWiresWithData
    async textWiresWithData(inputs: Inputs.OCCT.TextWiresDto): Promise<Models.OCCT.TextWiresDataDto<Inputs.OCCT.TopoDSCompoundPointer>> {
        const res: Models.OCCT.ObjectDefinition<Models.OCCT.TextWiresDataDto<Inputs.OCCT.TopoDSCompoundPointer>, Inputs.OCCT.TopoDSShapePointer> = await this.occWorkerManager.genericCallToWorkerPromise("shapes.wire.textWiresWithData", inputs);
        if (!res.data || !res.shapes) {
            throw new Error("Text wires could not be created");
        }
        const mapped = ShapeParser.parse(res.data, res.shapes);
        const r: Models.OCCT.TextWiresDataDto<Inputs.OCCT.TopoDSShapePointer> & { shapes: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[] } = {
            ...mapped,
            type: res.data.type,
            name: res.data.name,
            shapes: res.shapes,
            compound: res.compound,
        };
        return r;
    }
}
