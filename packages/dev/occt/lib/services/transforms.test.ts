import createBitbybitOcct, { BitbybitOcctModule } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTEdge, OCCTSolid } from "./shapes";
import { OCCTTransforms } from "./transforms";

describe("OCCT transforms unit tests", () => {
    let occt: BitbybitOcctModule;
    let solid: OCCTSolid;
    let transforms: OCCTTransforms;
    let edge: OCCTEdge;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();

        occHelper = new OccHelper(vec, s, occt);
        solid = new OCCTSolid(occt, occHelper);
        transforms = new OCCTTransforms(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
    });

    describe("single shape transforms", () => {

        it("should translate the given shape to a new location", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.translate({ shape: box, translation: [1, 1, -1] });
            const boxCenter = solid.getSolidCenterOfMass({ shape: box });
            const transformedCenter = solid.getSolidCenterOfMass({ shape: transformed });
            expect(boxCenter[0]).toBeCloseTo(0);
            expect(boxCenter[1]).toBeCloseTo(0);
            expect(boxCenter[2]).toBeCloseTo(0);
            expect(transformedCenter[0]).toBeCloseTo(1);
            expect(transformedCenter[1]).toBeCloseTo(1);
            expect(transformedCenter[2]).toBeCloseTo(-1);
            box.delete();
            transformed.delete();
        });

        it("should rotate the given shape around the given axis", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.rotate({ shape: box, axis: [1, 1, 1], angle: 64 });
            const cornerPointsOriginal = edge.getCornerPointsOfEdgesForShape({ shape: box });
            const cornerPointsTransformed = edge.getCornerPointsOfEdgesForShape({ shape: transformed });

            expect(cornerPointsOriginal).toEqual([
                [-2.5, -5, -3],
                [-2.5, -5, 3],
                [-2.5, 5, 3],
                [-2.5, 5, -3],
                [2.5, -5, -3],
                [2.5, -5, 3],
                [2.5, 5, 3],
                [2.5, 5, -3]
            ]);
            expect(cornerPointsTransformed).toEqual([
                [-2.0237908840572083, -3.898097227895187, -4.578111888047603],
                [2.2129807298257798, -5.888353428934485, -0.8246273008912945],
                [-1.1041129385730493, 0.36745421632603037, 6.236658722247018],
                [-5.340884552456037, 2.357710417365328, 2.4831741350907097],
                [1.1041129385730493, -0.3674542163260306, -6.236658722247018],
                [5.340884552456037, -2.357710417365328, -2.4831741350907093],
                [2.0237908840572083, 3.898097227895187, 4.578111888047603],
                [-2.2129807298257798, 5.888353428934485, 0.824627300891295]
            ]);
            box.delete();
            transformed.delete();
        });

        it("should scale the given shape in 3D space with different factors", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.scale3d({ shape: box, center: [2.5, 5, 3], scale: [1.3, 2, 4] });
            const cornerPointsOriginal = edge.getCornerPointsOfEdgesForShape({ shape: box });
            const cornerPointsTransformed = edge.getCornerPointsOfEdgesForShape({ shape: transformed });
            expect(cornerPointsOriginal).toEqual([
                [-2.5, -5, -3],
                [-2.5, -5, 3],
                [-2.5, 5, 3],
                [-2.5, 5, -3],
                [2.5, -5, -3],
                [2.5, -5, 3],
                [2.5, 5, 3],
                [2.5, 5, -3]
            ]);
            expect(cornerPointsTransformed).toEqual([
                [-4, -15, -21],
                [-4, -15, 3],
                [-4, 5, 3],
                [-4, 5, -21],
                [2.5, -15, -21],
                [2.5, -15, 3],
                [2.5, 5, 3],
                [2.5, 5, -21]
            ]);
            box.delete();
            transformed.delete();
        });

        it("should scale the given shape in 3D space with single factor from the 0", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.scale({ shape: box, factor: 2.3 });
            const cornerPointsOriginal = edge.getCornerPointsOfEdgesForShape({ shape: box });
            const cornerPointsTransformed = edge.getCornerPointsOfEdgesForShape({ shape: transformed });
            expect(cornerPointsOriginal).toEqual([
                [-2.5, -5, -3],
                [-2.5, -5, 3],
                [-2.5, 5, 3],
                [-2.5, 5, -3],
                [2.5, -5, -3],
                [2.5, -5, 3],
                [2.5, 5, 3],
                [2.5, 5, -3]
            ]);
            expect(cornerPointsTransformed).toEqual([
                [-5.75, -11.5, -6.8999999999999995],
                [-5.75, -11.5, 6.8999999999999995],
                [-5.75, 11.5, 6.8999999999999995],
                [-5.75, 11.5, -6.8999999999999995],
                [5.75, -11.5, -6.8999999999999995],
                [5.75, -11.5, 6.8999999999999995],
                [5.75, 11.5, 6.8999999999999995],
                [5.75, 11.5, -6.8999999999999995]
            ]);
            box.delete();
            transformed.delete();
        });

        it("should transform the given shape", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.transform({ shape: box, translation: [1, 1, -1], scaleFactor: 2.3, rotationAxis: [1, 1, 1], rotationAngle: 64 });
            const cornerPointsOriginal = edge.getCornerPointsOfEdgesForShape({ shape: box });
            const cornerPointsTransformed = edge.getCornerPointsOfEdgesForShape({ shape: transformed });
            expect(cornerPointsOriginal).toEqual([
                [-2.5, -5, -3],
                [-2.5, -5, 3],
                [-2.5, 5, 3],
                [-2.5, 5, -3],
                [2.5, -5, -3],
                [2.5, -5, 3],
                [2.5, 5, 3],
                [2.5, 5, -3]
            ]);
            expect(cornerPointsTransformed).toEqual([
                [-3.6547190333315784, -7.96562362415893, -11.529657342509488],
                [6.089855678599293, -12.543212886549313, -2.8966427920499775],
                [-1.5394597587180137, 1.8451446975498715, 13.344315061168142],
                [-11.284034470648885, 6.422733959940254, 4.711300510708632],
                [3.5394597587180137, 0.1548553024501298, -15.344315061168142],
                [13.284034470648885, -4.422733959940254, -6.711300510708632],
                [5.654719033331578, 9.96562362415893, 9.529657342509488],
                [-4.089855678599293, 14.543212886549313, 0.8966427920499784]
            ]);
            box.delete();
            transformed.delete();
        });

        it("should rotate the given shape around the given axis and the center", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.rotateAroundCenter({ shape: box, axis: [1, 1, 1], angle: 64, center: [2.5, 0, 3] });
            const cornerPointsOriginal = edge.getCornerPointsOfEdgesForShape({ shape: box });
            const cornerPointsTransformed = edge.getCornerPointsOfEdgesForShape({ shape: transformed });

            expect(cornerPointsOriginal).toEqual([
                [-2.5, -5, -3],
                [-2.5, -5, 3],
                [-2.5, 5, 3],
                [-2.5, 5, -3],
                [2.5, -5, -3],
                [2.5, -5, 3],
                [2.5, 5, 3],
                [2.5, 5, -3]
            ]);
            expect(cornerPointsTransformed).toEqual([
                [-3.2061286023138313, -4.668290633160117, -2.6255807645260507],
                [1.0306430115691567, -6.658546834199415, 1.127903822630258],
                [-2.286450656829672, -0.4027391889388996, 8.18918984576857],
                [-6.52322227071266, 1.587517012100398, 4.435705258612263],
                [-0.07822477968357333, -1.1376476215909603, -4.2841275987254654],
                [4.158546834199415, -3.1279038226302576, -0.5306430115691567],
                [0.8414531658005857, 3.1279038226302576, 6.530643011569157],
                [-3.395318448082403, 5.118160023669555, 2.777158424412848]
            ]);
            box.delete();
            transformed.delete();
        });

        it("should align the given shape from one origin and direction to the other", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.align({ shape: box, fromOrigin: [0, 0, 0], fromDirection: [0, 0, 1], toOrigin: [1, 1, -1], toDirection: [1, 1, 0] });
            const cornerPointsOriginal = edge.getCornerPointsOfEdgesForShape({ shape: box });
            const cornerPointsTransformed = edge.getCornerPointsOfEdgesForShape({ shape: transformed });

            expect(cornerPointsOriginal).toEqual([
                [-2.5, -5, -3],
                [-2.5, -5, 3],
                [-2.5, 5, 3],
                [-2.5, 5, -3],
                [2.5, -5, -3],
                [2.5, -5, 3],
                [2.5, 5, 3],
                [2.5, 5, -3]
            ]);
            expect(cornerPointsTransformed).toEqual([
                [-2.8890872965260113, 0.6464466094067265, 4],
                [1.3535533905932744, 4.889087296526013, 4],
                [1.3535533905932735, 4.889087296526011, -6],
                [-2.8890872965260113, 0.6464466094067265, -6],
                [0.6464466094067265, -2.8890872965260113, 4],
                [4.889087296526013, 1.3535533905932744, 4],
                [4.889087296526011, 1.3535533905932735, -6],
                [0.6464466094067265, -2.8890872965260113, -6]
            ]);
            box.delete();
            transformed.delete();
        });

        it("should align and translate the given shape from one origin and direction to the other", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.alignAndTranslate({ shape: box, center: [1, 3, 4], direction: [0, 0, 1] });
            const cornerPointsOriginal = edge.getCornerPointsOfEdgesForShape({ shape: box });
            const cornerPointsTransformed = edge.getCornerPointsOfEdgesForShape({ shape: transformed });

            expect(cornerPointsOriginal).toEqual([
                [-2.5, -5, -3],
                [-2.5, -5, 3],
                [-2.5, 5, 3],
                [-2.5, 5, -3],
                [2.5, -5, -3],
                [2.5, -5, 3],
                [2.5, 5, 3],
                [2.5, 5, -3]
            ]);
            expect(cornerPointsTransformed).toEqual([
                [-2, 0.5, -1],
                [4, 0.5, -1],
                [4, 0.5, 9],
                [-2, 0.5, 9],
                [-2, 5.5, -1],
                [4, 5.5, -1],
                [4, 5.5, 9],
                [-2, 5.5, 9]
            ]);
            box.delete();
            transformed.delete();
        });

        it("should mirror the given shape", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.mirror({ shape: box, direction: [0, 0, 1], origin: [1, 1, -1] });
            const cornerPointsOriginal = edge.getCornerPointsOfEdgesForShape({ shape: box });
            const cornerPointsTransformed = edge.getCornerPointsOfEdgesForShape({ shape: transformed });

            expect(cornerPointsOriginal).toEqual([
                [-2.5, -5, -3],
                [-2.5, -5, 3],
                [-2.5, 5, 3],
                [-2.5, 5, -3],
                [2.5, -5, -3],
                [2.5, -5, 3],
                [2.5, 5, 3],
                [2.5, 5, -3]
            ]);
            expect(cornerPointsTransformed).toEqual([
                [4.5, 7, -3],
                [4.5, 7, 3],
                [4.5, -3, 3],
                [4.5, -3, -3],
                [-0.5, 7, -3],
                [-0.5, 7, 3],
                [-0.5, -3, 3],
                [-0.5, -3, -3]
            ]);
            box.delete();
            transformed.delete();
        });

        it("should mirror along the normal the given shape", () => {
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });
            const transformed = transforms.mirrorAlongNormal({ shape: box, normal: [-1, 1, 1], origin: [1, 3, -1] });
            const cornerPointsOriginal = edge.getCornerPointsOfEdgesForShape({ shape: box });
            const cornerPointsTransformed = edge.getCornerPointsOfEdgesForShape({ shape: transformed });

            expect(cornerPointsOriginal).toEqual([
                [-2.5, -5, -3],
                [-2.5, -5, 3],
                [-2.5, 5, 3],
                [-2.5, 5, -3],
                [2.5, -5, -3],
                [2.5, -5, 3],
                [2.5, 5, 3],
                [2.5, 5, -3]
            ]);
            expect(cornerPointsTransformed).toEqual([
                [-6.833333333333334, -0.6666666666666656, 1.3333333333333344],
                [-2.833333333333334, -4.666666666666666, 3.333333333333333],
                [3.833333333333335, -1.3333333333333361, -3.333333333333335],
                [-0.1666666666666652, 2.666666666666666, -5.333333333333334],
                [-5.166666666666668, 2.6666666666666687, 4.66666666666667],
                [-1.1666666666666679, -1.3333333333333313, 6.666666666666668],
                [5.5, 1.999999999999999, 0],
                [1.5, 6.000000000000001, -2]
            ]);
            box.delete();
            transformed.delete();
        });
    });

    describe("multi shape transforms", () => {
        it("should translate multiple shapes to a new location", () => {
            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.translateShapes({ shapes: [sphere, box], translations: [[1, 1, -1], [1, 2, -2]] });

            const sphereCenter = solid.getSolidCenterOfMass({ shape: sphere });
            const boxCenter = solid.getSolidCenterOfMass({ shape: box });
            const transformedSphereCenter = solid.getSolidCenterOfMass({ shape: transformed[0] });
            const transformedBoxCenter = solid.getSolidCenterOfMass({ shape: transformed[1] });

            expect(sphereCenter[0]).toBeCloseTo(0);
            expect(sphereCenter[1]).toBeCloseTo(3);
            expect(sphereCenter[2]).toBeCloseTo(4);
            expect(boxCenter[0]).toBeCloseTo(0);
            expect(boxCenter[1]).toBeCloseTo(0);
            expect(boxCenter[2]).toBeCloseTo(0);
            expect(transformedSphereCenter[0]).toBeCloseTo(1);
            expect(transformedSphereCenter[1]).toBeCloseTo(4);
            expect(transformedSphereCenter[2]).toBeCloseTo(3);
            expect(transformedBoxCenter[0]).toBeCloseTo(1);
            expect(transformedBoxCenter[1]).toBeCloseTo(2);
            expect(transformedBoxCenter[2]).toBeCloseTo(-2);

            sphere.delete();
            box.delete();
            transformed.forEach(t => t.delete());
        });

        it("should not translate multiple shapes if list lengths are not equal", () => {
            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            expect(() => {
                transforms.translateShapes({ shapes: [sphere, box], translations: [[1, 1, -1]] });
            }).toThrow("Some of the list lengths are not the same. For this operation to work all lists need to be of equal length");

            sphere.delete();
            box.delete();
        });

        it("should rotate multiple shapes", () => {
            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.rotateShapes({ shapes: [sphere, box], axes: [[1, 1, -1], [1, 2, -2]], angles: [64, 32] });
            const transformedSphere = transformed[0];
            const transformedBox = transformed[1];

            const cornerPointsTransformedSphere = edge.getCornerPointsOfEdgesForShape({ shape: transformedSphere });
            const cornerPointsTransformedBox = edge.getCornerPointsOfEdgesForShape({ shape: transformedBox });

            expect(cornerPointsTransformedSphere).toEqual([
                [1.7866764401016106, 2.582870895891986, 0.36954733599359724],
                [5.103770108500441, -4.478415127246328, 6.625354981254111]
            ]);
            expect(cornerPointsTransformedBox).toEqual([
                [-5.0560993579662945, -3.0466085261565237, -2.324658205139671],
                [-3.1390248394915736, -4.511652131539131, 3.1688354487150825],
                [0.7314411528266231, 4.644170624885458, 4.259891201298769],
                [-1.1856333656480973, 6.109214230268066, -1.2336024525559837],
                [-0.7314411528266236, -4.644170624885458, -4.259891201298769],
                [1.1856333656480973, -6.109214230268066, 1.233602452555984],
                [5.0560993579662945, 3.0466085261565237, 2.324658205139671],
                [3.139024839491574, 4.511652131539131, -3.1688354487150825]
            ]);
            sphere.delete();
            box.delete();
            transformed.forEach(t => t.delete());

        });

        it("should rotate multiple shapes in 3D space around centers", () => {
            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.rotateAroundCenterShapes({ shapes: [sphere, box], axes: [[1, 1, -1], [1, 2, -2]], angles: [64, 32], centers: [[1, 0.1, -1], [1, 2.3, -2]] });
            const transformedSphere = transformed[0];
            const transformedBox = transformed[1];

            const cornerPointsTransformedSphere = edge.getCornerPointsOfEdgesForShape({ shape: transformedSphere });
            const cornerPointsTransformedBox = edge.getCornerPointsOfEdgesForShape({ shape: transformedBox });

            expect(cornerPointsTransformedSphere).toEqual([
                [2.4221921821840584, 2.2458935839654326, 0.6680857661494919],
                [5.739285850582889, -4.815392439172882, 6.923893411410006]
            ]);
            expect(cornerPointsTransformedBox).toEqual([
                [-5.17221333773584, -3.021283208849262, -2.3573898777171816],
                [-3.2551388192611195, -4.4863268142318695, 3.136103776137572],
                [0.6153271730570782, 4.669495942192721, 4.227159528721259],
                [-1.3017473454176431, 6.1345395475753275, -1.2663341251334943],
                [-0.8475551325961692, -4.618845307578195, -4.2926228738762795],
                [1.0695193858785517, -6.083888912960802, 1.200870779978474],
                [4.939985378196749, 3.0719338434637864, 2.2919265325621607],
                [3.0229108597220273, 4.536977448846393, -3.2015671212925927]
            ]);
            sphere.delete();
            box.delete();
            transformed.forEach(t => t.delete());
        });

        it("should scale multiple shapes in 3D space with different factors", () => {
            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.scale3dShapes({ shapes: [sphere, box], centers: [[1, 0.1, -1], [1, 2.3, -2]], scales: [[1.3, 2, 4], [2.3, 1.5, 3]] });
            const transformedSphere = transformed[0];
            const transformedBox = transformed[1];

            const cornerPointsTransformedSphere = edge.getCornerPointsOfEdgesForShape({ shape: transformedSphere });
            const cornerPointsTransformedBox = edge.getCornerPointsOfEdgesForShape({ shape: transformedBox });

            expect(cornerPointsTransformedSphere).toEqual([
                [-0.30000000000000115, 5.8999999999999995, -1],
                [-0.29999999999999805, 5.8999999999999995, 39]
            ]);
            expect(cornerPointsTransformedBox).toEqual([
                [-7.049999999999999, -8.649999999999999, -5],
                [-7.049999999999999, -8.649999999999999, 13],
                [-7.049999999999999, 6.3500000000000005, 13],
                [-7.049999999999999, 6.3500000000000005, -5],
                [4.449999999999999, -8.649999999999999, -5],
                [4.449999999999999, -8.649999999999999, 13],
                [4.449999999999999, 6.3500000000000005, 13],
                [4.449999999999999, 6.3500000000000005, -5]
            ]);
            sphere.delete();
            box.delete();
            transformed.forEach(t => t.delete());
        });

        it("should transform multiple shapes", () => {

            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.transformShapes({
                shapes: [sphere, box],
                translations: [[1, 1, -1], [1, 2, -2]],
                scaleFactors: [2.3, 1.5],
                rotationAxes: [[1, 1, -1], [1, 2, -2]],
                rotationAngles: [64, 32]
            });

            const transformedSphere = transformed[0];
            const transformedBox = transformed[1];

            const cornerPointsTransformedSphere = edge.getCornerPointsOfEdgesForShape({ shape: transformedSphere });
            const cornerPointsTransformedBox = edge.getCornerPointsOfEdgesForShape({ shape: transformedBox });

            expect(cornerPointsTransformedSphere).toEqual([
                [5.109355812233703, 6.940603060551568, -0.15004112721472485],
                [12.738671249551015, -9.300354792666553, 14.238316456884455]
            ]);
            expect(cornerPointsTransformedBox).toEqual([
                [-6.584149036949443, -2.5699127892347864, -5.486987307709507],
                [-3.708537259237361, -4.767478197308697, 2.7532531730726237],
                [2.097161729239936, 8.966255937328187, 4.389836801948155],
                [-0.7784500484721462, 11.163821345402097, -3.8504036788339757],
                [-0.09716172923993538, -4.966255937328187, -8.389836801948155],
                [2.778450048472146, -7.163821345402098, -0.14959632116602428],
                [8.584149036949443, 6.569912789234786, 1.4869873077095066],
                [5.70853725923736, 8.767478197308696, -6.753253173072624]
            ]);
            sphere.delete();
            box.delete();
            transformed.forEach(t => t.delete());
        });

        it("should align multiple shapes from one origin and direction to the other", () => {

            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.alignShapes({
                shapes: [sphere, box],
                fromOrigins: [[0, 3, 4], [0, 0, 0]],
                fromDirections: [[0, 0, 1], [0, 0, 1]],
                toOrigins: [[1, 1, -1], [1, 1, -1]],
                toDirections: [[1, 1, 0], [1, 1, 0]]
            });

            const transformedSphere = transformed[0];
            const transformedBox = transformed[1];

            const cornerPointsTransformedSphere = edge.getCornerPointsOfEdgesForShape({ shape: transformedSphere });
            const cornerPointsTransformedBox = edge.getCornerPointsOfEdgesForShape({ shape: transformedBox });

            expect(cornerPointsTransformedSphere).toEqual([
                [-2.535533905932738, -2.5355339059327373, -1],
                [4.535533905932739, 4.535533905932737, -1]
            ]);

            expect(cornerPointsTransformedBox).toEqual([
                [-2.8890872965260113, 0.6464466094067265, 4],
                [1.3535533905932744, 4.889087296526013, 4],
                [1.3535533905932735, 4.889087296526011, -6],
                [-2.8890872965260113, 0.6464466094067265, -6],
                [0.6464466094067265, -2.8890872965260113, 4],
                [4.889087296526013, 1.3535533905932744, 4],
                [4.889087296526011, 1.3535533905932735, -6],
                [0.6464466094067265, -2.8890872965260113, -6]
            ]);

            sphere.delete();
            box.delete();
            transformed.forEach(t => t.delete());
        });

        it("should align and translate multiple shapes", () => {
            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.alignAndTranslateShapes({
                shapes: [sphere, box],
                centers: [[1, 3, 4], [1, 2, -2]],
                directions: [[0, 0, 1], [0, 0, 1]]
            });

            const transformedSphere = transformed[0];
            const transformedBox = transformed[1];

            const cornerPointsTransformedSphere = edge.getCornerPointsOfEdgesForShape({ shape: transformedSphere });
            const cornerPointsTransformedBox = edge.getCornerPointsOfEdgesForShape({ shape: transformedBox });

            expect(cornerPointsTransformedSphere).toEqual([
                [0, 2.999999999999999, 7], [10, 3.0000000000000013, 7]
            ]);

            expect(cornerPointsTransformedBox).toEqual([
                [-2, -0.5, -7],
                [4, -0.5, -7],
                [4, -0.5, 3],
                [-2, -0.5, 3],
                [-2, 4.5, -7],
                [4, 4.5, -7],
                [4, 4.5, 3],
                [-2, 4.5, 3]
            ]);
        });

        it("should scale multiple shapes", () => {

            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.scaleShapes({
                shapes: [sphere, box],
                factors: [2.3, 1.5]
            });

            const transformedSphere = transformed[0];
            const transformedBox = transformed[1];

            const cornerPointsTransformedSphere = edge.getCornerPointsOfEdgesForShape({ shape: transformedSphere });
            const cornerPointsTransformedBox = edge.getCornerPointsOfEdgesForShape({ shape: transformedBox });

            expect(cornerPointsTransformedSphere).toEqual([
                [-2.112515728529184e-15, 6.8999999999999995, -2.3000000000000007],
                [3.5208595475486406e-15, 6.8999999999999995, 20.7]
            ]);

            expect(cornerPointsTransformedBox).toEqual([
                [-3.75, -7.5, -4.5],
                [-3.75, -7.5, 4.5],
                [-3.75, 7.5, 4.5],
                [-3.75, 7.5, -4.5],
                [3.75, -7.5, -4.5],
                [3.75, -7.5, 4.5],
                [3.75, 7.5, 4.5],
                [3.75, 7.5, -4.5]
            ]);

            sphere.delete();
            box.delete();
            transformed.forEach(t => t.delete());

        });

        it("should mirror multiple shapes", () => {

            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.mirrorShapes({
                shapes: [sphere, box],
                directions: [[0, 0, 1], [0, 0, 1]],
                origins: [[1, 1, -1], [1, 1, -1]]
            });

            const transformedSphere = transformed[0];
            const transformedBox = transformed[1];

            const cornerPointsTransformedSphere = edge.getCornerPointsOfEdgesForShape({ shape: transformedSphere });
            const cornerPointsTransformedBox = edge.getCornerPointsOfEdgesForShape({ shape: transformedBox });

            expect(cornerPointsTransformedSphere).toEqual([
                [2.000000000000001, -1, -1], [1.9999999999999984, -1, 9]
            ]);

            expect(cornerPointsTransformedBox).toEqual([
                [4.5, 7, -3],
                [4.5, 7, 3],
                [4.5, -3, 3],
                [4.5, -3, -3],
                [-0.5, 7, -3],
                [-0.5, 7, 3],
                [-0.5, -3, 3],
                [-0.5, -3, -3]
            ]);

            sphere.delete();
            box.delete();
            transformed.forEach(t => t.delete());
        });

        it("should mirror along normal multiple shapes", () => {

            const sphere = solid.createSphere({ radius: 5, center: [0, 3, 4] });
            const box = solid.createBox({ width: 5, height: 10, length: 6, center: [0, 0, 0] });

            const transformed = transforms.mirrorAlongNormalShapes({
                shapes: [sphere, box],
                normals: [[-1, 1, 1], [-1, 1, 1]],
                origins: [[1, 3, -1], [1, 3, -1]]
            });

            const transformedSphere = transformed[0];
            const transformedBox = transformed[1];

            const cornerPointsTransformedSphere = edge.getCornerPointsOfEdgesForShape({ shape: transformedSphere });
            const cornerPointsTransformedBox = edge.getCornerPointsOfEdgesForShape({ shape: transformedBox });

            expect(cornerPointsTransformedSphere).toEqual([
                [0.6666666666666674, 2.3333333333333326, -1.6666666666666674],
                [7.333333333333336, -4.333333333333334, 1.6666666666666652]
            ]);

            expect(cornerPointsTransformedBox).toEqual([
                [-6.833333333333334, -0.6666666666666656, 1.3333333333333344],
                [-2.833333333333334, -4.666666666666666, 3.333333333333333],
                [3.833333333333335, -1.3333333333333361, -3.333333333333335],
                [-0.1666666666666652, 2.666666666666666, -5.333333333333334],
                [-5.166666666666668, 2.6666666666666687, 4.66666666666667],
                [-1.1666666666666679, -1.3333333333333313, 6.666666666666668],
                [5.5, 1.999999999999999, 0],
                [1.5, 6.000000000000001, -2]
            ]);

            sphere.delete();
            box.delete();
            transformed.forEach(t => t.delete());
        });

    });


});
