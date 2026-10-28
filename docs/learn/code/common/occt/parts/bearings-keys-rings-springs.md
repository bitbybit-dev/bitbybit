---
sidebar_position: 4
title: "Bearings, Keys, Retaining Rings and Springs"
sidebar_label: Bearings, Keys, Rings, Springs
description: Deep groove ball bearings, DIN and ANSI parallel keys, DIN and inch retaining rings and compression springs, with the tables behind them, and a shaft fitted with a key, a ring and a bearing.
topic: code.occt.parts.bearings-keys-rings-springs
type: explanation
tags: [code, occt]
---

# Bearings, keys, retaining rings and springs

These are the parts a shaft carries: a bearing it turns in, a key that drives a gear or a pulley on it, a retaining ring that keeps things from sliding off, and the springs beside them. [Standard parts](./intro) explains the standards, units, frames and roles they share, and [machining](./machining) cuts the keyways and grooves they sit in.

## A shaft fitted out

Here a 20 millimetre shaft gets a keyway with its key, a groove with its retaining ring, and a ball bearing:

```typescript
const up = (y: number): Bit.Inputs.Base.Frame => ({ origin: [0, y, 0], normal: [0, 1, 0], direction: [1, 0, 0] });
const keySizes = bitbybit.engineering.mechanical.keys.din.parallelKeySizes({ shaftDiameter: 20 });

let shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 10, height: 60, center: [0, 0, 0], direction: [0, 1, 0] });
shaft = await bitbybit.occt.parts.mechanical.machining.din.keyway({ shape: shaft, diameter: 20, length: 20, frame: up(30) });
shaft = await bitbybit.occt.parts.mechanical.machining.din.ringGroove({ shape: shaft, diameter: 20, frame: up(55) });

const key = await bitbybit.occt.parts.mechanical.keys.din.parallelKey({
    shaftDiameter: 20, length: 20,
    frame: { origin: [10 - keySizes.shaftDepth, 40, 0], normal: [1, 0, 0], direction: [0, 1, 0] },
});
const ring = await bitbybit.occt.parts.mechanical.retainingRings.din.retainingRing({ diameter: 20, frame: up(55) });
const bearing = await bitbybit.occt.parts.mechanical.bearings.iso.ballBearing({ designation: Bit.Inputs.Engineering.isoBallBearingEnum.b6004, frame: up(5) });

await bitbybit.draw.drawAnyAsync({ entity: [shaft, key, ring, bearing] });
```

- The keyway starts on the axis 30 up the shaft and runs 20 along its frame's normal, facing the frame's direction, +X.
- A DIN 6885 key for a 20 millimetre shaft is 6 by 6, and `parallelKeySizes` says it sits 3.5 deep in the shaft. The key lies with its bottom face's centre on its frame's origin, its height along the normal and its length along the direction, so its frame stands on the keyway's floor, 3.5 in from the shaft's surface, its normal pointing out of the shaft and its direction along it, halfway along the keyway.
- The retaining ring takes the same frame as its groove and sits in it.
- A 6004 bearing has a 20 millimetre bore. One side lies on its frame's origin, 5 up the shaft, and its axis runs along the normal.

Every part touches the shaft where it should and overlaps it nowhere.

## Ball bearings

`bitbybit.occt.parts.mechanical.bearings.iso.ballBearing` makes a metric deep groove ball bearing by its `designation`, such as 608 or 6204, and `bitbybit.occt.parts.mechanical.bearings.ansi.ballBearing` an inch R-series bearing, such as R8. Each is a compound of the inner and outer rings with their raceways, the balls and the cage, and with `shields` on, a shield closing each side between the rings, as on a 2Z bearing. One side lies on the frame's origin and the axis runs along the normal.

`ballBearingWithRoles`, in both standards, names the `bore`, the `outside`, the rings' sides `innerStart`, `innerEnd`, `outerStart` and `outerEnd`, the `innerRing`, `outerRing`, `race`, `ball`, `cage` and `shield` faces across the compound, with an `axis` frame that is the frame you gave.

`bitbybit.engineering.mechanical.bearings.iso.ballBearingSizes` gives a bearing's bore, outside diameter and width (608 is 8 by 22 by 7 millimetres), and `bitbybit.engineering.mechanical.bearings.ansi.ballBearingSizes` an R-series bearing's, open or shielded, since several are wider shielded: R8 is 1/2 inch bore, 1-1/8 outside, 1/4 wide open and 5/16 shielded. `iso.designations` and `ansi.designations` list the bearings each table holds.

## Parallel keys

`bitbybit.occt.parts.mechanical.keys.din.parallelKey` makes a DIN 6885 form A key and `bitbybit.occt.parts.mechanical.keys.ansi.parallelKey` an ANSI B17.1 square key: a bar with round ends, as wide and high as the standard gives for a shaft of `shaftDiameter`, `length` from end to end. DIN keys cover shafts over 6 and up to 65 millimetres, the ANSI square keys shafts over 5/16 and up to 6-1/2 inches. Sunk the keyway's depth below the shaft's surface, a key is also the tool that cuts its keyway.

