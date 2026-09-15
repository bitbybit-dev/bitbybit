import { BitbybitOcctModule, TopoDS_Compound } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";

/**
 * Measurement annotations drawn as OpenCascade wires: a linear dimension between two points, an
 * angular dimension between two directions, and a pin with a text label. Each comes back as one
 * compound of wires (lines, arrows and letters) that can be drawn, extruded or exported like any
 * other shape. Labels are written in the single-line Hershey font; sizes are in model units and
 * angles in degrees.
 */
export class OCCTDimensions {

    constructor(
        _occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Draws a linear dimension between two points: a measured line offset from them by the
     * `direction` vector, extension lines back to the points, optional arrows and a label with the
     * distance.
     *
     * The label shows the distance rounded to `decimalPlaces` with `labelSuffix` after it, or
     * `labelOverwrite` instead; the units are the model's. `direction` must not run along the
     * measured line.
     * @param inputs - The two points, the offset direction, the crossing and arrow settings and the label settings
     * @returns A compound of the dimension wires
     * @group simple
     * @shortname linear dimension
     * @drawable true
     * @example
     * ```typescript
     * const dimension = await bitbybit.occt.dimensions.simpleLinearLengthDimension({
     *     start: [0, 0, 0],
     *     end: [10, 0, 0],
     *     direction: [0, 0, 2],
     *     labelSuffix: " mm",
     *     labelSize: 0.5,
     *     decimalPlaces: 1,
     *     endType: Bit.Inputs.OCCT.dimensionEndTypeEnum.arrow,
     * });
     * ```
     */
    simpleLinearLengthDimension(inputs: Inputs.OCCT.SimpleLinearLengthDimensionDto): TopoDS_Compound {
        return this.och.dimensionsService.simpleLinearLengthDimension(inputs);
    }

    /**
     * Draws an angular dimension between two directions from a center point: an arc of the given
     * radius, extension lines, optional arrows and a label with the angle.
     *
     * The angle is written in degrees unless `radians` is true, rounded to `decimalPlaces` with
     * `labelSuffix` after it, or replaced by `labelOverwrite`.
     * @param inputs - The center, the two directions, the arc radius, the offsets and the label settings
     * @returns A compound of the dimension wires
     * @group simple
     * @shortname angular dimension
     * @drawable true
     * @example
     * ```typescript
     * const dimension = await bitbybit.occt.dimensions.simpleAngularDimension({
     *     center: [0, 0, 0],
     *     direction1: [1, 0, 0],
     *     direction2: [0, 0, 1],
     *     radius: 4,
     *     offsetFromCenter: 0.5,
     *     extraSize: 0,
     *     decimalPlaces: 1,
     *     labelSuffix: " deg",
     *     labelSize: 0.3,
     *     labelOffset: 0.3,
     *     radians: false,
     * });
     * ```
     */
    simpleAngularDimension(inputs: Inputs.OCCT.SimpleAngularDimensionDto): TopoDS_Compound {
        return this.och.dimensionsService.simpleAngularDimension(inputs);
    }

    /**
     * Draws a pin, a line from a start point to an end point with a text label at the end, for
     * pointing at a spot on a model and naming it.
     *
     * `direction` is the normal of the plane the label is written in; `offsetFromStart` moves the
     * line's start along it, and the arrow and label settings shape the rest.
     * @param inputs - The start and end points, the label plane direction, the label text and the arrow and label settings
     * @returns A compound of the pin wires
     * @group simple
     * @shortname pin with label
     * @drawable true
     * @example
     * ```typescript
     * const pin = await bitbybit.occt.dimensions.pinWithLabel({
     *     startPoint: [0, 0, 0],
     *     endPoint: [0, 5, 2],
     *     direction: [0, 0, 1],
     *     label: "inlet",
     *     labelSize: 0.3,
     *     labelOffset: 0.3,
     * });
     * ```
     */
    pinWithLabel(inputs: Inputs.OCCT.PinWithLabelDto): TopoDS_Compound {
        return this.och.dimensionsService.pinWithLabel(inputs);
    }
    
    
}
