import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import * as XLSX from 'xlsx'

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
  const [importedData, setImportedData] = useState(null)
  const [importFileName, setImportFileName] = useState(null)
  const fileInputRef = useRef(null)

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })
        setImportedData(rows)
        setImportFileName(file.name)
      } catch (err) {
        console.error(err)
        setImportedData(null)
        setImportFileName(null)
      }
    }
    reader.readAsBinaryString(file)
  }

  const hasData = importedData && importedData.length > 0
  const headers = hasData ? importedData[0] : []
  const bodyRows = hasData ? importedData.slice(1) : []

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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-colors"
          >
            <UploadIcon />
            Import Excel
          </button>
        </div>
      </div>

      {hasData && (
        <div className="flex-1 min-h-0 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-12rem)]">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr>
                  {headers.map((cell, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0"
                    >
                      {String(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                  >
                    {headers.map((_, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-2.5 text-gray-900 border-r border-gray-100 last:border-r-0"
                      >
                        {row[colIndex] != null ? String(row[colIndex]) : ''}
                      </td>
                    ))}
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
