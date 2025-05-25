import { prisma } from "@/app/lib/prisma";
import { getAuthenticatedUserId } from "../auth-utils";
import { ITEMS_PER_PAGE } from "../constants";
import { PaginatedRecentRecordsResponse } from "../definitions";

// Interface for the function parameters
interface FetchPaginatedSavedInputFormListParam {
  skip: number;
  take?: number; // Optional, as it has a default value
}

// Fetches a paginated list of saved input forms for the authenticated user.
export const fetchPaginatedSavedInputFormList = async ({
  skip, // Number of records to skip
  take = ITEMS_PER_PAGE, // Number of records to take, defaults to ITEMS_PER_PAGE
}: FetchPaginatedSavedInputFormListParam): Promise<PaginatedRecentRecordsResponse> => {
  // Get the authenticated user's ID return null if not authenticated.
  const userId: string = await getAuthenticatedUserId();

  try {
    // Fetch one more record than requested to check if there are more pages.
    const recordsToFetch = take + 1;
    const rawRecords = await prisma.inputForm.findMany({
      where: {
        userId: userId, // Filter records by the authenticated user's ID.
      },
      select: {
        id: true,
        algorithmSelected: true,
        preemption: true,
        arrivalValues: true,
        burstValues: true,
        priorityValues: true,
        timeQuantum: true,
        updatedAt: true, // Assuming updatedAt is used for ordering
      },
      orderBy: {
        updatedAt: "desc", // Order records by update timestamp in descending order.
      },
      take: recordsToFetch, // Fetch one extra
      skip: skip, // Skip a certain number of records for pagination.
    });

    const hasMore = rawRecords.length > take;
    // Quantum the records to return only the requested number.
    const recordsForPage = rawRecords.slice(0, take);

    // Transform the fetched records.
    const recentRecords = recordsForPage.map((record) => ({
      ...record,
      // Convert array values to space-separated strings.
      priorityValues: record.priorityValues
        ? record.priorityValues.join(" ")
        : null,
      arrivalValues: record.arrivalValues.join(" "),
      burstValues: record.burstValues.join(" "),
    }));

    return { records: recentRecords, hasMore };
  } catch (error) {
    console.error("Error fetching paginated saved input forms for user:", userId, error);
    // Return an empty array and hasMore false in case of an error.
    return { records: [], hasMore: false };
  }
};