import { inputDeclarations } from '../../declarationsInputs';
import { baseDeclarations } from '../../declarationsBase';
import { occtWorkerDeclarations } from '../../declarationsOCCTWorker';
import { inputOCCTDeclarations } from '../../declarationsOCCTInputs';


export const typescriptDeclarations = `
        declare namespace Bit {
            namespace Inputs {
                ${inputOCCTDeclarations}
                ${inputDeclarations}
            }

            ${occtWorkerDeclarations}
            ${baseDeclarations}

            class BitByBitBase {
                readonly math: MathBitByBit;
                readonly lists: Lists;
                readonly text: Text;
                readonly json: JSONBitByBit;
                readonly vector: Vector;
                readonly draw: Draw;
                readonly babylon: Babylon;
                readonly point: Point;
                readonly line: Line;
                readonly polyline: Polyline;
                readonly verb: Verb;
                readonly color: Color;
                readonly jscad: JSCAD;
                readonly tag: Tag;
                readonly time: Time;
                readonly occt: OCCTW & OCCT;
                readonly asset: Asset;
            }
        }
        `;
