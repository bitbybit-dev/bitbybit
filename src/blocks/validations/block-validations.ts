export class BlockValidations {
    static required(entity: any): boolean {
        return entity ? true : false;
    }

    static minLength(entity: any, validationData: { length: number }): boolean {
        return entity.length >= validationData.length;
    }

    static maxLength(entity: any, validationData: { length: number }): boolean {
        return entity.length <= validationData.length;
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
}
