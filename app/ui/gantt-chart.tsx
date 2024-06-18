import { GanttProcess } from "@/app/lib/definitions";
import clsx from "clsx";

// container for the zero number range
const zeroNumContainer = (process: GanttProcess) => (
  <div
    className="text-gray-800 text-sm sm:text-base absolute w-[50px] text-center left-[-25px]"
    style={{
      animationDuration: "0.3s",
      animationDelay: `${process.startTime}s`,
      animationName: "fadeInNumbers",
      animationTimingFunction: "linear",
      animationFillMode: "both",
    }}
  >
    <div className="h-2 overflow-hidden text-gray-500">|</div>0
  </div>
);

// get the width of the process bar
const getProcessWidth = (process: GanttProcess, ganttChartData: GanttProcess[]) => {
  return (
    (process.animationDuration /
      ganttChartData[ganttChartData.length - 1].endTime) *
      100 +
    "%"
  );
};

export default function GanttChartResult({
  ganttChartData,
}: {
  ganttChartData: GanttProcess[];
}) {
  return (
    <div className="flex-shrink-0 flex p-[5px] rounded-sm mb-[55px] [&>div:not(:last-child)]:mr-[1px]">
      {ganttChartData.map((process, i) => (
        <div key={process.startTime} style={{ width: getProcessWidth(process, ganttChartData) }}>
          <div className="relative">
            <div
              title={process.id !== -1 ? `P${process.id}` : "idle"}
              className={clsx(
                "text-sm font-medium flex items-center justify-center rounded-[3px] h-[29px] shadow-[0_2px_3px_#bababa5c]",
                process.id === -1 ? "bg-[repeating-linear-gradient(-55deg,_#f7f7f7,_#f7f7f7_10px,_#FFF_10px,_#FFF_20px)] tracking-wider text-gray-700" : `text-gray-800`,
              )}
              style={{
                backgroundColor: process.bgColor,
                animationDuration: `${process.animationDuration}s`,
                animationDelay: `${process.startTime}s`,
                animationTimingFunction: "linear",
                animationFillMode: "both",
                animationName: "width-animation",
              }}
            >
              <div className="text-ellipsis whitespace-nowrap overflow-hidden"
              >
                {process.id !== -1 ? `P${process.id}` : "idle"}
              </div>
            </div>

            {/* show the zero number container which contains '0' 
                for the first process bar */}
            {i === 0 && zeroNumContainer(process)}

            {/* floating range numbers */}
            <div
              className="text-gray-800 absolute text-sm sm:text-base w-[50px] text-center right-[-26px]"
              style={{
                animationDuration: "0.3s",
                animationDelay: `${process.endTime}s`,
                animationName: "fadeInNumbers",
                animationTimingFunction: "linear",
                animationFillMode: "both",
              }}
            >
              <div className="h-2 overflow-hidden text-gray-500">|</div>
              {process.endTime}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
