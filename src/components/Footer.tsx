import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📚</span>
          <p className="text-sm font-semibold">CGPA Calculator</p>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
        <p className="text-sm">
          Created by{" "}
          <a
            href="https://thegem.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Gabriel Momoh (GemDev)
          </a>
        </p>
      </div>
    </footer>
  );
}
