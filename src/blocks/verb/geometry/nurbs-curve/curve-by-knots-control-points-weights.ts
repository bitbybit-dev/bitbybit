import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCurveByKnotsControlPointsWeightsBlock() {

    Blocks['verb_geometry_nurbs_curve_by_knots_control_points_weights'] = {
        init: function () {
            this.appendValueInput("Knots")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Curve by knots");
            this.appendValueInput("Points")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("control points");
            this.appendValueInput("Weights")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("weights");
            this.appendValueInput("Degree")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("degree");
            this.setOutput(true, "NurbsCurve");
            this.setColour("#fff");
            this.setTooltip("Makes curve by knots, control points and weights.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_curve_by_knots_control_points_weights'] = function (block) {
        let value_knots = JavaScript.valueToCode(block, 'Knots', JavaScript.ORDER_ATOMIC);
        let value_points = JavaScript.valueToCode(block, 'Points', JavaScript.ORDER_ATOMIC);
        let value_weights = JavaScript.valueToCode(block, 'Weights', JavaScript.ORDER_ATOMIC);
        let value_degree = JavaScript.valueToCode(block, 'Degree', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.geom.NurbsCurve.byKnotsControlPointsWeights(${value_degree}, ${value_knots}, ${value_points}, ${value_weights} ))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}