"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// Define props type to accept the server action
interface DeleteAccountButtonProps {
  deleteAction: () => Promise<void | { error: string }>;
}

const DeleteAccountButton = ({ deleteAction }: DeleteAccountButtonProps) => {
  const [isOpen, setIsOpen] = useState(false); // For modal visibility
  const [isPending, startTransition] = useTransition(); // For loading state during server action
  const [error, setError] = useState<string | null>(null); // To display errors from server action

  // Function to close the modal
  function closeModal() {
    setIsOpen(false);
    setError(null); // Clear error when closing
  }

  // Function to open the modal
  function openModal() {
    setIsOpen(true);
  }

  // Function to handle the deletion confirmation
  async function handleDeleteConfirm() {
    startTransition(async () => {
      try {
        const result = await deleteAction();
        // Check if the server action returned an error message
        if (result && result.error) {
          setError(result.error);
        }
      } catch (e) {
        // Catch unexpected errors
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <>
      {/* Button to open the modal */}
      <button
        type="button"
        onClick={openModal}
        disabled={isPending} // Disable while action is pending
        className={clsx(
          "inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold",
          "text-white shadow-xs hover:bg-red-500 focus-visible:outline-solid focus-visible:outline-2",
          "focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-red-700 dark:hover:bg-red-600",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isPending ? "Deleting..." : "Delete My Account"}
      </button>

      {/* Headless UI Modal */}
      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          {/* Backdrop */}
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 dark:bg-black/50" />
          </TransitionChild>

          {/* Modal Content */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel
                  className={clsx(
                    "w-full max-w-md transform overflow-hidden rounded-2xl",
                    "bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all"
                  )}
                >
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex items-center"
                  >
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-600 dark:text-red-400 mr-2"
                      aria-hidden="true"
                    />
                    Confirm Account Deletion
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Are you absolutely sure you want to delete your account?
                      This action is irreversible and will permanently remove
                      all your data.
                    </p>
                  </div>

                  {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      disabled={isPending}
                      className={clsx(
                        "inline-flex justify-center rounded-md border border-transparent bg-gray-100",
                        "px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200",
                        "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                        "dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus-visible:ring-offset-gray-800 disabled:opacity-50"
                      )}
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      className={clsx(
                        "inline-flex justify-center rounded-md border border-transparent bg-red-600",
                        "px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-hidden focus-visible:ring-2",
                        "focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600 dark:focus-visible:ring-offset-gray-800",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      onClick={handleDeleteConfirm}
                    >
                      {isPending ? "Deleting..." : "Yes, Delete Account"}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default DeleteAccountButton;
