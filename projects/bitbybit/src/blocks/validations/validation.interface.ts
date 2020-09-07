export interface ValidationInterface {
    validationFunc: (entity: any, validationData?: any, inputs?: any) => {};
    validationData?: any;
    errorText: string;
}
