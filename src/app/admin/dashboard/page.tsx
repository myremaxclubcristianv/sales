import { PrivateLayout } from '@/components/layout/private/PrivateLayout'

export default function Dashboard() {
  return (
    <PrivateLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Clients</h2>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Active Properties</h2>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Pending Tasks</h2>
            <p className="text-3xl font-bold text-orange-600">0</p>
          </div>
        </div>
      </div>
    </PrivateLayout>
  )
}
