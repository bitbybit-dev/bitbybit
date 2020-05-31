import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPolylineLengthBlock() {

    Blocks['base_geometry_polyline_length'] = {
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

    JavaScript['base_geometry_polyline_length'] = function (block) {
        var value_polyline = JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var distanceOfPolyline = 0;
    for (var i = 1; i < ${value_polyline}.points.length; i++) {
        var previousPoint = ${value_polyline}.points[i - 1];
        var currentPoint = ${value_polyline}.points[i];
        distanceOfPolyline += verb.core.Vec.dist(previousPoint, currentPoint);
    };
    return distanceOfPolyline;
})()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}