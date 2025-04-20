"use client";
import {
  PreemptiveOptionsTypes,
  PropsScheduleInputTypes,
  ScheduleKeysTypes,
  CalculationType,
} from "@/app/lib/definitions";
import { useState, useRef, useEffect, useCallback } from "react";
import { preemptiveRadioOptions } from "../radio-options";

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface Props {
  calcutionsList: CalculationType[];
  setalgorithmSelected: (value: ScheduleKeysTypes) => void;
  setInputValues: (value: PropsScheduleInputTypes) => void;
}

const Nav = ({
  calcutionsList,
  setInputValues,
  setalgorithmSelected
}: Props) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const wrapperRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const contentRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // State tracks overflow status for each `.number-content` element.
  // Flatten the structure: index corresponds to the ref index (0=item1-AT, 1=item1-BT, 2=item1-Slice, 3=item2-AT, etc.)
  const [itemsOverflowing, setItemsOverflowing] = useState<boolean[]>([]);

  // --- Navigation Logic (toggle, outside click)
  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const navRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsNavOpen(false);
    }
  };
  useEffect(() => {
    // Outside click listener effect
    if (isNavOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNavOpen]);

  const onCalculationClick = (value: CalculationType) => {
    setalgorithmSelected(value.dropDownIndexOption);
    setInputValues(value.values);
    // onDropDownOptionChange(value.dropDownIndexOption);
    // setInputValues(value.values);
  };

  // Total number of individual number spans to check
  const totalNumberSpans = calcutionsList.length * 3;

  // Overflow and Marquee Logic
  const checkOverflow = useCallback(() => {
    const overflowStates: boolean[] = [];
    // Iterate based on the total number of spans we expect
    for (let i = 0; i < totalNumberSpans; i++) {
      const contentEl = contentRefs.current[i];
      const wrapperEl = wrapperRefs.current[i];
      let itemIsOverflowing = false;
      let translateX = "0px";

      if (contentEl && wrapperEl) {
        const contentWidth = contentEl.scrollWidth;
        const wrapperWidth = wrapperEl.clientWidth;

        // Add a small tolerance (e.g., 1px) for floating point inaccuracies
        if (contentWidth > wrapperWidth + 1) {
          itemIsOverflowing = true;
          translateX = `${wrapperWidth - contentWidth}px`;
        } else {
          // Ensure translate is reset if not overflowing
          translateX = "0px";
        }
        contentEl.style.setProperty("--marquee-translate-x", translateX);
      } else {
        // console.log(`Item ${i}: Refs not found`); // Debug log if refs are missing
      }
      overflowStates[i] = itemIsOverflowing;
    }
    setItemsOverflowing(overflowStates);
    // console.log("Overflow States Updated:", overflowStates); // Debug log
  }, [totalNumberSpans]); // Dependency ensures check runs if total items change

  useEffect(() => {
    // Effect for resize and initial check
    // Initial check
    checkOverflow();

    const debouncedCheck = debounce(checkOverflow, 250);
    window.addEventListener("resize", debouncedCheck);

    return () => {
      window.removeEventListener("resize", debouncedCheck);
    };
  }, [checkOverflow]); // checkOverflow has totalNumberSpans dependency

  // --- Helper to get ref index ---
  const getRefIndex = (calcIndex: number, itemTypeIndex: 0 | 1 | 2) => {
    // itemTypeIndex: 0 for AT, 1 for BT, 2 for Slice
    return calcIndex * 3 + itemTypeIndex;
  };

  return (
    <div className="relative">
      {/* --- Nav Toggle Button --- */}
      <button onClick={toggleNav} className="p-2">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-9"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* --- Left Navigation Bar --- */}
      <div
        className={`fixed z-20 top-0 left-0 bg-gray-50 pt-12 px-7 w-80 md:w-96 h-full shadow-lg ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out `}
        ref={navRef}
      >
        {/* Close Icon */}
        <button onClick={toggleNav} className="absolute top-3 right-4 p-1">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            className="size-6 stroke-gray-600 hover:stroke-gray-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h1 className="text-slate-700 mb-5 font-medium">Saved Calculations</h1>
        {/* --- Saved Calculations List --- */}
        <div className="overflow-y-auto max-h-[calc(100vh-150px)]">
          <ul className="space-y-5">
            {calcutionsList.map((calculation, calcIndex) => (
              <li key={calculation.id} className="">
                <button
                  onClick={() => onCalculationClick(calculation)}
                  key={calculation.id}
                  className="block w-full p-0 border-none bg-none"
                >
                  <h6 className="text-center text-xs mb-1">
                    {calculation.title.toLocaleUpperCase()}
                  </h6>
                  <div className={`data-container text-sm`}>
                    {/* --- AT Item --- */}
                    <div
                      className={`data-item ${
                        itemsOverflowing[getRefIndex(calcIndex, 0)]
                          ? "is-item-overflowing"
                          : ""
                      }`}
                    >
                      <span className="label text-xs">AT:</span>
                      <span
                        className="number-wrapper"
                        ref={(el) => {
                          wrapperRefs.current[getRefIndex(calcIndex, 0)] = el;
                        }}
                      >
                        <span
                          className="number-content"
                          ref={(el) => {
                            contentRefs.current[getRefIndex(calcIndex, 0)] = el;
                          }}
                        >
                          {calculation.values.arrivalTimeValues}
                        </span>
                      </span>
                    </div>
                    {/* --- BT Item --- */}
                    <div
                      className={`data-item ${
                        itemsOverflowing[getRefIndex(calcIndex, 1)]
                          ? "is-item-overflowing"
                          : ""
                      }`}
                    >
                      <span className="label text-xs">BT:</span>
                      <span
                        className="number-wrapper"
                        ref={(el) => {
                          wrapperRefs.current[getRefIndex(calcIndex, 1)] = el;
                        }}
                      >
                        <span
                          className="number-content"
                          ref={(el) => {
                            contentRefs.current[getRefIndex(calcIndex, 1)] = el;
                          }}
                        >
                          {calculation.values.burstTimeValues}
                        </span>
                      </span>
                    </div>
                    {/* --- Slice Item --- */}
                    <div
                      className={`data-item data-item-slice ${
                        itemsOverflowing[getRefIndex(calcIndex, 2)]
                          ? "is-item-overflowing"
                          : ""
                      }`}
                    >
                      <span className="label text-xs">Slice:</span>
                      <span
                        className="number-wrapper"
                        ref={(el) => {
                          wrapperRefs.current[getRefIndex(calcIndex, 2)] = el;
                        }}
                      >
                        <span
                          className="number-content"
                          ref={(el) => {
                            contentRefs.current[getRefIndex(calcIndex, 2)] = el;
                          }}
                        >
                          {calculation.values.timeSlice}
                        </span>
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
            {/* No Results Message */}
            {calcutionsList.length === 0 && (
              <li className="text-center text-gray-500 text-sm">
                No results found.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Nav;
