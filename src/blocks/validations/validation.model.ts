export class ValidationModel {
    validationFunc: (entity: any, validationData?: any) => {};
    validationData?: any;
    errorText: string;
}
