"use server";

import { CreateFormSchema, InputFormError } from "../zod-schema";
import { getProcesses } from "../helperfunctions";
import { performAlgorithm } from "../scheduleAlgorithm";
import { prisma } from "@/app/lib/prisma";
import { createHash } from "crypto";
import { Algorithm, Preemption } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import {
  getAuthenticatedUserId,
  tryGetAuthenticatedUserId,
} from "../auth-utils";
import { PaginatedRecentRecordsResponse } from "../definitions";
import { fetchPaginatedSavedInputFormList } from "../data/savedInputs";
import { initialActionState, ITEMS_PER_PAGE } from "../constants";

// Maximum number of simulation records allowed per user.
const MAX_RECORDS_PER_USER = 20;

// Server action to process the scheduling algorithm form input.
export const createFormInput = async (
  prevState: InputFormError, // Previous state, used for progressive enhancement.
  formData: FormData
): Promise<InputFormError> => {
  if (formData.get("__ACTION_RESET_STATE__") === "true") {
    // Return the initial state to reset errors/messages when the user changes the algorithm.
    return initialActionState;
  }

  // Validate form fields using the Zod schema.
  const validatedFields = CreateFormSchema.safeParse({
    algorithmSelected: formData.get("algorithmSelected"),
    preemption: formData.get("preemption"),
    arrivalTimeValues: formData.get("arrivalTimeValues"),
    burstTimeValues: formData.get("burstTimeValues"),
    priorityValues: formData.get("priorityValues"),
    timeQuantum: formData.get("timeQuantum"),
  });

  // If validation fails, return Zod errors immediately.
  if (!validatedFields.success) {
    console.error("Zod Validation Errors:", validatedFields.error.flatten());
    return {
      // Use Zod's flattened errors for frontend display.
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid input. Please check the fields.",
      success: false,
      data: null,
    };
  }

  // Destructure validated and transformed data.
  const {
    algorithmSelected,
    preemption,
    arrivalTimeValues, // number[]
    burstTimeValues, // number[]
    priorityValues, // number[] | undefined
    timeQuantum, // number | undefined
  } = validatedFields.data;

  try {
    // Prepare process data from input values.
    const { processArray, processTableResults } = getProcesses({
      arrivalValues: arrivalTimeValues,
      burstValues: burstTimeValues,
      priorityValues: priorityValues,
    });

    // Execute the selected scheduling algorithm.
    const { gantt, totalAverages } = performAlgorithm({
      processArrayInput: processArray,
      processTable: processTableResults,
      algorithmSelected: algorithmSelected,
      curTimeQuantum: timeQuantum,
      isPreemptive: preemption === Preemption.preemptive,
    });

    // Attempt to get the authenticated user's ID.
    const userId = await tryGetAuthenticatedUserId();

    // If user is authenticated, save/update the record.
    if (userId) {
      // Generate a unique hash for the input data to prevent duplicates.
      const uniqueHash = generateUniqueHash({
        algorithmSelected,
        preemption,
        arrivalTimeValues,
        burstTimeValues,
        priorityValues,
        timeQuantum,
      });
      try {
        // Check if this exact record already exists for the user.
        const existingRecord = await prisma.inputForm.findUnique({
          where: {
            userId_uniqueConstraintHash: {
              // Compound unique index.
              userId: userId,
              uniqueConstraintHash: uniqueHash,
            },
          },
          select: { id: true }, // Only select ID for existence check.
        });

        // If the record doesn't exist, manage record limits.
        if (!existingRecord) {
          const currentRecordCount = await prisma.inputForm.count({
            where: { userId: userId },
          });

          // If record limit is reached, delete the oldest record.
          if (currentRecordCount >= MAX_RECORDS_PER_USER) {
            const oldestRecord = await prisma.inputForm.findFirst({
              where: { userId: userId },
              orderBy: {
                createdAt: "asc", // Oldest first.
              },
              select: { id: true },
            });

            if (oldestRecord) {
              // Deleting oldest record due to limit.
              await prisma.inputForm.delete({
                where: { id: oldestRecord.id },
              });
            }
          }
        }

        // Create or update the record.
        await prisma.inputForm.upsert({
          where: {
            userId_uniqueConstraintHash: {
              // Compound unique index.
              userId: userId,
              uniqueConstraintHash: uniqueHash,
            },
          },
          update: {
            // Fields to update if record exists (e.g., forcing an update timestamp).
            // Here, simply re-setting algorithmSelected ensures 'updatedAt' changes.
            algorithmSelected: algorithmSelected,
          },
          create: {
            userId: userId,
            algorithmSelected: algorithmSelected,
            preemption: preemption,
            arrivalValues: arrivalTimeValues,
            burstValues: burstTimeValues,
            priorityValues: priorityValues,
            timeQuantum: timeQuantum,
            uniqueConstraintHash: uniqueHash,
          },
        });

        // Revalidate cache for the homepage to reflect changes.
        revalidatePath("/");
      } catch (dbError) {
        console.error("Database operation failed for user:", userId, dbError);
        // Return calculation results even if DB operation fails.
        return {
          message:
            "Calculation succeeded, but failed to save the data. Please try again.",
          success: false,
          data: {
            uniqueId: crypto.randomUUID(), // For UI refresh to re-trigger animation.
            ganttChartData: gantt,
            processTableData: processTableResults,
            totalAverages: totalAverages,
          },
        };
      }
    }

    // Return successful calculation results.
    return {
      success: true,
      data: {
        uniqueId: crypto.randomUUID(), // For UI refresh to re-trigger animation.
        ganttChartData: gantt,
        processTableData: processTableResults,
        totalAverages: totalAverages,
      },
    };
  } catch (error) {
    // Generic error for unexpected issues.
    return {
      message: "An unexpected error occurred. Please try again.",
      success: false,
      data: null,
    };
  }
};

