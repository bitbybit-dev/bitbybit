
import {
    Color3, Mesh,
    StandardMaterial, PBRMetallicRoughnessMaterial, ShadowGenerator
} from '@babylonjs/core';
import * as Inputs from '../inputs/inputs';
import { Point } from './point';
import { Line } from './line';
import { Polyline } from './polyline';
import { BabylonNode } from './babylon/node';
import { VerbCurve } from './verb/curve';
import { VerbSurface } from './verb/surface';
import { JSCAD } from './jscad/jscad';
import { OCCTW } from './occt/occt';
import { Tag } from './tag';
import { Context } from '../context';
import { GridMaterial } from '@babylonjs/materials';

export class Draw {

    private defaultBasicOptions: Inputs.Draw.DrawBasicGeometryOptions = {
        colours: '#ff0000',
        updatable: false,
        hidden: false,
        opacity: 1,
        size: 6,
    }
    private defaultNodeOptions: Inputs.Draw.DrawNodeOptions = {
        colorX: '#ff0000',
        colorY: '#00ff00',
        colorZ: '#0000ff',
        size: 2,
    }
    constructor(
        private readonly point: Point,
        private readonly line: Line,
        private readonly polyline: Polyline,
        private readonly node: BabylonNode,
        private readonly verbCurve: VerbCurve,
        private readonly verbSurface: VerbSurface,
        private readonly jscad: JSCAD,
        private readonly occt: OCCTW,
        private readonly tag: Tag,
        private readonly context: Context,
    ) { }

    /**
     * Draws any kind of geometry after all input promises are resolved. Inputs can also be non-promise like.
     * <div>
     *  <img src="../assets/images/blockly-images/draw/drawanyasync.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_draw.Draw.html#drawAnyAsync
     * @param inputs Contains options and entities to be drawn
     * @returns BabylonJS Mesh Promise
     * @group draw
     * @shortname draw anything
     * @disposableOutput true
     */
    async drawAnyAsync(inputs: Inputs.Draw.DrawAny): Promise<Mesh> {
        const entity = inputs.entity;

        // we start with async ones
        if (this.detectJscadMesh(entity)) {
            return this.handleJscadMesh(inputs);
        } if (this.detectOcctShape(entity)) {
            return this.handleOcctShape(inputs);
        } else if (this.detectJscadMeshes(entity)) {
            return this.handleJscadMeshes(inputs);
        } else {
            // here we have all sync drawer functions
            return Promise.resolve(this.drawAny(inputs));
        }
    }

