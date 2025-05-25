"use client";

import { INDEX_NOT_APPLICABLE } from "@/app/lib/constants";
import { AssignRefParams, RecentRecordsType } from "@/app/lib/definitions";
import clsx from "clsx";
import { preemptionRadioOptions } from "../radio-options";

// Props for the individual data item (AT, BT, P, Quantum)
interface DataItemViewProps {
  label: string;
  value: string | number | null | undefined;
  itemIndex: number; // Used for managing refs for the marquee effect
  assignRef: (params: AssignRefParams) => void; // Callback to assign refs to the parent
  isOverflowing: boolean; // State from parent indicating if content overflows (for marquee)
}

// Component to display a single data item (e.g., "AT: 1 2 3")
const DataItemView = ({
  label,
  value,
  itemIndex,
  assignRef,
  isOverflowing,
}: DataItemViewProps) => {
  // Don't render if this data item is not applicable for the current record
  if (itemIndex === INDEX_NOT_APPLICABLE) return null;

  return (
    <div
      className={clsx(
        "data-item py-1 px-1.5 rounded-md bg-gray-100 dark:bg-gray-700/60", // Added padding, rounding, and a subtle background for each item
        label === "Quantum" && "data-item-quantum", // Specific class for Quantum if needed
        isOverflowing && "is-item-overflowing"
      )}
    >
      <span className="label text-xs mr-1.5 text-gray-600 dark:text-gray-400">
        {label}:
      </span>
      <span
        className="number-wrapper" // Container for the marquee effect
        ref={(el) => assignRef({type: "wrapper", index: itemIndex, el })} // Assigns the wrapper element's ref
      >
        <span
          className="number-content" // The actual content that might scroll
          ref={(el) => assignRef({type: "content", index: itemIndex, el})} // Assigns the content element's ref
        >
          {String(value ?? "")}
        </span>
      </span>
    </div>
  );
};

// Props for the list item in the saved inputs list
interface SavedInputListItemProps {
  input: RecentRecordsType; // The data for the saved input
  onApplyInput: (input: RecentRecordsType) => void; // Callback when "apply" is clicked
  assignRef: (params: AssignRefParams) => void;
  getOverflowState: (index: number) => boolean; // Function to get overflow state for a DataItemView
  // Indices for each data point, used by DataItemView for refs and overflow state
  atIndex: number;
  btIndex: number;
  pIndex: number;
  quantumIndex: number;
}

// Component for a single item in the "Recent Inputs" list
const SavedInputListItem = ({
  input,
  onApplyInput,
  assignRef,
  getOverflowState,
  atIndex,
  btIndex,
  pIndex,
  quantumIndex,
}: SavedInputListItemProps) => {
  return (
    <li key={input.id}>
      <div className="block w-full p-0 text-left rounded-sm">
        {/* Header section: Algorithm name, preemption type, and Apply button */}
        <div className="text-xs grid grid-cols-2 mb-1 text-gray-950 font-semibold">
          <div className="dark:text-gray-400 text-gray-700 truncate pr-1">
            <span className="font-bold">
              {input.algorithmSelected.toLocaleUpperCase()}
            </span>
            <span className="font-normal ml-2">
              {preemptionRadioOptions[input.preemption].name}
            </span>
          </div>
          <button
            onClick={() => onApplyInput(input)}
            aria-label="apply inputs"
            className={clsx(
              "ml-3 bg-gray-200 dark:bg-gray-900 w-11 rounded-xs justify-self-end",
              "hover:bg-gray-300 text-gray-700",
              "dark:hover:bg-gray-700 dark:text-gray-500 dark:hover:text-gray-400"
            )}
          >
            apply
          </button>
        </div>

        {/* Data Row: Contains AT, BT, P, Quantum values */}
        <div
          className={clsx(
            "flex flex-wrap w-full text-gray-900 dark:text-gray-300",
            "gap-x-2 gap-y-1",
            "p-2 text-sm leading-5",
            "border border-gray-200 dark:border-gray-700 rounded-sm"
          )}
        >
          {/* Arrival Time */}
          <DataItemView
            label="AT"
            value={input.arrivalValues}
            itemIndex={atIndex}
            assignRef={assignRef}
            isOverflowing={getOverflowState(atIndex)}
          />
          {/* Burst Time */}
          <DataItemView
            label="BT"
            value={input.burstValues}
            itemIndex={btIndex}
            assignRef={assignRef}
            isOverflowing={getOverflowState(btIndex)}
          />
          {/* Priority (conditional) */}
          {input.priorityValues !== null &&
            input.priorityValues !== "" &&
            pIndex !== INDEX_NOT_APPLICABLE && (
              <DataItemView
                label="P"
                value={input.priorityValues}
                itemIndex={pIndex}
                assignRef={assignRef}
                isOverflowing={getOverflowState(pIndex)}
              />
            )}
          {/* Time Quantum (conditional) */}
          {input.timeQuantum !== null &&
            quantumIndex !== INDEX_NOT_APPLICABLE && (
              <DataItemView
                label="QT"
                value={input.timeQuantum}
                itemIndex={quantumIndex}
                assignRef={assignRef}
                isOverflowing={getOverflowState(quantumIndex)}
              />
            )}
        </div>
      </div>
    </li>
  );
};
export default SavedInputListItem;
