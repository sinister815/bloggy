import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout as authLogout } from '../../store/authSlice'
import { logout as apiLogout } from '../../api/authService'
import { clearSession } from '../../api/session'

function LogoutBtn() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const logoutHandler = () => {
    apiLogout().finally(() => {
      clearSession()
      dispatch(authLogout())
      navigate('/')
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
