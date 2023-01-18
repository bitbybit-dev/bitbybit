import { OccHelper } from '../../occ-helper';
import { OpenCascadeInstance, TopoDS_Shape, TDF_Label, TDF_LabelSequence, XCAFDoc_ShapeTool } from '../../../../../bitbybit-dev-occt/bitbybit-dev-occt';
import * as Inputs from '../../../../api/inputs/inputs';

type Assembly = {
    name: string;
    location?: any;
    color?: any;
    children: (Assembly | Part)[];
};

type Part = {
    location?: any;
    color?: any;
    name: string;
};


export class OCCTAssembly {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    scan(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        const aDoc = new this.occ.Handle_TDocStd_Document_2(new this.occ.TDocStd_Document(new this.occ.TCollection_ExtendedString_1()));
        const mainDoc = aDoc.get().Main();
        const shapeTool = this.occ.XCAFDoc_DocumentTool.ShapeTool(mainDoc).get();
        // const app = this.occ.XCAFApp_Application.GetApplication();

        if(mainDoc.IsNull()){
            throw new Error('Document is null');
        }

        // const tool = new this.occ.Handle_XCAFDoc_ShapeTool_1().get();
        // // const doc = this.occ.TDocStd_Document.Get;
        shapeTool.AddShape(inputs.shape, true, false);
        const traversed = this.traverseAssembly(shapeTool);
        // shapeTool.delete();
        return traversed;
    }

    traverseLabel(label: TDF_Label): (Assembly | Part) {
        const att = new this.occ.Handle_TDF_Attribute_2(new this.occ.TDataStd_Name() as any);
        label.FindAttribute_1(this.occ.TDataStd_Name.GetID(), att);
        // @ts-ignore
        const name = this.occ.BitByBitDev.ConvertAsciiString(new this.occ.TCollection_AsciiString_13((att.get() as TDataStd_Name).Get(), 0));

        const components = new this.occ.TDF_LabelSequence_1();
        if (this.occ.XCAFDoc_ShapeTool.GetComponents(label, components, false)) {
            const children: (Assembly | Part)[] = [];
            for (let i = 1; i <= components.Length(); i++) {
                children.push(this.traverseLabel(components.Value(i)));
            }
            return {
                name,
                children
            }
        } else {
            const referredShapeLabel = new this.occ.TDF_Label();
            const shape = this.occ.XCAFDoc_ShapeTool.GetReferredShape(label, referredShapeLabel);
            const location = this.occ.XCAFDoc_ShapeTool.GetLocation(label);
            if (shape) {
                return this.traverseLabel(referredShapeLabel);
            } else {
                return { location, name };
            }
        }
    }

    traverseAssembly(assembly: XCAFDoc_ShapeTool) {
        const freeShapes = new this.occ.TDF_LabelSequence_1();
        assembly.GetFreeShapes(freeShapes as TDF_LabelSequence);
        const children = [];
        for (let i = 1; i <= freeShapes.Length(); i++) {
            children.push(this.traverseLabel(freeShapes.Value(i)));
        }
        return children;
    }


    addShapeToAssembly(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
        // BRep_Builder builder;
        const builder = new this.occ.BRep_Builder();
        // builder.Add()
        // builder.Add(existingAssembly, assembly);
        // const shell = this.och.getActualTypeOfShape(inputs.shape);
        // const builder = new this.occ.BRepBuilderAPI_MakeSolid_3(shell);
        // return builder.Solid();
    }

    nameAssembly(name: string) {
        // const naming = this.occ.TNaming_NamedShape
        // TopoDS_Shape assembly;

        // // Initialize the assembly

        // TNaming_NamedShape namedAssembly;
        // namedAssembly.Name(assembly);

        //         TopoDS_Shape assembly;

        // // Initialize the assembly

        // TNaming_NamedShape namedAssembly;
        // namedAssembly.Name(assembly);

        // // Retrieve the assembly by its name

        // TopoDS_Shape retrievedAssembly = TNaming_NamedShape::Get(namedAssembly.Name());
    }

    setColorOfShape() {
        // TopoDS_Shape shape;

        // // Initialize the shape

        // Graphic3d_MaterialAspect material;
        // material.SetColor(1.0, 0.0, 0.0); // Red color

        // BRep_Builder builder;
        // builder.SetColor(shape, material);
    }

