import { sortByProperty } from "./helperfunctions";
import {
  GanttProcess,
  Process,
  TotalAveragesRecord,
  TotalAveragesRecordNamesTypes,
} from "./definitions";
import { Algorithm } from "@prisma/client";
import { IDLE_PROCESS_ID } from "./constants";

// ======= Strategy Pattern =======

// --- Strategy Interface ---
export interface ISchedulerStrategy {
  /**
   * Sorts the ready queue according to the algorithm's criteria.
   * FCFS and RR do not need specific sorting beyond arrival.
   * SJF sorts by burst time, Priority sorts by priority level.
   * @param readyQueue The queue of processes ready to run.
   */
  sortReadyQueue(readyQueue: Process[]): void;

  /**
   * Determines how long the current process should run and its state after execution.
   * Handles the core logic for preemption checks, time Quantum completion, or running to completion.
   * @param currentProcess The process selected to run.
   * @param readyQueue The current state of the ready queue (needed for preemption checks by some algorithms).
   * @param currentTime The current simulation time.
   * @param processArray The original array of all processes (sorted by arrival, needed for checking future arrivals in preemptive algorithms).
   * @param timeQuantum Optional time Quantum for Round Robin.
   * @returns An object detailing the execution step:
   * - timeAdvanced: How much simulation time passed during this step.
   * - remainingBurst: The burst time left for the process after this step.
   * - processFinished: Boolean indicating if the process completed its total burst time.
   * - preempted: Boolean indicating if the process was preempted by a higher priority arrival (for P-SJF, P-Priority).
   */
  executeStep(
    currentProcess: Process,
    readyQueue: Readonly<Process[]>, // Readonly to prevent modification here
    currentTime: number,
    processArray: Readonly<Process[]>, // Readonly view of all processes
    timeQuantum?: number
  ): {
    timeAdvanced: number;
    remainingBurst: number;
    processFinished: boolean;
    preempted: boolean; // True if preempted by a new, higher-priority arrival
  };
}

// === Concrete Strategies ===

// FCFS Strategy
export class FCFSStrategy implements ISchedulerStrategy {
  // FCFS does not require sorting the ready queue beyond arrival order.
  sortReadyQueue(readyQueue: Process[]): void {}

  executeStep(currentProcess: Process) {
    // FCFS processes run for their entire remaining burst time.
    const timeAdvanced = currentProcess.burstTime;
    return {
      timeAdvanced: timeAdvanced,
      remainingBurst: 0,
      processFinished: true,
      preempted: false,
    };
  }
}

// SJF Strategy
export class SJFStrategy implements ISchedulerStrategy {
  constructor(private isPreemptive: boolean) {}

  sortReadyQueue(readyQueue: Process[]): void {
    // Sort by burst time (shortest first).
    if (readyQueue.length > 1) {
      sortByProperty(readyQueue, "burstTime");
    }
  }

