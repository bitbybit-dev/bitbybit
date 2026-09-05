import { TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { Inputs, OCCTTransforms } from "./index";
import * as Models from "./api/models";

/**
 * What a value looks like after ShapeParser.parse: every shape object in it has been replaced by
 * the id it was registered under, everything else keeps its type.
 */
export type WithShapeIds<T> = T extends TopoDS_Shape ? string : T extends object ? { [K in keyof T]: WithShapeIds<T[K]> } : T;

export class ShapeParser {

    static parse<T>(obj: T, partShapes: Models.OCCT.ShapeWithId<TopoDS_Shape>[], prefix: string): WithShapeIds<T> {
        const stack: unknown[] = [obj];
        let index = 0;
        while (stack.length > 0) {
            const current = stack.pop();

            if (typeof current !== "object" || current === null) {
                continue; // Skip non-object values
            }
            if (Array.isArray(current)) {
                for (let i = 0; i < current.length; i++) {
                    stack.push(current[i]); // Push array elements onto the stack
                }
            } else {
                const keys = Object.keys(current);

                if (keys.includes("shapes")) {
                    const shapes = (current as { shapes?: unknown }).shapes;

                    if (typeof shapes === "object" && shapes !== null) {
                        for (const key in shapes) {
                            const sh = (shapes as Record<string, unknown>)[key];
                            if (sh) {
                                if (typeof (shapes as Record<string, unknown>)[key] !== "string") {
                                    let id;
                                    if ((current as { id?: unknown }).id) {
                                        id = `${prefix}-${(current as { id?: unknown }).id}-${key}-${index}`;
                                    } else {
                                        id = `${prefix}-${key}-${index}`;
                                    }
                                    partShapes.push({ id, shape: sh as TopoDS_Shape });
                                    (shapes as Record<string, unknown>)[key] = id;
                                }
                                index++;
                            }
                        }
                    }
                }
                for (const key in current) {
                    stack.push((current as Record<string, unknown>)[key]); // Push object properties onto the stack
                }
            }
        }
        return obj as unknown as WithShapeIds<T>;
    }

    static alignAndTranslateShapesWithChildren<T extends { 
        shapes?: { [x: string]: TopoDS_Shape }, 
        rotation?: number,  direction?: Inputs.Base.Vector3, center?: Inputs.Base.Point3, scale?: Inputs.Base.Vector3, }>(part: T, transforms: OCCTTransforms, rotation: number, direction: Inputs.Base.Vector3, center: Inputs.Base.Point3, scale: Inputs.Base.Vector3 = [1, 1, 1]): T {
        const partCloned = ShapeParser.deepCopy(part);
        partCloned.rotation = rotation;
        partCloned.direction = direction;
        partCloned.center = center;
        partCloned.scale = scale;

        if (partCloned.shapes) {
            Object.keys(partCloned.shapes).forEach(key => {
                const sh = partCloned.shapes[key];
                if (sh) {
                    const rotated = transforms.rotate({ shape: sh, angle: rotation, axis: [0, 1, 0] });
                    const aligned = transforms.alignAndTranslate({ shape: rotated, direction, center });
                    if (scale[0] !== 1 || scale[1] !== 1 || scale[2] !== 1) {
                        partCloned.shapes[key] = transforms.scale3d({ shape: aligned, scale, center });
                        aligned.delete();
                    } else {
                        partCloned.shapes[key] = aligned;
                    }
                    rotated.delete();
                }
            });
        }

        Object.keys(partCloned).forEach(key => {
            const sh = (partCloned as Record<string, unknown>)[key];
            if (sh && Array.isArray(sh)) {
                (partCloned as Record<string, unknown>)[key] = sh.map((s) => {
                    if (s && typeof s === "object" && s !== null) {
                        if (s.shapes) {
                            const updatedShape = this.alignAndTranslateShapesWithChildren<T>(s, transforms, rotation, direction, center, scale);
                            return updatedShape;
                        }
                        else {
                            return s;
                        }
                    } else {
                        return s;
                    }
                });
            } else if (sh && typeof sh === "object" && sh !== null) {
                if ((sh as { shapes?: unknown }).shapes) {
                    (partCloned as Record<string, unknown>)[key] = this.alignAndTranslateShapesWithChildren<T>(sh as T, transforms, rotation, direction, center, scale);
                }
            }
        });
        return partCloned;
    }

    static deleteAllShapes<T extends { shapes?: { [x: string]: TopoDS_Shape } }>(part: T) {
        const shapes = part.shapes;
        if (shapes) {
            Object.keys(shapes).forEach(key => {
                shapes[key]!.delete();
            });
        }
        Object.keys(part).forEach(key => {
            const sh = (part as Record<string, unknown>)[key];
            if (sh && Array.isArray(sh)) {
                sh.forEach((s) => {
                    if (s && typeof s === "object" && s !== null) {
                        if (s.shapes) {
                            this.deleteAllShapes(s);
                        }
                    }
                });
            } else if (sh && typeof sh === "object" && sh !== null) {
                if ((sh as { shapes?: unknown }).shapes) {
                    this.deleteAllShapes(sh as T);
                }
            }
        });
    }

    static deepCopy<T extends { shapes?: { [x: string]: TopoDS_Shape } }>(part: T) {
        const clonedPart = { ...part, shapes: { ...part.shapes } };
        Object.keys(part).forEach(key => {
            const sh = (part as Record<string, unknown>)[key];
            if (sh && typeof sh === "object" && sh !== null) {
                if ((sh as { shapes?: unknown }).shapes) {
                    (clonedPart as Record<string, unknown>)[key] = this.deepCopy(sh as T);
                }
            } else if (sh && Array.isArray(sh)) {
                (clonedPart as Record<string, unknown>)[key] = sh.map((s) => {
                    if (s && typeof s === "object" && s !== null) {
                        if (s.shapes) {
                            return this.deepCopy(s);
                        }
                    }
                    return s;
                });
            }
        });
        return clonedPart;
    }

}