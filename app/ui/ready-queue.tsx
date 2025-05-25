import { GanttProcess } from "@/app/lib/definitions";
import clsx from "clsx";
import { IDLE_PROCESS_ID } from "../lib/constants";

interface Props {
  ganttChartData: GanttProcess[];
}

// Renders a visual representation of the ready queue, showing processes waiting to be executed.
const ReadyQueue = ({ ganttChartData }: Props) => {
  return (
    <div className="flex items-center flex-col mb-[28px] mt-4">
      <h3 className="font-medium text-sm text-black dark:text-gray-300 mb-2">
        Ready Queue Visualization
      </h3>
      {/* Container for the process items in the ready queue */}
      <div className="bg-gray-100 dark:bg-gray-800/50 min-w-[57px] flex px-[5px] py-[2px] rounded-sm">
        {ganttChartData.map(
          (
            process,
            i // Filter out idle processes from being displayed in the ready queue
          ) =>
            process.id !== IDLE_PROCESS_ID && (
              <div
                className={clsx(
                  "process-bar-animation flex justify-center items-center text-sm text-gray-800 font-medium",
                  "overflow-hidden w-[43px] h-[29px] mr-[1px] rounded-sm shadow-[0_2px_3px_#bababa5c] dark:shadow-none"
                )}
                key={`${process.id}-${i}`}
                style={{
                  // Dynamic styles for process appearance and animation timing
                  backgroundColor: process.bgColor,
                  animationName: "readyQ-animation, hide-bar-container",
                  animationDuration: "0s, 0.2s",
                  animationTimingFunction: "linear, linear",
                  animationDelay: `${process.arrivalTime}s, ${process.startTime}s`,
                  animationIterationCount: "1, 1",
                  animationDirection: "normal, normal",
                  animationFillMode: "both, forwards",
                  animationPlayState: "running, running",
                }}
              >
                {/* Display process ID (e.g., P1, P2) */}
                <div>{`P${process.id + 1}`}</div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default ReadyQueue;
