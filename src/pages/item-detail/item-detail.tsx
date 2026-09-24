import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, ChevronDown, ClockArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { formatApiError } from '@/lib/errors'
import { Badge } from '@/components/ui/badge'
import Statscard from '@/components/common/statscard'
type NamedValue = string | { name?: string; slug?: string } | null | undefined

type StatsData = {
    id: number
    value: string
    description: string
}

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
    image?: string
}

const historyRows = [
    'Incoming',
    'Outgoing',
    'Item edit',
    'Incoming',
    'Outgoing',
    'Item edit',
    'Incoming',
    'Item edit',
    'Outgoing',
    'Incoming',
] as const

function actionStyle(action: (typeof historyRows)[number]) {
    if (action === 'Outgoing') {
        return { pill: 'bg-[#fde8e8] text-[#e11d48]', Icon: ArrowUpRight }
    }
    if (action === 'Item edit') {
        return { pill: 'bg-neutral-900 text-white', Icon: Pencil }
    }
    return { pill: 'bg-[#e7f6e4] text-[#3d9a4a]', Icon: ArrowDownLeft }
}

function displayValue(value: NamedValue) {
    if (!value) return 'N/A'
    if (typeof value === 'string') return value || 'N/A'
    return value.name || value.slug || 'N/A'
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

    const quantityValue = Number(item?.quantity_on_hand)
    const quantity =
        item?.quantity_on_hand === undefined || item.quantity_on_hand === null || item.quantity_on_hand === '' || Number.isNaN(quantityValue)
            ? 'N/A'
            : Number.isInteger(quantityValue)
                ? String(quantityValue)
                : quantityValue.toFixed(2)

    const category = displayValue(item?.category)

    const stats: StatsData[] = item
        ? [
            { id: 1, value: quantity, description: 'In stock' },
            { id: 2, value: 'N/A', description: 'Total issued' },
            { id: 3, value: 'N/A', description: 'Stock value' },
        ]
        : []

    return (
        <div className="flex h-auto min-h-0 w-full flex-col overflow-x-hidden bg-white px-4 py-4 text-black sm:px-7 sm:py-6 lg:h-full lg:flex-row lg:overflow-hidden">
            <section className="w-full shrink-0 border-b border-gray-200 pb-6 lg:max-w-sm lg:overflow-y-auto lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0 lg:scrollbar-none">
                {loading && <p className="text-sm text-gray-500">Loading item…</p>}
                {!loading && error && <p className="text-sm text-red-500">{error}</p>}
                {/* col-1 */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="gray"
                        className="h-8 w-fit rounded-lg bg-gray-100 px-3 text-sm font-normal text-gray-800 hover:bg-gray-200"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="size-4" />
                        Go back
                    </Button>
                </div>

                <h1 className="mt-5 text-lg font-semibold uppercase wrap-break-word text-black sm:text-xl">
                    {item?.name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                    {item?.part_number && (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                            {item.part_number}
                            <ChevronDown className="size-4" />
                        </span>
                    )}
                    {category !== 'N/A' && (
                        <Badge variant="dark" className="rounded-full px-2.5">
                            {category}
                        </Badge>
                    )}
                </div>

                <div className="mt-6">
                    <Statscard data={stats} divided />
                </div>

                <div className="relative mt-5 overflow-hidden rounded-xl bg-[#f3f3f3]">
                    {item?.image ? (
                        <img src={item.image} alt={item.name || 'Item'} className="aspect-4/3 w-full object-contain" />
                    ) : (
                        <div className="aspect-4/3 w-full bg-[#ececec]" />
                    )}
                    <button
                        type="button"
                        aria-label="Edit image"
                        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm"
                    >
                        <Pencil className="size-3.5" />
                    </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    {[0, 1, 2].map((thumb) => (
                        <div
                            key={thumb}
                            className="size-12 rounded-md border border-gray-200 bg-white bg-size-[10px_10px] bg-[linear-gradient(45deg,#e8e8e8_25%,transparent_25%),linear-gradient(-45deg,#e8e8e8_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e8e8e8_75%),linear-gradient(-45deg,transparent_75%,#e8e8e8_75%)] bg-position-[0_0,0_5px,5px_-5px,-5px_0]"
                        />
                    ))}
                    <button
                        type="button"
                        aria-label="Add image"
                        className="flex size-12 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-800"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 p-4">
                    <h2 className="text-sm font-semibold text-neutral-900">Item actions</h2>
                    <p className="mt-1 text-sm font-medium text-neutral-800">Edit details, delete, or restore this product</p>
                    <div className="mt-3 flex items-center gap-2">
                        <Button variant="dark" className="h-8 rounded-full px-3.5 text-xs">
                            Edit
                            <Pencil className="size-3.5" />
                        </Button>
                        <button
                            type="button"
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#fde8e8] px-3.5 text-xs font-medium text-[#e11d48]"
                        >
                            Delete
                            <Trash2 className="size-3.5" />
                        </button>
                    </div>
                </div>
            </section>

            <section className="mt-6 flex min-h-80 min-w-0 flex-1 flex-col lg:mt-0 lg:min-h-0 lg:pl-8">
                <h2 className="text-base font-medium text-neutral-900">Item history</h2>
                <div className="mt-4 h-[min(28rem,55vh)] overflow-auto  lg:h-auto lg:min-h-0 lg:flex-1">
                <table className="w-full min-w-160 text-left">
                    <thead>
                        <tr className="text-sm text-gray-400">
                            <th className="sticky top-0 bg-white pb-3 pr-4 font-normal">Action</th>
                            <th className="sticky top-0 bg-white pb-3 pr-4 font-normal">Recorded on</th>
                            <th className="sticky top-0 bg-white pb-3 pr-4 font-normal">Recorded by</th>
                            <th className="sticky top-0 bg-white pb-3 font-normal">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyRows.map((action, index) => {
                            const { pill, Icon } = actionStyle(action)
                            return (
                                <tr key={`${action}-${index}`}>
                                    <td className="py-2.5 pr-4">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${pill}`}>
                                            <Icon className="size-3.5" />
                                            {action}
                                        </span>
                                    </td>
                                    <td className="py-2.5 pr-4">
                                        <div className="text-sm text-neutral-800">20-12-2025</div>
                                        <div className="text-xs text-gray-400">04:23pm</div>
                                    </td>
                                    <td className="py-2.5 pr-4">
                                        <div className="text-sm text-neutral-800">Jefin James</div>
                                        <div className="text-xs text-gray-400">Supervisor</div>
                                    </td>
                                    <td className="py-2.5 text-sm text-neutral-700">Table cell</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                </div>
            </section>
        </div>
    )
}

export default Item_detail
