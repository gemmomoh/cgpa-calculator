import React, { useState, useEffect } from 'react';

const Header = () => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);
    
    return (
        <header className="bg-gray-100 dark:bg-gray-800 shadow-md border-b border-gray-300 dark:border-gray-700">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-5 lg:px-8" aria-label="Global">
                
                {/* Logo */}
                <div className="flex lg:flex-1">
                    <a href="#" className="-m-1.5 p-1.5">
                        <span className="sr-only">Your Company</span>
                        <img className="h-8 w-auto" src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Logo" />
                    </a>
                </div>
                
                {/* Navigation Links */}
                <div className="hidden lg:flex lg:gap-x-8">
                    <a href="#" className="text-sm font-semibold text-gray-900 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        
                    </a>
                    <a href="#" className="text-sm font-semibold text-gray-900 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        
                    </a>
                    <a href="#" className="text-sm font-semibold text-gray-900 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        
                    </a>
                </div>
                
                {/* Right Side: Dark Mode Toggle & Login Button */}
                <div className="flex items-center gap-4">
                    
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full transition"
                    >
                        {darkMode ? (
                            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a8 8 0 1 1-8 8 8 8 0 0 1 8-8zm0 14a6 6 0 1 0-6-6 6 6 0 0 0 6 6z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-gray-900 dark:text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-13a8 8 0 0 1 8 8h-2a6 6 0 1 0-6-6V2zm-8 8a8 8 0 0 1 8-8v2a6 6 0 1 0 6 6h2a8 8 0 0 1-8 8v-2a6 6 0 1 0-6-6H2z" />
                            </svg>
                        )}
                    </button>
                    
                    {/* Login Button */}
                    <a
                        href="#"
                        className="text-sm font-semibold text-gray-900 dark:text-gray-200 border border-gray-800 dark:border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        Log in <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </nav>
        </header>
    );
};

export default Header;