import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

// ─── Palette & constants ────────────────────────────────────────────────────
const C = {
  bg: "#050b18",
  bgCard: "rgba(10,18,40,0.85)",
  bgGlass: "rgba(15,25,55,0.6)",
  border: "rgba(56,139,253,0.18)",
  borderHi: "rgba(88,166,255,0.45)",
  blue: "#388bfd",
  blueLt: "#58a6ff",
  purple: "#a78bfa",
  purpleDk: "#7c3aed",
  cyan: "#22d3ee",
  green: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
  textPri: "#e6edf3",
  textSec: "#8b949e",
  textDim: "#484f58",
};

const RISK_COLORS = { Clean: C.green, "Medium Risk": C.amber, "High Risk": C.red };

// ─── Sample data ─────────────────────────────────────────────────────────────
const TX_DATA = [
  { id: "TX-00821", wallet: "0x4e9a...d2f1", amount: "$142,500", risk: 92, label: "High Risk", time: "12:04:32", chain: "Ethereum", flag: "Mixer detected" },
  { id: "TX-00820", wallet: "0xbc71...a3e9", amount: "$8,320", risk: 14, label: "Clean", time: "12:03:17", chain: "Bitcoin", flag: "—" },
  { id: "TX-00819", wallet: "0xf1d2...7c04", amount: "$67,000", risk: 58, label: "Medium Risk", time: "12:02:44", chain: "Solana", flag: "Structuring" },
  { id: "TX-00818", wallet: "0xa291...bb12", amount: "$2,100", risk: 6, label: "Clean", time: "12:01:59", chain: "Ethereum", flag: "—" },
  { id: "TX-00817", wallet: "0x73ef...c5d8", amount: "$980,000", risk: 97, label: "High Risk", time: "12:00:11", chain: "TRON", flag: "Sanctions list" },
  { id: "TX-00816", wallet: "0x88ab...1f03", amount: "$45,600", risk: 61, label: "Medium Risk", time: "11:59:33", chain: "BSC", flag: "Rapid cycling" },
  { id: "TX-00815", wallet: "0x10bc...d7f4", amount: "$1,240", risk: 8, label: "Clean", time: "11:58:01", chain: "Bitcoin", flag: "—" },
  { id: "TX-00814", wallet: "0xc9d3...e2b7", amount: "$310,000", risk: 88, label: "High Risk", time: "11:57:20", chain: "Ethereum", flag: "Dark-net wallet" },
];

const TIMELINE = [
  { t: "08:00", clean: 120, medium: 18, high: 4 },
  { t: "09:00", clean: 145, medium: 22, high: 7 },
  { t: "10:00", clean: 98, medium: 31, high: 12 },
  { t: "11:00", clean: 160, medium: 27, high: 9 },
  { t: "12:00", clean: 175, medium: 41, high: 18 },
  { t: "13:00", clean: 132, medium: 35, high: 14 },
  { t: "14:00", clean: 148, medium: 29, high: 11 },
  { t: "15:00", clean: 190, medium: 46, high: 22 },
];

const PIE_DATA = [
  { name: "Clean", value: 68 },
  { name: "Medium Risk", value: 22 },
  { name: "High Risk", value: 10 },
];

const RADAR_DATA = [
  { metric: "Mixer Use", score: 82 },
  { metric: "Structuring", score: 65 },
  { metric: "Velocity", score: 47 },
  { metric: "Sanctions", score: 91 },
  { metric: "Dark-net", score: 74 },
  { metric: "Cycling", score: 58 },
];

const BLOCKS = [
  { index: 0, hash: "000a3f8b…", prev: "genesis", txCount: 312, time: "2025-06-01 08:00" },
  { index: 1, hash: "001c7d2e…", prev: "000a3f8b…", txCount: 287, time: "2025-06-01 09:00" },
  { index: 2, hash: "002b19fa…", prev: "001c7d2e…", txCount: 341, time: "2025-06-01 10:00" },
  { index: 3, hash: "003e8c61…", prev: "002b19fa…", txCount: 298, time: "2025-06-01 11:00" },
  { index: 4, hash: "004d5a3b…", prev: "003e8c61…", txCount: 367, time: "2025-06-01 12:00" },
];

