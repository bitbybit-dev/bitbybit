import * as Inputs from "../inputs";

/**
 * Reading and writing CSV, the plain-text table format with one row per line and a separator
 * between cells. The parsers split on `rowSeparator` and `columnSeparator`, honor double-quoted
 * cells with doubled quotes inside, skip blank lines and read `\n`, `\t` and `\r` written as two
 * characters as the real thing; the writers quote a cell that contains a separator, a quote or a
 * line break.
 */
export class CSVBitByBit {

    /**
     * Splits CSV text into a list of rows, each a list of cell strings; nothing is converted to
     * numbers.
     *
     * Blank lines are skipped, cells are trimmed with their line, and a double-quoted cell may
     * contain the separator and doubled quotes. Example: `a,b,c` and `1,2,3` on two lines ->
     * `[["a", "b", "c"], ["1", "2", "3"]]`.
     * @param inputs - The CSV text and the two separators
     * @returns The rows as lists of cell strings
     * @group parse
     * @shortname parse to array
     * @drawable false
     * @example
     * ```typescript
     * const rows = bitbybit.csv.parseToArray({ csv: "x,y,z\n1,2,3\n4,5,6", rowSeparator: "\n", columnSeparator: "," });
     * ```
     */
    parseToArray(inputs: Inputs.CSV.ParseToArrayDto): string[][] {
        const rowSeparator = this.convertEscapeSequences(inputs.rowSeparator || "\n");
        const columnSeparator = this.convertEscapeSequences(inputs.columnSeparator || ",");
        const csvData = this.convertEscapeSequences(inputs.csv);
        const lines = csvData.split(rowSeparator);
        const result: string[][] = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!.trim();
            if (!line) continue;
            
            const columns = this.parseCsvLine(line, columnSeparator);
            result.push(columns);
        }
        
