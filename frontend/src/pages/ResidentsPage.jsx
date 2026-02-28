import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function ResidentsPage() {
  const [residents, setResidents]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [confirmId, setConfirmId]       = useState(null) // id of row awaiting confirmation
  const [deletingId, setDeletingId]     = useState(null) // id currently being deleted

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const token = localStorage.getItem('token')
        const res   = await fetch(`${API}/api/residents`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to fetch residents')
        setResidents(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchResidents()
  }, [])

  const handleDeleteClick = (id) => {
    // First click — ask for confirmation
    setConfirmId(id)
  }

  const handleConfirmDelete = async (id) => {
    setDeletingId(id)
    try {
      const token = localStorage.getItem('token')
      const res   = await fetch(`${API}/api/residents/${id}`, {
        method:  'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Delete failed')
      setResidents((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  const handleCancelDelete = () => setConfirmId(null)

  const headers = ['Flat No.', 'Name', 'Surname', 'Payment Date', 'Status', '']

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">All Residents</h1>
        <p className="text-sm text-gray-500">{residents.length} resident{residents.length !== 1 ? 's' : ''} registered</p>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error   && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && residents.length === 0 && (
        <p className="text-gray-400 text-sm">No residents found. Upload an Excel file from the Dashboard.</p>
      )}

      {!loading && residents.length > 0 && (
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
                    <td className="px-4 py-2.5 text-gray-900 border-r border-gray-100">{r.flatNumber}</td>
                    <td className="px-4 py-2.5 text-gray-900 border-r border-gray-100">{r.name}</td>
                    <td className="px-4 py-2.5 text-gray-900 border-r border-gray-100">{r.surname}</td>
                    <td className="px-4 py-2.5 text-gray-900 border-r border-gray-100">
                      {new Date(r.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 border-r border-gray-100">
                      {r.isDueSoon
                        ? <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Due Soon</span>
                        : <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">OK</span>
                      }
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {confirmId === r._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500">Are you sure?</span>
                          <button
                            onClick={() => handleConfirmDelete(r._id)}
                            disabled={deletingId === r._id}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deletingId === r._id ? 'Deleting...' : 'Yes, delete'}
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteClick(r._id)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg text-red-500 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      )}
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
