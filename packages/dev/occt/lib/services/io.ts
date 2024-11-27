import { IGESControl_Reader_1, OpenCascadeInstance, STEPControl_Reader_1, STEPControl_StepModelType, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs/inputs";

export class OCCTIO {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto<TopoDS_Shape>): string {
        const shapeToUse = inputs.shape;
        let adjustedShape;
        if (inputs.adjustYtoZ) {
            const rotatedShape = this.och.transformsService.rotate({ shape: inputs.shape, axis: [1, 0, 0], angle: -90 });
            adjustedShape = this.och.transformsService.mirrorAlongNormal(
                { shape: rotatedShape, origin: [0, 0, 0], normal: [0, 0, 1] }
            );
            rotatedShape.delete();
        }
        const fileName = "x";
        const writer = new this.occ.STEPControl_Writer_1();
        let transferShape;
        if (adjustedShape) {
            transferShape = adjustedShape;
        } else {
            transferShape = shapeToUse;
        }
        // Convert to a .STEP File

        const messageProgress = new this.occ.Message_ProgressRange_1();
        let transferResult;
        try {
            transferResult = writer.Transfer(
                transferShape,
                (this.occ.STEPControl_StepModelType.STEPControl_AsIs as STEPControl_StepModelType),
                true,
                messageProgress
            );
        } catch (ex) {
            throw (new Error("Failed when calling writer.Transfer."));
        }
        let result: string;
        if (transferResult === this.occ.IFSelect_ReturnStatus.IFSelect_RetDone) {
            // Write the STEP File to the virtual Emscripten Filesystem Temporarily
            const writeResult = writer.Write(fileName);
            if (writeResult === this.occ.IFSelect_ReturnStatus.IFSelect_RetDone) {
                // Read the STEP File from the filesystem and clean up
                const stepFileText = this.occ.FS.readFile("/" + fileName, { encoding: "utf8" });
                this.occ.FS.unlink("/" + fileName);

                // Return the contents of the STEP File
                result = stepFileText;
            } else {
                throw (new Error("Failed when writing step file."));
            }
        } else {
            throw (new Error("Failed when transfering to step writer."));
        }
        if (adjustedShape) {
            adjustedShape.delete();
        }
        messageProgress.delete();

        return result;
    }

    saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<TopoDS_Shape>): string {
        const shapeToUse = inputs.shape;

        // This could be made optional...
        // Clean cached triangulation data for the shape.
        // This allows to get lower res models out of higher res that was once computed and cached.
        this.occ.BRepTools.Clean(shapeToUse, true);

        let adjustedShape;
        if (inputs.adjustYtoZ) {
            const rotatedShape = this.och.transformsService.rotate({ shape: inputs.shape, axis: [1, 0, 0], angle: -90 });
            adjustedShape = this.och.transformsService.mirrorAlongNormal(
                { shape: rotatedShape, origin: [0, 0, 0], normal: [0, 0, 1] }
            );
            rotatedShape.delete();
        }
        const fileName = "x";
        const writer = new this.occ.StlAPI_Writer();
        let transferShape;
        if (adjustedShape) {
            transferShape = adjustedShape;
        } else {
            transferShape = shapeToUse;
        }
        const messageProgress = new this.occ.Message_ProgressRange_1();
        let result: string;
        const incrementalMeshBuilder = new this.occ.BRepMesh_IncrementalMesh_2(transferShape, inputs.precision, false, 0.5, false);

        // Write the STL File to the virtual Emscripten Filesystem Temporarily
        const writeResult = writer.Write(transferShape, fileName, messageProgress);
        if (writeResult) {
            // Read the STL File from the filesystem and clean up
            const stlFile = this.occ.FS.readFile("/" + fileName, { encoding: "utf8" });
            this.occ.FS.unlink("/" + fileName);
            // Return the contents of the STL File
            result = stlFile;
        } else {
            throw (new Error("Failed when writing stl file."));
        }

        if (adjustedShape) {
            adjustedShape.delete();
        }
        messageProgress.delete();

        if (incrementalMeshBuilder) {
            incrementalMeshBuilder.Delete();
        }
        
        return result;
    }

    /** This function parses the ASCII contents of a `.STEP` or `.IGES`
     * File as a Shape into the `externalShapes` dictionary.
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.LoadStepOrIgesDto): TopoDS_Shape | undefined {
        const fileName = inputs.fileName;
        const fileText = inputs.filetext;
        const fileType = (() => {
            switch (fileName.toLowerCase().split(".").pop()) {
                case "step":
                case "stp":
                    return "step";
                case "iges":
                case "igs":
                    return "iges";
                default:
                    return undefined;
            }
        })();
        // Writes the uploaded file to Emscripten's Virtual Filesystem
        this.occ.FS.createDataFile("/", `file.${fileType}`, fileText as string, true, true, true);
        // Choose the correct OpenCascade file parsers to read the CAD file
        let reader: STEPControl_Reader_1 | IGESControl_Reader_1;
        if (fileType === "step") {
            reader = new this.occ.STEPControl_Reader_1();
        } else if (fileType === "iges") {
            reader = new this.occ.IGESControl_Reader_1();
        } else {
            console.error("opencascade can't parse this extension! (yet)");
            return undefined;
        }
        const readResult = reader.ReadFile(`file.${fileType}`);            // Read the file
        if (readResult === this.occ.IFSelect_ReturnStatus.IFSelect_RetDone) {
            // Translate all transferable roots to OpenCascade
            const messageProgress = new this.occ.Message_ProgressRange_1();
            reader.TransferRoots(
                messageProgress
            );
            messageProgress.delete();
            let stepShape = reader.OneShape();
            let adjustedShape;
            if (inputs.adjustZtoY) {
                const mirroredShape = this.och.transformsService.mirrorAlongNormal(
                    { shape: stepShape, origin: [0, 0, 0], normal: [0, 0, 1] }
                );
                adjustedShape = this.och.transformsService.rotate({ shape: mirroredShape, axis: [1, 0, 0], angle: 90 });
                mirroredShape.delete();
            }
            // Out with the old, in with the new!
            // Remove the file when we're done (otherwise we run into errors on reupload)
            this.occ.FS.unlink(`/file.${fileType}`);
            if (adjustedShape) {
                stepShape.delete();
                stepShape = adjustedShape;
            }
            return stepShape;
        } else {
            console.error("Something in OCCT went wrong trying to read " + fileName);
        }
        return undefined;
    }
}
