"use client";

import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ── TOP NAV ───────────────────────────────────────── */}
      <nav className="sha-nav">
        <a href="#" className="sha-nav-logo">
          <div className="sha-nav-logomark">SH</div>
          <div>
            <div className="sha-nav-brand">Smart Hire AI</div>
            <div className="sha-nav-tagline">Intelligent Recruitment</div>
          </div>
        </a>
        <ul className="sha-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#workflow">Workflow</a></li>
          <li><a href="#impact">Impact</a></li>
        </ul>
        <div className="sha-nav-actions">
          <button className="sha-btn-ghost">Learn More</button>
          <button className="sha-btn-primary">Explore Platform</button>
        </div>
        {/* Hamburger for tablet/mobile */}
        <button
          className={`sha-hamburger ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu drawer */}
      <div className={`sha-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <ul>
          {[["#", "Home"], ["#features", "Features"], ["#workflow", "Workflow"], ["#impact", "Impact"]].map(([href, label]) => (
            <li key={label}>
              <a href={href} onClick={() => setMobileMenuOpen(false)}>{label}</a>
            </li>
          ))}
        </ul>
        <div className="sha-mobile-menu-ctas">
          <button className="sha-btn-ghost sha-btn-full" onClick={() => setMobileMenuOpen(false)}>Learn More</button>
          <button className="sha-btn-primary sha-btn-full" onClick={() => setMobileMenuOpen(false)}>Explore Platform</button>
        </div>
      </div>
    </>
  );
}
