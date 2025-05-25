import { Process } from "./definitions";

/**
 * Generates a random pastel hex color.
 * @returns A string representing a random hex color.
 */
export const getColor = (): string => {
  // Generate random values for RGB components within a pastel color range (155-255)
  const red = Math.floor(Math.random() * 100 + 155);
  const green = Math.floor(Math.random() * 100 + 155);
  const blue = Math.floor(Math.random() * 100 + 155);

  // Convert RGB to hexadecimal format, ensuring two digits per component
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  const hexColor = `#${toHex(red)}${toHex(green)}${toHex(blue)}`;

  return hexColor;
};

/**
 * Sorts an array of objects in place by a specified property.
 * @param arr The array to sort.
 * @param property The property to sort by.
 */
export function sortByProperty<T>(arr: T[], property: keyof T): void {
  arr.sort((a: T, b: T) => {
    const valueA = a[property];
    const valueB = b[property];

    // Handle undefined values: undefined values are sorted to the end.
    if (valueA === undefined && valueB !== undefined) {
      return 1;
    }
    if (valueA !== undefined && valueB === undefined) {
      return -1;
    }
    if (valueA === undefined && valueB === undefined) {
      return 0;
    }

    // Sort numerically if both values are numbers.
    if (typeof valueA === "number" && typeof valueB === "number") {
      return valueA - valueB;
    }

    // Otherwise, sort lexicographically (case-sensitive).
    // Consider converting to a consistent case if case-insensitive sort is needed.
    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0; // Elements are equal
  });
}

interface GetProcessesReturnType {
  processArray: Process[];
  processTableResults: Process[];
}

interface GetProcessesParams {
  arrivalValues: number[];
  burstValues: number[];
  priorityValues?: number[]; // Optional priority values
}

/**
 * Creates an array of Process objects from input arrays.
 * @param params Object containing arrivalValues, burstValues, and optional priorityValues.
 * @returns An object containing two arrays: processArray and processTableResults.
 * @throws Error if input array lengths do not match.
 */
export const getProcesses = ({
  arrivalValues,
  burstValues,
  priorityValues,
}: GetProcessesParams): GetProcessesReturnType => {
  const n = arrivalValues.length;
  // Validate that burstValues has the same length as arrivalValues.
  if (burstValues.length !== n) {
    throw new Error(
      "Arrival times and burst times must have the same number of values."
    );
  }
  // Validate priorityValues length only if it's provided.
  if (priorityValues && priorityValues.length !== n) {
    throw new Error(
      "Priority values, when provided, must have the same number of values as arrival/burst times."
    );
  }

  // Initialize arrays to hold Process objects.
  const processArray: Process[] = [];
  const processTableResults: Process[] = [];

  for (let i = 0; i < n; i++) {
    const baseProcess: Process = {
      id: i, // Using array index as ID.
      arrivalTime: arrivalValues[i],
      burstTime: burstValues[i],
      bgColor: getColor(),
    };

    // Assign priority if provided.
    if (priorityValues) {
      baseProcess.priority = priorityValues[i];
    }

    processArray.push(baseProcess);

    // Creates a new Process object. Since all properties in the Process interface
    // are currently primitive types (number, string), this shallow copy
    // effectively results in an independent object, functionally equivalent to
    // a deep copy in this specific context. If the Process interface were to include
    // object or array properties in the future, this line would need to be
    // re-evaluated to ensure true deep cloning if full independence of nested
    // structures is still required for processTableResults.
    processTableResults.push({ ...baseProcess });
  }

  return { processArray, processTableResults };
};
