
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import { BabylonIO } from './io';
import { BabylonMesh } from './mesh';
import { BabylonNode } from './node';
import { BabylonScene } from './scene';
import { BabylonTransforms } from './transforms';

/**
 * Contains various functions that expose BABYLONJS objects
 */
export class Babylon {
    public mesh: BabylonMesh;
    public node: BabylonNode;
    public scene: BabylonScene;
    public transforms: BabylonTransforms;
    public io: BabylonIO;
    constructor(
        context: Context,
        geometryHelper: GeometryHelper
    ) {
        this.mesh = new BabylonMesh(context);
        this.node = new BabylonNode(context, geometryHelper);
        this.scene = new BabylonScene(context);
        this.transforms = new BabylonTransforms();
        this.io = new BabylonIO(context);
    }
}