import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import { Button, Logo, Input } from './index'
import { useDispatch } from 'react-redux'
import authService from '../appwrite/auth'
import { useForm } from 'react-hook-form'

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { register, handleSubmit } = useForm()
  const [error, setError] = useState('')

  const login = async (data) => {
    setError('')
    try {
      const session = await authService.login(data)
      if (session) {
        const userData = await authService.getCurrentUser()
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
          navigate('/')
        }
      }
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="editorial-card rounded-3xl p-8 lg:p-10">
          <div className="mb-6 flex justify-center">
            <span className="inline-block w-full max-w-[120px]">
              <Logo width="100%" />
            </span>
          </div>

          <h2 className="text-center text-3xl font-semibold leading-tight text-slate-900">Sign in to your account</h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            Don&apos;t have any account?&nbsp;
            <Link
              to="/signup"
              className="font-semibold text-sky-700 transition-all duration-200 hover:text-sky-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>

          {error && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">{error}</p>}

          <form onSubmit={handleSubmit(login)} className="mt-8">
            <div className="space-y-5">
              <Input
                label="Email"
                placeholder="Enter your email"
                type="email"
                {...register('email', {
                  required: true,
                  validate: {
                    matchPatern: (value) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                      'Email address must be a valid address',
                  },
                })}
              />
              <Input
                label="Password"
                placeholder="Enter your password"
                type="password"
                {...register('password', {
                  required: true,
                })}
              />
              <Button type="submit" bgColor="bg-slate-950" className="w-full">
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
