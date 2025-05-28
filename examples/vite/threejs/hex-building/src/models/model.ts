export type Model = {
  uRec: number;
  vRec: number;
  drawEdges: boolean;
  drawFaces: boolean;
  color: string;
  downloadSTL?: () => void;
  downloadStep?: () => void;
  downloadGLTF?: () => void;
};
