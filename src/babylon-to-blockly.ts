import { Color3, Color4, Mesh, MeshBuilder, StandardMaterial, Vector3, VertexData } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import * as Blockly from 'blockly';
import { core, geom } from 'verb-nurbs-web';
import { BlockValidationService } from './blocks/validations';

export function prepareBabylonForBlockly() {
    const windowBlockly = window as any;
    const BABYLON: any = {};
    BABYLON.Mesh = Mesh;
    BABYLON.MeshBuilder = MeshBuilder;
    BABYLON.Vector3 = Vector3;
    BABYLON.Color3 = Color3;
    BABYLON.Color4 = Color4;
    BABYLON.GridMaterial = GridMaterial;
    BABYLON.StandardMaterial = StandardMaterial;
    BABYLON.VertexData = VertexData;

    windowBlockly.BABYLON = BABYLON;

    const verb: any = {};
    verb.geom = geom;
    verb.core = core;
    windowBlockly.verb = verb;

    windowBlockly.BlocklyGlobal = Blockly;

    windowBlockly.BlockValidationService = BlockValidationService;
}
