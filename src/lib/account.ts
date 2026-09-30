import type { MeResponse } from '@/lib/types'

export function accountLabel(me: MeResponse | null | undefined) {
  const name = me?.profile?.full_name?.trim() || me?.email || 'this account'
  const email = me?.email && name !== me.email ? me.email : undefined
  return { name, email }
}
