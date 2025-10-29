import React, { useEffect, useMemo, useState } from "react";

// --- tiny design system (no external deps) ---
const ui = {
  card: {
    base: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      padding: 20,
    },
    title: { fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 },
    desc: { fontSize: 12, color: "#6b7280", marginBottom: 8 },
  },
  btn: {
    solid: {
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid #111827",
      background: "#111827",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    },
    ghost: {
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      background: "#fff",
      color: "#111827",
      fontWeight: 600,
      cursor: "pointer",
    },
  },
  label: { fontSize: 13, color: "#0f172a", fontWeight: 600 },
  hint: { fontSize: 12, color: "#64748b" },
  input: {
    base: {
      width: "100%",
      minWidth: 0,
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      outline: "none",
      fontSize: 14,
      boxSizing: "border-box",
    },
  },
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function NumberField({ label, value, setValue, min, max, step, unit, hint }) {
  const [s, setS] = useState(String(value));
  useEffect(() => setS(String(value)), [value]);

  const commit = () => {
    const n = Number(String(s).replace(",", "."));
    if (Number.isFinite(n)) setValue(clamp(n, min, max));
    else setS(String(value));
  };

  return (
    <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <label style={ui.label}>{label}</label>
        {hint && <span style={ui.hint}>{hint}</span>}
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setValue(clamp(Number(e.target.value), min, max))}
        style={{ width: "100%", accentColor: "#111827" }}
      />
      <div style={{ position: "relative" }}>
        <input
          type="text"
          inputMode="decimal"
          value={s}
          onChange={(e) => setS(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          style={{ ...ui.input.base, paddingRight: unit ? 42 : 12 }}
        />
        {unit && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#6b7280" }}>{unit}</span>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
        <span>Min: {min}{unit || ""}</span>
        <span>Max: {max}{unit || ""}</span>
      </div>
    </div>
  );
}

function RadialGauge({ value }) {
  const pct = clamp(value, 0, 1);
  const size = 180;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color = pct < 0.05 ? "#16a34a" : pct < 0.2 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#111827" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} stroke="url(#g)" strokeWidth={stroke} fill="none" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>{(pct * 100).toFixed(2)}%</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Probability</div>
        </div>
      </div>
    </div>
  );
}

export default function ROP1CalculatorCloneFixed() {
  const [GA, setGA] = useState(30);
  const [BW, setBW] = useState(1500);
  const [PLT, setPLT] = useState(250);
  const [compiledBy, setCompiledBy] = useState("");
  const [validatedBy, setValidatedBy] = useState("");

  const linear = useMemo(() => 14.0999 - 0.333 * GA - 0.00628 * BW - 0.00891 * PLT, [GA, BW, PLT]);
  const probability = useMemo(() => 1 / (1 + Math.exp(-linear)), [linear]);
  const status = probability < 0.05 ? "Low" : probability < 0.2 ? "Moderate" : "High";

  const reset = () => { setGA(30); setBW(1500); setPLT(250); };

  const copyToClipboard = () => {
    const text = `P_ROP1 = ${(probability * 100).toFixed(2)}%\nGA=${GA} wks, BW=${BW} g, PLT=${PLT} x10^9/L\nlinear=${linear.toFixed(4)}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const exportCSV = () => {
    const rows = [
      ["GA_weeks","BW_g","PLT_10^9L","linear","probability","risk_band"],
      [GA, BW, PLT, linear.toFixed(4), (probability*100).toFixed(2)+"%", status],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ROP1_export.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDF = () => {
    const now = new Date();
    const risk = status;
    const html = `<!doctype html>\n<html><head><meta charset='utf-8'><title>ROP1 Report</title>\n<style>\n  @page { size: A4; margin: 20mm; }\n  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:#111827; }\n  h1 { font-size: 20px; margin: 0 0 6px; }\n  .muted { color:#6b7280; font-size: 12px; }\n  h2 { font-size: 16px; margin: 18px 0 6px; }\n  .row { margin: 2px 0; font-size: 13px; }\n  .footer { margin-top: 28px; font-size: 11px; color:#6b7280; }\n  .sign { margin-top: 18px; font-size: 12px; }\n</style>\n</head><body>\n<h1>ROP1 Probability Report</h1>\n<div class='muted'>Generated: ${now.toLocaleString()}</div>\n<h2>Inputs</h2>\n<div class='row'>• GA: ${GA} weeks</div>\n<div class='row'>• BW: ${BW} g</div>\n<div class='row'>• PLT: ${PLT} ×10^9/L</div>\n<h2>Model</h2>\n<div class='row'>P = 1 / (1 + e^{-(14.0999 − 0.333·GA − 0.00628·BW − 0.00891·PLT)})</div>\n<div class='row'>Linear (log-odds): ${linear.toFixed(4)}</div>\n<h2>Output</h2>\n<div class='row'>Probability: ${(probability*100).toFixed(2)}%</div>\n<div class='row'>Risk band: ${risk}</div>\n<div class='sign'>\n  <div>Firma / Validazione</div>\n  <div>Compilato da: ${compiledBy || '________________'}</div>\n  <div>Validato da: ${validatedBy || '________________'}</div>\n  <div>Data: ${now.toLocaleDateString()}</div>\n</div>\n<div class='footer'>Educational use only — non sostituisce il giudizio clinico.</div>\n<script>window.onload = () => { setTimeout(()=>window.print(), 120); };</script>\n</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank', 'noopener');
    if (!w) alert('Popup bloccato: consenti pop-up per generare il PDF.');
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(135deg,#fafafa,#fff,#f4f4f5)", padding: isMobile ? 16 : 24 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gap: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 }}>ROP1 Probability Calculator</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>P = 1 / (1 + e^(-(14.0999 − 0.333·GA − 0.00628·BW − 0.00891·PLT)))</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={reset} style={ui.btn.ghost}>Reset</button>
            <button onClick={copyToClipboard} style={ui.btn.ghost}>Copy</button>
            <button onClick={exportCSV} style={ui.btn.ghost}>Export CSV</button>
            <button onClick={generatePDF} style={ui.btn.solid}>Genera PDF</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", gap: 16 }}>
          {/* Inputs card */}
          <div style={ui.card.base}>
            <div style={ui.card.title}>Inputs</div>
            <div style={ui.card.desc}>Inserisci i valori; puoi digitare (anche ",") o usare lo slider</div>
            <NumberField label="Gestational Age (GA)" value={GA} setValue={setGA} min={22} max={40} step={0.1} unit=" wks" hint="22–40" />
            <NumberField label="Birth Weight (BW)" value={BW} setValue={setBW} min={400} max={4500} step={10} unit=" g" hint="400–4500" />
            <NumberField label="Platelets (PLT)" value={PLT} setValue={setPLT} min={50} max={600} step={1} unit=" ×10^9/L" hint="50–600" />
          </div>

          {/* Output card */}
          <div style={ui.card.base}>
            <div style={ui.card.title}>Output</div>
            <div style={{ display: "grid", placeItems: "center", paddingTop: 6, paddingBottom: 10 }}>
              <RadialGauge value={probability} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6 }}>Log-odds</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{linear.toFixed(4)}</div>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6 }}>Risk band</div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: 999, border: "1px solid #e5e7eb", background: status === 'Low' ? '#ecfdf5' : status === 'Moderate' ? '#fffbeb' : '#fef2f2', color: status === 'Low' ? '#065f46' : '#92400e', fontWeight: 600 }}>{status}</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 10, textAlign: "center" }}>Educational use only — non sostituisce il giudizio clinico.</div>
          </div>
        </div>

        {/* Sign card */}
        <div style={{ ...ui.card.base }}>
          <div style={ui.card.title}>Firma / Validazione</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            <div>
              <div style={ui.label}>Compilato da</div>
              <input value={compiledBy} onChange={(e) => setCompiledBy(e.target.value)} style={{ ...ui.input.base, marginTop: 6 }} placeholder="Nome e cognome" />
            </div>
            <div>
              <div style={ui.label}>Validato da</div>
              <input value={validatedBy} onChange={(e) => setValidatedBy(e.target.value)} style={{ ...ui.input.base, marginTop: 6 }} placeholder="Nome e cognome" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------
// Self-tests (console only)
// --------------------------
(function runSelfTests(){
  try {
    const rop1 = (GA, BW, PLT) => 1/(1+Math.exp(-(14.0999 - 0.333*GA - 0.00628*BW - 0.00891*PLT)));
    const approx = (a,b,eps=1e-6)=>Math.abs(a-b)<eps;
    const cases = [
      {GA:30,BW:1500,PLT:250,expect:0.0005323909166713308},
      {GA:24,BW:800,PLT:100,expect:0.5480760150194853},
      {GA:36,BW:3000,PLT:200,expect:9.144620910652134e-9}
    ];
    let fails=0; cases.forEach((c,i)=>{const g=rop1(c.GA,c.BW,c.PLT); if(!approx(g,c.expect)){fails++; console.error(`[ROP1 test ${i+1}] expected ~${c.expect} got ${g}`);}});
    if(!fails) console.log('[ROP1] self-tests passed ✔');
  } catch(e){}
})();