  executeStep(
    currentProcess: Process,
    readyQueue: Readonly<Process[]>,
    currentTime: number,
    processArray: Readonly<Process[]> // All processes, sorted by arrival
  ) {
    if (!this.isPreemptive) {
      // Non-preemptive: runs for its entire remaining burst time.
      const timeAdvanced = currentProcess.burstTime;
      return {
        timeAdvanced: timeAdvanced,
        remainingBurst: 0,
        processFinished: true,
        preempted: false,
      };
    } else {
      // Preemptive SJF (Shortest Remaining Time First - SRTF)
      const currentBurstRemaining = currentProcess.burstTime;
      let timeAdvanced = currentBurstRemaining; // Assume it runs until completion initially
      let preemptedByArrival = false;

      // Check for preemption by future arrivals.
      // Find the index of the first process arriving at or after currentTime.
      // This avoids re-scanning processes that have already arrived.
      let nextArrivalIdx = processArray.findIndex(
        (p) => p.arrivalTime >= currentTime && p.id !== currentProcess.id // Exclude self if it was put back
      );

      if (nextArrivalIdx !== -1) {
        for (let j = nextArrivalIdx; j < processArray.length; j++) {
          const arrivalCandidate = processArray[j];
          // Only consider candidates arriving *before* current process would finish.
          const timeUntilArrival = arrivalCandidate.arrivalTime - currentTime;

          // If arrival is after current process would finish, no further preemption from later arrivals.
          if (timeUntilArrival >= currentBurstRemaining) {
            break;
          }

          // Current process's burst time remaining at the point of candidate's arrival.
          const currentBurstAtArrival =
            currentBurstRemaining - timeUntilArrival;

          // Preemption Check: Does the arriving process have a shorter burst time?
          if (arrivalCandidate.burstTime < currentBurstAtArrival) {
            // Preemption: current process runs only until this candidate arrives.
            timeAdvanced = timeUntilArrival;
            preemptedByArrival = true;
            // First preempting arrival found (processArray is sorted by arrival); break.
            break;
          }
        }
      }

      // NOTE on preemption by processes already in readyQueue:
      // This strategy assumes the main simulation loop ensures `currentProcess`
      // is the best choice from `readyQueue` *before* `executeStep` is called.
      // Thus, only preemption by a *new* arrival is checked within this step.

      const remainingBurst = currentBurstRemaining - timeAdvanced;
      const processFinished = remainingBurst === 0;

      return {
        timeAdvanced: timeAdvanced,
        remainingBurst: remainingBurst,
        processFinished: processFinished,
        // `preempted` signifies if it stopped due to a future preemption event.
        preempted: preemptedByArrival,
      };
    }
  }
}

// Priority Strategy
export class PriorityStrategy implements ISchedulerStrategy {
  constructor(private isPreemptive: boolean) {}

  // Sort by priority (lower number means higher priority).
  sortReadyQueue(readyQueue: Process[]): void {
    if (readyQueue.length > 1) {
      sortByProperty(readyQueue, "priority");
    }
  }

  executeStep(
    currentProcess: Process,
    readyQueue: Readonly<Process[]>,
    currentTime: number,
    processArray: Readonly<Process[]> // FULL original list, sorted by arrivalTime
  ) {
    if (
      currentProcess.priority === undefined ||
      currentProcess.priority === null
    ) {
      throw new Error(
        `Process ${currentProcess.id} is missing priority for comparison.`
      );
    }

    if (!this.isPreemptive) {
      // Non-preemptive: runs for its entire remaining burst time.
      const timeAdvanced = currentProcess.burstTime;
      return {
        timeAdvanced: timeAdvanced,
        remainingBurst: 0,
        processFinished: true,
        preempted: false,
      };
    } else {
      // Preemptive Priority
      const currentBurstRemaining = currentProcess.burstTime;
      let timeAdvanced = currentBurstRemaining; // Assume it runs until completion initially
      let preemptedByArrival = false;

      // Check for preemption by future arrivals.
      // Find the index of the first process arriving *after* currentTime.
      // processArray is assumed to be sorted by arrivalTime.
      let nextArrivalIdx = processArray.findIndex(
        (p) => p.arrivalTime > currentTime && p.id !== currentProcess.id
      );

      if (nextArrivalIdx !== IDLE_PROCESS_ID) {
        for (let j = nextArrivalIdx; j < processArray.length; j++) {
          const arrivalCandidate = processArray[j];
          const timeUntilArrival = arrivalCandidate.arrivalTime - currentTime;

          if (
            arrivalCandidate.priority === undefined ||
            arrivalCandidate.priority === null
          ) {
            console.warn(
              `Skipping arrival candidate ${arrivalCandidate.id} for preemption check due to missing priority.`
            );
            continue;
          }

          // If arrival is after current process would finish, no further preemption from later arrivals.
          if (timeUntilArrival >= currentBurstRemaining) {
            break;
          }

          // Preemption Check: Does the arriving process have a higher priority?
          if (arrivalCandidate.priority < currentProcess.priority) {
            // Preemption will occur; this is the earliest higher-priority arrival.
            timeAdvanced = timeUntilArrival;
            preemptedByArrival = true;
            // First preempting arrival found; update timeAdvanced and break.
            break;
          }
        }
      }

      // NOTE on preemption by processes already in readyQueue:
      // Similar to P-SJF, this strategy assumes the main simulation loop ensures
      // `currentProcess` has the highest priority from `readyQueue` *before* `executeStep`.
      // Only preemption by a *new* arrival is checked here.

      const remainingBurst = currentBurstRemaining - timeAdvanced;
      const processFinished = remainingBurst === 0;

      return {
        timeAdvanced: timeAdvanced,
        remainingBurst: remainingBurst,
        processFinished: processFinished,
        // `preempted` indicates if stopped due to a higher-priority arrival.
        preempted: preemptedByArrival,
      };
    }
  }
}

