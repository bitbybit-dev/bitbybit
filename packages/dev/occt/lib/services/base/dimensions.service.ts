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

        const txtOpt = new Inputs.OCCT.TextWiresDto();
        txtOpt.text = length.toFixed(inputs.decimalPlaces) + " " + inputs.labelSuffix;
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

        const rotated = this.transformsService.rotate({
            shape: txt.compound,
            angle: -90 + (inputs.labelRotation || 0),
            axis: [0, 1, 0],
        });

        shapesToDelete.push(...txt.shapes.map((s) => s.shape));

        const alignedLabelTxtToDir = this.transformsService.alignNormAndAxis({
            shape: rotated,
            fromOrigin: [0, 0, 0],
            fromNorm: [0, 1, 0],
            fromAx: [0, 0, 1],
            toOrigin: [0, 0, 0],
            toNorm: normalThreePoints,
            toAx: dirStartEnd,
        });

        shapesToDelete.push(rotated);

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

        const res = this.converterService.makeCompound({ shapes: [translatedLine, startLineToTranslatedPoint, endLineToTranslatedPoint, labelTransformed] });

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

        const txtOpt = new Inputs.OCCT.TextWiresDto();
        txtOpt.text = angle.toFixed(inputs.decimalPlaces) + " " + inputs.labelSuffix;
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

        const alignedLabelTxtToDir = this.transformsService.alignNormAndAxis({
            shape: txt.compound,
            fromOrigin: [0, 0, 0],
            fromNorm: [0, 1, 0],
            fromAx: [0, 0, 1],
            toOrigin: [0, 0, 0],
            toNorm: normalThreePoints,
            toAx: normVecToMid,
        });
        shapesToDelete.push(...txt.shapes.map((s) => s.shape));
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

        const res = this.converterService.makeCompound({ shapes: [line1WithExt, line2WithExt, wireArc, labelTransformed] });

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
        const rotated = this.transformsService.rotate({
            shape: text.compound,
            angle: -90,
            axis: [0, 1, 0],
        });

        const shapesToDelete = text.shapes.map((s) => s.shape);

        const alignedLabelTxtToDir = this.transformsService.alignNormAndAxis({
            shape: rotated,
            fromOrigin: [0, 0, 0],
            fromNorm: [0, 1, 0],
            fromAx: [0, 0, 1],
            toOrigin: [0, 0, 0],
            toNorm: normalThreePoints,
            toAx: dirNorm as Inputs.Base.Vector3,
        });

        shapesToDelete.push(rotated);

        const addToDir = this.base.vector.add({
            first: endPtLabelLine,
            second: offsetLabelVec,
        }) as Inputs.Base.Vector3;

        const labelTransformed = this.transformsService.translate({
            shape: alignedLabelTxtToDir,
            translation: addToDir,
        });
        shapesToDelete.push(alignedLabelTxtToDir);

        const res = this.converterService.makeCompound({ shapes: [pinLine, labelTransformed, lineBeneathLabel] });

        // delete shapes
        shapesToDelete.forEach((shape) => {
            shape.delete();
        });
        return res;
    }

}