    traverse() {
        //         TopExp_Explorer explorer;
        //         for (explorer.Init(shape, TopAbs_FACE); explorer.More(); explorer.Next()) {
        //             // Do something with the face
        //             const TopoDS_Face& face = TopoDS:: Face(explorer.Current());
        //         }

        //         TopTools_IndexedMapOfShape mapOfSubShapes;
        //         TopExp:: MapShapes(shape, mapOfSubShapes);

        //         for (int i = 1; i <= mapOfSubShapes.Extent(); ++i)
        //         {
        //             const TopoDS_Shape& subShape = mapOfSubShapes.FindKey(i);
        //             // Do something with the sub-shape...
        //         }
        // To read the colors and names of the sub - shapes, you can use the Handle() method to get the graphical representation of the sub - shape and then use the Graphic3d_AspectFillArea3d class to access its properties.For example:

        // Copy code
        //         Handle(Graphic3d_AspectFillArea3d) aspect = Handle(Graphic3d_AspectFillArea3d):: DownCast(subShape.TShape() -> DynamicType() -> GraphicType(subShape.TShape() -> DynamicType(), subShape.Location()));
        //         if (!aspect.IsNull()) {
        //   // Get the color of the sub-shape
        //   Quantity_Color color = aspect -> Aspect() -> Color();

        //   // Get the name of the sub-shape
        //   TCollection_AsciiString name = subShape.TShape() -> DynamicType() -> Name();
        //         }
    }

    readColorsAndNames() {

        // Handle(AIS_InteractiveObject) io = Handle(AIS_InteractiveObject)::DownCast(subShape.TShape()->DynamicType()->GraphicType(subShape.TShape()->DynamicType(), subShape.Location()));
        // if (!io.IsNull())
        // {
        // // Get the color of the sub-shape
        // Quantity_Color color = io->Color();

        // // Get the name of the sub-shape
        // TCollection_AsciiString name = io->Name();
        // }
    }

    referenceAssembly() {
        //         // Create a new document
        // Handle(TDocStd_Document) doc = new TDocStd_Document("MDTV-CAF");

        // // Get the application object
        // Handle(XCAFApp_Application) app = XCAFApp_Application::GetApplication();

        // // Create a new assembly in the document
        // Handle(XCAFDoc_Assembly) assembly1;
        // app->NewAssembly(doc->Main(), assembly1);

        // // Create another assembly in the document
        // Handle(XCAFDoc_Assembly) assembly2;
        // app->NewAssembly(doc->Main(), assembly2);

        // // Add assembly2 as a component of assembly1
        // assembly1->AddComponent(assembly2->Label());

        //         Assembly1
        // |
        // +-- Component1
        // |   |
        // |   +-- Subcomponent1
        // |   |
        // |   +-- Subcomponent2
        // |
        // +-- Component2
        //     |
        //     +-- Subcomponent3

    }

    iterate() {
        // Get the shape tool
        // Handle(XCAFDoc_ShapeTool) shapeTool = XCAFDoc_DocumentTool::ShapeTool(doc->Main());

        // // Convert assembly1 to a TopoDS_Shape
        // TopoDS_Shape assembly1Shape = shapeTool->GetShape(assembly1->Label());

        // // Convert assembly2 to a TopoDS_Shape
        // TopoDS_Shape assembly2Shape = shapeTool->GetShape(assembly2->Label());

        // // Iterate over the components of assembly1
        // for (XCAFDoc_Assembly::Iterator it(assembly1); it.More(); it.Next()) {
        //   TDF_Label componentLabel = it.Value();
        //   TopoDS_Shape componentShape = shapeTool->GetShape(componentLabel);

        //   // Check if the component is assembly2
        //   if (componentShape.IsEqual(assembly2Shape)) {
        //     // Do something with assembly2Shape
        //   }
        // }
    }

    getShapeFromTDFLabel() {
        //         // Get the shape tool
        //         Handle(XCAFDoc_ShapeTool) shapeTool = XCAFDoc_DocumentTool:: ShapeTool(doc -> Main());

        // // Get the label of the part
        // TDF_Label partLabel = ...;

        // // Convert the part to a TopoDS_Shape
        // TopoDS_Shape partShape = shapeTool -> GetShape(partLabel);
    }

