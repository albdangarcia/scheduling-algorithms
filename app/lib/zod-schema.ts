import { z } from "zod";
import { ResultsSectionTypes } from "./definitions";
import { Algorithm, Preemption } from "@prisma/client";

const MAX_PROCESS_INPUT_LENGTH = 20;

/**
 * Parses a string of space-separated numbers into an array of numbers.
 * @param input The string input (e.g., "1 2 3"). Can be undefined, null, or empty.
 * @param options Configuration for parsing.
 * @param options.allowZeros Whether zero values are permitted.
 * @param options.context A string descriptor for the type of values being parsed (e.g., "Arrival Times"), used in error messages.
 * @param options.maxLength Optional maximum number of values allowed.
 * @returns An array of numbers. Returns an empty array if input is empty, null, or undefined.
 * @throws Error if validation fails (e.g., non-numeric parts, too many values, disallowed zero).
 */
const parseNumberString = (
  input: string | undefined | null,
  options: {
    allowZeros: boolean;
    context: string;
    maxLength?: number;
  }
): number[] => {
  // Return empty array for empty, null, or undefined inputs
  if (input === undefined || input === null || input.trim() === "") {
    return [];
  }

  const parts = input.trim().split(/\s+/); // Split by one or more spaces
  const numbers: number[] = [];

  // Validate maximum number of inputs
  if (options.maxLength !== undefined && parts.length > options.maxLength) {
    throw new Error(
      `${options.context}: Too many values provided. Maximum allowed is ${options.maxLength}.`
    );
  }

  for (const part of parts) {
    const num = Number(part);

    // Validate each part is a non-negative finite number
    if (isNaN(num) || !Number.isFinite(num) || num < 0) {
      throw new Error(
        `${options.context}: Invalid value "${part}". Only non-negative numbers are allowed.`
      );
    }
    // Validate against zeros if not allowed
    if (!options.allowZeros && num === 0) {
      throw new Error(`${options.context}: Zero values are not allowed.`);
    }
    numbers.push(num);
  }
  return numbers;
};

// --- Base Schema for Raw String Inputs from the Form ---
// This schema defines the shape and basic validation for raw string inputs.
const RawFormSchema = z.object({
  algorithmSelected: z.enum(Algorithm, {
      error: (issue) => issue.input === undefined ? "Algorithm selection is required." : "Invalid algorithm selected."
}),
  preemption: z.enum(Preemption, {
      error: (issue) => issue.input === undefined ? "Preemption option is required." : "Invalid preemption option selected."
}),
  // Arrival times: required, non-empty string of numbers and spaces
  arrivalTimeValues: z
    .string({
        error: (issue) => issue.input === undefined ? "Arrival times are required." : undefined
    })
    .min(1, "Arrival times cannot be empty.")
    .regex(/^[0-9\s]*$/, "Arrival Times must contain only numbers and spaces.")
    .trim(), // Trim whitespace
  // Burst times: required, non-empty string of numbers and spaces
  burstTimeValues: z
    .string({
        error: (issue) => issue.input === undefined ? "Burst times are required." : undefined
    })
    .min(1, "Burst times cannot be empty.")
    .regex(/^[0-9\s]*$/, "Burst Times must contain only numbers and spaces.")
    .trim(), // Trim whitespace
  // Priority values: optional string of numbers and spaces.
  // Null or empty string will be transformed to undefined.
  priorityValues: z.preprocess(
    (val) => (val === null ? undefined : val), // Convert null to undefined
    z
      .string()
      .regex(
        /^[0-9\s]*$/,
        "Priority Times must contain only numbers and spaces."
      )
      .optional()
      .transform((val) => (val === "" ? undefined : val)) // Convert empty string to undefined
  ),
  // Time quantum
  // Null or empty string will be transformed to undefined.
  timeQuantum: z.preprocess(
    (val) => (val === null ? undefined : val), // Convert null to undefined initially
    z
      .string()
      .refine(
        (val) => {
          if (val === undefined || val === "") return true;
          // If the string is not empty, it must consist of one or more digits ONLY.
          return /^\d+$/.test(val); // Ensures "123" is valid, but " 123", "123 ", "abc", "1.2" are not.
        },
        {
            error: "Time Quantum must contain only digits (e.g., '100' or '42') and no spaces or other characters."
        }
      )
      .optional() // Makes the field itself optional in the raw input object.
      .transform((val) => (val === "" ? undefined : val)) // Transforms an empty string to undefined.
  ),
});

