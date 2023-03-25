import { MathBitByBit } from './math';
import * as Inputs from '../inputs/inputs';

describe('Lists unit tests', () => {
    let math: MathBitByBit;

    beforeAll(async () => {
        math = new MathBitByBit();
    });

    it('should create number', async () => {
        const result = math.number({ number: 1 });
        expect(result).toEqual(1);
    });

    it('should perform addition', async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.MathTwoNrOperatorEnum.add });
        expect(result).toEqual(3);
    });

    it('should perform subtraction', async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.MathTwoNrOperatorEnum.subtract });
        expect(result).toEqual(-1);
    });

    it('should perform multiplication', async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.MathTwoNrOperatorEnum.multiply });
        expect(result).toEqual(2);
    });

    it('should perform division', async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.MathTwoNrOperatorEnum.divide });
        expect(result).toEqual(0.5);
    });

    it('should perform modulus', async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.MathTwoNrOperatorEnum.modulus });
        expect(result).toEqual(1);
    });
});

