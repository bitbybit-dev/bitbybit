import type { Base } from "@bitbybit-dev/base";
import { cross3, dot3, length3, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { PARALLEL_TOLERANCE } from "../build/constants";
import { directionOf, pointOf } from "../build/placement";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isReference } from "../step/values";
import { UnsupportedGeometryError } from "./errors";

const X_AXIS: Base.Vector3 = [1, 0, 0];
const Y_AXIS: Base.Vector3 = [0, 1, 0];
const Z_AXIS: Base.Vector3 = [0, 0, 1];
const SPATIAL_OPERATOR = "IfcCartesianTransformationOperator3D";

function optionalAttribute(model: ModelSnapshot, id: number, name: string): IfcValue {
    return model.schema.entity(model.entity(id).type).positions.has(name) ? model.attribute(id, name) : null;
}

function operatorAxis(model: ModelSnapshot, operator: number, name: string): Base.Vector3 | undefined {
    const value = optionalAttribute(model, operator, name);
    if (!isReference(value)) {
        return undefined;
    }
    const direction = directionOf(model, value, Z_AXIS);
    const length = length3(direction);
    if (!(length > 0)) {
        throw new UnsupportedGeometryError(`#${operator} has an ${name} of zero length`);
    }
    return scale3(direction, 1 / length);
}

function operatorScale(model: ModelSnapshot, operator: number, name: string, fallback: number): number {
    const value = optionalAttribute(model, operator, name);
    if (value === null) {
        return fallback;
    }
    if (typeof value !== "number" || !Number.isFinite(value) || !(value > 0)) {
        throw new UnsupportedGeometryError(`#${operator} has a ${name} that is not a number above zero`);
    }
    return value;
}

function spaceAxes(operator: number, axis1: Base.Vector3 | undefined, axis2: Base.Vector3 | undefined, axis3: Base.Vector3 | undefined): [Base.Vector3, Base.Vector3, Base.Vector3] {
    const z = axis3 ?? Z_AXIS;
    const hint = axis1 ?? (length3(cross3(z, X_AXIS)) > PARALLEL_TOLERANCE ? X_AXIS : Y_AXIS);
    const across = subtract3(hint, scale3(z, dot3(hint, z)));
    const length = length3(across);
    if (!(length > PARALLEL_TOLERANCE)) {
        throw new UnsupportedGeometryError(`#${operator} has its Axis1 along its Axis3`);
    }
    const x = scale3(across, 1 / length);
    const y = cross3(z, x);
    return [x, dot3(axis2 ?? Y_AXIS, y) < -PARALLEL_TOLERANCE ? cross3(x, z) : y, z];
}

function planeAxes(axis1: Base.Vector3 | undefined, axis2: Base.Vector3 | undefined): [Base.Vector3, Base.Vector3, Base.Vector3] {
    if (axis1 !== undefined) {
        const y = cross3(Z_AXIS, axis1);
        return [axis1, axis2 !== undefined && dot3(axis2, y) < -PARALLEL_TOLERANCE ? cross3(axis1, Z_AXIS) : y, Z_AXIS];
    }
    return axis2 === undefined ? [X_AXIS, Y_AXIS, Z_AXIS] : [cross3(axis2, Z_AXIS), axis2, Z_AXIS];
}

export function operatorMatrix(model: ModelSnapshot, operator: number): Base.TransformMatrix {
    const origin = pointOf(model, model.attribute(operator, "LocalOrigin"));
    const axis1 = operatorAxis(model, operator, "Axis1");
    const axis2 = operatorAxis(model, operator, "Axis2");
    const [x, y, z] = model.schema.isSubtypeOf(model.entity(operator).type, SPATIAL_OPERATOR)
        ? spaceAxes(operator, axis1, axis2, operatorAxis(model, operator, "Axis3"))
        : planeAxes(axis1, axis2);
    const scale = operatorScale(model, operator, "Scale", 1);
    const scaleY = operatorScale(model, operator, "Scale2", scale);
    const scaleZ = operatorScale(model, operator, "Scale3", scale);
    return [...scale3(x, scale), 0, ...scale3(y, scaleY), 0, ...scale3(z, scaleZ), 0, ...origin, 1];
}
