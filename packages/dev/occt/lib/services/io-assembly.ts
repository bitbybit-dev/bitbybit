import { 
    BitbybitOcctModule, 
    TopoDS_Shape, 
    TopAbs_ShapeEnum, 
    gp_Trsf,
    gp_Mat,
    TDF_Label,
    TDF_LabelSequence,
    Handle_XCAFDoc_ShapeTool,
    Handle_XCAFDoc_ColorTool,
    Handle_XCAFDoc_MaterialTool,
    Handle_TDocStd_Document,
    TDocStd_Document,
    XCAFDoc_ShapeTool,
    XCAFDoc_ColorTool,
    XCAFDoc_MaterialTool,
    Quantity_Color,
    Standard_GUID,
    Handle_TDF_Attribute,
    TopLoc_Location,
    EmbindEnumValue
} from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs/inputs";

export interface AssemblyComponent {
    id: string;
    name: string;
    type: "assembly" | "part";
    shape?: TopoDS_Shape;
    children: AssemblyComponent[];
    transformation: {
        translation: [number, number, number];
        rotation: [number, number, number, number]; // quaternion
        scale: [number, number, number];
        matrix: number[]; // 4x4 transformation matrix
    };
    properties: {
        volume?: number;
        surfaceArea?: number;
        centerOfMass?: [number, number, number];
        boundingBox?: {
            min: [number, number, number];
            max: [number, number, number];
        };
    };
    attributes: {
        material?: string;
        density?: number;
        mass?: number;
        [key: string]: any;
    };
    color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    pmi?: PMIData[];
}

export interface PMIData {
    type: "dimension" | "tolerance" | "annotation" | "feature";
    text: string;
    position: [number, number, number];
    direction: [number, number, number];
    properties: { [key: string]: any };
}

export interface AssemblyStructure {
    version: string;
    units: string;
    root: AssemblyComponent;
    metadata: {
        totalParts: number;
        totalAssemblies: number;
        createdAt: string;
        source: string;
    };
}

export class OCCTIOAssembly {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    // Add a property to cache color assignments
    private colorAssignments: Map<string, AssemblyComponent["color"]> = new Map();

    private parseComponentWithXCAF(
        shape: TopoDS_Shape,
        label: TDF_Label,
        shapeTool: XCAFDoc_ShapeTool,
        colorTool: XCAFDoc_ColorTool,
        name: string,
        level: number
    ): AssemblyComponent {
        const id = this.generateId();
        const isAssembly = this.occ.XCAFDoc_ShapeTool_IsAssembly(label);

        const component: AssemblyComponent = {
            id,
            name: this.extractNameFromLabel(label) || name || `${isAssembly ? "Assembly" : "Part"}_${id}`,
            type: isAssembly ? "assembly" : "part",
            shape: shape,
            children: [],
            transformation: this.extractTransformation(shape),
            properties: this.extractProperties(shape),
            attributes: this.extractAttributesFromXCAF(label),
            color: this.extractColorFromXCAF(shape, label, colorTool),
            pmi: this.extractPMI(shape)
        };

        if (isAssembly) {
            component.children = this.extractChildrenWithXCAF(label, shapeTool, colorTool, level + 1);
        }

        return component;
    }

