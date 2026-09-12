/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Parameters for reading and writing CSV: the text or rows to act on, the delimiter, whether the first
 * row is a header, and the type coercion applied to parsed cells.
 */
export namespace CSV {

    /**
     * Feeds `csv.parseToArray` and `csv.getColumnCount` with the CSV text and the two separators; a
     * separator can be written as `\n` or `\t` in two characters.
     */
    export class ParseToArrayDto {
        constructor(csv?: string, rowSeparator?: string, columnSeparator?: string) {
            if (csv !== undefined) { this.csv = csv; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * The whole CSV text, rows separated by `rowSeparator`
         * @default name,age\nJohn,30
         */
        csv = "name,age\nJohn,30";
        /**
         * The text between rows, normally a line break; `\n` written as two characters is read as
         * one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text between cells in a row, normally a comma; `\t` written as two characters is read
         * as a tab
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
    }

    /**
     * Feeds `csv.parseToJson`: the CSV text, which row holds the headers, where the data starts,
     * the separators and which columns to read as numbers.
     */
    export class ParseToJsonDto {
        constructor(csv?: string, headerRow?: number, dataStartRow?: number, rowSeparator?: string, columnSeparator?: string, numberColumns?: string[]) {
            if (csv !== undefined) { this.csv = csv; }
            if (headerRow !== undefined) { this.headerRow = headerRow; }
            if (dataStartRow !== undefined) { this.dataStartRow = dataStartRow; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
            if (numberColumns !== undefined) { this.numberColumns = numberColumns; }
        }
        /**
         * The whole CSV text, headers included
         * @default name,age\nJohn,30\nJane,25
         */
        csv = "name,age\nJohn,30\nJane,25";
        /**
         * Index of the row whose cells become the object keys, counting from 0 and skipping blank
         * lines
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        headerRow?: number | undefined = 0;
        /**
         * Index of the first row turned into an object, counting from 0; normally the row after the
         * headers
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow?: number | undefined = 1;
        /**
         * The text between rows, normally a line break; `\n` written as two characters is read as
         * one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text between cells in a row, normally a comma; `\t` written as two characters is read
         * as a tab
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
        /**
         * Header names whose cells are parsed as numbers; every other cell stays text
         * @default undefined
         * @optional true
         */
        numberColumns?: string[] | undefined;
    }

    /**
     * Feeds `csv.parseToJsonWithHeaders`: the CSV text, the header names to use instead of a header
     * line, where the data starts, the separators and which columns to read as numbers.
     */
    export class ParseToJsonWithHeadersDto {
        constructor(csv?: string, headers?: string[], dataStartRow?: number, rowSeparator?: string, columnSeparator?: string, numberColumns?: string[]) {
            if (csv !== undefined) { this.csv = csv; }
            if (headers !== undefined) { this.headers = headers; }
            if (dataStartRow !== undefined) { this.dataStartRow = dataStartRow; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
            if (numberColumns !== undefined) { this.numberColumns = numberColumns; }
        }
        /**
         * The whole CSV text, normally without a header line
         * @default John,30\nJane,25
         */
        csv = "John,30\nJane,25";
        /**
         * The object keys, one per column in column order; a row with more cells than keys loses
         * the extra cells
         * @default ["name", "age"]
         */
        headers: string[] = ["name", "age"];
        /**
         * Index of the first row turned into an object, counting from 0; set it to 1 to skip a
         * header line the text does have
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow?: number | undefined = 0;
        /**
         * The text between rows, normally a line break; `\n` written as two characters is read as
         * one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text between cells in a row, normally a comma; `\t` written as two characters is read
         * as a tab
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
        /**
         * Header names whose cells are parsed as numbers; every other cell stays text
         * @default undefined
         * @optional true
         */
        numberColumns?: string[] | undefined;
    }

    /**
     * Feeds `csv.queryColumn`: the CSV text, the header name of the column to read, the row layout,
     * the separators and whether to parse the values as numbers.
     */
    export class QueryColumnDto {
        constructor(csv?: string, column?: string, headerRow?: number, dataStartRow?: number, rowSeparator?: string, columnSeparator?: string, asNumber?: boolean) {
            if (csv !== undefined) { this.csv = csv; }
            if (column !== undefined) { this.column = column; }
            if (headerRow !== undefined) { this.headerRow = headerRow; }
            if (dataStartRow !== undefined) { this.dataStartRow = dataStartRow; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
            if (asNumber !== undefined) { this.asNumber = asNumber; }
        }
        /**
         * The whole CSV text, headers included
         * @default name,age\nJohn,30\nJane,25
         */
        csv = "name,age\nJohn,30\nJane,25";
        /**
         * Header name of the column whose values are listed
         * @default name
         */
        column = "name";
        /**
         * Index of the row whose cells are the header names, counting from 0
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        headerRow?: number | undefined = 0;
        /**
         * Index of the first row read as data, counting from 0; normally the row after the headers
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow?: number | undefined = 1;
        /**
         * The text between rows, normally a line break; `\n` written as two characters is read as
         * one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text between cells in a row, normally a comma; `\t` written as two characters is read
         * as a tab
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
        /**
         * When true, every value of the column is parsed as a number instead of staying text
         * @default false
         */
        asNumber?: boolean | undefined = false;
    }

    /**
     * Feeds `csv.queryRowsByValue`: the CSV text, the column to test and the value it must equal,
     * the row layout, the separators and the columns read as numbers.
     */
    export class QueryRowsByValueDto {
        constructor(csv?: string, column?: string, value?: string, headerRow?: number, dataStartRow?: number, rowSeparator?: string, columnSeparator?: string, numberColumns?: string[]) {
            if (csv !== undefined) { this.csv = csv; }
            if (column !== undefined) { this.column = column; }
            if (value !== undefined) { this.value = value; }
            if (headerRow !== undefined) { this.headerRow = headerRow; }
            if (dataStartRow !== undefined) { this.dataStartRow = dataStartRow; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
            if (numberColumns !== undefined) { this.numberColumns = numberColumns; }
        }
        /**
         * The whole CSV text, headers included
         * @default name,age\nJohn,30\nJane,25
         */
        csv = "name,age\nJohn,30\nJane,25";
        /**
         * Header name of the column that is compared with `value`
         * @default age
         */
        column = "age";
        /**
         * The text a row's cell must equal to be kept; compared as a number when the column is in
         * `numberColumns`
         * @default 30
         */
        value = "30";
        /**
         * Index of the row whose cells are the header names, counting from 0
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        headerRow?: number | undefined = 0;
        /**
         * Index of the first row read as data, counting from 0; normally the row after the headers
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow?: number | undefined = 1;
        /**
         * The text between rows, normally a line break; `\n` written as two characters is read as
         * one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text between cells in a row, normally a comma; `\t` written as two characters is read
         * as a tab
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
        /**
         * Header names whose cells are parsed as numbers, in the result and in the comparison
         * @default undefined
         * @optional true
         */
        numberColumns?: string[] | undefined;
    }

    /**
     * Feeds `csv.arrayToCsv` with the rows to write, each a list of cells, and the separators to
     * put between cells and rows.
     */
    export class ArrayToCsvDto {
        constructor(array?: (string | number | boolean | null | undefined)[][], rowSeparator?: string, columnSeparator?: string) {
            if (array !== undefined) { this.array = array; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * The rows, each a list of cells; numbers and booleans are written as text, null and
         * undefined as empty cells
         * @default [["name", "age"], ["John", "30"]]
         */
        array: (string | number | boolean | null | undefined)[][] = [["name", "age"], ["John", "30"]];
        /**
         * The text put between rows, normally a line break; `\n` written as two characters is used
         * as one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text put between cells, normally a comma; a cell containing it is wrapped in quotes
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
    }

    /**
     * Feeds `csv.jsonToCsv`: the objects to write, the property names that become the columns in
     * order, whether to write a header line and the separators.
     */
    export class JsonToCsvDto<T = Record<string, unknown>> {
        constructor(json?: T[], headers?: string[], includeHeaders?: boolean, rowSeparator?: string, columnSeparator?: string) {
            if (json !== undefined) { this.json = json; }
            if (headers !== undefined) { this.headers = headers; }
            if (includeHeaders !== undefined) { this.includeHeaders = includeHeaders; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * The objects, one row each, in order; a property an object lacks becomes an empty cell
         * @default [{"name": "John", "age": "30"}]
         */
        json: T[] = [{ "name": "John", "age": "30" }] as T[];
        /**
         * The property names written as columns, in this order; properties not listed are left out
         * @default ["name", "age"]
         */
        headers: string[] = ["name", "age"];
        /**
         * When true, the first line holds the header names
         * @default true
         */
        includeHeaders?: boolean | undefined = true;
        /**
         * The text put between rows, normally a line break; `\n` written as two characters is used
         * as one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text put between cells, normally a comma; a cell containing it is wrapped in quotes
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
    }

    /**
     * Feeds `csv.jsonToCsvAuto`: the objects to write, whose first entry's property names become
     * the columns, whether to write a header line and the separators.
     */
    export class JsonToCsvAutoDto<T = Record<string, unknown>> {
        constructor(json?: T[], includeHeaders?: boolean, rowSeparator?: string, columnSeparator?: string) {
            if (json !== undefined) { this.json = json; }
            if (includeHeaders !== undefined) { this.includeHeaders = includeHeaders; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * The objects, one row each; the property names of the first one are the columns, in their
         * order
         * @default [{"name": "John", "age": "30"}]
         */
        json: T[] = [{ "name": "John", "age": "30" }] as T[];
        /**
         * When true, the first line holds the header names
         * @default true
         */
        includeHeaders?: boolean | undefined = true;
        /**
         * The text put between rows, normally a line break; `\n` written as two characters is used
         * as one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text put between cells, normally a comma; a cell containing it is wrapped in quotes
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
    }

    /**
     * Feeds `csv.getHeaders` with the CSV text, which row holds the header names and the
     * separators.
     */
    export class GetHeadersDto {
        constructor(csv?: string, headerRow?: number, rowSeparator?: string, columnSeparator?: string) {
            if (csv !== undefined) { this.csv = csv; }
            if (headerRow !== undefined) { this.headerRow = headerRow; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * The whole CSV text, headers included
         * @default name,age\nJohn,30
         */
        csv = "name,age\nJohn,30";
        /**
         * Index of the row whose cells are the header names, counting from 0 and skipping blank
         * lines
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        headerRow?: number | undefined = 0;
        /**
         * The text between rows, normally a line break; `\n` written as two characters is read as
         * one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text between cells in a row, normally a comma; `\t` written as two characters is read
         * as a tab
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
    }

    /**
     * Feeds `csv.getRowCount` with the CSV text, how many leading rows are not data and the
     * separators.
     */
    export class GetRowCountDto {
        constructor(csv?: string, hasHeaders?: boolean, dataStartRow?: number, rowSeparator?: string, columnSeparator?: string) {
            if (csv !== undefined) { this.csv = csv; }
            if (hasHeaders !== undefined) { this.hasHeaders = hasHeaders; }
            if (dataStartRow !== undefined) { this.dataStartRow = dataStartRow; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * The whole CSV text; blank lines are not counted
         * @default name,age\nJohn,30\nJane,25
         */
        csv = "name,age\nJohn,30\nJane,25";
        /**
         * When true, the first row is a header line and is not counted; ignored when `dataStartRow`
         * is set
         * @default true
         */
        hasHeaders?: boolean | undefined = true;
        /**
         * Index of the first data row, counting from 0; when set, the rows before it are not
         * counted and `hasHeaders` is ignored
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow?: number | undefined;
        /**
         * The text between rows, normally a line break; `\n` written as two characters is read as
         * one
         * @default \n
         */
        rowSeparator?: string | undefined = "\n";
        /**
         * The text between cells in a row, normally a comma; it does not change the count
         * @default ,
         */
        columnSeparator?: string | undefined = ",";
    }
}
