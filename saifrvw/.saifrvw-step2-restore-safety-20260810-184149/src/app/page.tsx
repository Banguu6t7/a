"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="saif-home">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .saif-home {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 20% 0%, rgba(114,246,177,.12), transparent 28%),
            radial-gradient(circle at 80% 5%, rgba(112,167,255,.13), transparent 30%),
            #05070b;
          color: #edf2f7;
        }

        .home-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(255,255,255,.08);
          background: rgba(5,7,11,.7);
          backdrop-filter: blur(22px);
        }

        .home-nav-inner {
          max-width: 1280px;
          margin: auto;
          padding: 15px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .home-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 900;
          letter-spacing: -.04em;
        }

        .home-mark {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #72f6b1;
          border: 1px solid rgba(114,246,177,.3);
          background: rgba(114,246,177,.07);
          box-shadow: 0 0 35px rgba(114,246,177,.13);
        }

        .home-links {
          display: flex;
          gap: 8px;
        }

        .home-links a {
          color: #8792a2;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 9px;
          transition: .2s;
        }

        .home-links a:hover {
          color: #72f6b1;
          background: rgba(114,246,177,.06);
        }

        .home-hero {
          max-width: 1280px;
          margin: auto;
          padding: 120px 24px 100px;
          text-align: center;
          position: relative;
        }

        .home-hero:before {
          content: "";
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: rgba(114,246,177,.07);
          filter: blur(100px);
          left: 50%;
          top: 20px;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .home-kicker {
          display: inline-block;
          color: #72f6b1;
          border: 1px solid rgba(114,246,177,.2);
          background: rgba(114,246,177,.05);
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .home-hero h1 {
          position: relative;
          font-size: clamp(55px, 9vw, 116px);
          line-height: .88;
          letter-spacing: -.085em;
          margin: 28px auto;
          max-width: 1050px;
        }

        .home-gradient {
          background: linear-gradient(105deg, #fff, #72f6b1 52%, #70a7ff);
          -webkit-background-clip: text;
          color: transparent;
        }

        .home-copy {
          max-width: 760px;
          margin: auto;
          color: #9ca7b6;
          line-height: 1.8;
          font-size: 18px;
          position: relative;
        }

        .home-actions {
          margin-top: 34px;
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          position: relative;
        }

        .btn {
          text-decoration: none;
          padding: 13px 18px;
          border-radius: 12px;
          font-weight: 850;
          transition: transform .25s, box-shadow .25s;
        }

        .btn:hover {
          transform: translateY(-3px);
        }

        .btn-primary {
          color: #03120b;
          background: #72f6b1;
          box-shadow: 0 15px 50px rgba(114,246,177,.17);
        }

        .btn-secondary {
          color: #edf2f7;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.035);
        }

        .dashboard {
          max-width: 1120px;
          margin: 65px auto 0;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 26px;
          background: rgba(11,15,22,.75);
          box-shadow: 0 40px 120px rgba(0,0,0,.4);
          backdrop-filter: blur(22px);
          overflow: hidden;
          text-align: left;
          animation: float 7s ease-in-out infinite;
        }

        .dash-top {
          padding: 13px 16px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          display: flex;
          gap: 7px;
        }

        .dash-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #5e6878;
        }

        .dash-body {
          display: grid;
          grid-template-columns: 190px 1fr;
          min-height: 390px;
        }

        .dash-side {
          border-right: 1px solid rgba(255,255,255,.07);
          padding: 20px;
        }

        .dash-side div {
          color: #6f7b8b;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 4px;
          font-size: 12px;
        }

        .dash-side .selected {
          color: #72f6b1;
          background: rgba(114,246,177,.07);
        }

        .dash-main {
          padding: 28px;
        }

        .risk {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 25px;
          align-items: center;
        }

        .risk-score {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,102,122,.3);
          background: radial-gradient(circle, rgba(255,102,122,.12), transparent 65%);
          color: #ff8495;
          font-size: 32px;
          font-weight: 900;
        }

        .mini-findings {
          margin-top: 30px;
          display: grid;
          gap: 10px;
        }

        .mini {
          border: 1px solid rgba(255,255,255,.07);
          padding: 15px;
          border-radius: 12px;
          background: rgba(255,255,255,.025);
          display: flex;
          justify-content: space-between;
        }

        .mini span {
          color: #9ba6b5;
          font-size: 13px;
        }

        .mini b {
          color: #ff8495;
          font-size: 11px;
        }

        .features {
          max-width: 1280px;
          margin: auto;
          padding: 90px 24px;
        }

        .section-heading {
          max-width: 700px;
          margin-bottom: 40px;
        }

        .section-heading small {
          color: #72f6b1;
          text-transform: uppercase;
          letter-spacing: .15em;
          font-size: 10px;
          font-weight: 900;
        }

        .section-heading h2 {
          font-size: clamp(36px, 5vw, 64px);
          letter-spacing: -.065em;
          margin: 10px 0;
        }

        .section-heading p {
          color: #8994a4;
          line-height: 1.8;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .feature {
          min-height: 230px;
          padding: 26px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 22px;
          background: rgba(255,255,255,.025);
          transition: .35s;
          animation: reveal 1s both;
          animation-timeline: view();
          animation-range: entry 0% cover 25%;
        }

        .feature:hover {
          transform: translateY(-8px);
          border-color: rgba(114,246,177,.23);
          background: rgba(114,246,177,.035);
        }

        .feature-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: rgba(114,246,177,.08);
          color: #72f6b1;
          margin-bottom: 28px;
        }

        .feature h3 {
          margin: 0 0 10px;
        }

        .feature p {
          color: #7f8b9a;
          line-height: 1.7;
          font-size: 14px;
        }

        .cta {
          max-width: 1000px;
          margin: 70px auto 100px;
          padding: 70px 30px;
          text-align: center;
          border: 1px solid rgba(114,246,177,.16);
          border-radius: 30px;
          background:
            radial-gradient(circle at 50% 0%, rgba(114,246,177,.10), transparent 55%),
            rgba(255,255,255,.025);
        }

        .cta h2 {
          font-size: clamp(36px, 6vw, 70px);
          letter-spacing: -.07em;
          margin: 0 0 15px;
        }

        .cta p {
          color: #8994a4;
          max-width: 620px;
          margin: auto auto 28px;
          line-height: 1.8;
        }

        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media(max-width: 800px) {
          .home-links {
            display: none;
          }

          .dash-body {
            grid-template-columns: 1fr;
          }

          .dash-side {
            display: none;
          }

          .risk {
            grid-template-columns: 1fr;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <nav className="home-nav">
        <div className="home-nav-inner">
          <div className="home-brand">
            <div className="home-mark">S</div>
            SAIFRVW
          </div>

          <div className="home-links">
            <Link href="/review">Analyzer</Link>
            <Link href="/docs">Documentation</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
        </div>
      </nav>

      <section className="home-hero">
        <span className="home-kicker">Sentinel v5.2 · Developer Security Toolkit</span>

        <h1>
          Security analysis
          <br />
          <span className="home-gradient">without the noise.</span>
        </h1>

        <p className="home-copy">
          Find dangerous source-code patterns, understand the actual security
          risk, select the finding that matters, and get focused remediation
          guidance from Sentinel Assistant.
        </p>

        <div className="home-actions">
          <Link className="btn btn-primary" href="/review">
            Run Deep Scan →
          </Link>
          <Link className="btn btn-secondary" href="/docs">
            Read the Security Reference
          </Link>
        </div>

        <div className="dashboard">
          <div className="dash-top">
            <span className="dash-dot" />
            <span className="dash-dot" />
            <span className="dash-dot" />
          </div>

          <div className="dash-body">
            <aside className="dash-side">
              <div className="selected">Overview</div>
              <div>Findings</div>
              <div>Assistant</div>
              <div>Reports</div>
              <div>Documentation</div>
            </aside>

            <div className="dash-main">
              <div className="risk">
                <div className="risk-score">100</div>
                <div>
                  <div style={{ color: "#758092", fontSize: 11 }}>
                    CURRENT RISK SCORE
                  </div>
                  <h2 style={{ margin: "5px 0", fontSize: 30 }}>
                    Security review required
                  </h2>
                  <p style={{ color: "#7f8b9a", lineHeight: 1.7 }}>
                    Sentinel detected security-sensitive source patterns and
                    organized them into actionable findings.
                  </p>
                </div>
              </div>

              <div className="mini-findings">
                <div className="mini">
                  <span>S001 · Dynamic code execution</span>
                  <b>CRITICAL</b>
                </div>
                <div className="mini">
                  <span>S003 · SQL injection risk</span>
                  <b>HIGH</b>
                </div>
                <div className="mini">
                  <span>S007 · Potential SSRF</span>
                  <b>HIGH</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <small>Security workflow</small>
          <h2>From suspicious code to an actionable decision.</h2>
          <p>
            SAIFRVW is designed around the developer workflow: detect the
            pattern, understand the evidence, investigate the selected finding,
            fix it, and verify the result.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature">
            <div className="feature-icon">01</div>
            <h3>Deep static analysis</h3>
            <p>
              Inspect source code for security-sensitive constructs across
              supported languages without executing the submitted program.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">02</div>
            <h3>Finding intelligence</h3>
            <p>
              Give each finding a stable identity, severity, confidence,
              evidence, CWE relationship, and OWASP context.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">03</div>
            <h3>Focused AI context</h3>
            <p>
              Select a finding and ask Sentinel about that finding instead of
              receiving a noisy summary of unrelated source-code signals.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">04</div>
            <h3>Developer remediation</h3>
            <p>
              Move from “this is dangerous” to concrete engineering strategies
              for replacing unsafe behavior.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">05</div>
            <h3>Security standards</h3>
            <p>
              Connect technical findings to CWE and OWASP concepts so individual
              code issues make sense in a larger security model.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">06</div>
            <h3>Verify the fix</h3>
            <p>
              Rescan after remediation and confirm that the original security
              finding is actually resolved.
            </p>
          </div>
        </div>

        <div className="cta">
          <h2>Read the full reference.</h2>
          <p>
            Explore Sentinel&apos;s analysis model, finding taxonomy, severity
            philosophy, injection guidance, SSRF defenses, dynamic execution
            risks, API behavior, and developer security checklist.
          </p>
          <Link className="btn btn-primary" href="/docs">
            Open Documentation →
          </Link>
        </div>
      </section>
    </main>
  );
}
