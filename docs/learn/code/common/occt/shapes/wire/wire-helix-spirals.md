---
sidebar_position: 4
title: Wire Helix Spirals
sidebar_label: Wire Helix Spirals
description: Learn how to create helix occt wires with spirals
tags: [code, occt, rete, blockly, typescript]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation" 
  title="OCCT category icon" />

# Creating Helix Wires

<Tabs groupId="regular-helix-tapered-helix-and-flat-spiral-examples">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"2abca66d21efd2a2\":{\"id\":\"2abca66d21efd2a2\",\"name\":\"bitbybit.occt.shapes.wire.createHelixWire\",\"customName\":\"create helix wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":1,\"pitch\":1,\"height\":5,\"center\":[0,0,0],\"direction\":[0,1,0],\"clockwise\":false,\"tolerance\":0.0001},\"inputs\":{\"center\":{\"connections\":[{\"node\":\"26d17aed24ceb170\",\"output\":\"result\",\"data\":{}}]}},\"position\":[706.0512890586609,285.8208999785649]},\"26d17aed24ceb170\":{\"id\":\"26d17aed24ceb170\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":-8,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[308.13724588203286,400.4410333929026]},\"389d488161c3075a\":{\"id\":\"389d488161c3075a\",\"name\":\"bitbybit.occt.shapes.wire.createTaperedHelixWire\",\"customName\":\"create tapered helix wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"startRadius\":2,\"endRadius\":0.5,\"pitch\":1,\"height\":5,\"center\":[0,0,0],\"direction\":[0,1,0],\"clockwise\":false,\"tolerance\":0.0001},\"inputs\":{\"center\":{\"connections\":[{\"node\":\"307bea8c538bbc14\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1983.3245178411435,306.0315773435569]},\"5963964013669860\":{\"id\":\"5963964013669860\",\"name\":\"bitbybit.occt.shapes.wire.createFlatSpiralWire\",\"customName\":\"create flat spiral wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"startRadius\":0.5,\"endRadius\":5,\"numTurns\":5,\"center\":[0,0,0],\"direction\":[0,1,0],\"clockwise\":false,\"tolerance\":0.0001},\"inputs\":{},\"position\":[1143.7762077506823,290.70325704546104]},\"307bea8c538bbc14\":{\"id\":\"307bea8c538bbc14\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":8,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[1587.768691450028,458.8546759665349]}}}","version":"1.0.0-rc.0","type":"rete"}}
    title="Regular helix, tapered helix and flat spiral examples"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={}
    title="Bezier curves with different weight distributions"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={}
    title="Bezier curves with different weight distributions"
    />
</TabItem>
</Tabs>
