
import * as BABYLON from "@babylonjs/core";
import { JSCADWorkerManager } from "../../../workers/jscad/jscad-worker-manager";
import { Context } from "../../context";
import { GeometryHelper } from "../../geometry-helper";
import * as Inputs from "../../inputs/inputs";
import { JSCADBooleans } from "./booleans";
import { JSCADExpansions } from "./expansions";
import { JSCADExtrusions } from "./extrusions";
import { JSCADHulls } from "./hulls";
import { JSCADPath } from "./path";
import { JSCADPolygon } from "./polygon";
import { JSCADShapes } from "./shapes";
import { JSCADText } from "./text";
import { JSCADColors } from "./colors";

/**
 * Contains various functions for Solid meshes from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */

export class JSCAD {
    public readonly booleans: JSCADBooleans;
    public readonly expansions: JSCADExpansions;
    public readonly extrusions: JSCADExtrusions;
    public readonly hulls: JSCADHulls;
    public readonly path: JSCADPath;
    public readonly polygon: JSCADPolygon;
    public readonly shapes: JSCADShapes;
    public readonly text: JSCADText;
    public readonly colors: JSCADColors;

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper,
    ) {
        this.booleans = new JSCADBooleans(jscadWorkerManager);
        this.expansions = new JSCADExpansions(jscadWorkerManager);
        this.extrusions = new JSCADExtrusions(jscadWorkerManager);
        this.hulls = new JSCADHulls(jscadWorkerManager);
        this.path = new JSCADPath(jscadWorkerManager);
        this.polygon = new JSCADPolygon(jscadWorkerManager);
        this.shapes = new JSCADShapes(jscadWorkerManager);
        this.text = new JSCADText(jscadWorkerManager);
        this.colors = new JSCADColors(jscadWorkerManager);
    }

    /**
     * Draws a single solids
     * @param inputs Contains a solid or polygon and information for drawing
     * @returns Mesh that is being drawn by Babylon
     * @group jscad
     * @shortname draw solid
     * @ignore true
     */
    async drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto): Promise<BABYLON.Mesh> {
        const res: {
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
        } = await this.jscadWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        let meshToUpdate;
        if (inputs.jscadMesh && inputs.updatable) {
            meshToUpdate = inputs.jscadMesh;
        } else {
            meshToUpdate = new BABYLON.Mesh(`jscadMesh${Math.random()}`, this.context.scene);
        }
        let colour;
        if (inputs.mesh.color && inputs.mesh.color.length > 0) {
            // if jscad geometry is colorized and color is baked on geometry it will be used over anything that set in the draw options
            colour = BABYLON.Color3.FromArray(inputs.mesh.color).toHexString();
        } else {
            colour = Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours;
        }

        const s = this.makeMesh({ ...inputs, colour }, meshToUpdate, res);
        inputs.jscadMesh = s;
        return s;
    }

    private makeMesh(inputs: { updatable: boolean, opacity: number, colour: string, hidden: boolean }, meshToUpdate: BABYLON.Mesh, res: { positions: number[]; normals: number[]; indices: number[]; transforms: []; }) {

        this.createMesh(res.positions, res.indices, res.normals, meshToUpdate, res.transforms, inputs.updatable);
        meshToUpdate.material = new BABYLON.PBRMetallicRoughnessMaterial(`jscadMaterial${Math.random()}`, this.context.scene);
        meshToUpdate.flipFaces(false);
        const pbr = meshToUpdate.material as BABYLON.PBRMetallicRoughnessMaterial;
        pbr.baseColor = BABYLON.Color3.FromHexString(inputs.colour);
        pbr.metallic = 1.0;
        pbr.roughness = 0.6;
        pbr.alpha = inputs.opacity;
        pbr.alphaMode = 1;
        pbr.backFaceCulling = true;
        pbr.zOffset = 0;
        meshToUpdate.isPickable = false;
        if (inputs.hidden) {
            meshToUpdate.isVisible = false;
        }
        return meshToUpdate;
    }

    /**
     * Draws multiple solids
     * @param inputs Contains solids or polygons and information for drawing
     * @returns Mesh that is being drawn by Babylon
     * @group jscad
     * @shortname draw solid
     * @ignore true
     */
    async drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto): Promise<BABYLON.Mesh> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs).then((res: {
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
            color?: number[]
        }[]) => {

            let localOrigin: BABYLON.Mesh;
            if (inputs.jscadMesh && inputs.updatable) {
                localOrigin = inputs.jscadMesh as BABYLON.Mesh;
                const children = localOrigin.getChildMeshes();
                children.forEach(mesh => { mesh.dispose(); localOrigin.removeChild(mesh); });
            } else {
                localOrigin = new BABYLON.Mesh("local_origin" + Math.random(), this.context.scene);
            }

            localOrigin.isVisible = false;

            const colourIsArrayAndMatches = Array.isArray(inputs.colours) && inputs.colours.length === res.length;
            const colorsAreArrays = Array.isArray(inputs.colours);

            res.map((r, index) => {
                const meshToUpdate = new BABYLON.Mesh(`jscadMesh${Math.random()}`, this.context.scene);
                let colour;
                if (r.color) {
                    colour = BABYLON.Color3.FromArray(r.color).toHexString();
                } else if (colourIsArrayAndMatches) {
                    colour = inputs.colours[index];
                } else if (colorsAreArrays) {
                    colour = inputs.colours[0];
                } else {
                    colour = inputs.colours;
                }
                const m = this.makeMesh({ ...inputs, colour }, meshToUpdate, r);
                m.parent = localOrigin;
            });
            inputs.jscadMesh = localOrigin;
            return localOrigin;
        });
    }

    /**
     * Draws a 2D path
     * @param inputs Contains a path and information for drawing
     * @returns Mesh that is being drawn by Babylon
     * @group jscad
     * @shortname draw solid
     * @ignore true
     */
    async drawPath(inputs: Inputs.JSCAD.DrawPathDto): Promise<BABYLON.GreasedLineMesh> {
        return new Promise(resolve => {

            if (inputs.path.points) {
                if (inputs.path.isClosed) {
                    const pt = inputs.path.points[0];
                    inputs.path.points.push([pt[0], 0, pt[1]]);
                }
            }

            let colour = inputs.colour;
            if (inputs.path.color) {
                colour = BABYLON.Color3.FromArray(inputs.path.color).toHexString();
            }

            resolve(this.geometryHelper.drawPolyline(
                inputs.pathMesh,
                inputs.path.points,
                inputs.updatable,
                inputs.width,
                inputs.opacity,
                colour
            ));
        });

    }

    /**
     * Transforms the Jscad solid meshes with a given list of transformations.
     * @param inputs Solids with the transformation matrixes
     * @returns Solids with a transformation
     * @group transforms
     * @shortname transform solids
     * @drawable true
     */
    async transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("transformSolids", inputs);
    }

    /**
     * Transforms the Jscad solid mesh with a given list of transformations.
     * @param inputs Solid with the transformation matrixes
     * @returns Solid with a transformation
     * @group transforms
     * @shortname transform solid
     * @drawable true
     */
    async transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("transformSolid", inputs);
    }

    /**
     * Downloads the binary STL file from a 3D solid
     * @param inputs 3D Solid
     * @group io
     * @shortname solid to stl
     */
    async downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): Promise<void> {
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise("downloadSolidSTL", inputs);
        this.downloadFile(res.blob, inputs.fileName, "stl");
    }

    /**
     * Downloads the binary STL file from a 3D solids
     * @param inputs 3D Solid
     * @group io
     * @shortname solids to stl
     */
    async downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): Promise<void> {
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise("downloadSolidsSTL", inputs);
        this.downloadFile(res.blob, inputs.fileName, "stl");
    }

    /**
     * Downloads the dxf file from jscad geometry. Supports paths and meshes in array.
     * @param inputs 3D geometry
     * @group io
     * @shortname geometry to dxf
     */
    async downloadGeometryDxf(inputs: Inputs.JSCAD.DownloadGeometryDto): Promise<void> {
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise("downloadGeometryDxf", inputs);
        this.downloadFile(res.blob, inputs.fileName, "dxf");
    }

    private downloadFile(blob: Blob, fileName: string, extension: string): void {
        const blobUrl = URL.createObjectURL(blob);

        const fileLink = document.createElement("a");
        fileLink.href = blobUrl;
        fileLink.target = "_self";
        fileLink.download = fileName + "." + extension;
        fileLink.click();
        fileLink.remove();
    }

    private createMesh(
        positions: number[], indices: number[], normals: number[], jscadMesh: BABYLON.Mesh, transforms: number[], updatable: boolean
    ): void {
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        BABYLON.VertexData.ComputeNormals(positions, indices, normals, { useRightHandedSystem: true });
        vertexData.normals = normals;

        vertexData.applyToMesh(jscadMesh, updatable);
        jscadMesh.setPreTransformMatrix(BABYLON.Matrix.FromArray(transforms));
    }
}
