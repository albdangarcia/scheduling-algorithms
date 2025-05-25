"use client";

import { PropsScheduleInputTypes, RecentRecordsType } from "../lib/definitions";
import Form from "./form-wrapper";
import {
  useActionState,
  useEffect,
  useState,
  useTransition,
  useCallback,
  useRef,
} from "react";
import ResultsContainer from "./results-container";
import type { Session } from "next-auth";
import { InputFormError } from "../lib/zod-schema";
import {
  createFormInput,
  loadMoreSavedInputsAction,
  refreshSavedInputsAction,
} from "../lib/actions/action";
import SignIn from "./auth/signin-button";
import { Algorithm, Preemption } from "@prisma/client";
import SideBar from "./sidebar/side-bar";
import { initialActionState } from "../lib/constants";

interface Props {
  userSession: Session | null;
  inputFormList: RecentRecordsType[];
  initialHasMore: boolean;
}

const MainContent = ({ userSession, inputFormList, initialHasMore }: Props) => {
  // Server action state
  const [state, formAction, isPending] = useActionState<
    InputFormError,
    FormData
  >(createFormInput, initialActionState);

  // State for the selected algorithm
  const [algorithmSelected, setalgorithmSelected] = useState<Algorithm>(
    Algorithm.fcfs
  );

  // State for the selected preemption type
  const [radioSelected, setRadioSelected] = useState<Preemption>(
    Preemption.nonPreemptive
  );

  // Initial input values for the form
  const initialInputsState: PropsScheduleInputTypes = {
    arrivalTimeValues: "2 0 2 3 4",
    burstTimeValues: "2 1 3 5 4",
  };

  // State for the input values
  const [inputValues, setInputValues] =
    useState<PropsScheduleInputTypes>(initialInputsState);

  // State for the saved inputs in the sidebar
  const [savedInputs, setSavedInputs] =
    useState<RecentRecordsType[]>(inputFormList);
  
  // State for the "has more" flag
  // This flag indicates whether there are more saved inputs to load
  const [hasMore, setHasMore] = useState(initialHasMore);
  
  // State for the number of displayed inputs
  const [displayedCount, setDisplayedCount] = useState(inputFormList.length);

  const [sidebarListError, setSidebarListError] = useState<string | null>(null);
  const [isAppending, startAppendTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [processSuccessTrigger, setProcessSuccessTrigger] = useState(0);
  const prevSuccessRef = useRef<boolean | null | undefined>(undefined);

  const handleLoadMoreInputs = () => {
    if (isAppending || !hasMore) return;

    startAppendTransition(async () => {
      const currentOffset = savedInputs.length;
      try {
        setSidebarListError(null);
        const { records: newInputs, hasMore: newHasMore } =
          await loadMoreSavedInputsAction({ currentOffset });
        setSavedInputs((prev) => [...prev, ...newInputs]);
        setHasMore(newHasMore);
        setDisplayedCount((prevCount) => prevCount + newInputs.length);
      } catch (error) {
        setSidebarListError("Failed to load more. Please try again.");
      }
    });
  };

  const refreshSidebarData = useCallback(
    async (countToDisplay: number) => {
      startRefreshTransition(async () => {
        try {
          setSidebarListError(null);
          // Fetch the required number of records. `hasMore` will be determined by this single call.
          const { records, hasMore: newHasMore } =
            await refreshSavedInputsAction({
              skip: 0,
              takeCount: countToDisplay,
            });
          setSavedInputs(records);
          setHasMore(newHasMore);
          setDisplayedCount(records.length);
        } catch (error) {
          setSidebarListError("Failed to refresh list. Please try again.");
        }
      });
    },
    [startRefreshTransition]
  );

  useEffect(() => {
    if (
      state.success === true &&
      prevSuccessRef.current !== true &&
      userSession
    ) {
      setProcessSuccessTrigger((prev) => prev + 1);
    }
    prevSuccessRef.current = state.success;
  }, [state.success, userSession]);

  const processedTriggerRef = useRef(0);
  useEffect(() => {
    if (processSuccessTrigger > processedTriggerRef.current && userSession) {
      // When a new item is successfully added, we want to display it.
      // The total number of items to display will be the current count + 1,
      // unless we're already at MAX_RECORDS_PER_USER.
      // The refreshSidebarData will fetch this many, and MAX_RECORDS_PER_USER logic
      // on the server handles the actual limit.
      const newTotalToDisplay = displayedCount + 1;
      refreshSidebarData(newTotalToDisplay);
      processedTriggerRef.current = processSuccessTrigger;
    }
  }, [processSuccessTrigger, userSession, displayedCount, refreshSidebarData]);

  return (
    <main className="max-w-[48rem] w-full">
      {userSession ? (
        <SideBar
          setAlgorithmSelected={setalgorithmSelected}
          setRadioSelected={setRadioSelected}
          setInputValues={setInputValues}
          savedInputs={savedInputs}
          hasMore={hasMore}
          handleLoadMoreInputs={handleLoadMoreInputs}
          isAppending={isAppending}
          userSession={userSession}
          sidebarListError={sidebarListError}
        />
      ) : (
        <SignIn />
      )}

      <h1 className="text-center font-light text-[1.7rem] pt-10 pb-4 text-gray-800 dark:text-gray-300">
        CPU Scheduling Algorithms
      </h1>

      <section aria-labelledby="form-section-heading">
        <h2 id="form-section-heading" className="sr-only">
          CPU Scheduling Algorithm Configuration
        </h2>
        <Form
          state={state}
          formAction={formAction}
          isPending={isPending}
          radioSelected={radioSelected}
          setRadioSelected={setRadioSelected}
          algorithmSelected={algorithmSelected}
          setalgorithmSelected={setalgorithmSelected}
          inputValues={inputValues}
          setInputValues={setInputValues}
        />
      </section>

      {state.data && (
        <section aria-labelledby="results-section-heading">
          <h2 id="results-section-heading" className="sr-only">
            Simulation Results and Analysis
          </h2>
          <ResultsContainer
            uniqueId={state.data.uniqueId}
            ganttChartData={state.data.ganttChartData}
            processTableData={state.data.processTableData}
            totalAverages={state.data.totalAverages}
          />
        </section>
      )}
    </main>
  );
};

export default MainContent;