`parallelKeyWithRoles` names a key's `bottom`, `top`, `side` and `end` (the round ends), with a `bottom` frame that is the frame you gave.

`bitbybit.engineering.mechanical.keys.din.parallelKeySizes` gives a key's width and height and how deep its keyway goes into the shaft and into the hub: a 20 millimetre shaft takes a 6 by 6 key, 3.5 deep in the shaft and 2.8 in the hub. `bitbybit.engineering.mechanical.keys.ansi.parallelKeySizes` does the same for inch shafts, its depths measured from the top of the round with half the key standing at each keyseat's side: a 1 inch shaft takes a 1/4 inch square key, 0.141 deep in the shaft.

## Retaining rings

`bitbybit.occt.parts.mechanical.retainingRings.din.retainingRing` makes a DIN 471 ring for a shaft or a DIN 472 ring for a bore, by `kind`, and `bitbybit.occt.parts.mechanical.retainingRings.ansi.retainingRing` an inch tapered ring, each fitted in its groove. Its centre lies on the frame's origin, one side on the frame's plane, it rises along the normal and its lugs point along the direction. DIN rings come for shafts from 3 to 100 millimetres and bores from 8 to 100; the inch rings for shafts from 1/8 to 2 inches and bores from 1/4 to 2.

`retainingRingWithRoles` names a ring's `seat` (the face in the groove), `rim`, `start`, `end`, `gap` and `lug` (the holes for the pliers), with a `centre` frame that is the frame you gave.

`bitbybit.engineering.mechanical.retainingRings.din.retainingRingSizes` gives the ring and its groove: the ring's thickness, free diameter, lugs and lug holes, and the groove's diameter, width and least distance from the shaft's end. A 20 millimetre shaft takes a ring 1.2 thick in a groove 19 across and 1.3 wide. `bitbybit.engineering.mechanical.retainingRings.ansi.retainingRingSizes` does the same in inches, a diameter within a thousandth of an inch of a listed one taking that one: a 3/4 inch shaft takes a groove 0.704 across. `din.diameters` and `ansi.diameters` list the diameters each table holds.

## Compression springs

`bitbybit.occt.parts.mechanical.springs.compressionSpring` makes a compression spring with closed and ground ends: a wire of `wireDiameter` coiled to an outside `diameter`, more than three times the wire's, with `activeCoils` springing between the closed coil at each end, standing on the frame's origin and coiled about its normal. `length` runs from one ground end to the other: the active coils share what the end coils leave, so a shorter length is the spring compressed, and one shorter than its solid length, every coil touching, is refused.

`compressionSpringWithRoles` names the `bottom` and `top`, its ground ends, and the `coil`; its `bottom` frame is the frame you gave and its `top` frame lies `length` along the normal.

`bitbybit.occt.parts.mechanical.springs.compressionSpringPath` gives the centre line of the wire as the spring coils it, to sweep a wire of another section along. It runs three quarters of a coil past the frame's origin and past `length`, so cut the swept solid flat at both ends to grind them. `bitbybit.engineering.mechanical.springs.compressionSpringPath` works out the same centre line as points up +Z, with the active coils' pitch and the spring's solid length.

{/* api:occt.parts.mechanical.bearings:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.ballBearing`](https://docs.bitbybit.dev/classes/Bit.OCCTBearingsAnsi#ballBearing) | Makes a deep groove ball bearing as a compound of its inner and outer rings with their raceways, its balls, its cage and, when `shields` is true, a shield on each side. |
| [`ansi.ballBearingWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTBearingsAnsi#ballBearingWithRoles) | Makes a ball bearing as `ballBearing` does and names the role each face plays. |
| [`iso.ballBearing`](https://docs.bitbybit.dev/classes/Bit.OCCTBearingsIso#ballBearing) | Makes a deep groove ball bearing as a compound of its inner and outer rings with their raceways, its balls, its cage and, when `shields` is true, a shield on each side. |
| [`iso.ballBearingWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTBearingsIso#ballBearingWithRoles) | Makes a ball bearing as `ballBearing` does and names the role each face plays. |

{/* api:occt.parts.mechanical.bearings:end */}

{/* api:occt.parts.mechanical.keys:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.parallelKey`](https://docs.bitbybit.dev/classes/Bit.OCCTKeysAnsi#parallelKey) | Makes an ANSI B17.1 square parallel key: a bar with round ends, as wide and high as the standard gives for a shaft of `shaftDiameter`, lying along the frame's direction on its origin. |
| [`ansi.parallelKeyWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTKeysAnsi#parallelKeyWithRoles) | Makes a parallel key as `parallelKey` does and names the role each face plays. |
| [`din.parallelKey`](https://docs.bitbybit.dev/classes/Bit.OCCTKeysDin#parallelKey) | Makes a DIN 6885 form A parallel key: a bar with round ends, as wide and high as the standard gives for a shaft of `shaftDiameter`, lying along the frame's direction on its origin. |
| [`din.parallelKeyWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTKeysDin#parallelKeyWithRoles) | Makes a parallel key as `parallelKey` does and names the role each face plays. |

{/* api:occt.parts.mechanical.keys:end */}

