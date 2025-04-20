import { Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
import { z } from "zod";
import {
  GenerateFunction,
  PreemptiveOptionsTypes,
  PropsScheduleInputTypes,
  ScheduleKeysTypes,
} from "../lib/definitions";
import {
  convertTimeSliceToNum,
  convertToNumArray,
} from "../lib/helperfunctions";
import {
  CreateFormSchema,
  InputFormError,
  ScheduleInputTypes,
  scheduleInputSchema,
} from "../lib/zodSchema/zod-schema";
import { useActionState } from "react";
import { createFormInput } from "../lib/actions/calculation";

interface Props {
  inputValues: PropsScheduleInputTypes;
  setInputValues: React.Dispatch<React.SetStateAction<PropsScheduleInputTypes>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  algorithmSelected: ScheduleKeysTypes;
  radioSelected: PreemptiveOptionsTypes;
  generate: GenerateFunction;
}

const FormInputs = ({
  inputValues,
  setInputValues,
  errorMessage,
  setErrorMessage,
  algorithmSelected,
  radioSelected,
  generate,
}: Props) => {

  // handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    inputKey: keyof PropsScheduleInputTypes
  ) => {
    const valueToValidate = e.target.value;

    try {
      // Create a temporary object with only the field being changed
      const validationResult = scheduleInputSchema
        .partial()
        .safeParse({ [inputKey]: valueToValidate });

      if (validationResult.success) {
        // If valid, update the state, clear the general error message
        setInputValues({
          ...inputValues,
          [inputKey]: valueToValidate.replace(/[^\d\s]/g, ""), // Still clean unwanted characters
        });
        setErrorMessage(""); // Clear the error message here
        // Optionally clear specific error messages if you implement them per field
      } else {
        // If invalid, set a specific error message
        console.log(
          "Validation Error for",
          inputKey,
          validationResult.error.issues
        );
        setErrorMessage(`Invalid input for ${inputKey}`); // Or a more specific message
      }
    } catch (error) {
      console.error("Error during validation:", error);
      setErrorMessage("An unexpected error occurred during validation.");
    }
  };

  function handleSubmit() {
    setErrorMessage(""); // Clear previous errors on submit

    try {
      const parsedData = CreateFormSchema.parse(inputValues);

      let arrivalValues: number[] = convertToNumArray(
        parsedData.arrivalTimeValues,
        true
      );
      let burstValues: number[] = convertToNumArray(
        parsedData.burstTimeValues,
        false
      );
      let priorityValues: number[] | undefined = parsedData.priorityValues
        ? convertToNumArray(parsedData.priorityValues, true)
        : undefined;
      let timeSlice: number | undefined = parsedData.timeSlice
        ? convertTimeSliceToNum(parsedData.timeSlice)
        : undefined;

      // Check if the arrays have the same length
      if (
        arrivalValues.length !== burstValues.length ||
        (priorityValues && priorityValues.length !== arrivalValues.length)
      ) {
        setErrorMessage(
          "All input arrays except for Time Slice must have the same length"
        );
        return;
      }

      // limit the input values to 20
      if (arrivalValues.length > 20) {
        setErrorMessage("Only 20 values are allowed");
        return;
      }

      // Generate the results
      generate({
        arrivalValues,
        burstValues,
        priorityValues,
        timeSlice,
        algorithm: algorithmSelected,
        isPreemptive: radioSelected === "preemptive",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into a user-friendly message
        const formattedErrors = error.issues
          .map((issue) => issue.message)
          .join(", ");
        setErrorMessage(`Validation Error: ${formattedErrors}`);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
      return;
    }
  }

  return (
    <div>
      <div
        className={clsx(
          "grid grid-cols-2 md:flex h-40 justify-items-center content-center justify-center items-center gap-x-2 gap-y-3"
        )}
      >
        {/* arrival input values */}
        <Field className="w-full min-w-36 max-w-64 justify-self-end focus-within:ring-indigo-500 shadow-sm ring-indigo-200 ring-1 ring-inset pt-2.5 pb-1.5 px-3 rounded-md bg-white">
          <Label
            htmlFor="arrivalValues"
            className="text-sm font-medium text-gray-800 block"
          >
            Arrival Times
          </Label>
          <Input
            id="arrivalValues"
            placeholder="Enter Arrival Times"
            value={inputValues.arrivalTimeValues}
            onChange={(e) => handleInputChange(e, "arrivalTimeValues")}
            className="bg-transparent input-style block w-full border-none p-0 text-base text-gray-900 placeholder:text-sm focus:outline-none"
          />
        </Field>

        {/* burst input values */}
        <Field className="w-full min-w-36 max-w-64 justify-self-start focus-within:ring-indigo-500 shadow-sm ring-indigo-200 ring-1 ring-inset pt-2.5 pb-1.5 px-3 rounded-md bg-white">
          <Label
            htmlFor="burstValues"
            className="text-sm font-medium text-gray-800 block"
          >
            Burst Times
          </Label>
          <Input
            id="burstValues"
            placeholder="Enter Burst Times"
            value={inputValues.burstTimeValues}
            onChange={(e) => handleInputChange(e, "burstTimeValues")}
            className="bg-transparent input-style block w-full border-none p-0 text-base text-gray-900 placeholder:text-sm focus:outline-none"
          />
        </Field>

        {/* priority input values */}
        {inputValues.priorityValues != undefined && (
          <Field className="w-full min-w-36 max-w-64 justify-self-end focus-within:ring-indigo-500 shadow-sm ring-indigo-200 ring-1 ring-inset pt-2.5 pb-1.5 px-3 rounded-md bg-white">
            <Label
              htmlFor="priorityValues"
              className="text-sm font-medium text-gray-800 block"
            >
              Priority Times
            </Label>
            <Input
              id="priorityValues"
              placeholder="Enter Priority Times"
              value={inputValues.priorityValues}
              onChange={(e) => handleInputChange(e, "priorityValues")}
              className="bg-transparent input-style block w-full border-none p-0 text-base text-gray-900 placeholder:text-sm focus:outline-none"
            />
          </Field>
        )}

        {/* time slice input value */}
        {inputValues.timeSlice != undefined && (
          <Field className="col-span-2 justify-self-center text-center w-24 focus-within:ring-indigo-500 shadow-sm ring-indigo-200 ring-1 ring-inset pt-2.5 pb-1.5 px-3 rounded-md bg-white">
            <Label
              htmlFor="timeSliceValue"
              className="text-sm font-medium text-gray-800 block"
            >
              Time Slice
            </Label>
            <Input
              id="timeSliceValue"
              placeholder="Time"
              value={inputValues.timeSlice}
              onChange={(e) => handleInputChange(e, "timeSlice")}
              className="text-center bg-transparent input-style block w-full border-none p-0 text-base text-gray-900 placeholder:text-sm focus:outline-none"
            />
          </Field>
        )}
      </div>

      {/* generate button */}
      <div className="flex items-center flex-col">
        <button
          onClick={handleSubmit}
          className="text-white text-sm px-4 py-2 rounded-md shadow-md bg-indigo-600 hover:bg-indigo-700"
          aria-label="Generate"
        >
          Generate
        </button>

        {/* error message */}
        {errorMessage && (
          <div className="leading-8 text-red-700 text-sm font-medium px-2 mt-1 bg-red-100/70 rounded border-red-200/50 border">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormInputs;
