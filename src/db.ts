import Dexie, { type Table } from 'dexie';
import type { Voyage, Journee } from './types';

/**
 * Base de données locale (IndexedDB), gérée avec Dexie.
 * Aucune donnée ne quitte jamais l'appareil : tout est stocké
 * dans le navigateur de l'utilisateur, ce qui permet un fonctionnement
 * 100% hors-ligne.
 */
class CarnetDB extends Dexie {
  voyages!: Table<Voyage, number>;
  journees!: Table<Journee, number>;

  constructor() {
    super('CarnetVacancesDB');
    this.version(1).stores({
      voyages: '++id, titre, dateDebut, dateFin, createdAt',
      journees: '++id, voyageId, dayIndex, date'
    });
  }
}

export const db = new CarnetDB();