interface LoadMoreSavedInputsActionParams {
  currentOffset: number;
}

// Server action to fetch more saved input records for pagination.
export const loadMoreSavedInputsAction = async ({
  currentOffset,
}: LoadMoreSavedInputsActionParams): Promise<PaginatedRecentRecordsResponse> => {
  // Ensures user is authenticated; throws error if not.
  await getAuthenticatedUserId();

  try {
    // Directly return the structured response
    return await fetchPaginatedSavedInputFormList({
      skip: currentOffset,
      take: ITEMS_PER_PAGE,
    });
  } catch (error) {
    console.error("Error in loadMoreSavedInputsAction:", error);
    return { records: [], hasMore: false }; // Return structured response on error
  }
};

interface RefreshSavedInputsActionParams {
  skip?: number; // Make skip optional, defaults to 0
  takeCount?: number;
}

export const refreshSavedInputsAction = async ({
  skip = 0, // Default skip to 0 if not provided
  takeCount = ITEMS_PER_PAGE,
}: RefreshSavedInputsActionParams = {}): Promise<PaginatedRecentRecordsResponse> => {
  await getAuthenticatedUserId(); // Ensures user is authenticated; throws error if not.

  try {
    // Directly return the structured response
    return await fetchPaginatedSavedInputFormList({
      skip: skip,
      take: takeCount,
    });
  } catch (error) {
    console.error("Error in refreshSavedInputsAction:", error);
    return { records: [], hasMore: false }; // Return structured response on error
  }
};

interface GenerateUniqueHashDataParams {
  algorithmSelected: Algorithm;
  preemption: Preemption;
  arrivalTimeValues: number[];
  burstTimeValues: number[];
  priorityValues: number[] | undefined;
  timeQuantum: number | undefined;
}

// Generates a SHA-256 hash from the input parameters to uniquely identify a record.
const generateUniqueHash = ({
  algorithmSelected,
  preemption,
  arrivalTimeValues,
  burstTimeValues,
  priorityValues,
  timeQuantum,
}: GenerateUniqueHashDataParams): string => {
  // Convert arrays to comma-separated strings.
  const arrivalStr = arrivalTimeValues.join(",");
  const burstStr = burstTimeValues.join(",");

  // Handle potentially undefined or empty priorityValues consistently.
  const priorityStr =
    priorityValues && priorityValues.length > 0
      ? priorityValues.join(",")
      : "EMPTY"; // Marker for empty/undefined.

  // Handle potentially undefined or null timeQuantum consistently.
  const timeQuantumStr =
    timeQuantum === undefined || timeQuantum === null
      ? "NULL" // Marker for null/undefined.
      : timeQuantum.toString();

  // Create a canonical string representation of the inputs.
  const canonicalString = [
    algorithmSelected,
    preemption,
    `arrival:[${arrivalStr}]`, // Brackets for clarity.
    `burst:[${burstStr}]`,
    `priority:[${priorityStr}]`,
    `timequantum:${timeQuantumStr}`,
  ].join("|"); // Pipe separator

  // Generate and return the SHA-256 hash.
  return createHash("sha256").update(canonicalString).digest("hex");
};
