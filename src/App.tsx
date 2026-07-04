import { useEffect, useState } from 'react';
import HomeScreen from './components/HomeScreen';
import JournalScreen from './components/JournalScreen';

type Screen = { name: 'home' } | { name: 'journal'; voyageId: number };

export default function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="app-shell">
      <div style={{ position: 'absolute', top: 14, right: 20 }}>
        <span className="offline-badge">
          {isOnline ? '🟢 En ligne' : '⚪ Hors-ligne — tout est sauvegardé sur cet appareil'}
        </span>
      </div>

      {screen.name === 'home' && (
        <HomeScreen onSelectVoyage={(voyageId) => setScreen({ name: 'journal', voyageId })} />
      )}

      {screen.name === 'journal' && (
        <JournalScreen voyageId={screen.voyageId} onBack={() => setScreen({ name: 'home' })} />
      )}
    </div>
  );
}
