import * as THREEJS from "three";
import { DrawCore, Tag } from "@bitbybit-dev/core";
import * as Inputs from "../inputs/inputs";
import { Base } from "@bitbybit-dev/core/lib/api/inputs/base-inputs";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";

export class Draw extends DrawCore {
    private defaultBasicOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    private defaultPolylineOptions: Inputs.Draw.DrawBasicGeometryOptions = {
        ...new Inputs.Draw.DrawBasicGeometryOptions(),
        size: 2,
        colours: "#ff00ff",
    };

    constructor(
        public readonly drawHelper: DrawHelper,
        public readonly context: Context,
        public readonly tag: Tag
    ) {
        super();
    }

    async drawAnyAsync(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        const entity = inputs.entity;
        if (entity === undefined || (Array.isArray(entity) && entity.length === 0)) {
            return Promise.resolve(undefined);
        }
        // we start with async ones
        if (this.detectJscadMesh(entity)) {
            return this.handleJscadMesh(inputs);
        } else if (this.detectOcctShape(entity)) {
            return this.handleOcctShape(inputs);
        } else if (this.detectOcctShapes(entity)) {
            return this.handleOcctShapes(inputs);
        } else if (this.detectJscadMeshes(entity)) {
            return this.handleJscadMeshes(inputs);
        } else if (this.detectManifoldShape(entity)) {
            return this.handleManifoldShape(inputs);
        } else if (this.detectManifoldShapes(entity)) {
            return this.handleManifoldShapes(inputs);
        } else {
            // here we have all sync drawer functions
            return Promise.resolve(this.drawAny(inputs));
        }
    }

    /**
     * Draws any kind of geometry that does not need asynchronous computing, thus it cant be used with shapes coming from occt or jscad
     * @param inputs Contains options and entities to be drawn
     * @returns ThreeJS Group
     * @group draw sync
     * @shortname draw sync
     */
    drawAny(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        let result;
        const entity = inputs.entity;
        if (!inputs.group && !(inputs.entity instanceof THREEJS.Group)) {
            if (this.detectLine(entity)) {
                result = this.handleLine(inputs);
            } else if (this.detectPoint(entity)) {
                result = this.handlePoint(inputs);
            } else if (this.detectPolyline(entity)) {
                result = this.handlePolyline(inputs);
            } else if (this.detectVerbCurve(entity)) {
                result = this.handleVerbCurve(inputs);
            } else if (this.detectVerbSurface(entity)) {
                result = this.handleVerbSurface(inputs);
            } else if (this.detectPolylines(entity)) {
                result = this.handlePolylines(inputs);
            } else if (this.detectLines(entity)) {
                result = this.handleLines(inputs);
            } else if (this.detectPoints(entity)) {
                result = this.handlePoints(inputs);
            } else if (this.detectVerbCurves(entity)) {
                result = this.handleVerbCurves(inputs);
            } else if (this.detectVerbSurfaces(entity)) {
                result = this.handleVerbSurfaces(inputs);
            } else if (this.detectTag(entity)) {
                result = this.handleTag(inputs);
            } else if (this.detectTags(entity)) {
                result = this.handleTags(inputs);
            }
        } else {
            // here types are marked on group metadata so it is not necessary to check their type
            result = this.updateAny(inputs);
        }
        return result;
    }

    /**
     * Creates draw options for basic geometry types like points, lines, polylines, surfaces and jscad meshes
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname simple
     */
    optionsSimple(inputs: Inputs.Draw.DrawBasicGeometryOptions): Inputs.Draw.DrawBasicGeometryOptions {
        return inputs;
    }

    /**
     * Creates draw options for occt shape geometry like edges, wires, faces, shells, solids and compounds
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname occt shape
     */
    optionsOcctShape(inputs: Inputs.Draw.DrawOcctShapeOptions): Inputs.Draw.DrawOcctShapeOptions {
        return inputs;
    }

