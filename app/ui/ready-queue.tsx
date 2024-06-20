import { GanttProcess } from "@/app/lib/definitions";

export default function ReadyQueue({
  ganttChartData,
}: {
  ganttChartData: GanttProcess[];
}) {
  return (
    <div className="flex items-center flex-col mb-[28px]">
      <h5 className="font-medium text-sm">Ready Queue</h5>
      <div className="bg-gray-100 min-w-[57px] flex px-[5px] py-[2px] rounded-sm">
        {ganttChartData.map(
          (process, i) =>
            process.id !== -1 && (
              <div
                className="flex justify-center items-center text-sm text-gray-800 font-medium overflow-hidden w-[43px] h-[29px] mr-[1px] rounded-sm shadow-[0_2px_3px_#bababa5c]"
                key={`${process.id}-${i}`}
                style={{
                  backgroundColor: process.bgColor,
                  animationName: "readyQAnimation, hideBarContainer",
                  animationDuration: "0s, 0.2s",
                  animationTimingFunction: "linear, linear",
                  animationDelay: `${process.arrivalTime}s, ${process.startTime}s`,
                  animationIterationCount: "1, 1",
                  animationDirection: "normal, normal",
                  animationFillMode: "both, forwards",
                  animationPlayState: "running, running",
                }}
              >
                <div>{`P${process.id + 1}`}</div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
