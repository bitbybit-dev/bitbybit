import * as Inputs from "../inputs/inputs";

/**
 * Contains various CSV parsing and generation methods.
 */
export class CSVBitByBit {

    /**
     * Parses CSV text to a 2D array of strings (rows and columns).
     * Example: csv='a,b,c\n1,2,3' → [['a','b','c'], ['1','2','3']]
     * @param inputs CSV text and parsing options
     * @returns 2D array of strings
     * @group parse
     * @shortname parse to array
     * @drawable false
     */
    parseToArray(inputs: Inputs.CSV.ParseToArrayDto): string[][] {
        // Convert literal escape sequences to actual characters
        const rowSeparator = this.convertEscapeSequences(inputs.rowSeparator || "\n");
        const columnSeparator = this.convertEscapeSequences(inputs.columnSeparator || ",");
        // Also convert escape sequences in the CSV data itself (e.g., literal "\n" to actual newline)
        const csvData = this.convertEscapeSequences(inputs.csv);
        const lines = csvData.split(rowSeparator);
        const result: string[][] = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const columns = this.parseCsvLine(line, columnSeparator);
            result.push(columns);
        }
        
        return result;
    }

    /**
     * Parses CSV text to an array of JSON objects using headers.
     * Example: csv='name,age\nJohn,30\nJane,25', headerRow=0, dataStartRow=1 
     * → [{'name':'John','age':'30'}, {'name':'Jane','age':'25'}]
     * @param inputs CSV text and parsing options
     * @returns Array of JSON objects
     * @group parse
     * @shortname parse to json
     * @drawable false
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
        
        const headers = array[headerRow];
        const numberColumnsSet = new Set(inputs.numberColumns || []);
        const result: T[] = [];
        
        for (let i = dataStartRow; i < array.length; i++) {
            const row = array[i];
            const obj: Record<string, string | number> = {};
            
            headers.forEach((header, index) => {
                const value = row[index] || "";
                // Convert to number if this column is in the numberColumns list
                if (numberColumnsSet.has(header)) {
                    const num = parseFloat(value);
                    // Normalize -0 to 0
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
     * Parses CSV text to JSON using custom headers (ignores CSV headers if present).
     * Example: csv='John,30\nJane,25', headers=['name','age'] 
     * → [{'name':'John','age':'30'}, {'name':'Jane','age':'25'}]
     * @param inputs CSV text, custom headers, and parsing options
     * @returns Array of JSON objects
     * @group parse
     * @shortname parse to json with headers
     * @drawable false
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
            const row = array[i];
            const obj: Record<string, string | number> = {};
            
            inputs.headers.forEach((header, index) => {
                const value = row[index] || "";
                // Convert to number if this column is in the numberColumns list
                if (numberColumnsSet.has(header)) {
                    const num = parseFloat(value);
                    // Normalize -0 to 0
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
     * Queries CSV data by column/header name and returns all values in that column.
     * Example: csv='name,age\nJohn,30\nJane,25', column='name' → ['John', 'Jane']
     * @param inputs CSV text, column name, and parsing options
     * @returns Array of values from the specified column
     * @group query
     * @shortname query column
     * @drawable false
     */
    queryColumn<T = Record<string, string | number>>(inputs: Inputs.CSV.QueryColumnDto): (string | number)[] {
        const numberColumns = inputs.asNumber ? [inputs.column] : undefined;
        
        const jsonData = this.parseToJson({
            csv: inputs.csv,
            headerRow: inputs.headerRow,
            dataStartRow: inputs.dataStartRow,
            rowSeparator: inputs.rowSeparator,
            columnSeparator: inputs.columnSeparator,
            numberColumns: numberColumns
        });
        
        return jsonData.map(row => row[inputs.column] !== undefined ? row[inputs.column] : "");
    }

    /**
     * Queries CSV data and filters rows where a column matches a value.
     * Example: csv='name,age\nJohn,30\nJane,25', column='age', value='30' → [{'name':'John','age':'30'}]
     * @param inputs CSV text, column name, value, and parsing options
     * @returns Array of matching rows as JSON objects
     * @group query
     * @shortname query rows by value
     * @drawable false
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
        
        // If the column is a number column, compare as numbers
        const isNumberColumn = inputs.numberColumns?.includes(inputs.column);
        const compareValue = isNumberColumn ? parseFloat(inputs.value) : inputs.value;
        
        return jsonData.filter(row => {
            const rowValue = row[inputs.column];
            if (isNumberColumn) {
                return rowValue === compareValue;
            }
            return rowValue === inputs.value;
        });
    }

    /**
     * Converts a 2D array to CSV text.
     * Example: array=[['name','age'], ['John','30']] → 'name,age\nJohn,30'
     * @param inputs 2D array and formatting options
     * @returns CSV text
     * @group generate
     * @shortname array to csv
     * @drawable false
     */
    arrayToCsv(inputs: Inputs.CSV.ArrayToCsvDto): string {
        const columnSeparator = this.convertEscapeSequences(inputs.columnSeparator || ",");
        const rowSeparator = this.convertEscapeSequences(inputs.rowSeparator || "\n");
        
        return inputs.array.map(row => 
            row.map(cell => this.escapeCsvCell(cell as unknown, columnSeparator)).join(columnSeparator)
        ).join(rowSeparator);
    }

    /**
     * Converts an array of JSON objects to CSV text.
     * Example: json=[{'name':'John','age':'30'}], headers=['name','age'] → 'name,age\nJohn,30'
     * @param inputs JSON array, headers, and formatting options
     * @returns CSV text
     * @group generate
     * @shortname json to csv
     * @drawable false
     */
    jsonToCsv<T = Record<string, unknown>>(inputs: Inputs.CSV.JsonToCsvDto<T>): string {
        const columnSeparator = this.convertEscapeSequences(inputs.columnSeparator || ",");
        const rowSeparator = this.convertEscapeSequences(inputs.rowSeparator || "\n");
        
        if (!inputs.json || inputs.json.length === 0) {
            return inputs.includeHeaders ? inputs.headers.join(columnSeparator) : "";
        }
        
        const lines: string[] = [];
        
        // Add headers if requested
        if (inputs.includeHeaders) {
            lines.push(inputs.headers.map(h => this.escapeCsvCell(h, columnSeparator)).join(columnSeparator));
        }
        
        // Add data rows
        inputs.json.forEach(obj => {
            const row = inputs.headers.map(header => {
                const value = obj[header];
                return this.escapeCsvCell(value !== undefined && value !== null ? String(value) : "", columnSeparator);
            });
            lines.push(row.join(columnSeparator));
        });
        
        return lines.join(rowSeparator);
    }

    /**
     * Converts an array of JSON objects to CSV text using object keys as headers.
     * Example: json=[{'name':'John','age':'30'}] → 'name,age\nJohn,30'
     * @param inputs JSON array and formatting options
     * @returns CSV text
     * @group generate
     * @shortname json to csv auto
     * @drawable false
     */
    jsonToCsvAuto<T = Record<string, unknown>>(inputs: Inputs.CSV.JsonToCsvAutoDto<T>): string {
        if (!inputs.json || inputs.json.length === 0) return "";
        
        // Get headers from first object
        const headers = Object.keys(inputs.json[0]);
        
        return this.jsonToCsv({
            json: inputs.json,
            headers: headers,
            includeHeaders: inputs.includeHeaders ?? true,
            columnSeparator: inputs.columnSeparator,
            rowSeparator: inputs.rowSeparator
        });
    }

    /**
     * Gets the headers from a CSV file.
     * Example: csv='name,age\nJohn,30', headerRow=0 → ['name', 'age']
     * @param inputs CSV text and options
     * @returns Array of header names
     * @group query
     * @shortname get headers
     * @drawable false
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
        
        return array[headerRow];
    }

    /**
     * Gets the number of rows in a CSV file (excluding headers if specified).
     * Example: csv='name,age\nJohn,30\nJane,25', headerRow=0 → 2
     * @param inputs CSV text and options
     * @returns Number of data rows
     * @group query
     * @shortname row count
     * @drawable false
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
     * Gets the number of columns in a CSV file.
     * Example: csv='name,age,city\nJohn,30,NYC' → 3
     * @param inputs CSV text and options
     * @returns Number of columns
     * @group query
     * @shortname column count
     * @drawable false
     */
    getColumnCount(inputs: Inputs.CSV.ParseToArrayDto): number {
        const array = this.parseToArray(inputs);
        return array.length > 0 ? array[0].length : 0;
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
                    // Escaped quote
                    current += "\"";
                    i++; // Skip next quote
                } else {
                    // Toggle quote mode
                    inQuotes = !inQuotes;
                }
            } else if (char === separator && !inQuotes) {
                // End of field
                result.push(current);
                current = "";
            } else {
                current += char;
            }
        }
        
        // Add last field
        result.push(current);
        
        return result;
    }
    private escapeCsvCell(cell: unknown, separator: string): string {
        // Convert to string first
        const cellStr = cell !== undefined && cell !== null ? String(cell) : "";
        // If cell contains separator, quotes, or newlines, wrap in quotes
        if (cellStr.includes(separator) || cellStr.includes("\"") || cellStr.includes("\n") || cellStr.includes("\r")) {
            // Escape existing quotes by doubling them
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
