import { useState } from 'react';
import { countDaysInclusive, getDaysBetween } from '../utils/dateUtils';
import { db } from '../db';
import type { Journee, Voyage } from '../types';

interface TripFormProps {
  onCreated: (voyageId: number) => void;
  onCancel: () => void;
}

/**
 * Formulaire de création d'un voyage. À la validation :
 * 1. Le voyage est enregistré dans IndexedDB.
 * 2. La structure des journées est générée automatiquement (une par
 *    date entre dateDebut et dateFin, bornes incluses).
 */
export default function TripForm({ onCreated, onCancel }: TripFormProps): JSX.Element {
  const [titre, setTitre] = useState('');
  const [lieuGeneral, setLieuGeneral] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const nbJours = dateDebut && dateFin ? countDaysInclusive(dateDebut, dateFin) : 0;

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setErreur(null);

    if (!titre.trim()) {
      setErreur('Merci de donner un titre à ton voyage.');
      return;
    }
    if (!dateDebut || !dateFin) {
      setErreur('Merci de renseigner une date de début et une date de fin.');
      return;
    }
    if (dateFin < dateDebut) {
      setErreur('La date de fin doit être postérieure (ou égale) à la date de début.');
      return;
    }

    setEnCours(true);
    try {
      const nouveauVoyage: Voyage = {
        titre: titre.trim(),
        lieuGeneral: lieuGeneral.trim(),
        dateDebut,
        dateFin,
        createdAt: new Date().toISOString()
      };

      const voyageId = await db.voyages.add(nouveauVoyage);

      const jours = getDaysBetween(dateDebut, dateFin);
      const journees: Journee[] = jours.map((date, index) => ({
        voyageId,
        dayIndex: index + 1,
        date,
        lieu: '',
        humeur: null,
        activites: '',
        repasMatin: '',
        repasMidi: '',
        repasSoir: ''
      }));
      await db.journees.bulkAdd(journees);

      onCreated(voyageId);
    } catch (err) {
      console.error(err);
      setErreur("Une erreur est survenue pendant l'enregistrement. Réessaie.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="titre">Titre du voyage</label>
        <input
          id="titre"
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Ex : Road trip en Bretagne"
          maxLength={80}
          autoFocus
        />
      </div>

      <div className="form-row">
        <label htmlFor="lieu">Lieu général</label>
        <input
          id="lieu"
          type="text"
          value={lieuGeneral}
          onChange={(e) => setLieuGeneral(e.target.value)}
          placeholder="Ex : Bretagne, France"
          maxLength={80}
        />
      </div>

      <div className="form-row-inline">
        <div className="form-row">
          <label htmlFor="dateDebut">Date de début</label>
          <input
            id="dateDebut"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="dateFin">Date de fin</label>
          <input
            id="dateFin"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>
      </div>

      {nbJours > 0 && (
        <p className="app-subtitle" style={{ marginTop: -6, marginBottom: 14 }}>
          Ce voyage durera {nbJours} jour{nbJours > 1 ? 's' : ''}.
        </p>
      )}

      {erreur && <p className="form-error">{erreur}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={enCours}>
          {enCours ? 'Création…' : '✏️ Créer le voyage'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={enCours}>
          Annuler
        </button>
      </div>
    </form>
  );
}
