import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceByKnotsControlPointsWeightsBlock() {

    Blocks['verb_geometry_nurbs_surface_by_knots_control_points_weights'] = {
        init: function () {
            this.appendValueInput("KnotsU")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Surface by knots u");            
            this.appendValueInput("KnotsV")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("knots v");
            this.appendValueInput("Points")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("control points");
            this.appendValueInput("Weights")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("weights");
            this.appendValueInput("DegreeU")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("degree u");
            this.appendValueInput("DegreeV")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("degree v");
            this.setOutput(true, "NurbsSurface");
            this.setColour("#fff");
            this.setTooltip("Makes Nurbs surface by uv knots, degrees, control points and weights.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_by_knots_control_points_weights'] = function (block) {
        let value_knots_u = JavaScript.valueToCode(block, 'KnotsU', JavaScript.ORDER_ATOMIC);
        let value_knots_v = JavaScript.valueToCode(block, 'KnotsV', JavaScript.ORDER_ATOMIC);
        let value_points = JavaScript.valueToCode(block, 'Points', JavaScript.ORDER_ATOMIC);
        let value_weights = JavaScript.valueToCode(block, 'Weights', JavaScript.ORDER_ATOMIC);
        let value_degree_u = JavaScript.valueToCode(block, 'DegreeU', JavaScript.ORDER_ATOMIC);
        let value_degree_v = JavaScript.valueToCode(block, 'DegreeV', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.geom.NurbsSurface.byKnotsControlPointsWeights(${value_degree_u}, ${value_degree_v}, ${value_knots_u}, ${value_knots_v}, ${value_points}, ${value_weights} ))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}