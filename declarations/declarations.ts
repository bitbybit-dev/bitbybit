import { inputDeclarations } from './declarationsInputs';
import { baseDeclarations } from './declarationsBase';
import { occtWorkerDeclarations } from './declarationsOCCTWorker';
import { inputOCCTDeclarations } from './declarationsOCCTInputs';


export const typescriptDeclarations = `
        declare namespace Bit {
            namespace Inputs {
                ${inputOCCTDeclarations}
                ${inputDeclarations}
            }

            ${occtWorkerDeclarations}
            ${baseDeclarations}

            class BitByBitBase {
                readonly draw: Draw;
                readonly babylon: Babylon;
                readonly vector: Vector;
                readonly point: Point;
                readonly line: Line;
                readonly polyline: Polyline;
                readonly jscad: JSCAD;
                readonly occt: OCCTW & OCCT;
                readonly logic: Logic;
                readonly math: MathBitByBit;
                readonly lists: Lists;
                readonly color: Color;
                readonly text: TextBitByBit;
                readonly json: JSONBitByBit;
                readonly verb: Verb;
                readonly tag: Tag;
                readonly time: Time;
                readonly asset: Asset;
            }
        }
        `;
