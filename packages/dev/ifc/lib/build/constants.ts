import type { RelationshipRoles } from "./build-types";

export const DEFAULT_PRECISION_METRES = 1e-5;
export const METRES_TO_MILLIMETRES = 1000;
export const LENGTH_PREFIXES: Readonly<Record<string, number>> = {
    EXA: 1e18,
    PETA: 1e15,
    TERA: 1e12,
    GIGA: 1e9,
    MEGA: 1e6,
    KILO: 1e3,
    HECTO: 1e2,
    DECA: 1e1,
    DECI: 1e-1,
    CENTI: 1e-2,
    MILLI: 1e-3,
    MICRO: 1e-6,
    NANO: 1e-9,
    PICO: 1e-12,
    FEMTO: 1e-15,
    ATTO: 1e-18,
};
export const GEOMETRY_TOLERANCE_METRES = 1e-6;
export const PARALLEL_TOLERANCE = 1e-9;
export const OPENING_MARGIN_RATIO = 0.25;
export const DEGREES_TO_RADIANS = Math.PI / 180;
export const VERTICAL_COSINE = 1 - 1e-9;
export const POINT2_SIZE = 2;
export const POINT3_SIZE = 3;
export const MIN_OUTLINE_POINTS = 3;

export const CONTAINMENT: RelationshipRoles = { relationship: "IfcRelContainedInSpatialStructure", relating: "RelatingStructure", related: "RelatedElements" };
export const MATERIAL_ASSOCIATION: RelationshipRoles = { relationship: "IfcRelAssociatesMaterial", relating: "RelatingMaterial", related: "RelatedObjects" };
export const TYPE_DEFINITION: RelationshipRoles = { relationship: "IfcRelDefinesByType", relating: "RelatingType", related: "RelatedObjects" };
export const AGGREGATION: RelationshipRoles = { relationship: "IfcRelAggregates", relating: "RelatingObject", related: "RelatedObjects" };
export const DECLARATION: RelationshipRoles = { relationship: "IfcRelDeclares", relating: "RelatingContext", related: "RelatedDefinitions" };
export const PROPERTY_DEFINITION: RelationshipRoles = { relationship: "IfcRelDefinesByProperties", relating: "RelatingPropertyDefinition", related: "RelatedObjects" };
export const VOIDING: RelationshipRoles = { relationship: "IfcRelVoidsElement", relating: "RelatingBuildingElement", related: "RelatedOpeningElement" };
export const FILLING: RelationshipRoles = { relationship: "IfcRelFillsElement", relating: "RelatingOpeningElement", related: "RelatedBuildingElement" };
export const WALL_CONNECTION = "IfcRelConnectsPathElements";
export const WALL_ENDS = ["ATSTART", "ATEND", "ATPATH"] as const;
