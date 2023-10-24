export enum SimulationStatus {
  Stopped = 1,
  PreProcessing = 2,
  Simulating = 3,
  PostProcessing = 4,
  Finished = 5,
  Error = 6,
}

export class SimulationModel {
  id?: number;
  progress?: number;
  status?: number;
  input_video_path?: string;
  output_video_path?: string;
}
