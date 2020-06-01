import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceDomainUBlock() {

    Blocks['verb_geometry_nurbs_surface_domain_u'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("U domain of the surface");
            this.setOutput(true, "Interval");
            this.setColour("#fff");
            this.setTooltip("Get the u domain of the surface.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_domain_u'] = function (block) {
        var value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_surface}.domainU())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}