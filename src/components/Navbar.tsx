import { NavLink, useLocation } from "react-router-dom";
import { TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/prices", label: "Prices" },
  { to: "/regions", label: "Regions" },
  { to: "/calculator", label: "Calculator" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar-glass sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gold">
            <TrendingUp className="h-4 w-4 text-gold-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-foreground">CaféInvest</span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Rwanda</span>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm rounded transition-colors ${
                  isActive
                    ? "text-gold font-semibold bg-gold/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Status pill */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-rwandaGreen animate-pulse" />
          <span className="text-muted-foreground font-data">LIVE DATA</span>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded transition-colors ${
                  isActive
                    ? "text-gold font-semibold bg-gold/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
