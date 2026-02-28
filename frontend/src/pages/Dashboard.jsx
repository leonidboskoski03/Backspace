import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function UploadIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const name = user?.firstName ? `${user.firstName}${user?.lastName ? ` ${user.lastName}` : ''}` : 'there'

  const [residents, setResidents]       = useState([])
  const [importFileName, setImportFileName] = useState(null)
  const [status, setStatus]             = useState(null) // { type: 'success'|'error', message }
  const [loading, setLoading]           = useState(false)
  const fileInputRef = useRef(null)

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setLoading(true)
    setStatus(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token')
      const res   = await fetch(`${API}/api/residents/upload`, {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')

      setImportFileName(file.name)
      setStatus({ type: 'success', message: `Upload complete — ${data.created} created, ${data.updated} updated.` })

      // Fetch updated resident list
      const resRes  = await fetch(`${API}/api/residents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const resData = await resRes.json()
      setResidents(Array.isArray(resData) ? resData : [])
    } catch (err) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const headers = ['Name', 'Surname', 'Flat Number', 'Payment Date', 'Due Soon']

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
            Welcome back, {name}
          </h1>
          <p className="text-gray-500 text-sm">
            {importFileName
              ? `Imported: ${importFileName}`
              : 'Use Import to bring in data from an Excel file.'}
          </p>
          {status && (
            <p className={`text-sm mt-1 ${status.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
              {status.message}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Import Excel file"
          />
          <button
            type="button"
            onClick={handleImportClick}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-colors disabled:opacity-60"
          >
            <UploadIcon />
            {loading ? 'Uploading...' : 'Import Excel'}
          </button>
        </div>
      </div>

      {residents.length > 0 && (
        <div className="flex-1 min-h-0 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-12rem)]">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {residents.map((r) => (
                  <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-2.5 text-gray-900 border-r border-gray-100">{r.name}</td>
                    <td className="px-4 py-2.5 text-gray-900 border-r border-gray-100">{r.surname}</td>
                    <td className="px-4 py-2.5 text-gray-900 border-r border-gray-100">{r.flatNumber}</td>
                    <td className="px-4 py-2.5 text-gray-900 border-r border-gray-100">
                      {new Date(r.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.isDueSoon
                        ? <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Due Soon</span>
                        : <span className="text-xs font-medium text-gray-400">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
