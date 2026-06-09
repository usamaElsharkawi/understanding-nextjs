import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <header className="border-b border-slate-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 text-slate-600 dark:text-zinc-400 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <a className="flex title-font font-medium items-center text-slate-900 dark:text-white mb-4 md:mb-0 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-600 dark:bg-indigo-500 rounded-xl" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-3 text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">Tailblocks</span>
        </a>
        <nav className="md:ml-auto flex flex-wrap items-center text-sm font-medium justify-center space-x-6">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/user">User</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <button className="inline-flex items-center bg-indigo-50 dark:bg-zinc-900 border border-indigo-100/50 dark:border-zinc-800 py-1.5 px-4 focus:outline-none hover:bg-indigo-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg text-sm mt-4 md:mt-0 transition-all duration-200">
          Button
          <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-1.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </header>
  )
}

export default Header