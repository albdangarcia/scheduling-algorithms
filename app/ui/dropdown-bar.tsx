"use client";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import {
  scheduleKeys,
  ScheduleKeysTypes,
  ScheduleType,
} from "../lib/definitions";

export const dropDownOptions: Record<ScheduleKeysTypes, ScheduleType> = {
  fcfs: {
    longName: "First Come First Served",
  },
  sjf: {
    longName: "Shortest Job First",
  },
  rr: {
    longName: "Round Robin",
  },
  priority: {
    longName: "Priority",
  },
};

interface Props {
  onDropDownOptionChange: (value: ScheduleKeysTypes) => void;
  algorithmSelected: ScheduleKeysTypes;
}

// drop down bar for selecting the scheduling algorithm
const DropDownBar = ({ onDropDownOptionChange, algorithmSelected }: Props) => {
  return (
    <div className="gradient pt-10 w-full max-w-[33rem] mx-auto">
      <Listbox
        value={algorithmSelected}
        as="div"
        onChange={(value) => onDropDownOptionChange(value)}
      >
        {({ open }) => (
          <>
            <div
              className={clsx(
                "bg-white p-2",
                open ? "rounded-t-xl" : "rounded-xl"
              )}
            >
              <ListboxButton
                className={clsx(
                  "relative block w-full rounded-md bg-gray-100 py-1.5 pr-8 pl-3 text-left text-sm/6 text-gray-900",
                  "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                )}
              >
                {dropDownOptions[algorithmSelected].longName}
                <ChevronDownIcon
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-gray-900"
                  aria-hidden="true"
                />
              </ListboxButton>
            </div>
            <ListboxOptions
              anchor="bottom"
              className="w-[calc(var(--button-width)+1rem)] rounded-b-xl bg-white py-1 px-2 [--anchor-gap:var(--spacing-1)] focus:outline-none"
            >
              {scheduleKeys.map((id) => {
                const option = dropDownOptions[id];
                return (
                  <ListboxOption
                    key={id}
                    value={id}
                    className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-indigo-700 data-[focus]:text-white"
                  >
                    <CheckIcon className="invisible size-4 fill-gray-900 group-data-[selected]:visible group-data-[focus]:fill-white" />
                    <div className="text-sm/6">{option.longName}</div>
                  </ListboxOption>
                );
              })}
            </ListboxOptions>
          </>
        )}
      </Listbox>
    </div>
  );
};

export default DropDownBar;
