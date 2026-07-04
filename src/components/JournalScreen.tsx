import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import DayNav from './DayNav';
import DayEditor from './DayEditor';
import { exportVoyagePDF } from '../utils/pdfExport';
import { formatDateFrCourt } from '../utils/dateUtils';

interface JournalScreenProps {
  voyageId: number;
  onBack: () => void;
}

/**
 * Écran "cahier" : affiche un voyage précis avec navigation entre ses
 * journées et export PDF.
 */
export default function JournalScreen({ voyageId, onBack }: JournalScreenProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);
  const [exporting, setExporting] = useState(false);

  const voyage = useLiveQuery(() => db.voyages.get(voyageId), [voyageId]);
  const journees = useLiveQuery(
    () => db.journees.where('voyageId').equals(voyageId).sortBy('dayIndex'),
    [voyageId]
  );

  useEffect(() => {
    if (journees && currentIndex > journees.length - 1) {
      setCurrentIndex(Math.max(0, journees.length - 1));
    }
  }, [journees, currentIndex]);

  function flashSaved(): void {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
  }

  async function handleExport(): Promise<void> {
    if (!voyage || !journees || journees.length === 0) return;
    setExporting(true);
    try {
      exportVoyagePDF(voyage, journees);
    } finally {
      setExporting(false);
    }
  }

  if (voyage === undefined || journees === undefined) {
    return <p className="empty-state">Chargement du carnet…</p>;
  }

  if (voyage === null) {
    return (
      <div>
        <p className="empty-state">Ce voyage n'existe plus.</p>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Retour à l'accueil
        </button>
      </div>
    );
  }

  const currentJournee = journees[currentIndex];

  return (
    <div>
      <header className="app-header">
        <div>
          <button className="btn btn-ghost btn-small" onClick={onBack}>
            ← Mes voyages
          </button>
          <h1 className="app-title" style={{ marginTop: 8 }}>
            {voyage.titre}
          </h1>
          <p className="app-subtitle">
            📍 {voyage.lieuGeneral || 'Lieu non précisé'} · du{' '}
            {formatDateFrCourt(voyage.dateDebut)} au {formatDateFrCourt(voyage.dateFin)}
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Génération…' : '📄 Exporter mon carnet en PDF'}
        </button>
      </header>

      {journees.length === 0 && (
        <p className="empty-state">Ce voyage ne contient aucune journée.</p>
      )}

      {journees.length > 0 && currentJournee && (
        <>
          <DayNav journees={journees} currentIndex={currentIndex} onSelect={setCurrentIndex} />
          <DayEditor
            key={currentJournee.id ?? currentJournee.dayIndex}
            journee={currentJournee}
            onSaved={flashSaved}
          />
        </>
      )}

      <div className={`save-indicator${savedFlash ? ' visible' : ''}`}>✓ Enregistré</div>
    </div>
  );
}
