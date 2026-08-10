"use client";

import { useState } from "react";

const sections = [
  ["overview", "Overview"],
  ["workflow", "Analysis Workflow"],
  ["findings", "Security Findings"],
  ["severity", "Severity Model"],
  ["cwe", "CWE & OWASP"],
  ["javascript", "JavaScript Security"],
  ["typescript", "TypeScript Security"],
  ["python", "Python Security"],
  ["sql", "SQL Injection"],
  ["ssrf", "SSRF"],
  ["dynamic", "Dynamic Execution"],
  ["assistant", "Sentinel Assistant"],
  ["api", "API Reference"],
  ["best-practices", "Best Practices"],
];

const findings = [
  {
    id: "S001",
    title: "Dynamic code execution",
    severity: "Critical",
    cwe: "CWE-95",
    owasp: "A03:2021 Injection",
    description:
      "Detects dangerous execution of strings or attacker-controlled values as executable code.",
    example: "eval(userInput)",
    fix: "Replace dynamic execution with explicit functions, validated data, or a fixed command map.",
  },
  {
    id: "S003",
    title: "SQL injection risk",
    severity: "High",
    cwe: "CWE-89",
    owasp: "A03:2021 Injection",
    description:
      "Detects SQL construction where untrusted values may be concatenated or interpolated into a query.",
    example: "\"SELECT * FROM users WHERE id = '\" + id + \"'\"",
    fix: "Use parameterized queries, prepared statements, or a trusted ORM query API.",
  },
  {
    id: "S007",
    title: "Potential SSRF",
    severity: "High",
    cwe: "CWE-918",
    owasp: "A10:2021 SSRF",
    description:
      "Detects server-side requests where the destination may be influenced by external input.",
    example: "fetch(req.query.url)",
    fix: "Allowlist destinations, validate URLs, block internal networks, and restrict protocols.",
  },
];

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`reveal ${className}`}>{children}</div>;
}

function Fold({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`fold ${open ? "fold-open" : ""}`}>
      <button onClick={() => setOpen(!open)} className="fold-trigger">
        <span>{title}</span>
        <span className="fold-icon">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="fold-content">{children}</div>}
    </div>
  );
}

