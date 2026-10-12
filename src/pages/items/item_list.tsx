import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from '@/components/ui/table'
import { useNavigate } from 'react-router-dom'
import { useAsyncResource } from '@/hooks/use-async-resource'
import { isPermissionError } from '@/lib/errors'
import { formatDate, formatStockQuantity } from '@/lib/format'
import { listItems } from '@/services/items'
import { AuthImage } from '@/components/common/auth-image'
import { InlineStatus } from '@/components/common/inline-status'
import { ListSearch, SortableHead, tableHeadClass } from '@/components/common/list-table'
import { PageShell, PageTitle } from '@/components/common/page-shell'
import { PermissionNotice } from '@/components/common/permission-notice'

const Item_list = () => {
  const { data: itemList = [], error, loading } = useAsyncResource(listItems, [])
  const navigate = useNavigate()
  const permissionDenied = Boolean(error && isPermissionError(error))

  return (
    <PageShell className='max-w-full bg-white'>
      <section className='header-section'>
      <PageTitle
        className='h2 break-words'
        action={
          !permissionDenied ? (
            <Button
              onClick={() => {
                navigate('/item-add')
              }}
              variant="dark"
            >
              Add Item<Plus size={16} className='ml-2 text-white' />
            </Button>
          ) : null
        }
      >
        Item List
      </PageTitle>
      </section>

      {!permissionDenied && <ListSearch placeholder="Search Item" />}

      <InlineStatus loading={loading} loadingLabel="Loading items…" />
      {permissionDenied && <PermissionNotice action="cannot view items" />}
      {!permissionDenied && <InlineStatus error={error} />}
      {!loading && !error && (
      <section className='item-list-section'>
      <div className='min-w-0'>
        <Table className='w-full min-w-[900px]'>
          <TableHeader>
            <TableRow className='border-b border-gray-200 hover:bg-transparent'>
              <TableHead className={`${tableHeadClass} w-14`}>SI No</TableHead>
              <SortableHead label='Item/Description' />
              <TableHead className={tableHeadClass}>Part No</TableHead>
              <TableHead className={tableHeadClass}>Alternate Part No</TableHead>
              <SortableHead label='Location' />
              <SortableHead label='Qty in Stock' />
              <SortableHead label='Last Purchase Date' />
            </TableRow>
          </TableHeader>
          <TableBody className='[&_tr:last-child]:border-b'>
            {itemList.map((item, index) => (
              <TableRow key={item.id ?? index} onClick={() => navigate(`/item-detail/${item.slug}`)} className='border-b border-gray-200 hover:bg-gray-50'>
                <TableCell className='px-3 py-3 text-sm text-gray-500'>{index + 1}</TableCell>
                <TableCell className='px-3 py-3'>
                  <div className='flex min-w-0 items-center gap-3'>
                    {item.photos?.[0] ? (
                      <AuthImage
                        url={item.photos[0].url}
                        alt=""
                        className='size-10 shrink-0 rounded-md object-cover'
                      />
                    ) : (
                      <div className='size-10 shrink-0 rounded-md bg-gray-200' aria-hidden />
                    )}
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-medium text-black'>{item.name}</div>
                      <div className='truncate text-xs text-gray-500'>{item.category}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='px-3 py-3 text-sm text-black'>{item.part_number}</TableCell>
                <TableCell className='px-3 py-3 text-sm text-black'>{item.alternate_part_number ? item.alternate_part_number : 'N/A'}</TableCell>
                <TableCell className='px-3 py-3'>
                  <div className='text-sm font-medium text-black'>{item.location ? item.location : 'N/A'}</div>
                  <div className='text-xs text-gray-500'>{item.warehouse}</div>
                </TableCell>
                <TableCell className='px-3 py-3'>
                  <div className='text-sm font-medium text-black'>{formatStockQuantity(item.quantity_on_hand)}</div>
                  <div className='text-xs text-gray-500'>{item.unit}</div>
                </TableCell>
                <TableCell className='px-3 py-3 text-sm text-black'>{formatDate(item.last_purchase_date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </section>
      )}
    </PageShell>
  )
}

export default Item_list
