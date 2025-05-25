"use server";

import { signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { AuthenticationError, getAuthenticatedUserId } from "../auth-utils";

// Server action to delete user account
export const deleteUserAccount = async (): Promise<{ error: string } | void> => {
  try {
    // This will throw an AuthenticationError if the user is not authenticated
    const userId = await getAuthenticatedUserId();

    // Delete user and related data from the database
    await prisma.user.delete({
      where: { id: userId },
    });

    // Sign out the user without redirecting immediately
    await signOut({ redirect: false });

  } catch (error) {
    console.error("Error during account deletion:", error);

    if (error instanceof AuthenticationError) {
      return { error: error.message || "Authentication failed. Unable to delete account." };
    }
    return { error: "Failed to delete account. Please try again later." };
  }

  // Redirect to the home page after successful deletion
  redirect("/");
};