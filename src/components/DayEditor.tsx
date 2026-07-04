import { useEffect, useRef, useState } from 'react';
import { db } from '../db';
import type { Journee, Mood } from '../types';
import { formatDateFr } from '../utils/dateUtils';
import MoodPicker from './MoodPicker';

interface DayEditorProps {
  journee: Journee;
  onSaved?: () => void;
}

const AUTOSAVE_DELAY_MS = 500;

/**
 * Édite une journée précise. Le composant est remonté (via `key`) à chaque
 * changement de jour dans JournalScreen, ce qui garantit que l'état local
 * repart bien des valeurs enregistrées pour CE jour.
 *
 * Sauvegarde automatique : chaque frappe met à jour l'état local
 * immédiatement (pas de saut de curseur) et déclenche une écriture en
 * base après un court délai (debounce), pour éviter d'écrire à chaque
 * caractère.
 */
export default function DayEditor({ journee, onSaved }: DayEditorProps): JSX.Element {
  const [lieu, setLieu] = useState(journee.lieu);
  const [humeur, setHumeur] = useState<Mood | null>(journee.humeur);
  const [repasMatin, setRepasMatin] = useState(journee.repasMatin);
  const [repasMidi, setRepasMidi] = useState(journee.repasMidi);
  const [repasSoir, setRepasSoir] = useState(journee.repasSoir);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSave(partial: Partial<Journee>): void {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (journee.id !== undefined) {
        db.journees.update(journee.id, partial).then(() => onSaved?.());
      }
    }, AUTOSAVE_DELAY_MS);
  }

  // Sauvegarde immédiate au démontage (changement de jour / fermeture),
  // pour ne jamais perdre les dernières frappes en attente.
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function handleMoodChange(mood: Mood): void {
    setHumeur(mood);
    if (journee.id !== undefined) {
      db.journees.update(journee.id, { humeur: mood }).then(() => onSaved?.());
    }
  }

  return (
    <div className="day-page">
      <div className="day-header">
        <div>
          <div className="day-header-title">Jour {journee.dayIndex}</div>
          <div className="day-header-date">{formatDateFr(journee.date)}</div>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor={`lieu-${journee.id}`}>
          Lieu
        </label>
        <input
          id={`lieu-${journee.id}`}
          type="text"
          className="lieu-input"
          placeholder="Où étais-tu aujourd'hui ?"
          value={lieu}
          onChange={(e) => {
            setLieu(e.target.value);
            scheduleSave({ lieu: e.target.value });
          }}
        />
      </div>

      <div className="field-group">
        <span className="field-label">Humeur du jour</span>
        <MoodPicker value={humeur} onChange={handleMoodChange} />
      </div>

      <div className="field-group">
        <span className="field-label">Repas</span>

        <div className="meal-group">
          <label className="field-label" htmlFor={`matin-${journee.id}`} style={{ marginTop: 8 }}>
            Matin :
          </label>
          <textarea
            id={`matin-${journee.id}`}
            className="meal-textarea"
            placeholder="Qu'as-tu mangé ce matin ?"
            value={repasMatin}
            onChange={(e) => {
              setRepasMatin(e.target.value);
              scheduleSave({ repasMatin: e.target.value });
            }}
          />
        </div>

        <div className="meal-group">
          <label className="field-label" htmlFor={`midi-${journee.id}`} style={{ marginTop: 8 }}>
            Midi :
          </label>
          <textarea
            id={`midi-${journee.id}`}
            className="meal-textarea"
            placeholder="Et à midi ?"
            value={repasMidi}
            onChange={(e) => {
              setRepasMidi(e.target.value);
              scheduleSave({ repasMidi: e.target.value });
            }}
          />
        </div>

        <div className="meal-group" style={{ borderBottom: 'none' }}>
          <label className="field-label" htmlFor={`soir-${journee.id}`} style={{ marginTop: 8 }}>
            Soir :
          </label>
          <textarea
            id={`soir-${journee.id}`}
            className="meal-textarea"
            placeholder="Et ce soir ?"
            value={repasSoir}
            onChange={(e) => {
              setRepasSoir(e.target.value);
              scheduleSave({ repasSoir: e.target.value });
            }}
          />
        </div>
      </div>
    </div>
  );
}
