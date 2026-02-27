import { useAuth } from '../context/AuthContext'

export function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
        Settings
      </h1>
      <p className="text-gray-500 text-sm">
        Account and app settings. Use the profile picture in the top right to change your personal information.
      </p>
    </div>
  )
}
