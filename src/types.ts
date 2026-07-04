/**
 * Types centraux de l'application "Carnet de Vacances".
 */

/** Humeur du jour, choix unique parmi trois. */
export type Mood = 'content' | 'neutre' | 'triste';

/** Un voyage regroupe plusieurs journées consécutives. */
export interface Voyage {
  /** Identifiant auto-incrémenté par Dexie (absent avant la 1ère sauvegarde). */
  id?: number;
  titre: string;
  lieuGeneral: string;
  /** Date ISO (YYYY-MM-DD) */
  dateDebut: string;
  /** Date ISO (YYYY-MM-DD) */
  dateFin: string;
  /** Horodatage de création, pour trier la liste des voyages. */
  createdAt: string;
}

/** Une journée appartient à un voyage (voyageId) et correspond à une date précise. */
export interface Journee {
  id?: number;
  voyageId: number;
  /** Index 1-based du jour dans le voyage (Jour 1, Jour 2, ...) */
  dayIndex: number;
  /** Date ISO (YYYY-MM-DD), calculée automatiquement depuis dateDebut du voyage. */
  date: string;
  lieu: string;
  humeur: Mood | null;
  /** Activités faites pendant la journée (texte libre). */
  activites: string;
  repasMatin: string;
  repasMidi: string;
  repasSoir: string;
}

/** Voyage accompagné de la liste de ses journées, pratique pour l'export PDF. */
export interface VoyageAvecJournees {
  voyage: Voyage;
  journees: Journee[];
}