const FEATURES = [
  { icon: "⚡", title: "Real-Time Fraud Detection", desc: "Sub-second ML inference flags anomalous transactions the moment they propagate across the network." },
  { icon: "🧠", title: "AI Risk Scoring", desc: "XGBoost ONNX model generates a 0–100 risk score per transaction, continuously retrained on new threat patterns." },
  { icon: "🔗", title: "Blockchain Secure Logging", desc: "Every audit event is sealed into a SHA-256 linked chain, ensuring tamper-evident compliance records." },
  { icon: "👁", title: "Wallet Tracking", desc: "Graph-based relationship mapping traces funds across multi-hop wallet networks and cross-chain bridges." },
  { icon: "📋", title: "AML Compliance Reports", desc: "Auto-generated FATF, FinCEN, and MiCA-aligned reports in PDF/CSV for regulatory submission." },
  { icon: "🚨", title: "Suspicious Transaction Alerts", desc: "Instant push alerts with contextual evidence for investigators via webhook, email, or SIEM integration." },
  { icon: "🔄", title: "Adaptive Learning System", desc: "Online learning pipeline absorbs investigator feedback, reducing false positives over each detection cycle." },
  { icon: "🔍", title: "Investigator Dashboard", desc: "Rich forensic workbench with timeline analysis, entity graphs, and collaborative case management tools." },
];

const NAV_ITEMS = ["Home", "Features", "About", "Dashboard", "Monitor", "Analytics", "Contact"];

// ─── Micro-components ─────────────────────────────────────────────────────────

const Badge = ({ label }) => {
  const colors = {
    "High Risk": { bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.45)", text: C.red },
    "Medium Risk": { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.4)", text: C.amber },
    Clean: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.4)", text: C.green },
  };
  const s = colors[label] || { bg: "rgba(56,139,253,0.1)", border: C.border, text: C.blue };
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      borderRadius: 4, padding: "2px 10px", fontSize: 12, fontWeight: 600,
      letterSpacing: "0.04em", fontFamily: "monospace"
    }}>{label}</span>
  );
};

const RiskBar = ({ value }) => {
  const color = value >= 80 ? C.red : value >= 50 ? C.amber : C.green;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 99, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, background: color, height: "100%", borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ color, fontSize: 12, fontWeight: 700, minWidth: 28, fontFamily: "monospace" }}>{value}%</span>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, color = C.blue }) => (
  <div style={{
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: "20px 22px", backdropFilter: "blur(12px)", position: "relative", overflow: "hidden"
  }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: color, opacity: 0.06, borderRadius: "0 0 0 80px" }} />
    <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: C.textPri, fontFamily: "monospace" }}>{value}</div>
    <div style={{ fontSize: 13, color: C.textSec, marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 12, color: color, marginTop: 4 }}>{sub}</div>}
  </div>
);

const GlassCard = ({ children, style = {} }) => (
  <div style={{
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14,
    backdropFilter: "blur(16px)", padding: "22px 24px", ...style
  }}>{children}</div>
);

