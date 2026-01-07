import type { BitByBitBase } from "@bitbybit-dev/threejs";
import { Color, MeshPhongMaterial, Scene } from "three";
import { Inputs } from "@bitbybit-dev/threejs";
import type { Current } from "./models/current";
import type { Model } from "./models/model";

export const createShape = async (
  bitbybit: BitByBitBase | undefined,
  scene: Scene | undefined,
  model: Model,
  shapesToClean: Inputs.OCCT.TopoDSShapePointer[],
  current: Current
) => {
  if (scene && bitbybit) {
    if (shapesToClean.length > 0) {
      await bitbybit.occt.deleteShapes({ shapes: shapesToClean });
    }

    const faceColour = "#1c224f";

    const roundingRadius = model.cupThickness / 3;
    const cupHolderLength = 2;
    const cupHolderThickness = model.cupThickness * 1.5;
    const cupHolderHeight = bitbybit.math.remap({
      number: model.cupHandleHeight,
      fromLow: 0,
      fromHigh: 1,
      toLow: cupHolderThickness * 2 + roundingRadius * 2.5,
      toHigh: model.cupHeight - model.cupThickness * 2,
    });

    const cupHolderWidth = model.cupHandleDistance + model.cupThickness * 2;
    const edgeColour = "#ffffff";

    const box = await bitbybit.occt.shapes.solid.createBox({
      width: cupHolderWidth * 2,
      height: cupHolderHeight,
      length: cupHolderLength,
      center: [model.cupRadius, model.cupHeight / 2, 0],
    });

    const boxInside = await bitbybit.occt.shapes.solid.createBox({
      width: cupHolderWidth * 2 - cupHolderThickness * 2,
      height: cupHolderHeight - cupHolderThickness * 2,
      length: cupHolderLength * 1.2,
      center: [model.cupRadius, model.cupHeight / 2, 0],
    });

    const boolHolder = await bitbybit.occt.booleans.difference({
      shape: box,
      shapes: [boxInside],
      keepEdges: false,
    });

    const cylinder = await bitbybit.occt.shapes.solid.createCylinder({
      center: [0, 0, 0],
      radius: model.cupRadius,
      height: model.cupHeight,
    });

    const baseUnion = await bitbybit.occt.booleans.union({
      shapes: [cylinder, boolHolder],
      keepEdges: false,
    });

    const cylinderInside = await bitbybit.occt.shapes.solid.createCylinder({
      center: [0, model.cupThickness, 0],
      radius: model.cupRadius - model.cupThickness,
      height: model.cupHeight,
    });

    const cupBase = await bitbybit.occt.booleans.difference({
      shape: baseUnion,
      shapes: [cylinderInside],
      keepEdges: false,
    });

    const cup = await bitbybit.occt.fillets.filletEdges({
      radius: roundingRadius,
      shape: cupBase,
    });

    const dimOpt = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
    dimOpt.labelSuffix = "(cm)";
    dimOpt.start = [model.cupRadius, 0, 0];
    dimOpt.end = [-model.cupRadius, 0, 0];
    dimOpt.labelSize = 0.5;
    dimOpt.labelOffset = 1;
    dimOpt.offsetFromPoints = 2;
    dimOpt.direction = [0, 0, model.cupRadius * 1.3];

    const dimensionWidth =
      await bitbybit.occt.dimensions.simpleLinearLengthDimension(dimOpt);
    dimOpt.start = [model.cupRadius, 0, 0];
    dimOpt.end = [model.cupRadius, model.cupHeight, 0];
    dimOpt.direction = [0, 0, model.cupRadius * 1.6];
    const dimensionHeight =
      await bitbybit.occt.dimensions.simpleLinearLengthDimension(dimOpt);

    const finalShape = await bitbybit.occt.shapes.compound.makeCompound({
      shapes: [dimensionWidth, cup, dimensionHeight],
    });

    shapesToClean = [
      box,
      boxInside,
      boolHolder,
      cylinder,
      baseUnion,
      cylinderInside,
      cupBase,
      finalShape,
    ];

    const options = new Inputs.Draw.DrawOcctShapeOptions();
    options.faceColour = faceColour;
    options.faceOpacity = 1;
    options.edgeOpacity = 1;
    options.drawEdges = true;
    options.edgeColour = edgeColour;
    options.drawTwoSided = false;
    options.precision = 0.01;

    const mat = new MeshPhongMaterial({ color: new Color(model.color) });
    mat.polygonOffset = true;
    mat.polygonOffsetFactor = 3;
    options.faceMaterial = mat;

    const group = await bitbybit.draw.drawAnyAsync({
      entity: finalShape,
      options,
    });

    group.children[0].children.forEach((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });

    current.group = group;
    return finalShape;
  }
};
