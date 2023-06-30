
import { Context } from "../../context";
import { GeometryHelper } from "../../geometry-helper";
import { Color } from "../color";
import { BabylonCamera } from "./camera/camera";
import { BabylonIO } from "./io";
import { BabylonMaterial } from "./material/material";
import { BabylonMesh } from "./mesh";
import { BabylonNode } from "./node";
import { BabylonPick } from "./pick";
import { BabylonRay } from "./ray";
import { BabylonScene } from "./scene";
import { BabylonTransforms } from "./transforms";
import { BabylonWebXR } from "./webxr/webxr";

/**
 * Contains various functions that expose BABYLONJS objects
 */
export class Babylon {
    public mesh: BabylonMesh;
    public camera: BabylonCamera;
    public webxr: BabylonWebXR;
    public node: BabylonNode;
    public scene: BabylonScene;
    public transforms: BabylonTransforms;
    public io: BabylonIO;
    public ray: BabylonRay;
    public pick: BabylonPick;
    public material: BabylonMaterial;

    constructor(
        context: Context,
        geometryHelper: GeometryHelper,
        color: Color
    ) {
        this.mesh = new BabylonMesh(context);
        this.camera = new BabylonCamera(context);
        this.node = new BabylonNode(context, geometryHelper);
        this.scene = new BabylonScene(context);
        this.webxr = new BabylonWebXR(context);
        this.transforms = new BabylonTransforms();
        this.io = new BabylonIO(context);
        this.ray = new BabylonRay(context);
        this.pick = new BabylonPick(context);
        this.material = new BabylonMaterial(context, color);
    }
}