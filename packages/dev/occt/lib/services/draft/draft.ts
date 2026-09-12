import { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

/**
 * Draft angles for OpenCascade shapes: the slight taper cast and molded parts need so they slide
 * out of the mold. `draftAngle` tilts chosen faces of a solid about a neutral plane, while
 * `makeDraft` and `makeDraftToShape` grow a tapered skirt from a wire or the edges of a shape along
 * a pull direction. Angles are in degrees.
 */
export class OCCTDraft {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /**
     * Tilts the selected faces of a shape by a draft angle so the part can be pulled out of a mold
     * along `direction`.
     *
     * The faces pivot about the neutral plane, given by a point and a normal, which stays put;
     * `angle` is in degrees. `flag` keeps the standard draft side, false tapers the other way.
     * Undraftable faces throw.
     * @param inputs - The shape, the faces to tilt, the pull direction, the angle, the neutral plane and the side flag
     * @returns The shape with drafted faces
     * @group draft
     * @shortname draft angle
     * @drawable true
     * @example
     * ```typescript
     * const drafted = await bitbybit.occt.draft.draftAngle({
     *     shape: box,
     *     faces: sideFaces,
     *     direction: [0, 1, 0],
     *     angle: 5,
     *     neutralPlaneOrigin: [0, 0, 0],
     *     neutralPlaneDirection: [0, 1, 0],
     *     flag: true,
     * });
     * ```
     */
    draftAngle(inputs: Inputs.OCCT.DraftAngleDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        const draft = new this.occ.BRepOffsetAPI_DraftAngle(inputs.shape);
        const direction = this.och.entitiesService.gpDir(inputs.direction);
        const neutralPlane = this.och.entitiesService.gpPln(inputs.neutralPlaneOrigin, inputs.neutralPlaneDirection);
        const angle = this.och.vecHelper.degToRad(inputs.angle);

        inputs.faces.forEach(face => draft.Add(face, direction, angle, neutralPlane, inputs.flag));
        draft.Build();

        if (!draft.IsDone()) {
            direction.delete();
            neutralPlane.delete();
            draft.delete();
            throw new Error("Could not apply the draft angle to the given faces.");
        }
        const shape = this.och.converterService.getActualTypeOfShape(draft.Shape());
        direction.delete();
        neutralPlane.delete();
        draft.delete();
        return shape;
    }

    /**
     * Grows a tapered skirt from a wire, or the edges of a shape, along a direction: each edge is
     * swept along `direction`, leaning outward or inward by `angle` degrees, until the skirt is
     * `lengthMax` long.
     *
     * `internal` leans the skirt inward instead of outward. A draft the kernel cannot build throws
     * an error.
     * @param inputs - The wire or shape, the direction, the angle, the maximum length and whether to lean inward
     * @returns The drafted skirt
     * @group draft
     * @shortname make draft
     * @drawable true
     * @example
     * ```typescript
     * const skirt = await bitbybit.occt.draft.makeDraft({ shape: outlineWire, direction: [0, 1, 0], angle: 5, lengthMax: 10, internal: false });
     * ```
     */
    makeDraft(inputs: Inputs.OCCT.MakeDraftDto<TopoDS_Shape>): TopoDS_Shape {
        const direction = this.och.entitiesService.gpDir(inputs.direction);
        const angle = this.och.vecHelper.degToRad(inputs.angle);
        const maker = new this.occ.BRepOffsetAPI_MakeDraft(inputs.shape, direction, angle);
        maker.SetDraft(inputs.internal);
        maker.Perform(inputs.lengthMax);

        if (!maker.IsDone()) {
            direction.delete();
            maker.delete();
            throw new Error("Could not build the draft.");
        }
        const shape = this.och.converterService.getActualTypeOfShape(maker.Shape());
        direction.delete();
        maker.delete();
        return shape;
    }

    /**
     * Grows a tapered skirt from a wire, or the edges of a shape, along a direction like
     * `makeDraft`, but stops it where it meets `stopShape` instead of at a fixed length.
     *
     * `keepOut` keeps the part of the stop shape outside the draft; `internal` leans the skirt
     * inward. A draft the kernel cannot build throws an error.
     * @param inputs - The wire or shape, the direction, the angle, the shape to stop at, the keep-out flag and whether to lean inward
     * @returns The drafted skirt
     * @group draft
     * @shortname make draft to shape
     * @drawable true
     * @example
     * ```typescript
     * const skirt = await bitbybit.occt.draft.makeDraftToShape({ shape: outlineWire, direction: [0, 1, 0], angle: 5, stopShape: ceilingFace, keepOut: false, internal: false });
     * ```
     */
    makeDraftToShape(inputs: Inputs.OCCT.MakeDraftToShapeDto<TopoDS_Shape>): TopoDS_Shape {
        const direction = this.och.entitiesService.gpDir(inputs.direction);
        const angle = this.och.vecHelper.degToRad(inputs.angle);
        const maker = new this.occ.BRepOffsetAPI_MakeDraft(inputs.shape, direction, angle);
        maker.SetDraft(inputs.internal);
        maker.PerformToShape(inputs.stopShape, inputs.keepOut);

        if (!maker.IsDone()) {
            direction.delete();
            maker.delete();
            throw new Error("Could not build the draft up to the stop shape.");
        }
        const shape = this.och.converterService.getActualTypeOfShape(maker.Shape());
        direction.delete();
        maker.delete();
        return shape;
    }

}
