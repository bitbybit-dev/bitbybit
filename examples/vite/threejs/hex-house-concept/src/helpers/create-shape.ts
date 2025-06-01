import type { BitByBitBase } from "@bitbybit-dev/threejs";
import { Inputs } from "@bitbybit-dev/threejs";
import { Color, MeshPhongMaterial, Scene } from "three";
import type { Current, Model } from "../models";

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
    if (shapesToClean.length > 0) {
      await bitbybit.occt.deleteShapes({ shapes: shapesToClean });
    }

    shapesToClean = [];
    type Point3 = Inputs.Base.Point3;
    const sd = {
      groundCrv: [
        [-15, 0.1, -4.5],
        [0, 0.1, -3.5],
        [13, 0.1, -4.5],
      ] as Point3[],
      groundMid: [
        [-16, 0.1, 0],
        [14, 0.1, 0],
      ] as Point3[],
      firstCrv: [
        [-12, 0, -5],
        [-7, 0, -2],
        [0, 0, -4],
        [2, 0, -3],
        [12, 0, -3],
      ] as Point3[],
      secondCrv: [
        [-14, 2, -8],
        [-7, 1.3, -3],
        [0, 1.8, -5.8],
        [2, 2, -5],
        [14, 1.5, -4],
      ] as Point3[],
      midCrv: [
        [-18, 4, 0],
        [-7, 5, 0],
        [0, 3.7, 0],
        [2, 3.7, 0],
        [12, 8, 0],
      ] as Point3[],
    };

    const { shapes, transforms, operations } = bitbybit.occt;
    const { face } = shapes;

    const intOptions = new Inputs.OCCT.InterpolationDto();
    intOptions.points = sd.groundCrv;
    const groundCrv = await shapes.wire.interpolatePoints(intOptions);
    shapesToClean.push(groundCrv);

    const mirrorOptions =
      new Inputs.OCCT.MirrorAlongNormalDto<Inputs.OCCT.TopoDSShapePointer>();
    mirrorOptions.normal = [0, 0, 1];
    mirrorOptions.shape = groundCrv;
    const groundCrvMir = await transforms.mirrorAlongNormal(mirrorOptions);
    shapesToClean.push(groundCrvMir);

    intOptions.points = sd.groundMid;
    const groundMid = await shapes.wire.interpolatePoints(intOptions);
    shapesToClean.push(groundMid);

    intOptions.points = sd.firstCrv;
    const firstCrv = await shapes.wire.interpolatePoints(intOptions);
    mirrorOptions.shape = firstCrv;
    const firstCrvMir = await transforms.mirrorAlongNormal(mirrorOptions);
    shapesToClean.push(firstCrv);
    shapesToClean.push(firstCrvMir);

    intOptions.points = sd.secondCrv;
    const secondCrv = await shapes.wire.interpolatePoints(intOptions);
    mirrorOptions.shape = secondCrv;
    const secondCrvMir = await transforms.mirrorAlongNormal(mirrorOptions);
    shapesToClean.push(secondCrv);
    shapesToClean.push(secondCrvMir);

    intOptions.points = sd.midCrv;
    const midCrv = await shapes.wire.interpolatePoints(intOptions);
    shapesToClean.push(midCrv);

    const loftOptions =
      new Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSWirePointer>();
    loftOptions.shapes = [
      midCrv,
      secondCrv,
      firstCrv,
      groundCrv,
      groundMid,
      groundCrvMir,
      firstCrvMir,
      secondCrvMir,
      midCrv,
    ];
    loftOptions.straight = true;
    const loft = await operations.loftAdvanced(loftOptions);
    shapesToClean.push(loft);

    const faceRoof = await face.getFace({ shape: loft, index: 0 });
    const faceWall = await face.getFace({ shape: loft, index: 1 });
    shapesToClean.push(faceRoof);
    shapesToClean.push(faceWall);

    const roof = await createHexagonsRoof(
      faceRoof,
      model.uHex,
      model.vHex,
      bitbybit
    );
    const wall = await createHexagonsWalls(
      faceWall,
      model.uHex,
      Math.ceil(model.vHex / 2),
      bitbybit
    );
    const wallExtrude = await operations.extrude({
      shape: wall,
      direction: [0, 0, -0.2],
    });
    const mirroredRoofPromises = roof.map((r) => {
      mirrorOptions.shape = r;
      return transforms.mirrorAlongNormal(mirrorOptions);
    });

    mirrorOptions.shape = wallExtrude;
    const mirroredWall = await transforms.mirrorAlongNormal(mirrorOptions);

    const mirroredRoof = await Promise.all(mirroredRoofPromises);

    const comp = await shapes.compound.makeCompound({
      shapes: [...roof, ...mirroredRoof, wallExtrude, mirroredWall],
    });
    shapesToClean.push(comp);

    const finalShape = comp;

    const compRoof1 = await shapes.compound.makeCompound({
      shapes: [roof[0], mirroredRoof[0], wallExtrude, mirroredWall],
    });
    const compRoof2 = await shapes.compound.makeCompound({
      shapes: [roof[1], mirroredRoof[1]],
    });
    const compRoof3 = await shapes.compound.makeCompound({
      shapes: [roof[2], mirroredRoof[2]],
    });

    const options = new Inputs.Draw.DrawOcctShapeOptions();
    options.precision = 0.19;
    options.drawEdges = model.drawEdges;
    options.drawFaces = model.drawFaces;
    options.edgeColour = "#000000";

    const mat1 = new MeshPhongMaterial({ color: new Color(model.color) });
    mat1.polygonOffset = true;
    mat1.polygonOffsetFactor = 1;
    mat1.side = 2;
    options.faceMaterial = mat1;

    const groupRoof1 = await bitbybit.draw.drawAnyAsync({
      entity: compRoof1,
      options,
    });

    const mat2 = new MeshPhongMaterial({ color: new Color(0x0000ff) });
    mat2.polygonOffset = true;
    mat2.polygonOffsetFactor = 1;
    mat2.side = 2;
    options.faceMaterial = mat2;

    const groupRoof2 = await bitbybit.draw.drawAnyAsync({
      entity: compRoof2,
      options,
    });

    const mat3 = new MeshPhongMaterial({ color: new Color(0x3300ff) });
    mat3.polygonOffset = true;
    mat3.polygonOffsetFactor = 1;
    mat3.side = 2;
    options.faceMaterial = mat3;

    const groupRoof3 = await bitbybit.draw.drawAnyAsync({
      entity: compRoof3,
      options,
    });

    current.groups = [groupRoof1, groupRoof2, groupRoof3];

    current.groups.forEach((group) => {
      group.children[0].children.forEach((child) => {
        child.castShadow = true;
        child.receiveShadow = true;
      });
    });

    return finalShape;
  }
};

