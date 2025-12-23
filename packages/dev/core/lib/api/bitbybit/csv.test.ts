import { CSVBitByBit } from "./csv";
import * as Inputs from "../inputs/inputs";

describe("CSV unit tests", () => {
    let csv: CSVBitByBit;

    beforeEach(() => {
        csv = new CSVBitByBit();
    });

    describe("parseToArray", () => {
        it("should parse simple CSV to 2D array", () => {
            const result = csv.parseToArray({
                csv: "a,b,c\n1,2,3",
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([["a", "b", "c"], ["1", "2", "3"]]);
        });

        it("should handle quoted fields with commas", () => {
            const result = csv.parseToArray({
                csv: "name,description\n\"Smith, John\",\"A description\"",
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([["name", "description"], ["Smith, John", "A description"]]);
        });

        it("should handle escaped quotes", () => {
            const result = csv.parseToArray({
                csv: "name,quote\n\"John\",\"He said \"\"hello\"\"\"",
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([["name", "quote"], ["John", "He said \"hello\""]]);
        });

        it("should handle empty lines", () => {
            const result = csv.parseToArray({
                csv: "a,b\n1,2\n\n3,4",
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([["a", "b"], ["1", "2"], ["3", "4"]]);
        });

        it("should handle custom separators", () => {
            const result = csv.parseToArray({
                csv: "a;b;c|1;2;3",
                rowSeparator: "|",
                columnSeparator: ";"
            });
            expect(result).toEqual([["a", "b", "c"], ["1", "2", "3"]]);
        });
    });

    describe("parseToJson", () => {
        it("should parse CSV with headers to JSON", () => {
            const result = csv.parseToJson({
                csv: "name,age\nJohn,30\nJane,25",
                headerRow: 0,
                dataStartRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([
                { name: "John", age: "30" },
                { name: "Jane", age: "25" }
            ]);
        });

        it("should use default header and data row positions", () => {
            const result = csv.parseToJson({
                csv: "name,age\nJohn,30",
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([{ name: "John", age: "30" }]);
        });

        it("should handle custom header and data positions", () => {
            const result = csv.parseToJson({
                csv: "# Comment\nname,age\nJohn,30",
                headerRow: 1,
                dataStartRow: 2,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([{ name: "John", age: "30" }]);
        });

        it("should handle missing values", () => {
            const result = csv.parseToJson({
                csv: "name,age,city\nJohn,30\nJane,25,NYC",
                headerRow: 0,
                dataStartRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([
                { name: "John", age: "30", city: "" },
                { name: "Jane", age: "25", city: "NYC" }
            ]);
        });

        it("should throw error if header row is out of bounds", () => {
            expect(() => {
                csv.parseToJson({
                    csv: "name,age\nJohn,30",
                    headerRow: 5,
                    dataStartRow: 6,
                    rowSeparator: "\n",
                    columnSeparator: ","
                });
            }).toThrow("Header row 5 is out of bounds");
        });
    });

    describe("parseToJsonWithHeaders", () => {
        it("should parse CSV with custom headers", () => {
            const result = csv.parseToJsonWithHeaders({
                csv: "John,30\nJane,25",
                headers: ["name", "age"],
                dataStartRow: 0,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([
                { name: "John", age: "30" },
                { name: "Jane", age: "25" }
            ]);
        });

        it("should ignore CSV headers when using custom headers", () => {
            const result = csv.parseToJsonWithHeaders({
                csv: "ignored,headers\nJohn,30\nJane,25",
                headers: ["name", "age"],
                dataStartRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([
                { name: "John", age: "30" },
                { name: "Jane", age: "25" }
            ]);
        });
    });

    describe("queryColumn", () => {
        it("should query column by name", () => {
            const result = csv.queryColumn({
                csv: "name,age\nJohn,30\nJane,25",
                column: "name",
                headerRow: 0,
                dataStartRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual(["John", "Jane"]);
        });

        it("should return empty strings for missing values", () => {
            const result = csv.queryColumn({
                csv: "name,age,city\nJohn,30\nJane,25,NYC",
                column: "city",
                headerRow: 0,
                dataStartRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual(["", "NYC"]);
        });
    });

    describe("queryRowsByValue", () => {
        it("should filter rows by column value", () => {
            const result = csv.queryRowsByValue({
                csv: "name,age\nJohn,30\nJane,25\nBob,30",
                column: "age",
                value: "30",
                headerRow: 0,
                dataStartRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([
                { name: "John", age: "30" },
                { name: "Bob", age: "30" }
            ]);
        });

        it("should return empty array if no matches", () => {
            const result = csv.queryRowsByValue({
                csv: "name,age\nJohn,30\nJane,25",
                column: "age",
                value: "50",
                headerRow: 0,
                dataStartRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual([]);
        });
    });

    describe("arrayToCsv", () => {
        it("should convert 2D array to CSV", () => {
            const result = csv.arrayToCsv({
                array: [["name", "age"], ["John", "30"], ["Jane", "25"]],
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,age\nJohn,30\nJane,25");
        });

        it("should escape fields with separators", () => {
            const result = csv.arrayToCsv({
                array: [["name", "description"], ["Smith, John", "A, B, C"]],
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,description\n\"Smith, John\",\"A, B, C\"");
        });

        it("should escape fields with quotes", () => {
            const result = csv.arrayToCsv({
                array: [["name", "quote"], ["John", "He said \"hello\""]],
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,quote\nJohn,\"He said \"\"hello\"\"\"");
        });

        it("should handle custom separators", () => {
            const result = csv.arrayToCsv({
                array: [["a", "b"], ["1", "2"]],
                rowSeparator: "|",
                columnSeparator: ";"
            });
            expect(result).toBe("a;b|1;2");
        });

        it("should handle mixed types (strings and numbers)", () => {
            const result = csv.arrayToCsv({
                array: [["name", "age"], ["John", 30], ["Jane", 25]],
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,age\nJohn,30\nJane,25");
        });

        it("should handle boolean and null values", () => {
            const result = csv.arrayToCsv({
                array: [["name", "active", "value"], ["John", true, null], ["Jane", false, undefined]],
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,active,value\nJohn,true,\nJane,false,");
        });
    });

    describe("jsonToCsv", () => {
        it("should convert JSON array to CSV with headers", () => {
            const result = csv.jsonToCsv({
                json: [
                    { name: "John", age: "30" },
                    { name: "Jane", age: "25" }
                ],
                headers: ["name", "age"],
                includeHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,age\nJohn,30\nJane,25");
        });

        it("should convert JSON array to CSV without headers", () => {
            const result = csv.jsonToCsv({
                json: [
                    { name: "John", age: "30" },
                    { name: "Jane", age: "25" }
                ],
                headers: ["name", "age"],
                includeHeaders: false,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("John,30\nJane,25");
        });

        it("should handle missing properties", () => {
            const result = csv.jsonToCsv({
                json: [
                    { name: "John", age: "30" },
                    { name: "Jane" }
                ],
                headers: ["name", "age"],
                includeHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,age\nJohn,30\nJane,");
        });

        it("should handle empty array", () => {
            const result = csv.jsonToCsv({
                json: [],
                headers: ["name", "age"],
                includeHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,age");
        });

        it("should convert non-string values", () => {
            const result = csv.jsonToCsv({
                json: [
                    { name: "John", age: 30, active: true }
                ],
                headers: ["name", "age", "active"],
                includeHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,age,active\nJohn,30,true");
        });
    });

    describe("jsonToCsvAuto", () => {
        it("should automatically extract headers from JSON", () => {
            const result = csv.jsonToCsvAuto({
                json: [
                    { name: "John", age: "30" },
                    { name: "Jane", age: "25" }
                ],
                includeHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("name,age\nJohn,30\nJane,25");
        });

        it("should handle includeHeaders=false", () => {
            const result = csv.jsonToCsvAuto({
                json: [
                    { name: "John", age: "30" }
                ],
                includeHeaders: false,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("John,30");
        });

        it("should return empty string for empty array", () => {
            const result = csv.jsonToCsvAuto({
                json: [],
                includeHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe("");
        });
    });

    describe("getHeaders", () => {
        it("should extract headers from CSV", () => {
            const result = csv.getHeaders({
                csv: "name,age,city\nJohn,30,NYC",
                headerRow: 0,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual(["name", "age", "city"]);
        });

        it("should extract headers from custom row", () => {
            const result = csv.getHeaders({
                csv: "# Comment\nname,age\nJohn,30",
                headerRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual(["name", "age"]);
        });

        it("should throw error if header row is out of bounds", () => {
            expect(() => {
                csv.getHeaders({
                    csv: "name,age\nJohn,30",
                    headerRow: 5,
                    rowSeparator: "\n",
                    columnSeparator: ","
                });
            }).toThrow("Header row 5 is out of bounds");
        });
    });

    describe("getRowCount", () => {
        it("should count data rows excluding headers", () => {
            const result = csv.getRowCount({
                csv: "name,age\nJohn,30\nJane,25",
                hasHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe(2);
        });

        it("should count all rows when no headers", () => {
            const result = csv.getRowCount({
                csv: "John,30\nJane,25",
                hasHeaders: false,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe(2);
        });

        it("should use custom dataStartRow", () => {
            const result = csv.getRowCount({
                csv: "# Comment\nname,age\nJohn,30\nJane,25",
                dataStartRow: 2,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe(2);
        });
    });

    describe("getColumnCount", () => {
        it("should count columns", () => {
            const result = csv.getColumnCount({
                csv: "name,age,city\nJohn,30,NYC",
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe(3);
        });

        it("should return 0 for empty CSV", () => {
            const result = csv.getColumnCount({
                csv: "",
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toBe(0);
        });
    });

    describe("Round-trip conversion", () => {
        it("should convert array to CSV and back", () => {
            const original = [["name", "age"], ["John", "30"], ["Jane", "25"]];
            const csvText = csv.arrayToCsv({
                array: original,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            const result = csv.parseToArray({
                csv: csvText,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual(original);
        });

        it("should convert JSON to CSV and back", () => {
            const original = [
                { name: "John", age: "30" },
                { name: "Jane", age: "25" }
            ];
            const csvText = csv.jsonToCsvAuto({
                json: original,
                includeHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            const result = csv.parseToJson({
                csv: csvText,
                headerRow: 0,
                dataStartRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            expect(result).toEqual(original);
        });
    });

    describe("Type safety with generics", () => {
        interface Person {
            name: string;
            age: string;
            city?: string;
        }

        it("should work with typed objects in parseToJson", () => {
            const result = csv.parseToJson<Person>({
                csv: "name,age,city\nJohn,30,NYC\nJane,25,LA",
                headerRow: 0,
                dataStartRow: 1,
                rowSeparator: "\n",
                columnSeparator: ","
            });
            
            expect(result[0].name).toBe("John");
            expect(result[0].age).toBe("30");
            expect(result[0].city).toBe("NYC");
        });

        it("should work with typed objects in jsonToCsv", () => {
            const people: Person[] = [
                { name: "John", age: "30", city: "NYC" },
                { name: "Jane", age: "25", city: "LA" }
            ];

            const result = csv.jsonToCsv<Person>({
                json: people,
                headers: ["name", "age", "city"],
                includeHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });

            expect(result).toBe("name,age,city\nJohn,30,NYC\nJane,25,LA");
        });

        it("should work with typed objects in jsonToCsvAuto", () => {
            const people: Person[] = [
                { name: "John", age: "30" },
                { name: "Jane", age: "25" }
            ];

            const result = csv.jsonToCsvAuto<Person>({
                json: people,
                includeHeaders: true,
                rowSeparator: "\n",
                columnSeparator: ","
            });

            expect(result).toBe("name,age\nJohn,30\nJane,25");
        });
    });

    describe("number column conversion", () => {
        it("should convert specified columns to numbers in parseToJson", () => {
            const result = csv.parseToJson({
                csv: "name,age,salary\nJohn,30,50000\nJane,25,60000",
                headerRow: 0,
                dataStartRow: 1,
                numberColumns: ["age", "salary"]
            });

            expect(result).toEqual([
                { name: "John", age: 30, salary: 50000 },
                { name: "Jane", age: 25, salary: 60000 }
            ]);
            expect(typeof result[0].age).toBe("number");
            expect(typeof result[0].salary).toBe("number");
            expect(typeof result[0].name).toBe("string");
        });

        it("should handle decimal numbers when converting columns", () => {
            const result = csv.parseToJson({
                csv: "product,price,rating\nWidget,19.99,4.5\nGadget,29.95,4.8",
                numberColumns: ["price", "rating"]
            });

            expect(result).toEqual([
                { product: "Widget", price: 19.99, rating: 4.5 },
                { product: "Gadget", price: 29.95, rating: 4.8 }
            ]);
        });

        it("should handle negative numbers when converting columns", () => {
            const result = csv.parseToJson({
                csv: "item,change,temperature\nA,-5,-10.5\nB,10,20.3",
                numberColumns: ["change", "temperature"]
            });

            expect(result).toEqual([
                { item: "A", change: -5, temperature: -10.5 },
                { item: "B", change: 10, temperature: 20.3 }
            ]);
        });

        it("should convert to NaN for invalid numbers", () => {
            const result = csv.parseToJson({
                csv: "name,age\nJohn,abc",
                numberColumns: ["age"]
            });

            expect(result[0].name).toBe("John");
            expect(isNaN(result[0].age as number)).toBe(true);
        });

        it("should work without numberColumns specified", () => {
            const result = csv.parseToJson({
                csv: "name,age\nJohn,30",
            });

            expect(result).toEqual([{ name: "John", age: "30" }]);
            expect(typeof result[0].age).toBe("string");
        });

        it("should convert specified columns in parseToJsonWithHeaders", () => {
            const result = csv.parseToJsonWithHeaders({
                csv: "John,30,5000\nJane,25,6000",
                headers: ["name", "age", "bonus"],
                numberColumns: ["age", "bonus"]
            });

            expect(result).toEqual([
                { name: "John", age: 30, bonus: 5000 },
                { name: "Jane", age: 25, bonus: 6000 }
            ]);
            expect(typeof result[0].age).toBe("number");
            expect(typeof result[0].bonus).toBe("number");
        });

        it("should convert numbers in queryColumn", () => {
            const result = csv.queryColumn({
                csv: "name,age\nJohn,30\nJane,25",
                column: "age",
                asNumber: true
            });

            expect(result).toEqual([30, 25]);
            expect(typeof result[0]).toBe("number");
        });

        it("should keep strings in queryColumn when not specified as number", () => {
            const result = csv.queryColumn({
                csv: "name,age\nJohn,30\nJane,25",
                column: "age",
                asNumber: false
            });

            expect(result).toEqual(["30", "25"]);
            expect(typeof result[0]).toBe("string");
        });

        it("should filter by number value in queryRowsByValue", () => {
            const result = csv.queryRowsByValue({
                csv: "name,age,salary\nJohn,30,50000\nJane,25,60000\nBob,30,55000",
                column: "age",
                value: "30",
                numberColumns: ["age", "salary"]
            });

            expect(result).toEqual([
                { name: "John", age: 30, salary: 50000 },
                { name: "Bob", age: 30, salary: 55000 }
            ]);
            expect(result.length).toBe(2);
        });

        it("should handle scientific notation in number columns", () => {
            const result = csv.parseToJson({
                csv: "name,value\nTest,1.5e3\nDemo,2e-2",
                numberColumns: ["value"]
            });

            expect(result).toEqual([
                { name: "Test", value: 1500 },
                { name: "Demo", value: 0.02 }
            ]);
        });

        it("should handle zero values correctly", () => {
            const result = csv.parseToJson({
                csv: "item,count\nA,0\nB,-0\nC,0.0",
                numberColumns: ["count"]
            });

            expect(result).toEqual([
                { item: "A", count: 0 },
                { item: "B", count: 0 },
                { item: "C", count: 0 }
            ]);
        });

        it("should handle mixed string and number columns", () => {
            const result = csv.parseToJson({
                csv: "id,name,active,score\n1,John,true,95.5\n2,Jane,false,88.2",
                numberColumns: ["id", "score"]
            });

            expect(result).toEqual([
                { id: 1, name: "John", active: "true", score: 95.5 },
                { id: 2, name: "Jane", active: "false", score: 88.2 }
            ]);
            expect(typeof result[0].id).toBe("number");
            expect(typeof result[0].name).toBe("string");
            expect(typeof result[0].active).toBe("string");
            expect(typeof result[0].score).toBe("number");
        });
    });

    describe("escape sequence handling", () => {
        it("should accept literal \\n string as row separator", () => {
            const result = csv.parseToArray({
                csv: "a,b,c\n1,2,3",
                rowSeparator: "\\n",
                columnSeparator: ","
            });
            expect(result).toEqual([["a", "b", "c"], ["1", "2", "3"]]);
        });

        it("should accept literal \\t string as column separator", () => {
            const result = csv.parseToArray({
                csv: "a\tb\tc\n1\t2\t3",
                rowSeparator: "\\n",
                columnSeparator: "\\t"
            });
            expect(result).toEqual([["a", "b", "c"], ["1", "2", "3"]]);
        });

        it("should accept literal \\r\\n string as row separator", () => {
            const result = csv.parseToArray({
                csv: "a,b\r\n1,2",
                rowSeparator: "\\r\\n",
                columnSeparator: ","
            });
            expect(result).toEqual([["a", "b"], ["1", "2"]]);
        });

        it("should generate CSV with literal \\n string", () => {
            const result = csv.arrayToCsv({
                array: [["a", "b"], ["1", "2"]],
                rowSeparator: "\\n",
                columnSeparator: ","
            });
            expect(result).toBe("a,b\n1,2");
        });

        it("should generate CSV with literal \\t string", () => {
            const result = csv.arrayToCsv({
                array: [["a", "b"], ["1", "2"]],
                rowSeparator: "\\n",
                columnSeparator: "\\t"
            });
            expect(result).toBe("a\tb\n1\t2");
        });

        it("should work with jsonToCsv using literal escape sequences", () => {
            const result = csv.jsonToCsv({
                json: [{ name: "John", age: "30" }],
                headers: ["name", "age"],
                includeHeaders: true,
                rowSeparator: "\\n",
                columnSeparator: "\\t"
            });
            expect(result).toBe("name\tage\nJohn\t30");
        });
    });
});
