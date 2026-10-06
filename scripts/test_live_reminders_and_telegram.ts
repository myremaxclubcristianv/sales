import { createAdminClient } from '../src/lib/supabase/admin'
import { checkAndGenerateReminders } from '../src/lib/utils/reminders'

async function runLiveTest() {
  console.log('\n========================================')
  console.log('🧪 LIVE REMINDERS & TELEGRAM INTEGRATION TEST')
  console.log('========================================\n')

  const adminClient = createAdminClient()

  console.log('1. Executing checkAndGenerateReminders (First Run)...')
  const run1 = await checkAndGenerateReminders(adminClient)
  console.log('Run 1 Result:', JSON.stringify(run1, null, 2))

  console.log('\n2. Executing checkAndGenerateReminders (Second Run - Idempotency Check)...')
  const run2 = await checkAndGenerateReminders(adminClient)
  console.log('Run 2 Result:', JSON.stringify(run2, null, 2))

  if (run2.birthdayRemindersCreated !== 0 || run2.followUpRemindersCreated !== 0) {
    console.error('❌ IDEMPOTENCY FAILED: Run 2 created new notifications on immediate repeat!')
    process.exit(1)
  }

  console.log('\n✔ IDEMPOTENCY CONFIRMED: Run 2 created 0 duplicate notifications and 0 duplicate Telegram alerts!')
  console.log('========================================\n')
}

runLiveTest().catch((err) => {
  console.error('Test execution error:', err)
  process.exit(1)
})