// Round Robin Strategy
export class RRStrategy implements ISchedulerStrategy {
  // RR does not require specific sorting of the ready queue beyond arrival order.
  sortReadyQueue(readyQueue: Process[]): void {}

  /**
   * Executes a step for Round Robin.
   * Process runs for its time Quantum or until completion, whichever is shorter.
   * @param currentProcess The process selected to run.
   * @param readyQueue Unused directly in RR step calculation.
   * @param currentTime Unused directly in RR step calculation.
   * @param processArray Unused directly in RR step calculation.
   * @param timeQuantum The time quantum for Round Robin. MUST be provided.
   * @returns Execution step details.
   */
  executeStep(
    currentProcess: Process,
    readyQueue: Readonly<Process[]>, // Not used by RR for this step's calculation
    currentTime: number, // Not used by RR for this step's calculation
    processArray: Readonly<Process[]>, // Not used by RR for this step's calculation
    timeQuantum?: number
  ): {
    timeAdvanced: number;
    remainingBurst: number;
    processFinished: boolean;
    preempted: boolean; // Always false; RR preemption is by time quantum, not by new higher-priority arrivals.
  } {
    if (timeQuantum === undefined || timeQuantum === null || timeQuantum <= 0) {
      throw new Error(
        "Time quantum must be defined and positive for Round Robin."
      );
    }

    const currentBurst = currentProcess.burstTime;
    // Process runs for the minimum of its remaining burst or the time quantum.
    const timeToRun = Math.min(currentBurst, timeQuantum);

    const timeAdvanced = timeToRun;
    const remainingBurst = currentBurst - timeAdvanced;
    const processFinished = remainingBurst === 0;

    return {
      timeAdvanced,
      remainingBurst,
      processFinished,
      preempted: false, // `preempted` flag refers to preemption by new arrivals.
    };
  }
}

