import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class ManifoldTransforms {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    scale3D(inputs: Inputs.Manifold.Scale3DDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.scale(inputs.vector);
    }

    scale(inputs: Inputs.Manifold.Scale3DDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.scale(inputs.vector);
    }

    mirror(inputs: Inputs.Manifold.MirrorDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.mirror(inputs.normal);
    }

    translate(inputs: Inputs.Manifold.TranslateDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.translate(inputs.vector);
    }

    translateByVectors(inputs: Inputs.Manifold.TranslateByVectorsDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.vectors.map(vector => {
            return inputs.manifold.translate(vector);
        });
    }

    rotate(inputs: Inputs.Manifold.RotateDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.rotate(inputs.vector);
    }

    rotateXYZ(inputs: Inputs.Manifold.RotateXYZDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.rotate(inputs.x, inputs.y, inputs.z);
    }

    translateXYZ(inputs: Inputs.Manifold.TranslateXYZDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.translate(inputs.x, inputs.y, inputs.z);
    }

    transform(inputs: Inputs.Manifold.TransformDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.transform(inputs.transform);
    }

    transforms(inputs: Inputs.Manifold.TransformsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        let currentShape = inputs.manifold;
        //potentially leaks in betweens...
        const transformedShapes: Manifold3D.Manifold[] = [];
        inputs.transforms.forEach(transform => {
            currentShape = currentShape.transform(transform);
            transformedShapes.push(currentShape);
        });
        const res = transformedShapes.pop();
        transformedShapes.forEach(shape => {
            shape.delete();
        });
        return res;
    }
}
