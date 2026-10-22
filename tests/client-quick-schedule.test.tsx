import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientQuickScheduleModal } from '@/components/ClientQuickScheduleModal'
import { ClientStatusSelect } from '@/components/ClientStatusSelect'
import { CLIENT_STATUSES } from '@/lib/types/crm'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

describe('ClientQuickScheduleModal — Component & Error Scenarios', () => {
  const testClientId = '11111111-2222-3333-4444-555555555555'
  const testClientName = 'Andrei Popescu'

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders trigger button with min-h-[44px] touch target', () => {
    render(
      <ClientQuickScheduleModal
        clientId={testClientId}
        clientName={testClientName}
        phone="+40721000111"
      />
    )

    const triggerBtn = screen.getByRole('button', { name: /programează/i })
    expect(triggerBtn).toBeInTheDocument()
    expect(triggerBtn.className).toContain('min-h-[44px]')
  })

  it('opens interactive calendar modal and displays client name and presets', async () => {
    const user = userEvent.setup()
    render(
      <ClientQuickScheduleModal
        clientId={testClientId}
        clientName={testClientName}
        phone="+40721000111"
      />
    )

    const triggerBtn = screen.getByRole('button', { name: /programează/i })
    await user.click(triggerBtn)

    expect(screen.getByText('Programare Rapidă')).toBeInTheDocument()
    expect(screen.getByText(testClientName)).toBeInTheDocument()
    expect(screen.getByText('Azi')).toBeInTheDocument()
    expect(screen.getByText('Mâine')).toBeInTheDocument()
    expect(screen.getByText('+3 zile')).toBeInTheDocument()
    expect(screen.getByText('Săpt. viitoare')).toBeInTheDocument()
  })

  it('handles repeated clicks (anti-double-click guard) so only 1 network request is dispatched', async () => {
    const user = userEvent.setup()
    let fetchCount = 0
    let resolveFetch: (value: Response) => void

    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve
    })

    global.fetch = vi.fn().mockImplementation(() => {
      fetchCount++
      return fetchPromise
    })

    render(
      <ClientQuickScheduleModal
        clientId={testClientId}
        clientName={testClientName}
        phone="+40721000111"
      />
    )

    await user.click(screen.getByRole('button', { name: /programează/i }))

    const saveBtn = screen.getByRole('button', { name: /confirmă programarea/i })
    expect(saveBtn).not.toBeDisabled()

    // Rapid double click
    await user.click(saveBtn)
    await user.click(saveBtn)
    await user.click(saveBtn)

    expect(fetchCount).toBe(1)
    expect(screen.getByText(/se salvează.../i)).toBeInTheDocument()

    // Finish request
    resolveFetch!(new Response(JSON.stringify({ followUp: { id: 'fu-1' }, activity: { id: 'act-1' } }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }))

    await waitFor(() => {
      expect(screen.getByText(/programare salvată cu succes/i)).toBeInTheDocument()
    })
  })

  it('handles server failure, displays error message, preserves inputs, and allows retry', async () => {
    const user = userEvent.setup()

    // 1st call fails
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Eroare la crearea activității: DB connection timeout' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      // 2nd call (retry) succeeds
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ followUp: { id: 'fu-2' }, activity: { id: 'act-2' } }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      )

    render(
      <ClientQuickScheduleModal
        clientId={testClientId}
        clientName={testClientName}
        phone="+40721000111"
      />
    )

    await user.click(screen.getByRole('button', { name: /programează/i }))

    const notesInput = screen.getByPlaceholderText(/notează contextul/i)
    await user.type(notesInput, 'Notiță importantă de test')

    const saveBtn = screen.getByRole('button', { name: /confirmă programarea/i })
    await user.click(saveBtn)

    // Should display error banner
    await waitFor(() => {
      expect(screen.getByText(/Eroare la crearea activității: DB connection timeout/i)).toBeInTheDocument()
    })

    // Input preserved
    expect(notesInput).toHaveValue('Notiță importantă de test')

    // Button should be re-enabled for retry
    const retryBtn = screen.getByRole('button', { name: /confirmă programarea/i })
    expect(retryBtn).not.toBeDisabled()

    // User retries
    await user.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText(/programare salvată cu succes/i)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('ensures payload contains clientId, reason, due_date, and log_activity: true', async () => {
    const user = userEvent.setup()
    let capturedBody: Record<string, unknown> | null = null

    global.fetch = vi.fn().mockImplementation((_url, init) => {
      capturedBody = JSON.parse(init.body)
      return Promise.resolve(
        new Response(JSON.stringify({ followUp: { id: 'fu-3' }, activity: { id: 'act-3' } }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    render(
      <ClientQuickScheduleModal
        clientId={testClientId}
        clientName={testClientName}
        phone="+40721000111"
      />
    )

    await user.click(screen.getByRole('button', { name: /programează/i }))
    await user.click(screen.getByText('Revenire ofertă'))

    const saveBtn = screen.getByRole('button', { name: /confirmă programarea/i })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(capturedBody).not.toBeNull()
    })

    expect(capturedBody.client_id).toBe(testClientId)
    expect(capturedBody.reason).toBe('Revenire ofertă')
    expect(capturedBody.log_activity).toBe(true)
    expect(capturedBody.priority).toBe('NORMAL')
    expect(capturedBody.due_date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/)
  })
})

describe('ClientStatusSelect & IDIOT status integration', () => {
  it('includes IDIOT status with correct meta configuration', () => {
    const idiotMeta = CLIENT_STATUSES.find((s) => s.id === 'IDIOT')
    expect(idiotMeta).toBeDefined()
    expect(idiotMeta?.label).toBe('IDIOT')
    expect(idiotMeta?.badgeBg).toContain('rose')
  })

  it('applies right-0 alignment when align="right" on mobile', () => {
    const { container } = render(
      <ClientStatusSelect
        clientId="test-client-id"
        currentStatus="ACTIVE"
        align="right"
      />
    )

    const trigger = screen.getByRole('button', { name: /schimbă status client/i })
    fireEvent.click(trigger)

    const dropdown = container.querySelector('.right-0')
    expect(dropdown).toBeInTheDocument()
  })
})
