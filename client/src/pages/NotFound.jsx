import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-sm max-md:px-4 mt-24">
      <h1 className="text-8xl md:text-9xl font-bold text-primary">404</h1>

      <div className="h-1 w-16 rounded bg-primary my-5 md:my-7"></div>

      <p className="text-2xl md:text-3xl font-bold text-gray-700">
        Page Not Found
      </p>

      <p className="text-sm md:text-base mt-4 text-gray-500 max-w-md text-center">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>

      <div className="flex items-center gap-4 mt-6">
        <Link
          to={"/"}
          className="bg-primary hover:bg-primary-dull px-7 py-2.5 text-white rounded-md active:scale-95 transition-all hover:-translate-y-0.5"
        >
          Return Home
        </Link>

        <Link
          to={"/"}
          className="border border-gray-300 px-7 py-2.5 text-gray-800 rounded-md active:scale-95 transition-all hover:-translate-y-0.5"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