        return result;
    }

    /**
     * Turns CSV text into a list of objects, one per data row, keyed by the header names of row
     * `headerRow`.
     *
     * Rows start at `dataStartRow`, columns named in `numberColumns` become numbers and a missing
     * cell becomes an empty string. Example: `name,age` then `John,30` -> `[{ name: "John", age:
     * "30" }]`.
     * @param inputs - The CSV text, the header and data row indexes, the separators and the number columns
     * @returns One object per data row
     * @group parse
     * @shortname parse to json
     * @drawable false
     * @example
     * ```typescript
     * const people = bitbybit.csv.parseToJson({ csv: "name,age\nJohn,30\nJane,25", headerRow: 0, dataStartRow: 1, rowSeparator: "\n", columnSeparator: ",", numberColumns: ["age"] });
     * ```
     */
    parseToJson<T = Record<string, string | number>>(inputs: Inputs.CSV.ParseToJsonDto): T[] {
        const array = this.parseToArray({
            csv: inputs.csv,
            rowSeparator: inputs.rowSeparator,
            columnSeparator: inputs.columnSeparator
        });
        
        if (array.length === 0) return [];
        
        const headerRow = inputs.headerRow ?? 0;
        const dataStartRow = inputs.dataStartRow ?? 1;
        
        if (headerRow >= array.length) {
            throw new Error(`Header row ${headerRow} is out of bounds (total rows: ${array.length})`);
        }
        
        const headers = array[headerRow]!;
        const numberColumnsSet = new Set(inputs.numberColumns || []);
        const result: T[] = [];
        
        for (let i = dataStartRow; i < array.length; i++) {
            const row = array[i]!;
            const obj: Record<string, string | number> = {};
            
            headers.forEach((header, index) => {
                const value = row[index] || "";
                if (numberColumnsSet.has(header)) {
                    const num = parseFloat(value);
                    obj[header] = num === 0 ? 0 : num;
                } else {
                    obj[header] = value;
                }
            });
            
            result.push(obj as T);
        }
        
        return result;
    }

    /**
     * Turns CSV text into a list of objects keyed by the `headers` you give, for files without a
     * header line; a header line the file does have is skipped by setting `dataStartRow` past it.
     *
     * Columns named in `numberColumns` become numbers. Example: `John,30` with headers `["name",
     * "age"]` -> `[{ name: "John", age: "30" }]`.
     * @param inputs - The CSV text, the header names, the data start row, the separators and the number columns
     * @returns One object per data row
     * @group parse
     * @shortname parse to json with headers
     * @drawable false
     * @example
     * ```typescript
     * const people = bitbybit.csv.parseToJsonWithHeaders({ csv: "John,30\nJane,25", headers: ["name", "age"], dataStartRow: 0, rowSeparator: "\n", columnSeparator: ",", numberColumns: ["age"] });
     * ```
     */
    parseToJsonWithHeaders<T = Record<string, string | number>>(inputs: Inputs.CSV.ParseToJsonWithHeadersDto): T[] {
        const array = this.parseToArray({
            csv: inputs.csv,
            rowSeparator: inputs.rowSeparator,
            columnSeparator: inputs.columnSeparator
        });
        
        if (array.length === 0) return [];
        
        const dataStartRow = inputs.dataStartRow ?? 0;
        const numberColumnsSet = new Set(inputs.numberColumns || []);
        const result: T[] = [];
        
        for (let i = dataStartRow; i < array.length; i++) {
            const row = array[i]!;
            const obj: Record<string, string | number> = {};
            
            inputs.headers.forEach((header, index) => {
                const value = row[index] || "";
                if (numberColumnsSet.has(header)) {
                    const num = parseFloat(value);
                    obj[header] = num === 0 ? 0 : num;
                } else {
                    obj[header] = value;
                }
            });
            
            result.push(obj as T);
        }
        
        return result;
    }

    /**
     * Lists every value of one column, found by its header name, in row order; a row without that
     * cell gives an empty string.
     *
     * With `asNumber` true the values are parsed as numbers. Example: `name,age` then `John,30` and
     * `Jane,25`, column `name` -> `["John", "Jane"]`.
     * @param inputs - The CSV text, the column name, the header and data row indexes, the separators and the number flag
     * @returns The column's values, top to bottom
     * @group query
     * @shortname query column
     * @drawable false
     * @example
     * ```typescript
     * const ages = bitbybit.csv.queryColumn({ csv: "name,age\nJohn,30\nJane,25", column: "age", headerRow: 0, dataStartRow: 1, rowSeparator: "\n", columnSeparator: ",", asNumber: true });
     * ```
     */
    queryColumn(inputs: Inputs.CSV.QueryColumnDto): (string | number)[] {
        const numberColumns = inputs.asNumber ? [inputs.column] : undefined;
        
        const jsonData = this.parseToJson({
            csv: inputs.csv,
            headerRow: inputs.headerRow,
            dataStartRow: inputs.dataStartRow,
            rowSeparator: inputs.rowSeparator,
            columnSeparator: inputs.columnSeparator,
            numberColumns: numberColumns
        });
        
        return jsonData.map(row => {
            const value = row[inputs.column];
            return value !== undefined ? value : "";
        });
    }

    /**
     * Keeps only the rows whose cell in `column` equals `value`, giving them as objects keyed by
     * the headers.
     *
     * The comparison is on text unless the column is listed in `numberColumns`, in which case both
     * sides are compared as numbers. Example: column `age`, value `30` -> `[{ name: "John", age:
     * "30" }]`.
     * @param inputs - The CSV text, the column name, the value, the row indexes, the separators and the number columns
     * @returns The matching rows as objects
     * @group query
     * @shortname query rows by value
     * @drawable false
     * @example
     * ```typescript
     * const thirty = bitbybit.csv.queryRowsByValue({ csv: "name,age\nJohn,30\nJane,25", column: "age", value: "30", headerRow: 0, dataStartRow: 1, rowSeparator: "\n", columnSeparator: "," });
     * ```
     */
    queryRowsByValue<T = Record<string, string | number>>(inputs: Inputs.CSV.QueryRowsByValueDto): T[] {
        const jsonData = this.parseToJson<T>({
            csv: inputs.csv,
            headerRow: inputs.headerRow,
            dataStartRow: inputs.dataStartRow,
            rowSeparator: inputs.rowSeparator,
            columnSeparator: inputs.columnSeparator,
            numberColumns: inputs.numberColumns
        });
        
        const isNumberColumn = inputs.numberColumns?.includes(inputs.column);
        const compareValue = isNumberColumn ? parseFloat(inputs.value) : inputs.value;
        
        return jsonData.filter(row => {
            const rowValue = (row as Record<string, unknown>)[inputs.column];
            if (isNumberColumn) {
                return rowValue === compareValue;
            }
            return rowValue === inputs.value;
        });
    }

    /**
     * Writes a list of rows, each a list of cells, as CSV text; a cell holding a separator, a quote
     * or a line break is wrapped in double quotes.
     *
     * Example: `[["name", "age"], ["John", "30"]]` -> `name,age` and `John,30` on two lines.
     * @param inputs - The rows and the two separators
     * @returns The CSV text
     * @group generate
     * @shortname array to csv
     * @drawable false
     * @example
     * ```typescript
     * const csv = bitbybit.csv.arrayToCsv({ array: [["x", "y", "z"], [1, 2, 3]], rowSeparator: "\n", columnSeparator: "," });
     * ```
     */
    arrayToCsv(inputs: Inputs.CSV.ArrayToCsvDto): string {
        const columnSeparator = this.convertEscapeSequences(inputs.columnSeparator || ",");
        const rowSeparator = this.convertEscapeSequences(inputs.rowSeparator || "\n");
        
        return inputs.array.map(row => 
            row.map(cell => this.escapeCsvCell(cell as unknown, columnSeparator)).join(columnSeparator)
        ).join(rowSeparator);
    }

    /**
     * Writes a list of objects as CSV text with the columns you name in `headers`, in that order; a
     * property an object lacks becomes an empty cell.
     *
     * With `includeHeaders` true the first line holds the header names. Example: `[{ name: "John",
     * age: "30" }]` with headers `["name", "age"]` -> `name,age` and `John,30`.
     * @param inputs - The objects, the column names, the header flag and the separators
     * @returns The CSV text
     * @group generate
     * @shortname json to csv
     * @drawable false
     * @example
     * ```typescript
     * const csv = bitbybit.csv.jsonToCsv({ json: people, headers: ["name", "age"], includeHeaders: true, rowSeparator: "\n", columnSeparator: "," });
     * ```
     */
    jsonToCsv<T = Record<string, unknown>>(inputs: Inputs.CSV.JsonToCsvDto<T>): string {
        const columnSeparator = this.convertEscapeSequences(inputs.columnSeparator || ",");
        const rowSeparator = this.convertEscapeSequences(inputs.rowSeparator || "\n");
        
        if (!inputs.json || inputs.json.length === 0) {
            return inputs.includeHeaders ? inputs.headers.join(columnSeparator) : "";
        }
        
        const lines: string[] = [];
        
        if (inputs.includeHeaders) {
            lines.push(inputs.headers.map(h => this.escapeCsvCell(h, columnSeparator)).join(columnSeparator));
        }
        
        inputs.json.forEach(obj => {
            const row = inputs.headers.map(header => {
                const value = (obj as Record<string, unknown>)[header];
                return this.escapeCsvCell(value !== undefined && value !== null ? String(value) : "", columnSeparator);
            });
            lines.push(row.join(columnSeparator));
        });
        
        return lines.join(rowSeparator);
    }

    /**
     * Writes a list of objects as CSV text using the property names of the first object as the
     * columns, in their order; an empty list gives empty text.
     *
     * Example: `[{ name: "John", age: "30" }]` -> `name,age` and `John,30`.
     * @param inputs - The objects, the header flag and the separators
     * @returns The CSV text
     * @group generate
     * @shortname json to csv auto
     * @drawable false
     * @example
     * ```typescript
     * const csv = bitbybit.csv.jsonToCsvAuto({ json: people, includeHeaders: true, rowSeparator: "\n", columnSeparator: "," });
     * ```
     */
    jsonToCsvAuto<T = Record<string, unknown>>(inputs: Inputs.CSV.JsonToCsvAutoDto<T>): string {
        if (!inputs.json || inputs.json.length === 0) return "";
        
        const headers = Object.keys(inputs.json[0]!);
        
        return this.jsonToCsv({
            json: inputs.json,
            headers: headers,
            includeHeaders: inputs.includeHeaders ?? true,
            columnSeparator: inputs.columnSeparator,
            rowSeparator: inputs.rowSeparator
        });
    }

    /**
     * Reads the cells of row `headerRow` as the header names; a row index past the end throws an
     * error.
     *
     * Example: `name,age` then `John,30` -> `["name", "age"]`.
     * @param inputs - The CSV text, the header row index and the separators
     * @returns The header names in column order
     * @group query
     * @shortname get headers
     * @drawable false
     * @example
     * ```typescript
     * const headers = bitbybit.csv.getHeaders({ csv: "name,age\nJohn,30", headerRow: 0, rowSeparator: "\n", columnSeparator: "," });
     * ```
     */
    getHeaders(inputs: Inputs.CSV.GetHeadersDto): string[] {
        const array = this.parseToArray({
            csv: inputs.csv,
            rowSeparator: inputs.rowSeparator,
            columnSeparator: inputs.columnSeparator
        });
        
        const headerRow = inputs.headerRow ?? 0;
        
        if (headerRow >= array.length) {
            throw new Error(`Header row ${headerRow} is out of bounds (total rows: ${array.length})`);
        }
        
        return array[headerRow]!;
    }

    /**
     * Counts the data rows: all non-blank lines minus the ones before `dataStartRow`, or minus one
     * header line when `hasHeaders` is true and `dataStartRow` is left out.
     *
     * Example: `name,age`, `John,30`, `Jane,25` with headers -> 2.
     * @param inputs - The CSV text, the header flag, the optional data start row and the separators
     * @returns The number of data rows
     * @group query
     * @shortname row count
     * @drawable false
     * @example
     * ```typescript
     * const count = bitbybit.csv.getRowCount({ csv: "name,age\nJohn,30\nJane,25", hasHeaders: true, rowSeparator: "\n", columnSeparator: "," });
     * ```
     */
    getRowCount(inputs: Inputs.CSV.GetRowCountDto): number {
        const array = this.parseToArray({
            csv: inputs.csv,
            rowSeparator: inputs.rowSeparator,
            columnSeparator: inputs.columnSeparator
        });
        
        const dataStartRow = inputs.dataStartRow ?? (inputs.hasHeaders ? 1 : 0);
        return Math.max(0, array.length - dataStartRow);
    }

    /**
     * Counts the cells of the first non-blank row, which is the number of columns; empty text gives
     * 0.
     *
     * Example: `name,age,city` then `John,30,NYC` -> 3.
     * @param inputs - The CSV text and the two separators
     * @returns The number of columns
     * @group query
     * @shortname column count
     * @drawable false
     * @example
     * ```typescript
     * const columns = bitbybit.csv.getColumnCount({ csv: "name,age,city\nJohn,30,NYC", rowSeparator: "\n", columnSeparator: "," });
     * ```
     */
    getColumnCount(inputs: Inputs.CSV.ParseToArrayDto): number {
        const array = this.parseToArray(inputs);
        return array.length > 0 ? array[0]!.length : 0;
    }

    private parseCsvLine(line: string, separator: string): string[] {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === "\"") {
                if (inQuotes && nextChar === "\"") {
                    current += "\"";
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === separator && !inQuotes) {
                result.push(current);
                current = "";
            } else {
                current += char;
            }
        }
        
        result.push(current);
        
        return result;
    }
    private escapeCsvCell(cell: unknown, separator: string): string {
        const cellStr = cell !== undefined && cell !== null ? String(cell) : "";
        if (cellStr.includes(separator) || cellStr.includes("\"") || cellStr.includes("\n") || cellStr.includes("\r")) {
            return "\"" + cellStr.replace(/"/g, "\"\"") + "\"";
        }
        return cellStr;
    }

    /**
     * Converts literal escape sequence strings to their actual characters.
     * For example, converts "\\n" (two characters) to "\n" (newline character).
     */
    private convertEscapeSequences(str: string): string {
        return str
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\r/g, "\r");
    }
}
