import './App.css'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import { useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { getMe } from './api/authService'
import { hasSession } from './api/session'
import { login as authLogin, logout as authLogout } from './store/authSlice'
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(() => hasSession())
  const dispatch = useDispatch()

  useEffect(() => {
    // The JWT lives in an httpOnly cookie; only ask for the profile when the
    // non-sensitive session flag says a login may still be active.
    if (!hasSession()) {
      dispatch(authLogout())
      return
    }

    getMe()
      .then((res) => {
        const user = res.data?.user
        if (user) {
          dispatch(
            authLogin({
              userData: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
              },
            }),
          )
        } else {
          dispatch(authLogout())
        }
      })
      .catch(() => {
        dispatch(authLogout())
      })
      .finally(() => {
        setLoading(false)
      })
  }, [dispatch])

  return !loading ? (
    <div className="page-shell">
      <div className="content-layer flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  ) : (
    <div className="page-shell">
      <div className="content-layer flex min-h-screen items-center justify-center px-4">
        <div className="editorial-card rounded-[28px] px-8 py-6 text-center text-slate-700">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700" />
          <p className="text-lg font-semibold">Loading your workspace....</p>
        </div>
      </div>
    </div>
  )
}

export default App
