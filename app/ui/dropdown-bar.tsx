"use client";

import { useEffect, useRef } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Label,
  Field,
  Description as HeadlessDescription,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Algorithm } from "@prisma/client";
import { ScheduleType } from "../lib/definitions";

// Defines the display names and descriptions for each algorithm
export const dropDownOptions: Record<Algorithm, ScheduleType> = {
  [Algorithm.fcfs]: {
    longName: "First Come First Served",
    shortDescription: "Processes are executed in the order they arrive.",
    description:
      "First Come First Served (FCFS) is the simplest scheduling algorithm. Processes are dispatched according to their arrival time on the ready queue. It's a non-preemptive algorithm. While simple to implement, FCFS can lead to the convoy effect, where short processes get stuck waiting for a long process to finish, potentially increasing the average waiting time.",
  },
  [Algorithm.sjf]: {
    longName: "Shortest Job First",
    shortDescription:
      "The process with the smallest execution time is selected next.",
    description:
      "Shortest Job First (SJF) selects the waiting process with the smallest execution time (burst time) to execute next. This algorithm can be implemented in both preemptive (Shortest Remaining Time First - SRTF) and non-preemptive ways. SJF is provably optimal in terms of minimizing the average waiting time for a given set of processes. However, predicting the future burst time accurately can be challenging in real systems, and it can suffer from starvation for long processes if short processes keep arriving.",
  },
  [Algorithm.rr]: {
    longName: "Round Robin",
    shortDescription:
      "Each process gets a small unit of CPU time (time quantum).",
    description:
      "Round Robin (RR) is a preemptive scheduling algorithm designed especially for time-sharing systems. Each process is assigned a fixed time slot, known as a time quantum or time slice, during which it is allowed to run. If a process does not complete within its time quantum, it is preempted and moved to the back of the ready queue. RR provides a fair share of CPU time to all processes and prevents starvation, but the performance heavily depends on the chosen time quantum. A very small quantum leads to frequent context switches (overhead), while a very large quantum makes RR behave like FCFS.",
  },
  [Algorithm.priority]: {
    longName: "Priority",
    shortDescription:
      "Processes are assigned priorities; highest priority process runs next.",
    description:
      "Priority Scheduling assigns a priority to each process. The process with the highest priority (which can be numerically represented as a smaller or larger number depending on convention) is selected to run next. Priorities can be defined statically or dynamically, and can be based on various factors like memory requirements, time limits, or user importance. Priority scheduling can be preemptive (if a new higher-priority process arrives, it preempts the currently running process) or non-preemptive. A major challenge is indefinite blocking or starvation, where low-priority processes may never get to run. This can be mitigated using techniques like aging (gradually increasing the priority of waiting processes).",
  },
};

// Get an iterable array of all defined algorithm types directly from the Prisma Algorithm enum.
// This ensures the dropdown options are always in sync with the available algorithms.
const AlgorithmValues = Object.values(Algorithm);

interface ListboxOpenEffectHandlerProps {
  open: boolean;
  disclosureButtonRef: React.RefObject<HTMLButtonElement | null>;
}

// Helper component to run an effect when Listbox's open state changes
const ListboxOpenEffectHandler = ({
  open,
  disclosureButtonRef,
}: ListboxOpenEffectHandlerProps) => {
  useEffect(() => {
    if (open) {
      // If the Listbox is open and the DisclosureButton is the active focused element
      if (document.activeElement === disclosureButtonRef.current) {
        disclosureButtonRef.current?.blur(); // Blur the DisclosureButton
      }
    }
  }, [open, disclosureButtonRef]);

  return null; // This component does not render anything
};

interface Props {
  onDropDownOptionChange: (value: Algorithm) => void;
  algorithmSelected: Algorithm;
}

