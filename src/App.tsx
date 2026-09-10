import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Landingpage from './pages/landingpage/landingpage'
import Pages404 from './commons/pages/pages404/Pages404'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Landingpage/>} />
      <Route path='/error' element={<Pages404/>} />
    </Routes>
  )
}

export default App