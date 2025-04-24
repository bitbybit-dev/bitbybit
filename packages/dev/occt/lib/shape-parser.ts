import { TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { Inputs, OCCTTransforms, Models } from "./index";

export class ShapeParser {

    static parse(obj, partShapes: Models.OCCT.ShapeWithId<TopoDS_Shape>[], prefix: string) {
        const stack = [obj];
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
                    const shapes = current.shapes;

                    if (typeof shapes === "object" && shapes !== null) {
                        for (const key in shapes) {
                            const sh = shapes[key];
                            if (sh) {
                                if (typeof shapes[key] !== "string") {
                                    let id;
                                    if (current.id) {
                                        id = `${prefix}-${current.id}-${key}-${index}`;
                                    } else {
                                        id = `${prefix}-${key}-${index}`;
                                    }
                                    partShapes.push({ id, shape: sh });
                                    shapes[key] = id;
                                }
                                index++;
                            }
                        }
                    }
                }
                for (const key in current) {
                    stack.push(current[key]); // Push object properties onto the stack
                }
            }
        }
        return obj;
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
            const sh = partCloned[key];
            if (sh && Array.isArray(sh)) {
                partCloned[key] = sh.map((s) => {
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
                if (sh.shapes) {
                    partCloned[key] = this.alignAndTranslateShapesWithChildren<T>(sh, transforms, rotation, direction, center, scale);
                }
            }
        });
        return partCloned;
    }

    static deleteAllShapes<T extends { shapes?: { [x: string]: TopoDS_Shape } }>(part: T) {
        Object.keys(part.shapes).forEach(key => {
            part.shapes[key].delete();
        });
        Object.keys(part).forEach(key => {
            const sh = part[key];
            if (sh && Array.isArray(sh)) {
                sh.forEach((s) => {
                    if (s && typeof s === "object" && s !== null) {
                        if (s.shapes) {
                            this.deleteAllShapes(s);
                        }
                    }
                });
            } else if (sh && typeof sh === "object" && sh !== null) {
                if (sh.shapes) {
                    this.deleteAllShapes(sh);
                }
            }
        });
    }

    static deepCopy<T extends { shapes?: { [x: string]: TopoDS_Shape } }>(part: T) {
        const clonedPart = { ...part, shapes: { ...part.shapes } };
        Object.keys(part).forEach(key => {
            const sh = part[key];
            if (sh && typeof sh === "object" && sh !== null) {
                if (sh.shapes) {
                    clonedPart[key] = this.deepCopy(sh);
                }
            } else if (sh && Array.isArray(sh)) {
                clonedPart[key] = sh.map((s) => {
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