import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 body-font">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <a className="flex title-font font-medium items-center md:justify-start justify-center text-slate-900 dark:text-white cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-600 dark:bg-indigo-500 rounded-xl" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">Tailblocks</span>
        </a>
        <p className="text-sm sm:ml-4 sm:pl-4 sm:border-l sm:border-slate-200 sm:dark:border-zinc-800 sm:py-2 sm:mt-0 mt-4">
          © 2026 Tailblocks —
          <a href="https://twitter.com/knyttneve" className="hover:text-indigo-600 dark:hover:text-indigo-400 ml-1 transition-colors duration-200" rel="noopener noreferrer" target="_blank">@knyttneve</a>
        </p>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start space-x-3">
          <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer">
            <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
            </svg>
          </a>
          <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer">
            <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
            </svg>
          </a>
          <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer">
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
            </svg>
          </a>
          <a className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer">
            <svg fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0" className="w-5 h-5" viewBox="0 0 24 24">
              <path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
              <circle cx="4" cy="4" r="2" stroke="none"></circle>
            </svg>
          </a>
        </span>
      </div>
    </footer>
  )
}

export default Footer