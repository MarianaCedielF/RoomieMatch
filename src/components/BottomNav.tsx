import React from 'react';
import { Home, Heart, MessageCircle, Map, User } from 'lucide-react';
import type { Screen } from '../App';
import { useApp } from '../context/AppContext';

interface Props {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function BottomNav({ active, onNavigate }: Props) {
  const { state } = useApp();
  const currentUserId = state.currentUser?.id;
  const myMatches = state.matches.filter(m => currentUserId && m.users.includes(currentUserId));
  const unread = myMatches.filter(m => {
    const msgs = state.messages[m.id] || [];
    return msgs.some(msg => !msg.read && msg.senderId !== currentUserId);
  }).length;

  const items: { id: Screen; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: 'discover', icon: <Home size={22} />, label: 'Inicio' },
    { id: 'matches', icon: <MessageCircle size={22} />, label: 'Matches', badge: unread > 0 ? unread : myMatches.length > 0 ? myMatches.length : undefined },
    { id: 'zones', icon: <Map size={22} />, label: 'Zonas' },
    { id: 'profile', icon: <User size={22} />, label: 'Perfil' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
          {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
