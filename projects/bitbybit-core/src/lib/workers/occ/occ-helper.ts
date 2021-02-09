
export class OccHelper {

    constructor(private readonly occ) {
    }

    gpAx2(point: number[], direction: number[]): any {
        return new this.occ.gp_Ax2_3(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpPnt(point: number[]): any {
        return new this.occ.gp_Pnt_3(point[0], point[1], point[2]);
    }

    gpDir(direction: number[]): any {
        return new this.occ.gp_Dir_4(direction[0], direction[1], direction[2]);
    }

    gcMakeCircle(center: number[], direction: number[], radius: number): any {
        return new this.occ.GC_MakeCircle_2(this.gpAx2(center, direction), radius).Value();
    }

    bRepBuilderAPIMakeEdge(curve: any): any {
        return new this.occ.BRepBuilderAPI_MakeEdge_24(this.castHandleGeomCurve(curve)).Edge();
    }

    bRepBuilderAPIMakeWire(edge: any): any {
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    bRepBuilderAPIMakeShell(face: any): any {
        // TODO come back to this later to get UVBounds before creating a surface. Now faces converted
        // to a surface and eventually to a shell get no bounds
        // const uMin = new this.occ.TDataStd_Real();
        // const uMax = new this.occ.TDataStd_Real();
        // const vMin = new this.occ.TDataStd_Real();
        // const vMax = new this.occ.TDataStd_Real();
        // this.occ.BRepTools.UVBounds_1(face, uMin, uMax, vMin, vMax);
        // const srf = this.occ.BRep_Tool.Surface_3(face, uMin.Value(), uMax.Value(), vMin.Value(), vMax.Value());
        const srf = this.occ.BRep_Tool.Surface_2(face);
        const d = new this.occ.BRepBuilderAPI_MakeShell_2(
            srf,
            false);
        const x = d.Shell();
        return x;
    }

    bRepBuilderAPIMakeFace(wire: any, planar: boolean): any {
        return new this.occ.BRepBuilderAPI_MakeFace_15(wire, planar).Face();
    }

    bRepPrimAPIMakeSphere(center: number[], direction: number[], radius: number): any {
        const ax = this.gpAx2(center, direction);
        return new this.occ.BRepPrimAPI_MakeSphere_9(ax, radius).Shape();
    }

    bRepPrimAPIMakeCylinder(center: number[], direction: number[], radius, height): any {
        const ax = this.gpAx2(center, direction);
        return new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, height).Shape();
    }

    bRepPrimAPIMakeBox(width: number, length: number, height: number, center: number[]): any {
        const pt = this.gpPnt([
            -width / 2 + center[0],
            -height / 2 + center[1],
            -length / 2 + center[2]
        ]);
        return new this.occ.BRepPrimAPI_MakeBox_2(pt, width, height, length).Shape();
    }

    castHandleGeomCurve(curve: any): any {
        return new this.occ.Handle_Geom_Curve_2(curve.get());
    }
}

