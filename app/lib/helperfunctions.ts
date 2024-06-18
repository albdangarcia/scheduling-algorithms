import { Process } from "./definitions";

// Returns a random hex color
export const getColor = () => {
  // Generate random values for RGB components within a pastel color range
  const red = Math.floor(Math.random() * 100 + 155);
  const green = Math.floor(Math.random() * 100 + 155);
  const blue = Math.floor(Math.random() * 100 + 155);

  // Convert RGB to hexadecimal format
  const hexColor = `#${red.toString(16)}${green.toString(16)}${blue.toString(
    16
  )}`;

  return hexColor;
};

// Sort any type of array by their property
export function sortByProperty<T>(arr: T[], property: keyof T) {
  arr.sort((a: T, b: T) => {
    const valueA = a[property];
    const valueB = b[property];

    // Handle cases where values might be undefined
    if (valueA === undefined && valueB !== undefined) {
      return 1;
    } else if (valueA !== undefined && valueB === undefined) {
      return -1;
    }

    // If both values are numbers, sort numerically
    if (typeof valueA === "number" && typeof valueB === "number") {
      return valueA - valueB;
    } else {
      // Otherwise, sort lexicographically (alphabetically)
      return valueA < valueB ? -1 : 1;
    }
  });
}

// Round the number to one decimal place
export const roundToTwoDecimals = (num: number) => {
  return Number(Math.round(Number(num + "e+2")) + "e-2");
};


// convert the string arrays to number arrays
export const getProcessesAndTable = (
  arrivalValues: number[],
  burstValues: number[],
  priorityValues: number[] | undefined
) => {
  const processArray: Process[] = [];
  const processTableResults: Process[] = [];

  for (let i = 0; i < arrivalValues.length; i++) {
    let process: Process = {
      id: i,
      arrivalTime: arrivalValues[i],
      burstTime: burstValues[i],
      bgColor: getColor(),
    };
    if (priorityValues) {
      process.priority = priorityValues[i];
    }
    processArray.push(process);
    // push a copy of the process object to processTableResults
    processTableResults.push({...process});
  }
  return { processArray, processTableResults };
};

// Convert the time slice string to a number
export function convertTimeSliceToNum(str: string): number {
  // check if is positive number and return the number
  const num = parseFloat(str.trim());
  if (isNaN(num) || num < 0) {
    throw new Error("Invalid input values");
  }
  // zeros are not allowed for time slice
  if (num === 0) {
    throw new Error("Time slice can't contain a 0 value");
  }
  return num;
}

// Convert the string arrays to number arrays
export function convertToNumArray(str: string, allowZeros: boolean): number[] {
  // Split the string by space, check if is positive number and return the number and convert to number array
  return str
    .trim()
    .split(" ")
    .map((num) => {
      // check is a number and is non-negative
      if (isNaN(parseFloat(num)) || parseFloat(num) < 0) {
        throw new Error("Invalid input values");
      }
      // check if zeros are not allowed and the number is 0
      if (!allowZeros && parseFloat(num) === 0) {
        throw new Error("Burst times can't contain a 0 value");
      }
      return parseFloat(num);
    });
}

// Calculate the averages
export const calculateTotalAverages = (
  totalCompletionTime: number,
  totalTurnAroundTime: number,
  totalWaitingTime: number,
  numberOfProcesses: number
): { [key: string]: number } => {
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