    readAssemblyDataFromFile() {
        // Read the STEP file using the STEPControl_Reader
        // STEPControl_Reader reader;
        // reader.ReadFile(filename);
        // reader.TransferRoots();

        // // Get the root shape of the assembly
        // TopoDS_Shape rootShape = reader.OneShape();

        // // Import the shape into the XCAF framework
        // Handle(XCAFDoc_ShapeTool) shapeTool = XCAFDoc_DocumentTool::ShapeTool(doc->Main());
        // TDF_Label rootLabel = shapeTool->ImportShape(rootShape);

        // // Check if the root shape represents an assembly
        // if (shapeTool->IsAssembly(rootLabel)) {
        //   // Get the assembly object
        //   Handle(XCAFDoc_Assembly) assembly = XCAFDoc_Assembly::GetAssembly(rootLabel);

        //   // Iterate over the components of the assembly
        //   for (XCAFDoc_Assembly::Iterator it(assembly); it.More(); it.Next()) {
        //     TDF_Label componentLabel = it.Value();
        //     // Do something with the component
        //   }
        // }
        // This code reads a STEP file using the STEPControl_Reader class, gets the root TopoDS_Shape object of the assembly, and imports it into the XCAF framework. It then checks if the root shape represents an assembly and, if it does, gets the XCAFDoc_Assembly object and iterates over its components.

        // I hope this helps! Let me know if you have any questions.
    }

    parseAssemblyAndReadColors() {
        // #include <iostream>
        // #include <map>
        // #include <string>
        // #include <TopoDS_Shape.hxx>
        // #include <XCAFDoc_DocumentTool.hxx>
        // #include <XCAFDoc_ShapeTool.hxx>
        // #include <XCAFDoc_ColorTool.hxx>
        // #include <TDocStd_Document.hxx>
        // #include <STEPCAFControl_Reader.hxx>

        // // Define a struct to store the metadata for each assembly
        // struct AssemblyMetadata {
        //   std::string name;
        //   Quantity_Color color;
        // };

        // // Define a function to parse the assembly tree and collect the metadata
        // std::map<std::string, AssemblyMetadata> collectAssemblyMetadata(
        //     const Handle_TDocStd_Document& doc) {
        //   // Create a map to store the metadata for each assembly in the tree
        //   std::map<std::string, AssemblyMetadata> metadata;
        //   // Get the shape tool from the document
        //   Handle_XCAFDoc_ShapeTool shape_tool = XCAFDoc_DocumentTool::ShapeTool(doc->Main());
        //   // Create an iterator to traverse the subassemblies of the root assembly
        //   for (TopoDS_Iterator it(shape_tool->GetShape()); it.More(); it.Next()) {
        //     // Get the label for the current subassembly
        //     TDF_Label subassembly_label = shape_tool->FindShape(it.Value());
        //     // Get the name and color attributes for the current subassembly
        //     TCollection_ExtendedString name;
        //     Quantity_Color color;
        //     if (shape_tool->GetName(subassembly_label, name)) {
        //       if (XCAFDoc_ColorTool::GetColor(subassembly_label, XCAFDoc_ColorGen, color)) {
        //         // Add the name and color to the metadata for the current subassembly
        //         AssemblyMetadata data = {name.ToExtString(), color};
        //         metadata[name.ToExtString()] = data;
        //       }
        //     }
        //   }
        //   // Return the metadata for all assemblies in the tree
        //   return metadata;
        // }

        // int main() {
        //   // Create a new document
        //   Handle_TDocStd_Document doc = new TDocStd_Document();
        //   // Create a reader to load the document from a file
        //   STEPCAFControl_Reader reader;
        //   // Load the document from a file
        //   reader.ReadFile(doc, "/path/to/assembly.stp");
        //   // Collect the metadata for the assemblies in the document
        //   std::map<std::string, AssemblyMetadata> metadata = collectAssemblyMetadata(doc);
        //   // Print the metadata for each assembly
        //   for (const auto& [name, data] : metadata) {
        //     std::cout << "Assembly name: " << data.name << std::endl;
        //     std::cout << "Assembly color: "
        //               << data.color.Red() << " "
        //               << data.color.Green() << " "
        //               << data.color.Blue() << std::endl;
    }
}
