import { Base } from "../../api/inputs";

/** The length, area or volume of one shape, and the centre it is taken about. */
export interface MassAndCentre {
    mass: number;
    centre: Base.Point3;
}

/**
 * The x, y and z of every point one after the other, which is how the kernel takes a list of points
 * in one call.
 */
export function coordinatesOf(points: Base.Point3[]): number[] {
    return points.flat();
}

/** The points of a list the kernel hands back as x, y and z one after the other. */
export function pointsFromCoordinates(coordinates: ArrayLike<number>): Base.Point3[] {
    const points: Base.Point3[] = [];
    for (let index = 0; index < coordinates.length; index += 3) {
        points.push([coordinates[index]!, coordinates[index + 1]!, coordinates[index + 2]!]);
    }
    return points;
}

/**
 * The properties of a list of shapes the kernel measures in one call: four numbers per shape, its
 * length, area or volume, then the x, y and z of its centre.
 */
export function massesAndCentres(values: ArrayLike<number>): MassAndCentre[] {
    const result: MassAndCentre[] = [];
    for (let index = 0; index < values.length; index += 4) {
        result.push({ mass: values[index]!, centre: [values[index + 1]!, values[index + 2]!, values[index + 3]!] });
    }
    return result;
}
