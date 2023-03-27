import { inputDeclarations } from './declarationsInputs';
import { baseDeclarations } from './declarationsBase';
import { occtWorkerDeclarations } from './declarationsOCCTWorker';
import { inputOCCTDeclarations } from './declarationsOCCTInputs';
var fs = require('fs');

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
                readonly text: TextBitByBit;
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
export const typescriptDeclarationsDocs = `
        declare namespace Bit {
            namespace Inputs {
                ${inputOCCTDeclarations}
                ${inputDeclarations}
            }

            ${occtWorkerDeclarations}
            ${baseDeclarations}
        }
        const math: Bit.MathBitByBit;
        const lists: Bit.Lists;
        const text: Bit.TextBitByBit;
        const json: Bit.JSONBitByBit;
        const vector: Bit.Vector;
        const draw: Bit.Draw;
        const babylon: Bit.Babylon;
        const point: Bit.Point;
        const line: Bit.Line;
        const polyline: Bit.Polyline;
        const verb: Bit.Verb;
        const color: Bit.Color;
        const jscad: Bit.JSCAD;
        const tag: Bit.Tag;
        const time: Bit.Time;
        const occt: Bit.OCCTW & Bit.OCCT;
        const asset: Bit.Asset;
        `;

fs.writeFileSync('./declarations/bitbybit.d.ts', typescriptDeclarations);
fs.writeFileSync('./declarations/bitbybit-docs.d.ts', typescriptDeclarationsDocs);

