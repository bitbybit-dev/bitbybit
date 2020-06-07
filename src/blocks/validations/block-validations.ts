export class BlockValidations {
    static required(entity: any): boolean {
        return entity ? true : false;
    }

    static minLength(entity: any, validationData: { length: number }): boolean {
        entity = BlockValidations.convertToArrayIfNeeded(entity);
        return entity.length >= validationData.length;
    }

    static maxLength(entity: any, validationData: { length: number }): boolean {
        entity = BlockValidations.convertToArrayIfNeeded(entity);
        return entity.length <= validationData.length;
    }

    static ofLength(entity: any, validationData: { length: number }): boolean {
        // This checks if passed entity is stringified array and evals the expression to measure real length.
        // Otherwise entity remains a string that mush mach the length provided
        entity = BlockValidations.convertToArrayIfNeeded(entity);
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

    private static convertToArrayIfNeeded(entity: any) {
        if (entity.length > 0 && entity[0] === '[' && entity[entity.length - 1] === ']') {
            entity = eval(entity);
        }
        return entity;
    }

}
