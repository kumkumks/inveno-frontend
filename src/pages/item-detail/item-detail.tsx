import { useRef, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AuthImage } from '@/components/common/auth-image'
import Statscard, { type StatsData } from '@/components/common/statscard'
import { PageShell } from '@/components/common/page-shell'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { formatApiError } from '@/lib/errors'
import { displayNamedValue, formatQuantity } from '@/lib/format'
import { cn } from '@/lib/utils'
import { getItem, uploadItemPhoto } from '@/services/items'

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

const Item_detail = () => {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { data: item, setData: setItem, error: loadError, loading } = useAsyncResource(
        () => getItem(slug as string),
        [slug],
        { enabled: Boolean(slug) },
    )
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedPhotoSlug, setSelectedPhotoSlug] = useState<string>()
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const error = slug ? loadError : 'Item not found'
    const photos = item?.photos ?? []
    const selectedPhoto = photos.find((photo) => photo.slug === selectedPhotoSlug) ?? photos[0]

    const openPhotoPicker = () => {
        if (photos.length >= 5) {
            setUploadError('An item can have at most 5 photos.')
            return
        }
        setUploadError('')
        fileInputRef.current?.click()
    }

    const onPhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file || !slug) return

        setUploading(true)
        setUploadError('')
        try {
            const photo = await uploadItemPhoto(slug, file)
            setItem((current) =>
                current ? { ...current, photos: [...(current.photos ?? []), photo] } : current,
            )
            setSelectedPhotoSlug(photo.slug)
        } catch (uploadFailure) {
            setUploadError(formatApiError(uploadFailure))
        } finally {
            setUploading(false)
        }
    }
    const quantity = formatQuantity(item?.quantity_on_hand)
    const category = displayNamedValue(item?.category)

    const stats: StatsData[] = item
        ? [
            { id: 1, value: quantity, description: 'In stock' },
            { id: 2, value: 'N/A', description: 'Total issued' },
            { id: 3, value: 'N/A', description: 'Stock value' },
        ]
        : []

    return (
        <PageShell className="h-auto min-h-0 overflow-x-hidden bg-white lg:h-full lg:flex-row lg:overflow-hidden">
            <section className="w-full shrink-0 border-b border-gray-200 pb-6 lg:max-w-sm lg:overflow-y-auto lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0 lg:scrollbar-none">
                {loading && <p className="text-sm text-gray-500">Loading item…</p>}
                {!loading && error && <p className="text-sm text-red-500">{error}</p>}
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
                    {selectedPhoto ? (
                        <AuthImage
                            url={selectedPhoto.url}
                            alt={item?.name || 'Item'}
                            className="aspect-4/3 w-full object-contain"
                        />
                    ) : (
                        <div className="flex aspect-4/3 w-full items-center bg-[#ececec]">
                            <div className="h-20 w-full text-center text-3xl font-semibold">No Image is here</div>
                        </div>
                    )}
                    <button
                        type="button"
                        aria-label="Edit image"
                        disabled={uploading}
                        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm disabled:opacity-50"
                        onClick={openPhotoPicker}
                    >
                        <Pencil className="size-3.5" />
                    </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    {photos.map((photo, index) => (
                        <button
                            key={photo.slug}
                            type="button"
                            aria-label={`Show photo ${index + 1}`}
                            aria-pressed={selectedPhoto?.slug === photo.slug}
                            className={cn(
                                'size-12 overflow-hidden rounded-md border bg-white',
                                selectedPhoto?.slug === photo.slug ? 'border-neutral-900' : 'border-gray-200',
                            )}
                            onClick={() => setSelectedPhotoSlug(photo.slug)}
                        >
                            <AuthImage url={photo.url} alt="" className="size-full object-cover" />
                        </button>
                    ))}
                    <button
                        type="button"
                        aria-label="Add image"
                        disabled={uploading}
                        className="flex size-12 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-800 disabled:opacity-50"
                        onClick={openPhotoPicker}
                    >
                        <Plus className="size-4" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={onPhotoSelected}
                    />
                </div>
                {uploading && <p className="mt-2 text-sm text-gray-500">Uploading image…</p>}
                {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}

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
        </PageShell>
    )
}

export default Item_detail
