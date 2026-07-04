/**
 * Retourne la liste des dates ISO (YYYY-MM-DD) comprises entre dateDebut
 * et dateFin, bornes incluses. Utilisé pour générer automatiquement
 * la structure des journées d'un voyage.
 */
export function getDaysBetween(dateDebut: string, dateFin: string): string[] {
  const days: string[] = [];
  const start = parseISODate(dateDebut);
  const end = parseISODate(dateFin);

  if (start > end) {
    return days;
  }

  const current = new Date(start);
  while (current <= end) {
    days.push(toISODate(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/** Nombre de jours (inclusif) entre deux dates ISO. */
export function countDaysInclusive(dateDebut: string, dateFin: string): number {
  return getDaysBetween(dateDebut, dateFin).length;
}

/** Parse une date ISO (YYYY-MM-DD) en évitant les décalages de fuseau horaire. */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** Formate un objet Date en chaîne ISO locale (YYYY-MM-DD), sans décalage UTC. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Formate une date ISO en français lisible, ex: "lundi 14 juillet 2026". */
export function formatDateFr(iso: string): string {
  const date = parseISODate(iso);
  const formatted = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Formate une date ISO en version courte, ex: "14 juil. 2026". */
export function formatDateFrCourt(iso: string): string {
  const date = parseISODate(iso);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
