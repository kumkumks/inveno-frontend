import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageShell, PageTitle } from '@/components/common/page-shell'
import { PurchaseForm, purchaseFormValues } from '@/components/common/purchase-form'
import { createPurchaseRequest } from '@/services/purchase'

const Purchase_add = () => {
  const navigate = useNavigate()
  const goBack = () => navigate('/purchase-requests')

  return (
    <PageShell className="max-w-full bg-white">
      <PageTitle
        className="h2 break-words"
        description="Create a new purchase request"
        action={
          <Button type="button" variant="dark" className="h-8 w-fit rounded-lg bg-gray-100 px-3 text-sm font-normal text-gray-800 hover:bg-gray-200" onClick={goBack}>
            <ArrowLeft className="size-4" />
            Go back
          </Button>
        }
      >
        New Purchase Request
      </PageTitle>

      <PurchaseForm
        defaultValues={purchaseFormValues()}
        submitLabel="Save draft"
        permissionAction="cannot create a purchase request"
        onCancel={goBack}
        onSubmit={async (payload) => {
          await createPurchaseRequest(payload)
          navigate('/purchase-requests')
        }}
      />
    </PageShell>
  )
}

export default Purchase_add
