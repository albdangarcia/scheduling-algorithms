import clsx from "clsx";
import {
  ResultsSectionTypes,
  TotalAveragesRecordNames,
} from "../lib/definitions";
import ReadyQueue from "./ready-queue";
import GanttChartResult from "./gantt-chart";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

const tableHeaders = [
  { name: "P-ID", abbr: "P-ID" },
  { name: "Arrival Time", abbr: "AT" },
  { name: "Burst Time", abbr: "BT" },
  { name: "Completion Time", abbr: "CT" },
  { name: "Turn Around Time", abbr: "TAT" },
  { name: "Waiting Time", abbr: "WT" },
];

interface Props {
  results: ResultsSectionTypes;
  animationKey: number;
}

const ResultsContainer = ({ results, animationKey }: Props) => {
  return (
    <div className="mt-5">
      <h1 className="text-xl text-gray-800 p-2">Animation</h1>

      <div key={animationKey}>
        {/* ready queue animation */}
        <ReadyQueue ganttChartData={results.ganttChartData} />
        {/* gantt chart animation  */}
        <GanttChartResult ganttChartData={results.ganttChartData} />
      </div>

      {/* table wrapper */}
      <div className="mt-16 bg-white border border-indigo-200 rounded-md shadow-sm pb-4 text-center pt-1">
        {/* table headers */}
        <div className="text-gray-400 grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] grid gap-4 px-4 py-4 rounded-t-md antialiased">
          {tableHeaders.map((header, i) => (
            <div
              key={header.name}
              className={clsx("font-medium text-sm", { "pl-1": i === 0 })}
            >
              <div className="hidden md:block text-nowrap">{header.name}</div>
              <div className="md:hidden">{header.abbr}</div>
            </div>
          ))}
        </div>

        {/* table contents */}
        <div className="">
          {results.processTableData.map((process) => (
            <div
              key={process.id}
              className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] gap-4 py-2 text-gray-900 hover:bg-gray-100/50 px-4"
            >
              {/* process id */}
              <div className="flex flex-row justify-center">
                <div
                  className="w-1 mr-1"
                  style={{ backgroundColor: process.bgColor }}
                >
                  &nbsp;
                </div>
                <div>{`P${process.id + 1}`}</div>
              </div>
              {/* process information */}
              <div>{process.arrivalTime}</div>
              <div>{process.burstTime}</div>
              <div>{process.completionTime}</div>
              <div>{process.turnAroundTime}</div>
              <div>{process.waitingTime}</div>
            </div>
          ))}

          {/* averages */}
          <div className="grid gap-4 grid-cols-[50px,1fr,1fr,1fr,1fr,1fr] py-2 text-gray-900 hover:bg-gray-100/50 px-4">
            <div className="flex flex-row justify-end col-span-3 items-center">
              <div className="text-gray-700 font-medium text-sm">Averages</div>
              <ChevronRightIcon className="w-5 h-5 fill-gray-700" />
            </div>

            {/* process information */}
            {TotalAveragesRecordNames.map((id) => {
              const option = results.totalAverages[id];
              return (
                <div
                  key={id}
                  className="bg-gray-100/45 rounded-sm text-gray-900 font-medium"
                >
                  {option}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* formulas below table */}
      <div className="text-xs text-gray-400 pt-4 tracking-wide">
        <div>Completion Time = The time a process finishes execution</div>
        <div>Turn Around Time = Completion Time - Arrival Time</div>
        <div>WaitingTime = Turn Around Time - Burst Time</div>
      </div>
    </div>
  );
};

export default ResultsContainer;
