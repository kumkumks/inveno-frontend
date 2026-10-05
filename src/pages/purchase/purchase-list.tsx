import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ListSearch, SortableHead, StatusPill, tableHeadClass } from '@/components/common/list-table'
import { PageShell, PageTitle } from '@/components/common/page-shell'
import { formatDate } from '@/lib/format'
import { displayRole } from '@/lib/roles'
import { listPurchaseRequests } from '@/services/purchases'
import { isPermissionError } from '@/lib/errors'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'

const statusStyle = {
    approved: 'bg-[#e7f6e4] text-[#3d9a4a]',
    submitted: 'bg-[#fff6d8] text-[#b8860b]',
    revision_requested: 'bg-[#fde8dc] text-[#c47b5a]',
    declined: 'bg-[#fde8e8] text-[#e11d48]',
    draft: 'bg-gray-100 text-gray-500',
} as const

function statusLabel(status: string) {
    const text = status.replaceAll('_', ' ')
    return text.charAt(0).toUpperCase() + text.slice(1)
}


const Purchase_list = () => {

    const { data: requests = [], error, loading } = useAsyncResource(listPurchaseRequests, [])
    const permissionDenied = Boolean(error && isPermissionError(error))

    return (
        <PageShell className="max-w-full bg-white">
            <PageTitle
                className="h2 break-words"
                description="Manage your purchase request across the organization"
                action={
                    <Button variant="dark">
                        Create PR
                        <Plus size={16} className="ml-2 text-white" />
                    </Button>
                }
            >
                Purchase Requests
            </PageTitle>

            <ListSearch placeholder="Subject" />
            <InlineStatus loading={loading} loadingLabel="Loading purchase requests…" />
            {permissionDenied && <PermissionNotice action="cannot view purchase requests" />}
            {!permissionDenied && <InlineStatus error={error} />}
            {!loading && !error && Boolean(requests.length) &&(
                <Table className="w-full min-w-[900px]">
                    <TableHeader>
                        <TableRow className="border-b border-gray-200 hover:bg-transparent">
                            <TableHead className={tableHeadClass}>Status</TableHead>
                            <SortableHead label="Subject" />
                            <SortableHead label="Space" />
                            <SortableHead label="Created by" />
                            <SortableHead label="Created on" />
                        </TableRow>
                    </TableHeader>
                    <TableBody className="[&_tr:last-child]:border-b">
                        {requests.map((row) => (
                            <TableRow key={row.slug} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="px-3 py-3">
                                    <StatusPill className={statusStyle[row.status]}>{statusLabel(row.status)}</StatusPill>
                                </TableCell>
                                <TableCell className="px-3 py-3 text-sm text-black">{row.title}</TableCell>
                                <TableCell className="px-3 py-3 text-sm text-black">{row.space || '-'}</TableCell>
                                <TableCell className="px-3 py-3">
                                    <div className="text-sm font-medium text-black">{row.created_by}</div>
                                    <div className="text-xs text-gray-500">{displayRole(row.created_by_role)}</div>
                                </TableCell>
                                <TableCell className="px-3 py-3 text-sm text-black">{formatDate(row.created_at)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </PageShell>
    )
}

export default Purchase_list
