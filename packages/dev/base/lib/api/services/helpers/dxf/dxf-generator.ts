import * as Inputs from "../../../inputs";

export class DxfGenerator {
    private entityHandle = 256; // Start at 256 to avoid conflicts with system handles
    private colorFormat: "aci" | "truecolor" = "aci";
    private acadVersion: "AC1009" | "AC1015" = "AC1009";

    /**
     * Generate a complete DXF file content from path-based entities
     */
    public generateDxf(dxfInputs: Inputs.IO.DxfModelDto): string {
        // Set format options from input
        this.colorFormat = dxfInputs.colorFormat || "aci";
        this.acadVersion = dxfInputs.acadVersion || "AC1009";
        
        const dxfContent: string[] = [];

        // Header section
        dxfContent.push(...this.generateHeader());

        // Tables section
        dxfContent.push(...this.generateTables(dxfInputs));

        // Blocks section (required by many CAD programs)
        dxfContent.push(...this.generateBlocks());

        // Entities section
        dxfContent.push(...this.generateEntities(dxfInputs));

        // End of file
        dxfContent.push("0", "EOF");

        return dxfContent.join("\n");
    }

    /**
     * Generate DXF header section
     */
    private generateHeader(): string[] {
        const header = [
            "0",
            "SECTION",
            "2",
            "HEADER",
            "9",
            "$ACADVER",
            "1",
            this.acadVersion
        ];

        if (this.acadVersion === "AC1009") {
            // AC1009 (AutoCAD R12) - minimal header for maximum compatibility
            header.push(
                "9",
                "$DWGCODEPAGE",
                "3",
                "ascii",
                "9",
                "$HANDSEED",
                "5",
                "0"
            );
        } else {
            // AC1015 (AutoCAD 2000) - modern format
            header.push(
                "9",
                "$DWGCODEPAGE",
                "3",
                "ANSI_1252",
                "9",
                "$LASTSAVEDBY",
                "1",
                "bitbybit.dev",
                "9",
                "$HANDSEED",
                "5",
                "20000"
            );
        }

        header.push("0", "ENDSEC");
        return header;
    }

    /**
     * Generate DXF tables section (layers, line types, etc.)
     */
    private generateTables(dxfInputs: Inputs.IO.DxfModelDto): string[] {
        const tables: string[] = [
            "0",
            "SECTION",
            "2",
            "TABLES"
        ];

        // VPORT table (required for AC1009)
        if (this.acadVersion === "AC1009") {
            tables.push(...this.generateVportTable());
        }

        // Line type table (required)
        tables.push(...this.generateLineTypeTable());

        // Layer table
        tables.push(...this.generateLayerTable(dxfInputs));

        // Text style table (required for text entities, included for completeness)
        tables.push(...this.generateStyleTable());

        // Additional tables for AC1009
        if (this.acadVersion === "AC1009") {
            tables.push(...this.generateViewTable());
            tables.push(...this.generateUcsTable());
            tables.push(...this.generateAppidTable());
            tables.push(...this.generateDimstyleTable());
        }

        tables.push("0", "ENDSEC");
        return tables;
    }

    /**
     * Generate line type table
     */
    private generateLineTypeTable(): string[] {
        const ltype: string[] = [
            "0",
            "TABLE",
            "2",
            "LTYPE",
            "70",
            "1" // Number of line types
        ];

        if (this.acadVersion === "AC1015") {
            ltype.push("5", "5", "100", "AcDbSymbolTable");
        }

        ltype.push(
            "0",
            "LTYPE",
            "2",
            "CONTINUOUS",
            "70",
            this.acadVersion === "AC1009" ? "64" : "0",
            "3",
            "Solid line",
            "72",
            "65",
            "73",
            "0",
            "40",
            "0.0"
        );

        if (this.acadVersion === "AC1015") {
            ltype.splice(ltype.indexOf("LTYPE") + 1, 0, "5", "14", "100", "AcDbSymbolTableRecord", "100", "AcDbLinetypeTableRecord");
        }

        ltype.push("0", "ENDTAB");
        return ltype;
    }

