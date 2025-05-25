"use client";

import { signIn } from "next-auth/react";

// This component is a button that allows users to sign in to the application from the client side.
const SignIn = () => {
  return (
    <button
      onClick={() => signIn()}
      aria-label="Log in"
      className="dark:text-gray-300/90 dark:hover:text-gray-100 font-semibold text-sm py-2 px-2 top-2 absolute"
    >
      Sign In
    </button>
  );
};

export default SignIn;
