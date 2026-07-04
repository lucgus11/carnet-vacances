import { jsPDF } from 'jspdf';
import type { Journee, Mood, Voyage } from '../types';
import { formatDateFr, formatDateFrCourt } from './dateUtils';

const COLORS = {
  paper: '#FBF7EC',
  ink: '#3D5A6C',
  coral: '#E8967A',
  sage: '#8FAE8B',
  sun: '#F2C14E',
  lightLine: '#E4DCC8'
};

const MOOD_LABEL: Record<Mood, string> = {
  content: 'Content(e)',
  neutre: 'Neutre',
  triste: 'Triste'
};

const MOOD_COLOR: Record<Mood, string> = {
  content: '#8FAE8B',
  neutre: '#F2C14E',
  triste: '#E07A5F'
};

/**
 * Génère et télécharge un PDF reprenant, jour par jour et dans l'ordre
 * chronologique, le contenu du carnet de voyage. Entièrement calculé
 * côté client (aucun serveur, aucune donnée envoyée nulle part).
 */
export function exportVoyagePDF(voyage: Voyage, journees: Journee[]): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;

  const sorted = [...journees].sort((a, b) => a.dayIndex - b.dayIndex);

  drawCoverPage(doc, voyage, sorted.length, pageWidth, pageHeight);

  sorted.forEach((journee) => {
    doc.addPage();
    drawPageBackground(doc, pageWidth, pageHeight);
    drawDayPage(doc, journee, pageWidth, margin);
  });

  const safeTitle = voyage.titre.trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'voyage';
  doc.save(`carnet-${safeTitle}.pdf`);
}

function drawPageBackground(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  doc.setFillColor(COLORS.paper);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Lignes horizontales façon cahier
  doc.setDrawColor(COLORS.lightLine);
  doc.setLineWidth(0.5);
  const lineStart = 150;
  for (let y = lineStart; y < pageHeight - 40; y += 24) {
    doc.line(40, y, pageWidth - 40, y);
  }

  // Marge verticale façon reliure
  doc.setDrawColor(COLORS.coral);
  doc.setLineWidth(1.2);
  doc.line(56, 20, 56, pageHeight - 20);
}

function drawCoverPage(
  doc: jsPDF,
  voyage: Voyage,
  nbJours: number,
  pageWidth: number,
  pageHeight: number
): void {
  drawPageBackground(doc, pageWidth, pageHeight);

  doc.setTextColor(COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text('Carnet de Vacances', pageWidth / 2, 180, { align: 'center' });

  doc.setFontSize(22);
  doc.setTextColor(COLORS.coral);
  doc.text(voyage.titre, pageWidth / 2, 230, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(COLORS.ink);
  doc.text(voyage.lieuGeneral, pageWidth / 2, 260, { align: 'center' });

  const periode = `Du ${formatDateFrCourt(voyage.dateDebut)} au ${formatDateFrCourt(voyage.dateFin)}`;
  doc.text(periode, pageWidth / 2, 282, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(COLORS.sage);
  doc.text(`${nbJours} jour${nbJours > 1 ? 's' : ''} de souvenirs`, pageWidth / 2, 306, {
    align: 'center'
  });

  // Petit soleil décoratif
  doc.setFillColor(COLORS.sun);
  doc.circle(pageWidth / 2, 380, 26, 'F');
}

function drawDayPage(doc: jsPDF, journee: Journee, pageWidth: number, margin: number): void {
  let y = 70;

  doc.setTextColor(COLORS.coral);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`Jour ${journee.dayIndex}`, margin + 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.ink);
  doc.text(formatDateFr(journee.date), pageWidth - margin, y, { align: 'right' });

  y += 26;
  if (journee.lieu.trim()) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(COLORS.ink);
    doc.text(`Lieu : ${journee.lieu}`, margin + 20, y);
    y += 22;
  }

  // Humeur
  if (journee.humeur) {
    const color = MOOD_COLOR[journee.humeur];
    doc.setFillColor(color);
    doc.circle(margin + 32, y + 4, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.ink);
    doc.text(`Humeur : ${MOOD_LABEL[journee.humeur]}`, margin + 48, y + 8);
    y += 30;
  } else {
    y += 10;
  }

  y += 10;
  y = drawMealBlock(doc, 'Matin', journee.repasMatin, margin, y, pageWidth);
  y = drawMealBlock(doc, 'Midi', journee.repasMidi, margin, y, pageWidth);
  drawMealBlock(doc, 'Soir', journee.repasSoir, margin, y, pageWidth);
}

function drawMealBlock(
  doc: jsPDF,
  label: string,
  content: string,
  margin: number,
  y: number,
  pageWidth: number
): number {
  const usableWidth = pageWidth - margin * 2 - 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.sage);
  doc.text(`${label} :`, margin + 20, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.ink);
  const text = content.trim() || '—';
  const lines = doc.splitTextToSize(text, usableWidth) as string[];
  doc.text(lines, margin + 24, y);
  y += lines.length * 15 + 16;

  return y;
}
