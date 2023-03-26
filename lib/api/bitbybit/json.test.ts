import { JSONBitByBit } from './json';

describe('JSON unit tests', () => {
    let json: JSONBitByBit;

    beforeAll(async () => {
        json = new JSONBitByBit();
    });

    it('should stringify', async () => {
        const result = json.stringify({ value: { a: 1 } });
        expect(result).toEqual('{"a":1}');
    });
});

