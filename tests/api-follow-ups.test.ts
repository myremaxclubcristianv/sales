import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/follow-ups/route'
import * as followUpsDb from '@/lib/db/follow-ups'
import * as activitiesDb from '@/lib/db/activities'
import * as supabaseServer from '@/lib/supabase/server'

vi.mock('@/lib/db/follow-ups', () => ({
  createFollowUp: vi.fn(),
}))

vi.mock('@/lib/db/activities', () => ({
  createActivity: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('POST /api/follow-ups — RPC distinction & fallback behavior', () => {
  const mockUser = { id: 'user-admin-123' }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('proceeds to Level 2 fallback when RPC is missing (PGRST202)', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST202', message: 'Could not find the function public.create_scheduled_follow_up in the schema cache' },
    })

    const mockDelete = vi.fn().mockReturnValue({ eq: vi.fn() })
    const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete })

    vi.mocked(supabaseServer.createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      rpc: mockRpc,
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>)

    vi.mocked(followUpsDb.createFollowUp).mockResolvedValue({
      id: 'fu-fallback-1',
      client_id: 'c-1',
    } as unknown as Awaited<ReturnType<typeof followUpsDb.createFollowUp>>)

    vi.mocked(activitiesDb.createActivity).mockResolvedValue({
      id: 'act-fallback-1',
      client_id: 'c-1',
    } as unknown as Awaited<ReturnType<typeof activitiesDb.createActivity>>)

    const req = new Request('http://localhost:3000/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify({
        client_id: 'c-1',
        reason: 'Sună clientul',
        due_date: '2026-11-04T10:00:00',
        log_activity: true,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.followUp.id).toBe('fu-fallback-1')
    expect(json.activity.id).toBe('act-fallback-1')
    expect(followUpsDb.createFollowUp).toHaveBeenCalledTimes(1)
    expect(activitiesDb.createActivity).toHaveBeenCalledTimes(1)
  })

  it('does NOT trigger fallback on real RPC permission error (42501 Unauthorized)', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: '42501', message: 'Unauthorized: Doar administratorii și agenții pot programa activități.' },
    })

    vi.mocked(supabaseServer.createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      rpc: mockRpc,
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>)

    const req = new Request('http://localhost:3000/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify({
        client_id: 'c-1',
        reason: 'Sună clientul',
        due_date: '2026-11-04T10:00:00',
        log_activity: true,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('Unauthorized')

    // Must NOT call fallback!
    expect(followUpsDb.createFollowUp).not.toHaveBeenCalled()
    expect(activitiesDb.createActivity).not.toHaveBeenCalled()
  })

  it('does NOT trigger fallback on real RPC data error (client not found)', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'Clientul specificat nu există sau nu aveți acces.' },
    })

    vi.mocked(supabaseServer.createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) },
      rpc: mockRpc,
    } as unknown as Awaited<ReturnType<typeof supabaseServer.createClient>>)

    const req = new Request('http://localhost:3000/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify({
        client_id: 'c-missing',
        reason: 'Sună clientul',
        due_date: '2026-11-04T10:00:00',
        log_activity: true,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Clientul specificat nu există')

    // Must NOT call fallback!
    expect(followUpsDb.createFollowUp).not.toHaveBeenCalled()
  })
})
