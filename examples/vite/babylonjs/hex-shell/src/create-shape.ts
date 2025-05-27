import type { BitByBitBase } from '@bitbybit-dev/babylonjs';
import {
  Color3,
  Mesh,
  PBRMetallicRoughnessMaterial,
  Scene,
} from '@babylonjs/core';
import { Inputs } from '@bitbybit-dev/babylonjs';
import type { Current } from './models/current';
import type { Model } from './models/model';

export const createShapeLod2 = async (
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
    if (shapesToClean.length > 0) {
      await bitbybit.occt.deleteShapes({ shapes: shapesToClean });
    }

    const { loft } = await createFaceAndEllipses(bitbybit, model);
    shapesToClean.push(loft);
    const faces = await bitbybit.occt.shapes.face.getFaces({
      shape: loft,
    });

    const faceBase = faces[0];
    shapesToClean.push(faceBase);

    const getFace = (l: Inputs.OCCT.TopoDSShapePointer) => {
      return bitbybit.occt.shapes.face.getFace({ shape: l, index: 0 });
    };

    const loft1 = await bitbybit.occt.operations.offset({
      shape: faceBase,
      distance: -1.5,
      tolerance: 1e-6,
    });
    shapesToClean.push(loft1);

    const face1 = await getFace(loft1);
    shapesToClean.push(face1);

    const loft3 = await bitbybit.occt.operations.offset({
      shape: faceBase,
      distance: 1.5,
      tolerance: 1e-6,
    });
    shapesToClean.push(loft3);

    const loft4 = await bitbybit.occt.operations.offset({
      shape: faceBase,
      distance: 3,
      tolerance: 1e-6,
    });
    shapesToClean.push(loft4);

    const loft5 = await bitbybit.occt.operations.offset({
      shape: faceBase,
      distance: 5,
      tolerance: 1e-6,
    });
    shapesToClean.push(loft5);

    const face2 = faceBase;
    const face3 = await getFace(loft3);
    const face4 = await getFace(loft4);
    const face5 = await getFace(loft5);
    shapesToClean.push(face3);
    shapesToClean.push(face4);
    shapesToClean.push(face5);

    const subdivideOptions = new Inputs.OCCT.FaceSubdivideToHexagonWiresDto(
      face1
    );
    subdivideOptions.nrHexagonsU = model.vHex;
    subdivideOptions.nrHexagonsV = model.uHex;
    subdivideOptions.extendUUp = true;
    subdivideOptions.filletPattern = [0.8];
    subdivideOptions.scalePatternU = [0.4, 0.3, 0.2];
    subdivideOptions.scalePatternV = [0.4, 0.3, 0.2];
    const thickness = 0.1;
    const wrs1Out = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    subdivideOptions.scalePatternU = [
      0.4 - thickness,
      0.3 - thickness,
      0.2 - thickness,
    ];
    subdivideOptions.scalePatternV = [
      0.4 - thickness,
      0.3 - thickness,
      0.2 - thickness,
    ];
    shapesToClean.push(...wrs1Out);

    const wrs1In = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs1In);

    subdivideOptions.scalePatternU = [1];
    subdivideOptions.scalePatternV = [1];
    subdivideOptions.filletPattern = [0.001];
    subdivideOptions.shape = face2;
    const wrs2Out = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs2Out);

    subdivideOptions.filletPattern = [0.8];
    subdivideOptions.scalePatternU = [0.4];
    subdivideOptions.scalePatternV = [0.4];
    const wrs2In = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs2In);

    subdivideOptions.scalePatternU = [0.98];
    subdivideOptions.scalePatternV = [0.98];
    subdivideOptions.shape = face3;
    subdivideOptions.filletPattern = [0.001];
    const wrs3Out = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs3Out);

    subdivideOptions.scalePatternU = [0.4];
    subdivideOptions.scalePatternV = [0.4];
    subdivideOptions.filletPattern = [0.9];
    const wrs3In = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs3In);

    subdivideOptions.scalePatternU = [1];
    subdivideOptions.scalePatternV = [1];
    subdivideOptions.filletPattern = [0.001];
    subdivideOptions.shape = face4;
    const wrs4Out = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs4Out);

    subdivideOptions.scalePatternU = [0.3];
    subdivideOptions.scalePatternV = [0.3];
    subdivideOptions.filletPattern = [0.8];
    const wrs4In = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs4In);

    subdivideOptions.scalePatternU = [0.9];
    subdivideOptions.scalePatternV = [0.9];
    subdivideOptions.filletPattern = [0.3];
    const wrs4InSpec = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs4InSpec);

    subdivideOptions.scalePatternU = [0.4, 0.3, 0.2];
    subdivideOptions.scalePatternV = [0.4, 0.3, 0.2];
    subdivideOptions.shape = face5;
    subdivideOptions.filletPattern = [0.9];
    const wrs5Out = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs5Out);

    subdivideOptions.scalePatternU = [
      0.4 - thickness,
      0.3 - thickness,
      0.2 - thickness,
    ];
    subdivideOptions.scalePatternV = [
      0.4 - thickness,
      0.3 - thickness,
      0.2 - thickness,
    ];
    subdivideOptions.filletPattern = [0.9];

    const wrs5In = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs5In);

    const loftPromises: Promise<Inputs.OCCT.TopoDSShapePointer>[] = [];
    const loftOptions =
      new Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSWirePointer>();
    loftOptions.straight = true;
    loftOptions.closed = true;

    const indexes1: number[] = [];
    const indexes2: number[] = [];
    wrs1Out.forEach((w1Out, index) => {
      const w1In = wrs1In[index];
      const w2Out = wrs2Out[index];
      const w2In = wrs2In[index];
      const w3Out = wrs3Out[index];
      const w3In = wrs3In[index];
      const w4Out = wrs4Out[index];
      const w4In = wrs4In[index];
      const w4InSpec = wrs4InSpec[index];
      const w5Out = wrs5Out[index];
      const w5In = wrs5In[index];

      if (index % 3 === 0) {
        indexes1.push(index);
        loftOptions.shapes = [
          w1In,
          w2In,
          w3In,
          w4In,
          w5In,
          w5Out,
          w4Out,
          w3Out,
          w2Out,
          w1Out,
        ].reverse();
      } else {
        indexes2.push(index);
        loftOptions.shapes = [
          w2In,
          w3In,
          w4InSpec,
          w4Out,
          w3Out,
          w2Out,
        ].reverse();
      }

      const lft = bitbybit.occt.operations.loftAdvanced(loftOptions);
      loftPromises.push(lft);
    });

    const lofts: Inputs.OCCT.TopoDSShapePointer[] = await Promise.all(
      loftPromises
    );
    shapesToClean.push(...lofts);
    const lofts1: Inputs.OCCT.TopoDSShapePointer[] = indexes1.map(
      (i) => lofts[i]
    );
    const lofts2: Inputs.OCCT.TopoDSShapePointer[] = indexes2.map(
      (i) => lofts[i]
    );

    const chunkSize = 40;
    const lofts1Chunked = bitbybit.lists.groupNth({
      list: lofts1,
      nrElements: chunkSize,
      keepRemainder: true,
    });
    const lofts2Chunked = bitbybit.lists.groupNth({
      list: lofts2,
      nrElements: chunkSize,
      keepRemainder: true,
    });

    const compounds1ToDrawPromises = lofts1Chunked.map((lchunk) =>
      bitbybit.occt.shapes.compound.makeCompound({
        shapes: lchunk,
      })
    );

    const compounds2ToDrawPromises = lofts2Chunked.map((lchunk) =>
      bitbybit.occt.shapes.compound.makeCompound({
        shapes: lchunk,
      })
    );

    const compounds1ToDraw = await Promise.all(compounds1ToDrawPromises);
    const compounds2ToDraw = await Promise.all(compounds2ToDrawPromises);

    shapesToClean.push(...compounds1ToDraw);
    shapesToClean.push(...compounds2ToDraw);

    const finalShape = await bitbybit.occt.shapes.compound.makeCompound({
      shapes: [...lofts1, ...lofts2],
    });

    shapesToClean.push(finalShape);

    // DRAWING BEGINS

    const options = new Inputs.Draw.DrawOcctShapeOptions();
    options.precision = model.finalPrecision;
    options.drawEdges = model.drawEdges;
    options.drawFaces = model.drawFaces;
    options.drawVertices = false;
    options.edgeWidth = 20;
    options.edgeColour = '#000000';

    const mat = new PBRMetallicRoughnessMaterial(
      'mat1',
      bitbybit.context.scene
    );
    mat.baseColor = Color3.FromHexString(model.color1);
    if (model.drawEdges) {
      mat.zOffset = 2;
    }
    options.faceMaterial = mat;

    const groups1Promises = compounds1ToDraw.map((comp) =>
      bitbybit.draw.drawAnyAsync({ entity: comp, options })
    );

    const mat2 = new PBRMetallicRoughnessMaterial(
      'mat2',
      bitbybit.context.scene
    );
    mat2.baseColor = Color3.FromHexString(model.color2);
    if (model.drawEdges) {
      mat2.zOffset = 2;
    }
    options.faceMaterial = mat2;

    const groups2Promises = compounds2ToDraw.map((comp) =>
      bitbybit.draw.drawAnyAsync({ entity: comp, options })
    );

    const groups1 = await Promise.all(groups1Promises);
    const groups2 = await Promise.all(groups2Promises);

    const group1 = new Mesh('group1', bitbybit.context.scene);
    groups1.forEach((g) => (g.parent = group1));

    const group2 = new Mesh('group2', bitbybit.context.scene);
    groups2.forEach((g) => (g.parent = group2));

    current.group1 = group1;
    current.group2 = group2;
    return finalShape;
  }
};

