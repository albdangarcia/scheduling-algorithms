"use client";
import {
  GenerateFunction,
  PreemptiveOptionsTypes,
  ResultsSectionTypes,
  PropsScheduleInputTypes,
  ScheduleKeysTypes,
  CalculationType,
} from "../lib/definitions";
import { Dispatch, SetStateAction, useActionState, useState } from "react";
import RadioOptions from "./radio-options";
import DropDownBar from "./dropdown-bar";
import FormInputs from "./form-inputs";
import { Session } from "next-auth";
import Nav from "./nav/nav";
import { SignIn } from "./auth/signin-button";
import { createFormInput } from "../lib/actions/calculation";
import { InputFormError } from "../lib/zodSchema/zod-schema";

interface Props {
  generate: GenerateFunction;
  setResults: Dispatch<SetStateAction<ResultsSectionTypes>>;
  userSession: Session | null;
  calcutionsList: CalculationType[];
}

const Form = ({ generate, setResults, userSession, calcutionsList }: Props) => {
  // dropdown options
  const [algorithmSelected, setalgorithmSelected] =
    useState<ScheduleKeysTypes>("fcfs");

  // nonpreemtive or preemtive radio status
  const [radioSelected, setRadioSelected] =
    useState<PreemptiveOptionsTypes>("nonpreemptive");

  // initial values for the inputs
  const initialInputsState: PropsScheduleInputTypes = {
    arrivalTimeValues: "2 0 2 3 4",
    burstTimeValues: "2 1 3 5 4",
  };

  const [inputValues, setInputValues] =
    useState<PropsScheduleInputTypes>(initialInputsState);

  // invalid input message
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Error state for the form
  const initialState = { message: null, errors: {} };
  // Form state
  const [state, dispatch, isPending] = useActionState<InputFormError, FormData>(
    createFormInput,
    initialState
  );
  // const createProcessesWithAlgo = createFormInput.bind(null, algorithmSelected);
  // const [state, dispatch, isPending] = useActionState<InputFormError, FormData>(
  //   createProcessesWithAlgo,
  //   initialState
  // );

  // default values for the inputs depending on the selected dropdrown option
  function getInitialStates(algorithm: ScheduleKeysTypes) {
    // Reset the results on option change
    setResults({
      ganttChartData: [],
      processTableData: [],
      totalAverages: {
        completionTimeAverage: 0,
        turnAroundTimeAverage: 0,
        waitingTimeAverage: 0,
      },
    });

    let newInputState: PropsScheduleInputTypes;
    // Default to nonpreemptive, only change for specific algorithms
    let isPreemptive = false;

    switch (algorithm) {
      case "fcfs":
        // First come first served
        newInputState = {
          arrivalTimeValues: "2 0 2 3 4",
          burstTimeValues: "2 1 3 5 4",
        };
        break;
      case "sjf":
        // Shortest job first
        newInputState = {
          arrivalTimeValues: "2 7 7 2 19",
          burstTimeValues: "2 3 4 2 1",
        };
        break;
      case "rr":
        // Round robin values
        newInputState = {
          arrivalTimeValues: "0 5 1 6 8",
          burstTimeValues: "8 2 7 3 5",
          timeSlice: "3",
        };
        isPreemptive = true; // Round Robin is always preemptive
        break;
      case "priority":
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

    // Set radio selection once based on algorithm type
    setRadioSelected(isPreemptive ? "preemptive" : "nonpreemptive");

    // Reset the invalid input message
    if (errorMessage) setErrorMessage("");
    return newInputState;
  }

  // dropdown option change
  function onDropDownOptionChange(algorithm: ScheduleKeysTypes) {
    setalgorithmSelected(algorithm);
    setInputValues(getInitialStates(algorithm));
  }

  return (
    <>
      {/* shows the nav bar if the user is logged in */}
      {/* if not, show the sign in button */}
      {userSession ? (
        <Nav
          calcutionsList={calcutionsList}
          setalgorithmSelected={setalgorithmSelected}
          setInputValues={setInputValues}
        />
      ) : (
        <SignIn />
      )}

      {/* dropdown options */}
      <DropDownBar
        onDropDownOptionChange={onDropDownOptionChange}
        algorithmSelected={algorithmSelected}
      />

      {/* radio options for nonpreemptive or preemptive */}
      <RadioOptions
        radioSelected={radioSelected}
        setRadioSelected={setRadioSelected}
        algorithmSelected={algorithmSelected}
      />

      {/* inputs */}
      <FormInputs
        inputValues={inputValues}
        setInputValues={setInputValues}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        algorithmSelected={algorithmSelected}
        radioSelected={radioSelected}
        generate={generate}
      />
    </>
  );
};

export default Form;
