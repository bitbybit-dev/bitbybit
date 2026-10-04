import * as Models from "../../api/models";
import { isRecord } from "./structure";

/** One connector a declaration makes: its id and the declaration that places it alone. */
export interface ConnectorMember {
    id: string;
    connector: Models.OCCT.DesignConnector;
}

/** The ids of a hole feature's positions, in the order `at` lists them, or undefined when `of` names no hole. */
export function holePositionIds(document: object, of: string): (string | undefined)[] | undefined {
    const features: unknown[] = isRecord(document) && Array.isArray(document["features"]) ? document["features"] : [];
    const hole = features.find(feature => isRecord(feature) && feature["id"] === of && feature["type"] === "hole");
    if (!isRecord(hole) || !Array.isArray(hole["at"])) {
        return undefined;
    }
    return hole["at"].map((position: unknown) => isRecord(position) && typeof position["id"] === "string" ? position["id"] : undefined);
}

/** The hole whose walls a connector's `axis` names without saying which, making the connector a set; undefined for a single connector. */
export function setHoleOf(axis: unknown, document: object): string | undefined {
    if (!isRecord(axis) || axis["role"] !== "wall" || axis["from"] !== undefined || typeof axis["of"] !== "string") {
        return undefined;
    }
    return holePositionIds(document, axis["of"]) === undefined ? undefined : axis["of"];
}

/**
 * The connectors a declaration makes: itself, or for a set, one per position of the hole whose walls
 * its `axis` names, as `<id>.<position id>`, each with its axis on that position's wall alone.
 */
export function connectorMembers(connector: Models.OCCT.DesignConnector, document: object): ConnectorMember[] {
    const hole = setHoleOf(connector.axis, document);
    const axis = connector.axis;
    if (hole === undefined || axis === undefined) {
        return [{ id: connector.id, connector }];
    }
    return (holePositionIds(document, hole) ?? []).flatMap(position => position === undefined ? [] : [{
        id: `${connector.id}.${position}`,
        connector: { ...connector, id: `${connector.id}.${position}`, axis: { ...axis, from: position } },
    }]);
}

/** The ids of every connector a part's declarations make, sets expanded. */
export function connectorIdsOf(part: object | undefined, document: object): string[] {
    const declared: unknown[] = isRecord(part) && Array.isArray(part["connectors"]) ? part["connectors"] : [];
    return declared.flatMap(connector => {
        if (!isRecord(connector) || typeof connector["id"] !== "string") {
            return [];
        }
        const id = connector["id"];
        const hole = setHoleOf(connector["axis"], document);
        return hole === undefined ? [id] : (holePositionIds(document, hole) ?? []).flatMap(position => position === undefined ? [] : [`${id}.${position}`]);
    });
}
