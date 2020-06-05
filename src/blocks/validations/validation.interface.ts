export interface ValidationInterface {
    validationFunc: (entity: any, validationData?: any) => {};
    validationData?: any;
    errorText: string;
}
