import { NavLink } from "react-router-dom";
import "../style/Sidebar/Sidebar.css";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="1" y="1" width="6" height="6" rx="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    to: "/buses",
    label: "Buses",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="1" y="4" width="14" height="8" rx="2" />
        <path d="M4 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
        <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="11.5" cy="12" r="1" fill="currentColor" stroke="none" />
        <path d="M1 8h14M8 4v8" strokeWidth="1" opacity="0.35" />
      </svg>
    ),
  },
  {
    to: "/estaciones",
    label: "Estaciones",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" />
        <circle cx="8" cy="5" r="1.5" />
      </svg>
    ),
  },
  {
    to: "/reportes",
    label: "Reportes",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M2 13l4-4 3 3 5-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="6" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: "/mapa",
    label: "Mapa",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <polygon
          points="1,3 6,1 10,3 15,1 15,13 10,15 6,13 1,15"
          strokeLinejoin="round"
        />
        <line x1="6" y1="1" x2="6" y2="13" />
        <line x1="10" y1="3" x2="10" y2="15" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sb-logo">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="2" y="8" width="26" height="14" rx="3.5" fill="#328CC1" />
          <path
            d="M8 8V7a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 22 7v1"
            fill="#328CC1"
          />
          <circle cx="8" cy="22" r="2.5" fill="#0B3C5D" />
          <circle cx="22" cy="22" r="2.5" fill="#0B3C5D" />
          <path d="M2 14h26" stroke="white" strokeWidth="1" opacity="0.2" />
          <path d="M15 8v14" stroke="white" strokeWidth="1" opacity="0.2" />
        </svg>
        <div>
          <div className="sb-logo-text">MetroMonitor</div>
          <div className="sb-logo-sub">Sistema de flota</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        <span className="sb-section-label">Principal</span>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `sb-item${isActive ? " active" : ""}`}
          >
            <span className="sb-item-icon">{item.icon}</span>
            <span className="sb-item-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sb-footer">
        <span className="sb-footer-dot" />
        v1.0 · Metropolitano
      </div>
    </aside>
  );
}