// Factory function to get the appropriate scheduling strategy.
export function getSchedulerStrategy(
  algorithm: Algorithm,
  isPreemptive: boolean
): ISchedulerStrategy {
  switch (algorithm) {
    case Algorithm.fcfs:
      return new FCFSStrategy();
    case Algorithm.sjf:
      return new SJFStrategy(isPreemptive);
    case Algorithm.priority:
      return new PriorityStrategy(isPreemptive);
    case Algorithm.rr:
      // RR is inherently preemptive by time quantum.
      return new RRStrategy();
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}

// Checks for processes that have arrived by the current time and adds them to the ready queue.
function processHasArrived(
  processArray: Process[], // Mutable array of processes yet to arrive
  currentTime: number,
  readyQueue: Process[] // Mutable ready queue
): boolean {
  let addedProcess = false;
  // Peek and check condition before removing from processArray.
  while (
    processArray.length > 0 &&
    currentTime >= processArray[0].arrivalTime
  ) {
    const processToPush = processArray.shift(); // Remove from original array
    if (processToPush) {
      readyQueue.push({ ...processToPush }); // Add a copy to ready queue
      addedProcess = true;
    }
  }
  return addedProcess; // Returns true if any process was added to readyQueue
}

interface PerformAlgorithmProps {
  processArrayInput: Readonly<Process[]>; // Input processes, read-only for safety
  processTable: Process[]; // Original process objects; will be updated with results
  algorithmSelected: Algorithm;
  curTimeQuantum?: number;
  isPreemptive: boolean;
}

interface PerformAlgorithmReturn {
  gantt: GanttProcess[];
  totalAverages: Record<TotalAveragesRecordNamesTypes, number>;
}

// Main simulation function
export const performAlgorithm = ({
  processArrayInput,
  processTable, // This array's objects are updated with metrics
  algorithmSelected,
  curTimeQuantum,
  isPreemptive,
}: PerformAlgorithmProps): PerformAlgorithmReturn => {
  // Map for quick access to original process objects in processTable for updating metrics.
  const processMap = new Map<number, Process>();
  for (const p of processTable) {
    // Store references to objects in processTable for direct metric updates.
    processMap.set(p.id, p);
  }

  // Create a mutable copy of input processes for the simulation to consume.
  const processArray = processArrayInput.map((p) => ({ ...p }));
  sortByProperty(processArray, "arrivalTime"); // Sort by arrival time.

  // Create a read-only copy for strategies that need to look ahead for arrivals.
  const processArrayReadOnly = processArrayInput.map((p) => ({ ...p }));
  sortByProperty(processArrayReadOnly, "arrivalTime");

  const readyQueue: Process[] = [];
  const gantt: GanttProcess[] = [];
  let currentTime: number = 0;
  let totalCompletionTime: number = 0;
  let totalWaitingTime: number = 0;
  let totalTurnAroundTime: number = 0;

  const strategy = getSchedulerStrategy(algorithmSelected, isPreemptive);
  const processesToRequeue: Process[] = []; // For processes that ran but didn't finish (e.g., RR, preempted)

  // Main Simulation Loop
  while (
    processArray.length > 0 || // Processes yet to arrive
    readyQueue.length > 0 || // Processes ready to run
    processesToRequeue.length > 0 // Processes to put back in ready queue
  ) {
    // Add newly arrived processes to the ready queue.
    processHasArrived(processArray, currentTime, readyQueue);

    // Add processes that were preempted or finished a time quantum back to ready queue.
    readyQueue.push(...processesToRequeue);
    processesToRequeue.length = 0; // Clear the requeue list.

    // Sort ready queue based on the selected algorithm's criteria.
    strategy.sortReadyQueue(readyQueue);

    if (readyQueue.length > 0) {
      const currentProcess = readyQueue.shift(); // Get the next process to run.
      if (!currentProcess) continue; // Should not happen if length > 0

      const prevTime = currentTime;

      // Get original data for calculation reference, especially original burst time.
      const originalProcessData = processMap.get(currentProcess.id);
      if (!originalProcessData) {
        console.error(
          `Original data for process ID ${currentProcess.id} not found in processMap.`
        );
        continue;
      }
      // isFirstRunOfProcess is used to determine effectiveArrivalTime for Gantt chart for preempted processes
      const isFirstRunOfProcess =
        currentProcess.burstTime === originalProcessData.burstTime;

      const executionResult = strategy.executeStep(
        currentProcess,
        readyQueue, // Pass read-only readyQueue for preemption checks by strategy
        currentTime,
        processArrayReadOnly, // Pass all processes for preemption checks by strategy
        curTimeQuantum
      );

      currentTime += executionResult.timeAdvanced;

      // For Gantt chart, if process was preempted, its "arrival" for subsequent runs is effectively `currentTime`.
      const effectiveGanttArrivalTime = isFirstRunOfProcess
        ? originalProcessData.arrivalTime
        : prevTime; // If not first run, it "arrived" back in queue at prevTime or effectively started now.

      const ganttEntry: GanttProcess = {
        id: currentProcess.id,
        bgColor: currentProcess.bgColor,
        priority: currentProcess.priority,
        arrivalTime: effectiveGanttArrivalTime, // Effective arrival for this Gantt segment
        burstTime: executionResult.remainingBurst, // Remaining burst for the process overall
        startTime: prevTime,
        endTime: currentTime,
        animationDuration: executionResult.timeAdvanced,
      };

      // Add idle time to Gantt chart if there's a gap.
      const lastGanttEndTime =
        gantt.length > 0 ? gantt[gantt.length - 1].endTime : 0;
      if (ganttEntry.startTime > lastGanttEndTime) {
        const idleGanttProcess: GanttProcess = {
          id: IDLE_PROCESS_ID,
          arrivalTime: lastGanttEndTime, // Idle starts when last process ended
          burstTime: ganttEntry.startTime - lastGanttEndTime, // Duration of idle
          startTime: lastGanttEndTime,
          endTime: ganttEntry.startTime,
          animationDuration: ganttEntry.startTime - lastGanttEndTime,
        };
        gantt.push(idleGanttProcess);
      }
      gantt.push(ganttEntry);

      if (executionResult.processFinished) {
        // Retrieve the process from processTable via processMap to update its metrics.
        const tableProcess = processMap.get(currentProcess.id);
        if (tableProcess) {
          const completionTime = currentTime;
          // Turnaround and Waiting times are based on original arrival and burst times.
          const turnAroundTime = completionTime - tableProcess.arrivalTime;
          const waitingTime = turnAroundTime - tableProcess.burstTime;

          // Update metrics directly on the object from processTable.
          tableProcess.completionTime = completionTime;
          tableProcess.turnAroundTime = turnAroundTime;
          tableProcess.waitingTime = waitingTime;

          totalCompletionTime += completionTime;
          totalTurnAroundTime += turnAroundTime;
          totalWaitingTime += waitingTime;
        } else {
          console.error(
            `Process ID ${currentProcess.id} not found in processMap for metrics update.`
          );
        }
      } else {
        // Process did not finish, update its remaining burst time and requeue.
        currentProcess.burstTime = executionResult.remainingBurst;
        processesToRequeue.push(currentProcess);
      }
    } else if (processArray.length > 0) {
      // Ready queue is empty, but processes are still waiting to arrive. Advance time.
      const nextArrivalTime = processArray[0].arrivalTime;
      if (nextArrivalTime > currentTime) {
        const lastGanttEndTime =
          gantt.length > 0 ? gantt[gantt.length - 1].endTime : 0;

        // If currentTime is already past the last Gantt block's end and before the next arrival,
        // create an idle block from currentTime up to nextArrivalTime.
        if (currentTime > lastGanttEndTime && currentTime < nextArrivalTime) {
          const idleGanttProcess: GanttProcess = {
            id: IDLE_PROCESS_ID,
            arrivalTime: currentTime, // Idle block starts now
            burstTime: nextArrivalTime - currentTime,
            startTime: currentTime,
            endTime: nextArrivalTime,
            animationDuration: nextArrivalTime - currentTime,
          };
          gantt.push(idleGanttProcess);
          // If the last Gantt block ended before the next arrival, and currentTime is not yet past it,
          // create an idle block from lastGanttEndTime to nextArrivalTime.
        } else if (
          lastGanttEndTime < nextArrivalTime &&
          currentTime <= lastGanttEndTime
        ) {
          const idleGanttProcess: GanttProcess = {
            id: IDLE_PROCESS_ID,
            arrivalTime: lastGanttEndTime, // Idle starts from end of last process
            burstTime: nextArrivalTime - lastGanttEndTime,
            startTime: lastGanttEndTime,
            endTime: nextArrivalTime,
            animationDuration: nextArrivalTime - lastGanttEndTime,
          };
          gantt.push(idleGanttProcess);
        }
        currentTime = nextArrivalTime; // Advance time to the next arrival.
      }
    }
    // Loop terminates if processArray, readyQueue, and processesToRequeue are all empty.
  }

  const totalAverages = calculateTotalAverages(
    totalCompletionTime,
    totalTurnAroundTime,
    totalWaitingTime,
    processTable.length // Use the count of original processes for average calculation.
  );
  return { gantt, totalAverages };
};

// Calculates average completion, turnaround, and waiting times.
export const calculateTotalAverages = (
  totalCompletionTime: number,
  totalTurnAroundTime: number,
  totalWaitingTime: number,
  numberOfProcesses: number
): TotalAveragesRecord => {
  if (numberOfProcesses <= 0) {
    // Avoid division by zero; return zeros if no processes.
    return {
      completionTimeAverage: 0,
      turnAroundTimeAverage: 0,
      waitingTimeAverage: 0,
    };
  }
  return {
    completionTimeAverage: roundToTwoDecimals(
      totalCompletionTime / numberOfProcesses
    ),
    turnAroundTimeAverage: roundToTwoDecimals(
      totalTurnAroundTime / numberOfProcesses
    ),
    waitingTimeAverage: roundToTwoDecimals(
      totalWaitingTime / numberOfProcesses
    ),
  };
};

// Rounds the number to two decimal places.
export const roundToTwoDecimals = (num: number) => {
  // Handles potential floating point inaccuracies with round.
  return Number(Math.round(Number(num + "e+2")) + "e-2");
};
