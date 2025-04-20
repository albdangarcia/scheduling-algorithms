// process interface
export interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  bgColor?: string;
  priority?: number;
  completionTime?: number;
  waitingTime?: number;
  turnAroundTime?: number;
}

// gantt process that extends the process interface
export interface GanttProcess extends Process {
  startTime: number;
  endTime: number;
  animationDuration: number;
}

// schedule input types
export interface PropsScheduleInputTypes {
  arrivalTimeValues: string;
  burstTimeValues: string;
  priorityValues?: string;
  timeSlice?: string;
}

// results section types
export interface ResultsSectionTypes {
  ganttChartData: GanttProcess[];
  processTableData: Process[];
  totalAverages: TotalAveragesRecord;
}
export type TotalAveragesRecord = Record<TotalAveragesRecordNamesTypes, number>;
export const TotalAveragesRecordNames = [
  "completionTimeAverage",
  "turnAroundTimeAverage",
  "waitingTimeAverage",
] as const;
export type TotalAveragesRecordNamesTypes =
  (typeof TotalAveragesRecordNames)[number];

export interface InputStrArrayType {
  arrivalTimeValues: string[];
  burstTimeValues: string[];
  priorityValues?: string[] | undefined;
  timeSlice?: string[] | undefined;
}

export type RadioOptionType = {
  name: string;
  description: string;
};

export const preemptiveOptions = ["nonpreemptive", "preemptive"] as const;
export type PreemptiveOptionsTypes = (typeof preemptiveOptions)[number];

export const scheduleKeys = ["fcfs", "sjf", "rr", "priority"] as const;
export type ScheduleKeysTypes = (typeof scheduleKeys)[number];

export interface ScheduleType {
  longName: ScheduleLongName;
}
export type ScheduleLongName =
  | "First Come First Served"
  | "Shortest Job First"
  | "Round Robin"
  | "Priority";

export interface GenerateFunctionProps {
  arrivalValues: number[];
  burstValues: number[];
  priorityValues: number[] | undefined;
  timeSlice: number | undefined;
  algorithm: ScheduleKeysTypes;
  isPreemptive: boolean;
}
export type GenerateFunction = (args: GenerateFunctionProps) => void;

export interface CalculationType {
  id: number;
  dropDownIndexOption: ScheduleKeysTypes;
  title: ScheduleKeysTypes;
  values: PropsScheduleInputTypes;
  selectedRadioButtonOption: PreemptiveOptionsTypes;
}