'use client'

import { Suspense } from 'react'
import { PrivateLayout } from '@/components/layout/private/PrivateLayout'
import { NewInsuranceClientForm } from './NewInsuranceClientForm'

export default function NewInsurancePage() {
  return (
    <PrivateLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Suspense
          fallback={
            <div className="p-12 text-center text-sm text-neutral-500">
              Se încarcă formularul de introducere client Insurance...
            </div>
          }
        >
          <NewInsuranceClientForm />
        </Suspense>
      </div>
    </PrivateLayout>
  )
}
