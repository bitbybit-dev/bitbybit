import { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { PathBuilder } from "../svg/path-builder";
import { normalizeSvg } from "../svg/svg-normalizer";
import { SvgElement, SvgSubpath } from "../svg/svg-models";

/**
 * SVG importer: parses an SVG document entirely in TypeScript (XML, the path
 * mini-language, transforms, presentation style cascade and basic shapes),
 * reduces it to the generic path vocabulary, and builds OCCT wires/faces with
 * per-element colour/stroke metadata bundled alongside each shape.
 */
export class OCCTSVG {
    private readonly builder: PathBuilder;

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
        this.builder = new PathBuilder(occ, och);
    }

    /** Convert the internal normalized subpath to the public path vocabulary. */
    private toPathSubpath(sp: SvgSubpath): Inputs.OCCT.PathSubpath {
        return {
            start: sp.start,
            closed: sp.closed,
            segments: sp.segments.map((seg) => {
                if (seg.type === "quad") {
                    return { type: "quadratic", c: seg.c, to: seg.to } as Inputs.OCCT.PathQuadraticSegment;
                }
                return seg as Inputs.OCCT.PathSegment;
            }),
        };
    }

    private styleToMeta(el: SvgElement): Partial<Inputs.OCCT.SVGShape<TopoDS_Shape>> {
        const meta: Partial<Inputs.OCCT.SVGShape<TopoDS_Shape>> = { elementType: el.tag };
        if (el.style.fill !== undefined) { meta.fill = el.style.fill; }
        if (el.style.stroke !== undefined) { meta.stroke = el.style.stroke; }
        if (el.style.strokeWidth !== undefined) { meta.strokeWidth = el.style.strokeWidth; }
        if (el.style.opacity !== undefined) { meta.opacity = el.style.opacity; }
        if (el.id !== undefined) { meta.id = el.id; }
        if (el.className !== undefined) { meta.className = el.className; }
        return meta;
    }

    /**
     * Parse an SVG document and build OCCT shapes for each drawable element,
     * returning shapes bundled with their resolved metadata.
     */
    loadSVG(inputs: Inputs.OCCT.LoadSVGDto): Inputs.OCCT.SVGResult<TopoDS_Shape> {
        const scene = normalizeSvg(inputs.svg);
        const warnings = [...scene.warnings];
        const shapes: Inputs.OCCT.SVGShape<TopoDS_Shape>[] = [];

        if (inputs.makeRibbons) {
            warnings.push("makeRibbons is not supported yet; stroked paths are returned as wires.");
        }

        // Collect drawable elements into groups and build them all in one native pass.
        const drawn = scene.elements.filter((el) => !(el.style.hidden && !inputs.includeInvisible));
        const groups = drawn.map((el) => ({
            subpaths: el.subpaths.map((sp) => this.toPathSubpath(sp)),
            makeFaces: inputs.makeFaces && el.style.fill !== "none",
        }));
        const built = this.builder.buildGroups(groups, inputs, {
            joinSegments: inputs.joinSegments,
            tolerance: inputs.tolerance,
            warnings,
        });

        drawn.forEach((el, i) => {
            const b = built[i];
            if (!b) { return; }
            const closed = el.subpaths.length > 0 && el.subpaths.every((sp) => sp.closed);
            shapes.push({
                ...this.styleToMeta(el),
                shape: b.shape,
                isFace: b.isFace,
                closed,
            } as Inputs.OCCT.SVGShape<TopoDS_Shape>);
        });

        const result: Inputs.OCCT.SVGResult<TopoDS_Shape> = { shapes, warnings };
        if (scene.viewBox) { result.viewBox = scene.viewBox; }
        return result;
    }
}
