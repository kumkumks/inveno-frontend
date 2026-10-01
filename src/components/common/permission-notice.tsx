import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { accountLabel } from '@/lib/account'
import { displayRole } from '@/lib/roles'

export function PermissionNotice({ action }: { action: string }) {
  const { me, logout } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const { name, email } = accountLabel(me)
  const roleLabel = displayRole(me?.profile?.user_type)

  const switchAccount = async () => {
    setSigningOut(true)
    try {
      await logout()
      navigate('/login')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p>
        Signed in as {name}
        {email ? ` (${email})` : ''} with role {roleLabel}.
        This account {action}. Sign out and use an account that can.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-3"
        disabled={signingOut}
        onClick={() => void switchAccount()}
      >
        {signingOut ? 'Signing out…' : 'Sign out and use another account'}
      </Button>
    </div>
  )
}
