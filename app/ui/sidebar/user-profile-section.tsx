// UserProfileSection.tsx
import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

interface Props {
  userSession: Session;
}

const UserProfileSection = ({ userSession }: Props) => (
  <div className="mb-6 mt-3 flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700/80 pb-4">
    {userSession?.user?.image ? (
      <Image
        src={userSession.user.image}
        alt={userSession.user.name ?? "User profile picture"}
        width={40}
        height={40}
        className="rounded-full"
        priority
      />
    ) : (
      <div className="size-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center" />
    )}
    <div className="flex-grow min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
        {userSession?.user?.name ?? "User"}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {userSession?.user?.email}
      </p>
    </div>
    <Link href="/settings">
      <button
        aria-label="Account settings"
        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Cog6ToothIcon
          className="size-5"
          aria-hidden="true"
        />
      </button>
    </Link>
  </div>
);
export default UserProfileSection;
