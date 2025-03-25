import { signIn } from "@/auth";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn();
      }}
    >
      <button
        type="submit"
        className="relative font-semibold text-sm bg-white rounded-md px-3 py-1 text-gray-800 border hover:border hover:border-gray-600"
      >
        Sign in
      </button>
    </form>
  );
}
