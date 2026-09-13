import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>
        <form className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="your@email.com"
            required
          />
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Authentication will be implemented in Phase 1
        </p>
      </div>
    </div>
  )
}
