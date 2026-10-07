import { notFound } from 'next/navigation'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { getChestertonsRequestById } from '@/lib/db/chestertons-requests'
import { ChestertonsRequestDetailView } from './ChestertonsRequestDetailView'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata(props: PageProps) {
  const { id } = await props.params
  const request = await getChestertonsRequestById(id)
  return {
    title: request
      ? `${request.cumparator} (${request.import_source_id}) | Cereri Chestertons`
      : 'Cerere Chestertons',
  }
}

export default async function ChestertonsRequestDetailPage(props: PageProps) {
  const { id } = await props.params
  const request = await getChestertonsRequestById(id)

  if (!request) {
    notFound()
  }

  return (
    <PrivateLayout>
      <div className="max-w-6xl mx-auto pb-16">
        <ChestertonsRequestDetailView request={request} />
      </div>
    </PrivateLayout>
  )
}
