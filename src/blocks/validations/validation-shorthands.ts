import { ResourcesInterface } from '../../resources';
import { BlockValidations } from './block-validations';
import { ValidationInterface } from './validation.interface';

export function makeRequiredValidationModelForInputs(resources: ResourcesInterface, inputs: any, propertyNames: string[]){
    return Object.keys(inputs).map((key, index) => ({
        entity: inputs[key],
        validations: [
            getRequired(resources, propertyNames[index])
        ]
    }));
}

export function getRequiredAndMin(resources: ResourcesInterface, name: string, min: number) {
    return [
        getRequired(resources, name),
        getMin(resources, name, min)
    ];
}


export function getRequiredAndRange(resources: ResourcesInterface, name: string, min: number, max: number) {
    return [
        getRequired(resources, name),
        getRange(resources, name, min, max)
    ];
}

export function getMin(resources: ResourcesInterface, name: string, value: number): ValidationInterface {
    return {
        validationFunc: BlockValidations.min,
        errorText: `${name} ${resources.block_validation_higher_or_equal} ${value}`,
        validationData: {
            length: value
        }
    };
}

export function getMax(resources: ResourcesInterface, name: string, value: number): ValidationInterface {
    return {
        validationFunc: BlockValidations.max,
        errorText: `${name} ${resources.block_validation_lower_or_equal} ${value}`,
        validationData: {
            length: value
        }
    };
}

export function getRange(resources: ResourcesInterface, name: string, min: number, max: number): ValidationInterface {
    return {
        validationFunc: BlockValidations.range,
        errorText: `${name} ${resources.block_validation_range} ${min} - ${max}`,
        validationData: {
            min,
            max
        }
    };
}

export function getRequired(resources: ResourcesInterface, name: string): ValidationInterface {
    return {
        validationFunc: BlockValidations.required,
        errorText: `${name} ${resources.block_validation_required}`,
    };
}

export function getOfLength(resources: ResourcesInterface, name: string, length: number): ValidationInterface {
    return {
        validationFunc: BlockValidations.ofLength,
        errorText: `${name} ${resources.block_validation_of_length} ${length}`,
        validationData: {
            length,
        }
    };
}

