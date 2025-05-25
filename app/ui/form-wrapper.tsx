"use client";

import { PropsScheduleInputTypes } from "../lib/definitions";
import RadioOptions from "./radio-options";
import DropDownBar from "./dropdown-bar";
import FormInputs from "./form-inputs";
import { InputFormError } from "../lib/zod-schema";
import { Preemption, Algorithm } from "@prisma/client";
import { useTransition } from "react";

interface Props {
  state: InputFormError;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  radioSelected: Preemption;
  setRadioSelected: React.Dispatch<React.SetStateAction<Preemption>>;
  algorithmSelected: Algorithm;
  setalgorithmSelected: React.Dispatch<React.SetStateAction<Algorithm>>;
  inputValues: PropsScheduleInputTypes;
  setInputValues: React.Dispatch<React.SetStateAction<PropsScheduleInputTypes>>;
}

const Form = ({
  state,
  formAction,
  isPending,
  radioSelected,
  setRadioSelected,
  algorithmSelected,
  setalgorithmSelected,
  inputValues,
  setInputValues,
}: Props) => {
  // useTransition is used to manage the transition state when resetting the form
  const [isResetting, startResetTransition] = useTransition();

  // reset the input values based on the selected algorithm
  function resetInputValues(algorithm: Algorithm) {
    let newInputState: PropsScheduleInputTypes;

    // Set default values based on the selected algorithm
    switch (algorithm) {
      case Algorithm.fcfs:
        // First come first served
        newInputState = {
          arrivalTimeValues: "2 0 2 3 4",
          burstTimeValues: "2 1 3 5 4",
        };
        break;
      case Algorithm.sjf:
        // Shortest job first
        newInputState = {
          arrivalTimeValues: "2 7 7 2 19",
          burstTimeValues: "2 3 4 2 1",
        };
        break;
      case Algorithm.rr:
        // Round robin values
        newInputState = {
          arrivalTimeValues: "0 5 1 6 8 32",
          burstTimeValues: "8 2 7 3 5 32",
          timeQuantum: "3",
        };
        break;
      case Algorithm.priority:
        // Priority values
        newInputState = {
          arrivalTimeValues: "0 1 3 4 5 6 10",
          burstTimeValues: "8 2 4 1 6 5 1",
          priorityValues: "3 4 4 5 2 6 1",
        };
        break;
      default:
        newInputState = {
          arrivalTimeValues: "2 0 2 3 4",
          burstTimeValues: "2 1 3 5 4",
        };
    }
    return newInputState;
  }

  // dropdown option change
  function onDropDownOptionChange(algorithm: Algorithm) {
    setalgorithmSelected(algorithm);
    setInputValues(resetInputValues(algorithm));
    // reset the radio button based on the selected algorithm
    setRadioSelected(
      algorithm == Algorithm.rr
        ? Preemption.preemptive
        : Preemption.nonPreemptive
    );

    // Create a new FormData object specifically for the reset action
    const resetFormData = new FormData();
    resetFormData.append("__ACTION_RESET_STATE__", "true"); // Use a distinct name for the reset flag

    // Call the formAction to trigger the server action with the reset flag
    startResetTransition(() => {
      formAction(resetFormData);
    });
  }

  return (
    <>
      <form action={formAction}>
        {/* Dropdown options */}
        <DropDownBar
          onDropDownOptionChange={onDropDownOptionChange}
          algorithmSelected={algorithmSelected}
        />

        {/* Radio options for nonpreemptive or preemptive */}
        <RadioOptions
          radioSelected={radioSelected}
          setRadioSelected={setRadioSelected}
          algorithmSelected={algorithmSelected}
        />

        {/* Input fields */}
        <FormInputs
          inputValues={inputValues}
          setInputValues={setInputValues}
          state={state}
          algorithmSelected={algorithmSelected}
          isPending={isPending || isResetting}
        />
      </form>
    </>
  );
};

export default Form;
