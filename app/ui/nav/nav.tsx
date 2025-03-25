"use client";
import { useState, useRef, useEffect } from "react";

const Nav = () => {
  // State to show/hide navigation bar
  const [isNavOpen, setIsNavOpen] = useState(false);

  // State to store the search query
  const [searchQuery, setSearchQuery] = useState("");

  // Function to toggle show/hide navigation bar
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Ref to the navigation element
  const navRef = useRef<HTMLDivElement>(null);

  // Function to handle clicks outside the navigation
  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setIsNavOpen(false);
    }
  };

  // Use effect to add and remove event listener for clicks outside the navigation
  useEffect(() => {
    if (isNavOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNavOpen]);

  return (
    <div className="relative">
      {/* bars icon */}
      <button onClick={toggleNav}>
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-9 absolute top-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* navigation bar */}
      <div
        className={`fixed z-20 top-0 left-0 bg-gray-50 pt-12 px-7 w-96 h-full ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out `}
        ref={navRef}
      >
        {/* close icon */}
        <button onClick={toggleNav}>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            className="size-6 absolute top-3 right-4 stroke-gray-600 hover:stroke-gray-800"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* city list */}
        {/* <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          <ul className="space-y-5">
            {filteredCities.map((city) => (
              <li key={city.city} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="bg-[#FAE262] w-[3px] h-10 rounded-sm" />
                  <a
                    href={`?latitude=${city.lat}&longitude=${city.long}`}
                    className="text-gray-200 text-sm font-semibold"
                  >
                    {city.city}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default Nav;
