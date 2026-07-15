import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Film, LayoutDashboard, LogOut, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navLinks: { to: string; label: string; icon: any }[] = [
    { to: "/", label: "Home", icon: Film },
  ];

  if (session) {
    navLinks.push({ to: "/movies", label: "Movies", icon: Film });
    navLinks.push({ to: "/bookings", label: "My Bookings", icon: Clock });
  }

  if (profile?.is_admin) {
    navLinks.push({ to: "/admin", label: "Admin", icon: LayoutDashboard });
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center group">
            <img
              src="/images/logos/Copilot_20260709_163634.png"
              alt="CineNova Multiplex"
              className="h-12 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {session ? (
              <div className="flex items-center gap-3 ml-2">
                <span className="text-sm text-neutral-400">
                  {profile?.full_name?.split(" ")[0] || "User"}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="px-4 py-2 rounded-lg text-neutral-300 hover:text-white text-sm font-medium">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            {session ? (
              <button
                onClick={() => { handleSignOut(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500/10 text-rose-400 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="flex gap-2 px-4">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm">Sign In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
