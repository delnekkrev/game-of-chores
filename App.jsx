import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';

// Initialize Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if player is logged in (stored in localStorage)
    const storedPlayer = localStorage.getItem('chorGamePlayer');
    if (storedPlayer) {
      setPlayer(JSON.parse(storedPlayer));
    }
    setLoading(false);
  }, []);

  const handleSignIn = (playerName) => {
    const playerData = {
      name: playerName,
      id: Math.random().toString(36).substr(2, 9)
    };
    localStorage.setItem('chorGamePlayer', JSON.stringify(playerData));
    setPlayer(playerData);
  };

  const handleSignOut = () => {
    localStorage.removeItem('chorGamePlayer');
    setPlayer(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-white text-2xl font-bold">🏠 Chore Reward Game</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600">
      {!player ? (
        <SignIn onSignIn={handleSignIn} />
      ) : (
        <Dashboard player={player} onSignOut={handleSignOut} />
      )}
    </div>
  );
}