    private extractChildrenWithXCAF(
        assemblyLabel: TDF_Label,
        shapeTool: XCAFDoc_ShapeTool,
        colorTool: XCAFDoc_ColorTool,
        level: number
    ): AssemblyComponent[] {
        const children: AssemblyComponent[] = [];

        // Get components of the assembly
        const components = new this.occ.TDF_LabelSequence();
        this.occ.XCAFDoc_ShapeTool_GetComponents(assemblyLabel, components, false);

        for (let i = 1; i <= components.Length(); i++) {
            const componentLabel = components.Value(i);

            // Get the referenced shape
            const referredLabel = new this.occ.TDF_Label();
            if (this.occ.XCAFDoc_ShapeTool_GetReferredShape(componentLabel, referredLabel)) {
                const componentShape = new this.occ.TopoDS_Shape();
                if (this.occ.XCAFDoc_ShapeTool_GetShape_1(referredLabel, componentShape)) {

                    // Get the location/transformation for this component instance
                    const location = this.occ.XCAFDoc_ShapeTool_GetLocation(componentLabel);

                    if (location && !location.IsIdentity()) {
                        // Apply the location to the shape
                        const locatedShape = componentShape.Located(location, false);

                        const childComponent = this.parseComponentWithXCAF(
                            locatedShape,
                            referredLabel,
                            shapeTool,
                            colorTool,
                            `Component_${level}_${i - 1}`,
                            level
                        );

                        children.push(childComponent);

                        // Clean up
                        locatedShape.delete();
                    } else {
                        // No specific location, use shape as-is
                        const childComponent = this.parseComponentWithXCAF(
                            componentShape,
                            referredLabel,
                            shapeTool,
                            colorTool,
                            `Component_${level}_${i - 1}`,
                            level
                        );
                        children.push(childComponent);
                    }

                    componentShape.delete();
                }
                referredLabel.delete();
            }
            componentLabel.delete();
        }

        components.delete();
        return children;
    }

    private extractColorFromXCAF(shape: TopoDS_Shape, label: TDF_Label, colorTool: XCAFDoc_ColorTool): AssemblyComponent["color"] | undefined {
        try {
            const color = new this.occ.Quantity_Color();
            if (colorTool.GetColor_1(label, color)) {
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                return result;
            }
            if (colorTool.GetColor_1(label, color)) {
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                return result;
            }
            if (colorTool.GetColor_7(shape, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorSurf, color)) {
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                return result;
            }
            if (colorTool.GetColor_7(shape, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorCurv, color)) {
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                return result;
            }
            if (colorTool.GetColor_7(shape, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorGen, color)) {
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                return result;
            }
            const subShapeColor = this.extractSubShapeColor(shape, colorTool);
            if (subShapeColor) {
                color.delete();
                return subShapeColor;
            }

            color.delete();
        } catch (error) {
            console.warn("Error extracting XCAF color:", error);
        }

        return undefined;
    }

    private convertQuantityColorToRgba(color: any): AssemblyComponent["color"] {
        return {
            r: Math.round(color.Red() * 255) / 255,
            g: Math.round(color.Green() * 255) / 255,
            b: Math.round(color.Blue() * 255) / 255,
            a: 1.0
        };
    }

    private extractSubShapeColor(shape: TopoDS_Shape, colorTool: XCAFDoc_ColorTool): AssemblyComponent["color"] | undefined {
        try {
            const faceExplorer = new this.occ.TopExp_Explorer(shape, this.occ.TopAbs_ShapeEnum.FACE as any, this.occ.TopAbs_ShapeEnum.SHAPE as any);

            while (faceExplorer.More()) {
                const face = this.occ.CastToFace(faceExplorer.Current());
                const color = new this.occ.Quantity_Color();

                if (colorTool.GetColor_7(face, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorSurf, color)) {
                    const result = this.convertQuantityColorToRgba(color);
                    color.delete();
                    face.delete();
                    faceExplorer.delete();
                    return result;
                }

                color.delete();
                face.delete();
                faceExplorer.Next();
            }

            faceExplorer.delete();
        } catch (error) {
            console.warn("Error extracting sub-shape color:", error);
        }
        return undefined;
    }

