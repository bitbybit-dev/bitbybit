import type { EntityWriter } from "../../build/entity-writer";
import type { IfcTransaction } from "../../model/transaction";

export type ModelChange = (tx: IfcTransaction, writer: EntityWriter) => void;
