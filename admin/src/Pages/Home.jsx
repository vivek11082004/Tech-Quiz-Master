
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return (
    <>
      <Navbar />
      <Hero />
    </>
  );
}

export default Home
