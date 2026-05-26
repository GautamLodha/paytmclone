import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn'
import Send from './pages/Send'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import UpdateInfo from './pages/UpdateInfo'

function App() {
  const [count, setCount] = useState<number>(0)

  return (
    <>
    {/* <h1 className='text-blue-500 bg-red-500' >hii there</h1> */}
    <BrowserRouter>
    <Routes>
      <Route path='/signin' element={<SignIn/>} ></Route>
      <Route path='/signup' element={<SignUp/>} ></Route>
      <Route path='/dashboard' element={<Dashboard/>} ></Route>
      <Route path='/send' element={<Send/>} ></Route>
      <Route path='/update' element={<UpdateInfo/>} ></Route>
    </Routes>
    </BrowserRouter>
    
    </>
  )
}

export default App
