import { GanttProcess } from "@/app/lib/definitions";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { IDLE_PROCESS_ID } from "../lib/constants";

// --- Configuration Constants ---
const PIXELS_PER_TIME_UNIT = 28; // Determines how many pixels represent one unit of time (e.g., a second).
const MIN_PROCESS_BAR_WIDTH_PX = 48; // Minimum width for any process bar in pixels.
const IDLE_PROCESS_MAX_WIDTH_PX = 70; // Maximum width for an idle process bar in pixels, to prevent it from taking too much space.
const PROCESS_BAR_MARGIN_RIGHT_PX = 1; // Margin to the right of each process bar in pixels.
const BAR_HEIGHT_PX = 29; // Height of each process bar in pixels.
const CHART_CONTAINER_HORIZONTAL_PADDING_PX = 30; // Horizontal padding for the main chart container.
const ORIGINAL_LOGIC_MINIMAL_PADDING_PX = 10; // Minimal padding used in a previous sizing logic, retained for comparison.

// Renders a small vertical line segment
const VerticalLine = () => (
  <div className="h-2 text-gray-500 dark:text-gray-400 flex justify-center items-center mb-px">
    {/* SVG element for the vertical line */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-[1.5px] h-full"
      viewBox="0 0 1.5 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <line x1="0.75" y1="0" x2="0.75" y2="8" />
    </svg>
  </div>
);

interface TimeMarkerProps {
  value: number | string;
  animationDelay: string;
  alignment: "left" | "right";
}

/**
 * @component TimeMarker
 * Renders a time value (e.g., start or end time) typically displayed below a Gantt chart bar.
 * It includes a vertical line and uses a fade-in animation.
 * @param {object} props - The component's props.
 * @param {number | string} props.value - The time value to display (e.g., 0, process.endTime).
 * @param {string} props.animationDelay - The CSS animation-delay string (e.g., "0.5s").
 * @param {'left' | 'right'} props.alignment - Determines the positioning of the marker relative to its anchor.
 * 'left' positions it to the start (e.g., for a '0' marker).
 * 'right' positions it to the end (e.g., for an end time marker).
 */
const TimeMarker = ({ value, animationDelay, alignment }: TimeMarkerProps) => (
  <div
    className={clsx(
      "text-gray-800 dark:text-gray-400 text-sm sm:text-base absolute w-[50px] text-center",
      alignment === "left" ? "left-[-25px]" : "right-[-25px]"
    )}
    style={{
      top: `${BAR_HEIGHT_PX}px`, // Positioned below the process bar height
      // Animation styles for a fade-in effect
      animationDuration: "0.3s",
      animationDelay: animationDelay,
      animationName: "fadeInNumbers",
      animationTimingFunction: "linear",
      animationFillMode: "both",
    }}
  >
    <VerticalLine />
    {value}
  </div>
);

interface GanttChartResultProps {
  ganttChartData: GanttProcess[];
}

/**
 * @component GanttChartResult
 * Renders the main Gantt chart based on the provided scheduling data.
 * It dynamically adjusts the width of process bars and the overall chart
 * to fit the available space or become scrollable.
 * @param {GanttChartResultProps} props
 */
const GanttChartResult = ({ ganttChartData }: GanttChartResultProps) => {
  // State to track if the component has mounted on the client-side
  // This is used to safely access `window.innerWidth`
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true); // Set to true after component mounts
  }, []);

  // Handle cases where there is no data to display
  if (!ganttChartData || ganttChartData.length === 0) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        No scheduling data to display.
      </div>
    );
  }

  // --- Calculate initial width sums for layout decisions ---
  let sumOfIdealBarWidthsAndMargins = 0; // Sum of calculated ideal widths for all bars plus their margins
  let sumOfMinBarWidthsAndMargins = 0; // Sum of minimum possible widths for all bars plus their margins
  const numBars = ganttChartData.length; // Total number of process bars

  // Iterate over each process to calculate its contribution to the total width
  ganttChartData.forEach((process, i) => {
    // Calculate the "ideal" width based on duration and pixels per time unit
    let idealBarWidthPx = process.animationDuration * PIXELS_PER_TIME_UNIT;

    // Apply special width constraints for idle processes
    if (process.id === IDLE_PROCESS_ID) {
      idealBarWidthPx = Math.min(idealBarWidthPx, IDLE_PROCESS_MAX_WIDTH_PX);
    }
    // Ensure the bar width is not less than the minimum defined width
    idealBarWidthPx = Math.max(idealBarWidthPx, MIN_PROCESS_BAR_WIDTH_PX);

    sumOfIdealBarWidthsAndMargins += idealBarWidthPx;
    sumOfMinBarWidthsAndMargins += MIN_PROCESS_BAR_WIDTH_PX; // Each bar contributes at least its minimum width

    // Add margin if it's not the last bar
    if (i < numBars - 1) {
      sumOfIdealBarWidthsAndMargins += PROCESS_BAR_MARGIN_RIGHT_PX;
      sumOfMinBarWidthsAndMargins += PROCESS_BAR_MARGIN_RIGHT_PX;
    }
  });

  // Determine the reference width for layout calculations
  // Uses 90% of window width if available, otherwise defaults to 800px
  const clientReferenceWidth =
    isClient && typeof window !== "undefined" && window.innerWidth > 0
      ? window.innerWidth * 0.9
      : 800;
  const referenceWidth = clientReferenceWidth > 0 ? clientReferenceWidth : 800; // Ensure referenceWidth is positive

  // --- Logic to determine flex behavior and container width ---
  let useFlexGrowForBarsFinal: boolean; // Flag to determine if bars should use flex-grow
  let innerFlexContainerWidthStyleFinal: string; // CSS width style for the inner container
  let displayScrollMessageFinal: boolean; // Flag to show/hide the horizontal scroll message

  // Estimate the width needed if using the original logic (for comparison/transition)
  const estimatedWidthForOriginalFlexDecision =
    sumOfIdealBarWidthsAndMargins + ORIGINAL_LOGIC_MINIMAL_PADDING_PX;

  // Determine if the original layout logic would have used flex-grow
  const originalLogicWouldFlex =
    numBars > 0 && estimatedWidthForOriginalFlexDecision <= referenceWidth;

  if (originalLogicWouldFlex) {
    // If original logic would flex, check if new design can accommodate minimum widths with flex
    const actualFlexSpaceInNewDesign =
      referenceWidth - 2 * CHART_CONTAINER_HORIZONTAL_PADDING_PX;
    if (sumOfMinBarWidthsAndMargins <= actualFlexSpaceInNewDesign) {
      // If minimum widths fit, use flex-grow and set container width to 100%
      useFlexGrowForBarsFinal = true;
      innerFlexContainerWidthStyleFinal = "100%";
      displayScrollMessageFinal = false; // No scroll message needed
    } else {
      // If minimum widths don't fit even with flex, revert to fixed widths
      useFlexGrowForBarsFinal = false;
      innerFlexContainerWidthStyleFinal = `${
        sumOfIdealBarWidthsAndMargins +
        CHART_CONTAINER_HORIZONTAL_PADDING_PX * 2 // Add padding to the sum of ideal widths
      }px`;
      // Display scroll message if the calculated width exceeds the reference width
      displayScrollMessageFinal =
        innerFlexContainerWidthStyleFinal.endsWith("px") &&
        parseInt(innerFlexContainerWidthStyleFinal, 10) > referenceWidth;
    }
  } else {
    useFlexGrowForBarsFinal = false;
    innerFlexContainerWidthStyleFinal = `${
      sumOfIdealBarWidthsAndMargins + CHART_CONTAINER_HORIZONTAL_PADDING_PX * 2
    }px`;
    // Display scroll message if there are bars and the calculated width exceeds the reference width
    displayScrollMessageFinal =
      numBars > 0 &&
      innerFlexContainerWidthStyleFinal.endsWith("px") &&
      parseInt(innerFlexContainerWidthStyleFinal, 10) > referenceWidth;
  }

  return (
    <div className="gantt-chart-container mb-[55px]">
      {/* Container for horizontal scrolling */}
      <div className="w-full overflow-x-auto overflow-y-hidden flex-shrink-0">
        {/* Inner container for the process bars, styled dynamically */}
        <div
          className="flex pt-[5px] pb-8 rounded-sm relative"
          style={{
            paddingLeft: `${CHART_CONTAINER_HORIZONTAL_PADDING_PX}px`,
            paddingRight: `${CHART_CONTAINER_HORIZONTAL_PADDING_PX}px`,
            width: innerFlexContainerWidthStyleFinal,
          }}
        >
          {ganttChartData.map((process, i) => {
            // Calculate styles for each process bar
            const processSegmentStyle: React.CSSProperties = {
              position: "relative",
              height: `${BAR_HEIGHT_PX}px`,
              marginRight:
                i < ganttChartData.length - 1 // Add right margin unless it's the last bar
                  ? `${PROCESS_BAR_MARGIN_RIGHT_PX}px`
                  : "0px",
            };

            if (useFlexGrowForBarsFinal) {
              // If using flex-grow, set flex properties
              processSegmentStyle.flexGrow =
                process.animationDuration > 0 ? process.animationDuration : 0.1; // Grow based on duration, with a minimum if duration is 0
              processSegmentStyle.flexShrink = 1; // Allow shrinking
              processSegmentStyle.flexBasis = "0px"; // Start from 0 basis for flex-grow
              processSegmentStyle.minWidth = `${MIN_PROCESS_BAR_WIDTH_PX}px`; // Ensure minimum width

              // Special handling for idle processes when using flex-grow
              if (process.id === IDLE_PROCESS_ID) {
                const idleNaturalWidth =
                  process.animationDuration * PIXELS_PER_TIME_UNIT;
                // Limit max width for idle processes, allowing some flexibility
                processSegmentStyle.maxWidth = `${Math.min(
                  idleNaturalWidth,
                  IDLE_PROCESS_MAX_WIDTH_PX * 2 // Allow idle to grow a bit more if space allows
                )}px`;
                if (process.animationDuration === 0) {
                  processSegmentStyle.flexGrow = 0.5; // Give some grow factor even for zero duration idle
                }
              }
            } else {
              // If not using flex-grow, calculate a fixed width for the bar
              let targetBarWidthPx =
                process.animationDuration * PIXELS_PER_TIME_UNIT;

              // Apply constraints for idle process width
              if (process.id === IDLE_PROCESS_ID) {
                targetBarWidthPx = Math.min(
                  targetBarWidthPx,
                  IDLE_PROCESS_MAX_WIDTH_PX
                );
              }
              // Ensure minimum width
              targetBarWidthPx = Math.max(
                targetBarWidthPx,
                MIN_PROCESS_BAR_WIDTH_PX
              );
              processSegmentStyle.width = `${targetBarWidthPx}px`;
            }

            return (
              // Container for each individual process bar and its time markers
              <div
                key={`${process.id}-${process.startTime}-${process.endTime}-${i}`} // Unique key for React rendering
                style={processSegmentStyle}
              >
                {/* The actual process bar element */}
                <div
                  title={
                    process.id !== IDLE_PROCESS_ID
                      ? `P${process.id + 1}`
                      : "idle"
                  }
                  className={clsx(
                    "text-sm font-medium flex items-center justify-center rounded-[3px] h-full shadow-[0_2px_3px_#bababa5c] dark:shadow-none overflow-hidden w-full",
                    // Conditional classes for idle processes (striped background)
                    process.id === IDLE_PROCESS_ID
                      ? "bg-[repeating-linear-gradient(-55deg,_#f7f7f7,_#f7f7f7_10px,_#FFF_10px,_#FFF_20px)] tracking-wider text-gray-700 dark:bg-[repeating-linear-gradient(-55deg,_#18202f,_#18202f_10px,_#1c2638_10px,_#1c2638_20px)] dark:text-gray-400"
                      : "text-gray-800" // Default text color for non-idle processes
                  )}
                  style={{
                    backgroundColor:
                      process.id !== IDLE_PROCESS_ID
                        ? process.bgColor
                        : undefined, // Background color from process data (undefined for idle to use CSS gradient)
                    // Animation styles for the bar width
                    animationDuration: `${process.animationDuration}s`,
                    animationDelay: `${process.startTime}s`,
                    animationTimingFunction: "linear",
                    animationFillMode: "both",
                    animationName: "width-animation",
                  }}
                >
                  {/* Text inside the bar (Process ID or "idle") */}
                  <div className="text-ellipsis whitespace-nowrap px-1">
                    {process.id !== IDLE_PROCESS_ID
                      ? `P${process.id + 1}`
                      : "idle"}
                  </div>
                </div>

                {/* Render the "0" start time marker for the very first process.
                    Its animation is timed with the start of the first process bar. */}
                {i === 0 && (
                  <TimeMarker
                    value={0}
                    animationDelay={`${process.startTime}s`}
                    alignment="left"
                  />
                )}

                {/* Render the end time marker for the current process.
                    Its animation is timed with the end of the current process's visual representation. */}
                <TimeMarker
                  value={process.endTime}
                  animationDelay={`${process.endTime}s`}
                  alignment="right"
                />
              </div>
            );
          })}
        </div>
      </div>
      {/* Display scroll message if needed */}
      {displayScrollMessageFinal && isClient && (
        <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          Scroll horizontally to see the full chart →
        </div>
      )}
    </div>
  );
};

export default GanttChartResult;
