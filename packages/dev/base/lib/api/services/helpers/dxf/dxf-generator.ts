import * as Inputs from "../../../inputs";

export class DxfGenerator {
    private entityHandle = 1;

    /**
     * Generate a complete DXF file content from path-based entities
     */
    public generateDxf(dxfInputs: Inputs.IO.DxfModelDto): string {
        const dxfContent: string[] = [];

        // Header section
        dxfContent.push(...this.generateHeader());

        // Tables section
        dxfContent.push(...this.generateTables(dxfInputs));

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
        return [
            "0",
            "SECTION",
            "2",
            "HEADER",
            "9",
            "$ACADVER",
            "1",
            "AC1015", // AutoCAD 2000 format
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
            "20000",
            "0",
            "ENDSEC"
        ];
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

        // Layer table
        tables.push(...this.generateLayerTable(dxfInputs));

        tables.push("0", "ENDSEC");
        return tables;
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
            "5",
            "2",
            "100",
            "AcDbSymbolTable",
            "70",
            layers.size.toString()
        ];

        // Generate layer entries
        layers.forEach(layerName => {
            layerTable.push(
                "0",
                "LAYER",
                "5",
                this.getNextHandle(),
                "100",
                "AcDbSymbolTableRecord",
                "100",
                "AcDbLayerTableRecord",
                "2",
                layerName,
                "70",
                "0",
                "62",
                "7", // Default color (white)
                "6",
                "CONTINUOUS" // Line type
            );
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
            "5",
            this.getNextHandle(),
            "100",
            "AcDbEntity"
        ];

        // Add layer
        entity.push("8", part.layer || "0");

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        entity.push(
            "100",
            "AcDbLine",
            "10",
            line.start[0].toString(),
            "20",
            line.start[1].toString(),
            "30",
            "0", // Z coordinate (2D)
            "11",
            line.end[0].toString(),
            "21",
            line.end[1].toString(),
            "31",
            "0" // Z coordinate (2D)
        );

        return entity;
    }

    /**
     * Generate a CIRCLE entity
     */
    private generateCircleEntity(circle: Inputs.IO.DxfCircleSegmentDto, part: Inputs.IO.DxfPathsPartDto): string[] {
        const entity: string[] = [
            "0",
            "CIRCLE",
            "5",
            this.getNextHandle(),
            "100",
            "AcDbEntity"
        ];

        // Add layer
        entity.push("8", part.layer || "0");

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        entity.push(
            "100",
            "AcDbCircle",
            "10",
            circle.center[0].toString(),
            "20",
            circle.center[1].toString(),
            "30",
            "0", // Z coordinate (2D)
            "40",
            circle.radius.toString()
        );

        return entity;
    }

    /**
     * Generate an ARC entity
     */
    private generateArcEntity(arc: Inputs.IO.DxfArcSegmentDto, part: Inputs.IO.DxfPathsPartDto): string[] {
        const entity: string[] = [
            "0",
            "ARC",
            "5",
            this.getNextHandle(),
            "100",
            "AcDbEntity"
        ];

        // Add layer
        entity.push("8", part.layer || "0");

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        entity.push(
            "100",
            "AcDbCircle",
            "10",
            arc.center[0].toString(),
            "20",
            arc.center[1].toString(),
            "30",
            "0", // Z coordinate (2D)
            "40",
            arc.radius.toString(),
            "100",
            "AcDbArc",
            "50",
            arc.startAngle.toString(),
            "51",
            arc.endAngle.toString()
        );

        return entity;
    }

    /**
     * Generate a LWPOLYLINE entity
     */
    private generatePolylineEntity(polyline: Inputs.IO.DxfPolylineSegmentDto, part: Inputs.IO.DxfPathsPartDto): string[] {
        const entity: string[] = [
            "0",
            "LWPOLYLINE",
            "5",
            this.getNextHandle(),
            "100",
            "AcDbEntity"
        ];

        // Add layer
        entity.push("8", part.layer || "0");

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        const isClosed = polyline.closed || (polyline.points.length > 2 && this.isClosedPolyline(polyline.points));

        entity.push(
            "100",
            "AcDbPolyline",
            "90",
            polyline.points.length.toString(),
            "70",
            isClosed ? "1" : "0"
        );

        // Add vertices
        polyline.points.forEach((point, index) => {
            entity.push(
                "10",
                point[0].toString(),
                "20",
                point[1].toString()
            );
            
            // Add bulge value if specified (for arc segments)
            if (polyline.bulges && polyline.bulges.length > index) {
                const bulge = polyline.bulges[index];
                if (bulge !== 0) {
                    entity.push("42", bulge.toString());
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
            "5",
            this.getNextHandle(),
            "100",
            "AcDbEntity"
        ];

        // Add layer
        entity.push("8", part.layer || "0");

        // Add color if specified
        if (part.color !== undefined) {
            const colorCodes = this.convertColorToDxf(part.color);
            colorCodes.forEach(cc => entity.push(cc.code, cc.value));
        }

        const degree = spline.degree || 3;
        const numControlPoints = spline.controlPoints.length;
        const numKnots = numControlPoints + degree + 1;

        // Spline flags: 1 = closed, 2 = periodic, 4 = rational, 8 = planar, 16 = linear
        const flags = spline.closed ? 1 : 0;

        entity.push(
            "100",
            "AcDbSpline",
            "210",
            "0",
            "220",
            "0",
            "230",
            "1", // Normal vector (Z-axis for 2D)
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

        // Generate knot values (uniform knot vector)
        for (let i = 0; i < numKnots; i++) {
            entity.push("40", i.toString());
        }

        // Add control points
        spline.controlPoints.forEach(point => {
            entity.push(
                "10",
                point[0].toString(),
                "20",
                point[1].toString(),
                "30",
                "0" // Z coordinate (2D)
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
     * Returns appropriate DXF color codes
     */
    private convertColorToDxf(color: string): { code: string, value: string }[] {
        // If it's already a number (ACI index), use it directly
        if (/^\d+$/.test(color)) {
            const colorIndex = parseInt(color, 10);
            if (colorIndex >= 1 && colorIndex <= 255) {
                return [{ code: "62", value: color }];
            }
        }

        // If it's a hex color, convert to true color (24-bit RGB)
        if (color.startsWith("#")) {
            const hex = color.substring(1);
            if (hex.length === 6) {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                
                // True color value = (R * 65536) + (G * 256) + B
                const trueColor = (r * 65536) + (g * 256) + b;
                
                // Use group code 420 for true color (24-bit)
                return [
                    { code: "62", value: "256" },  // 256 = ByLayer, but we override with true color
                    { code: "420", value: trueColor.toString() }
                ];
            }
        }

        // Default to white (7) if color can't be parsed
        return [{ code: "62", value: "7" }];
    }

}

