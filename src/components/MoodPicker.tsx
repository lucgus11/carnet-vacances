import type { Mood } from '../types';

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

const MOODS: Array<{ key: Mood; emoji: string; label: string }> = [
  { key: 'content', emoji: '😄', label: 'Content(e)' },
  { key: 'neutre', emoji: '😐', label: 'Neutre' },
  { key: 'triste', emoji: '😢', label: 'Triste' }
];

/**
 * Trois smileys cliquables (vert / orange / rouge). Un seul choix
 * possible par jour : cliquer sur l'humeur déjà sélectionnée ne fait rien
 * (le choix reste défini), cliquer sur une autre la remplace.
 */
export default function MoodPicker({ value, onChange }: MoodPickerProps): JSX.Element {
  return (
    <div className="mood-picker" role="radiogroup" aria-label="Humeur du jour">
      {MOODS.map((mood) => (
        <button
          key={mood.key}
          type="button"
          className={`mood-btn${value === mood.key ? ' selected' : ''}`}
          data-mood={mood.key}
          role="radio"
          aria-checked={value === mood.key}
          aria-label={mood.label}
          title={mood.label}
          onClick={() => onChange(mood.key)}
        >
          <span aria-hidden="true">{mood.emoji}</span>
        </button>
      ))}
    </div>
  );
}
