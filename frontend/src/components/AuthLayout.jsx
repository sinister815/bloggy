import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function Protected({ children, authentication = true }) {
  const authStatus = useSelector((state) => state.auth.status)

  // authentication=true requires a session; authentication=false is guest-only.
  if (authStatus !== authentication) {
    return <Navigate to={authentication ? '/login' : '/'} replace />
  }

  return <>{children}</>
}
