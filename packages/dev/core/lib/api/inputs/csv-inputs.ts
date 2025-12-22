/* eslint-disable @typescript-eslint/no-namespace */

export namespace CSV {

    export class ParseToArrayDto {
        constructor(csv?: string, rowSeparator?: string, columnSeparator?: string) {
            if (csv !== undefined) { this.csv = csv; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * CSV text to parse
         * @default name,age\nJohn,30
         */
        csv = "name,age\nJohn,30";
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
    }

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
         * CSV text to parse
         * @default name,age\nJohn,30\nJane,25
         */
        csv = "name,age\nJohn,30\nJane,25";
        /**
         * Row index where headers are located
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        headerRow? = 0;
        /**
         * Row index where data starts
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow? = 1;
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
        /**
         * Column names that should be converted to numbers
         * @default undefined
         * @optional true
         */
        numberColumns?: string[];
    }

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
         * CSV text to parse
         * @default John,30\nJane,25
         */
        csv = "John,30\nJane,25";
        /**
         * Custom header names to use
         * @default ["name", "age"]
         */
        headers: string[] = ["name", "age"];
        /**
         * Row index where data starts
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow? = 0;
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
        /**
         * Column names that should be converted to numbers
         * @default undefined
         * @optional true
         */
        numberColumns?: string[];
    }

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
         * CSV text to query
         * @default name,age\nJohn,30\nJane,25
         */
        csv = "name,age\nJohn,30\nJane,25";
        /**
         * Column name to query
         * @default name
         */
        column = "name";
        /**
         * Row index where headers are located
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        headerRow? = 0;
        /**
         * Row index where data starts
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow? = 1;
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
        /**
         * Convert column values to numbers
         * @default false
         */
        asNumber? = false;
    }

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
         * CSV text to query
         * @default name,age\nJohn,30\nJane,25
         */
        csv = "name,age\nJohn,30\nJane,25";
        /**
         * Column name to filter by
         * @default age
         */
        column = "age";
        /**
         * Value to match
         * @default 30
         */
        value = "30";
        /**
         * Row index where headers are located
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        headerRow? = 0;
        /**
         * Row index where data starts
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow? = 1;
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
        /**
         * Column names that should be converted to numbers
         * @default undefined
         * @optional true
         */
        numberColumns?: string[];
    }

    export class ArrayToCsvDto {
        constructor(array?: (string | number | boolean | null | undefined)[][], rowSeparator?: string, columnSeparator?: string) {
            if (array !== undefined) { this.array = array; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * 2D array to convert
         * @default [["name", "age"], ["John", "30"]]
         */
        array: (string | number | boolean | null | undefined)[][] = [["name", "age"], ["John", "30"]];
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
    }

    export class JsonToCsvDto<T = Record<string, unknown>> {
        constructor(json?: T[], headers?: string[], includeHeaders?: boolean, rowSeparator?: string, columnSeparator?: string) {
            if (json !== undefined) { this.json = json; }
            if (headers !== undefined) { this.headers = headers; }
            if (includeHeaders !== undefined) { this.includeHeaders = includeHeaders; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * Array of JSON objects to convert
         * @default [{"name": "John", "age": "30"}]
         */
        json: T[] = [{ "name": "John", "age": "30" }] as T[];
        /**
         * Headers to use (in order)
         * @default ["name", "age"]
         */
        headers: string[] = ["name", "age"];
        /**
         * Whether to include headers in output
         * @default true
         */
        includeHeaders? = true;
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
    }

    export class JsonToCsvAutoDto<T = Record<string, unknown>> {
        constructor(json?: T[], includeHeaders?: boolean, rowSeparator?: string, columnSeparator?: string) {
            if (json !== undefined) { this.json = json; }
            if (includeHeaders !== undefined) { this.includeHeaders = includeHeaders; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * Array of JSON objects to convert
         * @default [{"name": "John", "age": "30"}]
         */
        json: T[] = [{ "name": "John", "age": "30" }] as T[];
        /**
         * Whether to include headers in output
         * @default true
         */
        includeHeaders? = true;
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
    }

    export class GetHeadersDto {
        constructor(csv?: string, headerRow?: number, rowSeparator?: string, columnSeparator?: string) {
            if (csv !== undefined) { this.csv = csv; }
            if (headerRow !== undefined) { this.headerRow = headerRow; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * CSV text to get headers from
         * @default name,age\nJohn,30
         */
        csv = "name,age\nJohn,30";
        /**
         * Row index where headers are located
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        headerRow? = 0;
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
    }

    export class GetRowCountDto {
        constructor(csv?: string, hasHeaders?: boolean, dataStartRow?: number, rowSeparator?: string, columnSeparator?: string) {
            if (csv !== undefined) { this.csv = csv; }
            if (hasHeaders !== undefined) { this.hasHeaders = hasHeaders; }
            if (dataStartRow !== undefined) { this.dataStartRow = dataStartRow; }
            if (rowSeparator !== undefined) { this.rowSeparator = rowSeparator; }
            if (columnSeparator !== undefined) { this.columnSeparator = columnSeparator; }
        }
        /**
         * CSV text to count rows
         * @default name,age\nJohn,30\nJane,25
         */
        csv = "name,age\nJohn,30\nJane,25";
        /**
         * Whether CSV has headers
         * @default true
         */
        hasHeaders? = true;
        /**
         * Row index where data starts (overrides hasHeaders if set)
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        dataStartRow?: number;
        /**
         * Row separator (newline character)
         * @default \n
         */
        rowSeparator? = "\n";
        /**
         * Column separator (delimiter)
         * @default ,
         */
        columnSeparator? = ",";
    }
}
