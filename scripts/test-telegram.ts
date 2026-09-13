import {
  isTelegramConfigured,
  escapeTelegramHtml,
  sanitizeUserText,
  formatLeadTelegramMessage,
  sendTelegramMessage,
  notifyNewLeadTelegram,
  LeadNotificationPayload,
} from '../src/lib/telegram/telegram'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

async function runTests() {
  console.log('🧪 Starting Telegram Integration Test Suite...\n')

  // 1. Test HTML Escaping
  console.log('1. Testing HTML Escaping...')
  const unescaped = '<script>alert("hack & run")</script> & \'test\''
  const escaped = escapeTelegramHtml(unescaped)
  assert(
    escaped === '&lt;script&gt;alert(&quot;hack &amp; run&quot;)&lt;/script&gt; &amp; &#39;test&#39;',
    `escapeTelegramHtml failed: ${escaped}`
  )
  console.log('   ✓ HTML escaping is secure against XSS/formatting injection')

  // 2. Test Text Sanitization & Truncation
  console.log('2. Testing Text Sanitization & Truncation...')
  const multilineText = 'Line 1\n\n\n\nLine 2\r\n\r\n\r\nLine 3'
  const sanitized = sanitizeUserText(multilineText)
  assert(sanitized === 'Line 1\n\nLine 2\n\nLine 3', `sanitizeUserText newline collapse failed: ${sanitized}`)

  const longText = 'A'.repeat(2000)
  const truncated = sanitizeUserText(longText, 500)
  assert(truncated.includes('… <i>[mesaj trunchiat]</i>'), 'sanitizeUserText did not add truncation marker')
  assert(truncated.startsWith('A'.repeat(500)), 'sanitizeUserText did not truncate at 500 chars')
  console.log('   ✓ Newline normalization & text truncation verified')

  // 3. Test Message Formatting
  console.log('3. Testing Message Formatting in Romanian...')
  const sampleLead: LeadNotificationPayload = {
    name: 'Ion Popescu',
    phone: '+40 712 345 678',
    email: 'ion.popescu@example.com',
    message: 'Doresc o vizionare pentru proprietatea din Primăverii <confidential>',
    source: 'website',
    property_title: 'Vilă Istorică Primăverii & Grădină',
    created_at: '2026-09-13T14:30:00.000Z',
  }
  const formatted = formatLeadTelegramMessage(sampleLead)
  assert(formatted.includes('🔔 <b>NOU LEAD — SALES</b>'), 'Missing header')
  assert(formatted.includes('👤 <b>Nume:</b> Ion Popescu'), 'Missing name')
  assert(formatted.includes('📞 <b>Telefon:</b> +40 712 345 678'), 'Missing phone')
  assert(formatted.includes('✉️ <b>Email:</b> ion.popescu@example.com'), 'Missing email')
  assert(formatted.includes('🏠 <b>Proprietate:</b> Vilă Istorică Primăverii &amp; Grădină'), 'Missing or unescaped property title')
  assert(formatted.includes('Doresc o vizionare pentru proprietatea din Primăverii &lt;confidential&gt;'), 'Unescaped message')
  assert(formatted.includes('🔗 <b>CRM:</b> <a href="https://sales.cristianvaduva.com/admin/leads">sales.cristianvaduva.com/admin/leads</a>'), 'Missing CRM link')
  console.log('   ✓ Romanian template formatting verified with all fields and escaping')

  // 4. Test Missing Fields Omission
  console.log('4. Testing Missing Optional Fields Omission...')
  const minimalLead: LeadNotificationPayload = {
    name: 'Maria Ionescu',
    phone: '+40 799 111 222',
  }
  const minimalFormatted = formatLeadTelegramMessage(minimalLead)
  assert(!minimalFormatted.includes('✉️ <b>Email:</b>'), 'Email should not appear when absent')
  assert(!minimalFormatted.includes('🏠 <b>Proprietate:</b>'), 'Property should not appear when absent')
  assert(!minimalFormatted.includes('📋 <b>Cerere:</b>'), 'Request should not appear when absent')
  assert(!minimalFormatted.includes('💬 <b>Mesaj:</b>'), 'Message should not appear when absent')
  console.log('   ✓ Absent fields are cleanly omitted')

  // 5. Test Unconfigured State (Graceful Skip)
  console.log('5. Testing Unconfigured Environment Behavior...')
  const origToken = process.env.TELEGRAM_BOT_TOKEN
  const origChatId = process.env.TELEGRAM_CHAT_ID

  delete process.env.TELEGRAM_BOT_TOKEN
  delete process.env.TELEGRAM_CHAT_ID

  assert(isTelegramConfigured() === false, 'isTelegramConfigured should be false when vars missing')

  const unconfiguredResult = await sendTelegramMessage('Test unconfigured')
  assert(unconfiguredResult.success === false, 'Result should not be success')
  assert(unconfiguredResult.skipped === true, 'Result should mark skipped as true')
  assert(unconfiguredResult.error?.includes('not configured') ?? false, 'Should have descriptive unconfigured error')

  const leadNotifyResult = await notifyNewLeadTelegram(sampleLead)
  assert(leadNotifyResult.skipped === true, 'notifyNewLeadTelegram should skip gracefully')
  console.log('   ✓ Safe degradation when Telegram credentials are not configured')

  // 6. Test Mock API Calls with Configured State
  console.log('6. Testing Configured State with Mock Telegram API...')
  process.env.TELEGRAM_BOT_TOKEN = 'mock_test_token_12345'
  process.env.TELEGRAM_CHAT_ID = '-100987654321'
  assert(isTelegramConfigured() === true, 'isTelegramConfigured should be true when vars present')

  // Mock global fetch
  const originalFetch = global.fetch
  try {
    // 6a. Success Mock
    global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = url.toString()
      assert(urlStr.includes('api.telegram.org/botmock_test_token_12345/sendMessage'), 'URL formatted incorrectly')
      const body = JSON.parse(init?.body as string)
      assert(body.chat_id === '-100987654321', 'chat_id mismatch')
      assert(body.parse_mode === 'HTML', 'parse_mode mismatch')
      return new Response(JSON.stringify({ ok: true, result: { message_id: 8899 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const mockSuccess = await notifyNewLeadTelegram(sampleLead)
    assert(mockSuccess.success === true, 'Mock send should succeed')
    assert(mockSuccess.messageId === 8899, 'messageId should match mock')
    console.log('   ✓ Successful message dispatch verified via mock API')

    // 6b. Error Mock (e.g. chat not found / bot blocked)
    global.fetch = async () => {
      return new Response(JSON.stringify({ ok: false, description: 'Bad Request: chat not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const mockError = await notifyNewLeadTelegram(sampleLead)
    assert(mockError.success === false, 'Mock error should return success=false')
    assert(mockError.error === 'Bad Request: chat not found', 'Mock error description mismatch')
    assert(typeof mockError.error === 'string' && !mockError.error.includes('mock_test_token_12345'), 'Bot token must never appear in error description')
    console.log('   ✓ Telegram API error handled safely without leaking bot token')

    // 6c. Timeout / Abort Mock
    global.fetch = async () => {
      const abortError = new Error('The operation was aborted')
      abortError.name = 'AbortError'
      throw abortError
    }

    const mockTimeout = await sendTelegramMessage('Test timeout', { timeoutMs: 100 })
    assert(mockTimeout.success === false, 'Timeout should return success=false')
    assert(mockTimeout.error?.includes('timed out') ?? false, 'Should report timeout error')
    console.log('   ✓ Timeout / AbortError handled safely')
  } finally {
    // Restore fetch and env
    global.fetch = originalFetch
    if (origToken) process.env.TELEGRAM_BOT_TOKEN = origToken
    else delete process.env.TELEGRAM_BOT_TOKEN

    if (origChatId) process.env.TELEGRAM_CHAT_ID = origChatId
    else delete process.env.TELEGRAM_CHAT_ID
  }

  console.log('\n🎉 ALL TELEGRAM TESTS PASSED SUCCESSFULLY!\n')
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err)
  process.exit(1)
})
