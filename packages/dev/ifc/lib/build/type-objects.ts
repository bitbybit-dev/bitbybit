import type { IfcTransaction } from "../model/transaction";
import { DECLARATION, TYPE_DEFINITION } from "./constants";
import type { EntityWriter } from "./entity-writer";
import { projectOf } from "./project";
import { appendToRelationship } from "./relationships";

export function defineByType(tx: IfcTransaction, writer: EntityWriter, occurrence: number, type: number): void {
    appendToRelationship(tx, writer, TYPE_DEFINITION, type, [occurrence]);
}

export function declareInProject(tx: IfcTransaction, writer: EntityWriter, definition: number): void {
    appendToRelationship(tx, writer, DECLARATION, projectOf(tx.base), [definition]);
}