    private updateAny(inputs: Inputs.Draw.DrawAny): Mesh {
        let result;
        if (inputs.babylonMesh && inputs.babylonMesh.metadata) {

            const type = inputs.babylonMesh.metadata.type as Inputs.Draw.drawingTypes;
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
                case Inputs.Draw.drawingTypes.node:
                    result = this.handleNode(inputs);
                    break;
                case Inputs.Draw.drawingTypes.nodes:
                    result = this.handleNodes(inputs);
                    break;
                default:
                    break;
            }
        }
        return result;
    }

    /**
     * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
     * <div>
     *  <img src="../assets/images/blockly-images/draw/drawGridMesh.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_draw.Draw.html#drawGridMesh
     * @param inputs Describes various parameters of the grid mesh like size, colour, etc.
     * @group draw
     * @shortname draw grid
     * @disposableOutput true
     */
    drawGridMesh(inputs: Inputs.Draw.SceneDrawGridMeshDto): Mesh {
        const groundMaterial = new GridMaterial(`groundMaterial${Math.random()}`, this.context.scene);
        groundMaterial.majorUnitFrequency = inputs.majorUnitFrequency;
        groundMaterial.minorUnitVisibility = inputs.minorUnitVisibility;
        groundMaterial.gridRatio = inputs.gridRatio;
        groundMaterial.backFaceCulling = inputs.backFaceCulling;
        groundMaterial.mainColor = Color3.FromHexString(inputs.mainColor);
        groundMaterial.lineColor = Color3.FromHexString(inputs.secondaryColor);
        groundMaterial.opacity = inputs.opacity;

        const ground = Mesh.CreateGround(`ground${Math.random()}`,
            inputs.width, inputs.height, inputs.subdivisions, this.context.scene, false
        );

        ground.material = groundMaterial;
        return ground;
    }

    /**
     * Draws any kind of geometry. Inputs can not be promises.
     * <div>
     *  <img src="../assets/images/blockly-images/draw/drawany.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_draw.Draw.html#drawAny
     * @param inputs Contains options and entities to be drawn
     * @returns BabylonJS Mesh
     */
    private drawAny(inputs: Inputs.Draw.DrawAny): Mesh {
        let result;

        const entity = inputs.entity;
        if (!inputs.babylonMesh) {
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
            // here types are marked on mesh metadata
            result = this.updateAny(inputs)
        }
        return result;
    }

    /**
     * Creates draw options for basic geometry types like points, lines, polylines, surfaces and jscad meshes
     * <div>
     *  <img src="../assets/images/blockly-images/draw/optionsSimple.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_draw.Draw.html#optionsSimple
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname simple
     */
    optionsSimple(inputs: Inputs.Draw.DrawBasicGeometryOptions): Inputs.Draw.DrawBasicGeometryOptions{
        return inputs;
    }

    /**
     * Creates draw options for occt shape geometry like edges, wires, faces, shells, solids and compounds
     * <div>
     *  <img src="../assets/images/blockly-images/draw/optionsSimple.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_draw.Draw.html#optionsSimple
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname occt shape
     */
    optionsOcctShape(inputs: Inputs.Draw.DrawOcctShapeOptions): Inputs.Draw.DrawOcctShapeOptions{
        return inputs;
    }

    /**
     * Creates draw options for babylon js nodes
     * <div>
     *  <img src="../assets/images/blockly-images/draw/optionsSimple.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_draw.Draw.html#optionsSimple
     * @param inputs option definition
     * @returns options
     * @group options
     * @shortname babylon node
     */
    optionsBabylonNode(inputs: Inputs.Draw.DrawNodeOptions): Inputs.Draw.DrawNodeOptions{
        return inputs;
    }

    private assignColorToMesh(mesh, color: Color3) {
        const mat = (mesh.material);
        if (mat instanceof PBRMetallicRoughnessMaterial) {
            mat.baseColor = color;
        } else if (mat instanceof StandardMaterial) {
            mat.diffuseColor = color;
        }
    }

    private handleTags(inputs: Inputs.Draw.DrawAny) {
        const options = inputs.options ? inputs.options : {
            updatable: false,
        };
        let result = this.tag.drawTags({
            tagsVariable: inputs.babylonMesh,
            tags: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });

        (result as any).metadata = { type: Inputs.Draw.drawingTypes.tags, options } as any;
        return result;
    }

    private handleTag(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : {
            updatable: false,
        };
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.tag.drawTag({
            tagVariable: inputs.babylonMesh,
            tag: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        (result as any).metadata = { type: Inputs.Draw.drawingTypes.tag, options } as any;
        return result;
    }

    private handleVerbSurfaces(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.verbSurface.drawSurfacesMultiColour({
            surfacesMesh: inputs.babylonMesh,
            surfaces: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.verbSurfaces, options, result);
        return result;
    }

    private handleVerbCurves(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;

        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.verbCurve.drawCurves({
            curvesMesh: inputs.babylonMesh,
            curves: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });

        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.verbCurves, options, result);
        return result;
    }

    private handleNodes(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultNodeOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = inputs.entity;
        this.node.drawNodes({
            nodes: inputs.entity,
            ...options as Inputs.Draw.DrawNodeOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.nodes, options, result);
        return result;
    }

    private handlePoints(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.point.drawPoints({
            pointsMesh: inputs.babylonMesh,
            points: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.points, options, result);
        return result;
    }

    private handleLines(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.polyline.drawPolylines({
            polylinesMesh: inputs.babylonMesh,
            polylines: inputs.entity.map(e => ({ points: [e.start, e.end] })),
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.lines, options, result);
        return result;
    }

    private handlePolylines(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.polyline.drawPolylines({
            polylinesMesh: inputs.babylonMesh,
            polylines: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.polylines, options, result);
        return result;
    }

    private handleVerbSurface(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.verbSurface.drawSurface({
            surfaceMesh: inputs.babylonMesh,
            surface: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.verbSurface, options, result);
        return result;
    }


    private handleVerbCurve(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.verbCurve.drawCurve({
            curveMesh: inputs.babylonMesh,
            curve: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.verbCurve, options, result);
        return result;
    }

    private handleNode(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultNodeOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = inputs.entity;
        this.node.drawNode({
            node: inputs.entity,
            ...options as Inputs.Draw.DrawNodeOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.node, options, result);
        return result;
    }

    private handlePolyline(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.polyline.drawPolyline({
            polylineMesh: inputs.babylonMesh,
            polyline: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.polyline, options, result);
        return result;
    }

    private handlePoint(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.point.drawPoint({
            pointMesh: inputs.babylonMesh,
            point: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.point, options, result);
        return result;
    }

    private handleLine(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        let result = this.polyline.drawPolylines({
            polylinesMesh: inputs.babylonMesh,
            polylines: [{ points: [inputs.entity.start, inputs.entity.end] }],
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        });
        this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.line, options, result);
        return result;
    }

    private handleJscadMeshes(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return this.jscad.drawSolidOrPolygonMeshes({
            jscadMesh: inputs.babylonMesh,
            meshes: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.jscadMeshes, options, r);
            return r;
        });
    }

    private handleOcctShape(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : new Inputs.OCCT.DrawShapeDto(inputs.entity);
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return this.occt.drawShape({
            shape: inputs.entity,
            ...new Inputs.Draw.DrawOcctShapeOptions(),
            ...options as Inputs.Draw.DrawOcctShapeOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.occt, options, r);
            return r;
        });
    }

    private handleJscadMesh(inputs: Inputs.Draw.DrawAny) {
        let options = inputs.options ? inputs.options : this.defaultBasicOptions;
        if (!inputs.options && inputs.babylonMesh && inputs.babylonMesh.metadata.options) {
            options = inputs.babylonMesh.metadata.options;
        }
        return this.jscad.drawSolidOrPolygonMesh({
            jscadMesh: inputs.babylonMesh,
            mesh: inputs.entity,
            ...options as Inputs.Draw.DrawBasicGeometryOptions
        }).then(r => {
            this.applyGlobalSettingsAndMetadataAndShadowCasting(Inputs.Draw.drawingTypes.jscadMesh, options, r);
            return r;
        });
    }

    private applyGlobalSettingsAndMetadataAndShadowCasting(type: Inputs.Draw.drawingTypes, options: Inputs.Draw.DrawBasicGeometryOptions | Inputs.Draw.DrawOcctShapeOptions | Inputs.Draw.DrawNodeOptions, result: Mesh) {
        const typemeta = { type, options };
        const sgs = this.context.scene.metadata.shadowGenerators as ShadowGenerator[];

        result.isPickable = false;
        result.getChildMeshes().forEach(m => { m.isPickable = false });

        if (sgs.length > 0) {
            result.receiveShadows = true;
            sgs.forEach(sg => sg.addShadowCaster(result));
            result.getChildMeshes().forEach(m => {
                m.receiveShadows = true;
                sgs.forEach(sg => sg.addShadowCaster(m));
            });
        }

        result.metadata = result.metadata ? { ...result.metadata, ...typemeta } : typemeta;
    }

    private detectPoint(entity: any): boolean {
        return (Array.isArray(entity) && entity.length === 3 && this.checkIfElementsInArrayAreNumbers(entity));
    }

    private detectPoints(entity: any): boolean {
        return Array.isArray(entity) &&
            this.checkIfElementsInArrayAreArrays(entity) &&
            this.arraysInChildrenArraysContainNumbers(entity) &&
            this.arraysInChildrenArraysAreOfLength3(entity)
    }

    private detectLine(entity: any): boolean {
        return entity.start && entity.end && Array.isArray(entity.start) && Array.isArray(entity.end);
    }

    private detectLines(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectLine(el));
    }

    private detectPolyline(entity: any): boolean {
        return entity.points && Array.isArray(entity.points);
    }

    private detectPolylines(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectPolyline(el));
    }

    private detectNode(entity: any): boolean {
        return !Array.isArray(entity) && entity.id && entity.id.includes("node");
    }

    private detectNodes(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectNode(el));
    }

    private detectVerbCurve(entity: any): boolean {
        return !Array.isArray(entity) && entity._data && entity._data.controlPoints && entity._data.knots && entity._data.degree
    }

    private detectVerbSurface(entity: any): boolean {
        return !Array.isArray(entity) && entity._data && entity._data.controlPoints && entity._data.degreeU && entity._data.degreeV && entity._data.knotsU && entity._data.knotsV
    }

    private detectVerbCurves(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectVerbCurve(el));
    }

    private detectVerbSurfaces(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectVerbSurface(el));
    }

    private detectJscadMesh(entity: any): boolean {
        return !Array.isArray(entity) && (entity.sides || entity.polygons);
    }

    private detectJscadMeshes(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectJscadMesh(el));
    }

    private detectOcctShape(entity: any): boolean {
        return entity?.type === 'occ-shape';
    }

    private detectTag(entity: any): boolean {
        return !Array.isArray(entity) && entity.text;
    }

    private detectTags(entity: any): boolean {
        return Array.isArray(entity) && !entity.some(el => !this.detectTag(el));
    }

    private checkIfElementsInArrayAreNumbers(array: any[]): boolean {
        return !array.some(el => isNaN(el));
    }

    private checkIfElementsInArrayAreArrays(array: any[]): boolean {
        return !array.some(el => !Array.isArray(el));
    }

    private arraysInChildrenArraysContainNumbers(array: any[]) {
        return !array.some(el => !this.checkIfElementsInArrayAreNumbers(el));
    }

    private arraysInChildrenArraysAreOfLength3(array: any[]) {
        return !array.some(el => el.length !== 3);
    }
}
