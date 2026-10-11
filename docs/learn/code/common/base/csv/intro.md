---
sidebar_position: 1
title: CSV in Bitbybit
sidebar_label: CSV
description: Reading and writing CSV tables in a Bitbybit script - rows, columns as numbers, headers, filtering rows and writing lists back as CSV - with an example in Rete, Blockly and TypeScript and a table of every function.
topic: code.base.csv
type: explanation
tags: [code, csv]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# CSV

CSV is a table written as plain text: one row per line, a separator between the cells, and usually a first line of column names. Every spreadsheet exports it, so it is the shortest way from a table of measurements, coordinates or prices to geometry. `bitbybit.csv` reads it and writes it.

## Reading a table

- `parseToArray` gives every row as a list of cell texts. Nothing is converted to numbers.
- `parseToJson` gives one object per row, keyed by the column names of the header row. `numberColumns` names the columns to read as numbers.
- `parseToJsonWithHeaders` does the same for a file with no header line, with the names you give.
- `queryColumn` lists the values of one column, found by its name. With `asNumber` on, they come back as numbers.
- `queryRowsByValue` keeps the rows whose cell in a column equals a value.
- `getHeaders`, `getRowCount` and `getColumnCount` describe the table.

Every reader takes the row and column separators, a line break and a comma unless you say otherwise. A semicolon is common in countries that write decimals with a comma. Written in a Rete or Blockly field, `\n` and `\t` are read as a line break and a tab, so a whole table fits in one text field.

A cell in double quotes may hold the separator, and a quote inside it is written twice.

## A table into points

Here a table holds the x, y and z of five points. Each column is read as numbers, the three columns are turned on their side into points with `bitbybit.lists.flipLists`, and one smooth curve passes through them:

{/* example:curve-from-csv:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"table\":{\"id\":\"table\",\"name\":\"bitbybit.text.create\",\"customName\":\"create\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"x,y,z\\\\n0,0,0\\\\n2,1.5,1\\\\n4,0.5,3\\\\n6,2.5,2\\\\n8,1,0\"},\"inputs\":{},\"position\":[40,40]},\"xs\":{\"id\":\"xs\",\"name\":\"bitbybit.csv.queryColumn\",\"customName\":\"query column\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"csv\":\"name,age\\\\nJohn,30\\\\nJane,25\",\"column\":\"x\",\"headerRow\":0,\"dataStartRow\":1,\"rowSeparator\":\"\\\\n\",\"columnSeparator\":\",\",\"asNumber\":true},\"inputs\":{\"csv\":{\"connections\":[{\"node\":\"table\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"ys\":{\"id\":\"ys\",\"name\":\"bitbybit.csv.queryColumn\",\"customName\":\"query column\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"csv\":\"name,age\\\\nJohn,30\\\\nJane,25\",\"column\":\"y\",\"headerRow\":0,\"dataStartRow\":1,\"rowSeparator\":\"\\\\n\",\"columnSeparator\":\",\",\"asNumber\":true},\"inputs\":{\"csv\":{\"connections\":[{\"node\":\"table\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,520]},\"zs\":{\"id\":\"zs\",\"name\":\"bitbybit.csv.queryColumn\",\"customName\":\"query column\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"csv\":\"name,age\\\\nJohn,30\\\\nJane,25\",\"column\":\"z\",\"headerRow\":0,\"dataStartRow\":1,\"rowSeparator\":\"\\\\n\",\"columnSeparator\":\",\",\"asNumber\":true},\"inputs\":{\"csv\":{\"connections\":[{\"node\":\"table\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,1000]},\"columns\":{\"id\":\"columns\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"async\":false,\"drawable\":false,\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"xs\",\"output\":\"result\",\"data\":{}},{\"node\":\"ys\",\"output\":\"result\",\"data\":{}},{\"node\":\"zs\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]},\"points\":{\"id\":\"points\",\"name\":\"bitbybit.lists.flipLists\",\"customName\":\"flip lists\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"clone\":true},\"inputs\":{\"list\":{\"connections\":[{\"node\":\"columns\",\"output\":\"list\",\"data\":{}}]}},\"position\":[1300,40]},\"curve\":{\"id\":\"curve\",\"name\":\"bitbybit.occt.shapes.wire.interpolatePoints\",\"customName\":\"interpolate points\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"periodic\":false,\"tolerance\":1e-7,\"parametrization\":\"chordLength\"},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"points\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1720,40]}},\"modules\":{}}","type":"rete"}}
  title="A curve through points read from a CSV table in Rete"
  description="A CSV table with x, y and z columns, read column by column as numbers, turned into points and joined by one smooth curve."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"table\">table</variable><variable id=\"points\">points</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"table\">table</field><value name=\"VALUE\"><block type=\"bitbybit.text.create\"><value name=\"Text\"><block type=\"text\"><field name=\"TEXT\">x,y,z\\n0,0,0\\n2,1.5,1\\n4,0.5,3\\n6,2.5,2\\n8,1,0</field></block></value></block></value><next><block type=\"variables_set\"><field name=\"VAR\" id=\"points\">points</field><value name=\"VALUE\"><block type=\"bitbybit.lists.flipLists\"><value name=\"List\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.createEmptyList\"></block></value><value name=\"Item\"><block type=\"bitbybit.csv.queryColumn\"><value name=\"Csv\"><block type=\"variables_get\"><field name=\"VAR\" id=\"table\">table</field></block></value><value name=\"Column\"><block type=\"text\"><field name=\"TEXT\">x</field></block></value><value name=\"HeaderRow\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"DataStartRow\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"RowSeparator\"><block type=\"text\"><field name=\"TEXT\">\\n</field></block></value><value name=\"ColumnSeparator\"><block type=\"text\"><field name=\"TEXT\">,</field></block></value><value name=\"AsNumber\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Item\"><block type=\"bitbybit.csv.queryColumn\"><value name=\"Csv\"><block type=\"variables_get\"><field name=\"VAR\" id=\"table\">table</field></block></value><value name=\"Column\"><block type=\"text\"><field name=\"TEXT\">y</field></block></value><value name=\"HeaderRow\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"DataStartRow\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"RowSeparator\"><block type=\"text\"><field name=\"TEXT\">\\n</field></block></value><value name=\"ColumnSeparator\"><block type=\"text\"><field name=\"TEXT\">,</field></block></value><value name=\"AsNumber\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Item\"><block type=\"bitbybit.csv.queryColumn\"><value name=\"Csv\"><block type=\"variables_get\"><field name=\"VAR\" id=\"table\">table</field></block></value><value name=\"Column\"><block type=\"text\"><field name=\"TEXT\">z</field></block></value><value name=\"HeaderRow\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"DataStartRow\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"RowSeparator\"><block type=\"text\"><field name=\"TEXT\">\\n</field></block></value><value name=\"ColumnSeparator\"><block type=\"text\"><field name=\"TEXT\">,</field></block></value><value name=\"AsNumber\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"points\">points</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.wire.interpolatePoints\"><value name=\"Points\"><block type=\"variables_get\"><field name=\"VAR\" id=\"points\">points</field></block></value><value name=\"Periodic\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Tolerance\"><block type=\"math_number\"><field name=\"NUM\">1e-7</field></block></value><value name=\"Parametrization\"><block type=\"bitbybit.occt.enums.bSplineParametrizationEnum\"><field name=\"bitbybit.occt.enums.bSplineParametrizationEnum\">'chordLength'</field></block></value></block></value></block></next></block></next></block></next></block></xml>","type":"blockly"}}
  title="A curve through points read from a CSV table in Blockly"
  description="A CSV table with x, y and z columns, read column by column as numbers, turned into points and joined by one smooth curve."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const table = \"x,y,z\\n0,0,0\\n2,1.5,1\\n4,0.5,3\\n6,2.5,2\\n8,1,0\";\nconst column = (name: string) => bitbybit.csv.queryColumn({ csv: table, column: name, asNumber: true }) as number[];\nconst points = bitbybit.lists.flipLists({ list: [column(\"x\"), column(\"y\"), column(\"z\")] }) as [number, number, number][];\nconst curve = await bitbybit.occt.shapes.wire.interpolatePoints({ points });\n\nawait bitbybit.draw.drawAnyAsync({ entity: points });\nawait bitbybit.draw.drawAnyAsync({ entity: curve });","type":"typescript"}}
  title="A curve through points read from a CSV table in TypeScript"
  description="A CSV table with x, y and z columns, read column by column as numbers, turned into points and joined by one smooth curve."
/>

</TabItem>
</Tabs>

{/* example:curve-from-csv:end */}

