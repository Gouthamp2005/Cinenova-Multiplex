import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="mb-4">
              <img src="/images/logos/Copilot_20260709_163634.png" alt="CineNova Multiplex" className="h-16 w-auto" />
            </div>
            <p className="text-neutral-400 text-sm">Your premium destination for movie entertainment. Book tickets, grab snacks, and enjoy the show.</p>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-neutral-400 hover:text-rose-400 text-sm transition-colors">Home</Link>
              <Link to="/movies" className="block text-neutral-400 hover:text-rose-400 text-sm transition-colors">Movies</Link>
              <Link to="/bookings" className="block text-neutral-400 hover:text-rose-400 text-sm transition-colors">My Bookings</Link>
              <Link to="/admin" className="block text-neutral-400 hover:text-rose-400 text-sm transition-colors">Admin</Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-neutral-400">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-400" /> 123 Cinema Road, Mumbai</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-rose-400" /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-rose-400" /> support@cinenova.com</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm mb-4">Follow Us</h3>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rose-500/20 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-neutral-500 text-sm">© 2024 CineNova Multiplex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
