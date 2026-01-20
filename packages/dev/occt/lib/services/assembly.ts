// import { OccHelper } from "../occ-helper";
// import { BitbybitOcctModule, TDF_Label, TDF_LabelSequence, TDataStd_Name, TopoDS_Shape, XCAFDoc_ShapeTool } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
// import * as Inputs from "../api/inputs";

// type Assembly = {
//     name: string;
//     location?: any;
//     color?: any;
//     children: (Assembly | Part)[];
// };

// type Part = {
//     location?: any;
//     color?: any;
//     name: string;
// };

// export class OCCTAssembly {

//     constructor(
//         private readonly occ: BitbybitOcctModule,
//         private readonly och: OccHelper
//     ) {
//     }

//     scan(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>) {
//         const aDoc = new this.occ.Handle_TDocStd_Document_2(new this.occ.TDocStd_Document(new this.occ.TCollection_ExtendedString_1()));
//         const mainDoc = aDoc.get().Main();
//         const shapeTool = this.occ.XCAFDoc_DocumentTool.ShapeTool(mainDoc).get();
//         // const app = this.occ.XCAFApp_Application.GetApplication();

//         if (mainDoc.IsNull()) {
//             throw new Error("Document is null");
//         }

//         // const tool = new this.occ.Handle_XCAFDoc_ShapeTool_1().get();
//         // // const doc = this.occ.TDocStd_Document.Get;
//         shapeTool.AddShape(inputs.shape, true, false);
//         const traversed = this.traverseAssembly(shapeTool);
//         // shapeTool.delete();
//         return traversed;
//     }

//     traverseLabel(label: TDF_Label): (Assembly | Part) {
//         const att = new this.occ.Handle_TDF_Attribute_2(new this.occ.TDataStd_Name() as any);
//         label.FindAttribute_1(this.occ.TDataStd_Name.GetID(), att);
//         const name = this.occ.BitByBitDev.ConvertAsciiString(new this.occ.TCollection_AsciiString((att.get() as TDataStd_Name).Get(), 0));

//         const components = new this.occ.TDF_LabelSequence();
//         if (this.occ.XCAFDoc_ShapeTool.GetComponents(label, components, false)) {
//             const children: (Assembly | Part)[] = [];
//             for (let i = 1; i <= components.Length(); i++) {
//                 children.push(this.traverseLabel(components.Value(i)));
//             }
//             return {
//                 name,
//                 children
//             };
//         } else {
//             const referredShapeLabel = new this.occ.TDF_Label();
//             const shape = this.occ.XCAFDoc_ShapeTool.GetReferredShape(label, referredShapeLabel);
//             const location = this.occ.XCAFDoc_ShapeTool.GetLocation(label);
//             if (shape) {
//                 return this.traverseLabel(referredShapeLabel);
//             } else {
//                 return { location, name };
//             }
//         }
//     }

//     traverseAssembly(assembly: XCAFDoc_ShapeTool) {
//         const freeShapes = new this.occ.TDF_LabelSequence();
//         assembly.GetFreeShapes(freeShapes as TDF_LabelSequence);
//         const children: (Assembly | Part)[] = [];
//         for (let i = 1; i <= freeShapes.Length(); i++) {
//             children.push(this.traverseLabel(freeShapes.Value(i)));
//         }
//         return children;
//     }

//     getShapeFromTDFLabel() {
//         const aDoc = new this.occ.Handle_TDocStd_Document_2(new this.occ.TDocStd_Document(new this.occ.TCollection_ExtendedString_1()));
//         const mainDoc = aDoc.get().Main();
//         const shapeTool = this.occ.XCAFDoc_DocumentTool.ShapeTool(mainDoc).get();
//         shapeTool.GetShapes()
//     }


// }
