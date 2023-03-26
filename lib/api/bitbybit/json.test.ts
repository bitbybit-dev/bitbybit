import { Context } from '../context';
import { JSONBitByBit } from './json';
import * as jsonpath from 'jsonpath';

describe('JSON unit tests', () => {
    let json: JSONBitByBit;

    beforeAll(async () => {
        const context = new Context();
        context.jsonpath = jsonpath.default;
        json = new JSONBitByBit(context);
    });

    it('should stringify', async () => {
        const result = json.stringify({ value: { a: 1 } });
        expect(result).toEqual('{"a":1}');
    });

    it('should parse', async () => {
        const result = json.parse({ value: '{"a":1}' });
        expect(result).toEqual({ a: 1 });
    });

    it('should query', async () => {
        const result = json.query({ value: { a: 1 }, query: '$.a' });
        expect(result).toEqual([1]);
    });

    it('should set value', async () => {
        const result = json.setValue({ json: { a: 1 }, path: '$.a', value: 2 });
        expect(result).toEqual({ a: 2 });
    });

    it('should find paths', async () => {
        const result = json.paths({ json: getMockJSON(), query: '$..author' });
        expect(result).toEqual(
            [
                ['$', 'store', 'book', 0, 'author'],
                ['$', 'store', 'book', 1, 'author'],
                ['$', 'store', 'book', 2, 'author'],
                ['$', 'store', 'book', 3, 'author']
            ]
        );
    });

    it('should find stringified paths', async () => {
        const result = json.pathsAsStrings({ json: getMockJSON(), query: '$..author' });
        expect(result).toEqual(
            [
                "$.store.book[0].author",
                "$.store.book[1].author",
                "$.store.book[2].author",
                "$.store.book[3].author",
            ]
        );
    });

    it('should find authors', async () => {
        const j = getMockJSON();
        const paths = json.paths({ json: j, query: '$..author' });
        const result = paths.map(path => {
            const query = path.join('.');
            return json.query({ value: j, query: query });
        }).flat();

        expect(result).toEqual(
            [
                "Nigel Rees",
                "Evelyn Waugh",
                "Herman Melville",
                "J. R. R. Tolkien",
            ]
        );
    });

    it('should find authors by using paths as strings', async () => {
        const j = getMockJSON();
        const paths = json.pathsAsStrings({ json: j, query: '$..author' });
        const result = paths.map(path => {
            return json.query({ value: j, query: path });
        }).flat();

        expect(result).toEqual(
            [
                "Nigel Rees",
                "Evelyn Waugh",
                "Herman Melville",
                "J. R. R. Tolkien",
            ]
        );
    });



    const getMockJSON = () => {
        return {
            "store": {
                "book": [
                    {
                        "category": "reference",
                        "author": "Nigel Rees",
                        "title": "Sayings of the Century",
                        "price": 8.95
                    }, {
                        "category": "fiction",
                        "author": "Evelyn Waugh",
                        "title": "Sword of Honour",
                        "price": 12.99
                    }, {
                        "category": "fiction",
                        "author": "Herman Melville",
                        "title": "Moby Dick",
                        "isbn": "0-553-21311-3",
                        "price": 8.99
                    }, {
                        "category": "fiction",
                        "author": "J. R. R. Tolkien",
                        "title": "The Lord of the Rings",
                        "isbn": "0-395-19395-8",
                        "price": 22.99
                    }
                ],
                "bicycle": {
                    "color": "red",
                    "price": 19.95
                }
            }
        }
    }

});

