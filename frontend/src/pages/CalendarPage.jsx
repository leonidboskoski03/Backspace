import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export function CalendarPage() {
  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selected, setSelected]   = useState(toYMD(today))
  const [residents, setResidents] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  // Set of "YYYY-MM-DD" strings that have at least one resident due
  const [dueDates, setDueDates]   = useState(new Set())

  // Fetch all residents once to build the dueDates set for dot markers
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('token')
        const res   = await fetch(`${API}/api/residents`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        const set = new Set(
          (Array.isArray(data) ? data : []).map((r) => toYMD(new Date(r.paymentDate)))
        )
        setDueDates(set)
      } catch (_) {}
    }
    fetchAll()
  }, [])

  // Fetch residents for selected date
  useEffect(() => {
    if (!selected) return
    const fetchByDate = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        const res   = await fetch(`${API}/api/residents/by-date?date=${selected}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to fetch')
        setResidents(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
        setResidents([])
      } finally {
        setLoading(false)
      }
    }
    fetchByDate()
  }, [selected])

  // Build calendar grid
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  function cellDate(day) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const todayYMD = toYMD(today)

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment Calendar</h1>
        <p className="text-sm text-gray-500">Select a date to see who has a payment due</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 w-full lg:w-96 shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              aria-label="Next month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const ymd       = cellDate(day)
              const isToday   = ymd === todayYMD
              const isSelected = ymd === selected
              const hasDue    = dueDates.has(ymd)

              return (
                <button
                  key={ymd}
                  onClick={() => setSelected(ymd)}
                  className={`
                    relative mx-auto flex flex-col items-center justify-center w-9 h-9 rounded-xl text-sm font-medium transition-colors
                    ${isSelected
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50'
                      : isToday
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {day}
                  {hasDue && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Residents panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Payments due on{' '}
                {new Date(selected + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </h2>
              {residents.length > 0 && (
                <span className="ml-auto text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  {residents.length} due
                </span>
              )}
            </div>

            {loading && <p className="px-5 py-6 text-sm text-gray-400">Loading...</p>}
            {error   && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}

            {!loading && !error && residents.length === 0 && (
              <div className="px-5 py-10 flex flex-col items-center text-center gap-2">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-gray-400">No payments due on this date</p>
              </div>
            )}

            {!loading && residents.length > 0 && (
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Flat No.', 'Name', 'Surname', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-100 last:border-r-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {residents.map((r) => (
                    <tr key={r._id} className="border-b border-gray-50 bg-red-50/40 hover:bg-red-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-red-700 border-r border-gray-100">{r.flatNumber}</td>
                      <td className="px-5 py-3 text-red-800 border-r border-gray-100">{r.name}</td>
                      <td className="px-5 py-3 text-red-800 border-r border-gray-100">{r.surname}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                          Payment Due
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

