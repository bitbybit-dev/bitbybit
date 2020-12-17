import { ALIGN_RIGHT, Block, Blocks, FieldVariable, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import {
    getRequired,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../../validations';

export function createDrawTextTagBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_draw_text_tag';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('TextTag')
                .setCheck('TextTag')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_draw_text_tag_input_text_tag)
                .appendField(new FieldVariable(resources.block_base_geometry_draw_text_tag_input_text_tag_variable), 'DrawnTextTag');
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_geometry_draw_text_tag_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            textTag: (JavaScript as any).valueToCode(block, 'TextTag', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_text_tag, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            inputs.tagVariable = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnTextTag'), VARIABLE_CATEGORY_NAME)};

            if(inputs.tagVariable && inputs.updatable) {
                const tagToUpdate = BitByBit.BitByBitBlocklyHelperService.tagBag.find(tag => tag.id === inputs.tagVariable.id);
                Object.keys(inputs.textTag).forEach(key => {
                    tagToUpdate[key] = inputs.textTag[key];
                });
                tagToUpdate.needsUpdate = true;
            } else {
                const textNode = document.createElement('span');
                const id = '_tag' + ${new Date().getTime()} + BitByBit.BitByBitBlocklyHelperService.tagBag.length;
                inputs.textTag.id = id;
                textNode.id = id;
                textNode.textContent = inputs.textTag.text;
                document.querySelector('.canvasZone').appendChild(textNode);
                inputs.textTag.needsUpdate = true;
                BitByBit.BitByBitBlocklyHelperService.tagBag.push(inputs.textTag);
                ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnTextTag'), VARIABLE_CATEGORY_NAME)} = inputs.textTag;
            }
`);
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_text_tag),
        ]
    }];
}


// var gridMesh, curveForGCode, curvePoints, gCodeText, gCodeTags, curvePoint, xLine, tags, lineText, pointsMesh, curveMesh;



// (() => {
//     /* Component: "babylon_scene_background_colour" */
//     /* Assigning Inputs */
//     const inputs = {};
//     inputs['colour'] = '#000000';
//     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'OXbWcW.q8]VB0SOQ1O;$', inputs)


//     scene.clearColor = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);


//     /* End Component: "babylon_scene_background_colour" */
// })();

// (() => {
//     /* Component: "babylon_draw_grid" */
//     /* Assigning Inputs */
//     const inputs = {};
//     inputs['width'] = 400;
//     inputs['height'] = 400;
//     inputs['subdivisions'] = 10;
//     inputs['majorUnitFrequency'] = 10;
//     inputs['minorUnitVisibility'] = 0.45;
//     inputs['gridRatio'] = 0.5;
//     inputs['opacity'] = 0.5;
//     inputs['backFaceCulling'] = false;
//     inputs['mainColor'] = '#ffffff';
//     inputs['secondaryColor'] = '#c0c0c0';
//     inputs['gridVariable'] = gridMesh;
//     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, '/W/#[TX.f(q7h0]!{P6p', inputs)


//     const groundMaterial = new BitByBit.BABYLON.GridMaterial('groundMaterial0.2940005753135404', BitByBit.scene);
//     groundMaterial.majorUnitFrequency = inputs.majorUnitFrequency;
//     groundMaterial.minorUnitVisibility = inputs.minorUnitVisibility;
//     groundMaterial.gridRatio = inputs.gridRatio;
//     groundMaterial.backFaceCulling = inputs.backFaceCulling;
//     groundMaterial.mainColor = BitByBit.BABYLON.Color3.FromHexString(inputs.mainColor);
//     groundMaterial.lineColor = BitByBit.BABYLON.Color3.FromHexString(inputs.secondaryColor);
//     groundMaterial.opacity = inputs.opacity;

//     const ground = BitByBit.BABYLON.Mesh.CreateGround('ground0.9958908545734881', inputs.width, inputs.height, inputs.subdivisions, BitByBit.scene, false);
//     ground.material = groundMaterial;
//     gridMesh = ground;


//     /* End Component: "babylon_draw_grid" */
// })();
// curveForGCode =
//     (() => {
//         /* Component: "verb_geometry_nurbs_curve_by_points" */
//         /* Assigning Inputs */
//         const inputs = {};
//         inputs['points'] = [
//             (() => {
//                 /* Component: "base_geometry_point" */
//                 /* Assigning Inputs */
//                 const inputs = {};
//                 inputs['x'] = 0;
//                 inputs['y'] = 0;
//                 inputs['z'] = 0;
//                 BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'wvW+[SwyxoQE4SlrEGh1', inputs)

//                 return [inputs.x, inputs.y, inputs.z];

//                 /* End Component: "base_geometry_point" */
//             })()
//             ,
//             (() => {
//                 /* Component: "base_geometry_point" */
//                 /* Assigning Inputs */
//                 const inputs = {};
//                 inputs['x'] = 0;
//                 inputs['y'] = 0.3;
//                 inputs['z'] = 2;
//                 BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'AW~%c-,jVk*rM4RooZed', inputs)

//                 return [inputs.x, inputs.y, inputs.z];

//                 /* End Component: "base_geometry_point" */
//             })()
//             ,
//             (() => {
//                 /* Component: "base_geometry_point" */
//                 /* Assigning Inputs */
//                 const inputs = {};
//                 inputs['x'] = 1;
//                 inputs['y'] = 0;
//                 inputs['z'] = 0;
//                 BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'is.*$(=V2qszKrHiPU^X', inputs)

//                 return [inputs.x, inputs.y, inputs.z];

//                 /* End Component: "base_geometry_point" */
//             })()
//             ,
//             (() => {
//                 /* Component: "base_geometry_point" */
//                 /* Assigning Inputs */
//                 const inputs = {};
//                 inputs['x'] = 3;
//                 inputs['y'] = 0;
//                 inputs['z'] = (-1);
//                 BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'An$ED6rPzTDbcRMdenbL', inputs)

//                 return [inputs.x, inputs.y, inputs.z];

//                 /* End Component: "base_geometry_point" */
//             })()
//             ,
//             (() => {
//                 /* Component: "base_geometry_point" */
//                 /* Assigning Inputs */
//                 const inputs = {};
//                 inputs['x'] = (-1);
//                 inputs['y'] = 0.3;
//                 inputs['z'] = 1;
//                 BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'jNO+RB#(KE2QunUC_:DH', inputs)

//                 return [inputs.x, inputs.y, inputs.z];

//                 /* End Component: "base_geometry_point" */
//             })()
//         ];
//         inputs['degree'] = 3;
//         BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, '}cED{E|$(`}lB+i-`8g_', inputs)

//         return BitByBit.verb.geom.NurbsCurve.byPoints(inputs.points, inputs.degree);

//         /* End Component: "verb_geometry_nurbs_curve_by_points" */
//     })()
//     ;
// curvePoints =
//     (() => {
//         /* Component: "verb_geometry_nurbs_curve_tessellate" */
//         /* Assigning Inputs */
//         const inputs = {};
//         inputs['curve'] = curveForGCode;
//         inputs['tolerance'] = 0.000001;
//         BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, '9HG5xqsuAWb5]B?U6Ffm', inputs)

//         return inputs.curve.tessellate(inputs.tolerance);

//         /* End Component: "verb_geometry_nurbs_curve_tessellate" */
//     })()
//     ;
// gCodeText = [];
// gCodeTags = [];
// gCodeText.push('// Generated with bitbybit.dev');
// for (var curvePoint_index in curvePoints) {
//     curvePoint = curvePoints[curvePoint_index];
//     xLine = 'G1 X';
//     if (curvePoint != curvePoints[0]) {
//         xLine = 'X';
//     }
//     lineText = [xLine,
//         (() => {
//             /* Component: "base_math_round_to_decimals" */
//             /* Assigning Inputs */
//             const inputs = {};
//             inputs['numberToRound'] =
//                 (() => {
//                     /* Component: "base_geometry_point_x" */
//                     /* Assigning Inputs */
//                     const inputs = {};
//                     inputs['point'] = curvePoint;
//                     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'x#CMQOg_{yUR0)l[(%og', inputs)

//                     return inputs.point[0];

//                     /* End Component: "base_geometry_point_x" */
//                 })()
//                 ;
//             inputs['decimalPlaces'] = 3;
//             BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'q%]BA/Fim/#bo7TXtHd:', inputs)


//             return inputs.numberToRound.toFixed(inputs.decimalPlaces);


//             /* End Component: "base_math_round_to_decimals" */
//         })()
//         , ' Y',
//         (() => {
//             /* Component: "base_math_round_to_decimals" */
//             /* Assigning Inputs */
//             const inputs = {};
//             inputs['numberToRound'] =
//                 (() => {
//                     /* Component: "base_geometry_point_z" */
//                     /* Assigning Inputs */
//                     const inputs = {};
//                     inputs['point'] = curvePoint;
//                     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, ':rr3^rQQjw_jSWXQL}J$', inputs)

//                     return inputs.point[2];

//                     /* End Component: "base_geometry_point_z" */
//                 })()
//                 ;
//             inputs['decimalPlaces'] = 3;
//             BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'Ah[BtAMP.hv^nt0M3))(', inputs)


//             return inputs.numberToRound.toFixed(inputs.decimalPlaces);


//             /* End Component: "base_math_round_to_decimals" */
//         })()
//         , ' Z',
//         (() => {
//             /* Component: "base_math_round_to_decimals" */
//             /* Assigning Inputs */
//             const inputs = {};
//             inputs['numberToRound'] =
//                 (() => {
//                     /* Component: "base_geometry_point_y" */
//                     /* Assigning Inputs */
//                     const inputs = {};
//                     inputs['point'] = curvePoint;
//                     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'e/Z,/L5@MP}]P@:t#cPg', inputs)

//                     return inputs.point[1];

//                     /* End Component: "base_geometry_point_y" */
//                 })()
//                 ;
//             inputs['decimalPlaces'] = 3;
//             BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, '@sDOkkIX.}4#B;nkB0!|', inputs)


//             return inputs.numberToRound.toFixed(inputs.decimalPlaces);


//             /* End Component: "base_math_round_to_decimals" */
//         })()
//     ].join('');
//     gCodeTags.push(
//         (() => {
//             /* Component: "base_geometry_text_tag" */
//             /* Assigning Inputs */
//             const inputs = {};
//             inputs['text'] = lineText;
//             inputs['position'] =
//                 (() => {
//                     /* Component: "base_geometry_point" */
//                     /* Assigning Inputs */
//                     const inputs = {};
//                     inputs['x'] =
//                         (() => {
//                             /* Component: "base_geometry_point_x" */
//                             /* Assigning Inputs */
//                             const inputs = {};
//                             inputs['point'] = curvePoint;
//                             BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'n2B4zw`fimAL-k=LMc;S', inputs)

//                             return inputs.point[0];

//                             /* End Component: "base_geometry_point_x" */
//                         })()
//                         ;
//                     inputs['y'] = (
//                         (() => {
//                             /* Component: "base_geometry_point_y" */
//                             /* Assigning Inputs */
//                             const inputs = {};
//                             inputs['point'] = curvePoint;
//                             BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'ykVe[SR9#K[5]]E^p#36', inputs)

//                             return inputs.point[1];

//                             /* End Component: "base_geometry_point_y" */
//                         })()
//                         + 0.1);
//                     inputs['z'] = (
//                         (() => {
//                             /* Component: "base_geometry_point_z" */
//                             /* Assigning Inputs */
//                             const inputs = {};
//                             inputs['point'] = curvePoint;
//                             BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, '1h*uGFjvn+4P97si4]sJ', inputs)

//                             return inputs.point[2];

//                             /* End Component: "base_geometry_point_z" */
//                         })()
//                         - 0.1);
//                     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, '$P$,anc}b`j=8?0O6bWP', inputs)

//                     return [inputs.x, inputs.y, inputs.z];

//                     /* End Component: "base_geometry_point" */
//                 })()
//                 ;
//             inputs['colour'] = '#ff99ff';
//             inputs['size'] = 8;
//             inputs['adaptDepth'] = true;
//             BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'F}(.-D}N5*.9zl?R-6l}', inputs)


//             return {
//                 text: inputs.text,
//                 position: inputs.position,
//                 colour: inputs.colour,
//                 size: inputs.size,
//                 adaptDepth: inputs.adaptDepth,
//             };


//             /* End Component: "base_geometry_text_tag" */
//         })()
//     );
//     gCodeText.push(lineText);
// }

// (() => {
//     /* Component: "base_io_print_save" */
//     /* Assigning Inputs */
//     const inputs = {};
//     inputs['text'] = gCodeText;
//     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, '[I0]J,t%jNhNp#~x(s;@', inputs)

//     BitByBit.BitByBitBlocklyHelperService.promptPrintSave({ text: inputs.text });

//     /* End Component: "base_io_print_save" */
// })();

// (() => {
//     /* Component: "base_geometry_draw_text_tags" */
//     /* Assigning Inputs */
//     const inputs = {};
//     inputs['textTags'] = gCodeTags;
//     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, '=}bFZgtfJQ}vDO[7q+|?', inputs)


//     inputs.tagsVariable = tags;

//     if (inputs.tagsVariable && inputs.updatable) {

//         // check if list has grown, and add new empty tags to tags variable so that
//         if (inputs.tagsVariable < inputs.textTags) {
//             for (let i = inputs.tagsVariable.length - 1; i < inputs.textTags.length - 1; i++) {
//                 const tagToCreate = inputs.textTags[i];
//                 const textNode = document.createElement('span');
//                 const id = '_tag' + 1597740022360 + BitByBit.BitByBitBlocklyHelperService.tagBag.length;
//                 tagToCreate.id = id;
//                 textNode.id = id;
//                 document.querySelector('.canvasZone').appendChild(textNode);
//                 tagToCreate.needsUpdate = true;
//                 BitByBit.BitByBitBlocklyHelperService.tagBag.push(tagToCreate);
//                 inputs.tagsVariable.push(tagToCreate);
//             }
//         }

//         inputs.tagsVariable.forEach((tagFromVar, index) => {
//             const tagToUpdate = BitByBit.BitByBitBlocklyHelperService.tagBag.find(tag => tag.id === tagFromVar.id);
//             const tagToUpdateWith = inputs.textTags[index];
//             if (tagToUpdateWith) {
//                 Object.keys(tagToUpdateWith).forEach(key => {
//                     tagToUpdate[key] = tagToUpdateWith[key];
//                 });
//                 tagToUpdate.needsUpdate = true;
//             } else {
//                 // delete tag
//                 BitByBit.BitByBitBlocklyHelperService.tagBag = BitByBit.BitByBitBlocklyHelperService.tagBag.filter(tag => tag.id !== tagToUpdate.id)
//                 const element = document.getElementById(tagToUpdate.id);
//                 element.parentNode.removeChild(element);
//             }
//         });
//     } else {
//         const tags = [];
//         inputs.textTags.forEach((tag, index) => {
//             const textNode = document.createElement('span');
//             const id = '_tag' + 1597740022360 + BitByBit.BitByBitBlocklyHelperService.tagBag.length;
//             tag.id = id;
//             textNode.id = id;
//             textNode.textContent = tag.text;
//             document.querySelector('.canvasZone').appendChild(textNode);
//             tag.needsUpdate = true;
//             BitByBit.BitByBitBlocklyHelperService.tagBag.push(tag);
//             tags.push(tag);
//         });
//         tags = tags;
//     }



//     /* End Component: "base_geometry_draw_text_tags" */
// })();

// (() => {
//     /* Component: "babylon_draw_points" */
//     /* Assigning Inputs */
//     const inputs = {};
//     inputs['points'] = curvePoints;
//     inputs['colour'] = '#ff6600';
//     inputs['opacity'] = 1;
//     inputs['size'] = 10;
//     inputs['updatable'] = false;
//     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'q7w#xP02w}d#}#Mw``^@', inputs)


//     inputs.pointsMeshVariable = pointsMesh;
//     const vectorPoints = inputs.points;
//     const colour = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
//     const positions = [];
//     const colors = [];

//     const pointsCount = vectorPoints.length;
//     vectorPoints.forEach(p => {
//         positions.push(...p);
//         colors.push(colour.r, colour.g, colour.b, 1);
//     });

//     const createNewMesh = () => {

//         const vertexData = new BitByBit.BABYLON.VertexData();

//         vertexData.positions = positions;
//         vertexData.colors = colors;

//         inputs.pointsMeshVariable = new BitByBit.BABYLON.Mesh('inputs.pointsMeshVariable0.7279862239597046', BitByBit.scene);
//         vertexData.applyToMesh(inputs.pointsMeshVariable, inputs.updatable);

//         const mat = new BitByBit.BABYLON.StandardMaterial('mat0.05590442329434375', BitByBit.scene);
//         inputs.pointsMeshVariable.material = mat;

//         inputs.pointsMeshVariable.material.emissiveColor = new BitByBit.BABYLON.Color3(1, 1, 1);
//         inputs.pointsMeshVariable.material.disableLighting = true;
//         inputs.pointsMeshVariable.material.pointsCloud = true;
//         inputs.pointsMeshVariable.material.alpha = inputs.opacity;
//         inputs.pointsMeshVariable.material.pointSize = inputs.size;

//         pointsMesh = inputs.pointsMeshVariable;

//     }

//     if (inputs.pointsMeshVariable && inputs.updatable) {

//         if (inputs.pointsMeshVariable.getTotalVertices() === vectorPoints.length) {

//             inputs.pointsMeshVariable.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
//             inputs.pointsMeshVariable.updateVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
//             inputs.pointsMeshVariable.material.alpha = inputs.opacity;
//             inputs.pointsMeshVariable.material.pointSize = inputs.size;

//         } else {

//             inputs.pointsMeshVariable.dispose();
//             createNewMesh();
//         }

//     } else {
//         createNewMesh();
//     }


//     /* End Component: "babylon_draw_points" */
// })();

// (() => {
//     /* Component: "babylon_draw_curve" */
//     /* Assigning Inputs */
//     const inputs = {};
//     inputs['curve'] = curveForGCode;
//     inputs['colour'] = '#ffffff';
//     inputs['opacity'] = 1;
//     inputs['width'] = 1;
//     inputs['updatable'] = false;
//     BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, 'MaNo:J`2L`?gYM5I_m]g', inputs)


//     inputs.curveMesh = curveMesh;

//     const points = inputs.curve.tessellate();

//     const colors = [];
//     const pointsToRender = [];
//     points.forEach(pt => {
//         colors.push(new BitByBit.BABYLON.Color4(1, 1, 1, 0));
//         pointsToRender.push(new BitByBit.BABYLON.Vector3(pt[0], pt[1], pt[2]));
//     });

//     if (inputs.curveMesh && inputs.updatable) {
//         if (inputs.curveMesh.getTotalVertices() === points.length) {
//             inputs.curveMesh = BitByBit.BABYLON.MeshBuilder.CreateLines(null, { points: pointsToRender, colors, instance: inputs.curveMesh, useVertexAlpha: true, updatable: inputs.updatable }, null);
//         } else {
//             inputs.curveMesh.dispose();
//             inputs.curveMesh = BitByBit.BABYLON.MeshBuilder.CreateLines('curves0.46538421660397233', { points: pointsToRender, colors, useVertexAlpha: true, updatable: inputs.updatable }, BitByBit.scene);
//             curveMesh = inputs.curveMesh;
//         }
//     } else {
//         inputs.curveMesh = BitByBit.BABYLON.MeshBuilder.CreateLines('curves0.11915521692642583', { points: pointsToRender, colors, useVertexAlpha: true, updatable: inputs.updatable }, BitByBit.scene);
//         curveMesh = inputs.curveMesh;
//     }

//     inputs.curveMesh.enableEdgesRendering();
//     inputs.curveMesh.edgesWidth = inputs.width;
//     const col = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
//     inputs.curveMesh.edgesColor = new BitByBit.BABYLON.Color4(col.r, col.g, col.b, inputs.opacity);
//     inputs.curveMesh.opacity = inputs.opacity;


//     /* End Component: "babylon_draw_curve" */
// })();
