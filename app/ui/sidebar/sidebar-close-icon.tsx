import { XMarkIcon } from "@heroicons/react/24/outline";

interface CloseSidebarButtonProps {
  toggleSideBar: () => void;
}

// This component renders a button that closes the sidebar when clicked.
const CloseSidebarButton = ({ toggleSideBar }: CloseSidebarButtonProps) => {
  return (
    <button
      onClick={toggleSideBar}
      className="absolute top-3 right-4 p-1"
      aria-label="Close sidebar"
    >
      <XMarkIcon
        className="size-6 stroke-gray-600 dark:stroke-gray-400"
        aria-hidden="true"
      />
    </button>
  );
};

export default CloseSidebarButton;
