/**
 * generateCertificate.js — Renders a premium certificate on HTML5 Canvas
 * and returns a downloadable data URL (PNG).
 *
 * @param {Object} opts
 * @param {string} opts.userName
 * @param {string} opts.courseTitle
 * @param {string} opts.completionDate
 * @param {string} opts.certId
 * @param {string} [opts.instructorName]
 * @returns {string} data:image/png URL
 */
export function generateCertificate({
  userName,
  courseTitle,
  completionDate,
  certId,
  instructorName = 'CertNova Team',
}) {
  const W = 1600;
  const H = 1130;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  /* ── Background ── */
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#fffaf6');
  bg.addColorStop(0.5, '#fff8f2');
  bg.addColorStop(1, '#fef5ee');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* ── Subtle texture pattern ── */
  ctx.globalAlpha = 0.03;
  for (let x = 0; x < W; x += 30) {
    for (let y = 0; y < H; y += 30) {
      ctx.fillStyle = '#c05621';
      ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.globalAlpha = 1;

  /* ── Outer border ── */
  const borderW = 12;
  ctx.strokeStyle = '#f48b60';
  ctx.lineWidth = borderW;
  roundRect(ctx, borderW / 2, borderW / 2, W - borderW, H - borderW, 24);
  ctx.stroke();

  /* ── Inner border ── */
  const inner = 28;
  ctx.strokeStyle = 'rgba(244, 139, 96, 0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, inner, inner, W - inner * 2, H - inner * 2, 16);
  ctx.stroke();

  /* ── Corner ornaments ── */
  drawCornerOrnaments(ctx, W, H);

  /* ── Top decorative line ── */
  const lineY = 100;
  const lineGrad = ctx.createLinearGradient(200, lineY, W - 200, lineY);
  lineGrad.addColorStop(0, 'rgba(244,139,96,0)');
  lineGrad.addColorStop(0.3, 'rgba(244,139,96,0.5)');
  lineGrad.addColorStop(0.5, 'rgba(244,139,96,0.8)');
  lineGrad.addColorStop(0.7, 'rgba(244,139,96,0.5)');
  lineGrad.addColorStop(1, 'rgba(244,139,96,0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(200, lineY);
  ctx.lineTo(W - 200, lineY);
  ctx.stroke();

  /* ── CertNova branding ── */
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c05621';
  ctx.font = '600 18px "Inter", "Segoe UI", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('C E R T N O V A', W / 2, 82);

  /* ── Award icon (star) ── */
  drawAwardStar(ctx, W / 2, 155, 32);

  /* ── "Certificate of Completion" ── */
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 52px "Georgia", "Playfair Display", serif';
  ctx.fillText('Certificate of Completion', W / 2, 235);

  /* ── Subtitle ── */
  ctx.fillStyle = '#64748b';
  ctx.font = '400 20px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('This is proudly presented to', W / 2, 290);

  /* ── Decorative divider before name ── */
  drawDivider(ctx, W / 2 - 120, 315, 240);

  /* ── Recipient name ── */
  const nameGrad = ctx.createLinearGradient(W / 2 - 200, 360, W / 2 + 200, 360);
  nameGrad.addColorStop(0, '#e07048');
  nameGrad.addColorStop(0.5, '#f48b60');
  nameGrad.addColorStop(1, '#e07048');
  ctx.fillStyle = nameGrad;
  ctx.font = '700 56px "Georgia", "Playfair Display", serif';
  ctx.fillText(formatName(userName), W / 2, 375);

  /* ── Decorative divider after name ── */
  drawDivider(ctx, W / 2 - 120, 405, 240);

  /* ── "for successfully completing" ── */
  ctx.fillStyle = '#64748b';
  ctx.font = '400 20px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('for successfully completing the course', W / 2, 450);

  /* ── Course title ── */
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 36px "Georgia", "Playfair Display", serif';
  // Wrap long titles
  const lines = wrapText(ctx, courseTitle, W - 300);
  let titleY = 505;
  lines.forEach((line) => {
    ctx.fillText(line, W / 2, titleY);
    titleY += 46;
  });

  /* ── Instructor & Date section ── */
  const infoY = Math.max(titleY + 60, 620);

  // Left: Completion Date
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('COMPLETION DATE', W / 2 - 250, infoY);
  ctx.fillStyle = '#334155';
  ctx.font = '500 18px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(completionDate, W / 2 - 250, infoY + 28);

  // Center divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2, infoY - 15);
  ctx.lineTo(W / 2, infoY + 40);
  ctx.stroke();

  // Right: Instructor
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('INSTRUCTOR', W / 2 + 250, infoY);
  ctx.fillStyle = '#334155';
  ctx.font = '500 18px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(instructorName, W / 2 + 250, infoY + 28);

  /* ── Signature lines ── */
  const sigY = infoY + 65;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 1;
  // left sig line
  ctx.beginPath();
  ctx.moveTo(W / 2 - 350, sigY);
  ctx.lineTo(W / 2 - 150, sigY);
  ctx.stroke();
  // right sig line
  ctx.beginPath();
  ctx.moveTo(W / 2 + 150, sigY);
  ctx.lineTo(W / 2 + 350, sigY);
  ctx.stroke();

  /* ── Bottom decorative line ── */
  const btmLineY = H - 100;
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(200, btmLineY);
  ctx.lineTo(W - 200, btmLineY);
  ctx.stroke();

  /* ── Verified badge ── */
  const badgeY = H - 140;
  ctx.fillStyle = 'rgba(22, 163, 74, 0.08)';
  roundRect(ctx, W / 2 - 100, badgeY - 14, 200, 30, 999);
  ctx.fill();
  ctx.fillStyle = '#16a34a';
  ctx.font = '600 13px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('✓ Verified & Authentic', W / 2, badgeY + 5);

  /* ── Certificate ID ── */
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 14px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(`Certificate ID: ${certId}`, W / 2, H - 60);

  /* ── Verify URL ── */
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 12px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('Verify at certnova.com/verify-certificate', W / 2, H - 40);

  return canvas.toDataURL('image/png', 1.0);
}

/* ── Helpers ── */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawDivider(ctx, x, y, w) {
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, 'rgba(244,139,96,0)');
  grad.addColorStop(0.3, 'rgba(244,139,96,0.6)');
  grad.addColorStop(0.5, 'rgba(244,139,96,0.9)');
  grad.addColorStop(0.7, 'rgba(244,139,96,0.6)');
  grad.addColorStop(1, 'rgba(244,139,96,0)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  // center diamond
  const cx = x + w / 2;
  ctx.fillStyle = '#f48b60';
  ctx.beginPath();
  ctx.moveTo(cx, y - 4);
  ctx.lineTo(cx + 4, y);
  ctx.lineTo(cx, y + 4);
  ctx.lineTo(cx - 4, y);
  ctx.closePath();
  ctx.fill();
}

function drawAwardStar(ctx, cx, cy, size) {
  ctx.fillStyle = '#f48b60';
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
  // Inner circle
  ctx.fillStyle = '#fffaf6';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Tiny inner star
  ctx.fillStyle = '#f48b60';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + size * 0.22 * Math.cos(angle);
    const y = cy + size * 0.22 * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCornerOrnaments(ctx, W, H) {
  const size = 50;
  const pad = 45;
  ctx.strokeStyle = 'rgba(244, 139, 96, 0.4)';
  ctx.lineWidth = 2;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, pad + size);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + size, pad);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(W - pad - size, pad);
  ctx.lineTo(W - pad, pad);
  ctx.lineTo(W - pad, pad + size);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, H - pad - size);
  ctx.lineTo(pad, H - pad);
  ctx.lineTo(pad + size, H - pad);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(W - pad - size, H - pad);
  ctx.lineTo(W - pad, H - pad);
  ctx.lineTo(W - pad, H - pad - size);
  ctx.stroke();
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
