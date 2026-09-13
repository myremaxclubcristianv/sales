import { getViewings } from '@/lib/db/viewings'
import { getClients } from '@/lib/db/clients'
import { getProperties } from '@/lib/db/properties'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { ViewingsManager, type ViewingItem } from './ViewingsManager'

export const dynamic = 'force-dynamic'

export default async function AdminViewingsPage() {
  const [viewings, clients, properties] = await Promise.all([
    getViewings(),
    getClients(),
    getProperties(),
  ])

  // Filter clients and properties for the form
  const clientOptions = clients.map((c) => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
  }))

  const propertyOptions = properties.map((p) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price,
    currency: p.currency,
  }))

  return (
    <PrivateLayout>
      <div className="max-w-7xl mx-auto">
        <ViewingsManager
          initialViewings={viewings as unknown as ViewingItem[]}
          clients={clientOptions}
          properties={propertyOptions}
        />
      </div>
    </PrivateLayout>
  )
}
