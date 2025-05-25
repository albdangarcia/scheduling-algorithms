"use client";

import { ResultsSectionTypes } from "../lib/definitions";
import ReadyQueue from "./ready-queue";
import GanttChartResult from "./gantt-chart";
import { useState } from "react";
import ProcessesTable from "./processes-table";
import { ArrowPathIcon } from "@heroicons/react/16/solid";

const ResultsContainer = ({
  uniqueId,
  ganttChartData,
  processTableData,
  totalAverages,
}: ResultsSectionTypes) => {
  // This is used to force re-render the animation when the reset button is clicked
  const [resetAnimation, setResetAnimation] = useState(0);

  // Function to handle reset button click
  const handleReset = () => {
    setResetAnimation((prevKey) => prevKey + 1);
  };

  return (
    <div className="mt-11">
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={handleReset}
          aria-label="Reset Animation"
          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 flex items-center"
        >
          <ArrowPathIcon className="w-4 h-4 fill-current mr-1" />
          <span className="text-xs font-medium">Reset</span>
        </button>
      </div>

      {/* Animations */}
      <div key={`${uniqueId}-${resetAnimation}`}>
        {/* ready queue animation */}
        <ReadyQueue ganttChartData={ganttChartData} />

        {/* gantt chart animation  */}
        <GanttChartResult ganttChartData={ganttChartData} />
      </div>

      {/* Results Table */}
      <ProcessesTable
        processTableData={processTableData}
        totalAverages={totalAverages}
      />

      {/* Show formulas below table */}
      <div className="text-xs text-gray-400 pt-4 tracking-wide">
        <div>Completion Time = The time a process finishes execution</div>
        <div>Turn Around Time = Completion Time - Arrival Time</div>
        <div>WaitingTime = Turn Around Time - Burst Time</div>
      </div>
    </div>
  );
};

export default ResultsContainer;
