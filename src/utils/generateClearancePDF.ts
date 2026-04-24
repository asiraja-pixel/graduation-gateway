import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ClearanceFormTemplate from '@/components/ClearanceFormTemplate';
import { ClearanceRequest, User } from '@/types';

/**
 * Generates and downloads a filled IUK Clearance PDF for the given student.
 *
 * Flow:
 *  1. Mount <ClearanceFormTemplate> into a hidden off-screen div
 *  2. Wait for fonts / images to settle
 *  3. Capture with html2canvas (A4 @ 2× scale for crisp output)
 *  4. Embed the canvas image into jsPDF and trigger browser download
 *  5. Clean up the DOM node
 */
export async function generateClearancePDF(
  user: {
    name: string;
    email: string;
    registrationNumber: string;
    program?: string;
    nationality?: string;
    gender?: string;
    phoneNumber?: string;
    address?: string;
    startYear?: string;
    endYear?: string;
  },
  request: ClearanceRequest,
  onProgress?: (stage: string) => void,
  photoUrl?: string
): Promise<void> {
  onProgress?.('Preparing document…');

  // ── 1. Create a hidden container and mount the template ──────────────────
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:-9999px',
    'width:794px',          // A4 width at 96 dpi
    'background:#ffffff',
    'z-index:-1',
    'pointer-events:none',
    'overflow:visible',
  ].join(';');
  document.body.appendChild(container);

  // Use a ref so we can hand the DOM node to html2canvas
  let formNode: HTMLDivElement | null = null;

  const root = createRoot(container);

  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(ClearanceFormTemplate, {
        ref: (node: HTMLDivElement | null) => {
          formNode = node;
          if (node) resolve();
        },
        user,
        request,
        photoUrl,
      })
    );
  });

  // Wait for all images to load
  const images = formNode.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if an image fails
    });
  });

  await Promise.all(imagePromises);

  // Give the browser a couple of frames to finish layout
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 500)); // Slightly longer delay for stability

  // ── 2. Capture with html2canvas ──────────────────────────────────────────
  onProgress?.('Rendering form…');

  const canvas = await html2canvas(formNode, {
    scale: 2,               // 2× for sharp PDF text
    useCORS: true,          // needed for the logo image
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    // Capture the full scrollable height
    windowWidth: 794,
    windowHeight: formNode.scrollHeight,
    height: formNode.scrollHeight,
    width: 794,
  });

  // ── 3. Build the PDF ─────────────────────────────────────────────────────
  onProgress?.('Generating PDF…');

  // A4 dimensions in mm
  const A4_W = 210;
  const A4_H = 297;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const imgData = canvas.toDataURL('image/png');

  // Scale canvas pixels → mm while fitting to A4 width
  const canvasWidthMm = A4_W;
  const canvasHeightMm = (canvas.height / canvas.width) * A4_W;

  // Always force onto a single page as per user request ("maximum of 1 page")
  if (canvasHeightMm <= A4_H) {
    // Fits naturally or shorter than A4
    pdf.addImage(imgData, 'PNG', 0, 0, canvasWidthMm, canvasHeightMm);
  } else {
    // Content is taller than A4, so we scale it down to fit exactly one page height
    const scaleFactor = A4_H / canvasHeightMm;
    const scaledWidthMm = canvasWidthMm * scaleFactor;
    const xOffset = (A4_W - scaledWidthMm) / 2; // Center horizontally
    
    pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidthMm, A4_H);
  }

  // ── 4. Add metadata ──────────────────────────────────────────────────────
  pdf.setProperties({
    title: `Clearance Certificate – ${user.name}`,
    subject: 'IUK Graduation Clearance',
    author: 'Islamic University of Kenya',
    creator: 'IUK Clearance System',
  });

  // ── 5. Trigger download ──────────────────────────────────────────────────
  onProgress?.('Saving file…');

  const safeName = user.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const filename = `IUK_Clearance_${safeName}_${user.registrationNumber}.pdf`;
  pdf.save(filename);

  // ── 6. Clean up ──────────────────────────────────────────────────────────
  root.unmount();
  document.body.removeChild(container);
}