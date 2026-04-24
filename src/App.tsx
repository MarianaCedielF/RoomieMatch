import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthScreen from './screens/AuthScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import MatchesScreen from './screens/MatchesScreen';
import ZonesScreen from './screens/ZonesScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav';

export type Screen = 'discover' | 'matches' | 'zones' | 'profile';

function AppInner() {
  const { state } = useApp();
  const [screen, setScreen] = useState<Screen>('discover');

  if (!state.currentUser) return <AuthScreen />;

  return (
    <div className="app-container">
      <div className="page-content" style={{ paddingBottom: 80 }}>
        {screen === 'discover' && <DiscoverScreen />}
        {screen === 'matches' && <MatchesScreen />}
        {screen === 'zones' && <ZonesScreen />}
        {screen === 'profile' && <ProfileScreen />}
      </div>
      <BottomNav active={screen} onNavigate={setScreen} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