    /**
     * Generate text style table
     */
    private generateStyleTable(): string[] {
        const style: string[] = [
            "0",
            "TABLE",
            "2",
            "STYLE",
            "70",
            "1" // Number of styles
        ];

        if (this.acadVersion === "AC1015") {
            style.push("5", "3", "100", "AcDbSymbolTable");
        }

        style.push(
            "0",
            "STYLE",
            "2",
            "STANDARD",
            "70",
            "0",
            "40",
            "0.0",
            "41",
            "1.0",
            "50",
            "0.0",
            "71",
            "0",
            "42",
            "0.2",
            "3",
            "txt",
            "4",
            ""
        );

        if (this.acadVersion === "AC1015") {
            style.splice(style.indexOf("STYLE") + 1, 0, "5", "11", "100", "AcDbSymbolTableRecord", "100", "AcDbTextStyleTableRecord");
        }

        style.push("0", "ENDTAB");
        return style;
    }

    /**
     * Generate VPORT table (viewport configuration)
     */
    private generateVportTable(): string[] {
        return [
            "0",
            "TABLE",
            "2",
            "VPORT",
            "70",
            "2", // Number of viewports
            "0",
            "VPORT",
            "2",
            "*ACTIVE",
            "70",
            "0",
            "10",
            "0.0",
            "20",
            "0.0",
            "11",
            "1.0",
            "21",
            "1.0",
            "12",
            "15.0",
            "22",
            "11.101231",
            "13",
            "0.0",
            "23",
            "0.0",
            "14",
            "0.1",
            "24",
            "0.1",
            "15",
            "0.5",
            "25",
            "0.5",
            "16",
            "0.0",
            "26",
            "0.0",
            "36",
            "1.0",
            "17",
            "0.0",
            "27",
            "0.0",
            "37",
            "0.0",
            "40",
            "22.202462",
            "41",
            "1.351201",
            "42",
            "50.0",
            "43",
            "0.0",
            "44",
            "0.0",
            "50",
            "0.0",
            "51",
            "0.0",
            "71",
            "0",
            "72",
            "100",
            "73",
            "1",
            "74",
            "1",
            "75",
            "1",
            "76",
            "0",
            "77",
            "0",
            "78",
            "0",
            "0",
            "ENDTAB"
        ];
    }

    /**
     * Generate VIEW table (empty but required for AC1009)
     */
    private generateViewTable(): string[] {
        return [
            "0",
            "TABLE",
            "2",
            "VIEW",
            "70",
            "0",
            "0",
            "ENDTAB"
        ];
    }

    /**
     * Generate UCS table (user coordinate system - empty but required for AC1009)
     */
    private generateUcsTable(): string[] {
        return [
            "0",
            "TABLE",
            "2",
            "UCS",
            "70",
            "0",
            "0",
            "ENDTAB"
        ];
    }

    /**
     * Generate APPID table (application ID - required for AC1009)
     */
    private generateAppidTable(): string[] {
        return [
            "0",
            "TABLE",
            "2",
            "APPID",
            "70",
            "1",
            "0",
            "APPID",
            "2",
            "ACAD",
            "70",
            "64",
            "0",
            "ENDTAB"
        ];
    }

    /**
     * Generate DIMSTYLE table (dimension style - empty but required for AC1009)
     */
    private generateDimstyleTable(): string[] {
        return [
            "0",
            "TABLE",
            "2",
            "DIMSTYLE",
            "70",
            "0",
            "0",
            "ENDTAB"
        ];
    }

    /**
     * Generate blocks section (empty but required)
     */
    private generateBlocks(): string[] {
        return [
            "0",
            "SECTION",
            "2",
            "BLOCKS",
            "0",
            "ENDSEC"
        ];
    }

