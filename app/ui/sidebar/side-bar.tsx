"use client";

import {
  AssignRefParams,
  PropsScheduleInputTypes,
  RecentRecordsType,
} from "@/app/lib/definitions";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import clsx from "clsx";
import { Algorithm, Preemption } from "@prisma/client";
import type { Session } from "next-auth";
import UserProfileSection from "./user-profile-section";
import SideBarBurgerButton from "./burger-icon";
import CloseSidebarButton from "./sidebar-close-icon";
import SideBarSignOutButton from "./signout-button";
import RecentInputsList from "./recent-inputs-list";
import { INITIAL_LOOP_INDEX } from "@/app/lib/constants";

// Debounce function: delays invoking a function until after `wait` milliseconds have elapsed since the last time it was invoked.
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface Props {
  setAlgorithmSelected: Dispatch<SetStateAction<Algorithm>>;
  setRadioSelected: Dispatch<SetStateAction<Preemption>>;
  setInputValues: Dispatch<SetStateAction<PropsScheduleInputTypes>>;
  savedInputs: RecentRecordsType[];
  hasMore: boolean;
  handleLoadMoreInputs: () => void;
  isAppending: boolean;
  userSession: Session;
  sidebarListError: string | null;
}

const SiderBar = ({
  setAlgorithmSelected,
  setRadioSelected,
  setInputValues,
  savedInputs,
  hasMore,
  handleLoadMoreInputs,
  isAppending,
  userSession,
  sidebarListError,
}: Props) => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  // Refs for the wrapper and content elements of each recent input item, used for marquee effect.
  const wrapperRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const contentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // State to track which recent input items are overflowing their containers.
  const [itemsOverflowing, setItemsOverflowing] = useState<boolean[]>([]);
  const sideBarRef = useRef<HTMLDivElement>(null);

  const toggleSideBar = () => setIsSideBarOpen(!isSideBarOpen);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    // useCallback for stability if passed as dependency
    if (
      sideBarRef.current &&
      !sideBarRef.current.contains(event.target as Node)
    ) {
      setIsSideBarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isSideBarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSideBarOpen, handleClickOutside]);

  const checkOverflow = useCallback(() => {
    // If there are no saved inputs, reset refs and overflow states.
    if (savedInputs.length === 0) {
      wrapperRefs.current = [];
      contentRefs.current = [];
      setItemsOverflowing([]);
      return;
    }

    const overflowStates: boolean[] = [];
    // Tracks the highest index processed to correctly size finalOverflowStates
    let maxIndex = INITIAL_LOOP_INDEX;

    contentRefs.current.forEach((contentEl, index) => {
      if (contentEl) {
        const wrapperEl = wrapperRefs.current[index];
        let itemIsOverflowing = false;
        let translateX = "0px"; // Default to no translation

        if (wrapperEl) {
          maxIndex = index;
          const contentWidth = contentEl.scrollWidth; // Actual width of the content
          const wrapperWidth = wrapperEl.clientWidth; // Visible width of the container

          // Check if content overflows its wrapper, with a small buffer.
          if (contentWidth > wrapperWidth + 1) {
            itemIsOverflowing = true;
            // Calculate the translation needed for the marquee effect.
            translateX = `${wrapperWidth - contentWidth}px`;
          } else {
            // Reset translation if not overflowing.
            translateX = "0px";
          }
          contentEl.style.setProperty("--marquee-translate-x", translateX);
        } else {
          contentEl.style.setProperty("--marquee-translate-x", "0px");
        }
        overflowStates[index] = itemIsOverflowing;
      } else {
        // If content element doesn't exist, mark as not overflowing.
        overflowStates[index] = false;
      }
    });

    // Ensure finalOverflowStates array has the correct length, initialized to false.
    // This prevents out-of-bounds errors and handles cases where items are removed or refs are not yet populated.
    const finalOverflowStates = Array(maxIndex + 1).fill(false);
    overflowStates.forEach((state, index) => {
      if (index <= maxIndex && state !== undefined) {
        finalOverflowStates[index] = state;
      }
    });

    setItemsOverflowing((prev) => {
      // Avoid unnecessary re-renders if the overflow states haven't changed.
      if (JSON.stringify(prev) !== JSON.stringify(finalOverflowStates)) {
        return finalOverflowStates;
      }
      return prev;
    });
    // Only dependency needed if logic inside only uses savedInputs.length and refs
  }, [savedInputs.length]);

  useEffect(() => {
    checkOverflow();
    const debouncedCheck = debounce(checkOverflow, 250);
    window.addEventListener("resize", debouncedCheck);
    return () => {
      window.removeEventListener("resize", debouncedCheck);
    };
  }, [checkOverflow]); // checkOverflow is memoized

  // Clearing refs when the list changes
  useEffect(() => {
    wrapperRefs.current = [];
    contentRefs.current = [];
    // Re-clear refs when the list itself changes
  }, [savedInputs]);

  // Function to change the values of the input fields form
  const onSavedInputClick = (input: RecentRecordsType) => {
    setAlgorithmSelected(input.algorithmSelected);
    setRadioSelected(input.preemption);
    
    const strTimeQuantum = input.timeQuantum ? String(input.timeQuantum) : undefined;
    
    setInputValues({
      arrivalTimeValues: input.arrivalValues,
      burstTimeValues: input.burstValues,
      priorityValues: input.priorityValues ?? undefined,
      timeQuantum: strTimeQuantum,
    });

    setIsSideBarOpen(false);
  };

  // Callback for children to assign refs to the parent's arrays
  const assignRef = ({ type, index, el }: AssignRefParams) => {
    const refArray = type === "wrapper" ? wrapperRefs : contentRefs;
    refArray.current[index] = el;
  };

  // Callback for children to get overflow state
  const getOverflowState = (index: number): boolean => {
    return itemsOverflowing[index] || false;
  };

  return (
    <div>
      <SideBarBurgerButton toggleSideBar={toggleSideBar} />
      <div
        className={clsx(
          "fixed z-20 top-0 left-0 bg-gray-50 dark:bg-gray-800 pt-12 px-7 w-80 md:w-96 h-full shadow-lg",
          isSideBarOpen ? "translate-x-0" : "-translate-x-full",
          "transition-transform duration-300 ease-in-out",
          "flex flex-col"
        )}
        ref={sideBarRef}
      >
        <CloseSidebarButton toggleSideBar={toggleSideBar} />
        
        <UserProfileSection userSession={userSession} />

        <h2 className="text-gray-900 dark:text-gray-300 mb-6 text-center font-medium text-sm">
          Recent Inputs
        </h2>

        <RecentInputsList
          savedInputs={savedInputs}
          onApplyInput={onSavedInputClick}
          assignRef={assignRef}
          getOverflowState={getOverflowState}
          sidebarListError={sidebarListError}
          hasMore={hasMore}
          handleLoadMoreInputs={handleLoadMoreInputs}
          isAppending={isAppending}
        />
        <SideBarSignOutButton />
      </div>
    </div>
  );
};

export default SiderBar;
