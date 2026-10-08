import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InlineStatus } from '@/components/common/inline-status'
import { PageShell, PageTitle } from '@/components/common/page-shell'
import { PermissionNotice } from '@/components/common/permission-notice'
import { PurchaseForm, purchaseFormValues } from '@/components/common/purchase-form'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { statusLabel } from '@/components/common/list-table'
import { isPermissionError } from '@/lib/errors'
import { canEditPurchase } from '@/lib/purchase'
import { updatePurchaseRequest } from '@/services/purchase'
import { getPurchaseRequest } from '@/services/purchases'

const Purchase_edit = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: request, error: loadError, loading } = useAsyncResource(
    () => getPurchaseRequest(slug as string),
    [slug],
    { enabled: Boolean(slug) },
  )
  const detailPath = `/purchase-requests/${slug}`
  const goBack = () => navigate(detailPath)

  return (
    <PageShell className="max-w-full bg-white">
      <PageTitle
        className="h2 break-words"
        description="Update the title, space, notes, or line items"
        action={
          <Button type="button" variant="dark" className="h-8 w-fit rounded-lg bg-gray-100 px-3 text-sm font-normal text-gray-800 hover:bg-gray-200" onClick={goBack}>
            <ArrowLeft className="size-4" />
            Go back
          </Button>
        }
      >
        Edit Purchase Request
      </PageTitle>

      <InlineStatus loading={loading} loadingLabel="Loading purchase request…" />
      {loadError && isPermissionError(loadError) && <PermissionNotice action="cannot view this purchase request" />}
      {loadError && !isPermissionError(loadError) && <InlineStatus error={loadError} />}

      {request && !canEditPurchase(request.status) && (
        <InlineStatus
          error={`This request is ${statusLabel(request.status).toLowerCase()}. Only drafts and requests with changes requested can be edited.`}
        />
      )}

      {request && canEditPurchase(request.status) && (
        <PurchaseForm
          key={request.slug}
          defaultValues={purchaseFormValues(request)}
          submitLabel="Save changes"
          permissionAction="cannot edit this purchase request"
          onCancel={goBack}
          onSubmit={async (payload) => {
            await updatePurchaseRequest(request.slug, payload)
            navigate(detailPath)
          }}
        />
      )}
    </PageShell>
  )
}

export default Purchase_edit
