import React from 'react'
import { Container, Logo, LogoutBtn } from '../index'
import { Link, NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)

  const navItems = [
    { name: 'Home', slug: '/', active: true },
    { name: 'Login', slug: '/login', active: !authStatus },
    { name: 'Signup', slug: '/signup', active: !authStatus },
    { name: 'All Posts', slug: '/all-posts', active: authStatus },
    { name: 'Add Post', slug: '/add-post', active: authStatus },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 py-4 backdrop-blur">
      <Container>
        <nav className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Logo width="150px" />
            </Link>
          </div>

          <ul className="ml-auto flex flex-wrap items-center gap-2">
            {navItems.map(
              (item) =>
                item.active && (
                  <li key={item.name}>
                    <NavLink
                      to={item.slug}
                      className={({ isActive }) =>
                        `inline-flex rounded-2xl px-4 py-2 text-sm font-medium transition duration-200 ${
                          isActive
                            ? 'bg-slate-300 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ),
            )}
            {authStatus && (
              <li className="ml-1">
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header
