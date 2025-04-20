"use client";
import { Radio, RadioGroup } from "@headlessui/react";
import { Dispatch, SetStateAction } from "react";
import {
  PreemptiveOptionsTypes,
  RadioOptionType,
  preemptiveOptions,
  ScheduleKeysTypes,
} from "../lib/definitions";
import clsx from "clsx";

export const preemptiveRadioOptions: Record<
  PreemptiveOptionsTypes,
  RadioOptionType
> = {
  nonpreemptive: {
    name: "Non-Preemptive",
    description: "Allows a process to run to completion or until it blocks before another process is scheduled.",
  },
  preemptive: {
    name: "Preemptive",
    description: "Allows the operating system to interrupt a currently executing process and move it to a ready state.",
  },
};

interface Props {
  radioSelected: PreemptiveOptionsTypes;
  setRadioSelected: Dispatch<SetStateAction<PreemptiveOptionsTypes>>;
  algorithmSelected: ScheduleKeysTypes;
}

const RadioOptions = ({
  radioSelected,
  setRadioSelected,
  algorithmSelected,
}: Props) => {

  // Disable the radio button based on the selected algorithm
  const isDisabled = (preemptiveOption: PreemptiveOptionsTypes): boolean => {
    switch (algorithmSelected) {
      case "fcfs":
        return preemptiveOption === "preemptive";
      case "rr":
        return preemptiveOption === "nonpreemptive";
      case "sjf":
      case "priority":
      default:
        return false;
    }
  };

  return (
    <div className="w-full pt-10">
      <div className="mx-auto w-full max-w-lg">
        <RadioGroup
          id="name"
          value={radioSelected}
          onChange={setRadioSelected}
          aria-label="nonpreemptive or preemptive"
          className="flex flex-col gap-y-5 sm:px-0 sm:flex-row sm:gap-x-5"
        >
          {preemptiveOptions.map((id) => {
            const option = preemptiveRadioOptions[id];
            return (
              <Radio
                key={id}
                value={id}
                disabled={isDisabled(id)}
                className={clsx(
                  "group bg-white/20 relative flex rounded-lg py-4 px-5 shadow-md focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-white border border-transparent data-[checked]:border-indigo-400/95",
                  isDisabled(id) ? "blur-[3px] cursor-default" : "cursor-pointer",
                )}
              >
                {({ checked }) => (
                  <div className="flex w-full justify-between">
                    <div className="text-sm/6">
                      <p className="font-semibold text-gray-700">
                        {option.name}
                      </p>
                      <div className="flex gap-2 text-gray-600">
                        <div>{option.description}</div>
                      </div>
                    </div>
                    {checked && (
                      <div className="w-2 h-2 border-2 border-indigo-600 bg-white rounded-full right-3 absolute" />
                    )}
                  </div>
                )}
              </Radio>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
};

export default RadioOptions;