{/* api:occt.parts.mechanical.retainingRings:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.retainingRing`](https://docs.bitbybit.dev/classes/Bit.OCCTRetainingRingsAnsi#retainingRing) | Makes an inch tapered retaining ring, external for a shaft or internal for a bore, fitted in its groove. |
| [`ansi.retainingRingWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTRetainingRingsAnsi#retainingRingWithRoles) | Makes a retaining ring as `retainingRing` does and names the role each face plays. |
| [`din.retainingRing`](https://docs.bitbybit.dev/classes/Bit.OCCTRetainingRingsDin#retainingRing) | Makes a DIN 471 retaining ring for a shaft or a DIN 472 ring for a bore, fitted in its groove. |
| [`din.retainingRingWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTRetainingRingsDin#retainingRingWithRoles) | Makes a retaining ring as `retainingRing` does and names the role each face plays. |

{/* api:occt.parts.mechanical.retainingRings:end */}

{/* api:occt.parts.mechanical.springs:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`compressionSpring`](https://docs.bitbybit.dev/classes/Bit.OCCTSprings#compressionSpring) | Makes a compression spring with closed and ground ends: a round wire coiled about the frame's normal, its end coils closed onto the next and ground flat, standing on the frame's origin. |
| [`compressionSpringPath`](https://docs.bitbybit.dev/classes/Bit.OCCTSprings#compressionSpringPath) | Makes the centre line of a compression spring's wire, coiled about the frame's normal as `compressionSpring` coils it, to sweep a wire of another section along. |
| [`compressionSpringWithRoles`](https://docs.bitbybit.dev/classes/Bit.OCCTSprings#compressionSpringWithRoles) | Makes a compression spring as `compressionSpring` does and names the role each face plays. |

{/* api:occt.parts.mechanical.springs:end */}

{/* api:engineering.mechanical.bearings:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.ballBearingSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringBearingsAnsi#ballBearingSizes) | Gives an R-series ball bearing by its designation: its bore, its outside diameter and its width, open or shielded. |
| [`ansi.designations`](https://docs.bitbybit.dev/classes/Bit.EngineeringBearingsAnsi#designations) | Lists the designations of the R-series ball bearings the tables hold. |
| [`iso.ballBearingSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringBearingsIso#ballBearingSizes) | Gives a deep groove ball bearing by its designation: its bore, its outside diameter and its width. |
| [`iso.designations`](https://docs.bitbybit.dev/classes/Bit.EngineeringBearingsIso#designations) | Lists the designations of the metric ball bearings the tables hold. |

{/* api:engineering.mechanical.bearings:end */}

{/* api:engineering.mechanical.keys:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.parallelKeySizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringKeysAnsi#parallelKeySizes) | Gives the ANSI B17.1 square key for a shaft: the key's width and height, and how deep its keyseat goes into the shaft and into the hub. |
| [`din.parallelKeySizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringKeysDin#parallelKeySizes) | Gives the DIN 6885 parallel key for a shaft: the key's width and height, and how deep its keyway goes into the shaft and into the hub. |

{/* api:engineering.mechanical.keys:end */}

{/* api:engineering.mechanical.retainingRings:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`ansi.diameters`](https://docs.bitbybit.dev/classes/Bit.EngineeringRetainingRingsAnsi#diameters) | Lists the shaft or bore diameters the inch rings come for. |
| [`ansi.retainingRingSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringRetainingRingsAnsi#retainingRingSizes) | Gives the inch ring for a shaft or a bore, with its groove: the ring's thickness, free diameter, lugs and lug holes, and the groove's diameter, width and least distance from the end. |
| [`din.diameters`](https://docs.bitbybit.dev/classes/Bit.EngineeringRetainingRingsDin#diameters) | Lists the shaft or bore diameters DIN 471 or DIN 472 gives a ring for. |
| [`din.retainingRingSizes`](https://docs.bitbybit.dev/classes/Bit.EngineeringRetainingRingsDin#retainingRingSizes) | Gives the DIN 471 ring for a shaft or the DIN 472 ring for a bore, with its groove: the ring's thickness, free diameter, lugs and lug holes, and the groove's diameter, width and least distance from the end. |

{/* api:engineering.mechanical.retainingRings:end */}

{/* api:engineering.mechanical.springs:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`compressionSpringPath`](https://docs.bitbybit.dev/classes/Bit.EngineeringSprings#compressionSpringPath) | Works out the centre line of a compression spring's wire up +Z, with a closed coil at each end, the active coils' pitch and the solid length, where every coil touches the next. |

{/* api:engineering.mechanical.springs:end */}
