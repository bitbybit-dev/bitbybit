export class BlockValidations {
    static required(entity: any): boolean {
        return entity !== undefined && entity !== null && entity !== '';
    }

    static minLength(entity: any, validationData: { length: number }): boolean {
        return entity.length >= validationData.length;
    }

    static maxLength(entity: any, validationData: { length: number }): boolean {
        return entity.length <= validationData.length;
    }

    static ofLength(entity: any, validationData: { length: number }): boolean {
        return entity.length === validationData.length;
    }

    static min(entity: number, validationData: { length: number }): boolean {
        return entity >= validationData.length;
    }

    static max(entity: number, validationData: { length: number }): boolean {
        return entity <= validationData.length;
    }

    static range(entity: number, validationData: { min: number, max: number }): boolean {
        return entity >= validationData.min && entity <= validationData.max;
    }

    static smallerThan(entity: number, validationData: { propName: string }, inputs): boolean {
        return entity < inputs[validationData.propName];
    }

    static largerThan(entity: number, validationData: { propName: string }, inputs): boolean {
        return entity > inputs[validationData.propName];
    }

    static smallerOrEqualThan(entity: number, validationData: { propName: string }, inputs): boolean {
        return entity <= inputs[validationData.propName];
    }

    static largerOrEqualThan(entity: number, validationData: { propName: string }, inputs): boolean {
        return entity >= inputs[validationData.propName];
    }
}
