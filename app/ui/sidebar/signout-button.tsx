import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import clsx from "clsx";

// This component is used to sign out the user from the application.
const SideBarSignOutButton = () => {
  return (
    <div
      className={clsx(
        "mt-auto border-t border-gray-200 dark:hover:border-gray-700/80",
        "dark:border-gray-600 -mx-7 dark:bg-slate-700/80"
      )}
    >
      <button
        onClick={() => signOut()}
        aria-label="Sign out"
        className={clsx(
          "flex w-full items-center justify-center gap-x-2.5 p-3 font-semibold text-sm leading-6",
          "text-gray-800 dark:text-gray-300 dark:hover:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        <ArrowRightStartOnRectangleIcon
          className="h-5 w-5 shrink-0"
          aria-hidden="true"
        />
        Sign out
      </button>
    </div>
  );
};

export default SideBarSignOutButton;
