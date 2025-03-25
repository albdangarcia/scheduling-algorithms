import GitHubIcon from "./ui/github-Icon";
import { SignIn } from "./ui/auth/signin-button";
import MainContent from "./ui/main-content";
import { auth } from "@/auth";
import { SignOut } from "./ui/auth/signout-button";
import Nav from "./ui/nav/nav";

const Page = async () => {
  // Get the session
  const session = await auth();

  return (
    <div className="flex flex-col items-center px-4 pb-10">
      {/* top section */}
      <div className="flex justify-between w-full pt-1">
        {/* sign in or sign out button */}
        {session ? <Nav /> : <SignIn />}
        
        {/* github icon */}
        <GitHubIcon />
      </div>


      {/* gradient */}
      <div id="small-gradient" />
      
      {/* main content */}
      <MainContent />
    </div>
  );
};

export default Page;
