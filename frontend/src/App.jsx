import React, { useEffect, useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage.jsx';
import CreatePage from './components/CreatePage.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

export default function App() {
  const [route, setRoute] = useState('/');
  const { user } = useAuth();

  // Security audit: redirect non-authenticated users away from /create
  useEffect(() => {
    if (route === '/create' && !user) {
      setRoute('/');
    }
  }, [route, user]);

  function navigate(to) {
    setRoute(to);
  }

  return route === '/create' ? (
    <CreatePage onNavigate={navigate} />
  ) : (
    <LandingPage onNavigate={navigate} />
  );
}
