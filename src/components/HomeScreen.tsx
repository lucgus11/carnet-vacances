import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import TripForm from './TripForm';
import { countDaysInclusive, formatDateFrCourt } from '../utils/dateUtils';

interface HomeScreenProps {
  onSelectVoyage: (voyageId: number) => void;
}

/**
 * Écran d'accueil : liste tous les voyages enregistrés localement,
 * permet d'en créer un nouveau, d'en ouvrir un, ou d'en supprimer un
 * (avec ses journées associées).
 */
export default function HomeScreen({ onSelectVoyage }: HomeScreenProps): JSX.Element {
  const [showForm, setShowForm] = useState(false);

  const voyages = useLiveQuery(() => db.voyages.orderBy('createdAt').reverse().toArray(), []);

  async function handleDelete(voyageId: number | undefined, titre: string): Promise<void> {
    if (voyageId === undefined) return;
    const confirmed = window.confirm(
      `Supprimer le voyage "${titre}" et toutes ses journées ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    await db.transaction('rw', db.voyages, db.journees, async () => {
      await db.journees.where('voyageId').equals(voyageId).delete();
      await db.voyages.delete(voyageId);
    });
  }

  return (
    <div>
      <header className="app-header">
        <div>
          <h1 className="app-title">🌴 Mes carnets de vacances</h1>
          <p className="app-subtitle">Un souvenir par jour, même sans réseau.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Nouveau voyage
          </button>
        )}
      </header>

      {showForm && (
        <TripForm
          onCreated={(id) => {
            setShowForm(false);
            onSelectVoyage(id);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!showForm && (
        <>
          {voyages === undefined && <p className="empty-state">Chargement…</p>}

          {voyages !== undefined && voyages.length === 0 && (
            <p className="empty-state">
              Aucun voyage pour l'instant. Clique sur « + Nouveau voyage » pour commencer ton
              premier carnet !
            </p>
          )}

          <div className="trip-list">
            {voyages?.map((voyage) => {
              const nbJours = countDaysInclusive(voyage.dateDebut, voyage.dateFin);
              return (
                <div className="trip-card" key={voyage.id}>
                  <div
                    className="trip-card-info"
                    onClick={() => voyage.id !== undefined && onSelectVoyage(voyage.id)}
                  >
                    <div className="trip-card-title">{voyage.titre}</div>
                    <div className="trip-card-meta">
                      📍 {voyage.lieuGeneral || 'Lieu non précisé'} · {nbJours} jour
                      {nbJours > 1 ? 's' : ''} · du {formatDateFrCourt(voyage.dateDebut)} au{' '}
                      {formatDateFrCourt(voyage.dateFin)}
                    </div>
                  </div>
                  <div className="trip-card-actions">
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(voyage.id, voyage.titre)}
                      aria-label={`Supprimer ${voyage.titre}`}
                      title="Supprimer ce voyage"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