export default function DocsPage() {
  const [active, setActive] = useState("overview");

  return (
    <main className="docs-shell">
      <style jsx global>{`
        :root {
          --bg: #05070b;
          --panel: rgba(13, 17, 25, 0.72);
          --panel-strong: rgba(17, 22, 32, 0.92);
          --line: rgba(255,255,255,.09);
          --muted: #8f9aaa;
          --text: #edf2f7;
          --accent: #72f6b1;
          --accent2: #70a7ff;
          --danger: #ff667a;
          --warning: #ffbf69;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background:
            radial-gradient(circle at 15% 10%, rgba(74, 222, 128, .10), transparent 28%),
            radial-gradient(circle at 85% 15%, rgba(96, 165, 250, .10), transparent 30%),
            #05070b;
        }

        .docs-shell {
          min-height: 100vh;
          color: var(--text);
          background:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 48px 48px;
          position: relative;
          overflow: hidden;
        }

        .docs-shell:before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,.45));
          z-index: 0;
        }

        .docs-nav {
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(22px);
          background: rgba(5,7,11,.78);
          border-bottom: 1px solid var(--line);
        }

        .docs-nav-inner {
          max-width: 1400px;
          margin: auto;
          padding: 14px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          font-weight: 800;
          letter-spacing: -.03em;
        }

        .brand-mark {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(114,246,177,.35);
          border-radius: 10px;
          display: grid;
          place-items: center;
          color: var(--accent);
          background: rgba(114,246,177,.07);
          box-shadow: 0 0 30px rgba(114,246,177,.12);
        }

        .brand small {
          color: var(--muted);
          font-weight: 600;
          margin-left: 4px;
        }

        .hero {
          max-width: 1400px;
          margin: auto;
          padding: 100px 24px 80px;
          position: relative;
          z-index: 1;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border: 1px solid rgba(114,246,177,.22);
          border-radius: 999px;
          background: rgba(114,246,177,.05);
          color: var(--accent);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .pulse {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: var(--accent);
          box-shadow: 0 0 14px var(--accent);
          animation: pulse 1.8s infinite;
        }

        h1 {
          font-size: clamp(48px, 8vw, 104px);
          line-height: .91;
          letter-spacing: -.075em;
          max-width: 1000px;
          margin: 28px 0;
        }

        .gradient-text {
          background: linear-gradient(100deg, #fff 15%, #72f6b1 55%, #70a7ff 100%);
          -webkit-background-clip: text;
          color: transparent;
        }

        .hero-copy {
          max-width: 760px;
          color: #aab4c2;
          font-size: 19px;
          line-height: 1.8;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.5fr .8fr;
          gap: 20px;
          margin-top: 52px;
        }

        .glass {
          background: linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.018));
          border: 1px solid var(--line);
          border-radius: 24px;
          box-shadow: 0 30px 100px rgba(0,0,0,.28);
          backdrop-filter: blur(20px);
        }

        .terminal {
          padding: 22px;
          min-height: 260px;
        }

        .terminal-bar {
          display: flex;
          gap: 7px;
          margin-bottom: 22px;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #657080;
        }

        .terminal pre {
          white-space: pre-wrap;
          color: #b7c4d3;
          font-size: 13px;
          line-height: 1.8;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .green {
          color: var(--accent);
        }

        .blue {
          color: var(--accent2);
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .stat {
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 125px;
        }

        .stat strong {
          font-size: 32px;
          letter-spacing: -.05em;
        }

        .stat span {
          color: var(--muted);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .layout {
          max-width: 1400px;
          margin: auto;
          padding: 0 24px 120px;
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 45px;
          position: relative;
          z-index: 1;
        }

        .sidebar {
          position: sticky;
          top: 90px;
          align-self: start;
          max-height: calc(100vh - 110px);
          overflow-y: auto;
          padding-right: 8px;
        }

        .sidebar-title {
          color: #657080;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .14em;
          margin: 0 0 12px;
        }

        .sidebar button {
          display: block;
          width: 100%;
          text-align: left;
          border: 0;
          background: transparent;
          color: #7f8b9a;
          padding: 9px 11px;
          border-radius: 10px;
          cursor: pointer;
          transition: .2s;
        }

        .sidebar button:hover,
        .sidebar button.active {
          color: var(--accent);
          background: rgba(114,246,177,.07);
        }

        .content {
          min-width: 0;
        }

        .section {
          scroll-margin-top: 110px;
          margin-bottom: 95px;
        }

        .section-label {
          color: var(--accent);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .16em;
          font-weight: 800;
          margin-bottom: 10px;
        }

        h2 {
          font-size: clamp(30px, 4vw, 52px);
          letter-spacing: -.055em;
          margin: 0 0 18px;
        }

        h3 {
          font-size: 21px;
          margin: 0 0 10px;
        }

        .lead {
          color: #9da8b7;
          line-height: 1.8;
          max-width: 850px;
          font-size: 17px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 30px;
        }

        .card {
          padding: 25px;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: rgba(255,255,255,.025);
          transition: transform .35s, border-color .35s, background .35s;
        }

        .card:hover {
          transform: translateY(-6px);
          border-color: rgba(114,246,177,.24);
          background: rgba(114,246,177,.035);
        }

        .card p {
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 0;
        }

        .finding {
          margin-top: 15px;
          padding: 24px;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: rgba(255,255,255,.025);
        }

        .finding-top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: start;
        }

        .finding-id {
          color: #6f7a89;
          font-family: monospace;
          font-size: 12px;
        }

        .badge {
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .critical {
          color: #ff8c9b;
          background: rgba(255,102,122,.1);
        }

        .high {
          color: #ffd18d;
          background: rgba(255,191,105,.1);
        }

        .finding p {
          color: var(--muted);
          line-height: 1.7;
        }

        code,
        pre {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .code {
          margin-top: 14px;
          padding: 17px;
          border-radius: 14px;
          background: #020409;
          border: 1px solid rgba(255,255,255,.06);
          overflow-x: auto;
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.7;
        }

        .fold {
          border: 1px solid var(--line);
          border-radius: 18px;
          margin-top: 12px;
          overflow: hidden;
          background: rgba(255,255,255,.02);
        }

        .fold-trigger {
          width: 100%;
          border: 0;
          background: transparent;
          color: var(--text);
          padding: 20px 22px;
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: 750;
          cursor: pointer;
          text-align: left;
        }

        .fold-trigger:hover {
          background: rgba(255,255,255,.025);
        }

        .fold-icon {
          color: var(--accent);
          font-size: 22px;
        }

        .fold-content {
          padding: 0 22px 23px;
          color: var(--muted);
          line-height: 1.8;
        }

        .api-row {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 15px;
          padding: 18px 0;
          border-bottom: 1px solid var(--line);
        }

        .method {
          color: var(--accent);
          font-family: monospace;
          font-weight: 800;
        }

        .callout {
          padding: 24px;
          border: 1px solid rgba(112,167,255,.2);
          border-radius: 20px;
          background: rgba(112,167,255,.05);
          margin-top: 25px;
        }

        .footer {
          max-width: 1400px;
          margin: auto;
          padding: 60px 24px;
          border-top: 1px solid var(--line);
          color: #657080;
          position: relative;
          z-index: 1;
        }

        .reveal {
          animation: reveal .8s both;
          animation-timeline: view();
          animation-range: entry 0% cover 25%;
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(35px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%,100% { opacity: .45; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @media (max-width: 950px) {
          .hero-grid,
          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: relative;
            top: auto;
            max-height: none;
            display: flex;
            gap: 5px;
            overflow-x: auto;
            padding-bottom: 10px;
          }

          .sidebar-title {
            display: none;
          }

          .sidebar button {
            min-width: max-content;
          }

          .cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <nav className="docs-nav">
        <div className="docs-nav-inner">
          <div className="brand">
            <div className="brand-mark">S</div>
            SAIFRVW <small>SENTINEL</small>
          </div>
          <div style={{ color: "#758092", fontSize: 12 }}>
            Developer Security Reference · v5.2
          </div>
        </div>
      </nav>

      <section className="hero">
        <Reveal>
          <div className="eyebrow">
            <span className="pulse" />
            Complete security reference
          </div>

          <h1>
            Build software with
            <br />
            <span className="gradient-text">security in the loop.</span>
          </h1>

          <p className="hero-copy">
            SAIFRVW Sentinel is a developer-first static security analysis
            toolkit designed to turn suspicious source-code patterns into
            understandable findings, actionable remediation guidance, and
            security-aware development decisions.
          </p>

          <div className="hero-grid">
            <div className="glass terminal">
              <div className="terminal-bar">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <pre>
<span className="green">$ saifrvw scan ./src</span>

Scanning source tree...
Parsing JavaScript / TypeScript...
Running security rules...

<span className="green">✓ S001</span> Dynamic code execution     CRITICAL
<span className="green">✓ S003</span> SQL injection risk            HIGH
<span className="green">✓ S007</span> Potential SSRF                HIGH

<span className="blue">Sentinel Assistant:</span>
Context locked to selected finding.
Generate remediation guidance.
              </pre>
            </div>

            <div className="stat-grid">
              <div className="glass stat">
                <span>Analysis</span>
                <strong>Static</strong>
              </div>
              <div className="glass stat">
                <span>Context</span>
                <strong>Focused</strong>
              </div>
              <div className="glass stat">
                <span>Mappings</span>
                <strong>CWE</strong>
              </div>
              <div className="glass stat">
                <span>Framework</span>
                <strong>OWASP</strong>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-title">Reference</div>
          {sections.map(([id, title]) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => {
                setActive(id);
                document.getElementById(id)?.scrollIntoView();
              }}
            >
              {title}
            </button>
          ))}
        </aside>

        <article className="content">
          <Reveal>
            <section id="overview" className="section">
              <div className="section-label">01 · Foundation</div>
              <h2>What Sentinel actually does</h2>
              <p className="lead">
                Sentinel analyzes source code as data. It identifies
                recognizable security-sensitive patterns, associates them with
                findings, estimates severity and confidence, and presents the
                developer with evidence and remediation guidance.
              </p>

              <div className="cards">
                <div className="card">
                  <h3>Detect</h3>
                  <p>
                    Identify suspicious patterns such as dynamic execution,
                    unsafe SQL construction, and externally controlled network
                    destinations.
                  </p>
                </div>
                <div className="card">
                  <h3>Explain</h3>
                  <p>
                    Convert a technical finding into a concise explanation of
                    what the pattern means and why it matters.
                  </p>
                </div>
                <div className="card">
                  <h3>Remediate</h3>
                  <p>
                    Give developers practical replacement strategies rather
                    than simply reporting that a pattern is dangerous.
                  </p>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="workflow" className="section">
              <div className="section-label">02 · Pipeline</div>
              <h2>Analysis workflow</h2>
              <p className="lead">
                A useful security analyzer needs more than a list of regular
                expression matches. The workflow should preserve evidence,
                context, and the relationship between the finding and the
                developer question.
              </p>

              <div className="cards">
                <div className="card">
                  <h3>01 · Ingest</h3>
                  <p>Receive source code and identify the requested language.</p>
                </div>
                <div className="card">
                  <h3>02 · Inspect</h3>
                  <p>Search for security-sensitive constructs and data-flow clues.</p>
                </div>
                <div className="card">
                  <h3>03 · Classify</h3>
                  <p>Map evidence to a stable finding identity and severity.</p>
                </div>
                <div className="card">
                  <h3>04 · Context</h3>
                  <p>Preserve the selected finding when asking the assistant for help.</p>
                </div>
                <div className="card">
                  <h3>05 · Explain</h3>
                  <p>Describe impact, evidence, attacker relevance, and remediation.</p>
                </div>
                <div className="card">
                  <h3>06 · Verify</h3>
                  <p>Rescan after remediation and confirm the finding is resolved.</p>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="findings" className="section">
              <div className="section-label">03 · Rules</div>
              <h2>Security findings</h2>
              <p className="lead">
                Findings are the primary security objects exposed to developers.
                Each finding should answer four questions: what was detected,
                why it matters, where it occurs, and what to do next.
              </p>

              {findings.map((finding) => (
                <div className="finding" key={finding.id}>
                  <div className="finding-top">
                    <div>
                      <div className="finding-id">{finding.id}</div>
                      <h3>{finding.title}</h3>
                    </div>
                    <span className={`badge ${finding.severity.toLowerCase()}`}>
                      {finding.severity}
                    </span>
                  </div>

                  <p>{finding.description}</p>

                  <div className="code">{finding.example}</div>

                  <p>
                    <strong style={{ color: "#edf2f7" }}>CWE:</strong>{" "}
                    {finding.cwe} &nbsp; · &nbsp;
                    <strong style={{ color: "#edf2f7" }}>OWASP:</strong>{" "}
                    {finding.owasp}
                  </p>

                  <p>
                    <strong style={{ color: "#72f6b1" }}>Recommended:</strong>{" "}
                    {finding.fix}
                  </p>
                </div>
              ))}
            </section>
          </Reveal>

          <Reveal>
            <section id="severity" className="section">
              <div className="section-label">04 · Risk</div>
              <h2>Severity is not the whole story</h2>

              <div className="cards">
                <div className="card">
                  <h3>Critical</h3>
                  <p>
                    A vulnerability with potentially severe consequences and a
                    realistic path to meaningful compromise.
                  </p>
                </div>
                <div className="card">
                  <h3>High</h3>
                  <p>
                    A significant security weakness that may expose sensitive
                    data, functionality, or infrastructure.
                  </p>
                </div>
                <div className="card">
                  <h3>Medium</h3>
                  <p>
                    A weakness whose impact depends substantially on deployment
                    context or additional conditions.
                  </p>
                </div>
              </div>

              <div className="callout">
                <strong>Severity ≠ certainty.</strong>
                <br />
                A high-severity pattern can still require developer validation.
                Sentinel should communicate evidence and confidence separately
                so developers understand what the analyzer knows and what still
                needs investigation.
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="cwe" className="section">
              <div className="section-label">05 · Standards</div>
              <h2>CWE & OWASP mapping</h2>

              <Fold title="CWE — Common Weakness Enumeration" defaultOpen>
                <p>
                  CWE provides a standardized vocabulary for describing
                  weaknesses in software and hardware. Mapping findings to CWE
                  gives security teams a common identifier that can be used in
                  reports, remediation workflows, and engineering discussions.
                </p>
              </Fold>

              <Fold title="OWASP Top 10">
                <p>
                  OWASP categories provide a high-level application-security
                  taxonomy. Sentinel can use OWASP mappings as context rather
                  than treating them as a replacement for technical evidence.
                </p>
              </Fold>

              <Fold title="Why both matter">
                <p>
                  CWE is useful for precise weakness identification. OWASP is
                  useful for communicating broader application-security risk.
                  Showing both helps developers connect a concrete source-code
                  pattern with a larger security model.
                </p>
              </Fold>
            </section>
          </Reveal>

          <Reveal>
            <section id="javascript" className="section">
              <div className="section-label">06 · Language</div>
              <h2>JavaScript security</h2>

              <Fold title="Avoid eval() and Function()">
                <p>
                  String-based execution turns data into executable program
                  logic. Prefer explicit functions, structured parsers, fixed
                  command maps, or validated input.
                </p>
                <div className="code">
{`// Risky
eval(userInput);

// Prefer
const actions = {
  build: buildProject,
  test: runTests,
};

actions[input] && actions[input]();`}
                </div>
              </Fold>

              <Fold title="Validate external destinations">
                <p>
                  Server-side fetch operations should not blindly trust a URL
                  supplied by a request. Validate scheme, hostname, destination
                  policy, redirects, and private-network access.
                </p>
              </Fold>

              <Fold title="Keep secrets out of source">
                <p>
                  Passwords, API keys, tokens, and connection strings should be
                  handled through secure configuration and secret-management
                  mechanisms rather than source-code literals or logs.
                </p>
              </Fold>
            </section>
          </Reveal>

          <Reveal>
            <section id="typescript" className="section">
              <div className="section-label">07 · Language</div>
              <h2>TypeScript security</h2>

              <p className="lead">
                TypeScript improves developer ergonomics and type safety, but
                runtime input is still untrusted. Types disappear at runtime,
                so validation remains necessary at trust boundaries.
              </p>

              <div className="cards">
                <div className="card">
                  <h3>Runtime validation</h3>
                  <p>
                    Validate request bodies, query parameters, headers, and
                    external API responses.
                  </p>
                </div>
                <div className="card">
                  <h3>Safe narrowing</h3>
                  <p>
                    Do not treat unknown external data as trusted simply because
                    a TypeScript interface describes it.
                  </p>
                </div>
                <div className="card">
                  <h3>Dependency hygiene</h3>
                  <p>
                    Keep dependencies updated and minimize unnecessary package
                    surface area.
                  </p>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="python" className="section">
              <div className="section-label">08 · Language</div>
              <h2>Python security</h2>

              <Fold title="Avoid unsafe deserialization">
                <p>
                  Do not deserialize attacker-controlled data using mechanisms
                  capable of reconstructing arbitrary Python objects.
                </p>
              </Fold>

              <Fold title="Command execution">
                <p>
                  Avoid passing untrusted strings directly into shell execution.
                  Prefer structured subprocess arguments and strict validation.
                </p>
              </Fold>

              <Fold title="Template and expression injection">
                <p>
                  Treat user-controlled template expressions as data unless the
                  template engine explicitly provides a safe sandbox model.
                </p>
              </Fold>
            </section>
          </Reveal>

          <Reveal>
            <section id="sql" className="section">
              <div className="section-label">09 · Injection</div>
              <h2>SQL injection</h2>

              <p className="lead">
                SQL injection occurs when data crosses into a SQL interpreter as
                executable query syntax. The safest default is to keep the
                query structure separate from user-controlled values.
              </p>

              <div className="code">
{`// Unsafe
const query =
  "SELECT * FROM users WHERE username = '" +
  username + "'";

// Safer
const query =
  "SELECT * FROM users WHERE username = ?";

db.execute(query, [username]);`}
              </div>

              <div className="callout">
                Prefer parameterized queries or trusted ORM APIs. Escaping
                strings manually is generally harder to reason about and easier
                to get wrong.
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="ssrf" className="section">
              <div className="section-label">10 · Network</div>
              <h2>Server-side request forgery</h2>

              <p className="lead">
                SSRF becomes possible when a server makes a network request to a
                destination controlled by an attacker. The security boundary is
                the server's network position and privileges.
              </p>

              <div className="cards">
                <div className="card">
                  <h3>Allowlist</h3>
                  <p>Prefer known destinations over unrestricted URLs.</p>
                </div>
                <div className="card">
                  <h3>Network controls</h3>
                  <p>Block access to internal and metadata-service networks.</p>
                </div>
                <div className="card">
                  <h3>Redirect policy</h3>
                  <p>Validate the final destination, not only the initial URL.</p>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="dynamic" className="section">
              <div className="section-label">11 · Execution</div>
              <h2>Dynamic code execution</h2>

              <p className="lead">
                Dynamic execution is especially dangerous because it can turn
                attacker-controlled text into instructions executed with the
                privileges of the application.
              </p>

              <div className="code">
{`// Vulnerable
function run(input) {
  eval(input);
}

// Safer architecture
function run(action) {
  const commands = {
    build: build,
    test: test,
    lint: lint,
  };

  if (!(action in commands)) {
    throw new Error("Unsupported action");
  }

  return commands[action]();
}`}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="assistant" className="section">
              <div className="section-label">12 · AI</div>
              <h2>Sentinel Assistant</h2>

              <p className="lead">
                The assistant is designed around the selected finding. This is
                important because a source file can contain several unrelated
                security signals.
              </p>

              <Fold title="Selected-finding context">
                <p>
                  When a developer selects S001, the assistant should primarily
                  reason about S001. It should not turn unrelated SQL or SSRF
                  patterns into part of the answer unless the developer asks
                  for broader analysis.
                </p>
              </Fold>

              <Fold title="Explain">
                <p>
                  Explain what the finding means, why it matters, where the
                  evidence occurs, and what security boundary is involved.
                </p>
              </Fold>

              <Fold title="Fix">
                <p>
                  Provide a safe remediation strategy and, where appropriate,
                  a small representative replacement pattern.
                </p>
              </Fold>

              <Fold title="Attack scenario">
                <p>
                  Explain the conceptual abuse path without turning the
                  assistant into an exploitation tool. The goal is developer
                  understanding and remediation.
                </p>
              </Fold>
            </section>
          </Reveal>

          <Reveal>
            <section id="api" className="section">
              <div className="section-label">13 · Integration</div>
              <h2>API reference</h2>

              <div className="glass" style={{ padding: "10px 22px" }}>
                <div className="api-row">
                  <div className="method">POST</div>
                  <div>
                    <strong>/api/analyze</strong>
                    <p className="lead">
                      Analyze source code and return security findings.
                    </p>
                  </div>
                </div>

                <div className="api-row">
                  <div className="method">POST</div>
                  <div>
                    <strong>/api/ai</strong>
                    <p className="lead">
                      Generate contextual guidance for a developer question
                      and selected finding.
                    </p>
                  </div>
                </div>

                <div className="api-row">
                  <div className="method">POST</div>
                  <div>
                    <strong>/api/report</strong>
                    <p className="lead">
                      Produce report-oriented security output from analysis
                      results.
                    </p>
                  </div>
                </div>
              </div>

              <div className="code">
{`{
  "message": "Explain this vulnerability",
  "code": "function run(input) { eval(input); }",
  "language": "javascript",
  "selectedFinding": {
    "id": "S001",
    "title": "Dynamic code execution",
    "severity": "critical"
  }
}`}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="best-practices" className="section">
              <div className="section-label">14 · Engineering</div>
              <h2>Developer security checklist</h2>

              <Fold title="Input">
                <p>
                  Treat request data, uploaded files, environment-derived
                  values, and third-party responses as untrusted until validated.
                </p>
              </Fold>

              <Fold title="Output">
                <p>
                  Encode output for its destination. Avoid mixing data with
                  executable syntax.
                </p>
              </Fold>

              <Fold title="Secrets">
                <p>
                  Never commit credentials. Avoid logging passwords and tokens.
                  Rotate secrets when exposure is suspected.
                </p>
              </Fold>

              <Fold title="Dependencies">
                <p>
                  Track dependency versions, remove unused packages, and review
                  security advisories regularly.
                </p>
              </Fold>

              <Fold title="Verification">
                <p>
                  Security fixes should be followed by rescanning, tests, and
                  review of adjacent behavior. A disappearing finding is not
                  enough if functionality was accidentally broken.
                </p>
              </Fold>
            </section>
          </Reveal>
        </article>
      </div>

      <footer className="footer">
        <strong style={{ color: "#edf2f7" }}>SAIFRVW SENTINEL</strong>
        <br />
        Developer-first source-code security analysis.
        <br />
        <span>Security reference · Finding context · CWE · OWASP · Remediation</span>
      </footer>
    </main>
  );
}
