import React from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import DashboardPage from './Pages/DashboardPage.jsx';
import { useUser } from '@clerk/clerk-react';
import ListPage from './Pages/ListPage.jsx';

import QuizPage from './Pages/QuizPage.jsx';

// To protect the route 
function RequiredAuth({ children }) {
  const {isLoaded, isSignedIn} = useUser();
  const location = useLocation();

  if(!isLoaded) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-sm text-gray-600'>Loading...</div>

      </div>
    )
  }

  if(!isSignedIn) {
    return (
      <div className='min-h-screen font-mono flex items-center justify-center bg-linear-to-b from-purple-50 via-white to-purple-100 px-4'>
        <div className='text-center'>
          <p className='text-emerald-800 font-semibold text-lg sm:text-2xl mb-4 animate-fade-in'>Please sign in to view this page</p>
          <div className='flex justify-center'>
          <Link to="/" state={{from: location}} className='px-4 py-2 text-sm rounded-full bg-purple-600 text-white shadow-sm hover:bg-purple-700 hover:shadow-md transition-all duration-300 ease-in-out animate-pulse'>Home</Link>
          </div>
        </div>
      </div>
    );
  }
  return children;
}


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={
        <RequiredAuth>
          <DashboardPage />
        </RequiredAuth>
      } />
      <Route path="/list" element={
        <RequiredAuth>
          <ListPage />
        </RequiredAuth>
      } />
      <Route path="/quiz/:id" element={
        <RequiredAuth>
          <QuizPage />
        </RequiredAuth>
      } />
    </Routes>

  );
};

export default App