    /**
     * Generate layer table based on unique layers in all parts
     */
    private generateLayerTable(dxfInputs: Inputs.IO.DxfModelDto): string[] {
        const layers = new Set<string>();

        // Collect all unique layer names
        if (dxfInputs.dxfPathsParts) {
            dxfInputs.dxfPathsParts.forEach(part => {
                if (part.layer) {
                    layers.add(part.layer);
                }
            });
        }

        // Add default layer if no layers specified
        if (layers.size === 0) {
            layers.add("0");
        }

        const layerTable: string[] = [
            "0",
            "TABLE",
            "2",
            "LAYER",
            "70",
            layers.size.toString()
        ];

        if (this.acadVersion === "AC1015") {
            layerTable.splice(4, 0, "5", "2", "100", "AcDbSymbolTable");
        }

        // Generate layer entries
        layers.forEach(layerName => {
            layerTable.push(
                "0",
                "LAYER",
                "2",
                layerName,
                "70",
                "0",
                "62",
                "7", // Default color (white)
                "6",
                "CONTINUOUS" // Line type
            );

            // Add AC1015-specific subclass markers
            if (this.acadVersion === "AC1015") {
                const insertIdx = layerTable.lastIndexOf("LAYER") + 1;
                layerTable.splice(insertIdx, 0, "5", this.getNextHandle(), "100", "AcDbSymbolTableRecord", "100", "AcDbLayerTableRecord");
            }
        });

        layerTable.push("0", "ENDTAB");
        return layerTable;
    }

    /**
     * Generate DXF entities section with all path segments
     */
    private generateEntities(dxfInputs: Inputs.IO.DxfModelDto): string[] {
        const entities: string[] = [
            "0",
            "SECTION",
            "2",
            "ENTITIES"
        ];

        if (dxfInputs.dxfPathsParts) {
            dxfInputs.dxfPathsParts.forEach(part => {
                if (part.paths) {
                    part.paths.forEach(path => {
                        if (path.segments) {
                            path.segments.forEach(segment => {
                                entities.push(...this.generateSegmentEntity(segment, part));
                            });
                        }
                    });
                }
            });
        }

        entities.push("0", "ENDSEC");
        return entities;
    }

    /**
     * Generate entity for a single segment based on its type
     */
    private generateSegmentEntity(
        segment: Inputs.IO.DxfLineSegmentDto | Inputs.IO.DxfArcSegmentDto | Inputs.IO.DxfCircleSegmentDto | Inputs.IO.DxfPolylineSegmentDto | Inputs.IO.DxfSplineSegmentDto,
        part: Inputs.IO.DxfPathsPartDto
    ): string[] {
        // Check segment type and generate appropriate entity
        if (this.isLineSegment(segment)) {
            return this.generateLineEntity(segment, part);
        } else if (this.isArcSegment(segment)) {
            return this.generateArcEntity(segment, part);
        } else if (this.isCircleSegment(segment)) {
            return this.generateCircleEntity(segment, part);
        } else if (this.isPolylineSegment(segment)) {
            return this.generatePolylineEntity(segment, part);
        } else if (this.isSplineSegment(segment)) {
            return this.generateSplineEntity(segment, part);
        }
        return [];
    }

    /**
     * Type guard for line segments
     */
    private isLineSegment(segment: Inputs.IO.DxfLineSegmentDto | Inputs.IO.DxfArcSegmentDto | Inputs.IO.DxfCircleSegmentDto | Inputs.IO.DxfPolylineSegmentDto | Inputs.IO.DxfSplineSegmentDto): segment is Inputs.IO.DxfLineSegmentDto {
        return (segment as Inputs.IO.DxfLineSegmentDto).start !== undefined && (segment as Inputs.IO.DxfLineSegmentDto).end !== undefined && (segment as Inputs.IO.DxfCircleSegmentDto).radius === undefined;
    }

