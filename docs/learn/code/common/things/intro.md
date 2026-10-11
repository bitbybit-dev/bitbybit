---
sidebar_position: 1
title: Things - Finished Parametric Models
sidebar_label: Things
description: The catalogue of finished parametric models in bitbybit.things - vases, cups, a medal and a phone stand to 3D print, a laser-cut phone holder, tables, a chair, a house and two birdhouses - how to build, draw and dispose one, and which need a plan, with an example in Rete, Blockly and TypeScript.
topic: code.things.intro
type: explanation
tags: [code, models]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Things: finished parametric models

`bitbybit.things` is a catalogue of finished models. Each one is a whole object, a vase, a table or a house, built in one call from a handful of parameters: change a parameter and the model is built again with it. Use one as it is, as the start of your own design, or as an example of what a parametric model can be.

They are platform algorithms: they run in the editors on bitbybit.dev and in the BabylonJS runner, not in the npm packages. Every model except the two birdhouses is computed only for members of the Silver and Gold plans; without a plan, `create` stops the run with a message that says so ([Plans](/learn/plans#platform-algorithms)).

## The catalogue

| Area | Models |
|---|---|
| `threeDPrinting` | the vases `serenitySwirl` and `arabicArchway`, the cups `calmCup` and `dragonCup`, the medal `eternalLove` and the phone stand `desktop.phoneNest` |
| `laserCutting` | the phone holder `gadgets.dropletsPhoneHolder`, as an assembled model, flat drawings for cutting, or both |
| `furniture` | the tables `elegantTable`, `goodCoffeeTable` and `snakeTable`, and the chair `snakeChair` |
| `architecture` | the house `houses.zenHideout`, with its floors, walls, windows, columns, roof and stairs |
| `kidsCorner` | the birdhouses `birdhouses.wingtipVilla` and `birdhouses.chirpyChalet` |

## Building, drawing and disposing

Every model has the same three steps:

- `create` takes the model's parameters and builds it, standing on the ground with Y up. It returns the model's data: its shapes, the whole model as one compound and the parts it is made of.
- `drawModel` draws that data with the model's own materials, and `bitbybit.draw.drawAnyAsync` draws it the same way, as the example below does.
- `dispose` frees the model's shapes in the kernel, for a script that builds many versions of a model one after another.

Some models add their own steps: `drawOptions` builds the options of their materials, the laser-cut phone holder downloads its parts as STEP and its drawings as DXF or STEP, and the house can be built at a level of detail from `enums.lodEnum`. The shapes are ordinary OpenCascade shapes, so a model can be measured, cut or exported to STEP like anything else.

Here the Wingtip Villa birdhouse is built with a taller chimney and a wider roof overhang, and turned half a circle so its front, with the entrance hole, faces the camera:

{/* example:birdhouse:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"villa\":{\"id\":\"villa\",\"name\":\"bitbybit.things.kidsCorner.birdhouses.wingtipVilla.create\",\"customName\":\"wingtip villa\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"interiorWidth\":3,\"interiorLength\":3,\"interiorHeight\":5,\"thickness\":0.5,\"holeDiameter\":1.5,\"holeDistToBottom\":2.5,\"stickLength\":1.2,\"stickDiameter\":0.5,\"baseAttachmentHeight\":2,\"roofOverhang\":1.5,\"rotation\":180,\"chimneyHeight\":2,\"origin\":[0,0,0]},\"inputs\":{},\"position\":[40,40]}},\"modules\":{}}","type":"rete"}}
  title="A birdhouse from the catalogue in Rete"
  description="The Wingtip Villa birdhouse built from its parameters, with a taller chimney and a wider roof overhang than its defaults, turned to face the camera."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.things.kidsCorner.birdhouses.wingtipVilla.create\"><value name=\"InteriorWidth\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"InteriorLength\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"InteriorHeight\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"Thickness\"><block type=\"math_number\"><field name=\"NUM\">0.5</field></block></value><value name=\"HoleDiameter\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"HoleDistToBottom\"><block type=\"math_number\"><field name=\"NUM\">2.5</field></block></value><value name=\"StickLength\"><block type=\"math_number\"><field name=\"NUM\">1.2</field></block></value><value name=\"StickDiameter\"><block type=\"math_number\"><field name=\"NUM\">0.5</field></block></value><value name=\"BaseAttachmentHeight\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"RoofOverhang\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"Rotation\"><block type=\"math_number\"><field name=\"NUM\">180</field></block></value><value name=\"ChimneyHeight\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Origin\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></xml>","type":"blockly"}}
  title="A birdhouse from the catalogue in Blockly"
  description="The Wingtip Villa birdhouse built from its parameters, with a taller chimney and a wider roof overhang than its defaults, turned to face the camera."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const options = new Bit.Things.KidsCorner.BirdHouses.WingtipVilla.WingtipVillaDto();\noptions.chimneyHeight = 2;\noptions.roofOverhang = 1.5;\noptions.rotation = 180;\n\nconst villa = await bitbybit.things.kidsCorner.birdhouses.wingtipVilla.create(options);\nawait bitbybit.draw.drawAnyAsync({ entity: villa });","type":"typescript"}}
  title="A birdhouse from the catalogue in TypeScript"
  description="The Wingtip Villa birdhouse built from its parameters, with a taller chimney and a wider roof overhang than its defaults, turned to face the camera."
/>

</TabItem>
</Tabs>

{/* example:birdhouse:end */}

## Every function

{/* api:things:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`architecture.houses.zenHideout.create`](https://docs.bitbybit.dev/classes/Bit.ZenHideout#create) | Builds the house with its floors, walls, windows, columns, beams, roof and stairs, with Y up. |
| [`architecture.houses.zenHideout.dispose`](https://docs.bitbybit.dev/classes/Bit.ZenHideout#dispose) | Deletes every shape of the house from the kernel to free its memory. |
| [`architecture.houses.zenHideout.drawModel`](https://docs.bitbybit.dev/classes/Bit.ZenHideout#drawModel) | Draws the house according to the detail level it was built at. |
| [`enums.lodEnum`](https://docs.bitbybit.dev/classes/Bit.Enums#lodEnum) | Picks a level of detail value: low, middle or high. |
| [`furniture.chairs.snakeChair.create`](https://docs.bitbybit.dev/classes/Bit.SnakeChair#create) | Builds the snake-shaped chair body as one solid, with Y up and the seat facing +X. |
| [`furniture.chairs.snakeChair.dispose`](https://docs.bitbybit.dev/classes/Bit.SnakeChair#dispose) | Deletes every shape of the chair from the kernel to free its memory. |
| [`furniture.chairs.snakeChair.drawModel`](https://docs.bitbybit.dev/classes/Bit.SnakeChair#drawModel) | Draws the chair body in white rough plastic. |
| [`furniture.chairs.snakeChair.drawOptions`](https://docs.bitbybit.dev/classes/Bit.SnakeChair#drawOptions) | Collects the options that control how the snake chair is drawn. |
| [`furniture.chairs.snakeChair.getCompoundShape`](https://docs.bitbybit.dev/classes/Bit.SnakeChair#getCompoundShape) | Gets the whole chair shape out of a built model. |
| [`furniture.chairs.snakeChair.getSittingAreaCenterPoint`](https://docs.bitbybit.dev/classes/Bit.SnakeChair#getSittingAreaCenterPoint) | Gets the center of the seat at seat height. |
| [`furniture.chairs.snakeChair.getSittingWireShape`](https://docs.bitbybit.dev/classes/Bit.SnakeChair#getSittingWireShape) | Gets the rectangle outlining the seat at seat height. |
| [`furniture.tables.elegantTable.create`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#create) | Builds the table from its top panel, base panel and legs, standing on the ground with Y up. |
| [`furniture.tables.elegantTable.dispose`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#dispose) | Deletes every shape of the table from the kernel to free its memory. |
| [`furniture.tables.elegantTable.drawModel`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#drawModel) | Draws the top, the base panel and the legs as separate meshes in wood materials. |
| [`furniture.tables.elegantTable.drawOptions`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#drawOptions) | Collects the options that control how the table is drawn. |
| [`furniture.tables.elegantTable.getBottomPanelShape`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getBottomPanelShape) | Gets the base panel, the slab under the top panel that the legs meet, out of a built table. |
| [`furniture.tables.elegantTable.getBottomPanelWireShape`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getBottomPanelWireShape) | Gets the outline of the base panel's underside out of a built table. |
| [`furniture.tables.elegantTable.getCompoundShape`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getCompoundShape) | Gets the whole table shape out of a built model. |
| [`furniture.tables.elegantTable.getLegBottomPoints`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getLegBottomPoints) | Gets the point where each leg meets the ground. |
| [`furniture.tables.elegantTable.getLegsCompoundShape`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getLegsCompoundShape) | Gets all legs of a built table together as one compound. |
| [`furniture.tables.elegantTable.getLegShapeByIndex`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getLegShapeByIndex) | Gets one leg of a built table by its 0-based index. |
| [`furniture.tables.elegantTable.getLegShapes`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getLegShapes) | Gets every leg of a built table as a list of separate solids. |
| [`furniture.tables.elegantTable.getLegTopPoints`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getLegTopPoints) | Gets the point where each leg meets the base panel. |
| [`furniture.tables.elegantTable.getTableBottomCenterPoint`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getTableBottomCenterPoint) | Gets the center of the base panel's underside. |
| [`furniture.tables.elegantTable.getTableTopCenterPoint`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getTableTopCenterPoint) | Gets the center of the table's upper surface. |
| [`furniture.tables.elegantTable.getTopPanelShape`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getTopPanelShape) | Gets the top panel, the upper slab that overhangs the base panel, out of a built table. |
| [`furniture.tables.elegantTable.getTopPanelWireShape`](https://docs.bitbybit.dev/classes/Bit.ElegantTable#getTopPanelWireShape) | Gets the outline of the table's upper surface out of a built table. |
| [`furniture.tables.goodCoffeeTable.create`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#create) | Builds the coffee table from its framed glass top, four legs and an optional shelf, with Y up. |
| [`furniture.tables.goodCoffeeTable.dispose`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#dispose) | Deletes every shape of the table from the kernel to free its memory. |
| [`furniture.tables.goodCoffeeTable.drawModel`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#drawModel) | Draws the top frame, glass, shelf and legs as separate meshes, in dark wood and black glass. |
| [`furniture.tables.goodCoffeeTable.drawOptions`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#drawOptions) | Collects the options that control how the coffee table is drawn. |
| [`furniture.tables.goodCoffeeTable.getCompoundShape`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getCompoundShape) | Gets the whole table shape out of a built model. |
| [`furniture.tables.goodCoffeeTable.getGlassPanelShape`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getGlassPanelShape) | Gets the glass panel set into the top out of a built table. |
| [`furniture.tables.goodCoffeeTable.getGlassPanelWireShape`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getGlassPanelWireShape) | Gets the outline of the glass panel's upper face out of a built table. |
| [`furniture.tables.goodCoffeeTable.getLegBottomPoints`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getLegBottomPoints) | Gets the point at the bottom of each leg. |
| [`furniture.tables.goodCoffeeTable.getLegsCompoundShape`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getLegsCompoundShape) | Gets the four legs of a built table together as one compound. |
| [`furniture.tables.goodCoffeeTable.getLegShapeByIndex`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getLegShapeByIndex) | Gets one leg of a built table by its 0-based index. |
| [`furniture.tables.goodCoffeeTable.getLegShapes`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getLegShapes) | Gets the four legs of a built table as a list of separate solids. |
| [`furniture.tables.goodCoffeeTable.getLegTopPoints`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getLegTopPoints) | Gets the point at the top of each leg, where it meets the top frame. |
| [`furniture.tables.goodCoffeeTable.getShelfShape`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getShelfShape) | Gets the shelf between the legs out of a built table. |
| [`furniture.tables.goodCoffeeTable.getShelfTopWireShape`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getShelfTopWireShape) | Gets an outline wire of the shelf's top out of a built table. |
| [`furniture.tables.goodCoffeeTable.getTableShelfTopCenterPoint`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getTableShelfTopCenterPoint) | Gets the center of the shelf's top. |
| [`furniture.tables.goodCoffeeTable.getTableTopCenterPoint`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getTableTopCenterPoint) | Gets the center of the table's top. |
| [`furniture.tables.goodCoffeeTable.getTopPanelShape`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getTopPanelShape) | Gets the wooden top frame, the part that holds the glass, out of a built table. |
| [`furniture.tables.goodCoffeeTable.getTopPanelWireShape`](https://docs.bitbybit.dev/classes/Bit.GoodCoffeeTable#getTopPanelWireShape) | Gets an outline wire of the top frame out of a built table. |
| [`furniture.tables.snakeTable.create`](https://docs.bitbybit.dev/classes/Bit.SnakeTable#create) | Builds the snake-shaped table body and its glass top, with Y up. |
| [`furniture.tables.snakeTable.dispose`](https://docs.bitbybit.dev/classes/Bit.SnakeTable#dispose) | Deletes every shape of the table from the kernel to free its memory. |
| [`furniture.tables.snakeTable.drawModel`](https://docs.bitbybit.dev/classes/Bit.SnakeTable#drawModel) | Draws the body in white rough plastic and the glass in black glass, each as its own mesh. |
| [`furniture.tables.snakeTable.drawOptions`](https://docs.bitbybit.dev/classes/Bit.SnakeTable#drawOptions) | Collects the options that control how the snake table is drawn. |
| [`furniture.tables.snakeTable.getCompoundShape`](https://docs.bitbybit.dev/classes/Bit.SnakeTable#getCompoundShape) | Gets the whole table shape, the body and the glass together, out of a built model. |
| [`furniture.tables.snakeTable.getGlassShape`](https://docs.bitbybit.dev/classes/Bit.SnakeTable#getGlassShape) | Gets the glass panel on top of a built table. |
| [`furniture.tables.snakeTable.getMainShape`](https://docs.bitbybit.dev/classes/Bit.SnakeTable#getMainShape) | Gets the bent, grooved body of a built table without its glass. |
| [`furniture.tables.snakeTable.getTopCenterPoint`](https://docs.bitbybit.dev/classes/Bit.SnakeTable#getTopCenterPoint) | Gets the center of the table's top surface. |
| [`kidsCorner.birdhouses.chirpyChalet.create`](https://docs.bitbybit.dev/classes/Bit.ChirpyChalet#create) | Builds the birdhouse from its boards, a sloped roof board and a perch. |
| [`kidsCorner.birdhouses.chirpyChalet.dispose`](https://docs.bitbybit.dev/classes/Bit.ChirpyChalet#dispose) | Deletes the birdhouse shapes from the kernel to free their memory. |
| [`kidsCorner.birdhouses.chirpyChalet.drawModel`](https://docs.bitbybit.dev/classes/Bit.ChirpyChalet#drawModel) | Draws the birdhouse in textured wood with white edges. |
| [`kidsCorner.birdhouses.wingtipVilla.create`](https://docs.bitbybit.dev/classes/Bit.WingtipVilla#create) | Builds the birdhouse from its boards, a perch and a chimney. |
| [`kidsCorner.birdhouses.wingtipVilla.dispose`](https://docs.bitbybit.dev/classes/Bit.WingtipVilla#dispose) | Deletes the birdhouse shapes from the kernel to free their memory. |
| [`kidsCorner.birdhouses.wingtipVilla.drawModel`](https://docs.bitbybit.dev/classes/Bit.WingtipVilla#drawModel) | Draws the birdhouse in textured wood with white edges. |
| [`laserCutting.gadgets.dropletsPhoneHolder.create`](https://docs.bitbybit.dev/classes/Bit.DropletsPhoneHolder#create) | Builds the phone holder for a phone of the given size, as an assembled model, flat drawings or both. |
| [`laserCutting.gadgets.dropletsPhoneHolder.dispose`](https://docs.bitbybit.dev/classes/Bit.DropletsPhoneHolder#dispose) | Deletes every shape of the phone holder from the kernel to free its memory. |
| [`laserCutting.gadgets.dropletsPhoneHolder.download3dSTEPModel`](https://docs.bitbybit.dev/classes/Bit.DropletsPhoneHolder#download3dSTEPModel) | Downloads the assembled 3D model of the phone holder as a STEP file. |
| [`laserCutting.gadgets.dropletsPhoneHolder.downloadDXFDrawings`](https://docs.bitbybit.dev/classes/Bit.DropletsPhoneHolder#downloadDXFDrawings) | Downloads the flat cut and engraving outlines as a DXF file for a laser cutter. |
| [`laserCutting.gadgets.dropletsPhoneHolder.downloadSTEPDrawings`](https://docs.bitbybit.dev/classes/Bit.DropletsPhoneHolder#downloadSTEPDrawings) | Downloads the flat cut and engraving outlines as one STEP file. |
| [`laserCutting.gadgets.dropletsPhoneHolder.drawModel`](https://docs.bitbybit.dev/classes/Bit.DropletsPhoneHolder#drawModel) | Draws the model in purple with white edges, the cut outlines in white and the engravings in magenta. |
| [`laserCutting.gadgets.dropletsPhoneHolder.getCompoundShape`](https://docs.bitbybit.dev/classes/Bit.DropletsPhoneHolder#getCompoundShape) | Gets the main shape out of a built phone holder. |
| [`laserCutting.gadgets.dropletsPhoneHolder.getCutWiresCompound`](https://docs.bitbybit.dev/classes/Bit.DropletsPhoneHolder#getCutWiresCompound) | Gets the outlines the laser cuts along, laid out flat. |
| [`laserCutting.gadgets.dropletsPhoneHolder.getEngravingWiresCompound`](https://docs.bitbybit.dev/classes/Bit.DropletsPhoneHolder#getEngravingWiresCompound) | Gets the outlines the laser engraves, the texts and the logo text, laid out flat. |
| [`threeDPrinting.cups.calmCup.create`](https://docs.bitbybit.dev/classes/Bit.CalmCup#create) | Builds a solid cup with a flared wall, a thick bottom and optional handles, standing on Y. |
| [`threeDPrinting.cups.calmCup.dispose`](https://docs.bitbybit.dev/classes/Bit.CalmCup#dispose) | Deletes the cup shape from the kernel to free its memory. |
| [`threeDPrinting.cups.calmCup.drawModel`](https://docs.bitbybit.dev/classes/Bit.CalmCup#drawModel) | Draws the cup with a white metallic material and tinted edges. |
| [`threeDPrinting.cups.dragonCup.create`](https://docs.bitbybit.dev/classes/Bit.DragonCup#create) | Builds the scaled cup with a twisted wall, standing on Y. |
| [`threeDPrinting.cups.dragonCup.drawModel`](https://docs.bitbybit.dev/classes/Bit.DragonCup#drawModel) | Draws the cup with a glossy blue metallic material and light blue edges. |
| [`threeDPrinting.cups.dragonCup.getCompoundShape`](https://docs.bitbybit.dev/classes/Bit.DragonCup#getCompoundShape) | Gets the whole cup shape out of a built model. |
| [`threeDPrinting.desktop.phoneNest.create`](https://docs.bitbybit.dev/classes/Bit.PhoneNest#create) | Builds the phone stand together with a rounded box that stands in for the phone resting on it. |
| [`threeDPrinting.desktop.phoneNest.dispose`](https://docs.bitbybit.dev/classes/Bit.PhoneNest#dispose) | Deletes every shape of the model from the kernel to free its memory. |
| [`threeDPrinting.desktop.phoneNest.drawModel`](https://docs.bitbybit.dev/classes/Bit.PhoneNest#drawModel) | Draws the stand in a wood material and the phone in black glass, each as its own mesh. |
| [`threeDPrinting.desktop.phoneNest.drawOptions`](https://docs.bitbybit.dev/classes/Bit.PhoneNest#drawOptions) | Collects the options that control how the phone stand is drawn. |
| [`threeDPrinting.desktop.phoneNest.getCompoundShape`](https://docs.bitbybit.dev/classes/Bit.PhoneNest#getCompoundShape) | Gets the whole model shape, the stand and the phone together, out of a built model. |
| [`threeDPrinting.medals.eternalLove.create`](https://docs.bitbybit.dev/classes/Bit.EternalLove#create) | Builds the heart-shaped medal with its heading and name in raised letters. |
| [`threeDPrinting.medals.eternalLove.dispose`](https://docs.bitbybit.dev/classes/Bit.EternalLove#dispose) | Deletes the medal shape from the kernel to free its memory. |
| [`threeDPrinting.medals.eternalLove.drawModel`](https://docs.bitbybit.dev/classes/Bit.EternalLove#drawModel) | Draws the medal with a pale pink metallic material and tinted edges. |
| [`threeDPrinting.vases.arabicArchway.create`](https://docs.bitbybit.dev/classes/Bit.ArabicArchway#create) | Builds the arched vase by turning its profile curve around the Y axis, which is up. |
| [`threeDPrinting.vases.arabicArchway.dispose`](https://docs.bitbybit.dev/classes/Bit.ArabicArchway#dispose) | Deletes every shape of the vase from the kernel to free its memory. |
| [`threeDPrinting.vases.arabicArchway.drawModel`](https://docs.bitbybit.dev/classes/Bit.ArabicArchway#drawModel) | Draws the vase with matte white walls, a dark see-through filling in the arches and tinted edges. |
| [`threeDPrinting.vases.serenitySwirl.create`](https://docs.bitbybit.dev/classes/Bit.SerenitySwirl#create) | Builds the twisted, ribbed vase standing on its base and rising along Y. |
| [`threeDPrinting.vases.serenitySwirl.dispose`](https://docs.bitbybit.dev/classes/Bit.SerenitySwirl#dispose) | Deletes the vase shape from the kernel to free its memory. |
| [`threeDPrinting.vases.serenitySwirl.drawModel`](https://docs.bitbybit.dev/classes/Bit.SerenitySwirl#drawModel) | Draws the vase with a matte white material and tinted edges. |

{/* api:things:end */}
