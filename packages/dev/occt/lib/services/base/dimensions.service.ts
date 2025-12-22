import {
    TopoDS_Compound,
    TopoDS_Edge,
    TopoDS_Shape,
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { TransformsService } from "./transforms.service";
import { ConverterService } from "./converter.service";
import { WiresService } from "./wires.service";
import { BaseBitByBit } from "../../base";
import { EdgesService } from "./edges.service";
import { EntitiesService } from "./entities.service";

export class DimensionsService {

    constructor(
        private readonly base: BaseBitByBit,
        private readonly transformsService: TransformsService,
        private readonly converterService: ConverterService,
        private readonly entitiesService: EntitiesService,
        private readonly edgesService: EdgesService,
        private readonly wiresService: WiresService
    ) { }

    /**
     * Evaluates a mathematical expression or template string with a given value
     * @param expression The expression to evaluate (can contain 'val' placeholder)
     * @param value The numeric value to substitute for 'val'
     * @param decimalPlaces Number of decimal places to format the result
     * @param removeTrailingZeros Whether to remove trailing zeros from the result
     * @returns The evaluated expression as a formatted string
     */
    private evaluateExpression(expression: string, value: number, decimalPlaces: number, removeTrailingZeros = false): string {
        try {
            // Replace 'val' with the actual value in the expression
            const evaluatedExpression = expression.replace(/val/g, value.toString());
            
            // Simple math expression evaluation (supports +, -, *, /, parentheses)
            // Only allow safe mathematical operations
            const safeExpression = evaluatedExpression.replace(/[^0-9+\-*/.() ]/g, "");
            if (safeExpression !== evaluatedExpression) {
                // If expression contains non-math characters, treat it as a template
                // For template strings, we still want to format numbers with decimal places
                const formattedValue = removeTrailingZeros 
                    ? this.base.math.roundAndRemoveTrailingZeros({ number: value, decimalPlaces }).toString()
                    : value.toFixed(decimalPlaces);
                return expression.replace(/val/g, formattedValue);
            }
            
            // Evaluate mathematical expression and apply decimal places
            const result = Function("\"use strict\"; return (" + safeExpression + ")")();
            return removeTrailingZeros
                ? this.base.math.roundAndRemoveTrailingZeros({ number: result, decimalPlaces }).toString()
                : result.toFixed(decimalPlaces);
        } catch (error) {
            // If evaluation fails, return the original value formatted
            return removeTrailingZeros
                ? this.base.math.roundAndRemoveTrailingZeros({ number: value, decimalPlaces }).toString()
                : value.toFixed(decimalPlaces);
        }
    }

    /**
     * Formats dimension label text with optional expression evaluation
     * @param value The numeric value to display
     * @param labelOverwrite Optional expression to evaluate instead of raw value
     * @param decimalPlaces Number of decimal places for formatting
     * @param labelSuffix Suffix to append to the text
     * @param removeTrailingZeros Whether to remove trailing zeros from the result
     * @returns Formatted dimension label text
     */
    private formatDimensionLabel(
        value: number,
        labelOverwrite: string | undefined,
        decimalPlaces: number,
        labelSuffix: string,
        removeTrailingZeros = false
    ): string {
        let result: string;
        if (labelOverwrite) {
            result = this.evaluateExpression(labelOverwrite, value, decimalPlaces, removeTrailingZeros);
        } else {
            if (removeTrailingZeros) {
                result = this.base.math.roundAndRemoveTrailingZeros({ number: value, decimalPlaces }).toString();
            } else {
                result = value.toFixed(decimalPlaces);
            }
        }
        return result + " " + labelSuffix;
    }

    private createArrow(inputs: {
        tipPoint: Inputs.Base.Point3,
        direction: Inputs.Base.Vector3,
        normal: Inputs.Base.Vector3,
        size: number,
        angle: number,
        flipped: boolean
    }): TopoDS_Compound {
        const shapesToDelete: TopoDS_Shape[] = [];
        
        // Normalize the direction vector (should point away from tip when not flipped)
        const dir = this.base.vector.normalized({ vector: inputs.direction });
        
        // Determine arrow direction based on flip
        const arrowDir = inputs.flipped 
            ? dir 
            : this.base.vector.mul({ vector: dir, scalar: -1 }) as Inputs.Base.Vector3;
        
        // Calculate the perpendicular vector in the plane
        const perpendicular = this.base.vector.cross({
            first: arrowDir as Inputs.Base.Vector3,
            second: inputs.normal
        }) as Inputs.Base.Vector3;
        const perpNorm = this.base.vector.normalized({ vector: perpendicular });
        
        // Calculate half angle in radians
        const halfAngleRad = (inputs.angle / 2) * Math.PI / 180;
        
        // Calculate arrow line endpoints
        const baseLength = inputs.size * Math.cos(halfAngleRad);
        const sideOffset = inputs.size * Math.sin(halfAngleRad);
        
        // Base point for both arrow lines
        const baseVec = this.base.vector.mul({ vector: arrowDir, scalar: baseLength }) as Inputs.Base.Vector3;
        const basePoint = this.base.point.translatePoints({
            points: [inputs.tipPoint],
            translation: baseVec
        })[0];
        
        // Calculate the two arrow line endpoints
        const sideVec1 = this.base.vector.mul({ vector: perpNorm, scalar: sideOffset }) as Inputs.Base.Vector3;
        const sideVec2 = this.base.vector.mul({ vector: perpNorm, scalar: -sideOffset }) as Inputs.Base.Vector3;
        
        const endPoint1 = this.base.point.translatePoints({
            points: [basePoint],
            translation: sideVec1
        })[0];
        
        const endPoint2 = this.base.point.translatePoints({
            points: [basePoint],
            translation: sideVec2
        })[0];
        
        // Create the two arrow lines
        const line1 = this.wiresService.createLineWireWithExtensions({
            start: inputs.tipPoint,
            end: endPoint1,
            extensionStart: 0,
            extensionEnd: 0
        });
        
        const line2 = this.wiresService.createLineWireWithExtensions({
            start: inputs.tipPoint,
            end: endPoint2,
            extensionStart: 0,
            extensionEnd: 0
        });
        
        const result = this.converterService.makeCompound({ shapes: [line1, line2] });
        
        // Cleanup
        shapesToDelete.forEach(shape => shape.delete());
        
        return result;
    }

    simpleLinearLengthDimension(inputs: Inputs.OCCT.SimpleLinearLengthDimensionDto): TopoDS_Compound {
        const shapesToDelete: TopoDS_Shape[] = [];
        const lineBetweenPoints = this.wiresService.createLineWireWithExtensions({
            start: inputs.start,
            end: inputs.end,
            extensionStart: inputs.crossingSize,
            extensionEnd: inputs.crossingSize,
        });
        shapesToDelete.push(lineBetweenPoints);

        const translatedLine = this.transformsService.translate({
            shape: lineBetweenPoints,
            translation: inputs.direction,
        });

        const translatedPts = this.base.point.translatePoints({
            points: [inputs.start, inputs.end],
            translation: inputs.direction,
        });

        const translatedStartPt = translatedPts[0];
        const translatedEndPt = translatedPts[1];

        const startLineToTranslatedPoint = this.wiresService.createLineWireWithExtensions({
            start: inputs.start,
            end: translatedStartPt,
            extensionStart: -inputs.offsetFromPoints,
            extensionEnd: inputs.crossingSize,
        });

        const endLineToTranslatedPoint = this.wiresService.createLineWireWithExtensions({
            start: inputs.end,
            end: translatedEndPt,
            extensionStart: -inputs.offsetFromPoints,
            extensionEnd: inputs.crossingSize,
        });

        const midPt = this.wiresService.midPointOnWire({ shape: translatedLine });
        const length = this.base.point.distance({
            startPoint: inputs.start,
            endPoint: inputs.end,
        });

        const labelText = this.formatDimensionLabel(
            length,
            inputs.labelOverwrite,
            inputs.decimalPlaces,
            inputs.labelSuffix,
            inputs.removeTrailingZeros
        );

        const txtOpt = new Inputs.OCCT.TextWiresDto();
        txtOpt.text = labelText;
        txtOpt.xOffset = 0;
        txtOpt.yOffset = 0;
        txtOpt.height = inputs.labelSize;
        txtOpt.centerOnOrigin = true;

        const txt = this.wiresService.textWiresWithData(txtOpt);

        // get the up vector for the dimension plane
        const normalThreePoints = this.base.point.normalFromThreePoints({
            point1: inputs.start,
            point2: inputs.end,
            point3: midPt,
            reverseNormal: true,
        });

        const dirStartEnd = this.base.vector.sub({
            first: inputs.end,
            second: inputs.start,
        }) as Inputs.Base.Vector3;

        let currentShape = this.transformsService.rotate({
            shape: txt.compound,
            angle: -90 + (inputs.labelRotation || 0),
            axis: [0, 1, 0],
        });

        shapesToDelete.push(...txt.shapes.map((s) => s.shape));
        let previousShape = currentShape;

        // Apply horizontal flip if requested
        if (inputs.labelFlipHorizontal) {
            currentShape = this.transformsService.scale3d({
                shape: currentShape,
                scale: [-1, 1, 1],
                center: [0, 0, 0]
            });
            shapesToDelete.push(previousShape);
            previousShape = currentShape;
        }

        // Apply vertical flip if requested
        if (inputs.labelFlipVertical) {
            currentShape = this.transformsService.scale3d({
                shape: currentShape,
                scale: [1, 1, -1],
                center: [0, 0, 0]
            });
            shapesToDelete.push(previousShape);
            previousShape = currentShape;
        }

        const alignedLabelTxtToDir = this.transformsService.alignNormAndAxis({
            shape: currentShape,
            fromOrigin: [0, 0, 0],
            fromNorm: [0, 1, 0],
            fromAx: [0, 0, 1],
            toOrigin: [0, 0, 0],
            toNorm: normalThreePoints,
            toAx: dirStartEnd,
        });

        shapesToDelete.push(previousShape);

        const normDir = this.base.vector.normalized({ vector: inputs.direction });
        const offsetLabelVec = this.base.vector.mul({ vector: normDir, scalar: inputs.labelOffset });

        const addToDir = this.base.vector.add({
            first: midPt,
            second: offsetLabelVec,
        }) as Inputs.Base.Vector3;

        const labelTransformed = this.transformsService.translate({
            shape: alignedLabelTxtToDir,
            translation: addToDir
        });

        shapesToDelete.push(alignedLabelTxtToDir);

        const shapesToInclude: TopoDS_Shape[] = [translatedLine, startLineToTranslatedPoint, endLineToTranslatedPoint, labelTransformed];

        // Add arrows if enabled
        if (inputs.endType === Inputs.OCCT.dimensionEndTypeEnum.arrow) {
            // Arrow at start point - points outward by default
            const startArrow = this.createArrow({
                tipPoint: translatedStartPt,
                direction: dirStartEnd,
                normal: normalThreePoints,
                size: inputs.arrowSize,
                angle: inputs.arrowAngle,
                flipped: !inputs.arrowsFlipped
            });
            shapesToInclude.push(startArrow);

            // Arrow at end point (direction is reversed) - points outward by default
            const endArrowDir = this.base.vector.mul({ vector: dirStartEnd, scalar: -1 }) as Inputs.Base.Vector3;
            const endArrow = this.createArrow({
                tipPoint: translatedEndPt,
                direction: endArrowDir,
                normal: normalThreePoints,
                size: inputs.arrowSize,
                angle: inputs.arrowAngle,
                flipped: !inputs.arrowsFlipped
            });
            shapesToInclude.push(endArrow);
        }

        const res = this.converterService.makeCompound({ shapes: shapesToInclude });

        // delete shapes
        shapesToDelete.forEach((shape) => {
            shape.delete();
        });

        return res;
    }

    simpleAngularDimension(inputs: Inputs.OCCT.SimpleAngularDimensionDto): TopoDS_Compound {
        const shapesToDelete: TopoDS_Shape[] = [];

        const normDir1 = this.base.vector.normalized({ vector: inputs.direction1 });
        const endVec = this.base.vector.mul({ vector: normDir1, scalar: inputs.radius }) as Inputs.Base.Point3;
        const endPt = this.base.point.translatePoints({
            points: [endVec],
            translation: inputs.center,
        })[0];

        const line1WithExt = this.wiresService.createLineWireWithExtensions({
            start: inputs.center,
            end: endPt,
            extensionStart: -inputs.offsetFromCenter,
            extensionEnd: inputs.extraSize,
        });

        const normDir2 = this.base.vector.normalized({ vector: inputs.direction2 });
        const endVec2 = this.base.vector.mul({ vector: normDir2, scalar: inputs.radius }) as Inputs.Base.Point3;
        const endPt2 = this.base.point.translatePoints({
            points: [endVec2],
            translation: inputs.center,
        })[0];
        const line2WithExt = this.wiresService.createLineWireWithExtensions({
            start: inputs.center,
            end: endPt2,
            extensionStart: -inputs.offsetFromCenter,
            extensionEnd: inputs.extraSize,
        });

        const normalThreePoints = this.base.point.normalFromThreePoints({
            point1: inputs.center,
            point2: endPt,
            point3: endPt2,
            reverseNormal: true,
        });

        const normalThreePointsRev = this.base.point.normalFromThreePoints({
            point1: inputs.center,
            point2: endPt,
            point3: endPt2,
            reverseNormal: false,
        });

        const circ = this.entitiesService.createCircle(inputs.radius, inputs.center, normalThreePointsRev, Inputs.OCCT.typeSpecificityEnum.edge) as TopoDS_Edge;
        shapesToDelete.push(circ);
        const arc = this.edgesService.arcFromCircleAndTwoPoints({
            circle: circ,
            start: endPt,
            end: endPt2,
            sense: false,
        });
        shapesToDelete.push(arc);
        const wireArc = this.wiresService.createWireFromEdge({ shape: arc });

        const midPt = this.wiresService.midPointOnWire({ shape: wireArc });
        let angle = this.base.vector.angleBetween({
            first: inputs.direction1,
            second: inputs.direction2,
        }) as number;

        if (inputs.radians) {
            angle = this.base.math.degToRad({ number: angle });
        }

        const labelText = this.formatDimensionLabel(
            angle,
            inputs.labelOverwrite,
            inputs.decimalPlaces,
            inputs.labelSuffix,
            inputs.removeTrailingZeros
        );

        const txtOpt = new Inputs.OCCT.TextWiresDto();
        txtOpt.text = labelText;
        txtOpt.xOffset = 0;
        txtOpt.yOffset = 0;
        txtOpt.height = inputs.labelSize;
        txtOpt.centerOnOrigin = true;
        const txt = this.wiresService.textWiresWithData(txtOpt);

        const vectorToMid = this.base.vector.sub({
            first: midPt,
            second: inputs.center,
        }) as Inputs.Base.Vector3;
        const normVecToMid = this.base.vector.normalized({ vector: vectorToMid }) as Inputs.Base.Vector3;

        let currentShape = this.transformsService.rotate({
            shape: txt.compound,
            angle: inputs.labelRotation || 0,
            axis: [0, 1, 0],
        });

        shapesToDelete.push(...txt.shapes.map((s) => s.shape));
        let previousShape = currentShape;

        // Apply horizontal flip if requested
        if (inputs.labelFlipHorizontal) {
            currentShape = this.transformsService.scale3d({
                shape: currentShape,
                scale: [-1, 1, 1],
                center: [0, 0, 0]
            });
            shapesToDelete.push(previousShape);
            previousShape = currentShape;
        }

        // Apply vertical flip if requested
        if (inputs.labelFlipVertical) {
            currentShape = this.transformsService.scale3d({
                shape: currentShape,
                scale: [1, 1, -1],
                center: [0, 0, 0]
            });
            shapesToDelete.push(previousShape);
            previousShape = currentShape;
        }

        const alignedLabelTxtToDir = this.transformsService.alignNormAndAxis({
            shape: currentShape,
            fromOrigin: [0, 0, 0],
            fromNorm: [0, 1, 0],
            fromAx: [0, 0, 1],
            toOrigin: [0, 0, 0],
            toNorm: normalThreePoints,
            toAx: normVecToMid,
        });
        shapesToDelete.push(previousShape);
        const offsetLabelVec = this.base.vector.mul({ vector: normVecToMid, scalar: inputs.labelOffset });
        const addToDir = this.base.vector.add({
            first: midPt,
            second: offsetLabelVec,
        }) as Inputs.Base.Vector3;
        const labelTransformed = this.transformsService.translate({
            shape: alignedLabelTxtToDir,
            translation: addToDir
        });
        shapesToDelete.push(alignedLabelTxtToDir);

        const shapesToInclude: TopoDS_Shape[] = [line1WithExt, line2WithExt, wireArc, labelTransformed];

        // Add arrows if enabled
        if (inputs.endType === Inputs.OCCT.dimensionEndTypeEnum.arrow) {
            // Get points on the arc at the start and end for arrow placement
            const arcStartPoint = this.edgesService.pointOnEdgeAtParam({
                shape: arc,
                param: 0
            });
            const arcEndPoint = this.edgesService.pointOnEdgeAtParam({
                shape: arc,
                param: 1
            });

            // Get tangent directions at arc endpoints for arrow placement
            const arcStartTangent = this.edgesService.tangentOnEdgeAtParam({
                shape: arc,
                param: 0
            });
            const arcEndTangent = this.edgesService.tangentOnEdgeAtParam({
                shape: arc,
                param: 1
            });

            // Arrow at first direction point (start of arc) - points outward by default
            const startArrow = this.createArrow({
                tipPoint: arcStartPoint,
                direction: arcStartTangent,
                normal: normalThreePoints,
                size: inputs.arrowSize,
                angle: inputs.arrowAngle,
                flipped: !inputs.arrowsFlipped
            });
            shapesToInclude.push(startArrow);

            // Reverse the end tangent so both arrows point outward along the arc by default
            const reversedEndTangent = this.base.vector.mul({ 
                vector: arcEndTangent, 
                scalar: -1 
            }) as Inputs.Base.Vector3;

            // Arrow at second direction point (end of arc) - points outward by default
            const endArrow = this.createArrow({
                tipPoint: arcEndPoint,
                direction: reversedEndTangent,
                normal: normalThreePoints,
                size: inputs.arrowSize,
                angle: inputs.arrowAngle,
                flipped: !inputs.arrowsFlipped
            });
            shapesToInclude.push(endArrow);
        }

        const res = this.converterService.makeCompound({ shapes: shapesToInclude });

        // delete shapes
        shapesToDelete.forEach((shape) => {
            shape.delete();
        });

        return res;
    }

    pinWithLabel(inputs: Inputs.OCCT.PinWithLabelDto): TopoDS_Compound {
        const pinLine = this.wiresService.createLineWireWithExtensions({
            start: inputs.startPoint,
            end: inputs.endPoint,
            extensionStart: -inputs.offsetFromStart,
            extensionEnd: 0,
        });

        const txtOpt = new Inputs.OCCT.TextWiresDto();
        txtOpt.text = inputs.label;
        txtOpt.xOffset = 0;
        txtOpt.yOffset = 0;
        txtOpt.height = inputs.labelSize;
        txtOpt.centerOnOrigin = true;

        const text = this.wiresService.textWiresWithData(txtOpt);

        const textWidth = text.data.width;
        const dirNorm = this.base.vector.normalized({ vector: inputs.direction });
        const offsetLabelVec = this.base.vector.mul({ vector: dirNorm, scalar: textWidth / 2 + inputs.labelOffset });
        // const translateTxtVec = this.vector.add({ first: inputs.direction, second: offsetLabelVec }) as Inputs.Base.Vector3;

        const endPtLabelLine = this.base.point.translatePoints({
            points: [inputs.endPoint],
            translation: inputs.direction,
        })[0];

        const lineBeneathLabel = this.wiresService.createLineWireWithExtensions({
            start: inputs.endPoint,
            end: endPtLabelLine,
            extensionStart: 0,
            extensionEnd: 0,
        });

        const normalThreePoints = this.base.point.normalFromThreePoints({
            point1: inputs.startPoint,
            point2: inputs.endPoint,
            point3: endPtLabelLine,
            reverseNormal: false,
        });
        let currentShape = this.transformsService.rotate({
            shape: text.compound,
            angle: -90 + (inputs.labelRotation || 0),
            axis: [0, 1, 0],
        });

        const shapesToDelete = text.shapes.map((s) => s.shape);
        let previousShape = currentShape;

        // Apply horizontal flip if requested
        if (inputs.labelFlipHorizontal) {
            currentShape = this.transformsService.scale3d({
                shape: currentShape,
                scale: [-1, 1, 1],
                center: [0, 0, 0]
            });
            shapesToDelete.push(previousShape);
            previousShape = currentShape;
        }

        // Apply vertical flip if requested
        if (inputs.labelFlipVertical) {
            currentShape = this.transformsService.scale3d({
                shape: currentShape,
                scale: [1, 1, -1],
                center: [0, 0, 0]
            });
            shapesToDelete.push(previousShape);
            previousShape = currentShape;
        }

        const alignedLabelTxtToDir = this.transformsService.alignNormAndAxis({
            shape: currentShape,
            fromOrigin: [0, 0, 0],
            fromNorm: [0, 1, 0],
            fromAx: [0, 0, 1],
            toOrigin: [0, 0, 0],
            toNorm: normalThreePoints,
            toAx: dirNorm as Inputs.Base.Vector3,
        });
        
        shapesToDelete.push(previousShape);

        const addToDir = this.base.vector.add({
            first: endPtLabelLine,
            second: offsetLabelVec,
        }) as Inputs.Base.Vector3;

        const labelTransformed = this.transformsService.translate({
            shape: alignedLabelTxtToDir,
            translation: addToDir,
        });
        shapesToDelete.push(alignedLabelTxtToDir);

        const shapesToInclude: TopoDS_Shape[] = [pinLine, labelTransformed, lineBeneathLabel];

        // Add arrow if enabled
        if (inputs.endType === Inputs.OCCT.dimensionEndTypeEnum.arrow) {
            // Calculate the direction from start to end for the pin
            const pinDirection = this.base.vector.sub({
                first: inputs.endPoint,
                second: inputs.startPoint,
            }) as Inputs.Base.Vector3;

            // Arrow at the start point (default orientation is flipped, then apply user flip)
            const arrow = this.createArrow({
                tipPoint: inputs.startPoint,
                direction: pinDirection,
                normal: normalThreePoints,
                size: inputs.arrowSize,
                angle: inputs.arrowAngle,
                flipped: !inputs.arrowsFlipped
            });
            shapesToInclude.push(arrow);
        }

        const res = this.converterService.makeCompound({ shapes: shapesToInclude });

        // delete shapes
        shapesToDelete.forEach((shape) => {
            shape.delete();
        });
        return res;
    }

}
