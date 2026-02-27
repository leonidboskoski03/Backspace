import { useAuth } from '../context/AuthContext'

const labelClasses = 'block text-sm font-medium text-gray-500 mb-1'
const valueClasses = 'block text-base text-gray-900 font-medium'

export function Profile() {
  const { user } = useAuth()

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
        Profile
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Your account information. This section is read-only.
      </p>

      <div className="flex items-center gap-6 mb-8">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-md shrink-0"
          />
        ) : (
          <span className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-medium shadow-md shadow-emerald-200/50 shrink-0">
            {initials}
          </span>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <span className={labelClasses}>First Name</span>
          <span className={valueClasses}>{user?.firstName ?? '—'}</span>
        </div>
        <div>
          <span className={labelClasses}>Last Name</span>
          <span className={valueClasses}>{user?.lastName ?? '—'}</span>
        </div>
        <div>
          <span className={labelClasses}>Email address</span>
          <span className={valueClasses}>{user?.email ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}
