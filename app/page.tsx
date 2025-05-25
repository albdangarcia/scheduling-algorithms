import { ITEMS_PER_PAGE } from "./lib/constants";
import { fetchPaginatedSavedInputFormList } from "./lib/data/savedInputs";
import {
  RecentRecordsType,
  PaginatedRecentRecordsResponse,
} from "./lib/definitions";
import GitHubIcon from "./ui/github-Icon";
import MainContent from "./ui/main-content";
import { auth } from "@/auth";

const Page = async () => {
  // Get user session
  const session = await auth();

  let initialRecords: RecentRecordsType[] = [];
  let initialHasMore = false;

  // Get the saved input form list only if the session is valid
  // else skip the fetch
  if (session) {
    const paginatedResponse: PaginatedRecentRecordsResponse =
      await fetchPaginatedSavedInputFormList({
        skip: 0,
        take: ITEMS_PER_PAGE,
      });
    initialRecords = paginatedResponse.records;
    initialHasMore = paginatedResponse.hasMore;
  }

  return (
    <div className="flex flex-col items-center px-4 pb-10">
      {/* Github Icon Link */}
      <GitHubIcon />

      {/* Background Gradients */}
      <div className="gradient-layer-one"></div>
      <div className="gradient-layer-two"></div>
      <div className="gradient-layer-three"></div>

      {/* Main Content */}
      <MainContent
        userSession={session}
        inputFormList={initialRecords}
        initialHasMore={initialHasMore}
      />
    </div>
  );
};

export default Page;
