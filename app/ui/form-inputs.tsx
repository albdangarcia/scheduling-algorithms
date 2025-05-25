"use client";

import clsx from "clsx";
import React from "react";
import { PropsScheduleInputTypes } from "../lib/definitions";
import { InputFormError } from "../lib/zod-schema";
import { Algorithm } from "@prisma/client";
import FormField from "./formField";

interface Props {
  inputValues: PropsScheduleInputTypes;
  setInputValues: React.Dispatch<React.SetStateAction<PropsScheduleInputTypes>>;
  state: InputFormError;
  algorithmSelected: Algorithm;
  isPending: boolean;
}

const FormInputs = ({
  inputValues,
  setInputValues,
  algorithmSelected,
  state,
  isPending,
}: Props) => {
  // handle input change with validation
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    inputKey: keyof PropsScheduleInputTypes // This key is now passed from FormField
  ) => {
    const rawValue = e.target.value;
    let cleanedValue = rawValue;

    // Clean input based on field type & Basic Validation
    if (
      inputKey === "arrivalTimeValues" ||
      inputKey === "burstTimeValues" ||
      inputKey === "priorityValues"
    ) {
      // Remove non-digits and non-spaces, then replace multiple spaces with a single space, and trim leading space.
      cleanedValue = rawValue
        .replace(/[^\d\s]/g, "")
        .replace(/\s+/g, " ")
        .trimStart();
    } else if (inputKey === "timeQuantum") {
      // Allow only digits
      cleanedValue = rawValue.replace(/[^\d]/g, "");
    }

    // Set the cleaned value to the state
    setInputValues((prev) => ({
      ...prev,
      [inputKey]: cleanedValue,
    }));
  };

  return (
    <div>
      <div
        className={clsx(
          "grid grid-cols-2 md:flex justify-items-center justify-center items-start",
          "gap-x-4 gap-y-6 mb-6 mt-12"
        )}
      >
        {/* Arrival Times */}
        <FormField
          fieldContainerClassName="w-full min-w-36 max-w-64 justify-self-end"
          id="arrivalValues"
          name="arrivalTimeValues"
          label="Arrival Times"
          srOnlyDescription="Enter space-separated numbers for process arrival times."
          placeholder="e.g., 0 5 1 6 8"
          value={inputValues.arrivalTimeValues}
          onChange={handleInputChange}
          errors={state.errors?.arrivalTimeValues}
        />

        {/* Burst Times */}
        <FormField
          fieldContainerClassName="w-full min-w-36 max-w-64 justify-self-start"
          id="burstValues"
          name="burstTimeValues"
          label="Burst Times"
          srOnlyDescription="Enter space-separated numbers for process burst times."
          placeholder="e.g., 8 2 7 3 5"
          value={inputValues.burstTimeValues}
          onChange={handleInputChange}
          errors={state.errors?.burstTimeValues}
        />

        {/* Priority Times (Conditional) */}
        {algorithmSelected === Algorithm.priority && (
          <FormField
            fieldContainerClassName="w-full min-w-36 max-w-64 justify-self-end"
            id="priorityValues"
            name="priorityValues"
            label="Priority Values"
            srOnlyDescription="Enter space-separated numbers for process priority values (lower number means higher priority)."
            placeholder="e.g., 1 5 2 8 3"
            value={inputValues.priorityValues ?? ""}
            onChange={handleInputChange}
            errors={state.errors?.priorityValues}
            required={true} // Explicitly required for this field
          />
        )}

        {/* Time Quantum (Conditional) */}
        {algorithmSelected === Algorithm.rr && (
          <FormField
            fieldContainerClassName="col-span-2 justify-self-center text-center w-32"
            id="timeQuantumValue"
            name="timeQuantum"
            label="Quantum"
            srOnlyDescription="Enter a single number for the time quantum (slice) for Round Robin."
            placeholder="e.g., 3"
            value={inputValues.timeQuantum ?? ""}
            onChange={handleInputChange}
            errors={state.errors?.timeQuantum}
            inputClassName="text-center" // Specific style for the input itself
            required={true} // Explicitly required
          />
        )}
      </div>

      <div className="flex items-center flex-col">
        <button
          type="submit"
          disabled={isPending}
          className={clsx(
            "text-white text-sm px-4 py-2 mt-3 rounded-md shadow-md bg-indigo-600 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPending ? "Generating..." : "Generate"}
        </button>
        {/* General errors */}
        <div id="general-error" aria-live="polite" aria-atomic="true">
          {state.message && (
            <p
              className="mt-2 text-sm text-red-600 dark:text-rose-600"
              key={state.message}
            >
              {state.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormInputs;