    private extractNameFromLabel(label: TDF_Label): string | undefined {
        try {
            // Try to get name attribute from the label using correct API
            const nameAttrHandle = new this.occ.Handle_TDF_Attribute();
            const nameID = this.occ.TDataStd_Name.GetID();

            if (label.FindAttribute_1(nameID, nameAttrHandle)) {
                try {
                    const TCollection_ExtendedString = (nameAttrHandle.get() as any).Get();
                    const nameString = new this.occ.TCollection_AsciiString(TCollection_ExtendedString, 0).ToCString();
                    nameAttrHandle.delete();
                    return nameString && nameString.trim() !== "" ? nameString.trim() : undefined;
                } catch (convertError) {
                    console.warn("Error converting TCollection_ExtendedString:", convertError);
                }
            }
            nameAttrHandle.delete();
        } catch (error) {
            console.warn("Error extracting name:", error);
        }
        return undefined;
    }

    private extractAttributesFromXCAF(label: TDF_Label): AssemblyComponent["attributes"] {
        const attributes: AssemblyComponent["attributes"] = {};

        try {
            // Try to extract various attributes from the label
            // This is where you would extract material properties, custom attributes, etc.

            // Example: Extract density if available using the correct FindAttribute method
            const realAttrHandle = new this.occ.Handle_TDF_Attribute();
            const realID = new this.occ.TDataStd_Real().ID();

            if (label.FindAttribute_1(realID, realAttrHandle)) {
                const realData = (this.occ.TDataStd_Real as any).DownCast(realAttrHandle);
                // Cast the attribute to the correct type
                if (realData && !realData.IsNull()) {
                    attributes.density = realData.Get();
                    realData.delete();
                }
            }
            realAttrHandle.delete();

        } catch (error) {
            console.warn("Error extracting attributes:", error);
        }

        return attributes;
    }

    private extractProperties(shape: TopoDS_Shape): AssemblyComponent["properties"] {
        const properties: AssemblyComponent["properties"] = {};

        try {
            // Calculate volume
            const gprops = new this.occ.GProp_GProps();
            this.occ.BRepGProp_VolumeProperties(shape, gprops);
            properties.volume = gprops.Mass();

            // Calculate center of mass
            const centerOfMass = gprops.CentreOfMass();
            properties.centerOfMass = [
                centerOfMass.X(),
                centerOfMass.Y(),
                centerOfMass.Z()
            ];

            gprops.delete();
            centerOfMass.delete();

            // Calculate surface area
            const surfaceGprops = new this.occ.GProp_GProps();
            this.occ.BRepGProp_SurfaceProperties(shape, surfaceGprops);
            properties.surfaceArea = surfaceGprops.Mass();
            surfaceGprops.delete();

            // Calculate bounding box
            const bbox = new this.occ.Bnd_Box();
            this.occ.BRepBndLib.Add(shape, bbox, false);

            const corner1 = bbox.CornerMin();
            const corner2 = bbox.CornerMax();

            properties.boundingBox = {
                min: [corner1.X(), corner1.Y(), corner1.Z()],
                max: [corner2.X(), corner2.Y(), corner2.Z()]
            };

            bbox.delete();
            corner1.delete();
            corner2.delete();
        } catch (error) {
            console.warn("Error extracting properties:", error);
        }

        return properties;
    }

    private extractPMI(shape: TopoDS_Shape): PMIData[] {
        const pmiData: PMIData[] = [];

        try {
            // Try to extract PMI data using XCAF dimension and tolerance tools
            // Note: This requires access to XCAFDoc_DimTolTool which may not be available in all OCCT builds

            // Extract annotations if available
            this.extractAnnotationsFromShape(shape, pmiData);

        } catch (error) {
            console.warn("Error extracting PMI data:", error);
        }

        return pmiData;
    }

    private extractAnnotationsFromShape(shape: TopoDS_Shape, pmiData: PMIData[]): void {
        try {
            // This would require access to annotation tools in XCAF
            // For now, we'll add placeholder logic for common annotations

            // Check if shape has cylindrical features (holes, pins)
            this.extractCylindricalFeatures(shape, pmiData);

        } catch (error) {
            console.warn("Error extracting annotations:", error);
        }
    }

