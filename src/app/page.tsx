import { PublicLayout } from '@/components/layout/public/PublicLayout'

export default function Home() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Premium Real Estate & Client Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional platform for real estate, insurance, credit, and client relationship management
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/properties"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Properties
            </a>
            <a
              href="/requests"
              className="px-6 py-3 border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
            >
              Browse Requests
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
