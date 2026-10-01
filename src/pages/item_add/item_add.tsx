import { useNavigate } from 'react-router-dom'
import { emptyItemFormValues, ItemForm } from '@/components/common/item-form'
import { PageShell, PageTitle } from '@/components/common/page-shell'
import { createItem } from '@/services/items'

const Item_add = () => {
  const navigate = useNavigate()

  return (
    <PageShell className="bg-white">
      <PageTitle description="Enter the item details, then save it to inventory.">
        Add Item
      </PageTitle>

      <ItemForm
        defaultValues={emptyItemFormValues}
        submitLabel="Add item"
        className="flex w-full max-w-3xl flex-col gap-5 rounded-lg border border-gray-200 p-4 sm:p-6"
        onCancel={() => navigate('/items-list')}
        onSubmit={async (data) => {
          await createItem(data)
          navigate('/items-list')
        }}
      />
    </PageShell>
  )
}

export default Item_add
