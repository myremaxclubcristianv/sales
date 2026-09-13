import React from 'react'

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-gray-900">
              CRM Platform
            </a>
            <div className="flex gap-6">
              <a href="/properties" className="text-gray-600 hover:text-gray-900">
                Properties
              </a>
              <a href="/requests" className="text-gray-600 hover:text-gray-900">
                Requests
              </a>
              <a href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            © 2024 CRM Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
