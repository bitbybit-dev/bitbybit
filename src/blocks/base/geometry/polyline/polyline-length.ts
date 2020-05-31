import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPolylineLengthBlock() {

    Blocks['functions_polyline_length'] = {
        init: function () {
            this.appendValueInput("Polyline")
                .setCheck("Polyline")
                .setAlign(ALIGN_RIGHT)
                .appendField("Length of the polyline");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Calculates the polyline length.");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_polyline_length'] = function (block) {
        var value_polyline = JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var polyline = ${value_polyline};
    var distance = 0;
    for (var i = 1; i < polyline.points.length; i++) {
        var previousPoint = polyline.points[i - 1];
        var currentPoint = polyline.points[i];
        distance += verb.core.Vec.dist(previousPoint, currentPoint);
    };
    return distance;
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}