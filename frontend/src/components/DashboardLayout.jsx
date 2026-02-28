import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { BLogo } from './BLogo'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
    isActive
      ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-200'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`

function ChevronRight() {
  return (
    <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Account'
  const isProfilePage = location.pathname === '/dashboard/profile'

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [profileOpen])

  function handleSignOut() {
    setProfileOpen(false)
    logout()
    navigate('/')
  }

  function Avatar({ size = 'w-10 h-10', textSize = 'text-sm' }) {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt=""
          className={`${size} rounded-full object-cover shadow-md shrink-0`}
        />
      )
    }
    return (
      <span className={`${size} rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium shadow-md shadow-emerald-200/50 shrink-0 ${textSize}`}>
        {initials}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-teal-50/40 flex">
      {/* Left sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white/80 backdrop-blur-sm flex flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-gray-200">
          <BLogo className="w-9 h-9 shrink-0" />
          <span className="text-lg font-semibold text-gray-900 tracking-tight">Backspace</span>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <NavLink to="/dashboard" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/residents"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {/* People icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a4 4 0 00-4-4H4a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            Residents
          </NavLink>
          <NavLink
            to="/dashboard/calendar"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </NavLink>
        </nav>
        {/* Profile: photo, full first + last name, arrow - click opens popup */}
        <div className="relative mt-auto mx-2 mb-2" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className={`w-full p-4 border-t border-gray-200 flex items-center gap-3 rounded-xl text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white transition-colors ${isProfilePage ? 'bg-emerald-500/10' : ''}`}
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <Avatar />
            <span className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">
              {fullName}
            </span>
            <ChevronRight />
          </button>
          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 py-3 px-2 bg-white rounded-xl border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 px-3 pb-3 mb-2 border-b border-gray-100 cursor-default">
                <Avatar size="w-9 h-9" textSize="text-xs" />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {fullName}
                </span>
              </div>
              <NavLink
                to="/dashboard/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mx-1 transition-colors cursor-pointer"
              >
                <UserIcon />
                Profile
              </NavLink>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset transition-colors cursor-pointer text-left"
              >
                <span className="text-red-500">
                  <SignOutIcon />
                </span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
