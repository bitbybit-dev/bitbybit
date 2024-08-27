
import { Context } from "../../context";
import { GeometryHelper } from "../../geometry-helper";
import { Color } from "../color";
import { BabylonCamera } from "./camera/camera";
import { BabylonEngine } from "./engine";
import { BabylonGaussianSplatting } from "./gaussian-splatting";
import { BabylonIO } from "./io";
import { BabylonMaterial } from "./material/material";
import { BabylonMesh } from "./mesh";
import { BabylonMeshBuilder } from "./mesh-builder/mesh-builder";
import { BabylonNode } from "./node";
import { BabylonPick } from "./pick";
import { BabylonRay } from "./ray";
import { BabylonScene } from "./scene";
import { BabylonTexture } from "./texture/texture";
import { BabylonTools } from "./tools";
import { BabylonTransforms } from "./transforms";
import { BabylonWebXR } from "./webxr/webxr";

/**
 * Contains various functions that expose BABYLONJS objects
 */
export class Babylon {
    public mesh: BabylonMesh;
    public gaussianSplatting: BabylonGaussianSplatting;
    public camera: BabylonCamera;
    public webxr: BabylonWebXR;
    public node: BabylonNode;
    public engine: BabylonEngine;
    public scene: BabylonScene;
    public transforms: BabylonTransforms;
    public io: BabylonIO;
    public ray: BabylonRay;
    public pick: BabylonPick;
    public material: BabylonMaterial;
    public meshBuilder: BabylonMeshBuilder;
    public texture: BabylonTexture;
    public tools: BabylonTools;

    constructor(
        context: Context,
        geometryHelper: GeometryHelper,
        color: Color
    ) {
        this.mesh = new BabylonMesh(context);
        this.camera = new BabylonCamera(context);
        this.gaussianSplatting = new BabylonGaussianSplatting(context);
        this.node = new BabylonNode(context, geometryHelper);
        this.scene = new BabylonScene(context);
        this.webxr = new BabylonWebXR(context);
        this.transforms = new BabylonTransforms();
        this.io = new BabylonIO(context);
        this.ray = new BabylonRay(context);
        this.pick = new BabylonPick(context);
        this.material = new BabylonMaterial(context, color);
        this.texture = new BabylonTexture(context);
        this.meshBuilder = new BabylonMeshBuilder(context, this.mesh);
        this.tools = new BabylonTools(context);
        this.engine = new BabylonEngine(context);
    }
}