export type Model = {
  cupHeight: number;
  cupRadius: number;
  cupThickness: number;
  cupHandleDistance: number;
  cupHandleHeight: number;
  color: string;
  downloadSTL?: () => void;
  downloadStep?: () => void;
};
