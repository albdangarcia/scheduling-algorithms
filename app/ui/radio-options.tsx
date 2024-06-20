"use client";
import { Radio, RadioGroup } from "@headlessui/react";
import { RadioOptionType } from "../lib/definitions";
import clsx from "clsx";

export const preemtiveOptions: RadioOptionType[] = [
  {
    id: 1,
    name: "Non-Preemptive",
    text: " Allows a process to run to completion or until it blocks before another process is scheduled.",
  },
  {
    id: 2,
    name: "Preemptive",
    text: "Allows the operating system to interrupt a currently executing process and move it to a ready state.",
  },
];

export default function RadioOptions({
  selected,
  setSelected,
  disableRadioButton,
}: {
  selected: RadioOptionType;
  setSelected: (value: RadioOptionType) => void;
  disableRadioButton: RadioOptionType | undefined;
}) {
  // check if the radio button is disabled
  const isDisabled = (optionId: number) => {
    return disableRadioButton && disableRadioButton.id === optionId;
  };

  return (
    <div className="w-full pt-10">
      <div className="mx-auto w-full max-w-lg">
        <RadioGroup
          id="name"
          value={selected}
          onChange={setSelected}
          aria-label="nonpreemptive or preemptive"
          className="flex flex-col gap-y-5 sm:px-0 sm:flex-row sm:gap-x-5"
        >
          {preemtiveOptions.map((option) => (
            <Radio
              key={option.id}
              value={option}
              disabled={isDisabled(option.id)}
              className={clsx(
                "group bg-white/20 relative flex cursor-pointer rounded-lg py-4 px-5 shadow-md focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-white border border-transparent data-[checked]:border-indigo-400/95",
                isDisabled(option.id) && "blur-[3px]"
              )}
            >
              {({ checked }) => (
                <div className="flex w-full justify-between">
                  <div className="text-sm/6">
                    <p className="font-semibold text-gray-700">{option.name}</p>
                    <div className="flex gap-2 text-gray-600">
                      <div>{option.text}</div>
                    </div>
                  </div>
                  {checked && (
                    <div className="w-2 h-2 border-2 border-indigo-600 bg-white rounded-full right-3 absolute" />
                  )}
                </div>
              )}
            </Radio>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
