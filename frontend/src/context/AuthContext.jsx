import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('supporter')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (data) => {
    if (!data.token) {
      console.error('[AuthContext] login() called but data.token is missing:', data)
      return
    }
    console.log('[AuthContext] saving token to localStorage')
    localStorage.setItem('token', data.token)
    localStorage.setItem('supporter', JSON.stringify(data.supporter))
    setUser(data.supporter)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('supporter')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
