import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceDomainVBlock() {

    Blocks['verb_geometry_nurbs_surface_domain_v'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("V domain of the surface");
            this.setOutput(true, "Interval");
            this.setColour("#fff");
            this.setTooltip("Get the v domain of the surface.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_domain_v'] = function (block) {
        var value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_surface}.domainV())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}