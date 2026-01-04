// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>

      <h2 className="text-2xl font-semibold mt-4 text-gray-700">
        Page Not Found
      </h2>

      <p className="text-gray-600 mt-2 text-center max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
