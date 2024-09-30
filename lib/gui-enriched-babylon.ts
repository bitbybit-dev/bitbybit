import { Texture, Color3 } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

export { GUI, Texture, Color3 };
// this is quite weird, but incorporating GUI into BABYLON namespace is necessary for good type definitions on the front side, will need to find better solutons later...
