// The JSCAD kernel as one object: @jscad/modeling with the serializers the wrapper downloads
// through, under the names it reads them by. The packages are CommonJS, so each is default-
// imported (the module.exports object) - a namespace import of a CommonJS module surfaces only
// the exports Node can lex, which for @jscad/modeling is one of fourteen.
import modeling from "@jscad/modeling";
import IOUTILS from "@jscad/io-utils";
import STLSERIALIZER from "@jscad/stl-serializer";
import DXFSERIALIZER from "@jscad/dxf-serializer";
import THREEMFSERIALIZER from "@jscad/3mf-serializer";

export default function initJSCAD() {
    return { ...modeling, IOUTILS, STLSERIALIZER, DXFSERIALIZER, THREEMFSERIALIZER };
}
