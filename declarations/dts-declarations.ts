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
                readonly logic: Logic;
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
        export const math: Bit.MathBitByBit;
        export const logic: Bit.Logic;
        export const lists: Bit.Lists;
        export const text: Bit.TextBitByBit;
        export const json: Bit.JSONBitByBit;
        export const vector: Bit.Vector;
        export const draw: Bit.Draw;
        export const babylon: Bit.Babylon;
        export const point: Bit.Point;
        export const line: Bit.Line;
        export const polyline: Bit.Polyline;
        export const verb: Bit.Verb;
        export const color: Bit.Color;
        export const jscad: Bit.JSCAD;
        export const tag: Bit.Tag;
        export const time: Bit.Time;
        export const occt: Bit.OCCTW & Bit.OCCT;
        export const asset: Bit.Asset;
        `;

fs.writeFileSync('./declarations/bitbybit.d.ts', typescriptDeclarations);
fs.writeFileSync('./declarations/bitbybit-docs.d.ts', typescriptDeclarationsDocs);

