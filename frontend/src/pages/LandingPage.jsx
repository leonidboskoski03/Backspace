import { Link } from 'react-router-dom'
import { BLogo } from '../components/BLogo'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-teal-50/40 flex flex-col">
      <header className="p-6 flex items-center gap-3">
        <BLogo className="w-10 h-10 shrink-0" />
        <span className="text-xl font-semibold text-gray-900 tracking-tight">Backspace</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight max-w-2xl mb-4">
          Леонид е педер во душата 
        </h1>
        <p className="text-gray-500 text-lg max-w-md mb-10">
          Просто. Јасно. На едно место.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-lg shadow-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all"
          >
            Get started
          </Link>
        </div>
      </main>
    </div>
  )
}
