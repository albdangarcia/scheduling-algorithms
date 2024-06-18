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
export interface ScheduleInputTypes {
  arrivalTimeValues: string;
  burstTimeValues: string;
  priorityValues?: string;
  timeSlice?: string;
}

export interface ScheduleType {
  id: number;
  name: string;
  abbr: string;
}

// results section types
export interface ResultsSectionTypes {
  ganttChartData: GanttProcess[];
  processTableData: Process[];
  totalAverages: { [key: string]: number };
}

export interface InputStrArrayType {
  arrivalTimeValues: string[];
  burstTimeValues: string[];
  priorityValues?: string[] | undefined;
  timeSlice?: string[] | undefined;
}

export type RadioOptionType = {
  id: number;
  name: string;
  text: string;
};