// Drop down bar that allows the user to select an algorithm
const DropDownBar = ({ onDropDownOptionChange, algorithmSelected }: Props) => {
  const selectedAlgorithmDetails = dropDownOptions[algorithmSelected];
  const disclosureButtonRef = useRef<HTMLButtonElement | null>(null); // Ref for the DisclosureButton

  return (
    <div className="pt-[1rem] w-full max-w-[33rem] mx-auto">
      <div>
        <Field>
          <Label
            id="algorithm-select-label"
            className="ml-3 font-opensans text-sm font-medium text-gray-800 dark:text-gray-300"
          >
            Select Algorithm:
          </Label>
          <HeadlessDescription className="sr-only">
            Choose which CPU scheduling algorithm to visualize and analyze.
          </HeadlessDescription>
          <Listbox
            value={algorithmSelected}
            name="algorithmSelected"
            as="div"
            aria-labelledby="algorithm-select-label"
            onChange={(value) => onDropDownOptionChange(value)}
          >
            {({ open }) => (
              <>
                {/* Use the helper component to handle the effect */}
                <ListboxOpenEffectHandler
                  open={open}
                  disclosureButtonRef={disclosureButtonRef}
                />
                <div
                  className={clsx(
                    "bg-white dark:bg-gray-800/90 p-2 font-medium shadow-md",
                    open ? "rounded-t-xl" : "rounded-xl"
                  )}
                >
                  <ListboxButton
                    className={clsx(
                      "relative block w-full rounded-md bg-gray-100 dark:bg-gray-700 py-2 px-3 text-left text-sm/6",
                      "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-indigo-500 dark:data-[focus]:outline-indigo-600",
                      "text-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/70"
                    )}
                    onClick={() => {
                      // If DisclosureButton is focused, try to blur it.
                      if (
                        document.activeElement === disclosureButtonRef.current
                      ) {
                        disclosureButtonRef.current?.blur();
                      }
                    }}
                  >
                    {selectedAlgorithmDetails.longName}
                    <ChevronDownIcon
                      className="group pointer-events-none absolute top-1/2 -translate-y-1/2 right-2.5 size-5 fill-gray-500 dark:fill-gray-400"
                      aria-hidden="true"
                    />
                  </ListboxButton>
                </div>
                <ListboxOptions
                  anchor="bottom"
                  transition
                  className="w-[calc(var(--button-width)+1rem)] mt-1 rounded-b-xl bg-white dark:bg-gray-800 p-1 shadow-lg [--anchor-gap:var(--spacing-1)] focus:outline-none
                           origin-top transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0
                           dark:text-gray-300"
                >
                  {AlgorithmValues.map((id) => {
                    const option = dropDownOptions[id];
                    if (!option) return null;
                    return (
                      <ListboxOption
                        key={id}
                        value={id}
                        className={clsx(
                          "group flex cursor-pointer items-center gap-2",
                          "rounded-lg py-1.5 px-3 select-none",
                          "data-[focus]:bg-indigo-600 data-[focus]:text-white dark:data-[focus]:bg-indigo-700",
                          "text-gray-800 dark:text-gray-300"
                        )}
                      >
                        <CheckIcon className="invisible size-4 fill-current group-data-[selected]:visible" />
                        <div className="text-sm">{option.longName}</div>
                      </ListboxOption>
                    );
                  })}
                </ListboxOptions>
              </>
            )}
          </Listbox>
        </Field>
      </div>

      {/* Algorithm Description Disclosure Section */}
      {selectedAlgorithmDetails && (
        <div className="mt-4 w-full px-1">
          <Disclosure as="div" defaultOpen={false}>
            {({ open }) => (
              <div className="rounded-lg bg-white dark:bg-gray-800/90 shadow-md">
                <DisclosureButton
                  ref={disclosureButtonRef} // Assign the ref to the DisclosureButton
                  className={clsx(
                    "group flex w-full items-center justify-between rounded-t-lg px-4 py-3 text-left text-sm",
                    "font-medium hover:bg-gray-100 dark:hover:bg-gray-700/20",
                    "focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75",
                    open
                      ? "text-gray-900 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
                  )}
                >
                  <span>
                    What is {selectedAlgorithmDetails.longName}?
                    {selectedAlgorithmDetails.shortDescription && (
                      <p
                        className={clsx(
                          "text-xs font-normal mt-1 group-hover:text-gray-900 group-hover:dark:text-gray-400",
                          open
                            ? "text-gray-600 dark:text-gray-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {selectedAlgorithmDetails.shortDescription}
                      </p>
                    )}
                  </span>
                  <ChevronUpIcon
                    className={clsx(
                      open
                        ? "rotate-180 transform"
                        : "text-gray-500 dark:text-gray-500",
                      "h-5 w-5 transition-transform duration-200"
                    )}
                  />
                </DisclosureButton>
                <DisclosurePanel
                  static
                  className={clsx(
                    "text-sm text-gray-700 dark:text-gray-300/80 rounded-b-lg",
                    "transition-[max-height] duration-300 ease-in-out overflow-hidden",
                    open ? "max-h-screen" : "max-h-0"
                  )}
                >
                  <div className="px-4 pb-3 pt-1">
                    <p className="whitespace-pre-line">
                      {selectedAlgorithmDetails.description}
                    </p>
                  </div>
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        </div>
      )}
    </div>
  );
};

export default DropDownBar;