    /**
     * Type guard for arc segments
     */
    private isArcSegment(segment: Inputs.IO.DxfLineSegmentDto | Inputs.IO.DxfArcSegmentDto | Inputs.IO.DxfCircleSegmentDto | Inputs.IO.DxfPolylineSegmentDto | Inputs.IO.DxfSplineSegmentDto): segment is Inputs.IO.DxfArcSegmentDto {
        return (segment as Inputs.IO.DxfArcSegmentDto).center !== undefined && (segment as Inputs.IO.DxfArcSegmentDto).radius !== undefined && (segment as Inputs.IO.DxfArcSegmentDto).startAngle !== undefined && (segment as Inputs.IO.DxfArcSegmentDto).endAngle !== undefined;
    }

    /**
     * Type guard for circle segments
     */
    private isCircleSegment(segment: Inputs.IO.DxfLineSegmentDto | Inputs.IO.DxfArcSegmentDto | Inputs.IO.DxfCircleSegmentDto | Inputs.IO.DxfPolylineSegmentDto | Inputs.IO.DxfSplineSegmentDto): segment is Inputs.IO.DxfCircleSegmentDto {
        return (segment as Inputs.IO.DxfCircleSegmentDto).center !== undefined && (segment as Inputs.IO.DxfCircleSegmentDto).radius !== undefined && (segment as Inputs.IO.DxfArcSegmentDto).startAngle === undefined;
    }

    /**
     * Type guard for polyline segments
     */
    private isPolylineSegment(segment: Inputs.IO.DxfLineSegmentDto | Inputs.IO.DxfArcSegmentDto | Inputs.IO.DxfCircleSegmentDto | Inputs.IO.DxfPolylineSegmentDto | Inputs.IO.DxfSplineSegmentDto): segment is Inputs.IO.DxfPolylineSegmentDto {
        return (segment as Inputs.IO.DxfPolylineSegmentDto).points !== undefined && Array.isArray((segment as Inputs.IO.DxfPolylineSegmentDto).points);
    }

    /**
     * Type guard for spline segments
     */
    private isSplineSegment(segment: Inputs.IO.DxfLineSegmentDto | Inputs.IO.DxfArcSegmentDto | Inputs.IO.DxfCircleSegmentDto | Inputs.IO.DxfPolylineSegmentDto | Inputs.IO.DxfSplineSegmentDto): segment is Inputs.IO.DxfSplineSegmentDto {
        return (segment as Inputs.IO.DxfSplineSegmentDto).controlPoints !== undefined && Array.isArray((segment as Inputs.IO.DxfSplineSegmentDto).controlPoints);
    }

    /**
     * Generate a LINE entity
     */
    private generateLineEntity(line: Inputs.IO.DxfLineSegmentDto, part: Inputs.IO.DxfPathsPartDto): string[] {
        const entity: string[] = [
            "0",
            "LINE",
            "8",
            part.layer || "0"
        ];

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        entity.push(
            "10",
            line.start[0].toFixed(6),
            "20",
            line.start[1].toFixed(6),
            "30",
            "0.00", // Z coordinate (2D)
            "11",
            line.end[0].toFixed(6),
            "21",
            line.end[1].toFixed(6),
            "31",
            "0.00" // Z coordinate (2D)
        );

        // Add AC1015-specific codes
        if (this.acadVersion === "AC1015") {
            entity.splice(2, 0, "5", this.getNextHandle(), "100", "AcDbEntity");
            const coordIdx = entity.indexOf("10");
            entity.splice(coordIdx, 0, "100", "AcDbLine");
        }

        return entity;
    }

    /**
     * Generate a CIRCLE entity
     */
    private generateCircleEntity(circle: Inputs.IO.DxfCircleSegmentDto, part: Inputs.IO.DxfPathsPartDto): string[] {
        const entity: string[] = [
            "0",
            "CIRCLE",
            "8",
            part.layer || "0"
        ];

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        entity.push(
            "10",
            circle.center[0].toFixed(6),
            "20",
            circle.center[1].toFixed(6),
            "30",
            "0.00",
            "40",
            circle.radius.toFixed(6)
        );

        // Add AC1015-specific codes
        if (this.acadVersion === "AC1015") {
            entity.splice(2, 0, "5", this.getNextHandle(), "100", "AcDbEntity");
            const coordIdx = entity.indexOf("10");
            entity.splice(coordIdx, 0, "100", "AcDbCircle");
        }

        return entity;
    }

