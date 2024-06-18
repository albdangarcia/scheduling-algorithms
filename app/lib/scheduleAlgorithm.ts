import { calculateTotalAverages, sortByProperty } from "./helperfunctions";
import { GanttProcess, Process } from "./definitions";

// Sort the ready queue by the algorithm
function sortByAlgorithm(readyQueue: Process[], algoName?: string): void {
  if (readyQueue.length > 1) {
    if (algoName && algoName === "sjf") {
      sortByProperty(readyQueue, "burstTime");
    } else if (algoName && algoName === "priority") {
      sortByProperty(readyQueue, "priority"); // sorted in ascending order
    }
  }
}

// Check if any processes have arrived
function processHasArrived(
  processArray: Process[],
  currentTime: number,
  readyQueue: Process[],
  algoName?: string
): void {
  let shouldSort: boolean = false;

  // check if any processes have arrived
  while (
    processArray &&
    processArray.length > 0 &&
    currentTime >= processArray[0].arrivalTime
  ) {
    const processToPush = processArray.shift();

    // push the process to the ready queue
    if (processToPush) {
      readyQueue.push({ ...processToPush });
      shouldSort = true;
    }
  }

  if (shouldSort) {
    sortByAlgorithm(readyQueue, algoName);
  }
}

// Perform the algorithm
// processArray: array of processes to be scheduled
// processTable: dictionary of processes
export const performAlgorithm = (
  processArray: Process[],
  // processTable: { [key: number]: Process },
  processTable: Process[],
  algoName?: string,
  curTimeSlice?: number,
  preemptive?: boolean
): {
  gantt: GanttProcess[];
  totalAverages: {
    [key: string]: number;
  };
} => {
  // sort the processes by arrival time
  sortByProperty(processArray, "arrivalTime");

  // queue to store the processes that have arrived
  const readyQueue: Process[] = [];

  // gantt chart to store the processes
  const gantt: GanttProcess[] = [];

  // let processesIndex: number = 0;
  let currentTime: number = 0;

  // Totals
  let totalCompletionTime: number = 0;
  let totalWaitingTime: number = 0;
  let totalTurnAroundTime: number = 0;

  // Loop until the ready queue is empty or the processes array is empty or
  // the last process in the gantt chart has burst time left
  while (readyQueue.length > 0 || processArray.length > 0) {
    // check if any processes have arrived and update the processIndex
    processHasArrived(processArray, currentTime, readyQueue, algoName);

    // check if the last process from the gantt chart still has burst time left
    // if there is still burst time left then add the process back to the ready queue
    if (preemptive) {
      if (gantt.length > 0 && gantt[gantt.length - 1].burstTime > 0) {
        const lastGanttProcess: Process = gantt[gantt.length - 1];
        readyQueue.push({
          ...lastGanttProcess,
          arrivalTime: currentTime,
        });
        sortByAlgorithm(readyQueue, algoName);
      }
    }

    // check ready queue is not empty
    if (readyQueue.length > 0) {
      let tempSlice: number = 0; // Temp time for the time slice
      const prevTime: number = currentTime; // Store the previous time

      // pop the first process from the ready queue
      const curQueueProcess = readyQueue.shift();

      // throw an error if the curQueueProcess is undefined
      if (!curQueueProcess) {
        throw new Error("The curQueueProcess is undefined");
      }

      // sjf preemptive
      while (
        preemptive &&
        algoName === "sjf" &&
        curQueueProcess.burstTime > 0
      ) {
        curQueueProcess.burstTime -= 1;
        currentTime += 1;

        // check if any processes have arrived
        processHasArrived(processArray, currentTime, readyQueue, algoName);

        // if a process with lower burst time is in the ready queue then break
        if (
          readyQueue.length > 0 &&
          curQueueProcess.burstTime > readyQueue[0].burstTime
        ) {
          break;
        }
      }

      // priority preemptive
      while (
        preemptive &&
        algoName === "priority" &&
        curQueueProcess.burstTime > 0
      ) {
        curQueueProcess.burstTime -= 1;
        currentTime += 1;

        // check if any processes have arrived
        processHasArrived(processArray, currentTime, readyQueue, algoName);

        // if a process with higher priority is in the ready queue then break
        if (
          readyQueue.length > 0 &&
          curQueueProcess.priority &&
          readyQueue[0].priority &&
          curQueueProcess.priority > readyQueue[0].priority
        ) {
          break;
        }
      }

      // round robin preemtive
      // while the process has burst time left and the temp time is less than the time slice
      while (
        algoName === "rr" &&
        curQueueProcess.burstTime > 0
      ) {
        tempSlice += 1;
        curQueueProcess.burstTime -= 1;
        currentTime += 1;
        if (tempSlice === curTimeSlice) {
          break;
        }
      }

      // all non-preemptive
      // while the process has burst time left
      while (!preemptive && curQueueProcess.burstTime > 0) {
        curQueueProcess.burstTime -= 1;
        currentTime += 1;
      }

      // Create a current gantt process from the popped queue process
      const processToAddToGantt: GanttProcess = {
        ...curQueueProcess,
        startTime: prevTime,
        endTime: currentTime,
        animationDuration: currentTime - prevTime,
      };

      // Pointers to the last process in gantt array
      const prevGanttProcess: GanttProcess = gantt[gantt.length - 1];
      // Get the last process end time from the gantt array, if it is undefined then set it to 0
      const prevGanttTime = prevGanttProcess?.endTime ?? 0;

      // If there is idle time between the previous process and the current process
      if (prevGanttTime < processToAddToGantt.startTime) {
        const idleGanttProcess: GanttProcess = {
          id: -1,
          arrivalTime: prevGanttTime,
          burstTime: processToAddToGantt.startTime - prevGanttTime,
          startTime: prevGanttTime,
          endTime: processToAddToGantt.startTime,
          animationDuration: processToAddToGantt.startTime - prevGanttTime,
        };
        // push the idle process to the gantt array
        gantt.push(idleGanttProcess);
      }

      // push the new process to the gantt array
      gantt.push(processToAddToGantt);

      // if the process is finished then calculate the totals
      if (processToAddToGantt.burstTime === 0) {
        
        // Pointer to the process in the processTable
        const curProcessAtTable: Process =
          processTable[processToAddToGantt.id];

        // completion time for the process
        curProcessAtTable.completionTime = processToAddToGantt.endTime;

        // turn around time (turnAroundTime = completionTime - arrivalTime)
        curProcessAtTable.turnAroundTime =
          processToAddToGantt.endTime - curProcessAtTable.arrivalTime;

        // waiting time (waitingTime = turnAroundTime - burstTime)
        curProcessAtTable.waitingTime =
          curProcessAtTable.turnAroundTime -
          curProcessAtTable.burstTime;

        // add the totals
        totalCompletionTime += curProcessAtTable.completionTime;
        totalTurnAroundTime += curProcessAtTable.turnAroundTime;
        totalWaitingTime += curProcessAtTable.waitingTime;
      }
    }
    // otherwise, if the ready queue is empty then keep incrementing the time
    else {
      currentTime += 1; // increment the current time
    }
  }

  // calculate the averages
  const totalAverages = calculateTotalAverages(
    totalCompletionTime,
    totalTurnAroundTime,
    totalWaitingTime,
    processTable.length
  );

  // return the gantt chart and the averages
  return { gantt, totalAverages };
};
