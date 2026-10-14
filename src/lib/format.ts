import type { NamedValue } from '@/lib/types'

export type DateStyle = 'date' | 'long' | 'time' | 'datetime'

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  date: { day: 'numeric', month: 'short', year: 'numeric' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  time: { hour: 'numeric', minute: '2-digit', hour12: true },
  datetime: {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
}

export function formatDate(
  value: string | number | Date | null | undefined,
  style: DateStyle = 'date',
) {
  if (value === undefined || value === null || value === '') return 'N/A'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-GB', DATE_OPTIONS[style])
}

export function formatDisplayDate(value: string) {
  return formatDate(value, 'date')
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

export function formatUnitPrice(amount: string | number | null | undefined, unit?: string) {
  if (amount === undefined || amount === null || amount === '') return '—'
  const numeric = Number(amount)
  const money = Number.isNaN(numeric) ? String(amount) : `US$${numeric.toFixed(2)}`
  return unit ? `${money} / ${unit}` : money
}

export function displayNamedValue(value: NamedValue) {
  if (!value) return 'N/A'
  if (typeof value === 'string') return value || 'N/A'
  return value.name || value.slug || 'N/A'
}

export function namedSlug(value: NamedValue) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.slug || ''
}

export function toDateInputValue(value: string | number | Date | null | undefined) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value === 'string') return value.slice(0, 10)
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}
