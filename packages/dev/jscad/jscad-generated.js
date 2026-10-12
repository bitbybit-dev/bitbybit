import modeling from "@jscad/modeling";
import IOUTILS from "@jscad/io-utils";
import STLSERIALIZER from "@jscad/stl-serializer";
import DXFSERIALIZER from "@jscad/dxf-serializer";

export default function initJSCAD() {
    return { ...modeling, IOUTILS, STLSERIALIZER, DXFSERIALIZER };
}
