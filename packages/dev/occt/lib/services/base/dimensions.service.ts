import {
    TopoDS_Compound,
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { TransformsService } from "./transforms.service";
import { ConverterService } from "./converter.service";
import { WiresService } from "./wires.service";
import { Point, Vector } from "@bitbybit-dev/base";

export class DimensionsService {

    constructor(
        private readonly vector: Vector,
        private readonly point: Point,
        private readonly transformsService: TransformsService,
        private readonly converterService: ConverterService,
        private readonly wiresService: WiresService
    ) { }

    simpleLinearLengthDimension(inputs: Inputs.OCCT.SimpleLinearLengthDimensionDto): TopoDS_Compound {

        const lineBetweenPoints = this.wiresService.createLineWireWithExtensions({
            start: inputs.start,
            end: inputs.end,
            extensionStart: inputs.crossingSize,
            extensionEnd: inputs.crossingSize,
        });

        const translatedLine = this.transformsService.translate({
            shape: lineBetweenPoints,
            translation: inputs.direction,
        });

        const translatedPts = this.point.translatePoints({
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
        const length = this.point.distance({
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
        const normalThreePoints = this.point.normalFromThreePoints({
            point1: inputs.start,
            point2: inputs.end,
            point3: midPt,
            reverseNormal: true,
        });

        const dirStartEnd = this.vector.sub({
            first: inputs.end,
            second: inputs.start,
        }) as Inputs.Base.Vector3;

        const rotated = this.transformsService.rotate({
            shape: txt.compound,
            angle: -90,
            axis: [0, 1, 0],
        });

        const alignedLabelTxtToDir = this.transformsService.alignNormAndAxis({
            shape: rotated,
            fromOrigin: [0, 0, 0],
            fromNorm: [0, 1, 0],
            fromAx: [0, 0, 1],
            toOrigin: [0, 0, 0],
            toNorm: normalThreePoints,
            toAx: dirStartEnd,
        });

        const normDir = this.vector.normalized({ vector: inputs.direction });
        const offsetLabelVec = this.vector.mul({ vector: normDir, scalar: inputs.labelOffset });

        const addToDir = this.vector.add({
            first: midPt,
            second: offsetLabelVec,
        }) as Inputs.Base.Vector3;

        const labelTransformed = this.transformsService.translate({
            shape: alignedLabelTxtToDir,
            translation: addToDir
        });

        const res = this.converterService.makeCompound({ shapes: [translatedLine, startLineToTranslatedPoint, endLineToTranslatedPoint, labelTransformed] });

        return res;
    }

}
