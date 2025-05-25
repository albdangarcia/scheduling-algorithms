"use client";

import { Radio, RadioGroup } from "@headlessui/react";
import { Dispatch, SetStateAction } from "react";
import { RadioOptionType } from "../lib/definitions";
import clsx from "clsx";
import { Preemption, Algorithm } from "@prisma/client";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

// Available preemption options
export const preemptionRadioOptions: Record<Preemption, RadioOptionType> = {
  [Preemption.nonPreemptive]: {
    name: "Non-Preemptive",
    description:
      "Allows a process to run to completion or until it blocks before another process is scheduled.",
  },
  [Preemption.preemptive]: {
    name: "Preemptive",
    description:
      "Allows the operating system to interrupt a currently executing process and move it to a ready state.",
  },
};

interface RadioOptionsProps {
  radioSelected: Preemption;
  setRadioSelected: Dispatch<SetStateAction<Preemption>>;
  algorithmSelected: Algorithm;
}
const RadioOptions = ({
  radioSelected,
  setRadioSelected,
  algorithmSelected,
}: RadioOptionsProps) => {
  const isDisabled = (preemption: Preemption): boolean => {
    switch (algorithmSelected) {
      case Algorithm.fcfs:
        return preemption === Preemption.preemptive;
      case Algorithm.rr:
        return preemption === Preemption.nonPreemptive;
      case Algorithm.sjf:
      case Algorithm.priority:
      default:
        return false;
    }
  };

  const preemptionValues = [Preemption.nonPreemptive, Preemption.preemptive];

  return (
    <div className="w-full pt-10">
      <div className="mx-auto w-full max-w-lg">
        <h3 className="text-sm font-opensans font-medium text-gray-800 dark:text-gray-300 mb-3 text-center">
          Select Preemption
        </h3>
        <RadioGroup
          name="preemption"
          value={radioSelected}
          onChange={setRadioSelected}
          aria-label="Preemption Type"
          className="flex flex-col gap-y-3 sm:gap-x-4 sm:gap-y-0 sm:flex-row"
        >
          {preemptionValues.map((id) => {
            const preemptionInfo = preemptionRadioOptions[id];
            const optionIsDisabled = isDisabled(id);
            const isChecked = radioSelected === id;

            return (
              <Radio
                key={id}
                value={id}
                disabled={optionIsDisabled}
                className={clsx(
                  "group relative flex flex-1 rounded-lg px-5 py-4 shadow-md",
                  "focus:outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
                  isChecked
                    ? "bg-white dark:bg-gray-900/80 ring-2 ring-indigo-500 dark:ring-indigo-500 transition-shadow"
                    : "bg-white/20 dark:bg-white/5 ring-1 ring-white/10 dark:ring-white/10 hover:bg-white/40 dark:hover:bg-gray-500/20",
                  optionIsDisabled
                    ? "blur-[2px] cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                )}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="grow">
                    <p
                      className={clsx(
                        "font-semibold text-sm/6",
                        isChecked
                          ? "text-gray-900 dark:text-gray-200"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {preemptionInfo.name}
                    </p>
                    <div className="text-gray-700 dark:text-gray-400 text-sm/5">
                      {preemptionInfo.description}
                    </div>
                  </div>
                  {isChecked && (
                    <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
              </Radio>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
};

export default RadioOptions;