    private handleJscadMesh(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSolidOrPolygonMesh({
                jscadMesh: inputs.group,
                mesh: inputs.entity,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.jscadMesh);
    }

    private handleJscadMeshes(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSolidOrPolygonMeshes({
                jscadMesh: inputs.group,
                meshes: inputs.entity as any[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.jscadMeshes);
    }

    private handleManifoldShape(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, new Inputs.Manifold.DrawManifoldOrCrossSectionDto(inputs.entity), (options) => {
            return this.drawHelper.drawManifoldOrCrossSection({
                manifoldOrCrossSection: inputs.entity as Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer,
                ...new Inputs.Draw.DrawManifoldOrCrossSectionOptions(),
                ...options as Inputs.Draw.DrawManifoldOrCrossSectionOptions
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleManifoldShapes(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, new Inputs.Manifold.DrawManifoldOrCrossSectionDto(inputs.entity), (options) => {
            return this.drawHelper.drawManifoldsOrCrossSections({
                manifoldsOrCrossSections: inputs.entity as (Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer)[],
                ...new Inputs.Draw.DrawManifoldOrCrossSectionOptions(),
                ...options as Inputs.Draw.DrawManifoldOrCrossSectionOptions
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleOcctShape(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShape({
                shape: inputs.entity as Inputs.OCCT.TopoDSShapePointer,
                ...new Inputs.Draw.DrawOcctShapeOptions(),
                ...options as Inputs.Draw.DrawOcctShapeOptions
            });
        }, Inputs.Draw.drawingTypes.occt);
    }

    private handleOcctShapes(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.handleAsync(inputs, new Inputs.Draw.DrawOcctShapeOptions(), (options) => {
            return this.drawHelper.drawShapes({
                shapes: inputs.entity as Inputs.OCCT.TopoDSShapePointer[],
                ...new Inputs.Draw.DrawOcctShapeOptions(),
                ...options as Inputs.Draw.DrawOcctShapeOptions
            });
        }, Inputs.Draw.drawingTypes.occtShapes);
    }

    private handleLine(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            const line = inputs.entity as Inputs.Base.Line3 | Inputs.Base.Segment3;
            const pts: Inputs.Base.Point3[] = [];
            if (line && line["start"]) {
                pts.push((line as Inputs.Base.Line3).start, (line as Inputs.Base.Line3).end);
            } else {
                pts.push(...line as Inputs.Base.Segment3);
            }
            return this.drawHelper.drawPolylinesWithColours({
                polylinesMesh: inputs.group,
                polylines: [{ points: pts }],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.line);
    }

    private handlePoint(inputs: Inputs.Draw.DrawAny<THREEJS.Group>) {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawPoint({
                pointMesh: inputs.group,
                point: inputs.entity as Inputs.Base.Point3,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.point);
    }

    private handlePolyline(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPolylineClose({
                polylineMesh: inputs.group,
                polyline: inputs.entity,
                ...options
            });
        }, Inputs.Draw.drawingTypes.polyline);
    }

    private handleVerbCurve(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawCurve({
                curveMesh: inputs.group,
                curve: inputs.entity,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbCurve);
    }

    private handleVerbSurface(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawSurface({
                surfaceMesh: inputs.group,
                surface: inputs.entity,
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbSurface);
    }

    private handlePolylines(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPolylinesWithColours({
                polylinesMesh: inputs.group,
                polylines: inputs.entity as Inputs.Base.Polyline3[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.polylines);
    }

    private handleLines(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            const lines = inputs.entity as Inputs.Base.Line3[] | Inputs.Base.Segment3[];
            const pts: Inputs.Base.Point3[][] = [];
            if (lines && lines[0] && lines[0]["start"]) {
                lines.forEach(e => {
                    pts.push([e.start, e.end]);
                });
            } else {
                lines.forEach(line => {
                    pts.push(line as Inputs.Base.Segment3);
                });
            }
            return this.drawHelper.drawPolylinesWithColours({
                polylinesMesh: inputs.group,
                polylines: pts.map(e => ({ points: [...e] })),
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.lines);
    }

    private handlePoints(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawPoints({
                pointsMesh: inputs.group,
                points: inputs.entity as Inputs.Base.Point3[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.points);
    }

    private handleVerbCurves(inputs: Inputs.Draw.DrawAny<THREEJS.Group>) {
        return this.handle(inputs, this.defaultPolylineOptions, (options) => {
            return this.drawHelper.drawCurves({
                curvesMesh: inputs.group,
                curves: inputs.entity as Base.VerbCurve[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbCurves);
    }

    private handleVerbSurfaces(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        return this.handle(inputs, this.defaultBasicOptions, (options) => {
            return this.drawHelper.drawSurfacesMultiColour({
                surfacesMesh: inputs.group,
                surfaces: inputs.entity as Base.VerbSurface[],
                ...options as Inputs.Draw.DrawBasicGeometryOptions
            });
        }, Inputs.Draw.drawingTypes.verbSurfaces);
    }

    private handleTag(inputs: Inputs.Draw.DrawAny<THREEJS.Group>) {
        const options = inputs.options ? inputs.options : {
            updatable: false,
        };
        const result = this.tag.drawTag({
            tagVariable: inputs.group as any,
            tag: inputs.entity as Inputs.Tag.TagDto,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        (result as any).userData = { type: Inputs.Draw.drawingTypes.tag, options };
        return result;
    }

    private handleTags(inputs: Inputs.Draw.DrawAny<THREEJS.Group>) {
        const options = inputs.options ? inputs.options : {
            updatable: false,
        };
        const result = this.tag.drawTags({
            tagsVariable: inputs.group as any,
            tags: inputs.entity as Inputs.Tag.TagDto[],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });

        (result as any).userData = { type: Inputs.Draw.drawingTypes.tags, options };
        return result;
    }

    private updateAny(inputs: Inputs.Draw.DrawAny<THREEJS.Group>): THREEJS.Group {
        let result;
        if (inputs.group && inputs.group.userData) {
            const type = inputs.group.userData.type as Inputs.Draw.drawingTypes;
            switch (type) {
                case Inputs.Draw.drawingTypes.point:
                    result = this.handlePoint(inputs);
                    break;
                case Inputs.Draw.drawingTypes.points:
                    result = this.handlePoints(inputs);
                    break;
                case Inputs.Draw.drawingTypes.line:
                    result = this.handleLine(inputs);
                    break;
                case Inputs.Draw.drawingTypes.lines:
                    result = this.handleLines(inputs);
                    break;
                case Inputs.Draw.drawingTypes.polyline:
                    result = this.handlePolyline(inputs);
                    break;
                case Inputs.Draw.drawingTypes.polylines:
                    result = this.handlePolylines(inputs);
                    break;
                case Inputs.Draw.drawingTypes.verbCurve:
                    result = this.handleVerbCurve(inputs);
                    break;
                case Inputs.Draw.drawingTypes.verbCurves:
                    result = this.handleVerbCurves(inputs);
                    break;
                case Inputs.Draw.drawingTypes.verbSurface:
                    result = this.handleVerbSurface(inputs);
                    break;
                case Inputs.Draw.drawingTypes.verbSurfaces:
                    result = this.handleVerbSurfaces(inputs);
                    break;
                case Inputs.Draw.drawingTypes.tag:
                    result = this.handleTag(inputs);
                    break;
                case Inputs.Draw.drawingTypes.tags:
                    result = this.handleTags(inputs);
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    private handle(inputs: Inputs.Draw.DrawAny<THREEJS.Group>, defaultOptions: Inputs.Draw.DrawOptions, action: (inputs) => THREEJS.Group, type: Inputs.Draw.drawingTypes): THREEJS.Group {
        let options = inputs.options ? inputs.options : defaultOptions;
        if (!inputs.options && inputs.group && inputs.group.userData.options) {
            options = inputs.group.userData.options;
        }
        const result = action(options);
        this.applyGlobalSettingsAndMetadataAndShadowCasting(type, options, result);
        return result;
    }

    private async handleAsync(inputs: Inputs.Draw.DrawAny<THREEJS.Group>, defaultOptions: Inputs.Draw.DrawOptions, action: (inputs) => Promise<THREEJS.Group>, type: Inputs.Draw.drawingTypes): Promise<THREEJS.Group> {
        let options = inputs.options ? inputs.options : defaultOptions;
        if (!inputs.options && inputs.group && inputs.group.userData.options) {
            options = inputs.group.userData.options;
        }
        const result = action(options);
        return result.then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(type, options, r);
            return r;
        });
    }

    private applyGlobalSettingsAndMetadataAndShadowCasting(type: Inputs.Draw.drawingTypes, options: Inputs.Draw.DrawOptions, result: THREEJS.Group | undefined) {
        if (result) {
            const typemeta = { type, options };
            result.userData = result.userData ? { ...result.userData, ...typemeta } : typemeta;
        }
    }
}
