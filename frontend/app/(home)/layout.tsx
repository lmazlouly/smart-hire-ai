"use client";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          /* Bottom safe area for mobile */
          padding-bottom: env(safe-area-inset-bottom);
        }
        .sha-page { min-height: 100vh; background: #fff; }

        /* ── NAV (desktop) ─────────────────────────────────── */
        .sha-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 64px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #EBEBF0;
        }
        .sha-nav-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .sha-nav-logomark {
          width: 32px; height: 32px; border-radius: 9px;
          background: #4F46E5; display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif; font-weight: 800; font-size: 13px; color: #fff; letter-spacing: -0.04em;
        }
        .sha-nav-brand { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15px; color: #0D0D14; }
        .sha-nav-tagline { font-size: 11px; color: #9898A8; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 1px; }
        .sha-nav-links { display: flex; gap: 28px; list-style: none; }
        .sha-nav-links a { font-size: 14px; font-weight: 500; color: #5C5C72; text-decoration: none; transition: color .15s; }
        .sha-nav-links a:hover { color: #0D0D14; }
        .sha-nav-actions { display: flex; gap: 10px; align-items: center; }
        .sha-hamburger {
          display: none; flex-direction: column; gap: 5px; cursor: pointer;
          padding: 8px; border-radius: 8px; border: 1px solid #EBEBF0;
          background: transparent; transition: background .15s;
        }
        .sha-hamburger:hover { background: #F7F7FB; }
        .sha-hamburger span {
          display: block; width: 18px; height: 2px;
          background: #3C3C50; border-radius: 2px;
          transition: transform .25s, opacity .25s;
        }
        .sha-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .sha-hamburger.open span:nth-child(2) { opacity: 0; }
        .sha-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile menu drawer */
        .sha-mobile-menu {
          display: none; position: fixed; top: 64px; left: 0; right: 0; z-index: 99;
          background: #fff; border-bottom: 1px solid #EBEBF0;
          padding: 16px 20px 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          transform: translateY(-8px); opacity: 0;
          transition: transform .22s ease, opacity .22s ease;
          pointer-events: none;
        }
        .sha-mobile-menu.open { transform: translateY(0); opacity: 1; pointer-events: all; }
        .sha-mobile-menu ul { list-style: none; display: flex; flex-direction: column; gap: 2px; }
        .sha-mobile-menu a {
          display: block; padding: 12px 14px; border-radius: 10px;
          font-size: 15px; font-weight: 500; color: #3C3C50; text-decoration: none;
          transition: background .15s, color .15s;
        }
        .sha-mobile-menu a:hover { background: #F5F3FF; color: #4F46E5; }
        .sha-mobile-menu-ctas { display: flex; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #F0F0F7; }

        /* ── BUTTONS ───────────────────────────────────────── */
        .sha-btn-ghost {
          padding: 7px 16px; border-radius: 99px; border: 1px solid #DDDDE8;
          background: transparent; font-size: 13.5px; font-weight: 500; color: #3C3C50;
          cursor: pointer; transition: border-color .15s, background .15s; font-family: inherit;
        }
        .sha-btn-ghost:hover { border-color: #AEAEC4; background: #F7F7FB; }
        .sha-btn-primary {
          padding: 7px 18px; border-radius: 99px; border: none;
          background: #4F46E5; font-size: 13.5px; font-weight: 600; color: #fff;
          cursor: pointer; transition: background .15s, transform .1s; font-family: inherit;
        }
        .sha-btn-primary:hover { background: #4338CA; transform: translateY(-1px); }
        .sha-btn-full { width: 100%; text-align: center; }

        /* ── BOTTOM NAV BAR (mobile/tablet) ────────────────── */
        .sha-bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid #EBEBF0;
          padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
          box-shadow: 0 -8px 32px rgba(0,0,0,0.06);
        }
        .sha-bottom-nav-inner { display: flex; align-items: center; justify-content: space-around; gap: 4px; }
        .sha-bottom-nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          flex: 1; padding: 6px 4px; border-radius: 12px;
          text-decoration: none; color: #9898A8;
          transition: background .15s, color .15s;
          cursor: pointer; border: none; background: transparent; font-family: inherit;
          -webkit-tap-highlight-color: transparent;
        }
        .sha-bottom-nav-item:hover,
        .sha-bottom-nav-item.active { color: #4F46E5; }
        .sha-bottom-nav-item.active { background: #F0EEFF; }
        .sha-bottom-nav-item.cta {
          background: #4F46E5; color: #fff; border-radius: 14px;
          min-width: 56px; box-shadow: 0 4px 16px rgba(79,70,229,0.3);
        }
        .sha-bottom-nav-item.cta:hover { background: #4338CA; }
        .sha-bottom-nav-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.01em; white-space: nowrap; }
        .sha-bottom-nav-icon { line-height: 0; }
        /* Active dot indicator */
        .sha-bottom-nav-dot {
          width: 4px; height: 4px; border-radius: 99px; background: #4F46E5;
          position: absolute; bottom: 4px;
          opacity: 0; transition: opacity .2s;
        }
        .sha-bottom-nav-item.active .sha-bottom-nav-dot { opacity: 1; }

        /* ── FOOTER ────────────────────────────────────────── */
        .sha-footer {
          padding: 24px 40px; border-top: 1px solid #EBEBF0; background: #fff;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
        }
        .sha-footer span { font-size: 13px; color: #9898A8; }

        /* ══════════════════════════════════════════════════════
           TABLET  (≤ 1024px)
        ══════════════════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .sha-nav { padding: 0 24px; }
          .sha-nav-links { display: none; }
          .sha-nav-actions { display: none; }
          .sha-hamburger { display: flex; }
          .sha-mobile-menu { display: block; }

          /* Show bottom nav on tablet */
          .sha-bottom-nav { display: block; }
          /* Add padding so content isn't hidden behind bottom bar */
          .sha-page { padding-bottom: 80px; }
        }

        /* ══════════════════════════════════════════════════════
           MOBILE  (≤ 640px)
        ══════════════════════════════════════════════════════ */
        @media (max-width: 640px) {
          .sha-nav { padding: 0 16px; height: 58px; }

          /* Bottom nav tighter on mobile */
          .sha-bottom-nav { padding: 6px 6px calc(6px + env(safe-area-inset-bottom)); }
          .sha-bottom-nav-item { padding: 5px 2px; border-radius: 10px; }
          .sha-bottom-nav-label { font-size: 9.5px; }
          .sha-page { padding-bottom: 72px; }
        }
      `}</style>

      <div className="sha-page">
        <Header />
        
        {children}

        <footer className="sha-footer">
          <span>Smart Hire AI bridges candidates and recruiters with AI-driven matching.</span>
          <span>Built with Next.js, Spring Boot, PostgreSQL, and AI services.</span>
        </footer>

        <BottomNav />
      </div>
    </>
  );
}
