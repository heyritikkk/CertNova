export function generateCertificate({
  userName,
  courseTitle,
  completionDate,
  certId,
  instructorName = 'CertNova Security Team',
}) {
  const W = 1600;
  const H = 1130;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  /* ── 1. Background (Light Gray/White) ── */
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);

  // Subtle geometric background polygons (faceted look)
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(800, 0); ctx.lineTo(0, 800); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(0, 800); ctx.lineTo(800, 0); ctx.lineTo(W, 400); ctx.lineTo(600, H); ctx.lineTo(0, H); ctx.fill();

  /* ── 2. Diagonal Ribbons (Right Side) ── */
  ctx.save();
  // We use polygons instead of rotated rects to get exact edge-to-edge coverage
  
  // Ribbon 1 (Back/Darkest Orange)
  ctx.fillStyle = '#c05621'; // Deep brand orange
  ctx.beginPath();
  ctx.moveTo(1100, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, 800);
  ctx.lineTo(700, H);
  ctx.lineTo(400, H);
  ctx.fill();

  // Ribbon 2 (Middle/Main Brand Orange)
  const grad1 = ctx.createLinearGradient(900, 0, 1400, H);
  grad1.addColorStop(0, '#f48b60');
  grad1.addColorStop(1, '#e07048');
  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.moveTo(1350, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, H);
  ctx.lineTo(850, H);
  ctx.lineTo(700, H);
  ctx.fill();

  // Ribbon 3 (Front/Dark Slate Accent on very bottom right)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(W, 600);
  ctx.lineTo(W, H);
  ctx.lineTo(1200, H);
  ctx.fill();
  ctx.restore();

  /* ── 3. Top Left Logo ── */
  const startX = 120;
  
  // Logo Icon (Square outline with rounded corners)
  ctx.strokeStyle = '#c05621';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(startX, 100, 40, 40, 10);
  ctx.stroke();

  // Company Name
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 24px "Inter", sans-serif';
  ctx.fillText('CertNova', startX + 60, 120);
  
  // Slogan
  ctx.fillStyle = '#64748b';
  ctx.font = '500 14px "Inter", sans-serif';
  ctx.fillText('Learn. Build. Secure.', startX + 60, 140);

  /* ── 4. Main Typography ── */
  
  // Dual-color Heading
  ctx.font = '800 64px "Inter", sans-serif';
  ctx.fillStyle = '#f48b60'; // Brand Orange
  ctx.fillText('CERTIFICATE', startX, 280);
  
  const certWidth = ctx.measureText('CERTIFICATE ').width;
  ctx.fillStyle = '#1e293b'; // Slate
  ctx.fillText('OF COMPLETION', startX + certWidth, 280);

  // Subtitle
  ctx.fillStyle = '#475569';
  ctx.font = '600 22px "Inter", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('THIS CERTIFICATE IS PROUDLY PRESENTED TO', startX, 350);

  // Recipient Name (Beautiful Script Font)
  ctx.fillStyle = '#0f172a';
  // Fallback to Great Vibes or cursive
  ctx.font = '100px "Great Vibes", "Playfair Display", cursive, serif';
  ctx.fillText(formatName(userName), startX, 490);

  // Course Description
  ctx.fillStyle = '#475569';
  ctx.font = '600 24px "Inter", sans-serif';
  ctx.fillText('FOR SUCCESSFULLY COMPLETING:', startX, 610);

  ctx.fillStyle = '#64748b';
  ctx.font = '400 20px "Inter", sans-serif';
  // Wrap long text
  const descText = `The student has met all requirements, passed the final assessments, and demonstrated mastery of the concepts in the ${courseTitle} curriculum.`;
  const lines = wrapText(ctx, descText, 700);
  let textY = 660;
  lines.forEach(line => {
    ctx.fillText(line, startX, textY);
    textY += 32;
  });

  /* ── 5. Footer (Date and Signature) ── */
  const footerY = 930;
  
  // Line 1: Date
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, footerY);
  ctx.lineTo(startX + 250, footerY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = '600 18px "Inter", sans-serif';
  ctx.fillText(completionDate, startX + 125, footerY - 15);
  ctx.fillStyle = '#64748b';
  ctx.font = '500 14px "Inter", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('DATE', startX + 125, footerY + 25);

  // Line 2: Signature
  ctx.beginPath();
  ctx.moveTo(startX + 350, footerY);
  ctx.lineTo(startX + 600, footerY);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '600 18px "Inter", sans-serif';
  ctx.fillText(instructorName, startX + 475, footerY - 15);
  ctx.fillStyle = '#64748b';
  ctx.font = '500 14px "Inter", sans-serif';
  ctx.fillText('SIGNATURE', startX + 475, footerY + 25);

  // Cert ID (Small at the bottom)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 12px "Inter", sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(`Credential ID: ${certId}`, startX, H - 40);

  /* ── 6. The Massive Badge (Bottom Right) ── */
  const badgeX = 1150;
  const badgeY = 800;

  // Outer shadow/white ring
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 180, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;
  ctx.fill();
  ctx.shadowColor = 'transparent'; // Reset shadow

  // Brand Orange inner ring
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 150, 0, Math.PI * 2);
  ctx.fillStyle = '#f48b60';
  ctx.fill();

  // Dark Slate core
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 130, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Badge Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  
  ctx.font = '700 36px "Inter", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('SECURITY', badgeX, badgeY - 10);
  
  ctx.font = '800 42px "Inter", sans-serif';
  ctx.fillText('CERTIFIED', badgeX, badgeY + 40);

  // Three Stars
  drawStar(ctx, badgeX - 45, badgeY + 80, 12, '#ffffff');
  drawStar(ctx, badgeX, badgeY + 85, 16, '#ffffff'); // Center star slightly larger
  drawStar(ctx, badgeX + 45, badgeY + 80, 12, '#ffffff');

  return canvas.toDataURL('image/png', 1.0);
}

/* ── Helpers ── */

function drawStar(ctx, cx, cy, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function wrapText(ctx, text, maxWidth) {
  if (!text) return [''];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

function formatName(name) {
  if (!name) return 'Learner';
  return name
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
