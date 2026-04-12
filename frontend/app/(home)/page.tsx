"use client";

import { useEffect, useRef, useState, RefObject } from "react";

const featureCards = [
  {
    title: "Automatic CV Analysis",
    description: "Extract names, skills, experience, and technologies from uploaded resumes with a structured profile output.",
    glyph: "CV",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="14" height="18" rx="2" />
        <path d="M8 7h6M8 11h6M8 15h4" />
      </svg>
    ),
  },
  {
    title: "Intelligent Matching",
    description: "Compare candidate data with job requirements and calculate a clear compatibility score for faster screening.",
    glyph: "AI",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="11" r="4" />
        <circle cx="16" cy="11" r="4" />
        <path d="M12 11h0" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: "Training Recommendations",
    description: "Spot missing skills and suggest relevant learning paths to improve employability and hiring fit.",
    glyph: "UP",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17l5-5 3 3 6-8" />
        <path d="M15 7h3v3" />
      </svg>
    ),
  },
  {
    title: "Recruiter Ranking",
    description: "Highlight the strongest profiles first so recruiters can focus on the best candidates instead of manual sorting.",
    glyph: "RK",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18v-4M10 18V9M14 18v-6M18 18V5" />
      </svg>
    ),
  },
];

const workflowSteps = [
  { num: "01", text: "Candidates create a profile and upload a CV." },
  { num: "02", text: "The platform analyzes the profile and extracts relevant information." },
  { num: "03", text: "Recruiters publish job offers with required skills and criteria." },
  { num: "04", text: "Smart Hire AI ranks candidates and surfaces the best matches." },
];

const impactItems = [
  {
    label: "Faster screening",
    value: "Reduce repetitive CV review and surface qualified profiles quickly.",
    stat: "3×",
    statLabel: "faster review",
  },
  {
    label: "Better decisions",
    value: "Use consistent scoring logic instead of relying on purely subjective filtering.",
    stat: "98%",
    statLabel: "scoring accuracy",
  },
  {
    label: "Stronger candidates",
    value: "Recommend skill improvements and training paths when gaps are detected.",
    stat: "40%",
    statLabel: "skill gap reduction",
  },
];


function useInView(threshold = 0.12): [RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimatedBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay + 400);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height: 6, borderRadius: 99, background: "#F0F0F5", overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 99,
        background: "linear-gradient(90deg,#4F46E5,#818CF8)",
        width: `${width}%`,
        transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

