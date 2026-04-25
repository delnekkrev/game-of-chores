import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Dashboard from './components/Dashboard';

// Initialize Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// ⚙️  CUSTOMIZE THESE — easy to find, easy to change
// ============================================================
export const KID_NAME = 'Oliver';   // ← your son's name
export const PARENT_PIN = '0910';    // ← your secret parent PIN

// Daily routine tasks — edit points, descriptions, or add/remove tasks here
export const DAILY_TASKS = [

  // ☀️ MORNING
  { id: 'shower', name: 'Shower', emoji: '🚿', points: 15, time: 'morning', desc: 'Soap up, shampoo — the full deal!' },
  { id: 'deodorant', name: 'Deodorant', emoji: '✨', points: 5, time: 'morning', desc: "You'll thank yourself later 😅" },
  { id: 'brush-am', name: 'Brush Teeth', emoji: '🦷', points: 5, time: 'morning', desc: '2 full minutes' },
  { id: 'get-dressed', name: 'Get Dressed', emoji: '👕', points: 5, time: 'morning', desc: 'Clean clothes only' },
  { id: 'make-bed', name: 'Make Bed', emoji: '🛏️', points: 10, time: 'morning', desc: 'Pillows, blanket — looking good' },
  { id: 'eat-breakfast', name: 'Eat Breakfast', emoji: '🥣', points: 5, time: 'morning', desc: 'Fuel up for the day!' },

  // 📚 AFTERNOON
  { id: 'unpack-bag', name: 'Unpack Backpack', emoji: '🎒', points: 5, time: 'afternoon', desc: 'Papers out, lunch bag out' },
  { id: 'homework', name: 'Do Homework', emoji: '📚', points: 20, time: 'afternoon', desc: 'All subjects done' },
  { id: 'clean-room', name: 'Clean Room', emoji: '🧹', points: 15, time: 'afternoon', desc: 'Floor clear, clothes put away' },
  { id: 'tidy-desk', name: 'Tidy Desk', emoji: '🗂️', points: 5, time: 'afternoon', desc: 'Set up for tomorrow' },

  // 🌙 EVENING
  { id: 'help-dinner', name: 'Help With Dinner', emoji: '🍽️', points: 10, time: 'evening', desc: 'Set table or help cook' },
  { id: 'brush-pm', name: 'Brush Teeth (Night)', emoji: '🦷', points: 5, time: 'evening', desc: '2 minutes, floss too!' },
  { id: 'wash-face', name: 'Wash Face', emoji: '💧', points: 5, time: 'evening', desc: 'Soap and water' },
  { id: 'pick-up-clothes', name: 'Pick Up Clothes', emoji: '👚', points: 10, time: 'evening', desc: 'Nothing left on the floor' },
  { id: 'phone-away', name: 'Phone Away by 9pm', emoji: '📵', points: 10, time: 'evening', desc: 'On the charger, not in hand' },
  { id: 'lights-out', name: 'In Bed on Time', emoji: '😴', points: 10, time: 'evening', desc: 'Lights out, ready to rest' },
];

// Total possible points per day (auto-calculated)
export const MAX_POINTS = DAILY_TASKS.reduce((sum, t) => sum + t.points, 0);

export default function App() {
  return <Dashboard />;
}
