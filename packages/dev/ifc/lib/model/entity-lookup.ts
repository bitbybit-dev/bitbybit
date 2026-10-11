import type { IfcSchema } from "../schema/schema";
import type { IfcEntity, IfcValue } from "../step/step-types";

export abstract class EntityLookup {
    abstract readonly schema: IfcSchema;

    abstract get(id: number): IfcEntity | undefined;

    entity(id: number): IfcEntity {
        const entity = this.get(id);
        if (!entity) {
            throw new Error(`The model has no entity #${id}`);
        }
        return entity;
    }

    attribute(id: number, name: string): IfcValue {
        return this.valueOf(this.entity(id), name);
    }

    valueOf(entity: IfcEntity, name: string): IfcValue {
        const position = this.schema.entity(entity.type).positions.get(name);
        if (position === undefined) {
            throw new Error(`${entity.type} has no attribute ${name}`);
        }
        return entity.args[position] ?? null;
    }
}
