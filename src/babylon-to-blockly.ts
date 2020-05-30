import { Vector3, Color3, Color4, Mesh, MeshBuilder, StandardMaterial, VertexData } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import { geom, core } from 'verb-nurbs-web';

export function prepareBabylonForBlockly() {
    let windowBlockly = window as any;
    let BABYLON: any = {};
    BABYLON.Mesh = Mesh;
    BABYLON.MeshBuilder = MeshBuilder;
    BABYLON.Vector3 = Vector3;
    BABYLON.Color3 = Color3;
    BABYLON.Color4 = Color4;
    BABYLON.GridMaterial = GridMaterial;
    BABYLON.StandardMaterial = StandardMaterial;
    BABYLON.VertexData = VertexData;

    windowBlockly.BABYLON = BABYLON;

    let verb: any = {};
    verb.geom = geom;
    verb.core = core;
    windowBlockly.verb = verb;
}