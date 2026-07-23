import { useEffect, useRef } from "react";

const STATUS_KEYS = ["OFF", "SB", "D", "ON"];
const STATUS_COLORS = ["#707a8a", "#9ca3af", "#fcd535", "#3b82f6"];

const REF_MARGIN = 14;
const REF_LABEL_W = 56;
const REF_CELL_W = 25;
const REF_CELL_H = 30;
const REF_COLS = 24;
const REF_ROWS = 4;
const REF_HEADER_H = 84;
const REF_SUMMARY_H = 80;
const REF_TOTAL_H = 40;

const REF_GRID_W = REF_LABEL_W + REF_COLS * REF_CELL_W;
const REF_GRID_H = REF_ROWS * REF_CELL_H;
const REF_W = REF_MARGIN * 2 + REF_GRID_W;
const REF_H = REF_MARGIN * 2 + REF_HEADER_H + REF_GRID_H + REF_SUMMARY_H + REF_TOTAL_H;

function drawLog(ctx, log, scale) {
  const M = REF_MARGIN * scale;
  const LW = REF_LABEL_W * scale;
  const CW = REF_CELL_W * scale;
  const CH = REF_CELL_H * scale;
  const HH = REF_HEADER_H * scale;
  const SH = REF_SUMMARY_H * scale;
  const TH = REF_TOTAL_H * scale;
  const w = REF_W * scale;
  const h = REF_H * scale;

  const left = M + LW;
  const top = M + HH;

  ctx.fillStyle = "#f5f0e8";
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 200; i++) {
    const rx = Math.random() * w;
    const ry = Math.random() * h;
    ctx.fillStyle = `rgba(180, 160, 130, ${Math.random() * 0.03})`;
    ctx.fillRect(rx, ry, Math.random() * 4 + 1, Math.random() * 1 + 0.5);
  }

  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${14 * scale}px 'Courier New', monospace`;
  ctx.textAlign = "left";
  ctx.fillText("U.S. DEPARTMENT OF TRANSPORTATION", M + 4 * scale, 24 * scale);
  ctx.font = `bold ${11 * scale}px 'Courier New', monospace`;
  ctx.fillText("DAILY LOG — DAY " + log.day, M + 4 * scale, 40 * scale);

  ctx.font = `${10 * scale}px 'Courier New', monospace`;
  ctx.fillStyle = "#333";
  const hRow1 = [`Driver: ${log.driver}`, `Carrier: ${log.carrier}`, `Truck: ${log.truck_number}`].join("  |  ");
  ctx.fillText(hRow1, M + 4 * scale, 58 * scale);

  const hRow2 = [`Date: ${log.date || "Day " + log.day}`, `Miles Today: ${Math.round(log.total_miles)}`, `Total Driving: ${log.total_drive_hours.toFixed(1)}h`].join("  |  ");
  ctx.fillText(hRow2, M + 4 * scale, 74 * scale);

  ctx.textAlign = "center";
  ctx.font = `${8 * scale}px 'Courier New', monospace`;
  ctx.fillStyle = "#555";
  for (let c = 0; c < REF_COLS; c++) {
    const x = left + c * CW + CW / 2;
    ctx.fillText(String(c).padStart(2, "0"), x, top - 6 * scale);
  }

  const grid = log.grid || [];

  for (let r = 0; r < REF_ROWS; r++) {
    const y = top + r * CH;

    ctx.fillStyle = "#e8e0d0";
    ctx.fillRect(M, y, LW, CH);

    ctx.textAlign = "right";
    ctx.font = `bold ${10 * scale}px 'Courier New', monospace`;
    ctx.fillStyle = "#333";
    ctx.fillText(STATUS_KEYS[r], M + LW - 6 * scale, y + CH / 2 + 3 * scale);

    for (let c = 0; c < REF_COLS; c++) {
      const x = left + c * CW;
      const hourStatus = grid[c] || "";
      const isActive = hourStatus === STATUS_KEYS[r];

      ctx.fillStyle = "#f5f0e8";
      ctx.fillRect(x, y, CW, CH);

      if (isActive) {
        const color = STATUS_COLORS[r];

        ctx.fillStyle = color;
        ctx.globalAlpha = r === 2 ? 0.75 : 0.35;
        ctx.fillRect(x + 1 * scale, y + 1 * scale, CW - 2 * scale, CH - 2 * scale);
        ctx.globalAlpha = 1;

        if (r === 2) {
          ctx.strokeStyle = "rgba(252, 213, 53, 0.3)";
          ctx.lineWidth = 0.5 * scale;
          for (let h = 0; h < CH; h += 4 * scale) {
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x + CW, y + h);
            ctx.stroke();
          }
        }

        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5 * scale;
        ctx.strokeRect(x, y, CW, CH);
      }

      ctx.strokeStyle = "rgba(100, 140, 200, 0.25)";
      ctx.lineWidth = 0.5 * scale;
      ctx.strokeRect(x, y, CW, CH);
    }

    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 0.5 * scale;
    ctx.beginPath();
    ctx.moveTo(left, y + CH);
    ctx.lineTo(left + REF_COLS * CW, y + CH);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(left, top, REF_COLS * CW, REF_ROWS * CH);

  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.5 * scale;
  for (let r = 1; r < REF_ROWS; r++) {
    const y = top + r * CH;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + REF_COLS * CW, y);
    ctx.stroke();
  }

  const sumY = top + REF_GRID_H * scale + 8 * scale;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${10 * scale}px 'Courier New', monospace`;
  ctx.textAlign = "left";
  ctx.fillText("REMARKS", M + 4 * scale, sumY + 12 * scale);

  const segs = log.segments || [];
  const remarks = segs.filter((s) => s.remark).map((s) => `[${s.start_hour}-${s.end_hour}] ${s.remark}`);
  ctx.font = `${9 * scale}px 'Courier New', monospace`;
  ctx.fillStyle = "#444";
  if (remarks.length > 0) {
    let line = remarks.join("; ");
    const maxChars = Math.floor(80 / scale);
    while (line.length > 0) {
      ctx.fillText(line.substring(0, maxChars), M + 4 * scale, sumY + 28 * scale);
      line = line.substring(maxChars);
    }
  } else {
    ctx.fillText("No remarks for this day", M + 4 * scale, sumY + 28 * scale);
  }

  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.5 * scale;
  ctx.beginPath();
  ctx.moveTo(M + 4 * scale, sumY + 38 * scale);
  ctx.lineTo(w - M - 4 * scale, sumY + 38 * scale);
  ctx.stroke();

  const totY = sumY + 46 * scale;
  ctx.font = `bold ${11 * scale}px 'Courier New', monospace`;
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "left";
  ctx.fillText("HOURS SUMMARY", M + 4 * scale, totY + 6 * scale);

  const counts = STATUS_KEYS.map((k) => ({
    label: k,
    count: (grid || []).filter((s) => s === k).length,
    color: STATUS_COLORS[STATUS_KEYS.indexOf(k)],
  }));

  ctx.font = `${10 * scale}px 'Courier New', monospace`;
  let tx = M + 4 * scale;
  counts.forEach((t) => {
    ctx.fillStyle = t.color;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(tx, totY + 12 * scale, 10 * scale, 10 * scale);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#333";
    ctx.fillText(`${t.label}: ${t.count}h`, tx + 14 * scale, totY + 22 * scale);
    tx += 72 * scale;
  });
}

function EldLogSheet({ log }) {
  const sheetRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sheet = sheetRef.current;
    if (!canvas || !sheet) return;

    let rafId;

    function render() {
      const rect = sheet.getBoundingClientRect();
      const containerW = rect.width;
      if (containerW <= 0) return;

      const dpr = window.devicePixelRatio || 1;
      const scale = containerW / REF_W;
      const displayH = REF_H * scale;

      canvas.width = containerW * dpr;
      canvas.height = displayH * dpr;
      canvas.style.width = `${containerW}px`;
      canvas.style.height = `${displayH}px`;

      const ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(scale * dpr, scale * dpr);

      drawLog(ctx, log, 1);
    }

    render();

    const ro = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(render);
    });
    ro.observe(sheet);

    return () => {
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [log]);

  return (
    <div className="eld-sheet" ref={sheetRef}>
      <canvas ref={canvasRef} className="eld-canvas" />
    </div>
  );
}

export default EldLogSheet;
