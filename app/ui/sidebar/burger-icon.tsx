import { Bars3Icon } from "@heroicons/react/24/outline";

interface SideBarBurgerButtonProps {
  toggleSideBar: () => void;
}

// This component is used to toggle the sidebar
// It is a button with 3 horizontal lines (hamburger icon)
const SideBarBurgerButton = ({ toggleSideBar }: SideBarBurgerButtonProps) => {
  return (
    <button
      onClick={toggleSideBar}
      className="p-2 absolute left-3"
      aria-label="Toggle sidebar"
    >
      <Bars3Icon 
      className="size-9 dark:stroke-gray-500" 
      aria-hidden="true"
      />
    </button>
  );
};

export default SideBarBurgerButton;
