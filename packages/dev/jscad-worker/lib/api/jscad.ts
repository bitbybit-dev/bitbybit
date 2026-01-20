import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";
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
      * Converts the Jscad mesh to polygon points representing triangles of the mesh.
      * @param inputs Jscad mesh
      * @returns polygon points
      * @group conversions
      * @shortname to polygon points
      * @drawable false
      */
    async toPolygonPoints(inputs: Inputs.JSCAD.MeshDto): Promise<Inputs.Base.Mesh3> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("toPolygonPoints", inputs);
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

    /**
     * Downloads the 3MF file from jscad geometry.
     * @param inputs 3D geometry
     * @group io
     * @shortname geometry to 3mf
     */
    async downloadGeometry3MF(inputs: Inputs.JSCAD.DownloadGeometryDto): Promise<void> {
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise("downloadGeometry3MF", inputs);
        this.downloadFile(res.blob, inputs.fileName, "3mf");
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

}
