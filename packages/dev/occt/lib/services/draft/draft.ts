import type { BRepOffsetAPI_DraftAngle, BRepOffsetAPI_MakeDraft, BitbybitOcctModule, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { withHistory } from "../base/history";
import { kernelObjects, released, releasedOnError } from "../base/release";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import { occtFailure } from "../../kernel-failures";
import { withKernelErrorsRead, withKernelFailure, withKernelRefusals } from "../base/kernel-refusals";
import { checkedShape, checkedShapes, checkedWithin } from "../base/input-checks";

const PROFILE_SAMPLED_PAST_ITS_END = /OCCT cannot draft this profile/;
const RIGHT_ANGLE_DEGREES = 90;
const STRAIGHT_ANGLE_DEGREES = 180;
const LEAST_DEGREES_FROM_FLAT = 1e-4;

function checkedSkirtLength(lengthMax: number): number {
    if (!Number.isFinite(lengthMax) || lengthMax === 0) {
        throw new InputError(`\`lengthMax\` must be a finite number other than 0, the length the skirt grows to; it is ${String(lengthMax)}.`, "lengthMax");
    }
    return lengthMax;
}

function checkedSkirtAngle(angle: number): number {
    const degrees = checkedWithin(angle, "angle", {});
    const degreesFromFlat = Math.abs((Math.abs(degrees) % STRAIGHT_ANGLE_DEGREES) - RIGHT_ANGLE_DEGREES);
    if (degreesFromFlat < LEAST_DEGREES_FROM_FLAT) {
        throw new InputError(`\`angle\` is ${degrees}, which lays the skirt flat across \`direction\`, so it never grows along it: keep the angle at least ${LEAST_DEGREES_FROM_FLAT} degrees away from ${RIGHT_ANGLE_DEGREES} and from every odd multiple of ${RIGHT_ANGLE_DEGREES}.`, "angle");
    }
    return degrees;
}

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
     * The faces pivot about the neutral plane, given by a point and a normal; `angle` is in
     * degrees. `flag` keeps the standard draft side, false tapers the other way.
     * Undraftable faces throw `occt.draft.failed`.
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
        const resolved = resolveDto(Inputs.OCCT.DraftAngleDto, inputs) as Resolved.OCCT.DraftAngleDto<TopoDS_Shape, TopoDS_Face>;
        return this.drafted(resolved);
    }

    /**
     * Drafts faces as `draftAngle` does, and reports what each face, edge and vertex of the shape
     * became: a drafted face becomes its tilted successor in `faces`.
     * @param inputs - The shape, the faces to tilt, the pull direction, the angle, the neutral plane and the side flag
     * @returns The drafted shape and its history
     * @group draft
     * @shortname draft angle with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, history } = await bitbybit.occt.draft.draftAngleWithHistory({ shape: box, faces: sideFaces, direction: [0, 1, 0], angle: 5, neutralPlaneOrigin: [0, 0, 0], neutralPlaneDirection: [0, 1, 0], flag: true });
     * const tilted = history.faces[1];
     * ```
     */
    draftAngleWithHistory(inputs: Inputs.OCCT.DraftAngleDto<TopoDS_Shape, TopoDS_Face>): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.DraftAngleDto, inputs) as Resolved.OCCT.DraftAngleDto<TopoDS_Shape, TopoDS_Face>;
        return withHistory((maker: BRepOffsetAPI_DraftAngle, result: TopoDS_Shape) => this.occ.HistoryOfDraftAngle(maker, resolved.shape, result), read => this.drafted(resolved, read), [resolved.shape]);
    }

    private drafted(resolved: Resolved.OCCT.DraftAngleDto<TopoDS_Shape, TopoDS_Face>, read?: (maker: BRepOffsetAPI_DraftAngle, result: TopoDS_Shape) => void): TopoDS_Shape {
        const shape = checkedShape(resolved.shape);
        const faces = this.checkedFacesOf(shape, checkedShapes<TopoDS_Face>(resolved.faces, "faces"));
        const { own, releaseAll } = kernelObjects();
        try {
            const draft = own(new this.occ.BRepOffsetAPI_DraftAngle(shape));
            const direction = own(withKernelErrorsRead(this.occ, () => this.och.entitiesService.gpDir(resolved.direction)));
            const neutralPlane = own(this.och.entitiesService.gpPln(resolved.neutralPlaneOrigin, resolved.neutralPlaneDirection));
            const angle = this.och.base.math.degToRad({ number: checkedWithin(resolved.angle, "angle", {}) });
            withKernelFailure(this.occ, () => {
                faces.forEach(face => draft.Add(face, direction, angle, neutralPlane, resolved.flag));
                draft.Build();
            }, () => occtFailure("occt.draft.failed"));
            if (!draft.IsDone()) {
                throw occtFailure("occt.draft.failed");
            }
            const drafted = this.och.converterService.castAndRelease(draft.Shape());
            releasedOnError([drafted], () => read?.(draft, drafted));
            return drafted;
        } finally {
            releaseAll();
        }
    }

    private checkedFacesOf(shape: TopoDS_Shape, faces: TopoDS_Face[]): TopoDS_Face[] {
        const facesOfShape = this.och.shapeGettersService.getFaces({ shape });
        return released(facesOfShape, () => {
            const faulty = faces.findIndex(face => !facesOfShape.some(own => own.IsSame(face)));
            if (faulty !== -1) {
                throw new InputError(`\`faces\` holds a shape at position ${faulty} that is not a face of \`shape\`: take the faces to tilt from the shape itself.`, "faces");
            }
            return faces;
        });
    }

    /**
     * Grows a tapered skirt from a wire, or the edges of a shape: each edge is swept along
     * `direction`, leaning outward by `angle` degrees, until the skirt is `lengthMax` long.
     *
     * `internal` leans it inward. A skirt at 90 degrees or an odd multiple lies flat and is refused;
     * a draft the kernel cannot build throws `occt.draft.failed`.
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
        const resolved = resolveDto(Inputs.OCCT.MakeDraftDto, inputs) as Resolved.OCCT.MakeDraftDto<TopoDS_Shape>;
        const lengthMax = checkedSkirtLength(resolved.lengthMax);
        return this.skirted(resolved.shape, resolved.direction, resolved.angle, resolved.internal, maker => maker.Perform(lengthMax));
    }

    /**
     * Grows a skirt as `makeDraft` does, and reports what each edge of the wire or shape swept:
     * `facesFromEdges[i]` holds the skirt faces edge `i` grew.
     * @param inputs - The wire or shape, the direction, the angle, the maximum length and whether to lean inward
     * @returns The drafted skirt and its history
     * @group draft
     * @shortname make draft with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, history } = await bitbybit.occt.draft.makeDraftWithHistory({ shape: outlineWire, direction: [0, 1, 0], angle: 5, lengthMax: 10, internal: false });
     * ```
     */
    makeDraftWithHistory(inputs: Inputs.OCCT.MakeDraftDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.MakeDraftDto, inputs) as Resolved.OCCT.MakeDraftDto<TopoDS_Shape>;
        const lengthMax = checkedSkirtLength(resolved.lengthMax);
        return this.skirtedWithHistory(resolved.shape, resolved.direction, resolved.angle, resolved.internal, maker => maker.Perform(lengthMax));
    }

    /**
     * Grows a tapered skirt from a wire or the edges of a shape like `makeDraft`, stopping it where
     * it meets `stopShape`.
     *
     * `keepOut` keeps the part of the stop shape outside the draft and `internal` leans it inward. A
     * skirt at 90 degrees or an odd multiple lies flat and is refused; a failed draft throws
     * `occt.draft.failed`.
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
        const resolved = resolveDto(Inputs.OCCT.MakeDraftToShapeDto, inputs) as Resolved.OCCT.MakeDraftToShapeDto<TopoDS_Shape>;
        const stopShape = checkedShape(resolved.stopShape, "stopShape");
        return this.skirted(resolved.shape, resolved.direction, resolved.angle, resolved.internal, maker => maker.PerformToShape(stopShape, resolved.keepOut));
    }

    /**
     * Grows a skirt up to a stop shape as `makeDraftToShape` does, and reports what each edge of the
     * wire or shape swept, as `makeDraftWithHistory` does.
     * @param inputs - The wire or shape, the direction, the angle, the shape to stop at, the keep-out flag and whether to lean inward
     * @returns The drafted skirt and its history
     * @group draft
     * @shortname make draft to shape with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, history } = await bitbybit.occt.draft.makeDraftToShapeWithHistory({ shape: outlineWire, direction: [0, 1, 0], angle: 5, stopShape: ceilingFace, keepOut: false, internal: false });
     * ```
     */
    makeDraftToShapeWithHistory(inputs: Inputs.OCCT.MakeDraftToShapeDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.MakeDraftToShapeDto, inputs) as Resolved.OCCT.MakeDraftToShapeDto<TopoDS_Shape>;
        const stopShape = checkedShape(resolved.stopShape, "stopShape");
        const made = this.skirtedWithHistory(resolved.shape, resolved.direction, resolved.angle, resolved.internal, maker => maker.PerformToShape(stopShape, resolved.keepOut));
        if (made.history.lastFaces.length === 0) {
            const named = new Set([made.history.faces, made.history.facesFromFaces, made.history.facesFromEdges, made.history.facesFromVertices, [made.history.firstFaces]].flat(2));
            const faces = this.occ.CountSubShapes(made.shape, this.occ.TopAbs_ShapeEnum.FACE, false);
            made.history.lastFaces = Array.from({ length: faces }, (_, face) => face).filter(face => !named.has(face));
        }
        return made;
    }

    private skirtedWithHistory(profile: TopoDS_Shape, pull: Inputs.Base.Vector3, degrees: number, internal: boolean, perform: (maker: BRepOffsetAPI_MakeDraft) => void): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
        return withHistory((maker: BRepOffsetAPI_MakeDraft, result: TopoDS_Shape) => this.occ.HistoryOfMakeDraft(maker, profile, result), read => this.skirted(profile, pull, degrees, internal, perform, read), [profile]);
    }

    private skirted(profile: TopoDS_Shape, pull: Inputs.Base.Vector3, degrees: number, internal: boolean, perform: (maker: BRepOffsetAPI_MakeDraft) => void, read?: (maker: BRepOffsetAPI_MakeDraft, result: TopoDS_Shape) => void): TopoDS_Shape {
        const outline = checkedShape(profile);
        const radians = this.och.base.math.degToRad({ number: checkedSkirtAngle(degrees) });
        const { own, releaseAll } = kernelObjects();
        try {
            const direction = own(withKernelErrorsRead(this.occ, () => this.och.entitiesService.gpDir(pull)));
            const maker = own(withKernelRefusals(this.occ, () => new this.occ.BRepOffsetAPI_MakeDraft(outline, direction, radians), message => PROFILE_SAMPLED_PAST_ITS_END.test(message) ? occtFailure("occt.draft.failed") : undefined));
            maker.SetDraft(internal);
            withKernelFailure(this.occ, () => perform(maker), () => occtFailure("occt.draft.failed"));
            if (!maker.IsDone()) {
                throw occtFailure("occt.draft.failed");
            }
            const made = maker.Shape();
            const shape = this.och.converterService.castAndRelease(made);
            releasedOnError([shape], () => read?.(maker, shape));
            return shape;
        } finally {
            releaseAll();
        }
    }

}
