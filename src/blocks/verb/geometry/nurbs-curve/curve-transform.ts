import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveTransformBlock() {

    Blocks['verb_geometry_nurbs_curve_transform'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Transform the curve");
            this.appendValueInput("Matrix")
                .setAlign(ALIGN_RIGHT)
                .appendField("with matrix");
            this.setOutput(true, "NurbsCurve");
            this.setColour("#fff");
            this.setTooltip("Transforms the curve by transformation matrix (translation, rotation, scale...).");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_transform'] = function (block) {
        let value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        let value_matrix = JavaScript.valueToCode(block, 'Matrix', JavaScript.ORDER_ATOMIC);

        let code = `
(() => {
    const points = ${value_curve}.controlPoints();
    const transformation = ${value_matrix};
    let transformedControlPoints = points;
    if(transformation.length && transformation.length > 0){
        transformation.forEach(transform => {
            transformedControlPoints = BitByBitBlocklyHelperService.transformPointsByMatrix(transformedControlPoints, transform);
        });
    }else {
        transformedControlPoints = BitByBitBlocklyHelperService.transformPointsByMatrix(points, transformation);
    }
    const curve = verb.geom.NurbsCurve.byKnotsControlPointsWeights( ${value_curve}.degree(), ${value_curve}.knots(), transformedControlPoints, ${value_curve}.weights());
    console.log(curve);
    return curve;
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}