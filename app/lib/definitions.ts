import { Preemption, Algorithm } from '@prisma/client';

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
  timeQuantum?: string;
}

// results section types
export interface ResultsSectionTypes {
  uniqueId: string;
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
  timeQuantum?: string[] | undefined;
}

export type RadioOptionType = {
  name: string;
  description: string;
};

export interface ScheduleType {
  longName: ScheduleLongName;
  shortDescription?: string 
  description: string;
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
  timeQuantum: number | undefined;
  algorithm: Algorithm;
  isPreemptive: boolean;
}
export type GenerateFunction = (args: GenerateFunctionProps) => void;

// Recent saved inputs interface
export interface RecentRecordsType {
  id: string;
  algorithmSelected: Algorithm;
  preemption: Preemption;
  arrivalValues: string;
  burstValues: string;
  priorityValues: string | null;
  timeQuantum: number | null;
}

export interface PaginatedRecentRecordsResponse {
  records: RecentRecordsType[];
  hasMore: boolean;
}

export interface AssignRefParams {
  type: "wrapper" | "content";
  index: number;
  el: HTMLSpanElement | null;
}
