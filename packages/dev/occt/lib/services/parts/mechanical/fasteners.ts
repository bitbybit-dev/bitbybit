import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import type { FastenerShapes } from "./fastener-shapes";
import { OCCTFastenersAnsi } from "./fasteners-ansi";
import { OCCTFastenersIso } from "./fasteners-iso";

/**
 * Fasteners as solids, by the standard that sizes them: `iso` holds the ISO metric screws, bolts,
 * nuts, washers and set screws and `ansi` the inch ones of ASME B18, each in the unit asked for.
 * Dowel pins, sized by their own diameter and length in model units, sit here beside them; every
 * part has a twin that names its faces.
 */
export class OCCTFasteners {
    public readonly iso: OCCTFastenersIso;
    public readonly ansi: OCCTFastenersAnsi;

    constructor(private readonly shapes: FastenerShapes) {
        this.iso = new OCCTFastenersIso(shapes);
        this.ansi = new OCCTFastenersAnsi(shapes);
    }
    /**
     * Makes a cylindrical dowel pin with a 45 degree chamfer of a tenth of its diameter at each end,
     * after ISO 2338.
     *
     * It starts at the frame's origin and runs along the normal.
     * @param inputs - The diameter, the length and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname dowel pin
     * @drawable true
     * @example
     * ```typescript
     * const pin = await bitbybit.occt.parts.mechanical.fasteners.dowelPin({ diameter: 4, length: 16 });
     * ```
     */
    dowelPin(inputs: Inputs.OCCT.DowelPinDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DowelPinDto, inputs) as Resolved.OCCT.DowelPinDto;
        return this.shapes.pin(resolved.diameter, resolved.length, resolved.frame).shape;
    }

    /**
     * Makes a dowel pin as `dowelPin` does and names the role each face plays.
     *
     * The roles `side` and `end` (both ends with their chamfers) list face indexes as
     * `shapes.face.getFaces` numbers them. The `end` frame is the input frame.
     * @param inputs - The diameter, the length and the frame
     * @returns The pin, the faces each role names and its end
     * @group fasteners
     * @shortname dowel pin with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.dowelPinWithRoles({ diameter: 4, length: 16 });
     * ```
     */
    dowelPinWithRoles(inputs: Inputs.OCCT.DowelPinDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.DowelPinDto, inputs) as Resolved.OCCT.DowelPinDto;
        return this.shapes.pin(resolved.diameter, resolved.length, resolved.frame);
    }
}
