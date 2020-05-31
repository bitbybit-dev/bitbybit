import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceByLoftingCurvesBlock() {

    Blocks['verb_geometry_nurbs_surface_by_lofting_curves'] = {
        init: function () {
            this.appendValueInput("Curves")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Surface by lofting curves");            
            this.appendValueInput("DegreeV")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("and degree");
            this.setOutput(true, "NurbsSurface");
            this.setColour("#fff");
            this.setTooltip("Makes Nurbs surface by lofting a list of curves.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_by_lofting_curves'] = function (block) {
        var value_curves = JavaScript.valueToCode(block, 'Curves', JavaScript.ORDER_ATOMIC);
        var value_degree_v = JavaScript.valueToCode(block, 'DegreeV', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.geom.NurbsSurface.byLoftingCurves(${value_curves}, ${value_degree_v}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}