    private extractCylindricalFeatures(shape: TopoDS_Shape, pmiData: PMIData[]): void {
        try {
            const faceExplorer = new this.occ.TopExp_Explorer(
                shape,
                this.occ.TopAbs_ShapeEnum.FACE as any,
                this.occ.TopAbs_ShapeEnum.SHAPE as any
            );

            while (faceExplorer.More()) {
                const face = this.occ.CastToFace(faceExplorer.Current());

                // Check if face is cylindrical
                const surface = this.occ.BRep_Tool_Surface(face);
                const surfaceType = (surface.get().DynamicType() as any).Name();

                if (surfaceType.includes("Cylinder")) {
                    // Extract cylinder properties
                    const cylinderSurf = surface.get();
                    // Get cylinder axis and radius information
                    const props = new this.occ.GProp_GProps();
                    this.occ.BRepGProp_SurfaceProperties(face, props);

                    const centerOfMass = props.CentreOfMass();

                    pmiData.push({
                        type: "feature",
                        text: "Cylindrical Feature",
                        position: [centerOfMass.X(), centerOfMass.Y(), centerOfMass.Z()],
                        direction: [0, 0, 1],
                        properties: {
                            type: "cylinder",
                            surfaceArea: props.Mass()
                        }
                    });

                    props.delete();
                    centerOfMass.delete();
                }

                surface.delete();
                face.delete();
                faceExplorer.Next();
            }

            faceExplorer.delete();
        } catch (error) {
            console.warn("Error extracting cylindrical features:", error);
        }
    }

    private extractTransformation(shape: TopoDS_Shape): AssemblyComponent["transformation"] {
        // Extract transformation matrix from shape location
        const location = shape.Location();
        const transformation = location.Transformation();

        // Get translation
        const translation = transformation.TranslationPart();
        const translationArray: [number, number, number] = [
            translation.X(),
            translation.Y(),
            translation.Z()
        ];

        // Get rotation matrix and convert to quaternion
        const rotationMatrix = this.occ.gp_Trsf_HVectorialPart(transformation);
        const quaternion = this.matrixToQuaternion(rotationMatrix);

        // Get scale (OCCT doesn't typically store non-uniform scale)
        const scale: [number, number, number] = [
            transformation.ScaleFactor(),
            transformation.ScaleFactor(),
            transformation.ScaleFactor()
        ];

        // Get full 4x4 matrix
        const matrix = this.extractTransformationMatrix(transformation);

        location.delete();
        transformation.delete();
        translation.delete();
        rotationMatrix.delete();

        return {
            translation: translationArray,
            rotation: quaternion,
            scale,
            matrix
        };
    }