export const createShapeLod1 = async (
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
    if (shapesToClean.length > 0) {
      await bitbybit.occt.deleteShapes({ shapes: shapesToClean });
    }

    const { loft, w1, w2, w3 } = await createFaceAndEllipses(bitbybit, model);
    shapesToClean.push(loft, w1, w2, w3);
    const faces = await bitbybit.occt.shapes.face.getFaces({
      shape: loft,
    });

    const faceBase = faces[0];
    shapesToClean.push(faceBase);

    const subdivideOptions = new Inputs.OCCT.FaceSubdivideToHexagonWiresDto(
      faceBase
    );
    subdivideOptions.nrHexagonsU = model.vHex;
    subdivideOptions.nrHexagonsV = model.uHex;
    subdivideOptions.extendUUp = true;
    const wrs1Out = await bitbybit.occt.shapes.face.subdivideToHexagonWires(
      subdivideOptions
    );
    shapesToClean.push(...wrs1Out);

    const fcs: Inputs.OCCT.TopoDSFacePointer[] =
      (await bitbybit.occt.shapes.face.createFacesFromWiresOnFace({
        wires: wrs1Out,
        face: faceBase,
        inside: true,
      })) as any;

    shapesToClean.push(...fcs);
    const firstGroupFcs: Inputs.OCCT.TopoDSFacePointer[] = [];
    const secondGroupFcs: Inputs.OCCT.TopoDSFacePointer[] = [];
    fcs.forEach((f, index) => {
      if (index % 3 === 0) {
        firstGroupFcs.push(f);
      } else {
        secondGroupFcs.push(f);
      }
    });

    const firstGroup = await bitbybit.occt.shapes.compound.makeCompound({
      shapes: firstGroupFcs,
    });
    shapesToClean.push(firstGroup);
    const secondGroup = await bitbybit.occt.shapes.compound.makeCompound({
      shapes: secondGroupFcs,
    });
    shapesToClean.push(secondGroup);

    const dimensions = await createDimensions(
      bitbybit,
      model,
      faceBase,
      [w2],
      shapesToClean
    );

    shapesToClean.push(dimensions);

    const options = new Inputs.Draw.DrawOcctShapeOptions();
    options.precision = 0.01;
    options.drawEdges = true;
    options.drawFaces = true;
    options.drawVertices = false;
    options.edgeWidth = 30;

    options.edgeColour = '#ff00ff';

    const mat = new PBRMetallicRoughnessMaterial('mat', bitbybit.context.scene);
    mat.baseColor = Color3.FromHexString(model.color1);
    mat.zOffset = 2;
    mat.backFaceCulling = false;
    options.faceMaterial = mat;
    const grp1 = await bitbybit.draw.drawAnyAsync({
      entity: firstGroup,
      options,
    });

    const mat2 = new PBRMetallicRoughnessMaterial(
      'mat2',
      bitbybit.context.scene
    );
    mat2.baseColor = Color3.FromHexString(model.color2);
    mat2.zOffset = 2;
    mat2.backFaceCulling = false;
    options.faceMaterial = mat2;
    const grp2 = await bitbybit.draw.drawAnyAsync({
      entity: secondGroup,
      options,
    });

    const dimOpt = new Inputs.Draw.DrawOcctShapeOptions();
    dimOpt.edgeColour = '#000000';
    dimOpt.edgeWidth = 20;
    dimOpt.drawFaces = false;
    const dimensionsGroup = await bitbybit.draw.drawAnyAsync({
      entity: dimensions,
      options: dimOpt,
    });
    // dimensionsGroup.position.y = 0.05;

    // just to match chunked data structure of LOD2

    const group1 = new Mesh('group1', bitbybit.context.scene);
    grp1.parent = group1;

    const group2 = new Mesh('group2', bitbybit.context.scene);
    grp2.parent = group2;

    current.group1 = group1;
    current.group2 = group2;

    current.dimensions = dimensionsGroup;

    const finalShape = await bitbybit.occt.shapes.compound.makeCompound({
      shapes: [firstGroup, secondGroup, dimensions],
    });

    return finalShape;
  }
};

