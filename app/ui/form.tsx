"use client";
import {
  RadioOptionType,
  ResultsSectionTypes,
  ScheduleInputTypes,
  ScheduleType,
} from "../lib/definitions";
import { Dispatch, SetStateAction, useState } from "react";
import RadioOptions, { preemtiveOptions } from "./radio-options";
import DropDownBar, { dropDownOptions } from "./dropdown-bar";
import FormInputs from "./form-inputs";

export default function Form({
  generate,
  setResults,
}: {
  generate: (
    arrivalValues: number[],
    burstValues: number[],
    priorityValues: number[] | undefined,
    timeSlice: number | undefined,
    algorithm: string,
    isPreemptive: boolean
  ) => void;
  setResults: Dispatch<SetStateAction<ResultsSectionTypes>>;
}) {
  // dropdown options
  const [optionSelected, setOptionSelected] = useState(dropDownOptions[0]);

  // disable the radio button
  const [disableRadioButton, setDisableRadioButton] = useState<
    RadioOptionType | undefined
  >(preemtiveOptions[1]);

  // nonpreemtive or preemtive radio status
  const [radioSelected, setRadioSelected] = useState<RadioOptionType>(
    preemtiveOptions[0]
  );
  // initial values for the inputs
  const initialInputsState: ScheduleInputTypes = {
    arrivalTimeValues: "2 0 2 3 4",
    burstTimeValues: "2 1 3 5 4",
  };
  const [inputValues, setInputValues] =
    useState<ScheduleInputTypes>(initialInputsState);

  const [errorMessage, setErrorMessage] = useState<string>("");

  // default values for the inputs depending on the selected dropdrown option
  function getInitialStates(id: number) {
    // reset the results on option change
    setResults({
      ganttChartData: [],
      processTableData: [],
      totalAverages: {},
    });
    switch (id) {
      case 1:
        // first come first served
        initialInputsState.arrivalTimeValues = "2 0 2 3 4";
        initialInputsState.burstTimeValues = "2 1 3 5 4";
        setRadioSelected(preemtiveOptions[0]);
        setDisableRadioButton(preemtiveOptions[1]);
        break;
      case 2:
        // shortest job first
        initialInputsState.arrivalTimeValues = "2 7 7 2 19";
        initialInputsState.burstTimeValues = "2 3 4 2 1";
        setRadioSelected(preemtiveOptions[0]);
        setDisableRadioButton(undefined);
        break;
      case 3:
        // round robin values
        initialInputsState.arrivalTimeValues = "0 5 1 6 8";
        initialInputsState.burstTimeValues = "8 2 7 3 5";
        initialInputsState.timeSlice = "3";
        setRadioSelected(preemtiveOptions[1]);
        setDisableRadioButton(preemtiveOptions[0]);
        break;
      case 4:
        // priority values
        initialInputsState.arrivalTimeValues = "0 1 3 4 5 6 10";
        initialInputsState.burstTimeValues = "8 2 4 1 6 5 1";
        initialInputsState.priorityValues = "3 4 4 5 2 6 1";
        setRadioSelected(preemtiveOptions[0]);
        setDisableRadioButton(undefined);
        break;
    }

    // reset the invalid input message
    if (errorMessage) setErrorMessage("");

    return initialInputsState;
  }

  // dropdown option change
  function onDropDownOptionChange(value: ScheduleType) {
    setOptionSelected(value);
    setInputValues(getInitialStates(value.id));
  }

  return (
    <>
      {/* dropdown options */}
      <DropDownBar
        onDropOptionChange={onDropDownOptionChange}
        optionSelected={optionSelected}
      />

      {/* radio options for nonpreemtive or preemtive */}
      <RadioOptions
        selected={radioSelected}
        setSelected={setRadioSelected}
        disableRadioButton={disableRadioButton}
      />
        
      {/* inputs */}
      <FormInputs
        inputValues={inputValues}
        setInputValues={setInputValues}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        optionSelected={optionSelected}
        radioSelected={radioSelected}
        generate={generate}
      />
    </>
  );
}
