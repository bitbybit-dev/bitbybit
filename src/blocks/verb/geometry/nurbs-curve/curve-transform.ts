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
                .setCheck("Matrix")
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
    const transformedControlPoints = points.map(pt => {
        const vector = new BABYLON.Vector3(pt[0], pt[1], pt[2]);
        const transformedVector = BABYLON.Vector3.TransformCoordinates(vector, ${value_matrix});
        return [transformedVector.x, transformedVector.y, transformedVector.z];
    });

    const curve = verb.geom.NurbsCurve.byKnotsControlPointsWeights( ${value_curve}.degree(), ${value_curve}.knots(), transformedControlPoints, ${value_curve}.weights());
    console.log(curve);
    return curve;
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}