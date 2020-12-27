import { Angle, Color3, Color4, Matrix, Mesh, MeshBuilder, StandardMaterial, Vector3, VertexData, VertexBuffer, Quaternion, TransformNode, Vector2, PolygonMeshBuilder } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import * as Blockly from 'blockly';
import { BitByBitBlocklyHelperService } from 'projects/bitbybit-core/src/public-api';
import { core, geom } from 'verb-nurbs-web';
import { BitByBitBlockHandlerService } from './blocks/validations';

export function prepareBabylonForBlockly() {

    const windowBlockly = window as any;
    const BABYLON: any = {};

    if (!windowBlockly.BABYLON) {
        Object.defineProperty(Float32Array.prototype, 'chunk', {
            value(chunkSize: number) {
                const temporal = [];

                for (let i = 0; i < this.length; i += chunkSize) {
                    temporal.push(this.slice(i, i + chunkSize));
                }

                return temporal;
            }
        });
    }

    BABYLON.Mesh = Mesh;
    BABYLON.MeshBuilder = MeshBuilder;
    BABYLON.PolygonMeshBuilder = PolygonMeshBuilder;
    BABYLON.Vector3 = Vector3;
    BABYLON.Vector2 = Vector2;
    BABYLON.Color3 = Color3;
    BABYLON.Color4 = Color4;
    BABYLON.GridMaterial = GridMaterial;
    BABYLON.StandardMaterial = StandardMaterial;
    BABYLON.Quaternion = Quaternion;
    BABYLON.TransformNode = TransformNode;
    BABYLON.Matrix = Matrix;
    BABYLON.VertexData = VertexData;
    BABYLON.VertexBuffer = VertexBuffer;
    BABYLON.Angle = Angle;

    windowBlockly.BABYLON = BABYLON;

    const verb: any = {};
    verb.geom = geom;
    verb.core = core;
    windowBlockly.verb = verb;

    windowBlockly.BlocklyGlobal = Blockly;

    windowBlockly.BitByBitBlockHandlerService = BitByBitBlockHandlerService;
    windowBlockly.BitByBitBlocklyHelperService = BitByBitBlocklyHelperService;
}
