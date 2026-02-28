import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'backspace_user'

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('supporter')
    return stored ? JSON.parse(stored) : null
  })

  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const login = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('supporter', JSON.stringify(data.supporter))
    setUser(data.supporter)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('supporter')
    setUser(null)
  }

  // Persist user whenever it changes (e.g. from updateUser in same tick)
  useEffect(() => {
    if (!hydrated) return
    setStoredUser(user)
  }, [user, hydrated])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
