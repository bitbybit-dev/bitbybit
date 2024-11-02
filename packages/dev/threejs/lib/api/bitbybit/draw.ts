import { Group } from "three";
import { DrawCore } from "@bitbybit-dev/core";
import * as Inputs from "../inputs";
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
        private readonly drawHelper: DrawHelper,
        private readonly context: Context,
    ) {
        super();
    }

    async drawAnyAsync(inputs: Inputs.Draw.DrawAny): Promise<Group> {
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
    drawAny(inputs: Inputs.Draw.DrawAny): Group {
        let result;
        const entity = inputs.entity;
        if (!inputs.group) {
            if (this.detectLine(entity)) {
                result = this.handleLine(inputs);
            } else if (this.detectPoint(entity)) {
                result = this.handlePoint(inputs);
            } else if (this.detectPolyline(entity)) {
                result = this.handlePolyline(inputs);
            } else if (this.detectNode(entity)) {
                result = this.handleNode(inputs);
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
            } else if (this.detectNodes(entity)) {
                result = this.handleNodes(inputs);
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

    handleJscadMesh(inputs: Inputs.Draw.DrawAny): Promise<Group> {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.group && inputs.group.userData.options) {
            options = inputs.group.userData.options;
        }
        return this.drawHelper.drawSolidOrPolygonMesh({
            jscadMesh: inputs.group,
            mesh: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.jscadMesh, options, r);
            return r;
        });
    }

    handleJscadMeshes(inputs: Inputs.Draw.DrawAny): Promise<Group> {
        let options = inputs.options ? inputs.options : this.defaultPolylineOptions;
        if (!inputs.options && inputs.group && inputs.group.userData.options) {
            options = inputs.group.userData.options;
        }
        return this.drawHelper.drawSolidOrPolygonMeshes({
            jscadMesh: inputs.group,
            meshes: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.jscadMeshes, options, r);
            return r;
        });
    }

    handleOcctShape(inputs: Inputs.Draw.DrawAny): Promise<Group> {
        let options = inputs.options ? inputs.options : new Inputs.OCCT.DrawShapeDto(inputs.entity);
        if (!inputs.options && inputs.group && inputs.group.userData.options) {
            options = inputs.group.userData.options;
        }
        return this.drawHelper.drawShape({
            shape: inputs.entity,
            ...new Inputs.Draw.DrawOcctShapeOptions(),
            ...options as Inputs.Draw.DrawOcctShapeOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.occt, options, r);
            return r;
        });

    }

    handleOcctShapes(inputs: Inputs.Draw.DrawAny): Promise<Group> {
        let options = inputs.options ? inputs.options : new Inputs.OCCT.DrawShapeDto(inputs.entity);
        if (!inputs.options && inputs.group && inputs.group.userData.options) {
            options = inputs.group.userData.options;
        }
        return this.drawHelper.drawShapes({
            shapes: inputs.entity,
            ...new Inputs.Draw.DrawOcctShapeOptions(),
            ...options as Inputs.Draw.DrawOcctShapeOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.occt, options, r);
            return r;
        });
    }

    handleLine(inputs: Inputs.Draw.DrawAny): Group {
        let options = inputs.options ? inputs.options : this.defaultPolylineOptions;
        if (!inputs.options && inputs.group && inputs.group.userData.options) {
            options = inputs.group.userData.options;
        }
        const result = this.drawHelper.drawPolylinesWithColours({
            polylinesMesh: inputs.group,
            polylines: [{ points: [inputs.entity.start, inputs.entity.end] }],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.line, options, result);
        return result;
    }

    handlePoint(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handlePolyline(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handleNode(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handleVerbCurve(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handleVerbSurface(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handlePolylines(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handleLines(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handlePoints(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handleNodes(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handleVerbCurves(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handleVerbSurfaces(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handleTag(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    handleTags(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }

    updateAny(inputs: Inputs.Draw.DrawAny): Group {
        throw new Error("Method not implemented.");
    }


    private applyGlobalSettingsAndMetadataAndShadowCasting(type: Inputs.Draw.drawingTypes, options: Inputs.Draw.DrawOptions, result: Group) {
        const typemeta = { type, options };
        // const sgs = this.context.scene.userData.shadowGenerators as BABYLON.ShadowGenerator[];

        // result.isPickable = false;
        // result.getChildMeshes().forEach(m => { m.isPickable = false; });

        // let shadowsEnabled = true;
        // if (result.metadata && result.metadata.shadows === false) {
        //     shadowsEnabled = false;
        // }
        // if (shadowsEnabled) {
        //     if (sgs.length > 0) {
        //         result.receiveShadows = true;
        //         sgs.forEach(sg => sg.addShadowCaster(result));
        //         result.getChildMeshes().forEach(m => {
        //             m.receiveShadows = true;
        //             sgs.forEach(sg => sg.addShadowCaster(m));
        //         });
        //     }
        // }
        result.userData = result.userData ? { ...result.userData, ...typemeta } : typemeta;
    }
}
