import { inputDeclarations } from './declarationsInputs';
import { baseDeclarations } from './declarationsBase';

export const typescriptDeclarations = `
        declare namespace Bit {
            namespace Inputs {
                ${inputDeclarations}
            }
            ${baseDeclarations}

            class BitByBitBase {
                readonly vector: Vector;
                readonly scene: Scene;
                readonly transforms: Transforms;
                readonly node: Node;
                readonly point: Point;
                readonly line: Line;
                readonly polyline: Polyline;
                readonly verb: Verb;
                readonly jscad: JSCAD;
                readonly tag: Tag;
                readonly time: Time;
                readonly occt: OCCT;
                readonly asset: Asset;
            }
        }
        `;
