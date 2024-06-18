"use client";
import Form from "./ui/form";
import ResultsContainer from "./ui/results-container";
import { ResultsSectionTypes } from "./lib/definitions";
import { useState } from "react";
import { performAlgorithm } from "./lib/scheduleAlgorithm";
import { getProcessesAndTable } from "./lib/helperfunctions";
import GitHubIcon from "./ui/github-Icon";

export default function Page() {
  // key to reset the animation
  const [animationKey, setAnimationKey] = useState(0);

  // initial values for the results
  const initialResultsState: ResultsSectionTypes = {
    ganttChartData: [],
    processTableData: [],
    totalAverages: {},
  };
  const [results, setResults] =
    useState<ResultsSectionTypes>(initialResultsState);

  // generate results after the inputs are set
  function generate(
    arrivalValues: number[],
    burstValues: number[],
    priorityValues: number[] | undefined,
    timeSlice: number | undefined,
    algoName: string,
    isPreemptive: boolean
  ) {
    // Get the processes and dictionary
    const { processArray, processTableResults } = getProcessesAndTable(
      arrivalValues,
      burstValues,
      priorityValues
    );

    // perform the algorithm and get the results
    const { gantt, totalAverages } = performAlgorithm(
      processArray,
      processTableResults,
      algoName,
      timeSlice,
      isPreemptive
    );

    // set the results
    setResults({
      ganttChartData: gantt,
      processTableData: processTableResults,
      totalAverages: totalAverages,
    });

    // reset the css animation
    setAnimationKey((prevKey) => prevKey + 1);
  }

  return (
    <div className="flex flex-col items-center px-4 pb-10">
      {/* github icon */}
      <GitHubIcon />

      <main className="max-w-[48rem] w-full">
        {/* form inputs */}
        <Form generate={generate} setResults={setResults} />

        {/* show results if the gantt chart data is not empty */}
        {results.ganttChartData.length > 0 && (
          <ResultsContainer results={results} animationKey={animationKey} />
        )}
      </main>
    </div>
  );
}