// --- Transformed and Refined Schema ---
// This schema takes the raw string inputs, transforms them into their correct data types (e.g., number arrays),
// and applies more complex cross-field validations.
export const CreateFormSchema = RawFormSchema.transform((data, ctx) => {
  // Initialize variables for transformed values
  let arrivalTimes: number[] = [];
  let burstTimes: number[] = [];
  let priorityValues: number[] | undefined = undefined;
  let timeQuantum: number | undefined = undefined;

  // Parse arrival times string into a number array
  try {
    arrivalTimes = parseNumberString(data.arrivalTimeValues, {
      allowZeros: true, // Zeros are allowed for arrival times
      context: "Arrival Times",
      maxLength: MAX_PROCESS_INPUT_LENGTH, // Max 20 processes input
    });
  } catch (e: any) {
    ctx.addIssue({
      code: "custom",
      path: ["arrivalTimeValues"],
      message: e.message,
    });
  }

  // Parse burst times string into a number array
  try {
    burstTimes = parseNumberString(data.burstTimeValues, {
      allowZeros: false, // Zeros are not allowed for burst times
      context: "Burst Times",
      maxLength: MAX_PROCESS_INPUT_LENGTH, // Max 20 processes
    });
  } catch (e: any) {
    ctx.addIssue({
      code: "custom",
      path: ["burstTimeValues"],
      message: e.message,
    });
  }

  // Parse priority values string into a number array, if provided
  if (data.priorityValues !== undefined) {
    try {
      priorityValues = parseNumberString(data.priorityValues, {
        allowZeros: true, // Zeros are allowed for priority values
        context: "Priority Values",
        maxLength: MAX_PROCESS_INPUT_LENGTH, // Max 20 processes
      });
    } catch (e: any) {
      ctx.addIssue({
        code: "custom",
        path: ["priorityValues"],
        message: e.message,
      });
    }
  }

  // Parse and validate time quantum, if provided
  if (data.timeQuantum !== undefined) {
    // At this point, data.timeQuantum is guaranteed to be a string of one or more digits
    // (e.g., "0", "1", "123") due to the RawFormSchema validation, or it's undefined.
    const num = Number(data.timeQuantum);

    // Validate that the number is a whole number and within the 1-1000 range.
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 1000) {
      ctx.addIssue({
        code: "custom",
        path: ["timeQuantum"],
        message: "Time Quantum must be a whole number between 1 and 1000.",
      });
    } else {
      timeQuantum = num; // Store the valid number
    }
  }

  // --- Return the transformed data structure ---
  return {
    algorithmSelected: data.algorithmSelected,
    preemption: data.preemption,
    arrivalTimeValues: arrivalTimes,
    burstTimeValues: burstTimes,
    priorityValues: priorityValues,
    timeQuantum: timeQuantum,
  };
}).superRefine((data, ctx) => {
  // --- Cross-Field Validation ---
  // Ensure arrival times and burst times have the same number of entries
  if (data.arrivalTimeValues.length !== data.burstTimeValues.length) {
    ctx.addIssue({
      code: "custom",
      path: ["burstTimeValues"], // Error associated with burst times for UI
      message: "Number of Burst Times must match number of Arrival Times.",
    });
  }
  // If priority values are provided, ensure they match the number of arrival/burst times
  if (
    data.priorityValues !== undefined &&
    data.priorityValues.length !== data.arrivalTimeValues.length
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["priorityValues"], // Error associated with priority values
      message:
        "Number of Priority Values must match number of Arrival/Burst Times.",
    });
  }

  // --- Algorithm Specific Validations ---
  const algo = data.algorithmSelected;
  const isPreemptive = data.preemption === Preemption.preemptive;

  // Round Robin (rr) specific validation
  if (algo === Algorithm.rr && data.timeQuantum === undefined) {
    ctx.addIssue({
      code: "custom",
      path: ["timeQuantum"],
      message: "Time Quantum is required for Round Robin algorithm.",
    });
  }

  // Priority algorithm specific validation
  if (algo === Algorithm.priority && data.priorityValues === undefined) {
    ctx.addIssue({
      code: "custom",
      path: ["priorityValues"],
      message: "Priority Values are required for Priority algorithm.",
    });
  }

  // FCFS specific validation (cannot be preemptive)
  if (algo === Algorithm.fcfs && isPreemptive) {
    ctx.addIssue({
      code: "custom",
      path: ["preemption"],
      message: "FCFS algorithm cannot be preemptive.",
    });
  }

  // Round Robin specific validation (must be preemptive)
  if (algo === Algorithm.rr && !isPreemptive) {
    ctx.addIssue({
      code: "custom",
      path: ["preemption"],
      message: "Round Robin algorithm must be preemptive.",
    });
  }
});

// Type for flattened errors, useful for displaying errors in a form
type FormSchemaFlattenedErrors = z.inferFlattenedErrors<
  typeof CreateFormSchema
>;

// Interface for the overall state of form submission/validation result
export interface InputFormError {
  errors?: FormSchemaFlattenedErrors["fieldErrors"]; // Field-specific errors
  message?: string | null; // General message (e.g., success or failure)
  success?: boolean | null; // Indicates if the operation was successful
  data?: ResultsSectionTypes | null; // Result data on success
}

// Infer the final validated data type from the CreateFormSchema
export type ValidatedScheduleInput = z.infer<typeof CreateFormSchema>;