In a project, keep the table as a file and load it with `bitbybit.asset.getTextFile` (see [Assets](../asset/intro)). A changed file changes the model.

## Writing a table

- `arrayToCsv` writes a list of rows, each a list of cells. A cell that holds a separator, a quote or a line break is quoted.
- `jsonToCsv` writes a list of objects with the columns you name, in that order.
- `jsonToCsvAuto` takes the columns from the first object's properties.

`bitbybit.asset.download` then saves the text as a `.csv` file, for a parts list or the measurements of a model.

## Every function

{/* api:csv:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`arrayToCsv`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#arrayToCsv) | Writes a list of rows, each a list of cells, as CSV text; a cell holding a separator, a quote or a line break is wrapped in double quotes. |
| [`getColumnCount`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#getColumnCount) | Counts the cells of the first non-blank row, which is the number of columns; empty text gives 0. |
| [`getHeaders`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#getHeaders) | Reads the cells of row `headerRow` as the header names; a row index past the end throws an error. |
| [`getRowCount`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#getRowCount) | Counts the data rows: all non-blank lines minus the ones before `dataStartRow`, or minus one header line when `hasHeaders` is true and `dataStartRow` is left out. |
| [`jsonToCsv`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#jsonToCsv) | Writes a list of objects as CSV text with the columns you name in `headers`, in that order; a property an object lacks becomes an empty cell. |
| [`jsonToCsvAuto`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#jsonToCsvAuto) | Writes a list of objects as CSV text using the property names of the first object as the columns, in their order; an empty list gives empty text. |
| [`parseToArray`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#parseToArray) | Splits CSV text into a list of rows, each a list of cell strings; nothing is converted to numbers. |
| [`parseToJson`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#parseToJson) | Turns CSV text into a list of objects, one per data row, keyed by the header names of row `headerRow`. |
| [`parseToJsonWithHeaders`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#parseToJsonWithHeaders) | Turns CSV text into a list of objects keyed by the `headers` you give, for files without a header line; a header line the file does have is skipped by setting `dataStartRow` past it. |
| [`queryColumn`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#queryColumn) | Lists every value of one column, found by its header name, in row order; a row without that cell gives an empty string. |
| [`queryRowsByValue`](https://docs.bitbybit.dev/classes/Bit.CSVBitByBit#queryRowsByValue) | Keeps only the rows whose cell in `column` equals `value`, giving them as objects keyed by the headers. |

{/* api:csv:end */}
