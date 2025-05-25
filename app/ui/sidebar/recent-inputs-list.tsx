"use client";

import { AssignRefParams, RecentRecordsType } from "@/app/lib/definitions";
import SavedInputListItem from "./saved-input-list-item";
import { INDEX_NOT_APPLICABLE } from "@/app/lib/constants";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface RecentInputsListProps {
  savedInputs: RecentRecordsType[];
  onApplyInput: (input: RecentRecordsType) => void;
  assignRef: (params: AssignRefParams) => void;
  getOverflowState: (index: number) => boolean;
  sidebarListError: string | null;
  hasMore: boolean;
  handleLoadMoreInputs: () => void;
  isAppending: boolean;
}

const RecentInputsList = ({
  savedInputs,
  onApplyInput,
  assignRef,
  getOverflowState,
  sidebarListError,
  hasMore,
  handleLoadMoreInputs,
  isAppending,
}: RecentInputsListProps) => {
  let currentRefIndex = 0;

  return (
    <div className="overflow-y-auto grow max-h-[calc(100vh-100px)]">
      {sidebarListError && (
        <div className="p-3 my-2 text-center text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md mx-2">
          <p>{sidebarListError}</p>
        </div>
      )}

      <ul className="space-y-7 mb-2">
        {savedInputs.map((input) => {
          const atIndex = currentRefIndex++;
          const btIndex = currentRefIndex++;
          const pIndex =
            input.priorityValues !== null && input.priorityValues !== ""
              ? currentRefIndex++
              : INDEX_NOT_APPLICABLE;
          const quantumIndex =
            input.timeQuantum !== null
              ? currentRefIndex++
              : INDEX_NOT_APPLICABLE;

          return (
            <SavedInputListItem
              key={input.id}
              input={input}
              onApplyInput={onApplyInput}
              assignRef={assignRef}
              getOverflowState={getOverflowState}
              atIndex={atIndex}
              btIndex={btIndex}
              pIndex={pIndex}
              quantumIndex={quantumIndex}
            />
          );
        })}
        {!sidebarListError && savedInputs.length === 0 && !isAppending && (
          <li className="text-center text-gray-500 text-sm py-4">
            No saved inputs found.
          </li>
        )}
      </ul>

      {!sidebarListError && hasMore && (
        <div className="text-center py-2">
          <button
            onClick={handleLoadMoreInputs}
            disabled={isAppending}
            className="px-4 py-2 dark:text-gray-400 dark:hover:text-gray-300 font-semibold rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isAppending ? (
              "Loading..."
            ) : (
              <>
                <ChevronDownIcon className="w-5 h-5 inline align-middle" />
                Load More
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentInputsList;
