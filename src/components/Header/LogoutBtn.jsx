import React from 'react'
import { useDispatch } from 'react-redux'
import { logout as authLogout } from '../../store/authSlice'
import authService from '../../appwrite/auth'

function LogoutBtn() {
  const dispatch = useDispatch()

  const logoutHandler = () => {
    authService.logout().then(() => {
      dispatch(authLogout())
    })
  }

  return (
    <button
      onClick={logoutHandler}
      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50"
    >
      Logout
    </button>
  )
}

export default LogoutBtn
