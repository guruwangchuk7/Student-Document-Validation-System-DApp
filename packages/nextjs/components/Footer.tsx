import React from "react";
import { HeartIcon } from "@heroicons/react/24/outline";

export const Footer = () => {
  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            <div className="flex justify-center items-center gap-2">
              <p className="m-0 text-center">
                Built with <HeartIcon className="inline-block h-4 w-4" /> by KodaDev
              </p>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
