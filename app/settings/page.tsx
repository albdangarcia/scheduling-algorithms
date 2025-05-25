import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { auth, signIn } from "@/auth";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import DeleteAccountButton from "../ui/delete-account-button";
import { deleteUserAccount } from "../lib/actions/user";

const UserSettings = async () => {
  // Check if the user is authenticated
  const session = await auth();

  // If the user is not signed in, redirect to the sign-in page
  if (!session) {
    await signIn();
    return null; // Return null to prevent rendering the rest of the component
  }

  // Extract user information from the session
  const { name, email, image } = session.user;

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Return to Home
      </Link>

      {/* User Profile Section */}
      <div className="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700/80 pb-4">
        {/* user image */}
        {image ? (
          <Image
            src={image}
            alt={name ?? "User profile picture"}
            width={50}
            height={50}
            className="rounded-full"
          />
        ) : (
          <div className="size-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center" />
        )}

        <div className="flex-grow min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {name ?? "User"}
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {email}
          </p>
        </div>
      </div>

      {/* Danger Zone - Account Deletion */}
      <div className="border border-red-300 dark:border-red-700/50 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
          <ExclamationTriangleIcon 
          className="h-5 w-5" 
          aria-hidden="true"
          />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Deleting your account is a permanent action and cannot be undone. All
          your data associated with this account will be permanently removed.
        </p>
        {/* Delete Account Button */}
        <DeleteAccountButton deleteAction={deleteUserAccount} />
      </div>
    </div>
  );
};

export default UserSettings;
