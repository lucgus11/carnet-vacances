import { useEffect, useRef } from 'react';
import type { Journee } from '../types';

interface DayNavProps {
  journees: Journee[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Navigation entre les jours du voyage : onglets scrollables "Jour N"
 * plus boutons Précédent / Suivant.
 */
export default function DayNav({ journees, currentIndex, onSelect }: DayNavProps): JSX.Element {
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  }, [currentIndex]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === journees.length - 1;

  return (
    <div>
      <div className="day-nav-arrows" style={{ justifyContent: 'space-between', display: 'flex' }}>
        <button
          className="btn btn-secondary btn-small"
          onClick={() => onSelect(currentIndex - 1)}
          disabled={isFirst}
          aria-label="Jour précédent"
        >
          ← Précédent
        </button>
        <button
          className="btn btn-secondary btn-small"
          onClick={() => onSelect(currentIndex + 1)}
          disabled={isLast}
          aria-label="Jour suivant"
        >
          Suivant →
        </button>
      </div>

      <div className="day-tabs" role="tablist" aria-label="Liste des jours du voyage">
        {journees.map((journee, index) => (
          <button
            key={journee.id ?? journee.dayIndex}
            ref={index === currentIndex ? activeTabRef : undefined}
            role="tab"
            aria-selected={index === currentIndex}
            className={`day-tab${index === currentIndex ? ' active' : ''}`}
            onClick={() => onSelect(index)}
          >
            Jour {journee.dayIndex}
          </button>
        ))}
      </div>
    </div>
  );
}