const SectionTitle = ({ label, title, sub }) => (
  <div style={{ textAlign: "center", marginBottom: 48 }}>
    <div style={{
      display: "inline-block", background: "rgba(56,139,253,0.12)", border: `1px solid ${C.border}`,
      borderRadius: 99, padding: "4px 16px", fontSize: 12, color: C.blue, marginBottom: 16,
      letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600
    }}>{label}</div>
    <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: C.textPri, margin: "0 0 12px", letterSpacing: "-0.02em" }}>{title}</h2>
    {sub && <p style={{ color: C.textSec, fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>{sub}</p>}
  </div>
);

// ─── Animated background canvas ───────────────────────────────────────────────
function NetworkBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const N = 55;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < N; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
        if (a.y < 0 || a.y > canvas.height) a.vy *= -1;
        for (let j = i + 1; j < N; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(56,139,253,${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(88,166,255,0.55)";
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection({ onNav }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 2000); return () => clearInterval(id); }, []);
  const alerts = ["High-risk wallet flagged: 0x4e9a…", "Sanctions match: OFAC list hit", "Structuring pattern: $9,800 × 11 txs", "Mixer detected: Tornado Cash relay"];
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "80px 24px 60px" }}>
      <NetworkBg />
      {/* radial glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: "radial-gradient(circle, rgba(56,139,253,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, textAlign: "center" }}>
        {/* live alert ticker */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(248,113,113,0.12)",
          border: "1px solid rgba(248,113,113,0.35)", borderRadius: 99, padding: "5px 16px", marginBottom: 32, fontSize: 13
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, boxShadow: `0 0 0 3px rgba(248,113,113,0.3)`, display: "inline-block", animation: "pulse 1.5s infinite" }} />
          <span style={{ color: C.red, fontWeight: 600 }}>LIVE ALERT</span>
          <span style={{ color: C.textSec, fontFamily: "monospace", fontSize: 12 }}>{alerts[tick % alerts.length]}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(56,139,253,0.2), rgba(124,58,237,0.2))",
            border: `1px solid ${C.borderHi}`, borderRadius: 16, padding: "8px 18px",
            fontSize: 13, color: C.blueLt, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase"
          }}>VTAC — v2.4.1 Enterprise</div>
        </div>

        <h1 style={{
          fontSize: "clamp(36px,6vw,72px)", fontWeight: 900, lineHeight: 1.05,
          letterSpacing: "-0.03em", margin: "0 0 20px",
          background: "linear-gradient(135deg, #e6edf3 30%, #58a6ff 65%, #a78bfa 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>
          AI-Powered Crypto<br />Compliance Platform
        </h1>
        <p style={{ fontSize: "clamp(16px,2vw,20px)", color: C.textSec, margin: "0 auto 40px", maxWidth: 580, lineHeight: 1.6 }}>
          Detect Suspicious Crypto Transactions in Real Time.<br />
          <span style={{ color: C.textPri }}>XGBoost ML · Blockchain Audit Logs · AML Compliance.</span>
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNav("Dashboard")} style={{
            background: "linear-gradient(135deg, #388bfd, #7c3aed)", border: "none", borderRadius: 10,
            padding: "14px 36px", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
            boxShadow: "0 0 28px rgba(56,139,253,0.4)", letterSpacing: "0.02em"
          }}>Get Started →</button>
          <button onClick={() => onNav("About")} style={{
            background: "transparent", border: `1px solid ${C.borderHi}`, borderRadius: 10,
            padding: "14px 36px", color: C.textPri, fontWeight: 600, fontSize: 16, cursor: "pointer"
          }}>Learn More</button>
        </div>

        {/* mini stat bar */}
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 64, flexWrap: "wrap" }}>
          {[["2.4M+", "Transactions Analyzed"], ["99.3%", "Detection Accuracy"], ["12ms", "Avg Inference Time"], ["FATF", "Compliant"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.blueLt, fontFamily: "monospace" }}>{v}</div>
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="Features" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <SectionTitle label="Capabilities" title="Everything You Need for Crypto AML" sub="A complete forensic intelligence suite built for financial compliance teams and cybersecurity agencies." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} style={{
            background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "26px 24px",
            backdropFilter: "blur(16px)", transition: "border-color 0.2s, transform 0.2s",
            cursor: "default",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textPri, margin: "0 0 10px" }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  const points = [
    { icon: "🕵️", title: "What is Crypto Money Laundering?", body: "Criminals exploit pseudonymous blockchain addresses to cycle illicit funds through layering attacks—splitting, mixing, and bridging assets across chains to obscure the money trail. VTAC models these patterns at graph-network scale." },
    { icon: "🔬", title: "How VTAC Works", body: "Each incoming transaction is featurized (velocity, counterparty graph centrality, mixer proximity, UTXO pattern) and scored by an ONNX-optimised XGBoost model. Results are immutably logged to a SHA-256 blockchain ledger." },
    { icon: "📈", title: "ML vs. Rule-based Systems", body: "Traditional threshold rules miss novel laundering typologies and generate high false-positive rates. VTAC's adaptive ensemble model achieves 99.3% recall on high-risk transactions with 2× fewer false alerts." },
    { icon: "⛓️", title: "Blockchain Audit Integrity", body: "Every scoring event, analyst action, and alert is chained via SHA-256 hashes. Any post-hoc tampering breaks the chain—providing court-admissible forensic evidence for regulators." },
  ];
  return (
    <section id="About" style={{ padding: "100px 24px", background: "rgba(10,18,40,0.5)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionTitle label="About VTAC" title="The Science Behind the Platform" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
          {points.map(p => (
            <GlassCard key={p.title}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{p.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textPri, margin: "0 0 10px" }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.65, margin: 0 }}>{p.body}</p>
            </GlassCard>
          ))}
        </div>

        {/* Architecture flow */}
        <div style={{ marginTop: 56, textAlign: "center" }}>
          <h3 style={{ color: C.textSec, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 28 }}>System Architecture</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
            {["Blockchain Node", "Event Stream", "Feature Engine", "XGBoost ONNX", "Risk API", "Dashboard"].map((step, i, arr) => (
              <div key={step} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(56,139,253,0.18), rgba(124,58,237,0.18))",
                  border: `1px solid ${C.borderHi}`, borderRadius: 10, padding: "10px 16px",
                  fontSize: 13, fontWeight: 600, color: C.textPri, whiteSpace: "nowrap"
                }}>{step}</div>
                {i < arr.length - 1 && <span style={{ color: C.blue, fontSize: 20, margin: "0 4px" }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardSection() {
  const [alerts, setAlerts] = useState([
    { id: 1, msg: "High-risk TX flagged: 0x4e9a…d2f1 ($142,500)", time: "just now", type: "high" },
    { id: 2, msg: "Sanctions match: OFAC SDN list — 0x73ef…c5d8", time: "1m ago", type: "high" },
    { id: 3, msg: "Structuring pattern detected: 0xf1d2…7c04", time: "3m ago", type: "medium" },
  ]);

  return (
    <section id="Dashboard" style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionTitle label="Dashboard" title="Real-Time Analytics Hub" sub="Live overview of transaction risk across your monitored blockchain networks." />

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard icon="⚡" label="Total Transactions (24h)" value="48,291" sub="+12% vs yesterday" color={C.blue} />
          <StatCard icon="🚨" label="Flagged Transactions" value="1,204" sub="2.5% of volume" color={C.red} />
          <StatCard icon="🟡" label="Medium Risk" value="3,847" sub="Under review" color={C.amber} />
          <StatCard icon="✅" label="Clean Transactions" value="43,240" sub="89.5% safe" color={C.green} />
          <StatCard icon="🔗" label="Blockchain Blocks" value="5,012" sub="SHA-256 sealed" color={C.purple} />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
          <GlassCard>
            <h3 style={{ color: C.textPri, fontSize: 15, fontWeight: 700, margin: "0 0 20px" }}>Transaction Volume by Risk (Hourly)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={TIMELINE}>
                <defs>
                  <linearGradient id="gClean" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.3} /><stop offset="95%" stopColor={C.green} stopOpacity={0} /></linearGradient>
                  <linearGradient id="gMed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.amber} stopOpacity={0.3} /><stop offset="95%" stopColor={C.amber} stopOpacity={0} /></linearGradient>
                  <linearGradient id="gHigh" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.red} stopOpacity={0.35} /><stop offset="95%" stopColor={C.red} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPri }} />
                <Area type="monotone" dataKey="clean" stroke={C.green} strokeWidth={2} fill="url(#gClean)" name="Clean" />
                <Area type="monotone" dataKey="medium" stroke={C.amber} strokeWidth={2} fill="url(#gMed)" name="Medium Risk" />
                <Area type="monotone" dataKey="high" stroke={C.red} strokeWidth={2} fill="url(#gHigh)" name="High Risk" />
                <Legend wrapperStyle={{ color: C.textSec, fontSize: 12, paddingTop: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3 style={{ color: C.textPri, fontSize: 15, fontWeight: 700, margin: "0 0 20px" }}>Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {PIE_DATA.map(d => <Cell key={d.name} fill={RISK_COLORS[d.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPri }} formatter={(v) => `${v}%`} />
                <Legend iconType="circle" wrapperStyle={{ color: C.textSec, fontSize: 12, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Alerts + Radar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <GlassCard>
            <h3 style={{ color: C.textPri, fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>🔴 Live Alerts</h3>
            {alerts.map(a => (
              <div key={a.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                padding: "12px 14px", marginBottom: 10, borderRadius: 8,
                background: a.type === "high" ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
                border: `1px solid ${a.type === "high" ? "rgba(248,113,113,0.3)" : "rgba(251,191,36,0.3)"}`,
              }}>
                <span style={{ fontSize: 13, color: C.textPri, lineHeight: 1.5, maxWidth: "75%" }}>{a.msg}</span>
                <span style={{ fontSize: 11, color: C.textSec, whiteSpace: "nowrap", marginLeft: 8 }}>{a.time}</span>
              </div>
            ))}
          </GlassCard>

          <GlassCard>
            <h3 style={{ color: C.textPri, fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>AML Risk Typology Radar</h3>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: C.textSec, fontSize: 11 }} />
                <Radar name="Risk Score" dataKey="score" stroke={C.blue} fill={C.blue} fillOpacity={0.22} strokeWidth={2} />
                <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPri }} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Transaction table */}
        <GlassCard>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ color: C.textPri, fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Transactions</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: "rgba(56,139,253,0.15)", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 14px", color: C.blue, fontSize: 13, cursor: "pointer" }}>⬇ CSV</button>
              <button style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 7, padding: "6px 14px", color: C.purple, fontSize: 13, cursor: "pointer" }}>⬇ PDF</button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["TX ID", "Wallet", "Chain", "Amount", "Risk Score", "Classification", "Flag", "Time"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", color: C.textSec, fontWeight: 600, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TX_DATA.map((tx, i) => (
                  <tr key={tx.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.018)" }}>
                    <td style={{ padding: "10px 12px", color: C.blue, fontFamily: "monospace" }}>{tx.id}</td>
                    <td style={{ padding: "10px 12px", color: C.textSec, fontFamily: "monospace" }}>{tx.wallet}</td>
                    <td style={{ padding: "10px 12px", color: C.textPri }}>{tx.chain}</td>
                    <td style={{ padding: "10px 12px", color: C.textPri, fontWeight: 600 }}>{tx.amount}</td>
                    <td style={{ padding: "10px 12px", minWidth: 120 }}><RiskBar value={tx.risk} /></td>
                    <td style={{ padding: "10px 12px" }}><Badge label={tx.label} /></td>
                    <td style={{ padding: "10px 12px", color: tx.flag === "—" ? C.textDim : C.amber, fontSize: 12 }}>{tx.flag}</td>
                    <td style={{ padding: "10px 12px", color: C.textSec, fontFamily: "monospace" }}>{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function MonitorSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [input, setInput] = useState({ wallet: "", amount: "", chain: "Ethereum" });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const filtered = TX_DATA.filter(tx => {
    const q = search.toLowerCase();
    const matchSearch = !q || tx.id.toLowerCase().includes(q) || tx.wallet.toLowerCase().includes(q);
    const matchFilter = filter === "All" || tx.label === filter;
    return matchSearch && matchFilter;
  });

  const simulate = () => {
    setLoading(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 100);
      const label = score >= 80 ? "High Risk" : score >= 50 ? "Medium Risk" : "Clean";
      const hash = "SHA256:" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setPrediction({ score, label, hash });
      setLoading(false);
    }, 1200);
  };

  return (
    <section id="Monitor" style={{ padding: "100px 24px", background: "rgba(10,18,40,0.5)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionTitle label="Transaction Monitoring" title="Real-Time Risk Intelligence" sub="Scan, classify, and audit every transaction with ML-powered analysis." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          {/* AI Risk Predictor */}
          <GlassCard>
            <h3 style={{ color: C.textPri, fontSize: 16, fontWeight: 700, margin: "0 0 20px" }}>🧠 AI Risk Predictor</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input value={input.wallet} onChange={e => setInput(p => ({ ...p, wallet: e.target.value }))} placeholder="Wallet address (0x…)" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.textPri, fontSize: 14, fontFamily: "monospace", outline: "none" }} />
              <input value={input.amount} onChange={e => setInput(p => ({ ...p, amount: e.target.value }))} placeholder="Transaction amount (USD)" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.textPri, fontSize: 14, outline: "none" }} />
              <select value={input.chain} onChange={e => setInput(p => ({ ...p, chain: e.target.value }))} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.textPri, fontSize: 14, outline: "none" }}>
                {["Ethereum", "Bitcoin", "Solana", "BSC", "TRON", "Polygon"].map(c => <option key={c} value={c} style={{ background: "#0a1228" }}>{c}</option>)}
              </select>
              <button onClick={simulate} disabled={loading} style={{
                background: loading ? "rgba(56,139,253,0.3)" : "linear-gradient(135deg,#388bfd,#7c3aed)",
                border: "none", borderRadius: 8, padding: "12px", color: "#fff",
                fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer"
              }}>{loading ? "Analyzing…" : "Run XGBoost Prediction →"}</button>
            </div>

            {prediction && (
              <div style={{ marginTop: 20, padding: 18, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: C.textSec, fontSize: 13 }}>AI Risk Score</span>
                  <Badge label={prediction.label} />
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, fontFamily: "monospace", color: prediction.score >= 80 ? C.red : prediction.score >= 50 ? C.amber : C.green }}>
                  {prediction.score}<span style={{ fontSize: 20 }}>%</span>
                </div>
                <RiskBar value={prediction.score} />
                <div style={{ marginTop: 12, fontSize: 11, color: C.textDim, fontFamily: "monospace" }}>
                  Blockchain hash: {prediction.hash}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Blockchain Ledger */}
          <GlassCard>
            <h3 style={{ color: C.textPri, fontSize: 16, fontWeight: 700, margin: "0 0 20px" }}>⛓️ Blockchain Audit Ledger</h3>
            {BLOCKS.map((b, i) => (
              <div key={b.index} style={{ display: "flex", alignItems: "stretch", gap: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(56,139,253,0.2)", border: `1px solid ${C.borderHi}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.blue }}>#{b.index}</div>
                  {i < BLOCKS.length - 1 && <div style={{ width: 1, flex: 1, background: "rgba(56,139,253,0.2)", marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: i < BLOCKS.length - 1 ? 4 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: C.blue }}>{b.hash}</span>
                    <span style={{ fontSize: 11, color: C.textSec }}>{b.txCount} txs</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, fontFamily: "monospace" }}>prev: {b.prev} · {b.time}</div>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Search & filter table */}
        <GlassCard>
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by TX ID or wallet…" style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px", color: C.textPri, fontSize: 14, fontFamily: "monospace", outline: "none" }} />
            {["All", "Clean", "Medium Risk", "High Risk"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? "rgba(56,139,253,0.25)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${filter === f ? C.borderHi : C.border}`,
                borderRadius: 8, padding: "9px 16px", color: filter === f ? C.blueLt : C.textSec,
                fontSize: 13, cursor: "pointer", fontWeight: filter === f ? 700 : 400
              }}>{f}</button>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["TX ID", "Wallet", "Chain", "Amount", "Risk Score", "Label", "Flag", "Time"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", color: C.textSec, fontWeight: 600, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => (
                  <tr key={tx.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                    <td style={{ padding: "10px 12px", color: C.blue, fontFamily: "monospace" }}>{tx.id}</td>
                    <td style={{ padding: "10px 12px", color: C.textSec, fontFamily: "monospace" }}>{tx.wallet}</td>
                    <td style={{ padding: "10px 12px", color: C.textPri }}>{tx.chain}</td>
                    <td style={{ padding: "10px 12px", color: C.textPri, fontWeight: 600 }}>{tx.amount}</td>
                    <td style={{ padding: "10px 12px", minWidth: 120 }}><RiskBar value={tx.risk} /></td>
                    <td style={{ padding: "10px 12px" }}><Badge label={tx.label} /></td>
                    <td style={{ padding: "10px 12px", color: tx.flag === "—" ? C.textDim : C.amber, fontSize: 12 }}>{tx.flag}</td>
                    <td style={{ padding: "10px 12px", color: C.textSec, fontFamily: "monospace" }}>{tx.time}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: "24px 12px", textAlign: "center", color: C.textSec }}>No transactions match your filter.</td></tr>}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function AnalyticsSection() {
  const barData = [
    { chain: "Ethereum", clean: 18400, medium: 1820, high: 540 },
    { chain: "Bitcoin", clean: 12100, medium: 890, high: 210 },
    { chain: "Solana", clean: 6200, medium: 520, high: 180 },
    { chain: "TRON", clean: 3100, medium: 480, high: 220 },
    { chain: "BSC", clean: 2900, medium: 310, high: 90 },
  ];
  const lineData = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    alerts: Math.floor(800 + Math.random() * 600),
    flagged: Math.floor(200 + Math.random() * 300),
  }));
  return (
    <section id="Analytics" style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionTitle label="Analytics Reports" title="Compliance Intelligence at Scale" sub="Deep-dive into detection trends, chain-level risk exposure, and regulatory audit exports." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <GlassCard>
            <h3 style={{ color: C.textPri, fontSize: 15, fontWeight: 700, margin: "0 0 20px" }}>Risk by Blockchain (Stacked)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="chain" tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPri }} />
                <Legend wrapperStyle={{ color: C.textSec, fontSize: 12 }} />
                <Bar dataKey="clean" fill={C.green} stackId="a" name="Clean" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" fill={C.amber} stackId="a" name="Medium Risk" />
                <Bar dataKey="high" fill={C.red} stackId="a" name="High Risk" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3 style={{ color: C.textPri, fontSize: 15, fontWeight: 700, margin: "0 0 20px" }}>Monthly Alert Trend (2024)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textPri }} />
                <Legend wrapperStyle={{ color: C.textSec, fontSize: 12 }} />
                <Line type="monotone" dataKey="alerts" stroke={C.blue} strokeWidth={2} dot={false} name="Total Alerts" />
                <Line type="monotone" dataKey="flagged" stroke={C.red} strokeWidth={2} dot={false} name="High Risk Flagged" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Compliance report table */}
        <GlassCard style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ color: C.textPri, fontSize: 15, fontWeight: 700, margin: 0 }}>📋 Compliance Report Summary</h3>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)", borderRadius: 7, padding: "6px 14px", color: C.green, fontSize: 13, cursor: "pointer" }}>Generate FATF Report</button>
              <button style={{ background: "rgba(56,139,253,0.15)", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 14px", color: C.blue, fontSize: 13, cursor: "pointer" }}>⬇ Export CSV</button>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Report ID", "Type", "Period", "Transactions", "Flagged", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", color: C.textSec, fontWeight: 600, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["RPT-001", "FATF STR", "May 2025", "48,291", "1,204", "Filed"],
                ["RPT-002", "FinCEN SAR", "Apr 2025", "44,103", "987", "Filed"],
                ["RPT-003", "MiCA AML", "Mar 2025", "41,890", "831", "Filed"],
                ["RPT-004", "OFAC Screening", "May 2025", "48,291", "14", "Pending"],
              ].map(([id, type, period, txs, flagged, status]) => (
                <tr key={id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                  <td style={{ padding: "10px 12px", color: C.blue, fontFamily: "monospace" }}>{id}</td>
                  <td style={{ padding: "10px 12px", color: C.textPri }}>{type}</td>
                  <td style={{ padding: "10px 12px", color: C.textSec }}>{period}</td>
                  <td style={{ padding: "10px 12px", color: C.textPri, fontFamily: "monospace" }}>{txs}</td>
                  <td style={{ padding: "10px 12px", color: C.amber, fontFamily: "monospace" }}>{flagged}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ background: status === "Filed" ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.12)", border: `1px solid ${status === "Filed" ? "rgba(52,211,153,0.4)" : "rgba(251,191,36,0.4)"}`, color: status === "Filed" ? C.green : C.amber, borderRadius: 4, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", org: "", message: "" });
  const [sent, setSent] = useState(false);
  const send = () => { if (form.name && form.email) { setSent(true); } };
  return (
    <section id="Contact" style={{ padding: "100px 24px", background: "rgba(10,18,40,0.5)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <SectionTitle label="Contact" title="Talk to Our Compliance Experts" sub="Deploy VTAC for your institution — our team will guide you through onboarding and regulatory configuration." />
        {sent ? (
          <GlassCard style={{ textAlign: "center", padding: "48px 32px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h3 style={{ color: C.textPri, fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>Message Received</h3>
            <p style={{ color: C.textSec, fontSize: 15, lineHeight: 1.6 }}>Our compliance team will respond within 24 hours. You'll receive a confirmation email shortly.</p>
          </GlassCard>
        ) : (
          <GlassCard>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["name", "Full Name"], ["email", "Work Email"], ["org", "Organisation"]].map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
                  <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.textPri, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, display: "block", marginBottom: 6 }}>Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.textPri, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <button onClick={send} style={{ background: "linear-gradient(135deg,#388bfd,#7c3aed)", border: "none", borderRadius: 8, padding: "13px", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", marginTop: 4 }}>Send Message →</button>
            </div>
          </GlassCard>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 32 }}>
          {[["📧", "compliance@vtac.io"], ["🔒", "SOC 2 Type II"], ["🌍", "Global Coverage"]].map(([ic, txt]) => (
            <div key={txt} style={{ textAlign: "center", padding: "16px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10 }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontSize: 12, color: C.textSec }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────
export default function VTACPlatform() {
  const [active, setActive] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sections = { Home: HeroSection, Features: FeaturesSection, About: AboutSection, Dashboard: DashboardSection, Monitor: MonitorSection, Analytics: AnalyticsSection, Contact: ContactSection };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.textPri, fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>
      {/* Sticky nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(5,11,24,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all 0.3s ease"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setActive("Home")}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#388bfd,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔗</div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em", background: "linear-gradient(90deg,#58a6ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VTAC</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {NAV_ITEMS.map(n => (
              <button key={n} onClick={() => setActive(n)} style={{
                background: active === n ? "rgba(56,139,253,0.2)" : "transparent",
                border: active === n ? `1px solid ${C.borderHi}` : "1px solid transparent",
                borderRadius: 8, padding: "6px 14px", color: active === n ? C.blueLt : C.textSec,
                fontSize: 13, fontWeight: active === n ? 700 : 400, cursor: "pointer", transition: "all 0.15s"
              }}>{n}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ paddingTop: active === "Home" ? 0 : 64 }}>
        {active === "Home" && (
          <>
            <HeroSection onNav={setActive} />
            <FeaturesSection />
            <AboutSection />
          </>
        )}
        {active === "Features" && <FeaturesSection />}
        {active === "About" && <AboutSection />}
        {active === "Dashboard" && <DashboardSection />}
        {active === "Monitor" && <MonitorSection />}
        {active === "Analytics" && <AnalyticsSection />}
        {active === "Contact" && <ContactSection />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 24px", background: "rgba(5,11,24,0.98)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.textPri, marginBottom: 4 }}>VTAC</div>
            <div style={{ fontSize: 13, color: C.textSec }}>Value-driven Transactional Tracking Analytics for Crypto-compliance</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>© 2025 VTAC Systems. All rights reserved.</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service", "FATF Compliance", "API Docs"].map(l => (
              <span key={l} style={{ fontSize: 13, color: C.textSec, cursor: "pointer" }}>{l}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["SOC 2", "ISO 27001", "GDPR", "MiCA"].map(b => (
              <span key={b} style={{ background: "rgba(56,139,253,0.1)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.textSec, fontWeight: 600 }}>{b}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
