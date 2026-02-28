import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const iconGreen = 'text-emerald-500'

function PersonIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    )
}
function EnvelopeIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    )
}
function LockIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    )
}

function InputWithIcon({ id, name, type = 'text', placeholder, icon: Icon, required }) {
    return (
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all">
      <span className={iconGreen}>
        <Icon />
      </span>
            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                required={required}
                className="flex-1 min-w-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
            />
        </div>
    )
}

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const form = e.target
        const email = (form.email.value ?? '').trim()
        const password = form.password.value

        try {
            if (isLogin) {
                const response = await fetch(`${API_URL}/supporters/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed')
                }

                login(data) // saves token + supporter to localStorage and updates context
                navigate('/dashboard')
            } else {
                const firstName = (form.firstName?.value ?? '').trim()
                const lastName = (form.lastName?.value ?? '').trim()

                const response = await fetch(`${API_URL}/supporters/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, password })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed')
                }

                login(data) // saves token + supporter to localStorage and updates context
                navigate('/dashboard')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-teal-50/40 flex items-center justify-center px-4 py-12">
            <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-gray-200/80">
                <h1 className="text-2xl font-bold text-gray-900 text-center">
                    {isLogin ? 'Sign in' : 'Create Account'}
                </h1>
                <p className="text-gray-500 text-sm text-center mt-1.5 mb-8">
                    {isLogin ? 'Welcome back.' : 'Get started with your free account.'}
                </p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <InputWithIcon
                                id="firstName"
                                name="firstName"
                                placeholder="First name"
                                icon={PersonIcon}required
                            />
                            <InputWithIcon
                                id="lastName"
                                name="lastName"
                                placeholder="Last name"
                                icon={PersonIcon}
                                required
                            />
                        </>
                    )}
                    <InputWithIcon
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email address"
                        icon={EnvelopeIcon}
                        required
                    />
                    <InputWithIcon
                        id="password"
                        name="password"
                        type="password"
                        placeholder={isLogin ? 'Password' : 'Create a password'}
                        icon={LockIcon}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    {isLogin ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setIsLogin(false)}
                                className="font-medium text-emerald-500 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                            >
                                Create Account
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setIsLogin(true)}
                                className="font-medium text-emerald-500 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </section>
        </div>
    )
}