async function createHexagonsWalls(
  f: Inputs.OCCT.TopoDSFacePointer,
  nrHexagonsU: number,
  nrHexagonsV: number,
  bitbybit: BitByBitBase
) {
  const { shapes } = bitbybit.occt;
  const { face } = shapes;

  const hexSubdivisionOptions =
    new Inputs.OCCT.FaceSubdivideToHexagonHolesDto<Inputs.OCCT.TopoDSFacePointer>();
  hexSubdivisionOptions.shape = f;
  hexSubdivisionOptions.nrHexagonsU = nrHexagonsU;
  hexSubdivisionOptions.nrHexagonsV = nrHexagonsV;
  hexSubdivisionOptions.scalePatternU = [0.8, 0.5, 0.5, 0.3];
  hexSubdivisionOptions.scalePatternV = [0.8, 0.5, 0.5, 0.3];
  hexSubdivisionOptions.offsetFromBorderV = 0.1;
  hexSubdivisionOptions.offsetFromBorderV = 0.1;
  hexSubdivisionOptions.flatU = false;
  hexSubdivisionOptions.inclusionPattern = [true, true, true, false];
  const sub = await face.subdivideToHexagonHoles(hexSubdivisionOptions);

  return sub[0];
}

async function createHexagonsRoof(
  f: Inputs.OCCT.TopoDSFacePointer,
  nrHexagonsU: number,
  nrHexagonsV: number,
  bitbybit: BitByBitBase
) {
  const { shapes, operations } = bitbybit.occt;
  const { face, wire } = shapes;

  const hexSubdivisionOptions =
    new Inputs.OCCT.FaceSubdivideToHexagonWiresDto<Inputs.OCCT.TopoDSFacePointer>();
  hexSubdivisionOptions.shape = f;
  hexSubdivisionOptions.nrHexagonsU = nrHexagonsU;
  hexSubdivisionOptions.nrHexagonsV = nrHexagonsV;
  hexSubdivisionOptions.scalePatternU = [0.8, 0.5, 0.1, 0.1, 0.1];
  hexSubdivisionOptions.scalePatternV = [0.8, 0.5, 0.1, 0.1, 0.1];
  hexSubdivisionOptions.flatU = false;
  hexSubdivisionOptions.inclusionPattern = [true, true, true, false];
  const sub = await face.subdivideToHexagonWires(hexSubdivisionOptions);

  const hexSubdivisionOptions2 =
    new Inputs.OCCT.FaceSubdivideToHexagonWiresDto<Inputs.OCCT.TopoDSFacePointer>();
  hexSubdivisionOptions2.shape = f;
  hexSubdivisionOptions2.flatU = false;
  hexSubdivisionOptions2.nrHexagonsU = nrHexagonsU;
  hexSubdivisionOptions2.nrHexagonsV = nrHexagonsV;
  hexSubdivisionOptions2.inclusionPattern = [true, true, true, false];
  const sub2 = await face.subdivideToHexagonWires(hexSubdivisionOptions2);

  const promisesWires = sub.map((s) => wire.reversedWire({ shape: s }));
  const revSub = await Promise.all(promisesWires);

  const promiseFaces = revSub.map((s1, index) => {
    const s2 = sub2[index];
    return face.createFaceFromWires({ shapes: [s2, s1], planar: false });
  });

  const faces = await Promise.all(promiseFaces);

  const heightPattern = [0.11, 0.1, 0.1];
  let heightPatternIndex = 0;

  const group1Promises: Promise<Inputs.OCCT.TopoDSShapePointer>[] = [];
  const group2Promises: Promise<Inputs.OCCT.TopoDSShapePointer>[] = [];
  const group3Promises: Promise<Inputs.OCCT.TopoDSShapePointer>[] = [];

  faces.forEach((face) => {
    const height = heightPattern[heightPatternIndex];
    if (heightPatternIndex === heightPattern.length - 1) {
      heightPatternIndex = 0;
    } else {
      heightPatternIndex++;
    }
    const thick = operations.makeThickSolidSimple({
      shape: face,
      offset: height,
    });
    if (heightPatternIndex === 0) {
      group1Promises.push(thick);
    } else if (heightPatternIndex === 1) {
      group2Promises.push(thick);
    } else if (heightPatternIndex === 2) {
      group3Promises.push(thick);
    }
  });

  const group1 = await Promise.all(group1Promises);
  const group2 = await Promise.all(group2Promises);
  const group3 = await Promise.all(group3Promises);

  const compound1 = await shapes.compound.makeCompound({
    shapes: group1,
  });
  const compound2 = await shapes.compound.makeCompound({
    shapes: group2,
  });
  const compound3 = await shapes.compound.makeCompound({
    shapes: group3,
  });

  return [compound1, compound2, compound3];
}