    /**
     * Generate an ARC entity
     */
    private generateArcEntity(arc: Inputs.IO.DxfArcSegmentDto, part: Inputs.IO.DxfPathsPartDto): string[] {
        const entity: string[] = [
            "0",
            "ARC",
            "8",
            part.layer || "0"
        ];

        // Add line type for AC1009 (optional empty)
        if (this.acadVersion === "AC1009") {
            entity.push("6", " ");
        }

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        entity.push(
            "10",
            arc.center[0].toFixed(6),
            "20",
            arc.center[1].toFixed(6),
            "30",
            this.acadVersion === "AC1009" ? "" : "0.0",
            "40",
            arc.radius.toFixed(6),
            "50",
            arc.startAngle.toFixed(6),
            "51",
            arc.endAngle.toFixed(6)
        );

        // Add AC1015-specific codes
        if (this.acadVersion === "AC1015") {
            entity.splice(2, 0, "5", this.getNextHandle(), "100", "AcDbEntity");
            const coordIdx = entity.indexOf("10");
            entity.splice(coordIdx, 0, "100", "AcDbCircle");
            const angleIdx = entity.indexOf("50");
            entity.splice(angleIdx, 0, "100", "AcDbArc");
        }

        return entity;
    }

    /**
     * Generate a LWPOLYLINE entity
     */
    private generatePolylineEntity(polyline: Inputs.IO.DxfPolylineSegmentDto, part: Inputs.IO.DxfPathsPartDto): string[] {
        const entity: string[] = [
            "0",
            "LWPOLYLINE",
            "8",
            part.layer || "0"
        ];

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        const isClosed = polyline.closed || (polyline.points.length > 2 && this.isClosedPolyline(polyline.points));

        entity.push(
            "90",
            polyline.points.length.toString(),
            "70",
            isClosed ? "1" : "0"
        );

        // Add AC1015-specific codes
        if (this.acadVersion === "AC1015") {
            entity.splice(2, 0, "5", this.getNextHandle(), "100", "AcDbEntity");
            const pointIdx = entity.indexOf("90");
            entity.splice(pointIdx, 0, "100", "AcDbPolyline");
        }

        // Add vertices
        polyline.points.forEach((point, index) => {
            entity.push(
                "10",
                point[0].toFixed(6),
                "20",
                point[1].toFixed(6)
            );
            
            // Add bulge value if specified (for arc segments)
            if (polyline.bulges && polyline.bulges.length > index) {
                const bulge = polyline.bulges[index];
                if (bulge !== 0) {
                    entity.push("42", bulge.toFixed(6));
                }
            }
        });

        return entity;
    }

    /**
     * Generate a SPLINE entity
     */
    private generateSplineEntity(spline: Inputs.IO.DxfSplineSegmentDto, part: Inputs.IO.DxfPathsPartDto): string[] {
        const entity: string[] = [
            "0",
            "SPLINE",
            "8",
            part.layer || "0"
        ];

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        const degree = spline.degree || 3;
        const numControlPoints = spline.controlPoints.length;
        const numKnots = numControlPoints + degree + 1;

        // Spline flags: 1 = closed, 2 = periodic, 4 = rational, 8 = planar, 16 = linear
        const flags = spline.closed ? 9 : 8; // Add planar flag (8) for 2D splines

        entity.push(
            "210",
            "0.0",
            "220",
            "0.0",
            "230",
            "1.0", // Normal vector (Z-axis for 2D)
            "70",
            flags.toString(),
            "71",
            degree.toString(),
            "72",
            numKnots.toString(),
            "73",
            numControlPoints.toString(),
            "74",
            "0" // Number of fit points (we're using control points)
        );

        // Add AC1015-specific codes
        if (this.acadVersion === "AC1015") {
            entity.splice(2, 0, "5", this.getNextHandle(), "100", "AcDbEntity");
            const normalIdx = entity.indexOf("210");
            entity.splice(normalIdx, 0, "100", "AcDbSpline");
        }

        // Generate knot values (uniform knot vector)
        for (let i = 0; i < numKnots; i++) {
            entity.push("40", i.toFixed(6));
        }

        // Add control points
        spline.controlPoints.forEach(point => {
            entity.push(
                "10",
                point[0].toFixed(6),
                "20",
                point[1].toFixed(6),
                "30",
                "0.0" // Z coordinate (2D)
            );
        });

        return entity;
    }