async function createFaceAndEllipses(bitbybit: BitByBitBase, model: Model) {
  const ellipseOptions = new Inputs.OCCT.EllipseDto();
  const { wire } = bitbybit.occt.shapes;
  const { transforms, operations } = bitbybit.occt;

  ellipseOptions.radiusMinor = model.ellipse1MinRad;
  ellipseOptions.radiusMajor = model.ellipse1MaxRad;
  const w1 = await wire.createEllipseWire(ellipseOptions);

  ellipseOptions.radiusMinor = model.ellipse2MinRad;
  ellipseOptions.radiusMajor = model.ellipse2MaxRad;
  const w2s = await wire.createEllipseWire(ellipseOptions);

  let w2r1;
  if (model.ellipse2RotX > 0) {
    w2r1 = await transforms.rotate({
      shape: w2s,
      angle: model.ellipse2RotX,
      axis: [1, 0, 0],
    });
  } else {
    w2r1 = w2s;
  }

  const w2r2 = await transforms.rotate({
    shape: w2r1,
    angle: model.ellipse2RotY,
    axis: [0, 1, 0],
  });
  const w2 = await transforms.translate({
    shape: w2r2,
    translation: [0, model.height, 0],
  });

  ellipseOptions.radiusMinor = model.ellipse3MinRad;
  ellipseOptions.radiusMajor = model.ellipse3MaxRad;
  const w3s = await wire.createEllipseWire(ellipseOptions);
  const w3 = await transforms.rotate({
    shape: w3s,
    angle: model.ellipse3YRot,
    axis: [0, 1, 0],
  });
  const loft = await operations.loft({
    shapes: [w3, w2, w1],
    makeSolid: false,
  });

  return { loft, w1, w2, w3 };
}

