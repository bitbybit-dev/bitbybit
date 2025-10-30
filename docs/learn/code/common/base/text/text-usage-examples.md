---
sidebar_position: 2
title: Text Usage Examples
sidebar_label: Text Usage Examples
description: Learn how to create and format text strings and then render them as 3D text geometry in Bitbybit using Rete, Blockly, and TypeScript.
tags: [code, text, rete, blockly, typescript]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Admonition from '@theme/Admonition';

# Using Text: Formatting and 3D Fonts

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/text-icon.svg" 
  alt="Text category icon" 
  title="Text category icon" /> 

Text is a fundamental way to convey information and add detail to your designs. This tutorial demonstrates two key text operations in Bitbybit:

1.  **Formatting Text Strings:** How to create dynamic text by inserting values into a template string.
2.  **Creating 3D Text Geometry:** How to take a string and turn it into a 3D object that can be rendered in your scene.

We'll explore this using Rete (visual nodes), Blockly (visual blocks), and TypeScript (code). All examples will format a personalized greeting and then display that greeting as 3D text.

For detailed information on each text function, please refer to the [Text API Documentation](https://docs.bitbybit.dev/classes/Bit.Text.html).

## The Core Idea: From String to 3D Object

The process involves a few steps:

1.  **Prepare Your Text:**
    *   Define the base string you want to display.
    *   Use the `text.format()` method to insert dynamic values (like names or adjectives) into placeholders within your string (e.g., `"Hi {0}, you are {1}!"`).
2.  **Generate 3D Text:**
    *   Use the `advanced.text3d.create()` method (from the `bitbybit.advanced.text3d` namespace) to convert your formatted string into 3D geometry.
    *   This method allows you to specify the text content, font type, size, thickness (height), rotation, and other parameters to customize the appearance of the 3D text.
3.  **Draw the 3D Text:**
    *   Use `draw.drawAnyAsync()` to render the generated 3D text object in the scene.

<Admonition type="info" title="3D Text Feature">
    The `advanced.text3d.create()` functionality for generating 3D text geometry is part of Bitbybit's advanced, proprietary features. While you can use it freely within the bitbybit.dev platform and via our Runners, its source code is not open. The basic text formatting functions (like `text.format()`) are part of the open-source `@bitbybit-dev/base` package.
</Admonition>

## Live Examples

Click through the tabs below to see the implementation. Each example will create the text "Hi John, you are awesome!" and display it as a 3D model.
  
<Tabs groupId="vectors-live-examples">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"e51f1cebbbae25d4\":{\"id\":\"e51f1cebbbae25d4\",\"name\":\"bitbybit.text.format\",\"customName\":\"format\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"Hi {0}, you are {1}!\",\"values\":[\"World\"]},\"inputs\":{\"values\":{\"connections\":[{\"node\":\"f4eb250a27a91bba\",\"output\":\"list\",\"data\":{}}]}},\"position\":[399.1515481894714,317.67783254941753]},\"f4eb250a27a91bba\":{\"id\":\"f4eb250a27a91bba\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"0b2160a0ad9c8877\",\"output\":\"result\",\"data\":{}},{\"node\":\"d258ec68e21669ea\",\"output\":\"result\",\"data\":{}}]}},\"position\":[28.52019681370868,393.87997844264095]},\"d258ec68e21669ea\":{\"id\":\"d258ec68e21669ea\",\"name\":\"bitbybit.text.create\",\"customName\":\"create\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"awesome\"},\"inputs\":{},\"position\":[-431.5143578525457,444.65038651781117]},\"0b2160a0ad9c8877\":{\"id\":\"0b2160a0ad9c8877\",\"name\":\"bitbybit.text.create\",\"customName\":\"create\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"John\"},\"inputs\":{},\"position\":[-431.2924713328231,184.24991413435163]},\"a90e6a83f49020c6\":{\"id\":\"a90e6a83f49020c6\",\"name\":\"bitbybit.advanced.text3d.create\",\"customName\":\"text 3d\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"bitbybit.dev\",\"fontType\":\"Roboto\",\"fontVariant\":\"Regular\",\"fontSize\":2,\"height\":0.2,\"rotation\":180,\"origin\":[0,0,0],\"direction\":[0,1,0],\"originAlignment\":\"centerMiddle\"},\"inputs\":{\"text\":{\"connections\":[{\"node\":\"e51f1cebbbae25d4\",\"output\":\"result\",\"data\":{}}]}},\"position\":[778.5000526533418,314.427689068662]}}}","version":"0.20.9","type":"rete"}}
    title="Text Formatting And 3D Fonts"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"`|,;v]ai`xS;5u+t%Or0\">name</variable><variable id=\"*xyx{pSP*|r|wZPsJfSL\">word</variable><variable id=\"8h{$wdE[xK@-2/$jc:wO\">wordList</variable></variables><block type=\"variables_set\" id=\"wT{mc-Afys)89RpezBxC\" x=\"-100\" y=\"-217\"><field name=\"VAR\" id=\"`|,;v]ai`xS;5u+t%Or0\">name</field><value name=\"VALUE\"><block type=\"text\" id=\".=G^GbD}bqe9kLto]+5;\"><field name=\"TEXT\">John</field></block></value><next><block type=\"variables_set\" id=\"lDAkO|%rq}`6p,#GW2O:\"><field name=\"VAR\" id=\"*xyx{pSP*|r|wZPsJfSL\">word</field><value name=\"VALUE\"><block type=\"text\" id=\"]A*F?|Vl/wEQDJjjk=;[\"><field name=\"TEXT\">awesome</field></block></value><next><block type=\"variables_set\" id=\"0A21C{TN9lID,AD;G:,T\"><field name=\"VAR\" id=\"8h{$wdE[xK@-2/$jc:wO\">wordList</field><value name=\"VALUE\"><block type=\"lists_create_with\" id=\"eO)#fJMq0{,`uc+/`mDo\"><mutation items=\"2\"></mutation><value name=\"ADD0\"><block type=\"variables_get\" id=\"F3AdVR`g{*nh{#NgQ9JR\"><field name=\"VAR\" id=\"`|,;v]ai`xS;5u+t%Or0\">name</field></block></value><value name=\"ADD1\"><block type=\"variables_get\" id=\"Y)0]O0xBxO2K?87s@7^[\"><field name=\"VAR\" id=\"*xyx{pSP*|r|wZPsJfSL\">word</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"NhzPkha%8GJ,=/Ka-1;W\"><value name=\"Entity\"><block type=\"bitbybit.advanced.text3d.create\" id=\"X%/X5*pSYyP2,o.4j~VA\"><value name=\"Text\"><block type=\"bitbybit.text.format\" id=\"Yyw0WiZ!pDdcQr?hLlzU\"><value name=\"Text\"><block type=\"text\" id=\"N_V+Y6!f~YOID{c|gqpz\"><field name=\"TEXT\">Hi {0}, you are {1}!</field></block></value><value name=\"Values\"><block type=\"variables_get\" id=\"G@wz5n5;cd|qaGFe3b+]\"><field name=\"VAR\" id=\"8h{$wdE[xK@-2/$jc:wO\">wordList</field></block></value></block></value><value name=\"FontType\"><block type=\"bitbybit.advanced.text3d.fontsEnum\" id=\":Mk1IT+pCNu%H6(2gP]p\"><field name=\"bitbybit.advanced.text3d.fontsEnum\">'Roboto'</field></block></value><value name=\"FontVariant\"><block type=\"bitbybit.advanced.text3d.fontVariantsEnum\" id=\"bVtj9S4!(_V0-#mk0KcD\"><field name=\"bitbybit.advanced.text3d.fontVariantsEnum\">'Regular'</field></block></value><value name=\"FontSize\"><block type=\"math_number\" id=\"t)rdaYMBQ$v?_91#oTN]\"><field name=\"NUM\">2</field></block></value><value name=\"Height\"><block type=\"math_number\" id=\"Qz5,/7JH#}vnY2n3PvJm\"><field name=\"NUM\">0.2</field></block></value><value name=\"Rotation\"><block type=\"math_number\" id=\"!{rOa}OgKv!rZ+}0ui)U\"><field name=\"NUM\">180</field></block></value><value name=\"Origin\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"XNtSRg+c2uVWcfyO~+.3\"><value name=\"X\"><block type=\"math_number\" id=\"*2uUA,^E7BS/76q;_Iz(\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"yFYa;*jZIzmwTHxS=l((\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"Vn:[ltIk#3)?=^a@AMui\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"_W*31kGBE#+WhsNE^2)M\"><value name=\"X\"><block type=\"math_number\" id=\"uT@%*2;+99G.:UhgjeEg\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"5AR3)lZho|`^wUA0Ma%L\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"3@O={zHe_9`QYQjI0a6#\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginAlignment\"><block type=\"bitbybit.advanced.text3d.recAlignmentEnum\" id=\"r=YmHPXM5_7XLX!-hI+0\"><field name=\"bitbybit.advanced.text3d.recAlignmentEnum\">'centerMiddle'</field></block></value></block></value></block></next></block></next></block></next></block></xml>","version":"0.20.9","type":"blockly"}}
    title="Text Formatting And 3D Fonts"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const start = async () => {\n    const name = \"John\";\n    const word = \"awesome\";\n\n    const formatOpt = new Bit.Inputs.Text.TextFormatDto();\n    formatOpt.text = \"Hi {0}, you are {1}!\";\n    formatOpt.values = [name, word];\n    const formattedText = bitbybit.text.format(formatOpt);\n\n    const text3dOptions = new Bit.Advanced.Text3D.Text3DDto();\n    text3dOptions.text = formattedText;\n    text3dOptions.rotation = 180;\n    text3dOptions.fontSize = 2;\n    const text3d = await bitbybit.advanced.text3d.create(text3dOptions);\n    bitbybit.draw.drawAnyAsync({ entity: text3d });\n}\n\nstart();","version":"0.20.9","type":"typescript"}}
    title="Text Formatting And 3D Fonts"
    />
</TabItem>

</Tabs>

## Conclusion

This tutorial covered two useful text operations:
*   **String formatting** using `text.format()` allows for dynamic text content.
*   **3D text creation** using `advanced.text3d.create()` enables you to bring text into your 3D scenes as physical geometry.

Experiment with different template strings, values, fonts, and 3D text parameters to customize your textual elements in Bitbybit!