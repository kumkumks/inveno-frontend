import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Landingpage from './pages/landingpage/landingpage'
import Pages404 from './Pages404'
import GetStarted from './pages/getStarted/getStarted'
import Login from './pages/loginPage/loginPage'
import Dashboard from './pages/dashboard/dashboard'
import { ProtectedRoute } from './components/protected-route'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Landingpage/>} />
      <Route path='/get-started' element={<GetStarted/>} />
      <Route path='/error' element={<Pages404/>} />
      <Route path='/login' element={<Login/>} />
      <Route element={<ProtectedRoute />}>
        <Route path='/dashboard' element={<Dashboard/>} />
      </Route>
    </Routes>
  )
}

export default App