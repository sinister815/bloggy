import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Logo from '../Logo'

function Footer() {
  const location = useLocation()
  const isLoggedIn = useSelector((state) => state.auth.status)
  const currentYear = new Date().getFullYear()
  const isHomePage = location.pathname === '/'
  const minimalHomeFooter = isHomePage && !isLoggedIn

  const links = minimalHomeFooter
    ? [
        { label: 'Login', to: '/login' },
        { label: 'Sign Up', to: '/signup' },
      ]
    : isLoggedIn
    ? [
        { label: 'Home', to: '/' },
        { label: 'All Posts', to: '/all-posts' },
        { label: 'Add Post', to: '/add-post' },
      ]
    : [
        { label: 'Home', to: '/' },
        { label: 'Login', to: '/login' },
        { label: 'Sign Up', to: '/signup' },
      ]

  const informationLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms & Conditions', to: '/terms-and-conditions' },
    { label: 'Disclaimer', to: '/disclaimer' },
  ]

  return (
    <footer className="rounded-t-[8px] bg-slate-900 text-white shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        {/* <div className="flex w-full justify-center">
          <Logo width="140px" />
        </div> */}

        <nav aria-label="Main footer navigation">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-300">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-xs font-medium transition hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-1 h-px w-full max-w-4xl bg-slate-700/70" />

        <nav aria-label="Policies and information">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-400">
            {informationLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-xs transition hover:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="w-full pt-2 text-center text-xs text-slate-400">
          <p>© {currentYear} Bloggy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
