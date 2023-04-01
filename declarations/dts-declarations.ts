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
export const typescriptDeclarationsDocs = `
        declare namespace Bit {
            namespace Inputs {
                ${inputOCCTDeclarations}
                ${inputDeclarations}
            }

            ${occtWorkerDeclarations}
            ${baseDeclarations}
        }
        export const draw: Bit.Draw;
        export const babylon: Bit.Babylon;
        export const vector: Bit.Vector;
        export const point: Bit.Point;
        export const line: Bit.Line;
        export const polyline: Bit.Polyline;
        export const jscad: Bit.JSCAD;
        export const occt: Bit.OCCTW & Bit.OCCT;
        export const logic: Bit.Logic;
        export const math: Bit.MathBitByBit;
        export const lists: Bit.Lists;
        export const color: Bit.Color;
        export const text: Bit.TextBitByBit;
        export const json: Bit.JSONBitByBit;
        export const verb: Bit.Verb;
        export const tag: Bit.Tag;
        export const time: Bit.Time;
        export const asset: Bit.Asset;
        `;

fs.writeFileSync('./declarations/bitbybit.d.ts', typescriptDeclarations);
fs.writeFileSync('./declarations/bitbybit-docs.d.ts', typescriptDeclarationsDocs);

