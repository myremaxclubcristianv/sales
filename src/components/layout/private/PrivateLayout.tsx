import React from 'react'
import Link from 'next/link'

interface PrivateLayoutProps {
  children: React.ReactNode
}

export function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="text-xl font-bold text-gray-900">
              CRM Admin
            </Link>
            <div className="flex gap-6">
              <Link href="/admin/clients" className="text-gray-600 hover:text-gray-900">
                Clients
              </Link>
              <Link href="/admin/properties" className="text-gray-600 hover:text-gray-900">
                Properties
              </Link>
              <Link href="/admin/requests" className="text-gray-600 hover:text-gray-900">
                Requests
              </Link>
              <Link href="/admin/tasks" className="text-gray-600 hover:text-gray-900">
                Tasks
              </Link>
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