    private extractTransformationMatrix(transformation: gp_Trsf): number[] {
        // Extract 4x4 transformation matrix from gp_Trsf
        const matrix = new Array(16).fill(0);

        try {
            // Get the 3x4 transformation matrix values
            const values = [
                [transformation.Value(1, 1), transformation.Value(1, 2), transformation.Value(1, 3), transformation.Value(1, 4)],
                [transformation.Value(2, 1), transformation.Value(2, 2), transformation.Value(2, 3), transformation.Value(2, 4)],
                [transformation.Value(3, 1), transformation.Value(3, 2), transformation.Value(3, 3), transformation.Value(3, 4)],
                [0, 0, 0, 1]
            ];

            // Flatten to 16-element array (column-major order)
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    matrix[col * 4 + row] = values[row][col];
                }
            }
        } catch (error) {
            console.warn("Error extracting transformation matrix:", error);
            // Return identity matrix as fallback
            matrix[0] = matrix[5] = matrix[10] = matrix[15] = 1;
        }

        return matrix;
    }

    private matrixToQuaternion(rotMatrix: gp_Mat): [number, number, number, number] {
        try {
            // Extract quaternion from 3x3 rotation matrix
            const m11 = rotMatrix.Value(1, 1);
            const m12 = rotMatrix.Value(1, 2);
            const m13 = rotMatrix.Value(1, 3);
            const m21 = rotMatrix.Value(2, 1);
            const m22 = rotMatrix.Value(2, 2);
            const m23 = rotMatrix.Value(2, 3);
            const m31 = rotMatrix.Value(3, 1);
            const m32 = rotMatrix.Value(3, 2);
            const m33 = rotMatrix.Value(3, 3);

            // Convert rotation matrix to quaternion
            const trace = m11 + m22 + m33;
            let x, y, z, w;

            if (trace > 0) {
                const s = Math.sqrt(trace + 1.0) * 2;
                w = 0.25 * s;
                x = (m32 - m23) / s;
                y = (m13 - m31) / s;
                z = (m21 - m12) / s;
            } else if (m11 > m22 && m11 > m33) {
                const s = Math.sqrt(1.0 + m11 - m22 - m33) * 2;
                w = (m32 - m23) / s;
                x = 0.25 * s;
                y = (m12 + m21) / s;
                z = (m13 + m31) / s;
            } else if (m22 > m33) {
                const s = Math.sqrt(1.0 + m22 - m11 - m33) * 2;
                w = (m13 - m31) / s;
                x = (m12 + m21) / s;
                y = 0.25 * s;
                z = (m23 + m32) / s;
            } else {
                const s = Math.sqrt(1.0 + m33 - m11 - m22) * 2;
                w = (m21 - m12) / s;
                x = (m13 + m31) / s;
                y = (m23 + m32) / s;
                z = 0.25 * s;
            }

            return [x, y, z, w];
        } catch (error) {
            console.warn("Error converting matrix to quaternion:", error);
            return [0, 0, 0, 1]; // Identity quaternion
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    private countComponents(component: AssemblyComponent, callback: (comp: AssemblyComponent) => void): void {
        callback(component);
        component.children.forEach(child => this.countComponents(child, callback));
    }

    // Utility method to serialize the assembly structure to JSON string
    serializeAssembly(assembly: AssemblyStructure): string {
        // Remove OCCT shape objects before serialization
        const cleanAssembly = this.cleanAssemblyForSerialization(assembly);
        return JSON.stringify(cleanAssembly, null, 2);
    }

    private cleanAssemblyForSerialization(assembly: AssemblyStructure): any {
        const clean = JSON.parse(JSON.stringify(assembly));

        const removeShapes = (component: any): any => {
            delete component.shape;
            if (component.children) {
                component.children = component.children.map(removeShapes);
            }
            return component;
        };

        clean.root = removeShapes(clean.root);
        return clean;
    }

    // New method for parsing XCAF documents with full metadata
    parseXCAFDocument(doc: TDocStd_Document): AssemblyStructure {
        const mainLabel = doc.Main();
        const shapeTool = this.occ.XCAFDoc_DocumentTool_ShapeTool(mainLabel).get();
        const colorTool = this.occ.XCAFDoc_DocumentTool_ColorTool(mainLabel).get();
        const materialTool = this.occ.XCAFDoc_DocumentTool_MaterialTool(mainLabel).get();

        // Build color assignment map
        this.buildColorAssignments(colorTool);

        // Get all free shapes (top-level assembly components)
        const freeShapes = new this.occ.TDF_LabelSequence();
        shapeTool.GetFreeShapes(freeShapes);

        let totalParts = 0;
        let totalAssemblies = 0;

        let rootComponent: AssemblyComponent;

        if (freeShapes.Length() === 1) {
            // Single root assembly
            const rootLabel = freeShapes.Value(1);
            const rootShape = new this.occ.TopoDS_Shape();

            if (this.occ.XCAFDoc_ShapeTool_GetShape_1(rootLabel, rootShape)) {
                rootComponent = this.parseXCAFComponent(
                    rootShape,
                    rootLabel,
                    shapeTool,
                    colorTool,
                    materialTool,
                    "root",
                    0
                );
                rootShape.delete();
            } else {
                // Fallback
                rootComponent = this.createEmptyRootComponent();
            }
        } else if (freeShapes.Length() > 1) {
            // Multiple top-level components - create virtual root
            rootComponent = this.createEmptyRootComponent();

            for (let i = 1; i <= freeShapes.Length(); i++) {
                const label = freeShapes.Value(i);
                const shape = new this.occ.TopoDS_Shape();

                if (this.occ.XCAFDoc_ShapeTool_GetShape_1(label, shape)) {
                    const component = this.parseXCAFComponent(
                        shape,
                        label,
                        shapeTool,
                        colorTool,
                        materialTool,
                        `Component_0_${i - 1}`,
                        1
                    );
                    rootComponent.children.push(component);
                    shape.delete();
                }
            }
        } else {
            // No free shapes - create empty root
            rootComponent = this.createEmptyRootComponent();
        }

        this.countComponents(rootComponent, (component) => {
            if (component.type === "part") totalParts++;
            else totalAssemblies++;
        });

        // Clean up
        freeShapes.delete();

        return {
            version: "1.0.0",
            units: "mm",
            root: rootComponent,
            metadata: {
                totalParts,
                totalAssemblies,
                createdAt: new Date().toISOString(),
                source: "STEP/XCAF"
            }
        };
    }

    private createEmptyRootComponent(): AssemblyComponent {
        return {
            id: this.generateId(),
            name: "root",
            type: "assembly",
            children: [],
            transformation: {
                translation: [0, 0, 0],
                rotation: [0, 0, 0, 1],
                scale: [1, 1, 1],
                matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            },
            properties: {},
            attributes: {},
            pmi: []
        };
    }

    private parseXCAFComponent(
        shape: TopoDS_Shape,
        label: TDF_Label,
        shapeTool: XCAFDoc_ShapeTool,
        colorTool: XCAFDoc_ColorTool,
        materialTool: XCAFDoc_MaterialTool,
        name: string,
        level: number
    ): AssemblyComponent {
        const id = this.generateId();
        const isAssembly = this.occ.XCAFDoc_ShapeTool_IsAssembly(label);

        const component: AssemblyComponent = {
            id,
            name: this.extractNameFromXCAFLabel(label) || name || `${isAssembly ? "Assembly" : "Part"}_${id}`,
            type: isAssembly ? "assembly" : "part",
            shape: shape,
            children: [],
            transformation: this.extractTransformation(shape),
            properties: this.extractProperties(shape),
            attributes: this.extractXCAFAttributes(label, materialTool),
            color: this.extractXCAFColor(shape, label, colorTool),
            pmi: this.extractPMI(shape)
        };

        if (isAssembly) {
            component.children = this.extractXCAFChildren(label, shapeTool, colorTool, materialTool, level + 1);
        }

        return component;
    }

    private extractXCAFChildren(
        assemblyLabel: TDF_Label,
        shapeTool: XCAFDoc_ShapeTool,
        colorTool: XCAFDoc_ColorTool,
        materialTool: XCAFDoc_MaterialTool,
        level: number
    ): AssemblyComponent[] {
        const children: AssemblyComponent[] = [];

        // Get components of the assembly
        const components = new this.occ.TDF_LabelSequence();
        this.occ.XCAFDoc_ShapeTool_GetComponents(assemblyLabel, components, false);

        for (let i = 1; i <= components.Length(); i++) {
            const componentLabel = components.Value(i);

            // Get the referenced shape
            const referredLabel = new this.occ.TDF_Label();
            if (this.occ.XCAFDoc_ShapeTool_GetReferredShape(componentLabel, referredLabel)) {
                const componentShape = new this.occ.TopoDS_Shape();
                if (this.occ.XCAFDoc_ShapeTool_GetShape_1(referredLabel, componentShape)) {

                    // Get the location/transformation for this component instance
                    const location = this.occ.XCAFDoc_ShapeTool_GetLocation(componentLabel);

                    let finalShape = componentShape;
                    if (location && !location.IsIdentity()) {
                        finalShape = componentShape.Located(location, false);
                    }

                    const childComponent = this.parseXCAFComponent(
                        finalShape,
                        referredLabel,
                        shapeTool,
                        colorTool,
                        materialTool,
                        `Component_${level}_${i - 1}`,
                        level
                    );

                    children.push(childComponent);

                    // Clean up
                    if (finalShape !== componentShape) {
                        finalShape.delete();
                    }
                    componentShape.delete();
                    if (location) {
                        location.delete();
                    }
                }
                referredLabel.delete();
            }
            componentLabel.delete();
        }

        components.delete();
        return children;
    }

    private extractNameFromXCAFLabel(label: TDF_Label): string | undefined {
        try {
            const nameID = this.occ.TDataStd_Name.GetID();
            const nameAttrHandle = new this.occ.Handle_TDF_Attribute();
            if (label.FindAttribute_1(nameID, nameAttrHandle)) {
                try {
                    const TCollection_ExtendedString = (nameAttrHandle.get() as any).Get();
                    const nameString = new this.occ.TCollection_AsciiString(TCollection_ExtendedString, 0).ToCString();
                    nameAttrHandle.delete();
                    if (nameString && nameString.trim() !== "") {
                        return nameString.trim();
                    }
                } catch (convertError) {
                    console.warn("Error converting TCollection_ExtendedString:", convertError);
                }
            }
            nameAttrHandle.delete();

        } catch (error) {
            console.warn("Error extracting XCAF name:", error);
        }
        return undefined;
    }

    private extractXCAFColor(shape: TopoDS_Shape, label: TDF_Label, colorTool: XCAFDoc_ColorTool): AssemblyComponent["color"] | undefined {
        try {
            let color = new this.occ.Quantity_Color();
            const colorRGB = new this.occ.Quantity_ColorRGBA();
            if (colorTool.GetColor_1(label, color)) {
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                return result;
            }
            if (colorTool.GetColor_2(label, colorRGB)) {
                color = colorRGB.GetRGB();
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                colorRGB.delete();
                return result;
            }
            if (colorTool.GetColor_7(shape, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorSurf, color)) {
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                return result;
            }
            if (colorTool.GetColor_8(shape, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorSurf, colorRGB)) {
                color = colorRGB.GetRGB();
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                colorRGB.delete();
                return result;
            }
            if (colorTool.GetColor_7(shape, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorCurv, color)) {
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                return result;
            }
            if (colorTool.GetColor_8(shape, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorCurv, colorRGB)) {
                color = colorRGB.GetRGB();
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                colorRGB.delete();
                return result;
            }
            if (colorTool.GetColor_7(shape, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorGen, color)) {
                const result = this.convertQuantityColorToRgba(color);
                color.delete();
                return result;
            }
            if (colorTool.GetColor_8(shape, this.occ.XCAFDoc_ColorType.XCAFDoc_ColorGen, colorRGB)) {
                color = colorRGB.GetRGB();
                const result = this.convertQuantityColorToRgba(color);
                colorRGB.delete();
                color.delete();
                return result;
            }
            const labelTag = String(label.Tag());
            if (this.colorAssignments.has(labelTag)) {
                return this.colorAssignments.get(labelTag);
            }
            const subShapeColor = this.extractSubShapeColor(shape, colorTool);
            if (subShapeColor) {
                color.delete();
                return subShapeColor;
            }

            color.delete();
        } catch (error) {
            console.warn("Error extracting XCAF color:", error);
        }

        return undefined;
    }


    private extractXCAFAttributes(
        label: TDF_Label,
        materialTool: XCAFDoc_MaterialTool
    ): AssemblyComponent["attributes"] {
        const attributes: AssemblyComponent["attributes"] = {};

        try {
            this.extractMaterialFromLabel(label, attributes);
            this.extractAdditionalMaterialProperties(label, attributes);

        } catch (error) {
            console.warn("Error extracting XCAF attributes:", error);
        }

        return attributes;
    }

    private extractMaterialFromLabel(label: TDF_Label, attributes: AssemblyComponent["attributes"]): void {
        try {
            const materialName = this.extractMaterialName(label);
            if (materialName) {
                attributes.material = materialName;
            }
            const density = this.extractMaterialDensity(label);
            if (density > 0) {
                attributes.density = density;
            }
            this.extractAdditionalMaterialProperties(label, attributes);
        } catch (error) {
            console.warn("Error extracting material from label:", error);
        }
    }

    private extractMaterialName(materialLabel: TDF_Label): string | undefined {
        try {
            const nameAttrHandle = new this.occ.Handle_TDF_Attribute();
            if (materialLabel.FindAttribute_1(this.occ.TDataStd_Name.GetID(), nameAttrHandle)) {
                try {
                    const TCollection_ExtendedString = (nameAttrHandle.get() as any).Get();
                    const nameString = new this.occ.TCollection_AsciiString(TCollection_ExtendedString, 0).ToCString();
                    nameAttrHandle.delete();
                    if (nameString && nameString.trim() !== "") {
                        return nameString.trim();
                    }
                } catch (convertError) {
                    console.warn("Error converting material name:", convertError);
                }
            }
            nameAttrHandle.delete();
        } catch (error) {
            console.warn("Error extracting material name:", error);
        }
        return undefined;
    }

    private extractMaterialDensity(materialLabel: TDF_Label): number {
        try {
            // Try to get density value from real attributes
            const realAttrHandle = new this.occ.Handle_TDF_Attribute();
            const realID = new this.occ.TDataStd_Real().ID();
            if (materialLabel.FindAttribute_1(realID, realAttrHandle)) {
                const attr = realAttrHandle.get();
                if (attr) {
                    try {
                        const density = (attr as any).Get();
                        realAttrHandle.delete();
                        return density;
                    } catch (accessError) {
                        console.warn("Error accessing density value:", accessError);
                    }
                }
            }
            realAttrHandle.delete();
        } catch (error) {
            console.warn("Error extracting material density:", error);
        }
        return 0;
    }

    private extractAdditionalMaterialProperties(label: TDF_Label, attributes: AssemblyComponent["attributes"]): void {
        try {
            const intAttrHandle = new this.occ.Handle_TDF_Attribute();
            const intID = new this.occ.TDataStd_Integer().ID();
            if (label.FindAttribute_1(intID, intAttrHandle)) {
                const attr = intAttrHandle.get();
                if (attr) {
                    try {
                        const materialId = (attr as any).Get();
                        attributes.materialId = materialId;
                    } catch (accessError) {
                        console.warn("Error accessing material ID:", accessError);
                    }
                }
            }
            intAttrHandle.delete();
        } catch (error) {
            console.warn("Error extracting additional material properties:", error);
        }
    }

    private buildColorAssignments(colorTool: XCAFDoc_ColorTool) {
        this.colorAssignments.clear();
        
        // Get all color labels
        const colorLabels = new this.occ.TDF_LabelSequence();
        colorTool.GetColors(colorLabels);
        
        for (let i = 1; i <= colorLabels.Length(); i++) {
            const colorLabel = colorLabels.Value(i);
            const color = new this.occ.Quantity_Color();
            
            if (colorTool.GetColor_1(colorLabel, color)) {
                this.colorAssignments.set(String(colorLabel.Tag()), this.convertQuantityColorToRgba(color));
            }
            
            color.delete();
            colorLabel.delete();
        }
        console.log(this.colorAssignments);
        colorLabels.delete();
    }
}