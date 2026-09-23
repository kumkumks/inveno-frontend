import { Button } from '@/components/ui/button'
import { ArrowUpDown, Plus, Search } from 'lucide-react'
import api  from '../../services/api'
import { useState, useEffect } from 'react'
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from '@/components/ui/table'
import { itemListData } from '../../jsondata/json'
import { Input } from '@/components/ui/input'

type Item = {
  id?: number | string
  name: string
  category: string
  part_number: string
  alternate_part_number: string
  location: string
  warehouse: string
  quantity_on_hand: string
  unit: string
  last_purchase_date: string
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

function normalizeItems(data: unknown): Item[] {
  if (Array.isArray(data)) return data as Item[]
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results: unknown }).results
    if (Array.isArray(results)) return results as Item[]
  }
  return []
}

const sortableHeadClass =
  'h-11 px-3 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500'

const SortableHead = ({ label }: { label: string }) => (
  <TableHead className={sortableHeadClass}>
    <span className='inline-flex items-center gap-1'>
      {label}
      <ArrowUpDown className='size-3 text-gray-400' />
    </span>
  </TableHead>
)

const getItemList = async (): Promise<Item[]> => {
  const response = await api.get('/api/orgs/items/')
  console.log(response.data)
  return normalizeItems(response.data)
}

const Item_list = () => {
  const [itemList, setItemList] = useState<Item[]>(itemListData)

  useEffect(() => {
    let cancelled = false

    getItemList()
      .then((data) => {
        if (!cancelled && data.length > 0) setItemList(data)
      })
      .catch((error) => {
        console.error('Failed to load items', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
    <div className='flex min-w-0 w-full max-w-full flex-col bg-white px-4 py-4 text-black sm:px-7 sm:py-6'>
      {/* Header Section */}
      <section className='header-section'>
      <div className="mb-6 flex items-start justify-between gap-3">
        <h1 className='h2 text-xl font-normal break-words text-black sm:text-2xl md:text-3xl'>Item List</h1>
        <Button className='bg-black text-white hover:bg-black/80'>Add Item<Plus size={16} className='ml-2 text-white' /></Button>
      </div>
      </section>

      {/* Search Section */}
      <section className='search-section mb-6 mt-3'>
      <div className='min-w-0 flex items-center gap-3'>
        <Input  className='w-1/2 border-gray-300 rounded-md' type='text' placeholder='Search Item' />
        <Button className='bg-black text-white hover:bg-black/80'>Search<Search size={16} className='ml-2 text-white' /></Button>
      </div>
      </section>

      {/* Item List Section */}
      <section className='item-list-section'>
      <div className='min-w-0'>
        <Table className='w-full min-w-[900px]'>
          <TableHeader>
            <TableRow className='border-b border-gray-200 hover:bg-transparent'>
              <TableHead className={`${sortableHeadClass} w-14`}>SI No</TableHead>
              <SortableHead label='Item/Description' />
              <TableHead className={sortableHeadClass}>Part No</TableHead>
              <TableHead className={sortableHeadClass}>Alternate Part No</TableHead>
              <SortableHead label='Location' />
              <SortableHead label='Qty in Stock' />
              <SortableHead label='Last Purchase Date' />
            </TableRow>
          </TableHeader>
          <TableBody className='[&_tr:last-child]:border-b'>
            {itemList.map((item, index) => (
              <TableRow key={item.id ?? index} className='border-b border-gray-200 hover:bg-gray-50'>
                <TableCell className='px-3 py-3 text-sm text-gray-500'>{index + 1}</TableCell>
                <TableCell className='px-3 py-3'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <div className='size-10 shrink-0 rounded-md bg-gray-200' aria-hidden />
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
                  <div className='text-sm font-medium text-black'>{Number(item.quantity_on_hand).toFixed(2)}</div>
                  <div className='text-xs text-gray-500'>{item.unit}</div>
                </TableCell>
                <TableCell className='px-3 py-3 text-sm text-black'>{item.last_purchase_date ? formatDate(item.last_purchase_date) : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </section>
     </div>
    </>
  )
}

export default Item_list
