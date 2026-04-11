import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedPlayer = localStorage.getItem('chorGamePlayer');
    if (storedPlayer) {
      setPlayer(JSON.parse(storedPlayer));
    }
    setLoading(false);
  }, []);

  const handleSignIn = (playerName, photo, photoData) => {
    const playerData = {
      name: playerName,
      id: Math.random().toString(36).substr(2, 9),
      photo: photo || null,
      photoData: photoData || null,
    };
    localStorage.setItem('chorGamePlayer', JSON.stringify(playerData));
    setPlayer(playerData);
  };

  const handleUpdatePlayer = (updates) => {
    const updated = { ...player, ...updates };
    localStorage.setItem('chorGamePlayer', JSON.stringify(updated));
    setPlayer(updated);
  };

  const handleSignOut = () => {
    localStorage.removeItem('chorGamePlayer');
    setPlayer(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
        <div className="text-4xl mb-3">🎖️</div>
        <div className="text-white text-2xl font-bold tracking-tight">Chore of Duty</div>
        <p className="text-gray-500 text-sm mt-1">Do the dishes. Earn the throne.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {!player ? (
        <SignIn onSignIn={handleSignIn} />
      ) : (
        <Dashboard player={player} onSignOut={handleSignOut} onUpdatePlayer={handleUpdatePlayer} />
      )}
    </div>
  );
}
