import Link from "next/link";

// This is the 404 page that will be displayed when a user tries to access a page that does not exist
const NotFound = () => {
  return (
    <div className="flex justify-center mt-20">
      <div className="text-center">
        <p className="dark:text-gray-300 text-7xl text-black font-medium">
          404
        </p>
        <p className="dark:text-gray-300 text-xl my-5">
          Could not find requested resource
        </p>
        <Link
          href="/"
          aria-label="Return Home"
          className="inline-block rounded-sm px-5 py-2.5 bg-black hover:bg-gray-800 text-white"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;