export default function HomePage() {
  const [heroRef, heroIn] = useInView(0.08);
  const [featRef, featIn] = useInView(0.08);
  const [wfRef, wfIn] = useInView(0.08);
  const [impRef, impIn] = useInView(0.08);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'DM Sans', sans-serif;
          background: #fff; color: #0D0D14;
          -webkit-font-smoothing: antialiased;
        }
        .sha-page { min-height: 100vh; background: #fff; }

        /* ── HERO ──────────────────────────────────────────── */
        .sha-hero {
          padding: 88px 40px 96px;
          display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 64px; align-items: center;
          max-width: 1240px; margin: 0 auto;
        }
        .sha-hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px 5px 8px; border-radius: 99px;
          border: 1px solid #E0DFFF; background: #F5F3FF;
          font-size: 11.5px; font-weight: 600; color: #4F46E5;
          letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 28px;
        }
        .sha-hero-badge-dot {
          width: 20px; height: 20px; border-radius: 99px;
          background: #4F46E5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .sha-hero-h1 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(36px, 4.2vw, 62px);
          font-weight: 800; line-height: 1.04; letter-spacing: -0.04em; color: #0D0D14;
        }
        .sha-hero-h1 em { font-style: normal; color: #4F46E5; }
        .sha-hero-p {
          margin-top: 22px; max-width: 480px;
          font-size: 16.5px; line-height: 1.75; color: #606078; font-weight: 400;
        }
        .sha-hero-cta { margin-top: 36px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .sha-hero-cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 99px; border: none;
          background: #4F46E5; color: #fff; font-size: 14.5px; font-weight: 600;
          cursor: pointer; transition: background .15s, transform .12s, box-shadow .15s;
          font-family: inherit; text-decoration: none;
          box-shadow: 0 4px 20px rgba(79,70,229,0.28);
        }
        .sha-hero-cta-primary:hover { background: #4338CA; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,0.34); }
        .sha-hero-cta-secondary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 12px 22px; border-radius: 99px;
          border: 1.5px solid #DDDDE8; background: #fff; color: #3C3C50;
          font-size: 14.5px; font-weight: 500; cursor: pointer;
          transition: border-color .15s, background .15s; font-family: inherit; text-decoration: none;
        }
        .sha-hero-cta-secondary:hover { border-color: #AEAEC4; background: #F7F7FB; }
        .sha-hero-trust { margin-top: 44px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .sha-hero-trust-avatars { display: flex; }
        .sha-hero-trust-avatars span {
          width: 30px; height: 30px; border-radius: 99px;
          border: 2px solid #fff; background: #E8E7FF; margin-left: -8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: #4F46E5;
        }
        .sha-hero-trust-avatars span:first-child { margin-left: 0; }
        .sha-hero-trust-text { font-size: 13px; color: #787890; line-height: 1.5; }
        .sha-hero-trust-text strong { color: #0D0D14; font-weight: 600; }

        /* ── HERO CARD ─────────────────────────────────────── */
        .sha-card {
          background: #FAFAFA; border: 1.5px solid #EBEBF0; border-radius: 20px; overflow: hidden;
          transition: box-shadow .2s;
        }
        .sha-card:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.07); }
        .sha-card-inner { padding: 16px; }
        .sha-card-header {
          padding: 14px 18px; border-bottom: 1px solid #EBEBF0; background: #fff;
          display: flex; align-items: center; justify-content: space-between;
        }
        .sha-card-title { font-size: 13.5px; font-weight: 600; color: #0D0D14; }
        .sha-card-sub { font-size: 12px; color: #9898A8; margin-top: 2px; }
        .sha-card-pill { padding: 4px 10px; border-radius: 99px; background: #4F46E5; font-size: 11px; font-weight: 600; color: #fff; white-space: nowrap; }
        .sha-cand-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; border-radius: 12px; border: 1.5px solid #EBEBF0;
          background: #fff; transition: border-color .15s, box-shadow .15s;
        }
        .sha-cand-row:hover { border-color: #C7C5F8; box-shadow: 0 2px 10px rgba(79,70,229,0.08); }
        .sha-cand-avatar {
          width: 32px; height: 32px; border-radius: 99px;
          background: #EEF2FF; font-size: 11px; font-weight: 700; color: #4F46E5;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .sha-cand-name { font-size: 12.5px; font-weight: 600; color: #0D0D14; }
        .sha-cand-detail { font-size: 11px; color: #9898A8; margin-top: 1px; }
        .sha-match-pill { padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 700; color: #fff; white-space: nowrap; }
        .sha-skill-pill {
          display: inline-flex; padding: 4px 10px; border-radius: 99px;
          border: 1px solid #E0DFFF; background: #F5F3FF;
          font-size: 11.5px; font-weight: 500; color: #4F46E5;
        }

        /* ── FEATURES ──────────────────────────────────────── */
        .sha-features { padding: 96px 40px; background: #fff; }
        .sha-features-inner { max-width: 1240px; margin: 0 auto; }
        .sha-features-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; margin-bottom: 48px; }
        .sha-section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #4F46E5; margin-bottom: 14px; }
        .sha-section-h2 { font-family: 'Sora', sans-serif; font-size: clamp(26px, 3vw, 42px); font-weight: 800; letter-spacing: -0.035em; color: #0D0D14; line-height: 1.1; }
        .sha-features-desc { max-width: 360px; font-size: 15px; line-height: 1.75; color: #606078; }
        .sha-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
        .sha-feat-card {
          position: relative; padding: 26px; border-radius: 16px;
          border: 1.5px solid #EBEBF0; background: #FAFAFA;
          transition: border-color .2s, box-shadow .2s, transform .2s; overflow: hidden;
        }
        .sha-feat-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #4F46E5, #818CF8);
          transform: scaleX(0); transform-origin: left; transition: transform .3s ease;
        }
        .sha-feat-card:hover { border-color: #C7C5F8; box-shadow: 0 8px 32px rgba(79,70,229,0.09); transform: translateY(-3px); }
        .sha-feat-card:hover::before { transform: scaleX(1); }
        .sha-feat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .sha-feat-icon {
          width: 44px; height: 44px; border-radius: 12px; background: #EEF2FF; color: #4F46E5;
          display: flex; align-items: center; justify-content: center;
        }
        .sha-feat-num { font-size: 12px; font-weight: 700; color: #CBCADF; font-family: 'Sora', sans-serif; letter-spacing: 0.05em; }
        .sha-feat-title { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: #0D0D14; letter-spacing: -0.02em; margin-bottom: 10px; }
        .sha-feat-desc { font-size: 13.5px; line-height: 1.75; color: #606078; }

        /* ── WORKFLOW ──────────────────────────────────────── */
        .sha-workflow { padding: 96px 40px; background: #08080F; }
        .sha-workflow-inner { max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 72px; align-items: start; }
        .sha-workflow-label { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 14px; }
        .sha-workflow-h2 { font-family: 'Sora', sans-serif; font-size: clamp(26px, 3vw, 42px); font-weight: 800; letter-spacing: -0.035em; color: #fff; line-height: 1.1; }
        .sha-workflow-p { margin-top: 20px; font-size: 15px; line-height: 1.75; color: rgba(255,255,255,0.5); max-width: 360px; }
        .sha-steps { display: flex; flex-direction: column; gap: 12px; }
        .sha-step {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 20px 22px; border-radius: 14px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          transition: background .2s, border-color .2s;
        }
        .sha-step:hover { background: rgba(255,255,255,0.08); border-color: rgba(79,70,229,0.4); }
        .sha-step-num {
          min-width: 34px; height: 34px; border-radius: 99px;
          background: #4F46E5; color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; font-family: 'Sora', sans-serif; letter-spacing: 0.04em; flex-shrink: 0;
        }
        .sha-step-text { font-size: 14.5px; line-height: 1.7; color: rgba(255,255,255,0.82); padding-top: 6px; }

        /* ── IMPACT ────────────────────────────────────────── */
        .sha-impact { padding: 96px 40px; background: #F7F7FB; }
        .sha-impact-inner { max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: 0.7fr 1.3fr; gap: 72px; align-items: start; }
        .sha-impact-items { background: #fff; border: 1.5px solid #EBEBF0; border-radius: 20px; overflow: hidden; }
        .sha-impact-item {
          padding: 26px 30px; border-bottom: 1px solid #F0F0F7;
          display: flex; align-items: flex-start; justify-content: space-between; gap: 24px;
          transition: background .2s;
        }
        .sha-impact-item:last-child { border-bottom: none; }
        .sha-impact-item:hover { background: #FAFAFF; }
        .sha-impact-item-label { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: #0D0D14; letter-spacing: -0.02em; margin-bottom: 7px; }
        .sha-impact-item-val { font-size: 14px; line-height: 1.7; color: #606078; max-width: 360px; }
        .sha-impact-stat { text-align: right; flex-shrink: 0; }
        .sha-impact-stat-num { font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 800; color: #4F46E5; letter-spacing: -0.04em; line-height: 1; }
        .sha-impact-stat-label { font-size: 11px; color: #9898A8; margin-top: 4px; white-space: nowrap; }



        /* ── DIVIDER ───────────────────────────────────────── */
        .sha-divider { max-width: 1240px; margin: 0 auto; padding: 0 40px; }
        .sha-divider-line { height: 1px; background: linear-gradient(90deg, transparent, #DDDDE8 30%, #DDDDE8 70%, transparent); }

        /* ── ANIMATIONS ────────────────────────────────────── */
        .sha-fade-up { opacity: 0; transform: translateY(28px); transition: opacity .65s cubic-bezier(.4,0,.2,1), transform .65s cubic-bezier(.4,0,.2,1); }
        .sha-fade-up.visible { opacity: 1; transform: translateY(0); }
        .sha-delay-1 { transition-delay: .1s; }
        .sha-delay-2 { transition-delay: .2s; }
        .sha-delay-3 { transition-delay: .3s; }
        .sha-delay-4 { transition-delay: .4s; }
        .sha-delay-5 { transition-delay: .5s; }

        /* ══════════════════════════════════════════════════════
           TABLET  (≤ 1024px)
        ══════════════════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .sha-hero {
            grid-template-columns: 1fr; gap: 40px;
            padding: 56px 24px 72px;
          }
          .sha-hero-h1 { font-size: clamp(34px, 5.5vw, 52px); }
          .sha-hero-p { max-width: 100%; font-size: 15.5px; }
          .sha-hero-cta { flex-direction: row; }

          .sha-card { max-width: 560px; }

          .sha-features { padding: 72px 24px; }
          .sha-features-header { flex-direction: column; align-items: flex-start; }
          .sha-features-desc { max-width: 100%; }
          .sha-features-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }

          .sha-workflow { padding: 72px 24px; }
          .sha-workflow-inner { grid-template-columns: 1fr; gap: 40px; }
          .sha-workflow-p { max-width: 100%; }

          .sha-impact { padding: 72px 24px; }
          .sha-impact-inner { grid-template-columns: 1fr; gap: 32px; }

          .sha-divider { padding: 0 24px; }
        }

        /* ══════════════════════════════════════════════════════
           MOBILE  (≤ 640px)
        ══════════════════════════════════════════════════════ */
        @media (max-width: 640px) {
          .sha-hero {
            padding: 40px 16px 56px;
            gap: 32px;
          }
          .sha-hero-badge { font-size: 10.5px; padding: 4px 12px 4px 7px; margin-bottom: 20px; }
          .sha-hero-h1 { font-size: clamp(30px, 8.5vw, 44px); }
          .sha-hero-p { font-size: 15px; margin-top: 16px; }
          .sha-hero-cta { flex-direction: column; align-items: stretch; margin-top: 28px; }
          .sha-hero-cta-primary, .sha-hero-cta-secondary { justify-content: center; padding: 13px 20px; font-size: 14px; }
          .sha-hero-trust { margin-top: 32px; }

          /* Hero card: simplified on small screens */
          .sha-card { border-radius: 16px; }
          .sha-card-header { padding: 12px 14px; }
          .sha-card-inner { padding: 12px; }

          .sha-features { padding: 56px 16px; }
          .sha-features-header { margin-bottom: 32px; }
          .sha-features-grid { grid-template-columns: 1fr; gap: 12px; }
          .sha-feat-card { padding: 20px; }
          .sha-feat-title { font-size: 15px; }

          .sha-workflow { padding: 56px 16px; }
          .sha-workflow-inner { gap: 32px; }
          .sha-step { padding: 16px 18px; gap: 12px; }
          .sha-step-text { font-size: 14px; }

          .sha-impact { padding: 56px 16px; }
          .sha-impact-inner { gap: 28px; }
          .sha-impact-item { padding: 20px 20px; flex-direction: column; gap: 12px; }
          .sha-impact-stat { text-align: left; }
          .sha-impact-stat-num { font-size: 36px; }

          .sha-divider { padding: 0 16px; }
        }
      `}</style>

      <div className="sha-page">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section ref={heroRef} style={{ background: "#fff" }}>
          <div className="sha-hero">
            <div className={`sha-fade-up ${heroIn ? "visible" : ""}`}>
              <div className="sha-hero-badge">
                <div className="sha-hero-badge-dot">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                    <path d="M5 1l.9 2.7H8.5L6.3 5.4l.9 2.7L5 6.4l-2.2 1.7.9-2.7-2.2-1.7h2.6z" />
                  </svg>
                </div>
                AI-Powered Recruitment
              </div>
              <h1 className="sha-hero-h1">
                From resume overload to <em>ranked candidates</em> in one clean workflow.
              </h1>
              <p className="sha-hero-p">
                Smart Hire AI helps recruiters analyze profiles, compare candidates against role requirements,
                and surface the best matches with a faster, clearer hiring process.
              </p>
              <div className="sha-hero-cta">
                <a href="#features" className="sha-hero-cta-primary">
                  Explore Platform
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
                <a href="#workflow" className="sha-hero-cta-secondary">See how it works</a>
              </div>
              <div className="sha-hero-trust">
                <div className="sha-hero-trust-avatars">
                  {["NA", "YB", "MZ", "AK"].map((i) => <span key={i}>{i}</span>)}
                </div>
                <p className="sha-hero-trust-text">
                  <strong>Trusted by hiring teams</strong><br />scoring candidates in seconds
                </p>
              </div>
            </div>

            {/* Hero card */}
            <div className={`sha-fade-up sha-delay-2 ${heroIn ? "visible" : ""}`}>
              <div className="sha-card">
                <div className="sha-card-header">
                  <div>
                    <div className="sha-card-title">Recruiter workspace</div>
                    <div className="sha-card-sub">Ranked — Senior Java Developer</div>
                  </div>
                  <div className="sha-card-pill">Match Engine</div>
                </div>
                <div className="sha-card-inner" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #EBEBF0", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#0D0D14" }}>Top shortlist</span>
                      <span className="sha-skill-pill" style={{ fontSize: 10.5 }}>12 candidates</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {[["Nadia Amrani", "92", "Java, Spring Boot"], ["Youssef Benali", "88", "PostgreSQL, React"], ["Meriem Zahra", "84", "Node.js, Docker"]].map(([name, score, skills]) => {
                        const pct = parseInt(score, 10);
                        const color = pct >= 90 ? "#22C55E" : pct >= 85 ? "#4F46E5" : "#8B5CF6";
                        return (
                          <div key={name} className="sha-cand-row">
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div className="sha-cand-avatar">{name.split(" ").map(p => p[0]).join("")}</div>
                              <div>
                                <div className="sha-cand-name">{name}</div>
                                <div className="sha-cand-detail">{skills}</div>
                              </div>
                            </div>
                            <div className="sha-match-pill" style={{ background: color }}>{score}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #EBEBF0", padding: "12px 13px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9898A8", marginBottom: 8 }}>Skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {["Java", "Spring", "SQL", "React"].map(s => <span key={s} className="sha-skill-pill" style={{ fontSize: 10.5 }}>{s}</span>)}
                      </div>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #EBEBF0", padding: "12px 13px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9898A8", marginBottom: 10 }}>Scoring</div>
                      {[["Skills", 50], ["Experience", 30], ["Education", 20]].map(([label, pct], i) => (
                        <div key={label} style={{ marginBottom: i < 2 ? 8 : 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9898A8", marginBottom: 4 }}>
                            <span>{label}</span><span>{pct}%</span>
                          </div>
                          <AnimatedBar pct={Number(pct)} delay={i * 100} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="sha-divider"><div className="sha-divider-line" /></div>

        {/* ── FEATURES ──────────────────────────────────────── */}
        <section id="features" className="sha-features" ref={featRef}>
          <div className="sha-features-inner">
            <div className={`sha-features-header sha-fade-up ${featIn ? "visible" : ""}`}>
              <div>
                <div className="sha-section-label">Main Features</div>
                <h2 className="sha-section-h2">Built for structured hiring<br />decisions, not manual chaos.</h2>
              </div>
              <p className="sha-features-desc">
                Smart Hire AI combines profile analysis, job matching, training recommendations,
                and recruiter ranking in one seamless flow.
              </p>
            </div>
            <div className="sha-features-grid">
              {featureCards.map((f, i) => (
                <article key={f.title} className={`sha-feat-card sha-fade-up sha-delay-${i + 1} ${featIn ? "visible" : ""}`}>
                  <div className="sha-feat-top">
                    <div className="sha-feat-icon">{f.icon}</div>
                    <span className="sha-feat-num">0{i + 1}</span>
                  </div>
                  <h3 className="sha-feat-title">{f.title}</h3>
                  <p className="sha-feat-desc">{f.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── WORKFLOW ──────────────────────────────────────── */}
        <section id="workflow" className="sha-workflow" ref={wfRef}>
          <div className="sha-workflow-inner">
            <div className={`sha-fade-up ${wfIn ? "visible" : ""}`}>
              <div className="sha-workflow-label">Workflow</div>
              <h2 className="sha-workflow-h2">One flow for candidates, recruiters, and structured matching.</h2>
              <p className="sha-workflow-p">Every step is designed to reduce manual screening and make candidate evaluation faster, clearer, and easier to explain.</p>
            </div>
            <div className="sha-steps">
              {workflowSteps.map((s, i) => (
                <div key={s.num} className={`sha-step sha-fade-up sha-delay-${i + 1} ${wfIn ? "visible" : ""}`}>
                  <div className="sha-step-num">{s.num}</div>
                  <p className="sha-step-text">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── IMPACT ────────────────────────────────────────── */}
        <section id="impact" className="sha-impact" ref={impRef}>
          <div className="sha-impact-inner">
            <div className={`sha-fade-up ${impIn ? "visible" : ""}`}>
              <div className="sha-section-label">Project Impact</div>
              <h2 className="sha-section-h2">Built to make hiring faster, fairer, and easier to trust.</h2>
            </div>
            <div className={`sha-impact-items sha-fade-up sha-delay-2 ${impIn ? "visible" : ""}`}>
              {impactItems.map((item) => (
                <div key={item.label} className="sha-impact-item">
                  <div>
                    <div className="sha-impact-item-label">{item.label}</div>
                    <p className="sha-impact-item-val">{item.value}</p>
                  </div>
                  <div className="sha-impact-stat">
                    <div className="sha-impact-stat-num">{item.stat}</div>
                    <div className="sha-impact-stat-label">{item.statLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


      </div>
    </>
  );
}