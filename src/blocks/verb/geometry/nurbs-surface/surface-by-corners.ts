import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceByCornersBlock() {

    Blocks['verb_geometry_nurbs_surface_by_corners'] = {
        init: function () {
            this.appendValueInput("Point1")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Surface first corner");            
            this.appendValueInput("Point2")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("second corner");
            this.appendValueInput("Point3")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("third corner");
            this.appendValueInput("Point4")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("fourth corner");
            this.setOutput(true, "NurbsSurface");
            this.setColour("#fff");
            this.setTooltip("Makes Nurbs surface by corners.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_by_corners'] = function (block) {
        let value_point_1 = JavaScript.valueToCode(block, 'Point1', JavaScript.ORDER_ATOMIC);
        let value_point_2 = JavaScript.valueToCode(block, 'Point2', JavaScript.ORDER_ATOMIC);
        let value_point_3 = JavaScript.valueToCode(block, 'Point3', JavaScript.ORDER_ATOMIC);
        let value_point_4 = JavaScript.valueToCode(block, 'Point4', JavaScript.ORDER_ATOMIC);

        let code = `(() => verb.geom.NurbsSurface.byCorners(${value_point_1}, ${value_point_2}, ${value_point_3}, ${value_point_4}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}