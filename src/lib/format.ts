import type { NamedValue } from '@/lib/types'

export function formatDisplayDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatStockQuantity(value: string | number) {
  return Number(value).toFixed(2)
}

export function formatQuantity(value: string | number | null | undefined) {
  if (value === undefined || value === null || value === '') return 'N/A'
  const quantityValue = Number(value)
  if (Number.isNaN(quantityValue)) return 'N/A'
  return Number.isInteger(quantityValue) ? String(quantityValue) : quantityValue.toFixed(2)
}

export function displayNamedValue(value: NamedValue) {
  if (!value) return 'N/A'
  if (typeof value === 'string') return value || 'N/A'
  return value.name || value.slug || 'N/A'
}
