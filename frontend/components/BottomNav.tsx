"use client";

import { useState, useEffect } from "react";

const navItems = [
  {
    id: "home",
    label: "Home",
    href: "#",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L10 3l7 6.5V18a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M7 19v-7h6v7" />
      </svg>
    ),
  },
  {
    id: "features",
    label: "Features",
    href: "#features",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "workflow",
    label: "Workflow",
    href: "#workflow",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="5" r="2" />
        <circle cx="15" cy="10" r="2" />
        <circle cx="5" cy="15" r="2" />
        <path d="M7 5h4a2 2 0 012 2v1M7 15h4a2 2 0 002-2v-1" />
      </svg>
    ),
  },
  {
    id: "impact",
    label: "Impact",
    href: "#impact",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l4-5 3 3 4-6 3 4" />
        <path d="M17 6l-3 1 1-3" />
      </svg>
    ),
  },
  {
    id: "explore",
    label: "Explore",
    href: "#",
    cta: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 7v3l2 2" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const [activeNav, setActiveNav] = useState("home");

  // Track active section on scroll
  useEffect(() => {
    const sections = ["impact", "workflow", "features"];
    const handler = () => {
      const scrollY = window.scrollY + 120;
      let current = "home";
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && scrollY >= el.offsetTop) { current = id; break; }
      }
      setActiveNav(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className="sha-bottom-nav" aria-label="Mobile navigation">
      <div className="sha-bottom-nav-inner">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`sha-bottom-nav-item${item.cta ? " cta" : ""}${activeNav === item.id && !item.cta ? " active" : ""}`}
            style={{ position: "relative" }}
            onClick={() => !item.cta && setActiveNav(item.id)}
          >
            <span className="sha-bottom-nav-icon">{item.icon}</span>
            <span className="sha-bottom-nav-label">{item.label}</span>
            {!item.cta && <span className="sha-bottom-nav-dot" />}
          </a>
        ))}
      </div>
    </nav>
  );
}
