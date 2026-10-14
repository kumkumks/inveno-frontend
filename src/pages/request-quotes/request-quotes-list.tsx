import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ListSearch, SortableHead, StatusPill, quoteStatusStyle, statusLabel, tableHeadClass } from '@/components/common/list-table'
import { PageShell, PageTitle } from '@/components/common/page-shell'
import { InlineStatus } from '@/components/common/inline-status'
import { PermissionNotice } from '@/components/common/permission-notice'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { isPermissionError } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { listPurchaseRequests, listQuoteRequests } from '@/services/purchases'

const RequestQuotesList = () => {
  const navigate = useNavigate()
  const { data: rfqs = [], error, loading } = useAsyncResource(listQuoteRequests, [])
  const { data: purchases = [] } = useAsyncResource(listPurchaseRequests, [])
  const permissionDenied = Boolean(error && isPermissionError(error))
  const purchaseTitle = (slug: string) => purchases.find((item) => item.slug === slug)?.title ?? slug

  return (
    <PageShell className="max-w-full bg-white">
      <PageTitle className="h2 break-words" description="Compare vendor quotes across purchase requests">
        Request quotes
      </PageTitle>

      <ListSearch placeholder="Purchase request" />
      <InlineStatus loading={loading} loadingLabel="Loading quote requests…" />
      {permissionDenied && <PermissionNotice action="cannot view quote requests" />}
      {!permissionDenied && <InlineStatus error={error} />}
      {!loading && !error && !rfqs.length && (
        <p className="text-sm text-gray-500">No quote requests yet. Start one from an approved purchase.</p>
      )}
      {!loading && !error && Boolean(rfqs.length) && (
        <Table className="w-full min-w-[720px]">
          <TableHeader>
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              <TableHead className={tableHeadClass}>Status</TableHead>
              <SortableHead label="Purchase request" />
              <SortableHead label="Vendors" />
              <SortableHead label="Created on" />
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-b">
            {rfqs.map((row) => (
              <TableRow
                key={row.slug}
                onClick={() => navigate(`/purchase-requests/${row.purchase_request}/quotes`)}
                className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
              >
                <TableCell className="px-3 py-3">
                  <StatusPill className={quoteStatusStyle[row.status] ?? quoteStatusStyle.preparing}>
                    {statusLabel(row.status)}
                  </StatusPill>
                </TableCell>
                <TableCell className="px-3 py-3 text-sm text-black">{purchaseTitle(row.purchase_request)}</TableCell>
                <TableCell className="px-3 py-3 text-sm text-black">{row.vendors?.length ?? 0}</TableCell>
                <TableCell className="px-3 py-3 text-sm text-black">{formatDate(row.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageShell>
  )
}

export default RequestQuotesList