    /**
     * Check if polyline should be closed (first and last points are the same)
     */
    private isClosedPolyline(points: number[][]): boolean {
        if (points.length < 3) return false;

        const first = points[0];
        const last = points[points.length - 1];

        return Math.abs(first[0] - last[0]) < 1e-10 &&
            Math.abs(first[1] - last[1]) < 1e-10;
    }

    /**
     * Get next entity handle as hex string
     */
    private getNextHandle(): string {
        return (++this.entityHandle).toString(16).toUpperCase();
    }

    /**
     * Convert color to DXF format
     * Accepts hex color (#RRGGBB) or ACI color index (1-255)
     * Returns appropriate DXF color codes based on colorFormat setting
     */
    private convertColorToDxf(color: string): { code: string, value: string }[] {
        // If it's already a number (ACI index), use it directly
        if (/^\d+$/.test(color)) {
            const colorIndex = parseInt(color, 10);
            if (colorIndex >= 1 && colorIndex <= 255) {
                return [{ code: "62", value: color }];
            }
        }

        // If it's a hex color, handle based on format preference
        if (color.startsWith("#")) {
            const hex = color.substring(1);
            if (hex.length === 6) {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                
                if (this.colorFormat === "truecolor") {
                    // Use 24-bit true color for full color spectrum (newer CAD software)
                    const trueColor = (r * 65536) + (g * 256) + b;
                    return [
                        { code: "62", value: "256" },  // 256 = ByEntity
                        { code: "420", value: trueColor.toString() }
                    ];
                } else {
                    // Use ACI color index for better compatibility (older CAD software)
                    const aciIndex = this.rgbToAciColorIndex(r, g, b);
                    return [{ code: "62", value: aciIndex.toString() }];
                }
            }
        }

        // Default to white (7) if color can't be parsed
        return [{ code: "62", value: "7" }];
    }

    /**
     * Convert RGB values to nearest AutoCAD Color Index (ACI)
     * Uses a simplified mapping to standard ACI colors
     */
    private rgbToAciColorIndex(r: number, g: number, b: number): number {
        // ACI standard colors (simplified mapping)
        const aciColors: { [key: number]: [number, number, number] } = {
            1: [255, 0, 0],     // Red
            2: [255, 255, 0],   // Yellow
            3: [0, 255, 0],     // Green
            4: [0, 255, 255],   // Cyan
            5: [0, 0, 255],     // Blue
            6: [255, 0, 255],   // Magenta
            7: [255, 255, 255], // White
            8: [128, 128, 128], // Gray
            9: [192, 192, 192]  // Light gray
        };

        // Special case for black or very dark colors
        if (r < 30 && g < 30 && b < 30) {
            return 7; // Use white for visibility on dark backgrounds
        }

        // Find nearest color
        let nearestIndex = 7;
        let minDistance = Infinity;

        for (const [index, [cr, cg, cb]] of Object.entries(aciColors)) {
            const distance = Math.sqrt(
                Math.pow(r - cr, 2) +
                Math.pow(g - cg, 2) +
                Math.pow(b - cb, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = parseInt(index);
            }
        }

        return nearestIndex;
    }

}

