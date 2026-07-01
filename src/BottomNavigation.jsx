import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Megaphone, Gift, Clock, MessageCircle } from 'lucide-react';
import './BottomNavigation.css';

export default function BottomNavigation({ activeTab }) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', icon: Home, path: '/dashboard' },
    { id: 'report', icon: Megaphone, path: '/signaler' },
    { id: 'rewards', icon: Gift, path: '/rewards' },
    { id: 'history', icon: Clock, path: '/history' },
    { id: 'community', icon: MessageCircle, path: '/community' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <item.icon size={24} className="nav-icon" />
        </button>
      ))}
    </nav>
  );
}