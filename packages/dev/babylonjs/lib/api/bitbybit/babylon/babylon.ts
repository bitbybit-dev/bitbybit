import { Color } from "@bitbybit-dev/base";
import { Context } from "../../context";
import { DrawHelper } from "../../draw-helper";
import { BabylonCamera } from "./camera/camera";
import { BabylonEngine } from "./engine";
import { BabylonGaussianSplatting } from "./gaussian-splatting";
import { BabylonIO } from "./io";
import { BabylonLights } from "./lights/lights";
import { BabylonGui } from "./gui/gui";
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
import { BabylonWebXR } from "./web-xr/web-xr";
import { BabylonGizmo } from "./gizmo/gizmo";

/**
 * Contains various functions that expose BABYLONJS objects
 */
export class Babylon {
    public mesh: BabylonMesh;
    public gaussianSplatting: BabylonGaussianSplatting;
    public camera: BabylonCamera;
    public webXr: BabylonWebXR;
    public node: BabylonNode;
    public engine: BabylonEngine;
    public scene: BabylonScene;
    public transforms: BabylonTransforms;
    public io: BabylonIO;
    public ray: BabylonRay;
    public pick: BabylonPick;
    public material: BabylonMaterial;
    public lights: BabylonLights;
    public meshBuilder: BabylonMeshBuilder;
    public texture: BabylonTexture;
    public tools: BabylonTools;
    public gui: BabylonGui;
    public gizmo: BabylonGizmo;

    constructor(
        context: Context,
        drawHelper: DrawHelper,
        color: Color
    ) {
        this.mesh = new BabylonMesh(context);
        this.camera = new BabylonCamera(context);
        this.gaussianSplatting = new BabylonGaussianSplatting(context);
        this.node = new BabylonNode(context, drawHelper);
        this.scene = new BabylonScene(context);
        this.webXr = new BabylonWebXR(context);
        this.gui = new BabylonGui(context);
        this.transforms = new BabylonTransforms();
        this.io = new BabylonIO(context);
        this.ray = new BabylonRay(context);
        this.pick = new BabylonPick(context);
        this.material = new BabylonMaterial(context, color);
        this.lights = new BabylonLights(context);
        this.texture = new BabylonTexture(context);
        this.meshBuilder = new BabylonMeshBuilder(context, this.mesh);
        this.tools = new BabylonTools(context);
        this.engine = new BabylonEngine(context);
        this.gizmo = new BabylonGizmo(context);
    }
}