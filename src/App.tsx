import { Route, Routes } from 'react-router-dom'
import Landingpage from '@/pages/landingpage/landingpage'
import ServerError from '@/pages/server-error/server-error'
import NewPassword from '@/pages/getStarted/newPassword'
import Login from '@/pages/loginPage/loginPage'
import Dashboard from '@/pages/dashboard/dashboard'
import { ProtectedRoute } from '@/components/protected-route'
import DashboardLayout from '@/layout/layout'
import Item_list from '@/pages/item_list/item_list'
import Item_add from '@/pages/item_add/item_add'
import Item_detail from '@/pages/item-detail/item-detail'
import Purchase_list from '@/pages/purchase/purchase-list'
import Purchase_add from '@/pages/purchase/purchase-add'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Landingpage/>} />
      <Route path='/get-started' element={<NewPassword/>} />
      <Route path='/error' element={<ServerError/>} />
      <Route path='/login' element={<Login/>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/items-list' element={<Item_list/>} />
          <Route path='/item-add' element={<Item_add/>} />
          <Route path='/item-detail/:slug' element={<Item_detail/>} />
          <Route path='/purchase-requests' element={<Purchase_list/>} />
          <Route path='/purchase-add' element={<Purchase_add/>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
