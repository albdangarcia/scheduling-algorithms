import { Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
import { RadioOptionType, ScheduleInputTypes, ScheduleType } from "../lib/definitions";
import { convertTimeSliceToNum, convertToNumArray } from "../lib/helperfunctions";

export default function FormInputs({
  inputValues,
  setInputValues,
  errorMessage,
  setErrorMessage,
  optionSelected,
  radioSelected,
  generate,
}: {
  inputValues: ScheduleInputTypes;
  setInputValues: React.Dispatch<React.SetStateAction<ScheduleInputTypes>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  optionSelected: ScheduleType;
  radioSelected: RadioOptionType
  generate: (
    arrivalValues: number[],
    burstValues: number[],
    priorityValues: number[] | undefined,
    timeSlice: number | undefined,
    algoName: string,
    preemptive: boolean
  ) => void;
}) {
  // handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    inputKey: keyof ScheduleInputTypes
  ) => {
    // Remove letters and multiple spaces
    let lettersRegexp: RegExp = /[^\d\s]/g;
    const cleanedValue = e.target.value.replace(lettersRegexp, "");

    // Set the input values
    setInputValues({
      ...inputValues,
      [inputKey]: cleanedValue,
    });
  };

  // function handleSubmit(prevState: CreateFormState, formData: FormData) {
  function handleSubmit() {
    let arrivalValues: number[] = [];
    let burstValues: number[] = [];
    let priorityValues: number[] | undefined;
    let timeSlice: number | undefined;

    // Convert the input values to number arrays
    try {
      arrivalValues = convertToNumArray(inputValues.arrivalTimeValues, true);
      burstValues = convertToNumArray(inputValues.burstTimeValues, false);
      priorityValues = inputValues.priorityValues
        ? convertToNumArray(inputValues.priorityValues, true)
        : undefined;
      timeSlice = inputValues.timeSlice
        ? convertTimeSliceToNum(inputValues.timeSlice)
        : undefined;
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        return;
      }
    }

    // Check if priority values and time slice are required
    if (
      (inputValues.priorityValues !== undefined &&
        priorityValues === undefined) ||
      (inputValues.timeSlice !== undefined && timeSlice === undefined)
    ) {
      setErrorMessage("Input values are required");
      return;
    }

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
    generate(
      arrivalValues,
      burstValues,
      priorityValues,
      timeSlice,
      optionSelected.abbr,
      radioSelected.id === 2 ? true : false // id 1: non-preemtive, id 2: preemtive
    );
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
          <Label htmlFor="arrivalValues"  className="text-sm font-medium text-gray-800 block">
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
          <Label htmlFor="burstValues" className="text-sm font-medium text-gray-800 block">
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
            <Label htmlFor="priorityValues" className="text-sm font-medium text-gray-800 block">
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
            <Label htmlFor="timeSliceValue" className="text-sm font-medium text-gray-800 block">
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
        {errorMessage && <div className="leading-8 text-red-700 text-sm px-2 mt-1 bg-red-100/70 rounded border-red-200/50 border">{errorMessage}</div>}
      </div>
    </div>
  );
}
