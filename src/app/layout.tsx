import "@/styles/globals.css"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vlookup Automation - Back-Office Hub",
  description: "Task management and automation for property management operations",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <div className="flex flex-col min-h-screen">
          <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-2xl font-bold text-slate-900">Vlookup</Link>
                  <div className="hidden md:flex items-center gap-4">
                    <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">Dashboard</Link>
                    <Link href="/tasks" className="text-sm text-slate-600 hover:text-slate-900">Tasks</Link>
                    <Link href="/docs" className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <input
                      placeholder="Search tasks..."
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-600">Demo User</div>
                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {children}
        </div>
      </body>
    </html>
  )
}
