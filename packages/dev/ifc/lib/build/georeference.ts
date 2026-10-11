import type * as Inputs from "../api/inputs";
import type { IfcValue } from "../step/step-types";
import { isList, isReference, textValue } from "../step/values";
import type { ModelReader } from "./build-types";
import { COMPOUND_ANGLE_PARTS, MILLIONTHS_PER_SECOND, MINUTES_PER_DEGREE, SECONDS_PER_DEGREE } from "./constants";

const MODEL_CONTEXT = "Model";

function numberOr(value: IfcValue, fallback: number): number {
    return typeof value === "number" ? value : fallback;
}

export function decimalDegrees(value: IfcValue): number | undefined {
    if (!isList(value) || value.length < COMPOUND_ANGLE_PARTS || !value.every((part): part is number => typeof part === "number")) {
        return undefined;
    }
    const [degrees, minutes, seconds, millionths = 0] = value;
    return degrees! + minutes! / MINUTES_PER_DEGREE + (seconds! + millionths / MILLIONTHS_PER_SECOND) / SECONDS_PER_DEGREE;
}

function mapConversionOf(model: ModelReader): number | undefined {
    const conversions = model.byType("IfcMapConversion").map((conversion) => conversion.id);
    const ofModel = conversions.find((conversion) => {
        const source = model.attribute(conversion, "SourceCRS");
        return isReference(source) && model.attribute(source.ref, "ContextType") === MODEL_CONTEXT;
    });
    return ofModel ?? conversions[0];
}

export function georeferenceOf(model: ModelReader): Inputs.IFC.GeoreferenceDto {
    const conversion = mapConversionOf(model);
    const target = conversion === undefined ? null : model.attribute(conversion, "TargetCRS");
    const site = model.byType("IfcSite")[0]?.id;
    const latitude = site === undefined ? undefined : decimalDegrees(model.attribute(site, "RefLatitude"));
    const longitude = site === undefined ? undefined : decimalDegrees(model.attribute(site, "RefLongitude"));
    const located = latitude !== undefined && longitude !== undefined;
    return {
        mapped: conversion !== undefined,
        crs: isReference(target) ? textValue(model.attribute(target.ref, "Name")) ?? "" : "",
        eastings: conversion === undefined ? 0 : numberOr(model.attribute(conversion, "Eastings"), 0),
        northings: conversion === undefined ? 0 : numberOr(model.attribute(conversion, "Northings"), 0),
        orthogonalHeight: conversion === undefined ? 0 : numberOr(model.attribute(conversion, "OrthogonalHeight"), 0),
        xAxisAbscissa: conversion === undefined ? 1 : numberOr(model.attribute(conversion, "XAxisAbscissa"), 1),
        xAxisOrdinate: conversion === undefined ? 0 : numberOr(model.attribute(conversion, "XAxisOrdinate"), 0),
        scale: conversion === undefined ? 1 : numberOr(model.attribute(conversion, "Scale"), 1),
        located,
        latitude: located ? latitude : 0,
        longitude: located ? longitude : 0,
        elevation: site === undefined ? 0 : numberOr(model.attribute(site, "RefElevation"), 0),
    };
}
