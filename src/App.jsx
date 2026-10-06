import './App.css'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import { useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import appwriteService from './appwrite/auth.js'
import { login as authLogin, logout as authLogout } from './store/authSlice.js'
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    appwriteService
      .getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(
            authLogin({
              userData: {
                $id: userData.$id,
                name: userData.name,
                email: userData.email,
              },
            }),
          )
        } else {
          dispatch(authLogout())
        }
      })
      .catch((error) => {
        console.log('app.jsx :: getCurrentUser :: error ', error)
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
        <main className="flex-1 pb-12">
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
