import clsx from "clsx";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import {
  Process,
  TotalAveragesRecord,
  TotalAveragesRecordNames,
} from "../lib/definitions";

const tableHeaderLabels = [
  { label: "P-ID" },
  { label: "Arrival Time" },
  { label: "Burst Time" },
  { label: "Completion Time" },
  { label: "Turn Around Time" },
  { label: "Waiting Time" },
];

const TableHeader = () => {
  return (
    <thead className="dark:bg-gray-800/50 rounded-t-md border-b border-gray-300/90 dark:border-gray-700">
      <tr>
        {tableHeaderLabels.map((header) => (
          <th
            key={header.label}
            scope="col"
            className={clsx(
              "px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-400 antialiased text-nowrap",
              header.label === "P-ID" ? "text-left" : "text-right"
            )}
          >
            {header.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

interface ProcessTableProps {
  processTableData: Process[];
  totalAverages: TotalAveragesRecord;
}

// Table component to display process metrics
const ProcessesTable = ({
  processTableData,
  totalAverages,
}: ProcessTableProps) => {
  return (
    <div
      className={clsx(
        "mt-16 flow-root",
        "bg-white dark:bg-gray-800",
        "rounded-md shadow-md",
        "overflow-x-auto"
      )}
    >
      <div className="inline-block min-w-full align-middle px-6 py-3">
        <h3 className="pt-3 pb-2 text-gray-800 dark:text-gray-100">
          Process Metrics
        </h3>
        <table className="min-w-full dark:divide-gray-700">
          <caption className="pb-6 text-xs text-left text-gray-500 dark:text-gray-300">
            Table detailing CPU process metrics including arrival time, burst
            time, and completion time.
          </caption>
          <TableHeader />
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800/60">
            {processTableData.map((process) => (
              <tr
                key={process.id}
                className="text-gray-900 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-900/50"
              >
                {/* process id */}
                <td className="whitespace-nowrap px-4 py-3 text-sm text-left">
                  <div className="flex flex-row items-center justify-start">
                    <div
                      className="w-1 h-4 mr-2"
                      style={{ backgroundColor: process.bgColor }}
                    >
                      &nbsp;
                    </div>
                    <div>{`P${process.id + 1}`}</div>
                  </div>
                </td>
                {/* process information - numerical columns */}
                <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                  {process.arrivalTime}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                  {process.burstTime}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                  {process.completionTime}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                  {process.turnAroundTime}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                  {process.waitingTime}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <tr className="text-gray-900 dark:text-gray-400">
              <td
                colSpan={3} // Spans P-ID, Arrival Time, Burst Time
                className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                <div className="flex flex-row justify-end items-center">
                  <span>Averages</span>
                  <ChevronRightIcon className="w-5 h-5 fill-current ml-1" />
                </div>
              </td>

              {/* Values for Completion Time, Turn Around Time, Waiting Time averages */}
              {TotalAveragesRecordNames.map((id) => {
                const option = totalAverages[id];
                return (
                  <td
                    key={id}
                    className="whitespace-nowrap px-4 py-3 text-sm font-medium bg-gray-100/45 dark:bg-gray-900/45 rounded-sm text-right"
                  >
                    {option}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ProcessesTable;
