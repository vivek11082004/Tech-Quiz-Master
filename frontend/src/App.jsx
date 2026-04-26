import React from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import Home from './pages/Home.jsx'
import { useAuth, SignedIn, SignedOut } from '@clerk/clerk-react'
import MyResultPage from './pages/MyResultPage.jsx'

const App = () => {
  const { isLoaded } = useAuth()

  if (!isLoaded) 
    return null;

  return (
   <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/result' element={
      <>
      <SignedIn>
        <MyResultPage />
      </SignedIn>
      <SignedOut>
        <Navigate to="/" />
      </SignedOut>
      </>
    }/>
   </Routes>
  )
}

export default App