async function createDimensions(
  bitbybit: BitByBitBase,
  model: Model,
  faceBase: Inputs.OCCT.TopoDSFacePointer,
  wires: Inputs.OCCT.TopoDSWirePointer[],
  shapesToClean: Inputs.OCCT.TopoDSShapePointer[]
) {
  const subOpt =
    new Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>();
  subOpt.shape = faceBase;
  subOpt.nrDivisionsU = 50;
  subOpt.nrDivisionsV = 50;
  const pts = await bitbybit.occt.shapes.face.subdivideToPoints(subOpt);
  const bbox = bitbybit.point.boundingBoxOfPoints({ points: pts });

  const { dimensions, shapes } = bitbybit.occt;
  const linearOptions = new Inputs.OCCT.SimpleLinearLengthDimensionDto();

  linearOptions.start = [-model.ellipse3MaxRad, 0.01, 0];
  linearOptions.end = [model.ellipse3MaxRad, 0.01, 0];
  linearOptions.direction = [0, 0, model.ellipse3MinRad * 1.2];
  linearOptions.labelSize = 3;
  linearOptions.labelOffset = 3;
  linearOptions.crossingSize = 1;
  linearOptions.labelSuffix = '(m)';
  const dimLength = await dimensions.simpleLinearLengthDimension(linearOptions);
  shapesToClean.push(dimLength);

  linearOptions.start = [0, 0.01, -model.ellipse3MinRad];
  linearOptions.end = [0, 0.01, model.ellipse3MinRad];
  linearOptions.direction = [-model.ellipse3MaxRad * 1.2, 0, 0];
  const dimWidth = await dimensions.simpleLinearLengthDimension(linearOptions);
  shapesToClean.push(dimWidth);

  linearOptions.labelOffset = 1;
  linearOptions.start = [0, model.height, 0];
  linearOptions.end = [0, 0, 0];
  linearOptions.offsetFromPoints = model.ellipse3MaxRad;
  linearOptions.direction = [model.ellipse3MaxRad * 1.05, 0, 0];
  linearOptions.labelSize = 1;
  const dimHeight = await dimensions.simpleLinearLengthDimension(linearOptions);
  shapesToClean.push(dimHeight);

  linearOptions.start = [0, bbox.max[1], 0];
  linearOptions.end = [0, 0, 0];
  linearOptions.offsetFromPoints = model.ellipse3MaxRad;
  linearOptions.direction = [model.ellipse3MaxRad * 1.1, 0, 0];
  linearOptions.labelSize = 1;
  const dimHeight2 = await dimensions.simpleLinearLengthDimension(
    linearOptions
  );
  shapesToClean.push(dimHeight2);

  const pinOpt = new Inputs.OCCT.PinWithLabelDto();
  pinOpt.startPoint = [0, 0, 0];
  pinOpt.endPoint = [0, model.height * 2, model.ellipse2MaxRad / 2];
  pinOpt.direction = [0, 0, 4];
  pinOpt.label = `Nr Hexagons ${model.uHex * model.vHex}`;
  pinOpt.labelSize = 2;
  pinOpt.labelOffset = 3;
  const pointerDim = await dimensions.pinWithLabel(pinOpt);
  shapesToClean.push(pointerDim);

  const shapesDimCompound = [
    dimLength,
    dimWidth,
    dimHeight,
    dimHeight2,
    pointerDim,
  ];

  if (model.ellipse2RotX) {
    const angleOpt = new Inputs.OCCT.SimpleAngularDimensionDto();
    angleOpt.center = [0, model.height, 0];
    const rotPts = bitbybit.point.rotatePointsCenterAxis({
      points: [[1, 0, 0]],
      center: [0, 0, 0],
      axis: [0, 0, -1],
      angle: model.ellipse2RotX,
    });
    angleOpt.direction1 = rotPts[0];
    angleOpt.direction2 = [model.ellipse3MaxRad, 0, 0];
    angleOpt.radius = model.ellipse2MaxRad * 0.7;
    angleOpt.offsetFromCenter = 0;
    angleOpt.extraSize = 1;
    angleOpt.labelSize = 1;
    angleOpt.labelOffset = 2;

    const angleDim = await dimensions.simpleAngularDimension(angleOpt);
    shapesToClean.push(angleDim);
    const rotAngleDim = await bitbybit.occt.transforms.rotate({
      shape: angleDim,
      axis: [0, 1, 0],
      angle: -model.ellipse2RotY,
    });
    shapesToClean.push(rotAngleDim);
    shapesDimCompound.push(rotAngleDim);
  }

  const dimCompound = await shapes.compound.makeCompound({
    shapes: shapesDimCompound,
  });
  shapesToClean.push(dimCompound);

  const rotCompound = await bitbybit.occt.transforms.rotate({
    shape: dimCompound,
    axis: [0, 1, 0],
    angle: -model.ellipse3YRot,
  });

  shapesToClean.push(rotCompound);
  const compWithWires = await bitbybit.occt.shapes.compound.makeCompound({
    shapes: [...wires, rotCompound],
  });
  return compWithWires;
}
