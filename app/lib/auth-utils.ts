import { auth } from "@/auth";

/**
 * Custom error class for authentication-related issues.
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Retrieves the authenticated user's ID.
 * Throws an {@link AuthenticationError} if the user is not authenticated,
 * or if the user ID is not in the expected string format.
 * @returns A promise that resolves with the authenticated user's ID.
 * @throws {AuthenticationError} If authentication fails or user ID is invalid.
 */
export const getAuthenticatedUserId = async (): Promise<string> => {
  // Fetches the current user session.
  const session = await auth();

  // Throws an error if no active session or user is found.
  if (!session || !session.user) {
    throw new AuthenticationError("User is not authenticated.");
  }

  // Validates that the user ID is a string, throws error otherwise.
  if (typeof session.user.id !== "string") {
    throw new AuthenticationError("Invalid user ID type: Expected a string.");
  }

  // Returns the authenticated user's ID.
  return session.user.id;
};

/**
 * Safely attempts to get the authenticated user ID.
 * This function will not throw an error but will return `null` if the user
 * is not authenticated, the user ID is not a string, or if any other error
 * occurs during the authentication check.
 * @returns A promise that resolves with the authenticated user's ID or `null` if not found or on error.
 */
export const tryGetAuthenticatedUserId = async (): Promise<string | null> => {
  try {
    // Fetches the current user session.
    const session = await auth();

    // Checks if the session and user exist, and if the user ID is a string.
    if (session?.user?.id && typeof session.user.id === "string") {
      return session.user.id;
    }
    
    // Return null if not authenticated or id is invalid format
    return null;
  } catch (error) {
    // This log is about an internal error, not just a non-authenticated user.
    console.error("Error during authentication check in tryGetAuthenticatedUserId:", error);
    return null; 
  }
};