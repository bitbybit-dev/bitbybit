import { Injectable } from '@angular/core';
import { Context } from '../../context';

@Injectable()
export class OCCService {

    constructor(private readonly c: Context) {
    }

    gpAx2(point: number[], direction: number[]): any {
        return new this.c.occ.gp_Ax2_3(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpPnt(point: number[]): any {
        return new this.c.occ.gp_Pnt_3(point[0], point[1], point[2]);
    }

    gpDir(direction: number[]): any {
        return new this.c.occ.gp_Dir_4(direction[0], direction[1], direction[2]);
    }

    gcMakeCircle(center: number[], direction: number[], radius: number): any {
        return new this.c.occ.GC_MakeCircle_2(this.gpAx2(center, direction), radius).Value();
    }

    bRepBuilderAPIMakeEdge(curve: any): any {
        return new this.c.occ.BRepBuilderAPI_MakeEdge_24(this.castHandleGeomCurve(curve)).Edge();
    }

    bRepBuilderAPIMakeWire(edge: any): any {
        return new this.c.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    bRepBuilderAPIMakeFace(wire: any, planar: boolean): any {
        return new this.c.occ.BRepBuilderAPI_MakeFace_15(wire, planar).Face();
    }

    bRepPrimAPIMakeSphere(center: number[], direction: number[], radius: number): any {
        const ax = this.gpAx2(center, direction);
        return new this.c.occ.BRepPrimAPI_MakeSphere_9(ax, radius).Shape();
    }

    bRepPrimAPIMakeCylinder(center: number[], direction: number[], radius, height): any {
        const ax = this.gpAx2(center, direction);
        return new this.c.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, height).Shape();
    }

    bRepPrimAPIMakeBox(width: number, length: number, height: number, center: number[]): any {
        const pt = this.gpPnt([
            -width / 2 + center[0],
            -height / 2 + center[1],
            -length / 2 + center[2]
        ]);
        return new this.c.occ.BRepPrimAPI_MakeBox_2(pt, width, height, length).Shape();
    }

    castHandleGeomCurve(curve: any): any {
        return new this.c.occ.Handle_Geom_Curve_2(curve.get());
    }
}
