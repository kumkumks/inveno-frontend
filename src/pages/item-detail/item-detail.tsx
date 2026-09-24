import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { formatApiError } from '@/lib/errors'

type NamedValue = string | { name?: string; slug?: string } | null | undefined

type ItemDetail = {
  slug?: string
  name?: string
  category?: NamedValue
  part_number?: string
  alternate_part_number?: string
  location?: NamedValue
  warehouse?: NamedValue
  quantity_on_hand?: string | number
  unit?: string
  last_purchase_date?: string | null
  description?: string
  remarks?: string
}

function displayValue(value: NamedValue) {
  if (!value) return 'N/A'
  if (typeof value === 'string') return value || 'N/A'
  return value.name || value.slug || 'N/A'
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const Item_detail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      setError('Item not found')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    api
      .get<ItemDetail>(`/api/orgs/items/${slug}/`)
      .then((response) => {
        if (!cancelled) setItem(response.data)
      })
      .catch((err) => {
        if (!cancelled) setError(formatApiError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  const quantity =
    item?.quantity_on_hand === undefined || item.quantity_on_hand === null || item.quantity_on_hand === ''
      ? 'N/A'
      : Number(item.quantity_on_hand).toFixed(2)

  const fields = item
    ? [
        { label: 'Category', value: displayValue(item.category) },
        { label: 'Part number', value: item.part_number || 'N/A' },
        { label: 'Alternate part number', value: item.alternate_part_number || 'N/A' },
        { label: 'Location', value: displayValue(item.location) },
        { label: 'Warehouse', value: displayValue(item.warehouse) },
        { label: 'Quantity on hand', value: quantity },
        { label: 'Unit', value: item.unit || 'N/A' },
        {
          label: 'Last purchase date',
          value: item.last_purchase_date ? formatDate(item.last_purchase_date) : 'N/A',
        },
        { label: 'Description', value: item.description || 'N/A' },
        { label: 'Remarks', value: item.remarks || 'N/A' },
      ]
    : []

  return (
    <div className="flex min-w-0 w-full flex-col bg-white px-4 py-4 text-black sm:px-7 sm:py-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Button
            type="button"
            variant="outline"
            className="mb-3"
            onClick={() => navigate('/items-list')}
          >
            <ArrowLeft />
            Back
          </Button>
          <h1 className="text-xl font-normal wrap-break-word text-black sm:text-2xl md:text-3xl">
            {item?.name || 'Item detail'}
          </h1>
          {item?.slug && <p className="mt-1 text-sm text-gray-500">{item.slug}</p>}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading item…</p>}
      {!loading && error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && item && (
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 sm:p-6">
          {fields.map((field) => (
            <div key={field.label} className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{field.label}</div>
              <div className="mt-1 wrap-break-word text-sm text-black">{field.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Item_detail
