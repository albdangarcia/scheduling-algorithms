import { fetchCalculations } from "./lib/data/calculation";
import GitHubIcon from "./ui/github-Icon";
import MainContent from "./ui/main-content";
import { auth } from "@/auth";

const Page = async () => {
  // Get the session
  const session = await auth();

  const calculations = await fetchCalculations();

  return (
    <div className="flex flex-col items-center px-4 pb-10">
      {/* github icon */}
      <GitHubIcon />
      {/* gradient */}
      <div id="small-gradient" />
      {/* main content */}
      <MainContent userSession={session} calcutionsList={calculations} />
    </div>
  );
};

export default Page;
